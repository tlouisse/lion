#!/usr/bin/env node
/**
 * Generates the import map a package needs to run in the browser.
 *
 * This is the runner's own CLI rather than `lion-playground`'s `generateAssets.js`, because that one
 * requires a `custom-elements.json` in the target: it is written for web-component packages, and a
 * plain Node package has no custom elements manifest. The mapping work itself is the same function,
 * `createImportMap`, which has no such requirement.
 *
 * Output uses the shape the playground already consumes, so the existing tooling applies unchanged:
 * `vendorImportMapTargets` copies its targets into a static build, and `flattenImportMapPerPackage`
 * turns it into browser specifiers.
 *
 * Usage:
 *   node src/cli/generateImportMap.js --package <dir> [--package <dir> ...] --destination <dir>
 *                                     [--deps <name>[,<name> ...]]
 *
 * Without `--deps`, the dependencies of each target package are traced, which is what makes this work
 * for a package the runner has never seen.
 */
import fs from 'node:fs';
import path from 'node:path';

// N.B. a relative hop into the sibling package, because the workspace link for `@lion/playground` is
// set up by an install this worktree has not run; it becomes `@lion/playground/src/node/...` once the
// dependency is declared and linked.
import { createImportMap } from '../../../lion-playground/src/node/createImportMap.js';

/**
 * @param {string} name
 * @returns {string[]}
 */
function getAll(name) {
  const values = [];
  process.argv.forEach((argument, index) => {
    if (argument === `--${name}` && process.argv[index + 1]) values.push(process.argv[index + 1]);
  });
  return values;
}

/**
 * @param {string} name
 * @returns {string | undefined}
 */
function getOne(name) {
  return getAll(name)[0];
}

async function main() {
  const packages = getAll('package');
  const destination = getOne('destination');
  if (packages.length === 0) throw new Error('Please provide at least one --package folder');
  if (!destination) throw new Error('Please provide a --destination folder');

  /** @type {Record<string, {[exposed: string]: string}>} */
  const importMapPerPackage = {};

  for (const pkgRootPath of packages) {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgRootPath, 'package.json'), 'utf8'));
    const explicitDeps = getOne('deps');
    const packagesToTraceDepsFor = explicitDeps
      ? explicitDeps.split(/[,\s]+/).filter(Boolean)
      : [pkgJson.name];

    const map = await createImportMap([pkgRootPath], {
      packagesToTraceDepsFor,
      cwd: process.cwd(),
    });
    const names = Object.keys(map);
    let entries = 0;
    for (const name of names) entries += Object.keys(map[name]).length;
    // eslint-disable-next-line no-console
    console.log(`${pkgJson.name}: ${names.length} packages, ${entries} entries`);
    for (const name of names) {
      importMapPerPackage[name] = { ...importMapPerPackage[name], ...map[name] };
    }
  }

  await fs.promises.mkdir(destination, { recursive: true });
  const file = path.join(destination, 'importMapPerPackage.js');
  await fs.promises.writeFile(
    file,
    `export default ${JSON.stringify(importMapPerPackage, null, 2)};\n`,
  );

  const total = Object.values(importMapPerPackage).reduce(
    (sum, entries) => sum + Object.keys(entries).length,
    0,
  );
  // eslint-disable-next-line no-console
  console.log(
    `wrote ${file}: ${Object.keys(importMapPerPackage).length} packages, ${total} entries`,
  );
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exit(1);
});
