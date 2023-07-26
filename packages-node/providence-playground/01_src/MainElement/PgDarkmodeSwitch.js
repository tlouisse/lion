import { html, css } from 'lit';
import { LionSwitchButton, LionSwitch } from '@lion/ui/switch.js';
import darkIcon from '../core/icons/dark.svg.js';
import lightIcon from '../core/icons/light.svg.js';
import globalCss from '../core/global.css.js';

export class PgDarkmodeButton extends LionSwitchButton {
  static styles = [
    ...super.styles,
    globalCss,
    css`
      :host([checked]) .light {
        display: none;
      }

      :host(:not([checked])) .dark {
        display: none;
      }

      .btn {
        border-radius: var(--size-4);
        outline: 1px solid var(--text-2);
      }

      .switch-button__track,
      .switch-button__thumb {
        border-radius: inherit;
        outline: none !important;
      }
    `,
  ];

  render() {
    return html`
      <div class="btn">
        <div class="switch-button__track surface-2"></div>
        <div class="switch-button__thumb surface-4 -icon-wrapper">
          <span class="light">${lightIcon}</span>
          <span class="dark">${darkIcon}</span>
        </div>
      </div>
    `;
  }
}

export class PgDarkmodeSwitch extends LionSwitch {
  static scopedElements = {
    ...super.scopedElements,
    'lion-switch-button': PgDarkmodeButton,
  };
}

// We patch the prototype of LionSwitchButton in order to change its template
// TODO: in the future, expose this decoration in a more user friendly way, having access to
// relevant renderData as well

// N.B. since this is a switch specifically for dark mode, normally we would have created an extension for this
// This just shows how we can decorate the visual idenity of a component without extending it (allowing you not having to rewrite complex templates that are already semantcially correct), today

// LionSwitchButton.prototype.render = function render() {
//   return html`
//     <div class="btn">
//       <div class="switch-button__track surface-2"></div>
//       <div class="switch-button__thumb surface-4 -icon-wrapper">
//         <span class="light">${lightIcon}</span>
//         <span class="dark">${darkIcon}</span>
//       </div>
//     </div>
//   `;
// };

// Object.defineProperty(LionSwitchButton, 'styles', {
//   value: [
//     ...LionSwitchButton.styles,
//     globalCss,
//     css`
//       :host([checked]) .light {
//         display: none;
//       }

//       :host(:not([checked])) .dark {
//         display: none;
//       }

//       .btn {
//         border-radius: var(--size-4);
//         outline: 1px solid var(--text-2);
//       }

//       .switch-button__track,
//       .switch-button__thumb {
//         border-radius: inherit;
//         outline: none !important;
//       }
//     `,
//   ],
//   writable: false,
// });
