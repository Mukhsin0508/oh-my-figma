# Figma file organization

Use the existing team structure when present. For a new product, prefer one design file until canvas performance or team ownership calls for separate library/product files. A Figma page is a canvas category; a screen is a frame inside a section. Do not create a new page for every screen.

| Order | Page | Contents |
|---|---|---|
| 00 | Start here | Cover, product promise, owner, status, update date, navigation to flows |
| 01 | Brief & journeys | Audience, success task, scope, screen inventory, happy/recovery paths |
| 02 | Art direction | Selected direction and rationale; clearly separated alternatives |
| 03 | Foundations | Semantic colors, typography, spacing, radii, effects, grids, modes |
| 04 | Components | Atoms then composed patterns, variants, usage and content rules |
| 05 | Assets | Approved imagery, crops, generation provenance; rejected drafts separated |
| 10 | Landing | Wide/narrow layouts and conversion journey |
| 20 | Web app | Onboarding, core task, detail, account/settings and states |
| 30 | iOS | Phone flows, sheets, keyboard and permission states |
| 31 | Android | Android navigation/back behavior, adaptive layout and states |
| 40 | macOS | Window/sidebar/toolbar patterns, menus, shortcuts and dialogs |
| 41 | Windows | Title bar, navigation, command areas, resize and keyboard states |
| 50 | OS concept | Shell, launcher, window system, settings, notifications, lock/session states |
| 80 | Prototypes | Flow entry map, actual prototype start links and annotations |
| 90 | Handoff | Coverage, inspectable frames, component/token map, assets, open issues |
| 99 | Archive | Superseded run-owned concepts retained only when useful |

Only create selected platform pages. Archive and prototype-map pages are optional when they add no navigation value. Large component families may use dedicated pages after 04; preserve a documented family order rather than adding unnamed separators.

Within a platform page, sections follow the user's journey left to right. Put primary states on the first row, responsive/device variations below them, and recovery/empty/error states on a clearly labeled row. Keep consistent gutters and avoid overlapping top-level frames. Pick the actual viewport/device target from the brief; do not treat a fixed width as a platform standard.

Names: `Web / Projects / Default / Wide`, `iOS / Import / Permission denied`, `Windows / Editor / Narrow`. Component names describe purpose (`Button`, `Asset tile`, `Navigation item`); use property axes for State/Size/Emphasis instead of a component for every combination. Keep icon swaps separate from state variants. Token examples: `color/surface/default`, `color/text/primary`, `space/3`, `radius/control`.

Browser route: open Pages panel, inspect current names, create/rename one requested page, then verify its name and order. Drag/reorder using observed UI only; screenshots after each group of operations. Record URL, page name, exact frame/section names, node links when available, and screenshots if the browser cannot expose IDs. Do not invent node IDs. Avoid reordering by guessed keyboard shortcuts.

Connector route: inspect current root order and returned IDs, load the installed figma-use instructions, and use the documented current API. Verify resulting page order and read back newly created objects. Always re-establish the intended page context per call. Never hide the run ledger inside design text layers or plugin data solely to replace an external checkpoint.
