export function createDay(
  date = new Date(),
  {
    weekOrder,
    central = false,
    startOfWeek = false,
    selected = false,
    focused = false,
    previousMonth = false,
    currentMonth = false,
    nextMonth = false,
    past = false,
    today = false,
    future = false,
    hovered = false,
  } = {},
) {
  return {
    weekOrder,
    central,
    date,
    startOfWeek,
    selected,
    focused,
    previousMonth,
    currentMonth,
    nextMonth,
    past,
    today,
    future,
    hovered,
  };
}
