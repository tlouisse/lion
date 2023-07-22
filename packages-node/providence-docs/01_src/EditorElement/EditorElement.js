import { html, css } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';
import { LionTabs } from '@lion/ui/tabs.js';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { languages } from '@codemirror/language-data';
import { PgElement } from '../core/PgElement.js';
import { nord } from './theme.js';
import closeIcon from '../core/icons/close.svg.js';

class CodeMirrorElement extends PgElement {
  static properties = {
    path: { type: String },
    content: { type: String },
  };

  static styles = [
    ...super.styles,
    css`
      .breadcrumbs {
        display: flex;
        margin-bottom: var(--size-1);
        font-size: var(--font-size-0);
        display: none;
      }

      .breadcrumbs li {
        list-style: none;
      }

      :host #cm-view .cm-scroller {
        font-family: var(--font-mono);
        font-size: var(--font-size-0);
      }
    `,
  ];

  refs = {
    cmView: createRef(),
  };

  render() {
    return html`${this._breadCrumbsTemplate({ path: this.path, name: this.name })}
      <div ${ref(this.refs.cmView)} id="cm-view"></div>`;
  }

  /**
   * @param {{path:string;name:string}} context
   */
  _breadCrumbsTemplate({ path, name }) {
    const pathSplit = [...path.split('/'), name];
    return html`<ul class="breadcrumbs">
      ${pathSplit.map(
        (p, idx) => html`<li>${p} ${idx === pathSplit.length - 1 ? '' : html`>&nbsp;`}</li>`,
      )}
    </ul>`;
  }

  /**
   * @param {import('lit').PropertyValues} changedProperties
   */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    // The Markdown parser will dynamically load parsers
    // for code blocks, using @codemirror/language-data to
    // look up the appropriate dynamic import.
    this._editorView = new EditorView({
      doc: this.content,
      extensions: [basicSetup, javascript({ codeLanguages: languages }), nord],
      parent: this.refs.cmView.value,
    });
  }
}

export class EditorElement extends PgElement {
  static scopedElements = {
    'lion-tabs': LionTabs,
    'code-mirror-element': CodeMirrorElement,
  };

  static properties = {
    activeTabIndex: { type: Number },
    tabs: { type: Array },
  };

  static styles = [
    ...super.styles,
    css`
      .tab {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        border: none;
        gap: var(--size-2);
        padding: var(--size-2);
        border-bottom: 2px solid transparent;
        cursor: pointer;
      }

      .tab[selected='true'] {
        border-bottom-color: var(--brand);
      }

      .tab__text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tab__icon {
        z-index: 1;
      }
    `,
  ];

  constructor() {
    super();

    /** @type {{path:string; name:string; content:string}[]} */
    this.tabs = [];
  }

  /**
   * @param {{path:string; name:string; content:string}} tabObj
   */
  openTab(tabObj) {
    const foundIndex = this.tabs.findIndex(
      ({ path, name }) => path === tabObj.path && name === tabObj.name,
    );
    if (foundIndex !== -1) {
      this.activeTabIndex = foundIndex;
    } else {
      this.tabs.push(tabObj);
      this.tabs = [...this.tabs];
      this.activeTabIndex = this.tabs.length - 1;
    }
  }

  /**
   * @param {number} idx
   */
  removeTab(idx) {
    if (this.tabs[idx]) {
      this.tabs.splice(idx, 1);
      this.tabs = [...this.tabs];
      // Also, end codemirror session ?
    }
  }

  _dragstartHandler(ev) {
    // Add the target element's id to the data transfer object
    ev.dataTransfer.setData('application/my-app', ev.currentTarget.getAttribute('data-index'));
    ev.dataTransfer.effectAllowed = 'move';
  }

  _dragoverHandler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
  }

  _dropHandler(ev) {
    ev.preventDefault();
    const dragFromIndex = Number(ev.dataTransfer.getData('application/my-app'));
    let dragToIndex = Number(ev.currentTarget.getAttribute('data-index'));
    if (Number.isNaN(dragFromIndex) || Number.isNaN(dragToIndex) || dragFromIndex === dragToIndex) {
      return;
    }
    // Insert tab in new position
    const dragFromTab = this.tabs[dragFromIndex];
    const dragToTab = this.tabs[dragToIndex];
    // Remove tab from old position
    this.tabs.splice(dragFromIndex, 1);
    // If dragToIndex is greater than dragFromIndex, we need to account for the difference
    // dragToIndex = this.tabs.indexOf(dragToTab);

    console.log({ dragFromTab, dragToTab, dragToIndex, dragFromIndex });

    // Insert tab in new position
    this.tabs.splice(dragToIndex, 0, dragFromTab);
    // trigger render
    this.tabs = [...this.tabs];
  }

  /**
   * @param {{ name:string; idx: number; path:string}} context
   */
  _tabTemplate({ name, idx, path }) {
    return html`
      <button
        draggable="true"
        data-index="${idx}"
        class="tab surface-3"
        slot="tab"
        @dragstart="${this._dragstartHandler}"
        @dragover="${this._dragoverHandler}"
        @drop="${this._dropHandler}"
        title="${path + '/' + name}"
      >
        <span class="tab__text">${name}</span>
        <span class="tab__icon -icon-wrapper" title="close" @click="${() => this.removeTab(idx)}"
          >${closeIcon}</span
        >
      </button>
    `;
  }

  render() {
    return html`<div>
      <lion-tabs .selectedIndex="${this.activeTabIndex}">
        ${this.tabs.map(
          ({ path, content, name }, idx) => html`
            ${this._tabTemplate({ name, idx, path })}
            <code-mirror-element
              slot="panel"
              .path="${path}"
              .content="${content}"
              .name="${name}"
            ></code-mirror-element>
          `,
        )}
      </lion-tabs>
    </div>`;
  }
}
