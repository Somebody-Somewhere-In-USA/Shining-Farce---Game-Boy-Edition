# Shining Farce — Prompt #8 Implementation Report

Implemented 18 September 2026. Runtime: classic local JavaScript, `window.GBTRPG`, external local PNGs, **480×360**. No server, install, build step, npm package or runtime fetch/XHR is required to play.

## Result and verification

The game now includes a Terminal, effective runtime cheats, a separate contextual developer layer, keyboard/controller remapping, Campaign Map and Location editors, static Battle Map authoring, deployment/special-unit tools, validation, normal-renderer preview, and an explicit editor persistence/export workflow.

| Check | Total | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: | ---: |
| Deterministic rule tests | 736 | 736 | 0 | 0 |
| New Prompt #8 rule tests | 118 | 118 | 0 | 0 |
| Previously established checks | 618 | 618 | 0 | 0 |
| Shipping PNGs under assets | 31 | 31 | 0 | 0 |
| Runtime PNG manifest entries | 22 | 22 | 0 | 0 |
| Runtime source files scanned for palette literals | 162 | 162 | 0 | 0 |
| Classic scripts: local reference and syntax check | 170 | 170 | 0 | 0 |

All **20,284 opaque asset pixels** checked use one of the four authorized colors. There are **0 forbidden-color pixels** and **0 partially transparent visible asset pixels**. Fully transparent pixels are permitted. Every offline framebuffer capture is also checked against a fixed, independent four-color allowlist. The renderer retains 480×360 coordinates and its existing integer enlargement checks.

The complete offline rendering exercise passed, covering prior campaign, economy, class, spell, route and battle flows plus the new developer/editor/control screens. Representative images were visually inspected for layout, cursor distinction, property focus, deployment markers and conflict prompts. Images in `verification/` are **Canvas2D renders, not browser screenshots**.

**Direct `file://` double-click browser launch was not verified.** An earlier browser attempt was rejected by URL policy; no alternate-server workaround was used to claim direct-file success. Real Xbox/XInput hardware, browser Gamepad API permission/exposure, download dialogs and browser-specific file storage behavior still need the manual checks below. Simulated Gamepad objects and local storage success/failure are covered deterministically.

Evidence:

- `verification/rule-checks.txt`: exact named test results.
- `verification/results.json`: combined renderer, rule and palette results.
- `verification/render-log.txt`: complete offline rendering result.
- `verification/palette-results.json`: standalone exhaustive asset scan.
- `verification/offline-structure.json`: local classic-script and syntax checks.
- `verification/editor-*.png`, `developer-*.png`, `options-*.png`: new editor/interface captures.

Optional developer verification commands (not required to play):

```text
node tools/test-foundation.cjs
node tools/verify-palette.cjs PATH_TO_EXISTING_CANVAS_PACKAGE
node tools/verify-rendering.cjs PATH_TO_EXISTING_CANVAS_PACKAGE
node tools/verify-offline-structure.cjs
```

The rendering/palette tools use an already available `@napi-rs/canvas` package. They are not loaded by the game. `verify-rendering.cjs ... --developer-only` runs the focused developer interface exercise.

## Four-color migration

Authoritative colors are **#9BBC0F, #8BAC0F, #306230, #0F380F**. The old fifth color, #CADC9F, is removed from runtime constants and shipping PNG pixels. `PALETTE.background` now aliases `lightest`; retaining five property names does not introduce a fifth color.

Existing palette-driven font, window, cursor, map, strategic unit and Portal PNGs were regenerated from their existing code authoring utilities. Historical unused PNGs under `assets/` were included in the scan and migration. Original tactical grass/wall/hero assets already conform. `assets/world/ocean16.png` is a new native 16px Ocean tile drawn by the existing resource-art generator. Its graphic is not a new gameplay movement rule.

The palette validator uses the four literal authorized values rather than trusting whatever a modified palette config contains. It compares distinct palette values, scans runtime color literals and exhaustively reads every PNG under assets. It catches forbidden colors even in PNGs absent from the manifest. Terminal, property screens, editor overlays and scene fades use the same palette. No gradients, partial-alpha fades or extra dithering colors were introduced.

`worldVisuals.js` remains the original 64×40 campaign tile layout at tile size 16; the historical strategic generator now preserves the current tile-size contract. Map authoring changes grid dimensions/data, never graphical scaling.

## Input, Gamepad support and Options

`Input` remains the logical-action boundary. Existing actions are preserved: up/down/left/right, confirm, cancel, menu, start and select. New actions are terminal and devmenu; `accept` is a supported alias for confirm. Gameplay/editor code consumes actions rather than physical controller input.

Keyboard and Gamepad API inputs feed the same queue simultaneously. Standard mapped controllers normalize object/numeric button values. D-pad and the left analog stick navigate; the stick dead zone is **0.55**. Directional repeat starts after 350 ms and repeats at 110 ms. Confirmation/menu buttons are edge-triggered. Disconnect/release clears held state; duplicate stick/D-pad directions in one poll are coalesced. These are input usability timings, not game balance values.

Defaults:

| Logical action | Keyboard | Standard Xbox/browser button |
| --- | --- | --- |
| Directions | Arrows / WASD | D-pad 12–15, left stick |
| Accept / confirm | Enter / Space / Z | A, index 0 |
| Cancel | Escape / Backspace / X | B, index 1 |
| Menu | Tab / M | RT, index 7 |
| Start | P | Menu, index 9 |
| Select | Q | LB, index 4 |
| Terminal | Backtick / Backquote | View, index 8 |
| Dev Menu | ] / BracketRight | RB, index 5 |

Options is in the ordinary Campaign Menu. Keyboard and controller buttons are remapped independently. Capture detects conflicts without mutation; an explicit reassignment prompt is required. When a last binding would be displaced, the previous target binding is swapped in to keep required controls usable. Invalid profiles/assignments are rejected; invalid saved profiles use defaults. Restore Defaults resets both devices. Assignments remain active if a storage write fails, with visible “not saved” feedback.

Control profile **version 1** is stored at `shining-farce.controls.v1`. It is independent of campaign state and editor storage. Physical Escape cancels key/button capture. Typed commands/property names continue to use the keyboard, Enter, Backspace and Escape; no on-screen keyboard was added. Some older gameplay hints still display default key names after remapping. Nonstandard vendor-specific controllers are not guessed; ordinary browser-standard Xbox-style mapping is the supported path.

## Terminal and effective cheats

Backtick opens/closes the Terminal. Keyboard text is captured rather than forwarded to gameplay; Enter executes. Commands trim whitespace, ignore letter case and reject unknown commands/extra arguments with visible feedback.

- `godmode`: toggles PLAYER HP/MP loss protection. Damage resolves without lowering protected HP, and battle command transactions retain previous protected HP/MP. `MagicSystem` applies effective MP cost zero only after checking spell access and casting-method compatibility. An otherwise available spell can cast at zero MP. It does not grant learned abilities, heal current resources, remove Mute or change base stats/spell definitions. ZEON and Wilderness units are unaffected.
- `greedisgood`: toggles effective G cost zero at `EconomySystem.price/change` via one shared runtime cost boundary. Shop and recruitment costs use it; positive income is unchanged. Definition prices and stored candidate costs remain intact. Disabling immediately restores ordinary costs.
- `devmode`: toggles developer access without resetting runtime, changing the current gameplay state, or writing/deleting campaign saves. Disabling from Terminal closes an active developer overlay. Normal play continues whenever the overlay is closed.

All flags are ephemeral and reset on explicit current-runtime reset/reload. They are not serialized into campaigns or editor definitions. In-game rule checks temporarily neutralize and subsequently restore active flags, keeping the tests meaningful.

## Developer layer and property interaction

`DeveloperShell` is owned by `Game`, outside the normal state stack. It handles Terminal/global developer actions and updates only its active overlay while open. The ordinary state resumes when closed. Developer tools do not become player abilities.

With Devmode off, ] has no developer-menu function. With Devmode on, Campaign context offers Edit Campaign Map, Edit Locations, editor files and Game State. Runtime/battle contexts offer applicable runtime tools. End Day test winners/retreats are exposed through the contextual **Test Battle Results** developer screen, not the shipping ordinary End Day menu. The former campaign debug/inspection tools run in a private view inside the developer overlay; they do not leave normal campaign menus in debug mode.

**Game State → Reset Current Game** has an explicit No/Yes confirmation. It creates a new in-memory campaign from shipping definitions, resets transient cheats, and returns to the Campaign Map. It does not clear saved controls, browser editor storage or the existing in-memory editor draft. The project still has no ordinary campaign-save UI; existing serialization/migration APIs remain intact.

`PropertyScreen` supplies consistent behavior: immediate boolean toggles; focused numerical/enum editing; Up/Right +1 and Down/Left −1; Accept commits; Cancel drops the staged value. Focus has a distinct marker/footer. Submenus return to their parent and race/class lists toggle multiple selections. Text properties use a keyboard text screen with explicit commit/cancel. Errors remain visible without applying a failed transaction.

## Campaign Map and Location authoring

`EditorDocument` owns deeply frozen versioned data and exposes clone/validate/commit operations. Draft changes are separate from the active campaign. Campaign terrain, graph locations and graph routes remain independent layers.

Terrain editor: Cancel opens Choose Tile/Copy Existing Tile and other tools. Choosing/copying establishes a persistent paint tool. Movement does not paint; each Accept paints one cell, including underneath locations, without changing location identity/configuration. Clear Active Tool is available without leaving the editor. Editor overlays own a separate cursor/camera and consume inputs, preventing normal squad interaction.

Edge resizing is shared with Battle Maps: choose N/S/E/W and a signed number of rows/columns. Minimum dimensions are 30×30. Additions are Ocean, tile size stays 16, and N/W operations translate existing coordinates. S/E leave retained coordinates unchanged. Locations, positional metadata and current runtime visual anchors—including squad/traveler offsets—prevent unsafe cropping. Failed validation leaves the complete draft unchanged. Camera bounds follow the new dimensions, and `WorldCamera` centers a world dimension smaller than its viewport without stretching it.

Location editor behavior:

- Empty-cell Cancel → Create Location activates placement. Accept creates a blank, zero-income Wilderness location and opens the same property editor used by existing locations.
- Existing-cell Cancel → Copy/Edit/Move/Delete. Copies include applicable configuration and map references but receive independent generated location IDs. Names/moves preserve IDs; moves validate atomically and preserve routes.
- Delete requires confirmation, removes every connected route and cleans polity seat/member references. Deletion of a location referenced by runtime or required starting entities is refused rather than silently deleting those entities.
- Connect is entered from location properties. The source and connected neighbors flash at a slow half-second interval. Accept toggles one relationship; Cancel returns. Route lines derive straight endpoints from location coordinates, so moves redraw them automatically.

Settlement data retains enabled/type/allegiance, shared tier, independent shop enable/tier settings, allowed recruit races/classes and income. Disabling it preserves stored configuration but exposes Wilderness with no active allegiance, shops, recruitment or income. Enabling restores it. Supported types are Village, Town, City, Fort and Castle; allegiance choices are Player, Zeon and Neutral. Shared tier updates all stored shop tiers, including disabled shops; individual overrides can follow. There is no invented maximum tier.

Recruitment selections use actual race/class definitions. No recruit-level field or new level formula exists. Compiled legacy demo recruitment tables are filtered by the authored selections; new blank settlements have no invented candidate count, price or production level progression. Their selected eligibility is available to future story/day recruitment generation. Existing demo benchmark behavior was retained, not promoted as the final production formula.

Appearance selects among available capital/village/sign/fort/shrine graphics independently of settlement type. Quest associations are stable string references, not a quest language. Existing polity allegiance and physical campaign control remain separate concepts; this prompt does not replace campaign diplomacy. A new settlement can initialize physical control from its selected allegiance; existing demo controllers are preserved independently. The effective settlement allegiance is visible in location inspection.

## Battle Map model, editor, validation and preview

Locations reference multiple IDs in a separate `battleMaps` table. Create New Battle Map is always available. New-map properties configure dimensions and controlling-faction applicability, then create an Ocean-filled map and enter the editor.

Conditions are `{controller: null|PLAYER|ZEON|NEUTRAL|WILDERNESS, storyKeys: [...]}`. Null means any controller; each story key requires a true value supplied by a story-state provider. `AuthoredContent.select` selects the single applicable map, reports no applicable map or ambiguity, or uses an explicit chooser. It does not invent priorities, scripts or quest behavior. `BattleInitializationSystem.prepare` receives `staticMaps`, campaign state, a `storyState` callback, optional `chooseStaticMap`, and the existing orientation/rule providers. Route procedural generation remains separate and unchanged.

Battle tiles store terrain identity plus optional visual variant identity. Copy Existing Tile retains both. Q/Select and P/Start cycle forward/backward variants in the tile picker; production terrain currently has one existing variant each, while temporary test variants exercise wrapping and renderer selection. No arbitrary production variants were invented. Normal movement costs and race overrides remain in rule data, never in per-cell authoring.

Battle resizing preserves/translates every Front/Back spot, special deployment and required positional point, rejecting unsafe shrink atomically. Approach axis is authored N/S or E/W. Which squad approaches from which end remains an explicit unresolved orientation provider; geographical direction is not guessed.

Deployment tools author individual, potentially non-contiguous Front and Back spots. Each active side needs at least six per group for readiness. Placement rejects occupied or unresolved/impassable cells; Accept again removes the selected group's spot. Initialization additionally checks capacity for the actual squad distribution. Generated fixture rows retain their previous orientation/centering rules; authored positions are not forced into rectangles or contiguous depth bands.

Special Deployment starts from a full existing character snapshot and permits editing name, faction, race, class, character level, class level and equipment. Changes labeled “rebuilds stats” explicitly rebuild that draft character's growth/progression; they never modify the source character. Learned abilities/loadout in the snapshot remain subject to normal validation, with invalid passives cleared when lowering class level. JSON retains the complete unit definition for future authoring extensions. Placement generates a unique special ID; existing specials can be edited or explicitly deleted.

At initialization, specials become `scenario.specialUnits`, outside the two participant/squad rosters, with unique transient unit/equipment IDs, derived stats, positions and normal CT. Specials do not recruit themselves or permanently enter campaign rosters; their Dead/AWOL IDs are omitted from campaign casualty results. Post-battle story persistence/recruitment is intentionally unresolved.

Wilderness is a distinct combat faction, hostile independently to Player and Zeon and friendly to itself. It participates in targeting, turns and multi-faction conclusion checks. Wilderness-versus-Zeon scenes use opposing sides rather than overlapping both on Zeon's side; Wilderness also has a distinct map marker. Strategic ownership, treasury and save schemas are not expanded into a speculative diplomacy system. A Wilderness campaign result cannot be silently treated as a Zeon win.

Validation covers dimensions, known terrain/variant references, conditions, approach pairing, required groups, bounds, duplicate/conflicting spots, terrain eligibility, special identity/progression/equipment, special ID uniqueness and required positional metadata. Structural validation permits incomplete draft deployments to be stored; readiness validation is required for shipping export and normal initialization. Visible map validation reports failures instead of silently correcting them.

**Preview Normal Battle Map** uses the normal `BattleMapRenderer` and scrolling without an interception or campaign mutation. It is a terrain/layout preview, not an invented full production battle launcher. Deployment/special markers are shown in the editor. Full authored test battles remain dependent on orientation, combat rules and AI providers; the existing isolated Battle Foundation Test remains available separately.

## Persistence and shipping workflow

Chosen solution: **explicit browser-local draft storage + portable JSON backup + downloadable classic JavaScript shipping data**. No filesystem access API, runtime server, arbitrary local rewrite or dynamic code import is required.

- Editor document schema: **version 1**. Browser key: `shining-farce.editor.v1`.
- Controls profile: **version 1**, separate `shining-farce.controls.v1` key.
- Campaign save schema: **8, unchanged**. Existing supported migrations are unchanged. Editor/cheat/controller fields do not enter a campaign snapshot.
- Working documents contain world definitions, terrain rows, battle-map definitions, IDs and required positional metadata—not current campaign squad/resource state.
- Save/restore/import are explicit; replacement asks for confirmation. Failed import validates before replacing the current draft. Storage failure is shown and does not falsely report success. JSON export can preserve incomplete work.
- Shipping export refuses unready Battle Maps and writes a classic `window.GBTRPG.data.AUTHORED_CONTENT = ...;` data file. The placeholder shipping file is null by default, so the current demo is preserved until deliberately replaced.

### Non-programmer steps

1. Extract/copy the complete project folder and double-click `index.html`.
2. Press backtick, type `devmode`, press Enter, then press backtick again. Press ].
3. Choose Edit Campaign Map or Edit Locations. For a Battle Map, edit a location, choose Battle Maps, then Create New Battle Map or an existing entry.
4. In an editor press Menu, then Save / Import / Export. **Save Working Copy in This Browser** stores the draft for this browser/folder. When returning later, enable Devmode and choose **Restore Browser Working Copy**, confirming replacement of the current draft.
5. Regularly choose **Export Editor Backup JSON** and keep the downloaded file somewhere safe. **Import Editor Backup JSON** lets you select this backup in another session/folder/browser. It never executes JavaScript.
6. Before shipping, finish every Battle Map's required terrain/deployments and run Validate Battle Map. Use Preview Normal Battle Map to inspect the layout.
7. Choose **Export Shipping Authored-Content.js**. The browser downloads `authored-content.js`. If an invalid map remains, the export reports it and does not produce a shipping file.
8. Close the game. Back up the project's current `js/data/authored-content.js` in File Explorer. Copy the downloaded file into the project's `js/data` folder and replace it using the exact filename **authored-content.js** (remove any download suffix such as `(1)`). This manual copy/replace step is required.
9. Double-click `index.html` again. A new runtime uses the exported map, location and route definitions and has the exported static Battle Maps available to its selection provider. The pending battle path still needs specified approach/combat providers; export does not invent these rules.
10. Distribute the **whole project folder**, including `index.html`, `js`, `css` and `assets`. Map edits reference existing local PNGs, so there is no image generation/build step for recipients.

Browser storage may be disabled, quota-limited, or scoped differently for `file://` paths. Moving the folder or clearing browser data may make stored drafts/mappings unavailable. The JSON backup is the portable recovery method. Downloads/file-picker UI varies by browser. No campaign save is silently overwritten or migrated to a changed world; existing save compatibility must still match the definitions it was created against.

## Files added

- `js/core/LocalStore.js` — guarded, separate local persistence.
- `js/core/DeveloperRuntime.js` — transient flags and centralized effective G cost.
- `js/systems/FactionSystem.js` — minimal independent combat factions/hostility.
- `js/data/authored-content.js` — replaceable classic-script shipping placeholder.
- `js/editor/LocationModel.js` — stored/effective settlement and appearance model.
- `js/editor/MapAuthoring.js` — catalogs, identity/variant checks and atomic resizing.
- `js/editor/BattleMapAuthoring.js` — map definitions, validation, resizing, special instantiation.
- `js/editor/EditorDocument.js` — immutable authoring transactions, persistence/import/export.
- `js/editor/AuthoredContent.js` — runtime world compilation and conditional static selection.
- `js/editor/PropertyScreen.js` — common property interaction.
- `js/editor/EditorFiles.js` — explicit JSON selection and browser downloads.
- `js/editor/DeveloperShell.js` — Terminal, contextual developer overlay, Options/files/runtime tools.
- `js/editor/MapEditorState.js` — terrain, location and Battle Map editing/preview.
- `js/debug/DeveloperToolsTests.js` — 118 deterministic checks.
- `assets/world/ocean16.png` — four-color native tile.
- `tools/verify-palette.cjs`, `tools/verify-developer-ui.cjs`, `tools/verify-offline-structure.cjs` — offline QA utilities.
- This `PROMPT8-IMPLEMENTATION.md` report and new verification outputs/captures.

## Existing files changed

- `index.html` — dependency-ordered classic script registration.
- `js/config/palette.js`, `js/data/assets.js`, `js/data/worldVisuals.js` — four colors, Ocean manifest entry, preserved 16px campaign visual data.
- `js/core/Input.js`, `js/core/Game.js` — remapping/Gamepad polling and developer/shipping-data integration.
- `js/campaign/EconomySystem.js`, `RecruitmentSystem.js` — effective G costs, disabled settlement services and allowed recruitment filtering.
- `js/systems/MagicSystem.js`, `BattleStatusSystem.js` — effective player MP/HP protection.
- `js/systems/BattleInitializationSystem.js`, `BattleTerrainSystem.js`, `DeploymentSystem.js`, `CombatSystem.js`, `BattleSceneSequence.js` — conditional authored maps, variants, individual spots, special/Wilderness integration and scene sides.
- `js/states/BattleState.js`, `BattleMapState.js`, `CampaignMapState.js`, `EndDayState.js` — transient specials/protection, non-player AI handling, Options and separated developer controls.
- `js/ui/MapPresentation.js`, `CampaignResourceUI.js` — independent appearances and effective displayed recruit costs.
- `js/rendering/WorldCamera.js`, `WorldMapRenderer.js`, `BattleMapRenderer.js`, `BattleSceneRenderer.js` — authored terrain/bounds, centering, Wilderness indication/composition and four-color comments.
- `js/debug/FoundationTests.js`, `BattleFoundationTests.js` — new suite registration; preserve all original terrain assertions and separately test newly introduced unresolved Ocean instead of applying the old traversable-terrain expectation to it.
- `tools/generate-resource-art.cjs`, `generate-strategic-placeholders.cjs`, `verify-rendering.cjs` — Ocean generation, tile-size contract and extended offline QA.
- Regenerated PNGs: `assets/fonts/placeholder-font.png`; `assets/ui/placeholder-cursors.png`, `placeholder-window.png`; all existing `assets/world/*.png` palette-driven strategic/Portal/historical placeholders. Tactical grass/wall/hero needed no migration.
- `README.md`, `docs/ARCHITECTURE.md`, `assets/README.md` — current controls, authoring workflow, schemas, four-color and verification documentation.
- `verification/rule-checks.txt`, `results.json`, `render-log.txt` and regenerated offline captures — current evidence, not runtime dependencies.

## Preserved rules and deliberate boundaries

All 618 prior deterministic checks still pass, including the Prompt #7 CT/event/provenance coverage. Participants and specials start CT at 0; readiness is 1000; turn end subtracts exactly 1000 from actual CT, preserving overshoot. Forecasting remains pure and does not consume live RNG. Major/Minor economy, scene presentation, nested counter restrictions, Prayer's 25% roll, Dying/Dead/AWOL and immediate conclusion behavior remain established rules.

No final production rules were added for attacks, hit/miss, damage/criticals, ordinary counters, weapon/Wand formulas, global rounding, CP awards, AI utility weights, enemy Wizard counter selection, detailed race terrain tables, procedural biome generation, unspecified class deployment defaults, unresolved spell/status/Scrounge/Stance policies, general recovery/result reconciliation, campaign draws, AWOL with no friendly settlement, wilderness encounter rates, recruit level progression, quest/NPC/event/treasure/scenario scripting, or special-unit post-battle persistence.

Ocean is authorable/renderable and an expansion fill, but its unprovided movement semantics are explicitly unresolved and conservatively non-traversable for ordinary units. No arbitrary maximum map dimensions or shop tiers were invented; browser memory/performance remains a practical limit. Static-map ambiguity needs an explicit chooser. Approach mapping needs an explicit orientation provider. New production recruitment needs the future story/day generation provider; choosing eligibility does not invent candidate levels/counts/costs. Preview fulfills the minimum normal-rendering path; a turnkey authored production test-battle button is not included.

## Manual acceptance checks still required

1. Double-click `index.html` from a fresh extracted folder. Confirm artwork loads, framebuffer remains 480×360 and normal map menus work without network/server/install.
2. Open Terminal with backtick; type each toggle twice; verify feedback, closure and continued gameplay. In Battle Foundation Test, check player HP protection/free available spells and unchanged unlearned spell access.
3. Options → Controls: remap a keyboard action, approve/cancel a conflict, reload to check persistence, and Restore Defaults. Repeat with controller buttons.
4. Connect an Xbox-style controller, press a button to expose it to the browser, then test D-pad, left-stick dead zone/repeat, A/B, simultaneous keyboard input and disconnect/reconnect. Test controller Terminal open/close; type the command with the keyboard.
5. Enable Devmode and open ]. Paint/copy several cells, including underneath a location. Verify movement alone does not paint and Clear Active Tool works. Add/remove each map edge and try an invalid crop; verify no partial changes.
6. Create/copy/rename/move a location; inspect preserved IDs/configuration/routes. Toggle Connect on/off and delete a disposable location after confirmation. Disable/re-enable Settlement and check retained settings.
7. Create two conditional Battle Maps on one location. Paint traversable terrain, author non-contiguous Front/Back spots, place/edit/delete a special unit, resize, validate and preview. Invalid/unfinished maps should report specific failures and block shipping export.
8. Save/restore a working draft; export/import JSON; test a malformed import without losing the draft. Export valid shipping JavaScript, back up and manually replace `js/data/authored-content.js`, then reopen `index.html` and confirm the new map/location data appears.
9. Confirm Reset Current Game offers No/Yes, affects only the current runtime and preserves the portable backup and saved browser editor/control data.
