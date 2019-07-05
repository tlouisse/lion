/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

function uuid() {
  return Math.random().toString(36).substr(2, 10);
}

/**
 * @desc
 * Depends on GroupMixin. Should be applied on top of `FormControl`
 *
 */
// eslint-disable-next-line no-shadow
export const ListboxMixin = superclass => class ListboxMixin extends superclass {

  static get properties() {
    return {
      ...super.properties,
      /**
       * Whether one or multiple options can be checked
       */
      multiselectable: {
        type: Boolean,
        reflect: true,
      },
      /**
       * Automatically select active items on [up] and [down] keys
       */
      autoSelect: {
        type: Boolean,
        attribute: 'auto-select',
      }
    }
  }

  constructor() {
    super();

    this.autoSelect = true; // TODO: change default to false? Aligns with platform and uic... 
    this._listboxActiveDescendant = null;

    this.__listboxOnKeyDown = this.__listboxOnKeyDown.bind(this);
    this.__listboxOnOptionClick = this.__listboxOnOptionClick.bind(this);
    this.__listboxSetupActive = this.__listboxSetupActive.bind(this);
  }

  /**
   * To be implemented by implementing layer.
   */
  get _listboxNode() {} // eslint-disable-line

  get _listboxActiveDescendantNode() {
    return this._listboxNode.querySelector(`#${this._listboxActiveDescendant}`);
  }

  connectedCallback() {
    super.connectedCallback();
    this._listboxNode.role = 'listbox';
    this._listboxNode.tabIndex = -1;

    this.addEventListener('keydown', this.__listboxOnKeyDown);
    this._listboxNode.addEventListener('click', this.__listboxOnOptionClick);
    this.updateComplete.then(() => {
      setTimeout(() => {
        this.__listboxSetupActive();
      });
    });

    this.autoSelect = this.multiselectable ? false : this.autoSelect;
  }
  
  _onAfterFormElementRegister(child) {
    super._onAfterFormElementRegister(child);
    child.id = child.id || `${this.localName}-option-${uuid()}`; // eslint-disable-line
  }

  __listboxSetupActive() {
    const selectedOption = this.formElements.find(e => e.checked);
    this.__listboxActivateItem(selectedOption || this.formElements[0]);
  }

  /**
   * @desc
   * Handle various keyboard controls; UP/DOWN will shift focus; SPACE selects
   * an item.
   *
   * @param evt - the keydown event object
   */
  __listboxOnKeyDown(evt) {
    const { key } = evt;

    // We assume 'single select' (see GroupMixin documentation) only for now
    const activeIndex = this.formElements.indexOf(this._listboxActiveDescendantNode);
    const firstItem = this.formElements[0];
    const lastItem = this.formElements[this.formElements.length - 1];
    let nextActiveItem;

    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        evt.preventDefault();
        if (key === 'ArrowUp') {
          nextActiveItem = this.formElements[activeIndex - 1];
        } else {
          nextActiveItem = this.formElements[activeIndex + 1];
        }

        if (nextActiveItem) {
          this.__listboxActivateItem(nextActiveItem);
        }

        break;
      case 'Home':
        evt.preventDefault();
        this.__listboxActivateItem(firstItem);
        break;
      case 'End':
        evt.preventDefault();
        this.__listboxActivateItem(lastItem);
        break;
      case ' ':
      case 'Spacebar':
        evt.preventDefault();
        this.__listboxToggleSelected(nextActiveItem);
        break;
      default:
        break;
    }
  }

  /**
   * @desc
   * Check if an item is clicked on. If so, focus on it and select it.
   *
   * @param evt - the click event object
   */
  __listboxOnOptionClick({ target }) {
    const option = target;
    if (option.getAttribute('role') === 'option') {
      this.__listboxActivateItem(option);
      this.__listboxToggleSelected(option);
    }
  }

  /**
   * @desc
   * Activates the option belonging to specified index
   *
   * @param optionElement- the element to focus
   */
  __listboxActivateItem(optionElement) {
    const option = optionElement;

    this.__listboxDeactivateItem(this._listboxActiveDescendantNode);
    if (this.autoSelect) {
      option.checked = true;
    }
    option.active = true;
    this._listboxNode.setAttribute('aria-activedescendant', option.id);
    this._listboxActiveDescendant = option.id;
    this.__listBoxScrollCorrection(option);
  }

  __listBoxScrollCorrection(option) {
    if (this._listboxNode.scrollHeight > this._listboxNode.clientHeight) {
      const scrollBottom = this._listboxNode.clientHeight + this._listboxNode.scrollTop;
      const optionBottom = option.offsetTop + option.offsetHeight;
      if (optionBottom > scrollBottom) {
        this._listboxNode.scrollTop = optionBottom - this._listboxNode.clientHeight;
      } else if (option.offsetTop < this._listboxNode.scrollTop) {
        this._listboxNode.scrollTop = option.offsetTop;
      }
    }
  }

  /**
   * @desc
   * Deactivates the option belonging to specified index
   *
   * @param optionElement - The option to defocus
   */
  __listboxDeactivateItem(optionElement) {
    const option = optionElement;
    if (!option) {
      return;
    }
    if (this.autoSelect) {
      option.checked = false;
    }
    option.active = false;
  }

  /**
   * @desc
   * Toggle the aria-selected value
   *
   * @param optionElement - the option to select
   */
  __listboxToggleSelected(optionElement) {
    const option = optionElement;

    if (!this.autoSelect) {
      option.checked = !option.checked;
    }
  }
}
