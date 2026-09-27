# Stage-1 manual acceptance corrections and display palettes

Follow-up status: the owner subsequently passed the underline, preview movement, chooser, all seven palettes, palette persistence, contextual Select and Working Copy restoration across full Brave/Windows restarts. Fresh missing-PNG readiness still failed in real Brave. The [post-acceptance report](STAGE1-POST-ACCEPTANCE-FOLLOW-UP.md) supersedes that availability implementation and records menu/live-preview/companion/Dark refinements. Original counts and unverified statements below remain historical evidence.

Implemented 2026-09-26 from the user's **Stage 1 Asset Pipeline — Manual Acceptance Corrections & Display-Palette Enhancement** prompt. All seven requested areas were investigated and corrected or accurately constrained. No Stage 2/3 combat integration, shell, asset redesign or persistence replacement was introduced.

## Baseline and scope

HEAD was `b1174de` (`Editor Saving`), with the preceding Stage-1 implementation and documentation already present as uncommitted changes/untracked files. The measured starting foundation suite passed **900/900**. Those existing changes were preserved; a diff against HEAD therefore includes more than this corrective pass. The six production PNGs added during the user's manual testing were retained. No PNG or generated catalog was rewritten during this pass; all **37 current PNGs** pass canonical source validation.

Inspection covered the supplied acceptance prompt, canonical specification, architecture, recovery ledger, previous Stage-1 report, Asset Browser, catalog, preview/cache, editor commands/IDs, local storage, portable imports, authored registry, shipping publisher, logical input and framebuffer rendering. No applicable `AGENTS.md` was found. Existing manual acceptance successes are user-reported evidence, not browser tests performed by this implementation pass.

## Findings and corrections

### 1. Preview direction

The preview incremented pan offsets in the requested direction but subtracted those offsets when drawing the image. Drawing now adds `panX`/`panY`: Right/Down translate the visible image positively and Left/Up negatively, in 16-pixel steps. Menu restart resets both offsets. Clipping, integer scale and authored animation data remain unchanged. The hint now says directions move the image. A draw-coordinate regression checks all four directions, reset and unchanged document JSON.

### 2. Shared selected-row underline

`PropertyScreen` drew its line at `30 + row*12`, above text drawn at `32 + row*12`. The line is now at `41 + row*12`, nine pixels below the text origin. The arrow remains beside the text; focused-field marking, borders and unrelated map/status underlines retain their existing behavior. Offline rendered property/animation screens were inspected visually as well as checked by coordinate assertions.

### 3. Animation IDs

`EditorDocument.nextId` is deliberately shared by authored entity kinds. A confirmed reproduction is:

1. Create an animation → `animation1`.
2. Create a Unit Presentation → `presentation2`.
3. Create another animation → `animation3`.

There is no missing `animation2` in that sequence, and no collision or corrupt allocation. Deletion also intentionally leaves gaps. Creation consumes a counter only in the active draft transaction; a failed transaction does not consume it, and an unsaved draft does not write storage. Restore/import/source reload restore their document's counter; collision checks still protect imported low counters. No allocator change, renumbering, per-kind counter or cosmetic gap filling was made.

**The precise historical cause of the user's `ANIMATION1 → ANIMATION3` observation is unconfirmed.** The question about an intervening Unit Presentation was not answered. Shared allocation provides a demonstrated explanation, not proof that this was the user's exact sequence. Tests cover creation, discarded unsaved state, failed creation, save/restore, installed-document reload, deletion and import collisions.

### 4. Semantic chooser identity

Animation rows now show the authored name first and internal ID second, e.g. `OK ZEON FIGHTER ATTACK / animation3`. Search includes names, IDs, metadata and usages. Contextual selectors rank matching Idle/Attack/Dodge filename metadata first, then faction/race/class hints; the list explicitly says all compatible choices remain allowed. Category compatibility remains enforced, but a PLAYER presentation may deliberately use ZEON-named artwork. Filename inference does not rewrite associations or confer gameplay authority. Paging continues through the shared property screen, so multiple definitions remain browsable without numeric memorization.

### 5. Display palette system

`js/config/palette.js` and all source PNG contracts retain the exact canonical four shades. `js/config/displayPalettes.js` defines four explicit output values per display palette, ordered lightest to darkest:

| Palette | Output colors | Status |
| --- | --- | --- |
| Canonical | `#9bbc0f`, `#8bac0f`, `#306230`, `#0f380f` | Existing canonical source appearance |
| Game Boy / Tunable | `#d5dcc0`, `#9aab83`, `#536951`, `#23392e` | Provisional; owner hardware comparison pending |
| Blue | `#dbe8ef`, `#90afc8`, `#49617d`, `#202d45` | Provisional |
| Red | `#f0d9d1`, `#c39287`, `#854f53`, `#402b37` | Provisional |
| Purple | `#e6dbed`, `#b09bbb`, `#715c86`, `#342b48` | Provisional |
| Amber | `#f2dfb2`, `#c5a266`, `#80643a`, `#392e24` | Provisional |
| Grayscale | `#e4e4e4`, `#aaaaaa`, `#666666`, `#242424` | Provisional |

The Game Boy option starts less yellow/desaturated, with substantially wider separation between its lightest shades. These are tunable artistic choices, not newly canonical design values. Changing a palette requires only changing its four configuration entries, not regenerating assets.

`DisplayPalette` solves an affine RGB matrix through the four canonical colors and installs an SVG `feColorMatrix` with explicit sRGB interpolation. It is calibrated to the four chosen output colors rather than implementing hue rotation. Alpha is passed through unchanged. The canonical choice removes the filter. Rendering still draws canonical pixels; the filter transforms the finished game output, including image sprites, bitmap text, UI and procedural effects. This avoids Canvas pixel read-back, which can be restricted for local-file image sources. SVG color-matrix and interpolation semantics are specified by [W3C Filter Effects](https://www.w3.org/TR/filter-effects-1/).

The filter reference is attached **only to the game canvas**, whose logical dimensions must be 480×360. The SVG definitions themselves draw nothing. No filter is applied to the body, page container or future hardware shell; future outer artwork must remain outside this canvas. No shell geometry or behavior was added. Offline SVG raster tests check all four output colors, unchanged transparency, and an independently colored outer margin. These tests exercise an SVG compositor and a DOM fixture, not Brave's CSS-to-canvas compositor.

`Game.handleDisplaySelect` uses the existing logical input queue. States explicitly release Select for ordinary gameplay; developer overlays, menus, Terminal, text input and remapping capture keep control. Campaign objects overlapping the cursor keep stack cycling. A long tactical forecast keeps paging, target/command contexts retain their handling, and Spell Lab retains unit selection. Preview Select still advances a frame and map-editor Select still changes variants. Options / Controls offers a display-palette field regardless of gameplay context. No physical key is hard-coded for palette cycling; Q and gamepad LB remain the current default Select mappings.

Preference is saved as `shining-farce.display.v1`, `{version:1,palette:id}`. It is separate from editor, controls and campaign data and never enters portable/shipping authored JSON. Missing/unknown preferences fall back to Canonical. Storage failure leaves the chosen palette active for the session and reports that it was not saved. Source asset validation still checks exactly the canonical four colors; only the explicit output configuration is separately validated.

### 6. Working Copy restart loss

The actual mechanism was already `localStorage`, under `shining-farce.editor.v1`; it was not sessionStorage. Code inspection found no unload/shutdown clearing, expiration or deliberate deletion path. Save/restore already serialize the whole authored document, including scene definitions and associations. Memory-backed tests reproduce save → new store/document instance → explicit restore successfully, while proving no automatic restore occurs.

The user specifically confirmed **Brave, a normal window, and exactly the same `index.html` path after restarting**. Private mode and a changed launcher path are not explanations established for this incident. No surviving storage artifact or browser-policy evidence establishes what removed or hid that record; the historical cause remains **unknown**. No claim is made that write read-back fixes an OS-flush or Brave-retention defect.

Ordinary localStorage has no built-in expiration, but behavior for `file:` URLs is explicitly undefined/browser-dependent; browser policy or clearing can also remove storage. See [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). Brave documents optional [Forgetful Browsing](https://brave.com/privacy-updates/25-forgetful-browsing/) that removes site storage and [data-clearing settings](https://support.brave.com/hc/en-us/articles/360048833872-How-Do-I-Clear-Cookies-And-Site-Data-In-Brave). These are conditions to investigate, not evidence that either was enabled or applied to this local file. The task did not inspect or alter the user's browser settings.

Robustness changes:

- Every `LocalStore.write` now requires exact immediate read-back after `setItem`; silent discarded writes cannot produce a successful-save confirmation. Failure retains editor dirty state and the error.
- Successful reads clear an old storage error, allowing clean retry diagnostics.
- Save confirmation distinguishes this-session read-back from a portable file backup and describes file-URL/browser retention limitations.
- **Working Copy Storage Details** reports the current page URL, exact key and whether a record exists or a read failed. It does not claim a save occurred merely because the diagnostics were opened.
- Missing-copy restore gives recovery guidance; corrupt/invalid restore or JSON import still leaves the active draft unchanged.

Explicit Save/Load semantics, complete portable JSON backup/import and the existing persistence boundaries are retained. There is no auto-load, server, alternate canonical store or invented hidden backup. Immediate read-back proves only the browser's current storage view, not survival across browser/computer restart. Reliable retention in this user's Brave/file-URL environment still requires the manual check below; portable JSON remains the durable file backup.

### 7. Fresh readiness and missing PNGs

The false positive came from readiness using generated catalog validity plus a lazy runtime failure map. A physically removed PNG still looked valid until a preview attempted to load it and recorded a failure. The catalog is a snapshot, not proof that the file is currently present.

`SceneAssetAvailability` now performs independent local `Image` probes. Every UI readiness check and shipping export deduplicates referenced catalog-valid entries, starts fresh probes with a changing query token, limits concurrent loads to eight, checks decoding/dimensions, and fails closed on errors or a 15-second per-file timeout. There is no fetch, directory enumeration, remote request or server. Evidence is session-only and keyed by ID/path/catalog hash/dimensions. Restoring a file can clear failure evidence on a later explicit check without opening a preview.

Required UNVERIFIED, PENDING or FAILED entries cannot pass synchronous readiness/publication gates. UI publishing waits for the probe result; canceling the pending screen or changing the draft prevents late publication. The same wrapper gates launcher HTML, ZIP, TXT and per-map publication. Low-level synchronous publisher functions require established availability evidence; they do not themselves await image loads.

Required Idle/Attack and configured required Backgrounds remain strict. Missing optional Floor, Dodge-only animation assets and effects warn and retain their fallback contracts; a Dodge animation also assigned to Attack/Idle is required. Shape/structural errors remain errors. Registry startup retains map/campaign/structural validation while tolerating missing scene art so DevMode repair stays accessible. Placeholder, Idle, generic Background, no-Floor and procedural-effect/Dodge fallback lookups remain intact. Stage 2/3 choreography is not implemented.

Probe success establishes availability, successful decoding and expected dimensions at that moment. Canonical pixels and catalog metadata are still validated by the developer updater; changing PNG contents requires updating the catalog and refreshing. No browser can guarantee that external files will remain unchanged after a check. Fresh tokens request a new image resource; actual Brave `file:` cache/query behavior remains a manual acceptance item.

## Formats and changed files

EditorDocument, its optional Battle Scene subdocument, portable envelopes, shipping envelope and control profiles remain **v1**. Campaign schema remains **8**. The only added storage format is independent **display preference v1**. The normal Windows shipping format remains inert JSON in `index.html`, with JSON/TXT backups and optional ZIP packaging. No executable JS replacement download, source-image embedding or catalog embedding was introduced.

Corrective-pass files (preceding Stage-1 changes also remain in the working tree):

| Area | Files |
| --- | --- |
| New runtime/configuration | `js/config/displayPalettes.js`, `js/rendering/DisplayPalette.js`, `js/editor/SceneAssetAvailability.js` |
| Preview, chooser, readiness and menu | `js/editor/AssetBrowser.js`, `js/editor/BattleSceneAssets.js`, `js/editor/PropertyScreen.js`, `js/editor/DeveloperShell.js`, `js/editor/AuthoredFiles.js` |
| Storage | `js/core/LocalStore.js`, `js/editor/EditorDocument.js` |
| Framebuffer/input integration | `js/core/Game.js`, `js/states/CampaignMapState.js`, `js/states/BattleMapState.js`, `js/states/ExplorationState.js`, `js/states/EndDayState.js`, `index.html` |
| New tests | `js/debug/AssetAcceptanceTests.js`, `tools/verify-asset-acceptance.cjs` |
| Updated verification | `js/debug/FoundationTests.js`, `js/debug/BattleSceneAssetTests.js`, `tools/verify-scene-assets.cjs`, `tools/verify-palette.cjs` |
| Documentation | This report, `README.md`, `assets/README.md`, `CANONICAL-DESIGN-SPECIFICATION.md`, `docs/ARCHITECTURE.md`, `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md`, `docs/BATTLE-SCENE-ASSETS-STAGE1.md` |

The Stage-1 tests now seed explicit availability for their known synthetic fixture catalog and restore it afterward; previous assertions are retained. This models the new publication precondition rather than weakening it. New tests independently cover fresh unverified/missing files. Generated catalog/quarantine tooling and production PNGs were not edited in this correction pass.

## Verification results

| Check | Result |
| --- | --- |
| Foundation baseline | **900/900** |
| Final full foundation suite | **936/936**, no failures; 36 new correction checks |
| Catalog validation/quarantine fixtures | **29/29** |
| New asynchronous PNG/shipping/SVG integration | **20/20** |
| Scene authoring/preview verifier | Passed; **15** offline rendered frames |
| Full rendering verifier | Passed; **149** offline PNG renders, including developer/editor UI, campaign, tactical, class and spell presentation |
| Canonical asset/source validation | **37 PNGs**, seven explicit display palettes; zero forbidden source colors or partial-alpha source pixels |
| Offline structure | **184** local classic scripts, one stylesheet, zero missing resources, remote dependencies, fetch/XHR or syntax errors |
| Authored-content compatibility | Legacy/split generated-data round trips, normal initialization and portable metadata/IDs passed |
| Windows shipping structure | Inert HTML/JSON/TXT package round trip; no executable script entries; installed-page **936** rule checks passed |
| Whitespace check | `git diff --check` passed |

The asynchronous verifier uses real temporary PNGs and a local Image adapter to reproduce fresh missing-file failure, restore/retry, cache-token changes, wrong dimensions, optional art, timeout, constructor failure, actual DeveloperShell publishing, cancellation and stale-draft rejection. SVG raster tests exercise all seven palettes. Tests write artifacts to temporary directories and do not rename/delete production artwork.

Reproduction commands, with `CANVAS_PACKAGE` replaced by a path to an existing `@napi-rs/canvas` package:

```text
node tools/test-foundation.cjs
node tools/test-asset-catalog.cjs
node tools/verify-asset-acceptance.cjs CANVAS_PACKAGE
node tools/verify-scene-assets.cjs CANVAS_PACKAGE
node tools/verify-rendering.cjs CANVAS_PACKAGE --output=TEMP_OUTPUT_DIRECTORY
node tools/verify-offline-structure.cjs
node tools/verify-authored-content.cjs
node tools/verify-shipping-page.cjs
git diff --check
```

Node/Canvas are optional developer QA tools; no npm installation or build is required for ordinary play. Outputs from this pass include `%TEMP%/sf-acceptance-final-render`, `%TEMP%/shining-scene-ui-hltpBN` and `%TEMP%/sf-acceptance-an4Afe`. They are offline renders, not browser screenshots.

## Remaining manual acceptance and unresolved evidence

Actual Windows/Brave restart retention and direct `file://` rendering were **not manually verified by this agent**. The available browser tool's file-URL restriction was not bypassed. Automated storage replacement and local-image adapters do not reproduce browser security, storage eviction or its CSS compositor.

1. In normal Brave, open the exact project launcher, create/edit scene content, explicitly save, confirm read-back success and inspect **Working Copy Storage Details**. Export a JSON backup. Close/reopen Brave, then separately restart Windows and reopen the same path/profile; explicitly load the Working Copy each time. If absent, record the diagnostics and relevant clear-on-exit/Forgetful Browsing settings before changing anything. Verify JSON recovery separately. Do not assume repeated absence is an authoring serialization defect without evidence.
2. Cycle all seven palettes during ordinary gameplay and reopen to check preference retention. Confirm complete game-screen recoloring, crisp pixels, unchanged outside page colors and no alpha artifacts. Compare/tune the Game Boy option against the owner's hardware later. Exercise Options selection, stacked squad Select, long forecast paging, Spell Lab selection, editor variants and preview frame advance.
3. In a disposable complete shipping copy, rename a required referenced Idle or Attack PNG. Freshly open the launcher and immediately run readiness and attempt each publishing route, without previewing. Expect refusal or a visible verification failure, never READY. Preview should remain safe. Restore the filename, run the catalog updater, reopen and repeat; expect readiness recovery. Repeat with optional Floor/Dodge/effect artwork and expect warnings/fallbacks where applicable.
4. Check same-direction preview movement, reset, selected-row underlines, semantic chooser names/search and deliberate cross-profile assignments in the real browser. Preserve the earlier successful portable import/export, quarantine and Windows installation acceptance coverage.

Unresolved evidence is limited to the historical Working Copy-loss cause, the exact historical ID-creation sequence, real-browser retention/compositing/local-image behavior and owner palette tuning. These are explicitly documented rather than claimed fixed or verified. Established Stage-1 behavior, external asset boundaries, incomplete-draft recovery and Windows-safe shipping are retained.
