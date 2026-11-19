const o=`/** script code **/
import { html } from '@mdjs/mdjs-preview';
import { listboxData } from '/node_modules/_lion_docs/components/listbox/src/listboxData.js';
import { Required } from '@lion/ui/form-core.js';
import { loadDefaultFeedbackMessages } from '@lion/ui/validate-messages.js';
import '@lion/ui/define/lion-listbox.js';
import '@lion/ui/define/lion-option.js';
loadDefaultFeedbackMessages();
/** stories code **/
export const HtmlStory15 = () => html\`<lion-listbox name="combo" label="Multiple" multiple-choice>
  <lion-option .choiceValue="\${'Apple'}">Apple</lion-option>
  <lion-option .choiceValue="\${'Artichoke'}">Artichoke</lion-option>
  <lion-option .choiceValue="\${'Asparagus'}">Asparagus</lion-option>
  <lion-option .choiceValue="\${'Banana'}">Banana</lion-option>
  <lion-option .choiceValue="\${'Beets'}">Beets</lion-option>
  <lion-option .choiceValue="\${'Bell pepper'}">Bell pepper</lion-option>
  <lion-option .choiceValue="\${'Broccoli'}">Broccoli</lion-option>
  <lion-option .choiceValue="\${'Brussels sprout'}">Brussels sprout</lion-option>
  <lion-option .choiceValue="\${'Cabbage'}">Cabbage</lion-option>
  <lion-option .choiceValue="\${'Carrot'}">Carrot</lion-option>
</lion-listbox>\`;
export const HtmlStory16 = () => html\`<lion-listbox name="combo" label="Orientation horizontal" orientation="horizontal">
  <lion-option .choiceValue="\${'Apple'}">Apple</lion-option>
  <lion-option .choiceValue="\${'Artichoke'}">Artichoke</lion-option>
  <lion-option .choiceValue="\${'Asparagus'}">Asparagus</lion-option>
  <lion-option .choiceValue="\${'Banana'}">Banana</lion-option>
  <lion-option .choiceValue="\${'Beets'}">Beets</lion-option>
  <lion-option .choiceValue="\${'Bell pepper'}">Bell pepper</lion-option>
  <lion-option .choiceValue="\${'Broccoli'}">Broccoli</lion-option>
  <lion-option .choiceValue="\${'Brussels sprout'}">Brussels sprout</lion-option>
  <lion-option .choiceValue="\${'Cabbage'}">Cabbage</lion-option>
  <lion-option .choiceValue="\${'Carrot'}">Carrot</lion-option>
</lion-listbox>\`;
export const HtmlStory17 = () => html\`<lion-listbox
  name="combo"
  label="Orientation horizontal multiple"
  orientation="horizontal"
  multiple-choice
>
  <lion-option .choiceValue="\${'Apple'}">Apple</lion-option>
  <lion-option .choiceValue="\${'Artichoke'}">Artichoke</lion-option>
  <lion-option .choiceValue="\${'Asparagus'}">Asparagus</lion-option>
  <lion-option .choiceValue="\${'Banana'}">Banana</lion-option>
  <lion-option .choiceValue="\${'Beets'}">Beets</lion-option>
  <lion-option .choiceValue="\${'Bell pepper'}">Bell pepper</lion-option>
  <lion-option .choiceValue="\${'Broccoli'}">Broccoli</lion-option>
  <lion-option .choiceValue="\${'Brussels sprout'}">Brussels sprout</lion-option>
  <lion-option .choiceValue="\${'Cabbage'}">Cabbage</lion-option>
  <lion-option .choiceValue="\${'Carrot'}">Carrot</lion-option>
</lion-listbox>\`;
export const HtmlStory18 = () => html\`<lion-listbox name="combo" label="Selection follows focus" selection-follows-focus>
  <lion-option .choiceValue="\${'Apple'}">Apple</lion-option>
  <lion-option .choiceValue="\${'Artichoke'}" disabled>Artichoke</lion-option>
  <lion-option .choiceValue="\${'Asparagus'}">Asparagus</lion-option>
  <lion-option .choiceValue="\${'Banana'}">Banana</lion-option>
  <lion-option .choiceValue="\${'Beets'}">Beets</lion-option>
  <lion-option .choiceValue="\${'Bell pepper'}">Bell pepper</lion-option>
  <lion-option .choiceValue="\${'Broccoli'}">Broccoli</lion-option>
  <lion-option .choiceValue="\${'Brussels sprout'}">Brussels sprout</lion-option>
  <lion-option .choiceValue="\${'Cabbage'}">Cabbage</lion-option>
  <lion-option .choiceValue="\${'Carrot'}">Carrot</lion-option>
</lion-listbox>\`;
export const HtmlStory19 = () => html\`<lion-listbox name="combo" label="Rotate keyboard navigation" rotate-keyboard-navigation>
  <lion-option .choiceValue="\${'Apple'}">Apple</lion-option>
  <lion-option .choiceValue="\${'Artichoke'}">Artichoke</lion-option>
  <lion-option .choiceValue="\${'Asparagus'}">Asparagus</lion-option>
  <lion-option .choiceValue="\${'Banana'}">Banana</lion-option>
  <lion-option .choiceValue="\${'Beets'}">Beets</lion-option>
  <lion-option .choiceValue="\${'Bell pepper'}">Bell pepper</lion-option>
  <lion-option .choiceValue="\${'Broccoli'}">Broccoli</lion-option>
  <lion-option .choiceValue="\${'Brussels sprout'}">Brussels sprout</lion-option>
  <lion-option .choiceValue="\${'Cabbage'}">Cabbage</lion-option>
  <lion-option .choiceValue="\${'Carrot'}">Carrot</lion-option>
</lion-listbox>\`;
export const HtmlStory20 = () => html\`<lion-listbox name="combo" label="Rotate with disabled options" rotate-keyboard-navigation>
  <lion-option .choiceValue="\${'Apple'}">Apple</lion-option>
  <lion-option .choiceValue="\${'Artichoke'}" disabled>Artichoke</lion-option>
  <lion-option .choiceValue="\${'Asparagus'}">Asparagus</lion-option>
  <lion-option .choiceValue="\${'Banana'}">Banana</lion-option>
  <lion-option .choiceValue="\${'Beets'}">Beets</lion-option>
  <lion-option .choiceValue="\${'Bell pepper'}">Bell pepper</lion-option>
  <lion-option .choiceValue="\${'Broccoli'}">Broccoli</lion-option>
  <lion-option .choiceValue="\${'Brussels sprout'}" disabled>Brussels sprout</lion-option>
  <lion-option .choiceValue="\${'Cabbage'}">Cabbage</lion-option>
  <lion-option .choiceValue="\${'Carrot'}">Carrot</lion-option>
</lion-listbox>\`;
/** stories setup code **/
const rootNode = document;
const stories = [{ key: 'HtmlStory15', story: HtmlStory15 }, { key: 'HtmlStory16', story: HtmlStory16 }, { key: 'HtmlStory17', story: HtmlStory17 }, { key: 'HtmlStory18', story: HtmlStory18 }, { key: 'HtmlStory19', story: HtmlStory19 }, { key: 'HtmlStory20', story: HtmlStory20 }];
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
}`;export{o as default};
