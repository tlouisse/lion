/**
 * @param {string} destinationPathInVirtualFs
 * @param {string} filePath
 * @returns {string}
 */
function getLocalFilePath(destinationPathInVirtualFs, filePath) {
  return `${destinationPathInVirtualFs}/${filePath}`.replace('//', '/').replace(/^\//, '');
}

/**
 * Can be used in nodejs fs or wc fs contexts
 * @param {{filePath:string; content:string}[]} fileObjs
 * @param {string} destinationPathInVirtualFs
 */
export function createVirtualFsObjFromFileObjs(fileObjs, destinationPathInVirtualFs = '') {
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
