import { storiesOf, html } from '@open-wc/demoing-storybook';
import { css } from '@lion/core';

import '../lion-calendar.js';

const calendarDemoStyle = css`
  .demo-calendar {
    border: 1px solid #adadad;
    box-shadow: 0 0 16px #ccc;
    max-width: 500px;
  }
`;

storiesOf('Calendar|Standalone', module)
  .add(
    'default',
    () => html`
      <style>
        ${calendarDemoStyle}
      </style>

      <lion-calendar class="demo-calendar"></lion-calendar>
    `,
  )
  .add('selectedDate', () => {
    const today = new Date();
    const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    return html`
      <style>
        ${calendarDemoStyle}
      </style>

      <lion-calendar class="demo-calendar" .selectedDate="${selectedDate}"></lion-calendar>
    `;
  })
  .add('minDate', () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);
    return html`
      <style>
        ${calendarDemoStyle}
      </style>

      <lion-calendar class="demo-calendar" .minDate="${minDate}"></lion-calendar>
    `;
  })
  .add('maxDate', () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    return html`
      <style>
        ${calendarDemoStyle}
      </style>

      <lion-calendar class="demo-calendar" .maxDate="${maxDate}"></lion-calendar>
    `;
  })
  .add(
    'enabledDates',
    () => html`
      <style>
        ${calendarDemoStyle}
      </style>

      <lion-calendar
        class="demo-calendar"
        .enabledDates=${day => day.getDay() !== 6 && day.getDay() !== 0}
      ></lion-calendar>
    `,
  )
  .add('combined disabled dates', () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    return html`
      <style>
        ${calendarDemoStyle}
      </style>

      <lion-calendar
        class="demo-calendar"
        .enabledDates=${day => day.getDay() !== 6 && day.getDay() !== 0}
        .minDate="${new Date()}"
        .maxDate="${maxDate}"
      ></lion-calendar>
    `;
  });
