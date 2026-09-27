# Stage-1 post-acceptance follow-up

**Subsequent owner acceptance:** Required-PNG detection before preview, safe fallback, publication gating/recovery, live palette preview/Cancel/Accept/persistence, companion backgrounds and Dark have now passed in real Windows + Brave + file://. The earlier pending statements below are historical. All 13 menu entries were visible, but the moving short-list footer was rejected. The [final menu-footer correction](STAGE1-FINAL-MENU-FOOTER-CORRECTION.md) supersedes that layout only, keeping the footer fixed at the bottom.

Implementation completed 2026-09-27. Scope: required-PNG availability agreement, shared scrolling-list capacity, live Options palette preview, companion backgrounds and Dark. **The Brave/file:// missing-PNG correction remains pending owner retest.** Automated results below are not a claim of real-browser verification.

## Baseline and accepted behavior

HEAD: `b1174de` (`Editor Saving`). The preceding Stage-1 and acceptance-correction changes were already uncommitted; they remain preserved. The complete starting deterministic suite passed **936/936**. The prompt, canonical specification, architecture, original Stage-1 report and correction report were inspected before changes.

The owner reports real Windows/Brave/file-URL passes for underlines, same-direction preview movement/recentering, semantic chooser/search and cross-profile assignment, all seven previous display palettes, palette persistence, contextual Select, portable JSON, quarantine, authoring and inert-JSON shipping. These are retained. The owner also verified explicit Working Copy restoration after both complete Brave and Windows restarts. The earlier apparent loss is no longer a demonstrated persistence defect; the owner believes it involved confusing the live Campaign Map with the independent Editor Campaign Map. **No Working Copy storage code or architecture was changed in this follow-up.** Diagnostics, explicit restore and JSON backup remain.

The owner confirmed that the missing-PNG and menu observations also occurred in this production checkout, not only the now-deleted disposable copy. This report does not attribute either observation to an outdated disposable copy.

## Availability investigation and correction

### Established implementation defect

The previous verifier and preview did not request the same resource URL:

| Path | Previous URL | Previous success evidence |
| --- | --- | --- |
| SceneAssetAvailability | Encoded catalog path plus `?verify=<timestamp-serial>` | Its own Image.onload and width/height |
| SceneAssetImages / preview | Same encoded catalog path plus `?v=<catalog hash>` | A separate Image.onload and width/height |

Both used the same catalog path and segment encoding. There was no filesystem existence check. Catalog validity describes an earlier scan. The verifier created separate Image objects, deduplicated references and awaited all worker promises; it did not consult the lazy preview cache. Its session evidence was keyed by ID/path/hash/dimensions, and every explicit check re-probed. Preview used an ID-indexed lazy cache and shared load-failure map. A verifier success removed an existing failure; a later preview failure could add it back.

Thus **success on the verifier's alternate URL was treated as proof that the untested preview URL was accessible**. No code required those two results to agree. This is a concrete evidentiary defect in the implementation. It permits exactly the reported state: one URL returns a successful image event and readiness reports VERIFIED; the other URL fails and preview draws a placeholder. The old offline Image adapter stripped query strings before loading a physical file, making those distinct requests indistinguishable in its tests.

**The browser-specific reason the two URLs produced different results in the owner's incident is not established.** There is no captured Brave trace or retained disposable copy to inspect. Caching, file-URL normalization or policy are hypotheses, not diagnosed causes. The code inspection establishes the missing agreement requirement, not the internal Brave cause. Successful automated tests do not close this uncertainty.

### Exact change

New `SceneAssetLoader` owns URL construction and the image-loading contract used by both preview and verification:

1. Encode each catalog path segment, retain path separators and append `?v=<encoded catalog hash>`. This is the ordinary preview URL.
2. Create a new Image with success/error handlers installed before setting `src`.
3. After onload, await `decode()` when the Image implementation provides it. Reject decode failures, incomplete images and mismatched intrinsic dimensions. Browser `naturalWidth`/`naturalHeight` take precedence over display width/height; width/height fallback supports the offline adapters.
4. Resolve once, detach handlers and clear the timer. Load error, constructor error or timeout fails closed. Diagnostics include the attempted URL. The timeout is 15 seconds per load.

Availability now requires **both** an exact runtime-URL load and a supplemental load of that same URL with `&verify=<fresh batch token>`. The second request preserves the previous effort to request fresh evidence, but its success can no longer substitute for accessibility at the runtime URL. If the runtime URL fails, verification stops for that entry and records FAILED. At most eight entries probe concurrently; each entry's two checks run sequentially.

Only after both checks succeed can an entry become AVAILABLE. Older overlapping checks cannot overwrite a newer record. Failures remain visible to readiness/fallback lookup; restored files can clear them through a later successful check. DeveloperShell continues waiting for verification and rejects canceled or stale-draft completions before publishing. The existing final publication gate rejects unverified, pending or failed required references.

Preview retains its separate lazy image cache and safe placeholder behavior, but delegates loading to the same helper. It now has the same decoding, intrinsic-dimension and timeout checks. There is no server, fetch/XHR, filesystem scanner, image embedding or new persistence mechanism. Generated catalogs and external PNGs remain unchanged.

Readiness success now includes the verified reference count. A structurally ready legacy draft with zero external scene references says **NO EXTERNAL PNG REFERENCES IN THIS EDITOR DRAFT** instead of claiming it verified PNGs. Such a draft still supports the established placeholder behavior. This avoids a vacuous verification claim; it is supplemental diagnostics, not the missing-file fix.

### Why this addresses the observed disagreement, and limits

When the exact URL used by ordinary preview fails, it is now impossible for alternate-query success alone to mark that entry AVAILABLE. A query-sensitive regression explicitly reproduces “fresh-token URL succeeds / runtime URL fails” and checks both publication refusal and preview failure through the real shared code. Restored-file tests exercise successful recovery through both checks.

This should align Brave/file-URL readiness with its runtime image accessibility because both first use the same resource URL and lifecycle contract. It does **not** establish that a browser always rereads disk or that a file cannot change after checking. No browser cache cause or bypass guarantee is asserted. PNG palette/content validation remains the catalog updater's responsibility. The owner's exact manual retest below is required before calling the real-browser defect fixed.

Required Idle/Attack and configured required Backgrounds retain their established gates. Optional Dodge-only animation art, Floors and effects retain warnings/fallbacks; an animation shared with Idle/Attack is required. Startup remains resilient for DevMode repair. No Stage 2/3 combat integration was introduced.

## Menu capacity

The actual normal Campaign Menu has **13 entries**, with Options / Controls last. Its shared default was fixed at **12**, so Options fell below the initial page. This explains the reported scrolling behavior without needing the prompt's illustrative ten-item list to match repository labels exactly. The initial observation that twelve rows should fit ten example entries was superseded after inspecting the full menu construction.

Capacity is now derived in `gameConfig.UI`:

```text
list origin = 26
row height = 12
footer bottom margin = 18
capacity = floor((360 - 18 - 26) / 12) - 1 = 25
```

`CampaignUIRenderer.list` uses those shared metrics. With a full page, the last item starts at y=314, one blank row begins at y=326, and the legend starts at y=338. One additional item would exceed the permitted footer position. For shorter lists, the legend follows the actual final item by two row origins, keeping precisely one blank list-row between them. For the thirteen-item Campaign Menu the last item is y=170 and legend y=194. The full-screen border stays unchanged; shorter lists can have unused space below their legend.

SelectableList retains scrolling, wrapping and selection behavior; comparable default scrolling lists gain the capacity. Popup/page layouts and editor PropertyScreen geometry are unchanged. In particular, the already accepted PropertyScreen underline and arrow positions were not moved.

## Live preview, companion backgrounds and Dark

`DisplayPalette.preview(id)` applies the active framebuffer filter and companion background without writing storage. `choose(id)` applies and persists. The palette option opts into a PropertyScreen preview callback:

- Enter edit mode: snapshot the palette active at entry.
- Navigate: apply each candidate immediately, with no storage write.
- Accept: commit/persist the candidate and leave it active.
- Cancel: restore the snapshot and its companion background without writing.
- Dismiss/replace the Options screen: roll back an unfinished preview as well.

Unrelated fields retain their existing commit-only semantics. The preview hook does not change their geometry or globally enable live updates. A transient Terminal overlay can return to the same edit; actually dismissing that edit rolls it back. Ordinary gameplay Select still commits/cycles through the logical-input path; existing contextual arbitration is unchanged.

Each palette now defines an `outside` value. `DisplayPalette.apply` sets the existing root CSS `--clear-color` used by the page background separately from the game-canvas filter. Startup attaches the saved palette and sets its companion before normal rendering. Nothing applies an SVG filter to the body or outer page. Future shell artwork remains a distinct authored layer outside the 480×360 canvas.

| Cycle order | ID | Established companion background |
| --- | --- | --- |
| Canonical | `canonical` | `#6d8508` |
| Game Boy | `hardware` | `#9bb393` |
| Blue | `blue` | `#a0b9be` |
| Red | `red` | `#a27070` |
| Purple | `purple` | `#927d99` |
| Amber | `amber` | `#c7b17a` |
| Grayscale | `gray` | `#8f8f8f` |
| Dark | `dark` | `#2b2d31` |

Dark's exact output mapping in canonical input order is **`#242424`, `#666666`, `#aaaaaa`, `#e4e4e4`**. This deliberately reverses Grayscale's luminance order, without mathematical RGB inversion. Dark participates naturally in configuration-driven gameplay cycling, Options, preview, persistence, restoration and validation. Its output colors and all eight companion colors are established owner design. Earlier alternate framebuffer values remain provisional; the source PNG palette remains the same four canonical colors.

## Files and persistence boundaries

Changes specific to this follow-up, distinct from the preceding uncommitted passes:

| Area | Files |
| --- | --- |
| New shared loader | `js/rendering/SceneAssetLoader.js` |
| Availability/preview diagnostics | `js/editor/SceneAssetAvailability.js`, `js/rendering/SceneAnimationPlayer.js`, `js/editor/AssetBrowser.js` |
| Scrolling list geometry | `js/config/gameConfig.js`, `js/rendering/CampaignUIRenderer.js` |
| Palette configuration/output/startup | `js/config/displayPalettes.js`, `js/rendering/DisplayPalette.js`, `js/core/Game.js` |
| Options transaction/disposal | `js/editor/PropertyScreen.js`, `js/editor/DeveloperShell.js` |
| Loader order | `index.html` |
| Regression/QA | `js/debug/AssetAcceptanceTests.js`, `tools/verify-asset-acceptance.cjs`, `tools/verify-scene-assets.cjs`, `tools/verify-developer-ui.cjs`, `tools/verify-palette.cjs` |
| Documentation | This report, canonical specification, README, assets README, architecture, recovery ledger, previous acceptance-corrections report status note |

Editor, Battle Scene subdocument, portable, shipping, control and display records remain **v1**; campaign schema remains **8**. Display persistence remains only `{version:1,palette:id}` under `shining-farce.display.v1`. No outer-color preference is separately stored. No authored-data migration, source PNG/catalog regeneration, Working Copy change or shipping-format change occurred. The new local script must accompany the updated complete project, just like the existing scripts.

## Automated verification

| Check | Result |
| --- | --- |
| Full starting deterministic suite | **936/936** |
| Full final deterministic suite | **950/950**; 14 additional checks including Dark |
| Catalog validation/quarantine fixtures | **29/29** |
| PNG/publishing/SVG integration | **28/28**; seven new loader regressions plus Dark |
| Scene editor/real temporary PNG previews | Passed; 15 offline rendered frames |
| Full offline rendering verifier | Passed; campaign, developer UI, tactical, class, spell and input checks |
| Targeted menu/developer rendering | Passed; real Campaign Menu with Options, full 25-row page and overflow-last-page snapshots |
| Source palette validation | All 37 PNGs; zero forbidden source colors or partial-alpha pixels; eight display definitions checked |
| Offline structure | 185 local classic scripts; zero missing resources, remote dependencies, fetch/XHR or syntax errors |
| Authored-content compatibility | Legacy/portable round trips and initialization passed |
| Windows shipping structure | Inert HTML/JSON/TXT/ZIP round trip; zero executable script entries; installed-page 950 rule checks passed |
| Whitespace | `git diff --check` passed |

New foundation coverage includes exact companion values, Dark/cycle order, live preview without writes, Accept/reopen, Cancel/background restoration, dismissal/replacement rollback, unrelated enum semantics, maximum capacity, shorter-list spacing, overflow/wrap, actual Campaign Menu Options visibility and zero-reference diagnostics. Existing Working Copy, portable JSON, optional-art and contextual-Select assertions remain passing.

New integration coverage models query-dependent outcomes rather than erasing them, compares actual preview and verifier URLs, checks decode failure and pending decoding, rejects misleading display dimensions, tests restored runtime URLs and verifies path escaping. The existing real-file fixtures still rename only temporary PNGs, check fresh missing-required publication refusal, optional fallbacks, cancellation and stale-draft completion. All eight palettes are rasterized through an offline SVG compositor; tests assert the companion property separately and preserve independently colored outer artwork.

The preview verifier's failure assertion now awaits the shared loader's promise completion; it still requires the same failure/fallback result. No test expectation was weakened to permit missing required art. Optional Node/Canvas tools remain developer-only; ordinary game execution needs no server, npm install or build.

Commands used: `node tools/test-foundation.cjs`, `node tools/test-asset-catalog.cjs`, the asset-acceptance/scene-assets/rendering verifiers with the existing Canvas package, rendering `--developer-only`, offline-structure, authored-content and shipping-page verifiers, and `git diff --check`. Artifacts include `%TEMP%/sf-post-acceptance-render`, `%TEMP%/sf-post-layout`, `%TEMP%/sf-acceptance-t5APkb` and `%TEMP%/shining-scene-ui-Y1oMOG`. These are offline renders/fixtures, not Brave screenshots.

## Required owner retest

### 1. Missing required PNG — highest priority

Use a new disposable **complete copy of the updated project**, with installed authored Unit Presentation Idle/Attack references. Confirm the reference count is nonzero; if the screen reports no external references, first load the intended authored editor content or use its published launcher.

1. With all files present, verify readiness succeeds.
2. Close the game and rename one required referenced Idle/Attack PNG.
3. Freshly reopen that copy's `index.html` in normal Brave through `file://`.
4. **Do not preview anything.** Immediately Check Shipping Readiness.
5. Expect NOT READY / an unavailable required reference, never VERIFIED/READY for that missing file. Attempt shipping publication as well; expect refusal.
6. Open the affected Animation Preview. Expect the safe missing-PNG placeholder and diagnostic.
7. Close the game, restore the exact filename and run Update Asset Catalog in that copy.
8. Reopen and check readiness directly, without previewing. Expect READY recovery and successful publication.

If disagreement remains, retain that disposable copy and capture the full readiness and preview diagnostics, including referenced ID/URL. The implementation must not be called Brave-verified until this sequence passes.

### 2. Menu capacity

Open the Campaign Menu. Options / Controls should appear on the initial page. Confirm one blank menu-row between the final item and `Z OK  X BACK`. Check a longer list for scrolling, last-item visibility, wrap and a collision-free legend. PropertyScreen's accepted underline should remain unchanged.

### 3. Live Options preview

Enter Display Palette and cycle several candidates. Framebuffer and outside companion must change immediately. Cancel: both must return to the palette active at entry. Repeat and Accept: the candidate stays active and restores after reopening. Recheck preview frame Select, map-editor variant Select and campaign stack Select to confirm contextual priority.

### 4. Dark

Reach Dark through both gameplay cycling and Options. Confirm reversed grayscale and outside `#2b2d31`; the next gameplay cycle returns to Canonical. Check Dark live preview, Cancel, Accept and reopen retention. Future outer artwork must not be affected by the framebuffer filter.

The owner's previous Working Copy restart passes stand; no further persistence redesign or speculative fix is requested. Remaining uncertainty concerns the exact browser cause of the earlier availability disagreement and acceptance of these new changes in real Brave. No Stage 2/3 or shell work was added.
