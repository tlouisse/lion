import assert from 'node:assert/strict';

import { resolveEntry, runDemo } from '../browser/engine.js';
import * as fs from '../browser/shims/fs.js';
import * as processShim from '../browser/shims/process.js';

/**
 * The entry is injected, which is the seam that makes this testable outside a fence: in the fence the
 * import map resolves the specifier, here the test decides what the demo's module does.
 * @param {(shims: {fs: object, process: object}) => void} body
 */
function entry(body) {
  return async () => {
    body({ fs, process: processShim });
    return {};
  };
}

describe('engine: runDemo', () => {
  it('seeds the payload, runs the entry and reports its output', async () => {
    const report = await runDemo({
      payload: { entry: 'demo.js', files: { '/input.txt': 'hello' } },
      importEntry: entry(({ fs: fsShim, process }) => {
        fsShim.writeFileSync('/output.txt', fsShim.readFileSync('/input.txt', 'utf8').toUpperCase());
        process.stdout.write('done\n');
      }),
    });

    assert.deepEqual(report.log, [{ stream: 'stdout', text: 'done\n' }]);
    assert.equal(report.exitCode, 0);
    assert.equal(report.files['/output.txt'], 'HELLO');
  });

  it('accepts files as objects, the shape the host sends', async () => {
    const report = await runDemo({
      payload: { entry: 'demo.js', files: { '/a.txt': { content: 'object form' } } },
      importEntry: entry(({ fs: fsShim }) => {
        assert.equal(fsShim.readFileSync('/a.txt', 'utf8'), 'object form');
      }),
    });
    assert.equal(report.exitCode, 0);
  });

  it('reports a process.exit code instead of tearing anything down', async () => {
    const report = await runDemo({
      payload: { entry: 'demo.js', files: {} },
      importEntry: entry(({ process }) => {
        process.stdout.write('before exit\n');
        process.exit(2);
      }),
    });
    assert.equal(report.exitCode, 2);
    assert.deepEqual(report.log, [{ stream: 'stdout', text: 'before exit\n' }]);
  });

  it('turns a thrown error into exit code 1 with the message on stderr', async () => {
    const report = await runDemo({
      payload: { entry: 'demo.js', files: {} },
      importEntry: entry(() => {
        throw new Error('demo exploded');
      }),
    });
    assert.equal(report.exitCode, 1);
    assert.deepEqual(report.log, [{ stream: 'stderr', text: 'demo exploded\n' }]);
  });

  it('imports a demo file from the virtual filesystem as a blob url in this document', async () => {
    const seen = [];
    const report = await runDemo({
      payload: { entry: '/demo.js', files: { '/demo.js': 'export default 1;' } },
      importEntry: async specifier => {
        seen.push(specifier);
      },
    });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].startsWith('blob:'), true);
    assert.equal(report.exitCode, 0);
  });

  it('treats an entry that names no file as a specifier', async () => {
    const seen = [];
    await runDemo({
      payload: { entry: '@lion/nodejs-helpers', files: {} },
      importEntry: async specifier => {
        seen.push(specifier);
      },
    });
    assert.deepEqual(seen, ['@lion/nodejs-helpers']);
  });

  it('resolveEntry reports the entry as a specifier when there is no such file', () => {
    assert.equal(resolveEntry({ entry: 'not-installed', files: {} }, globalThis), 'not-installed');
  });

  it('starts every run from a clean filesystem', async () => {
    const first = await runDemo({
      payload: { entry: 'demo.js', files: {} },
      importEntry: entry(({ fs: fsShim }) => {
        fsShim.writeFileSync('/leftover.txt', 'from run one');
      }),
    });
    assert.equal(first.files['/leftover.txt'], 'from run one');

    const second = await runDemo({
      payload: { entry: 'demo.js', files: { '/fresh.txt': 'x' } },
      importEntry: entry(() => {}),
    });
    assert.equal(second.files['/leftover.txt'], undefined);
    assert.equal(second.files['/fresh.txt'], 'x');
  });

  it('leaves the working directory at the root between runs', async () => {
    await runDemo({
      payload: { entry: 'demo.js', files: {} },
      importEntry: entry(({ fs: fsShim }) => {
        fsShim.writeFileSync('/deep/file.txt', 'x');
        fsShim.chdir('/deep');
      }),
    });
    const report = await runDemo({
      payload: { entry: 'demo.js', files: {} },
      importEntry: entry(({ fs: fsShim }) => {
        fsShim.writeFileSync('relative.txt', 'at root');
      }),
    });
    assert.equal(report.files['/relative.txt'], 'at root');
  });
});
