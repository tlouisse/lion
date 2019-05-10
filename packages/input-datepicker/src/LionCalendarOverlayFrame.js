/* eslint-disable no-underscore-dangle */
import { html, css, LitElement, DomHelpersMixin } from '@lion/core';
import '../../calendar/lion-calendar.js';

// Needs to be a web component (we bneed a sahdow root to not leak styles in a global overlay)
// that should be placed in the overlay invoked by LionInputDatepicker.
// Note this is a private web component, not intended to be exported on its own.
export class LionCalendarOverlayFrame extends DomHelpersMixin(LitElement) {
  static get styles() {
    return [
      css`
        :host {
          display: inline-block;
          background: white;
          position: relative;
        }

        .calendar-overlay__header {
          display: flex;
        }

        .calendar-overlay__heading {
          padding: 16px 16px 8px;
          flex: 1;
        }

        .calendar-overlay__heading > .calendar-overlay__close-button {
          flex: none;
        }

        .calendar-overlay__close-button {
          min-width: 40px;
          min-height: 32px;
          border-width: 0;
          padding: 0;
          font-size: 24px;
        }
      `,
    ];
  }

  firstUpdated() {
    super.firstUpdated();
    // For extending purposes: separate logic from template structure/style (only keep ids as ref)
    this.$id('close-button').setAttribute('aria-label', 'Close overlay'); // TODO: translate
    this.$id('close-button').addEventListener('click', this.__dispatchCloseEvent.bind(this));
  }

  __dispatchCloseEvent() {
    // Designed to work in conjunction with ModalDialogController
    this.dispatchEvent(new CustomEvent('dialog-close'), { bubbles: true, composed: true });
  }

  render() {
    // eslint-disable-line class-methods-use-this
    return html`
      <div class="calendar-overlay">
        <div class="calendar-overlay__header">
          <div id="overlay-heading" role="heading" aria-level="1" class="calendar-overlay__heading">
            <slot name="heading"></slot>
          </div>
          <button id="close-button" class="calendar-overlay__close-button">
            <slot name="close-icon">&times;</slot>
          </button>
        </div>
        <slot></slot>
      </div>
    `;
  }
}
