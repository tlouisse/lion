import { css, dedupeMixin, html, nothing, SlotMixin, DisabledMixin } from '@lion/core';
import { getAriaElementsInRightDomOrder } from './utils/getAriaElementsInRightDomOrder.js';
import { Unparseable } from './validate/Unparseable.js';
import { FormRegisteringMixin } from './registration/FormRegisteringMixin.js';

/**
 * @typedef {import('@lion/core').TemplateResult} TemplateResult
 * @typedef {import('@lion/core').CSSResult} CSSResult
 * @typedef {import('@lion/core').CSSResultArray} CSSResultArray
 * @typedef {import('@lion/core').nothing} nothing
 * @typedef {import('@lion/core/types/SlotMixinTypes').SlotsMap} SlotsMap
 * @typedef {import('./validate/LionValidationFeedback').LionValidationFeedback} LionValidationFeedback
 * @typedef {import('../types/choice-group/ChoiceInputMixinTypes').ChoiceInputHost} ChoiceInputHost
 * @typedef {import('../types/FormControlMixinTypes.js').FormControlHost} FormControlHost
 * @typedef {import('../types/FormControlMixinTypes.js').HTMLElementWithValue} HTMLElementWithValue
 * @typedef {import('../types/FormControlMixinTypes.js').FormControlMixin} FormControlMixin
 * @typedef {import('../types/FormControlMixinTypes.js').ModelValueEventDetails} ModelValueEventDetails
 */

/**
 * Generates random unique identifier (for dom elements)
 * @param {string} prefix
 */
function uuid(prefix) {
  return `${prefix}-${Math.random().toString(36).substr(2, 10)}`;
}

/**
 * #FormControlMixin :
 *
 * This Mixin is a shared fundament for all form components, it's applied on:
 * - LionField (which is extended to LionInput, LionTextarea, LionSelect etc. etc.)
 * - LionFieldset (which is extended to LionRadioGroup, LionCheckboxGroup, LionForm)
 * @param {import('@open-wc/dedupe-mixin').Constructor<import('@lion/core').LitElement>} superclass
 * @type {FormControlMixin}
 */
const FormControlMixinImplementation = superclass =>
  // eslint-disable-next-line no-shadow, no-unused-vars
  class FormControlMixin extends FormRegisteringMixin(DisabledMixin(SlotMixin(superclass))) {
    /** @type {any} */
    static get properties() {
      return {
        name: { type: String, reflect: true },
        readOnly: { type: Boolean, attribute: 'readonly', reflect: true },
        label: String, // FIXME: { attribute: false } breaks a bunch of tests, but shouldn't...
        helpText: { type: String, attribute: 'help-text' },
        modelValue: { attribute: false },
        _ariaLabelledNodes: { attribute: false },
        _ariaDescribedNodes: { attribute: false },
        _repropagationRole: { attribute: false },
        _isRepropagationEndpoint: { attribute: false },
      };
    }

    /**
     * The label text for the input node.
     * When no light dom defined via [slot=label], this value will be used.
     * @type {string}
     */
    get label() {
      return this.__label || (this._labelNode && this._labelNode.textContent) || '';
    }

    /**
     * @param {string} newValue
     */
    set label(newValue) {
      const oldValue = this.label;
      /** @type {string} */
      this.__label = newValue;
      this.requestUpdate('label', oldValue);
    }

    /**
     * The helpt text for the input node.
     * When no light dom defined via [slot=help-text], this value will be used
     * @type {string}
     */
    get helpText() {
      return this.__helpText || (this._helpTextNode && this._helpTextNode.textContent) || '';
    }

    /**
     * @param {string} newValue
     */
    set helpText(newValue) {
      const oldValue = this.helpText;
      /** @type {string} */
      this.__helpText = newValue;
      this.requestUpdate('helpText', oldValue);
    }

    /**
     * Will be used in validation messages to refer to the current field
     * @type {string}
     */
    get fieldName() {
      return this.__fieldName || this.label || this.name || '';
    }

    /**
     * @param {string} value
     */
    set fieldName(value) {
      /** @type {string} */
      this.__fieldName = value;
    }

    /**
     * @configure SlotMixin
     */
    get slots() {
      return {
        ...super.slots,
        label: () => {
          const label = document.createElement('label');
          label.textContent = this.label;
          return label;
        },
        'help-text': () => {
          const helpText = document.createElement('div');
          helpText.textContent = this.helpText;
          return helpText;
        },
      };
    }

    /**
     * The interactive (form) element. Can be a native element like input/textarea/select or
     * an element with tabindex > -1
     * @protected
     */
    get _inputNode() {
      return /** @type {HTMLElementWithValue} */ (this.__getDirectSlotChild('input'));
    }

    /**
     * Element where label will be rendered to
     * @protected
     */
    get _labelNode() {
      return /** @type {HTMLElement} */ (this.__getDirectSlotChild('label'));
    }

    /**
     * Element where help text will be rendered to
     * @protected
     */
    get _helpTextNode() {
      return /** @type {HTMLElement} */ (this.__getDirectSlotChild('help-text'));
    }

    /**
     * Element where validation feedback will be rendered to
     * @protected
     */
    get _feedbackNode() {
      return /** @type {LionValidationFeedback} */ (this.__getDirectSlotChild('feedback'));
    }

    constructor() {
      super();

      /**
       * The name the element will be registered with to the .formElements collection
       * of the parent. Also, it serves as the key of key/value pairs in
       *  modelValue/serializedValue objects
       * @type {string}
       */
      this.name = '';

      /**
       * A Boolean attribute which, if present, indicates that the user should not be able to edit
       * the value of the input. The difference between disabled and readonly is that read-only
       * controls can still function, whereas disabled controls generally do not function as
       * controls until they are enabled.
       * (From: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)
       * @type {boolean}
       */
      this.readOnly = false;

      /**
       * The label text for the input node.
       * When no value is defined, textContent of [slot=label] will be used
       * @type {string}
       */
      this.label = '';

      /**
       * The helpt text for the input node.
       * When no value is defined, textContent of [slot=help-text] will be used
       * @type {string}
       */
      this.helpText = '';

      /**
       * The model value is the result of the parser function(when available).
       * It should be considered as the internal value used for validation and reasoning/logic.
       * The model value is 'ready for consumption' by the outside world (think of a Date
       * object or a float). The modelValue can(and is recommended to) be used as both input
       * value and output value of the `LionField`.
       *
       * Examples:
       * - For a date input: a String '20/01/1999' will be converted to new Date('1999/01/20')
       * - For a number input: a formatted String '1.234,56' will be converted to a Number:
       *   1234.56
       */
      // TODO: we can probably set this up properly once propert effects run from firstUpdated
      // this.modelValue = undefined;
      /**
       * Unique id that can be used in all light dom
       * @type {string}
       * @protected
       */
      this._inputId = uuid(this.localName);

      /**
       * Contains all elements that should end up in aria-labelledby of `._inputNode`
       * @type {HTMLElement[]}
       */
      this._ariaLabelledNodes = [];

      /**
       * Contains all elements that should end up in aria-describedby of `._inputNode`
       * @type {HTMLElement[]}
       */
      this._ariaDescribedNodes = [];

      /**
       * Based on the role, details of handling model-value-changed repropagation differ.
       * @type {'child'|'choice-group'|'fieldset'}
       */
      this._repropagationRole = 'child';

      /**
       * By default, a field with _repropagationRole 'choice-group' will act as an
       * 'endpoint'. This means it will be considered as an individual field: for
       * a select, individual options will not be part of the formPath. They
       * will.
       * Similarly, components that (a11y wise) need to be fieldsets, but 'interaction wise'
       * (from Application Developer perspective) need to be more like fields
       * (think of an amount-input with a currency select box next to it), can set this
       * to true to hide private internals in the formPath.
       * @type {boolean}
       */
      this._isRepropagationEndpoint = false;

      this.addEventListener(
        'model-value-changed',
        /** @type {EventListenerOrEventListenerObject} */ (this.__repropagateChildrenValues),
      );
      /** @type {EventListener} */
      this._onLabelClick = this._onLabelClick.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
      this._enhanceLightDomClasses();
      this._enhanceLightDomA11y();
      this._triggerInitialModelValueChangedEvent();

      if (this._labelNode) {
        this._labelNode.addEventListener('click', this._onLabelClick);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._labelNode) {
        this._labelNode.removeEventListener('click', this._onLabelClick);
      }
    }

    /** @param {import('@lion/core').PropertyValues } changedProperties */
    updated(changedProperties) {
      super.updated(changedProperties);

      if (changedProperties.has('_ariaLabelledNodes')) {
        this.__reflectAriaAttr(
          'aria-labelledby',
          this._ariaLabelledNodes,
          this.__reorderAriaLabelledNodes,
        );
      }

      if (changedProperties.has('_ariaDescribedNodes')) {
        this.__reflectAriaAttr(
          'aria-describedby',
          this._ariaDescribedNodes,
          this.__reorderAriaDescribedNodes,
        );
      }

      if (changedProperties.has('label') && this._labelNode) {
        this._labelNode.textContent = this.label;
      }

      if (changedProperties.has('helpText') && this._helpTextNode) {
        this._helpTextNode.textContent = this.helpText;
      }

      if (changedProperties.has('name')) {
        this.dispatchEvent(
          /** @privateEvent */
          new CustomEvent('form-element-name-changed', {
            detail: { oldName: changedProperties.get('name'), newName: this.name },
            bubbles: true,
          }),
        );
      }
    }

    /** @protected */
    _triggerInitialModelValueChangedEvent() {
      this._dispatchInitialModelValueChangedEvent();
    }

    /** @protected */
    _enhanceLightDomClasses() {
      if (this._inputNode) {
        this._inputNode.classList.add('form-control');
      }
    }

    /** @protected */
    _enhanceLightDomA11y() {
      const { _inputNode, _labelNode, _helpTextNode, _feedbackNode } = this;

      if (_inputNode) {
        _inputNode.id = _inputNode.id || this._inputId;
      }
      if (_labelNode) {
        _labelNode.setAttribute('for', this._inputId);
        this.addToAriaLabelledBy(_labelNode, { idPrefix: 'label' });
      }
      if (_helpTextNode) {
        this.addToAriaDescribedBy(_helpTextNode, { idPrefix: 'help-text' });
      }
      if (_feedbackNode) {
        // Generic focus/blur handling that works for both Fields/FormGroups
        this.addEventListener('focusin', () => {
          _feedbackNode.setAttribute('aria-live', 'polite');
        });
        this.addEventListener('focusout', () => {
          _feedbackNode.setAttribute('aria-live', 'assertive');
        });

        this.addToAriaDescribedBy(_feedbackNode, { idPrefix: 'feedback' });
      }
      this._enhanceLightDomA11yForAdditionalSlots();
    }

    /**
     * Enhances additional slots(prefix, suffix, before, after) defined by developer.
     *
     * When boolean attribute data-label or data-description is found,
     * the slot element will be connected to the input via aria-labelledby or aria-describedby
     * @param {string[]} additionalSlots
     * @protected
     */
    _enhanceLightDomA11yForAdditionalSlots(
      additionalSlots = ['prefix', 'suffix', 'before', 'after'],
    ) {
      additionalSlots.forEach(additionalSlot => {
        const element = this.__getDirectSlotChild(additionalSlot);
        if (element) {
          if (element.hasAttribute('data-label')) {
            this.addToAriaLabelledBy(element, { idPrefix: additionalSlot });
          }
          if (element.hasAttribute('data-description')) {
            this.addToAriaDescribedBy(element, { idPrefix: additionalSlot });
          }
        }
      });
    }

    /**
     * Will handle help text, validation feedback and character counter,
     * prefix/suffix/before/after (if they contain data-description flag attr).
     * Also, contents of id references that will be put in the <lion-field>._ariaDescribedby property
     * from an external context, will be read by a screen reader.
     * @param {string} attrName
     * @param {HTMLElement[]} nodes
     * @param {boolean|undefined} reorder
     */
    __reflectAriaAttr(attrName, nodes, reorder) {
      if (this._inputNode) {
        if (reorder) {
          const insideNodes = nodes.filter(n => this.contains(n));
          const outsideNodes = nodes.filter(n => !this.contains(n));

          // eslint-disable-next-line no-param-reassign
          nodes = [...getAriaElementsInRightDomOrder(insideNodes), ...outsideNodes];
        }
        const string = nodes.map(n => n.id).join(' ');
        this._inputNode.setAttribute(attrName, string);
      }
    }

    /**
     * Default Render Result:
     * <div class="form-field__group-one">
     *   <div class="form-field__label">
     *     <slot name="label"></slot>
     *   </div>
     *   <small class="form-field__help-text">
     *     <slot name="help-text"></slot>
     *   </small>
     * </div>
     * <div class="form-field__group-two">
     *   <div class="input-group">
     *     <div class="input-group__before">
     *       <slot name="before"></slot>
     *     </div>
     *     <div class="input-group__container">
     *       <div class="input-group__prefix">
     *         <slot name="prefix"></slot>
     *       </div>
     *       <div class="input-group__input">
     *         <slot name="input"></slot>
     *       </div>
     *       <div class="input-group__suffix">
     *         <slot name="suffix"></slot>
     *       </div>
     *     </div>
     *     <div class="input-group__after">
     *       <slot name="after"></slot>
     *     </div>
     *   </div>
     *   <div class="form-field__feedback">
     *     <slot name="feedback"></slot>
     *   </div>
     * </div>
     */
    render() {
      return html`
        <div class="form-field__group-one">${this._groupOneTemplate()}</div>
        <div class="form-field__group-two">${this._groupTwoTemplate()}</div>
      `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    _groupOneTemplate() {
      return html` ${this._labelTemplate()} ${this._helpTextTemplate()} `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    _groupTwoTemplate() {
      return html` ${this._inputGroupTemplate()} ${this._feedbackTemplate()} `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this
    _labelTemplate() {
      return html`
        <div class="form-field__label">
          <slot name="label"></slot>
        </div>
      `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this
    _helpTextTemplate() {
      return html`
        <small class="form-field__help-text">
          <slot name="help-text"></slot>
        </small>
      `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    _inputGroupTemplate() {
      return html`
        <div class="input-group">
          ${this._inputGroupBeforeTemplate()}
          <div class="input-group__container">
            ${this._inputGroupPrefixTemplate()} ${this._inputGroupInputTemplate()}
            ${this._inputGroupSuffixTemplate()}
          </div>
          ${this._inputGroupAfterTemplate()}
        </div>
      `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this
    _inputGroupBeforeTemplate() {
      return html`
        <div class="input-group__before">
          <slot name="before"></slot>
        </div>
      `;
    }

    /**
     * @return {TemplateResult | nothing}
     * @protected
     */
    _inputGroupPrefixTemplate() {
      return !Array.from(this.children).find(child => child.slot === 'prefix')
        ? nothing
        : html`
            <div class="input-group__prefix">
              <slot name="prefix"></slot>
            </div>
          `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this
    _inputGroupInputTemplate() {
      return html`
        <div class="input-group__input">
          <slot name="input"></slot>
        </div>
      `;
    }

    /**
     * @return {TemplateResult | nothing}
     * @protected
     */
    _inputGroupSuffixTemplate() {
      return !Array.from(this.children).find(child => child.slot === 'suffix')
        ? nothing
        : html`
            <div class="input-group__suffix">
              <slot name="suffix"></slot>
            </div>
          `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this
    _inputGroupAfterTemplate() {
      return html`
        <div class="input-group__after">
          <slot name="after"></slot>
        </div>
      `;
    }

    /**
     * @return {TemplateResult}
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this
    _feedbackTemplate() {
      return html`
        <div class="form-field__feedback">
          <slot name="feedback"></slot>
        </div>
      `;
    }

    /**
     * Used for Required validation and computation of interaction states
     * @param {any} modelValue
     * @return {boolean}
     * @protected
     */
    _isEmpty(modelValue = /** @type {any} */ (this).modelValue) {
      let value = modelValue;
      if (/** @type {any} */ (this).modelValue instanceof Unparseable) {
        value = /** @type {any} */ (this).modelValue.viewValue;
      }

      // Checks for empty platform types: Objects, Arrays, Dates
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        return !Object.keys(value).length;
      }

      // eslint-disable-next-line no-mixed-operators
      // Checks for empty platform types: Numbers, Booleans
      const isNumberValue = typeof value === 'number' && (value === 0 || Number.isNaN(value));
      const isBooleanValue = typeof value === 'boolean' && value === false;

      return !value && !isNumberValue && !isBooleanValue;
    }

    /**
     * States
     * - Use '@state' for attributes that will be placed on the host when a certain condition
     * applies, c.q. a state is active.
     * - Make sure to wrap the name of the state in square brackets.
     *
     * Parts
     * - Use '@part' for elements/blocks
     * - When a part is optional, put '?' in front of its name
     * - Indentations (2 spaces) are used to resemble (required) dom structure
     * - Use '-wrapper' suffix _around_ parts, so `label-wrapper` around `label`
     * - Use '-container' suffix _within_ parts, so `inputgroup-container` within `inputgroup`
     * - Prefer a minimal use of hyphens, like the platform does (so inputgroup instead of
     * input-group). This makes it easier to
     *
     * Slots
     * - Use '@slot' for slot names
     * - When a slot is optional, put '?' in front of its name
     *
     * Refs
     * - Use '@ref' to indicate what parts of the dom are required in order for the component to
     * function properly. Refs are usually the components that:
     *   - contain aria attributes
     *   - interact via events (by sending or receiving them)
     *
     */

    /**
     * // TODO: states should be inherited from mixins
     *
     * @state [disabled]                     when [slot=input] has disabled set to true
     * @state [filled]                       whether [slot=input] has a value
     * @state [prefilled]                    whether [slot=input] had a value on first load
     * @state [touched]                      whether the user had blurred the field once
     * @state [dirty]                        whether the value has changed since initial value
     * @state [focused]                      when [slot=input] has focus
     * @state [focused-visible]              when [slot=input] has focus:within
     *
     * @state [has-feedback-for~=error]      when input has error message(s)
     * @state [shows-feedback-for~=error]    when input has error message(s) that should be shown
     *                                       in [slot=feedback]
     * @state [has-feedback-for~=success]    when input has success message(s)
     * @state [shows-feedback-for~=success]  when input has success message(s) that should be
     *                                       shown in [slot=feedback]
     *
     * @state [size-container-300]
     * @state [size-viewport-600]
     * @state [variant=xyz]
     *
     * @part group1                     wrapper that logically groups other 'main parts' from the
     *                                  template; provides sensible defaults for horizontally
     *                                  aligned FormControls
     * @part group2                     wrapper that logically groups other 'main parts' from the
     *                                  template; provides sensible defaults for horizontally
     *                                  aligned FormControls
     *
     * @part label-wrapper              wrapper element around the projected label
     *   @slot label                    the `<label>` element [slot=input] is labelled by

     *
     * @part ?helptext-wrapper          wrapper element around the projected help-text
     *   @slot ?helptext                optional element [slot=input] is described by
     *
     * @part inputgroup                 container around the input element, including prefixes
     *                                  and suffixes
     *   @part ?inputgroup-before       prefix that resides outside the container
     *     @slot ?before                can be used for buttons, currency indicators etc.;
     *                                  add [data-label] or [data-description] when its contents
     *                                  should add to label and description respectively.
     *   @part inputgroup-container     an inner container: this element contains all styling
     *     @part ?inputgroup-prefix     :first-child in [part=inputgroup-container]
     *       @slot ?prefix              can be used for buttons, currency indicators etc.;
     *                                  add [data-label] or [data-description] when its contents
     *                                  should add to label and description respectively.
     *     @part inputgroup-input       wrapper around [slot=input]
     *       @slot input                this is the focusable interaction element (`<input>`,
     *                                  `<textarea>`, `<select>`, `[role=listbox|combobox|*])
     *     @part ?inputgroup-suffix     :last-child in [part=inputgroup-container]
     *       @slot ?suffix              can be used for buttons, currency indicators etc.;
     *                                  add [data-label] or [data-description] when its contents
     *                                  should add to label and description respectively.
     *     @part ?inputgroup-bottom     placeholder element for additional styling (like an
     *                                  animated line for material design input)
     *   @part ?inputgroup-after        suffix that resides outside the container
     *     @slot ?after                 can be used for buttons, currency indicators etc.;
     *                                  add [data-label] or [data-description] when its contents
     *                                  should add to label and description respectively.
     *
     * @part feedback-wrapper           wrapper around validation feedback message(s)
     *   @slot feedback                 optional element [part=input] is described by
     *
     *
     *
     * @ref [slot=input]                add `<slot name="input">`, referenced via `_inputNode`
     * @ref [slot=label]                add `<slot name="label">`, referenced via `_labelNode`
     * @ref [slot=helptext]             add `<slot name="helptext">`, referenced via `_helptextNode`
     * @ref [slot=feedback]             add `<slot name="feedback">`, referenced via `_feedbackNode`
     *
     */
    static get styles() {
      return [
        css`
          :host {
            display: block;
          }

          :host([hidden]) {
            display: none;
          }

          :host([disabled]) {
            pointer-events: none;
          }

          :host([disabled]) [data-part='label-wrapper'] ::slotted(*),
          :host([disabled]) [data-part='helptext-wrapper'] ::slotted(*) {
            color: var(--disabled-text-color, #767676);
          }

          /***********************
            @part input-group
           *********************/

          [data-part='inputgroup-container'] {
            display: flex;
          }

          [data-part='inputgroup-container-input'] {
            flex: 1;
            display: flex;
          }

          /***** @state [disabled] *****/
          :host([disabled]) [data-part='inputgroup'] ::slotted([slot='input']) {
            color: var(--disabled-text-color, #767676);
          }

          /***********************
            @slot input
           **********************/

          .input-group__container > .input-group__input ::slotted(.form-control) {
            flex: 1 1 auto;
            margin: 0; /* remove input margin in Safari */
            font-size: 100%; /* normalize default input font-size */
          }
        `,
      ];
    }

    /**
     * This function exposes descripion elements that a FormGroup should expose to its
     * children. See FormGroupMixin.__getAllDescriptionElementsInParentChain()
     * @return {Array.<HTMLElement>}
     * @protected
     */
    // Returns dom references to all elements that should be referred to by field(s)
    _getAriaDescriptionElements() {
      return [this._helpTextNode, this._feedbackNode];
    }

    /**
     * Allows to add extra element references to aria-labelledby attribute.
     * @param {HTMLElement} element
     * @param {{idPrefix?:string; reorder?: boolean}} customConfig
     */
    addToAriaLabelledBy(element, { idPrefix = '', reorder = true } = {}) {
      // eslint-disable-next-line no-param-reassign
      element.id = element.id || `${idPrefix}-${this._inputId}`;
      if (!this._ariaLabelledNodes.includes(element)) {
        this._ariaLabelledNodes = [...this._ariaLabelledNodes, element];
        // This value will be read when we need to reflect to attr
        /** @type {boolean} */
        this.__reorderAriaLabelledNodes = Boolean(reorder);
      }
    }

    /**
     * Allows to remove element references from aria-labelledby attribute.
     * @param {HTMLElement} element
     */
    removeFromAriaLabelledBy(element) {
      if (this._ariaLabelledNodes.includes(element)) {
        this._ariaLabelledNodes.splice(this._ariaLabelledNodes.indexOf(element), 1);
        this._ariaLabelledNodes = [...this._ariaLabelledNodes];

        // This value will be read when we need to reflect to attr
        /** @type {boolean} */
        this.__reorderAriaLabelledNodes = false;
      }
    }

    /**
     * Allows to add element references to aria-describedby attribute.
     * @param {HTMLElement} element
     * @param {{idPrefix?:string; reorder?: boolean}} customConfig
     */
    addToAriaDescribedBy(element, { idPrefix = '', reorder = true } = {}) {
      // eslint-disable-next-line no-param-reassign
      element.id = element.id || `${idPrefix}-${this._inputId}`;
      if (!this._ariaDescribedNodes.includes(element)) {
        this._ariaDescribedNodes = [...this._ariaDescribedNodes, element];
        // This value will be read when we need to reflect to attr
        /** @type {boolean} */
        this.__reorderAriaDescribedNodes = Boolean(reorder);
      }
    }

    /**
     * Allows to remove element references from aria-describedby attribute.
     * @param {HTMLElement} element
     */
    removeFromAriaDescribedBy(element) {
      if (this._ariaDescribedNodes.includes(element)) {
        this._ariaDescribedNodes.splice(this._ariaDescribedNodes.indexOf(element), 1);
        this._ariaDescribedNodes = [...this._ariaDescribedNodes];
        // This value will be read when we need to reflect to attr
        /** @type {boolean} */
        this.__reorderAriaLabelledNodes = false;
      }
    }

    /**
     * @param {string} slotName
     * @return {HTMLElement | undefined}
     */
    __getDirectSlotChild(slotName) {
      return /** @type {HTMLElement[]} */ (Array.from(this.children)).find(
        el => el.slot === slotName,
      );
    }

    _dispatchInitialModelValueChangedEvent() {
      // When we are not a fieldset / choice-group, we don't need to wait for our children
      // to send a unified event
      if (this._repropagationRole === 'child') {
        return;
      }

      // Initially we don't repropagate model-value-changed events coming
      // from children. On firstUpdated we re-dispatch this event to maintain
      // 'count consistency' (to not confuse the application developer with a
      // large number of initial events). Initially the source field will not
      // be part of the formPath but afterwards it will.
      /** @type {boolean} */
      this.__repropagateChildrenInitialized = true;
      this.dispatchEvent(
        new CustomEvent('model-value-changed', {
          bubbles: true,
          detail: /** @type {ModelValueEventDetails} */ ({
            formPath: [this],
            initialize: true,
            isTriggeredByUser: false,
          }),
        }),
      );
    }

    /**
     * Hook for Subclassers to add logic before repropagation
     * @configurable
     * @param {CustomEvent} ev
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    _onBeforeRepropagateChildrenValues(ev) {}

    /**
     * @param {CustomEvent} ev
     */
    __repropagateChildrenValues(ev) {
      // Allows sub classes to internally listen to the children change events
      // (before stopImmediatePropagation is called below).
      this._onBeforeRepropagateChildrenValues(ev);
      // Normalize target, we also might get it from 'portals' (rich select)
      const target = (ev.detail && ev.detail.element) || ev.target;
      const isEndpoint =
        this._isRepropagationEndpoint || this._repropagationRole === 'choice-group';

      // Prevent eternal loops after we sent the event below.
      if (target === this) {
        return;
      }

      // A. Stop sibling handlers
      //
      // Make sure our sibling event listeners (added by Application developers) will not get
      // the child model-value-changed event, but the repropagated one at the bottom of this
      // method
      ev.stopImmediatePropagation();

      // B1. Are we still initializing? If so, halt...
      //
      // Stop repropagating children events before firstUpdated and make sure we de not
      // repropagate init events of our children (we already sent our own
      // initial model-value-change event in firstUpdated)
      const isGroup = this._repropagationRole !== 'child'; // => fieldset or choice-group
      const isSelfInitializing = isGroup && !this.__repropagateChildrenInitialized;
      const isChildGroupInitializing = ev.detail && ev.detail.initialize;
      if (isSelfInitializing || isChildGroupInitializing) {
        return;
      }

      // B2. Are we a single choice choice-group? If so, halt when target unchecked
      // and something else is checked, meaning we will get
      // another model-value-changed dispatch for the checked target
      //
      // We only send the checked changed up (not the unchecked). In this way a choice group
      // (radio-group, checkbox-group, select/listbox) acts as an 'endpoint' (a single Field)
      // just like the native <select>
      if (!this._repropagationCondition(target)) {
        return;
      }

      // C1. We are ready to dispatch. Create a formPath
      //
      // Compute the formPath. Choice groups are regarded 'end points'
      let parentFormPath = [];
      if (!isEndpoint) {
        parentFormPath = (ev.detail && ev.detail.formPath) || [target];
      }
      const formPath = [...parentFormPath, this];

      // C2. Finally, redispatch a fresh model-value-changed event from our host, consumable
      // for an Application Developer
      //
      // Since for a11y everything needs to be in lightdom, we don't add 'composed:true'
      this.dispatchEvent(
        new CustomEvent('model-value-changed', {
          bubbles: true,
          detail: /** @type {ModelValueEventDetails} */ ({
            formPath,
            isTriggeredByUser: Boolean(ev.detail?.isTriggeredByUser),
          }),
        }),
      );
    }

    /**
     * Based on provided target, this condition determines whether received model-value-changed
     * event should be repropagated
     * @param {FormControlHost} target
     * @protected
     * @overridable
     */
    // eslint-disable-next-line class-methods-use-this
    _repropagationCondition(target) {
      return Boolean(target);
    }

    /**
     * @overridable
     * A Subclasser should only override this method if the interactive element
     * ([slot=input]) is not a native element(like input, textarea, select)
     * that already receives focus on label click.
     *
     * @example
     * _onLabelClick() {
     *   this._invokerNode.focus();
     * }
     * @protected
     */
    // eslint-disable-next-line class-methods-use-this
    _onLabelClick() {}
  };

export const FormControlMixin = dedupeMixin(FormControlMixinImplementation);
