import { storiesOf, html } from '@open-wc/demoing-storybook';
import { maxDateValidator, minDateValidator, minMaxDateValidator } from '@lion/validate';

import '../lion-input-datepicker.js';

storiesOf('Forms|Input Datepicker', module)
  .add(
    'Default',
    () => html`
      <style>
        /* TODO: add to global overlays */

        .global-overlays {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* TODO: add to Storybook */

        body {
          font-family: Arial, Helvetica, sans-serif;
        }

        /* TODO: add to FormControl */

        lion-input-datepicker input {
          padding: 4px;
        }

        lion-input-datepicker [slot='suffix'] {
          height: 100%;
        }

        lion-input-datepicker {
          margin-bottom: 8px;
        }

        .form-field__label {
          margin-bottom: 2px;
          padding-left: 6px;
          font-weight: bold;
        }
      </style>

      <lion-input-datepicker label="Date" .modelValue=${new Date('2017/06/15')}>
      </lion-input-datepicker>
    `,
  )
  .add(
    'minDateValidator',
    () => html`
      <lion-input-datepicker
        label="MinDate"
        help-text="Enter a date greater than or equal to today"
        .errorValidators=${[minDateValidator(new Date())]}
      >
      </lion-input-datepicker>
    `,
  )
  .add(
    'maxDateValidator',
    () => html`
      <lion-input-datepicker
        label="MaxDate"
        help-text="Enter a date smaller than or equal to today"
        .errorValidators=${[maxDateValidator(new Date())]}
      >
      </lion-input-datepicker>
    `,
  )
  .add(
    'minMaxDateValidator',
    () => html`
      <lion-input-datepicker
        label="MinMaxDate"
        help-text="Enter a date between '2018/05/24' and '2018/06/24'"
        .modelValue=${new Date('2018/05/30')}
        .errorValidators=${[
          minMaxDateValidator({ min: new Date('2018/05/24'), max: new Date('2018/06/24') }),
        ]}
      >
      </lion-input-datepicker>
    `,
  )
  .add(
    'With calendar-heading',
    () => html`
      <lion-input-datepicker
        label="Date"
        .calendarHeading="${'Custom heading'}"
        .modelValue=${new Date()}
      >
      </lion-input-datepicker>
    `,
  )
  .add(
    'Disabled',
    () => html`
      <lion-input-datepicker .disabled="${true}"> </lion-input-datepicker>
    `,
  );
