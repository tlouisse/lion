import { html, css, LitElement } from '@lion/core';
import { LocalOverlayController, overlays } from '@lion/overlays';
import { FormControlMixin } from '@lion/field';
import { ValidateMixin } from '@lion/validate';

import { ListboxMixin } from './ListboxMixin.js';
import { GroupMixin } from './GroupMixin.js';

import '../lion-listbox-invoker.js';

/**
 * LionSelectRich: wraps the <lion-listbox> element
 *
 * @customElement
 * @extends LionField
 */
export class LionSelectRich extends ValidateMixin(FormControlMixin(ListboxMixin(GroupMixin((LitElement))))) {
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

  get _listboxNode() {
    return this.querySelector('lion-options');
  }

  constructor() {
    super();
    this.__onModelValueChanged = this.__onModelValueChanged.bind(this);
  }

  connectedCallback() {
    super.connectedCallback(); // eslint-disable-line wc/guard-super-call
    this.addEventListener('model-value-changed', this.__onModelValueChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback(); // eslint-disable-line wc/guard-super-call
    this.removeEventListener('model-value-changed', this.__onModelValueChanged);
  }

  /**
   * @override from GroupMixin
   */
  _onBeforeFormElementRegister(childElement) {
    const child = childElement;
    super._onBeforeFormElementRegister(child);
    if (this.formElements.length === 0) {
      child.checked = true;
      child.resetInteractionState();
    }
  }

  /**
   * @override from GroupMixin
   */
  _onAfterFormElementRegister(child) {
    super._onAfterFormElementRegister(child)
    this.__onModelValueChanged({ target: child });
  }

  __listboxUnCheckOthers(option) {
    if (option.checked) {
      this.formElements.forEach(opt => {
        if (opt !== option) {
          opt.checked = false;
        }
      });
    }
  }

  __onModelValueChanged({ target }) {
    // Uncheck others if not multiselect. TODO: move to listbox
    this.__listboxUnCheckOthers(target);

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

  get dirty() {
    return this._anyFormElementHas('dirty');
  }

  _anyFormElementHas(property) {
    return Boolean(this.formElements.filter(e => e[property]).length);
    // return Object.keys(this.formElements).some(name => {
    //   if (Array.isArray(this.formElements[name])) {
    //     return this.formElements[name].some(el => !!el[property]);
    //   }
    //   return !!this.formElements[name][property];
    // });
  }
}
