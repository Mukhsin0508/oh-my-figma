# Fresh third-party skills on every run

Never vendor third-party SKILL.md files, pin their old contents into this package, or treat this package's integration notes as a substitute for their current instructions. This package pins its own graph format only. Resolve third-party instructions from their official maintained source at the start of every new or resumed host session, before using them. Recheck before a later phase if the host reports an update or the session changes.

## Resolution procedure

1. Discover which third-party skills/plugins the requested work will actually use. Record installed identity/version and origin when the host exposes them. A locally present folder is not evidence that it is current.
2. Check the official upstream's current stable release or default branch, according to that project's supported distribution. Record the upstream version/commit and source URL with the check timestamp. `latest` written as a string is not a resolved version.
3. If stale or missing, refresh with that project's supported installer/update command or the host's plugin manager. Preserve user-modified files: report the collision instead of force-overwriting them. Let the host handle authentication/trust prompts; do not bypass them.
4. Read the installed/refreshed entrypoint and only the relevant references. Use its actual current names, parameters and procedure. Verify the installed revision matches the resolved source when metadata permits it.
5. Store a receipt for every used dependency: `name`, `status: current`, `resolvedVersion`, `sourceUrl`, `checkedAt`, `proof` (installer output, upstream SHA/tag and installed metadata, or host update report). Record unused optional integrations as `not-used` with a reason. If freshness cannot be established, block the dependent work; do not label the dependency current based on a guess.

For a long interruption, refresh these receipts before making more tool calls. A graph node already marked complete does not waive session-level freshness. The optional local graph helper validates receipt shape and timestamps when recorded; it cannot contact plugin stores or guarantee their release availability.

## Official routes

### Impeccable

Official source: https://github.com/pbakaus/impeccable. Discover its current installation/update instructions from that repository. As verified when this package was authored, its supported CLI includes `npx impeccable@latest install` and `npx impeccable@latest update`. Check current help before execution and choose the intended provider/scope. The latest npm launcher alone does not prove an old installed skill was updated: inspect the result and reread the skill.

Where the host deliberately uses the Agent Skills distribution, `npx skills@latest add pbakaus/impeccable --skill impeccable --agent codex --copy` resolves that source through the skills installer. Verify current CLI flags and installed metadata; do not mix plugin and skills distributions into duplicate active copies. Do not force overwrite locally edited copies. Installation may involve native hooks/trust; use the host's supported process.

### Figma and Higgsfield

Use the host's official installed plugin/skill distribution and update controls. Discover current tool schemas in the session after refresh; never use a saved schema as authority. Do not replace either plugin with a similarly named npm package or hardcode a local cache path from the author's machine. A managed connector may expose its latest available tool contract without a numbered release: a host-provided current-channel/update report is acceptable proof; tool presence alone is not.

If the host cannot report freshness or expose updating, say which integration cannot be verified. Ask for a host/plugin update or a current skill upload. Keep planning locally while dependent execution is blocked. Do not promise that a package installed via npx updates a separately managed ChatGPT plugin.

## Compatibility changes

If new upstream instructions alter API, approval or capability requirements, obey the live contract and record the changed route. Do not patch third-party skills to fit our older notes. If the change prevents the design graph from completing, report the specific dependency incompatibility and preserve progress for a later resume.
