import assert from 'node:assert/strict';

import {
  buildFenceDocument,
  buildFenceImportMap,
  getFencePolicy,
  toVendoredUrl,
} from '../browser/host.js';

const assetsOrigin = 'https://lion.js.org';
const packageMap = {
  importMapPerPackage: {
    '@lion/nodejs-helpers': { '.': 'packages-node/nodejs-helpers/src/index.js' },
    prettier: { './standalone.js': 'node_modules/prettier/standalone.js' },
  },
};

describe('host: vendored urls', () => {
  it('rewrites the package root to the name-keyed layout the vendoring writes', () => {
    assert.equal(
      toVendoredUrl('packages-node/nodejs-helpers/src/index.js', '@lion/nodejs-helpers', assetsOrigin),
      'https://lion.js.org/node_modules/@lion/nodejs-helpers/src/index.js',
    );
    assert.equal(
      toVendoredUrl('packages/ui/exports/button.js', '@lion/ui', assetsOrigin),
      'https://lion.js.org/node_modules/@lion/ui/exports/button.js',
    );
    assert.equal(
      toVendoredUrl('node_modules/prettier/standalone.js', 'prettier', assetsOrigin),
      'https://lion.js.org/node_modules/prettier/standalone.js',
    );
  });

  it('takes the shortest prefix as the package root, so a nested folder of the same name is not it', () => {
    assert.equal(
      toVendoredUrl('packages/ui/src/ui/utils.js', '@lion/ui', assetsOrigin),
      'https://lion.js.org/node_modules/@lion/ui/src/ui/utils.js',
    );
  });
});

describe('host: fence policy', () => {
  it('names the origin without a path and keeps unsafe-eval out', () => {
    const policy = getFencePolicy(assetsOrigin);
    assert.match(policy, /script-src 'unsafe-inline' blob: https:\/\/lion\.js\.org/);
    assert.equal(policy.includes('unsafe-eval'), false);
    assert.match(policy, /connect-src blob:/);
    assert.match(policy, /default-src 'none'/);
  });
});

describe('host: import map for the fence', () => {
  it('maps the package’s own modules the way the playground does', () => {
    const { imports } = buildFenceImportMap(packageMap, assetsOrigin);
    assert.equal(
      imports['@lion/nodejs-helpers'],
      'https://lion.js.org/node_modules/@lion/nodejs-helpers/src/index.js',
    );
    assert.equal(imports['prettier/standalone.js'], 'https://lion.js.org/node_modules/prettier/standalone.js');
  });

  it('adds a shim for every builtin, in both specifier forms', () => {
    const { imports } = buildFenceImportMap(packageMap, assetsOrigin);
    assert.equal(imports.fs, 'https://lion.js.org/fs.js');
    assert.equal(imports['node:fs'], 'https://lion.js.org/fs.js');
    assert.equal(imports['node:fs/promises'], 'https://lion.js.org/fs-promises.js');
    assert.equal(imports.path, 'https://lion.js.org/path.js');
  });

  it('lets the shims win over a package that claims a builtin name', () => {
    const hostile = {
      importMapPerPackage: { fs: { '.': 'node_modules/some-cdn-fs/index.js' } },
    };
    const { imports } = buildFenceImportMap(hostile, assetsOrigin);
    assert.equal(imports.fs, 'https://lion.js.org/fs.js');
  });
});

describe('host: fence document', () => {
  const document = buildFenceDocument({
    importMap: buildFenceImportMap(packageMap, assetsOrigin),
    engineUrl: `${assetsOrigin}/engine.js`,
    payload: { entry: 'demo.js', files: { '/demo.js': 'console.log("</script>")' } },
    assetsOrigin,
  });

  it('carries the policy, the import map, the payload and the engine import', () => {
    assert.match(document, /http-equiv="Content-Security-Policy"/);
    assert.match(document, /<script type="importmap">/);
    assert.match(document, /window\.__nodeDemoRunnerPayload = /);
    assert.match(document, /<script type="module">import "https:\/\/lion\.js\.org\/engine\.js";/);
  });

  it('escapes the payload so a demo file cannot close the script tag', () => {
    assert.equal(document.includes('</script>")'), false);
    assert.match(document, /\\u003c\/script>/);
  });

  it('has exactly three script tags: map, payload, engine', () => {
    assert.equal((document.match(/<script/g) || []).length, 3);
  });
});
