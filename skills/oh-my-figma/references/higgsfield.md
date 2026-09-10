# Higgsfield asset workflow

The intended path is the connected Higgsfield plugin. Discover the current tools and read schemas before calling. Do not embed credentials or write HTTP wrappers. This reference describes capability roles, not a promise that every host exposes every tool.

1. Build an asset manifest: stable asset ID, intended frame/slot, subject/product reference, style, crop/aspect, required dimensions, number of variants, purpose, and ownership/provenance. Generate only assets that add something to the design.
2. Confirm the selected workspace via a read-only workspace tool where available; preserve the user's account choice. Inspect model constraints when needed for references/ratios/parameters. Use current tool defaults for routine requests; avoid speculative model names and fixed pricing.
3. Use the tool's read-only cost estimate when available and respect the user’s run limit. If the provider returns a balance/unlimited choice, relay that question and leave the node blocked until answered. Never pick a payment route on the user's behalf.
4. Submit through image/video generation tools with the discovered schema. Persist returned job IDs immediately. Record adjustments/fallbacks and use actual output metadata, not the requested dimensions alone.
5. Poll or wait through the provider's job tools. A queued/submitted job is not a completed image. On uncertain submission, inspect existing jobs rather than resubmitting blindly. Stop on terminal failure or the run's deadline and expose the reason.
6. Inspect the completed asset, including product identity, edges, empty space for editable copy, visible artifacts and crop. Keep one chosen variant per slot unless more were requested. Do at most two purposeful correction passes within the run limit; don't regenerate because a screenshot was small.
7. Place the image in the intended Figma slot through a supported import/upload/capture path. Read back the fill or inspect in the browser. Return frame link and screenshot. Keep imagery separate from native text/components.

Asset manifest fields: `id`, `slot`, `prompt`, `referenceSources`, `workspaceId`, `model`, `jobId`, `status`, `actualDimensions`, `resultUrl`, `figmaFrame`, `review`, `cost` (unknown when unavailable). Never store secrets or claim that predicted attention/revenue proves business success.

Useful assets: landing hero photography, product cutouts, onboarding illustrations, empty-state artwork, app-icon explorations, OS wallpapers, store-listing imagery, and optional motion references. A generated logo/app icon should be labeled as a raster concept until a usable vector/master set is actually produced. Promotional video is a separate optional deliverable; preserve focus on the requested design set.

If no generated asset is required, record an explicit N/A rationale at the assets node. If generation is requested but unavailable, mark it blocked and continue only work that does not depend on it. Do not use N/A to hide missing plugin access.
