import { WebContainer } from '@webcontainer/api';
import { virtualFs } from '../00_virtual-fs-output.js';

/** @type {WebContainer} */
let instance;

/** @type {(v?:any) => void} */
let resolveInitComplete;
let initComplete = new Promise((resolve, reject) => {
  resolveInitComplete = resolve;
});

// @ts-ignore
export const webcontainerManager = { instance, virtualFs, initComplete };

async function initWebContainer() {
  webcontainerManager.instance = await WebContainer.boot();
  await webcontainerManager.instance.mount(virtualFs);
  resolveInitComplete();
}

window.addEventListener('load', initWebContainer);
