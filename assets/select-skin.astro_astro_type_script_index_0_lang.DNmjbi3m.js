import{i as s,b as t}from"./lit-element.BOikny4r.js";import{a,L as n}from"./LionSelectRich.CyyPGx06.js";class i extends a{static get styles(){return[...super.styles,s`
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
      `]}get slots(){return{...super.slots,after:()=>this.renderCaret()}}renderCaret(){const r=document.createElement("span");return r.setAttribute("slot","after"),r.setAttribute("aria-hidden","true"),r.innerHTML='<svg viewBox="0 0 10 6" width="16" height="10" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',r}_afterTemplate(){return t`<span id="after-wrapper"><slot name="after"></slot></span>`}}const o=s`
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
`,l=s`
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
`,c=s`
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
`;s`
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
`;class d extends i{static get styles(){return[...super.styles,o,s`
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
      `]}}class k extends n{static get scopedElements(){return{...super.scopedElements,"material-select-invoker":d}}get slots(){return{...super.slots,invoker:()=>t`<material-select-invoker></material-select-invoker>`}}}class u extends i{static get styles(){return[...super.styles,l,s`
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
      `]}}class h extends n{static get scopedElements(){return{...super.scopedElements,"shoelace-select-invoker":u}}get slots(){return{...super.slots,invoker:()=>t`<shoelace-select-invoker></shoelace-select-invoker>`}}}class p extends i{static get styles(){return[...super.styles,c,s`
        :host {
          padding: 0 6px;
          border: 1px solid transparent;
        }

        :host(:hover),
        :host(:focus-visible) {
          border-color: color-mix(in srgb, currentColor 30%, transparent);
          background: transparent;
        }
      `]}}class f extends n{static get scopedElements(){return{...super.scopedElements,"baseui-select-invoker":p}}get slots(){return{...super.slots,invoker:()=>t`<baseui-select-invoker></baseui-select-invoker>`}}}customElements.define("lion-plain-select-rich",n);customElements.define("material-select-rich",k);customElements.define("shoelace-select-rich",h);customElements.define("baseui-select-rich",f);for(const e of["skin-material","skin-shoelace","skin-baseui","skin-lion"]){const r=document.getElementById(e);r&&(r.modelValue="lion")}
