import { SkinSelectInvoker } from '../SkinSelectInvoker.js';
import { shoelaceTokens } from '../tokens.js';
import { css } from 'lit';

/**
 * Shoelace's select: a bordered box on the input surface, 1px hairline, 8px corner, and a hover tone
 * rather than a shadow. Kept close to its `--sl-input-*` metrics without borrowing its variables —
 * the values live in this skin's own token surface.
 */
export class ShoelaceSelectInvoker extends SkinSelectInvoker {
  static get styles() {
    return [
      ...super.styles,
      shoelaceTokens,
      css`
        :host {
          border: 1px solid color-mix(in srgb, var(--skin-on-surface) 20%, transparent);
          box-shadow: none;
        }

        :host(:hover) {
          border-color: color-mix(in srgb, var(--skin-on-surface) 35%, transparent);
        }

        :host(:focus-visible) {
          border-color: var(--skin-on-surface);
          outline: 2px solid color-mix(in srgb, var(--skin-on-surface) 20%, transparent);
          outline-offset: 1px;
        }
      `,
    ];
  }
}
