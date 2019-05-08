import { expect, fixture } from '@open-wc/testing';
import sinon from 'sinon';

import { html } from '@lion/core';
import { localize } from '@lion/localize';
import { localizeTearDown } from '@lion/localize/test-helpers.js';

import { CalendarObject, DayObject } from './test-utils.js';
import './keyboardEventShimIE.js';

import { isSameDate } from '../src/utils/isSameDate';
import '../lion-calendar.js';

describe('<lion-calendar>', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers({ now: 976838400000 }); // new Date('2000/12/15')
    localizeTearDown();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('Structure', () => {
    // already tested via utils tests
    it.skip('implements the calendar CSS Module for HTML structure', async () => {
      const el = await fixture(
        html`
          <lion-calendar></lion-calendar>
        `,
      );
      expect(el.querySelector('.calendar')).not.to.equal(null);
      expect(el.querySelector('.calendar__month-heading')).lightDom.to.equal(`
        <button class="calendar__prev-month-button" aria-label="Previous month">&lt;</button>
        <h2
          id="month_and_year"
          class="calendar__month-heading"
          aria-live="polite"
          aria-atomic="true"
        >
          October 2018
        </h2>
        <button class="calendar__next-month-button" aria-label="Next month">&gt;</button>
      `);

      expect(el.querySelector('.calendar__grid thead')).lightDom.to.equal(`
        <tr>
          <th scope="col" aria-label="Monday" id="weekday1">Mo</th>
          <th scope="col" aria-label="Tuesday" id="weekday2">Tu</th>
          <th scope="col" aria-label="Wednesday" id="weekday3">We</th>
          <th scope="col" aria-label="Thursday" id="weekday4">Th</th>
          <th scope="col" aria-label="Friday" id="weekday5">Fr</th>
          <th scope="col" aria-label="Saturday" id="weekday6">Sa</th>
          <th scope="col" aria-label="Sunday" id="weekday7">Su</th>
        </tr>
      `);

      expect(el.querySelector('.calendar__day')).lightDom.to.equal(`
        <button class="calendar__day-button" tabindex="-1" id="day15" aria-labelledby="weekday1 day15 month" aria-selected="false">15</button>
      `);
      /**
       * Note that all day states are tested below
       */
    });

    /**
     * Not in scope:
     * - ability to start weekdays on Sunday instead of Monday
     * - abilitiy to add custom templates: easily switch out header and create a different nav
     */
  });

  describe('Public API', () => {
    it('has property "selectedDate" for the selected date', async () => {
      const el = await fixture(html`
        <lion-calendar .selectedDate="${new Date('2019/06/15')}"></lion-calendar>
      `);
      const elObj = new CalendarObject(el);
      expect(elObj.day(15).selected).to.equal(true);
      expect(elObj.day(16).selected).to.equal(false);
      expect(elObj.day(14).selected).to.equal(false);
      el.selectedDate = new Date('2019/06/16');
      await el.updateComplete;
      expect(elObj.day(15).selected).to.equal(false);
    });

    it('does not set "selectedDate" by default', async () => {
      const selectedDateChangedSpy = sinon.spy();
      const el = await fixture(html`
        <lion-calendar @selected-date-changed=${selectedDateChangedSpy}></lion-calendar>
      `);
      const elObj = new CalendarObject(el);
      const today = new Date();
      expect(selectedDateChangedSpy.called).to.equal(false);
      expect(el.selectedDate).to.equal(undefined);
      expect(elObj.day(today.getDate()).selected).to.equal(false);
    });

    it('sends event "selected-date-changed" on change of selectedDate property', async () => {
      const mySpy = sinon.spy();
      const el = await fixture(html`
        <lion-calendar @selected-date-changed="${() => mySpy()}"></lion-calendar>
      `);
      expect(mySpy.called).to.equal(false);
      el.selectedDate = new Date('2000/12/12');
      expect(mySpy.called).to.equal(true);
    });

    describe('Enabled Dates', () => {
      it('disables all days before "minDate" property', async () => {
        const el = await fixture(html`
          <lion-calendar
            .selectedDate="${new Date('2000/12/31')}"
            .minDate="${new Date('2000/12/09')}"
          >
          </lion-calendar>
        `);
        const elObj = new CalendarObject(el);
        expect(elObj.dayObj(15).disabled).to.equal(false);
        elObj.days().forEach((d, i) => {
          const shouldBeDisabled = i < 8;
          expect(new DayObject(d).disabled).to.equal(shouldBeDisabled);
        });
      });

      it('disables all days after "maxDate" property', async () => {
        const el = await fixture(html`
          <lion-calendar
            .selectedDate="${new Date('2000/12/01')}"
            .maxDate="${new Date('2000/12/09')}"
          >
          </lion-calendar>
        `);
        const elObj = new CalendarObject(el);
        expect(elObj.dayObj(5).disabled).to.equal(false);
        elObj.days().forEach((d, i) => {
          const shouldBeDisabled = i > 8;
          expect(new DayObject(d).disabled).to.equal(shouldBeDisabled);
        });
      });

      it('disables all days except the days specified in enabledDates function', async () => {
        const no15th = d => d.getDate() !== 15;
        const el = await fixture(
          html`
            <lion-calendar
              .selectedDate="${new Date('2000/12/01')}"
              .enabledDates=${no15th}
            ></lion-calendar>
          `,
        );
        const elObj = new CalendarObject(el);
        elObj.days().forEach((d, i) => {
          const shouldBeDisabled = i === 15 - 1;
          expect(new DayObject(d).disabled).to.equal(shouldBeDisabled);
        });

        el.selectedDate = new Date('2000/11/01'); // When month view updates, it should still work
        await el.updateComplete;
        elObj.days().forEach((d, i) => {
          const shouldBeDisabled = i === 15 - 1;
          expect(new DayObject(d).disabled).to.equal(shouldBeDisabled);
        });
      });
    });

    /**
     * Nice to have for feature releases:
     * - intialfocusDate: the focused date on opening the calendar
     * - helper fns for disableWeekends and disableHolidays
     */
  });

  describe('Calendar header (month navigation)', () => {
    describe('Title', () => {
      it('contains secondary title displaying the current month and year in focus', async () => {
        const el = await fixture(
          html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `,
        );
        const elObj = new CalendarObject(el);
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');
      });

      it('updates the secondary title when the displayed month/year changes', async () => {
        const el = await fixture(
          html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `,
        );
        const elObj = new CalendarObject(el);
        el.selectedDate = new Date('1999/10/12');
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('October 1999');
      });

      describe('Accessibility', () => {
        it('has aria-live="polite" and aria-atomic="true" set on the secondary title', async () => {
          const el = await fixture(
            html`
              <lion-calendar></lion-calendar>
            `,
          );
          const elObj = new CalendarObject(el);
          expect(elObj.monthHeading().getAttribute('aria-live')).to.equal('polite');
          expect(elObj.monthHeading().getAttribute('aria-atomic')).to.equal('true');
        });
      });
    });

    describe('Navigation', () => {
      it('has a button for navigation to previous month', async () => {
        const el = await fixture(
          html`
            <lion-calendar .selectedDate="${new Date('2001/01/01')}"></lion-calendar>
          `,
        );
        const elObj = new CalendarObject(el);
        expect(elObj.prevMonthButton()).not.to.equal(null);
        expect(elObj.monthHeading()).lightDom.to.equal('January 2001');

        elObj.prevMonthButton().click();
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

        elObj.prevMonthButton().click();
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('November 2000');
      });

      it('has a button for navigation to next month', async () => {
        const el = await fixture(
          html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `,
        );
        const elObj = new CalendarObject(el);
        expect(elObj.nextMonthButton()).not.to.equal(null);
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

        elObj.nextMonthButton().click();
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('January 2001');

        elObj.nextMonthButton().click();
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('February 2001');
      });

      it('disables prevMonthButton and nextMonthButton based on disabled days accordingly', async () => {
        const el = await fixture(html`
          <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
        `);
        const elObj = new CalendarObject(el);
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');
        expect(elObj.prevMonthButton().hasAttribute('disabled')).to.equal(false);
        expect(elObj.nextMonthButton().hasAttribute('disabled')).to.equal(false);

        el.minDate = new Date('2000/12/01');
        el.maxDate = new Date('2000/12/31');
        await el.updateComplete;

        expect(elObj.prevMonthButton().hasAttribute('disabled')).to.equal(true);
        expect(elObj.nextMonthButton().hasAttribute('disabled')).to.equal(true);

        elObj.prevMonthButton().click();
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

        elObj.prevMonthButton().click();
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');
      });

      it('handles switch to prev month when dates are disabled', async () => {
        const el = await fixture(html`
          <lion-calendar .centralDate="${new Date('2000/12/12')}"></lion-calendar>
        `);
        const elObj = new CalendarObject(el);
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

        el.minDate = new Date('2000/11/20');
        await el.updateComplete;

        expect(elObj.prevMonthButton().hasAttribute('disabled')).to.equal(false);
        expect(isSameDate(el.centralDate, new Date('2000/12/12'))).to.be.true;

        elObj.prevMonthButton().click();
        await el.updateComplete;
        expect(elObj.activeMonthAndYear).to.equal('November 2000');
        expect(isSameDate(el.centralDate, new Date('2000/11/21'))).to.be.true;
      });

      it('handles switch to next month when dates are disabled', async () => {
        const el = await fixture(html`
          <lion-calendar .centralDate="${new Date('2000/12/12')}"></lion-calendar>
        `);
        const elObj = new CalendarObject(el);
        expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

        el.maxDate = new Date('2001/01/10');
        await el.updateComplete;

        expect(elObj.nextMonthButton().hasAttribute('disabled')).to.equal(false);
        expect(isSameDate(el.centralDate, new Date('2000/12/12'))).to.be.true;

        elObj.nextMonthButton().click();
        await el.updateComplete;
        expect(elObj.monthHeading()).lightDom.to.equal('January 2001');
        expect(isSameDate(el.centralDate, new Date('2001/01/09'))).to.be.true;
      });

      describe('Accessibility', () => {
        it('navigate buttons have a aria-label and title attribute with accessible label', async () => {
          const el = await fixture(html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(elObj.prevMonthButton().getAttribute('title')).to.equal('Previous month');
          expect(elObj.prevMonthButton().getAttribute('aria-label')).to.equal('Previous month');
          expect(elObj.nextMonthButton().getAttribute('title')).to.equal('Next month');
          expect(elObj.nextMonthButton().getAttribute('aria-label')).to.equal('Next month');
        });
      });
    });
  });

  describe('Calendar body (months view)', () => {
    it('renders the days of the week as table headers', async () => {
      const el = await fixture(
        html`
          <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
        `,
      );
      const elObj = new CalendarObject(el);
      expect(elObj.weekdayHeaders().map(h => h.textContent.trim())).to.deep.equal([
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
      ]);
    });

    describe('Day view', () => {
      it('adds "today" attribute if date is today', async () => {
        const el = await fixture(
          html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `,
        );
        const elObj = new CalendarObject(el);
        expect(elObj.day(15).today).to.be.true;

        expect(elObj.checkForAllDays(d => d.today, [15])).to.equal(true);
      });

      it('adds "selected" modifier to selected date', async () => {
        const el = await fixture(
          html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `,
        );
        const elObj = new CalendarObject(el);
        expect(elObj.checkForAllDays(d => d.selected, [12])).to.equal(true);

        el.selectedDate = new Date('2000/12/15');
        await el.updateComplete;
        expect(elObj.checkForAllDays(d => d.selected, [15])).to.equal(true);
      });

      it('adds "disabled" modifier to disabled dates', async () => {
        const el = await fixture(html`
          <lion-calendar
            .selectedDate="${new Date('2000/12/10')}"
            .minDate="${new Date('2000/12/03')}"
            .maxDate="${new Date('2000/12/29')}"
          >
          </lion-calendar>
        `);
        const elObj = new CalendarObject(el);
        expect(elObj.checkForAllDays(d => d.disabled, [1, 2, 30, 31])).to.equal(true);
      });
    });

    describe('User Interaction', () => {
      // For implementation, base on: https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/grid/js/dataGrid.js

      describe('Keyboard Navigation', () => {
        it('focused day is reachable via tab (tabindex="0")', async () => {
          const el = await fixture(html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(
            elObj.checkForAllDays(d => d.button().getAttribute('tabindex') === '0', [12]),
          ).to.equal(true);
        });

        it('non focused days are not reachable via tab (have tabindex="-1")', async () => {
          const el = await fixture(html`
            <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(
            elObj.checkForAllDays(
              d => d.button().getAttribute('tabindex') === '-1',
              dayNumber => dayNumber !== 12,
            ),
          ).to.equal(true);
        });

        it('blocks navigation to disabled days', async () => {
          const el = await fixture(html`
            <lion-calendar
              .selectedDate="${new Date('2000/12/31')}"
              .minDate="${new Date('2000/12/09')}"
            >
            </lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(
            elObj.checkForAllDays(
              d => d.button().getAttribute('tabindex') === '-1',
              dayNumber => dayNumber < 9,
            ),
          ).to.equal(true);
        });

        it('navigates through months with [pageup] [pagedown] keys', async () => {
          const el = await fixture(html`
            <lion-calendar .selectedDate="${new Date('2001/01/02')}"></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(elObj.monthHeading()).lightDom.to.equal('January 2001');

          el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));
          await el.updateComplete;
          expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

          el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
          await el.updateComplete;
          expect(elObj.monthHeading()).lightDom.to.equal('January 2001');
        });

        it('navigates through years with [alt + pageup] [alt + pagedown] keys', async () => {
          const el = await fixture(html`
            <lion-calendar .selectedDate="${new Date('2001/01/02')}"></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(elObj.monthHeading()).lightDom.to.equal('January 2001');

          el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', altKey: true }));
          await el.updateComplete;
          expect(elObj.monthHeading()).lightDom.to.equal('January 2002');

          el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', altKey: true }));
          await el.updateComplete;
          expect(elObj.monthHeading()).lightDom.to.equal('January 2001');
        });

        describe('Arrow keys', () => {
          it('navigates (sets focus) to next row item via [arrow down] key', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2001/01/02')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            await el.updateComplete;
            expect(elObj.focusedDayObj().monthday).to.equal(2 + 7);
          });

          it('navigates (sets focus) to previous row item via [arrow up] key', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2001/01/02')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            await el.updateComplete;
            expect(elObj.focusedDayObj().monthday).to.equal(26); // of month before
          });

          it('navigates (sets focus) to previous column item via [arrow left] key', async () => {
            // 2000-12-12 is Tuesday; at 2nd of row
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            await el.updateComplete;
            expect(elObj.focusedDayObj().monthday).to.equal(12 - 1);
          });

          it('navigates (sets focus) to next column item via [arrow right] key', async () => {
            // 2000-12-12 is Tuesday; at 2nd of row
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2000/12/12')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            await el.updateComplete;
            expect(elObj.focusedDayObj().monthday).to.equal(12 + 1);
          });

          it('navigates (sets focus) to next selectable column item via [arrow right] key', async () => {
            const el = await fixture(html`
              <lion-calendar
                .selectedDate="${new Date('2001/01/02')}"
                .enabledDates=${day => day.getDate() !== 3 && day.getDate() !== 4}
              ></lion-calendar>
            `);
            const elObj = new CalendarObject(el);

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            await el.updateComplete;
            expect(elObj.focusedDayObj().monthday).to.equal(5);
          });

          it('navigates (sets focus) to next row via [arrow right] key if last item in row', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2019/01/05')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);
            expect(elObj.centralDayObj().weekday).to.equal('Sat');

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            await el.updateComplete;
            expect(elObj.focusedDayObj().monthday).to.equal(6);
            expect(elObj.focusedDayObj().weekday).to.equal('Sun');
          });

          it('navigates (sets focus) to previous row via [arrow left] key if first item in row', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2019/01/06')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);
            expect(elObj.centralDayObj().weekday).to.equal('Sun');

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            await el.updateComplete;
            expect(elObj.focusedDayObj().monthday).to.equal(5);
            expect(elObj.focusedDayObj().weekday).to.equal('Sat');
          });

          it('navigates to next month via [arrow right] key if last day of month', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2000/12/31')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);
            expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            await el.updateComplete;
            expect(elObj.monthHeading()).lightDom.to.equal('January 2001');
            expect(elObj.focusedDayObj().monthday).to.equal(1);
          });

          it('navigates to previous month via [arrow left] key if first day of month', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2001/01/01')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);
            expect(elObj.monthHeading()).lightDom.to.equal('January 2001');

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            await el.updateComplete;
            expect(elObj.monthHeading()).lightDom.to.equal('December 2000');
            expect(elObj.focusedDayObj().monthday).to.equal(31);
          });

          it('navigates to next month via [arrow down] key if last row of month', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2000/12/30')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);
            expect(elObj.monthHeading()).lightDom.to.equal('December 2000');

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            await el.updateComplete;
            expect(elObj.monthHeading()).lightDom.to.equal('January 2001');
            expect(elObj.focusedDayObj().monthday).to.equal(6);
          });

          it('navigates to previous month via [arrow up] key if first row of month', async () => {
            const el = await fixture(html`
              <lion-calendar .selectedDate="${new Date('2001/01/02')}"></lion-calendar>
            `);
            const elObj = new CalendarObject(el);
            expect(elObj.monthHeading()).lightDom.to.equal('January 2001');

            el._days.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            await el.updateComplete;
            expect(elObj.monthHeading()).lightDom.to.equal('December 2000');
            expect(elObj.focusedDayObj().monthday).to.equal(26);
          });
        });
      });

      describe('Initial central', () => {
        it('is based on "selectedDate"', async () => {
          const el = await fixture(html`
            <lion-calendar .selectedDate=${new Date('2019/06/15')}></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(elObj.centralDayObj().monthday).to.equal(15);
        });

        it('is today if no selected date is available', async () => {
          const el = await fixture(html`
            <lion-calendar></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(elObj.centralDayObj().monthday).to.equal(15);
        });

        it('is on day closest to today, if today (and surrounding dates) is/are disabled', async () => {
          const el = await fixture(html`
            <lion-calendar .enabledDates="${d => d.getDate() > 16}"></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(elObj.centralDayObj().monthday).to.equal(17);

          el.enabledDates = d => d.getDate() < 12;
          await el.updateComplete;
          expect(elObj.centralDayObj().monthday).to.equal(11);
        });

        it('future dates take precedence over past dates when "distance" between dates is equal', async () => {
          const el = await fixture(html`
            <lion-calendar .enabledDates="${d => d.getDate() !== 15}"></lion-calendar>
          `);
          const elObj = new CalendarObject(el);
          expect(elObj.centralDayObj().monthday).to.equal(16);
        });

        it('will search 750 days in the past', async () => {
          const el = await fixture(html`
            <lion-calendar .enabledDates="${d => d.getFullYear() <= 1998}"></lion-calendar>
          `);
          expect(el.centralDate.getFullYear()).to.equal(1998);
          expect(el.centralDate.getMonth()).to.equal(11);
          expect(el.centralDate.getDate()).to.equal(31);
        });

        it('will search 750 days in the future', async () => {
          const el = await fixture(html`
            <lion-calendar .enabledDates="${d => d.getFullYear() >= 2002}"></lion-calendar>
          `);
          expect(el.centralDate.getFullYear()).to.equal(2002);
          expect(el.centralDate.getMonth()).to.equal(0);
          expect(el.centralDate.getDate()).to.equal(1);
        });

        it('throws if no selectable date can be found within +/- 750 days', async () => {
          const el = await fixture(html`
            <lion-calendar .enabledDates="${d => d.getFullYear() >= 2002}"></lion-calendar>
          `);
          try {
            el.centralDate = new Date('1900/01/01');
          } catch (e) {
            expect(e).to.be.instanceof(Error);
            expect(e.message).to.equal(
              'Could not find a selectable date within +/- 750 day for 1900/1/1',
            );
            return;
          }
          throw new Error('did not throw');
        });
      });

      /**
       * Not in scope:
       * - (virtual) scrolling: still under discussion. Wait for UX
       */
    });

    describe('Accessibility', () => {
      // Based on:
      // - https://codepen.io/erikkroes/pen/jJEWpR

      // Navigation and day labels based on:
      // - https://dequeuniversity.com/library/aria/date-pickers/sf-date-picker
      //   (recommended in W3C Editors Draft)

      // For implementation, base on:
      // https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/grid/js/dataGrid.js
      // As an enhancement, we detect when grid boundaries day are exceeded, so we move to
      // next/prev month.

      it(`renders the calendar as a table element with role="grid", aria-readonly="true" and
        a caption (month + year)`, async () => {
        const elObj = new CalendarObject(
          await fixture(
            html`
              <lion-calendar></lion-calendar>
            `,
          ),
        );
        expect(elObj.grid().getAttribute('role')).to.equal('grid');
        expect(elObj.grid().getAttribute('aria-readonly')).to.equal('true');
      });

      it('adds aria-labels to the weekday table headers', async () => {
        const elObj = new CalendarObject(
          await fixture(
            html`
              <lion-calendar></lion-calendar>
            `,
          ),
        );
        expect(elObj.weekdayHeaders().map(h => h.getAttribute('aria-label'))).to.eql([
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]);
      });

      it('renders each day as a button inside a table cell', async () => {
        const elObj = new CalendarObject(
          await fixture(
            html`
              <lion-calendar></lion-calendar>
            `,
          ),
        );
        const hasBtn = d => d.el.tagName === 'BUTTON';
        expect(elObj.checkForAllDays(hasBtn)).to.equal(true);
      });

      // TODO: rewrite to expect normal "days" just with notThisMonth annotated
      it.skip('renders empty table cells for non existing days', async () => {
        // 2000-11-12 results in: first 2 cells empty and last 3 cells empty
        const elObj = new CalendarObject(
          await fixture(html`
            <lion-calendar .selectedDate="${new Date('2000/11/12')}"></lion-calendar>
          `),
        );
        const cells = [].slice.call(elObj.grid().querySelectorAll('td'));
        const lastIndex = cells.length;

        // Cell 1 and 2
        expect(cells[0].el.textContent).to.equal('');
        expect(cells[1].el.textContent).to.equal('');
        expect(cells[2].el.textContent).not.to.equal('');

        // Cell lastIndex till (lastIndex -2)
        expect(cells[lastIndex].el.textContent).to.equal('');
        expect(cells[lastIndex - 1].el.textContent).to.equal('');
        expect(cells[lastIndex - 2].el.textContent).to.equal('');
        expect(cells[lastIndex - 3].el.textContent).not.to.equal('');
      });

      it('sets aria-current="date" to todays button', async () => {
        const elObj = new CalendarObject(
          await fixture(
            html`
              <lion-calendar></lion-calendar>
            `,
          ),
        );
        const hasAriaCurrent = d => d.button().getAttribute('aria-current') === 'date';
        const monthday = new Date().getDate();
        expect(elObj.checkForAllDays(hasAriaCurrent, [monthday])).to.equal(true);
      });

      it('sets aria-selected="true" on selected date button', async () => {
        const elObj = new CalendarObject(
          await fixture(html`
            <lion-calendar .selectedDate="${new Date('2000/11/12')}"></lion-calendar>
          `),
        );
        const hasAriaSelected = d => d.button().getAttribute('aria-selected') === 'true';
        expect(elObj.checkForAllDays(hasAriaSelected, [12])).to.equal(true);
      });

      // This implementation mentions "button" inbetween and doesn't mention table
      // column and row. As an alternative, see Deque implementation below.
      // it(`on focus on a day, the screen reader pronounces "day of the week", "day number"
      //    and "month" (in this order)', async () => {
      //   // implemented by labelelledby referencing row and column names
      //   const el = await fixture('<lion-calendar></lion-calendar>');
      // });

      // Alternative: Deque implementation
      it(`sets aria-label on button, that consists of
        "{day number} {month name} {year} {weekday name}"`, async () => {
        const elObj = new CalendarObject(
          await fixture(html`
            <lion-calendar .selectedDate="${new Date('2000/11/12')}"></lion-calendar>
          `),
        );
        expect(
          elObj.checkForAllDays(
            d =>
              d.button().getAttribute('aria-label') ===
              `${d.monthday} November 2000 ${d.weekdayLong}`,
          ),
        ).to.equal(true);
      });

      /**
       * Not in scope:
       * - reads the new focused day on month navigation"
       */
    });

    /**
     * Not in scope:
     * - show week numbers
     */
  });

  describe('Localization', () => {
    it('supports custom locale with a fallback to a global locale', async () => {
      const el = await fixture(html`
        <lion-calendar .selectedDate="${new Date('2019/12/20')}"></lion-calendar>
      `);
      const elObj = new CalendarObject(el);
      expect(elObj.activeMonth).to.equal('December');

      el.locale = 'fr-FR';
      await el.updateComplete;
      expect(elObj.activeMonth).to.equal('décembre');

      localize.locale = 'cs-CZ';
      await el.updateComplete;
      expect(elObj.activeMonth).to.equal('décembre');

      el.locale = undefined;
      await el.updateComplete;
      expect(elObj.activeMonth).to.equal('prosinec');
    });

    it('displays the right translations according to locale', async () => {
      const el = await fixture(html`
        <lion-calendar></lion-calendar>
      `);

      const elObj = new CalendarObject(el);
      expect(elObj.nextMonthButton().getAttribute('aria-label')).to.equal('Next month');

      localize.locale = 'nl-NL';
      await el.updateComplete;
      expect(elObj.nextMonthButton().getAttribute('aria-label')).to.equal('Volgende maand');

      /**
       * TODO: test translate:
       * - weekdays
       * - weekday abbreviations
       * - month names
       */
    });
  });
});
