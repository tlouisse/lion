import { css } from '@lion/core';
import { LionCalendar } from '../../index.js';

class TwoMonth extends LionCalendar {
  static get styles() {
    return [
      super.styles,
      css`
        .calendar__day[previous-month] > button,
        .calendar__day[next-month] > button {
          display: none;
        }
      `,
    ];
  }

  constructor() {
    super();
    this.__futureMonths = 1;
    this.__pastMonths = 0;
  }

  createData() {
    return super.createData({ futureMonths: this.__futureMonths, pastMonths: this.__pastMonths });
  }

  modifyDate(modify, { type = 'Date', mode = 'future', dateType = 'centralDate' } = {}) {
    let tmpDate = new Date(this.centralDate);
    tmpDate[`set${type}`](tmpDate[`get${type}`]() + modify);

    if (!this.isEnabledDate(tmpDate)) {
      tmpDate = this.findBestEnabledDateFor(tmpDate, { mode });
    }

    if (mode === 'future' && tmpDate.getMonth() === this.centralDate.getMonth() + 1) {
      this.__futureMonths = 0;
      this.__pastMonths = 1;
    }

    if (mode === 'past' && tmpDate.getMonth() === this.centralDate.getMonth() - 1) {
      this.__futureMonths = 1;
      this.__pastMonths = 0;
    }

    this[dateType] = tmpDate;
  }
}

customElements.define('two-month', TwoMonth);
