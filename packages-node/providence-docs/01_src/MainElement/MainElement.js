import { webcontainerManager } from '../webcontainerManager.js';
import { Terminal } from 'xterm';
import { LitElement, html } from 'lit-element';
import { ref, createRef } from 'lit/directives/ref.js';
import xtermStyle from './style/xterm.css.js';
import mainElementStyle from './style/MainElement.css.js';

/**
 * @typedef {import('@webcontainer/api').WebContainer} WebContainer
 */

/**
 * @param {{ content:string; webcontainerInstance:WebContainer; }} context
 */
async function writeIndexJS({ content, webcontainerInstance }) {
  await webcontainerInstance.fs.writeFile('/index.js', content);
}

/**
 * @param {{webcontainerInstance:WebContainer; textareaEl:HTMLTextAreaElement; virtualFs:* }} context
 */
function initCodeEditor({ webcontainerInstance, virtualFs, textareaEl }) {
  textareaEl.value = virtualFs['index.js'].file.contents;
  textareaEl.addEventListener('input', () => {
    writeIndexJS({ content: textareaEl.value, webcontainerInstance });
  });
}

/**
 * @param {{terminalEl:HTMLElement}} context
 */
function initTerminal({ terminalEl }) {
  const terminal = new Terminal({ convertEol: true });
  terminal.open(terminalEl);
  return terminal;
}

/**
 * @param {{terminal: Terminal;webcontainerInstance:WebContainer}} context
 */
async function initShell({ terminal, webcontainerInstance }) {
  const shellProcess = await webcontainerInstance.spawn('jsh');
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    }),
  );

  const input = shellProcess.input.getWriter();
  terminal.onData(data => {
    input.write(data);
  });

  return shellProcess;
}

/**
 * @param {{terminal: Terminal;webcontainerInstance:WebContainer}} context
 */
async function installProvidenceDependencies({ terminal, webcontainerInstance }) {
  // Install dependencies
  const installProcess = await webcontainerInstance.spawn('npm', ['run', 'prov-install']);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    }),
  );

  if ((await installProcess.exit) !== 0) {
    throw new Error('Failed to install dependencies');
  }
  // Wait for install command to exit
  return installProcess;
}

export class MainElement extends LitElement {
  static styles = [xtermStyle, mainElementStyle];

  refs = {
    iframe: createRef(),
    textarea: createRef(),
    terminal: createRef(),
  };

  render() {
    return html` <div class="container">
        <div class="editor">
          <textarea ${ref(this.refs.textarea)}>I am a textarea</textarea>
        </div>
        <div class="preview">
          <iframe ${ref(this.refs.iframe)} src="loading.html"></iframe>
        </div>
      </div>
      <div ${ref(this.refs.terminal)} class="terminal"></div>`;
  }

  /**
   * @param {import('lit').PropertyValues} changedProperties
   */
  async firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    await webcontainerManager.initComplete;
    this.init();
  }

  async init() {
    const iframeEl = /** @type {HTMLIFrameElement} */ (this.refs.iframe.value);
    const terminalEl = /** @type {HTMLElement} */ (this.refs.terminal.value);
    const textareaEl = /** @type {HTMLTextAreaElement} */ (this.refs.textarea.value);

    const webcontainerInstance = webcontainerManager.instance;
    webcontainerInstance.on(
      'server-ready',
      (/** @type {number} */ port, /** @type {string} */ url) => {
        console.log('server ready', port, url);
        iframeEl.src = url;
      },
    );

    const terminal = initTerminal({ terminalEl });
    initCodeEditor({ webcontainerInstance, textareaEl, virtualFs: webcontainerManager.virtualFs });
    await initShell({ terminal, webcontainerInstance });
    await installProvidenceDependencies({ terminal, webcontainerInstance });
    await initProvidenceDashboardServer({ webcontainerInstance, terminal });
  }
}

/**
 * @param {{webcontainerInstance:WebContainer;terminal:*}} context
 */
async function initProvidenceDashboardServer({ webcontainerInstance, terminal }) {
  const installProcess = await webcontainerInstance.spawn('npm', ['run', 'prov-dashboard']);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    }),
  );
}
