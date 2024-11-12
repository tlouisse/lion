import { AsyncDirective } from 'lit/async-directive.js';

export class UIPartDirective extends AsyncDirective {
  host;

  #hasAlreadySetup = false;

  allowedParts = ['root'];

  // first updated
  setupFunctions = {};

  updateFunctions = {};

  update(part, [context, name, localContext]) {
    this.host = part.options.host;
    if (!this.#hasAlreadySetup) {
      if (!this.allowedParts.includes(name)) {
        throw new Error(`[UIPartDirective setup] Unknown part ${name}`);
      }

      part.element.setAttribute('data-part', name);
      context.registerRef(name, part.element);
      this.setupFunctions[name](part, { context, localContext });
      this.#hasAlreadySetup = true;
    } else {
      if (!this.allowedParts.includes(name)) {
        throw new Error(`[UIPartDirective update] Unknown part ${name}`);
      }
      this.updateFunctions[name]?.(part, { context, localContext });
    }
  }
}

// eslint-disable-next-line arrow-body-style
export const createPartDirective = (ctor, context) => {
  return (...values) => ({
    // This property needs to remain unminified.
    ['_$litDirective$']: ctor,
    values: [context, ...values],
  });
};
