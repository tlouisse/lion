/* eslint-disable no-underscore-dangle */
import { html, render } from '@lion/core';
import { LionInputDate } from '@lion/input-date';
import { overlays, ModalDialogController } from '@lion/overlays';
import { Unparseable } from '@lion/validate';
import '../../calendar/lion-calendar.js';
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
       * The title to be added on top of the calendar overlay
       */
      calendarHeading: {
        type: 'String',
        attribute: 'calendar-heading',
      },
      /**
       * The slot to put the invoker button in. Can be 'prefix', 'suffix', 'before' and 'after'.
       * Default will be 'suffix'.
       */
      _calendarSlot: {
        type: 'String',
      },
    };
  }

  get slots() {
    return {
      ...super.slots,
      [this._calendarSlot]: () => this.__createPickerAndReturnInvokerNode(),
    };
  }

  get _calendarElement() {
    return this._overlayCtrl._container.firstElementChild.querySelector('#calendar');
  }

  constructor() {
    super();
    // Create a unique id for the invoker, since it is placed in light dom for a11y.
    this._invokerId = `${this.localName}-${Math.random()
      .toString(36)
      .substr(2, 10)}`;
    this._calendarSlot = 'suffix';
    /**
     * 'Virtual' synchronization object for 'pending' updates (that can only be set when the
     * calendar is opened and thus rendered to the dom).
     * This object is synced in __calendarConfig(), right after dom has been created by
     * lit-html.
     */
    this.__virtualCalendar = {};
    this.__onCalendarSelectedChanged = this.__onCalendarSelectedChanged.bind(this);
    this.__openCalendarAndFocusDay = this.__openCalendarAndFocusDay.bind(this);
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

  // Renders the invoker button + the calendar overlay invoked by this button
  __createPickerAndReturnInvokerNode() {
    const invokerNode = renderAndGetFirstChild(this._invokerTemplate());
    invokerNode.id = this._invokerId;
    invokerNode.addEventListener('click', this.__openCalendarAndFocusDay);
    invokerNode.setAttribute('aria-haspopup', 'dialog');
    invokerNode.setAttribute('aria-expanded', 'false');
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

  _calendarOverlayTemplate() {
    return html`
      <lion-calendar-overlay-frame>
        <span slot="heading">${this.calendarHeading}</span>
        ${this.__calendarConfig(this._calendarTemplate())}
      </lion-calendar-overlay-frame>
    `;
  }

  /**
   * Subclassers can replace this with their custom extension of
   * LionCalendar, like `<my-calendar id="calendar"></my-calendar>`
   */
  // eslint-disable-next-line class-methods-use-this
  _calendarTemplate() {
    return html`
      <lion-calendar id="calendar"></lion-calendar>
    `;
  }

  /**
   * This function is run right after the TemplateResult for calendar is created. Its goal is to
   * abstract away all (private and protected) logic from the template, so that subclassers
   * replacing templates 'survive' internal refactors and profit from feature upgrades.
   */
  __calendarConfig(templateResult) {
    const node = renderAndGetFirstChild(templateResult);
    Object.assign(node, this.__virtualCalendar);
    node.selectedDate = this.__getSyncDownValue();
    node.addEventListener('selected-date-changed', this.__onCalendarSelectedChanged);
    return node;
  }

  /**
   * Subclassers can replace this with their custom extension invoker,
   * like `<my-button><calendar-icon></calendar-icon></my-button>`
   */
  // eslint-disable-next-line class-methods-use-this
  _invokerTemplate() {
    return html`
      <button>&#128197;</button>
    `;
  }

  __openCalendarAndFocusDay(ev) {
    this._overlayCtrl.show(ev.target);
    // Give selected date focus.
    // TODO: find a way to do this with a less private api of the calendar
    this._calendarElement.updateComplete.then(() => {
      this._calendarElement.shadowRoot.querySelector('[role="grid"] [tabindex="0"]').focus();
    });
  }

  __onCalendarSelectedChanged({ target: { selectedDate } }) {
    this._overlayCtrl.hide();
    // Synchronize new selectedDate value to input
    this.modelValue = selectedDate;
  }

  /**
   * The lion-calendar shouldn't know anything about the modelValue;
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
     * @param {Function} dummyParam - arguments needed to execute fn without failing
     * @returns {Boolean} - whether the validator (name) is applied
     */

    function isValidatorApplied(name, fn, dummyParam) {
      let result;
      try {
        // if name is minDate / maxDate
        result = Object.keys(fn(new Date(), dummyParam))[0] === name;
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
      } else if (isValidatorApplied(fn, d, 'maxDate')) {
        this.__virtualCalendar.maxDate = param;
      } else if (isValidatorApplied('minMaxDate', fn, { min: d, max: d })) {
        this.__virtualCalendar.minDate = param.min;
        this.__virtualCalendar.maxDate = param.max;
      } else if (isValidatorApplied('disabledDates', fn, () => true)) {
        this.__virtualCalendar.dateProcessor = param;
      }
    });
  }
}
