import { globby } from 'globby';
import path from 'path';
import fs from 'fs';

// TODO: get these utils from providence (instead of copying) or a shared package between the two

/**
 * @typedef {{
 *  name: string;
 *  dependencies?: {[dep:string]: string; };
 *  devDependencies?: {[dep:string]: string; };
 *  exports?: {[key:string]: string | object | null; };
 * }} PackageJson
 *
 * @typedef {{
 *  [packageName: string]: {
 *    [entryPoint:string]: string;
 *  }
 * }} ImportMap
 */

/**
 * @param {string} rootPath
 * @returns {Promise<PackageJson|undefined>}
 */
export async function getPackageJson(rootPath) {
  try {
    const fileContent = await fs.promises.readFile(`${rootPath}/package.json`, 'utf8');
    return JSON.parse(fileContent);
  } catch (_) {
    try {
      // For testing purposes, we allow to have a package.mock.json that contains 'fictional'
      // packages (like 'exporting-ref-project') not on npm registry
      const fileContent = await fs.promises.readFile(`${rootPath}/package.mock.json`, 'utf8');
      return JSON.parse(fileContent);
    } catch {
      return undefined;
    }
  }
}

/**
 * @param {string} localPath
 * @returns {string}
 */
export function normalizeLocalPathWithDotSlash(localPath) {
  return localPath.startsWith('./') ? localPath : `./${localPath}`;
}

/**
 * @param {string} localPathWithDotSlash
 * @returns {string}
 */
function stripDotSlashFromLocalPath(localPathWithDotSlash) {
  return localPathWithDotSlash.replace(/^\.\//, '');
}

/**
 * @param {{valObjOrStr:object|string|null;nodeResolveMode:string}} opts
 * @returns {string|null}
 */
function getStringOrObjectValOfExportMapEntry({ valObjOrStr, nodeResolveMode }) {
  if (typeof valObjOrStr === 'string') {
    return valObjOrStr;
  }
  if (!valObjOrStr || typeof valObjOrStr !== 'object') {
    return null;
  }
  // Conditions nest, and Node's own resolution descends through them. A package that declares
  // `{ "./decode": { "import": { "types": …, "default": … } } }` — parse5's own entities@6.0.1 — had every
  // entrypoint dropped, because the value under the condition was an object and not a string: the map carried the
  // name with zero entrypoints and the browser failed with `Failed to resolve module specifier "entities/decode"`.
  // Walk the requested condition first, then `import`, `default` and `require` as a last resort, and recurse into
  // whatever each of them holds.
  for (const condition of [nodeResolveMode, 'import', 'default', 'require']) {
    if (!condition) continue; // eslint-disable-line no-continue
    const value = valObjOrStr[condition];
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const nested = getStringOrObjectValOfExportMapEntry({ valObjOrStr: value, nodeResolveMode });
      if (nested) return nested;
    }
  }
  // This is still allowed: `types`-only entries exist to give TypeScript an entrypoint on the root, nobody else.
  return null;
}

/**
 * Deducts all exposed entrypoints in export map and resolves their relative internal paths.
 *
 * @param {{[key:string]: string | object | null}} exportMap
 * @param {object} opts
 * @param {'default' | 'development' | string} [opts.nodeResolveMode='default']
 * @param {string} opts.packageRootPath
 * @returns {Promise<{internal: string; exposed: string}[]>}
 */
export async function resolveExportMap(
  exportMap,
  { nodeResolveMode = 'default', packageRootPath },
) {
  const exportMapPaths = [];

  for (const [key, valObjOrStr] of Object.entries(exportMap)) {
    let resolvedKey = key;
    let resolvedVal = getStringOrObjectValOfExportMapEntry({ valObjOrStr, nodeResolveMode });
    if (resolvedVal === null) continue; // eslint-disable-line no-continue

    // Allow older specs like "./__element-definitions/" : "./__element-definitions/" to also work,
    // so we normalize them to the new spec
    if (resolvedVal.endsWith?.('/') && resolvedKey.endsWith('/')) {
      resolvedVal += '*';
      resolvedKey += '*';
    }

    if (!resolvedKey.includes('*')) {
      exportMapPaths.push({
        internal: resolvedVal,
        exposed: resolvedKey,
      });
      continue; // eslint-disable-line no-continue
    }

    // https://nodejs.org/api/packages.html#subpath-exportMap
    const valueToUseForGlob = stripDotSlashFromLocalPath(resolvedVal).replace('*', '**/*');

    // Generate all possible entries via glob, first strip './'
    const internalExportMapPathsForKeyRaw = await globby(valueToUseForGlob, {
      cwd: packageRootPath,
      onlyFiles: true,
    });

    const exposedExportMapPathsForKeyRaw = internalExportMapPathsForKeyRaw.map(pathInside => {
      // Say we have "exports": { "./*.js": "./src/*.js" }
      // => internalExportMapPathsForKey: ['./src/a.js', './src/b.js']
      // => exposedExportMapPathsForKey: ['./a.js', './b.js']
      const [, variablePart] =
        pathInside.match(new RegExp(valueToUseForGlob.replace('*', '(.*)').replace(/\\/g, '/'))) ||
        [];
      return resolvedKey.replace('*', variablePart);
    });
    const internalExportMapPathsForKey = internalExportMapPathsForKeyRaw.map(
      normalizeLocalPathWithDotSlash,
    );
    const exposedExportMapPathsForKey = exposedExportMapPathsForKeyRaw.map(
      normalizeLocalPathWithDotSlash,
    );

    exportMapPaths.push(
      ...internalExportMapPathsForKey.map((internal, idx) => ({
        internal,
        exposed: exposedExportMapPathsForKey[idx],
      })),
    );
  }

  // An export-map value is supposed to be package relative. A wildcard entry can expand into an
  // absolute path — seen in `unist-util-visit`, whose map yields exposed "1" -> "/" — and one such
  // entry used to fail the whole map, because `path.resolve(root, '/')` collapses to the filesystem
  // root and the caller then rejects it. Those entries are dropped and reported instead: they point
  // outside the package, so there is nothing to map for them, while the rest of the map is fine.
  const insidePackage = entry => {
    const relative = path.relative(packageRootPath, path.resolve(packageRootPath, entry.internal));
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
  };
  const usableExportMapPaths = exportMapPaths.filter(insidePackage);
  for (const entry of exportMapPaths.filter(candidate => !insidePackage(candidate))) {
    // eslint-disable-next-line no-console
    console.warn(
      `Skipping export map entry ${JSON.stringify(entry.exposed)} -> ` +
        `${JSON.stringify(entry.internal)}: it resolves outside ${packageRootPath}`,
    );
  }

  return usableExportMapPaths;
}

/**
 * Memoised per starting path, not in a single module-level slot.
 *
 * A single slot made the second call in a process reuse the first call's root, which is wrong as soon
 * as one process generates maps for more than one package — the runner does exactly that — and it
 * surfaced as `Package root path / is outside of the current working directory` from
 * `getRelativePathFromCwd`.
 * @type {Map<string, string>}
 */
const _monoRootPathsByStart = new Map();

/**
 * @param {string} pkgRootPath
 * @returns {string}
 */
function findMonoRootPath(pkgRootPath) {
  const cached = _monoRootPathsByStart.get(pkgRootPath);
  if (typeof cached === 'string') return cached;

  let currentPath = pkgRootPath;
  // Are we in a monorepo? If so, find the closest parent with package.json / node_modules
  while (currentPath !== '/') {
    currentPath = path.resolve(currentPath, '..');
    const potentialPackagePath = path.join(currentPath, 'package.json');
    if (fs.existsSync(potentialPackagePath)) {
      _monoRootPathsByStart.set(pkgRootPath, currentPath);
      return currentPath;
    }
  }
  _monoRootPathsByStart.set(pkgRootPath, '');
  return '';
}

/**
 * Give a package name like '@my/package', find the package root path in the filesystem.
 * This is usually inside node_modules of the current package, or in node_modules of a possible monorepo root
 * @param {string} dep
 * @param {string} pkgRootPath
 */
function resolvePackageRootFromPackageName(dep, pkgRootPath) {
  const depPathInNodeModules = path.join(pkgRootPath, 'node_modules', dep);
  if (fs.existsSync(depPathInNodeModules)) {
    return path.join(pkgRootPath, 'node_modules', dep);
  }
  const monoRootPath = findMonoRootPath(pkgRootPath);
  if (monoRootPath) {
    const depPathInMonoRootNodeModules = path.join(monoRootPath, 'node_modules', dep);
    if (fs.existsSync(depPathInMonoRootNodeModules)) {
      return depPathInMonoRootNodeModules;
    }
  }
  return undefined;
}

/**
 * @param {string} pkgRootPath
 * @param {{cwd?: string}} opts
 * @returns {string}
 */
function getRelativePathFromCwd(pkgRootPath, { cwd = process.cwd() } = {}) {
  const relativePath = path.relative(cwd, pkgRootPath);
  if (relativePath.startsWith('..')) {
    throw new Error(`Package root path ${pkgRootPath} is outside of the current working directory`);
  }
  return relativePath;
}

/**
 * Compare two versions the way a package manager ranks them: numerically by segment, missing segments lowest.
 * @param {string} [a]
 * @param {string} [b]
 * @returns {number}
 */
function compareVersions(a = '', b = '') {
  const left = a.split('.').map(part => Number.parseInt(part, 10) || 0);
  const right = b.split('.').map(part => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const diff = (left[index] ?? 0) - (right[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * @param {string[]} pkgRootPaths all
 * @param {{
 *  packagesToTraceDepsFor?: string[];
 *  cwd?: string;
 * }} opts
 * @returns {Promise<ImportMap>} the import map
 */
export async function createImportMap(
  pkgRootPaths,
  { packagesToTraceDepsFor = [], cwd = process.cwd() } = {},
) {
  if (!Array.isArray(pkgRootPaths) || pkgRootPaths.length === 0) {
    throw new Error('No package root path(s) provided');
  }

  /** @type {ImportMap} */
  const importMap = {};
  /**
   * Which copy of a name the entries above came from. A package can be reached more than once — a nested copy and
   * a hoisted one — while a bare specifier can only point at one of them. Letting the last walk assign the name
   * made the map depend on walk order: measured, the hoisted `entities@4.5.0` replaced parse5's own
   * `entities@6.0.1`, which is the only copy exporting `./decode`, and every server-rendered demo failed with
   * `Failed to resolve module specifier "entities/decode"`. The rule is the one a package manager takes: the
   * higher version wins, then the richer entry map, then the first seen.
   * @type {Record<string, {version?: string, entries: {[exposed: string]: string}}>}
   */
  const chosen = {};

  /**
   * @param {PackageJson} pkgJson
   * @param {{[exposed: string]: string}} entries
   */
  const choose = (pkgJson, entries) => {
    const name = pkgJson.name;
    const current = chosen[name];
    if (!current) {
      chosen[name] = { version: pkgJson.version, entries };
      importMap[name] = entries;
      return;
    }
    const versionDiff = compareVersions(pkgJson.version, current.version);
    const richer = Object.keys(entries).length > Object.keys(current.entries).length;
    if (versionDiff > 0 || (versionDiff === 0 && richer)) {
      chosen[name] = { version: pkgJson.version, entries };
      importMap[name] = entries;
    }
  };

  /** @param {string[]} rootPaths */
  const walk = async rootPaths => {
    for (const pkgRootPath of rootPaths) {
      // get pkg json
      const pkgJson = await getPackageJson(pkgRootPath);
      if (!pkgJson) {
        throw new Error(`No package.json found in ${pkgRootPath}`);
      }

      /** @type {{[exposed: string]: string}} */
      const entries = {};

      // 1. Add our own resolved export map
      if (pkgJson.exports) {
        const exportMap = pkgJson.exports || {};
        const exportMapPaths = await resolveExportMap(exportMap, {
          nodeResolveMode: 'default',
          packageRootPath: pkgRootPath,
        });
        for (const { internal, exposed } of exportMapPaths) {
          const resolvedInternalPath = path.resolve(pkgRootPath, internal);
          try {
            entries[exposed] = getRelativePathFromCwd(resolvedInternalPath, { cwd });
          } catch (error) {
            // Without the specifier and the raw export-map value this is unfindable: the error used to
            // only carry the resolved path, which says nothing about which dependency caused it.
            throw new Error(
              `Cannot map ${pkgJson.name} export ${JSON.stringify(exposed)} -> ${JSON.stringify(internal)} ` +
                `(resolved to ${resolvedInternalPath}, package root ${pkgRootPath}): ${error.message}`,
            );
          }
        }
      } else {
        // If no exports, we assume the package is a module and add all files in the root
        const files = await globby('**/*.js', { cwd: pkgRootPath, onlyFiles: true });
        for (const file of files) {
          entries[normalizeLocalPathWithDotSlash(file)] = getRelativePathFromCwd(
            path.resolve(pkgRootPath, file),
            { cwd },
          );
        }
      }
      choose(pkgJson, entries);

      // 2. Do the same for all dependencies
      if (!packagesToTraceDepsFor.includes(pkgJson.name)) continue; // eslint-disable-line no-continue

      const deps = Object.keys(pkgJson.dependencies || {});
      const depRootPaths = /** @type {string[]} */ (
        deps.map(dep => resolvePackageRootFromPackageName(dep, pkgRootPath)).filter(Boolean)
      );
      // An empty list is normal — a leaf package has no dependencies, and a package whose dependencies are all
      // devDependencies resolves to none — and it must not fail the walk the way the old recursive call did:
      // passing it on hit the guard above and reported "No package root path(s) provided" for a target that had
      // been given perfectly well.
      if (depRootPaths.length > 0) await walk(depRootPaths);
    }
  };

  await walk(pkgRootPaths);
  return importMap;
}
