/**
 * Gives the last day of the previous month
 *
 * @param {Date} date
 *
 * returns {Date}
 */
export function getLastDayPreviousMonth(date) {
  const prev = new Date(date);
  prev.setDate(0);
  return new Date(prev);
}
