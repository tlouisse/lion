const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/define.BWpRLYnc.js","_astro/MdJsPreview.CainKAmn.js","_astro/lit-element.B1EQMsFJ.js","_astro/lit-html.BX7rm8u-.js","_astro/dedupeMixin.6XPTJgK8.js","_astro/LionAccordion.CCw3hAmZ.js","_astro/lit-element.BOikny4r.js","_astro/uuid.DjYKNjre.js","_astro/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as s}from"./preload-helper.2Gwnw0wx.js";import{S as m}from"./MdJsPreview.CainKAmn.js";import{i as u}from"./lit-element.B1EQMsFJ.js";import{b as n}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-fieldset.DzGSrokU.js";import"./lion-input.DW0kWWMT.js";import"./lion-form.DXEU-JLE.js";import{l as a}from"./loadDefaultFeedbackMessages.LwuloeTp.js";import{R as o}from"./Required.CvxLsCBg.js";import{S as d}from"./SlotMixin.Cw3cZ2rK.js";import{L as f}from"./LionInput.CH6quySB.js";import{L as p}from"./LionFieldset.DMG1RDOP.js";const b=()=>{a();const r=e=>{const i=e.target.serializedValue;console.log("formData",i),e.target.hasFeedbackFor?.includes("error")||fetch("/api/foo/",{method:"POST",body:JSON.stringify(i)})},t=e=>{e.target.previousElementSibling.submit()};return n`
    <lion-form @submit="${r}">
      <form>
        <lion-input
          name="firstName"
          label="First Name"
          .validators="${[new o]}"
        ></lion-input>
        <lion-input
          name="lastName"
          label="Last Name"
          .validators="${[new o]}"
        ></lion-input>
        <div style="display:flex">
          <button>Submit</button>
          <button
            type="button"
            @click="${e=>e.currentTarget.parentElement.parentElement.parentElement.resetGroup()}"
          >
            Reset
          </button>
        </div>
      </form>
    </lion-form>
    <button @click="${t}">Explicit submit via JavaScript</button>
  `},c=()=>(a(),n`
    <lion-form @submit="${e=>{const i=e.target.serializedValue;console.log("formData",i),e.target.hasFeedbackFor?.includes("error")||fetch("/api/foo/",{method:"POST",body:JSON.stringify(i)})}}" .serializedValue="${{firstName:"Foo",lastName:"Bar"}}">
      <form>
        <lion-input
          name="firstName"
          label="First Name"
          .validators="${[new o]}"
        ></lion-input>
        <lion-input
          name="lastName"
          label="Last Name"
          .validators="${[new o]}"
        ></lion-input>
        <div style="display:flex">
          <button>Submit</button>
          <button
            type="button"
            @click="${e=>e.currentTarget.parentElement.parentElement.parentElement.resetGroup()}"
          >
            Reset
          </button>
        </div>
      </form>
    </lion-form>
  `);class y extends d(m(u)){static get scopedElements(){return{"lion-fieldset":p,"lion-input":f}}get slots(){return{...super.slots,"":()=>({template:this.#e()})}}render(){return n` <slot></slot> `}#e(){return n`
      <lion-fieldset name="address" label="Address">
        <lion-input name="street" label="Street" .validators="${[new o]}"></lion-input>
        <lion-input name="number" label="Number" .validators="${[new o]}"></lion-input>
        <lion-input
          name="postalCode"
          label="Postal code"
          .validators="${[new o]}"
        ></lion-input>
      </lion-fieldset>
    `}}customElements.define("sub-form-address",y);const g=()=>(a(),n`
    <lion-form @submit="${t=>{const e=t.target.serializedValue;console.log("formData",e),t.target.hasFeedbackFor?.includes("error")||fetch("/api/foo/",{method:"POST",body:JSON.stringify(e)})}}">
      <form>
        <lion-fieldset name="fullName" label="Name">
          <lion-input
            name="firstName"
            label="First Name"
            .validators="${[new o]}"
          ></lion-input>
          <lion-input
            name="lastName"
            label="Last Name"
            .validators="${[new o]}"
          ></lion-input>
        </lion-fieldset>
        <sub-form-address></sub-form-address>
        <div style="display:flex">
          <button>Submit</button>
          <button
            type="button"
            @click="${t=>t.currentTarget.parentElement.parentElement.parentElement.resetGroup()}"
          >
            Reset
          </button>
        </div>
      </form>
    </lion-form>
  `),E=document,S=[{key:"formSubmit",story:b},{key:"prefilledData",story:c},{key:"subForms",story:g}];let l=!1;for(const r of S){const t=E.querySelector(`[mdjs-story-name="${r.key}"]`);t&&(t.story=r.story,t.key=r.key,l=!0,Object.assign(t,{simulatorUrl:"/lion/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}l&&(customElements.get("mdjs-preview")||s(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||s(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{b as formSubmit,c as prefilledData,g as subForms};
