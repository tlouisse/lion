const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as o}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as n}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import{d as i}from"./demoStyle.Bc8IqpUo.js";const l=()=>n`
  <style>
    ${i}
  </style>
  <lion-dialog>
    <button slot="invoker">Click me to open dialog</button>
    <div slot="content" class="demo-dialog-content">
      Hello! You can close this dialog here:
      <button
        class="demo-dialog-content__close-button"
        @click="${t=>t.target.dispatchEvent(new Event("close-overlay",{bubbles:!0}))}"
      >
        ⨯
      </button>
    </div>
  </lion-dialog>
`,r=document,m=[{key:"main",story:l}];let s=!1;for(const t of m){const e=r.querySelector(`[mdjs-story-name="${t.key}"]`);e&&(e.story=t.story,e.key=t.key,s=!0,Object.assign(e,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}s&&(customElements.get("mdjs-preview")||o(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||o(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{l as main};
