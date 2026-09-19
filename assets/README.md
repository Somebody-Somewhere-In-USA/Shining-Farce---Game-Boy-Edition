# Replaceable PNG assets

Runtime paths are listed in js/data/assets.js. All opaque game pixels use the four authorized colors in js/config/palette.js; transparent pixels have alpha 0 and visible pixels alpha 255. No gradients, antialiasing or extra colors are permitted in the framebuffer. Future device-shell art is separate and not implemented.

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

Prompt #8 regenerated existing palette-driven placeholder assets and added Ocean. All 31 PNGs under this directory, including historical unused assets, pass four-color validation with no partial alpha. Run `node tools/verify-palette.cjs PATH_TO_EXISTING_CANVAS_PACKAGE` for exhaustive asset and runtime color-constant checks.
