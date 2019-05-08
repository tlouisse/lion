# Calendar

[//]: # (AUTO INSERT HEADER PREPUBLISH)

`lion-calendar` is a reusable and accessible calendar view.
It is used inside the [input-datepicker](../input-datepicker/)

## Features

- fully accessible keyboard navigation (Arrow Keys, PgUp, PgDn, ALT+PgUp, ALT+PgDn)
- **selectedDate**: the selected date
- **minDate**: disable all dates before a given date
- **maxDate**: disable all dates after a given date
- **enabledDates**: enable a set of dates

## How to use

### Installation

```sh
npm i --save @lion/calendar
```

```js
import '@lion/calendar/lion-calendar.js';
```

### Example

```html
<lion-calendar
  .enabledDates=${day => day.getDay() !== 6 && day.getDay() !== 0}
  .minDate="${new Date()}"
  .maxDate="${new Date('2019/12/09')}"
>
</lion-calendar>
```
