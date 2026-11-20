import { LionSelectRich } from '@lion/ui/select-rich.js';
import { html } from 'lit';
import { ShoelaceSelectInvoker } from './invokers/ShoelaceSelectInvoker.js';

/** Shoelace's language, applied by swapping the invoker tag. See `MaterialSelectRich` for the why. */
export class ShoelaceSelectRich extends LionSelectRich {
  /** @type {any} */
  static get scopedElements() {
    return {
      ...super.scopedElements,
      'shoelace-select-invoker': ShoelaceSelectInvoker,
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
      invoker: () => html`<shoelace-select-invoker></shoelace-select-invoker>`,
    };
  }
}

