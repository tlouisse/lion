const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/define.BWpRLYnc.js","_astro/MdJsPreview.CainKAmn.js","_astro/lit-element.B1EQMsFJ.js","_astro/lit-html.BX7rm8u-.js","_astro/dedupeMixin.6XPTJgK8.js","_astro/LionAccordion.CCw3hAmZ.js","_astro/lit-element.BOikny4r.js","_astro/uuid.DjYKNjre.js","_astro/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as i}from"./preload-helper.2Gwnw0wx.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as l}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-input-email.CEpIo1DQ.js";import{V as s}from"./Validator.DAOhFpDH.js";const m=()=>l`
  <lion-input-email .modelValue="${"foo"}" label="Email"></lion-input-email>
`,n=()=>{class e extends s{static get validatorName(){return"GmailOnly"}execute(a){let o=!1;return a.indexOf("gmail.com")===-1&&(o=!0),o}static async getMessage(){return"You can only use gmail.com email addresses."}}return l`
    <lion-input-email
      .modelValue="${"foo@bar.com"}"
      .validators="${[new e]}"
      label="Email"
    ></lion-input-email>
  `},u=document,d=[{key:"faultyPrefilled",story:m},{key:"customValidator",story:n}];let r=!1;for(const e of d){const t=u.querySelector(`[mdjs-story-name="${e.key}"]`);t&&(t.story=e.story,t.key=e.key,r=!0,Object.assign(t,{simulatorUrl:"/lion/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}r&&(customElements.get("mdjs-preview")||i(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||i(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{n as customValidator,m as faultyPrefilled};
