import { storiesOf, html } from '@open-wc/demoing-storybook';
import { css } from '@lion/core';

import '../lion-option.js';

storiesOf('Forms|Option', module)
  .add(
    'States',
    () => html`
      <lion-option>Default</lion-option><br />
      <lion-option disabled>Disabled</lion-option>
      <lion-option>
        <p style="color: red;">With html</p>
        <p>and multi Line</p>
      </lion-option>
    `,
  )
  .add(
    'Values',
    () => html`
      <lion-option .modelValue=${{ value: 10, checked: false }}>setting modelValue</lion-option>
      <lion-option .modelValue=${{ value: 10, checked: true }}
        >setting modelValue checked</lion-option
      >
      <lion-option .choiceValue=${10}>setting choiceValue</lion-option>
      <lion-option .choiceValue=${10} checked>setting choiceValue checked</lion-option>
    `,
  );
