import { LionSelectInvoker } from '@lion/ui/select-rich.js';
import { css, html } from 'lit';

/**
 * The base every skin invoker extends.
 *
 * It does two things and nothing else. It declares the caret as a `template` on `slots.after` — the
 * place `LionSelectInvoker` already renders a slot, and where its own `▼` span is created — so a
 * design language can draw its own arrow without touching the parent's template. And it adds the
 * shared box: surface, radius, elevation and the label's type, all read from `--skin-*`.
 *
 * The functional parts of the parent are left alone: it stays a `LionButton` under
 * `SlotMixin(LionButton)`, so keyboard, focus, disabled and the `selectedElement` wiring are the
 * same code as upstream. That is the point of the subclass route — the published API does not move.
 */
export class SkinSelectInvoker extends LionSelectInvoker {
  static get styles() {
    return [
      ...super.styles,
      css`
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: var(--skin-item-height, 40px);
          padding: 0 12px;
          box-sizing: border-box;
          background: var(--skin-surface);
          color: var(--skin-on-surface);
          border-radius: var(--skin-radius, 8px);
          box-shadow: var(--skin-elevation, none);
          font-size: var(--skin-label-size, 16px);
          font-weight: var(--skin-label-weight, 400);
          letter-spacing: var(--skin-label-tracking, normal);
          font-family: inherit;
          cursor: pointer;
          transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :host(:hover),
        :host(:focus-visible) {
          background: color-mix(in srgb, var(--skin-surface) 88%, var(--skin-on-surface));
        }

        :host([disabled]) {
          opacity: 0.5;
        }

        ::slotted([slot='after']),
        #after-wrapper {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
        }
      `,
    ];
  }

  /**
   * The design language's own arrow. `LionSelectInvoker` creates a `▼` span here; a skin replaces
   * that node through the documented `slots` map rather than by rewriting `render()`.
   */
  get slots() {
    return {
      ...super.slots,
      after: () => this.renderCaret(),
    };
  }

  /** @protected */
  // eslint-disable-next-line class-methods-use-this
  renderCaret() {
    const icon = document.createElement('span');
    icon.setAttribute('slot', 'after');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `<svg viewBox="0 0 10 6" width="16" height="10" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return icon;
  }

  /** @protected */
  _afterTemplate() {
    return html`<span id="after-wrapper"><slot name="after"></slot></span>`;
  }
}
