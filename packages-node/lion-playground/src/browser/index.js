// import * as prettier from 'prettier/standalone.js';
// import * as prettier from 'https://unpkg.com/prettier@3.5.3/standalone.mjs';

import { flattenImportMapPerPackage } from './shareDemo.js';

/**
 * @typedef {import('custom-elements-manifest/schema.js').Package} CustomElementsManifestSchema;
 */

/**
 * For security, we make sure the iframe can never call its parent
 * This needs to be performant and simple (no in-browser ast parsing), but solid.
 * All calls to `parent` or `window.parent` for instance, will become `$parent` and `window.$parent`
 * @param {string} fileString
 * @returns {string}
 */
export function sanitizeIframeFromSameDomain(fileString) {
  // All parent calls get prefixed with a $ to prevent them from being called
  const resultWithoutParentCalls = fileString.replace(
    /(document\.defaultView\.|window\.|\n|\r|\s)(parent|top)/g,
    '$1$$2',
  );
  // We also avoid the use of eval, by removing it (breaking the code)
  // N.B. this regex is a bit aggressive, as it would also remove potentially custom defined eval functions
  // like myeval() or myObject.eval(). But, better safe than sorry and we can always finetune might people actually need it
  const resultWithoutEvalAndWithoutParentCalls = resultWithoutParentCalls.replace(
    /(eval\(.*?\))/g,
    '',
  );

  return resultWithoutEvalAndWithoutParentCalls;
}

// TODO: run through Prettier

/**
 * By default, we run in a LitElement context that can be copy-pasted.
 * As a best practice, it uses ScopedElementsMixin.
 * However, we can also provide demos that load the element definitions, not using ScopedElementsMixin.
 * Also, it should be possible to load elements inside frameworks like React, Vue, Angular, etc.
 * @param {string} demo a string with html
 * @param {{
 *  webComponents: {
 *    source: string;
 *    klass: string;
 *    tag: string;
 *  }[];
 *  extraSetupCode: string;
 * }} opts
 */
export async function createScopedLitElementDemo(
  demo,
  { webComponents = [], extraSetupCode = '' },
) {
  const demoTag = 'my-app';
  const scopedMap = [];
  for (const { tag, klass } of webComponents) {
    scopedMap.push(`'${tag}': ${klass}`);
  }
  const jsFileUnformatted = `/* playground-fold */
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { html, LitElement } from 'lit';

${webComponents.map(({ source, klass }) => `import { ${klass} } from '${source}';`).join('\n')}

${extraSetupCode}

export class MyApp extends ScopedElementsMixin(LitElement) {
  static scopedElements = { ${scopedMap.join(', ')} };

  render() {
    /* playground-fold-end */
    return html\`
      ${demo.trim()}
    \`;
    /* playground-fold */
  }
}
customElements.define('${demoTag}', MyApp);
/* playground-fold-end */
`;

  const jsFile = jsFileUnformatted; // await prettier.format(jsFileUnformatted, {
  //   parser: 'babel',
  // });

  const indexHtmlFile = `<${demoTag}></${demoTag}>`;
  return { jsFile, indexHtmlFile };
}

/**
 *
 * @param {string} fileString
 * @returns {{ imports: { importParts: string[]; source: string }[]; remainingCode: string }}
 */
export function extractImports(fileString) {
  const re = /import\s+(.*)?(\s+from\s+)?("|')(.*)("|');?\n?/;

  // Get imports... we either find a ce definition or a constructors
  const importString = fileString.match(new RegExp(re, 'gm'));
  if (!importString) {
    return { imports: [], remainingCode: fileString };
  }

  const imports = [];
  for (const imp of importString) {
    const [, _importsStr, , , source] = imp.match(re) || [];
    const importParts = _importsStr
      ? _importsStr
          .replace(/\sfrom\s$/, '')
          .split(',')
          .map(i => i.trim())
      : [];
    imports.push({ importParts, source });
  }
  const remainingCode = fileString.replace(new RegExp(re, 'gm'), '');
  return { imports, remainingCode };
}

// N.B. this is fuzzy code. Ideally, we clean up the demos (both in node and in our demos) before processing them here

/**
 * @param {string} source
 * @returns {boolean}
 */
function isCeDefinitionImport(source) {
  return source.includes('/define/');
}

/**
 * @param {string} source
 * @returns {boolean}
 */
function isMdjsImport(source) {
  return source.includes('mdjs');
}

/**
 * @param {string} script the setup globally available on the mdjs page
 */
export function extractExtraSetupCode(script) {
  const { imports, remainingCode } = extractImports(script);
  const relevantImports = [];
  for (const { importParts, source } of imports) {
    if (isCeDefinitionImport(source) || isMdjsImport(source)) continue; // eslint-disable-line no-continue
    relevantImports.push(`import ${importParts.join(', ')} from '${source}';`);
  }

  return `${relevantImports.join('\n')}\n\n${remainingCode}`;
}

/**
 *
 * @param {string} mdjsStoriesFile
 * @returns {{script: string; stories: string[]; storiesSetup: string}}
 */
export function getMdJsStoriesFileSections(mdjsStoriesFile) {
  const [, , script, , storiesString, , storiesSetup] = mdjsStoriesFile.split(
    /\/\*\* (script|stories|stories setup) code \*\*\//g,
  );
  const stories = storiesString
    .split(/^export |\nexport /)
    .filter(Boolean)
    .map(storyTail => `export ${storyTail}`);
  return { script, stories, storiesSetup };
}

/**
 * @param {string} localPathWithDotSlashOrSlash
 * @returns {string}
 */
function normalizeLocalPath(localPathWithDotSlashOrSlash) {
  return localPathWithDotSlashOrSlash.replace(/^\.?\//, '');
}

/**
 * Content Security Policy for the sandbox document — the one place untrusted demo code executes.
 *
 * The sandbox is served same-origin (see the portal page for why), so the same-origin policy cannot
 * contain it. A CSP can still limit what it reaches, and this is the only document we can attach one
 * to: service-worker generated responses do not inherit the origin's own CSP headers, but a `<meta>`
 * policy travels inside the document we build here.
 *
 * `default-src 'none'` with explicit grants is deliberate — anything not listed (frames, media,
 * objects) is denied. `form-action 'none'` and `base-uri 'none'` close the navigation-based routes to
 * turning the page into a phishing surface, and `connect-src 'self'` keeps a demo from posting data
 * to a third party. Scripts stay permissive because the whole point is to run editable code.
 *
 * N.B. `frame-ancestors` is ignored in a `<meta>` policy, so it is not listed here.
 */
const SANDBOX_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
].join('; ');

/**
 * Guard rails against reading origin state, injected into the sandbox document before any demo code.
 *
 * N.B. this is NOT a boundary. The demo shares this realm and can undo any of it — the own-property
 * shims below are bypassable (e.g. `Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')`
 * still yields the real getter). It catches accidents and casual attempts; the guarantee that a read
 * cannot be acted on comes from the host environment, which must not let anything leave the domain.
 * `eval` and `new Function` are genuinely blocked, but by the CSP above (no `'unsafe-eval'`), not by
 * this code.
 */
const SANDBOX_GUARD_SOURCE = `
(() => {
  const blocked = name => {
    throw new Error('Blocked in the playground sandbox: ' + name);
  };
  for (const name of ['localStorage', 'sessionStorage', 'indexedDB', 'caches']) {
    try {
      Object.defineProperty(window, name, {
        get() { blocked(name); },
        configurable: false,
      });
    } catch (_) { /* already non-configurable */ }
  }
  try {
    Object.defineProperty(document, 'cookie', {
      get() { blocked('document.cookie'); },
      set() { blocked('document.cookie'); },
      configurable: false,
    });
  } catch (_) { /* ignore */ }
})();
`;

/**
 * Configures ide to run a demo app
 *
 * `assetsBaseUrl` is the root url under which the files referenced by the generated import map
 * (repo files such as `packages/ui/exports/*.js` and `node_modules/**`) are served. It differs
 * per host: Rocket serves the monorepo root one level above its own root, Astro/Vite serves it
 * directly at the origin.
 * `mapAssetPath` translates a repo relative path (as written by `generateAssets`) into a url the
 * host can serve. It defaults to `${assetsBaseUrl}/${repoRelativePath}`. A host whose document root
 * is not the repo root has to override it: the portal serves `packages/ui` as `node_modules/@lion/ui`,
 * because that is where its own install links the workspace package.
 * @param {HTMLElement} ide
 * @param {{
 *   demoFileName: string;
 *   indexHtmlFile: string;
 *   jsFile: string;
 *   importMapPerPackage: {[pkgName:string]: {[exposedRelative:string]: string}};
 *   assetsBaseUrl?: string;
 *   sandboxBaseUrl?: string;
 *   mapAssetPath?: (repoRelativePath: string) => string;
 * }} opts
 */
export function setupIde(
  ide,
  {
    demoFileName,
    indexHtmlFile,
    jsFile,
    importMapPerPackage,
    assetsBaseUrl,
    sandboxBaseUrl,
    mapAssetPath,
  },
) {
  // N.B. We need below string concatenation to prevent path rewrites from Rocket
  const basePath = assetsBaseUrl || `${window.location.origin}/__wds-outside-root__/1`;
  const toAssetUrl = mapAssetPath || (repoRelativePath => `${basePath}/${repoRelativePath}`);

  // Flattened by the helper the fenced preview uses, so a demo in the ide and a shared link resolve
  // their specifiers identically. e.g. '@lion/ui/button.js': 'packages/ui/exports/button.js'
  const importMapEntriesWithInternalPaths = flattenImportMapPerPackage(
    importMapPerPackage,
    toAssetUrl,
  ).imports;

  // console.debug(importMapEntriesWithInternalPaths);

  ide.sandboxBaseUrl = sandboxBaseUrl || `${basePath}/node_modules/playground-elements`;
  ide.config = {
    importMap: {
      // imports: {
      //   '@webcomponents/scoped-custom-element-registry': `${basePath}/node_modules/@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js`,
      //   '@open-wc/scoped-elements/lit-element.js': `${basePath}/node_modules/@open-wc/scoped-elements/lit-element.js`,
      //   '@lion/ui/button.js': `${basePath}/packages/ui/exports/button.js`,
      //   lit: `${basePath}/node_modules/lit/index.js`,
      //   '@lion/ui/accordion.js': `${basePath}/packages/ui/exports/accordion.js`,
      // },
      imports: importMapEntriesWithInternalPaths,
    },
    files: {
      'index.html': {
        contentType: 'sample/html',
        content:
          `<!-- playground-hide -->
<!doctype html>
<head>
<meta http-equiv="Content-Security-Policy" content="${SANDBOX_CONTENT_SECURITY_POLICY}">
<script>${SANDBOX_GUARD_SOURCE}</script>
<!-- playground-hide-end -->
<script type="importmap">${JSON.stringify({ imports: importMapEntriesWithInternalPaths }).replace(/</g, '\\u003c')}</script>
<script type="module">
  import '${toAssetUrl('node_modules/@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js')}';
  import ` +
          `'./${demoFileName}';
<` +
          `/script>
<!-- playground-hide -->
</head>
<body>  
<!-- playground-hide-end -->
${indexHtmlFile}
<!-- playground-hide -->
</body>
<!-- playground-hide-end -->`,
      },
      [demoFileName]: {
        filename: demoFileName,
        contentType: 'sample/js',
        content: [sanitizeIframeFromSameDomain(jsFile).trim()].join('\n'),
        selected: true,
      },
    },
  };
}

/**
 * @param {string} htmlToRenderInJsContext
 * @returns {string[]} like ['lion-accordion', 'lion-button']
 */
function getCustomElementTagNamesFromHtml(htmlToRenderInJsContext) {
  /** @type {string[]} */
  const tagNames = [];
  const re = /<([a-zA-Z0-9-]+)(\s|>)/g;
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(htmlToRenderInJsContext)) !== null) {
    const tagName = match[1];
    if (tagName.includes('-') && !tagNames.includes(tagName)) {
      tagNames.push(tagName);
    }
  }
  return tagNames;
}

/**
 * @param {string} htmlToRenderInJsContext like `<lion-accordion .prop="${someJs}">some content</lion-accordion>`
 * @param {{
 *  ceManifestObject: {
 *    packageName: string;
 *    packagePath: string;
 *    customElementsJson: CustomElementsManifestSchema;
 *  };
 *  importMapPerPackage: {[pkgName:string]: {[exposedRelative:string]: string}}
 * }} opts
 * @returns {{tag: string; klass: string; source: string}[]} like [{ tag:'lion-accordion', klass: 'LionAccordion', source: '@lion/ui/accordion.js' }];
 */
export function extractWebComponentObject(
  htmlToRenderInJsContext,
  { ceManifestObject, importMapPerPackage },
) {
  // First, we extract tag names from the htmlToRenderInJsContext
  const tagNames = getCustomElementTagNamesFromHtml(htmlToRenderInJsContext);
  if (tagNames.length === 0) {
    throw new Error('No tag names found in the provided HTML string');
  }

  // Second, we look for the tag names in the ceManifestObject
  const { customElementsJson } = ceManifestObject;
  const webComponents = [];
  for (const tagName of tagNames) {
    const moduleContainingTagDefinition = customElementsJson.modules.find(module =>
      module.exports?.find(m => m.kind === 'custom-element-definition' && m.name === tagName),
    );
    if (!moduleContainingTagDefinition) {
      console.warn(`No module found for tag name ${tagName}`); // eslint-disable-line no-console
      continue; // eslint-disable-line no-continue
    }
    const { declaration } =
      moduleContainingTagDefinition.exports?.find(
        (/** @type {{ kind: string; name: string; }} */ m) =>
          m.kind === 'custom-element-definition' && m.name === tagName,
      ) || {};
    if (!declaration || !declaration.module) {
      throw new Error(`No declaration found for tag name ${tagName}`);
    }
    const importMapForOurPackage = importMapPerPackage[ceManifestObject.packageName] || {};
    let source = '';
    for (const [exposedRelative, internalPathFromMonoRoot] of Object.entries(
      importMapForOurPackage,
    )) {
      if (internalPathFromMonoRoot.endsWith(declaration.module)) {
        source = `${ceManifestObject.packageName}/${normalizeLocalPath(exposedRelative)}`;
        break;
      }
    }
    webComponents.push({ tag: tagName, klass: declaration.name, source });
  }

  return webComponents;
}
