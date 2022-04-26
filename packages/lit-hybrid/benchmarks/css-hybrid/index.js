/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
// @ts-ignore
import { css } from 'lit';
// @ts-ignore
import { cssHybrid } from '../index.js';
import { queryParams } from '../utils/query-params.js';

(async () => {
  /**
   * @param {any} cssTag
   * @param {number} depth
   */
  // @ts-expect-error
  function generateCssLvl(cssTag, depth) {
    let tagToUse = cssTag;
    if (depth < 0) {
      return;
    } else if (depth === 0) {
      // Make sure that leaf nodes use css, so we measure effect of making that hybrid v1 compatible (2^depth times)
      tagToUse = css;
    }
    return tagToUse`.something { ${generateCssLvl(
      cssTag,
      depth,
    )} } .something-else { ${generateCssLvl(cssTag, depth)} }`;
  }

  /**
   * @param {any} cssTag
   */
  function generateCss(cssTag, depth = 100) {
    generateCssLvl(cssTag, depth);
  }

  (async () => {
    // const updateComplete = () => new Promise((r) => requestAnimationFrame(r));

    const benchmark = queryParams.benchmark;
    const getTestStartName = (/** @type {string} */ name) => `${name}-start`;

    const cssBaselinePerf = async () => {
      const test = 'css-baseline';
      if (benchmark === test || !benchmark) {
        const start = getTestStartName(test);
        generateCss(css);
        // await updateComplete();
        performance.measure(test, start);
      }
    };
    await cssBaselinePerf();

    const cssHybridPerf = async () => {
      const test = 'css-hybrid';
      if (benchmark === test || !benchmark) {
        const start = getTestStartName(test);
        generateCss(cssHybrid);
        // await updateComplete();
        performance.measure(test, start);
      }
    };
    await cssHybridPerf();

    // Log
    performance
      .getEntriesByType('measure')
      .forEach(m => console.log(`${m.name}: ${m.duration.toFixed(3)}ms`));
  })();
})();
