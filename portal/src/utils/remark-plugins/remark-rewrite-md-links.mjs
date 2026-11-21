import { visit } from 'unist-util-visit';
import path from 'path';

export function remarkRewriteMdLinks({ hasTrailingSlash = false, base = '' } = {}) {
  return function (tree, file) {
    const currentDir = path.dirname(file.path);

    visit(tree, 'link', node => {
      if (node.url && node.url.endsWith('.md')) {
        // Resolve relative to current file, then rewrite
        const resolvedUrl = path.resolve(currentDir, node.url);
        const relativePath = path.relative(currentDir, resolvedUrl);
        node.url = relativePath.replace(/\.md$/, hasTrailingSlash ? '/' : '');
      }
    });

    /*
     * Images written from the site root — ![alt](/blog/images/x.png) — work while the site is served from the
     * root and 404 the moment it is served from a base path, which is what the fork's Pages deploy does. Measured
     * there: twelve of them failed on /blog/ alone. Relative ones (./images/x.png) already resolve through
     * Astro, so only the absolute form is rewritten here.
     */
    visit(tree, 'image', node => {
      if (base && node.url && node.url.startsWith('/') && !node.url.startsWith('//')) {
        node.url = `${base}${node.url}`;
      }
    });
  };
}
