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
      'https://lion.js.org/deps/@lion/nodejs-helpers/src/index.js',
    );
    assert.equal(
      toVendoredUrl('packages/ui/exports/button.js', '@lion/ui', assetsOrigin),
      'https://lion.js.org/deps/@lion/ui/exports/button.js',
    );
    assert.equal(
      toVendoredUrl('node_modules/prettier/standalone.js', 'prettier', assetsOrigin),
      'https://lion.js.org/deps/prettier/standalone.js',
    );
  });

  it('takes the shortest prefix as the package root, so a nested folder of the same name is not it', () => {
    assert.equal(
      toVendoredUrl('packages/ui/src/ui/utils.js', '@lion/ui', assetsOrigin),
      'https://lion.js.org/deps/@lion/ui/src/ui/utils.js',
    );
  });
});

describe('host: fence policy', () => {
  it('names the origin without a path, allows wasm but not js eval', () => {
    const policy = getFencePolicy(assetsOrigin);
    assert.match(policy, /script-src 'unsafe-inline' 'wasm-unsafe-eval' blob: https:\/\/lion\.js\.org/);
    assert.match(policy, /connect-src blob:/);
    assert.match(policy, /default-src 'none'/);
    // `'wasm-unsafe-eval'` contains the substring, so the check is on the tokens.
    const scriptTokens = policy
      .split(';')
      .find(part => part.trim().startsWith('script-src'))
      .split(/\s+/);
    assert.equal(scriptTokens.includes("'unsafe-eval'"), false);
  });
});

describe('host: import map for the fence', () => {
  it('maps the package’s own modules the way the playground does', () => {
    const { imports } = buildFenceImportMap(packageMap, assetsOrigin);
    assert.equal(
      imports['@lion/nodejs-helpers'],
      'https://lion.js.org/deps/@lion/nodejs-helpers/src/index.js',
    );
    assert.equal(imports['prettier/standalone.js'], 'https://lion.js.org/deps/prettier/standalone.js');
  });

  it('adds a shim for every builtin, in both specifier forms', () => {
    const { imports } = buildFenceImportMap(packageMap, assetsOrigin);
    assert.equal(imports.fs, 'https://lion.js.org/fs.js');
    assert.equal(imports['node:fs'], 'https://lion.js.org/fs.js');
    assert.equal(imports['node:fs/promises'], 'https://lion.js.org/fs-promises.js');
    assert.equal(imports.path, 'https://lion.js.org/path.js');
  });

  it('gives a bare specifier to a package whose export map has no "." (unified, @babel/*)', () => {
    const { imports } = buildFenceImportMap(
      {
        importMapPerPackage: {
          '@babel/parser': { './lib/index.js': 'node_modules/@babel/parser/lib/index.js' },
        },
        packageMains: { '@babel/parser': 'node_modules/@babel/parser/lib/index.js' },
      },
      assetsOrigin,
    );
    assert.equal(
      imports['@babel/parser'],
      'https://lion.js.org/deps/@babel/parser/lib/index.js',
    );
  });

  it('does not let the package.json entry override one from the export map', () => {
    const { imports } = buildFenceImportMap(
      {
        importMapPerPackage: { unified: { '.': 'node_modules/unified/index.js' } },
        packageMains: { unified: 'node_modules/unified/not-this-one.js' },
      },
      assetsOrigin,
    );
    assert.equal(imports.unified, 'https://lion.js.org/deps/unified/index.js');
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
    assert.match(document, /import "\/engine\.js"|import "https:\/\/lion\.js\.org\/engine\.js"/);
  });

  it('imports the scoped custom element registry before the engine, for Lion in an opaque origin', () => {
    assert.match(
      document,
      /import 'https:\/\/lion\.js\.org\/deps\/@webcomponents\/scoped-custom-element-registry\/scoped-custom-element-registry\.min\.js';/,
    );
    assert.ok(document.indexOf('scoped-custom-element-registry') < document.indexOf('engine.js'));
  });

  it('embeds demo styles, without letting them close the style element', () => {
    const withStyles = buildFenceDocument({
      importMap: { imports: {} },
      engineUrl: `${assetsOrigin}/engine.js`,
      payload: {},
      assetsOrigin,
      styles: 'lion-button { color: red; } /* </style><script>bad()</script> */',
    });
    assert.match(withStyles, /lion-button \{ color: red; \}/);
    assert.equal(withStyles.includes('</style><script>bad()'), false);
    assert.match(withStyles, /<\\\/style>/);
  });

  it('escapes the payload so a demo file cannot close the script tag', () => {
    assert.equal(document.includes('</script>")'), false);
    assert.match(document, /\\u003c\/script>/);
  });

  it('has exactly three script tags: map, payload, engine', () => {
    assert.equal((document.match(/<script/g) || []).length, 3);
  });
});
