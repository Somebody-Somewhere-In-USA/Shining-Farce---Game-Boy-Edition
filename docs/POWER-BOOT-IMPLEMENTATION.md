# Presentation cleanup and Game Boy power / boot — implementation report

Date: 2026-09-27. Implementation and automated verification are complete. The owner confirmed the power/boot implementation works in real use, then requested trying frames 1–25 at 50 ms rather than 100 ms. That timing adjustment is reflected below; all other intervals remain unchanged.

## Baseline and supplied assets

Starting HEAD: **`6d26074`**, clean working tree. Baseline: **998/998 deterministic checks**. Existing five-mode shell, input, palette, responsive renderer, pause/update boundaries and asset conventions were inspected before editing. No gameplay audio engine, music or sound playback was found; asynchronous timers were confined to editor/file-loading utilities rather than game simulation.

The supplied `SEGA Logo.zip` contains exactly **28 PNGs**, named `SEGA Logo/SEGA Logo 1.png` through `SEGA Logo 28.png`. It does not contain audio; the separately attached `SEGA Chant Game Boy.mp3` supplies that resource. No filenames or missing frames were invented.

| Installed resource | Inventory / properties |
| --- | --- |
| `assets/presentation/boot/sega-logo-1.png` … `sega-logo-28.png` | 28 unchanged PNGs, each 171×58, canonical four colors, alpha 0/255 |
| `assets/presentation/boot/sega-chant-game-boy.mp3` | Unchanged 26,472-byte MP3, 80 MPEG Layer III frames; summed encoded frame duration 1920 ms |
| `docs/reference/boot-source-manifest.json` | All original paths, installed paths and SHA-256 hashes; dimensions and audio duration provenance |

All new resource hashes match the supplied bytes. Existing Game Boy PNGs are preserved. The source audit found the already-confirmed small Select-Pressed revision and two more pre-existing changes: large `below-screen.png` and `d-pad.png` match starting HEAD `6d26074` byte-for-byte. Their hashes/provenance were added to `docs/reference/game-boy/owner-revisions.json` without changing the original ZIP manifest or any art. Of the 48 shell/reference PNGs, 45 match the original ZIP and three match these recorded revisions. Current normal assembly differs from the old reference by 1,795 pixels small and 17,935 large; these are retained source-art differences, not new geometry changes. No palette-specific logo art or new gameplay music was created. Browser-reported finite duration metadata is preferred over the encoded-frame duration estimate, since decoder padding/metadata can affect playback length.

## Final modes and preferences

| ID | Player choice | Displayed game | Shell |
| --- | --- | --- | --- |
| 1 | SMALL GB - 300x225 SMOOTH | (185,155), 300×225, CSS `auto` interpolation | 600×975 |
| 2 | LARGE GB - 480x360 | (185,155), 480×360, native/pixelated | 780×1105 |
| 3 | FRAMELESS - RESPONSIVE | Complete 4:3 viewport fit, pixelated | none |

The logical canvas remains **480×360**. Crisp 240 and crisp 300 choices were removed, along with the unused-opening backing div and its special color-validation exception. The chosen smooth small mode fills the existing opening. Component geometry and responsive calculation remain unchanged. Modes 1/2 stay native size and can require page scrolling; only 3 follows viewport resize.

The stable logical action **`presentation`**, labeled **Cycle Presentation Size**, still defaults to H and remains remappable. It cycles **1→2→3→1**. Options exposes the three descriptive names. Ordinary mode changes preserve the running instance and do not trigger boot, including entering hardware from frameless.

Storage still uses `shining-farce.display.v1`; the current record is:

```json
{"version":3,"palette":"canonical","presentationMode":3}
```

Current five-mode record v2 maps modes **1/2/3→1, 4→2, 5→3**. Original three-size record v1 maps sizes **1→1, 2→2, 3→3**, with old small now smooth. Palette-only records default to frameless while retaining a valid palette. Missing/invalid modes default to 3. Recognized legacy records are normalized and written back immediately on load, removing obsolete mode values. Storage errors retain the active normalized preference and expose the existing notice; filesystem/browser failure cannot be claimed as a successful write. Current v3 modes restore directly. Committed palette versus live preview remains separate. Power state is transient, not persisted. Controls v1, EditorDocument v1, campaign schema 8 and authored shipping/portable formats are unchanged.

## Power states and pause boundary

`PowerPresentation` owns presentation phases outside the ordinary `GameStateManager`:

```text
startup shell: loading → boot-off → forward → blank → reveal → chant
                                                  → hold → reverse → final → running
running → dissolve → off → boot-off → … → running
implementation error → error (blank, paused, diagnostic)
```

`Game.start` constructs the power controller and synchronously clears the canvas/sets Off hardware **before awaiting assets**. No game render occurs first. Startup timing begins once assets and game objects are ready. Frameless does not enter this path. Slow resource loading therefore extends an initial blank-Off loading phase, never flashes gameplay or exposes an unready logo.

`Game.step` continues host presentation and input-neutral observation but skips developer/game update and rendering while power blocks play. This freezes CT, map movement, game/menu timers and Battle Scene presentation because those systems advance through the gated update path. The RAF clock continues updating, so power duration does not become accumulated gameplay delta on resume. In-memory campaign, battle, state, menu and editor objects are retained; no reset, save/load or reconstruction occurs. Asynchronous browser/editor resource loading is not cancelled as a substitute for pausing gameplay.

### Physical switch

The original Off switch lies around x65–104 at the very top; On shifts to approximately x90–129. Both shell assets use those same coordinates. A transparent **75×20** button at **x=60, y=0** covers their union with modest click tolerance. It covers neither the whole 600/780×155 Top image nor the framebuffer. The button is positioned relative to the native shell wrapper, so scrolling/centering moves it with the artwork. It has a pointer cursor, no visible replacement art, is hidden frameless, and is disabled during dissolve/boot. The controller independently rejects transition clicks rather than queuing them. Clicking restores canvas focus and is never a game action.

On uses `top-on.png` and `battery-on.png`; Off uses `top.png` and `battery.png`. The swap to Off occurs synchronously at the start of power-off, alongside input suspension and audio pause, before the dissolve completes. On hardware switches back at the 1000 ms boot boundary.

### Row dissolve

At power-off, draw the existing logical canvas into a detached 480×360 canvas. This captures menus or Battle Scenes exactly as shown, before output palette filtering. It uses canvas-to-canvas drawing, **not pixel readback**, preserving compatibility with file-URL canvas restrictions.

Fisher–Yates shuffles all 360 logical row indices using presentation-only `Math.random`, without touching campaign RNG. Over 1000 ms, replace `floor(elapsed*360/1000)` selected rows with canonical background color, each row exactly 480×1. Tests inject a fixed random source and check permutation/invariants rather than production order. No opacity transition is used. Completion displays a fully blank screen indefinitely until another physical power click.

## Boot timeline and framebuffer

| Time / phase | Visible result |
| --- | --- |
| 0–1000 ms | Top/Battery Off, blank background |
| 1000–2250 ms | Top/Battery On; frames 1–25 in order, 50 ms each |
| 2250–3250 ms | Blank background, hardware On |
| 3250–3550 ms | Frames 26–28, 100 ms each |
| From 3550 ms | Frame 28; chant attempted once |
| Audio completion + 0–1000 ms | Continue holding frame 28 |
| Next 300 ms | Reverse 28,27,26, each 100 ms |
| Next 1000 ms | Blank background |
| Then | Render/reveal original state and resume updates/audio |

Duration is **5850 ms plus audio duration**, approximately 7770 ms with the 1920 ms fallback. Animation uses elapsed presentation time independently of the gameplay 100 ms clamp. Browser frame scheduling may affect the exact painted instant; stalled/hidden tabs cannot display missed frames retroactively.

All 28 PNGs draw at native 171×58 inside the logical framebuffer. Centering is pixel-aligned at **(154,151)**: the odd image width leaves horizontal margins 154/155 rather than introducing half-pixel sampling and noncanonical internal colors. The screen is cleared before each logo frame. No logo DOM overlay or shell-layer logo is used.

All blank and removed rows use **`PALETTE.background` = canonical #9bbc0f** before normal output mapping. Therefore the displayed blank is the selected palette's entry 0, including #242424 for reversed Dark. It is **not** the page's #6d8508 canonical companion (or another companion). Logo pixels and background pass through the existing canvas-only SVG transform; hardware remains unchanged. Preview/Cancel, companion backgrounds, and ordinary contrast-wheel behavior remain intact. Power transitions do not emit palette-change events and do not start wheel animation.

## Audio ownership and browser policy

`BootAudio` owns a detached HTMLAudio element using the fixed local MP3, with `loop=false`. It makes **one play attempt at the chant cue**. There is no early muted play or looping chant. Automatic startup prepares the element without a user gesture. Manual power-on prepares/loads it from the physical click and attempts ordinary playback at the same later cue; actual permission remains browser-dependent and is not guaranteed merely because a click began the sequence.

Successful play holds frame 28 until the actual **`ended` event**, then starts the separate one-second hold. It does not normally stop playback based on the estimated duration. Rejection, media error or unavailable audio switches to a silent timing fallback, measured from the chant cue: finite positive `audio.duration`, otherwise **1920 ms**, derived from the supplied MP3. A play promise still pending after **1000 ms** is stopped and falls back for the remaining duration. A playing element that never ends is stopped after **duration + 5000 ms**, avoiding indefinite stalls. The post-audio hold still follows. Generation tokens and stopped media prevent late callbacks from restarting completed/aborted audio. An implementation error stops the chant, blanks the screen, keeps gameplay paused and reports a diagnostic.

No gameplay audio subsystem was present to extend. The new small **`GameAudio`** ownership interface supports `register(media)` and existing document audio/video elements. Power-off records only elements currently playing, calls `pause()` without resetting `currentTime`, and resumes that set only after boot. Already paused/ended media are not restarted. Rejected resume is caught and recorded; it does not crash gameplay. Detached boot audio is never registered as underlying media or resumed with it. This pass supplies the tested integration boundary without inventing songs, effects, Web Audio graphs or music rotation. Actual game-audio resume cannot be demonstrated with existing gameplay content because none currently plays audio.

No server, network request, autoplay/security setting change or runtime dependency installation is needed. Browser-policy audio success remains a manual acceptance item.

## Input and safe transitions

`Input.setSuspended` clears pending logical edges and suppresses keyboard, controller, text-entry and remapping handlers. Physical keys held before/during pause are quarantined until keyup; controller buttons/axes observed during pause require release/neutral. Repeats or stale device states cannot produce an action immediately on return. Ordinary controls, H/presentation cycling, Select/palette cycling, terminal and editors are disabled for the entire Off/boot interval. The power button remains available only at stable On/Off, and its click never enters the logical queue. Existing most-recently-pressed direction arbitration and normal held button visualization are unchanged.

## Shipping and files changed

The 29 boot files are fixed external presentation resources, not Battle Scene catalog entries, EditorDocument, Working Copy, portable JSON or inert shipping data. The complete distribution must include `assets/presentation/boot/` and existing `assets/presentation/game-boy/`, plus updated scripts. Shipping INSTALL instructions identify both directories. No catalog updater is required for built-in presentation art.

- Updated runtime: `js/config/presentationShell.js`, `js/core/Game.js`, `js/core/Input.js`, `js/rendering/DisplayPalette.js`, `js/rendering/PresentationShell.js`, `css/game.css`, `index.html`.
- New runtime: `js/core/PresentationAudio.js`, `js/rendering/PowerPresentation.js`.
- Shipping: `js/editor/ShippingPage.js`; fixed-resource checks in `tools/shell-assets.cjs`, new `tools/boot-assets.cjs`, and `tools/verify-offline-structure.cjs`.
- Tests: updated `js/debug/PresentationShellTests.js` and `FoundationTests.js`; new `js/debug/PowerPresentationTests.js` and `tools/verify-power-presentation.cjs`; updated current-mode render tool and palette validator.
- Art: the 28 logo PNGs and one MP3 listed above, copied unchanged.
- Docs: README, canonical specification, architecture, asset README, recovery ledger, historical five-mode annotation, this report, boot source manifest, updated existing-art provenance and offline images under `docs/reference/power-boot/`.

No commit was created. No combat, Battle Scene Stage 2, authored schema or original PNG modification was made.

## Automated verification

**1028/1028 deterministic checks pass**, starting from 998. Removed experimental-mode assertions were replaced with current modes and all v1/v2 migration cases. Thirty focused power checks cover full frame order/durations, hardware timing, actual-end hold, fallback/watchdogs, native centering, palette background, row permutation/count/final state, real Game.step pause gate, retained objects/menu, gameplay media pause/resume, click debounce, suppression of keyboard/gamepad/text/remap/stale input, abort cleanup and mode-change behavior.

| Check | Result |
| --- | --- |
| Complete deterministic suite | 1028/1028 |
| Full offline rendering regression | Passed campaign, menus, developer UI, combat, spells, source palette and fixed framebuffer |
| Whole Game.start/power integration with decoded PNGs | 13 checks passed, including no game flash, same menu pixels/object restoration and real Promise rejection handling |
| Stage-1 acceptance integration | 28/28 |
| Stage-1 scene asset UI | 15 screens passed, including persistence, shipping and image fallbacks |
| Shipping-page installation fixture | 1028 installed-page checks; inert data/backup entries, no executable ZIP entries |
| Offline structure | 191 classic scripts, one CSS; no missing, remote, fetch/XHR or syntax errors |
| Palette validation | 65 canonical PNGs (including 28 logos), 46 separate shell PNGs; zero forbidden game colors/partial alpha |
| Fixed resources | 46 shell PNGs + 28 boot PNGs + one MP3; all boot source hashes/dimensions pass |

Key commands, using an already installed Canvas package for optional developer QA:

```text
node tools/test-foundation.cjs
node tools/verify-offline-structure.cjs
node tools/verify-rendering.cjs CANVAS_PACKAGE --output=TEMP_OUTPUT
node tools/verify-power-presentation.cjs CANVAS_PACKAGE
node tools/verify-asset-acceptance.cjs CANVAS_PACKAGE
node tools/verify-scene-assets.cjs CANVAS_PACKAGE
node tools/verify-shipping-page.cjs
```

[Small shell boot render](reference/power-boot/boot-shell-1.png), [large shell boot render](reference/power-boot/boot-shell-2.png), [half-dissolved menu](reference/power-boot/dissolve-half.png), [Dark logo output](reference/power-boot/logo-palette-dark.png), [blank Off logical frame](reference/power-boot/stable-off.png).

These are offline Canvas2D captures, not browser screenshots. Whole-startup tests use decoded local PNGs and a DOM/media adapter; autoplay rejection is simulated, not a claim about Brave policy. Actual file-URL rendering, audio output, physical hitbox usability and cross-session browser preference behavior remain owner checks.

## Windows / Brave / file:// acceptance

Open the updated full project directly through `index.html` in the normal Brave profile. Use 100% browser zoom for native geometry comparisons. Scroll to the very top of a shell to reach the small gray switch. Keep browser protections unchanged.

1. **Mode cleanup:** Cycle H or your mapped control and confirm only Small Smooth → Large → Responsive Frameless. Check Options names. Existing small experimental choices should normalize to Small Smooth; old large/frameless retain their meanings.
2. **Small quality:** Confirm 300×225 smooth output matches the preferred comparison mode, filling the opening. Resize the browser: shell stays native, frameless alone fits dynamically.
3. **Shell startup:** Save Small or Large, close/reopen the exact same `index.html` path/profile. Confirm Off Top/Battery and palette-background LCD appear first, without any game flash. After assets are ready, the Off interval lasts about one second before On hardware/logo animation. Repeat in both shell sizes.
4. **Boot visuals:** Observe 1–25 → blank → 26–28 → hold 28 → reverse 28–26 → blank → game, with 50 ms for frames 1–25, 100 ms for frames 26–28 and the reverse, and the one-second blanks/holds described above. Try ordinary controls throughout; none should act or skip the sequence.
5. **Chant:** Confirm one audible chant begins only after the initial 26–28 animation finishes. Frame 28 must remain throughout playback and for about one second after it ends. There should be no repeated/early chant.
6. **Palette:** Before powering off/reopening, try multiple palettes, including Dark. The logo must change with the game palette while hardware colors remain unchanged. Blank LCD uses the framebuffer background shade; the page retains its separate companion color.
7. **Manual power-off:** With a menu open or during campaign/battle play, click the small gray switch. Top/Battery must immediately become Off while gameplay/audio pause and random horizontal rows begin disappearing. Confirm about one second of row dissolve, not opacity fading. Clicking elsewhere on Top must not toggle power.
8. **Stable Off:** Wait and press ordinary inputs. Screen stays blank, hardware Off and game frozen. Repeated idle time must not advance a Battle Scene/CT/menu animation.
9. **Power-on/restoration:** Click the switch. Confirm the full boot runs rather than revealing the game immediately. After completion, confirm the same in-memory campaign/battle/menu/editor state. Hold a key/controller direction during boot; it must not act until released and pressed again.
10. **Audio resume:** Current gameplay has no audio to demonstrate this naturally. If testing registered/document gameplay media, start it, power off, confirm actual pause with retained playback position, then confirm resume only after boot. Boot chant must never resume as game music. Report any rejected resume separately from chant policy.
11. **Rapid clicks:** Click repeatedly during dissolve and boot; transitions must not duplicate or queue. At stable Off the next click starts one boot; at stable On it starts one dissolve.
12. **Autoplay:** Reopen saved shell mode and record whether Brave permits chant playback. If blocked, visuals must still finish and reveal gameplay. Then test manual power-on: playback is attempted at the same cue; permission remains browser-controlled. Do not disable protections or use a server to bypass policy.
13. **Frameless startup:** Save Frameless, close/reopen, and confirm ordinary startup with no hardware/boot. During that running instance cycle into a shell: it should appear On without replaying boot. Recheck ordinary contrast animation, held buttons, remapping and fixed Campaign Menu footer.

Please record failures with mode, palette, browser zoom/profile/path, whether boot was automatic or click-initiated, audio outcome and the visible phase. The old shell acceptance does not establish acceptance of this new power/boot implementation.
