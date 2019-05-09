import { html, LitElement } from '@lion/core';
import { localize, getWeekdayNames, getMonthNames, LocalizeMixin } from '@lion/localize';
import { createMultipleMonth } from './utils/createMultipleMonth.js';
import { dayTemplate } from './utils/dayTemplate.js';
import { dataTemplate } from './utils/dataTemplate.js';
import { getFirstDayNextMonth } from './utils/getFirstDayNextMonth.js';
import { getLastDayPreviousMonth } from './utils/getLastDayPreviousMonth.js';
import { isSameDate } from './utils/isSameDate.js';
import { calendarStyles } from './calendarStyles.js';
import './utils/differentKeyNamesShimIE.js';
import { createDay } from './utils/createDay.js';

/**
 * @customElement
 */
export class LionCalendar extends LocalizeMixin(LitElement) {
  static get localizeNamespaces() {
    return [
      {
        'lion-calendar': locale => {
          switch (locale) {
            case 'bg-BG':
            case 'bg':
              return import('../translations/bg.js');
            case 'cs-CZ':
            case 'cs':
              return import('../translations/cs.js');
            case 'de-AT':
            case 'de-DE':
            case 'de':
              return import('../translations/de.js');
            case 'en-AU':
            case 'en-GB':
            case 'en-US':
            case 'en':
              return import('../translations/en.js');
            case 'es-ES':
            case 'es':
              return import('../translations/es.js');
            case 'fr-FR':
            case 'fr-BE':
            case 'fr':
              return import('../translations/fr.js');
            case 'hu-HU':
            case 'hu':
              return import('../translations/hu.js');
            case 'it-IT':
            case 'it':
              return import('../translations/it.js');
            case 'nl-BE':
            case 'nl-NL':
            case 'nl':
              return import('../translations/nl.js');
            case 'pl-PL':
            case 'pl':
              return import('../translations/pl.js');
            case 'ro-RO':
            case 'ro':
              return import('../translations/ro.js');
            case 'ru-RU':
            case 'ru':
              return import('../translations/ru.js');
            case 'sk-SK':
            case 'sk':
              return import('../translations/sk.js');
            case 'uk-UA':
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

  static get properties() {
    return {
      /**
       * The selected date, usually synchronized with datepicker-input
       * Not to be confused with the focused date (therefore not necessarily in active month view)
       */
      selectedDate: { type: Date },
      /**
       * Minimum date. All dates before will be disabled
       */
      minDate: { type: Date },
      /**
       * Maximum date. All dates after will be disabled
       */
      maxDate: { type: Date },
      /**
       * Enabled dates function that is applied for every monthday within the active view
       */
      enabledDates: { type: Function },

      /**
       * Weekday that will be displayed in first column of month grid.
       * 0: sunday, 1: monday, 2: tuesday, 3: wednesday , 4: thursday, 5: friday, 6: saturday
       * Default is 0
       */
      firstDayOfWeek: { type: Number },
      /**
       * Weekday header notation, based on Intl DatetimeFormat:
       * - 'long' (e.g., Thursday)
       * - 'short' (e.g., Thu)
       * - 'narrow' (e.g., T).
       * Default is 'narrow'
       */
      weekdayHeaderNotation: { type: String },

      locale: { type: String },

      /**
       * The currently focused date in active viewport
       */
      focusDate: { type: Date },
      centralDate: { type: Date },
      hoverDate: { type: Date },

      _data: { type: Object },
    };
  }

  constructor() {
    super();
    // Defaults
    this._data = {};
    this.minDate = null;
    this.maxDate = null;
    this.dayPreprocessor = day => day;
    this.enabledDates = () => true;
    this.firstDayOfWeek = 0;
    this.weekdayHeaderNotation = 'short';
    this.locale = localize.locale;
    this.centralDate = new Date();
    this.focusDate = null;
    this.hoverDate = null;
    this._firstUpdatedDone = false;
    this._connectedCallbackDone = false;
  }

  static get styles() {
    return [calendarStyles];
  }

  render() {
    return html`
      <div class="calendar" id="calendar">
        ${this.__renderHeader()} ${this.__renderData()}
      </div>
    `;
  }

  goToNextMonth() {
    this.__modifyDate(1, { type: 'Month', mode: 'both' });
  }

  goToPreviousMonth() {
    this.__modifyDate(-1, { type: 'Month', mode: 'both' });
  }

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();

    this._connectedCallbackDone = true;

    // calculate correct centralDate based on user provided enabledDates
    this.centralDate = this.centralDate;

    // setup data for initial render
    this._data = this.__createData();
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.__removeEventDelegations();
  }

  firstUpdated() {
    super.firstUpdated();
    this._firstUpdatedDone = true;
    this._days = this.shadowRoot.getElementById('content');

    this.__addEventDelegationForHoverDate();
    this.__addEventDelegationForClickDate();
    this.__addEventForKeyboardNavigation();
  }

  updated(changed) {
    if (this._firstUpdatedDone === true && changed.has('focusDate') && this.focusDate) {
      const button = this.shadowRoot.querySelector('button[tabindex="0"]');
      button.focus();
    }
  }

  /**
   * @override
   */
  _requestUpdate(name, oldValue) {
    super._requestUpdate(name, oldValue);
    const updateDataOn = [
      'centralDate',
      'focusDate',
      'hoverDate',
      'minDate',
      'maxDate',
      'selectedDate',
      'enabledDates',
    ];

    const map = {
      selectedDate: () => this.__selectedDateChanged(),
      centralDate: () => this.__centralDateChanged(),
      enabledDates: () => this.__enabledDatesChanged(),
      focusDate: () => this.__focusDateChanged(),
    };
    if (map[name]) {
      map[name]();
    }

    if (updateDataOn.includes(name) && this._connectedCallbackDone) {
      this._data = this.__createData();
    }
  }

  __renderHeader() {
    const month = getMonthNames({ locale: this.__getLocale() })[this.centralDate.getMonth()];
    const year = this.centralDate.getFullYear();
    return html`
      <div class="calendar__header" id="calendar__header">
        ${this.__renderPreviousButton()}
        <h2
          class="calendar__month-heading"
          id="month_and_year"
          aria-live="polite"
          aria-atomic="true"
        >
          ${month} ${year}
        </h2>
        ${this.__renderNextButton()}
      </div>
    `;
  }

  __renderData() {
    return dataTemplate(this._data, {
      monthsLabels: getMonthNames({ locale: this.__getLocale() }),
      weekdaysShort: getWeekdayNames({
        locale: this.__getLocale(),
        style: this.weekdayHeaderNotation,
        firstDayOfWeek: this.firstDayOfWeek,
      }),
      weekdays: getWeekdayNames({
        locale: this.__getLocale(),
        style: 'long',
        firstDayOfWeek: this.firstDayOfWeek,
      }),
      dayTemplate,
    });
  }

  __renderPreviousButton() {
    return html`
      <button
        class="calendar__prev-month-button"
        aria-label=${this.msgLit('lion-calendar:previousMonth')}
        title=${this.msgLit('lion-calendar:previousMonth')}
        @click=${this.goToPreviousMonth}
        ?disabled=${this._previousMonthDisabled}
      >
        &lt;
      </button>
    `;
  }

  __renderNextButton() {
    return html`
      <button
        class="calendar__next-month-button"
        aria-label=${this.msgLit('lion-calendar:nextMonth')}
        title=${this.msgLit('lion-calendar:nextMonth')}
        @click=${this.goToNextMonth}
        ?disabled=${this._nextMonthDisabled}
      >
        &gt;
      </button>
    `;
  }

  __coreDayPreprocessor(_day, { currentMonth = false } = {}) {
    const day = createDay(new Date(_day.date), _day);
    const today = new Date();
    day.central = isSameDate(day.date, this.centralDate);
    day.previousMonth = currentMonth && day.date.getMonth() < currentMonth.getMonth();
    day.currentMonth = currentMonth && day.date.getMonth() === currentMonth.getMonth();
    day.nextMonth = currentMonth && day.date.getMonth() > currentMonth.getMonth();
    day.selected = this.selectedDate ? isSameDate(day.date, this.selectedDate) : false;
    day.past = day.date < today;
    day.today = isSameDate(day.date, today);
    day.future = day.date > today;
    day.disabled = !this.enabledDates(day.date);

    if (this.minDate && day.date < this.minDate) {
      day.disabled = true;
    }
    if (this.maxDate && day.date > this.maxDate) {
      day.disabled = true;
    }

    return this.dayPreprocessor(day);
  }

  __createData(options) {
    const data = createMultipleMonth(this.centralDate, {
      firstDayOfWeek: this.firstDayOfWeek,
      ...options,
    });
    data.months.forEach((month, monthi) => {
      month.weeks.forEach((week, weeki) => {
        week.days.forEach((day, dayi) => {
          // eslint-disable-next-line no-unused-vars
          const currentDay = data.months[monthi].weeks[weeki].days[dayi];
          const currentMonth = data.months[monthi].weeks[0].days[6].date;
          data.months[monthi].weeks[weeki].days[dayi] = this.__coreDayPreprocessor(currentDay, {
            currentMonth,
          });
        });
      });
    });

    this._nextMonthDisabled = this.maxDate && getFirstDayNextMonth(this.centralDate) > this.maxDate;
    this._previousMonthDisabled =
      this.minDate && getLastDayPreviousMonth(this.centralDate) < this.minDate;

    return data;
  }

  __enabledDatesChanged() {
    // TODO: make sure centralDate is still valid
    this.__centralDateChanged();
  }

  __selectedDateChanged() {
    if (this.selectedDate) {
      this.centralDate = this.selectedDate;
    }
    this.dispatchEvent(new CustomEvent('selected-date-changed'));
  }

  __centralDateChanged() {
    if (this._connectedCallbackDone && !this.__isEnabledDate(this.centralDate)) {
      this.centralDate = this.__findBestEnabledDateFor(this.centralDate);
    }
  }

  __focusDateChanged() {
    if (this.focusDate) {
      this.centralDate = this.focusDate;
    }
  }

  __isEnabledDate(date) {
    const processedDay = this.__coreDayPreprocessor({ date });
    return !processedDay.disabled;
  }

  /**
   * @param {Date} date
   * @param {Object} opts
   * @param {String} [opts.mode] Find best date in `future/past/both`
   */
  __findBestEnabledDateFor(date, { mode = 'both' } = {}) {
    const futureDate =
      this.minDate && this.minDate > date ? new Date(this.minDate) : new Date(date);
    const pastDate = this.maxDate && this.maxDate < date ? new Date(this.maxDate) : new Date(date);

    let i = 0;
    do {
      i += 1;
      if (mode === 'both' || mode === 'future') {
        futureDate.setDate(futureDate.getDate() + 1);
        if (this.__isEnabledDate(futureDate)) {
          return futureDate;
        }
      }
      if (mode === 'both' || mode === 'past') {
        pastDate.setDate(pastDate.getDate() - 1);
        if (this.__isEnabledDate(pastDate)) {
          return pastDate;
        }
      }
    } while (i < 750); // 2 years+

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    throw new Error(
      `Could not find a selectable date within +/- 750 day for ${year}/${month}/${day}`,
    );
  }

  __addEventDelegationForHoverDate() {
    let timeout;
    const isDayOrButton = el =>
      el.classList.contains('calendar__day') || el.classList.contains('calendar__day-button');

    this.__hoverDateDelegation = this._days.addEventListener('mouseover', ev => {
      if (!timeout) {
        // if we don't pass on the parameters to setTimeout then ev.composedPath() becomes empty
        timeout = setTimeout(
          (el, that) => {
            if (isDayOrButton(el)) {
              that.hoverDate = el.date; // eslint-disable-line no-param-reassign
            } else {
              that.hoverDate = null; // eslint-disable-line no-param-reassign
            }
            timeout = null;
          },
          15,
          ev.composedPath()[0],
          this,
        );
      }
    });

    this.__leaveDaysEvent = this._days.addEventListener('mouseleave', () => {
      setTimeout(() => {
        this.hoverDate = null;
      }, 16); // set after debounced event
    });
  }

  __addEventDelegationForClickDate() {
    const isDayOrButton = el =>
      el.classList.contains('calendar__day') || el.classList.contains('calendar__day-button');
    this.__clickDateDelegation = this._days.addEventListener('click', ev => {
      const el = ev.composedPath()[0];
      if (isDayOrButton(el)) {
        this.selectedDate = el.date;
      }
    });
  }

  __removeEventDelegations() {
    this._days.removeEventListener('mouseover', this.__hoverDateDelegation);
    this._days.removeEventListener('mouseleave', this.__leaveDaysEvent);
    this._days.removeEventListener('click', this.__clickDateDelegation);
    this._days.removeEventListener('keydown', this.__keyNavigationEvent);
  }

  __modifyDate(modify, { type = 'Date', mode = 'future', dateType = 'centralDate' } = {}) {
    let tmpDate = new Date(this.centralDate);
    tmpDate[`set${type}`](tmpDate[`get${type}`]() + modify);

    if (!this.__isEnabledDate(tmpDate)) {
      tmpDate = this.__findBestEnabledDateFor(tmpDate, { mode });
    }

    this[dateType] = tmpDate;
  }

  __addEventForKeyboardNavigation() {
    this.__keyNavigationEvent = this._days.addEventListener('keydown', ev => {
      switch (ev.key) {
        case 'ArrowUp':
          this.__modifyDate(-7, { dateType: 'focusDate', mode: 'past' });
          break;
        case 'ArrowDown':
          this.__modifyDate(7, { dateType: 'focusDate' });
          break;
        case 'ArrowLeft':
          this.__modifyDate(-1, { dateType: 'focusDate', mode: 'past' });
          break;
        case 'ArrowRight':
          this.__modifyDate(1, { dateType: 'focusDate' });
          break;
        case 'PageDown':
          if (ev.altKey === true) {
            this.__modifyDate(1, { dateType: 'focusDate', type: 'FullYear' });
          } else {
            this.__modifyDate(1, { dateType: 'focusDate', type: 'Month' });
          }
          break;
        case 'PageUp':
          if (ev.altKey === true) {
            this.__modifyDate(-1, { dateType: 'focusDate', type: 'FullYear', mode: 'past' });
          } else {
            this.__modifyDate(-1, { dateType: 'focusDate', type: 'Month', mode: 'past' });
          }
          break;
        case 'Tab':
          this.focusDate = null;
          break;
        // no default
      }
    });
  }

  __getLocale() {
    return this.locale || localize.locale;
  }
}
