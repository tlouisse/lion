const e=`/** script code **/
import { html } from '@mdjs/mdjs-preview';
import '@lion/ui/define/lion-checkbox-group.js';
import '@lion/ui/define/lion-checkbox-indeterminate.js';
import '@lion/ui/define/lion-checkbox.js';
/** stories code **/
export const HtmlStory41 = () => html\`<lion-checkbox-group name="scientists" label="Favorite scientists">
  <lion-checkbox label="Archimedes" .choiceValue="\${'Archimedes'}"></lion-checkbox>
  <lion-checkbox label="Francis Bacon" .choiceValue="\${'Francis Bacon'}" checked></lion-checkbox>
  <lion-checkbox label="Marie Curie" .choiceValue="\${'Marie Curie'}"></lion-checkbox>
</lion-checkbox-group>\`;
export const HtmlStory42 = () => html\`<lion-checkbox-group name="scientists[]" label="Favorite scientists" disabled>
  <lion-checkbox label="Archimedes" .choiceValue="\${'Archimedes'}"></lion-checkbox>
  <lion-checkbox label="Francis Bacon" .choiceValue="\${'Francis Bacon'}"></lion-checkbox>
  <lion-checkbox label="Marie Curie" .choiceValue="\${'Marie Curie'}"></lion-checkbox>
</lion-checkbox-group>\`;
export const HtmlStory43 = () => html\`<lion-checkbox-group name="scientists[]" label="Favorite scientists">
  <lion-checkbox .choiceValue="\${'Archimedes'}">
    <label slot="label"><strong>Archimedes</strong></label>
  </lion-checkbox>
  <lion-checkbox .choiceValue="\${'Francis Bacon'}">
    <label slot="label"><strong>Francis Bacon</strong></label>
  </lion-checkbox>
  <lion-checkbox .choiceValue="\${'Marie Curie'}">
    <label slot="label"><strong>Marie Curie</strong></label>
  </lion-checkbox>
</lion-checkbox-group>\`;
export const HtmlStory44 = () => html\`<lion-checkbox-group name="scientists[]" label="Favorite scientists">
  <lion-checkbox
    label="Archimedes"
    .choiceValue="\${'Archimedes'}"
    help-text="Archimedes of Syracuse was a Greek mathematician, physicist, engineer, inventor, and astronomer"
  ></lion-checkbox>
  <lion-checkbox
    label="Francis Bacon"
    .choiceValue="\${'Francis Bacon'}"
    help-text="Francis Bacon, 1st Viscount St Alban also known as Lord Verulam, was an English philosopher and statesman who served as Attorney General and as Lord Chancellor of England"
  ></lion-checkbox>
  <lion-checkbox
    label="Marie Curie"
    .choiceValue="\${'Marie Curie'}"
    help-text="Marie Skłodowska Curie born Maria Salomea Skłodowska, was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity"
  ></lion-checkbox>
</lion-checkbox-group>\`;
export const event = ({ shadowRoot }) => html\`
  <lion-checkbox-group
    name="scientists[]"
    label="Favorite scientists"
    @model-value-changed=\${ev =>
      (ev.target.parentElement.querySelector('#selectedDinosaur').innerText = JSON.stringify(
        ev.target.modelValue,
        null,
        4,
      ))}
  >
    <lion-checkbox label="Archimedes" .choiceValue="\${'Archimedes'}"></lion-checkbox>
    <lion-checkbox label="Francis Bacon" .choiceValue="\${'Francis Bacon'}"></lion-checkbox>
    <lion-checkbox label="Marie Curie" .choiceValue="\${'Marie Curie'}"></lion-checkbox>
  </lion-checkbox-group>
  <br />
  <span>Selected scientists: <strong id="selectedDinosaur">N/A</strong></span>
\`;
export const HtmlStory45 = () => html\`<lion-checkbox-group name="scientists[]" label="Favorite scientists">
  <lion-checkbox-indeterminate label="Old Greek scientists">
    <lion-checkbox label="Archimedes" .choiceValue="\${'Archimedes'}"></lion-checkbox>
    <lion-checkbox label="Plato" .choiceValue="\${'Plato'}"></lion-checkbox>
    <lion-checkbox label="Pythagoras" .choiceValue="\${'Pythagoras'}"></lion-checkbox>
  </lion-checkbox-indeterminate>
  <lion-checkbox-indeterminate label="17th Century scientists">
    <lion-checkbox label="Isaac Newton" .choiceValue="\${'Isaac Newton'}"></lion-checkbox>
    <lion-checkbox label="Galileo Galilei" .choiceValue="\${'Galileo Galilei'}"></lion-checkbox>
  </lion-checkbox-indeterminate>
</lion-checkbox-group>\`;
export const HtmlStory46 = () => html\`<lion-checkbox-group name="scientists[]" label="Favorite scientists">
  <lion-checkbox-indeterminate label="Scientists">
    <lion-checkbox label="Isaac Newton" .choiceValue="\${'Isaac Newton'}"></lion-checkbox>
    <lion-checkbox label="Galileo Galilei" .choiceValue="\${'Galileo Galilei'}"></lion-checkbox>
    <lion-checkbox-indeterminate label="Old Greek scientists">
      <lion-checkbox label="Archimedes" .choiceValue="\${'Archimedes'}"></lion-checkbox>
      <lion-checkbox label="Plato" .choiceValue="\${'Plato'}"></lion-checkbox>
      <lion-checkbox label="Pythagoras" .choiceValue="\${'Pythagoras'}"></lion-checkbox>
    </lion-checkbox-indeterminate>
  </lion-checkbox-indeterminate>
</lion-checkbox-group>\`;
export const HtmlStory47 = () => html\`<lion-checkbox-group name="scientists[]" label="Favorite scientists">
  <lion-checkbox-indeterminate mixed-state label="Scientists">
    <lion-checkbox label="Isaac Newton" .choiceValue="\${'Isaac Newton'}"></lion-checkbox>
    <lion-checkbox label="Galileo Galilei" .choiceValue="\${'Galileo Galilei'}"></lion-checkbox>
    <lion-checkbox-indeterminate mixed-state label="Old Greek scientists">
      <lion-checkbox label="Archimedes" .choiceValue="\${'Archimedes'}"></lion-checkbox>
      <lion-checkbox label="Plato" .choiceValue="\${'Plato'}"></lion-checkbox>
      <lion-checkbox label="Pythagoras" .choiceValue="\${'Pythagoras'}"></lion-checkbox>
    </lion-checkbox-indeterminate>
  </lion-checkbox-indeterminate>
</lion-checkbox-group>\`;
/** stories setup code **/
const rootNode = document;
const stories = [{ key: 'HtmlStory41', story: HtmlStory41 }, { key: 'HtmlStory42', story: HtmlStory42 }, { key: 'HtmlStory43', story: HtmlStory43 }, { key: 'HtmlStory44', story: HtmlStory44 }, { key: 'event', story: event }, { key: 'HtmlStory45', story: HtmlStory45 }, { key: 'HtmlStory46', story: HtmlStory46 }, { key: 'HtmlStory47', story: HtmlStory47 }];
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
