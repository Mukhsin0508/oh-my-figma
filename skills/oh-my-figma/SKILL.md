---
name: oh-my-figma
description: Design landing pages, web apps, mobile apps, macOS and Windows apps, or OS concepts in Figma using ordered pages, shared components, Higgsfield assets, and resumable workflow graphs. Use for complete product-design journeys or coherent cross-platform design sets.
---

# Oh My Figma

Turn a product brief into an editable Figma design, a working prototype of its key journeys, and an evidenced handoff. The host agent operates Figma and Higgsfield through connected tools or the Figma web app. This package supplies instructions and graphs; it is not a remote API client or autonomous tool executor.

## Start with the intended result

1. Read the brief and existing product/design context. Preserve the user's platform scope, brand, target file and execution route. For an underspecified new product, make a concise proposed screen list and state assumptions. Ask only for facts that change the result materially. “OS” means an operating-system concept; don't silently turn it into iOS. If unclear, clarify while preparing the shared foundations.
2. Read [integration routing](references/integrations.md). Discover the host's actual tools. When the user selects the Figma web app, use the browser route; a connector is supplementary only within that authorization. Do not substitute generated screenshots for editable designs.
3. Resolve and refresh every used third-party skill using [dependency freshness](references/dependencies.md). This applies again on every resumed host session, even if the graph freshness node is already complete. No vendored third-party instructions or silently stale integrations.
4. Read [file organization](references/file-organization.md), [design method](references/design-method.md), and only the relevant rows in [platform playbooks](references/platforms.md).
5. Use [the graph](workflows/product-design.json) to sequence work. Read [execution and checkpoints](references/execution.md). With Node, `node <skill-dir>/scripts/workflow.mjs plan <run.json> landing,web` creates a local plan; `next <run.json>` lists ready nodes. Without a shell, follow the identical graph and keep its ledger in a host-supported task artifact. Node is optional for design execution.

## Execute in useful increments

Follow graph dependencies: discover → refresh dependencies → brief → direction → file structure and assets → foundations → components → selected surfaces → prototypes → review → handoff. Scope each surface node to the agreed screen inventory; expand long work into screen checkpoints in the ledger. Shared Figma writes use one writer at a time. Independently ready nodes are not permission to spawn agents or perform simultaneous browser actions.

- **Discovery:** inspect the actual file, page order, existing library, available fonts, and current screens. Record file URL/key and stable node IDs where the host exposes them. Reuse existing assets before creating equivalents.
- **Direction:** choose a distinct visual language for this product with concrete type, density, layout, color, image and motion decisions. Use the user's reference as authority. Apply installed Impeccable's relevant shape/critique guidance when available; do not pretend it ran when absent.
- **Structure:** create only requested pages in the numbered order. Do not rename or reorder unrelated existing pages without scope. Match existing conventions where appropriate.
- **Foundations and components:** use semantic tokens, auto-layout, real text, reusable instances and purposeful states. Build the smallest component set the screen inventory needs. Read the installed Figma prerequisite skills when using their tools; host contracts override examples here.
- **Assets:** read [Higgsfield assets](references/higgsfield.md). Generate imagery for named slots, preserving product identity and intended crop. Keep UI text, controls and layout editable in Figma. Missing Higgsfield is an explicit blocker for requested generation, not a reason to switch providers silently.
- **Surfaces:** build one representative screen first, verify it, then expand the system to the complete inventory including failure/empty/loading states. Adapt interactions for each platform; a resized web dashboard is not a native app design.
- **Prototype:** connect the primary task, recovery and return path. Inspect presentation mode. A diagram or annotation is not a functioning interaction; record unsupported interactions explicitly.
- **Review:** read [quality and delivery](references/quality.md). Inspect full screens and details in the actual Figma web app, fix the defects in one batch, then confirm. Limit to two correction passes by default; unresolved defects stay open and block a “complete” claim.
- **Handoff:** deliver links to actual frames and flows, screen/state coverage, assets, token/component decisions and remaining implementation notes. Never call a design a deployed app or claim commercial outcomes from an aesthetic score.

## Recovery

Persist new page/node IDs and Higgsfield job IDs as soon as tools return them. On an interrupted write, inspect the target before retrying; do not recreate a page because the local ledger is missing an entry. On an interrupted paid generation, retrieve the existing job rather than submitting another. Cleanup may target only exact run-owned IDs with understood effects.

The helper validates dependencies and evidence shape; it cannot prove a screenshot was inspected. The host must perform and honestly report that verification. See [examples](references/examples.md) for realistic invocations and blocked/resume cases.
