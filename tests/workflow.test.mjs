import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { graph, validateGraph, createRun, nextNodes, record, block, retry, validateRun, writeRun, skillRoot } from '../skills/oh-my-figma/scripts/workflow.mjs';
import { crc32, bundle } from '../skills/oh-my-figma/scripts/bundle.mjs';

// Synthetic fixtures attest only to local scheduler behavior, never real design execution.
function evidence(node) {
  return { summary: 'Synthetic scheduler fixture', artifactRefs: ['fixture.md'],
    checks: Object.fromEntries(node.checks.map(c => [c, true])),
    fileUrl: 'https://www.figma.com/design/FIXTURE/test', screenshots: ['fixture.png'], frameRefs: ['Fixture / Default'],
    jobIds: ['fixture-job'], resultRefs: ['fixture.png'],
    dependencies: ['figma', 'higgsfield', 'impeccable'].map(name => ({ name, status: 'current', resolvedVersion: 'test-commit', sourceUrl: 'https://example.test/upstream', checkedAt: new Date().toISOString(), proof: 'test fixture only' })) };
}
function finishReady(run) { const node = nextNodes(run)[0]; return record(run, node.id, evidence(node)); }

test('graph dependencies and every platform subset are coherent', () => {
  assert.equal(validateGraph(), true);
  for (let mask = 1; mask < 128; mask++) {
    const surfaces = graph.surfaces.filter((_, i) => mask & (1 << i));
    let run = createRun(surfaces), visited = [];
    while (nextNodes(run).length) { visited.push(nextNodes(run)[0].id); run = finishReady(run); }
    assert.equal(Object.values(run.nodes).every(s => s.status === 'complete'), true);
    assert.equal(visited.filter(id => id.startsWith('screen-')).length, surfaces.length);
    assert(visited.indexOf('handoff') > visited.indexOf('review'));
  }
});
test('cycles, missing dependencies, duplicate IDs and unknown surfaces fail', () => {
  let g = structuredClone(graph); g.nodes[0].dependsOn = ['handoff']; assert.throws(() => validateGraph(g), /Cycle/);
  g = structuredClone(graph); g.nodes[0].dependsOn = ['absent']; assert.throws(() => validateGraph(g), /Missing dependency/);
  g = structuredClone(graph); g.nodes.push(g.nodes[0]); assert.throws(() => validateGraph(g), /Duplicate/);
  assert.throws(() => createRun(['mobile']), /Unknown surface/);
  assert.throws(() => createRun(['web', 'web']), /distinct/);
});
test('blocked dependencies stop descendants and retries are bounded', () => {
  let run = createRun(['web'], 2);
  run = block(run, 'discover', 'No edit access');
  assert.equal(nextNodes(run).length, 0);
  run = retry(run, 'discover');
  run = block(run, 'discover', 'Still no access');
  assert.throws(() => retry(run, 'discover'), /budget/);
  assert.throws(() => record(run, 'brief', {}), /not ready/);
});
test('completion requires real evidence fields and no skip of core nodes', () => {
  let run = createRun(['web']);
  assert.throws(() => record(run, 'discover', { summary: 'done', artifactRefs: ['x'] }), /check/);
  assert.throws(() => record(run, 'discover', { summary: 'skip', artifactRefs: ['x'], notApplicable: true, reason: 'none' }), /cannot be N\/A/);
  while (!nextNodes(run).some(n => n.id === 'structure')) run = finishReady(run);
  const n = nextNodes(run).find(n => n.id === 'structure'), e = evidence(n);
  delete e.screenshots; assert.throws(() => record(run, n.id, e), /screenshots/);
  e.screenshots = ['x']; e.fileUrl = 'https://figma.com.evil.test/design/x'; assert.throws(() => record(run, n.id, e), /URL/);
});
test('fresh dependencies require resolved receipts, not latest or stale timestamps', () => {
  let run = finishReady(createRun(['landing'])); const n = nextNodes(run)[0], e = evidence(n);
  e.dependencies[0].resolvedVersion = 'latest'; assert.throws(() => record(run, n.id, e), /revision/);
  e.dependencies[0].resolvedVersion = 'v1'; e.dependencies[0].checkedAt = '2020-01-01T00:00:00Z';
  assert.throws(() => record(run, n.id, e), /last hour/);
});
test('N/A assets unblock requested surfaces; no other nodes can be skipped', () => {
  let run = createRun(['ios']);
  while (!nextNodes(run).some(n => n.id === 'assets')) run = finishReady(run);
  run = record(run, 'assets', { summary: 'No generated media requested', artifactRefs: ['brief.md'], notApplicable: true, reason: 'Existing product assets only' });
  while (nextNodes(run).length) run = finishReady(run);
  assert.equal(run.nodes.assets.status, 'not-applicable');
  assert.equal(run.nodes.handoff.status, 'complete');
});
test('edited ledger cannot bypass dependency or evidence validation', () => {
  const run = createRun(['windows']);
  run.nodes.handoff.status = 'complete'; run.nodes.handoff.evidence = evidence(graph.nodes.find(n => n.id === 'handoff'));
  assert.throws(() => validateRun(run), /Incomplete dependency/);
});
test('files refuse overwrite and held locks; CLI runs after skill relocation', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'omf-'));
  try {
    const f = path.join(tmp, 'run.json'), run = createRun(['os']);
    writeRun(f, run, true); assert.throws(() => writeRun(f, run, true), /exists/);
    fs.writeFileSync(f + '.lock', ''); assert.throws(() => writeRun(f, run), /EEXIST/);
    fs.cpSync(skillRoot, path.join(tmp, 'skill'), { recursive: true });
    const result = spawnSync(process.execPath, [path.join(tmp, 'skill/scripts/workflow.mjs'), 'validate'], { encoding: 'utf8', cwd: os.tmpdir() });
    assert.equal(result.status, 0, result.stderr);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
test('ZIP is self-contained, deterministic, CRC-correct and refuses overwrite', () => {
  assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'omf-zip-'));
  try {
    const output = path.join(tmp, 'skill.zip'); bundle(skillRoot, output);
    assert.throws(() => bundle(skillRoot, output), /EEXIST/);
    assert.throws(() => bundle(skillRoot, path.join(skillRoot, 'bad.zip')), /outside/);
    const bytes = fs.readFileSync(output); let offset = 0; const names = [];
    while (bytes.readUInt32LE(offset) === 0x04034b50) {
      const size = bytes.readUInt32LE(offset + 18), length = bytes.readUInt16LE(offset + 26);
      const name = bytes.subarray(offset + 30, offset + 30 + length).toString();
      const data = bytes.subarray(offset + 30 + length, offset + 30 + length + size);
      assert.equal(crc32(data), bytes.readUInt32LE(offset + 14)); names.push(name); offset += 30 + length + size;
    }
    assert(names.includes('oh-my-figma/SKILL.md')); assert(names.includes('oh-my-figma/workflows/product-design.json'));
    assert(names.includes('oh-my-figma/references/dependencies.md')); assert(!names.some(n => n.includes('node_modules')));
    const other = path.join(tmp, 'other.zip'); bundle(skillRoot, other); assert.deepEqual(bytes, fs.readFileSync(other));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
test('stale ledger writers cannot overwrite a newer checkpoint', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'omf-cas-'));
  try {
    const f = path.join(tmp, 'run.json'), run = createRun(['web']); writeRun(f, run, true);
    const before = fs.readFileSync(f, 'utf8');
    writeRun(f, finishReady(run), false, before);
    assert.throws(() => writeRun(f, block(run, 'discover', 'stale client'), false, before), /Run changed/);
    assert.equal(JSON.parse(fs.readFileSync(f, 'utf8')).nodes.discover.status, 'complete');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
