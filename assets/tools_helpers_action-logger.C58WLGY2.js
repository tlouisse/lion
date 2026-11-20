const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as r}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as e}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./sb-action-logger.CbfRp3mN.js";const n=()=>{const t=Math.random().toString(36).substr(2,10);return e`
    <p>To log: <code>Hello, World!</code></p>
    <button
      @click=${o=>{o.target.parentElement.querySelector(`#logger-${t}`).log("Hello, World!")}}
    >
      Click this button
    </button>
    <p>Or to log: <code>What's up, Planet!</code></p>
    <button
      @click=${o=>{o.target.parentElement.querySelector(`#logger-${t}`).log("What's up, Planet!")}}
    >
      Click this button
    </button>
    <sb-action-logger id="logger-${t}"></sb-action-logger>
  `},s=()=>{const t=Math.random().toString(36).substr(2,10);return e`
    <div>To log: <code>Hello, World!</code></div>
    <button
      @click=${o=>{o.target.parentElement.querySelector(`#logger-${t}`).log("Hello, World!")}}
    >
      Click this button
    </button>
    <div>Or to log: <code>What's up, Planet!</code></div>
    <button
      @click=${o=>{o.target.parentElement.querySelector(`#logger-${t}`).log("What's up, Planet!")}}
    >
      Click this button
    </button>
    <sb-action-logger simple id="logger-${t}"></sb-action-logger>
  `},i=()=>{const t=Math.random().toString(36).substr(2,10);return e`
    <button
      @click="${o=>o.target.parentElement.querySelector(`#logger-${t}`).log("Hello, World!")}"
    >
      Log
    </button>
    <sb-action-logger id="logger-${t}" .title="${"Hello World"}"></sb-action-logger>
  `},g=document,c=[{key:"main",story:n},{key:"simpleMode",story:s},{key:"customTitle",story:i}];let l=!1;for(const t of c){const o=g.querySelector(`[mdjs-story-name="${t.key}"]`);o&&(o.story=t.story,o.key=t.key,l=!0,Object.assign(o,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}l&&(customElements.get("mdjs-preview")||r(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||r(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{i as customTitle,n as main,s as simpleMode};
