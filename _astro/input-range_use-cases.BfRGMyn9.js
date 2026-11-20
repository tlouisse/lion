const n=`/** script code **/
import { html } from '@mdjs/mdjs-preview';
import '@lion/ui/define/lion-input-range.js';
/** stories code **/
export const HtmlStory7 = () => html\`<style>
  lion-input-range {
    max-width: 400px;
  }
</style>
<lion-input-range
  min="0"
  max="100"
  .modelValue="\${50}"
  unit="%"
  label="Percentage"
></lion-input-range>\`;
export const HtmlStory8 = () => html\`<lion-input-range
  style="max-width: 400px;"
  min="200"
  max="500"
  step="50"
  .modelValue="\${300}"
  label="Input range"
  help-text="This slider uses increments of 50"
></lion-input-range>\`;
export const HtmlStory9 = () => html\`<lion-input-range
  style="max-width: 400px;"
  no-min-max-labels
  min="0"
  max="100"
  label="Input range"
></lion-input-range>\`;
export const HtmlStory10 = () => html\`<lion-input-range
  min="0"
  max="11"
  min-label="less than 1 item"
  max-label="more than 10 items"
  .modelValue="\${4}"
  unit="Items"
  label="Items"
></lion-input-range>\`;
export const HtmlStory11 = () => html\`<lion-input-range
  style="max-width: 400px;"
  disabled
  min="200"
  max="500"
  .modelValue="\${300}"
  label="Input range"
></lion-input-range>\`;
/** stories setup code **/
const rootNode = document;
const stories = [{ key: 'HtmlStory7', story: HtmlStory7 }, { key: 'HtmlStory8', story: HtmlStory8 }, { key: 'HtmlStory9', story: HtmlStory9 }, { key: 'HtmlStory10', story: HtmlStory10 }, { key: 'HtmlStory11', story: HtmlStory11 }];
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
}`;export{n as default};
