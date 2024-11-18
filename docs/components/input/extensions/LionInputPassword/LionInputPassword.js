import { LionInput } from '@lion/ui/input.js';
import { html, css } from 'lit';

import { UIBaseElementMixin } from '../shared/UIBaseElement.js';
import { UIPartDirective } from '../shared/UIPartDirective.js';
import {
  assertPresentation,
  assertTextbox,
  assertRegion,
  assertLabel,
} from '../shared/element-assertions.js';

// @ts-expect-error
export class UIInputPartDirective extends UIPartDirective {
  allowedParts = ['root', 'label', 'input', 'feedback'];

  setupFunctions = {
    root({ element }) {
      assertPresentation(element);
    },
    label({ element }) {
      assertLabel(element);
    },
    input({ element }) {
      assertTextbox(element);
    },
    feedback({ element }) {
      assertRegion(element);
    },
  };
}

export class UIInput extends UIBaseElementMixin(LionInput) {
  static properties = {
    placeholder: { type: String },
  };

  get _labelNode() {
    return this.shadowRoot?.querySelector('[data-part="label"]');
  }

  get _inputNode() {
    return this.shadowRoot?.querySelector('[data-part="input"]') || super._inputNode;
  }

  get _feedbackNode() {
    return this.shadowRoot?.querySelector('[data-part="feedback"]');
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    // this._onChange = this._onChange.bind(this);
    this._inputNode.addEventListener('change', this._onChange);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('placeholder')) {
      this._inputNode.placeholder = this.placeholder;
    }
  }

  static _partDirective = UIInputPartDirective;

  static templates = {
    root(context) {
      const { part } = context;

      return html`
        <div ${part('root')}>
          <label ${part('label')}></label>
          <input ${part('input')} />
          <div ${part('feedback')} role="region"></div>
        </div>
      `;
    },
  };
}

export class LionInputPassword extends UIInput {
  type = 'password';

  static styles = [
    css`
      [data-part='root'] {
        flex-direction: column;
        display: flex;
        gap: 1rem;
      }

      [data-part='label'] {
        text-align: center;
        font-weight: bold;
      }

      [data-part='input'] {
        background-color: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(1.25rem);
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        outline: none;
        color: white;
        border: none;
        width: 12rem;
      }

      [data-part='input']::placeholder {
        color: rgba(255, 255, 255, 0.25);
        font-weight: bold;
      }
    `,
  ];

  static templates = {
    root(context) {
      const { part } = context;

      return html`
        <div ${part('root')}>
          <label ${part('label')}></label>
          <input ${part('input')} />
          <div ${part('feedback')} role="region"></div>
        </div>
      `;
    },
  };
}
customElements.define('lion-input-password', LionInputPassword);
/* box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); */
