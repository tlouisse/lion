#!/usr/bin/env node
/**
 * Copies the runner's browser files next to the import map a page will use.
 *
 * They have to be served as real files, not bundled: the fence document imports the engine by url and
 * the engine's own `./shims/*.js` imports must resolve to exactly the urls the import map uses for the
 * builtins. A shim reached by two urls is two module instances with two filesystems, which shows up as
 * `ENOENT` on a file that is demonstrably there.
 *
 * Usage: node src/cli/copyBrowserAssets.js --destination <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'browser');

/** @param {string} name */
function getOne(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const destination = getOne('destination');
if (!destination) {
  // eslint-disable-next-line no-console
  console.error('Please provide a --destination folder');
  process.exit(1);
}

await fs.promises.rm(destination, { recursive: true, force: true });
await fs.promises.mkdir(destination, { recursive: true });
await fs.promises.cp(source, destination, { recursive: true });

const count = listFiles(destination).length;
// eslint-disable-next-line no-console
console.log(`Copied ${count} browser files to ${destination}`);

/** @param {string} dir @returns {string[]} */
function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}
