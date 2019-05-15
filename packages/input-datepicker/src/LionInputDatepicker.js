/* eslint-disable no-underscore-dangle */
import { html, render } from '@lion/core';
import { LionInputDate } from '@lion/input-date';
import { overlays, ModalDialogController } from '@lion/overlays';
import { Unparseable } from '@lion/validate';
import { localize } from '@lion/localize';
import '@lion/calendar/lion-calendar.js';
import './lion-calendar-overlay-frame.js';

/**
 * Simple util that converts TemplateResult into a node. Useful when (private/protected) logic
 * needs to be abstracted away from html/css. Also useful when node references are needed before
 * the element has been connected to the DOM by LitElement.
 * @param {TemplateResult} templateResult - lit-html template result
 * @returns {Element} the firstElementChild of the rendered node
 */
function renderAndGetFirstChild(templateResult) {
  const renderParent = document.createElement('div');
  render(templateResult, renderParent);
  return renderParent.firstElementChild;
}

/**
 * @customElement
 * @extends {LionInputDate}
 */
export class LionInputDatepicker extends LionInputDate {
  static get properties() {
    return {
      ...super.properties,
      /**
       * The heading to be added on top of the calendar overlay.
       * Naming chosen from an Application Developer perspective.
       * For a Subclasser 'calendarOverlayHeading' would be more appropriate
       */
      calendarHeading: {
        type: String,
        attribute: 'calendar-heading',
      },
      /**
       * The slot to put the invoker button in. Can be 'prefix', 'suffix', 'before' and 'after'.
       * Default will be 'suffix'.
       */
      _calendarInvokerSlot: {
        type: String,
      },

      /**
       * TODO: [delegation of disabled] move this to LionField (or FormControl) level
       */
      disabled: {
        type: Boolean,
      },
    };
  }

  get slots() {
    return {
      ...super.slots,
      [this._calendarInvokerSlot]: () => this.__createPickerAndReturnInvokerNode(),
    };
  }

  static get localizeNamespaces() {
    return [
      {
        /* FIXME: This awful switch statement is used to make sure it works with polymer build.. */
        'lion-input-datepicker': locale => {
          switch (locale) {
            case 'bg-BG':
              return import('../translations/bg-BG.js');
            case 'bg':
              return import('../translations/bg.js');
            case 'cs-CZ':
              return import('../translations/cs-CZ.js');
            case 'cs':
              return import('../translations/cs.js');
            case 'de-DE':
              return import('../translations/de-DE.js');
            case 'de':
              return import('../translations/de.js');
            case 'en-AU':
              return import('../translations/en-AU.js');
            case 'en-GB':
              return import('../translations/en-GB.js');
            case 'en-US':
              return import('../translations/en-US.js');
            case 'en':
              return import('../translations/en.js');
            case 'es-ES':
              return import('../translations/es-ES.js');
            case 'es':
              return import('../translations/es.js');
            case 'fr-FR':
              return import('../translations/fr-FR.js');
            case 'fr-BE':
              return import('../translations/fr-BE.js');
            case 'fr':
              return import('../translations/fr.js');
            case 'hu-HU':
              return import('../translations/hu-HU.js');
            case 'hu':
              return import('../translations/hu.js');
            case 'it-IT':
              return import('../translations/it-IT.js');
            case 'it':
              return import('../translations/it.js');
            case 'nl-BE':
              return import('../translations/nl-BE.js');
            case 'nl-NL':
              return import('../translations/nl-NL.js');
            case 'nl':
              return import('../translations/nl.js');
            case 'pl-PL':
              return import('../translations/pl-PL.js');
            case 'pl':
              return import('../translations/pl.js');
            case 'ro-RO':
              return import('../translations/ro-RO.js');
            case 'ro':
              return import('../translations/ro.js');
            case 'ru-RU':
              return import('../translations/ru-RU.js');
            case 'ru':
              return import('../translations/ru.js');
            case 'sk-SK':
              return import('../translations/sk-SK.js');
            case 'sk':
              return import('../translations/sk.js');
            case 'uk-UA':
              return import('../translations/uk-UA.js');
            case 'uk':
              return import('../translations/uk.js');
            default:
              throw new Error(`Unknown locale: ${locale}`);
          }
        },
      },
      ...super.localizeNamespaces,
    ];
  }

  /**
   * Element references, available for Subclassers.
   *
   * They refer part of the templates where logic should be added:
   * - event listeners
   * - accessibility roles/labels/attributes (etc...)
   * - configurations of (Custom) Elements
   *
   * This allows for a separation of concerns between style and functionality.
   * Functionality should be delivered by the Lion layer. Since it's mostly contained in private
   * methods, the subclassers should not be bothered with it.
   * An imperative approach (instead of via lit-html template) for handling functionality, will
   * make templates created by subclassers readable, easy to maintain and most important, future
   * proof (they will only contain styling, markup and functional references(ids)).
   * On top of that they benefit from bug fixes and features without having to update their
   * templates.
   */

  get _invokerElement() {
    return this.querySelector(`#${this.__invokerId}`);
  }

  get _calendarOverlayElement() {
    return this._overlayCtrl._container.firstElementChild;
  }

  get _calendarElement() {
    return this._calendarOverlayElement.querySelector('#calendar');
  }

  constructor() {
    super();
    // Create a unique id for the invoker, since it is placed in light dom for a11y.
    this.__invokerId = `${this.localName}-${Math.random()
      .toString(36)
      .substr(2, 10)}`;
    this._calendarInvokerSlot = 'suffix';

    // Configuration flags for subclassers
    this._focusCentralDateOnCalendarOpen = true;
    this._hideOnUserSelect = true;
    this._syncOnUserSelect = true;

    /**
     * 'Virtual' synchronization object for pending updates (that can only be set when the
     * calendar is opened and thus rendered to the dom).
     * This object is synced in __calendarConfig(), right after dom has been created by
     * lit-html.
     */
    this.__virtualCalendar = {};
    this.__openCalendarOverlay = this.__openCalendarOverlay.bind(this);
    this._onCalendarUserSelectedChanged = this._onCalendarUserSelectedChanged.bind(this);
  }

  /**
   * Problem: we need to create a getter for disabled that puts disabled attrs on the invoker
   * button.
   * The DelegateMixin creates getters and setters regardless of what's defined on the prototype,
   * thats why we need to move it out from parent delegations config, in order to make our own
   * getters and setters work.
   *
   * TODO: [delegation of disabled] fix this on a global level:
   * - LionField
   *  - move all delegations of attrs and props to static get props for docs
   * - DelegateMixin needs to be refactored, so that it:
   *   - gets config from static get properties
   *   - hooks into _requestUpdate
   */
  get delegations() {
    return {
      ...super.delegations,
      properties: super.delegations.properties.filter(p => p !== 'disabled'),
      attributes: super.delegations.attributes.filter(p => p !== 'disabled'),
    };
  }

  /**
   * TODO: [delegation of disabled] move this to LionField (or FormControl) level
   */
  _requestUpdate(name, oldValue) {
    super._requestUpdate(name, oldValue);
    if (name === 'disabled') {
      this.__delegateDisabled();
    }
  }

  /**
   * TODO: [delegation of disabled] move this to LionField (or FormControl) level
   */
  __delegateDisabled() {
    if (this.delegations.target()) {
      this.delegations.target().disabled = this.disabled;
    }
    if (this._invokerElement) {
      this._invokerElement.disabled = this.disabled;
    }
  }

  /**
   * TODO: [delegation of disabled] move this to LionField (or FormControl) level
   */
  firstUpdated(c) {
    super.firstUpdated(c);
    this.__delegateDisabled();
  }

  /**
   * @override
   * @param {Map} c - changed properties
   */
  updated(c) {
    super.updated(c);

    if (c.has('errorValidators') || c.has('warningValidators')) {
      const validators = [...(this.warningValidators || []), ...(this.errorValidators || [])];
      this.__syncDisabledDates(validators);
    }
    if (c.has('label')) {
      this.calendarHeading = this.calendarHeading || this.label;
    }
  }

  _calendarOverlayTemplate() {
    // TODO: try to improve 'this.__calendarConfig(tpl)' approach by creating and exposing lit
    // directives
    return html`
      <lion-calendar-overlay-frame>
        <span slot="heading">${this.calendarHeading}</span>
        ${this._calendarTemplateConfig(this._calendarTemplate())}
      </lion-calendar-overlay-frame>
    `;
  } // eslint-disable-next-line class-methods-use-this

  /**
  * Subclassers can replace this with their custom extension of
  * LionCalendar, like `<my-calendar id="calendar"></my-calendar>`
  */ _calendarTemplate() {
    return html`
      <lion-calendar id="calendar"></lion-calendar>
    `;
  }

  /**
   * This function is run right after the TemplateResult for calendar is created. Its goal is to
   * abstract away all (private and protected) logic from the template, so that subclassers
   * replacing templates 'survive' internal refactors and profit from feature upgrades.
   */
  _calendarTemplateConfig(templateResult) {
    const node = renderAndGetFirstChild(templateResult);
    Object.assign(node, this.__virtualCalendar);
    node.selectedDate = this.__getSyncDownValue();
    node.addEventListener('user-selected-date-changed', this._onCalendarUserSelectedChanged);
    return node;
  } // eslint-disable-next-line class-methods-use-this

  /**
  * Subclassers can replace this with their custom extension invoker,
  * like `<my-button><calendar-icon></calendar-icon></my-button>`
  */ _invokerTemplate() {
    return html`
      <button>&#128197;</button>
    `;
  }

  // Renders the invoker button + the calendar overlay invoked by this button
  __createPickerAndReturnInvokerNode() {
    const invokerNode = renderAndGetFirstChild(this._invokerTemplate());
    invokerNode.id = this.__invokerId;
    invokerNode.addEventListener('click', this.__openCalendarOverlay);
    invokerNode.setAttribute('aria-haspopup', 'dialog');
    invokerNode.setAttribute('aria-expanded', 'false');

    this.localizeNamespacesLoaded.then(() => {
      invokerNode.setAttribute(
        'aria-label',
        localize.msg('lion-input-datepicker:openDatepickerLabel'),
      );
      invokerNode.setAttribute('title', localize.msg('lion-input-datepicker:openDatepickerLabel'));
    });

    // TODO: ModalDialogController should be replaced by a more flexible
    // overlay, allowing the overlay to switch on smaller screens, for instance from dropdown to
    // bottom sheet (working name for this controller: ResponsiveOverlayController)
    this._overlayCtrl = overlays.add(
      new ModalDialogController({
        contentTemplate: () => this._calendarOverlayTemplate(),
        elementToFocusAfterHide: invokerNode,
      }),
    );
    return invokerNode;
  }

  async __openCalendarOverlay() {
    this._overlayCtrl.show();
    await this._calendarElement.updateComplete;
    this._onCalendarOverlayOpened();
  }

  /**
   * Lifecycle callback for subclassers
   */
  _onCalendarOverlayOpened() {
    if (this._focusCentralDateOnCalendarOpen) {
      this._calendarElement.focusCentralDate();
    }
  }

  _onCalendarUserSelectedChanged({ target: { selectedDate } }) {
    if (this._hideOnUserSelect) {
      this._overlayCtrl.hide();
    }
    if (this._syncOnUserSelect) {
      // Synchronize new selectedDate value to input
      this.modelValue = selectedDate;
    }
  }

  /**
   * The LionCalendar shouldn't know anything about the modelValue;
   * it can't handle Unparseable dates, but does handle 'undefined'
   * @returns {Date|undefined} a 'guarded' modelValue
   */
  __getSyncDownValue() {
    return this.modelValue instanceof Unparseable ? undefined : this.modelValue;
  }

  /**
   * Validators contain the information to synchronize the input with
   * the min, max and enabled dates of the calendar.
   * @param {Array} validators - errorValidators or warningValidators array
   */
  __syncDisabledDates(validators) {
    /**
     * TODO: refactor validators to classes, putting needed meta info on instance.
     * Note that direct function comparison (Validator[0] === minDate) doesn't work when code
     * is transpiled
     * @param {String} name - a name like minDate, maxDate, minMaxDate
     * @param {Function} fn - the validator function to execute provided in [fn, param, config]
     * @param {Function} requiredSignature - arguments needed to execute fn without failing
     * @returns {Boolean} - whether the validator (name) is applied
     */
    function isValidatorApplied(name, fn, requiredSignature) {
      let result;
      try {
        result = Object.keys(fn(new Date(), requiredSignature))[0] === name;
      } catch (e) {
        result = false;
      }
      return result;
    }

    // On every validator change, synchronize disabled dates: this means
    // we need to extract minDate, maxDate, minMaxDate and disabledDates validators
    validators.forEach(([fn, param]) => {
      const d = new Date();

      if (isValidatorApplied('minDate', fn, d)) {
        this.__virtualCalendar.minDate = param;
      } else if (isValidatorApplied('maxDate', fn, d)) {
        this.__virtualCalendar.maxDate = param;
      } else if (isValidatorApplied('minMaxDate', fn, { min: d, max: d })) {
        this.__virtualCalendar.minDate = param.min;
        this.__virtualCalendar.maxDate = param.max;
      } else if (isValidatorApplied('disabledDates', fn, () => true)) {
        this.__virtualCalendar.disableDates = param;
      }
    });
  }
}
