import { html, css, LitElement } from '@lion/core';
import { getWeekdayNames, getMonthNames } from '@lion/localize';
import { LionCalendar } from '@lion/calendar';
import { LionButton } from '@lion/button';
import { LionInputDatepicker } from '../../src/LionInputDatepicker.js';
import { supportsAdoptingStyleSheets } from 'lit-element';

// We don't have access to our main index html, so let's add Roboto font like this
const linkNode = document.createElement('link');
linkNode.href = 'https://fonts.googleapis.com/css?family=Roboto:300,400,500';
linkNode.rel = 'stylesheet';
linkNode.type = 'text/css';
document.head.appendChild(linkNode);

customElements.define(
  'my-calendar',
  class extends LionCalendar {
    static get styles() {
      return [
        ...super.styles,
        css`
          #content {
            display: flex;
            max-width: 330px; /* set via js */
            overflow: hidden;
          }

          .calendar__header {
            border-bottom: none;

            display: flex;
            margin-top: 4px;
            align-items: center;
            justify-content: space-between;
          }

          .calendar__month-heading {
            color: rgba(0, 0, 0, 0.87);
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            letter-spacing: 0.00938em;
          }

          .calendar__weekday-header {
            color: rgba(0, 0, 0, 0.38);
            font-size: 0.75rem;
            line-height: 1.66;
            letter-spacing: 0.03333em;

            padding-bottom: 8px;
          }

          .calendar__day-button {
            border-radius: 50%;

            min-width: 36px;
            min-height: 36px;
          }

          .calendar__day-button:hover {
            border-color: transparent;
            background-color: #eee;
          }

          .calendar__day-button:focus {
            outline: none;
            background-color: lightgray;
          }

          .calendar__day-button[selected] {
            background: var(--color-primary, royalblue);
            color: white;
            border-radius: 50%;
          }

          .calendar__day-button[next-month],
          .calendar__day-button[previous-month] {
            display: none;
          }

          .calendar__prev-month-button,
          .calendar__next-month-button {
            color: rgba(0, 0, 0, 0.54);
          }

          .calendar__prev-month-button svg,
          .calendar__next-month-button svg {
            width: 24px;
          }
        `,
      ];
    }

    constructor() {
      super();
      this.firstDayOfWeek = 1; // Start on Mondays instead of Sundays
      this.weekdayHeaderNotation = 'narrow'; // 'T' instead of 'Thu'
    }

    // TODO: enable if swipeable/animated months need to be created
    // __createData() {
    //   return super.__createData({ futureMonths: 1, pastMonths: 1 });
    // }

    // TODO: align template names, allow Subclassers
    __renderData() {
      return html`
        <div id="content-wrapper">
          ${super.__renderData()}
        </div>
      `;
    }

    // TODO: abstract away a11y and behavior in parent. Align names
    __renderPreviousButton() {
      return html`
        <my-button
          class="calendar__prev-month-button"
          aria-label=${this.msgLit('lion-calendar:previousMonth')}
          title=${this.msgLit('lion-calendar:previousMonth')}
          @click=${this.goToPreviousMonth}
          ?disabled=${this._previousMonthDisabled}
        >
          <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path>
            <path fill="none" d="M0 0h24v24H0V0z"></path>
          </svg>
        </my-button>
      `;
    }

    __renderNextButton() {
      return html`
        <my-button
          class="calendar__next-month-button"
          aria-label=${this.msgLit('lion-calendar:nextMonth')}
          title=${this.msgLit('lion-calendar:nextMonth')}
          @click=${this.goToNextMonth}
          ?disabled=${this._nextMonthDisabled}
        >
          <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
            <path fill="none" d="M0 0h24v24H0V0z"></path>
          </svg>
        </my-button>
      `;
    }
  },
);

customElements.define(
  'my-button',
  class extends LionButton {
    static get styles() {
      return [
        ...super.styles,
        css`
          .btn {
            font-family: Roboto, sans-serif;
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
            font-size: 0.875rem;
            line-height: 2.25rem;
            font-weight: 500;
            letter-spacing: 0.0892857143em;
            text-decoration: none;
            text-transform: uppercase;

            border: transparent;
            border-radius: 0;
            background: none;

            color: var(--color-primary);
          }

          :host(:focus) .btn,
          :host(:hover) .btn {
            background-color: rgba(33, 150, 243, 0.08);
            color: var(--color-primary);
          }

          :host(:focus) .btn {
            outline: none;
            border-color: transparent;
            box-shadow: none;
          }

          :host(:active) .btn {
            background-color: rgba(33, 150, 243, 0.16);
          }
        `,
      ];
    }

    __clickDelegationHandler() {
      this.$$slot('_button').click();
    }
  },
);

customElements.define(
  'my-calendar-overlay-frame',
  class extends LitElement {
    static get properties() {
      return {
        headingParts: { type: Object },
      };
    }

    static get styles() {
      return [
        css`
          :host {
            display: inline-block;
            background: white;
            position: relative;

            border-radius: 4px;
            box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14),
              0px 9px 46px 8px rgba(0, 0, 0, 0.12);
          }

          .c-calendar-overlay__header {
            display: flex;
            background: var(--color-primary, royalblue);
            color: white;
          }

          .c-calendar-overlay__heading {
            padding: 0 24px;

            font-size: 2.125rem;
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
            font-weight: 400;
            line-height: 1.17;
            letter-spacing: 0.00735em;

            height: 100px;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            justify-content: center;
          }

          .c-calendar-overlay__heading > .c-calendar-overlay__close-button {
            flex: none;
          }

          .c-calendar-overlay__heading__year {
            color: rgba(255, 255, 255, 0.54);

            font-size: 1rem;
            line-height: 1.75;
            letter-spacing: 0.00938em;
          }

          .c-calendar-overlay__close-button {
            min-width: 40px;
            min-height: 32px;
            border-width: 0;
            padding: 0;
            font-size: 24px;
          }

          .c-calendar-overlay__footer {
            display: flex;
            padding: var(--spacer, 8px);
            justify-content: flex-end;
          }

          .c-calendar-overlay__footer > *:not(:last-child) {
            margin-right: var(--spacer, 8px);
          }

          .c-calendar-overlay__body {
            display: flex;
            flex-direction: column;
          }

          @media only screen and (min-width: 640px) {
            .c-calendar-overlay {
              flex-direction: row;
              display: flex;
            }

            .c-calendar-overlay__header {
              width: 160px;
              padding-top: 8px;
            }

            .c-calendar-overlay__heading {
              height: auto;
            }
          }
        `,
      ];
    }

    firstUpdated(...args) {
      super.firstUpdated(...args);
      // Delegate actions to extension of LionInputDatepicker.
      // In InputDatepicker, interaction with Calendar is provided
      this.shadowRoot.addEventListener('click', ({ target }) => {
        if (['set-button', 'cancel-button', 'clear-button'].includes(target.id)) {
          const action = target.id.split('-')[0];
          this.dispatchEvent(new CustomEvent('delegate-action', { detail: { action } }));
        }
      });
    }

    render() {
      // eslint-disable-line class-methods-use-this
      return html`
        <div class="c-calendar-overlay">
          <div class="c-calendar-overlay__header">
            <div role="region">
              <div
                id="overlay-heading"
                role="heading"
                aria-level="1"
                class="c-calendar-overlay__heading"
              >
                <span class="c-calendar-overlay__heading__year">${this.headingParts.year}</span>
                <div class="c-calendar-overlay__heading__date">
                  <span class="c-calendar-overlay__heading__dayname">
                    ${this.headingParts.dayName},
                  </span>
                  <span class="c-calendar-overlay__heading__day"
                    >${this.headingParts.dayWeekNumber}</span
                  >
                  <span class="c-calendar-overlay__heading__monthname"
                    >${this.headingParts.monthName}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="c-calendar-overlay__body">
            <slot></slot>

            <div class="c-calendar-overlay__footer">
              <my-button id="clear-button" class="c-calendar-overlay__clear-button">
                Clear
              </my-button>
              <my-button id="cancel-button" class="c-calendar-overlay__cancel-button">
                Cancel
              </my-button>
              <my-button id="set-button" class="c-calendar-overlay__set-button">
                Set
              </my-button>
            </div>
          </div>
        </div>
      `;
    }
  },
);

customElements.define(
  'my-input-datepicker',
  class extends LionInputDatepicker {
    constructor() {
      super();
      // Config options for subclassers
      this._calendarInvokerSlot = 'prefix';
      this._focusCentralDateOnCalendarOpen = false;
      this._hideOnUserSelect = false;
      this._syncOnUserSelect = false;

      this.__myDelegateOverlayAction = this.__myDelegateOverlayAction.bind(this);
    }

    /** @override */
    _invokerTemplate() {
      return html`
        <my-button>
          <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"
            ></path>
            <path d="M0 0h24v24H0z" fill="none"></path>
          </svg>
        </my-button>
      `;
    }

    /** @override */
    _calendarTemplate() {
      return html`
        <my-calendar id="calendar"></my-calendar>
      `;
    }

    /** @override */
    // TODO: if globalOverlay would support shadow dom, this would be more straightforward,
    // a.k.a. not require an extra web component
    _calendarOverlayTemplate() {
      return html`
        <my-calendar-overlay-frame id="calendar-overlay">
          <span slot="heading">${this.calendarHeading}</span>
          ${this.__calendarConfig(this._calendarTemplate())}
        </my-calendar-overlay-frame>
      `;
    }

    /** @override */
    _onCalendarOverlayOpened() {
      super._onCalendarOverlayOpened();
      this._calendarOverlayElement.addEventListener(
        'delegate-action',
        this.__myDelegateOverlayAction,
      );
      // TODO: Change events to one 'central-date-changed' once exposed
      this._calendarElement.addEventListener('click', this.__myFormatHeading.bind(this));
      this._calendarElement.addEventListener('keydown', this.__myFormatHeading.bind(this));
      this.__myFormatHeading();
    }

    // TODO: add this lifecycle hook in LionInputDatepicker
    /** @override */
    _getOverlayConfig() {
      // TODO: add hidesOnOutsideClick support to GlobalOverlay, possibly restrict for modals
      return { ...super._getOverlayConfig(), ...{ hidesOnOutsideClick: true } };
    }

    __myFormatHeading() {
      // TODO: needs to run on 'central-date-changed': fire this event in LionCalendar
      const d = this._calendarElement.centralDate;
      const locale = this._calendarElement.__getLocale();
      const { firstDayOfWeek } = this._calendarElement;
      this._calendarOverlayElement.headingParts = {
        monthName: getMonthNames({ locale, style: 'short' })[d.getMonth()],
        dayName: getWeekdayNames({ locale, style: 'short', firstDayOfWeek })[d.getDay()],
        dayWeekNumber: d.getDate(),
        year: d.getFullYear(),
      };
    }

    __myDelegateOverlayAction({ detail: { action } }) {
      switch (action) {
        case 'set':
          this._calendarElement.selectedDate = this._calendarElement.centralDate;
          this.modelValue = this._calendarElement.selectedDate;
          break;
        case 'clear':
          this._calendarElement.selectedDate = undefined;
          this.modelValue = undefined;
          break;
        case 'cancel':
          this._overlayCtrl.hide();
          break;
        default:
      }
    }
  },
);
