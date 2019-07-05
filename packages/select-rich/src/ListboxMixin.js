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
      dautoSelect: {
        type: Boolean,
        attribute: 'auto-select',
      }
    }
  }

  constructor() {
    super();

    // Config for the listboxElement that can be overridden
    this._listboxConfig = {
      // multiselectable : false,
      // moveUpDownEnabled : false,
      // siblingList : null,
      // upButton : null,
      // downButton : null,
      // moveButton : null,
      // keysSoFar : '',
      // handleFocusChange : () => {},
      // handleItemChange : (event, items) => {},
    };

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
    // if (this.multiselectable) {
    //   this._listboxNode.setAttribute('aria-multiselectable', '');
    // }

    this.addEventListener('keydown', this.__listboxOnKeyDown);
    this._listboxNode.addEventListener('click', this.__listboxOnOptionClick);
    // this._listboxNode.addEventListener('focus', this.__listboxSetupActive);
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
    // const activeIndex = this.formElements.indexOf(this._listboxActiveDescendantNode);
    console.log('selectedOption', selectedOption)

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
    // let nextItem = this._listboxNode.querySelector(`#${this._listboxActiveDescendant}`);

    // // TODO: // get info from context, no need for expensive queries every keypress
    // const itemList = [].slice.call(this._listboxNode.querySelectorAll('[role="option"]'));
    // const nextItemIndex = itemList.indexOf(nextItem);

    // if (!nextItem) {
    //   return;
    // }

    // We assume 'single select' (see GroupMixin documentation) only for now
    const activeIndex = this.formElements.indexOf(this._listboxActiveDescendantNode);
    const firstItem = this.formElements[0];
    const lastItem = this.formElements[this.formElements.length - 1];
    let nextActiveItem;

    console.log('activeIndex', activeIndex, this._listboxActiveDescendantNode);

    switch (key) {
      // case 'PageUp':
      // case 'PageDown':
      //   if (this.moveUpDownEnabled) {
      //     evt.preventDefault();

      //     if (key === 'PageUp') {
      //       this.moveUpItems();
      //     } else {
      //       this.moveDownItems();
      //     }
      //   }

      //   break;
      case 'ArrowUp':
      case 'ArrowDown':
        evt.preventDefault();

        // if (this.moveUpDownEnabled && evt.altKey) {
        //   if (key === 'ArrowUp') {
        //     this.moveUpItems();
        //   } else {
        //     this.moveDownItems();
        //   }
        //   return;
        // }

        if (key === 'ArrowUp') {
          // nextItem = itemList[nextItemIndex - 1];
          // this.modelValue[selectedIndex].checked = false;
          // this.modelValue[selectedIndex - 1].checked = true;
          nextActiveItem = this.formElements[activeIndex - 1];
        } else {
          // nextItem = itemList[nextItemIndex + 1];
          // this.modelValue[selectedIndex].checked = false;
          // this.modelValue[selectedIndex + 1].checked = true;
          nextActiveItem = this.formElements[activeIndex + 1];
        }

        if (nextActiveItem) {
          console.log('nextActiveItem', nextActiveItem, activeIndex);
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
      case 'Backspace':
      case 'Delete':
      case 'Enter':
        // if (!this.moveButton) {
        //   return;
        // }

        // const keyshortcuts = this.moveButton.getAttribute('aria-keyshortcuts');
        // if (key === 'Enter' && keyshortcuts.indexOf('Enter') === -1) {
        //   return;
        // }
        // if ((key === 'Backspace' || key === 'Delete') && keyshortcuts.indexOf('Delete') === -1) {
        //   return;
        // }

        // evt.preventDefault();

        // let nextUnselected = nextItem.nextElementSibling;
        // while (nextUnselected) {
        //   if (nextUnselected.getAttribute('aria-selected') != 'true') {
        //     break;
        //   }
        //   nextUnselected = nextUnselected.nextElementSibling;
        // }
        // if (!nextUnselected) {
        //   nextUnselected = nextItem.previousElementSibling;
        //   while (nextUnselected) {
        //     if (nextUnselected.getAttribute('aria-selected') != 'true') {
        //       break;
        //     }
        //     nextUnselected = nextUnselected.previousElementSibling;
        //   }
        // }

        // this.moveItems();

        // if (!this._listboxActiveDescendant && nextUnselected) {
        //   this.__listboxActivateItem(nextUnselected);
        // }
        break;
      default:
        // const itemToFocus = this.findItemToFocus(key);
        // if (itemToFocus) {
        //   this.__listboxActivateItem(itemToFocus);
        // }
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
    console.log('this._listboxActiveDescendant', this._listboxActiveDescendant, option);

    this.__listBoxScrollCorrection(option);

    // if (!this.multiselectable && this.moveButton) {
    //   this.moveButton.setAttribute('aria-disabled', false);
    // }

    // this.checkUpDownButtons();
    // this.handleFocusChange(option);
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
    console.log('__listboxDeactivateItem', option);

    if (!option) {
      return;
    }
    if (this.autoSelect) {

      // option.removeAttribute('aria-selected');
      option.checked = false;
    }
    // option.removeAttribute('focused');
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

      // if (this.moveButton) {
      //   if (this.listboxNode.querySelector('[aria-selected="true"]')) {
      //     this.moveButton.setAttribute('aria-disabled', 'false');
      //   } else {
      //     this.moveButton.setAttribute('aria-disabled', 'true');
      //   }
      // }
    }
  }
}

// Here we add everything related to arrangable option listboxes
export const ListboxArrangableMixin = superclass => class GroupMixin extends ListboxMixin(superclass) {

}