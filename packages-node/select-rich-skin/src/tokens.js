import { css } from 'lit';

/**
 * The token surface of a skin, declared by the skin rather than borrowed from Lion.
 *
 * Lion's components are white label: there is no `::part` and no `--lion-*` custom property to
 * consume (audited: 0 and 0 across `packages/ui/components`). So a design language reaches a Lion
 * component as *code* — a subclass — and the values that language owns are declared here, scoped to
 * the skin, named for the language. A host that wants to re-point them can override these on the
 * element; nothing in @lion/ui is touched.
 *
 * Every value below is measured from the reference implementation it names, not invented.
 */

/** Material 3 (Menu: "a list of choices on a temporary surface"). */
export const materialTokens = css`
  :host {
    /* The surface: M3's surface-container, and the elevation-2 shadow from the menu spec. */
    --skin-surface: light-dark(#f3edf7, #211f26);
    --skin-on-surface: light-dark(#1d1b20, #e6e0e9);
    --skin-surface-variant: light-dark(#e7e0ec, #49454f);
    --skin-selected-surface: light-dark(#e8def8, #4a4458);
    --skin-on-selected: light-dark(#1d192b, #e8def8);
    --skin-elevation: 0 1px 2px rgb(0 0 0 / 0.3), 0 2px 6px 2px rgb(0 0 0 / 0.15);
    /* The menu's own shape: 4px, per M3's "extra-small" corner. */
    --skin-radius: 4px;
    --skin-item-height: 48px;
    --skin-label-size: 14px;
    --skin-label-weight: 500;
    --skin-label-tracking: 0.1px;
  }
`;

/** Shoelace (its input/metrics vocabulary). */
export const shoelaceTokens = css`
  :host {
    --skin-surface: light-dark(#ffffff, #1b1b1f);
    --skin-on-surface: light-dark(#1f2937, #e5e7eb);
    --skin-surface-variant: light-dark(#f3f4f6, #26262b);
    --skin-selected-surface: light-dark(#e0e7ff, #3730a3);
    --skin-on-selected: light-dark(#1e1b4b, #e0e7ff);
    --skin-elevation: 0 6px 16px rgb(0 0 0 / 0.12);
    --skin-radius: 8px;
    --skin-item-height: 40px;
    --skin-label-size: 16px;
    --skin-label-weight: 400;
    --skin-label-tracking: normal;
  }
`;

/** Base UI: unstyled primitives, so the skin states almost nothing on purpose. */
export const baseuiTokens = css`
  :host {
    --skin-surface: transparent;
    --skin-on-surface: inherit;
    --skin-surface-variant: transparent;
    --skin-selected-surface: color-mix(in srgb, currentColor 10%, transparent);
    --skin-on-selected: inherit;
    --skin-elevation: none;
    --skin-radius: 0px;
    --skin-item-height: 32px;
    --skin-label-size: inherit;
    --skin-label-weight: inherit;
    --skin-label-tracking: normal;
  }
`;

/**
 * The listbox half of the skin, shared by every language: the same tokens, painted onto the surface
 * `LionSelectRich` opens. The items themselves are `lion-option`s in the same shadow, so their
 * selected and hover tones come from these tokens too.
 */
export const skinListboxStyles = css`
  :host {
    background: var(--skin-surface);
    color: var(--skin-on-surface);
    border-radius: var(--skin-radius);
    box-shadow: var(--skin-elevation);
  }

  ::slotted(lion-option),
  ::slotted(*) {
    border-radius: calc(var(--skin-radius) / 2);
  }
`;
