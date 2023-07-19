import fs from 'fs';
import url from 'url';
import path from 'path';
import { globby } from 'globby';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const sourceFsToMountDir = path.resolve(ROOT_DIR, '00_virtual-fs');
const mountFolderCfgFilePath = path.resolve(sourceFsToMountDir, '00_mount-dirs.config.json');

/**
 * @param {string} destinationPathInVirtualFs
 * @param {string} filePath
 * @returns {string}
 */
function getLocalFilePath(destinationPathInVirtualFs, filePath) {
  return `${destinationPathInVirtualFs}/${filePath}`.replace('//', '/').replace(/^\//, '');
}

/**
 * @param {{ sourcePathInRealFs:string; destinationPathInVirtualFs?:string; }} opts
 */
export async function createVirtualFsFromRealFs({
  sourcePathInRealFs,
  destinationPathInVirtualFs = '',
}) {
  let files = await globby('**/*', {
    cwd: sourcePathInRealFs,
    gitignore: true,
    followSymbolicLinks: true,
  });

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

  const virtualFs = {};
  for (const { filePath, content } of fileObjs) {
    const fsPath = getLocalFilePath(destinationPathInVirtualFs, filePath);
    const foldersPlusFile = fsPath.split('/');

    let curLvl = virtualFs;
    for (const folderOrFile of foldersPlusFile) {
      const isFile = foldersPlusFile.indexOf(folderOrFile) === foldersPlusFile.length - 1;
      const isFolder = !isFile;
      if (isFolder) {
        curLvl[folderOrFile] = { directory: {}, ...curLvl[folderOrFile] };
        curLvl = curLvl[folderOrFile].directory;
      } else {
        curLvl[folderOrFile] = { file: { contents: content } };
      }
    }
  }

  return virtualFs;
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
    fsMountFolders[folderName] = { directory: fsObj };
  }

  writeVirtualFsFromRealFs({ ...fsMountFiles, ...fsMountFolders });
}

main();
