import { storiesOf, html } from '@open-wc/demoing-storybook';

import './POCs/two-month.js';

storiesOf('Calendar|Extension Possibilities', module).add('2 Month POC', () => {
  return html`
    <style>
      .wrapper {
        width: 300px;
        border: 1px solid #adadad;
        box-shadow: 0 0 16px #ccc;
      }
    </style>

    <div class="wrapper">
      <two-month></two-month>
    </div>
  `;
});
