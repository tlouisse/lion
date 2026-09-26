import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

/**
 * Copies the files that `playground-elements` loads at runtime from `sandboxBaseUrl` into the host's
 * static folder.
 *
 * The sandbox only loads two files from that location, and both are self-contained (no further
 * imports), so we do not need to ship the whole ~12MB package:
 *  - `playground-service-worker-proxy.html` — registers the service worker and hands it a port
 *  - `playground-service-worker.js` — the service worker itself
 *
 * Astro's dev server 404s `.html` files served from `node_modules`, and `playground-elements`
 * resolves the proxy relative to `sandboxBaseUrl`, so both files must sit in the same static folder.
 */
const SANDBOX_FILES = ['playground-service-worker-proxy.html', 'playground-service-worker.js'];

/**
 * @returns {string} the `--destination` folder
 */
function getDestination() {
  const index = process.argv.indexOf('--destination');
  const destination = index === -1 ? undefined : process.argv[index + 1];
  if (!destination) {
    throw new Error('Please provide a --destination folder for the sandbox assets');
  }
  return destination;
}

async function generateSandboxAssets() {
  const destination = getDestination();
  const require = createRequire(import.meta.url);
  // `main` is `playground-ide.js` at the package root, so its dirname is the package folder.
  const playgroundElementsDir = path.dirname(require.resolve('playground-elements'));

  await fs.promises.mkdir(destination, { recursive: true });
  for (const file of SANDBOX_FILES) {
    await fs.promises.copyFile(path.join(playgroundElementsDir, file), path.join(destination, file));
  }
}

generateSandboxAssets();
