const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as t}from"./preload-helper.2Gwnw0wx.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as s}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-input-tel.CtMndDSo.js";import"./h-output.CD1U2_7J.js";import{l as m}from"./loadDefaultFeedbackMessages.LwuloeTp.js";import{P as n}from"./PhoneUtilManager.BKSr32uG.js";const i=()=>(m(),s`
    <lion-input-tel
      .modelValue="${"+639921343959"}"
      live-format
      label="Telephone number"
      name="phoneNumber"
    ></lion-input-tel>
    <h-output
      .show="${["activeRegion",{name:"all or allowed regions",processor:e=>JSON.stringify(e._allowedOrAllRegions)},"modelValue"]}" 'modelValue']}"
      .readyPromise="${n.loadComplete}"
    ></h-output>
  `),l=document,a=[{key:"main",story:i}];let r=!1;for(const e of a){const o=l.querySelector(`[mdjs-story-name="${e.key}"]`);o&&(o.story=e.story,o.key=e.key,r=!0,Object.assign(o,{simulatorUrl:"/lion/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}r&&(customElements.get("mdjs-preview")||t(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||t(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{i as main};
