/**
 * Verifies, from the host page, that a sandbox's protections are actually in effect.
 *
 * Why this exists: every protection here fails silently. A policy can be dropped by a deploy, an
 * import map can go missing, an asset can 404 — and nothing on the page says so. Worse, some of it
 * cannot be checked from outside at all: dev tooling evaluates through CDP, which bypasses CSP the
 * way DevTools does, so an external measurement reports `eval` as allowed even when the policy blocks
 * it. The document has to report on itself.
 *
 * What the result means:
 *  - `same-origin` mode leans on the host environment (nothing may leave the domain) plus the guard
 *    rails; containment is NOT browser-enforced there. The checks below only show that the guard
 *    rails are live.
 *  - `cross-origin` mode is contained by the browser itself, and this report is mostly informational.
 *
 * N.B. the in-document checks come from the sandbox, which shares its realm with the demo. A hostile
 * demo can forge them. This detects drift and accidents, not an adversary.
 */

const REPORT_SOURCE = 'lion-playground-security';

/**
 * @param {ParentNode} root
 * @param {string} selector
 * @returns {Element | null}
 */
function deepQuery(root, selector) {
  const hit = root.querySelector(selector);
  if (hit) return hit;
  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) {
      const found = deepQuery(element.shadowRoot, selector);
      if (found) return found;
    }
  }
  return null;
}

/**
 * @param {() => Element | null} find
 * @param {number} timeoutMs
 * @returns {Promise<Element | null>}
 */
async function waitFor(find, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const found = find();
    if (found || Date.now() > deadline) return found;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
}

/**
 * @param {HTMLElement} ide the `playground-ide` element, when there is one
 * @param {{timeoutMs?: number}} [opts]
 * @returns {Promise<Array<{name: string; ok: boolean; detail: string}>>}
 */
async function collectChecks(ide, { timeoutMs = 5000 } = {}) {
  const checks = [];
  const pageOrigin = window.location.origin;
  const sandboxBaseUrl = ide ? ide.sandboxBaseUrl : undefined;
  const sandboxOrigin = sandboxBaseUrl ? new URL(sandboxBaseUrl, document.baseURI).origin : pageOrigin;
  const mode = sandboxOrigin === pageOrigin ? 'same-origin' : 'cross-origin';
  checks.push({
    name: 'preview mode',
    ok: true,
    detail: `${mode} (page ${pageOrigin}, sandbox ${sandboxOrigin})`,
  });

  // A fenced preview is the one we create ourselves, so its containment can be asserted.
  const fencedFrame = document.querySelector('#shared-demo iframe');
  if (fencedFrame) {
    const attribute = fencedFrame.getAttribute('sandbox') || '';
    checks.push({
      name: 'fenced preview sandbox attribute',
      ok: attribute.includes('allow-scripts') && !attribute.includes('allow-same-origin'),
      detail: attribute || '(none)',
    });
  }

  // The preview element holds two iframes: the service worker proxy, and the document that runs the
  // demo. Only the latter carries the guard, so select it by its url instead of taking the first.
  const previewFrame =
    ide && ide.shadowRoot
      ? await waitFor(() => deepQuery(ide.shadowRoot, 'iframe[src*="__playground_swfs_"]'), timeoutMs)
      : null;
  if (previewFrame) {
    checks.push({
      name: 'preview iframe sandbox attribute',
      ok: true, // informational: in same-origin mode the attribute is absent by design
      detail: String(previewFrame.getAttribute('sandbox')),
    });
  }

  if (previewFrame) {
    // Ask first: the document may already have reported before this listener existed.
    previewFrame.contentWindow.postMessage({ source: 'lion-playground-security-request' }, '*');
    const report = await new Promise(resolve => {
      const onMessage = event => {
        if (event.source !== previewFrame.contentWindow) return;
        const data = event.data;
        if (!data || data.source !== REPORT_SOURCE) return;
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        resolve(data);
      };
      const timer = setTimeout(() => {
        window.removeEventListener('message', onMessage);
        resolve(undefined);
      }, timeoutMs);
      window.addEventListener('message', onMessage);
    });

    if (!report) {
      checks.push({
        name: 'sandbox self-report',
        ok: false,
        detail: `no report within ${timeoutMs}ms — the guard did not run in the preview`,
      });
    } else {
      checks.push({
        name: 'sandbox document origin',
        ok: mode === 'same-origin' ? report.origin === pageOrigin : report.origin === 'null',
        detail: report.origin,
      });
      for (const check of report.checks) {
        checks.push({
          name: `sandbox: ${check.name} blocked`,
          ok: check.enforced,
          detail: check.detail,
        });
      }
    }
  }

  // What the server really sent, which is how a missing edge rule shows up.
  try {
    const response = await fetch(window.location.href, { method: 'GET' });
    const policy = response.headers.get('content-security-policy');
    checks.push({
      name: 'page response policy',
      ok: true, // informational: a static host cannot set headers at all
      detail: policy || '(none — expected on a static host)',
    });
  } catch (error) {
    checks.push({ name: 'page response policy', ok: false, detail: error.message });
  }

  return checks;
}

/**
 * @param {{ide?: HTMLElement; timeoutMs?: number; silent?: boolean}} [opts]
 * @returns {Promise<{ok: boolean; mode: string; checks: Array<{name: string; ok: boolean; detail: string}>}>}
 */
export async function verifySandboxSecurity({ ide, timeoutMs, silent } = {}) {
  const checks = await collectChecks(ide, { timeoutMs });
  const modeCheck = checks.find(check => check.name === 'preview mode');
  const mode = modeCheck && modeCheck.detail.startsWith('cross-origin') ? 'cross-origin' : 'same-origin';
  const ok = checks.every(check => check.ok);
  const report = { ok, mode, checks };
  // Host pages cannot read this any other way, and a wrapper (the docs viewer, a test) may want it.
  window.dispatchEvent(new CustomEvent('lion-playground-security-report', { detail: report }));
  if (!silent) {
    // eslint-disable-next-line no-console
    console.groupCollapsed(
      `[playground security] ${ok ? 'all checks pass' : 'CHECKS FAILED'} — ${mode} mode`,
    );
    // eslint-disable-next-line no-console
    console.table(checks);
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
  return { ok, mode, checks };
}