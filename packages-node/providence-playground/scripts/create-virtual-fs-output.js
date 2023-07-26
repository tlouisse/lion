import fs from 'fs';
import url from 'url';
import path from 'path';
import { globby } from 'globby';
import { createVirtualFsObjFromFileObjs } from '../01_src/utils/createVirtualFsObjFromFileObjs.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const sourceFsToMountDir = path.resolve(ROOT_DIR, '00_virtual-fs');
const mountFolderCfgFilePath = path.resolve(sourceFsToMountDir, '00_mount-dirs.config.json');

/**
 * @param {{ sourcePathInRealFs:string; destinationPathInVirtualFs?:string; }} opts
 */
export async function createVirtualFsFromRealFs({
  sourcePathInRealFs,
  destinationPathInVirtualFs = '',
}) {
  const gitIgnorePath = path.resolve(sourceFsToMountDir, '.gitignore');
  // we need to exclude "_tmp/_local-publishes" from .gitignore
  const gitignoreContentBefore = fs.readFileSync(gitIgnorePath, 'utf-8');
  const gitignoreContentAfter = gitignoreContentBefore.replace('_tmp/_local-publishes', '');
  fs.writeFileSync(gitIgnorePath, gitignoreContentAfter, 'utf-8');

  let files = await globby('**/*', {
    cwd: sourcePathInRealFs,
    gitignore: true,
    followSymbolicLinks: true,
  });

  fs.writeFileSync(gitIgnorePath, gitignoreContentBefore, 'utf-8');

  if (sourceFsToMountDir === sourcePathInRealFs) {
    files = files.filter(
      file => file !== mountFolderCfgFilePath,
      mountFolderCfgFilePath.replace(new RegExp(`^${sourceFsToMountDir}/`), ''),
    );
  }

  const fileObjs = files.map(file => {
    const content = fs.readFileSync(path.resolve(sourcePathInRealFs, file), 'utf-8');
    return { filePath: file, content };
  });

  return createVirtualFsObjFromFileObjs(fileObjs, destinationPathInVirtualFs);
}

/**
 * @param {*} fsObj
 */
export async function writeVirtualFsFromRealFs(fsObj) {
  const serializedObj = JSON.stringify(fsObj, null, 2);
  const result = [
    "/** @type {import('@webcontainer/api').FileSystemTree} */",
    '',
    `export const virtualFs = ${serializedObj};`,
  ].join('\n');

  fs.writeFileSync(path.resolve(ROOT_DIR, '00_virtual-fs-output.js'), result, 'utf-8');
}

async function main() {
  const mountFoldersCfg = JSON.parse(fs.readFileSync(mountFolderCfgFilePath, 'utf-8'));
  const fsMountFiles = await createVirtualFsFromRealFs({ sourcePathInRealFs: sourceFsToMountDir });
  const fsMountFolders = {};
  for (const [folderName, folderRelativeLocation] of Object.entries(mountFoldersCfg)) {
    const fsDir = path.resolve(sourceFsToMountDir, folderRelativeLocation);
    const fsObj = await createVirtualFsFromRealFs({ sourcePathInRealFs: fsDir });

    const folderNameSplit = folderName.split('/');
    const isScopedPkg = folderNameSplit.length === 2 && folderNameSplit[0].startsWith('@');

    if (isScopedPkg) {
      fsMountFolders[folderNameSplit[0]] = {
        directory: { [folderNameSplit[1]]: { directory: fsObj } },
        ...fsMountFolders[folderNameSplit[0]],
      };
    } else {
      fsMountFolders[folderName] = { directory: fsObj };
    }
  }

  writeVirtualFsFromRealFs({ ...fsMountFiles, ...fsMountFolders });
}

main();
