import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const VIRTUAL_FS_ROOT = path.resolve(ROOT_DIR, '00_virtual-fs');

/**
 * @param {string} cmd
 * @param {{cwd:string}} [options]
 * @throws {Error}
 */
export function execPromise(cmd, options) {
  return new Promise((resolve, reject) =>
    child_process.exec(cmd, { maxBuffer: 200000000, ...options }, (err, stdout) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(stdout);
    }),
  );
}

/**
 * When "localPublishedDependencies": { "my-pkg": "../my-pkg" }
 *
 * @param {{virtualFsRoot?:string;}} cfg
 */
async function createLocalNpmPublishFromPlaceholder({ virtualFsRoot = VIRTUAL_FS_ROOT } = {}) {
  const originalPkgJsonOfVirtualFsRaw = await fs.promises.readFile(
    `${virtualFsRoot}/package.json`,
    'utf8',
  );
  const pkgJsonOfVirtualFs = JSON.parse(originalPkgJsonOfVirtualFsRaw);
  if (!pkgJsonOfVirtualFs.localPublishedDependencies) {
    return;
  }

  const targetPath = path.resolve(virtualFsRoot, '_tmp/_local-publishes');
  // Create tep folder
  await fs.promises.mkdir(targetPath, { recursive: true });

  for (const [, relativePathToPkgInFs] of Object.entries(
    pkgJsonOfVirtualFs.localPublishedDependencies,
  )) {
    const publishablePkgPath = path.resolve(virtualFsRoot, relativePathToPkgInFs);

    // Create the local tarball
    await execPromise(`npm pack --pack-destination ${targetPath}`, { cwd: publishablePkgPath });

    // Retrtieve the tarball and rename
    const pkgJsonOfPublishablePkg = JSON.parse(
      await fs.promises.readFile(`${publishablePkgPath}/package.json`, 'utf8'),
    );
    const tarFileName = `${pkgJsonOfPublishablePkg.name}-${pkgJsonOfPublishablePkg.version}.tgz`;
    const tarPath = `${targetPath}/${tarFileName}`;
    const finalTarPath = tarPath;

    // Avoid caching problems on npm install
    // const uniqueHash = (Math.random() + 1).toString(36).substring(7);
    // const finalTarPath = tarPath.replace(/\.tgz$/, `--${uniqueHash}.tgz`);
    // await fs.promises.rename(tarPath, finalTarPath);

    // We need to unzip, otherwise npm install will fail in webcontainers
    await execPromise(`tar -xzf ${tarPath}`, { cwd: targetPath });
    const unzippedPath = finalTarPath.replace(/\.tgz$/, '');
    if (fs.existsSync(unzippedPath)) {
      fs.rmdirSync(unzippedPath, { recursive: true });
    }
    fs.renameSync(`${targetPath}/package`, unzippedPath);
    fs.unlinkSync(tarPath);

    const finalTarPathRelative = unzippedPath.replace(`${virtualFsRoot}/`, './');

    // Add these to the playrgound package.json
    pkgJsonOfVirtualFs.devDependencies = {
      ...(pkgJsonOfVirtualFs.devDependencies || {}),
      [pkgJsonOfPublishablePkg.name]: `${finalTarPathRelative}`,
    };
  }

  // Also, clean up the localPublishedDependencies we don't need anymore
  const isLocal = (/** @type {string} */ pkgJsonDepVal) => pkgJsonDepVal.startsWith('.');
  for (const [pkgName, pkgJsonDepVal] of Object.entries(pkgJsonOfVirtualFs.devDependencies)) {
    if (isLocal(pkgJsonDepVal) && !pkgJsonOfVirtualFs.localPublishedDependencies[pkgName]) {
      delete pkgJsonOfVirtualFs.devDependencies[pkgName];
    }
  }

  await fs.promises.writeFile(
    `${virtualFsRoot}/package.json`,
    JSON.stringify(pkgJsonOfVirtualFs, null, 2),
  );

  // cleanup after install
  const cleanup = async () => {
    await fs.promises.rmdir(targetPath, { recursive: true });
    // restore package.json
    await fs.promises.writeFile(`${virtualFsRoot}/package.json`, originalPkgJsonOfVirtualFsRaw);
  };

  return { cleanup };
}

if (process.argv.includes('--run')) {
  createLocalNpmPublishFromPlaceholder();
}
