import { html } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';
import { Terminal } from 'xterm';
import { PgDarkmodeSwitch } from './PgDarkmodeSwitch.js';
import { LionAccordion } from '@lion/ui/accordion.js';
import { webcontainerManager } from '../webcontainerManager.js';
import chevronRightIcon from '../core/icons/chevronRight.svg.js';
import xtermStyle from './style/xterm.css.js';
import mainElementStyle from './style/MainElement.css.js';
import { FileTreeElement } from '../FileTreeElement/FileTreeElement.js';
import { EditorElement } from '../EditorElement/EditorElement.js';
import { PgElement } from '../core/PgElement.js';

/**
 * @typedef {import('@webcontainer/api').WebContainer} WebContainer
 */

/**
 * @param {{completeFs:*; path:string;}}} context
 */
function getSliceOfVirtualFs({ completeFs, path }) {
  if (!path || !completeFs) return null;

  let result = completeFs;
  const pathSlices = path.split('/');

  try {
    for (const pathSlice of pathSlices) {
      // const isLastSlice = pathSlices.indexOf(pathSlice) === pathSlices.length - 1;

      const nextDir = result[pathSlice].directory;
      if (nextDir) {
        result = result[pathSlice].directory;
      }

      // // Now give it the folder name as key (or @scope/foldername)
      // if (isLastSlice) {
      //   const isScopedPackage = pathSlices[pathSlices.length - 2].startsWith('@');
      //   result[pathSlice] = { directory: result };
      //   if (isScopedPackage) {
      //     result[pathSlices[pathSlices.length - 2]] = { directory: result };
      //   }
      // }
    }
  } catch (err) {
    console.error(err);
  }
  return result;
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
 * @param {{terminal: Terminal; webcontainerInstance:WebContainer}} context
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

// /**
//  * @param {{terminal: Terminal;webcontainerInstance:WebContainer}} context
//  */
// async function installProvidenceDependencies({ terminal, webcontainerInstance }) {
//   // Install dependencies
//   const installProcess = await webcontainerInstance.spawn('npm', ['run', 'prov-install']);
//   installProcess.output.pipeTo(
//     new WritableStream({
//       write(data) {
//         terminal.write(data);
//       },
//     }),
//   );

//   if ((await installProcess.exit) !== 0) {
//     throw new Error('Failed to install dependencies');
//   }
//   // Wait for install command to exit
//   return installProcess;
// }

export class MainElement extends PgElement {
  static properties = {
    _activeAnalyzer: { type: String, state: true },
    _targetRepositoryPath: { type: String, state: true },
    _referenceRepositoryPath: { type: String, state: true },
    _virtualFs: { type: Object, state: true },
  };

  static styles = [...super.styles, xtermStyle, mainElementStyle];

  static scopedElements = {
    // @ts-expect-error
    ...super.scopedElements,
    'file-tree-element': FileTreeElement,
    'editor-element': EditorElement,
    'pg-darkmode-switch': PgDarkmodeSwitch,
    'lion-accordion': LionAccordion,
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
    this._targetRepositoryPath = 'providence-playground';
    this._referenceRepositoryPath = 'node_modules/@lion/ui';
    this._providenceOutputPath = 'providence-output';

    /** @type {(a?:any) => void} */
    this.__resolveProvidenceReady;
    this.providenceReady = new Promise(resolve => {
      this.__resolveProvidenceReady = resolve;
    });

    this._virtualFs = webcontainerManager.virtualFs;
  }

  render() {
    return html`
      <div class="main-grid">
        <header class="main-grid__header -l-flex" style="gap: var(--size-3);">
          <h1 class="-relative">
            providence<span class="-highlight-text"> playground</span>
            <sup class="-super-text">beta</sup>
          </h1>
          <pg-darkmode-switch
            ${ref(this.refs.themeSwitch)}"
            checked
            label-sr-only
            label="switch theme"
            @checked-changed="${this._setTheme}"
          ></pg-darkmode-switch>
        </header>
        <div class="main-grid__sidebar">
          <lion-accordion expanded="[0]">

            ${this._accordionHeadingTemplate({ text: 'Analyzer Query' })}
            <div slot="content">
              <fieldset class="fieldset" @input="${this.__handleAnalyzer}">
                <legend class="-sr-only">Active Analyzer</legend>
                <label><input name="activeAnalyzer" type="radio" value="find-imports">find-imports</label>
                <label><input name="activeAnalyzer" type="radio" value="find-exports">find-exports</label>
                <label><input name="activeAnalyzer" type="radio" value="match-imports">match-imports</label>
                <label><input name="activeAnalyzer" type="radio" value="match-subclasses">match-subclasses</label>
                <label><input name="activeAnalyzer" type="radio" value="custom">custom...</label>
              </fieldset>
            </div>


            ${this._accordionHeadingTemplate({
              text: 'Target Project',
              path: this._targetRepositoryPath,
            })}
            <div slot="content">
              <file-tree-element
                .virtualFs="${getSliceOfVirtualFs({
                  completeFs: this._virtualFs,
                  path: this._targetRepositoryPath,
                })}"
                @file-selected="${this._onFileSelected}"
              ></file-tree-element>
            </div>

            ${this._accordionHeadingTemplate({
              text: 'Reference Project',
              path: this._referenceRepositoryPath,
            })}
            <div slot="content">
              <file-tree-element
                .virtualFs="${getSliceOfVirtualFs({
                  completeFs: this._virtualFs,
                  path: this._referenceRepositoryPath,
                })}"
                @file-selected="${this._onFileSelected}"
              ></file-tree-element>
            </div>

            ${this._accordionHeadingTemplate({ text: 'Providence output' })}
            <file-tree-element
              slot="content"
              .virtualFs="${getSliceOfVirtualFs({
                completeFs: this._virtualFs,
                path: this._providenceOutputPath,
              })}"              
              @file-selected="${this._onFileSelected}"
            ></file-tree-element>


            ${this._accordionHeadingTemplate({ text: 'File System' })}
            <file-tree-element
              slot="content"
              .virtualFs="${this._virtualFs}"
              @file-selected="${this._onFileSelected}"
            ></file-tree-element>

          </lion-accordion>

        </div>
        <div class="main-grid__editor">
          <editor-element class="editor" ${ref(this.refs.editor)}> </editor-element>
        </div>
        <div class="main-grid__preview" style="display: none;">
          <iframe ${ref(this.refs.iframe)} src="loading.html"></iframe>
        </div>
        <div class="main-grid__terminal">
          <div ${ref(this.refs.terminal)} class="terminal"></div>
        </div>
      </div>
    `;
  }

  /**
   * @param {{text:string;path?:string;}} context
   */
  _accordionHeadingTemplate({ text, path }) {
    return html`<div role="heading" aria-level="3" slot="invoker">
      <button class="accordion-heading -l-flex surface-2">
        <span class="accordion-heading__icon -icon-wrapper">${chevronRightIcon}</span
        ><span class="accordion-heading__text">${text}</span>
        ${path ? html`<span style="text-transform: lowercase;">(${path})</span>` : ''}
      </button>
    </div>`;
  }

  /**
   * @param {CustomEvent} event
   */
  _onFileSelected(event) {
    this._openCodeEditorTab(event.detail);
  }

  /**
   * @param {*} ev
   */
  __handleAnalyzer(ev) {
    this._activeAnalyzer = ev.target.value;
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

  /**
   * @param {import('lit').PropertyValues} changedProperties
   */
  async updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('_activeAnalyzer')) {
      if (this._activeAnalyzer === 'custom') {
        // create new file in FS

        this._openCodeEditorTab({
          // Analyzer template
          content: '// Write your custom analyzer here',
          name: 'customAnalyzer.js',
          path: '/customAnalyzer.js',
        });
      } else {
        await this.providenceReady;
        await runAnalyzerQuery({
          webcontainerInstance: webcontainerManager.instance,
          terminal: this._terminal,
          analyzer: this._activeAnalyzer,
          targetPath: this._targetRepositoryPath,
          refPath: this._referenceRepositoryPath,
        });

        // Wait a tick, so that the fs has updated
        await new Promise(resolve => setTimeout(() => resolve(undefined), 3000));

        // console.log('hmmm???');

        webcontainerManager.syncVirtualFsObjFromWebContainer(this._providenceOutputPath);
      }
    }
  }

  async init() {
    const iframeEl = /** @type {HTMLIFrameElement} */ (this.refs.iframe.value);
    const terminalEl = /** @type {HTMLElement} */ (this.refs.terminal.value);
    // const textareaEl = /** @type {HTMLTextAreaElement} */ (this.refs.textarea.value);

    webcontainerManager.addEventListener('virtual-fs-changed', async () => {
      this._virtualFs = null;
      await this.updateComplete;
      this._virtualFs = webcontainerManager.virtualFs;
      console.log('virtual-fs-changed', this._virtualFs);
    });

    const webcontainerInstance = webcontainerManager.instance;
    webcontainerInstance.on(
      'server-ready',
      (/** @type {number} */ port, /** @type {string} */ url) => {
        console.log('server ready', port, url);
        iframeEl.src = url;
      },
    );

    this._terminal = initTerminal({ terminalEl });
    // initCodeEditor({ webcontainerInstance, textareaEl, virtualFs: webcontainerManager.virtualFs });
    await initShell({ terminal: this._terminal, webcontainerInstance });
    // await installProvidenceDependencies({ terminal: this._terminal, webcontainerInstance });
    await installNpmDeps({ terminal: this._terminal, webcontainerInstance });
    this.__resolveProvidenceReady();
    // await initProvidenceDashboardServer({ webcontainerInstance, terminal });
  }
}

// /**
//  * @param {{webcontainerInstance:WebContainer;terminal:*}} context
//  */
// async function initProvidenceDashboardServer({ webcontainerInstance, terminal }) {
//   const installProcess = await webcontainerInstance.spawn('npm', ['run', 'prov-dashboard']);
//   installProcess.output.pipeTo(
//     new WritableStream({
//       write(data) {
//         terminal.write(data);
//       },
//     }),
//   );
// }

/**
 * @param {{webcontainerInstance:WebContainer;terminal:*; analyzer: string; targetPath: string; refPath?:string}} context
 */
async function runAnalyzerQuery({
  webcontainerInstance,
  terminal,
  analyzer,
  targetPath,
  refPath = '',
}) {
  let cmd;
  if (analyzer === 'find-exports') {
    // For the purpose of this playground, running against ref is better
    // to see how all comes together in match-imports
    cmd = `providence analyze ${analyzer} -t ${refPath}`;
  } else if (analyzer.startsWith('find-')) {
    cmd = `providence analyze ${analyzer} -t ${targetPath}`;
  } else {
    cmd = `providence analyze ${analyzer} -t ${targetPath} -r ${refPath}`;
  }

  terminal.writeln(`\n\n\x1b[37m------------------------------------------`);
  terminal.writeln(`Running "${cmd}"`);
  terminal.writeln(`------------------------------------------\n`);

  const cmdSplit = cmd.split(' ');
  const analyzerProcess = await webcontainerInstance.spawn(cmdSplit[0], cmdSplit.slice(1));
  analyzerProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    }),
  );
}

/**
 * @param {{webcontainerInstance:WebContainer;terminal:*}} context
 */
async function installNpmDeps({ webcontainerInstance, terminal }) {
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    }),
  );

  // // Since we install local binary, we have to fix cli/bin link ourselves
  // const fakeProvidenceInstallProcess = await webcontainerInstance.spawn('npm', [
  //   'run',
  //   'fake-providence-install',
  // ]);
  // fakeProvidenceInstallProcess.output.pipeTo(
  //   new WritableStream({
  //     write(data) {
  //       terminal.write(data);
  //     },
  //   }),
  // );

  // // Since we install local binary, we have to fix cli/bin link ourselves
  // const fakeCliBinProcess = await webcontainerInstance.spawn('npm', [
  //   'run',
  //   'fake-providence-cli-bin',
  // ]);
  // fakeCliBinProcess.output.pipeTo(
  //   new WritableStream({
  //     write(data) {
  //       terminal.write(data);
  //     },
  //   }),
  // );
}
