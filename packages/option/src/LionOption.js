import { html, css } from '@lion/core';
// import { FormControlMixin } from '@lion/field';
import { ChoiceInputMixin } from '@lion/choice-input';
import { LitElement } from 'lit-element';

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option
 * Can be a child of datalist/select, or role="listbox"
 *
 * Element gets state supplied externally, reflects this to attributes,
 * enabling Subclassers to style based on those states
 */
export class LionOption extends ChoiceInputMixin(LitElement) {
  static get properties() {
    return {
      disabled: {
        type: Boolean,
        reflect: true,
      },
    };
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          padding: 4px;
          background: #f3f3f3;
          border: 1px solid #333;
        }

        :host(.state-checked) {
          background: lightblue;
        }

        :host(.state-disabled) {
          color: lightgray;
        }
      `,
    ];
  }

  constructor() {
    super();
    this.disabled = false;
  }

  render() {
    return html`
      <div class="choice-field__graphic-container">
        ${this.choiceGraphicTemplate()}
      </div>
      <div class="choice-field__label">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'option');

    // forked from FormControlMixin for now => should be a common mixin?
    this._registerFormElement();
    this._requestParentFormGroupUpdateOfResetModelValue();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('modelValue')) {
      const string = this.modelValue.checked === true ? 'true' : 'false';
      this.setAttribute('aria-selected', string);
    }
    if (changedProperties.has('disabled')) {
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    }
  }

  /************************** FORKED for now :( ***************************/


  /**
   * Fires a registration event in the next frame.
   *
   * Why next frame?
   * if ShadyDOM is used and you add a listener and fire the event in the same frame
   * it will not bubble and there can not be cought by a parent element
   * for more details see: https://github.com/Polymer/lit-element/issues/658
   * will requires a `await nextFrame()` in tests
   */
  _registerFormElement() {
    this.updateComplete.then(() => {
      this.dispatchEvent(
        new CustomEvent('form-element-register', {
          detail: { element: this },
          bubbles: true,
        }),
      );
    });
  }

  /**
   * Makes sure our parentFormGroup has the most up to date resetModelValue
   * FormGroups will call the same on their parentFormGroup so the full tree gets the correct
   * values.
   *
   * Why next frame?
   * @see {@link this._registerFormElement}
   */
  _requestParentFormGroupUpdateOfResetModelValue() {
    this.updateComplete.then(() => {
      if (this.__parentFormGroup) {
        this.__parentFormGroup._updateResetModelValue();
      }
    });
  }
}
