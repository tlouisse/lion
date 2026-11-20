const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as i}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as r}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-input-email.BE-NV84K.js";import{V as s}from"./Validator.DAOhFpDH.js";const m=()=>r`
  <lion-input-email .modelValue="${"foo"}" label="Email"></lion-input-email>
`,n=()=>{class e extends s{static get validatorName(){return"GmailOnly"}execute(a){let o=!1;return a.indexOf("gmail.com")===-1&&(o=!0),o}static async getMessage(){return"You can only use gmail.com email addresses."}}return r`
    <lion-input-email
      .modelValue="${"foo@bar.com"}"
      .validators="${[new e]}"
      label="Email"
    ></lion-input-email>
  `},u=document,d=[{key:"faultyPrefilled",story:m},{key:"customValidator",story:n}];let l=!1;for(const e of d){const t=u.querySelector(`[mdjs-story-name="${e.key}"]`);t&&(t.story=e.story,t.key=e.key,l=!0,Object.assign(t,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}l&&(customElements.get("mdjs-preview")||i(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||i(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{n as customValidator,m as faultyPrefilled};
