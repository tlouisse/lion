import { LionSelectRich } from '@lion/ui/select-rich.js';
import { html } from 'lit';
import { BaseUISelectInvoker } from './invokers/BaseUISelectInvoker.js';

/** Base UI's language — unstyled primitives — applied by swapping the invoker tag. */
export class BaseUISelectRich extends LionSelectRich {
  /** @type {any} */
  static get scopedElements() {
    return {
      ...super.scopedElements,
      'baseui-select-invoker': BaseUISelectInvoker,
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
      invoker: () => html`<baseui-select-invoker></baseui-select-invoker>`,
    };
  }
}

