import { SkinSelectInvoker } from '../SkinSelectInvoker.js';
import { materialTokens } from '../tokens.js';
import { css } from 'lit';

/**
 * Material 3's filled text field, which is how M3 renders a control that opens a menu: a
 * surface-container fill, the top corners rounded 4px, a single hairline at the bottom, the label in
 * label-large. The menu it opens is the same language's temporary surface — see `materialTokens`.
 */
export class MaterialSelectInvoker extends SkinSelectInvoker {
  static get styles() {
    return [
      ...super.styles,
      materialTokens,
      css`
        :host {
          min-height: 56px;
          padding: 0 16px;
          border-radius: 4px 4px 0 0;
          background: var(--skin-surface-variant);
          box-shadow: none;
          border-bottom: 1px solid var(--skin-on-surface);
        }

        :host(:hover) {
          background: color-mix(in srgb, var(--skin-surface-variant) 92%, var(--skin-on-surface));
        }

        :host(:focus-visible) {
          border-bottom-width: 2px;
          background: var(--skin-surface-variant);
        }
      `,
    ];
  }
}
