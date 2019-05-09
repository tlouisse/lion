import { CalendarObject } from '@lion/calendar/test/test-utils.js';

export class DatepickerInputObject {
  constructor(el) {
    this.el = el;
  }

  /**
   * Node references
   */

  invoker() {
    return this.el.querySelector(`button[id^="${this.el.localName}"]`);
  }

  overlay() {
    return this.el._overlayCtrl._container;
  }

  overlayHeading() {
    return this.calendar() && this.calendar().querySelector('.calendar-overlay__heading');
  }

  overlayCloseButton() {
    return this.calendar() && this.calendar().querySelector('#close-button');
  }

  calendar() {
    return this.overlay() && this.overlay().querySelector('#calendar');
  }

  calendarObj() {
    return this.calendar() && new CalendarObject(this.calendar());
  }

  /**
   * Object references
   */

  // Not pointing to Node, but just an 'offline' Object (thus no need to pass arguments)
  get overlayController() {
    return this.el._overlayCtrl;
  }
}
