# Windows shipping-package installation correction

Implemented 2026-09-24. This is a persistence/installation correction, not new game design. It supersedes the physical deployment instructions in [Authoring Persistence Implementation](AUTHORING-PERSISTENCE-IMPLEMENTATION.md). Campaign, terrain, deployment, combat, save policy and canonical TBD/§31 mismatches were not redesigned.

## Diagnosis: observed evidence versus inference

The user reported Windows blocking the generated `authored-content.js` and `campaign.js` during ordinary extraction/copy. The original download was still available at `C:\Users\Arron\Desktop\shining-farce-shipping-maps.zip`. Read-only inspection established:

- The ZIP's NTFS `Zone.Identifier` stream contains **`ZoneId=4`** and **`HostUrl=file:///`**.
- The extracted project-root `editor-backup.json`, `map-scripts.html` and `INSTALL.txt` also have `Zone.Identifier` streams. The backup identifies the same ZIP as its referrer and has **`ZoneId=4`**.
- The original ZIP contains five expected files, including the two reported `.js` assets. Independent Python `zipfile` inspection passed every CRC. No files were extracted or executed for this inspection.
- `js/data/authored-content.js` and `js/data/maps/campaign/campaign.js` were missing from the working project at task start, while `index.html` still referenced both. This explains why the current checkout could not run the test loader before repair.

Zone 4 means **Restricted Sites**, not the usual Internet zone 3. Microsoft documents both the zone mapping and Windows' use of origin metadata when assessing attachments. The observation here is more specific than a generic assumption that all downloads are Internet-zone files. [Microsoft zone mapping](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-internetexplorer#allowsitetozoneassignmentlist), [Attachment Manager](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-attachmentmanager).

Microsoft identifies `.js` as an executable script file type subject to product safeguards. Origin information may be attached by downloading applications, and extraction applications may carry the archive's origin into extracted files. The combination of the observed restricted-zone metadata and executable-script extensions is consistent with the reported block. The warning dialog itself was **not reproduced directly** in this session, and the precise reason this browser/environment assigned zone 4 has not been established. [Unsafe file types](https://support.microsoft.com/en-us/servicing/os/windows-server/2018/04/an-overview-of-unsafe-file-types-in-microsoft-products), [Microsoft browser-download origin guidance](https://techcommunity.microsoft.com/blog/microsoftdefenderatpblog/hunting-tip-of-the-month-browser-downloads/220454).

The game's ZIP encoder writes ordinary uncompressed ZIP entries and CRCs. It neither sets nor controls NTFS alternate streams, Attachment Manager policy, Defender or SmartScreen. Changing compression or asking users to pick an extractor that drops origin metadata would not be an appropriate fix. Browser, extractor and policy differences remain platform boundaries; the avoidable architectural mistake was making routine map publication require copying several downloaded executable-script files.

No origin stream was removed or altered, no downloaded script was executed outside the game, no security setting or file association was changed, and no administrator privilege was requested. The original archive and extracted evidence files remain intact.

## Chosen architecture and tradeoffs

The normal publisher now generates a replacement **`index.html`** containing authored data in one **inert `application/json` element**, with separate Campaign Map and individual Battle Map records. It keeps the existing local game-script references. Updating a map requires replacing the launcher, rather than installing generated JavaScript assets or editing a script list.

This is not executable JavaScript renamed to HTML/TXT. The payload is JSON parsed by an installed game service. HTML's script element with a non-JavaScript MIME type is a data block, not executable script. `<`, `>` and `&` are JSON-escaped in the payload so names and extra metadata cannot terminate the element or inject markup. The launcher still executes the game's existing local classic scripts. [HTML data-block specification](https://html.spec.whatwg.org/multipage/scripting.html#data-block).

The optional ZIP groups `index.html`, full/partial JSON backups, a data-only TXT block and instructions. **There are no `.js` entries.** The direct HTML download also avoids archive extraction entirely. No runtime fetch/XHR, directory enumeration, ES module, remote asset, server, build, database or package dependency is introduced.

HTML and ZIP downloads can themselves be subject to warnings or organization policy; this implementation does not promise universal exemption. Therefore a second publishing option exports **`shipping-data.txt`**, containing only the inert data element and its marker comments. The user can paste this whole block into the existing updated launcher's marked data section using Notepad. This deliberately edits data in an existing project, without installing downloaded executable code, renaming executable scripts, stripping origin marks or changing protections. If policy also blocks that operation, the workflow stops rather than recommending an override.

Separate data files loaded using fetch would compromise the existing `file://` target; a dynamic script loader would retain the downloaded-script problem; a filesystem installer would add executable tooling/permissions. The selected change reuses the existing registry, validation and portable representations with one small page-data service. Its tradeoff is that every shipping update republishes the complete launcher/map set. Independent map maintenance still happens through individual JSON exports/imports and editor selection by stable ID.

## Authoritative copies and formats

| Role | Current location / representation |
| --- | --- |
| Shipping Campaign Map | `index.html` → `#shining-farce-shipping-data` → `campaign.document`; all v1 fields except `battleMaps` |
| Shipping Battle Maps | The same inert element → `maps[]`; one complete record per stable map ID |
| Shipping map index | `campaign.battleMapIds`; location-specific references remain ordered lists in `campaign.document.world.locations` |
| Browser working copy | `shining-farce.editor.v1`, EditorDocument **1** |
| Full portable backup | Raw EditorDocument **v1 JSON**, all authored fields/maps/extra metadata |
| Partial portable backups | `SHINING_FARCE_AUTHORED` **1**, kinds `CAMPAIGN`, `BATTLE_MAP`, `BATTLE_MAPS` |
| New shipping envelope | `SHINING_FARCE_SHIPPING_PAGE` **1**, `{format,version,campaign,maps}` |
| Installed code | Existing local classic scripts under `js/`; routine map publication does not replace them |

The embedded campaign record uses the preceding campaign asset wrapper version **1**, retaining `document` and `battleMapIds`. No editor, partial-backup, control-profile or campaign-save schema changed. **Campaign save schema remains 8.** The page envelope is independently versioned because it is a new physical container, not a migration of campaign/editor state.

`ShippingPage.decode` parses and validates into a temporary registry, checks exact map membership, structural validity, readiness and existing starting-campaign initialization. `install` updates the active registry only on success. Duplicate/missing/malformed map data, unsupported versions and mixed nonempty HTML/legacy sources fail visibly. `start` validates the unique data element before game startup; the existing startup error UI reports failure. A `null` element explicitly represents the demo when no legacy source is installed. A missing element does not silently become a demo in an otherwise empty installation.

The publisher captures the launcher DOM before `Game.start` changes live status/styles. It replaces one marker block and removes the old monolithic bootstrap tag during conversion. Reopening a published page supplies a fresh template for later publication. Browser working-copy restore/import remains separate and does not install shipping files.

## Compatibility and recovery of the interrupted installation

All raw v1 and partial JSON imports retain their previous candidate validation, collision confirmation, stale-plan guard, draft/readiness separation and unknown-metadata preservation. No IDs, counters, array ordering, location references, map-selection conditions, approaches, Front/Back pools, terrain/variants, full specials or required points are regenerated or discarded.

Legacy `G.data.AUTHORED_CONTENT` and the preceding split `registerCampaign`/`registerBattle` representations remain supported by `AuthoredRegistry`. A working old installation can export its full JSON and import that backup into this updated project. Previously exported packages already contain `editor-backup.json`, so migration does not require installing blocked `.js` files. A legacy launcher with existing classic registrations can also initialize without the new element; simultaneous active embedded and legacy sources are refused. The legacy generation helpers remain for compatibility/tests but are no longer offered in the publishing UI.

This workspace arrived with the prior implementation uncommitted and a partially failed manual installation. The surviving `editor-backup.json` validated as a ready v1 document with **7 Campaign locations and 0 Battle Maps**. The correction embedded that exact semantic document into the repaired `index.html`. Independent comparison confirmed equality. The original backup was not edited; its restricted-zone origin stream is still present. The missing `.js` files were not recreated/unblocked. Old `map-scripts.html` and extracted `INSTALL.txt` are preserved historical artifacts and are not current runtime inputs/instructions; newly exported packages contain corrected instructions.

## Exact user workflow

### Edit → save working copy → export backup → import backup

1. Double-click `index.html` in the complete updated project. Open Terminal with backtick, enter `devmode`, close Terminal, then press **]**.
2. Use **Edit Campaign Map** / **Edit Locations** / Battle Map tools. Edits affect only the editor draft.
3. **Editor Files / Save Import Export → Save Working Copy In This Browser** saves only browser-local editor state. Use **Load Working Copy From This Browser** to resume it after confirmation.
4. **Export Portable Backup / All Data** downloads JSON. Partial Campaign/individual/collection exports remain available. Incomplete structural drafts are allowed.
5. To restore or transfer, choose **Import Authored Data / JSON Into Editor**, select the JSON, review validation/collision information and confirm. Import changes only the draft; browser save and publication are separate actions.

### Publish/install → reopen game

1. Validate and finish all Battle Maps, including unreferenced maps. Export a full JSON backup.
2. Choose **Export Shipping Index.html**, or **Export Shipping Package / ZIP**. No project files are written by the browser.
3. Back up the project and close the game. If using the ZIP, extract it into a temporary folder. Copy **only the downloaded `index.html`** over the project's launcher, beside the existing `js`, `css` and `assets` folders. Remove any browser-added `(1)` suffix so its name is exactly `index.html`.
4. Reopen the project launcher. This filesystem replacement is the step that changes permanent/default maps. No per-map script tags or generated JS files are copied. Distribute the complete project, not the exported launcher alone.
5. If Windows blocks HTML placement, retain protections and use **Export Shipping Data Block / TXT**: open it in Notepad, copy all text, open the existing **updated** project's `index.html` in Notepad, and replace the complete `BEGIN AUTHORED MAP ASSETS` through `END AUTHORED MAP ASSETS` section. Save and reopen. This alternative installation step edits the project's inert data block. If that is also blocked, stop and report details; do not override the warning.

Do not open the exported launcher in Downloads and expect the game to work there: it references the installed project's relative code/art paths. Keep the complete project together. Re-publish using the current code version after a game update, rather than restoring an old launcher with outdated dependencies.

### Replace, add or remove Battle Maps

- **Replace:** edit the existing stable ID or import its individual JSON and explicitly confirm replacement. Validate, then choose **Publish Map Changes / Index.html**. Replace the one launcher file (or its data block). References continue using the same ID.
- **Add:** create a new map from location properties or import JSON, attach it with **Associate / Remove Existing Map References**, finish authoring and publish a fresh launcher. Its map index is rebuilt automatically; no separate manifest changes.
- **Remove:** detach every location reference, then choose **Delete Unreferenced Battle Map** in its file menu and confirm. Referenced deletion fails atomically. Republish to remove it from shipping content. Other IDs/references remain intact.

The small deletion operation completes the requested removal workflow; it changes no gameplay or reference-selection rules. Deletion affects only the draft until saved/published.

## Files changed by this correction

The working tree already contained the entire prior implementation and missing files from the interrupted install. The following inventory is relative to that starting state, not merely `git diff HEAD`.

| File | Purpose |
| --- | --- |
| `js/editor/ShippingPage.js` | **Added:** inert envelope, atomic decode/install, original-page capture, HTML/TXT/package publishing |
| `js/debug/ShippingPageTests.js` | **Added:** 26 deterministic correction checks |
| `tools/verify-shipping-page.cjs` | **Added:** generated-page/DOM-fixture integration and installed-source regression verification |
| `docs/WINDOWS-SHIPPING-CORRECTION.md` | **Added:** this report and manual test procedure |
| `index.html` | Load service/tests, remove missing JS asset references, embed recovered authored data |
| `js/main.js` | Parse/capture shipping page before game startup, inside startup error boundary |
| `js/editor/DeveloperShell.js` | HTML/ZIP/TXT publishing UI, correct placement messages, remove routine JS exports, confirmed unreferenced-map deletion |
| `js/editor/EditorDocument.js` | Validated atomic deletion of an unreferenced map |
| `js/debug/FoundationTests.js` | Aggregate new cases; isolate/restore installed registry, visuals and runtime around disposable regression checks |
| `tools/test-foundation.cjs` | Explicit demo registry initialization in the offline harness |
| `tools/verify-rendering.cjs` | Initialize the data service/captured launcher in its offline DOM fixture |
| `tools/verify-authored-content.cjs` | Retain all legacy/split generated-asset assertions after retiring their index tags; inject those compatibility assets explicitly |
| `tools/verify-developer-ui.cjs` | Verify HTML and TXT download callbacks/content as well as ZIP and existing controls |
| `README.md` | Current non-programmer workflow and verification boundary |
| `docs/ARCHITECTURE.md` | Current authoritative locations, representation, loading, validation and compatibility |
| `docs/AUTHORING-PERSISTENCE-IMPLEMENTATION.md` | Add a supersession notice; retain historical implementation/report |
| `CANONICAL-DESIGN-SPECIFICATION.md` | Update only §29 implementation-status wording |
| `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md` | Append correction provenance; preserve previous implementation history |
| `js/data/maps/battle/README.md` | Mark the split directory as legacy and explain migration |

**4 added, 15 modified, none deleted by this correction.** The preexisting missing/deleted legacy files remain missing; the corrected launcher no longer references them. `AuthoredFiles.js`, `AuthoredRegistry.js`, `EditorFiles.js`, current campaign schema/configuration and all gameplay systems were retained. Original downloaded artifacts were not modified.

## Tests and results

### Baseline

The literal starting checkout could not load its tests because the two shipping JS files were missing (`ENOENT` on `authored-content.js` first). This discrepancy predates correction edits. A disposable VM supplied the preceding null/demo stubs **in memory only**, allowing a controlled baseline: **837/837 passing, 0 failed, 0 skipped**. No filesystem/security repair was used to manufacture that baseline.

### Automated deterministic verification

**863/863 passing, 0 failed, 0 skipped**: all previous 837 plus **26 new checks**. No existing assertion was weakened or replaced. The old split-format tests remain compatibility tests; their optional verifier now inserts the legacy files into its VM at the service-loading point instead of relying on retired production tags. The renderer/test harness explicitly supplies its disposable demo/template state. Rule checks also pass after a nonempty shipping page is installed, and the installed source is restored afterward.

New checks cover complete Campaign/multiple-Battle-Map round trips; all existing map metadata; escaping of hostile-looking strings and HTML terminators; absence of JS package assets; repeat publication; old portable imports; malformed JSON and unsupported formats/versions; duplicate/missing maps, fields and references; readiness; absent/duplicate/executable data elements; mixed-source rejection; legacy monolithic and immediately preceding split migration; normal game/static battle initialization with a full special unit; same-ID replacement; referenced-deletion safety and detach/delete publication.

### Simulated/generated-file verification

- `verify-shipping-page.cjs` exported a two-map package, loaded its generated launcher in a fresh classic-script VM/DOM fixture, compared the entire assembled document, reran all 863 checks and verified that installed data remained unchanged. All packaged portable JSON imported successfully.
- Independent Python standard-library `zipfile` verified every generated filename/content and CRC; no `.js` entries exist. Python `HTMLParser` saw exactly one inert JSON element and only the expected local external game scripts; parsed metadata equaled the full fixture, including Unicode, `</script>` text and `__proto__` keys.
- The same independent parser verified that the repaired project's embedded data exactly equals the original user backup.
- Existing legacy/split generated-file verification passed, including registration order, missing-file rejection, normal game and static Battle Map preparation.
- Offline structure verification: **175 local classic scripts**, **1 local stylesheet**, no missing resources, remote dependencies, runtime fetch/XHR, modules or syntax errors. No server/build/bundle/package requirement was added.
- Canvas2D developer UI verification passed existing controls/authoring plus the new publication paths. The installation instruction capture was visually inspected; UI download callbacks are simulated, not real native downloads.

Developer-only reproduction commands:

```text
node tools/test-foundation.cjs
node tools/verify-offline-structure.cjs
node tools/verify-authored-content.cjs
node tools/verify-shipping-page.cjs
node tools/verify-rendering.cjs <existing-@napi-rs/canvas-path> --developer-only --output=<temporary-directory>
```

### Actual browser verification

**Not completed.** The only available browser surface was the Codex in-app browser. Opening the local `file://` project was rejected by its URL security policy. No indirect URL, alternate browser surface, raw browser command, local server or other workaround was used to evade that restriction. The actual page-launch/download behavior is therefore not a reported pass.

### Actual Windows filesystem / Attachment Manager verification

**Read-only evidence inspection completed; the interactive workflow was not reproduced.** The original ZIP and extracted files' origin streams and archive integrity were inspected on Windows. Native Explorer controls were unavailable. No actual browser-download → Explorer extraction → replacement test was performed for the corrected artifact. VM, parser, archive-reader and shell-file checks do not establish that a particular Windows policy permits placement.

## Short manual Windows acceptance test

1. Keep security enabled and work on a backup of the updated whole project. Double-click its `index.html`; confirm the recovered map appears.
2. Enable DevMode, change a recognizable location/map display name, save the browser working copy, export JSON, reimport it and confirm. Verify that browser save/import alone does not change the normal runtime after reopening the game.
3. Reopen the saved draft, export **Shipping Index.html**, and use ordinary Explorer to replace only the backed-up project's launcher. Reopen offline and verify the authored name. Record browser/version and whether any Windows warning occurred.
4. Repeat through the optional ZIP, using Explorer's normal extraction. Confirm its entries are HTML/JSON/TXT and no generated `.js` file requires placement.
5. If HTML placement is blocked, do not override it. Use the TXT data-block editing steps above with the existing launcher and reopen. Record whether this path succeeds; if it is also blocked, report the exact message and stop.
6. Replace a Battle Map by the same ID, then separately add and detach/delete a map. Validate, publish and reopen each time. Check references/selection and that the removed map is absent.

This manual result is the outstanding evidence needed to confirm the installation experience on the affected Windows system. The code correction minimizes downloaded executable content and provides a data-only route; it does **not** claim to disable or universally defeat Windows warnings.

## Remaining limitations

The full project still contains executable game scripts and can itself be subject to origin/policy checks when distributed; no software can promise unrestricted handling in every managed environment. Map publication now avoids generated executable assets, but one HTML replacement (or an explicit data-block edit) remains necessary. No silent filesystem installation or File System Access API was added. Download completion and final placement cannot be confirmed by the game.

Publishing includes the complete ready collection and uses browser memory; the optional ZIP remains uncompressed/ZIP32. An individual map's JSON is portable authoring data, not an independently auto-loaded runtime file. ZIP/HTML/TXT are not accepted as editor imports—use the JSON backups. Startup still depends on the existing local game files and existing gameplay providers, and changed authored worlds do not migrate campaign saves.
