# Shining Farce — Developer Tools and Map Authoring

Copy or extract this **whole folder**, then double-click **index.html** in a modern desktop browser. No server, installation, npm, Python, terminal or build is needed to play. Campaign runtime lives in memory; reloading starts a fresh campaign from the shipped definitions. Campaign save/load UI remains deferred. Control mappings and explicitly saved editor drafts persist separately in browser storage; JSON backup and import/export are available.

Direct `file://` execution remains the runtime target. Classic scripts register on `window.GBTRPG`; definitions are external JavaScript files and local PNGs load through `Image`. There are no module imports, fetch/XHR calls, remote resources or runtime dependencies.

## Visual platform

The fixed framebuffer is **480×360**, with integer CSS enlargement and nearest-neighbor sampling. Resizing never changes game coordinates. The exactly four authorized shades are #9BBC0F, #8BAC0F, #306230 and #0F380F. Every shade is available to artwork, text and effects. Windows smaller than the native framebuffer may require scrolling at 1×.

The strategic grid uses native **16×16** units. A 1024×640 world scrolls behind a 480×312 map area with a 16px header and 32px footer. Capitals use 32px icons; bitmap text keeps its 6px advance and 8px cell. Twenty-two external PNGs supply terrain, squads, markers, cursors, text, windows and tactical placeholders. See [assets/README.md](assets/README.md) for replacement paths. There are no browser fonts in the framebuffer.

Shining Farce is Game Boy-inspired rather than hardware-emulated. Terminal, developer menus, and map editors use the same four colors and fixed framebuffer. No device shell is included.

## Developer tools and authoring — Prompt #8

Open Terminal with **backtick**. Type a command, then press Enter:

| Command | Effective runtime behavior |
| --- | --- |
| `godmode` | Toggle PLAYER HP/MP loss protection and free casting of otherwise available spells, including at 0 MP; no healing or spell grants |
| `greedisgood` | Toggle effective G costs to zero; underlying item and recruitment prices remain intact |
| `devmode` | Toggle developer access without resetting the game or modifying saves |

Close Terminal with backtick or Escape. With Devmode enabled, **]** opens contextual developer tools. Close the overlay to continue normal play. **Game State → Reset Current Game** requires confirmation and resets only runtime; controls and saved editor work remain intact.

**Edit Campaign Map** changes terrain only. Cancel opens the context menu; choose/copy a tile, move, and Accept to paint. Movement alone never paints. Menu opens tools, including Clear Active Tool and Resize Map. Resize selects North/South/East/West and a signed number of rows/columns. New cells are Ocean. Maps stay at least 30×30, keep 16px tiles, and refuse cropping locations or protected positional content atomically.

**Edit Locations** uses a separate cursor context. Cancel over a location offers Copy, Edit, Move and confirmed Delete; on empty ground choose Create Location, then Accept to place and edit. Names are editable; generated IDs remain stable through moves and renames. Copies receive new IDs. Moving preserves routes; deleting removes all connected routes. Connect toggles routes with Accept and exits with Cancel; the source and connected locations flash slowly.

Settlement, shops, tiers, recruitment race/class selections, income, appearance and quest associations have property screens. Disabling Settlement keeps its stored configuration while removing active services and allegiance. A blank location has zero income. Recruit level is not authored: new production recruit generation still needs the future story/day provider; the earlier demo tables retain their existing behavior within the allowed race/class selections.

Location properties → **Battle Maps → Create New Battle Map** creates another conditional map even when maps already exist. Choose dimensions and controlling-faction applicability; every cell starts Ocean. Map Properties adds story-key requirements and selects the North/South or East/West approach axis. Q/P cycle existing visual variants in the tile picker (current production terrain has one variant each). Movement costs belong to terrain/race rules, never painted cells.

Author six or more individual Front and Back positions for each active approach. Non-contiguous positions are supported. Front/Back is a preference: both groups use their own available positions first, then excess units use unused valid positions from the other group. No position is shared or invented, and special positions never add ordinary squad capacity. Special Deployment copies a full character definition into an editable scenario-only template with race, class, character/class level, faction and equipment. Place it on an eligible cell; Cancel on it offers Edit or confirmed Delete. Specials do not join either normal squad roster or persist into the campaign. Wilderness is a distinct hostile combat faction.

**Validate Battle Map** reports errors. **Preview Normal Battle Map** renders the terrain through the normal battle renderer without starting an interception or mutating the campaign. Full authored test-battle launch, production approach mapping and unresolved combat rules remain provider boundaries. Ocean is intentionally non-traversable and non-occupiable by ordinary units, including ordinary deployment. Flying can traverse and occupy it at 1 MOV per tile, with normal bounds, collision, expiration and AWOL rules. Campaign movement still follows explicit graph routes, without interpreting their drawn lines as terrain-cell paths.

## Save, restore and ship authored content

Editor changes remain in a separate working draft. They do not immediately rewrite the live campaign.

1. In the Dev Menu or an editor's Menu, choose **Save / Import / Export** (Dev Menu: **Editor Files / Save Import Export**).
2. **Save Working Copy in This Browser** explicitly saves the draft. **Restore Browser Working Copy** restores it after confirmation. Storage failure is visible; `file://` storage behavior varies by browser and folder.
3. **Export Editor Backup JSON** downloads a portable backup, including incomplete maps. **Import Editor Backup JSON** restores it after confirmation and validation.
4. Finish deployment authoring and validate every Battle Map. **Export Shipping Authored-Content.js** downloads the complete world, terrain, location, route and battle-map definitions as a classic JavaScript data file. Incomplete/invalid battle maps block this export.
5. Close the game. In File Explorer, copy the downloaded **authored-content.js** into this project's **js/data** folder, replacing the placeholder file with that exact name. Back up the previous file first. The browser cannot silently rewrite project files.
6. Reopen **index.html**. A new runtime now uses the exported campaign map and locations, and the battle initialization provider can select the exported maps. Existing campaign-save files are not rewritten or auto-migrated to a different authored world.
7. Distribute the whole project folder with that replaced file and all assets. No generated PNG, server, build or package install is required for data-only map edits.

Default standard Xbox button mapping: D-pad/left stick navigate, A Accept, B Cancel, RT Menu, Menu button Start, LB Select, View Terminal and RB Dev Menu. These are browser-standard button indices; controller/browser exposure can vary. Keyboard text is required for commands and text properties. Some legacy gameplay hints still show default key names after remapping.

See [PROMPT8-IMPLEMENTATION.md](PROMPT8-IMPLEMENTATION.md) for exact verification counts, schemas, boundaries, changed files and manual checks.

See [PROMPT8A-IMPLEMENTATION.md](docs/PROMPT8A-IMPLEMENTATION.md) for deployment preference/overflow and authoritative Ocean corrections.

## Controls and strategic map

| Input | Action |
| --- | --- |
| Arrows / WASD | Move the cursor; navigate menus and pages |
| Z / Enter / Space | Select / confirm |
| Q | Cycle squads on the same strategic cell; page the battle forecast |
| X / Escape / Backspace | Back / cancel an uncommitted preview |
| M / Tab or P | Campaign menu; M inspects End Day resolution |
| Backtick (`) | Toggle Terminal; Enter runs typed commands |
| ] | Contextual Dev Menu while Devmode is enabled |
| Q / P in tile picker | Next / previous variant of the selected terrain |

Keyboard and browser Gamepad API controllers share `Input.enqueueAction(action)`. Options → Controls remaps keyboard keys and controller buttons independently. Restore Defaults and explicit conflict reassignment preserve navigation. Left-stick navigation uses a 0.55 dead zone. No on-screen keyboard is included.

The cursor starts on VANGUARD. Locations have building markers and squads appear beside them. A squad uses roster slot 1's sprite; representation is not leadership, and MC membership is independent. Stationed squads have priority, then MC membership, faction and stable identity. Q cycles overlapping squads; **SQUADS HERE** also lists them. The development visibility adapter shows ZEON, with separate hooks for hidden and approximate reports.

Confirm a PLAYER squad for MOVE, STATUS and MANAGE, plus STATION when available. Ordered squads offer CHANGE ROUTE, ROUTE and CANCEL ROUTE. ZEON entries provide information. Menus flip or clamp at screen edges and capture directional input without moving the map cursor.

To move a squad:

1. Select its sprite, press Z and choose **MOVE**.
2. Move onto a destination location marker. The graph pathfinder previews a route.
3. Press Z and confirm. Cancel preserves existing orders.
4. Choose **M → End Day** to execute the day's orders.

Orders do not move squads immediately. Each squad attempts one graph edge per day. Successful multi-edge routes retain their remainder; failed movement cancels it. Pixel distance and map tiles never determine campaign travel. Shipped routes take one day; `travelDays` remains a graph weight rather than a multi-day transit simulation.

Location control is shape-coded: hollow bar for NEUTRAL, a line for PLAYER and two blocks for ZEON. Control is separate from polity allegiance. PLAYER entering undefended NEUTRAL preserves neutrality; ZEON takes control. Either faction takes an undefended opposing location. No defenders or strength are inferred from control alone.

## End Day and campaign battles

End Day runs ORDER LOCK, MOVEMENT INTENT, COLLISION DETECTION, RESOLUTION, WORLD UPDATE and DAY ADVANCE. Orders from both factions are frozen before movement intentions are built. Movement is committed as one batch after all required battles resolve; the day advances exactly once.

Route interceptions, simultaneous hostile arrivals and attacks on occupied locations pause at the battle boundary. While Devmode is enabled, **] → Test Battle Results** offers explicit test wins and eligible moving-side retreats, which submit plain `BattleResult` records. These development controls are separate from the ordinary End Day menu. A second battle may follow immediately. Reserves fight in separate encounters using one squad per side. Defeated squads are removed; independent unit records persist unless an established casualty rule applies. Retreating movers remain at their step origin and lose their remaining route; stationary retreat is not offered. Opposite-edge retreats halt both sides at their origins.

**Open Battle Map** requests production map content through the new initialization boundary. Locations can reference multiple authored static maps selected by controlling faction and required story keys; routes request a generator with biome, transition, infrastructure and midpoint metadata. No production maps, approach-direction mapping, or procedural generator are supplied by default, so missing providers produce explicit feedback and preserve the pending battle. Supplying map/rule providers connects the battle UI to the existing campaign result path. Production balance, complete result reconciliation and general recovery rules remain unresolved.

## Battle foundation — Prompt #7

Open the Terminal with backtick, type `devmode`, press Enter, close the Terminal, then choose **] → Game State → Battle Foundation Test**. This opens an isolated 30×30 battle with two squads, seeded deployment, continuous CT initiative and explicitly test-only attack/spell values. It does not modify the campaign.

Arrows move the tile cursor; Z opens actions or confirms a spell target. Movement commands share one turn's MOV. Spending movement or a Major Action does not automatically end player control: choose **End Turn**. The default attack fixture deals 20 damage to an adjacent opponent. Spell targeting distinguishes casting range from affected area. Equip, Trade and Portal use existing rule services; unresolved Skills, Steal, Item, Stance and Scrounge rules remain explicit boundaries.

The forecast includes repeated activations and every active unit; Q pages it when needed. CT freezes during control, menus, scenes and counter choices. It preserves actual overshoot: AGI 15 reaches 1005 and keeps 5 after acting. Ties use AGI, DEX, MOV, STR, then seeded randomness. Forecasting clones state and RNG and simulates known Dying/Fly lifecycle under unchanged future actions and positions.

Front/Back deployment preferences use class defaults or explicit overrides. Generated fixtures retain centered rows and independent row expansion for up to 12 units; authored maps retain individual spots with preferred-category assignment followed by legal overflow. Battle maps can be larger than 30×30. Orthogonal pathfinding respects shared MOV, terrain, occupancy and established movement abilities; a separate route planner can include friendly Portal edges. Flying overrides terrain costs/passability while retaining bounds and unit collision. Production race cost tables and AI policies are not invented.

The Battle Map and Battle Scene use separate renderers. Scenes support adjacent opponents, ranged pans, friendly/self targets, ordered AoE, reaction interjections and nested Spell Counter choices using existing external placeholders. PLAYER is left and ZEON right regardless of the attacker. Major/Minor cost and map/scene presentation are independent classifications.

Prayer retains its **25%** activation chance and resolves before Dying or a defeat decision. Spell Counter offers purchased Mage Lv1 spells, costs no MP or Major Action, and earns no CP. A generated counter spell cannot trigger another Spell Counter; other eligible reactions remain possible. Arcane Siphon retains paid-MP restoration and its 0.90 damage multiplier. Dying units cannot act or react, count down on their own scheduled maintenance turns and leave the map at death. Victory stops remaining queued mechanics; the current scene finishes before the map and banner appear.

The separate **Spell / Portal Lab** remains available for established spell, counter, Flying, Escape and AWOL demonstrations. Its balance and debug outcomes are isolated from the campaign.

See [PROMPT7-IMPLEMENTATION.md](PROMPT7-IMPLEMENTATION.md) for the complete report and remaining TBD rules.

## Development scenarios and inspection

Enable `devmode`, then use **] → Game State → Campaign Runtime Tools** for the existing campaign inspection tools. **Load Test Scenario** explicitly resets the demo and prequeues a case; it is unavailable when shipping authored world data is active:

| Scenario | Demonstrates |
| --- | --- |
| A Peaceful Travel | Granseal → Crossroads → Galam over two End Days |
| B Opposite Crossing | Grove ↔ Fort route interception |
| C Same Destination | Opposing squads approach Galam |
| D Attack Defender | PLAYER attacks the stationed fort defender |
| E Two Battles | Route interception and a separate location battle |
| F Remote Delivery | Steel Sword delivery to Aren over two days |
| G Wagon Interception | Cargo destruction without a tactical battle |
| H Lone Recruit | Unassigned travel over two graph edges |

Return to the map and choose End Day after loading a case. Default ZEON movement is unscripted and its guard holds position; scenarios use a replaceable `ZeonOrderProvider`, not strategic AI.

The normal menu inspects locations, squads, polities, routes and orders. Debug inspection includes phase, locked orders, intentions, conflicts, battle records, positions and defenders. During resolution, M opens the paged record and X closes it without unlocking planning commands. The preserved tactical movement/collision test also remains available.

## Economy, recruitment and logistics

**M → Economy** shows PLAYER G and expected controlled-location income. The demo starts at 1000 G. Income is collected once during WORLD_UPDATE after movement and control changes; NEUTRAL locations provide no PLAYER income. ZEON has a separate treasury visible through resource inspection. There are no wages, food costs or upkeep.

Select a PLAYER-controlled location marker for **SHOP** or **RECRUIT** where available. Shops use infinite stock and tier-based catalogs, a default 100% price multiplier, and confirmations showing G and item details. Granseal has four shop categories at tier 1; PLAYER-controlled Galam has tier-2 equipment. Purchases physically remain where bought.

Recruitment costs G and creates an unassigned unit at the location. Stored pools refresh every seven days beginning on day 8, with no reroll button. A replaceable upper-quartile veteran benchmark and downward variation produce demo recruit levels. Previewing stored candidates never rerolls their stats.

**M → Inventory** aggregates physical copies, including equipped and in-transit items. Squads have no generic inventory. **MANAGE → ROSTER** changes unit order and therefore the map sprite. **MANAGE → UNITS / EQUIPMENT** and **M → Units** provide equipment, personal items, transfers and travel. Same-location units may join or transfer; remote units must travel. Removing/disbanding a squad preserves independent units. Unassigned units can form a named company.

Same-location equipment changes immediately. Remote equipment explicitly requires delivery by a wagon; current equipment stays active. Wagons may carry multiple items for one unit, move independently by graph edges and follow the recipient's current destination on later planning snapshots. At delivery, replaced equipment enters inventory at the recipient's location. A wagon reaching an outdated destination waits for new planning.

Personal inventory normally holds four unequipped items. Equipped items do not consume capacity; Deep Pockets adds a slot, and capacity loss retains overflow safely. Additional acquisition still checks capacity. Supply routing uses supplied danger knowledge; the default avoids known ZEON-controlled locations, reevaluates at order lock and holds when no safe route exists.

**M → Shipments** or wagon markers show cargo, destination and progress. ZEON can intercept wagons and lone units through the same frozen movement intentions. Wagon cargo is destroyed without a battle; lone units receive the existing CAPTURED outcome and lose carried items. Nearby squads do not automatically escort them. End Day reports deliveries, income, refreshes and losses.

## Race, stats, classes and abilities

Every unit has an explicit race and Character Level. STR, DEX, CON, AGI, INT and WIS accumulate deterministic racial and class growth. A generated level-10 recruit runs nine ordinary growth events; level 1 has none. Status and recruitment pages show these attributes, MAX HP, MAX MP, MOV and DEF. Racial values and provisional capacity formulas remain in their data/config files. Innate DEF is zero; MOV and DEF do not gain ordinary level growth. Absolute race equipment restrictions remain authoritative.

Character Level and Class Level are separate. Class prerequisites use **the individual character's Class Levels**. Current CP pays for abilities; Lifetime CP determines mastery and is not reduced by purchases. Abilities are bought individually and remain learned. The ten level-based prices are 100/125/150/175/200/225/250/275/300/350 CP; explicit per-ability overrides remain supported. Initial class-entry grants remain unresolved and are not silently awarded.

Class management exposes class eligibility, CP, learned abilities and a five-part setup: current class's Primary Action, Secondary Action class, Reaction, Support and Movement. Class/equipment changes preserve physical items and retain newly illegal gear as carried copies. Bow requirements apply to Archer actions even as Secondary Action. Alchemist retains restoration, consumption, capacity and Quick Items hooks. Trade defaults to a Minor Action.

Mage has 24 purchasable elemental spells across Blaze, Freeze, Bolt, Gale, Quake and Torrent. Cleric supplies healing, explicit cures and Raise. Wizard supplies casting methods, Arcana Supports, reactions, Fly and Portal. Only one compatible casting method applies to a cast. CP receipts preserve the owning action class and Primary/Secondary/Universal attribution; passive influences do not create separate awards. Actual action CP amounts and unresolved combat formulas remain injected boundaries.

## State, compatibility and architecture

Campaign state is validated, deeply frozen and changed through atomic commands. Outside PLANNING, unrelated campaign edits and order changes are rejected. Current **schema 8** round-trips every resolution phase. Existing migration rules remain unchanged: older supported snapshots migrate deterministically, preserve queues/resources/characters and avoid rerolling stored candidates. Legacy active snapshots outside supported migration paths remain explicitly rejected.

Battle CT, event queues, scene frames, camera and cursor are transient. They are not added to campaign saves. Established Dead/AWOL result fields use the existing campaign casualty/return boundary; general recovery and full tactical resource/CP reconciliation remain deferred. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the implementation reports under `docs/` for previous cycles.

## Verification

**In game:** enable `devmode`, then **] → Game State → Run Rule Checks**. Tests use disposable state and leave the demo unchanged. The harness passes **778/778 deterministic checks**, including 42 new Prompt #8A checks, 118 Prompt #8 checks, all 80 Prompt #7 checks, the prior campaign/serialization/economy/progression suites, spell/lifecycle/Portal/AWOL tests, route-midpoint checks and updated superseded expectations.

Optional developer commands:

```text
node tools/test-foundation.cjs
node tools/verify-rendering.cjs PATH_TO_EXISTING_CANVAS_PACKAGE
node tools/verify-palette.cjs PATH_TO_EXISTING_CANVAS_PACKAGE
```

The second command uses an already available `@napi-rs/canvas`; neither command or package is needed to play. Offline checks validate all 31 PNGs under assets (22 runtime manifest entries), strict four-color opaque framebuffers, five resize cases, established campaign/menu/input flows, the spell lab, battle map/scenes, and all new editor/control screens. `verification/` contains Canvas2D renders and [results.json](verification/results.json), not browser screenshots.

Direct browser `file://` launch was not verified in this environment: the earlier attempt was rejected by the browser URL policy and no workaround was used. The local classic-script runtime architecture remains intact.
