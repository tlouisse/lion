import { LionSelectRich } from '@lion/ui/select-rich.js';
import { html } from 'lit';
import { MaterialSelectInvoker } from './invokers/MaterialSelectInvoker.js';

/**
 * The whole mechanism, in one map.
 *
 * `LionSelectRich` picks its invoker by tag name: `scopedElements` registers `lion-select-invoker`
 * and `_invokerNode` reads it back. A subclass that maps the same tag to its own invoker therefore
 * restyles the closed control without a single line of the parent's behaviour changing — keyboard,
 * focus, disabled, readonly, the `selectedElement` wiring and the accessibility attributes all stay
 * upstream code, and `@lion/ui`'s published API is untouched by construction.
 *
 * Dot form on `super.scopedElements` is deliberate: bracket access is exempt from terser's property
 * mangling (`keep_quoted`), which can split one property into two names. The parent's own source
 * carries the same note for the same reason.
 */
export class MaterialSelectRich extends LionSelectRich {
  /** @type {any} */
  static get scopedElements() {
    return {
      ...super.scopedElements,
      'material-select-invoker': MaterialSelectInvoker,
    };
  }

  /**
   * The invoker, under this skin's own tag. Re-registering the parent's `lion-select-invoker` for a
   * different class is refused by ScopedElementsMixin on any browser without a native scoped
   * registry ("This is only possible with a CustomElementRegistry") — so a skin ships a new tag
   * rather than competing for that one. `LionSelectRich._invokerNode` finds the invoker by
   * `child.slot === 'invoker'`, not by tag name, so the swap is invisible to the parent's wiring.
   */
  get slots() {
    return {
      ...super.slots,
      invoker: () => html`<material-select-invoker></material-select-invoker>`,
    };
  }
}

