import { WebContainer } from '@webcontainer/api';
import { createVirtualFsObjFromFileObjs } from './utils/createVirtualFsObjFromFileObjs.js';
import { virtualFs } from '../00_virtual-fs-output.js';

/**
 * @param  {...any} parts
 * @returns {string}
 */
function pathJoin(...parts) {
  return parts.join('/').replace(/\/+/g, '/');
}

/**
 * @param {string} startPath
 * @param {{depth?:number; webcontainerInstance:WebContainer}} opts
 * @param {string[]} result
 * @returns {Promise<string[]>}
 */
async function gatherFilesFromWebContainerDir(startPath, opts, result = []) {
  const { webcontainerInstance, depth = Infinity } = opts;

  let fileOrFolders;
  try {
    fileOrFolders = await webcontainerInstance.fs.readdir(startPath, { withFileTypes: true });
  } catch {
    // Startpath does not exist in webcontainer
    return result;
  }

  fileOrFolders.forEach(fileOrFolder => {
    const filePath = pathJoin(startPath, fileOrFolder.name);
    if (fileOrFolder.isDirectory()) {
      if (depth > 1) {
        // Search recursively
        gatherFilesFromWebContainerDir(filePath, { ...opts, depth: depth - 1 }, result);
      }
    } else {
      result.push(filePath);
    }
  });

  return result;
}

class WebcontainerManager extends EventTarget {
  constructor() {
    super();

    /** @type {* & WebContainer} */
    this.instance = null;
    this.virtualFs = virtualFs;
    /** @type {(v?:any) => void} */
    this._resolveInitComplete;
    this.initComplete = new Promise((resolve, reject) => {
      this._resolveInitComplete = resolve;
    });
  }

  async init() {
    this.instance = await WebContainer.boot();
    await this.instance.mount(virtualFs);
    this._resolveInitComplete();
  }

  // TODO: this is a rigorous and effective approach, look later for more performant approaches
  /**
   * Initially, we mount our virtual fs to the webcontainer.
   * Once the fs in the webcontainer changes, we need to sync our virtualFs obj representation (that feeds filetrees in the ui) with the webcontainer.
   *
   * @param {string} startDirInVirtualFs
   */
  async syncVirtualFsObjFromWebContainer(startDirInVirtualFs = '') {
    const webcontainerInstance = /** @type {WebContainer} */ (this.instance);
    const files = await gatherFilesFromWebContainerDir(startDirInVirtualFs, {
      webcontainerInstance,
    });

    const fileObjs = [];
    for (const file of files) {
      const content = await webcontainerInstance.fs.readFile(file, 'utf-8');
      fileObjs.push({ filePath: file, content });
    }

    let res = createVirtualFsObjFromFileObjs(fileObjs);
    if (startDirInVirtualFs !== '') {
      const startDirParts = startDirInVirtualFs.split('/');
      for (const startDirPart of startDirParts) {
        res[startDirPart] = { directory: res, ...res[startDirPart] };
      }
    }
    this.virtualFs = { ...this.virtualFs, ...res };
    this.dispatchEvent(new CustomEvent('virtual-fs-changed'));
  }
}

export const webcontainerManager = new WebcontainerManager();

window.addEventListener('load', async function initWebContainer() {
  await webcontainerManager.init();
});
