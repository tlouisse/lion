const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as s}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as o}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-switch.tmf1-zwq.js";import"./sb-action-logger.CbfRp3mN.js";import{V as n}from"./Validator.DAOhFpDH.js";import{L as a}from"./LionSwitch.JkbKLKjr.js";const l=()=>o`<lion-switch label="Label" disabled></lion-switch>`;class c extends n{static get validatorName(){return"IsTrue"}execute(e){return!e.checked}static async getMessage(){return"You won't get the latest news!"}}class m extends a{static get validationTypes(){return[...super.validationTypes,"info"]}_showFeedbackConditionFor(e,i){return e==="info"?!0:super._showFeedbackConditionFor(e,i)}}customElements.define("custom-switch",m);const d=()=>o`
  <custom-switch
    name="newsletterCheck"
    label="Subscribe to newsletter"
    .validators="${[new c(null,{type:"info"})]}"
  ></custom-switch>
`,u=({shadowRoot:t})=>o`
    <lion-switch
      label="Label"
      @model-value-changed="${e=>{t.querySelector("sb-action-logger").log(`Current value: ${e.target.checked}`)}}"
    >
    </lion-switch>
    <sb-action-logger></sb-action-logger>
  `,y=document,g=[{key:"HtmlStory39",story:l},{key:"validation",story:d},{key:"handler",story:u}];let r=!1;for(const t of g){const e=y.querySelector(`[mdjs-story-name="${t.key}"]`);e&&(e.story=t.story,e.key=t.key,r=!0,Object.assign(e,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}r&&(customElements.get("mdjs-preview")||s(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||s(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{l as HtmlStory39,u as handler,d as validation};
