import assert from 'node:assert/strict';

import { runDemoWithNode } from '../node/host.js';
import { getCompatibilityReport, getShimImportMapEntries, shimModules } from '../browser/shims/registry.js';

describe('the real Node host', () => {
  it('runs a demo with real node and reports it in the engine\'s shape', async () => {
    const report = await runDemoWithNode({
      files: {
        '/demo.js': [
          "import { readFileSync, writeFileSync } from 'node:fs';",
          "console.log('real fs says', readFileSync('in.txt', 'utf8'));",
          "writeFileSync('out.txt', 'WRITTEN BY REAL NODE');",
        ].join('\n'),
        '/in.txt': 'hello from a file',
      },
      entry: '/demo.js',
    });

    assert.equal(report.exitCode, 0);
    assert.deepEqual(report.log, [{ stream: 'stdout', text: 'real fs says hello from a file\n' }]);
    assert.equal(report.files['/out.txt'], 'WRITTEN BY REAL NODE');
    assert.equal(report.signal, null);
  });

  it('pins the path difference between the two worlds instead of hiding it', async () => {
    // A demo that writes `/out.txt` means the machine root here and the demo root in the shim. Both are true; the
    // convention that makes one demo work in both is relative paths, and this test is what keeps that honest.
    const report = await runDemoWithNode({
      files: {
        '/demo.js': [
          "import { existsSync } from 'node:fs';",
          "console.log('relative:', existsSync('in.txt'));",
          "console.log('absolute:', existsSync('/in.txt'));",
        ].join('\n'),
        '/in.txt': 'here',
      },
      entry: '/demo.js',
    });
    assert.equal(report.exitCode, 0);
    const output = report.log.map(line => line.text).join('');
    assert.match(output, /relative: true/);
    assert.match(output, /absolute: false/);
  });

  it('runs a real worker thread and gets the message back', async () => {
    // The point of the worker shim: this same pair of files runs in the browser against the shim and here against
    // real worker_threads, and both have to work without errors.
    const report = await runDemoWithNode({
      files: {
        '/demo.js': [
          "import { Worker, isMainThread } from 'node:worker_threads';",
          "const worker = new Worker(new URL('./worker.js', import.meta.url), { workerData: { value: 21 } });",
          "worker.on('message', message => {",
          "  console.log('main thread:', isMainThread);",
          "  console.log('worker said', JSON.stringify(message));",
          '});',
          "worker.on('error', error => { console.error('worker failed:', error.message); process.exitCode = 1; });",
        ].join('\n'),
        '/worker.js': [
          "import { parentPort, workerData, isMainThread } from 'node:worker_threads';",
          "parentPort.postMessage({ doubled: workerData.value * 2, inWorker: !isMainThread });",
        ].join('\n'),
      },
      entry: '/demo.js',
    });

    assert.equal(report.exitCode, 0);
    const output = report.log.map(line => line.text).join('');
    assert.match(output, /main thread: true/);
    assert.match(output, /worker said \{"doubled":42,"inWorker":true\}/);
  });

  it('reports a failing demo with its exit code and stderr', async () => {
    const report = await runDemoWithNode({
      files: { '/demo.js': "console.error('nope'); process.exit(3);" },
      entry: '/demo.js',
    });
    assert.equal(report.exitCode, 3);
    assert.deepEqual(report.log, [{ stream: 'stderr', text: 'nope\n' }]);
  });

  it('kills a demo that hangs, and says so', async () => {
    const report = await runDemoWithNode({
      files: { '/demo.js': 'setTimeout(() => {}, 60000);' },
      entry: '/demo.js',
      timeoutMs: 1500,
    });
    assert.equal(report.signal, 'SIGKILL');
    assert.notEqual(report.exitCode, 0);
  });
});

describe('the shim registry after worker_threads moved out of UNCOVERED', () => {
  it('answers worker_threads in both the bare and the node: form', () => {
    const entries = getShimImportMapEntries('https://example.test/shims');
    assert.equal(entries.worker_threads, 'https://example.test/shims/worker-threads.js');
    assert.equal(entries['node:worker_threads'], 'https://example.test/shims/worker-threads.js');
  });

  it('has a module behind every shim it advertises', () => {
    const entries = getShimImportMapEntries('https://example.test/shims');
    for (const specifier of Object.keys(entries)) {
      const name = specifier.replace(/^node:/, '');
      const key = name === 'fs/promises' ? 'fsPromises' : name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      assert.ok(shimModules[key], `no module exported for shim ${specifier}`);
    }
  });

  it('reports worker_threads as partial, with its limits, and not as uncovered', () => {
    const report = getCompatibilityReport();
    assert.ok(report.partial.some(entry => entry.startsWith('worker_threads: ')));
    assert.ok(!report.uncovered.includes('worker_threads'));
    assert.match(report.partial.join('\n'), /no SharedArrayBuffer/);
  });
});
