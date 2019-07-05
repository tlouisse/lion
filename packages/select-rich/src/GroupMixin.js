/**
 * @desc Does all the bookkeeping for child form controls and stores those in `.formElements`.
 * 
 * It is the fundament for the `Fieldset` and it wraps 'choice groups' 
 * (groups wrapping choice elements like radio, checkbox, option that extend ChoiceInputMixin).
 * - `RadioGroup`
 * - `CheckboxGroup`
 * - `Listbox`
 * - `Select`(-rich)
 * - `Combobox`
 * 
 * There are two modes:
 * ## Fieldset mode
 * In this case, `.formElements` behaves like an object.
 * In the fieldset mode, many 'regular' child input elements will be wrapped, like:
 * 
 * ```html
 * <lion-fieldset name="fieldset">
 *  <lion-input name="x"></lion-input>
 *  <lion-input name="y"></lion-input>
 * </lion-fieldset>
 * ```
 * `x` and `z` will be avaiable under `.modelValue.x` and `.modelValue.y`.
 * 
 * 
 * ## Choice Group mode
 * In this case, `.formElements` behaves like an array.
 * (currently, CheckboxGroup and RadioGroup still require `.formElements['name[]']` notation, 
 * but this will be corrected in a future breaking release).
 * <!-- Suggestion: provide deprecation path by introducing `.formControls`? -->
 * 
 * Note: code below is pseudo code and doesn't reflect real elements.
 * ```html
 * <choice-group name="choiceGroup">
 *  <lion-choice></lion-choice>
 *  <lion-choice></lion-choice>
 * </choice-radio-group>
 * ```
 * Children will be available under `.modelValue[0]` and `.modelValue[1]`.
 * 
 * 
 * ### Sub modes
 * - single select
 * In this case there is a property `.checkedValue` which will be the modelValue of the selected.
 * 
 * - multiselect
 * In this case there is a property `.checkedValues` which will be an array of selected 
 * modelValues.
 * 
 * 
 * 
 */
export const GroupMixin = superclass =>
// eslint-disable-next-line no-shadow
  class GroupMixin extends superclass {

    // when formElements is object, this is needed
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
      super.connectedCallback(); // eslint-disable-line wc/guard-super-call
      this.addEventListener('form-element-register', this.__onFormElementRegister);
      this.addEventListener('form-element-unregister', this.__onFormElementUnRegister);
    }
  
    disconnectedCallback() {
      super.disconnectedCallback(); // eslint-disable-line wc/guard-super-call
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

      this._onBeforeFormElementRegister(child);
      
      this.formElements.push(child);
      // This is a way to let the child element (a lion-fieldset or lion-field) know, about its parent
      child.__parentFormGroup = this;

      this._onAfterFormElementRegister(child);
    }

    /**
     * Hook for parents
     * @param {*} child 
     */
    _onBeforeFormElementRegister(child) {} // eslint-disable-line
      
    /**
     * Hook for parents
     * @param {*} child 
     */
    _onAfterFormElementRegister(child) {} // eslint-disable-line  
  
    _getFromAllFormElements(property) {
      return this.formElements.map( e => e[property]);
    }
  
    // _setValueForAllFormElements(property, value) {
    //   this.formElementsArray.forEach(el => {
    //     el[property] = value; // eslint-disable-line no-param-reassign
    //   });
    // }
  }