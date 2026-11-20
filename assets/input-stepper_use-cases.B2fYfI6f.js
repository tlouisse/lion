const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as n}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as e}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-input-stepper.D5gtxUpk.js";import{l as s}from"./loadDefaultFeedbackMessages.D-yvjAV5.js";s();const i=()=>e`<lion-input-stepper name="year">
  <label slot="label">How old is the existence?</label>
  <div slot="after" data-description>In Billion Years</div>
</lion-input-stepper>`,r=()=>e`<lion-input-stepper
  label="Amount of oranges"
  min="100"
  step="100"
  name="value"
  value="200"
></lion-input-stepper>`,a=()=>e`<lion-input-stepper
  label="Amount of oranges"
  min="200"
  max="500"
  name="value"
  step="100"
  value="200"
></lion-input-stepper>`,p=()=>e`
    <lion-input-stepper
      label="Order"
      min="1"
      max="10"
      name="value"
      .valueTextMapping="${{1:"first",2:"second",3:"third",4:"fourth",5:"fifth",6:"sixth",7:"seventh",8:"eighth",9:"ninth",10:"tenth"}}"
    ></lion-input-stepper>
  `,m=()=>e`
    <lion-input-stepper
      label="Amount of oranges"
      min="0"
      max="5000"
      step="100"
      name="value"
      .formatOptions="${{locale:"nl-NL"}}"
      .modelValue="${1200}"
    ></lion-input-stepper>
  `,u=()=>e`<lion-input-stepper
  label="Amount of oranges"
  min="1"
  max="100"
  step="10"
  name="value"
  alignToStep
  value="55"
></lion-input-stepper>`,y=()=>e`<lion-input-stepper name="year" disabled value="10">
  <label slot="label">How old is the existence?</label>
  <div slot="after" data-description>In Billion Years</div>
</lion-input-stepper>`,d=()=>e`<lion-input-stepper name="year" readonly value="10">
  <label slot="label">How old is the existence?</label>
  <div slot="after" data-description>In Billion Years</div>
</lion-input-stepper>`,c=document,f=[{key:"HtmlStory16",story:i},{key:"HtmlStory17",story:r},{key:"HtmlStory18",story:a},{key:"valueTextMapping",story:p},{key:"formatting",story:m},{key:"HtmlStory19",story:u},{key:"HtmlStory20",story:y},{key:"HtmlStory21",story:d}];let l=!1;for(const t of f){const o=c.querySelector(`[mdjs-story-name="${t.key}"]`);o&&(o.story=t.story,o.key=t.key,l=!0,Object.assign(o,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}l&&(customElements.get("mdjs-preview")||n(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||n(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{i as HtmlStory16,r as HtmlStory17,a as HtmlStory18,u as HtmlStory19,y as HtmlStory20,d as HtmlStory21,m as formatting,p as valueTextMapping};
