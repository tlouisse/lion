import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

/**
 * Copies every file the generated import map points at into the host's static build output.
 *
 * Why this exists: the import map resolves to monorepo relative paths
 * (`packages/ui/exports/button.js`, `node_modules/lit/index.js`) that a dev server can serve because
 * its document root is the repository. A static deploy (gh-pages) serves only the build output, so
 * every one of those urls 404s and no demo can run. This step mirrors them into
 * `<destination>/node_modules/...`, which is the url scheme the portal already serves them under
 * (`packages/ui` is served as `node_modules/@lion/ui`, the same translation as its `mapAssetPath`).
 *
 * Whole package folders are copied instead of only the import map entries, because files imported
 * *inside* a package (say `../components/button/src/LionButton.js`) are not in the map and have to
 * resolve relative to the entry point. Test folders, sourcemaps and nested `node_modules` are
 * skipped.
 *
 * `@webcomponents/scoped-custom-element-registry` is not in the import map at all: the sandbox
 * document that `setupIde()` generates imports it by absolute url.
 */
const EXTRA_TARGETS = ['node_modules/@webcomponents/scoped-custom-element-registry'];
const SKIPPED_FOLDERS = new Set(['node_modules', 'test', 'test-suites', '.git']);

/**
 * @param {string} name
 * @returns {string} the value of `--name`
 */
function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  const value = index === -1 ? undefined : process.argv[index + 1];
  if (!value) {
    throw new Error(`Please provide a --${name} value`);
  }
  return value;
}

/**
 * @param {string} repoRelativePath
 * @returns {string} the url path the host serves it under
 */
function toUrlPath(repoRelativePath) {
  return repoRelativePath.replace(/^packages\//, 'node_modules/@lion/');
}

/**
 * @param {string} urlPath
 * @returns {{sourceDir: string; urlDir: string} | undefined}
 */
function toPackageFolders(urlPath) {
  const parts = urlPath.split('/');
  if (parts[0] === 'packages') {
    return { sourceDir: path.join('packages', parts[1]), urlDir: `node_modules/@lion/${parts[1]}` };
  }
  // A dependency can be nested — `node_modules/parse5/node_modules/entities` — when two versions of a name exist,
  // and the url is by package *name* either way. Reading only the first `node_modules` segment named the wrong
  // package (parse5, not entities) and then skipped the nested folder through this file's own filter, so the mapped
  // url 404'd and the browser reported `Failed to fetch dynamically imported module`. The *last* segment is the one
  // that names the package, and the folder to copy from is the one beside it.
  const lastNodeModules = parts.lastIndexOf('node_modules');
  if (lastNodeModules !== -1 && parts[lastNodeModules + 1]) {
    const scoped = parts[lastNodeModules + 1].startsWith('@');
    const name = scoped
      ? `${parts[lastNodeModules + 1]}/${parts[lastNodeModules + 2]}`
      : parts[lastNodeModules + 1];
    const sourceDir = parts.slice(0, lastNodeModules + (scoped ? 3 : 2)).join('/');
    return { sourceDir, urlDir: `node_modules/${name}` };
  }
  return undefined;
}

/**
 * Skips test folders, sourcemaps and nested `node_modules` inside a package folder.
 *
 * The check has to be relative to the folder being copied: the source folder itself lives under the
 * repository's `node_modules`, so testing the absolute path rejects the root and copies nothing.
 * @param {string} sourceRoot
 * @returns {(source: string) => boolean}
 */
function makeFilter(sourceRoot) {
  return source => {
    if (source.endsWith('.map')) return false;
    const relative = path.relative(sourceRoot, source);
    if (!relative) return true;
    return !relative.split(path.sep).some(part => SKIPPED_FOLDERS.has(part));
  };
}

/**
 * @param {string} importMapDir folder holding the generated `importMapPerPackage.js`
 * @returns {Promise<{[packageName: string]: {[exposedPath: string]: string}}>}
 */
async function readImportMapPerPackage(importMapDir) {
  const fileContents = await fs.promises.readFile(
    path.join(importMapDir, 'importMapPerPackage.js'),
    'utf8',
  );
  return JSON.parse(fileContents.replace(/^export default\s*/, '').replace(/;\s*$/, ''));
}

/**
 * The TypeScript worker is emitted by the host's bundler as an *asset*: playground-elements creates
 * it with `new URL('playground-typescript-worker.js', import.meta.url)`, so its own static import of
 * `./internal/typescript.js` (the 9MB compiler) is never resolved. Without that sibling the worker
 * 404s and no TypeScript demo can compile. Its location is dictated by that relative import, so it
 * has to sit next to the emitted worker chunk, wherever the host put it.
 *
 * N.B. the compiler is requested on every playground visit, because playground-elements creates the
 * worker eagerly. That matches what the playground did before (the same file, served from the
 * repository), so shipping it keeps the feature; leaving it out is what would be a regression.
 *
 * @param {string} destination
 * @returns {Promise<{workers: number; bytes: number}>}
 */
async function vendorTypescriptCompiler(destination) {
  const require = createRequire(import.meta.url);
  const playgroundElementsDir = path.dirname(require.resolve('playground-elements'));
  const compiler = path.join(playgroundElementsDir, 'internal', 'typescript.js');

  /** @type {string[]} */
  const workers = [];
  const walk = async dir => {
    for (const entry of await fs.promises.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (/^playground-typescript-worker.*\.js$/.test(entry.name)) {
        workers.push(full);
      }
    }
  };
  await walk(destination);

  for (const worker of workers) {
    const siblingDir = path.join(path.dirname(worker), 'internal');
    await fs.promises.mkdir(siblingDir, { recursive: true });
    await fs.promises.copyFile(compiler, path.join(siblingDir, 'typescript.js'));
  }
  return { workers: workers.length, bytes: (await fs.promises.stat(compiler)).size };
}

/**
 * @param {string} dir
 * @returns {Promise<{files: number; bytes: number}>}
 */
async function measure(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of await fs.promises.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await measure(full);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      files += 1;
      bytes += (await fs.promises.stat(full)).size;
    }
  }
  return { files, bytes };
}

/**
 * The package folder for a repo path the primary rule does not cover.
 *
 * The first parent holding a package.json is the package root, and its own `name` is what the vendored
 * url layout is keyed by — which is why this reads the filesystem instead of guessing from the path.
 * @param {string} repoRelativePath
 * @returns {{urlDir: string, sourceDir: string} | undefined}
 */
function resolveFromFilesystem(repoRelativePath) {
  const segments = repoRelativePath.split('/');
  for (let index = 1; index < segments.length; index += 1) {
    const candidate = segments.slice(0, index + 1).join('/');
    if (candidate === 'packages') continue; // the primary rule owns that layout
    const pkgJsonPath = path.join(candidate, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;
    const name = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).name;
    return name ? { urlDir: `node_modules/${name}`, sourceDir: candidate } : undefined;
  }
  return undefined;
}

async function vendorImportMapTargets() {
  const importMapDir = getArg('import-map');
  const destination = getArg('destination');
  const importMapPerPackage = await readImportMapPerPackage(importMapDir);

  /** @type {Map<string, string>} url folder -> source folder */
  const folders = new Map();
  let entryCount = 0;
  for (const entries of Object.values(importMapPerPackage)) {
    for (const repoRelativePath of Object.values(entries)) {
      entryCount += 1;
      let resolved = toPackageFolders(toUrlPath(repoRelativePath));
      if (!resolved) {
        // N.B. the rule above is written for the `packages/<x>` layout. A package that lives elsewhere —
        // `packages-node/<x>`, which is what the node demo runner vendors — has no such mapping, so its
        // folder is derived from the filesystem instead: the first parent holding a package.json is the
        // package root, and its own `name` is what the url layout is keyed by.
        resolved = resolveFromFilesystem(toUrlPath(repoRelativePath));
      }
      if (!resolved) {
        throw new Error(`Cannot derive a package folder from import map value ${repoRelativePath}`);
      }
      if (!folders.has(resolved.urlDir)) folders.set(resolved.urlDir, resolved.sourceDir);
    }
  }
  for (const urlDir of EXTRA_TARGETS) folders.set(urlDir, urlDir);

  for (const [urlDir, sourceDir] of folders) {
    const from = path.resolve(sourceDir);
    if (!fs.existsSync(from)) {
      throw new Error(`Import map target folder does not exist: ${from}`);
    }
    const to = path.join(destination, urlDir);
    // Start clean: cp rejects a destination that already exists, and a stale folder from an earlier
    // run must never be merged with the current one.
    await fs.promises.rm(to, { recursive: true, force: true });
    await fs.promises.cp(from, to, { recursive: true, filter: makeFilter(from) });
  }

  const compiler = await vendorTypescriptCompiler(destination);
  const { files, bytes } = await measure(path.join(destination, 'node_modules'));
  // eslint-disable-next-line no-console
  console.log(
    `Vendored ${entryCount} import map entries from ${folders.size} package folders into ` +
      `${destination} (${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB); TypeScript compiler ` +
      `next to ${compiler.workers} worker chunk(s) (${(compiler.bytes / 1024 / 1024).toFixed(1)} MB)`,
  );
}

vendorImportMapTargets();
