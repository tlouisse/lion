const e=`/** script code **/
import { html } from '@mdjs/mdjs-preview';
import { loadDefaultFeedbackMessages } from '@lion/ui/validate-messages.js';
import '@lion/ui/define/lion-input-stepper.js';
loadDefaultFeedbackMessages();
/** stories code **/
export const HtmlStory39 = () => html\`<lion-input-stepper name="year">
  <label slot="label">How old is the existence?</label>
  <div slot="after" data-description>In Billion Years</div>
</lion-input-stepper>\`;
export const HtmlStory40 = () => html\`<lion-input-stepper
  label="Amount of oranges"
  min="100"
  step="100"
  name="value"
  value="200"
></lion-input-stepper>\`;
export const HtmlStory41 = () => html\`<lion-input-stepper
  label="Amount of oranges"
  min="200"
  max="500"
  name="value"
  step="100"
  value="200"
></lion-input-stepper>\`;
export const valueTextMapping = () => {
  const values = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
    6: 'sixth',
    7: 'seventh',
    8: 'eighth',
    9: 'ninth',
    10: 'tenth',
  };
  return html\`
    <lion-input-stepper
      label="Order"
      min="1"
      max="10"
      name="value"
      .valueTextMapping="\${values}"
    ></lion-input-stepper>
  \`;
};
export const formatting = () => {
  const format = { locale: 'nl-NL' };
  return html\`
    <lion-input-stepper
      label="Amount of oranges"
      min="0"
      max="5000"
      step="100"
      name="value"
      .formatOptions="\${format}"
      .modelValue="\${1200}"
    ></lion-input-stepper>
  \`;
};
export const HtmlStory42 = () => html\`<lion-input-stepper
  label="Amount of oranges"
  min="1"
  max="100"
  step="10"
  name="value"
  alignToStep
  value="55"
></lion-input-stepper>\`;
export const HtmlStory43 = () => html\`<lion-input-stepper name="year" disabled value="10">
  <label slot="label">How old is the existence?</label>
  <div slot="after" data-description>In Billion Years</div>
</lion-input-stepper>\`;
export const HtmlStory44 = () => html\`<lion-input-stepper name="year" readonly value="10">
  <label slot="label">How old is the existence?</label>
  <div slot="after" data-description>In Billion Years</div>
</lion-input-stepper>\`;
/** stories setup code **/
const rootNode = document;
const stories = [{ key: 'HtmlStory39', story: HtmlStory39 }, { key: 'HtmlStory40', story: HtmlStory40 }, { key: 'HtmlStory41', story: HtmlStory41 }, { key: 'valueTextMapping', story: valueTextMapping }, { key: 'formatting', story: formatting }, { key: 'HtmlStory42', story: HtmlStory42 }, { key: 'HtmlStory43', story: HtmlStory43 }, { key: 'HtmlStory44', story: HtmlStory44 }];
let needsMdjsElements = false;
for (const story of stories) {
  const storyEl = rootNode.querySelector(\`[mdjs-story-name="\${story.key}"]\`);
  if (storyEl) {
    storyEl.story = story.story;
    storyEl.key = story.key;
    needsMdjsElements = true;
    Object.assign(storyEl, {"simulatorUrl":"/lion/simulator","languages":[{"key":"de-DE","name":"German"},{"key":"en-GB","name":"English (United Kingdom)"},{"key":"en-US","name":"English (United States)"},{"key":"nl-NL","name":"Dutch"}]});
  }
};
if (needsMdjsElements) {
  if (!customElements.get('mdjs-preview')) { import('/node_modules/@mdjs/mdjs-preview/src/define/define.js'); }
  if (!customElements.get('mdjs-story')) { import('/node_modules/@mdjs/mdjs-story/src/define.js'); }
}`;export{e as default};
