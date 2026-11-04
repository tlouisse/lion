#!/usr/bin/env node
/**
 * Verifies that a document is served by the playground's service worker, and runs a small screen reader
 * check inside it.
 *
 * Why this exists: the playground's preview is a same-origin document served by a service worker, which is a
 * different posture from the fenced share flow (opaque origin, for code from someone else). Our own
 * components and a screen reader need the same-origin path — the virtual screen reader walks a real DOM and
 * a component has to be registered in the same realm — so this checks that path end to end instead of
 * assuming it: the demo file is put into the IDE's project, the worker serves it at
 * `scope + <sessionId>/<file>`, and the transcript the reader produces is asserted.
 *
 * What it deliberately does not use: the flow's patch on @guidepup/virtual-screen-reader. The check mounts a
 * control that carries its own name (a button), so no idref resolution happens — that is the path the five
 * idref-dependent field components need the patch for.
 *
 * Preconditions:
 *   npm i --no-save --no-package-lock @guidepup/virtual-screen-reader   (not a dependency of the repo)
 *   npm --prefix portal run build                                       (produces _site)
 *
 * Usage:
 *   node packages-node/lion-playground/scripts/verify-sw-served-sr.js [--port 8234] [--keep]
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// N.B. a relative hop into the sibling package, the single source of truth for the vendored url rule.
import { toVendoredUrl } from '../../node-demo-runner/src/browser/host.js';
import { encodeSharedDemo } from '../src/browser/shareDemo.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const siteDir = path.join(repoRoot, '_site');
const readerPackage = 'node_modules/@guidepup/virtual-screen-reader';
const readerFile = 'lib/esm/index.browser.js';

const portArg = process.argv.indexOf('--port');
const port = portArg === -1 ? 8234 : Number(process.argv[portArg + 1]);
const screenshotArg = process.argv.indexOf('--screenshot');
const screenshotPath = screenshotArg === -1 ? null : process.argv[screenshotArg + 1];

function fail(message) {
  // eslint-disable-next-line no-console
  console.error(`✖ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(siteDir)) fail(`No build at ${siteDir}. Run: npm --prefix portal run build`);
if (!fs.existsSync(path.join(repoRoot, readerPackage))) {
  fail(
    `Missing ${readerPackage}. Install it first:\n` +
      '  npm i --no-save --no-package-lock @guidepup/virtual-screen-reader',
  );
}

// The served document imports the reader from this origin, so it has to be reachable from the site too.
const readerOut = path.join(siteDir, readerPackage);
if (!fs.existsSync(readerOut)) {
  fs.mkdirSync(path.dirname(readerOut), { recursive: true });
  fs.cpSync(path.join(repoRoot, readerPackage), readerOut, { recursive: true });
}

const { chromium } = await import('playwright');
const base = `http://127.0.0.1:${port}`;
const readerUrl = `${base}/${readerPackage}/${readerFile}`;

/** The import map the served document needs: the playground's own, flattened to the vendored urls. */
function buildImportMap() {
  const raw = fs.readFileSync(
    path.join(repoRoot, 'portal/public/lion-playground/importMapPerPackage.js'),
    'utf8',
  );
  const perPackage = JSON.parse(raw.replace(/^export default\s*/, '').replace(/;\s*$/, ''));
  const imports = {};
  for (const [packageName, entries] of Object.entries(perPackage)) {
    for (const [exposed, repoRelativePath] of Object.entries(entries)) {
      const subpath = exposed === '.' ? '' : exposed.startsWith('./') ? exposed.slice(2) : exposed;
      const specifier = subpath ? `${packageName}/${subpath}` : packageName;
      imports[specifier] = toVendoredUrl(repoRelativePath, packageName, base);
    }
  }
  imports['@guidepup/virtual-screen-reader'] = readerUrl;
  imports['@guidepup/virtual-screen-reader/browser.js'] = readerUrl;
  return { imports };
}

/** The demo under test: one small check, in a document the worker serves. */
function buildIndexHtml(importMap) {
  const map = JSON.stringify(importMap).replace(/</g, '\\u003c');
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>virtual screen reader check</title>
<script type="importmap">${map}<\/script>
</head><body>
<div id="fixture"></div><pre id="out">running…</pre>
<script type="module">
import '@lion/ui/define/lion-button.js';
import { virtual } from '@guidepup/virtual-screen-reader';

const out = document.querySelector('#out');
try {
  const fixture = document.querySelector('#fixture');
  fixture.innerHTML = '<lion-button>Save</lion-button>';
  await customElements.whenDefined('lion-button');
  await document.querySelector('lion-button').updateComplete;

  // The phrase log accumulates, so it is read once after the walk instead of summed per step.
  virtual.start({ container: fixture });
  await virtual.next();
  const phrases = await virtual.spokenPhraseLog();
  window.__sr = {
    phrases,
    asserts: {
      spokeSomething: phrases.length > 0,
      containsButtonSave: phrases.some(phrase => phrase.includes('button') && phrase.includes('Save')),
    },
  };
  out.textContent = 'phrases: ' + JSON.stringify(phrases);
} catch (error) {
  const message = String(error && error.message ? error.message : error);
  window.__sr = { threw: message };
  out.textContent = 'threw: ' + message;
}
<\/script>
</body></html>`;
}

const mimeTypes = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, base).pathname);
  let filePath = path.join(siteDir, urlPath);
  // A directory means its index.html, the way any static host serves it.
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!filePath.startsWith(siteDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': mimeTypes[path.extname(filePath)] ?? 'application/octet-stream',
    'access-control-allow-origin': '*',
  });
  response.end(fs.readFileSync(filePath));
});
await new Promise(resolve => server.listen(port, '0.0.0.0', resolve));

const payload = await encodeSharedDemo({
  entry: 'main.js',
  htmlFile: 'index.html',
  files: {
    'index.html': { content: buildIndexHtml(buildImportMap()), contentType: 'text/html' },
    'main.js': { content: '// the served document is self contained; this file exists so the demo has an entry\n' },
  },
});

let browser;
try {
  browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(`${base}/simulator/#?share=${payload}`);
  await page.waitForFunction(
    async () => (await navigator.serviceWorker.getRegistrations()).length > 0,
    null,
    { timeout: 45000 },
  );
  // The share flow renders in its fence first and hands the files to the IDE only on this click: it is the
  // consent gate, because the IDE then runs the demo same-origin.
  await page
    .getByRole('button', { name: /Open this demo in the playground/i })
    .click({ timeout: 45000 })
    .catch(async () => {
      const seen = await page.evaluate(() => ({
        buttons: Array.from(document.querySelectorAll('button')).map(button => button.textContent.trim()),
        body: document.body.innerText.slice(0, 300),
        hashHead: location.hash.slice(0, 60),
        hashLength: location.hash.length,
      }));
      fail(
        `The “open in the playground” button never appeared.\n` +
          `payload length: ${payload.length}\n` +
          `page errors: ${JSON.stringify(pageErrors)}\n` +
          `page: ${JSON.stringify(seen)}`,
      );
    });

  // The session id lives in the proxy iframe, inside the IDE's shadow root.
  const located = await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const collectFrames = (root, found = []) => {
      for (const element of root.querySelectorAll('*')) {
        if (element.tagName === 'IFRAME') found.push(element.src);
        if (element.shadowRoot) collectFrames(element.shadowRoot, found);
      }
      return found;
    };
    const sessionFrom = url => {
      try {
        return new URLSearchParams(new URL(url).hash.slice(1)).get('playground-session-id');
      } catch {
        return null;
      }
    };
    return {
      scope: registrations[0]?.scope ?? null,
      sessionId: collectFrames(document).map(sessionFrom).filter(Boolean)[0] ?? null,
    };
  });
  if (!located.scope || !located.sessionId) fail(`Could not locate the worker scope or session: ${JSON.stringify(located)}`);

  const servedUrl = `${located.scope}${located.sessionId}/index.html`;
  // N.B. a navigation from a page of the same context: /simulator/ is outside the worker's scope, so a
  // fetch from it would go to the network, and a fresh context would have none of the registrations.
  const servedPage = await context.newPage();
  const servedErrors = [];
  servedPage.on('pageerror', error => servedErrors.push(error.message));
  const response = await servedPage.goto(servedUrl);
  const servedBy = {
    status: response?.status() ?? null,
    originAgentCluster: response?.headers()['origin-agent-cluster'] ?? null,
    controlled: await servedPage.evaluate(() => Boolean(navigator.serviceWorker.controller)),
  };
  await servedPage
    .waitForFunction(() => Boolean(window.__sr), null, { timeout: 25000 })
    .catch(() => {});
  const result = await servedPage.evaluate(() => ({
    sr: window.__sr ?? null,
    isTheDemoFile: document.documentElement.innerHTML.includes('virtual screen reader check'),
  }));
  // With --screenshot the check also leaves a picture of the served document, which is what a demo of this
  // capability needs and what a reviewer asks for.
  if (screenshotPath) {
    await servedPage.setViewportSize({ width: 900, height: 320 });
    await servedPage.screenshot({ path: screenshotPath, fullPage: true });
  }
  await servedPage.close();

  // The worker sets Origin-Agent-Cluster itself; without it this was the static server answering, not the worker.
  const servedByWorker = servedBy.originAgentCluster === '?1' && servedBy.controlled && result.isTheDemoFile;
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      { servedUrl, servedBy, result, servedByWorker, pageErrors, servedPageErrors: servedErrors },
      null,
      1,
    ),
  );

  const asserts = result.sr?.asserts;
  if (!servedByWorker) fail('The document was not served by the service worker');
  if (!asserts?.spokeSomething || !asserts?.containsButtonSave) {
    fail(`The virtual screen reader did not announce the button: ${JSON.stringify(result.sr)}`);
  }
  // eslint-disable-next-line no-console
  console.log(`\n✔ served by the service worker, transcript holds: ${JSON.stringify(result.sr.phrases)}`);
} finally {
  await browser?.close();
  if (!process.argv.includes('--keep')) server.close();
}
