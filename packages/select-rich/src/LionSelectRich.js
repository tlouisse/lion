import { html, css, LitElement } from '@lion/core';
import { LocalOverlayController, overlays } from '@lion/overlays';

import '../lion-listbox-invoker.js';

/**
 * LionSelectRich: wraps the <lion-listbox> element
 *
 * @customElement
 * @extends LionField
 */
export class LionSelectRich extends LitElement {
  static get properties() {
    return {
      ...super.properties,
      checkedValue: {
        type: Object,
      },
    };
  }

  // static get styles() {
  //   return [
  //     css`
  //       .input-group__input {
  //         display: block;
  //       }
  //     `,
  //   ];
  // }

  // static get properties() {
  //   return {
  //     ...super.properties,
  //     opened: {
  //       type: Boolean,
  //       reflect: true,
  //     },
  //   };
  // }

  // get modelValue() {
  //   const parentValue = super.modelValue;
  //   return parentValue[`${this.name}-option[]`];
  // }

  // set modelValue(values) {
  //   const valuesForParent = {};
  //   valuesForParent[`${this.name}-option[]`] = values;
  //   super.modelValue = valuesForParent;
  // }

  // get selectElements() {
  //   return this.formElements[`${this.name}-option[]`];
  // }

  // get slots() {
  //   return {
  //     ...super.slots,
  //     invoker: () => {
  //       return document.createElement('lion-listbox-invoker');
  //     },
  //   };
  // }

  // constructor() {
  //   super();
  //   this.opened = false;
  //   this.toggle = this.toggle.bind(this);
  //   this._overlayOnShow = this._overlayOnShow.bind(this);
  //   this._overalyOnHide = this._overalyOnHide.bind(this);
  //   this.__updateInvokerContent = this.__updateInvokerContent.bind(this);
  //   this.__onKeyUp = this.__onKeyUp.bind(this);
  // }

  // get _listboxNode() {
  //   return this.querySelector('[slot=input]');
  // }

  // get _invokerNode() {
  //   return this.querySelector('[slot=invoker]');
  // }

  // connectedCallback() {
  //   super.connectedCallback(); // eslint-disable-line
  //   this.__createDropdownSelect();
  //   this._invokerNode.setAttribute('aria-haspopup', 'listbox');
  // }

  // updated(changedProps) {
  //   super.updated(changedProps);
  //   if (changedProps.has('opened')) {
  //     if (this.opened) {
  //       this.__overlay.show();
  //     } else {
  //       this.__overlay.hide();
  //     }
  //   }
  // }

  // toggle() {
  //   this.opened = !this.opened;
  // }

  // __onFormElementRegister(event) {
  //   const child = event.detail.element;
  //   if (child === this) return; // as we fire and listen - don't handle ourselve
  //   child.name = `${this.name}-option[]`;

  //   super.__onFormElementRegister(event);
  // }

  // __createDropdownSelect() {
  //   this.__overlay = overlays.add(
  //     new LocalOverlayController({
  //       hidesOnEsc: false,
  //       hidesOnOutsideClick: true,
  //       contentNode: this._listboxNode,
  //       invokerNode: this._invokerNode,
  //     }),
  //   );

  //   this._invokerNode.addEventListener('click', this.toggle);
  //   this.__overlay.addEventListener('show', this._overlayOnShow);
  //   this.__overlay.addEventListener('hide', this._overalyOnHide);
  //   this._invokerNode.addEventListener('keydown', this.__onKeyUp, true);

  //   this.addEventListener('checked-value-changed', this.__updateInvokerContent);
  // }

  // _overlayOnShow() {
  //   this.opened = true;
  //   // TODO set aria-expaneded?
  // }

  // _overalyOnHide() {
  //   this.opened = false;
  //   // this._invokerNode.focus(); // not needed as focus never leaves the button?
  // }

  // __updateInvokerContent() {
  //   this._invokerNode.selectedElement = this._getCheckedRadioElement();
  // }

  // /**
  //  * @override
  //  */
  // // eslint-disable-next-line
  // inputGroupInputTemplate() {
  //   return html`
  //     <div class="input-group__input">
  //       <slot name="invoker"></slot>
  //       <slot name="input"></slot>
  //     </div>
  //   `;
  // }

  // /**
  //  * A select should NOT have a role
  //  *
  //  * @override
  //  */
  // // eslint-disable-next-line class-methods-use-this
  // _setRole() {}

  // inputGroupTemplate() {
  //   return html`
  //     <div class="input-group">
  //       ${this.inputGroupBeforeTemplate()}
  //       <div class="input-group__container">
  //         ${this.inputGroupPrefixTemplate()} ${this.inputGroupInputTemplate()}
  //         ${this.inputGroupSuffixTemplate()}
  //       </div>
  //       ${this.inputGroupAfterTemplate()}
  //     </div>
  //   `;
  // }

  // __onKeyUp(ev) {
  //   const index = this.modelValue.findIndex(el => el.checked === true);
  //   ev.preventDefault();
  //   switch (ev.key) {
  //     case 'ArrowUp':
  //       if (index !== 0) {
  //         this.selectElements[index - 1].choiceChecked = true;
  //       }
  //       break;
  //     case 'ArrowDown':
  //       if (index !== this.selectElements.length - 1) {
  //         this.selectElements[index + 1].choiceChecked = true;
  //       }
  //       break;
  //     case 'Enter':
  //       this.toggle();
  //       break;
  //     case 'Escape':
  //       this.opened = false;
  //       break;
  //     /* no default */
  //   }
  // }

  get formElementsArray() {
    return Object.keys(this.formElements).reduce((result, name) => {
      const element = this.formElements[name];
      return result.concat(Array.isArray(element) ? element : [element]);
    }, []);
  }

  constructor() {
    super();
    this.formElements = [];
  }

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this.addEventListener('form-element-register', this.__onFormElementRegister);
    this.addEventListener('form-element-unregister', this.__onFormElementUnRegister);
    this.__onModelValueChanged = this.__onModelValueChanged.bind(this);
    this.addEventListener('model-value-changed', this.__onModelValueChanged);
  }

  disconnectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.disconnectedCallback();
    this.removeEventListener('form-element-register', this.__onFormElementRegister);
    this.removeEventListener('form-element-unregister', this.__onFormElementUnRegister);
    if (this.__parentFormGroup) {
      const event = new CustomEvent('form-element-unregister', {
        detail: { element: this },
        bubbles: true,
      });
      this.__parentFormGroup.dispatchEvent(event);
    }
  }

  isRegisteredFormElement(el) {
    return Object.keys(this.formElements).some(name => el.name === name);
  }

  __onFormElementRegister(event) {
    const child = event.detail.element;

    if (child === this) return; // as we fire and listen - don't add ourselves

    event.stopPropagation();

    if (this.disabled) {
      child.disabled = true;
    }
    if (this.formElements.length === 0) {
      child.checked = true;
    }

    this.formElements.push(child);
    // This is a way to let the child element (a lion-fieldset or lion-field) know, about its parent
    child.__parentFormGroup = this;

    this.__syncToCheckedValue();
    this.__syncModelValue();
  }

  // =============================


  __onModelValueChanged() {
    this.__syncToCheckedValue();
    this.__syncModelValue();
  }

  __syncModelValue(){
    this.modelValue = this._getFromAllFormElements('modelValue');
  }

  __syncToCheckedValue() {
    const el = this._getCheckedRadioElement();
    this.checkedValue = el ? el.modelValue.value : '';
  }

  _getCheckedRadioElement() {
    const filtered = this.formElements.filter(el => el.checked === true);
    return filtered.length > 0 ? filtered[0] : undefined;
  }

  _getFromAllFormElements(property) {
    return this.formElements.map( e => e[property]);
  }

  // _setValueForAllFormElements(property, value) {
  //   this.formElementsArray.forEach(el => {
  //     el[property] = value; // eslint-disable-line no-param-reassign
  //   });
  // }
}
