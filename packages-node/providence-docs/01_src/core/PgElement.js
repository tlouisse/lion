import { LitElement } from 'lit-element';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import globalCss from './global.css.js';

export class PgElement extends ScopedElementsMixin(LitElement) {
  static styles = [globalCss];
}
