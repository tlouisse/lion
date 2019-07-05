import { expect, fixture, html } from '@open-wc/testing';

import '../lion-option.js';

describe('lion-option', () => {
  describe('Values', () => {
    it('has a modelValue', async () => {
      const el = await fixture(html`
        <lion-option .choiceValue=${10}></lion-option>
      `);
      expect(el.modelValue).to.deep.equal({ value: 10, checked: false });
    });

    it('can be checked', async () => {
      const el = await fixture(html`
        <lion-option .choiceValue=${10} checked></lion-option>
      `);
      expect(el.modelValue).to.deep.equal({ value: 10, checked: true });
    });
  });

  describe('Accessibility', () => {
    it('has the "option" role', async () => {
      const el = await fixture(html`
        <lion-option></lion-option>
      `);
      expect(el.getAttribute('role')).to.equal('option');
    });

    it('has "aria-selected" attribute when checked', async () => {
      const el1 = await fixture(html`
        <lion-option .choiceValue=${10}>Item 1</lion-option>
      `);
      const el2 = await fixture(html`
        <lion-option .choiceValue=${20} checked>Item 2</lion-option>
      `);

      expect(el1.getAttribute('aria-selected')).to.equal('false');
      expect(el2.getAttribute('aria-selected')).to.equal('true');

      el1.checked = true;
      el2.checked = false;
      await el1.updateComplete;
      await el2.updateComplete;
      expect(el1.getAttribute('aria-selected')).to.equal('true');
      expect(el2.getAttribute('aria-selected')).to.equal('false');
    });

    it('has "aria-disabled" attribute when disabled', async () => {
      const el1 = await fixture(html`
        <lion-option .choiceValue=${10}>Item 1</lion-option>
      `);
      const el2 = await fixture(html`
        <lion-option .choiceValue=${20} disabled>Item 2</lion-option>
      `);

      expect(el1.getAttribute('aria-disabled')).to.equal('false');
      expect(el2.getAttribute('aria-disabled')).to.equal('true');

      el1.disabled = true;
      el2.disabled = false;
      await el1.updateComplete;
      await el2.updateComplete;
      expect(el1.getAttribute('aria-disabled')).to.equal('true');
      expect(el2.getAttribute('aria-disabled')).to.equal('false');
    });
  });

  describe('State reflection', () => {
    it('can be active', async () => {
      const el = await fixture(html`
        <lion-option .choiceValue=${10}></lion-option>
      `);
      expect(el.active).to.equal(false);
      expect(el.getAttribute('active')).to.equal(null);
      el.active = true;
      expect(el.active).to.equal(true);
      expect(el.getAttribute('active')).to.equal('');    
    });

    it('can be disabled', async () => {
      const el = await fixture(html`
        <lion-option .choiceValue=${10}></lion-option>
      `);
      expect(el.disabled).to.equal(false);
      expect(el.getAttribute('disabled')).to.equal(null);
      el.disabled = true;
      expect(el.disabled).to.equal(true);
      expect(el.getAttribute('disabled')).to.equal('');    
    });
  });
});
