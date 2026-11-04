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

/**
 * The package root inside a repo-relative path: the shortest prefix ending in the package's directory
 * name, which is the package root in every layout here (`packages/ui/...`, `packages-node/x/...`,
 * `node_modules/prettier/...`).
 * @param {string} repoRelativePath
 * @param {string} packageName
 * @returns {string}
 */
function findPackageRoot(repoRelativePath, packageName) {
  const directoryName = packageName.split('/').pop();
  const segments = repoRelativePath.split('/');
  const index = segments.indexOf(directoryName);
  return index === -1 ? '' : segments.slice(0, index + 1).join('/');
}

/**
 * The entry a bare `import "<name>"` needs, read from the package's own package.json.
 *
 * A package that declares its entry with `main`/`module` instead of `exports["."]` — `unified`,
 * `@babel/parser` — has no entry for its own name in the map, and in a browser there is no Node
 * resolution to fall back on: `import "@babel/parser"` then fails with "Failed to resolve module
 * specifier". Resolving it here, where package.json is readable at build time, is the only place it can
 * be done; the map itself cannot carry it.
 * @param {string} repoRelativePath
 * @param {string} packageName
 * @returns {string | undefined}
 */
function findPackageMain(repoRelativePath, packageName) {
  const root = findPackageRoot(repoRelativePath, packageName);
  if (!root) return undefined;
  const pkgJsonPath = path.join(root, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) return undefined;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const raw = pkgJson.exports?.['.'] ?? pkgJson.module ?? pkgJson.main;
  const entry =
    typeof raw === 'string' ? raw : raw?.import ?? raw?.default ?? raw?.require;
  if (typeof entry !== 'string') return undefined;
  return path.join(root, entry).replace(/^\.\//, '');
}

/**
 * @param {string} root
 * @returns {string[]} every .js file in a package, minus what nobody would import
 */
function listJsFiles(root) {
  const out = [];
  /** @param {string} dir */
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'test' || entry.name === 'tests') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) out.push(full);
    }
  };
  walk(root);
  return out.sort();
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

  // A package's barrel usually pulls in heavy dependencies: our own @lion/nodejs-helpers re-exports its
  // Babel and Prettier helpers from index.js, so a demo that wants one small function ends up loading the
  // whole toolchain. This exposes each source file of the packages named after the flag — or of every target
  // when it is given bare — so a demo can import the module the function actually lives in.
  const exposeArg = process.argv.indexOf('--expose-subpaths');
  const exposeNames =
    exposeArg === -1
      ? null
      : (process.argv[exposeArg + 1] && !process.argv[exposeArg + 1].startsWith('--')
          ? process.argv[exposeArg + 1]
          : ''
        )
          .split(/[,\s]+/)
          .filter(Boolean);
  if (exposeArg !== -1) {
    for (const pkgRootPath of packages) {
      const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgRootPath, 'package.json'), 'utf8'));
      if (exposeNames && exposeNames.length > 0 && !exposeNames.includes(pkgJson.name)) continue;
      const entries = importMapPerPackage[pkgJson.name] || {};
      for (const file of listJsFiles(pkgRootPath)) {
        const repoRelative = `${pkgRootPath}/${path.relative(pkgRootPath, file)}`;
        const exposed = `./${path.relative(pkgRootPath, file)}`;
        if (!entries[exposed]) entries[exposed] = repoRelative;
      }
      importMapPerPackage[pkgJson.name] = entries;
      // eslint-disable-next-line no-console
      console.log(`${pkgJson.name}: exposed ${Object.keys(entries).length} subpaths`);
    }
  }

  const file = path.join(destination, 'importMapPerPackage.js');
  // `--merge` adds to what is already there, so two runs with their own targets and their own dependency
  // tracing (see --deps) end up as one map. Without it the file is written fresh.
  if (process.argv.includes('--merge') && fs.existsSync(file)) {
    const current = JSON.parse(
      fs.readFileSync(file, 'utf8').replace(/^export default\s*/, '').replace(/;\s*$/, ''),
    );
    for (const [packageName, entries] of Object.entries(current)) {
      importMapPerPackage[packageName] = { ...entries, ...importMapPerPackage[packageName] };
    }
  }
  await fs.promises.writeFile(
    file,
    `export default ${JSON.stringify(importMapPerPackage, null, 2)};\n`,
  );

  // A bare specifier for every package, including the ones the map has no `"."` for.
  /** @type {Record<string, string>} */
  const packageMains = {};
  for (const [packageName, entries] of Object.entries(importMapPerPackage)) {
    // A package can end up with no entries at all (its export map resolved to nothing usable), and then there
    // is no path to read a main from — skip it instead of crashing on the undefined value.
    const firstPath = Object.values(entries)[0];
    if (!firstPath) continue;
    const main = findPackageMain(firstPath, packageName);
    if (main) packageMains[packageName] = main;
  }
  const mainsFile = path.join(destination, 'packageMains.js');
  /** @type {Record<string, string>} */
  let allMains = packageMains;
  if (process.argv.includes('--merge') && fs.existsSync(mainsFile)) {
    const current = JSON.parse(
      fs.readFileSync(mainsFile, 'utf8').replace(/^export default\s*/, '').replace(/;\s*$/, ''),
    );
    allMains = { ...current, ...packageMains };
  }
  await fs.promises.writeFile(mainsFile, `export default ${JSON.stringify(allMains, null, 2)};\n`);

  const total = Object.values(importMapPerPackage).reduce(
    (sum, entries) => sum + Object.keys(entries).length,
    0,
  );
  // eslint-disable-next-line no-console
  console.log(
    `wrote ${file}: ${Object.keys(importMapPerPackage).length} packages, ${total} entries\n` +
      `wrote ${mainsFile}: ${Object.keys(packageMains).length} bare specifiers`,
  );
}

main().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exit(1);
});
