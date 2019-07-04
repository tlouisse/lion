import { html, css, LitElement } from '@lion/core';
import { LionRadioGroup } from '@lion/radio-group';

export class LionListbox extends LionRadioGroup {
  static get properties() {
    return {
      role: { type: String, reflect: true },
      tabIndex: { type: String, reflect: true, attribute: 'tabindex' },
    };
  }

  get modelValue() {
    // TODO: refactor LionFieldset so name hack is not needed
    const parentValue = super.modelValue;
    return parentValue[`${this.name}-option[]`];
  }

  set modelValue(values) {
    // TODO: refactor LionFieldset so name hack is not needed
    const valuesForParent = {};
    valuesForParent[`${this.name}-option[]`] = values;
    super.modelValue = valuesForParent;
  }

  get listboxElements() {
    return this.formElements[`${this.name}-option[]`];
  }

  __onFormElementRegister(event) {
    const child = event.detail.element;
    if (child === this) return; // as we fire and listen - don't handle ourselve
    // TODO: refactor LionFieldset so name hack is not needed
    child.name = `${this.name}-option[]`;

    super.__onFormElementRegister(event);
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          background: #fff;
          border: 1px solid #ccc;
        }
      `,
    ];
  }

  constructor() {
    super();
    this.role = 'listbox';
    this.tabIndex = 1;
    this.__onKeyUp = this.__onKeyUp.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.__onKeyUp, true);
    this.addEventListener('checked-value-changed', () => {
      debugger;
    });
  }

  render() {
    return html`
      <slot></slot>
    `;
  }

  /**
   * @override
   */
  // eslint-disable-next-line
  inputGroupInputTemplate() {
    return html`
      <div class="input-group__input">
        <slot name="invoker"></slot>
        <slot name="input"></slot>
      </div>
    `;
  }

  /**
   * A select should NOT have a role
   *
   * @override
   */
  // eslint-disable-next-line class-methods-use-this
  _setRole() {}

  inputGroupTemplate() {
    return html`
      <div class="input-group">
        ${this.inputGroupBeforeTemplate()}
        <div class="input-group__container">
          ${this.inputGroupPrefixTemplate()} ${this.inputGroupInputTemplate()}
          ${this.inputGroupSuffixTemplate()}
        </div>
        ${this.inputGroupAfterTemplate()}
      </div>
    `;
  }

  __onKeyUp(ev) {
    const index = this.modelValue.findIndex(el => el.checked === true);
    ev.preventDefault();
    switch (ev.key) {
      case 'ArrowUp':
        if (index !== 0) {
          this.listboxElements[index - 1].choiceChecked = true;
        }
        break;
      case 'ArrowDown':
        if (index !== this.listboxElements.length - 1) {
          this.listboxElements[index + 1].choiceChecked = true;
        }
        break;
      /* no default */
    }
  }
}
