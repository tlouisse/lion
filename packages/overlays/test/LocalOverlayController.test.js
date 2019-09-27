import { expect, fixture, html, aTimeout, defineCE, unsafeStatic } from '@open-wc/testing';
import Popper from 'popper.js/dist/esm/popper.min.js';

import { keyCodes } from '../src/utils/key-codes.js';
import { simulateTab } from '../src/utils/simulate-tab.js';

import { LocalOverlayController } from '../src/LocalOverlayController.js';

import { runBaseOverlaySuite } from '../test-suites/BaseOverlayController.suite.js';

/**
 * @desc Compensates for browsers that use floats in output
 * - from: 'transform3d(12.25px, 6.75px, 0px)'
 * - to: 'transform3d(12px, 7px, 0px)'
 * @param {string} cssValue
 */
export function normalizeTransformStyle(cssValue) {
  // eslint-disable-next-line no-unused-vars
  const [_, transformType, positionPart] = cssValue.match(/(.*)\((.*?)\)/);
  const normalizedNumbers = positionPart
    .split(',')
    .map(p => Math.round(Number(p.replace('px', ''))));
  return `${transformType}(${normalizedNumbers
    .map((n, i) => `${n}px${normalizedNumbers.length - 1 === i ? '' : ', '}`)
    .join('')})`;
}

describe('LocalOverlayController', () => {
  describe('extends BaseOverlayController', () => {
    runBaseOverlaySuite((...args) => new LocalOverlayController(...args));
  });

  describe('templates', () => {
    it('creates a controller with methods: show, hide, sync and syncInvoker', async () => {
      const invokerNode = await fixture(html`
        <div role="button">Invoker</div>
      `);
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div>Content</div>
        `,
        invokerNode,
      });
      expect(ctrl.show).to.be.a('function');
      expect(ctrl.hide).to.be.a('function');
      expect(ctrl.sync).to.be.a('function');
      expect(ctrl.syncInvoker).to.be.a('function');
    });

    it('renders holders for invoker and content', async () => {
      const invokerNode = await fixture(html`
        <div role="button" id="invoker">Invoker</div>
      `);
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div id="content">Content</div>
        `,
        invokerNode,
      });
      const el = await fixture(html`
        <div>
          ${ctrl.invoker} ${ctrl.content}
        </div>
      `);

      expect(el.querySelector('#invoker').textContent.trim()).to.equal('Invoker');
      await ctrl.show();
      expect(el.querySelector('#content').textContent.trim()).to.equal('Content');
    });

    it('exposes isShown state for reading', async () => {
      const invokerNode = await fixture('<div role="button">Invoker</div>');
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div>Content</div>
        `,
        invokerNode,
      });
      await fixture(html`
        <div>
          ${ctrl.invoker} ${ctrl.content}
        </div>
      `);
      expect(ctrl.isShown).to.equal(false);
      await ctrl.show();
      expect(ctrl.isShown).to.equal(true);
      await ctrl.hide();
      expect(ctrl.isShown).to.equal(false);
    });

    // deprecated
    it('@deprecated can use a .invokerTemplate and .syncInvoker', async () => {
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div>Content</div>
        `,
        invokerTemplate: (data = { text: 'foo' }) => html`
          <div role="button">${data.text}</div>
        `,
      });

      expect(ctrl.invoker.textContent.trim()).to.equal('foo');
      ctrl.syncInvoker({ data: { text: 'bar' } });
      expect(ctrl.invoker.textContent.trim()).to.equal('bar');
    });

    it('can synchronize the content data', async () => {
      const invokerNode = await fixture('<div role="button">Invoker</div>');
      const ctrl = new LocalOverlayController({
        contentTemplate: ({ text = 'fallback' } = {}) => html`
          <div>${text}</div>
        `,
        invokerNode,
      });

      await ctrl.show();
      await ctrl.sync({ data: { text: 'foo' } });
      expect(ctrl.content.textContent.trim()).to.equal('foo');

      await ctrl.sync({ data: { text: 'bar' } });
      expect(ctrl.content.textContent.trim()).to.equal('bar');
    });
  });

  describe('nodes', () => {
    it('accepts HTML Elements (contentNode) to render content', async () => {
      const invokerNode = await fixture(html`
        <div role="button" id="invoker">Invoker</div>
      `);

      const node = document.createElement('div');
      node.innerHTML = '<div id="content">Content</div>';

      const ctrl = new LocalOverlayController({
        contentNode: node,
        invokerNode,
      });
      const el = await fixture(html`
        <div>
          ${ctrl.invoker} ${ctrl.content}
        </div>
      `);

      expect(el.querySelector('#invoker').textContent.trim()).to.equal('Invoker');
      await ctrl.show();
      expect(el.querySelector('#content').textContent.trim()).to.equal('Content');
    });

    it('sets display to inline-block for contentNode by default', async () => {
      const invokerNode = await fixture(html`
        <div role="button" id="invoker">Invoker</div>
      `);

      const node = document.createElement('div');
      node.innerHTML = '<div id="content">Content</div>';

      const ctrl = new LocalOverlayController({
        contentNode: node,
        invokerNode,
      });
      const el = await fixture(html`
        <div>
          ${ctrl.invoker} ${ctrl.content}
        </div>
      `);

      await ctrl.show();
      const contentWrapper = el.querySelector('#content').parentElement;
      expect(contentWrapper.style.display).to.equal('inline-block');
    });
  });

  // Please use absolute positions in the tests below to prevent the HTML generated by
  // the test runner from interfering.
  describe('positioning', () => {
    it('creates a popper instance on the controller when shown, keeps it when hidden', async () => {
      const invokerNode = await fixture(
        html`
          <div role="button" style="width: 100px; height: 20px;"></div>
        `,
      );
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
      });
      await ctrl.show();
      expect(ctrl._popper)
        .to.be.an.instanceof(Popper)
        .and.have.property('modifiers');
      await ctrl.hide();
      expect(ctrl._popper)
        .to.be.an.instanceof(Popper)
        .and.have.property('modifiers');
    });

    it('positions correctly', async () => {
      // smoke test for integration of popper
      const invokerNode = await fixture(html`
        <div role="button" style="width: 100px; height: 20px;">Invoker</div>
      `);
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px; margin: 0;">my content</div>
        `,
        invokerNode,
      });
      await fixture(html`
        ${invokerNode}${ctrl.content}
      `);

      await ctrl.show();

      expect(normalizeTransformStyle(ctrl.contentNode.style.transform)).to.equal(
        // TODO: check if 'translate3d(16px, 16px, 0px)' would be more appropriate
        'translate3d(16px, 28px, 0px)',
        '16px displacement is expected due to both horizontal and vertical viewport margin',
      );
    });

    it('uses top as the default placement', async () => {
      let ctrl;
      const invokerNode = await fixture(html`
        <div role="button" style="width: 100px; height: 20px;" @click=${() => ctrl.show()}></div>
      `);
      ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
      });
      await fixture(html`
        <div style="position: absolute; left: 100px; top: 100px;">
          ${ctrl.invoker} ${ctrl.content}
        </div>
      `);
      await ctrl.show();
      const contentChild = ctrl.content.firstElementChild;
      expect(contentChild.getAttribute('x-placement')).to.equal('top');
    });

    it('positions to preferred place if placement is set and space is available', async () => {
      let controller;
      const invokerNode = await fixture(html`
        <div
          role="button"
          style="width: 100px; height: 20px;"
          @click=${() => controller.show()}
        ></div>
      `);

      controller = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
        popperConfig: {
          placement: 'left-start',
        },
      });
      await fixture(html`
        <div style="position: absolute; left: 100px; top: 50px;">
          ${controller.invoker} ${controller.content}
        </div>
      `);

      await controller.show();
      const contentChild = controller.content.firstElementChild;
      expect(contentChild.getAttribute('x-placement')).to.equal('left-start');
    });

    it('positions to different place if placement is set and no space is available', async () => {
      let ctrl;
      const invokerNode = await fixture(html`
        <div role="button" style="width: 100px; height: 20px;" @click=${() => ctrl.show()}></div>
      `);
      ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
        popperConfig: {
          placement: 'top-start',
        },
      });
      await fixture(`
        <div style="position: absolute; top: 0;">
          ${ctrl.invoker} ${ctrl.content}
        </div>
      `);

      await ctrl.show();
      const contentChild = ctrl.content.firstElementChild;
      expect(contentChild.getAttribute('x-placement')).to.equal('bottom-start');
    });

    it('allows the user to override default Popper modifiers', async () => {
      let controller;
      const invokerNode = await fixture(html`
        <div
          role="button"
          style="width: 100px; height: 20px;"
          @click=${() => controller.show()}
        ></div>
      `);
      controller = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
        popperConfig: {
          modifiers: {
            keepTogether: {
              enabled: false,
            },
            offset: {
              enabled: true,
              offset: `0, 16px`,
            },
          },
        },
      });
      await fixture(html`
        <div style="position: absolute; left: 100px; top: 50px;">
          ${controller.invoker} ${controller.content}
        </div>
      `);

      await controller.show();
      const keepTogether = controller._popper.modifiers.find(item => item.name === 'keepTogether');
      const offset = controller._popper.modifiers.find(item => item.name === 'offset');
      expect(keepTogether.enabled).to.be.false;
      expect(offset.enabled).to.be.true;
      expect(offset.offset).to.equal('0, 16px');
    });

    it('positions the popper element correctly on show', async () => {
      let controller;
      const invokerNode = await fixture(html`
        <div
          role="button"
          style="width: 100px; height: 20px;"
          @click=${() => controller.show()}
        ></div>
      `);
      controller = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
        popperConfig: {
          placement: 'top',
        },
      });
      await fixture(html`
        <div style="position: absolute; top: 300px; left: 100px;">
          ${controller.invoker} ${controller.content}
        </div>
      `);

      await controller.show();

      let contentChild = controller.content.firstElementChild;
      expect(normalizeTransformStyle(contentChild.style.transform)).to.equal(
        'translate3d(10px, -28px, 0px)',
        'Popper positioning values',
      );

      await controller.hide();
      await controller.show();
      contentChild = controller.content.firstElementChild;
      expect(normalizeTransformStyle(contentChild.style.transform)).to.equal(
        'translate3d(10px, -28px, 0px)',
        'Popper positioning values should be identical after hiding and showing',
      );
    });

    // TODO: dom get's removed when hidden so no dom node to update placement
    it('updates placement properly even during hidden state', async () => {
      let controller;
      const invokerNode = await fixture(html`
        <div
          role="button"
          style="width: 100px; height: 20px;"
          @click=${() => controller.show()}
        ></div>
      `);
      controller = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
        popperConfig: {
          placement: 'top',
          modifiers: {
            offset: {
              enabled: true,
              offset: '0, 10px',
            },
          },
        },
      });
      await fixture(html`
        <div style="position: absolute; top: 300px; left: 100px;">
          ${controller.invoker} ${controller.content}
        </div>
      `);

      await controller.show();
      let contentChild = controller.content.firstElementChild;
      expect(normalizeTransformStyle(contentChild.style.transform)).to.equal(
        'translate3d(10px, -30px, 0px)',
        'Popper positioning values',
      );

      await controller.hide();
      await controller.updatePopperConfig({
        modifiers: {
          offset: {
            enabled: true,
            offset: '0, 20px',
          },
        },
      });
      await controller.show();
      contentChild = controller.content.firstElementChild;
      expect(controller._popper.options.modifiers.offset.offset).to.equal('0, 20px');
      expect(normalizeTransformStyle(contentChild.style.transform)).to.equal(
        'translate3d(10px, -40px, 0px)',
        'Popper positioning Y value should be 10 less than previous, due to the added extra 10px offset',
      );
    });

    it('updates positioning correctly during shown state when config gets updated', async () => {
      let controller;
      const invokerNode = await fixture(html`
        <div role="button" style="width: 100px; height: 20px;" @click=${() => controller.show()}>
          Invoker
        </div>
      `);
      controller = new LocalOverlayController({
        contentTemplate: () => html`
          <div style="width: 80px; height: 20px;"></div>
        `,
        invokerNode,
        popperConfig: {
          placement: 'top',
          modifiers: {
            offset: {
              enabled: true,
              offset: '0, 10px',
            },
          },
        },
      });
      await fixture(html`
        <div style="position: absolute; top: 300px; left: 100px;">
          ${controller.invoker} ${controller.content}
        </div>
      `);

      await controller.show();
      const contentChild = controller.content.firstElementChild;
      expect(normalizeTransformStyle(contentChild.style.transform)).to.equal(
        'translate3d(10px, -30px, 0px)',
        'Popper positioning values',
      );

      await controller.updatePopperConfig({
        modifiers: {
          offset: {
            enabled: true,
            offset: '0, 20px',
          },
        },
      });
      expect(normalizeTransformStyle(contentChild.style.transform)).to.equal(
        'translate3d(10px, -40px, 0px)',
        'Popper positioning Y value should be 10 less than previous, due to the added extra 10px offset',
      );
    });

    it('can set the contentNode minWidth as the invokerNode width', async () => {
      const invokerNode = await fixture(
        '<div role="button" style="width: 60px; border: none;">invoker</div>',
      );
      const ctrl = new LocalOverlayController({
        inheritsReferenceObjectWidth: 'min',
        contentTemplate: () =>
          html`
            <div>content</div>
          `,
        invokerNode,
      });
      await ctrl.show();
      expect(ctrl.contentNode.style.minWidth).to.equal('60px');
    });

    it('can set the contentNode maxWidth as the invokerNode width', async () => {
      const invokerNode = await fixture(
        '<div role="button" style="width: 60px; border: none;">invoker</div>',
      );
      const ctrl = new LocalOverlayController({
        inheritsReferenceObjectWidth: 'max',
        contentTemplate: () =>
          html`
            <div>content</div>
          `,
        invokerNode,
      });
      await ctrl.show();
      expect(ctrl.contentNode.style.maxWidth).to.equal('60px');
    });

    it('can set the contentNode width as the invokerNode width', async () => {
      const invokerNode = await fixture(
        '<div role="button" style="width: 60px; border: none;">invoker</div>',
      );
      const ctrl = new LocalOverlayController({
        inheritsReferenceObjectWidth: 'full',
        contentTemplate: () =>
          html`
            <div>content</div>
          `,
        invokerNode,
      });
      await ctrl.show();
      expect(ctrl.contentNode.style.width).to.equal('60px');
    });
  });

  describe('a11y', () => {
    it('adds and removes [aria-expanded] on invoker', async () => {
      const invokerNode = await fixture('<div role="button">invoker</div>');
      const ctrl = new LocalOverlayController({
        contentTemplate: () =>
          html`
            <div>Content</div>
          `,
        invokerNode,
      });
      expect(ctrl.invokerNode.getAttribute('aria-controls')).to.contain(ctrl.content.id);
      expect(ctrl.invokerNode).to.have.attribute('aria-expanded', 'false');
      await ctrl.show();
      expect(ctrl.invokerNode).to.have.attribute('aria-expanded', 'true');
      await ctrl.hide();
      expect(ctrl.invokerNode).to.have.attribute('aria-expanded', 'false');
    });

    it('traps the focus via option { trapsKeyboardFocus: true }', async () => {
      const invokerNode = await fixture('<button>invoker</button>');
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div>
            <button id="el1">Button</button>
            <a id="el2" href="#">Anchor</a>
          </div>
        `,
        invokerNode,
        trapsKeyboardFocus: true,
      });
      // make sure we're connected to the dom
      await fixture(html`
        ${invokerNode}${ctrl.content}
      `);
      await ctrl.show();

      const elOutside = await fixture(`<div role="button">click me</div>`);
      const [el1, el2] = [].slice.call(ctrl.contentNode.querySelectorAll('[id]'));
      el2.focus();
      // this mimics a tab within the contain-focus system used
      const event = new CustomEvent('keydown', { detail: 0, bubbles: true });
      event.keyCode = keyCodes.tab;
      window.dispatchEvent(event);

      expect(elOutside).to.not.equal(document.activeElement);
      expect(el1).to.equal(document.activeElement);
    });

    it('traps the focus via option { trapsKeyboardFocus: true } when using contentNode', async () => {
      const invokerNode = await fixture('<button>Invoker</button>');
      const contentNode = await fixture(html`
        <div>
          <button id="el1">Button</button>
          <a id="el2" href="#">Anchor</a>
        </div>
      `);

      const ctrl = new LocalOverlayController({
        contentNode,
        invokerNode,
        trapsKeyboardFocus: true,
      });
      // make sure we're connected to the dom
      await fixture(html`
        ${ctrl.invoker}${ctrl.content}
      `);
      await ctrl.show();

      const elOutside = await fixture(`<div role="button">click me</div>`);
      const [el1, el2] = [].slice.call(ctrl.contentNode.querySelectorAll('[id]'));

      el2.focus();
      // this mimics a tab within the contain-focus system used
      const event = new CustomEvent('keydown', { detail: 0, bubbles: true });
      event.keyCode = keyCodes.tab;
      window.dispatchEvent(event);

      expect(elOutside).to.not.equal(document.activeElement);
      expect(el1).to.equal(document.activeElement);
    });

    it('allows to move the focus outside of the overlay if trapsKeyboardFocus is disabled', async () => {
      const invokerNode = await fixture('<button>Invoker</button>');
      const ctrl = new LocalOverlayController({
        contentTemplate: () => html`
          <div>
            <button id="el1">Button</button>
          </div>
        `,
        invokerNode,
        trapsKeyboardFocus: false,
      });
      // make sure we're connected to the dom
      await fixture(html`
        ${ctrl.invoker}${ctrl.content}
      `);
      const elOutside = await fixture(`<button>click me</button>`);
      await ctrl.show();
      const el1 = ctrl.content.querySelector('button');

      el1.focus();
      simulateTab();
      expect(elOutside).to.equal(document.activeElement);
    });
  });

  describe('hidesOnOutsideClick', () => {
    it('hides on outside click', async () => {
      const invokerNode = await fixture('<div role="button">Invoker</div>');
      const ctrl = new LocalOverlayController({
        hidesOnOutsideClick: true,
        contentTemplate: () => html`
          <div>Content</div>
        `,
        invokerNode,
      });
      await fixture(html`
        ${invokerNode}${ctrl.content}
      `);
      await ctrl.show();

      document.body.click();
      await aTimeout();
      expect(ctrl.isShown).to.be.false;
    });

    it('doesn\'t hide on "inside" click', async () => {
      const invokerNode = await fixture(html`
        <button>Invoker</button>
      `);
      const ctrl = new LocalOverlayController({
        hidesOnOutsideClick: true,
        contentTemplate: () => html`
          <div>Content</div>
        `,
        invokerNode,
      });
      await fixture(html`
        ${invokerNode}${ctrl.content}
      `);
      await ctrl.show();

      // Don't hide on invoker click
      ctrl.invokerNode.click();
      await aTimeout();
      expect(ctrl.isShown).to.be.true;

      // Don't hide on inside (content) click
      ctrl.contentNode.click();
      await aTimeout();
      expect(ctrl.isShown).to.be.true;

      // Works as well when clicked content element lives in shadow dom
      const tagString = defineCE(
        class extends HTMLElement {
          constructor() {
            super();
            this.attachShadow({ mode: 'open' });
          }

          connectedCallback() {
            this.shadowRoot.innerHTML = '<div><button>click me</button></div>';
          }
        },
      );
      const tag = unsafeStatic(tagString);
      ctrl.contentTemplate = () =>
        html`
          <div>
            <div>Content</div>
            <${tag}></${tag}>
          </div>
        `;

      // Don't hide on inside shadowDom click
      ctrl.content
        .querySelector(tagString)
        .shadowRoot.querySelector('button')
        .click();

      await aTimeout();
      expect(ctrl.isShown).to.be.true;

      // Important to check if it can be still shown after, because we do some hacks inside
      await ctrl.hide();
      expect(ctrl.isShown).to.be.false;
      await ctrl.show();
      expect(ctrl.isShown).to.be.true;
    });

    it('works with 3rd party code using "event.stopPropagation()" on bubble phase', async () => {
      const invokerNode = await fixture(html`
        <div role="button">Invoker</div>
      `);
      const ctrl = new LocalOverlayController({
        hidesOnOutsideClick: true,
        contentTemplate: () =>
          html`
            <div>Content</div>
          `,
        invokerNode,
      });
      const dom = await fixture(`
        <div>
          <div id="popup">${invokerNode}${ctrl.content}</div>
          <div
            id="regular-sibling"
            @click="${() => {
              /* propagates */
            }}"
          ></div>
          <third-party-noise @click="${e => e.stopPropagation()}">
            This element prevents our handlers from reaching the document click handler.
          </third-party-noise>
        </div>
      `);

      await ctrl.show();
      expect(ctrl.isShown).to.equal(true);

      dom.querySelector('third-party-noise').click();
      await aTimeout();
      expect(ctrl.isShown).to.equal(false);

      // Important to check if it can be still shown after, because we do some hacks inside
      await ctrl.show();
      expect(ctrl.isShown).to.equal(true);
    });

    it('works with 3rd party code using "event.stopPropagation()" on capture phase', async () => {
      const invokerNode = await fixture(html`
        <div role="button">Invoker</div>
      `);
      const ctrl = new LocalOverlayController({
        hidesOnOutsideClick: true,
        contentTemplate: () =>
          html`
            <div>Content</div>
          `,
        invokerNode,
      });
      const dom = await fixture(`
        <div>
          <div id="popup">${invokerNode}${ctrl.content}</div>
          <div
            id="regular-sibling"
            @click="${() => {
              /* propagates */
            }}"
          ></div>
          <third-party-noise>
            This element prevents our handlers from reaching the document click handler.
          </third-party-noise>
        </div>
      `);

      dom.querySelector('third-party-noise').addEventListener(
        'click',
        event => {
          event.stopPropagation();
        },
        true,
      );

      await ctrl.show();
      expect(ctrl.isShown).to.equal(true);

      dom.querySelector('third-party-noise').click();
      await aTimeout();
      expect(ctrl.isShown).to.equal(false);

      // Important to check if it can be still shown after, because we do some hacks inside
      await ctrl.show();
      expect(ctrl.isShown).to.equal(true);
    });
  });

  describe('toggles', () => {
    it('toggles on clicks', async () => {
      let ctrl;
      const invokerNode = await fixture(html`
        <button @click="${() => ctrl.toggle()}">Invoker</button>
      `);
      ctrl = new LocalOverlayController({
        hidesOnOutsideClick: true,
        contentTemplate: () =>
          html`
            <div>Content</div>
          `,
        invokerNode,
      });
      const { content, invoker, invokerNode: iNode } = ctrl;
      await fixture(
        html`
          ${invoker}${content}
        `,
      );

      // Show content on first invoker click
      iNode.click();
      await aTimeout();
      expect(ctrl.isShown).to.equal(true);

      // Hide content on click when shown
      iNode.click();
      await aTimeout();
      expect(ctrl.isShown).to.equal(false);

      // Show content on invoker click when hidden
      iNode.click();
      await aTimeout();
      expect(ctrl.isShown).to.equal(true);
    });
  });
});
