# Battle Scene asset pipeline — Stage 1

Follow-up: the [2026-09-26 manual acceptance corrections report](STAGE1-MANUAL-ACCEPTANCE-CORRECTIONS.md) supersedes the preview direction, chooser, readiness and storage-notice behavior below and adds independent display palettes. Counts and verification statements below describe the original Stage-1 pass.

Implemented 2026-09-25 from the Battle Scene Asset Pipeline Stage-1 prompt. Baseline: clean commit `b1174de` (`Editor Saving`), **863/863** foundation checks measured before changes. No baseline discrepancy. No production artwork was added or existing PNG altered.

## Inspection and reconciliation

Inspected canonical §5/28/29/30/31, architecture and recovery records, the Windows shipping correction, README/assets contracts, launcher/script ordering, asset manifest/loader, both existing animation and scene implementations, terrain/variant tables, map/editor/property screens, editor persistence, authored formats/registry/publisher and verification harnesses. Searches covered asset IDs, sprite IDs, animations, readiness, terrain and shipping references. No `AGENTS.md` was found.

The previous scene uses 16px map art enlarged to 64px, a continuous procedural backdrop and a hardcoded timed sequence. It remains compatibility behavior. The new 128×96 unit frame and 256×96 Background contracts supersede only the production-art TBDs. The prompt explicitly refines continuous-background pans into staged shot transitions; that accepted future design is documented, without changing the current renderer. No unresolved design contradiction required adjudication. Existing approximate 1-second idle / 2.5-second result beats, conclusion handling and presentation/mechanics separation remain.

The old atlas AnimationPlayer expects frame counts and atlas-duration arrays. A separate `SceneAnimationPlayer` supports external ordered frame references and independent durations; neither clock drives combat. Battle terrain previously had a tile/variant picker, but no production-presentation properties. A terrain-definition screen now opens from the Asset Tools menu or the Battle Map editor's terrain-under-cursor command. These edit the global terrain association, not an individual map override.

## Installed workflow

1. Place PNGs in the documented flat directories under `assets/battle-scene/`.
2. Double-click **Update Asset Catalog.bat**. It invokes the repository's existing Node developer tooling with only built-in modules. Node is needed for this developer operation, never for playing the game. The batch file explains a missing Node installation and does not install anything.
3. Review `assets/battle-scene/catalog-report.txt`. The console remains visible. Exit 0 means all valid, 2 means a usable catalog with quarantined entries, and 1 means updater failure.
4. Open/refresh `index.html`. Enable `devmode`, open the Developer Menu, then **ASSET BROWSER / BATTLE SCENE TOOLS**.
5. Find a unit/effect frame and choose **CREATE ANIMATION FROM THIS SEQUENCE**, or use **ANIMATION DEFINITIONS**. Set per-frame milliseconds, reorder/duplicate/remove/replace/add frames, choose loop and final behavior, and preview/restart/inspect frames.
6. Create a unit presentation and choose actual faction/race/class IDs, then assign Idle/Attack and optional Dodge through filtered animation selectors. Assign Background/Floor independently under terrain definitions.
7. Save the browser working copy and export a full JSON backup. Check readiness before publishing through the existing **EXPORT SHIPPING INDEX.HTML** / ZIP / inert TXT workflow. Keep the external PNGs and locally generated catalog with the full project.

Every selector uses logical navigation/Accept/Cancel. Search/name entry uses the existing keyboard text mode. Numeric/enum editing uses the existing commit/cancel behavior. Preview: Accept pauses, Menu restarts, Select inspects the next frame, directions pan oversized images at native integer scale, Cancel returns. Large effects clip rather than shrink fractionally. Quarantined pixels are never drawn; metadata/error messages remain inspectable.

## Data and validation

Source files remain artist-owned. The updater owns only `js/data/assetCatalog.js` and `assets/battle-scene/catalog-report.txt`. It scans the nine explicitly declared flat directories, ignores other directories and rejects direct source-directory/file links. It never modifies, moves or deletes PNGs. The generated classic script is local derived data, not a browser publishing download, and contains no authored definitions. Its v1 format is `{version, entries, sequences}`. Entries include filename-derived category/ID, path, SHA-256 content fingerprint, dimensions, inferred metadata, sequence/order, validity and diagnostic reasons. Output is deterministic and timestamp-free.

The dependency-free decoder checks signature/chunk boundaries/CRC, PNG format, dimensions, decompressed length, all pixel filters, palette/alpha, packed indexed colors, exact 16-bit colors and Adam7 interlace. APNG and unsupported critical encoding are rejected with reasons. Embedded ICC/CICP profiles and non-sRGB gamma/chromaticity are quarantined to prevent browser color conversion from introducing extra shades; export standard sRGB PNGs without embedded profiles. A 16M-pixel decoder safety limit is an implementation bound, not a mandatory effect size class. Unit/Background/Floor fixed dimensions are checked; effect sequences must agree in canvas size. Duplicate derived IDs, mixed numbered/unnumbered sequences, duplicate frame positions, zero/leading-zero/unsafe suffixes and malformed structured names are quarantined. Number gaps are allowed because numeric order is unambiguous. File failure does not discard unrelated entries; inconsistent/ambiguous sequences are quarantined as a group.

IDs are `category:filename-without-extension` (lowercase). Production names must be lowercase. Unit faction/race/class/animation tokens are alphanumeric and hyphen-delimited; filename metadata never grants class/faction authority. A trailing integer on an effect is its frame suffix: `blaze-1-2.png` means effect `blaze-1`, frame 2. For a numeric-ending single-frame effect identity, include an explicit frame suffix. No content similarity or rename repair exists.

The optional `EditorDocument.battleScene` subdocument has its own **version 1**, with `animations`, `units` and `terrains` dictionaries. Old documents need no migration or synthetic production profiles. New profiles are explicit opt-in to production readiness; each requires Idle/Attack. Unconfigured legacy combinations still use existing placeholders. Unit associations use real `COMBAT_FACTIONS`, `RACES` and `CLASSES` IDs (e.g. `HUMAN`, independent of lowercase art names). Duplicate combinations are a readiness error. Terrain entries are keyed by existing `BATTLE_TERRAIN` IDs; each configured terrain requires a Background and may have a Floor. No production coverage is claimed for unspecified combinations/terrains.

Animation records contain stable editor ID/name, `units` or `effects` category, ordered `{asset,ms}` frames, boolean `loop`, and `final` (`HOLD`, `HIDE`, `FIRST`). Effects additionally contain `PARTICIPANT`/`VIEWPORT` anchor and integer X/Y offsets. The initial 100ms per frame, positive 1–600000ms input range and UI offset range are tunable implementation choices. No timing comes from filenames. No definition references another definition: frames point to PNGs; associations point to definitions. Thus Stage 1 cannot form compound-block cycles.

Structural validation rejects malformed types, versions, categories, timing, final modes and effect anchors atomically. Empty frame lists and unavailable well-formed references remain saveable drafts. Readiness adds asset/category/canvas validity, required roles, required Backgrounds and actual reference checks. Missing optional Floor/Dodge references warn; every authored animation definition itself must be ready to publish. Known image-load failures also invalidate the affected assets until refresh. Search combines useful metadata and usage with category/status/kind filters, and includes synthetic unresolved-reference rows. Usages include direct frame references, unit roles through their animation and existing runtime manifest uses; inferred names never create usage.

Runtime foundation lookups return requested animation → Idle → placeholder, optional procedural Dodge, generic Background, no missing Floor, and clipped-shine/ordinary-impact identities according to semantic context. `SceneAssetImages` lazily loads valid local PNGs independently of the core manifest, fingerprints URLs and records missing/mismatched files without rejecting startup. These are Stage-1 consumers/contracts and preview support; combat integration is deferred. The catalog is a snapshot: after changing PNGs, rerun the updater and refresh before validating/publishing. The browser cannot inspect an unrefreshed project directory, and catalog validation is not a substitute for shipping the actual PNGs.

## Persistence and compatibility

Working copy `shining-farce.editor.v1`, EditorDocument v1, portable wrapper v1, shipping-page envelope v1, controls v1 and campaign save schema **8** remain unchanged. Only the optional presentation subdocument introduces independently versioned content. Full backups and Campaign Map exports carry it; Battle-Map-only imports preserve the existing global presentation document. Imported missing artwork is retained and shown in import diagnostics/readiness/Broken filters. Inert shipping JSON carries definitions/associations and no PNG bytes or derived catalog.

Publication still performs strict map/campaign readiness plus presentation readiness. Startup still checks structural/map/campaign readiness, but tolerates missing presentation assets so a published project whose art was subsequently removed can launch and recover in DevMode. This narrowly skips art readiness during registry assembly, not map/structural validation. Re-publication remains blocked until required references are repaired. Legacy internal JS helpers also use readiness; the normal publisher still emits **no `.js` files**. No security policy or origin mark was changed.

## Changed-file inventory

No files were deleted.

- `Update Asset Catalog.bat`; `tools/update-asset-catalog.cjs`: Windows entry point and derived scanner/PNG validator.
- `js/data/assetCatalog.js`; `assets/battle-scene/catalog-report.txt`: generated catalog/report (31 valid existing files, no production sequences yet).
- Four `assets/battle-scene/{units,backgrounds,floors,effects}/README.md` files: retained empty production directories/instructions.
- `js/editor/BattleSceneAssets.js`: schema, readiness, catalog/reference queries, explicit sequence creation and fallback lookup contracts.
- `js/rendering/SceneAnimationPlayer.js`: per-frame preview clock and tolerant lazy PNG cache.
- `js/editor/AssetBrowser.js`: browser, preview, animation/frame editor, unit and global terrain properties/selectors.
- `js/editor/EditorDocument.js`: optional shape validation, shared ID collision checks, legacy helper readiness.
- `js/editor/AuthoredFiles.js`, `AuthoredRegistry.js`: strict publish versus resilient art startup.
- `js/editor/DeveloperShell.js`, `MapEditorState.js`: menu/context integration and recoverable import diagnostics.
- `index.html`: five new local classic scripts; existing authored JSON preserved.
- `js/debug/BattleSceneAssetTests.js`, `FoundationTests.js`: 37 additional deterministic checks and test fixtures.
- `tools/test-asset-catalog.cjs`: 29 real-PNG decoder/catalog checks, including simulated duplicate-directory entries for cross-platform collision coverage.
- `tools/verify-scene-assets.cjs`: offline real-PNG/Canvas UI, persistence/shipping and load-failure integration.
- Canonical specification, architecture, recovery ledger, root/assets READMEs and this report: accepted design, provenance and usage.

## Verification and manual acceptance

Baseline **863/863**; final **900/900** foundation checks, plus **29/29** catalog checks. Existing offline structure, authored-content compatibility, shipping-page, developer-rendering and full rendering verifiers passed. The full render suite also passed all 900 rules, existing campaign/class/spell/scene flows, 31 source PNG palette checks and integer scaling checks. Offline structure reports 180 local classic scripts, one stylesheet, no missing resources/network/module dependencies and a 480×360 framebuffer. Shipping verifier runs all 900 checks against generated installed source and finds zero executable-script package entries. Scene UI verifier captures 15 palette-checked frames and exercises search, context selection, frame reorder/timing, preview control, restore, shipping, quarantine and image-error fallback. Representative screenshots were visually inspected. The batch entry point ran successfully via Windows `cmd`, reporting 31 valid files. Source PNG hashes/dimensions remain unchanged.

Physical Explorer double-click, real browser storage/file-picker/download behavior and gamepad hardware were **not** exercised. Available browser tooling does not permit this project's `file://` acceptance path. The following remains a manual acceptance checklist, not a claim of completion:

1. Back up the project; add legal 128×96 Idle/Attack frames to Units.
2. Double-click the updater; confirm its summary/report; open `index.html` normally.
3. Enable DevMode, find/search the new sequence and inspect pixel previews/metadata.
4. Create Idle and Attack definitions; set different frame timings, reorder, toggle looping and final behavior; restart and inspect playback.
5. Create the intended actual faction/race/class presentation and explicitly assign both roles.
6. Save Working Copy; close/reopen and restore it. Verify timing/order/associations remain.
7. Add an invalid PNG and rerun the updater; confirm unrelated valid assets survive and the bad file appears quarantined with reasons.
8. Fix that same file and rerun/refresh; verify the identity is retained. Rename a referenced file and confirm its old usage remains broken until explicitly replaced.
9. Add a 256×96 Background and 96×32 Floor, update/refresh and independently select them for a terrain (also test the map-under-cursor command).
10. Add equal-size effect frames; author offsets/anchor and preview. Introduce a mismatched frame to check readiness/reporting.
11. Export/import a full JSON backup in a copy of the project missing artwork; verify references survive and diagnostics are visible.
12. Repair required references, check readiness and publish a new shipping `index.html`; replace only the launcher in the complete project, reopen and inspect installed definitions. Verify no browser-generated JS installation is needed. Include PNGs/catalog when distributing the full folder.

## Deliberately unimplemented

No production Battle Scene renderer/whip-pan/windows/resource-bar UI, Sequencer, primitive/compound block execution, templates, parallel tracks, role collections, mechanics-derived branching, arbitrary scrub reconstruction, action choreography, Blaze 2/Covering Fire sequence or combat activation was added. Character-clipped shine and procedural Dodge have named semantic foundation contracts, not completed visual choreography. The canonical specification records all newly approved Stage-2/3 direction and remaining tuning/TBDs. Damage, dodge/critical/counter rules, CT, XP/CP, spells, targeting, movement, deployment and campaign progression are unchanged.
