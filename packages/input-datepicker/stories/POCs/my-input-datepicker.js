import { html, css, LitElement } from '@lion/core';
import { getWeekdayNames, getMonthNames } from '@lion/localize';
import { LionCalendar } from '@lion/calendar';
import { LionButton } from '@lion/button';
import { LionInputDatepicker } from '../../src/LionInputDatepicker.js';


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
      `];
    }

    constructor() {
      super();
      this.firstDayOfWeek = 1; // Start on Mondays instead of Sundays
      this.weekdayHeaderNotation = 'narrow'; // 'T' instead of 'Thu'
      // this.__futureMonths = 1;
      // this.__pastMonths = 1;

    }

    // __createData() {
    //   return super.__createData({ futureMonths: this.__futureMonths, pastMonths: this.__pastMonths });
    // }

    // TODO: align template names, allow Subclassers
    __renderData() {
      return html`
        <div id="content-wrapper">
          ${super.__renderData()}
        </div>`;
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
          :host {
          }

          .btn {
            font-family: Roboto,sans-serif;
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
            font-size: .875rem;
            line-height: 2.25rem;
            font-weight: 500;
            letter-spacing: .0892857143em;
            text-decoration: none;
            text-transform: uppercase;

            border: transparent;
            border-radius: 0;
            background: none;
          }

          :host(:hover) .btn {
            background: lightgrey;
          }

        `];
    }

    __clickDelegationHandler() {
      this.$$slot('_button').click();
    }
  }
);

customElements.define(
  'my-calendar-overlay-frame',
  class extends LitElement {
    static get properties() {
      return {
        headingParts: { type: Object }
      }
    }

    static get styles() {
      return [
        css`
          :host {
            display: inline-block;
            background: white;
            position: relative;
          }

          @media only screen and (min-width: 640px) {
            .c-calendar-overlay {
              flex-direction: row;
              display: flex
            }
            
            .c-calendar-overlay__header {
              width: 160px;
            }
          }

          .c-calendar-overlay__header {
            display: flex;
          }

          .c-calendar-overlay__heading {
            padding: 16px 16px 8px;
            flex: 1;
          }

          .c-calendar-overlay__heading > .c-calendar-overlay__close-button {
            flex: none;
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
          }

          .c-calendar-overlay__footer > *:not(:last-child) {
            margin-right: var(--spacer, 8px);
          }

          .c-calendar-overlay__body {
            display: flex;
            flex-direction: column;
          }
      `];
    }

    firstUpdated(...args) {
      super.firstUpdated(...args);
      // Delegate actions to extension of LionInputDatepicker.
      // In InputDatepicker, interaction with Calendar is provided
      this.shadowRoot.addEventListener('click', ({ target }) => {
        if(['set-button', 'cancel-button', 'clear-button'].includes(target.id)) {
          this.dispatchEvent(new CustomEvent('delegate-action', { 
            detail: { action: target.id.split('-')[0] },
          }));
        }
      });
    }

    render() {
      // eslint-disable-line class-methods-use-this
      return html`
        <div class="c-calendar-overlay">
          <div class="c-calendar-overlay__header">
            <div role="region">
              <div id="overlay-heading" role="heading" aria-level="1" class="c-calendar-overlay__heading">
                <span class="c-calendar-overlay__heading__year">${this.headingParts.year}</span>
                <div class="c-calendar-overlay__heading__date">
                  <strong class="c-calendar-overlay__heading__dayname">
                    ${this.headingParts.dayName}, 
                  </strong> 
                  <strong class="c-calendar-overlay__heading__day">${this.headingParts.dayWeekNumber}</strong>
                  <strong class="c-calendar-overlay__heading__monthname">${this.headingParts.monthName}</strong> 
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
      this._calendarInvokerSlot = 'prefix';
      this.__mdDelegateOverlayAction = this.__mdDelegateOverlayAction.bind(this);
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
      // Optional to call super here. By default it focuses first date.
      // super._onCalendarOverlayOpened();
      this._calendarOverlayElement.addEventListener('delegate-action', this.__mdDelegateOverlayAction);
      // TODO: Change events to one 'central-date-changed' once exposed
      this._calendarElement.addEventListener('click', this.__mdFormatHeading.bind(this));
      this._calendarElement.addEventListener('keydown', this.__mdFormatHeading.bind(this));
      this.__mdFormatHeading();
    }

    /** @override */
    _onCalendarUserSelectedChanged() {
      // Ovveride, so it doesn't: 
      // - close calendar on selection 
      // - synchronize new selectedDate value to input
    }

    // TODO: add this lifecycle hook in LionInputDatepicker
    /** @override */
    _getOverlayConfig() {
      // TODO: add hidesOnOutsideClick support to GlobalOverlay, possibly restrict for modals
      return { ...super._getOverlayConfig(), ...{ hidesOnOutsideClick: true } };
    }

    __mdFormatHeading() {
      // TODO: needs to run on 'central-date-changed': fire this event in LionCalendar
      const d = this._calendarElement.centralDate;
      const locale = this._calendarElement.__getLocale();
      const { firstDayOfWeek } = this._calendarElement;
      this._calendarOverlayElement.headingParts = {
        monthName: getMonthNames({ locale, style: 'short' })[d.getMonth()],
        dayName: getWeekdayNames({ locale, style: 'short', firstDayOfWeek })[d.getDay()],
        dayWeekNumber: d.getDate(),
        year: d.getFullYear(),
      }
    }

    __mdDelegateOverlayAction({ detail: { action } }) {
      switch (action) {
        case 'set':
          // Set selectedDate, synchronization to modelValue will be done by InputDatepicker
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
