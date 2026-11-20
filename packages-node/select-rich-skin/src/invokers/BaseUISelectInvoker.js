import { SkinSelectInvoker } from '../SkinSelectInvoker.js';
import { baseuiTokens } from '../tokens.js';
import { css } from 'lit';

/**
 * Base UI, whose primitives are deliberately unstyled: this skin says almost nothing, which is the
 * statement. A hairline on hover is the only affordance, and the caret is the same one every skin
 * inherits — so what you see is the platform's own control with the design system taken away.
 */
export class BaseUISelectInvoker extends SkinSelectInvoker {
  static get styles() {
    return [
      ...super.styles,
      baseuiTokens,
      css`
        :host {
          padding: 0 6px;
          border: 1px solid transparent;
        }

        :host(:hover),
        :host(:focus-visible) {
          border-color: color-mix(in srgb, currentColor 30%, transparent);
          background: transparent;
        }
      `,
    ];
  }
}
