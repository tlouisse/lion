const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as n}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-listbox.CQB3rrgA.js";import"./lion-option.DeDyiPb9.js";const s=()=>n`
  <lion-listbox name="listbox" label="Default">
    <lion-option .choiceValue="${"Apple"}">Apple</lion-option>
    <lion-option checked .choiceValue="${"Artichoke"}">Artichoke</lion-option>
    <lion-option .choiceValue="${"Asparagus"}">Asparagus</lion-option>
    <lion-option .choiceValue="${"Banana"}">Banana</lion-option>
    <lion-option .choiceValue="${"Beets"}">Beets</lion-option>
  </lion-listbox>
`,l=document,r=[{key:"main",story:s}];let i=!1;for(const e of r){const o=l.querySelector(`[mdjs-story-name="${e.key}"]`);o&&(o.story=e.story,o.key=e.key,i=!0,Object.assign(o,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}i&&(customElements.get("mdjs-preview")||t(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||t(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{s as main};
