# Game Boy Presentation Shell — implementation report

Historical three-mode report, 2026-09-27. The owner subsequently confirmed this shell and its controls work in real Windows/Brave/file-URL use. The [five-mode extension](FIVE-PRESENTATION-MODES.md) supersedes its mode numbering, fixed frameless size and preference format. Source-art provenance now separately includes an owner-confirmed manual small Select-Pressed revision. The original implementation details and measurements below remain historical.

## Starting point and scope

Starting HEAD: `14afe2c` (`End of Battle Scene Engine Phase 1`), clean working tree. Starting complete deterministic suite: **950/950**. Existing Stage-1 owner acceptance remains intact. This change implements the supplied desktop presentation-shell prompt, not Battle Scene Stage 2/3, mobile touch controls, Power Off, or new authored schemas.

Two explicit owner clarifications were applied:

- **Right of Screen y=155** in both sizes. The prompt's y=150 leaves a five-pixel gap with the supplied component dimensions; y=155 matches the references.
- **One shared resolved held direction in Input**, using most-recently-pressed priority and fallback on release. The previous input implementation queued both directions for a diagonal stick and had no resolved held-direction service.

## Assets and source integrity

The supplied `Game Boy Frame.zip` contains 48 PNGs used here: 12 normal components plus 11 alternates for each size, and two complete reference PNGs. Only PNGs were copied; `.aseprite` files were ignored. All 48 copied PNGs match their source SHA-256 hashes. No source PNG was recolored, resized, regenerated or otherwise modified. Historical `240x180` archive/reference names mean the small source set; the established display is **300×225**.

The full source archive entry, destination path, native dimensions and SHA-256 for every PNG are recorded in [source-manifest.json](reference/game-boy/source-manifest.json). Reference PNGs are development-only and not needed to play. The fixed runtime manifest is `js/config/presentationShell.js`, separate from the authored Asset Catalog.

### Exact runtime paths

#### Size 1

- `assets/presentation/game-boy/size-1/a-button-pressed.png` — 115×188
- `assets/presentation/game-boy/size-1/b-button-pressed.png` — 95×188
- `assets/presentation/game-boy/size-1/battery-on.png` — 110×225
- `assets/presentation/game-boy/size-1/contrast-wheel-scroll.png` — 75×225
- `assets/presentation/game-boy/size-1/d-pad-down.png` — 310×188
- `assets/presentation/game-boy/size-1/d-pad-left.png` — 310×188
- `assets/presentation/game-boy/size-1/d-pad-right.png` — 310×188
- `assets/presentation/game-boy/size-1/d-pad-up.png` — 310×188
- `assets/presentation/game-boy/size-1/select-button-pressed.png` — 216×141
- `assets/presentation/game-boy/size-1/start-button-pressed.png` — 110×141
- `assets/presentation/game-boy/size-1/top-on.png` — 600×155
- `assets/presentation/game-boy/size-1/a-button.png` — 115×188
- `assets/presentation/game-boy/size-1/b-button.png` — 95×188
- `assets/presentation/game-boy/size-1/battery.png` — 110×225
- `assets/presentation/game-boy/size-1/below-screen.png` — 600×159
- `assets/presentation/game-boy/size-1/bottom.png` — 520×248
- `assets/presentation/game-boy/size-1/contrast-wheel.png` — 75×225
- `assets/presentation/game-boy/size-1/d-pad.png` — 310×188
- `assets/presentation/game-boy/size-1/left-side.png` — 80×436
- `assets/presentation/game-boy/size-1/right-of-screen.png` — 115×225
- `assets/presentation/game-boy/size-1/select-button.png` — 216×141
- `assets/presentation/game-boy/size-1/start-button.png` — 110×141
- `assets/presentation/game-boy/size-1/top.png` — 600×155

#### Size 2

- `assets/presentation/game-boy/size-2/a-button-pressed.png` — 135×188
- `assets/presentation/game-boy/size-2/b-button-pressed.png` — 130×188
- `assets/presentation/game-boy/size-2/battery-on.png` — 110×360
- `assets/presentation/game-boy/size-2/contrast-wheel-scroll.png` — 75×360
- `assets/presentation/game-boy/size-2/d-pad-down.png` — 435×188
- `assets/presentation/game-boy/size-2/d-pad-left.png` — 435×188
- `assets/presentation/game-boy/size-2/d-pad-right.png` — 435×188
- `assets/presentation/game-boy/size-2/d-pad-up.png` — 435×188
- `assets/presentation/game-boy/size-2/select-button-pressed.png` — 296×141
- `assets/presentation/game-boy/size-2/start-button-pressed.png` — 210×141
- `assets/presentation/game-boy/size-2/top-on.png` — 780×155
- `assets/presentation/game-boy/size-2/a-button.png` — 135×188
- `assets/presentation/game-boy/size-2/b-button.png` — 130×188
- `assets/presentation/game-boy/size-2/battery.png` — 110×360
- `assets/presentation/game-boy/size-2/below-screen.png` — 780×154
- `assets/presentation/game-boy/size-2/bottom.png` — 700×248
- `assets/presentation/game-boy/size-2/contrast-wheel.png` — 75×360
- `assets/presentation/game-boy/size-2/d-pad.png` — 435×188
- `assets/presentation/game-boy/size-2/left-side.png` — 80×436
- `assets/presentation/game-boy/size-2/right-of-screen.png` — 115×360
- `assets/presentation/game-boy/size-2/select-button.png` — 296×141
- `assets/presentation/game-boy/size-2/start-button.png` — 210×141
- `assets/presentation/game-boy/size-2/top.png` — 780×155

Development references: `docs/reference/game-boy/size-1.png` and `size-2.png` preserve the original complete small and large reference images respectively.

## Presentation architecture and geometry

`Game.start` creates `PresentationShell` around the existing game canvas and preloads all 46 fixed resources through the existing `Assets` loader. It validates all normal/alternate dimensions. The DOM wrapper contains a separate hardware layer of twelve image elements and the original canvas. Image source changes swap component state without changing coordinates. Native Bottom is drawn before overlapping Select/Start components. There is no flattened reference at runtime and no separate input listener on the hardware art.

| Size | Logical canvas | CSS game size | Native overall size | Canvas origin |
| --- | --- | --- | --- | --- |
| 1 | 480×360 | 300×225 | 600×975 | 185,155 |
| 2 | 480×360 | 480×360 | 780×1105 | 185,155 |
| 3 (default) | 480×360 | 480×360 | 480×360, no hardware | 0,0 |

`Renderer.setDisplaySize` sets CSS dimensions only. Size 1 reduces the complete source rectangle by 0.625, using CSS `image-rendering: pixelated`; it does not clip any portion of the logical game. Reduction necessarily samples fewer output pixels and is not integer enlargement. Sizes 2/3 use native game size. Standalone legacy renderer tests retain their integer-fit fallback, but actual Game startup always installs explicit shell display dimensions, including frameless 480×360. This replaces old automatic CSS enlargement for normal game startup as required by the three fixed presentation sizes.

Native component positions are below; dimensions and every alternate are in the runtime manifest. Each alternate shares its normal component's dimensions.

| Component | Size 1 x,y | Size 2 x,y |
| --- | --- | --- |
| Top | 0,0 | 0,0 |
| Contrast Wheel | 0,155 | 0,155 |
| Battery | 75,155 | 75,155 |
| Right of Screen | 485,155 | 665,155 |
| Below Screen | 0,380 | 0,515 |
| Left Side | 0,539 | 0,669 |
| Bottom | 80,727 | 80,857 |
| D-Pad | 80,539 | 80,669 |
| B | 390,539 | 515,669 |
| A | 485,539 | 645,669 |
| Select | 80,727 | 80,857 |
| Start | 296,727 | 376,857 |

The page uses a non-shrinking, naturally centered wrapper with ordinary overflow when the browser is smaller. The shell has no palette filter. The existing SVG display transform stays on the game canvas alone, and the companion outside color remains the page background. No framebuffer source-color rules were loosened.

## Logical input and component states

| Logical input/state | Hardware state |
| --- | --- |
| `confirm` (Accept) held | A Pressed |
| `cancel` held | B Pressed |
| `select` held | Select Pressed |
| `start` OR `menu` held | Start Pressed |
| `Input.activeDirection` | Matching D-Pad alternate; otherwise normal |
| Normal powered-on gameplay | Top On and Battery On continuously |

`Input.sources` tracks keyboard and gamepad held sources independently of queued actions. Consuming or clearing actions does not release a held visual. Multiple physical sources for one action remain held until all release. Keyboard release, gamepad release/disconnection, blur, remapping and defaults clear applicable state. Text entry/remapping suppresses shell actions. Directional repeats do not change priority. Same-poll controller ties resolve deterministically by existing button-index/X-axis/Y-axis scan order; an initial diagonal axis input therefore picks its Y direction and does not alternate while held. Quick taps still register even when released before the next frame.

The shell reads the shared resolved direction, never invents another arbitration policy. Contextual Select remains unchanged. Normal Top/Battery artwork stays preloaded and available; no power-off state machine, battery depletion or gameplay effect was added.

## Contrast Wheel

Actual palette identity changes emit an event from `DisplayPalette.preview`, shared by ordinary cycling, Options live preview, Accept and Cancel restoration. Selecting the same identity or merely opening Options does not trigger the wheel. State is N at 0 ms, A at 200, N at 400, A at 600, N at 800, A at 1000, and N permanently at 1200. Timing uses real elapsed frame time, independently of the gameplay delta clamp.

A new palette change restarts at zero; sequences never queue. Switching 1↔2 keeps an active elapsed state. Entering size 3 clears animation; palette changes there create no hidden backlog. Returning from size 3 starts normal. Current held buttons, Top On and Battery On are applied immediately when a shell appears.

## Preferences, controls and switching safety

The existing key `shining-farce.display.v1` remains version 1 with an additive field:

```json
{"version":1,"palette":"canonical","presentationSize":3}
```

Old palette-only records retain their palette and default size to 3. Missing/invalid sizes also default to 3. A separate committed palette identity prevents saving a presentation size during live preview from accidentally persisting an unaccepted palette. Storage failures retain the active display and report failure through the existing notice path. Wheel and held-input state are transient.

Logical action **`presentation`**, displayed as **CYCLE PRESENTATION SIZE**, defaults to **KeyH**; no controller button is assigned by default. Options / Controls exposes keyboard and button remapping plus a direct Presentation Size enum. The cycle is 1→2→3→1; with default 3, the first H selects 1. Repeated keydown does not cycle repeatedly. Old controls v1 gains the new mapping without losing existing remaps; if H is already assigned, its old meaning is preserved and the new action remains unbound until the owner assigns one.

Size switching runs at the shared input boundary in gameplay/non-capturing UI. It does not reload/reset the game, change the canvas drawing buffer, replace campaign/battle/editor objects, change menus, or write editor data. Terminal/text/remap capture owns its input normally. Campaign schema 8, EditorDocument v1, Working Copy, portable backups, authored shipping JSON and Stage-1 readiness/loader contracts are unchanged.

## Shipping and offline operation

All 46 fixed PNGs are ordinary external runtime resources required by the complete project, even when initial size is frameless; missing resources produce the existing startup load failure. No Asset Catalog updater is required for shell files. `tools/shell-assets.cjs` checks fixed paths, PNG headers and native dimensions; shipping and offline checks call it. Palette validation excludes only these exact manifest paths from the canonical game-color check while validating the 37 original game PNGs normally.

The authored-data shipping ZIP still contains launcher/data/backups/instructions, not a whole game installation. Its INSTALL instructions now explicitly retain `assets/presentation/game-boy/` alongside updated scripts and existing assets. Copy/distribute the complete project folder. Reference documents and the source ZIP are not runtime requirements. There are no new runtime modules, server, fetch/XHR, network resources or dependencies. `index.html` contains 188 local classic scripts and one stylesheet.

## Files changed

- Runtime: `css/game.css`, `index.html`, `js/core/Game.js`, `js/core/Input.js`, `js/rendering/Renderer.js`, `js/rendering/DisplayPalette.js`, new `js/rendering/PresentationShell.js`, new `js/config/presentationShell.js`.
- UI/publishing: `js/editor/DeveloperShell.js`, `js/editor/ShippingPage.js`.
- Tests: `js/debug/FoundationTests.js`, `js/debug/DeveloperToolsTests.js`, new `js/debug/PresentationShellTests.js`.
- Tools: `tools/verify-offline-structure.cjs`, `tools/verify-palette.cjs`, `tools/verify-shipping-page.cjs`, new `tools/shell-assets.cjs`, new `tools/verify-presentation-shell.cjs`.
- Art: 46 paths listed above; two development references and their source manifest.
- Documentation: `README.md`, `assets/README.md`, `CANONICAL-DESIGN-SPECIFICATION.md`, `docs/ARCHITECTURE.md`, `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md`, this report. Existing dated handoffs remain historical; no invented handoff file.

## Automated verification

The complete deterministic suite passes **984/984**, up from 950/950. The 34 added shell checks cover all geometry/default/cycle/persistence cases, old preferences, preview-save isolation, filter/background boundary, separate components, permanent Top/Battery On, each held control and release, multiple sources and remaps, direction fallback and diagonal stability, blur, queue consumption, quick taps, logical event compatibility, H/repeat/capture/migration, wheel timing/restart/hidden-state/size switching, preview Cancel, and game/editor identity preservation.

Three old assertions were updated for authorized behavior: diagonal input now resolves to one direction, and two remap tests explicitly resolve the new H assignment. No unrelated rule assertions were removed or weakened.

| Check | Result |
| --- | --- |
| Complete foundation suite | 984/984 |
| Full offline rendering regression | Passed: campaign, menus, editors, combat, spells, palette, logical resolution |
| Shell PNG/source/reference verifier | 48 unchanged hashes, 46 runtime resources; complete-frame corner samples pass |
| Palette validation | 8 palettes, 37 canonical PNGs, 46 separately validated shell PNGs; zero forbidden game colors/partial alpha |
| Offline structure | 188 local classic scripts, one CSS; no missing, remote, fetch/XHR or syntax errors |
| Stage-1 asset acceptance integration | 28/28 |
| Scene authoring UI renderer | 15 screens |
| Generated shipping-page/installation fixtures | Passed; inert data/backup entries, no executable ZIP entries |
| Authored-content compatibility | Passed |
| Catalog regression | 29/29 |

Developer commands (Canvas commands take the path to an already installed `@napi-rs/canvas`; no runtime dependency installation):

```text
node tools/test-foundation.cjs
node tools/verify-offline-structure.cjs
node tools/verify-palette.cjs CANVAS_PACKAGE_PATH
node tools/verify-presentation-shell.cjs CANVAS_PACKAGE_PATH
node tools/verify-rendering.cjs CANVAS_PACKAGE_PATH --output=TEMP_OUTPUT_DIRECTORY
node tools/verify-asset-acceptance.cjs CANVAS_PACKAGE_PATH
node tools/verify-scene-assets.cjs CANVAS_PACKAGE_PATH
node tools/verify-shipping-page.cjs
node tools/verify-authored-content.cjs
node tools/test-asset-catalog.cjs
```

### Reference comparison and limitations

Normal component assembly is compared with each complete reference (the reference's screen interior is preserved solely for that development comparison). Large assembly: **zero differing pixels** with approved y=155. Small assembly: **1,795 differing pixels already present between supplied component artwork and supplied reference**: 1,775 in D-Pad (global bounds x160–239, y550–704) and 20 in Bottom (x246–470, y727–923). Those source differences are retained rather than repainting owner art. Runtime powered-on states intentionally differ from normal-state references. Offline powered/held renders also verify all four displayed-frame corners at both sizes and companion background placement.

These are offline Canvas2D renders and DOM/input fixtures, not browser screenshots. CSS/SVG composition, fractional sampling, overflow, physical controller behavior and file-URL storage restoration require owner confirmation in real Brave. Prior Stage-1 acceptance does not imply acceptance of this new shell. No real Brave/file-URL visual acceptance is claimed. Apart from owner testing and the recorded source/reference discrepancy, no design decision remains unresolved for this implementation.

## Owner manual acceptance — Windows + Brave + file://

Use the production folder or a complete copied project containing the updated scripts and all component PNGs. Open `index.html` directly in your normal Brave profile/window. Use 100% browser zoom to compare CSS sizes. The large native shell can require page scrolling; do not judge it by a fit-to-window assumption. Existing saved size may restore; select 3 in Campaign Menu → Options / Controls before Test 1.

1. **Cycle:** From size 3, press H three times: 3→1→2→3. Repeat during gameplay and an open non-capturing menu/editor. Confirm campaign position, menu selection, palette and unsaved editor work remain in place.
2. **Size 1:** Confirm 600×975 native small shell and entire game at 300×225, origin (185,155), with no cropped edges. Compare to the supplied small reference, allowing the documented source D-Pad/Bottom differences and powered-on alternates. Scroll to inspect the full hardware if needed.
3. **Size 2:** Confirm 780×1105 native large shell and 480×360 game at (185,155). Inspect opening edges and component seams; resize the browser smaller and confirm scrolling instead of shell shrinkage.
4. **Size 3:** Confirm the hardware disappears and the complete game remains 480×360. Resize the browser; logical layout and display dimensions stay fixed.
5. **Persistence:** Choose each size, close Brave, reopen the exact same `index.html` path in the same normal profile, and confirm restoration. Confirm palette restoration too. Reload starts a fresh campaign as before; this test concerns display preference only.
6. **Remapping:** Open Options / Controls → keyboard mappings → CYCLE PRESENTATION SIZE. Assign an unused key (for example J), confirm H no longer cycles and J does; restore your desired binding. Optionally assign a controller button. Verify the direct Presentation Size field also commits its selected size. If your old profile already used H, preserve that action and explicitly map the new one.
7. **Held buttons:** In a shell mode hold/release each direction, Accept, Cancel, Select and Start/Menu using keyboard and your controller where available. Confirm corresponding artwork stays depressed throughout the hold, even after the action is consumed, and returns on release. Where a control opens/closes a menu, its artwork should still follow the held input.
8. **Simultaneous directions:** Hold Up, then Right; Right should win. Release Right while retaining Up; Up should resume. Release all; normal D-Pad returns. Try diagonal stick input and confirm one stable direction matching game navigation. Try a quick tap and confirm it still moves.
9. **Power/battery:** Observe both shell sizes through menus, palette changes and idle time; Top On and Battery On remain displayed. No power-off interaction is provided.
10. **Contrast:** In ordinary gameplay where contextual Select has no other job, use Select to change palette. Observe three alternate movements at about 200 ms between states, ending normal after 1.2 seconds. Change again during the animation and confirm a restart rather than queued delayed cycles. Change palettes in size 3, then return to a shell: no old animation should play.
11. **Live preview:** Open Options / Controls → Display Palette; entering without changing identity should not animate. Navigate candidates and observe restarts. Cancel: prior game palette and companion background return and the actual restoration triggers the wheel. Accept a candidate, reopen and confirm it persists. Confirm Options remains reachable without the old Campaign Menu scroll problem and footer placement stays fixed.
12. **Palette boundary:** Try several palettes including Dark in both shell sizes. Confirm only the game output and its companion page background change; all hardware colors remain authored. Inspect the complete framebuffer opening for filtering/clipping artifacts.

If testing a separately distributed copy, copy the whole updated project, disconnect networking if desired, then repeat launch and the cycle. Existing Asset Browser readiness, previews, working-copy restore and inert shipping workflows should continue to operate unchanged. Record observed failures with size, control/context, palette, browser zoom and exact path/profile; do not treat offline screenshots as owner acceptance.
