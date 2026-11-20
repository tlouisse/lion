const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as e}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as i}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-tooltip.BtkAbrJN.js";const r=()=>i`
  <style>
    .demo-tooltip-invoker {
      margin: 50px;
    }
  </style>
  <lion-tooltip has-arrow>
    <button slot="invoker" class="demo-tooltip-invoker">Hover me</button>
    <div slot="content">This is a tooltip</div>
  </lion-tooltip>
`,n=document,m=[{key:"main",story:r}];let s=!1;for(const o of m){const t=n.querySelector(`[mdjs-story-name="${o.key}"]`);t&&(t.story=o.story,t.key=o.key,s=!0,Object.assign(t,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}s&&(customElements.get("mdjs-preview")||e(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||e(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{r as main};
