/* eslint-disable no-underscore-dangle */
import { html, css, LitElement, DomHelpersMixin } from '@lion/core';
import { LocalizeMixin, localize } from '@lion/localize';

// Needs to be a web component (we bneed a sahdow root to not leak styles in a global overlay)
// that should be placed in the overlay invoked by LionInputDatepicker.
// Note this is a private web component, not intended to be exported on its own.
export class LionCalendarOverlayFrame extends LocalizeMixin(DomHelpersMixin(LitElement)) {
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

  static get localizeNamespaces() {
    return [
      {
        /* FIXME: This awful switch statement is used to make sure it works with polymer build.. */
        'lion-calendar-overlay-frame': locale => {
          switch (locale) {
            case 'bg-BG':
              return import('@lion/overlays/translations/bg-BG.js');
            case 'bg':
              return import('@lion/overlays/translations/bg.js');
            case 'cs-CZ':
              return import('@lion/overlays/translations/cs-CZ.js');
            case 'cs':
              return import('@lion/overlays/translations/cs.js');
            case 'de-DE':
              return import('@lion/overlays/translations/de-DE.js');
            case 'de':
              return import('@lion/overlays/translations/de.js');
            case 'en-AU':
              return import('@lion/overlays/translations/en-AU.js');
            case 'en-GB':
              return import('@lion/overlays/translations/en-GB.js');
            case 'en-US':
              return import('@lion/overlays/translations/en-US.js');
            case 'en':
              return import('@lion/overlays/translations/en.js');
            case 'es-ES':
              return import('@lion/overlays/translations/es-ES.js');
            case 'es':
              return import('@lion/overlays/translations/es.js');
            case 'fr-FR':
              return import('@lion/overlays/translations/fr-FR.js');
            case 'fr-BE':
              return import('@lion/overlays/translations/fr-BE.js');
            case 'fr':
              return import('@lion/overlays/translations/fr.js');
            case 'hu-HU':
              return import('@lion/overlays/translations/hu-HU.js');
            case 'hu':
              return import('@lion/overlays/translations/hu.js');
            case 'it-IT':
              return import('@lion/overlays/translations/it-IT.js');
            case 'it':
              return import('@lion/overlays/translations/it.js');
            case 'nl-BE':
              return import('@lion/overlays/translations/nl-BE.js');
            case 'nl-NL':
              return import('@lion/overlays/translations/nl-NL.js');
            case 'nl':
              return import('@lion/overlays/translations/nl.js');
            case 'pl-PL':
              return import('@lion/overlays/translations/pl-PL.js');
            case 'pl':
              return import('@lion/overlays/translations/pl.js');
            case 'ro-RO':
              return import('@lion/overlays/translations/ro-RO.js');
            case 'ro':
              return import('@lion/overlays/translations/ro.js');
            case 'ru-RU':
              return import('@lion/overlays/translations/ru-RU.js');
            case 'ru':
              return import('@lion/overlays/translations/ru.js');
            case 'sk-SK':
              return import('@lion/overlays/translations/sk-SK.js');
            case 'sk':
              return import('@lion/overlays/translations/sk.js');
            case 'uk-UA':
              return import('@lion/overlays/translations/uk-UA.js');
            case 'uk':
              return import('@lion/overlays/translations/uk.js');
            default:
              throw new Error(`Unknown locale: ${locale}`);
          }
        },
      },
      ...super.localizeNamespaces,
    ];
  }

  firstUpdated() {
    super.firstUpdated();
    // For extending purposes: separate logic from template structure/style (only keep ids as ref)
    this.$id('close-button').addEventListener('click', this.__dispatchCloseEvent.bind(this));
    this.localizeNamespacesLoaded.then(() => {
      this.$id('close-button').setAttribute(
        'title',
        localize.msg('lion-calendar-overlay-frame:close'),
      );
      this.$id('close-button').setAttribute(
        'aria-label',
        localize.msg('lion-calendar-overlay-frame:close'),
      );
    });
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
