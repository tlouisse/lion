import { html, LitElement, css } from 'lit';

import { UIBaseElementMixin } from '../shared/UIBaseElement.js';

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

const sonoma1080Mp4 = ''; // import.meta.resolve('./sonoma_wallpaper_1080.mp4');
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

  static styles = [
    css`
      :host {
        --space-1: 1.7vh;
        --space-2: calc(var(--space-1) * 2);
        --space-4: calc(var(--space-1) * 4);
        --space-8: calc(var(--space-1) * 8);
        --space-16: calc(var(--space-1) * 16);
      }

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
        height: 100%;
      }

      [data-part='layout'] {
        flex-direction: column;
        align-items: center;
        position: relative;
        margin-top: var(--space-8);
        display: flex;
        color: white;
        gap: var(--space-1);
      }

      [data-part='date-and-time'] {
        color: rgba(255, 255, 255, 0.7);
        /* backdrop-filter: blur(1.25rem); */
        flex-direction: column;
        margin-bottom: var(--space-16);
        align-items: center;
        font-weight: bold;
        display: flex;
      }

      [data-part='date'] {
        font-size: 1.5rem;
      }

      [data-part='time'] {
        font-size: var(--space-8);
        /* mix-blend-mode: difference; */
      }

      [data-part='login'] {
        flex-direction: column;
        align-items: center;
        max-width: 50vh;
        display: flex;
        gap: var(--space-1);
      }

      [data-part='disclaimer'] {
        flex-direction: column;
        align-items: center;
        margin-bottom: var(--space-2);
        text-align: center;
        display: flex;
      }

      [data-part='avatar'] {
        border-radius: 50%;
        height: var(--space-4);
        width: var(--space-4);
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
customElements.define('lion-login-screen', LionLoginScreen);
