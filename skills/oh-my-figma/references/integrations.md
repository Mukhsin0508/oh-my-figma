# Integration routing

## Capability ledger

Record host, selected model label if exposed, Figma route, target file, edit access, screenshot ability, library access, image-import route, prototype ability, Higgsfield availability, and Impeccable availability. Treat tool metadata as current truth. This skill does not install connectors or grant access.

## Figma web app — primary route for an Astra browser task

Use the host's supported browser/computer-use tool. Open the user-specified file or create a new design file through observed UI if the request authorizes creation. Inspect Pages/Layers before editing. Use Figma's built-in controls for frames, auto-layout, styles, components, variants and prototypes. Use existing authenticated browser state without extracting cookies or credentials. Keep a single writer; after a focus change re-inspect the current UI before input.

Import a Higgsfield image through a supported upload/place-image action, then verify the actual fill and crop. Import assets only, not a screenshot standing in for a whole editable interface. If the browser cannot import a file, report that exact capability gap and continue independent layout work; do not mark the asset node complete.

Some browsers expose automation only for DOM controls, while the canvas needs visual computer use. Establish what can actually be manipulated. Do not fabricate a working canvas integration from the ability to open a URL. If canvas writes are unavailable, produce the brief, page plan and asset requests, leaving canvas-dependent nodes blocked.

## Figma plugin/connector route

Use when authorized and callable. Tool names vary by host: discover capabilities by description (create file, inspect file, use Figma, screenshot, library search, capture design). Load the installed figma-use before every use_figma call; also load generate-design for composed screens and generate-library for reusable components. Consult live API references, not memorized helper methods.

Inspect existing components and code mappings first; discover libraries before searching/importing. Build original foundations if none are suitable. Return changed node IDs, use documented font loading, auto-layout and variable bindings, and verify screenshots. Do not copy unsupported Plugin API code into a browser console.

The connector's external-image import may be limited. Use its supported capture/import flow or the Figma web upload route with user authorization; never invent image hashes or mark blank image slots complete. A capture can be a temporary visual reference, while final controls/text remain editable.

## Higgsfield

Use the installed Higgsfield plugin tools and their live schemas. Read higgsfield.md. The package contains no REST client, key storage, proxy or network transport. When plugin tools are unavailable, report the missing integration. Use an installed Higgsfield skill/CLI only when the user permits that route; do not silently replace a requested plugin.

## Impeccable

Optional design craft integration: https://github.com/pbakaus/impeccable. If installed, load its skill and the applicable shape, critique, adapt, clarify, or polish reference. Apply them to the requested surface and respect its bounded review method. Avoid running code-only detectors against a Figma URL or interpreting the absence of HTML errors as canvas verification. If absent, use this package's design-method and quality references and state that Impeccable was not executed. Do not install its hooks automatically.

## Host portability

Codex: install with the Agent Skills CLI; supporting files stay inside this skill folder. ChatGPT: use the generated ZIP with the Skills upload interface when available. An ordinary chat attachment is reference material, not an installed skill. Node helpers run only when the host has an authorized shell. Skills, connectors and browser permissions are separate; model access is also independent. Do not promise automatic model switching or `npx` installation into ChatGPT's web UI.
