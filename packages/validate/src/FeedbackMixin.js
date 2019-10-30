/* eslint-disable class-methods-use-this, camelcase, no-param-reassign */

import { dedupeMixin, SlotMixin } from '@lion/core';
import { localize } from '@lion/localize';
import { pascalCase } from './utils/pascal-case.js';
import { SyncUpdatableMixin } from './utils/SyncUpdatableMixin.js';
import '../lion-validation-feedback.js';

/*
 * @desc Handles all UI/dom integration with regard to validation reporting,
 * feedback visibility and accessibility.
 * Should be used on top of ValidateMixin.
 */
export const FeedbackMixin = dedupeMixin(superclass =>
  // eslint-disable-next-line no-unused-vars, no-shadow
  class FeedbackMixin extends SyncUpdatableMixin(SlotMixin(superclass)) {
    static get properties() {
      return {
        /**
         * @desc Derived from the result of _prioritizeAndFilterFeedback
         * @type {boolean}
         * @example
         * FormControl.hasError; // => true
         * FormControl.hasErrorVisible; // => false
         * // Interaction state changes (for instance: user blurs the field)
         * FormControl.hasErrorVisible; // => true
         */
        hasErrorVisible: {
          type: Boolean,
          attribute: 'has-error-visible',
          reflect: true,
        },
        /**
         * Subclassers can enable this to show multiple feedback messages at the same time
         * By default, just like the platform, only one message (with highest prio) is visible.
         */
        _visibleMessagesAmount: Number,

        /**
         * @type {Promise<string>|string} will be passed as an argument to the `.getMessage`
         * method of a Validator. When filled in, this field namme can be used to enhance
         * error messages.
         */
        fieldName: String,
      };
    }

    /**
     * @overridable
     * Adds "._feedbackNode" as described below
     */
    get slots() {
      return {
        ...super.slots,
        feedback: () => document.createElement('lion-validation-feedback'),
      };
    }

    /**
     * @overridable
     * @type {Element} _feedbackNode:
     * Gets a `FeedbackData` object as its input.
     * This element can be a custom made (web) component that renders messages in accordance with
     * the implemented Design System. For instance, it could add an icon in front of a message.
     * The _feedbackNode is only responsible for the visual rendering part, it should NOT contain
     * state. All state will be determined by the outcome of `FormControl.filterFeeback()`.
     * FormControl delegates to individual sub elements and decides who renders what.
     * For instance, FormControl itself is responsible for reflecting error-state and error-show
     * to its host element.
     * This means filtering out messages should happen in FormControl and NOT in `_feedbackNode`
     *
     * - gets a FeedbackData object as input
     * - should know about the FeedbackMessage types('error', 'success' etc.) that the FormControl
     * (having ValidateMixin applied) returns
     * - renders result and
     *
     */
    get _feedbackNode() {
      return this.querySelector('[slot=feedback]');
    }

    /**
     * @abstract get _inputNode()
     */

    constructor() {
      super();
      this.hasErrorVisible = false;
      this._visibleMessagesAmount = 1;

      this._renderFeedback = this._renderFeedback.bind(this);
      this.addEventListener('validate-performed', this._renderFeedback);
    }

    connectedCallback() {
      super.connectedCallback();
      // TODO: move to extending layer
      localize.addEventListener('localeChanged', this._renderFeedback);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      // TODO: move to extending layer
      localize.removeEventListener('localeChanged', this._renderFeedback);
    }

    updateSync(name, oldValue) {
      super.updateSync(name, oldValue);

      if (name === 'hasErrorVisible') {
        // This can't be reflected asynchronously in Safari
        this.__handleA11yErrorVisible();
        this[this.hasErrorVisible ? 'setAttribute' : 'removeAttribute']('has-error-visible', '');
      }
    }

    updated(c) {
      super.updated(c);

      // TODO: Interaction state knowledge should be moved to FormControl...
      ['touched', 'dirty', 'submitted', 'prefilled'].forEach(iState => {
        if (c.has(iState)) {
          this._renderFeedback();
        }
      });
    }

    /**
     * @typedef {object} FeedbackMessage
     * @property {string} message this
     * @property {string} type will be 'error' for messages from default Validators. Could be
     * 'warning', 'info' etc. for Validators with custom types. Needed as a directive for
     * feedbackNode how to render a message of a certain type
     * @property {Validator} [validator] when the message is directly coupled to a Validator
     * (in most cases), this property is filled. When a message is not coupled to a Validator
     * (in case of success feedback which is based on a diff or current and previous validation
     * results), this property can be left empty.
     */

    /**
     * @param {Validator[]} validators list of objects having a .getMessage method
     * @return {FeedbackMessage[]}
     */
    async __getFeedbackMessages(validators) {
      let fieldName = await this.fieldName;
      return Promise.all(
        validators.map(async validator => {
          if (validator.config.fieldName) {
            fieldName = await validator.config.fieldName;
          }
          const message = await validator._getMessage({
            validatorParams: validator.param,
            modelValue: this.modelValue,
            formControl: this,
            fieldName,
          });
          return { message, type: validator.type, validator };
        }),
      );
    }

    /**
     * @desc Responsible for retrieving messages from Validators and
     * (delegation of) rendering them.
     *
     * For `._feedbackNode` (extension of LionValidationFeedback):
     * - retrieve messages from highest prio Validators
     * - provide the result to custom feedback node and let the
     * custom node decide on their renderings
     *
     * In both cases:
     * - we compute the 'show' flag (like 'hasErrorVisible') for all types
     * - we set the customValidity message of the highest prio Validator
     * - we set aria-invalid="true" in case hasErrorVisible is true
     */
    async _renderFeedback() {
      let feedbackCompleteResolve;
      this.feedbackComplete = new Promise(resolve => {
        feedbackCompleteResolve = resolve;
      });

      /** @type {Validator[]} */
      this.__prioritizedResult = this._prioritizeAndFilterFeedback({
        validationResult: this.__validationResult,
      });

      const messageMap = await this.__getFeedbackMessages(this.__prioritizedResult);

      this._feedbackNode.feedbackData = messageMap.length ? messageMap : undefined;
      this.__storeTypeVisibilityOnInstance(this.__prioritizedResult);
      feedbackCompleteResolve();
    }

    __storeTypeVisibilityOnInstance(prioritizedValidators) {
      const result = {};
      this.__validatorTypeHistoryCache.forEach(previouslyStoredType => {
        result[`has${pascalCase(previouslyStoredType)}Visible`] = false;
      });

      prioritizedValidators.forEach(v => {
        result[`has${pascalCase(v.type)}Visible`] = true;
      });

      Object.assign(this, result);
    }

    /**
     * @overridable
     * @desc Orders all active validators in this.__validationResult. Can
     * also filter out occurrences (based on interaction states)
     * @returns {Validator[]} ordered list of Validators with feedback messages visible to the
     * end user
     */
    _prioritizeAndFilterFeedback({ validationResult }) {
      const types = this.constructor.validationTypes;
      // Sort all validators based on the type provided.
      const res = validationResult.sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type));
      return res.slice(0, this._visibleMessagesAmount);
    }

    __handleA11yErrorVisible() {
      // Screen reader output should be in sync with visibility of error messages
      if (this._inputNode) {
        this._inputNode.setAttribute('aria-invalid', this.hasErrorVisible);
        // this._inputNode.setCustomValidity(this._validationMessage || '');
      }
    }
  }
);
