import babelParser from '@babel/parser';
import * as parse5 from 'parse5';
import swc from '@swc/core';
import swcWasmNode from '@next/swc-wasm-nodejs';
import { traverseHtml } from '../utils/traverse-html.js';
import { LogService } from './LogService.js';
import { guardedSwcToBabel } from '../utils/guarded-swc-to-babel.js';

/**
 * @typedef {import("@babel/types").File} File
 * @typedef {import("@swc/core").Module} SwcAstModule
 * @typedef {import("@babel/parser").ParserOptions} ParserOptions
 * @typedef {import('../../../types/index.js').PathFromSystemRoot} PathFromSystemRoot
 */

/** @type {<T>(t:T) => void} */
let resolveParse;
const parseMethodPromise = new Promise(resolve => {
  resolveParse = resolve;
});
const getSwcParseMethod = () => parseMethodPromise;

let needsSwcWasm = true;
/**
 * Determine if we need @swc/wasm-web... In webcontainers, we do...
 * https://github.com/parcel-bundler/watcher/issues/99#issuecomment-1082164928
 */
async function loadSwcWasmIfNeeded() {
  // When regular swc doesn't work, we can try to use swc-wasm
  try {
    swc.parseSync('');
  } catch {
    needsSwcWasm = true;
  }

  if (needsSwcWasm) {
    // Expect this to be loaded as peerDep
    // const swcWasm = await import('@swc/wasm-web');
    // await swcWasmInit();
    // @ts-expect-error
    resolveParse((...args) => JSON.parse(swcWasmNode.parseSync(...args)));
  } else {
    resolveParse(swc.parseSync);
  }
}
loadSwcWasmIfNeeded();

export class AstService {
  /**
   * Compiles an array of file paths using Babel.
   * @param {string} code
   * @param {ParserOptions} parserOptions
   * @returns {File}
   */
  static _getBabelAst(code, parserOptions = {}) {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: [
        'importMeta',
        'dynamicImport',
        'classProperties',
        'exportDefaultFrom',
        'importAssertions',
      ],
      ...parserOptions,
    });
    return ast;
  }

  /**
   * Compiles an array of file paths using Babel.
   * @param {string} code
   * @param {ParserOptions} parserOptions
   * @returns {File}
   */
  static _getSwcToBabelAst(code, parserOptions = {}) {
    if (this.fallbackToBabel) {
      return this._getBabelAst(code, parserOptions);
    }
    const ast = swc.parseSync(code, {
      syntax: 'typescript',
      // importAssertions: true,
      ...parserOptions,
    });
    return guardedSwcToBabel(ast, code);
  }

  /**
   * Compiles an array of file paths using swc.
   * @param {string} code
   * @param {ParserOptions} parserOptions
   * @returns {SwcAstModule}
   */
  static async _getSwcAst(code, parserOptions = {}) {
    const swcParse = await getSwcParseMethod();
    let ast = swcParse(code, {
      syntax: 'typescript',
      target: 'es2022',
      ...parserOptions,
    });
    return ast;
  }

  /**
   * Compensates for swc span bug: https://github.com/swc-project/swc/issues/1366#issuecomment-1516539812
   * @returns {Promise<number>}
   */
  static async _getSwcOffset() {
    const swcParse = await getSwcParseMethod();
    let ast = swcParse('', {
      syntax: 'typescript',
      target: 'es2022',
      ...{},
    });
    // The fuzzy logic behind the wasm and regular version. And swc offsets in general...
    return ast.span.end + (needsSwcWasm ? -1 : 0);
  }

  /**
   * Combines all script tags as if it were one js file.
   * @param {string} htmlCode
   */
  static getScriptsFromHtml(htmlCode) {
    const ast = parse5.parseFragment(htmlCode);
    /**
     * @type {string[]}
     */
    const scripts = [];
    traverseHtml(ast, {
      /**
       * @param {{ node: { childNodes: { value: any; }[]; }; }} path
       */
      script(path) {
        const code = path.node.childNodes[0] ? path.node.childNodes[0].value : '';
        scripts.push(code);
      },
    });
    return scripts;
  }

  /**
   * Returns the Babel AST
   * @param { string } code
   * @param { 'babel'|'swc-to-babel'|'swc'} astType
   * @param { {filePath?: PathFromSystemRoot} } options
   * @returns {Promise<File|undefined|SwcAstModule>}
   */
  // eslint-disable-next-line consistent-return
  static async getAst(code, astType, { filePath } = {}) {
    // eslint-disable-next-line default-case
    try {
      if (astType === 'babel') {
        return this._getBabelAst(code);
      }
      if (astType === 'swc-to-babel') {
        return this._getSwcToBabelAst(code);
      }
      if (astType === 'swc') {
        return await this._getSwcAst(code);
      }
      throw new Error(`astType "${astType}" not supported.`);
    } catch (e) {
      LogService.error(`Error when parsing "${filePath}":/n${e}`);
    }
  }
}
/**
 * This option can be used as a last resort when an swc AST combined with swc-to-babel, is backwards incompatible
 * (for instance when @babel/generator expects a different ast structure and fails).
 * Analyzers should use guarded-swc-to-babel util.
 */
AstService.fallbackToBabel = false;
