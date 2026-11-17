#!/usr/bin/env node
/**
 * Run a demo directory with real Node and print the report, so the real path is usable from a shell and from a
 * build step — not only from a test.
 *
 *   node src/cli/runDemo.js <directory> [entry] [--json] [--keep] [--timeout <ms>]
 *
 * The directory's files are copied into a temporary directory first, so a demo that writes files does not touch the
 * sources, and the report shows what it wrote.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { runDemoWithNode } from '../node/host.js';

/**
 * @param {string} directory
 * @param {string} root
 * @returns {Promise<Record<string, string>>}
 */
async function readTree(directory, root = directory) {
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(files, await readTree(absolute, root));
    else files[`/${path.relative(root, absolute).split(path.sep).join('/')}`] = await readFile(absolute, 'utf8');
  }
  return files;
}

const argv = process.argv.slice(2);
const flags = argv.filter(argument => argument.startsWith('--'));
const positional = argv.filter(argument => !argument.startsWith('--'));
const directory = positional[0];
const entry = positional[1] ?? '/demo.js';
const asJson = flags.includes('--json');
const keep = flags.includes('--keep');
const timeoutIndex = flags.indexOf('--timeout');
const timeoutMs = timeoutIndex === -1 ? 30000 : Number(argv[argv.indexOf('--timeout') + 1]);

if (!directory) {
  console.error('usage: node src/cli/runDemo.js <directory> [entry] [--json] [--keep] [--timeout <ms>]');
  process.exit(2);
}

const files = await readTree(path.resolve(directory));
const report = await runDemoWithNode({ files, entry, timeoutMs, keepDirectory: keep });

if (asJson) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log(`entry: ${entry}`);
  for (const line of report.log) process[line.stream === 'stderr' ? 'stderr' : 'stdout'].write(line.text);
  console.log(`\nexit code: ${report.exitCode}${report.signal ? ` (killed: ${report.signal})` : ''}`);
  const written = Object.keys(report.files).sort();
  console.log(`files afterwards: ${written.join(', ') || '(none)'}`);
  if (keep) console.log(`kept: ${report.directory}`);
}

process.exit(report.exitCode);
