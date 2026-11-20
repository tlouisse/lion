import{i as t,b as r}from"./lit-element.BOikny4r.js";import{a as u,L as n}from"./LionSelectRich.DNrB4nKm.js";class a extends u{static get styles(){return[...super.styles,t`
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
      `]}get slots(){return{...super.slots,after:()=>this.renderCaret()}}renderCaret(){const s=document.createElement("span");return s.setAttribute("slot","after"),s.setAttribute("aria-hidden","true"),s.innerHTML='<svg viewBox="0 0 10 6" width="16" height="10" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',s}_afterTemplate(){return r`<span id="after-wrapper"><slot name="after"></slot></span>`}}const d=t`
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
`,k=t`
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
`,h=t`
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
`;t`
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
`;class p extends a{static get styles(){return[...super.styles,d,t`
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
      `]}}class f extends n{static get scopedElements(){return{...super.scopedElements,"material-select-invoker":p}}get slots(){return{...super.slots,invoker:()=>r`<material-select-invoker></material-select-invoker>`}}}class b extends a{static get styles(){return[...super.styles,k,t`
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
      `]}}class v extends n{static get scopedElements(){return{...super.scopedElements,"shoelace-select-invoker":b}}get slots(){return{...super.slots,invoker:()=>r`<shoelace-select-invoker></shoelace-select-invoker>`}}}class g extends a{static get styles(){return[...super.styles,h,t`
        :host {
          padding: 0 6px;
          border: 1px solid transparent;
        }

        :host(:hover),
        :host(:focus-visible) {
          border-color: color-mix(in srgb, currentColor 30%, transparent);
          background: transparent;
        }
      `]}}class m extends n{static get scopedElements(){return{...super.scopedElements,"baseui-select-invoker":g}}get slots(){return{...super.slots,invoker:()=>r`<baseui-select-invoker></baseui-select-invoker>`}}}customElements.define("lion-plain-select-rich",n);customElements.define("material-select-rich",f);customElements.define("shoelace-select-rich",v);customElements.define("baseui-select-rich",m);const x=[{value:"lion",label:"Lion — the design system"},{value:"material",label:"Material Design 3"},{value:"shoelace",label:"Shoelace"},{value:"baseui",label:"Base UI"}];for(const e of["skin-material","skin-shoelace","skin-baseui","skin-lion"]){const s=document.getElementById(e);if(!s)continue;for(const{value:l,label:c}of x){const i=document.createElement("lion-option");i.choiceValue=l,i.textContent=c,s.appendChild(i)}const o=s.querySelector("lion-option");o&&(o.selected=!0)}
