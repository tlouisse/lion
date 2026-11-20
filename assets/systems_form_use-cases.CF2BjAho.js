const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/define.BWpRLYnc.js","assets/MdJsPreview.CainKAmn.js","assets/lit-element.B1EQMsFJ.js","assets/lit-html.BX7rm8u-.js","assets/dedupeMixin.6XPTJgK8.js","assets/LionAccordion.CCw3hAmZ.js","assets/lit-element.BOikny4r.js","assets/uuid.DjYKNjre.js","assets/define.BPRa0k46.js"])))=>i.map(i=>d[i]);
import{_ as l}from"./preload-helper.CVfkMyKi.js";import"./MdJsPreview.CainKAmn.js";import"./lit-element.B1EQMsFJ.js";import{b as t}from"./lit-html.BX7rm8u-.js";import"./node-tools_providence-analytics_overview.BQH7j7jT.js";import"./lion-button.D2RP6o39.js";import"./lion-checkbox.DnByNhxA.js";import"./lion-combobox.DRajEspC.js";import"./lion-option.DeDyiPb9.js";import"./lion-fieldset.DQAti2Nk.js";import"./lion-form.mJGWrayC.js";import"./lion-input-amount.BwrF6UDc.js";import"./lion-input-date.CxdKVl70.js";import"./lion-input-datepicker.CGt3KCcV.js";import"./lion-input-email.BE-NV84K.js";import"./lion-input-file.Bw1bksQE.js";import"./lion-input-tel.C9OZt5z0.js";import"./lion-input-tel-dropdown.CPReQaI0.js";import"./lion-input-iban.DBDf-jwD.js";import"./lion-input-range.D-SdbfwE.js";import"./lion-input-stepper.D5gtxUpk.js";import"./lion-input.CnxomEzM.js";import"./lion-listbox.CQB3rrgA.js";import"./lion-radio.Dgz8AVQ2.js";import"./lion-select.CmyCwwHV.js";import"./lion-select-rich.DfaUp5_B.js";import"./lion-switch.tmf1-zwq.js";import"./lion-textarea.UQ-5IC5x.js";import"./lion-button-submit.CECA2Era.js";import{l as a}from"./loadDefaultFeedbackMessages.D-yvjAV5.js";import{R as o}from"./Required.CvxLsCBg.js";import{M as r}from"./StringValidators.UXrPEtgv.js";const c=()=>(a(),t`
    <lion-form>
      <form>
        <lion-fieldset name="fullName">
          <lion-input
            name="firstName"
            label="First Name"
            .fieldName="${"first name"}"
            .validators="${[new o]}"
          ></lion-input>
          <lion-input
            name="lastName"
            label="Last Name"
            .fieldName="${"last name"}"
            .validators="${[new o]}"
          ></lion-input>
        </lion-fieldset>
        <lion-input-date
          name="date"
          label="Date of application"
          .modelValue="${new Date("2000-12-12")}"
          .validators="${[new o]}"
        ></lion-input-date>
        <lion-input-datepicker
          name="datepicker"
          label="Date to be picked"
          .modelValue="${new Date("2020-12-12")}"
          .validators="${[new o]}"
        ></lion-input-datepicker>
        <lion-textarea
          name="bio"
          label="Biography"
          .fieldName="${"value"}"
          .validators="${[new o,new r(10)]}"
          help-text="Please enter at least 10 characters"
        ></lion-textarea>
        <lion-input-amount name="money" label="Money"></lion-input-amount>
        <lion-input-iban name="iban" label="Iban"></lion-input-iban>
        <lion-input-email name="email" label="Email"></lion-input-email>
        <lion-input-file name="file" label="File"></lion-input-file>
        <lion-input-tel name="tel" label="Telephone number"></lion-input-tel>
        <lion-checkbox-group
          label="What do you like?"
          name="checkers"
          .validators="${[new o]}"
          .fieldName="${"value"}"
        >
          <lion-checkbox .choiceValue="${"foo"}" label="I like foo"></lion-checkbox>
          <lion-checkbox .choiceValue="${"bar"}" label="I like bar"></lion-checkbox>
          <lion-checkbox .choiceValue="${"baz"}" label="I like baz"></lion-checkbox>
        </lion-checkbox-group>
        <lion-radio-group
          name="dinosaurs"
          label="Favorite dinosaur"
          .fieldName="${"dinosaur"}"
          .validators="${[new o]}"
        >
          <lion-radio .choiceValue="${"allosaurus"}" label="allosaurus"></lion-radio>
          <lion-radio .choiceValue="${"brontosaurus"}" label="brontosaurus"></lion-radio>
          <lion-radio .choiceValue="${"diplodocus"}" label="diplodocus"></lion-radio>
        </lion-radio-group>
        <lion-listbox name="favoriteFruit" label="Favorite fruit">
          <lion-option .choiceValue="${"Apple"}">Apple</lion-option>
          <lion-option checked .choiceValue="${"Banana"}">Banana</lion-option>
          <lion-option .choiceValue="${"Mango"}">Mango</lion-option>
        </lion-listbox>
        <lion-combobox
          .validators="${[new o]}"
          name="favoriteMovie"
          label="Favorite movie"
          autocomplete="both"
        >
          <lion-option checked .choiceValue="${"Rocky"}">Rocky</lion-option>
          <lion-option .choiceValue="${"Rocky II"}">Rocky II</lion-option>
          <lion-option .choiceValue="${"Rocky III"}">Rocky III</lion-option>
          <lion-option .choiceValue="${"Rocky IV"}">Rocky IV</lion-option>
          <lion-option .choiceValue="${"Rocky V"}">Rocky V</lion-option>
          <lion-option .choiceValue="${"Rocky Balboa"}">Rocky Balboa</lion-option>
        </lion-combobox>
        <lion-select-rich name="favoriteColor" label="Favorite color">
          <lion-option .choiceValue="${"red"}">Red</lion-option>
          <lion-option .choiceValue="${"hotpink"}" checked>Hotpink</lion-option>
          <lion-option .choiceValue="${"teal"}">Teal</lion-option>
        </lion-select-rich>
        <lion-select label="Lyrics" name="lyrics" .validators="${[new o]}">
          <select slot="input">
            <option value="1">Fire up that loud</option>
            <option value="2">Another round of shots...</option>
            <option value="3">Drop down for what?</option>
          </select>
        </lion-select>
        <lion-input-range
          name="range"
          min="1"
          max="5"
          .modelValue="${2.3}"
          unit="%"
          step="0.1"
          label="Input range"
        ></lion-input-range>
        <lion-checkbox-group
          name="terms"
          .validators="${[new o("",{getMessage:()=>"Please accept our terms."})]}"
        >
          <lion-checkbox
            .choiceValue="${"true"}"
            label="I blindly accept all terms and conditions"
          ></lion-checkbox>
        </lion-checkbox-group>
        <lion-switch name="notifications" label="Notifications"></lion-switch>
        <lion-input-stepper max="5" min="0" name="rsvp">
          <label slot="label">RSVP</label>
          <div slot="help-text">Max. 5 guests</div>
        </lion-input-stepper>
        <div class="buttons">
          <lion-button-submit>Submit</lion-button-submit>
          <lion-button-reset
            @click="${e=>e.currentTarget.parentElement.parentElement.parentElement.resetGroup()}"
            >Reset</lion-button-reset
          >
        </div>
      </form>
    </lion-form>
  `),p=document,m=[{key:"main",story:c}];let n=!1;for(const e of m){const i=p.querySelector(`[mdjs-story-name="${e.key}"]`);i&&(i.story=e.story,i.key=e.key,n=!0,Object.assign(i,{simulatorUrl:"/simulator",languages:[{key:"de-DE",name:"German"},{key:"en-GB",name:"English (United Kingdom)"},{key:"en-US",name:"English (United States)"},{key:"nl-NL",name:"Dutch"}]}))}n&&(customElements.get("mdjs-preview")||l(()=>import("./define.BWpRLYnc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])),customElements.get("mdjs-story")||l(()=>import("./define.BPRa0k46.js"),__vite__mapDeps([8,2,3])));export{c as main};
