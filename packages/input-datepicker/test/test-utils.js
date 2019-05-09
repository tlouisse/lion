import { CalendarObject } from '@lion/calendar/test/test-utils.js';

// TODO: refactor CalendarObject to this approach (only methods when arguments are needed)
export class DatepickerInputObject {
  constructor(el) {
    this.el = el;
  }

  /**
   * Methods mimicing User Interaction
   */

  openCalendar() {
    // Make sure the calendar is opened, not closed/toggled;
    this.overlayController.hide();
    this.invokerEl.click();
    return this.calendarEl.updateComplete;
  }

  /**
   * Node references
   */

  get invokerEl() {
    return this.el.querySelector(`button[id^="${this.el.localName}"]`);
  }

  get overlayEl() {
    return this.el._overlayCtrl._container.firstElementChild;
  }

  get overlayHeadingEl() {
    return this.overlayEl && this.overlayEl.shadowRoot.querySelector('.calendar-overlay__heading');
  }

  get overlayCloseButtonEl() {
    return this.calendarEl && this.overlayEl.shadowRoot.querySelector('#close-button');
  }

  get calendarEl() {
    return this.overlayEl && this.overlayEl.querySelector('#calendar');
  }

  get calendarObj() {
    return this.calendarEl && new CalendarObject(this.calendarEl);
  }

  /**
   * Object references
   */

  get overlayController() {
    return this.el._overlayCtrl;
  }
}
