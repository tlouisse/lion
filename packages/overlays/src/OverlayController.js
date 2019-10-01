import './typedef.js';
import { overlays } from './overlays.js';
import '@lion/core/src/differentKeyEventNamesShimIE.js';
import { containFocus } from './utils/contain-focus.js';

async function preloadPopper() {
  return import('popper.js/dist/esm/popper.min.js');
}

const isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);

export class OverlayController extends EventTarget {
  /**
   * @constructor
   * @param {OverlayConfig} primaryConfig usually the 'mobile first' approach: for instance, a
   * centered dialog
   */
  constructor(config) {
    super();

    this._defaultConfig = {
      invokerNode: config.invokerNode,
      contentNode: config.contentNode,
      elementToFocusAfterHide: document.body,
      inheritsInvokerWidth: 'min',

      hasBackdrop: false,
      isBlocking: false,
      preventsScroll: false,
      trapsKeyboardFocus: false,
      hidesOnEsc: false,
      hidesOnOutsideClick: false,
      isModal: false,
      isTooltip: false,

      handlesUserInteraction: false,
      handlesAccessibility: false,
      // syncsFocus: false,

      popperConfig: null,
      viewportConfig: null,
    };

    // Add ourselves to the Overlay Manager
    overlays.add(this);

    // this._delegateApi();
    this.setConfig(config);
  }

  // // deprecated
  // get content() {
  //   return this._contentWrapper;
  // }

  get _rendersToBody() {
    return Boolean(this.viewportConfig);
  }

  /**
   * @desc Element .contentNode will be attached to.
   * If viewportConfig is configured, this will be OverlayManager.globalRootNode
   * If popperConfig is configured, this will be a sibling node of invokerNode
   */
  get _renderTarget() {
    return this._rendersToBody ? this.manager.globalRootNode : this.__originalContentParent;
  }

  /**
   * @desc Allows to dynamically change the overlay configuration. Needed in case the
   * presentation of the overlay changes depending on screen size
   * @param {OverlayConfig} config
   */
  setConfig(config) {
    this._handleFeatures({ teardown: true });
    if (config.contentNode) {
      // We need to keep track of the original local context.
      this.__originalContentParent = config.contentNode.parentElement;
    }
    const newConfig = { ...this._defaultConfig, ...config };
    Object.assign(this, newConfig);

    if (this.viewportConfig && this.popperConfig) {
      console.warn(`Please define either a local placement config (.popperConfig)
        or a global config (.viewportConfig)`);
    }
    console.log('setConfigsetConfig', this.contentNode);

    this._init(newConfig);
  }

  async _init(config) {
    if (this._rendersToBody) { // 'Global'
      // ContentNode will be placed here, until _init is called again
      // (meaning .setConfig is called)
      //
    } else { // 'Local'
      // Now, it's time to lazily load Popper if not done yet
      // Do we really want to add display: inline or is this up to user?
    // TODO: Instead of in constructor, prefetch it or use a preloader-manager to load it during idle time
      this.constructor.popperModule = preloadPopper();
      this.__mergePopperConfigs(this.popperConfig || {})

      /* To display on top of elements with no z-index that are appear later in the DOM */
      this.contentNode.style.zIndex = 1;
      /**
       * Popper is weird about properly positioning the popper element when it is recreated so
       * we just recreate the popper instance to make it behave like it should.
       * Probably related to this issue: https://github.com/FezVrasta/popper.js/issues/796
       * calling just the .update() function on the popper instance sadly does not resolve this.
       * This is however necessary for initial placement.
       */
      if (this.invokerNode && this.contentNode) {
        await this.__createPopperInstance();
        this._popper.update();
      }
    }
    // Initially, we hide .contentNode
    this._renderTarget.appendChild(this.contentNode);
    // this._handleFeatures();
  }

  get isShown() {
    return Boolean(this.contentNode.style.display !== 'none');
  }

  /**
   * @event before-show right before the overlay shows. Used for animations and switching overlays
   * @event show right after the overlay is shown
   * @param {HTMLElement} elementToFocusAfterHide
   */
  async show(elementToFocusAfterHide = this.elementToFocusAfterHide) {
    this.dispatchEvent(new Event('before-show'));
    if (!this._rendersToBody) {
      await this.__createPopperInstance();
      this._popper.update();
    }
    this.__setFocus(elementToFocusAfterHide);
    this.contentNode.style.display = '';
    this._handleFeatures();
    this.dispatchEvent(new Event('show'));
  }

  __setFocus(elementToFocusAfterHide) {
    if (this.contentNode.activeElement) {
      elementToFocusAfterHide.focus();
    }
  }

  /**
   * @event before-hide right before the overlay hides. Used for animations and switching overlays
   * @event hide right after the overlay is hidden
   */
  hide() {
    this.dispatchEvent(new Event('before-hide'));
    this.contentNode.style.display = 'none';
    console.log('before teardown');
    this._handleFeatures({ teardown: true });
    this.dispatchEvent(new Event('hide'));
  }

  toggle() {
    console.log('toggle');
    this.isShown ? this.hide() : this.show(); // eslint-disable-line
  }

  _handleFeatures({ teardown = false } = {}) {
    if (this.preventsScroll) {
      this._handlePreventsScroll({ teardown });
    }
    if (this.isBlocking) {
      this._handleBlocking({ teardown });
    }
    if (this.hasBackdrop) {
      this._handleBackdrop({ teardown, renderTarget: this._renderTarget });
    }
    if (this.trapsKeyboardFocus) {
      this._handleTrapsKeyboardFocus({ teardown });
    }
    if (this.hidesOnEsc) {
      this._handleHidesOnEsc({ teardown });
    }
    if (this.hidesOnOutsideClick) {
      this._handleHidesOnOutsideClick({ teardown });
    }
    if (this.isModal) {
      this._handleIsModal({ teardown });
    }
    if (this.handlesAccessibility) {
      this._handleAccessibility({ teardown })
    }
  }

  _handlePreventsScroll({ teardown } = {}) { // eslint-disable-line
    const addOrRemove = teardown ? 'remove' : 'add';
    document.body.classList[addOrRemove]('global-overlays-scroll-lock');
    if (isIOS) {
      // iOS has issues with overlays with input fields. This is fixed by applying
      // position: fixed to the body. As a side effect, this will scroll the body to the top.
      document.body.classList[addOrRemove]('global-overlays-scroll-lock-ios-fix');
    }
  }

  _handleBlocking({ teardown } = {}) {
    const addOrRemove = teardown ? 'remove' : 'add';
    this.contentNode.classList[addOrRemove]('global-overlays__overlay--blocking');
    if (this.backdropNode) {
      this.backdropNode.classList[addOrRemove]('global-overlays__backdrop--blocking');
    }

    if (teardown) {
      // TODO: handle in manager
      const blockingController = this.manager.shownList.find(
        ctrl => ctrl !== this && ctrl.isBlocking === true,
      );
      // if there are no other blocking overlays remaining, stop hiding regular overlays
      if (!blockingController) {
        this.manager.globalRootNode.classList.remove('global-overlays--blocking-opened');
      }
    } else {
      this.manager.globalRootNode.classList.add('global-overlays--blocking-opened');
    }
  }

  /**
   * Sets up backdrop on the given overlay. If there was a backdrop on another element
   * it is removed. Otherwise this is the first time displaying a backdrop, so a fade-in
   * animation is played.
   */
  _handleBackdrop({ animation = true, renderTarget, teardown } = {}) {
    if (!teardown) {
      this.backdropNode = document.createElement('div');
      this.backdropNode.classList.add('global-overlays__backdrop');
      renderTarget.insertBefore(this.backdropNode, this.contentNode);

      if (animation === true) {
        this.backdropNode.classList.add('global-overlays__backdrop--fade-in');
      }
    }
    else {
      const { backdropNode } = this;
      if (animation) {
        this.__removeFadeOut = () => {
          backdropNode.classList.remove('global-overlays__backdrop--fade-out');
          backdropNode.removeEventListener('animationend', this.__removeFadeOut);
          backdropNode.parentNode.removeChild(backdropNode);
        };
        backdropNode.addEventListener('animationend', this.__removeFadeOut);
      }
      backdropNode.classList.remove('global-overlays__backdrop--fade-in');
      backdropNode.classList.add('global-overlays__backdrop--fade-out');
    }
  }

  _handleTrapsKeyboardFocus({ teardown, findNewTrap = true } = {}) {
    if (!teardown) {
      if (this.manager) {
        this.manager.disableTrapsKeyboardFocusForAll();
      }
      this._containFocusHandler = containFocus(this.contentNode);
      console.log('this._containFocusHandler', this._containFocusHandler);

      if (this.manager) {
        this.manager.informTrapsKeyboardFocusGotEnabled();
      }
    } else {
      this._containFocusHandler.disconnect();
      this._containFocusHandler = undefined;
      if (this.manager) {
        this.manager.informTrapsKeyboardFocusGotDisabled({ disabledCtrl: this, findNewTrap });
      }
    }
  }

  _handleHidesOnEsc({ teardown } = {}) {
    const addOrRemoveListener = teardown ? 'removeEventListener' : 'addEventListener';
    this.__escKeyHandler = (ev) => (ev.key === 'Escape') && this.hide();
    this.contentNode[addOrRemoveListener]('keyup', this.__escKeyHandler);
  }

  _handleAccessibility() {
    // const setOrRemoveAttr = teardown ? 'setAttribute' : 'removeAttribute';
    if (this.isTooltip) {
      // TODO: this could also be labelledby
      this.invokerNode.setAttribute('aria-describedby', this.contentId);
      this.contentNode.setAttribute('role', 'tooltip');
    } else {
      this.invokerNode.setAttribute('aria-expanded', this.isShown);
      // aria-controls currently doesn't work perfectly
      this.invokerNode.setAttribute('aria-controls', this.contentId);
      // this.invokerNode[setOrRemoveAttr]('aria-haspopup', 'true');
    }
  }

  _handleInheritsInvokerWidth() {
    const invokerWidth = `${this.invokerNode.clientWidth}px`;
    switch (this.inheritsInvokerWidth) {
      case 'max':
        this.contentNode.style.maxWidth = invokerWidth;
        break;
      case 'full':
        this.contentNode.style.width = invokerWidth;
        break;
      default:
        this.contentNode.style.minWidth = invokerWidth;
    }
  }

  _handleHidesOnOutsideClick({ teardown } = {}) {
    const addOrRemoveListener = teardown ? 'removeEventListener' : 'addEventListener';

    let wasClickInside = false;
    // handle on capture phase and remember till the next task that there was an inside click
    this.__preventCloseOutsideClick = () => {
      wasClickInside = true;
      setTimeout(() => {
        wasClickInside = false;
      });
    };

    // handle on capture phase and schedule the hide if needed
    this.__onCaptureHtmlClick = () => {
      setTimeout(() => {
        if (wasClickInside === false) {
          this.hide();
        }
      });
    };

    this.contentNode[addOrRemoveListener]('click', this.__preventCloseOutsideClick, true);
    this.invokerNode[addOrRemoveListener]('click', this.__preventCloseOutsideClick, true);
    document.documentElement[addOrRemoveListener]('click', this.__onCaptureHtmlClick, true);
  }

  // Popper does not export a nice method to update an existing instance with a new config. Therefore we recreate the instance.
  // TODO: Send a merge request to Popper to abstract their logic in the constructor to an exposed method which takes in the user config.
  async updatePopperConfig(config = {}) {
    this.__mergePopperConfigs(config);
    if (this.isShown) {
      await this.__createPopperInstance();
      this._popper.update();
    }
  }

  /**
   * Merges the default config with the current config, and finally with the user supplied config
   * @param {Object} config user supplied configuration
   */
  __mergePopperConfigs(config = {}) {
    const defaultConfig = {
      placement: 'top',
      positionFixed: false,
      modifiers: {
        keepTogether: {
          enabled: false,
        },
        preventOverflow: {
          enabled: true,
          boundariesElement: 'viewport',
          padding: 16, // viewport-margin for shifting/sliding
        },
        flip: {
          boundariesElement: 'viewport',
          padding: 16, // viewport-margin for flipping
        },
        offset: {
          enabled: true,
          offset: `0, 8px`, // horizontal and vertical margin (distance between popper and referenceElement)
        },
        arrow: {
          enabled: false,
        },
      },
    };

    // Deep merging default config, previously configured user config, new user config
    this.popperConfig = {
      ...defaultConfig,
      ...(this.popperConfig || {}),
      ...(config || {}),
      modifiers: {
        ...defaultConfig.modifiers,
        ...((this.popperConfig && this.popperConfig.modifiers) || {}),
        ...((config && config.modifiers) || {}),
      },
    };
  }

  async __createPopperInstance() {
    if (this._popper) {
      this._popper.destroy();
      this._popper = null;
    }
    const mod = await this.constructor.popperModule;
    const Popper = mod.default;
    this._popper = new Popper(this.invokerNode, this.contentNode, {
      ...this.popperConfig,
    });
  }
}
