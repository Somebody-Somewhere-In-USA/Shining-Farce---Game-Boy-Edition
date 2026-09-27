# Replaceable PNG assets

Runtime paths are listed in js/data/assets.js. All opaque game pixels use the four authorized colors in js/config/palette.js; transparent pixels have alpha 0 and visible pixels alpha 255. No gradients, antialiasing or extra colors are permitted in the source framebuffer. The optional display palette maps the four source colors at game-canvas output; it does not recolor these files or relax PNG validation. Earlier alternate output values in `js/config/displayPalettes.js` remain provisional/tunable. Dark’s reversed grayscale mapping and the separate outer companion backgrounds are established owner values. Companion backgrounds do not authorize additional source PNG colors or a global palette filter. Future device-shell art is separate and not implemented.

The game loads **22 PNGs**, ready to use without generation or build steps.

| Asset under assets/ | Size | Contract |
| --- | --- | --- |
| world/ocean16.png | 16×16 | Ocean authoring fill; ordinary occupancy blocked, Flying permitted |
| world/portal-friendly.png, world/portal-enemy.png | 16×16 each | Existing friendly/enemy Portal graphics |
| world/terrain16.png | 96×16 | Six 16px cells: grass, water, forest, mountain, road, marsh |
| world/locations16.png | 64×16 | Four 16px cells: village/port, crossroads, fort, shrine |
| world/capital32.png | 32×32 | Capital/castle; one graph node regardless of footprint |
| world/unit-aren.png | 16×16 | Unique Aren swordsman/crown |
| world/unit-swordsman.png | 16×16 | Generic swordsman |
| world/unit-healer.png | 16×16 | Healer with cross/staff |
| world/unit-mage.png | 16×16 | Mage with pointed hat |
| world/unit-centaur.png | 16×16 | Centaur body and lance |
| world/unit-orc.png | 16×16 | Horned orc |
| world/empty-squad16.png | 16×16 | Empty/debug roster flag |
| world/wagon16.png | 16×16 | Supply wagon with cargo and wheels |
| world/report16.png | 16×16 | Approximate-report question mark |
| world/cursor16.png | 16×16 | Contrasting selection corners |
| fonts/placeholder-font.png | 96×32 | ASCII 32–95, sixteen columns; 6×8 cells, 5×7 ink |
| ui/placeholder-window.png | 12×12 | Native 4px nine-slice cells |
| ui/placeholder-cursors.png | 24×16 | Menu arrow source rectangle (16,0,8,8) |
| tiles/grass.png, tiles/wall.png | 16×16 each | Original tactical terrain |
| sprites/map/hero.png | 16×16 | Original tactical hero |

Strategic art is genuinely authored at 16px; it is not a scale-up of the historical 8px files. The optional verifier checks native dimensions and that 2×2 blocks contain finer detail. Unit definitions supply reusable sprite IDs, while character definitions can override a unit's sprite. Squad art derives from roster slot 1, without a stored squad sprite field.

The static decorative tile map remains 64×40 cells, now 1024×640 pixels. Graph routes govern movement independently. Integer route lines, control indicators and stationed underlines use the central palette. Bitmap UI text and native 4px window cells remain their original size.

Optional authoring: node tools/generate-resource-art.cjs PATH_TO_EXISTING_CANVAS_PACKAGE writes the 13 strategic PNGs plus the Ocean tile using an already installed @napi-rs/canvas. The generator is not loaded by the game. Re-running it overwrites its named outputs; preserve replacement artwork first. PNG replacements require no code change when dimensions/layout match.

Older 8px/Prompt #1 PNGs remain historical and are not loaded. tools/generate-placeholders.cjs and tools/generate-strategic-placeholders.cjs are historical authoring utilities; do not run the latter against the current worldVisuals.js unless intentionally replacing the visual map. Font replacement should preserve the ASCII atlas contract or update PixelTextRenderer's mapping.

Prompt #8 regenerated existing palette-driven placeholder assets and added Ocean. That pass covered 31 PNGs. The subsequent Stage-1 acceptance correction pass validates all 37 currently present PNGs, including six user-added production frames and historical unused assets, with no forbidden colors or partial alpha. Run `node tools/verify-palette.cjs PATH_TO_EXISTING_CANVAS_PACKAGE` for exhaustive asset and runtime color-constant checks.


## Battle Scene production assets (Stage 1)

Existing assets/paths and their contracts above stay intact. Place production files directly in these **flat** directories; subfolders are not scanned:

| Directory | Content | Canvas |
| --- | --- | --- |
| `assets/battle-scene/units/` | Separate unit animation PNG frames | 128×96 |
| `assets/battle-scene/backgrounds/` | Static Backgrounds | 256×96 |
| `assets/battle-scene/floors/` | Static, never animated Battle Floors | 96×32 |
| `assets/battle-scene/effects/` | Reusable effect PNG frames | Variable; equal dimensions within each animation |

Use exactly the four colors above with alpha 0 or 255. No antialiasing. Export standard sRGB PNGs without embedded ICC/CICP profiles or nonstandard gamma/chromaticity, which the catalog quarantines to prevent color conversion. Unit names are lowercase `faction-race-class-animation-frame.png`, e.g. `zeon-human-fighter-idle-1.png`, `zeon-human-fighter-idle-2.png`, or single-frame `zeon-human-fighter-dodge.png`. Each metadata token is alphanumeric; hyphens separate tokens. Numbered frames start at 1, have no leading zeroes and sort numerically; gaps are permitted. Do not mix an unnumbered file with numbered frames of the same animation.

Effects use visual identities: `fireball-rain-1.png` / `fireball-rain-2.png`, or `blaze-1-1.png` / `blaze-1-2.png` for effect `blaze-1`. A trailing integer always means frame number; include an explicit frame suffix when the effect identity itself ends in a number. Static Background/Floor files use descriptive lowercase hyphenated names. They need not match terrain IDs. No timing, mechanics or front/back perspective goes in names.

Double-click **Update Asset Catalog.bat** in the project root. This developer operation uses an existing Node.js installation and no npm packages; playing the game needs neither. It scans these four directories plus the existing `world`, `tiles`, `sprites/map`, `ui` and `fonts` directories. Review the console and `assets/battle-scene/catalog-report.txt`, then refresh/reopen `index.html`. It overwrites only its generated catalog/report and never changes your PNGs. Invalid entries remain discoverable and unrelated valid files stay usable. Keep source artwork backed up separately.

In DevMode choose **ASSET BROWSER / BATTLE SCENE TOOLS**. Search/filter and inspect previews, then create animation definitions from valid sequences. Edit individual frame durations/order, loop and final-frame behavior. Assign real faction/race/class profiles and terrain Background/Floor through the filtered selectors. Filenames suggest metadata only; they never assign themselves. Two profiles can intentionally share a definition. Replacing a PNG under its existing name preserves its ID; renaming requires explicit reference repair in DevMode.

Source PNGs are artist-owned. `js/data/assetCatalog.js` is disposable derived data, already checked in for ordinary offline launch. Timing, effect offsets/anchors and gameplay associations belong to the editor's authored `battleScene` document, saved through browser working copy, full/Campaign JSON backups and the existing inert shipping-page publisher. No PNG bytes or generated catalog are embedded in authored JSON. Distribute the complete project, including external PNGs and the regenerated catalog. Rerun/refresh whenever files change; the browser cannot scan the directory itself.

No production scene artwork ships with this Stage-1 implementation. Old 16px sprites stay map/compatibility art. Combat continues using its existing placeholder renderer until later stages. Full contracts, validation limits, authoring instructions and manual acceptance: [Stage-1 report](../docs/BATTLE-SCENE-ASSETS-STAGE1.md).
