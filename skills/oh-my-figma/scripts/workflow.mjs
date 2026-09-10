#!/usr/bin/env node
/** Local graph bookkeeping only. No remote requests or tool execution. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

export const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const graph = JSON.parse(fs.readFileSync(path.join(skillRoot, 'workflows/product-design.json'), 'utf8'));
const terminal = new Set(['complete', 'not-applicable']);
const states = new Set(['pending', 'complete', 'not-applicable', 'blocked']);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const strings = x => Array.isArray(x) && x.length > 0 && x.every(v => typeof v === 'string' && v.trim());

export function validateGraph(g = graph) {
  assert(g.version === 1 && Array.isArray(g.nodes) && g.nodes.length > 0, 'Unsupported or empty graph');
  assert(strings(g.surfaces) && new Set(g.surfaces).size === g.surfaces.length, 'Invalid surfaces');
  const ids = new Set(g.nodes.map(n => n.id));
  assert(ids.size === g.nodes.length, 'Duplicate node IDs');
  for (const n of g.nodes) {
    assert(typeof n.id === 'string' && /^[a-z][a-z0-9-]*$/.test(n.id), 'Invalid node ID');
    assert(typeof n.title === 'string' && n.title.length > 0, `Missing title: ${n.id}`);
    assert(['document', 'figma', 'asset', 'dependency'].includes(n.kind), `Invalid kind: ${n.id}`);
    assert(strings(n.checks) && new Set(n.checks).size === n.checks.length, `Invalid checks: ${n.id}`);
    assert(Array.isArray(n.dependsOn) && new Set(n.dependsOn).size === n.dependsOn.length, `Invalid dependencies: ${n.id}`);
    for (const dep of n.dependsOn) assert(ids.has(dep), `Missing dependency ${dep}`);
    if (n.surface) assert(g.surfaces.includes(n.surface), `Unknown surface: ${n.surface}`);
    assert(typeof n.reference === 'string', `Missing reference: ${n.id}`);
    const ref = path.resolve(skillRoot, n.reference);
    assert(ref.startsWith(skillRoot + path.sep) && fs.existsSync(ref), `Missing/unsafe reference: ${n.reference}`);
  }
  const visited = new Set(), active = new Set();
  function visit(id) {
    assert(!active.has(id), `Cycle at ${id}`);
    if (visited.has(id)) return;
    active.add(id); g.nodes.find(n => n.id === id).dependsOn.forEach(visit);
    active.delete(id); visited.add(id);
  }
  g.nodes.forEach(n => visit(n.id));
  return true;
}

export function selectedNodes(surfaces) {
  assert(strings(surfaces) && new Set(surfaces).size === surfaces.length, 'Choose distinct surfaces');
  surfaces.forEach(s => assert(graph.surfaces.includes(s), `Unknown surface: ${s}`));
  const nodes = graph.nodes.filter(n => !n.surface || surfaces.includes(n.surface));
  const ids = new Set(nodes.map(n => n.id));
  return nodes.map(n => ({ ...n, dependsOn: n.dependsOn.filter(id => ids.has(id)) }));
}

export function createRun(surfaces, maxAttempts = 3) {
  assert(Number.isInteger(maxAttempts) && maxAttempts >= 1 && maxAttempts <= 10, 'maxAttempts must be 1–10');
  const nodes = selectedNodes(surfaces);
  return { version: 1, graph: graph.id, id: randomUUID(), createdAt: new Date().toISOString(), surfaces,
    maxAttempts, nodes: Object.fromEntries(nodes.map(n => [n.id, { status: 'pending', attempt: 1, history: [] }])) };
}

export function validateEvidence(node, evidence, checkFreshness = false) {
  assert(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'Evidence must be an object');
  assert(typeof evidence.summary === 'string' && evidence.summary.trim().length > 0, 'Evidence needs a summary');
  assert(strings(evidence.artifactRefs), 'Evidence needs nonempty artifactRefs');
  if (evidence.notApplicable === true) {
    assert(node.allowNotApplicable, `${node.id} cannot be N/A`);
    assert(typeof evidence.reason === 'string' && evidence.reason.trim(), 'N/A needs a reason');
    return;
  }
  for (const check of node.checks) assert(evidence.checks?.[check] === true, `Missing passing check: ${check}`);
  if (node.kind === 'figma') {
    assert(typeof evidence.fileUrl === 'string' && /^https:\/\/(www\.)?figma\.com\/(design|file)\/[^/\s?#]+/.test(evidence.fileUrl), 'Figma evidence needs an actual design file URL');
    assert(strings(evidence.screenshots), 'Figma evidence needs screenshots');
    assert(strings(evidence.nodeIds) || strings(evidence.frameRefs), 'Figma evidence needs nodeIds or browser frameRefs');
  }
  if (node.kind === 'dependency') {
    assert(Array.isArray(evidence.dependencies), 'Dependency receipts required');
    for (const name of ['figma', 'higgsfield', 'impeccable']) {
      const receipt = evidence.dependencies.find(d => d.name === name);
      assert(receipt, `Missing dependency receipt: ${name}`);
      assert(['current', 'not-used'].includes(receipt.status), `Unverified dependency: ${name}`);
      if (receipt.status === 'not-used') {
        assert(typeof receipt.reason === 'string' && receipt.reason.trim(), 'Unused dependency needs reason');
      } else {
        assert(typeof receipt.resolvedVersion === 'string' && receipt.resolvedVersion.trim() && receipt.resolvedVersion !== 'latest', 'Need resolved revision or host channel report');
        assert(typeof receipt.sourceUrl === 'string' && receipt.sourceUrl.startsWith('https://'), 'Need official source URL');
        assert(typeof receipt.proof === 'string' && receipt.proof.trim(), 'Need freshness proof');
        const time = Date.parse(receipt.checkedAt);
        assert(Number.isFinite(time) && time <= Date.now() + 60000 && (!checkFreshness || time >= Date.now() - 3600000), 'Freshness receipt must be checked within the last hour');
      }
    }
  }
  if (node.kind === 'asset') {
    assert(strings(evidence.jobIds), 'Generated assets need provider jobIds');
    assert(strings(evidence.resultRefs), 'Generated assets need completed resultRefs');
  }
}

export function validateRun(run) {
  assert(run?.version === 1 && run.graph === graph.id, 'Unsupported run');
  assert(Number.isInteger(run.maxAttempts) && run.maxAttempts >= 1 && run.maxAttempts <= 10, 'Invalid attempt limit');
  const nodes = selectedNodes(run.surfaces);
  assert(run.nodes && Object.keys(run.nodes).length === nodes.length, 'Run node set differs from selected graph');
  for (const n of nodes) {
    const s = run.nodes[n.id];
    assert(s && states.has(s.status), `Invalid state: ${n.id}`);
    assert(Number.isInteger(s.attempt) && s.attempt >= 1 && s.attempt <= run.maxAttempts, `Invalid attempt: ${n.id}`);
    assert(Array.isArray(s.history), `Missing history: ${n.id}`);
    if (terminal.has(s.status)) {
      validateEvidence(n, s.evidence);
      assert((s.status === 'not-applicable') === (s.evidence.notApplicable === true), 'N/A status mismatch');
      assert(n.dependsOn.every(id => terminal.has(run.nodes[id]?.status)), `Incomplete dependency for ${n.id}`);
    }
    if (s.status === 'blocked') assert(typeof s.reason === 'string' && s.reason.trim(), `Missing blocker: ${n.id}`);
  }
  return nodes;
}

export function nextNodes(run) {
  const nodes = validateRun(run);
  return nodes.filter(n => run.nodes[n.id].status === 'pending' && n.dependsOn.every(id => terminal.has(run.nodes[id].status)));
}

export function record(run, id, evidence) {
  const node = nextNodes(run).find(n => n.id === id);
  assert(node, `Node ${id} is not ready (missing dependencies, blocked, or already finished)`);
  validateEvidence(node, evidence, true);
  const result = structuredClone(run), state = result.nodes[id];
  state.status = evidence.notApplicable ? 'not-applicable' : 'complete';
  state.evidence = evidence;
  state.history.push({ action: 'record', at: new Date().toISOString(), attempt: state.attempt });
  return result;
}

export function block(run, id, reason) {
  assert(typeof reason === 'string' && reason.trim(), 'Block needs a reason');
  assert(nextNodes(run).some(n => n.id === id), `Node ${id} is not ready`);
  const result = structuredClone(run);
  Object.assign(result.nodes[id], { status: 'blocked', reason });
  result.nodes[id].history.push({ action: 'block', at: new Date().toISOString(), reason });
  return result;
}

export function retry(run, id) {
  validateRun(run);
  const current = run.nodes[id];
  assert(current?.status === 'blocked', 'Only blocked nodes can retry');
  assert(current.attempt < run.maxAttempts, 'Attempt budget exhausted; report the blocker');
  const result = structuredClone(run), state = result.nodes[id];
  state.attempt += 1; state.status = 'pending';
  state.history.push({ action: 'retry', at: new Date().toISOString(), reason: state.reason, attempt: state.attempt });
  delete state.reason;
  return result;
}

export function writeRun(filename, value, create = false, expectedContents = undefined) {
  validateRun(value);
  const target = path.resolve(filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const lock = target + '.lock';
  const fd = fs.openSync(lock, 'wx');
  const tmp = `${target}.${randomUUID()}.tmp`;
  try {
    if (create) assert(!fs.existsSync(target), 'Run exists; use next to resume it');
    if (expectedContents !== undefined) assert(fs.readFileSync(target, 'utf8') === expectedContents, 'Run changed; reload before recording');
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    fs.renameSync(tmp, target);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.closeSync(fd); fs.unlinkSync(lock);
  }
}

export function readRun(filename) {
  const run = JSON.parse(fs.readFileSync(filename, 'utf8')); validateRun(run); return run;
}

export function main(args = process.argv.slice(2)) {
  validateGraph();
  const [cmd, filename, id, evidenceFile] = args;
  if (cmd === 'validate') { console.log(`Valid graph: ${graph.nodes.length} nodes; ${graph.surfaces.join(', ')}`); return; }
  if (cmd === 'graph') { console.log(JSON.stringify(graph, null, 2)); return; }
  if (cmd === 'plan') {
    assert(args.length === 3, 'Usage: plan <run.json> <surface,surface>');
    writeRun(filename, createRun(id.split(',')), true); console.log(`Created ${filename}`); return;
  }
  if (cmd === 'next') {
    assert(args.length === 2, 'Usage: next <run.json>');
    const run = readRun(filename), ready = nextNodes(run);
    console.log(JSON.stringify({ runId: run.id, complete: Object.values(run.nodes).every(s => terminal.has(s.status)), ready,
      blocked: Object.entries(run.nodes).filter(([, s]) => s.status === 'blocked').map(([id, s]) => ({ id, reason: s.reason, attempt: s.attempt })) }, null, 2)); return;
  }
  if (['record', 'block', 'retry'].includes(cmd)) {
    assert(args.length === (cmd === 'retry' ? 3 : 4), `Usage: ${cmd} <run.json> <node> ${cmd === 'record' ? '<evidence.json>' : cmd === 'block' ? '"reason"' : ''}`);
    const before = fs.readFileSync(filename, 'utf8');
    const run = JSON.parse(before); validateRun(run);
    const updated = cmd === 'record' ? record(run, id, JSON.parse(fs.readFileSync(evidenceFile, 'utf8'))) : cmd === 'block' ? block(run, id, evidenceFile) : retry(run, id);
    // Single-writer contract: refuse changes observed between read and write.
    assert(fs.readFileSync(filename, 'utf8') === before, 'Run changed; reload before recording');
    writeRun(filename, updated, false, before); console.log(`${id}: ${updated.nodes[id].status}`); return;
  }
  if (!cmd || ['help', '--help', '-h'].includes(cmd)) {
    console.log('oh-my-figma: local graph helper (the host agent performs Figma work)\n\nvalidate | graph | plan <run.json> <surfaces> | next <run.json>\nrecord <run.json> <node> <evidence.json> | block <run.json> <node> "reason"\nretry <run.json> <node>\n\nSurfaces: ' + graph.surfaces.join(', ')); return;
  }
  throw new Error(`Unknown command: ${cmd}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
