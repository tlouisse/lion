import { html, LitElement, css, nothing } from 'lit';

import { UIBaseElementMixin } from '../shared/UIBaseElement.js';
import { UIPartDirective } from '../shared/UIPartDirective.js';
import { assertPresentation, assertRegion } from '../shared/element-assertions.js';

/**
 * @param {HTMLElement} el
 */
function assertLionInputPassword(el) {
  if (!(el.tagName === 'LION-INPUT-PASSWORD')) {
    // TODO: instanceof check
    throw new Error('Please apply to LionInputPassword');
  }
}

// @ts-expect-error
export class LionLoginScreenPartDirective extends UIPartDirective {
  allowedParts = ['root', 'background', 'layout', 'date-and-time', 'login', 'input-password'];

  setupFunctions = {
    root: ({ element }) => {
      assertPresentation(element);
    },
    background: ({ element }) => {
      assertPresentation(element);
    },
    layout: ({ element }) => {
      assertPresentation(element);
    },
    'date-and-time': ({ element }) => {
      assertRegion(element);
    },
    login: ({ element }) => {
      assertPresentation(element);
    },
    'input-password': ({ element }) => {
      assertLionInputPassword(element);
    },
  };
}

/**
 *
 * @param {number|string} numberOrStr
 * @param {number} desiredLength
 * @returns {string}
 */
function padWithZeros(numberOrStr, desiredLength = 2) {
  const str = `${numberOrStr}`;
  const diff = desiredLength - str.length;
  if (diff > 0) {
    return '0'.repeat(diff) + str;
  }
  return str;
}

const avatarImg = ''; // import.meta.resolve('./avatar.png');

export class LionLoginScreen extends UIBaseElementMixin(LitElement) {
  static properties = {
    formattedTime: { type: String, state: true },
    formattedDate: { type: String, state: true },
  };

  /**
   * @param {Date} date
   */
  #formatTime(date = new Date()) {
    return html`<span>${padWithZeros(date.getHours())}</span><span>:</span
      ><span>${padWithZeros(date.getMinutes())}</span>`;
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

  /**
   * Compensate for the fact that [autoplay] does not work with async dom
   */
  #ensureVideoAutoPlay() {
    const autoplayVideoEl = /** @type {HTMLVideoElement|null} */ (
      this.shadowRoot?.querySelector('video[autoplay]')
    );
    if (!autoplayVideoEl) return;

    autoplayVideoEl.muted = true;
    autoplayVideoEl.play();
  }

  /**
   * @param {import("lit").PropertyValueMap<any> | Map<PropertyKey, unknown>} changedProperties
   */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    this.#ensureVideoAutoPlay();
  }

  static styles = [
    css`
      [data-part='root'] {
        position: fixed;
        gap: 1rem;
        inset: 0;
      }

      [data-part='background'] {
        /* pull us out of the page flow, so that the container is painted on top */
        position: absolute;
        inset: 0;
      }

      [data-part='background-asset'] {
        object-fit: cover;
        height: 100%;
        width: 100%;
      }

      [data-part='layout'] {
        flex-direction: column;
        align-items: center;
        position: relative;
        display: flex;
      }

      [data-part='date-and-time'] {
        flex-direction: column;
        align-items: center;
        font-weight: bold;
        display: flex;
      }

      [data-part='date'] {
        font-size: 1.5rem;
      }

      [data-part='time'] {
      }

      [data-part='login'] {
        flex-direction: column;
        align-items: center;
        max-width: 50vh;
        display: flex;
      }

      [data-part='disclaimer'] {
        display: flex;
      }

      [data-part='avatar'] {
        border-radius: 50%;
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
        loginName: 'Louisse, T (Thijs)',
        loginPlaceholder: 'Enter Password',
      },
    };
  }

  static _partDirective = LionLoginScreenPartDirective;

  static templates = {
    root(context) {
      const { templates, data, part, labels } = context;

      return html` <!-- -->
        <div ${part('root')}>
          <div ${part('background')}>${templates.backgroundAsset(context)}</div>

          <div ${part('layout')}>
            <div ${part('date-and-time')} role="region">
              <div data-part="date">${data.formattedDate}</div>
              <div data-part="time">${data.formattedTime}</div>
            </div>
            <div ${part('login')}>
              <div data-part="disclaimer">${labels.disclaimer}</div>

              ${templates.avatarAsset(context)}

              <lion-input-password
                ${part('input-password')}
                placeholder="${labels.loginPlaceholder}"
                label="${labels.loginName}"
              ></lion-input-password>
            </div>
          </div>
        </div>`;
    },
    backgroundAsset() {
      // This is usually a decorative background image. It can also be a video
      return nothing;
    },
    avatarAsset() {
      // This is usually a decorative background image. It can also be a video
      return html`<img data-part="avatar" alt="avatar" src="${avatarImg}" />`;
    },
  };
}
customElements.define('lion-login-screen', LionLoginScreen);
