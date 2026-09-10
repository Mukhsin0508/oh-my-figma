# Graph execution and checkpoints

`workflows/product-design.json` is the canonical dependency graph. The host agent executes each node's referenced playbook with its tools. The Node helper performs only local validation and bookkeeping. There is no network client, provider login, generated Plugin API script, or unattended action engine.

Nodes contain ID, dependencies, relevant reference, evidence checks and kind. A selected platform gets its own screen node; unselected surface nodes are removed from the prototype dependency list. No screen node is allowed to finish before shared components and the asset decision are complete.

## With a shell

Resolve `<skill-dir>` from the installed SKILL.md location; don't assume the current working directory is the package. Keep run artifacts in the user's project, e.g. `.oh-my-figma/creator-suite/`.

```sh
node <skill-dir>/scripts/workflow.mjs plan .oh-my-figma/run.json landing,web,ios,android,macos,windows
node <skill-dir>/scripts/workflow.mjs next .oh-my-figma/run.json
node <skill-dir>/scripts/workflow.mjs record .oh-my-figma/run.json discover evidence/discover.json
node <skill-dir>/scripts/workflow.mjs block .oh-my-figma/run.json assets "Higgsfield plugin unavailable"
node <skill-dir>/scripts/workflow.mjs retry .oh-my-figma/run.json assets
```

`plan` refuses to overwrite an existing run. `next` returns ready nodes, blockers, and whether every node is finished. Readiness allows work, but doesn't authorize it or start subagents. A blocked node must explicitly retry after the cause is resolved. The default three attempts are initial execution plus two retries. Exhaustion reports a blocker; creating a new run to evade the limit is not recovery.

Single writer per ledger and Figma file. Writes use a lock and atomic replacement. Don't run simultaneous helper mutations or browser actions. Preserve operation/job IDs in a separate artifact immediately during a node; `record` is for the completed node, not a substitute for mid-node checkpoints. On uncertain mutations read the actual file to reconcile. Never replay a finished node just because an agent restarted.

To change scope or revise completed work, preserve the old run and create a clearly named new run for the changed scope. Inspect and reuse the existing Figma file and attach its evidence; do not rebuild it by default. This v1 helper does not implement dependency invalidation or unattended scheduling.

## Evidence

Every completion needs `summary`, nonempty `artifactRefs`, and all checks listed by `next` set to true. These are honest agent attestations, not proof created by the helper. A Figma node additionally needs `fileUrl`, nonempty `screenshots`, and either `nodeIds` or `frameRefs`. Use actual URLs/IDs from tools; browser evidence can reference exact page/frame names with screenshots.

An assets completion also needs completed provider `jobIds` and `resultRefs`. If the brief needs no generation, use `notApplicable: true`, `reason`, `summary`, `artifactRefs`. Only the assets node accepts N/A. Unavailable required generation is blocked, not N/A.

The dependencies node needs receipts for Figma, Higgsfield and Impeccable, each `current` or explicitly `not-used` with a reason. See dependencies.md. Current receipts need `resolvedVersion`, official `sourceUrl`, `checkedAt` within the preceding hour at recording time, and `proof`. Already-recorded receipts remain historical; re-resolve dependencies on every resumed host session before using them. The helper cannot infer which integrations an agent actually called.

Example structure for a document node (replace content with actual evidence):

```json
{
  "summary": "Inspected the selected file and recorded the browser route.",
  "artifactRefs": ["evidence/discovery.md"],
  "checks": {
    "route-recorded": true,
    "target-inspected": true,
    "capabilities-recorded": true
  }
}
```

## Without a shell

Read the graph and create a task artifact with `runId`, selected surfaces, selected node IDs, dependencies, per-node status/attempt, evidence, owned Figma references and remote asset job IDs. Use the same transitions: pending → complete, pending → blocked, blocked → pending with attempt increment; assets alone can be not-applicable. Evaluate dependencies before executing each node. Save the artifact through the host's supported file/task mechanism and attach it to the final delivery. Do not claim the CLI ran.
