import { LionAccordion } from '@lion/ui/accordion.js';

const tagName = 'ui-portal-section-accordion';

/**
 * `lion-accordion` that becomes a column of titled sections on a wide viewport.
 *
 * Narrow: it is `lion-accordion` — each part is a disclosure, opened by tapping its header, several may be open.
 * Wide (`sections-from`, a media query, default `(min-width: 48.01rem)`): every part is expanded and stays so, and
 * each header is plain text — no button role, no focus stop, no toggle — so the parts read as sections.
 *
 * The mechanism. Lion wires the *first element child* of each `slot="invoker"` element as the control: it puts the
 * click, keydown and focus handlers on it and sets `aria-controls` / `aria-expanded` there. This extension expects
 * that child to be a plain element (a `<span>`), not a `<button>`, and gives it its semantics per viewport:
 * - narrow: `role="button"`, `tabindex="0"`, `aria-controls`, `aria-expanded`, and Enter/Space activation — what a
 *   native button would bring, because the element is not one;
 * - wide: none of those, so what is left is the heading around it with its text.
 * A native `<button>` cannot be demoted that way: browsers ignore `role="none"` on a focusable element, so it would
 * stay a button in the accessibility tree while doing nothing.
 *
 * Content: wide turns every `_collapse` into an `_expand`, so each content element carries Lion's own `[expanded]`
 * and is shown by the component's own `::slotted(.content[expanded])` rule; nothing sets `hidden`. The `expanded`
 * property keeps meaning the narrow state, so crossing back to narrow restores what was open there. A click on a
 * header while wide is stopped before Lion's handler sees it, so it cannot change that state behind the user's back.
 *
 * Lion moves nothing: arranging invokers and content into its `_accordion` slot only changes their `slot`
 * attribute. The page relies on that — one of the parts holds the live editor, which must never be re-parented.
 */
export class UIPortalSectionAccordion extends LionAccordion {
  // Only the two new properties. Lit inherits the declared ones from LionAccordion; re-declaring them here (with
  // `...super.properties`) would make Lit generate a fresh `expanded` accessor on this prototype, shadowing Lion's own
  // getter/setter — measured: `expanded` came out undefined and setting it no longer updated the parts.
  static get properties() {
    return {
      /** True while the viewport matches `sectionsFrom`; reflected so styles can follow it. */
      sections: { type: Boolean, reflect: true },
      /** The media query from which the parts render as sections. */
      sectionsFrom: { type: String, attribute: 'sections-from' },
    };
  }

  constructor() {
    super();
    this.sections = false;
    this.sectionsFrom = '(min-width: 48.01rem)';
    /** @type {MediaQueryList | null} */
    this.__query = null;
    this.__onQueryChange = () => {
      this.sections = Boolean(this.__query?.matches);
    };
    /** @param {Event} event */
    this.__swallowSectionClicks = event => {
      if (!this.sections) return;
      const target = /** @type {Element} */ (event.target);
      if (target.closest?.('.invoker') && this.contains(target)) event.stopPropagation();
    };
  }

  connectedCallback() {
    super.connectedCallback();
    // Capture phase on the host runs before the target-phase handler Lion put on the control.
    this.addEventListener('click', this.__swallowSectionClicks, true);
    this.__watch();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.__swallowSectionClicks, true);
    this.__query?.removeEventListener('change', this.__onQueryChange);
  }

  /** @param {import('lit').PropertyValues} changed */
  updated(changed) {
    super.updated(changed);
    if (changed.has('sectionsFrom') && this.isConnected) this.__watch();
    // Re-running the expanded state through Lion's own setter re-applies `_expand`/`_collapse` — and with them the
    // control's semantics — to every entry, in the mode just entered.
    if (changed.has('sections')) this.expanded = [...this.expanded];
  }

  __watch() {
    this.__query?.removeEventListener('change', this.__onQueryChange);
    this.__query = window.matchMedia(this.sectionsFrom);
    this.__query.addEventListener('change', this.__onQueryChange);
    this.__onQueryChange();
  }

  /**
   * @param {any} entry a Lion accordion store entry: `{ uid, index, invoker, content, … }`
   * @protected
   */
  _setupInvoker(entry) {
    super._setupInvoker(entry);
    const control = /** @type {any} */ (entry.invoker.firstElementChild);
    if (!control) return;
    // Enter and Space activate a role="button" element the way they activate a native one; Lion's own keydown
    // handler covers the arrow keys and Home/End only, because it expects a native button underneath.
    if (!control.__sectionKeydown) {
      control.__sectionKeydown = (/** @type {KeyboardEvent} */ event) => {
        if (this.sections || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        control.click();
      };
      control.addEventListener('keydown', control.__sectionKeydown);
    }
    this.__applyControlSemantics(entry);
  }

  /**
   * @param {any} entry
   * @protected
   */
  _expand(entry) {
    super._expand(entry);
    this.__applyControlSemantics(entry);
  }

  /**
   * @param {any} entry
   * @protected
   */
  _collapse(entry) {
    if (this.sections) {
      this._expand(entry);
      return;
    }
    super._collapse(entry);
    this.__applyControlSemantics(entry);
  }

  /** @param {any} entry */
  __applyControlSemantics(entry) {
    const control = /** @type {HTMLElement | null} */ (entry.invoker.firstElementChild);
    if (!control) return;
    if (this.sections) {
      control.removeAttribute('role');
      control.removeAttribute('tabindex');
      control.removeAttribute('aria-expanded');
      control.removeAttribute('aria-controls');
    } else {
      control.setAttribute('role', 'button');
      control.setAttribute('tabindex', '0');
      control.setAttribute('aria-controls', entry.content.id);
      control.setAttribute('aria-expanded', String(entry.content.hasAttribute('expanded')));
    }
  }
}

if (!customElements.get(tagName)) customElements.define(tagName, UIPortalSectionAccordion);
