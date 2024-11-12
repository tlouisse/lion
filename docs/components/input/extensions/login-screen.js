import { LionInput } from '@lion/ui/input.js';
import { html, LitElement, css } from 'lit';

import { UIPartDirective } from './shared/UIPartDirective.js';
import {
  assertPresentation,
  assertTextbox,
  assertRegion,
  assertLabel,
} from './shared/element-assertions.js';

import { UIBaseElementMixin, uiBaseRender } from './shared/UIBaseElement.js';
// import { LightRenderMixin } from './shared/LightRenderMixin.js';

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
        color: rgba(255, 255, 255, 0.75);
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

// @ts-expect-error
const sonoma1080Mp4 = import.meta.resolve('./sonoma_wallpaper_1080.mp4');
// @ts-expect-error
const avatarImg = import.meta.resolve('./avatar.png');

export class LoginScreen extends UIBaseElementMixin(LitElement) {
  static properties = {
    formattedTime: { type: String, state: true },
    formattedDate: { type: String, state: true },
  };

  #formatTime(date = new Date()) {
    return html`<span>${date.getHours()}</span><span>:</span><span>${date.getMinutes()}</span>`;
  }

  #formatDate(date = new Date()) {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'full',
    }).format(date);
    const [weekDayName, monthDayNumber, monthName] = formatted.split(' ');
    return `${weekDayName}, ${monthDayNumber} ${monthName}`;
  }

  #computeFormattedDates() {
    this.formattedTime = this.#formatTime();
    this.formattedDate = this.#formatDate();
  }

  constructor() {
    super();

    this.#computeFormattedDates();

    setTimeout(() => {
      this.#computeFormattedDates();
    }, 1000 * 60);
  }

  static styles = [
    css`
      [data-part='root'] {
        font-family: Arial, Helvetica, sans-serif;
        position: fixed;
        gap: 1rem;
        inset: 0;
      }

      [data-part='background'] {
        /* pull us out of the page flow, so that the container is painted on top */
        position: absolute;
      }

      [data-part='video'] {
        width: 100%;
      }

      [data-part='layout'] {
        flex-direction: column;
        align-items: center;
        position: relative;
        display: flex;
        color: white;
        gap: 1rem;
      }

      [data-part='date-and-time'] {
        color: rgba(255, 255, 255, 0.7);
        /* backdrop-filter: blur(1.25rem); */
        flex-direction: column;
        align-items: center;
        font-weight: bold;
        display: flex;
      }

      [data-part='date'] {
        font-size: 1.5rem;
      }

      [data-part='time'] {
        font-size: 8rem;
        mix-blend-mode: difference;
      }

      [data-part='login'] {
        flex-direction: column;
        align-items: center;
        display: flex;
        gap: 1rem;
        max-width: 50vh;
      }

      [data-part='disclaimer'] {
        flex-direction: column;
        align-items: center;
        display: flex;
      }

      [data-part='avatar'] {
        border-radius: 50%;
        height: 5rem;
        width: 5rem;
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
        formattedTime: this.formattedTime,
        formattedDate: this.formattedDate,
      },
      labels: {
        disclaimer: `Access only to persons authorised by ING Group. Regulations for use of ING assets
                described in the General Code of Conduct. Users of this system consent to
                monitoring. Evidence of criminal activity may be provided to law enforcement
                officials.`,
      },
    };
  }

  static templates = {
    root(context) {
      const { templates, data, fns, part, labels } = context;

      return html` <div data-part="root">
        <div data-part="background">
          <video autoplay loop data-part="video">
            <source src="${sonoma1080Mp4}" type="video/mp4" />
          </video>
        </div>

        <div data-part="layout">
            <div data-part="date-and-time">
              <div data-part="date">${data.formattedDate}</div>
              <div data-part="time">${data.formattedTime}</div>
            </div>
            <div data-part="login">
              <div data-part="disclaimer">
                ${labels.disclaimer}
              </div>
              <img data-part="avatar" alt="avatar" src="${avatarImg}" />
              <lion-input-password
                placeholder="Enter Password"
                label="Louisse, T (Thijs)"
              ></lion-input-password>
            </div>
          </div>
        </div>
      </div>`;
    },
  };

  // render() {
  //   const { templates } = /** @type {typeof LogInPut } */ (this.constructor);
  //   return templates.root({ templates });
  // }

  // render = uiBaseRender.bind(this);
}
customElements.define('login-screen', LoginScreen);
