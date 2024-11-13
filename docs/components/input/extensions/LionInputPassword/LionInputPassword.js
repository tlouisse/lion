import { LionInput } from '@lion/ui/input.js';
import { html, css } from 'lit';

import { UIBaseElementMixin } from '../shared/UIBaseElement.js';
import { UIPartDirective } from '../shared/UIPartDirective.js';
import {
  assertPresentation,
  assertTextbox,
  assertRegion,
  assertLabel,
} from '../shared/element-assertions.js';

// @ts-expect-error
export class UIInputPartDirective extends UIPartDirective {
  allowedParts = ['root', 'label', 'input', 'feedback'];

  setupFunctions = {
    root({ element }, { context, localContext }) {
      assertPresentation(element);
    },
    label({ element }, { context, localContext }) {
      assertLabel(element);

      // TODO: add a11y features (now still part of FormControlMixin)
    },
    input({ element }, { context, localContext }) {
      assertTextbox(element);

      // TODO: add a11y features (now still part of FormControlMixin)
    },
    feedback({ element }, { context, localContext }) {
      assertRegion(element);

      // TODO: add a11y features (now still part of FormControlMixin)
    },
  };
}

export class UIInput extends UIBaseElementMixin(LionInput) {
  static properties = {
    placeholder: { type: String },
  };

  get _labelNode() {
    return this.shadowRoot?.querySelector('[data-part="label"]');
  }

  get _inputNode() {
    return this.shadowRoot?.querySelector('[data-part="input"]') || super._inputNode;
  }

  get _feedbackNode() {
    return this.shadowRoot?.querySelector('[data-part="feedback"]');
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    // this._onChange = this._onChange.bind(this);
    this._inputNode.addEventListener('change', this._onChange);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('placeholder')) {
      this._inputNode.placeholder = this.placeholder;
    }
  }

  // #templates = /** @type {typeof LionInputPassword} */ (this.constructor).templates;

  // slots = [
  //   { name: 'label', template: this.#templates.label, host: this.#templates },
  //   { name: 'input', template: this.#templates.input, host: this.#templates },
  //   { name: 'feedback', template: this.#templates.feedback, host: this.#templates },
  // ];

  // get templateContext() {
  //   return {
  //     ...super.templateContext,
  //     labels: { l1Invoker: 'Main menu', levelBackBtn: 'Back' },
  //     // data: {
  //     //   label: this.label,
  //     //   helpText: this.helpText,
  //     // }
  //     fns: {
  //       /**
  //        * It's very common that components switch layouts based on screen size.
  //        * In this case, we want to stop current animations...
  //        * Call this method during initialization of a new layout.
  //        * @example
  //        * ```js
  //        * UIMainNav.provideDesign({
  //        *   // ...,
  //        *   layouts: () => ({
  //        *     myLayout: {
  //        *       // ...,
  //        *       templateContext: context => {
  //        *         const navData = {
  //        *           ...context.data.navData,
  //        *           // ...,
  //        *         };
  //        *         updateNavData(navData, { shouldReset: true });
  //        *         context.closeMenu({ shouldPreventAnimations: true });
  //        *         return {
  //        *           ...context,
  //        *           data: { ...context.data, navData },
  //        *         };
  //        *       },
  //        *     // ...,
  //        *    });
  //        *    // ...,
  //        * });
  //        * ```
  //        * @param {{shouldPreventAnimations: boolean}} options
  //        */
  //       closeMenu: ({ shouldPreventAnimations }) => {
  //         if (shouldPreventAnimations) {
  //           this.setAttribute('data-prevent-animations', '');
  //         }
  //         for (const ctrl of Array.from(this.__controllers || [])) {
  //           if (ctrl instanceof VisibilityToggleCtrl) {
  //             ctrl.hide();
  //           }
  //         }
  //         if (shouldPreventAnimations) {
  //           this.removeAttribute('data-prevent-animations');
  //         }
  //       },
  //       updateNavData: updateNavData,
  //     },
  //   };
  // }

  static _partDirective = UIInputPartDirective;

  static templates = {
    root(context) {
      const { part } = context;

      return html`
        <div ${part('root')}>
          <label ${part('label')}></label>
          <input ${part('input')} />
          <div ${part('feedback')} role="region"></div>
        </div>
      `;
    },
    // label() {
    //   return html` <label data-part="label"></label> `;
    // },
    // input() {
    //   return html` <input data-part="input" />`;
    // },
    // feedback() {
    //   return html` <div data-part="feedback"></div>`;
    // },
  };

  // render = uiBaseRender.bind(this);
}

export class LionInputPassword extends UIInput {
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
    root(context) {
      const { part } = context;

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
