import { html, ifDefined } from '@lion/core';

const defaultMonthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// TODO: why so much logic in here? Isn't the goal of the _montsData and preprocessors to provide
// in this?
export function dayTemplate(day, { weekdays, monthsLabels = defaultMonthLabels } = {}) {
  const dayNumber = day.date.getDate();
  const monthName = monthsLabels[day.date.getMonth()];
  const year = day.date.getFullYear();
  const weekdayName = weekdays[day.weekOrder];
  return html`
    <td role="gridcell" class="calendar__day-cell">
      <button
        id=${ifDefined(day.focused ? 'focused-day-button' : undefined)}
        class="calendar__day-button"
        tabindex=${day.central ? '0' : '-1'}
        aria-label=${`${dayNumber} ${monthName} ${year} ${weekdayName}`}
        aria-selected=${day.selected ? 'true' : 'false'}
        aria-current=${ifDefined(day.today ? 'date' : undefined)}
        .disabled=${day.disabled}
        ?disabled=${day.disabled}
        .selected=${day.selected}
        ?selected=${day.selected}
        .past=${day.past}
        ?past=${day.past}
        .today=${day.today}
        ?today=${day.today}
        .future=${day.future}
        ?future=${day.future}
        .previousMonth=${day.previousMonth}
        ?previous-month=${day.previousMonth}
        .currentMonth=${day.currentMonth}
        ?current-month=${day.currentMonth}
        .nextMonth=${day.nextMonth}
        ?next-month=${day.nextMonth}
        .central=${day.central}
        .date=${day.date}
      >
        ${day.date.getDate()}
      </button>
    </td>
  `;
}
