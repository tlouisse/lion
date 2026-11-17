/**
 * The real thing: run a demo with actual Node, on this machine, in a temporary directory.
 *
 * This is the other half of the runner. The browser engine runs a demo's entry against the shim layer and reports
 * what happened; this runs the *same* entry against real `fs`, real `process`, real `worker_threads` and reports it
 * in the same shape — `{ exitCode, log: [{ stream, text }], files }` — so the two can be compared line for line and
 * a difference is a fact about the shims rather than a matter of opinion.
 *
 * It is deliberately not a sandbox. It runs the demo as the current user with the current environment, which is what
 * "a real setup" means; containment is the browser path's job, and the two must not be confused.
 *
 * Path convention, measured rather than assumed: under real Node the demo runs with its directory as `cwd`, so a
 * relative path resolves against the demo directory and `/x` is the *machine's* root. In the browser the shim's `/`
 * **is** the demo root. A demo that writes `/out.txt` therefore means two different files in the two worlds, so
 * demos use relative paths — that is the one convention the two must agree on. Making `/x` mean the demo root under
 * real Node too needs a container or a chroot, which is the same boundary the registry describes for the builtins it
 * cannot answer.
 */
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * @param {string} directory
 * @param {string} root
 * @returns {Promise<Record<string, string>>} files keyed the way the browser engine keys them, with a leading `/`
 */
async function readTree(directory, root = directory) {
  /** @type {Record<string, string>} */
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      Object.assign(files, await readTree(absolute, root));
    } else {
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      files[`/${relative}`] = await readFile(absolute, 'utf8');
    }
  }
  return files;
}

/**
 * @param {Record<string, string | { content: string }>} files
 * @param {string} directory
 */
async function writeTree(files, directory) {
  const names = Object.keys(files).map(name => name.replace(/^\//, ''));
  // The browser engine imports a demo's entry as a module, so the real run should be a module too. Without this,
  // node re-parses every `.js` file as ESM and says so on stderr, which would land in the report as if the demo had
  // complained. A demo that ships its own package.json keeps it.
  if (!names.includes('package.json')) {
    await writeFile(path.join(directory, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);
  }
  for (const [name, value] of Object.entries(files)) {
    const content = typeof value === 'string' ? value : value.content;
    const absolute = path.join(directory, name.replace(/^\//, ''));
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
  }
}

/**
 * Run a demo's entry with real Node.
 *
 * @param {object} options
 * @param {Record<string, string | { content: string }>} options.files the demo's files, `/`-prefixed or relative
 * @param {string} options.entry the entry file, e.g. `/demo.js`
 * @param {number} [options.timeoutMs] kill the run after this long
 * @param {Record<string, string>} [options.env] extra environment for the run
 * @param {string} [options.nodeBinary] the node to use; defaults to the one running this
 * @param {boolean} [options.keepDirectory] leave the temporary directory behind and report its path
 * @returns {Promise<{exitCode: number, log: {stream: string, text: string}[], files: Record<string, string>, directory: string, signal: string | null, stderr: string}>}
 */
export async function runDemoWithNode({
  files,
  entry,
  timeoutMs = 30000,
  env = {},
  nodeBinary = process.execPath,
  keepDirectory = false,
}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'node-demo-'));
  await writeTree(files, directory);

  const entryPath = path.join(directory, entry.replace(/^\//, ''));
  const child = spawn(nodeBinary, [entryPath], {
    cwd: directory,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  /** @type {{stream: string, text: string}[]} */
  const log = [];
  let stderr = '';
  child.stdout.on('data', chunk => log.push({ stream: 'stdout', text: String(chunk) }));
  child.stderr.on('data', chunk => {
    const text = String(chunk);
    stderr += text;
    log.push({ stream: 'stderr', text });
  });

  let signal = null;
  const timer = setTimeout(() => {
    signal = 'SIGKILL';
    child.kill('SIGKILL');
  }, timeoutMs);

  const exitCode = await new Promise(resolve => {
    child.on('close', code => resolve(code ?? 1));
    child.on('error', error => {
      stderr += `${error.message}\n`;
      resolve(1);
    });
  });
  clearTimeout(timer);

  const written = await readTree(directory);
  if (!keepDirectory) await rm(directory, { recursive: true, force: true });

  return { exitCode, log, files: written, directory, signal, stderr };
}

export default { runDemoWithNode };
