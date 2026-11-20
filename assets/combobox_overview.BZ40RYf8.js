const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./preload-helper.2Gwnw0wx.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as i}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import{l as s,a as n}from"./lazyRender.C6asyIK2.js";import"./lion-combobox.BF15o4na.js";import"./lion-option.DFWj3FDk.js";const r=()=>i`
  <lion-combobox name="combo" label="Default">
    ${s(n.map((o,e)=>i`
          <lion-option .checked="${e===0}" .choiceValue="${o}">${o}</lion-option>
        `))}
  </lion-combobox>
`,a=document,l=[{key:"main",story:r}];let m=!1;for(const o of l){const e=a.querySelector(`[mdjs-story-name="${o.key}"]`);e&&(e.story=o.story,e.key=o.key,m=!0,Object.assign(e,{simulatorUrl:"/lion/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}m&&(customElements.get("mdjs-preview")||t(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||t(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{r as main};
