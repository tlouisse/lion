import { html, css } from 'lit-element';
import { ref, createRef } from 'lit/directives/ref.js';
import { Terminal } from 'xterm';
import { LionSwitch } from '@lion/ui/switch.js';
import { LionSwitchButton } from '@lion/ui/switch.js';
import { webcontainerManager } from '../webcontainerManager.js';
import darkIcon from '../core/icons/dark.svg.js';
import lightIcon from '../core/icons/light.svg.js';
import xtermStyle from './style/xterm.css.js';
import mainElementStyle from './style/MainElement.css.js';
import { FileTreeElement } from '../FileTreeElement/FileTreeElement.js';
import { EditorElement } from '../EditorElement/EditorElement.js';
import { PgElement } from '../core/PgElement.js';
import globalCss from '../core/global.css.js';

// We patch the prototype of LionSwitchButton in order to change its template
// TODO: in the future, expose this decoration in a more user friendly way, having access to
// relevant renderData as well

// N.B. since this is a switch specifically for dark mode, normally we would have created an extension for this
// This just shows how we can decorate the visual idenity of a component without extending it (allowing you not having to rewrite complex templates that are already semantcially correct), today

LionSwitchButton.prototype.render = function render() {
  return html`
    <div class="btn">
      <div class="switch-button__track surface-2"></div>
      <div class="switch-button__thumb surface-4 --icon-wrapper">
        <span class="light">${lightIcon}</span>
        <span class="dark">${darkIcon}</span>
      </div>
    </div>
  `;
};

Object.defineProperty(LionSwitchButton, 'styles', {
  value: LionSwitchButton.styles,
  writable: true,
});
// @ts-expect-error
LionSwitchButton.styles = [
  ...LionSwitchButton.styles,
  globalCss,
  css`
    :host([checked]) .light {
      display: none;
    }

    :host(:not([checked])) .dark {
      display: none;
    }

    .btn {
      border-radius: var(--size-4);
      outline: 1px solid var(--text-2);
    }

    .switch-button__track,
    .switch-button__thumb {
      border-radius: inherit;
      outline: none !important;
    }
  `,
];

/**
 * @typedef {import('@webcontainer/api').WebContainer} WebContainer
 */

// /**
//  * @param {{ content:string; webcontainerInstance:WebContainer; }} context
//  */
// async function writeIndexJS({ content, webcontainerInstance }) {
//   await webcontainerInstance.fs.writeFile('/index.js', content);
// }

// /**
//  * @param {{webcontainerInstance:WebContainer; textareaEl:HTMLTextAreaElement; virtualFs:* }} context
//  */
// function initCodeEditor({ webcontainerInstance, virtualFs, textareaEl }) {
//   textareaEl.value = virtualFs['index.js'].file.contents;
//   textareaEl.addEventListener('input', () => {
//     writeIndexJS({ content: textareaEl.value, webcontainerInstance });
//   });
// }

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

export class MainElement extends PgElement {
  static styles = [...super.styles, xtermStyle, mainElementStyle];

  static scopedElements = {
    // @ts-expect-error
    ...super.scopedElements,
    'file-tree-element': FileTreeElement,
    'editor-element': EditorElement,
    'lion-switch': LionSwitch,
  };

  refs = {
    iframe: createRef(),
    textarea: createRef(),
    terminal: createRef(),
    editor: createRef(),
    themeSwitch: createRef(),
  };

  constructor() {
    super();

    this._onFileSelected = this._onFileSelected.bind(this);
  }

  render() {
    return html`
      <div class="main-grid">
        <header class="main-grid__header --flex">
          <h1 class="--relative">
            providence<span class="--highlight-text"> playground</span
            ><sup class="--super-text">beta</sup>
          </h1>
          <lion-switch
            ${ref(this.refs.themeSwitch)}"
            checked
            label-sr-only
            label="switch theme"
            @checked-changed="${this._setTheme}"
          ></lion-switch>
        </header>
        <div class="main-grid__sidebar">
          <file-tree-element
            .virtualFs="${webcontainerManager.virtualFs}"
            @file-selected="${this._onFileSelected}"
          ></file-tree-element>
        </div>
        <div class="main-grid__editor">
          <editor-element ${ref(this.refs.editor)}> </editor-element>
        </div>
        <div class="main-grid__preview">
          <iframe ${ref(this.refs.iframe)} src="loading.html"></iframe>
        </div>
        <div class="main-grid__terminal">
          <div ${ref(this.refs.terminal)} class="terminal"></div>
        </div>
      </div>
    `;
  }

  /**
   * @param {CustomEvent} event
   */
  _onFileSelected(event) {
    this._openCodeEditorTab(event.detail);
  }

  /**
   * @param {CustomEvent} event
   */
  _setTheme(event) {
    // @ts-expect-error
    const theme = event.currentTarget?.checked ? 'light' : 'dark';
    document.documentElement.setAttribute('color-scheme', theme);
  }

  // @ts-expect-error
  _openCodeEditorTab({ content, name, path }) {
    const editorRef = this.refs.editor.value;
    // @ts-expect-error
    editorRef.openTab({ content, name, path });
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
    // const textareaEl = /** @type {HTMLTextAreaElement} */ (this.refs.textarea.value);

    const webcontainerInstance = webcontainerManager.instance;
    webcontainerInstance.on(
      'server-ready',
      (/** @type {number} */ port, /** @type {string} */ url) => {
        console.log('server ready', port, url);
        iframeEl.src = url;
      },
    );

    const terminal = initTerminal({ terminalEl });
    // initCodeEditor({ webcontainerInstance, textareaEl, virtualFs: webcontainerManager.virtualFs });
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
