# Platform playbooks

Use only requested surfaces. These are starting inventories; adapt them to the product's actual task. Shared product identity does not mean shared navigation.

| Surface | Primary inventory | Required variations to consider |
|---|---|---|
| landing | Hero with real promise and CTA, product demonstration, benefits, supported proof, objection handling, closing CTA/footer; pricing only if supplied/in scope | Wide and narrow composition, navigation expansion, form validation/success, CTA destination |
| web | Entry/onboarding, workspace home, core create/edit task, detail/result, search/list, settings | Loading, empty, error/retry, success, long content, keyboard focus, wide/narrow layouts |
| ios | Entry, main navigation, core task, detail, settings; sheets where appropriate | Safe areas, software keyboard, permissions denied, offline/retry, dynamic text considerations, back/dismiss paths |
| android | Entry, navigation, core task, detail, settings | System back, edge-to-edge insets, keyboard, permission recovery, adaptive layout and readable text |
| macos | Main window, sidebar/toolbar, document/detail workspace, settings/dialogs | Window resize, menus and shortcuts, focus, multiple document/window behavior if in scope |
| windows | Main window with native chrome conventions, navigation/command area, core workspace, settings/dialogs | Resize and compact navigation, keyboard/access keys, focus, window controls and relevant context menus |
| os | Shell/desktop, launcher/search, window management, notifications/quick settings, system settings, session/lock states | Focused/unfocused windows, snap/switch, dismissed notifications, failure/recovery; input modalities from brief |

For every chosen surface, write an inventory with columns: frame name, user task, entry, primary action, default state, alternative states, viewport/window, component dependencies, prototype links, verification status. “All screens” means this agreed inventory, not unlimited speculative scope.

Default platform selection is never all. A “mobile app” request without an OS may use an explicitly stated proposed platform while asking for the preference. A request for both iOS/Android creates separate nodes; a request for an OS concept creates its own node, not an iPhone frame. For a full suite, complete the shared system and one representative core screen before replicating flows.

Design prototypes of the primary and recovery journeys. Native gestures, OS-wide shortcuts and external app integrations may exceed Figma's simulation surface: demonstrate supported behavior and annotate the rest accurately. Test actual links in presentation mode; do not claim an annotation implements a gesture.
