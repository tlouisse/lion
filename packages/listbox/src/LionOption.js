import { html, css } from '@lion/core';
import { FormControlMixin, InteractionStateMixin } from '@lion/field';
import { ChoiceInputMixin } from '@lion/choice-input';
import { LitElement } from 'lit-element';

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option
 * Can be a child of datalist/select, or role="listbox"
 *
 * Element gets state supplied externally, reflects this to attributes,
 * enabling Subclassers to style based on those states
 */
export class LionOption extends ChoiceInputMixin(InteractionStateMixin(LitElement)) {
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
   * Let the order of adding ids to aria element by DOM order, so that the screen reader
   * respects visual order when reading:
   * https://developers.google.com/web/fundamentals/accessibility/focus/dom-order-matters
   * @param {array} descriptionElements - holds references to description or label elements whose
   * id should be returned
   * @returns {array} sorted set of elements based on dom order
   *
   * TODO: make this method part of a more generic mixin or util and also use for lion-field
   */
  static _getAriaElementsInRightDomOrder(descriptionElements) {
    const putPrecedingSiblingsAndLocalParentsFirst = (a, b) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
      const pos = a.compareDocumentPosition(b);
      if (pos === Node.DOCUMENT_POSITION_PRECEDING || pos === Node.DOCUMENT_POSITION_CONTAINED_BY) {
        return 1;
      }
      return -1;
    };

    const descriptionEls = descriptionElements.filter(el => el); // filter out null references
    return descriptionEls.sort(putPrecedingSiblingsAndLocalParentsFirst);
  }

  // Returns dom references to all elements that should be referred to by field(s)
  _getAriaDescriptionElements() {
    return [this.helpTextElement, this.feedbackElement];
  }

  /**
   * Meant for Application Developers wanting to add to aria-labelledby attribute.
   * @param {string} id - should be the id of an element that contains the label for the
   * concerned field or fieldset, living in the same shadow root as the host element of field or
   * fieldset.
   */
  addToAriaLabel(id) {
    this._ariaLabelledby += ` ${id}`;
  }

  /**
   * Meant for Application Developers wanting to add to aria-describedby attribute.
   * @param {string} id - should be the id of an element that contains the label for the
   * concerned field or fieldset, living in the same shadow root as the host element of field or
   * fieldset.
   */
  addToAriaDescription(id) {
    this._ariaDescribedby += ` ${id}`;
  }

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
