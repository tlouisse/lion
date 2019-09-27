import { expect, fixture, html } from '@open-wc/testing';

import { GlobalOverlayController } from '../src/GlobalOverlayController.js';
import { overlays } from '../src/overlays.js';
import { runBaseOverlaySuite } from '../test-suites/BaseOverlayController.suite.js';

function getRootNode() {
  return document.querySelector('.global-overlays');
}

function getRenderedContainers() {
  const rootNode = getRootNode();
  return rootNode ? Array.from(rootNode.children) : [];
}

function isEqualOrHasParent(element, parentElement) {
  if (!parentElement) {
    return false;
  }

  if (element === parentElement) {
    return true;
  }

  return isEqualOrHasParent(element, parentElement.parentElement);
}

function getTopContainer() {
  return getRenderedContainers().find(container => {
    const rect = container.getBoundingClientRect();
    const topElement = document.elementFromPoint(Math.ceil(rect.left), Math.ceil(rect.top));
    return isEqualOrHasParent(container, topElement);
  });
}

function getTopOverlay() {
  const topContainer = getTopContainer();
  return topContainer ? topContainer.children[0] : null;
}

function getRenderedContainer(index) {
  return getRenderedContainers()[index];
}

function getRenderedOverlay(index) {
  const container = getRenderedContainer(index);
  return container ? container.children[0] : null;
}

function cleanup() {
  document.body.removeAttribute('style');
  overlays.teardown();
}

describe('GlobalOverlayController', () => {
  afterEach(cleanup);

  describe('extends BaseOverlayController', () => {
    runBaseOverlaySuite((...args) => overlays.add(new GlobalOverlayController(...args)));
  });

  describe('basics', () => {
    it('renders an overlay from the lit-html based contentTemplate when showing', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          contentTemplate: () => html`
            <p>my content</p>
          `,
        }),
      );
      await ctrl.show();
      expect(getRootNode().children.length).to.equal(1);
      expect(getRootNode().children[0]).to.have.trimmed.text('my content');
    });

    it('removes the overlay from DOM when hiding', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          viewportConfig: {
            placement: 'top-left',
          },
          contentTemplate: () => html`
            <div>Content</div>
          `,
        }),
      );

      await ctrl.show();
      expect(getRenderedContainers().length).to.equal(1);
      expect(getRenderedOverlay(0).tagName).to.equal('DIV');
      expect(getRenderedOverlay(0).textContent).to.equal('Content');
      expect(getTopContainer()).to.equal(getRenderedContainer(0));

      await ctrl.hide();
      expect(getRenderedContainers().length).to.equal(0);
      expect(getTopContainer()).to.not.exist;
    });

    it('exposes isShown state for reading', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          contentTemplate: () => html`
            <p>Content</p>
          `,
        }),
      );

      expect(ctrl.isShown).to.equal(false);

      await ctrl.show();
      expect(ctrl.isShown).to.equal(true);

      await ctrl.hide();
      expect(ctrl.isShown).to.equal(false);
    });

    it('does not recreate the overlay elements when calling show multiple times', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          contentTemplate: () => html`
            <p>Content</p>
          `,
        }),
      );

      await ctrl.show();
      expect(getRenderedContainers().length).to.equal(1);
      const initialContainer = getRenderedContainer(0);
      const initialOverlay = getRenderedOverlay(0);

      await ctrl.show();
      expect(getRenderedContainers().length).to.equal(1);
      expect(getRenderedContainer(0)).to.equal(initialContainer);
      expect(getRenderedOverlay(0)).to.equal(initialOverlay);
    });

    it('supports .sync(isShown, data)', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          contentTemplate: ({ text = 'default' } = {}) => html`
            <p>${text}</p>
          `,
        }),
      );

      await ctrl.sync({ isShown: true, data: { text: 'hello world' } });
      expect(getRenderedContainers().length).to.equal(1);
      expect(getRenderedOverlay(0).textContent).to.equal('hello world');

      await ctrl.sync({ isShown: true, data: { text: 'goodbye world' } });
      expect(getRenderedContainers().length).to.equal(1);
      expect(getRenderedOverlay(0).textContent).to.equal('goodbye world');

      await ctrl.sync({ isShown: false, data: { text: 'goodbye world' } });
      expect(getRenderedContainers().length).to.equal(0);
    });

    describe('contentNode instead of a lit template', () => {
      it('accepts HTML Element (contentNode) as content', async () => {
        const contentNode = await fixture(
          html`
            <p>my content</p>
          `,
        );

        const ctrl = overlays.add(
          new GlobalOverlayController({
            contentNode,
          }),
        );
        await ctrl.show();

        // container, which contains only the contentNode and nothing more
        expect(getRootNode().children.length).to.equal(1);
        expect(getRootNode().children[0].classList.contains('global-overlays__overlay-container'))
          .to.be.true;
        expect(getRootNode().children[0]).to.have.trimmed.text('my content');

        // overlay (the contentNode)
        expect(getRootNode().children[0].children[0].classList.contains('global-overlays__overlay'))
          .to.be.true;
      });

      it('sets contentNode styling to display flex by default', async () => {
        const contentNode = await fixture(
          html`
            <p>my content</p>
          `,
        );
        const ctrl = overlays.add(
          new GlobalOverlayController({
            contentNode,
          }),
        );
        await ctrl.show();
        expect(
          window.getComputedStyle(getRootNode().children[0]).getPropertyValue('display'),
        ).to.equal('flex');
      });
    });
  });

  describe('elementToFocusAfterHide', () => {
    it('focuses body when hiding by default', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          viewportConfig: {
            placement: 'top-left',
          },
          contentTemplate: () => html`
            <div><input />=</div>
          `,
        }),
      );

      await ctrl.show();
      const input = getTopOverlay().querySelector('input');
      input.focus();
      expect(document.activeElement).to.equal(input);

      await ctrl.hide();
      expect(document.activeElement).to.equal(document.body);
    });

    it('supports elementToFocusAfterHide option to focus it when hiding', async () => {
      const input = await fixture(html`
        <input />
      `);

      const ctrl = overlays.add(
        new GlobalOverlayController({
          elementToFocusAfterHide: input,
          viewportConfig: {
            placement: 'top-left',
          },
          contentTemplate: () => html`
            <div><textarea></textarea></div>
          `,
        }),
      );

      await ctrl.show();
      const textarea = getTopOverlay().querySelector('textarea');
      textarea.focus();
      expect(document.activeElement).to.equal(textarea);

      await ctrl.hide();
      expect(document.activeElement).to.equal(input);
    });

    it('allows to set elementToFocusAfterHide on show', async () => {
      const input = await fixture(html`
        <input />
      `);

      const ctrl = overlays.add(
        new GlobalOverlayController({
          viewportConfig: {
            placement: 'top-left',
          },
          contentTemplate: () => html`
            <div><textarea></textarea></div>
          `,
        }),
      );

      await ctrl.show(input);
      const textarea = getTopOverlay().querySelector('textarea');
      textarea.focus();
      expect(document.activeElement).to.equal(textarea);

      await ctrl.hide();
      expect(document.activeElement).to.equal(input);
    });

    it('allows to set elementToFocusAfterHide on sync', async () => {
      const input = await fixture(html`
        <input />
      `);

      const ctrl = overlays.add(
        new GlobalOverlayController({
          viewportConfig: {
            placement: 'top-left',
          },
          contentTemplate: () => html`
            <div><textarea></textarea></div>
          `,
        }),
      );

      await ctrl.sync({ isShown: true, elementToFocusAfterHide: input });
      const textarea = getTopOverlay().querySelector('textarea');
      textarea.focus();
      expect(document.activeElement).to.equal(textarea);

      await ctrl.hide();
      expect(document.activeElement).to.equal(input);

      await ctrl.sync({ isShown: true, elementToFocusAfterHide: input });
      const textarea2 = getTopOverlay().querySelector('textarea');
      textarea2.focus();
      expect(document.activeElement).to.equal(textarea2);

      await ctrl.sync({ isShown: false });
      expect(document.activeElement).to.equal(input);
    });
  });

  describe('preventsScroll', () => {
    it('prevent scrolling the background', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          preventsScroll: true,
          contentTemplate: () => html`
            <p>Content</p>
          `,
        }),
      );

      await ctrl.show();
      ctrl.updateComplete;
      expect(getComputedStyle(document.body).overflow).to.equal('hidden');

      await ctrl.hide();
      ctrl.updateComplete;
      expect(getComputedStyle(document.body).overflow).to.equal('visible');
    });
  });

  describe('hasBackdrop', () => {
    it('has no backdrop by default', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          contentTemplate: () => html`
            <p>Content</p>
          `,
        }),
      );
      await ctrl.show();
      expect(ctrl.backdropNode).to.be.undefined;
    });

    it('supports a backdrop option', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          hasBackdrop: false,
          contentTemplate: () => html`
            <p>Content</p>
          `,
        }),
      );
      await ctrl.show();
      expect(ctrl.backdropNode).to.be.undefined;
      await ctrl.hide();

      const controllerWithBackdrop = overlays.add(
        new GlobalOverlayController({
          hasBackdrop: true,
          contentTemplate: () => html`
            <p>Content</p>
          `,
        }),
      );
      await controllerWithBackdrop.show();
      expect(controllerWithBackdrop.backdropNode).to.have.class('global-overlays__backdrop');
    });

    it('reenables the backdrop when shown/hidden/shown', async () => {
      const ctrl = overlays.add(
        new GlobalOverlayController({
          hasBackdrop: true,
          contentTemplate: () => html`
            <p>Content</p>
          `,
        }),
      );
      await ctrl.show();
      expect(ctrl.backdropNode).to.have.class('global-overlays__backdrop');
      await ctrl.hide();
      await ctrl.show();
      expect(ctrl.backdropNode).to.have.class('global-overlays__backdrop');
    });
  });

  describe('viewportConfig', () => {
    it('places the overlay in center by default', async () => {
      const controller = new GlobalOverlayController({
        contentTemplate: () =>
          html`
            <p>Content</p>
          `,
      });

      controller.show();
      expect(controller.overlayContainerPlacementClass).to.equal(
        'global-overlays__overlay-container--center',
      );
    });

    it('can set the placement relative to the viewport ', async () => {
      const placementMap = [
        'top-left',
        'top',
        'top-right',
        'right',
        'bottom-right',
        'bottom',
        'bottom-left',
        'left',
        'center',
      ];
      placementMap.forEach(viewportPlacement => {
        const controller = new GlobalOverlayController({
          viewportConfig: {
            placement: viewportPlacement,
          },
          contentTemplate: () =>
            html`
              <p>Content</p>
            `,
        });
        controller.show();
        expect(controller.overlayContainerPlacementClass).to.equal(
          `global-overlays__overlay-container--${viewportPlacement}`,
        );
      });
    });
  });
});
