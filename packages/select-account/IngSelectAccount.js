import { css } from '@lion/core';
import {
  overlays,
  DynamicOverlayController,
  ModalDialogController,
  BottomSheetController,
  LocalOverlayController,
} from '@lion/overlays';
import {
  OverlayController,
} from '@lion/overlays/src/OverlayController.js';

import { LionSelectRich } from '@lion/select-rich/index.js';
// import { IngFieldMixin } from '../field-mixin/IngFieldMixin.js';
import './ing-select-account-invoker.js';


/**
 * # <ing-select-account> web component
 *
 * @customElement ing-select-account
 * @extends LionSelectRich
 */
export class IngSelectAccount extends LionSelectRich {
  static get styles() {
    return [
      super.styles,
      css`
        ::slotted([slot="invoker"]) {
          width: 100%;
        }

        .input-group__container > .input-group__input ::slotted(.form-control) {
          height: auto;
          padding: 0;
        }
      `,
    ];
  }

  _defineOverlay({ invokerNode, contentNode }) { // eslint-disable-line
    // const ctrl = new DynamicOverlayController();
    const { contentTemplate } = this;

    // contentNode = this.querySelector('[slot=input]');
    console.log('contentNode', contentNode);

    // const modalCtrl = overlays.add(
    //   new ModalDialogController({
    //     contentTemplate,
    //     invokerNode,
    //   }),
    // );
    // // ctrl.add(modalCtrl);

    // const bottomSheetCtrl = overlays.add(
    //   new BottomSheetController({
    //     contentTemplate,
    //     invokerNode,
    //     showHideMode: 'css',
    //   }),
    // );

    // ctrl.add(bottomSheetCtrl);

    // invokerNode.addEventListener('click', event => {
    //   ctrl.show(event.target);
    // });

    // function switchOnMediaChange(bp) {
    //   if (bp.matches) {
    //     // <= 600px
    //     ctrl.nextOpen = modalCtrl;
    //   } else {
    //     ctrl.nextOpen = bottomSheetCtrl;
    //   }
    // }
    // const matchSmall = window.matchMedia('(max-width: 600px)');
    // switchOnMediaChange(matchSmall); // call once manually to init
    // matchSmall.addListener(switchOnMediaChange);



    // const localCtrl = overlays.add(
    //   new LocalOverlayController({
    //     contentNode,
    //     invokerNode,
    //   }),
    // );

    const bottomSheetConfig = {
      hasBackdrop: true,
      preventsScroll: true,
      trapsKeyboardFocus: true,
      hidesOnEsc: true,
      viewportConfig: {
        placement: 'bottom',
      },
    }

    const ctrl = new OverlayController({
      ...bottomSheetConfig,
      hidesOnOutsideClick: true,
      invokerNode,
      contentNode,
    });
    return ctrl;
  }

  get slots() {
    return {
      ...super.slots,
      invoker: () => document.createElement('ing-select-account-invoker'),
    };
  }

  get _listboxNode() {
    // TODO: do in lion
    if (!this.__cachedListboxNode) {
      this.__cachedListboxNode = this.__overlay && this.__overlay.contentNode || this.querySelector('[slot=input]');
    }
    return this.__cachedListboxNode;
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }

    this._listboxNode._initRegistrarPortal({ registrationTarget: this });
    console.log('this.formElements', this.formElements);

    // console.log(this._invokerNode);
    this._invokerNode.selectedElement = this.formElements[this.checkedIndex];

  }
}
