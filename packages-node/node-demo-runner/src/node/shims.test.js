import assert from 'node:assert/strict';

import * as fs from '../browser/shims/fs.js';
import { EventEmitter, once } from '../browser/shims/events.js';
import * as os from '../browser/shims/os.js';
import * as path from '../browser/shims/path.js';
import * as processShim from '../browser/shims/process.js';
import { ExitError } from '../browser/shims/process.js';
import { getCompatibilityReport, getShimImportMapEntries } from '../browser/shims/registry.js';
import * as url from '../browser/shims/url.js';
import * as util from '../browser/shims/util.js';

describe('shims: fs', () => {
  it('round-trips a file, creating parents like Node does', () => {
    fs.writeFileSync('/project/src/index.js', 'export const a = 1;\n');
    assert.equal(fs.readFileSync('/project/src/index.js', 'utf8'), 'export const a = 1;\n');
    assert.equal(fs.existsSync('/project/src'), true);
  });

  it('lists directories and directories only', () => {
    fs.writeFileSync('/project/readme.md', '# hi');
    const top = fs.readdirSync('/project');
    assert.deepEqual(top, ['readme.md', 'src']);
    const entries = fs.readdirSync('/project', { withFileTypes: true });
    assert.equal(entries.find(e => e.name === 'src')?.isDirectory(), true);
    assert.equal(entries.find(e => e.name === 'readme.md')?.isFile(), true);
  });

  it('stats a file and throws ENOENT with a Node-shaped error', () => {
    const stats = fs.statSync('/project/readme.md');
    assert.equal(stats.isFile(), true);
    assert.equal(stats.size, 4);
    assert.throws(
      () => fs.statSync('/nope'),
      error => error.code === 'ENOENT' && /no such file/.test(error.message),
    );
  });

  it('removes a tree recursively and copies and renames', () => {
    fs.copyFileSync('/project/readme.md', '/project/copy.md');
    fs.renameSync('/project/copy.md', '/project/moved.md');
    assert.equal(fs.existsSync('/project/moved.md'), true);
    fs.rmSync('/project/src', { recursive: true });
    assert.equal(fs.existsSync('/project/src'), false);
    assert.deepEqual(fs.readdirSync('/project'), ['moved.md', 'readme.md']);
  });

  it('offers the promises api with the same semantics', async () => {
    await fs.promises.writeFile('/async/file.txt', 'async');
    assert.equal(await fs.promises.readFile('/async/file.txt', 'utf8'), 'async');
    await assert.rejects(fs.promises.readFile('/async/missing.txt'), error => error.code === 'ENOENT');
  });

  it('makes a temp dir and follows chdir for relative paths', () => {
    const dir = fs.mkdtempSync('/tmp/');
    fs.writeFileSync(`${dir}/x.txt`, 'x');
    fs.cwd();
    fs.chdir(dir);
    assert.equal(fs.readFileSync('x.txt', 'utf8'), 'x');
    fs.chdir('/');
    assert.equal(fs.readFileSync(`${dir}/x.txt`, 'utf8'), 'x');
  });
});

describe('shims: path', () => {
  it('joins, resolves and derives names', () => {
    assert.equal(path.join('/a', 'b', '..', 'c'), '/a/c');
    assert.equal(path.resolve('/a', 'b.js'), '/a/b.js');
    assert.equal(path.dirname('/a/b/c.js'), '/a/b');
    assert.equal(path.basename('/a/b/c.js', '.js'), 'c');
    assert.equal(path.extname('/a/b/c.js'), '.js');
    assert.equal(path.relative('/a/b', '/a/c/d.js'), '../c/d.js');
    assert.equal(path.isAbsolute('a/b'), false);
  });
});

describe('shims: process', () => {
  it('captures stdout and reports an exit code as a catchable error', () => {
    const lines = [];
    processShim.__setStdio('stdout', chunk => lines.push(chunk));
    processShim.stdout.write('hello\n');
    assert.deepEqual(lines, ['hello\n']);
    assert.throws(
      () => processShim.exit(3),
      error => error instanceof ExitError && error.code === 3,
    );
  });

  it('exposes argv, env, platform and hrtime', () => {
    assert.equal(processShim.argv[0], 'node');
    assert.equal(processShim.platform, 'linux');
    assert.equal(typeof processShim.env, 'object');
    const [seconds] = processShim.hrtime();
    assert.equal(typeof seconds, 'number');
  });
});

describe('shims: util', () => {
  it('formats like node:util and parses argv for a cli', () => {
    assert.equal(util.format('%s=%d', 'a', 2), 'a=2');
    assert.equal(util.format('%j', { a: 1 }), '{"a":1}');
    assert.equal(util.inspect({ a: [1, 2] }), '{ a: [ 1, 2 ] }');
    const { values, positionals } = util.parseArgs({
      args: ['build', '--package', 'packages/ui', '--watch', '--no-color'],
      options: {
        package: { type: 'string', short: 'p' },
        watch: { type: 'boolean' },
        color: { type: 'boolean', default: true },
      },
    });
    assert.deepEqual(values, { package: 'packages/ui', watch: true, color: false });
    assert.deepEqual(positionals, ['build']);
  });
});

describe('shims: events', () => {
  it('emits, once()s and throws on an unhandled error event like node', async () => {
    const emitter = new EventEmitter();
    const seen = [];
    emitter.on('data', value => seen.push(value));
    emitter.emit('data', 1);
    emitter.emit('data', 2);
    assert.deepEqual(seen, [1, 2]);
    const promise = once(emitter, 'done');
    emitter.emit('done', 'ok');
    assert.deepEqual(await promise, ['ok']);
    assert.throws(() => emitter.emit('error', new Error('boom')), /boom/);
  });
});

describe('shims: os and url', () => {
  it('answers the questions tools ask', () => {
    assert.equal(os.EOL, '\n');
    assert.equal(os.tmpdir(), '/tmp');
    assert.equal(os.cpus().length >= 1, true);
    assert.equal(url.fileURLToPath('file:///a/b%20c/d.js'), '/a/b c/d.js');
    assert.equal(url.pathToFileURL('/a/b c.js').href, 'file:///a/b%20c.js');
  });
});

describe('shims: registry', () => {
  it('maps both the bare and node: specifier for every shim', () => {
    const entries = getShimImportMapEntries('https://host/shims/');
    assert.equal(entries.fs, 'https://host/shims/fs.js');
    assert.equal(entries['node:fs'], 'https://host/shims/fs.js');
    assert.equal(entries['fs/promises'], 'https://host/shims/fs-promises.js');
    assert.equal(entries['node:fs/promises'], 'https://host/shims/fs-promises.js');
    // Nine shims, each mapped in the bare and the `node:` form.
    assert.equal(Object.keys(entries).length, 18);
  });

  it('reports what is covered, partial and impossible, without overlap', () => {
    const report = getCompatibilityReport();
    // `worker_threads` used to be pinned here. It moved to partial when the shim landed — the browser has the
    // capability, so it is no longer in the impossible list, and this test says so instead of quietly dropping it.
    for (const name of ['child_process', 'vm', 'net']) {
      assert.equal(report.uncovered.includes(name), true, `${name} should be reported uncovered`);
    }
    assert.equal(report.uncovered.includes('worker_threads'), false, 'worker_threads is no longer uncovered');
    assert.ok(
      report.partial.some(entry => entry.startsWith('worker_threads: ')),
      'worker_threads should be reported partial, with its limits',
    );
    for (const name of report.covered) {
      assert.equal(
        report.uncovered.includes(name),
        false,
        `${name} cannot be both covered and uncovered`,
      );
    }
    assert.match(report.uncoveredReason, /real runtime/);
  });
});
