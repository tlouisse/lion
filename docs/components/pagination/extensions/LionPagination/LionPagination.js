import { html, css, LitElement } from 'lit';

import { UIBaseElementMixin } from '../../../input/extensions/shared/UIBaseElement.js';
import { UIPartDirective } from '../../../input/extensions/shared/UIPartDirective.js';
import {
  assertPresentation,
  assertListItem,
  assertAnchor,
  assertButton,
  assertList,
  assertNav,
} from '../../../input/extensions/shared/element-assertions.js';

function assertLinkOrButton(element, { mode }) {
  if (mode === 'links') {
    assertAnchor(element);
  } else if (mode === 'buttons') {
    assertButton(element);
  }
}

export class UIInputPartDirective extends UIPartDirective {
  allowedParts = ['root', 'ul', 'li', 'prev', 'next', 'page'];

  setupFunctions = {
    root({ element }) {
      assertNav(element);
    },
    ul({ element }) {
      assertList(element);
    },
    'li-prev': ({ element }) => {
      assertListItem(element);
    },
    'li-page': ({ element }) => {
      assertListItem(element);
    },
    'li-next': ({ element }) => {
      assertListItem(element);
    },
    prev({ element, data }) {
      assertLinkOrButton(element, { mode: data.mode });
    },
    next({ element, data }) {
      assertLinkOrButton(element, { mode: data.mode });
    },
    page({ element, labels, data, functions }, { pageItem }) {
      element.setAttribute('aria-label', labels.pageItem(pageItem));

      // N.B. move to client only setup...
      element.addEventListener('click', () => {
        functions.setCurrent(pageItem);
      });

      // N.B. move to update...
      element.setAttribute('aria-current', pageItem === data.current);
      element.setAttribute('aria-live', pageItem === data.current ? 'polite' : 'off');
    },
    pageInBetween({ element }) {
      assertPresentation(element);
    },
  };
}

export class UIPagination extends UIBaseElementMixin(LitElement) {
  // static get localizeNamespaces() {
  //   return [
  //     {
  //       'lion-pagination': /** @param {string} locale */ locale => {
  //         switch (locale) {
  //           case 'bg-BG':
  //             return import('@lion/ui/pagination-translations/bg.js');
  //           case 'cs-CZ':
  //             return import('@lion/ui/pagination-translations/cs.js');
  //           case 'de-AT':
  //           case 'de-DE':
  //             return import('@lion/ui/pagination-translations/de.js');
  //           case 'en-AU':
  //           case 'en-GB':
  //           case 'en-PH':
  //           case 'en-US':
  //             return import('@lion/ui/pagination-translations/en.js');
  //           case 'es-ES':
  //             return import('@lion/ui/pagination-translations/es.js');
  //           case 'fr-FR':
  //           case 'fr-BE':
  //             return import('@lion/ui/pagination-translations/fr.js');
  //           case 'hu-HU':
  //             return import('@lion/ui/pagination-translations/hu.js');
  //           case 'it-IT':
  //             return import('@lion/ui/pagination-translations/it.js');
  //           case 'nl-BE':
  //           case 'nl-NL':
  //             return import('@lion/ui/pagination-translations/nl.js');
  //           case 'pl-PL':
  //             return import('@lion/ui/pagination-translations/pl.js');
  //           case 'ro-RO':
  //             return import('@lion/ui/pagination-translations/ro.js');
  //           case 'ru-RU':
  //             return import('@lion/ui/pagination-translations/ru.js');
  //           case 'sk-SK':
  //             return import('@lion/ui/pagination-translations/sk.js');
  //           case 'uk-UA':
  //             return import('@lion/ui/pagination-translations/uk.js');
  //           case 'zh-CN':
  //             return import('@lion/ui/pagination-translations/zh.js');
  //           default:
  //             return import('@lion/ui/pagination-translations/en.js');
  //         }
  //       },
  //     },
  //     ...super.localizeNamespaces,
  //   ];
  // }

  static properties = {
    // TODO: should we align with other components, where we use active-index, selected-index, etc.?
    current: { type: Number, reflect: true },
    count: { type: Number, reflect: true },
    mode: { type: String, reflect: true },
    visiblePages: { type: Array },
  };

  constructor() {
    super();
    /**
     * The number of page links/buttons that should be visible
     * @type {number}
     */
    this.visiblePages = 5;
    this.current = 1;
    this.count = 0;

    /**
     * Most pagination components should trigger a page refresh when a new page is selected.
     * However, in case of a data table that is refreshed on the client,
     *
     *
     * @type {'links'|'buttons'}
     */
    this.mode = 'links';
  }

  static styles = [
    css`
      [data-part='root'] {
        cursor: default;
      }

      [data-part='ul'] {
        list-style: none;
        padding: 0;
        text-align: center;
      }

      [data-part='li'] {
        display: inline-block;
      }

      [data-part='button'][aria-current='true'] {
        font-weight: bold;
      }
    `,
  ];

  /**
   * Which data are we going to expose to our template?
   */
  get templateContext() {
    return {
      ...super.templateContext,
      data: {
        isNextDisabled: this.current === this.count - 1,
        pageItems: this.#calculateNavList(),
        isPrevDisabled: this.current === 0,
        current: this.current,
        mode: this.mode,
      },
      labels: {
        page: ({ pageItem }) => `page ${pageItem}`,
        nav: () => `my navigation`,
      },
      functions: {
        setCurrent: page => {
          this.current = page;
        },
      },
    };
  }

  static templates = {
    root(ctx) {
      const { templates: tpl, data, part } = ctx;

      return html`
        <nav ${part('root')}>
          <ul ${part('ul')}>
            <li ${part('li-prev')}>${tpl.prevItem(ctx)}</li>
            ${data.pageItems.map(
              (/** @type {string} */ pageItem, /** @type {number} */ index) =>
                html`<!---->
                  <li ${part('li-page', { index })}>
                    ${tpl.pageItem(ctx, { pageItem, index })}}
                  </li>`,
            )}
            <li ${part('li-next')}>${tpl.nextItem(ctx)}</li>
          </ul>
        </nav>
      `;
    },
    prevItem(ctx) {
      const { data, part, templates: tpl } = ctx;

      return data.mode === 'links'
        ? html` <a ${part('prev')}>${tpl.prevContent(content)}</a>`
        : html` <button ${part('prev')}>${tpl.prevContent(content)}</button>`;
    },
    prevContent: () => html` &lt; `,
    nextItem(ctx, { content }) {
      const { data, part, templates: tpl } = ctx;

      return data.mode === 'links'
        ? html` <a ${part('next')}>${tpl.nextContent(content)}</a>`
        : html` <button ${part('next')}>${tpl.nextContent(content)}</button>`;
    },
    nextContent: () => html` &gt; `,
    pageItem(ctx, { content }) {
      const { part, data, templates: tpl } = ctx;

      if (content === '...') {
        return html` <span ${part('page-inbetween')}>${content}</span>`;
      }

      return data.mode === 'links'
        ? html` <a ${part('page')}>${tpl.pageContent(content)}</a>`
        : html` <button ${part('page')}>${tpl.pageContent(content)}</button>`;
    },
    pageContent: content => content,
  };

  /**
   * @param {import('lit').PropertyValues} changedProperties
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('current')) {
      this.dispatchEvent(new Event('current-changed'));
    }
  }

  /**
   * Calculate nav list based on current page selection.
   * @returns {(number|'...')[]}
   * @private
   */
  #calculateNavList() {
    const start = 1;
    const finish = this.count;
    // If there are more pages then we want to display we have to redo the list each time
    // Else we can just return the same list every time.
    if (this.count > this.visiblePages) {
      // Calculate left side of current page and right side
      const pos3 = this.current - 1;
      const pos4 = this.current;
      const pos5 = this.current + 1;
      //  if pos 3 is lower than 4 we have a predefined list of elements
      if (pos4 <= 4) {
        const list = /** @type {(number|'...')[]} */ (
          [...Array(this.visiblePages)].map((_, idx) => start + idx)
        );
        list.push('...');
        list.push(this.count);
        return list;
      }
      //  if we are close to the end of the list with the current page then we have again a predefined list
      if (finish - pos4 <= 3) {
        const list = /** @type {(number|'...')[]} */ ([]);
        list.push(1);
        list.push('...');
        const listRemaining = [...Array(this.visiblePages)].map(
          (_, idx) => this.count - this.visiblePages + 1 + idx,
        );
        return list.concat(listRemaining);
      }

      return [start, '...', pos3, pos4, pos5, '...', finish];
    }
    return [...Array(finish - start + 1)].map((_, idx) => start + idx);
  }

  // /**
  //  * Get previous or next button template.
  //  * This method can be overridden to apply customized template in wrapper.
  //  * @param {String} label namespace label i.e. next or previous
  //  * @returns {TemplateResult} icon template
  //  * @protected
  //  */
  // // eslint-disable-next-line class-methods-use-this
  // _prevNextIconTemplate(label) {
  //   return label === 'next' ? html` &gt; ` : html` &lt; `;
  // }

  // // /**
  // //  * Get next or previous button template.
  // //  * This method can be overridden to apply customized template in wrapper.
  // //  * @param {String} label namespace label i.e. next or previous
  // //  * @param {Number} pageNumber page number to be set
  // //  * @param {String} namespace namespace prefix for translations
  // //  * @returns {TemplateResult} nav item template
  // //  * @protected
  // //  */
  // // _prevNextButtonTemplate(label, pageNumber, namespace = 'lion') {
  // //   return html`
  // //     <li>
  // //       <button
  // //         aria-label=${this.msgLit(`${namespace}-pagination:${label}`)}
  // //         @click=${() => this.__fire(pageNumber)}
  // //       >
  // //         ${this._prevNextIconTemplate(label)}
  // //       </button>
  // //     </li>
  // //   `;
  // // }

  // /**
  //  * Get disabled button template.
  //  * This method can be overridden to apply customized template in wrapper.
  //  * @param {String} label namespace label i.e. next or previous
  //  * @returns {TemplateResult} nav item template
  //  * @protected
  //  */
  // _disabledButtonTemplate(label) {
  //   return html`
  //     <li>
  //       <button disabled>${this._prevNextIconTemplate(label)}</button>
  //     </li>
  //   `;
  // }

  // /**
  //  * Render navigation list
  //  * @returns {TemplateResult[]} nav list template
  //  * @protected
  //  */
  // _renderNavList() {
  //   return this.#calculateNavList().map(page =>
  //     page === '...'
  //       ? html` <li><span>${page}</span></li> `
  //       : html`
  //           <li>
  //             <button
  //               aria-label="${this.msgLit('lion-pagination:page', { page })}"
  //               aria-current=${page === this.current}
  //               aria-live="${page === this.current ? 'polite' : 'off'}"
  //               @click=${() => this.__fire(page)}
  //             >
  //               ${page}
  //             </button>
  //           </li>
  //         `,
  //   );
  // }

  // render() {
  //   return html`
  //     <nav role="navigation" aria-label="${this.msgLit('lion-pagination:label')}">
  //       <ul>
  //         ${this.current > 1
  //           ? this._prevNextButtonTemplate('previous', this.current - 1)
  //           : this._disabledButtonTemplate('previous')}
  //         ${this._renderNavList()}
  //         ${this.current < this.count
  //           ? this._prevNextButtonTemplate('next', this.current + 1)
  //           : this._disabledButtonTemplate('next')}
  //       </ul>
  //     </nav>
  //   `;
  // }
}

export class LionInputPagination extends UIPagination {
  type = 'password';

  static styles = [
    css`
      [data-part='root'] {
        flex-direction: column;
        display: flex;
        gap: 1rem;
      }

      [data-part='label'] {
        text-align: center;
        font-weight: bold;
      }

      [data-part='input'] {
        background-color: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(1.25rem);
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        outline: none;
        color: white;
        border: none;
        width: 12rem;
      }

      [data-part='input']::placeholder {
        color: rgba(255, 255, 255, 0.25);
        font-weight: bold;
      }
    `,
  ];

  static templates = {
    root(ctx) {
      const { part } = ctx;

      return html`
        <div ${part('root')}>
          <label ${part('label')}></label>
          <input ${part('input')} />
          <div ${part('feedback')} role="region"></div>
        </div>
      `;
    },
  };
}
customElements.define('lion-input-password', LionInputPassword);
/* box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); */
