import { storiesOf, html } from '@open-wc/demoing-storybook';
import { css } from '@lion/core';

import '../../button/lion-button.js';
import '../lion-pointing-frame.js';

const popupDemoStyle = css`
  .demo-box {
    margin: 240px auto 240px 240px;
  }
`;

storiesOf('Pointing Frame|Pointing Frame', module)
  .add('Test', () => {
    const clickHandler = {
      handleEvent(e) {
        const popup = e.target.nextElementSibling.firstElementChild;
        const positions = [
          'center-of-top',
          'right-of-top',
          'top-of-right',
          'center-of-right',
          'bottom-of-right',
          'right-of-bottom',
          'center-of-bottom',
          'left-of-bottom',
          'bottom-of-left',
          'center-of-left',
          'top-of-left',
          'left-of-top',
        ];
        positions.some((pos, index) => {
          if (popup.position === pos) {
            if (index === positions.length - 1) {
              [popup.position] = positions;
            } else {
              popup.position = positions[index + 1];
            }
            return true;
          }
          return false;
        });
        // Clicking toggle triggers the hideOnOutsideClick of popup, so re-show it!
        setTimeout(popup._show, 1);
      },
    };

    return html`
      <style>
        ${popupDemoStyle} .my-content {
          border: 1px solid black;
          padding: 5px;
        }
      </style>
      <button @click=${clickHandler}>Toggle position</button>
      <div class="demo-box">
        <lion-popup id="myPopup" position="left-of-top">
          <lion-pointing-frame
            style="outline: 1px solid pink; width: 300px;"
            slot="content"
            class="popup pointing-frame"
          >
            <div class="my-content">
              <div>Hello, Planet!!!!!!!!!!!!!!</div>
              <div>Hello, Planet!</div>
              <div>Hello, Planet!</div>
              <div>Hello, Planet!</div>
              <div>Hello, Planet!</div>
              <div>Hello, Planet!</div>
            </div>
          </lion-pointing-frame>
          <button style="width: 100px; height: 100px;" slot="invoker">Click me!</button>
        </lion-popup>
      </div>
    `;
  })
  .add(
    'Test Small invoker',
    () =>
      html`
        <style>
          ${popupDemoStyle} .my-content {
            border: 1px solid black;
            padding: 5px;
          }
        </style>
        <div class="demo-box">
          <lion-popup position="left-of-top">
            <lion-pointing-frame
              style="outline: 1px solid pink;"
              slot="content"
              class="popup pointing-frame"
            >
              <div class="my-content">
                <div>Hello, Planet!!!!!!!!!!!!!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
              </div>
            </lion-pointing-frame>
            <button style="width: 30px; height: 20px;" slot="invoker">Cl!</button>
          </lion-popup>
        </div>
      `,
  )
  .add(
    'Test Big invoker',
    () =>
      html`
        <style>
          ${popupDemoStyle} .my-content {
            border: 1px solid black;
            padding: 5px;
          }
        </style>
        <div class="demo-box">
          <lion-popup position="center-of-bottom">
            <lion-pointing-frame
              style="outline: 1px solid pink;"
              slot="content"
              class="popup pointing-frame"
            >
              <div class="my-content">
                <div>Hello, Planet!!!!!!!!!!!!!!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
                <div>Hello, Planet!</div>
              </div>
            </lion-pointing-frame>
            <button style="width: 100px; height: 100px;" slot="invoker">Click me!</button>
          </lion-popup>
        </div>
      `,
  )
  .add(
    'Top',
    () =>
      html`
        <style>
          ${popupDemoStyle} .my-content {
            border: 1px solid black;
            padding: 5px;
          }
        </style>
        <div class="demo-box">
          <lion-popup position="right-of-top">
            <lion-button slot="invoker">Top right</lion-button>
            <lion-pointing-frame slot="content" class="popup pointing-frame">
              <div class="my-content">
                <div>Hello, Planet!</div>
              </div>
            </lion-pointing-frame>
          </lion-popup>
        </div>
      `,
  )
  .add(
    'Bottom',
    () =>
      html`
        <style>
          ${popupDemoStyle} .my-content {
            border: 1px solid black;
            padding: 5px;
          }
        </style>
        <div class="demo-box">
          <lion-popup position="right-of-bottom">
            <lion-button slot="invoker">Bottom right</lion-button>
            <lion-pointing-frame slot="content" class="popup pointing-frame">
              <div class="my-content">
                <div>Hello, Planet!</div>
              </div>
            </lion-pointing-frame>
          </lion-popup>
        </div>
      `,
  )
  .add(
    'Left',
    () =>
      html`
        <style>
          ${popupDemoStyle} .my-content {
            border: 1px solid black;
            padding: 5px;
          }
        </style>
        <div class="demo-box">
          <lion-popup position="center-of-left">
            <lion-button slot="invoker">Center left</lion-button>
            <lion-pointing-frame slot="content" class="popup pointing-frame">
              <div class="my-content">
                <div>Hello, Planet!</div>
              </div>
            </lion-pointing-frame>
          </lion-popup>
        </div>
      `,
  )
  .add(
    'Right',
    () =>
      html`
        <style>
          ${popupDemoStyle} .my-content {
            border: 1px solid black;
            padding: 5px;
          }
        </style>
        <div class="demo-box">
          <lion-popup position="center-of-right">
            <lion-button slot="invoker">Center right</lion-button>
            <lion-pointing-frame slot="content" class="popup pointing-frame">
              <div class="my-content">
                <div>Hello, Planet!</div>
              </div>
            </lion-pointing-frame>
          </lion-popup>
        </div>
      `,
  );
