# DevMode / Map-Authoring Persistence and Shipping Content

> **Superseded installation workflow:** Windows manual testing blocked the downloaded JavaScript assets. The [Windows Shipping Correction](WINDOWS-SHIPPING-CORRECTION.md) replaces routine split-JS installation with an HTML launcher containing inert JSON and a data-only TXT option. This report and its 837-test results remain the historical record of the preceding implementation; use the README/correction report for current instructions. Existing v1 data remains compatible.

Implemented 2026-09-24. This report records implementation, not new game-design authority. The Canonical Design Specification governs design intent; repository code governs current behavior. No §31 gameplay mismatch or TBD was resolved.

## A. Repository baseline inspected

The working tree was clean at baseline commit `b6808fb`. Before implementation, `node tools/test-foundation.cjs` returned **778/778 passing, 0 failed, 0 skipped**, matching the requested baseline.

Inspection covered:

- `index.html`, `js/main.js`, `js/core/Game.js`: classic-script dependencies, startup error reporting, reset and authored ingestion.
- `js/data/authored-content.js`, `js/data/world.js`, `js/data/worldVisuals.js`: null shipping override, strategic graph and decorative campaign tiles.
- `js/editor/EditorDocument.js`, `EditorFiles.js`, `AuthoredContent.js`, `DeveloperShell.js`, `MapEditorState.js`, `PropertyScreen.js`: frozen drafts, transactions, persistence, file picker/downloads, location references, file menus and UI error handling.
- `js/editor/MapAuthoring.js`, `BattleMapAuthoring.js`, `LocationModel.js`, `js/systems/BattleTerrainSystem.js`, `BattleInitializationSystem.js`, `DeploymentSystem.js`: structural/readiness separation, terrain/variant eligibility, conditions, complete specials, static selection and deployment providers.
- `js/core/LocalStore.js`, `js/core/Input.js`, `js/campaign/Validation.js`, `js/config/campaignConfig.js`: storage keys, defensive validation, independent versions and campaign schema.
- `js/debug/DeveloperToolsTests.js`, `DeploymentOceanTests.js`, `FoundationTests.js`, `tools/test-foundation.cjs`, `verify-offline-structure.cjs`, `verify-rendering.cjs`, `verify-developer-ui.cjs`: regression fixtures and offline verification infrastructure.
- README, `docs/ARCHITECTURE.md`, canonical specification §§28–29 and the Recovery Ledger persistence/provenance entries. Searches traced authored-content APIs, `battleMaps`, IDs/references, import/export/shipping and version/key usages.

Before this change, EditorDocument v1 held `{version, world, visuals, battleMaps, nextId, entities}`. Maps were keyed by stable ID; locations held ordered lists of those IDs. Editor commands validated cloned candidates, then froze the new draft. Browser persistence used `shining-farce.editor.v1`. Raw JSON backup/import preserved the whole draft, including structurally valid incomplete maps. Browser/control data were separate from campaign serialization.

Shipping export generated a single classic script assigning the entire document to `G.data.AUTHORED_CONTENT`. The user manually replaced `js/data/authored-content.js`; `Game.resetCurrent` created a campaign and supplied those maps to static battle initialization. A null placeholder kept the demo. No normal runtime fetch, module loader, build, server or package installation existed.

There was no baseline-count discrepancy. The documentation's broad workflow description was accurate, but inspection exposed finer distinctions: the legacy shipping exporter checked Battle Map readiness without validating full starting-campaign initialization, while startup validated document structure without rechecking every map's shipping readiness. The new shipping path and assembly validate both before use. Existing JSON output depended on object insertion order; new portable exports canonicalize object keys. These are persistence/readiness improvements, not changes to terrain, deployment or encounter rules.

## B. Architecture chosen

One Campaign Map classic script and one classic script per Battle Map register into `G.data.AUTHORED_MAPS`. A small registry assembles the original EditorDocument shape for existing consumers. `index.html` explicitly lists the files in a marked block. This extends the existing namespace/script architecture without requiring dynamic file discovery, fetch, ES modules or tooling before play.

The Campaign Map asset contains `{version:1, document, battleMapIds}`: all original document fields except the map dictionary, plus the complete list of shipping map IDs. Each Battle Map asset contains its complete original definition. Campaign location references remain separate ordered lists; conditions and map-selection behavior are unchanged. Additional JSON metadata is retained rather than filtered to a reduced field list.

The registry rejects duplicate campaign/map registration, retains registration failures for startup reporting, detects missing/unlisted maps against the campaign index, validates the assembled document and enforces readiness. Asset registration order within the static asset stage is immaterial. The demo placeholder explicitly marks the campaign script as loaded, allowing startup to distinguish an intentional demo from a missing campaign script.

`Game.resetCurrent` stores the assembled source as `game.authoredContent`, then uses existing campaign compilation, visuals and static-map providers. The editor begins from that source. Browser drafts are never automatically installed. A failed/missing shipping set reports an error rather than quietly loading the demo. The existing `main.js` startup status handles these errors.

`js/data/authored-content.js` remains the legacy compatibility input. Valid monolithic content still works when split content is absent. Installing the generated full package sets the legacy value to `null`; simultaneously active legacy and split content is rejected. The checked-in assets continue to use the existing demo, with no production map catalog invented.

New shipping output quotes the JSON payload and passes it through `JSON.parse` in the generated script before registration. This preserves arbitrary JSON keys and text without turning them into JavaScript syntax, including metadata named `__proto__`. Import is exclusively JSON parsing/validation; it never evaluates a selected file. The old `EditorDocument.json()` and `shipping()` helpers remain available for compatibility; the editor UI now favors deterministic portable exports and split assets.

The full export is a single deterministic ZIP containing separate assets, installation instructions and a short script-list snippet. Its small uncompressed ZIP32 writer uses fixed timestamps, UTF-8 and CRC32; it needs no runtime library. Ordinary files can be installed with File Explorer and a text editor. A database/package system, dynamic directory scanning and optional filesystem permissions were unnecessary.

## C. Authoritative authored-map locations

| Copy / role | Authoritative location or format |
| --- | --- |
| Shipping Campaign Map | **`js/data/maps/campaign/campaign.js`**, registered campaign fields plus map index |
| Shipping Battle Maps | **`js/data/maps/battle/battle-<encoded-id>.js`**, one full definition per registered ID |
| Shipping inclusion list | **`index.html`**, `BEGIN AUTHORED MAP ASSETS` through `END AUTHORED MAP ASSETS` |
| Legacy shipping source | **`js/data/authored-content.js`**, only when no split campaign/maps are active |
| Browser working copy | **`shining-farce.editor.v1`**, EditorDocument version **1** |
| Full portable backup | Raw EditorDocument **v1 JSON**, including every map and additional serialized metadata |
| Partial portable files | **`SHINING_FARCE_AUTHORED` version 1**, kinds `CAMPAIGN`, `BATTLE_MAP`, `BATTLE_MAPS` |
| Shipping asset format | Local classic JavaScript calling `AUTHORED_MAPS.registerCampaign` / `registerBattle`; campaign asset wrapper version **1** |

`AuthoredFiles.battlePath` escapes uppercase ASCII and underscores, producing different filenames even for IDs that differ only by case on Windows. Use the exact generated path/filename; the map's internal ID is not renamed. Files merely sitting in the Battle Map directory are not loaded unless listed in `index.html`.

## D. Workflow

### Create or edit a Campaign Map

1. Open `index.html`, open Terminal with backtick, enter `devmode`, close Terminal, then press **]**.
2. **Editor Files / Save Import Export** provides source selection: use the initial shipping/demo draft, explicitly load the browser working copy, or import portable JSON. **Reload Installed Content Into Editor** discards the current draft after confirmation and restores the source loaded by this page (demo defaults when no override exists). Reopen the page to load disk changes.
3. **Edit Campaign Map** authors terrain; **Edit Locations** authors the strategic graph, properties, connections and Battle Map references. The current game has no separate blank-world/start-entity authoring system: create a new world by reshaping the existing source while retaining the required starting locations. That existing boundary was preserved.
4. Save the browser working copy and export portable backups as needed. To make the result the normal-game default, validate and install the shipping package below, then reopen `index.html`.

### Create additional Battle Maps and maintain references

1. Open a location's properties, then **Battle Maps → Create New Battle Map**. Set dimensions and applicability; the editor creates a stable ID and associates it with the location. Repeat for any additional map.
2. Author cells/variants, approaches, Front/Back pools, full specials and conditions. **Validate Battle Map** uses existing readiness rules. Draft saves/backups remain available before readiness.
3. **Associate / Remove Existing Map References** attaches an existing/imported ID or detaches it without deleting its definition. It does not alter map-selection conditions.
4. **Editor Files → Battle Map Files / Edit / Export** lists all maps, including imported/unreferenced maps, for editing and individual JSON/JS export.
5. Install the full package for new map IDs so the map files, Campaign Map index and static script list agree. Reload and test. Full battle launch still needs the existing orientation/story/designation providers where applicable; this task does not create those production rules.

### Replace an existing Battle Map

Edit its existing ID, validate, then choose **Export Shipping Battle Map / JS** in its file menu. Place the file at the exact displayed Battle Map path, replacing the old file; remove browser-added duplicate-download suffixes. Keep the ID and existing script tag. Locations continue referencing the same ID. If IDs were added/removed, or if converting a legacy monolith, install the whole package instead. Campaign-only replacement with unchanged map IDs is available through **Export Shipping Campaign.js / Replacement**.

### Browser working copies and portable data

**Save Working Copy In This Browser** updates only the editor key and reports that project files are unchanged. **Load Working Copy From This Browser** validates before replacement and requires confirmation. Failed storage access preserves the active draft; a failed save leaves it dirty. Storage may vary across browser/folder changes, so it is not the only backup.

**Export Portable Backup / All Data** downloads the full v1 draft. **Export Campaign Map / JSON + Referenced Maps** includes all campaign fields and referenced map dependencies. **Export Battle Map Collection / JSON** includes all maps; the map-file menu exports one. These JSON exports retain incomplete structural drafts.

**Import Authored Data / JSON Into Editor** parses and validates before showing a confirmation. Full backup import replaces the whole document. Campaign import replaces campaign fields and merges its included dependencies, retaining destination maps not included. Individual/collection imports merge maps without changing campaign location references. Existing IDs are listed for explicit replacement; cancellation and validation failures preserve the draft. A pending import cannot overwrite intervening edits. JavaScript files and unsupported/malformed versions are rejected. Import does not save the browser working copy or install shipping content automatically.

### Install the shipping package

1. Export a portable backup. Finish every map, including unreferenced drafts. Choose **Export Shipping Package / ZIP**. The exporter checks the entire set before requesting any download.
2. Close the game and back up the project folder. Extract the ZIP into the project root, beside `index.html`, preserving directories and replacing matching files.
3. In a text editor, replace only the marked authored-assets block of `index.html` with the complete block from `map-scripts.html`. Keep all other scripts; no large data-object editing is required.
4. Follow `INSTALL.txt`, then reopen `index.html`. The package also disables the old monolithic assignment so sources cannot conflict. Old unlisted files are ignored.
5. Distribute the entire project folder, including all indexed assets and existing art/scripts. Campaign-save data is not rewritten or auto-migrated.

The package contains `js/data/maps/campaign/campaign.js`, one Battle Map file per ID, `js/data/authored-content.js` (null bootstrap), `editor-backup.json`, `map-scripts.html`, and `INSTALL.txt`. A two-map package has seven files. Download messages accurately say **Download Requested**: the browser has not installed anything or verified the user's final placement.

## E. Compatibility and versions

| Contract | Before | After / migration |
| --- | --- | --- |
| EditorDocument | v1 | **v1**, unchanged semantic shape; no migration needed |
| Browser editor key | `shining-farce.editor.v1` | Same key and payload; explicit restore accepts existing valid records |
| Full JSON backup | Raw v1 | Raw v1 remains accepted/exported; new portable output sorts object keys, retains array order |
| Legacy monolithic shipping | `AUTHORED_CONTENT` document or null | Supported alone, validated at assembly; export/install full ZIP to convert |
| Partial JSON | Not available | New independent wrapper version 1; duplicate IDs detectable in map arrays |
| Split campaign asset | Not available | Independent wrapper version 1, containing the v1 document minus `battleMaps` plus its index |
| IDs/references | Stable strings / location lists | No regeneration or migration; replacement retains IDs and reference order |
| Controls | v1, separate key | Unchanged |
| Campaign save schema | **8** | **8**, unchanged; file organization did not alter campaign serialization |

No existing saved campaign is implicitly migrated to a different authored world. The world-change/save policy, player Save/Load/Continue, battle-end reconciliation and all gameplay formulas remain outside this task. Legacy maps that are structurally valid but not actually ready can still be imported as JSON drafts; shipping assembly now rejects them conservatively.

## F. Files changed

| File | Change / purpose |
| --- | --- |
| `index.html` | Load authored services/registry, marked static assets block, new test suite |
| `js/editor/AuthoredFiles.js` | **Added:** stable JSON, partial formats, validated import candidates, readiness, paths, split assets/package contents |
| `js/editor/AuthoredRegistry.js` | **Added:** guarded registration, legacy compatibility and complete assembly |
| `js/data/maps/campaign/campaign.js` | **Added:** explicit demo placeholder and replacement destination |
| `js/data/maps/battle/README.md` | **Added:** asset placement/static loading guidance |
| `js/data/authored-content.js` | Clarify legacy compatibility/bootstrap role; default remains null |
| `js/core/Game.js` | Ingest complete registry/legacy source and retain it for editor/runtime providers |
| `js/editor/EditorDocument.js` | Atomic prepared imports/collision guard, portable/shipping APIs, explicit document/dictionary validation, restore error visibility |
| `js/editor/EditorFiles.js` | Cancellation callback/testable picker and deterministic uncompressed ZIP export |
| `js/editor/DeveloperShell.js` | Browser/source/portable/shipping terminology and workflows; per-map files, collision confirmation, wrapped messages |
| `js/editor/MapEditorState.js` | Existing-map association management; safe return when imported data removed/resized an open map |
| `js/debug/AuthoringPersistenceTests.js` | **Added:** 59 deterministic cases and a representative complete multi-map fixture |
| `js/debug/FoundationTests.js` | Include new suite; preexisting expectations unchanged |
| `tools/verify-authored-content.cjs` | **Added:** generated assets in fresh offline contexts, normal game/static battle initialization, manifest/source checks and asynchronous file-read/cancel checks |
| `tools/verify-developer-ui.cjs` | Exercise/render new file menus, collision cancellation and shipping download messaging |
| `tools/verify-rendering.cjs` | Optional `--output=` capture directory; keeps generated QA artifacts outside maintained screenshots |
| `README.md` | Non-programmer editing, backup, import and installation workflows; current test count |
| `docs/ARCHITECTURE.md` | Current sources, formats, validation, versions, loading and limitations |
| `CANONICAL-DESIGN-SPECIFICATION.md` | Only §29 implementation-status wording for the superseding shipping workflow |
| `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md` | Append dated implementation provenance; preserve original Prompt #8/R32-06 history |
| `docs/AUTHORING-PERSISTENCE-IMPLEMENTATION.md` | **Added:** this report |

Total: **21 files**, 7 added and 14 modified; none deleted. No assets, campaign rules/configuration, terrain, deployment or combat implementation were changed. QA screenshots and generated fixture archives are temporary artifacts, not new shipping maps. No new handoff document was invented.

## G. Tests and verification

- **Baseline:** 778/778 passing, 0 failed, 0 skipped.
- **Added:** 59 deterministic cases.
- **Final deterministic suite:** **837/837 passing, 0 failed, 0 skipped**. All 778 preexisting checks remain; no existing expectations were weakened.
- Cases cover raw v1 and legacy browser compatibility; full/campaign/individual/collection round trips; all map fields/full specials/extra metadata; multiple conditional-map references; retained IDs/counters; canonical ordering; collision confirmation; stale plans; invalid JSON/versions/fields/references/terrain/variants/campaigns; duplicate IDs; storage isolation/failure; draft versus shipping readiness; registration order/missing/extra/duplicate/malformed assets; legacy ingestion and conflicting sources; normal game/editor initialization; filename collisions; ZIP determinism/path safety; cancellation and visible UI failures.
- **Generated-file integration:** execute actual exported JS in fresh Node VM contexts using the shipped classic load sequence, with both Battle Map orders. Complete data survives, including quoted/Unicode text and own `__proto__` metadata. The game initializes from those assets and static battle preparation reaches `READY` with the existing fixture providers, including a full special unit. Legacy generated input also initializes. Missing shipping scripts fail as intended. Script-list output matches generated paths.
- **Independent ZIP verification:** Python standard-library `zipfile` opened the 138,229-byte two-map fixture archive; all seven filenames and decoded contents matched the expected exports, every CRC passed, Unicode survived, and timestamps were fixed at 1980-01-01. No archive library was added to the game.
- **Offline structure:** 175 local classic scripts and one local stylesheet; zero missing resources, remote dependencies, runtime fetch/XHR, module requirements or syntax errors. The new verifier additionally checks runtime sources for dynamic-code/network patterns. No required server, build, bundle or package dependency was introduced.
- **Offline UI:** optional Canvas2D developer verifier passed logical-input navigation and rendering, existing authoring/deployment controls, storage failure, new map-file menus, collision cancellation and shipping ZIP messaging. Captures used a temporary output directory. The file menu, collision confirmation and shipping instructions captures were visually inspected at the existing 480×360 framebuffer (integer enlarged image). Existing palette verification remained in the renderer check.
- **Manual checks actually performed:** source/diff/documentation review and visual inspection of offline captures. **No physical-browser double-click launch, native download/file-picker interaction, browser storage persistence across restarts, or real controller hardware test was performed.** These remain manual verification items, not reported passes.

Reproduction (developer-only tools, not required to play):

```text
node tools/test-foundation.cjs
node tools/verify-offline-structure.cjs
node tools/verify-authored-content.cjs
node tools/verify-rendering.cjs <existing-@napi-rs/canvas-path> --developer-only --output=<temporary-output-directory>
```

The authored-content verifier prints its temporary artifact directory containing `shipping-maps.zip` and `expected-files.json`, enabling independent archive inspection. File read errors and cancellation are exercised through deterministic DOM/File callback fixtures, not a physical browser.

## H. Remaining limitations

Installation still requires manually extracting/moving downloaded assets and replacing the short `index.html` script block when the map set changes. Browsers cannot enumerate project directories or silently rewrite project files under this workflow. There is no optional File System Access API integration or permission prompt to test.

Local storage is browser/folder dependent. Portable JSON is the transferable draft backup; the generated JS/ZIP is for installation, and ZIP/JS imports are not supported. Keep JSON backups alongside deployed content. Download completion and final filesystem placement cannot be confirmed by the game. ZIP output is uncompressed and assembled in memory; very large projects remain subject to browser memory and ZIP32 limits.

The full shipping package includes and validates every stored Battle Map, including maps with no current location reference. Campaign-only portable exports include only referenced dependencies; other maps should be kept via full backup or collection export. There is no new Battle Map deletion/renaming-ID system. Remove a location association with the reference toggles; editing a map's display name keeps its stable ID.

No production Battle Map catalog, general event scripting, new map-selection conditions or missing gameplay providers were added. Normal-game battle integration retains its existing orientation/story/designation and unresolved-rule boundaries. The no-override demo remains the checked-in default. Gameplay and campaign-save policy remain unchanged.
