# Shining Farce — Game Boy Edition: Canonical Design Specification

Prepared for human review and acceptance, 2026-09-19. Consolidates the recovery adjudications through Prompt #9B, Prompt #10, and the subsequent designer clarification that explicit prevention/immunity may yield 0 damage. This document describes established design so far; it does not certify implementation completeness or record acceptance on the designer's behalf.

Amended by Prompt #10A, 2026-09-23: AoE radius means literal Manhattan radius throughout this specification. Existing affected shapes/tile counts, casting ranges and processing order are unchanged.

Amended by Battle Scene Asset Pipeline Stage 1, 2026-09-25: production asset contracts, authoring/persistence and approved future presentation architecture are integrated in §5/28/29; remaining scope is tracked in TBD-061 and M-034.

## 1. Purpose, authority and status

After review and acceptance, this specification is the authority for **design intent**. The Git repository is the authority for **implemented behavior**. The [Recovery Ledger](docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md) preserves provenance, history, superseded decisions and recovery findings. Development guidance in [README](README.md) and [ARCHITECTURE](docs/ARCHITECTURE.md) describes implementation and future development work. Dated handoffs and implementation reports are historical records; they do not override accepted design.

There is no clearly current document named “Codex Development Handoff” in the repository. The latest named handoff is the historical After Prompt #7 DOCX. No replacement handoff is invented here. The maintained development documents carry the authority instructions.

Use these distinctions throughout:

| Status | Meaning |
| --- | --- |
| **ESTABLISHED** | A current design decision. Declarative rules below have this status unless qualified. |
| **PROVISIONAL** | A deliberately retained working design value subject to tuning, not final balance. |
| **TBD / DEFERRED** | Undesigned detail or deliberately deferred work. Absence is not permission to invent. |
| **IMPLEMENTED BUT NOT ESTABLISHED DESIGN** | Current behavior, fixture or compatibility detail; not a design rule. |
| **KNOWN IMPLEMENTATION MISMATCH** | Code omits or contradicts an established rule. See §31. |
| **DEPRECATED / SUPERSEDED** | Historical only; no longer a current alternative. See §32. |

An ability's existence, category and unlock can be established while its magnitude or execution remains TBD. A future concept can be preserved without committing to a complete future class or content catalog. Stable ledger IDs identify provenance, not competing authority. The [Prompt #10 report](docs/PROMPT10-DOCUMENTATION-REPORT.md) provides the coverage audit.

## 2. Iterative design methodology

A system may only be designed to the level required by the systems that currently exist. Later systems may expose requirements that require earlier systems to be extended, clarified, or revised.

An unfinished formula is not automatically lost design; an unspecified interaction is not automatically a documentary omission. Future classes, spells, items and effects may require legitimate amendments to earlier rules. Record accepted amendments here, retain their provenance, identify affected implementation and tests, and preserve unresolved dependencies explicitly. Do not infer designer approval from a passing test or a non-null data field.

Prompt #9B closed all 15 recovery records. **There are zero active NEEDS RECOVERY items.** Production Battle Scene art, race × terrain values, full future-class tables, production equipment, Combat Rating mathematics, detailed Main Character defeat, full battle reconciliation/mid-battle saves and grand campaign content were never completed. Refine's detailed mechanics were deferred. These are future design work, not reopened recovery failures.

## 3. Terminology

| Term | Meaning |
| --- | --- |
| Campaign Map | Graph world: locations, routes, squads, travel, control and interceptions. |
| Battle Map | Tile battlefield containing individual units. |
| Battle Scene | Cinematic presentation of an action-resolution chain; animation does not decide rules. |
| Character Level / XP | Overall permanent character progression. |
| Class Level / Lifetime CP | Individual mastery in one class. |
| Current CP | Spendable class-specific currency for individually purchased abilities. |
| Primary / Secondary Action | Access to purchased Actions from the current class / one other selected class. Not separate Major budgets. |
| Action Ability / Major Action | Ability category / turn-economy classification. Not interchangeable. |
| Minimum Range / Minimum Safe Range | Selection boundary / selectable region with an explicitly weapon-specific consequence. |
| Wilderness location / Wilderness faction | Non-settlement location / hostile unaffiliated battle participants. Neither means neutral polity allegiance. |
| Light Bow / Heavy Bow | Distinct weapon types with future different statistics. No numerical weapon-weight system. |

Use **Fairy**. Historical Pixie refers to Fairy in this project. Use Battle Map rather than introducing “tactical map” as canonical terminology. Existing code filenames may retain older vocabulary. Small/medium/large **stat-growth amounts** mean +1/+2/+3; this does not define equipment statistics. Provenance: ledger R03, R08-14.

## 4. Runtime and distribution

The game is browser-based, Game Boy-inspired rather than hardware-emulated. Distribution is **ZIP → extract the whole folder → double-click `index.html`**. Playing requires no server, install, npm/build process, terminal or dependency setup. Use vanilla classic JavaScript registered on `window.GBTRPG`, external local JavaScript definitions and local PNG assets. Do not introduce ES-module imports, runtime fetch/XHR, remote resources or runtime dependency architecture.

Separate data, game rules, campaign state, rendering, input and development tooling. Logical input actions accommodate keyboard/gamepad and a possible future touch host; mobile/Android packaging and touch UI remain deferred. Deterministic state changes, reproducible random outcomes and validation are established architectural goals. Particular class names, PRNG constants and storage keys are implementation details.

Campaign definitions and runtime facts remain separate. Rule commands validate and commit atomically; public views and post-commit events must not let renderers/UI rewrite authoritative state. Battles receive detached scenario data and return validated result data. The implementation uses frozen views and clone/validate/commit transactions; exact object layout is not prescribed as game design. The future mobile host concept uses a handheld overlay and bottom virtual controls outside the game framebuffer; desktop keeps a clean game viewport. Host-shell colors never authorize extra framebuffer colors.

Current verification has exercised classic-script loading and offline Canvas2D rendering. Direct double-click browser play and physical controller operation remain unverified in that evidence; this is a verification limitation, not a change to the runtime target. Provenance: R02.

## 5. Visuals, input and Battle Scene presentation

The true logical framebuffer is **480 × 360**, enlarged by integer scaling with nearest-neighbor sampling. Resizing does not change game coordinates. Canonical source assets and the rendered source framebuffer use exactly `#9bbc0f`, `#8bac0f`, `#306230`, `#0f380f`. Every shade is available to artwork, text and effects. Transparent asset pixels are allowed; partial-alpha blending, antialiasing, gradients, extra shades and browser fonts in the game framebuffer are not. Use bitmap text and pixel-aligned UI.

A separate display palette maps those four canonical shades to four explicit output colors for the complete logical framebuffer, including sprites, text, menus and procedural effects. Canonical display reproduces the source colors. A less-yellow, desaturated Game Boy-style option with greater separation between its two lightest shades, and blue/red/purple/amber options, are supported; grayscale and Dark are also implemented. The pre-existing alternate framebuffer artistic values remain provisional owner-tunable configuration, not canonical source colors. Dark is established as the explicit reversed grayscale mapping `#242424`, `#666666`, `#aaaaaa`, `#e4e4e4` in canonical input order; it is not mathematical RGB inversion. Source PNGs and their validation remain unchanged. The transform applies only to the 480 × 360 game framebuffer; the page background separately takes an established companion color from the selected palette. Canonical: `#6d8508`; Game Boy: `#9bb393`; Blue: `#a0b9be`; Red: `#a27070`; Purple: `#927d99`; Amber: `#c7b17a`; Grayscale: `#8f8f8f`; Dark: `#2b2d31`. These companion values are established owner design, not provisional. The background is an explicit outer presentation property, never a body/page SVG filter. Any future shell/bezel is separately authored and stays outside the framebuffer transform. This does not authorize implementing a shell. Provenance: Stage-1 Manual Acceptance Corrections & Display-Palette Enhancement prompt (2026-09-26).

Campaign Map tiles, map units, cursors, wagons and ordinary markers are **16 × 16**. Battle Map tiles and map units also use 16 × 16. A Centaur occupies one cell. The established capital marker is 32 × 32 and still represents one graph node. Existing atlas layouts are maintained asset contracts documented in [assets/README](assets/README.md), not inferred production Battle Scene specifications. Sample world dimensions, viewport subdivisions, bitmap atlas dimensions and placeholder enlargement are implementation details.

Campaign terrain, locations, routes and squad display offsets are separate layers. Control/stationing/stack indicators communicate distinct facts. Planned routes differ visibly from confirmed routes. Stack cycling and spatial cursor/camera navigation must not alter underlying graph geography.

### Input and editor interaction

Keyboard and gamepad feed the same logical actions. Remap devices separately, handle conflicts by explicit reassignment or cancellation, preserve required navigation, and allow restoring defaults. Persist controls independently of campaign/editor state. Text entry uses the keyboard. Current defaults are **implementation-facing mappings**, retained in README: arrows/WASD navigation; Enter/Space/Z confirm; Escape/Backspace/X cancel; Tab/M menu; P start; Q select; grave terminal; `]` developer menu. Gamepad defaults are D-pad/left stick, A confirm, B cancel, RT menu, Menu start, LB select, View terminal and RB developer menu. Thresholds and repeat timings are implementation tuning.

During ordinary gameplay logical Select cycles display palettes. Existing contextual Select functions in menus/editors and other contexts take precedence. Display selection is an independent user preference, never campaign state, EditorDocument content or shipping authored data. Cycle order is Canonical → Game Boy → Blue → Red → Purple → Amber → Grayscale → Dark → Canonical. Options navigation previews both framebuffer and companion background immediately without saving; Accept commits/persists the candidate, and Cancel restores the palette active when editing began. Only the palette identity is persisted. Normal full-screen scrolling lists keep their control legend at a fixed bottom/footer position. Capacity is derived from the space above it, reserving at least one complete blank list-row. Short lists leave unused space above the footer; their item count never moves it. Popup/page layouts and editor PropertyScreen geometry are unaffected. This supersedes the earlier moving-footer interpretation (Stage-1 Final Menu-Footer Correction). Provenance: Stage-1 Post-Acceptance Follow-Up prompt.

Property screens navigate while unfocused. Accept toggles booleans; number/enum fields edit a draft, Accept commits, Cancel restores. Cursor movement alone never paints; Accept paints, Cancel opens context and Menu opens tools.

### Battle Scenes

Adjacent interactions begin with the darkest palette shade, fade in the battlefield while actor and target slide in together, idle about 1 second, perform action/hit reactions, hold results about 2.5 seconds, fade out and return to the Battle Map. PLAYER appears left and ZEON right regardless of initiator; unaffiliated opposing combatants must also be presented on opposing sides.

Ranged and friendly interactions show the actor beginning the action, transition to the target shot, display the effect, then return to the actor/results. The Battle Scene Stage-1 amendment refines the older continuous-background wording: whip-pan is a staged shot transition, not a camera over one giant continuous world. Self-targeting uses one actor sprite. Multi-target actions visit targets sequentially; all targets need not appear simultaneously. Reaction presentation may temporarily visit a reacting unit and return to the parent composition without losing context. This does not authorize interrupting a primary sequence with gameplay retaliation (§21–22).

When battle conclusion becomes authoritative, further mechanics stop. Started presentation may finish, return to a map frame and show the result banner. Provenance: R04–05, R26; Battle Scene Asset Pipeline Stage-1 amendment (2026-09-25).

#### Production assets and animation foundation — established, Stage 1 implemented

Production unit animation frames are separate **128 × 96 PNGs**. Backgrounds are static **256 × 96 PNGs**. Battle Floors are static **96 × 32 PNGs**, never animated. Effects have variable canvas dimensions; all frames within one effect animation have identical dimensions. There are no mandatory Small/Medium/Large effect classes. All obey the existing four-color/binary-alpha rule. Historical map sprites and enlarged scene placeholders do not satisfy these contracts.

Unit filenames identify faction, race, class, animation and optional positive numeric frame order: `[faction]-[race]-[class]-[animation]-[frame].png`. A single frame may omit the suffix. Filenames carry visual identity, not timing, rules, perspective or choreography. Effect names identify reusable visuals; action identity does not imply exclusive ownership of an effect. Replacement under the same filename preserves identity; renaming creates a new identity and leaves old references unresolved until explicitly repaired. No image-similarity matching or silent reassignment.

Unit and effect definitions share ordered frames, independent duration per frame, looping and final-frame behavior. Animation timing remains authored tuning. Each configured combat-capable unit presentation requires **Idle and Attack**, with optional **Dodge**. Idle is the resting animation; Attack is the ordinary physical action animation and future default for actions with no override. No complete Cast/Hurt/Heal/Death role taxonomy is established. Explicit faction/race/class associations are authoritative and may share an animation; filename inference only assists selection.

Background and Floor associations belong to **Battle Map terrain definitions**, independently, with no Stage-1 per-map overrides. The target's occupied terrain chooses the Background. Each displayed PLAYER-controlled participant's own occupied terrain chooses its Floor; non-player participants never receive Floors. Neither asset filename must match its terrain ID. Effects support participant-relative or 256 × 96 viewport-relative anchoring and authored offsets; full-screen/UI anchoring is not established.

Authored readiness rejects missing Idle/Attack, unresolved required Backgrounds, invalid required PNGs and unresolved required references. Readiness checks and publishing must independently establish current required external PNG availability without relying on prior preview or scene loads; optional Dodge, Floor and graphical-effect fallbacks remain permitted. Recoverable drafts may retain missing artwork. Runtime presentation falls back from a missing requested animation to valid Idle, then a conspicuous safe placeholder; missing Background uses a generic safe presentation; missing Floor draws no floor. Optional Dodge uses a procedural movement/jitter fallback returning to its anchor. A reusable **character-clipped shine** needs no PNG: its moving palette highlight is clipped to opaque pixels of the current character frame. It is the future default for skills, spells, items, status changes, restoration and similar non-ordinary-damage actions lacking a bespoke effect. Ordinary physical damage uses impact/jitter. Stage 1 supplies lookup/configuration identities; choreography and combat activation remain future work.

#### Presentation and authoring — established, planned for Stages 2/3

PLAYER normally stages left/lower and the non-player opponent right/upper. Non-player pairs may use appropriate mirroring/staging. The renderer must support horizontal mirroring and explicit staging overrides without requiring mirrored source art. Center the 256 × 96 battlefield horizontally in the 480 × 360 framebuffer. Surrounding persistent UI includes upper/lower unit information and a lower Battle Message Window beside the lower unit window. The discussed 88/96/176 vertical composition is guidance, not final canonical rectangles or anchors.

Unit information displays HP, MP, Character Level, Class and inspectable active statuses. PLAYER additionally displays XP toward the next Character Level and CP progress within the current Class Level threshold interval, even if underlying CP remains lifetime cumulative. Do not invent thresholds. Overflowing status text starts at the beginning, pauses, slides horizontally, pauses at the other end, then slides back repeatedly; timing is tuning.

HP/MP bars use 100-point layers: first `#8bac0f`, second `#306230`, third `#0f380f`. Damage removes dark layers to reveal lighter ones. Current/MAX numerals remain authoritative. Generic behavior above 300 is unresolved; Zeon's exceptional eventual off-screen-length full-strength HP bar is a special concept, not the general rule. Resolved damage combines sprite impact jitter, HP-bar shake, gradual depletion and numerals changing with depletion. Jitter uses small randomized anchor-relative displacement/direction and returns exactly to the anchor without drift. Bespoke Hurt artwork is unnecessary.

An acting animation may hold its final frame until the action presentation explicitly releases it to Idle; this state persists while temporarily off-screen. Messages append to a scrolling event log and push older entries upward. At completion, Up/Down inspects history and Accept exits. Intermediate automatic/Accept advancement is still unspecified; preserve the approximate adjacent idle/result beats already established above without inventing advancement policy.

The future DevMode Sequencer uses the real renderer, developer-selected test participants/data, full playback, preview from a selected point and single-block preview without mutating campaign state. Sequential semantic blocks may contain overlapping/parallel events. Initial concepts include opening/closing, message, unit animation, participant movement, effect, whip-pan, impact, resource-bar animation, wait, participant iteration and conditionals; this is not an exhaustive new block catalog.

Global compound blocks compose primitives and other compound blocks, reject cycles and may expose parameters. Reuse is reference plus parameters; divergence is duplication plus independent editing, without deep inheritance. Named Battle Scene Templates can be authored, previewed, duplicated and associated with actions. Actions can share templates with supported parameters. Templates use semantic roles resolving to individual participants or arbitrary-size collections, such as Attacker, Defender, Current Target, Secondary Target and Covering Fire Units; there is no three-participant cap. Collection iteration follows canonical mechanical target order. Branches inspect already resolved hit/dodge/critical/death/reaction/collection facts and never roll or decide mechanics.

Deterministic arbitrary scrubbing reconstructs state from sequence start rather than reversing mutable execution. Message placeholders receive resolved names, damage, XP and CP; a future selector exposes supported placeholders and readiness validates them. Syntax remains an implementation choice.

Whip-pan moves the outgoing shot's Background/participants out and the incoming shot in. Each incoming target shot uses that target's terrain Background. Floors follow displayed PLAYER participants and their own terrain. Action-frame holds persist across shots. Mechanical map positions do not imply one giant presentation world. The illustrative Blaze 2 pattern (caster hold, each target in mechanical order, then return and release) establishes direction without specifying or implementing a spell sequence. Actions may compose any number of reusable effect instances, simultaneously or sequentially, combining participant/viewport effects, shine, jitter and shot transitions.

#### Remaining design/tuning boundaries

Exact player/enemy anchors, slide speeds, pan duration/easing, ordinary frame timings, shine speed, jitter parameters, effect offsets, UI rectangles, production frame counts, full future roles/presentation catalogs, placeholder syntax and generic >300 bars remain unresolved or tunable. Tool language and internal file/class/JSON names are implementation choices. Stage 1 is not a production renderer, sequencer or combat integration; existing scenes remain compatibility placeholders.

## 6. Campaign, squads, factions and future systems

The narrative centers on the Main Character (MC), recruitment and polity support against demon king Zeon, with defeating Zeon as the finale concept. PLAYER and ZEON are the strategic conquering factions. Other polities are neutral or supporting, rather than independent map-painting armies. Wilderness is hostile to PLAYER and ZEON and friendly to itself in battle; it is not a third strategic treasury or a neutral polity.

Polity allegiance and individual location control are separate. Pledged support converts a polity's non-Zeon-held locations to PLAYER control; occupied locations remain ZEON until liberated. PLAYER arrival alone does not annex a neutral location. ZEON can conquer neutral locations, and either strategic faction can capture undefended opponent-controlled locations. Hostile-defined effects use actual hostility where applicable, including Wilderness. This does not rewrite unrelated specifically faction-defined mechanics.

Squads contain at most **12** units. Ordered membership is authoritative and player-reorderable. Slot 1 determines the Campaign Map squad sprite; it does not redefine MC identity or create a leader mechanic. Overall roster cap is not finalized. Same-faction squads can co-locate, but only one stationed squad per faction defends at a location. Retain the existing eligible defender; oldest arrival selects a replacement when necessary, with deterministic ties. Manual stationing is allowed. Reserves fight separate squad pairs, never an automatically merged force above 12.

Co-located join/transfer/create is immediate, subject to faction, active state and capacity. Remote units travel physically. Dismissal leaves independent units locally; defeat removes the squad while independent records follow applicable casualty rules. Lone units travel separately. Authored special battle units are separate from ordinary starting rosters; their presence does not automatically recruit them or establish persistent story state.

### Preserved future campaign concepts — detail deferred

Petitioning has a physical MC presence requirement, separate eligibility and chance, and contemplated Trust, Reputation, Fear, Zeon Pressure, Confidence and story inputs. A failed petition can be retried next day without an automatic day cost or generic trust penalty; scripts can grant support. Numerical willingness, liberation/recovery and complete diplomacy remain TBD.

Wilderness encounters are contemplated per player squad/route edge/day, with strength based on geography/danger rather than player scaling. Zeon suppression, encounter chance/tables, traveler exclusions and win/retreat travel consequences remain provisional or TBD. A suggested radius of 2 is not finalized.

Strategic Zeon AI should use legitimate observations and last-known information, persistent missions, geography, objectives and treasury-aware preparation/recruitment/equipment. It must not read hidden player orders or wagon destinations. Difficulty improves judgment rather than granting knowledge cheats. Rumor/intel quality may depend on settlement trust, fear, control, reputation and frontline conditions; actual and known state stay separate. Exact policies and aging/accuracy remain TBD.

Quests have availability, source, objectives, completion/failure, rewards and dialogue. MC generally accepts settlement quests physically; any player squad can fulfill objectives unless an authored MC requirement applies. Reusable objectives include travel, defeat, liberation/defense/control, obtain/deliver, recruit/talk, support, survival and escort. Campaign events drive progress without quest-specific conditionals embedded in movement/combat. Temporary Event Sites support route/wilderness encounters and discoveries. Rewards use existing systems, generally without quest-completion XP/CP; failure occurs only when authored. A journal distinguishes actual/known and active/completed/failed states. Full quest/event/NPC/treasure language and content are deferred.

Jewel concepts: Light has a fair race to acquisition, physical squad carriage and MC transfer; Zeon can deliver it to controlled Granseal for a ritual. The approximate three-polity trigger, ritual duration/reset/interruption and location design are not final. Evil appears after Zeon's return through rare quest/monster discovery. Two dedicated artifact slots are separate from ordinary gear. Jewels cannot be sold, discarded, deposited or sent by wagon; retreat retains them. Destruction/drop fallback and detailed acquisition remain TBD.

Tactical AI should pursue high effective harm and vulnerable targets, intelligently use damage, permit worthwhile friendly-fire sacrifice and avoid movement traps/oscillation. Production candidate generation and utility weights remain TBD. Demo hold orders, attack-for-20 and first-eligible counter choice are fixtures. Grand campaign geography, narrative and authored content were not previously designed in full. Provenance: R14, R29–30, R16-07, R33.

## 7. Locations, travel, End Day, economy and logistics

Travel follows a **graph of locations and route edges**, not terrain cells or pixel distances. Queueing and confirming a path consume no time. End Day attempts the next edge; successful remaining orders persist, while failed/retreated orders cancel. Multi-day movement inside an edge is not established by a route's current pathfinding weight. Painting Ocean beneath a drawn route does not change graph availability. Routes can carry explicit availability/story-block conditions; manual waypoints and any future terrain/route policy remain deferred.

Opposite-direction encounters occur at the **exact route midpoint**. For a route of length L between A and B, distance to settlement S is `L/2 + min(D(A,S), D(B,S))`; preserve fractional distance. Do not substitute the origin endpoint or screen coordinates.

Locations have stable IDs independent of names, position and appearance. Current settlement types are **Village, Town, City, Fort, Castle**; architecture remains extensible. Wilderness location mode has no active settlement services. Appearance does not determine settlement type. Multiple static Battle Maps may reference one location. Existing controller/story-key condition selection is a foundation; a broader condition language and priorities are TBD.

### Simultaneous campaign day

`PLANNING → ORDER LOCK → MOVEMENT INTENT → COLLISION DETECTION → RESOLUTION → WORLD UPDATE → DAY ADVANCE → PLANNING`.

Freeze both sides' orders before constructing intentions. Resolve route interceptions, simultaneous hostile arrivals and attacks on stationed defenders from the frozen state, with route conflicts before node conflicts and deterministic ordering. Pause/resume for each battle; keep reserves separate. Commit movement/defeat consequences in a common batch, then advance the day **exactly once**. Unrelated planning edits cannot change a locked resolution. Replay must not reroll committed outcomes.

Movement/traveler consequences, arrival control, delivery/equipment, income, recruit refresh and AWOL processing are coordinated world updates. AWOL destination eligibility must be reevaluated **each campaign day until return**, not only on its due day (§23). The current detailed update ordering is documented in ARCHITECTURE; it does not establish universal priority for future systems.

### Economy and physical logistics

**G** is the general material currency, with separate nonnegative integer PLAYER and ZEON treasuries and eligible controlled-location income on World Update. No wages, food or upkeep. Starting funds, incomes, prices, modifiers and rounding defaults in the demo are not final economy balance.

Shops have infinite stock by category/tier, include lower tiers, require PLAYER control in the established foundation and consume no campaign time. Purchases create a physical item at that location. Categories are Consumable, Weapon, Armor and Accessory. Authoring supports independent enabled/tier settings and shared defaults. Detailed discounts, neutral trade, squad-presence policy and Zeon spending remain TBD.

Ordinary recruits cost G at PLAYER settlements and remain physically there. Pools refresh every **7 days**, first refresh on day 8, without a normal reroll option. Store candidate identity, stats and growth; previewing, recruiting or saving never regenerates them. Production recruit-level/rarity/count/price formulas remain TBD. The current upper-quartile benchmark and base-plus-level prices are replaceable development approximations. Otherwise comparable **Alchemists cost less to recruit than Clerics**: consumables require replenishment while Cleric MP is renewable through normal recovery. Exact price relationship is TBD; this establishes neither passive MP regeneration nor post-battle refill.

One inventory view aggregates individually identified physical item copies. An assigned recipient is intent, not another physical container. No generic squad inventory or teleportation. Remote assignment dispatches independent wagons, with common origin/recipient consolidation; old equipment remains active until delivery. Wagons follow later frozen recipient plans, wait at outdated destinations, and hold when no known safe path exists. Routing uses legitimate danger knowledge rather than hidden enemy truth. Nearby friendly squads do not implicitly establish an escort system.

**IMPLEMENTED BUT NOT ESTABLISHED FINAL DESIGN:** intercepted wagons currently lose cargo without a Battle Map, and intercepted lone units become CAPTURED and lose carried items. These temporary outcomes do not finalize escort, capture, survival or loot systems. Provenance: R15–18, R17, R29.

## 8. Battle Map and battle creation

A location meeting or opposite-route interception creates a detached Battle Map with exactly one ordinary squad per side initially, each at most 12, plus separately authored specials. Location encounters may select static maps; route encounters request procedural maps using midpoint, route biome/transition and infrastructure information. Mixed biomes, roads and bridges are intended generator inputs, not a completed production generator.

Battle Maps have a minimum **30 × 30** cells, may be larger and have no arbitrary maximum designed. A cell identifies terrain/type and a visual variant. Movement cost is resolved from terrain/race rules, never arbitrary per-cell cost metadata. New/expanded cells are Ocean. Distinct visual variants may share mechanics; stairs-as-road is an example, not a newly shipping variant.

Maps retain identity, dimensions, cells, conditions, opposing N/S or E/W approaches, per-side Front/Back positions, special deployments and protected required points. Required points are positional metadata, not automatically spawned units. Campaign approach-to-compass mapping and production deployment depths remain TBD/provider-driven. Missing content/orientation/providers must remain explicitly unresolved and preserve the pending campaign battle, rather than inventing content.

Draft validation permits incomplete authoring. Shipping/battle readiness requires valid dimensions, known terrain/variants, compatible conditions, deployment capacity, complete specials and unique eligible coordinates/IDs. Invalid crop/paint operations fail atomically. A preview uses normal rendering without mutating campaign state. The legacy 10 × 9 numeric-cell test map is historical fixture data, not an exception to the minimum. Provenance: R19–20.

## 9. Terrain, movement, Flying and Portal

Current identities include road, grassland, forest, mountain, desert, river, stone, bridge; impassable mountain, river, lake, wall, tree and cliff; and Ocean. Ordinary mountain/river differ from their impassable variants. **Normally traversable tiles cost base 1 MOV plus the unit's racial terrain modifier.** Exact race × terrain modifiers were never designed. No universal varied terrain-cost table replaces this architecture.

Movement paths are orthogonal. One effective MOV budget is shared across repeated Move commands during the turn. Respect bounds, traversal legality and occupied endpoints; friendly occupied cells may be intermediate cells but not endpoints. Hostile units block ordinary passage, including **hostile Dying units**. Friendly Dying units permit passage but still occupy their tile. Flying retains these bounds and collision rules.

Flying costs **1 MOV on every terrain**, may traverse/occupy normally impassable terrain including Ocean, and does not grant collision immunity. Ordinary non-Flying units cannot traverse, occupy or deploy on Ocean. Birdfolk and Fairy are innately, permanently Flying. Independent temporary Fly sources can coexist and expire without removing innate Flying. No Aquatic, swimming, boat or additional race exception is established.

Fleet-Footed can combine two consecutive legal perpendicular orthogonal steps for 1 MOV total; both steps must be legal. Detailed composition with future racial surcharges remains TBD. Pathfinding and route execution use the same legality and remaining budgets; Portal planning must avoid zero-cost cycles. Destination scoring and pathfinding are separate concerns.

### Fly

Wizard Lv8 Fly supplies a source-specific Flying effect for **3 affected-unit turns**, counted at their turn ends; refreshing a source does not erase other sources. Expand is compatible; Focus/Overcharge are not; Extend compatibility remains TBD. Production range, area and MP are TBD.

If the **final** Flying source ends on illegal ordinary ground, normal actions are gated. Escape on the next turn can move to one of eight adjacent normally occupiable empty cells. If none exists at the initial check or next-turn recheck, the unit becomes AWOL. Expiring temporary Fly on an innately Flying unit never triggers this sequence. The current escape helper preserves budgets and awards no CP; future baseline-action qualification must be clarified before changing it (§13).

### Portal

Wizard Lv9 Portal creates two distinct endpoints within range **4**; the caster's tile is permitted. Its single-tile effect has Manhattan radius 0. Extend makes range **5**, MP ×1.10; other casting methods are incompatible. MP cost remains TBD. Endpoints cannot overlap another pair. One pair per caster; a valid recast replaces that caster's pair only.

Occupied endpoints force transfer/swap, including Dying, Frozen, Stunned or Immobilized occupants, without curing them. Voluntary entry is friendly-only, requires an empty exit, and spends no MOV or Major Action. These explicit Portal constraints remain despite general allegiance-flexible spell targeting. Portal lasts **3 subsequent caster turns**, skipping the casting turn. Dead-caster cleanup and unfinished impairment interactions remain TBD. Provenance: R22, R12-10, Prompt #10 §§6.25–26.

## 10. Deployment

Front/Back is an initial placement preference only; it grants no stance, stat bonus or lasting targeting restriction. Front is nearer the enemy, Back behind it. Generated rows center vertically for E/W and horizontally for N/S, expand independently above six units and do not shrink the other row. Production row depths remain TBD.

Authored Front/Back spots may be noncontiguous and need not form rows or rectangles. Every required side needs **at least 6 Front and 6 Back** spots even if its actual squad uses only one designation. Ordinary pools must be on base-traversable terrain; Flying participants do not make Ocean ordinary-pool spots legal. Explicit legitimately Flying special deployments may use Ocean.

Validate all ordinary pools and special coordinates before placement, including unused spots. Group ordinary units by preference, preserve group order and use deterministic seeded unit-valid unused selection. Perform the Front preferred pass, then Back preferred pass. Only after both groups have had their preference opportunities, place queued overflow into unused valid spots of either category on the same side. Thus 7 Front/1 Back reserves Back preference before Front overflow; 12 Front may use six Front plus six Back.

All units receive unique legal coordinates. Specials use explicit separate coordinates and never supply ordinary capacity. Fail the complete assignment when capacity or eligibility is insufficient; do not drop units or invent spots. The current greedy algorithm does not establish a general matching guarantee for arbitrary future restrictions.

Explicit unit override precedes class metadata and configured defaults. Fighter/Knight/Paladin default Front; Mage/Archer/Cleric/Thief default Back. Alchemist/Wizard defaults remain TBD. Provenance: R21, Prompt #8A.

## 11. Units and races

Ordinary races are **Human, Elf, Dwarf, Centaur, Birdfolk, Beastman, Fairy**. Identity and physical location are persistent. Squad membership derives from ordered membership, rather than duplicate unit/squad authorities. Derived stats are recomputed from authoritative character/equipment/effect data.

Racial restrictions outrank class/support permissions. Beastman cannot equip weapons or armor; accessories are allowed. Do not invent natural DEF compensation or a universal additional shield rule. Birdfolk/Fairy Flying is established (§9). Fairy's innate single-target debuff cure is an established concept; display name, category, range, cost, cooldown and condition taxonomy are TBD.

Secret/future concepts **include** Goblin, Construct, Phoenix, Dragon and Pegasus Centaur. The roster is open-ended: any may be omitted/revised and others added. Their individual stats, abilities, recruitment, unlocks, restrictions and content are TBD. The general race/class compatibility matrix is also TBD. Orc art using Human demo stats does not create another ordinary race or biological rule.

### Provisional racial balance

All starting/growth ranges, MOV and HP/MP offsets in the following table are **PROVISIONAL**, not final racial balance or terrain modifiers. Tuple order: STR, DEX, CON, AGI, INT, WIS. Inclusive rolls are independent. Provenance: R07-01–07.

| Race | Starting ranges | Growth ranges per Character Level | MOV | HP / MP offsets |
| --- | --- | --- | --- | --- |
| HUMAN | 8–12; 8–12; 8–12; 8–12; 8–12; 8–12 | +1–2; +1–2; +1–2; +1–2; +1–2; +1–2 | 5 | 0 / 0 |
| ELF | 7–10; 10–13; 7–10; 10–13; 10–13; 10–13 | +0–1; +1–3; +0–1; +1–3; +1–3; +1–3 | 5 | -4 / 8 |
| DWARF | 10–13; 7–10; 10–13; 7–10; 7–10; 8–12 | +1–3; +0–1; +1–3; +0–1; +0–1; +1–2 | 4 | 6 / -4 |
| CENTAUR | 10–13; 8–12; 8–12; 10–13; 8–12; 8–12 | +1–3; +1–2; +1–2; +1–3; +1–2; +1–2 | 7 | 4 / 0 |
| BIRDFOLK | 8–12; 11–14; 7–10; 11–14; 8–12; 10–13 | +1–2; +2–3; +0–1; +2–3; +1–2; +1–3 | 7 | -4 / 0 |
| BEASTMAN | 10–13; 7–10; 8–12; 10–13; 8–12; 7–10 | +1–3; +0–1; +1–2; +1–3; +1–2; +0–1 | 5 | 4 / 0 |
| FAIRY | 8–12; 7–10; 5–8; 11–14; 10–13; 11–14 | +1–2; +0–1; +0–1; +2–3; +1–3; +2–3 | 7 | -10 / 6 |

## 12. Stats and permanent growth

| Stat | Established responsibilities |
| --- | --- |
| STR | Melee physical damage and opposing physical dodge comparison. |
| DEX | Ranged physical damage and opposing physical dodge comparison. |
| CON | MAX HP, physical-debuff resistance and end-of-day recovery. Resistance/recovery mathematics TBD. |
| AGI | CT, physical dodge, single-target offensive spell dodge and Double Attack. |
| INT | MAX MP, spell damage and aimed offensive spell comparison. |
| WIS | Healing, eventual buff effectiveness and mental/magical-debuff resistance. Other detailed interactions TBD. |
| MOV | Racial MOV + current-class modifier + equipment/effects, minimum 0; does not ordinarily grow. |
| DEF | Normally innate 0 plus equipment/effects; does not ordinarily grow. |

The retained **PROVISIONAL** capacity formulas are `MAX HP = max(1, 10 + 2 × effective CON + racial HP offset + direct modifiers)` and `MAX MP = max(0, effective INT + racial MP offset + direct modifiers)`. Normal HP/MP capacities derive from primaries; explicitly designed direct modifiers are permitted.

Each Character Level after level 1 adds six independent inclusive racial growth rolls plus the fixed current-class and equipped growth-support bonuses. Gains accumulate permanently. Changing class does not recalculate prior growth. A level N generated character has N−1 growth events through the same engine; stored recruits never reroll. Deterministic per-character randomness persists; the exact PRNG is implementation, not design. Character Level 100 is the current supported implementation cap, not separately ratified final balance.

The future Summoner explicitly adds **+2 MAX MP directly** per Character Level receiving applicable Summoner class growth, not +2 INT. No other class exception is inferred. Conditions, Hexer/Enchanter spells and detailed WIS buff/debuff formulas remain dependency-blocked future design. Provenance: R06, R08-14, Prompt #10 §11.

## 13. Character XP, Class CP and loadout

Character Level and Class Level are separate. Each Character Level requires **100 XP**, with no escalating threshold. Maximum XP from one action is **49**; killing an enemy of equal relative power awards **49 XP**. Combat Rating, power comparison, unequal-opponent scaling and complete award mathematics are TBD.

An acting unit receives **1 XP and 1 CP for taking an action**, including deliberately targeting a truly empty tile and accomplishing nothing. Do not impose a meaningful-success prerequisite that defeats this baseline. How the baseline combines with additional awards remains TBD; it does not authorize exceeding 49 XP or changing an equal-power kill to 50 XP. Opening menus and cancelling do not count as executed actions. Exhaustive action qualification—movement, End Turn, automatic events, special commands and future subsystems—and any unsettled CP pools remain TBD. Existing explicit reaction/no-independent-passive-CP rules are retained pending an explicit amendment, rather than awarding every event by inference.

Class Levels **1–10** derive from Lifetime CP. The **PROVISIONAL** threshold curve is `0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700`. Class Level cap 10 is established. Ordinary earned class CP increases both Current and Lifetime; buying an ability spends only Current. Lifetime does not decrease. CP may accumulate beyond the level-10 threshold.

Purchase abilities individually once eligible; reaching a level does not auto-learn them. Learned purchases are permanent and survive class changes. Broader final ability/spell/Skill costs remain **TBD**. The repository's 100/125/150/175/200/225/250/275/300/350 price curve is working implementation balance, not a final canonical price table.

Class-entry Current CP may increase without Lifetime CP or mastery. Mage has a once-only **+100 Current Mage CP / +0 Lifetime Mage CP** grant; 100 is **PROVISIONAL/TUNABLE**, zero Lifetime is established. No other class grant is inferred. Retroactive treatment of previously processed Mage access remains TBD.

### CP ownership and attribution

Universal Attack/Item/Equip/Trade and current-class Actions award 100% to the current class. A secondary-class Action splits `ceil(amount/2)` to the current class and `floor(amount/2)` to the owning secondary class; 11 becomes 6/5. With a resolved award of 1, this established split gives current 1/secondary 0. Steal is Thief-owned. MAGIC/SKILLS menus do not erase ownership. Reactions, Supports and Movement abilities do not independently award CP; casting methods produce no separate award. A cast pays/receives its applicable cost/receipt once, not once per target. Keep executions identifiable to prevent duplicate awards.

Primary comprises purchased current-class Actions. Secondary accesses purchased Actions from one selected other class. Equip exactly one purchased Reaction, one Support and one Movement ability. Learning differs from equipping; a secondary class grants neither unpurchased abilities nor weapon permissions. Passive influence requires an active eligible equipped ability. Class changing is instant through the campaign menu during PLANNING, without day cost, and checks **that character's own Class Levels**. Unlocking does not auto-change class; a recruit may arrive in a class it cannot independently enter. Preserve physical gear and reconcile illegal equipment rather than destroying it. Provenance: R09–10, Prompt #10 §7.

## 14. Classes

The eight classes with detailed design so far remain incomplete. Their fixed Character-Level growth bonuses below are **ESTABLISHED current values**, not missing alternative tables. Future deliberate rebalancing is possible. Equipment categories are permissions, not numerical weight.

| Class | Individual prerequisites | Fixed growth | MOV modifier | Native equipment | Deployment |
| --- | --- | --- | --- | --- | --- |
| Fighter | None | +1 STR | TBD | Medium melee weapons, medium armor | Front |
| Knight | Fighter 3 | +1 STR, +1 CON | TBD | Medium/heavy melee, medium/heavy armor, shields | Front |
| Thief | None | +1 AGI | +2 | Light weapons including Light Bow, light armor | Back |
| Archer | None | +1 DEX | 0 | Bows/light armor; Heavy Bow access through Bow Training | Back |
| Alchemist | No current prerequisite; final confirmation TBD | +1 WIS | TBD | Light weapons/light armor **provisional** | TBD |
| Mage | None | +1 INT | 0 retained working value; authority qualified in earlier handoff | Wands and robes only; no native Staff proficiency | Back |
| Cleric | TBD; foundational role, no established prerequisite lock | +1 WIS | TBD | TBD, including off-hand | Back |
| Wizard | Mage 5 | +2 INT | 0 | Staves and robes | TBD |

Mage entry CP and all five recovered abilities remain intended despite their absent implementation (§13, §24). Wizard Intelligence Training +2 and Mage Intelligence Training +1 are distinct.

### Future class direction — incomplete, not full tables

Paladin's **Knight 5 + Cleric 5** prerequisite and Front default are established. Its martial/divine basic-healing role and proposed +3 STR/+2 CON/+1 WIS growth are concepts, not a finalized full class. Ranger is a possible Fighter/Archer hybrid with simultaneous sword/Heavy Bow intent and reserved Surefooted; exact prerequisites, growth and hand/slot legality remain TBD.

Hexer is a status/debuff concept with Mage/Cleric mastery and +2 WIS/+1 CON proposed. Enchanter is a buff concept with +2 INT/+1 AGI proposed; **Fairy-only remains tentative**, strongly favored but dependent on broader race/class requirements. Elementalist is advanced elemental specialization with high Mage/Wizard mastery and +3 INT proposed. Chain Lightning and fire line/cone, ice cross/wall/path and air corridor are future geometry examples, not completed spells.

Summoner is a battlefield-monster concept with the explicit direct +2 MAX MP growth exception (§12); no full table is established. The unnamed Advanced Healer owns the already recorded future Raise 2 concept (Dying-only, 100% MAX HP); other properties and proposed +2 WIS remain deferred. Do not extend Raise 2 here. Druid and an unnamed time caster remain possible concepts. Legacy Swordsman/Healer/Centaur/Starter IDs are compatibility disciplines, not new playable class designs. Prior reserved/rejected naming history stays in ledger R08-18 and SUPER-035; it is not a requirement to add classes. Provenance: R08, DOCABL.

## 15. Equipment

Ordinary slots are **one Main Hand weapon, one permitted Off Hand piece, one Armor item including robes, and one Accessory**. Off Hand may hold a shield or another weapon only when allowed. No universal dual-wield permission. Equipped items do not use the normal **four-item personal capacity**; loose gear does. Preserve overflow after capacity/permission changes while blocking additional acquisition that would exceed capacity.

Physical instances are authoritative; equipment views are derived. Reclassification cannot duplicate or destroy gear. Training permissions operate across classes but never override absolute race restrictions. A secondary action must validate actual legal equipped gear. Two-Handed doubles **Weapon ATK only**, not STR or total attack, and forbids off-hand equipment. Naturally two-handed item definitions also exclude off-hand use; complete dual-wield mechanics remain TBD.

Light Bow and Heavy Bow are distinct intended types with future differing statistics. Do not add numerical weight, encumbrance, a weight-to-MOV rule or an invented Medium Bow type. Existing medium melee/armor categories remain.

Mage's Wand/robe restriction is current. Historical exceptions preserve only specific already-equipped/assigned items, including delivery, without granting new Staff proficiency; releasing one does not authorize re-equipping it. Detailed production weapons, armor, accessories, shields and consumables—their ATK, ranges, prices, tiers and compatibility—remain TBD. Ten shipping demo items and empty legacy catalog files do not supply final design. Inheritance/strengthening after permanent death is future exploration; transfer rules, item XP and relationships remain undesigned. Jewel slots are separate (§6). Provenance: R13, ITM-001–010 retained as development data only.

## 16. CT and turn/action economy

Every participant begins with **CT 0**. Each logical tick adds effective AGI; readiness occurs at **CT ≥1000**. The timeline freezes throughout unit control, menus, movement, AI deliberation, scenes, animations and pending reaction choices. At End Turn subtract **1000 from actual CT**, preserving overshoot: AGI 15 reaches 1005 after 67 ticks and retains 5. Same-tick ties use higher **AGI → DEX → MOV → STR → deterministic random**. Preserve other ready units while one acts.

Forecasts clone state/RNG and must not consume live randomness. Fast units can appear repeatedly. Show a predictive timeline under known lifecycle and unchanged-future-action assumptions; Dying maintenance is scheduled without ordinary player control. Dead/AWOL have no normal activation.

Normally a turn provides **one Major Action plus an independent MOV budget**. Spending either does not auto-end control; choose End Turn unless incapacitation or an explicit turn-ending rule intervenes. Repeated Minor commands remain subject to their own resources. With MOV 6, Move 2 → Trade → Move 1 → Major → Move 3 is valid when otherwise legal.

| Commands | Economy | Default presentation |
| --- | --- | --- |
| Attack, Skills, Magic, Steal, Item | Major | Battle Scene |
| Equip/Unequip, Stances, Scrounge | Major | Battle Map |
| Move, Trade, Enter Portal, Escape Illegal Terrain | Minor | Battle Map |
| End Turn | Releases control and subtracts 1000 CT | Battle Map / turn flow |

Economy and presentation are independent metadata; specific presentation may vary without changing cost. All **Skills are Major**, including Follow Through, Psyche Up, Forage, Refine, Panacea, Protect and Hold the Line. Follow Through additionally spends 1 MOV. Equip is one item operation per turn. Quick Items allows ordinary Item alongside the normal Major, not two normal Majors. A stance command can end the turn; Wizard casting methods modify one cast rather than spending a standalone action. Provenance: R23–24, CONFLICT-006.

## 17. Targeting and range

Ordinary range is **Manhattan distance `abs(dx) + abs(dy)`**. Own tile is distance 0; range 1 consists of four orthogonal neighbors. Weapons and spells may have Minimum and Maximum Range. Physical range comes from the equipped weapon and applicable explicit modifiers. Unspecified item ranges remain TBD.

Ordinary physical attacks and spells use **no line of sight**. Intervening units, terrain, obstacles and visual height do not inherently block targeting. There is no gameplay elevation system. Collision/movement legality is distinct from targeting.

Friendly and self targeting are generally allowed unless a specific mechanic restricts them, while still respecting that action's actual minimum/maximum range and life eligibility. No universal Self/Ally/Enemy/Empty selection filter should prevent damaging friends, healing enemies or selecting empty tiles. Specific restrictions such as Portal voluntary entry and Raise life state remain.

An ordinary single-target physical Attack aimed at a **truly empty tile** consumes the action normally and awards the action baseline (§13), but affects no unit and performs **no dodge, critical, Double Attack or counter roll**. Future invisible-unit mechanics are not designed by this allowance.

For AoE spells, range restricts the **center coordinate**, not every affected tile. Centers may be occupied, empty, impassable, Ocean, otherwise non-occupiable or **off-map**. Extend map coordinates mathematically and calculate Manhattan distance normally. Only valid in-bounds cells may contain affected units/effects. An allowed center can project area inward through Minimum Range and onto the caster. The no-LOS rule still applies.

**Minimum Safe Range** is a weapon architecture property distinct from Minimum Range. Below Minimum Range selection is illegal; inside Minimum Safe Range selection is legal but may cause a weapon-specific consequence. A close-fired bazooka damaging its wielder is an example only, not production content or a universal spell property. Provenance: Prompt #10 §§6.7–9, 6.14–16, R25.

## 18. Physical combat and special weapon patterns

Melee raw damage is **STR + Weapon ATK − DEF**. Ranged raw damage is **DEX + Weapon ATK − DEF**.

Resolve a connected physical hit in this order: raw damage → applicable damage modifiers → Terrain Defense → game-wide rounding → **minimum 1 final damage**. A dodge/miss deals 0. **Explicit damage prevention or immunity is an exception and may yield 0**, as confirmed by the designer after Prompt #10; the minimum does not undo Indomitable or an explicit immunity. Do not silently apply a universal minimum to magical damage or healing.

### Physical dodge and critical hits

There is no separate universal attacker Accuracy stat or universal independent attack-roll statistic. Defender **AGI vs attacker STR for melee**, or **AGI vs attacker DEX for ranged**, determines physical dodge. Absent an explicit other mechanic, the attack connects unless dodged. Architecture is ratio-based, equal stats are a neutral reference, returns diminish, and a hard maximum prevents ordinary dodge making a unit unhittable. **Curve, baseline, minimum, maximum, rounding and exact ability modifiers are TBD.** Historical ability references to increased/decreased accuracy describe the intended hit/dodge relationship, not a new Accuracy stat.

Ordinary physical attacks have **5% base critical chance**; a critical adds **25% damage**. Determine critical only after connection. No stat modifier is assumed. Use future global rounding. Spells do not crit. Counters use these ordinary physical dodge/damage/critical rules.

### Terrain Defense

Terrain may define a percentage reduction to incoming **physical damage only**. Apply it after ordinary damage and modifiers, before global rounding and minimum 1. DEF and Terrain Defense are distinct. Magical damage bypasses both. Forest 10% and Mountain 20% are examples only; actual terrain percentages remain TBD.

### Double Attack

A Double Attack immediately repeats the ordinary Attack against the **same selected target**, without selecting another. The second attack resolves dodge, damage and critical independently. If the weapon's ordinary attack is a pattern, repeat the **entire pattern against the same selected target/trajectory**.

Chance compares **attacker AGI vs defender AGI**, using a ratio, diminishing returns and a hard maximum. **Curve, baseline, minimum, maximum and rounding remain TBD.** The old 90% maximum is superseded. Flurry's modifier is TBD. Counter Attacks never Double Attack. Spells have no natural Double Attack, single-target or AoE; future explicit exceptions may amend that rule. Steal is not a damaging attack and cannot Double Attack. Other special Skills need explicitly established eligibility; do not automatically treat every attack-like Skill as an ordinary Attack.

Each of the two normal attacks supplies an independent eligible physical Counter Attack opportunity, but a defender earns at most **one** counter for the complete sequence. Retaliation waits until **both** attacks finish and the defender must still be capable. Two base checks yield `1 − (15/16)^2 = 31/256 = 12.109375%` chance of at least one opportunity, before later eligibility/choice. For repeated multi-target patterns, each affected defender receives the appropriate check on each pass that affects it, with the same per-defender limit and delay. Unsettled Spell Counter aggregation across the two passes remains TBD (§30).

### Special patterns: future beam example

A weapon may have a special pattern without introducing LOS. An example laser uses a straight beam when the selected target lies on N, NE, E, SE, S, SW, W or NW; another in-range direction may use ordinary single-target behavior. The beam ends at the selected tile. It may hit every valid encountered unit regardless of allegiance, resolving nearest-to-farthest with each unit's own dodge, critical, damage and Terrain Defense.

Drop-off may depend on traveled distance, successful penetrations/damage, or both; exact weapon formulas and numbers are TBD. A dodging unit is not a successful penetration, but its tile counts toward distance. Dying units take no beam damage and do not count as penetrations; their tile may still count toward distance. Each affected hostile unit may earn appropriate counter opportunities, delayed until the whole beam finishes, or both complete patterns for a Double Attack. Friendly victims take normal effects but do not retaliate. No shipping laser or other weapon statistics are created by this example. Provenance: Prompt #10 §§6.1–13, 6.27.

## 19. Magic and spell architecture

Basic damaging magic is **caster INT + Spell Power**. It bypasses DEF and Terrain Defense and cannot crit. Magic's strength includes area coverage and bypassing DEF; it need not inherently exceed physical single-target damage. Apply full independently calculated damage to each valid AoE target, with no inherent falloff or area penalty unless a spell explicitly establishes one. Applicable target-specific modifiers still operate.

An aimed **single-target offensive spell compares caster INT vs target AGI**, not DEX. Use ratio-based diminishing returns and a hard cap; exact curve, baseline, minimum, maximum and rounding are TBD. **AoE spells make no dodge/accuracy checks**: valid occupants receive the spell effect according to its rules. Any separate explicit status chance is not a universal AoE accuracy roll.

Spell definitions distinguish identity, owner, family/tier, unlock, casting min/max range, area geometry, Spell Power/healing power, MP, element, damage/heal/cure/status behavior, life eligibility and casting-method compatibility. An unresolved production value remains unresolved; never substitute lab balance silently. Spell casts pay once and retain owner/access provenance. MAGIC groups accessible purchased current/secondary spells by family/tier and then offers a compatible method and target.

### Mage spell families

| Family | Element | Individually learned tiers | Mage unlocks | Manhattan AoE radii |
| --- | --- | --- | --- | --- |
| Blaze | Fire | 1, 2, 3, 4 | 1, 3, 5, 7 | 0, 1, 1, 2 |
| Freeze | Ice | 1, 2, 3, 4 | 1, 3, 5, 7 | 0, 1, 1, 2 |
| Bolt | Lightning | 1, 2, 3, 4 | 1, 3, 5, 7 | 0, 1, 1, 2 |
| Gale | Air | 1, 2, 3, 4 | 1, 3, 5, 7 | 0, 1, 1, 2 |
| Quake | Earth | 1, 2, 3, 4 | 1, 3, 5, 7 | 0, 1, 1, 2 |
| Torrent | Water | 1, 2, 3, 4 | 1, 3, 5, 7 | 0, 1, 1, 2 |

These are 24 intended spells. Tiers 1 and 2 have the same per-target base magnitude; tier 3 is substantially greater, tier 4 greater than tier 3. Exact powers, min/max ranges, MP, elemental consequences/statuses and previous-tier learning prerequisites remain TBD. Prices are not established by the old level curve. The four tiers' Manhattan radii 0, 1, 1, 2 affect **1, 5, 5, 13 tiles** before map clipping (§21); existing shapes and sizes are preserved.

### Wizard casting methods

Choose normal casting or **one** accessible, purchased, compatible Wizard method; methods are mutually exclusive. They do not grant the underlying spell or change its class/CP owner.

| Method | Wizard level | Effect | MP multiplier |
| --- | --- | --- | --- |
| Extend | 1 | Casting range +1 | ×1.10 |
| Focus | 3 | Requires innate Manhattan AoE radius >0; changes radius to 0; magnitude ×1.75 | ×1.25 |
| Expand | 5 | Manhattan AoE radius +1 | ×1.50 |
| Overcharge | 7 | Magnitude ×2 | ×2.50 |

Unmentioned fields remain unchanged. Minimum-range composition with future range modifiers is TBD; do not choose an implicit new rule. Compatible Mage spells can use these methods in either current/secondary class arrangement. Divine Arcana (Support Lv4) extends compatible Cleric spells; Hex Arcana (Lv6), Enchanting Arcana (Lv7), Restorative Arcana (Lv9) refer to future Hexer, Enchanter and Advanced Healer respectively. Arcana grants compatibility, not spells, classes or extra Support slots. Cure/Raise per-spell allowlists in code are implementation evidence whose exact adoption is still TBD; do not universally assume every cure accepts every method. Fly/Portal have their own established compatibility (§9).

### Mute and rounding

Mute prevents spellcasting through **all methods** unless an explicit exception permits it. It blocks normal MAGIC and makes Spell Counter **ineligible before its roll**. Mute does not block an otherwise eligible physical Counter Attack.

There will be **one game-wide rounding convention**, except individually explicit exceptions. The convention is **TBD**; do not choose floor, ceiling or nearest separately for each system. It applies to critical damage, Seething, Efficiency, percentage reductions/healing including Raise, and similar calculations. Existing explicit CP split ceiling/floor, Indomitable threshold ceilings and Potent Remedies MP ceiling remain local exceptions; they do not establish the general convention. Provenance: R12, Prompt #10 §§6.2, 6.12–18.

## 20. Healing, cures and Raise

Basic healing restores **caster WIS + Spell Healing Power**. Healing makes no accuracy check. Apply the full independent result to each valid AoE target; clamp to MAX HP and lose excess. No ordinary overhealing. General targeting permits healing hostile units or self and targeting empty tiles while retaining specific life/effect restrictions.

Ordinary healing has no effect on Dying. **Raise 1** is Cleric Lv4: Dying-only, remove Dying/counter and restore **50% MAX HP** using future global rounding. It leaves unrelated statuses intact and does not target Alive, Dead or AWOL. Dead is not ordinarily revivable. The limited historical Raise 2 owner/fraction fact is preserved in §14, with no new Raise 2 design here.

| Cleric spell | Class level | Established effect |
| --- | --- | --- |
| Heal 1 / 2 / 3 / 4 | 1 / 3 / 5 / 7 | HP restoration; exact per-tier healing power, area and range TBD. |
| Detox | 2 | Cure Poison only. |
| Clear Sight | 4 | Cure Blind only. |
| Unseal | 4 | Cure Mute only. |
| Raise 1 | 4 | Dying-only restoration above. |
| Awaken | 6 | Cure Sleep only. |
| Clarity | 6 | Cure Confusion only. |

Cleric spell MP, min/max ranges and unspecified areas remain TBD. A current friendly-only data filter is not authority to prohibit healing/cures solely by allegiance. The complete conditions catalog and other WIS interactions remain deferred. Provenance: R12-08–09, SPL-025–034, Prompt #10 §§6.16–17.

## 21. AoE and deterministic multi-target resolution

The standard area is a Manhattan diamond around its center, with individual spell/pattern overrides permitted. A future Chain Lightning is an example requiring unusual propagation; its actual mechanics remain undesigned.

**AoE radius is literal Manhattan radius.** Radius `r` affects every tile whose Manhattan distance from the center is ≤r.

| Manhattan radius | Affected tiles before map clipping |
| --- | --- |
| 0 | 1 |
| 1 | 5 |
| 2 | 13 |
| 3 | 25 |

Casting range determines how far from the caster the center coordinate may be placed. AoE radius determines which tiles around that center are affected. Casting range and AoE radius remain separate. Minimum/Maximum Range, off-map centers and inward-reaching areas follow §17 unchanged.

For standard AoE, begin with the center, then increasing Manhattan-distance bands. Within each band proceed clockwise starting North through N, NE, E, SE, S, SW, W, NW, skipping positions absent from that band. Use actual ordered positions around each band, not only eight rays; don't omit the other cells of larger diamonds. Beam patterns use their own nearest-to-farthest order.

Combat is **sequential by default**. For an action affecting multiple units, resolve each primary target completely, apply its state immediately, then continue to the next target. Earlier state changes can affect later eligibility. **All primary effects finish before generated retaliations**; generated delayed reactions resolve in the same order as their originating affected units. Do not insert retaliation into the middle of a beam/AoE primary sequence. Double Attack delays earned counters until both passes finish.

Immediate defensive/prevention and post-damage effects required for the current primary target still operate at their established local timing (Prayer, Guard, Siphon, Seething). They are distinct from delayed damage-inflicting retaliation. Covering Fire retains its explicit pre-attack timing (§24); this is a specific established timing rule, not a new universal reaction window. The definitive zero-active battle conclusion still stops further mechanics (§23), including otherwise queued targets/reactions. “All primary effects first” does not revive actions after conclusion.

Damaging and healing areas may affect allies/enemies/caster as appropriate to general targeting. Battlefield Awareness is an explicit friendly offensive-area exception. Dying units are ignored unless the effect explicitly handles Dying. **AoE spells trigger neither physical Counter Attack nor Spell Counter**, regardless of targets affected. Provenance: R25–28, Prompt #10 §§6.21–26.

## 22. Reactions

### Physical Counter Attack

Base chance is **1/16 = 6.25%**, with no AGI modifier to that baseline. Explicit abilities/equipment/effects may later modify it; Fighter Counter's increase remains TBD. The defender must survive and remain capable, the source must be hostile and within the defender's effective equipped-weapon range, and a unit cannot retaliate against itself.

A counter is a **single ordinary physical Attack** for dodge, damage and critical resolution, costs **no Major, Minor or MOV**, and cannot Double Attack. An eligible normal single-target spell may also provoke physical retaliation if range/other requirements permit. AoE spells cannot. Double Attack opportunity aggregation follows §18.

### Spell Counter

Wizard Lv2 Reaction **Spell Counter** has a **20%** trigger chance. It may respond to an ordinary physical Attack or a normal single-target spell cast as a Major through MAGIC. AoE spells do not trigger it. Retaliation requires hostility and capability; Mute makes the spell option unavailable before rolling.

Check eligible Spell Counter and eligible physical Counter Attack **independently**. If only one succeeds, perform that option. If both succeed, the **defending player chooses** which to perform. If neither succeeds, no retaliation. At most one damage-inflicting retaliation is performed by that defender for that triggering opportunity. Do not restore the old Spell-Counter-first suppression policy.

For a successful Spell Counter, choose an eligible **purchased Mage Level 1 spell** according to the ability's existing spell eligibility, with **0 MP, no Major Action and no CP**. Selection pauses resolution transactionally without reroll/cancel substitution. A melee-oriented class can learn/equip this Reaction and gain eligible ranged magical retaliation; native Wizard class or physical weapon reach is not a Spell Counter requirement. Enemy choice policy remains TBD, as does aggregation of competing reaction choices across repeated Double Attack passes beyond the settled physical-counter limit.

### Damaging-reaction recursion and timing

**A reaction that inflicts damage cannot generate another reaction that inflicts damage.** Counter Attack cannot generate Counter Attack or Spell Counter; Spell Counter cannot generate either. Retain provenance through the entire chain. This restriction still permits eligible **non-damaging reactions**, such as Guard, Arcane Seething and Siphon. Future defensive reactions are examples only; no new mechanics/windows are invented.

Support deterministic defensive-before-damage, post-damage and retaliatory-after-action timing where established. Preserve parent action, ordered targets, cursor, history, paid costs, provenance and pending choice. Resolve costs once and prevent duplicate event/award processing. Eligibility is evaluated against current state: a would-be reactor reduced to 0 HP earlier cannot later act. Exhaustive priority among every future reaction remains TBD.

### Prayer, Martyr and Arcane Siphon

**Prayer — Cleric Lv3 Reaction:** a qualifying adjacent friendly unit other than self is about to take lethal damage; roll **25%**. Success leaves exactly **1 HP**, prevents Dying/counter entry and resolves before battle conclusion; other statuses remain. Multiple-provider priority is not newly settled. The historical 50% probability was deliberately reduced and is superseded.

**Martyr — Cleric Lv7 Reaction:** when an adjacent enemy newly transitions Alive→Dying, reduce its initial counter **3→2**. It can trigger on each new entry after Raise; it does not trigger on countdown ticks or only once per battle.

**Arcane Siphon — Wizard Lv6 Reaction:** when targeted by damaging magic, restore MP equal to that spell's resolved **paid MP cost** (clamped to MAX MP) and multiply incoming spell damage by **0.90** before global rounding. It is not a chance-based roll. A free counter spell has paid cost 0. This defensive reaction remains eligible against damaging reactions when its own conditions hold. Provenance: R27, Prompt #10 §§6.5–6, 6.18–24.

## 23. Dying, Dead, AWOL and battle conclusion

At 0 HP, enter **Dying with counter 3** unless prevention such as Prayer intervenes first. Dying cannot move, act or react and is not ordinarily targetable by attacks, spells, items, Trade or AoE. It remains physically on its tile until explicitly revived/removed. Friendly units can pass through but cannot stop there; hostile Dying blocks passage and occupancy. Dying creates no LOS/target obstruction and beams ignore it as a victim/penetration.

At the Dying unit's own maintenance-turn start decrement 3→2→1→0. At its turn end with 0, it becomes **Dead**, leaves Battle Map/squad roster and cannot ordinarily be revived. Raise and Martyr are explicit exceptions to parts of this lifecycle. The MC permanent-loss exception is a separate campaign sequence (§27), not permission for ordinary Raise to target Dead.

Dying, Dead and AWOL count as zero active combatants. Losing the last active combatant determines conclusion immediately and symmetrically; future poison or queued effects cannot reverse it. Stop new CT/actions/remaining mechanics, allow started presentation to finish, then return to map/banner. General fate of surviving Dying units after battle remains TBD; do not automatically kill them all.

Tactical AWOL from stranded Flying removes the unit's Battle Map position/local roster without a Dying countdown. AWOL is not Dead and cannot act or be targeted. On a win, AWOL units return to the original squad after battle; restored resources/status clearing are TBD.

For an **ordinary losing AWOL unit**, independently roll **50% survival**. Failure is permanent casualty; success has equally likely **2, 3 or 4 campaign days** delay. Persist outcome, RNG and due date (resolution day + delay). The specified defeated-MC-squad circumstance overrides ordinary rules (§27).

The return destination is the closest reachable **player-controlled settlement**, meaning pledged support to MC against Zeon, independent of settlement type. Use route-network distance, including the exact midpoint for route battles. Ties maximize distance to the nearest active enemy squad, then use uniform deterministic random selection. **Reevaluate destination control/support each campaign day until return**; changes can alter the destination. Do not permanently freeze a destination at departure. Return notification and active/unassigned arrival remain supported; no HP/MP refill is inferred.

No reachable eligible settlement has no finalized ultimate fallback. The current pending hold/recheck is an implementation fallback, not an adopted eventual death/destination rule. Ordinary defeat/retreat survival beyond the specified AWOL and MC cases remains unfinished; proposed 95% caps, guarantees and historical survival factors are not finalized. Provenance: R28, R17-03, Prompt #10 §§6.25–26.

## 24. Ability catalog and qualifications

The following catalog preserves the established named abilities, owners, categories, unlocks, mechanics and explicit unknowns from ledger ABL/DOCABL. It is not a claim that every ability executes in the current game. **Purchase costs remain TBD**; no old price table is imported. ACTION describes ability access; consult §16 for economy, and §19 for casting methods. Training abilities grant the named cross-class permission subject to race restrictions. Unspecified weapon gates are not new universal permissions.

All attack-like Skills retain their particular formulas/gates rather than silently becoming ordinary attacks. Accuracy-related amounts remain TBD under §18's stat-free accuracy architecture. Passive/reaction/movement slots do not independently spend a Major merely by activating; granted commands have their own established economy. Spell rows refer to §§9, 19–20 for complete current spell design.

### Fighter

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-001 | POWER ATTACK | ACTION | 1 | Stronger melee attack with reduced hit chance. TBD: damageMultiplier, accuracyModifier. |
| ABL-002 | COUNTER | REACTION | 2 | Increases legal counterattack chance. TBD: modifier. |
| ABL-003 | FEINT | ACTION | 3 | 80% melee damage with increased accuracy. TBD: accuracyModifier. |
| ABL-004 | FOLLOW THROUGH | ACTION | 4 | Major Skill; if not attacked this turn and ≥1 MOV remains, make normal melee attack; on kill enter target space if able and may make regular Attack against another enemy in range; once/turn. **Consumes1 MOV.** No extra targeting/movement edges invented. |
| ABL-005 | EVASIVE STANCE | SUPPORT | 5 | Adds a turn-ending stance command that boosts dodge until next turn. TBD: dodgeBonus. |
| ABL-006 | PSYCHE UP | ACTION | 6 | Major Skill; boosts another friendly unit’s physical attack through end of its next turn. Exact physical-attack amount remains TBD. |
| ABL-007 | MEDIUM WEAPON TRAINING | SUPPORT | 6 | Grants the listed equipment permission across classes. |
| ABL-008 | STRENGTH TRAINING | SUPPORT | 7 | Improves future STR growth while equipped. TBD: bonus. |
| ABL-009 | CLEAVE | ACTION | 8 | Axe attack against a target and one unit to its left or right. TBD: secondaryDamageMultiplier. Equipment: AXE. |
| ABL-010 | SPEAR TECHNIQUE | ACTION | 8 | Spear attack in a straight line: adjacent target at normal damage, farther target at 80%. Equipment: SPEAR. |
| ABL-011 | THRUST | ACTION | 8 | Sword attack: 80% damage, ignoring 80% of target DEF. Equipment: SWORD. |
| ABL-012 | BATTLEFIELD AWARENESS | SUPPORT | 9 | Unaffected by friendly offensive area magic, including damage, debuffs and status spells. |
| ABL-013 | MEDIUM ARMOR TRAINING | SUPPORT | 9 | Grants the listed equipment permission across classes. |
| ABL-014 | MOVE +1 | MOVEMENT | 10 | Adds one MOV while equipped. |

### Knight

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-015 | SHIELD BASH | ACTION | 1 | Low damage shield attack with 75% Stun chance. TBD: damageMultiplier. Equipment: SHIELD in Off Hand. |
| ABL-016 | GUARD | REACTION | 2 | Shield determines activation chance; reduces incoming attack damage. TBD: reduction. |
| ABL-017 | CHIVALRY | SUPPORT | 3 | Adjacent and diagonally adjacent allies gain 5% of source total DEF while nearby. |
| ABL-018 | PROTECT | ACTION | 4 | Major Skill: swap with a friendly unit, spend/lock remaining MOV; once per turn. |
| ABL-019 | HEAVY WEAPON TRAINING | SUPPORT | 4 | Grants the listed equipment permission across classes. |
| ABL-020 | COVER | REACTION | 5 | 50% chance to take an adjacent ally's incoming physical attack. |
| ABL-021 | TWO-HANDED | SUPPORT | 6 | Use both hands and double the equipped weapon's ATK; off-hand items are forbidden. |
| ABL-022 | CRUSHING BLOW | ACTION | 7 | Mace or hammer: add full target DEF to damage, then resolve against half target DEF. Equipment: MACE, HAMMER. |
| ABL-023 | CONSTITUTION TRAINING | SUPPORT | 7 | Improves future CON growth while equipped. TBD: bonus. |
| ABL-024 | STEADFAST | MOVEMENT | 8 | Prevent forced displacement from any actually hostile source, including Wilderness; permit legitimate friendly ability/Skill/spell/other displacement and voluntary movement. |
| ABL-025 | EQUIP SHIELDS | SUPPORT | 8 | Grants the listed equipment permission across classes. |
| ABL-026 | HOLD THE LINE | ACTION | 9 | Major Skill: choose two adjacent squares hostile units cannot enter until next owner turn starts; spend/lock remaining MOV; any source movement cancels effect. |
| ABL-027 | HEAVY ARMOR TRAINING | SUPPORT | 9 | Grants the listed equipment permission across classes. |
| ABL-028 | INDOMITABLE | SUPPORT | 10 | At or below ceil(10% MAX HP), block each damage source of ceil(50% MAX HP) or less. |

### Thief

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-029 | STEAL ITEM | ACTION | 1 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. |
| ABL-030 | STEAL ACCESSORY | ACTION | 2 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. |
| ABL-031 | STEAL OFF-HAND | ACTION | 3 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. |
| ABL-032 | STEAL WEAPON | ACTION | 4 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. |
| ABL-033 | FAST HANDS | SUPPORT | 4 | Doubles calculated Steal success chance. |
| ABL-034 | STEAL ARMOR | ACTION | 5 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. |
| ABL-035 | SLIP AWAY | REACTION | 6 | When struck by an adjacent enemy, may choose a legal adjacent move or choose to stay, without MOV cost. TBD: chance. |
| ABL-036 | SKIRMISHER | SUPPORT | 6 | After traversing at least 3 tiles, gain DEF on ending the turn until next turn starts. TBD: defBonus. |
| ABL-037 | FLURRY | SUPPORT | 7 | Greatly increases Double Attack chance; exact modifier and hard maximum both TBD (§18). |
| ABL-038 | DISARM | SUPPORT | 8 | With full inventory, successful equipment Steal unequips victim and leaves item with victim; retain overflow, no destruction. |
| ABL-039 | BACKSTAB | ACTION | 9 | 150% melee damage when an ally is directly opposite across the target on the same row or column; otherwise normal damage. Equipment: MELEE, SHORT, STABBING. |
| ABL-040 | ESCAPE ARTIST | SUPPORT | 9 | Improves survival chance after squad defeat. TBD: modifier. |
| ABL-041 | FLEET-FOOTED | MOVEMENT | 10 | Each legal consecutive perpendicular pair of orthogonal steps costs 1 MOV total. |
| ABL-042 | DEEP POCKETS | SUPPORT | 10 | Carry one extra personal item. |
| DOCABL-06 | EVADE | REACTION | 3 | Greatly increases physical dodge against melee/ranged. Exact increase, rounding/cap and edges TBD (§18). |

### Archer

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-043 | AIMED SHOT | ACTION | 1 | Bow attack with substantially increased accuracy. TBD: accuracyModifier. Equipment: BOW, RANGED. |
| ABL-044 | POWER SHOT | ACTION | 3 | Bow attack with increased damage and reduced accuracy. TBD: damageModifier, accuracyModifier. Equipment: BOW, RANGED. |
| ABL-045 | LIGHT ARMOR TRAINING | SUPPORT | 4 | Grants the listed equipment permission across classes. |
| ABL-046 | SUPPRESSING SHOT | ACTION | 5 | On hit, reduce target MOV until its next turn. TBD: movReduction. Equipment: BOW, RANGED. |
| ABL-047 | EAGLE EYE | SUPPORT | 6 | Improves bow accuracy. TBD: bonus. |
| ABL-048 | LONG SHOT | ACTION | 7 | Bow attack beyond ordinary maximum range. TBD: rangeExtension, accuracyPenalty. Equipment: BOW, RANGED. |
| ABL-049 | BOW TRAINING | SUPPORT | 7 | Grants the listed equipment permission across classes. |
| ABL-050 | COVERING FIRE | REACTION | 8 | May fire before a legal-range enemy attacks another ally; stop its pending attack if it can no longer complete it. TBD: chance. No frequency cap; only another friendly target; not counter/double-attack. Equipment: BOW, RANGED. |
| ABL-051 | PIERCING SHOT | ACTION | 9 | Bow attack ignoring a large portion of DEF. TBD: ignoreDefenseFraction. Equipment: BOW, RANGED. |
| ABL-052 | DEXTERITY TRAINING | SUPPORT | 9 | Improves future DEX growth while equipped. TBD: bonus. |
| ABL-053 | FIRING POSITION | MOVEMENT | 10 | Concept: move up to 1 tile, then fire 1 tile farther. Timing and movement cost unresolved. TBD: timing, movCost. |

### Alchemist

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-054 | TOSS ITEM | ACTION | 1 | Use and consume an eligible consumable at range; Conservation cannot preserve it. TBD: range. |
| ABL-055 | PURIFYING MEDICINE | SUPPORT | 2 | HP-restorative items may remove one random removable negative status. TBD: chance. |
| ABL-056 | EMERGENCY MEDICINE | REACTION | 3 | Qualifying damage leaves HP strictly below 60% MAX HP: 100% activation, strongest full modified carried heal fitting missing HP. Event granularity/integration TBD (§25). |
| ABL-057 | FORAGE | ACTION | 4 | Produce an item based on occupied tile; immediately use, throw, or store if personal space allows; tiles repeatable. Immediate use/throw excludes Conservation; stored item later ordinary rules. Existing evidence preserved; detailed design/implementation requires dedicated future prompt. |
| ABL-058 | CONSERVATION | SUPPORT | 4 | High chance to preserve a normally used consumable; excludes Toss and immediate Forage use/throw. TBD: chance. |
| ABL-059 | QUICK ITEMS | SUPPORT | 5 | Ordinary Item no longer consumes or prevents the normal Major Action. |
| ABL-060 | LIGHT WEAPON TRAINING | SUPPORT | 6 | Grants the listed equipment permission across classes. |
| ABL-061 | REFINE | ACTION | 7 | Major Skill combines/consumes two same consumables for greater-than-sum effect. Formula, output form and other detailed mechanics TBD (§25). |
| ABL-062 | POTENT REMEDIES | SUPPORT | 8 | HP restoration x2; MP restoration x1.25, rounded up. |
| ABL-063 | PANACEA | ACTION | 9 | Intentional temporary no-op Major Skill; final behavior deferred until consumables are designed. |
| ABL-064 | CATALYZE | SUPPORT | 9 | Extend consumable temporary effects; actual consumption of a temporary stat buff may permanently add +1 to one affected stat. TBD: durationExtension, chance. |
| ABL-065 | SCROUNGER | MOVEMENT | 10 | At turn start detect hidden items within 5 tiles; Major/Battle Map Scrounge gives compass direction or collects on own tile. Metric/ties/additional MOV/full-bag policy TBD. |
| ABL-066 | DEEP SATCHEL | SUPPORT | 10 | Carry one extra personal item. |

### Mage

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-067 | BLAZE 1 | ACTION | 1 | Spell `blaze1`; full current rules in §19. Unspecified production balance TBD. |
| ABL-068 | BOLT 1 | ACTION | 1 | Spell `bolt1`; full current rules in §19. Unspecified production balance TBD. |
| ABL-069 | FREEZE 1 | ACTION | 1 | Spell `freeze1`; full current rules in §19. Unspecified production balance TBD. |
| ABL-070 | GALE 1 | ACTION | 1 | Spell `gale1`; full current rules in §19. Unspecified production balance TBD. |
| ABL-071 | QUAKE 1 | ACTION | 1 | Spell `quake1`; full current rules in §19. Unspecified production balance TBD. |
| ABL-072 | TORRENT 1 | ACTION | 1 | Spell `torrent1`; full current rules in §19. Unspecified production balance TBD. |
| ABL-073 | BLAZE 2 | ACTION | 3 | Spell `blaze2`; full current rules in §19. Unspecified production balance TBD. |
| ABL-074 | BOLT 2 | ACTION | 3 | Spell `bolt2`; full current rules in §19. Unspecified production balance TBD. |
| ABL-075 | FREEZE 2 | ACTION | 3 | Spell `freeze2`; full current rules in §19. Unspecified production balance TBD. |
| ABL-076 | GALE 2 | ACTION | 3 | Spell `gale2`; full current rules in §19. Unspecified production balance TBD. |
| ABL-077 | QUAKE 2 | ACTION | 3 | Spell `quake2`; full current rules in §19. Unspecified production balance TBD. |
| ABL-078 | TORRENT 2 | ACTION | 3 | Spell `torrent2`; full current rules in §19. Unspecified production balance TBD. |
| ABL-079 | BLAZE 3 | ACTION | 5 | Spell `blaze3`; full current rules in §19. Unspecified production balance TBD. |
| ABL-080 | BOLT 3 | ACTION | 5 | Spell `bolt3`; full current rules in §19. Unspecified production balance TBD. |
| ABL-081 | FREEZE 3 | ACTION | 5 | Spell `freeze3`; full current rules in §19. Unspecified production balance TBD. |
| ABL-082 | GALE 3 | ACTION | 5 | Spell `gale3`; full current rules in §19. Unspecified production balance TBD. |
| ABL-083 | QUAKE 3 | ACTION | 5 | Spell `quake3`; full current rules in §19. Unspecified production balance TBD. |
| ABL-084 | TORRENT 3 | ACTION | 5 | Spell `torrent3`; full current rules in §19. Unspecified production balance TBD. |
| ABL-085 | BLAZE 4 | ACTION | 7 | Spell `blaze4`; full current rules in §19. Unspecified production balance TBD. |
| ABL-086 | BOLT 4 | ACTION | 7 | Spell `bolt4`; full current rules in §19. Unspecified production balance TBD. |
| ABL-087 | FREEZE 4 | ACTION | 7 | Spell `freeze4`; full current rules in §19. Unspecified production balance TBD. |
| ABL-088 | GALE 4 | ACTION | 7 | Spell `gale4`; full current rules in §19. Unspecified production balance TBD. |
| ABL-089 | QUAKE 4 | ACTION | 7 | Spell `quake4`; full current rules in §19. Unspecified production balance TBD. |
| ABL-090 | TORRENT 4 | ACTION | 7 | Spell `torrent4`; full current rules in §19. Unspecified production balance TBD. |
| DOCABL-02 | ROBE TRAINING | SUPPORT | 2 | Cross-class robe permission; race restrictions remain. |
| DOCABL-03 | WAND TRAINING | SUPPORT | 4 | Cross-class wand permission; race restrictions remain. |
| DOCABL-01 | ARCANE SEETHING | REACTION | 6 | Enemy damage strengthens next meaningfully scalable spell by 10%, consumed by that cast; scalable effects/rounding edges §24. |
| DOCABL-04 | INTELLIGENCE TRAINING (MAGE) | SUPPORT | 8 | While equipped, +1 INT per future Character Level; distinct from Wizard +2. |
| DOCABL-05 | ARCANE EFFICIENCY | SUPPORT | 10 | Spell MP costs reduced 10%; global rounding/composition TBD. |

### Cleric

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-091 | HEAL 1 | ACTION | 1 | Spell `heal1`; full current rules in §20. Unspecified production balance TBD. |
| ABL-092 | DETOX | ACTION | 2 | Spell `detox`; full current rules in §20. Unspecified production balance TBD. |
| ABL-093 | HEAL 2 | ACTION | 3 | Spell `heal2`; full current rules in §20. Unspecified production balance TBD. |
| ABL-094 | PRAYER | REACTION | 3 | 25% chance: an adjacent friendly unit remains at 1 HP instead of entering Dying. Statuses remain. |
| ABL-095 | CLEAR SIGHT | ACTION | 4 | Spell `clearSight`; full current rules in §20. Unspecified production balance TBD. |
| ABL-096 | RAISE 1 | ACTION | 4 | Spell `raise1`; full current rules in §20. Unspecified production balance TBD. |
| ABL-097 | UNSEAL | ACTION | 4 | Spell `unseal`; full current rules in §20. Unspecified production balance TBD. |
| ABL-098 | HEAL 3 | ACTION | 5 | Spell `heal3`; full current rules in §20. Unspecified production balance TBD. |
| ABL-099 | AWAKEN | ACTION | 6 | Spell `awaken`; full current rules in §20. Unspecified production balance TBD. |
| ABL-100 | CLARITY | ACTION | 6 | Spell `clarity`; full current rules in §20. Unspecified production balance TBD. |
| ABL-101 | FAITH | SUPPORT | 6 | Future WIS growth +1 while equipped. |
| ABL-102 | HEAL 4 | ACTION | 7 | Spell `heal4`; full current rules in §20. Unspecified production balance TBD. |
| ABL-103 | MARTYR | REACTION | 7 | An adjacent enemy newly entering Dying immediately has its counter reduced by 1. |
| ABL-104 | DIVINE WARD | SUPPORT | 8 | Spell damage x0.7; hostile spell status chance minus 30 percentage points. |
| ABL-105 | GRACEFUL STEP | MOVEMENT | 10 | First completed movement each turn restores 5% MAX HP. |

### Wizard

| Provenance | Ability | Category | Class level | Established behavior / remaining TBD |
| --- | --- | --- | --- | --- |
| ABL-106 | EXTEND | ACTION | 1 | One compatible casting method: range +1, MP ×1.10; no standalone action or award. See §19. |
| ABL-107 | SPELL COUNTER | REACTION | 2 | 20% eligible Spell Counter, independently checked alongside physical Counter Attack; defending player chooses if both succeed. Purchased Mage Lv1 spell, 0 MP/no Major/no CP. Mute ineligible; no damaging-reaction recursion. See §22. Enemy choice/Double Attack aggregation TBD. |
| ABL-108 | FOCUS | ACTION | 3 | One compatible method: requires innate Manhattan AoE radius >0; changes radius to 0; magnitude ×1.75, MP ×1.25. See §19. |
| ABL-109 | DIVINE ARCANA | SUPPORT | 4 | Authorizes compatible cleric spells for accessible Wizard casting methods. |
| ABL-110 | EXPAND | ACTION | 5 | One compatible method: Manhattan AoE radius +1, MP ×1.50. See §19. |
| ABL-111 | ARCANE SIPHON | REACTION | 6 | When targeted by damaging magic, restore its paid MP cost up to MAX MP and multiply incoming damage by 0.90 before global rounding. No probability roll (§22). |
| ABL-112 | HEX ARCANA | SUPPORT | 6 | Authorizes compatible hexer spells for accessible Wizard casting methods. |
| ABL-113 | OVERCHARGE | ACTION | 7 | One compatible method: magnitude ×2, MP ×2.50. See §19. |
| ABL-114 | ENCHANTING ARCANA | SUPPORT | 7 | Authorizes compatible enchanter spells for accessible Wizard casting methods. |
| ABL-115 | FLY | ACTION | 8 | Spell `fly`; full current rules in §9. Unspecified production balance TBD. |
| ABL-116 | INTELLIGENCE TRAINING | SUPPORT | 8 | **Wizard** version: +2 INT whenever unit gains a Character Level while equipped. Distinct from Mage’s +1 version. |
| ABL-117 | PORTAL | ACTION | 9 | Spell `portal`; full current rules in §9. Unspecified production balance TBD. |
| ABL-118 | RESTORATIVE ARCANA | SUPPORT | 9 | Authorizes compatible advancedHealer spells for accessible Wizard casting methods. |
| ABL-119 | MANA STEP | MOVEMENT | 10 | First completed movement each turn restores 5% MAX MP. |

### Additional mechanical qualifications

Chivalry is a dynamic eight-neighbor aura based on source total DEF; rounding follows future global convention. Hold the Line spends/locks remaining MOV, blocks the two selected adjacent squares until the owner's next turn starts and is cancelled if its source moves by any means. Protect also spends/locks MOV and is once per turn. Follow Through's first attack requires no earlier attack and at least 1 MOV, consumes that MOV, then permits legal advance on kill and optional ordinary Attack against another in-range enemy, once per turn; other edge interactions remain TBD.

Indomitable activates at HP ≤`ceil(10% MAX HP)` and prevents each qualifying damage source ≤`ceil(50% MAX HP)` entirely. These threshold ceilings are explicit exceptions; damage prevention can yield 0 (§18). Cover's 50% redirect applies to an adjacent ally's physical attack. Covering Fire is an explicitly pre-attack, legal-bow-range reaction against an enemy attacking **another** ally; it can stop an attack whose source can no longer complete it, has no frequency cap, and is neither a counter nor Double Attack. Its chance and full execution remain TBD, with the general damaging-reaction recursion restriction still applying.

Backstab requires a melee Short/Stabbing weapon and an ally directly opposite the target along the same row/column: 150% damage, otherwise normal. Knife/dagger/gladius/baselard/punch dagger are examples, not shipping items. Cleave needs an axe; Thrust a sword; the spear technique a spear; Crushing Blow a mace/hammer; Shield Bash an off-hand shield; Archer Actions a legal bow. Crushing Blow adds full target DEF, then resolves against half target DEF; preserve both operations. “Skewer” is a provisional name for the existing spear technique, not an extra ability.

Mage Arcane Seething strengthens the next meaningfully scalable spell by 10% after enemy damage, including damage, HP restoration and numerical buffs, consumed by that cast. Nonscalable effects and stacking/rounding edges are TBD. Mage Lv9 remains intentionally open. Wizard Intelligence Training +2 is distinct from Mage +1. Graceful Step/Mana Step trigger on the first completed movement each turn, restoring 5% MAX HP/MP respectively with future global rounding. Divine Ward reduces spell damage by 30% and hostile spell-status chance by **30 percentage points**, not 30% of the probability. Full condition-system interactions remain TBD.

### Future reservations and concepts

Surefooted is reserved for future Ranger Movement: reduce additional terrain cost by 1, with minimum normal cost 1; level and composition TBD. Desoul is a Wizard instant-death spell idea with no finalized chance/table. Elemental Affinity/Mastery were removed from Mage and may fit Elementalist; their mechanics remain TBD. Death Rattle is a possible future Support final action while Dying, with owner, timing and conclusion exceptions undesigned. Fairy cure and Advanced Healer Raise 2 retain only the limited facts already recorded (§11, §14). No future table is invented. Provenance: DOCABL-07–13.

## 25. Items, consumables, Steal and Scrounge

Personal capacity normally 4 excludes equipped gear; Deep Pockets and Deep Satchel each grant +1 when applicable through the loadout. Preserve overflow after capacity loss; acquisition still checks capacity. Ordinary Item is Major unless Quick Items applies; Trade is Minor and Equip/Unequip Major. Preserve physical item identity and location.

Steal's five Thief Actions attempt carried item, accessory, off-hand, weapon and armor theft. They do no damage and cannot Double Attack. Exact success/range/category difficulty/gameplay cap remain TBD. Fast Hands doubles the calculated chance; do not invent the base formula. With Disarm and insufficient carrying space, successful equipment theft unequips the victim but leaves the physical item with that victim, retaining overflow rather than deleting it.

Toss uses and consumes an eligible item at range; range/complete targeting remain TBD. Conservation cannot preserve Toss or immediate Forage use/throw. Forage is a repeatable occupied-tile item concept with immediate use, throw, or store when capacity permits; stored items later follow ordinary rules. Detailed loot/targeting requires a dedicated future design prompt.

Refine is a **Major Skill combining/consuming two copies of the same consumable for an effect greater than the sum of separate uses**. Exact multiplier, output-as-item versus direct/queued effect, targeting, timing, eligibility, nonnumeric items, duration, caps and rounding remain deferred. The helper's required newly created output item and HP+MP scalar comparison are not canonical. Panacea is an **intentional temporary no-op Major Skill** until consumables are sufficiently designed; the old cure-all helper is a mismatch.

Potent Remedies doubles item HP restoration and multiplies MP restoration by 1.25 with **explicit ceiling for MP**. Emergency Medicine checks qualifying damage leaving HP **strictly below 60% MAX HP**, has **100% activation**, and selects the strongest carried item's full modified healing that fits missing HP without overheal. Apply Potent Remedies before selection; event granularity and automatic integration remain TBD.

Purifying Medicine may cure one random removable negative status when an HP-restorative item is used; chance is TBD. Conservation's high preservation chance remains TBD. Catalyze extends temporary consumable effects by an unspecified duration and may give permanent +1 to an affected stat with an unspecified tiny chance **only on actual consumption** of a temporary stat buff. Conserved items cannot roll that permanent gain.

Scrounger detects hidden items within 5 tiles at turn start. Its Scrounge command is **Major/Battle Map**, gives compass direction or collects on the user's tile; distance metric, ties, additional MOV cost, capacity handling and persistent discovery/occupation treasures remain TBD. No production consumable catalog is supplied by these abilities. Provenance: R11, R13, TBD-004, TBD-020–027, TBD-063.

## 26. Settlement recovery and battle-end condition

Battle-end condition persists into campaign state, including **remaining HP and MP**. Finishing a battle does not automatically reset resources/statuses. Recovery progresses as campaign days end.

| Settlement | Full recovery target from 1 HP / 0 MP |
| --- | --- |
| City, Fort, Castle | 3 ended campaign days |
| Town | 4 ended campaign days |
| Village | 5 ended campaign days |

The eventual formula must guarantee these full HP/MP targets. No flat 33%, maximum-versus-missing basis, daily fraction, remainder allocation or rounding convention is chosen. Physical presence/staying, leaving, moving between types, outside recovery, Dying, interruption and other edges remain **TBD**. General conditions/injuries/treatment and detailed Battle Map→campaign reconciliation are also TBD. These targets do **not** establish the distinct MC defeat duration. Provenance: R18-09, R32-04, Prompt #9B §13.

## 27. Main Character special rules

The MC has a special recovery sequence on relevant permanent-loss defeat. If the **AWOL MC's squad loses**, the MC avoids ordinary permanent loss and enters the same special recovery sequence as when killed. **Every other member of that defeated squad is killed/permanently removed from active play.** Future historical/graveyard records may retain them.

The sequence's destination/selection, duration, state/usability, campaign consequences, squad reconstruction, return to play, game-over implications and edge cases were **never finalized**. Do not adopt historical nearest-settlement, approximately-three-day or MC-only-squad concepts as final. Do not substitute ordinary AWOL's 50%/2–4 days/destination or normal settlement HP/MP recovery. This is a required exception with a deferred procedure, not a recovery failure and not an ordinary Dead-targeting exception. Provenance: R28-04/07, CONFLICT-009, RECOVERY-010.

## 28. Developer tools and authoring architecture

Terminal and Devmode are separate. Grave toggles the typed terminal; Enter executes. `devmode` toggles development access **without resetting game state or changing saves**. Developer Menu is context-sensitive and available only in Devmode. Only an open developer overlay captures/pauses ordinary game input. Explicit Reset Current Game is separately confirmed and preserves control/editor storage.

`godmode` protects PLAYER HP/MP loss and makes otherwise legitimate casting free; it does not heal or unlock content. `greedisgood` makes effective G costs zero while retaining visible prices and income. These flags are transient development state. Test battle results and disposable scenarios/debug progression belong in developer controls, not normal player progression.

Edit an independent validated draft rather than active campaign facts. Campaign terrain paint/copy/clear remains separate from location create/copy/edit/move/delete and graph connections. Location copy gets a new ID; movement preserves identity/routes; deletion removes connected references and refuses protected active/starting references. Map resize can add/crop any edge; new cells are Ocean, N/W changes translate anchors, and unsafe protected crops fail atomically. Small worlds center without stretching.

Location properties retain independent appearance/type, enable state, income, shops/tier overrides, recruit race/class eligibility, biome/transition/infrastructure, quest IDs and static Battle Map references. Disabling a settlement suppresses services while retaining settings. Blank locations start with zero income; do not invent recruit formulas or quest logic in the editor.

Battle authoring supports terrain/variant selection, individual Front/Back pools, separate full special-unit definitions, conditions, readiness validation and normal-renderer preview. Editing a copied special definition does not mutate its source character; explicit rebuilding is separate. Do not invent a complete NPC, quest, treasure or encounter-scripting language. Current controller plus boolean story-key conditions require an unambiguous match or explicit selection; general selection priorities remain TBD.

Graphical authoring uses external PNGs, a developer-run Windows catalog updater, a semantic Asset Browser with search/category/status filters and actual usage/broken-reference tracking, and a shared per-frame Animation Editor. Invalid files are individually quarantined, retained and reported; unrelated valid assets remain usable. Contextual unit/terrain selectors use compatible valid assets without raw ID entry. The derived catalog never owns timing or associations. The browser does not enumerate project directories.

Logical controls, editor navigation, explicit local save/restore, JSON backup/import and readiness-gated shipping export remain part of the development architecture. Exact flashing cadence, page limits, ID shape and file-key strings are implementation choices. Provenance: R31, R16, R20, Prompt #8/#8A reports.

## 29. Saves, authored content and compatibility

Preserve deterministic campaign serialization and supported migrations; never silently reset an invalid/unsupported save or reroll candidates, growth, completed outcomes, resources or queues. Preserve historical replay as historical, not permission to reapply obsolete live behavior. Exact existing migration policies remain documented in ARCHITECTURE and ledger R32; they are implementation compatibility contracts.

**Current implementation:** campaign schema **8**; editor and control profiles version **1**. Editor drafts and controls persist separately in browser-local storage. Display preference uses a separate version-1 record. Working Copy save verifies immediate read-back; restore stays explicit. Browser-local storage is not a portable file backup, and file-URL retention depends on browser policy. The owner has now verified explicit Working Copy restore after both full Brave and Windows restarts at the same path/profile. The earlier observation is no longer a demonstrated persistence defect; the owner attributes it to confusing the live Campaign Map with the independent Editor Campaign Map. Existing diagnostics, storage and JSON backup remain unchanged. See the [post-acceptance report](docs/STAGE1-POST-ACCEPTANCE-FOLLOW-UP.md). Explicit JSON backup/import validates before replacement and may retain incomplete drafts. Shipping export validates readiness and downloads a replacement `index.html` with separate Campaign Map and Battle Map records in an inert JSON data block, optionally packaged with JSON backups/instructions. Installation replaces the launcher in the complete project; a data-only TXT block can instead be pasted into the existing launcher's authored-data section. Routine publishing no longer downloads executable `.js` assets. Legacy monolithic and split-script data remain compatible through the registry/portable JSON migration path. No executing imported code, arbitrary silent filesystem write, server or runtime fetch. Authored changes do not automatically migrate an existing campaign. Stage-1 animation definitions, per-frame timing, unit/terrain associations and effect configuration are independent editor content preserved through working copies, full/Campaign JSON backups and inert shipping JSON. External PNGs and the regenerable catalog are not embedded in authored data. Missing referenced PNGs do not prevent recovery of structurally valid drafts; required missing art prevents publication. The local developer updater generates its own derived catalog, not browser-downloaded executable shipping definitions.

Current campaign runtime lives in memory and reload starts fresh. There is serialization but no player Save/Load/Continue/autosave UI, and no saved active Battle Map CT/event/UI state. These are **implementation limitations**, not a ban on future saving. Save slots, permissions, autosave policy, mid-battle representation, authored-world compatibility and detailed resources/statuses/Dying/items/CP/effect merging remain **TBD**. Special battle units do not automatically become persistent recruits/casualties in campaign records. The established persistence-of-condition principle in §26 must guide later reconciliation. Provenance: R32, RECOVERY-011.

## 30. Explicit TBD and deferred-design register

The register retains ledger TBD identifiers for traceability, but **the text below is the current unresolved scope after Prompt #10**. Settled portions of older questions are removed. Additional questions use TBD-069 onward. Counts refer to register rows, not every occurrence of “TBD” in an ability table. None is classified as active NEEDS RECOVERY.

| ID | Current unresolved design |
| --- | --- |
| TBD-001 | Physical dodge exact ratio curve, equal-stat baseline, minimum/maximum chance and rounding; relevant offensive stats and damage/critical rules are established (§18). |
| TBD-002 | Fighter Counter chance increase and unsettled trigger-edge interactions. Ordinary Counter Attack base 1/16, physical resolution and no-Double rule are established (§22). |
| TBD-003 | Double Attack ratio curve, baseline, minimum, hard maximum, rounding, Flurry modifier and unspecified special-Skill eligibility. Same-target pattern repeat and physical-counter limit/delay are established (§18). |
| TBD-004 | Steal success formula, spatial range, category difficulty and any gameplay cap |
| TBD-005 | Single-target offensive spell INT/AGI probability curve/baseline/minimum/maximum; CON resistance/recovery and detailed WIS effects. Physical dodge uses defender AGI against attacker STR/DEX; no universal Accuracy stat (§12, §18–19). |
| TBD-006 | Final MAX HP/MP coefficients, race ranges/MOV/offset balance |
| TBD-007 | Combat Rating/power definition and comparison, unequal-target/non-kill/additional XP formula, baseline combination, rounding and edges. Fixed 100 XP/level, 49/action maximum, equal-power kill 49 and 1 XP action baseline are established (§13). |
| TBD-008 | Exhaustive action qualification and unsettled CP pool edge cases, additional awards and baseline composition. 1 CP for taking an action including truly empty use is established; known ownership/split rules remain (§13). |
| TBD-009 | Final balance of Lifetime CP threshold curve |
| TBD-010 | Unspecified class MOV modifiers and deployment defaults; retained Mage MOV 0 has qualified working-value provenance (§14). |
| TBD-011 | Cleric equipment/prerequisite confirmation, Alchemist final equipment |
| TBD-012 | Fighter STR, Knight CON and Archer DEX Training amounts |
| TBD-013 | Power Attack damage/accuracy; Feint accuracy; Evasive Stance dodge |
| TBD-014 | Psyche Up physical-attack magnitude; Cleave secondary damage; final spear-technique name and unspecified Skill edges. All Skills Major, Follow Through also 1 MOV (§16, §24). |
| TBD-015 | Shield Bash low damage, shield Guard chance profiles/reduction, Chivalry fractional DEF rounding |
| TBD-016 | Slip Away chance; Skirmisher DEF; Escape Artist survival modifier |
| TBD-017 | Aimed/Power Shot accuracy/damage; Suppressing Shot MOV; Long Shot extension/penalty; Piercing Shot DEF ignore; Eagle Eye bonus |
| TBD-018 | Covering Fire activation chance and full pre-attack execution |
| TBD-019 | Firing Position movement cost/timing and Long Shot composition |
| TBD-020 | Toss range/targeting and full consumable command integration |
| TBD-021 | Purifying Medicine probability/status selection; Conservation probability/RNG |
| TBD-022 | Emergency Medicine qualifying-damage granularity and automatic scheduling |
| TBD-023 | Forage detailed design/implementation, terrain loot tables, item creation and complete targeting; dedicated future prompt required |
| TBD-024 | Refine exact compounding formula, output item versus direct/queued effect, targets/timing/eligibility, nonnumeric items, durations/caps/rounding. Two identical consumed inputs and greater-than-sum purpose are established (§25). |
| TBD-025 | Final Panacea effect after consumables are designed; temporary no-op Major Skill is current design (§25). |
| TBD-026 | Catalyze duration extension, tiny proc chance and complete temporary-effect lifecycle |
| TBD-027 | Scrounger metric/ties/MOV price/collection/full-bag policy; hidden-item persistence |
| TBD-028 | Mage Spell Power, min/max ranges, MP, elemental/status consequences and unresolved spell-specific modifiers. INT + Spell Power, no critical/DEF/Terrain Defense, full AoE and ST INT/AGI comparison are established (§19). |
| TBD-029 | Cleric per-tier Spell Healing Power, min/max ranges, areas, MP and explicit method compatibility. WIS + healing power, no accuracy/overheal and Raise 1 fraction/life rules are established (§20). |
| TBD-030 | One global rounding convention and remaining modifier-composition details; preserve individually explicit exceptions (§19). |
| TBD-031 | Previous spell-tier learning prerequisite chain |
| TBD-032 | Arcane Seething scalable/nonscalable edges and composition; Efficiency rounding/composition. Five Mage abilities and Mage +1 versus Wizard +2 Training are established (§24). |
| TBD-033 | Fly production range/radius/MP and Extend compatibility |
| TBD-034 | Portal production MP, dead-caster pair cleanup, unsupported impairment interactions |
| TBD-035 | Enemy Spell Counter choice, future reaction priorities and multiple-Prayer ordering; independent counter rolls, damaging-reaction recursion and delayed retaliation are settled (§21–22). |
| TBD-036 | Actual race × terrain modifiers, remaining traversability/interaction and race/class compatibility matrix. Base 1 plus racial modifier and established Flying/Ocean rules remain (§9). |
| TBD-037 | Fairy debuff cure category/range/cost/cooldown/status taxonomy |
| TBD-038 | Open-ended future/secret race selection and details: stats, growth, capabilities, terrain, recruitment, unlocks, permissions and content (§11). |
| TBD-039 | Full future Hexer/Enchanter/Summoner tables, equipment/MOV/defaults/grants/prerequisites and dependent conditions. Fairy-only Enchanter tentative; Summoner direct +2 MAX MP established (§14). |
| TBD-040 | Elementalist prerequisites/AoE/table; Ranger prerequisites/growth/sword+bow hand legality/Surefooted level |
| TBD-041 | Advanced Healer name/prerequisites/table; Raise2 level/range/MP; Paladin full class table/equipment/MOV |
| TBD-042 | Druid/timecaster class concepts, Desoul, Death Rattle owner/timing/final action |
| TBD-043 | Production item/equipment/consumable catalog: specific stats, ATK, min/max ranges, prices, tiers, compatibility, Wand attack classification and off-hand/dual-wield details. Slot architecture and ordinary physical formulas are established (§15, §18). |
| TBD-044 | Equipment inheritance/strengthening/item XP/relationships after death |
| TBD-045 | Production static Battle Map catalog and full biome/transition generator |
| TBD-046 | Campaign approach→compass mapping and production generated deployment depths |
| TBD-047 | Future aquatic Ocean exceptions or campaign route/painted-terrain interaction |
| TBD-048 | Production tactical AI candidate/scoring/utility weights |
| TBD-049 | General status recovery/injuries, Dying survivor fate and treatment edges. Persistence and 3/4/5-day settlement HP/MP targets are established (§23, §26). |
| TBD-050 | Detailed battle-to-campaign HP/MP/statuses/Dying/items/CP/effects/flags merging; unfinished draw/Wilderness aftermath. Battle-end condition must persist (§29). |
| TBD-051 | No reachable friendly settlement AWOL fallback |
| TBD-052 | Distinct MC recovery destination/duration/state/usability, consequences, squad reconstruction, return/game-over/edges; other general survival/retreat design. Exemption and specified other-member deaths are established (§27). |
| TBD-053 | Production recruitment benchmark/counts/prices/rarity and exact comparable Alchemist-versus-Cleric price relationship; Alchemist cheaper is established (§7). |
| TBD-054 | Final economy prices/incomes, commerce exceptions/discounts and Zeon spending/logistics. Settlement recovery arithmetic is tracked in TBD-068 (§7, §26). |
| TBD-055 | Diplomatic willingness/Trust/Fear/Reputation/Confidence formula and liberation recovery |
| TBD-056 | Wilderness suppression radius, encounter chance/table/geographic strength and travel result |
| TBD-057 | Intel observations/accuracy/aging/report detail and non-omniscient Zeon strategic mission policy |
| TBD-058 | Jewel trigger timing, ritual duration/interruption, fair locations, drop fallback |
| TBD-059 | Quest/event/NPC/treasure scripting, event sites, journal, special-unit story persistence |
| TBD-060 | Save/Load/Continue/autosave/permissions, active-battle persistent representation and authored-world compatibility. Current serialization limitations are not final save policy (§29). |
| TBD-061 | Remaining Battle Scene production frame counts, exact anchors/UI rectangles, slide/pan/effect/shine/jitter tuning, full future role/action presentation catalogs, intermediate message advancement and generic >300 HP/MP bars. Dimensions, separate PNG frames, effect canvas consistency, terrain associations and Stage-2/3 architecture are now established in §5. |
| TBD-062 | Mobile/Android host packaging/touch shell |
| TBD-063 | Hidden occupation treasures: conditions, disappearance/claimed flags, rewards |
| TBD-064 | Final spell/Skill/ability CP costs and tuning of provisional Mage 100 Current-only entry grant (§13). |
| TBD-065 | future graveyard/historical record of permanently lost characters |
| TBD-066 | Treatment of already-processed Mage entry grants when implementing the grant; no retroactive policy invented (§13). |
| TBD-067 | Evade exact physical-dodge increase, rounding/cap and edges; its existence and Thief Reaction Lv3 placement retained (§24). |
| TBD-068 | Settlement daily HP/MP arithmetic/remainders/rounding, presence/leaving/type changes/outside recovery, Dying and interruptions; future formula must meet 1 HP/0 MP to full in established 3/4/5 days (§26). |
| TBD-069 | Actual Terrain Defense percentages by terrain; illustrative Forest 10%/Mountain 20% are not final (§18). |
| TBD-070 | Future weapon Minimum Safe Range consequences and beam drop-off statistics/formulas; future Chain Lightning propagation remains undesigned (§17–19). |
| TBD-071 | Competing Spell Counter/physical-counter opportunity aggregation and choice across a repeated Double Attack/pattern; preserve settled per-defender physical-counter cap and delay (§18, §22). |
| TBD-072 | Composition of established percentage modifiers with new stat-plus-power formulas, including whether a method scales total derived effect or a power component; no new arithmetic is selected (§19). |
| TBD-073 | Unspecified min-range modifier composition, second-pass life/target changes and other future special-pattern targeting edges; ordinary empty single-target rules remain settled (§17–19). |

## 31. Known implementation mismatches and gaps

This is a design-versus-code register, not authorization to implement unfinished mechanics. A missing final formula/content provider is a deferred dependency, not a guessed defect. Entries identify material current differences or absent integration of established rules. The source path is evidence of implemented behavior; assertions and fixtures do not override this specification.

| ID | Topic | Current code difference / boundary | Evidence | Canonical section |
| --- | --- | --- | --- | --- |
| M-001 | Physical damage and critical integration | Production Attack remains an injected resolver; fixture deals fixed 20 to an adjacent enemy. No integrated STR/DEX + Weapon ATK − DEF pipeline, critical roll or final minimum/prevention handling. | [BattleController.js](js/systems/BattleController.js), [battleFoundationFixture.js](js/data/battleFoundationFixture.js), [BattleStatusSystem.js](js/systems/BattleStatusSystem.js) | §18 |
| M-002 | Physical dodge / Evade | No production defender-AGI versus STR/DEX dodge resolver; Thief Evade is absent. Exact probability remains TBD, but established architecture and ability are missing. | [DoubleAttackSystem.js](js/systems/DoubleAttackSystem.js), [abilities.js](js/data/abilities.js), [battleFoundationFixture.js](js/data/battleFoundationFixture.js) | §18, 24 |
| M-003 | Weapon range and ordinary friendly/self/empty targeting | Attack UI passes a unit ID, losing an empty coordinate; the fixture requires adjacent enemy. No production equipped-weapon min/max range or complete permitted targeting/no-roll empty behavior. | [BattleMapState.js](js/states/BattleMapState.js), [BattleController.js](js/systems/BattleController.js), [battleFoundationFixture.js](js/data/battleFoundationFixture.js) | §17–18 |
| M-004 | Minimum Safe Range / special patterns | No integrated Minimum Safe Range or full weapon-pattern/beam Attack architecture. This is an absent architecture, not approval of example weapon numbers. | [BattleController.js](js/systems/BattleController.js), [campaignResources.js](js/data/campaignResources.js) | §17–18 |
| M-005 | Terrain Defense | Battle terrain has no production Terrain Defense percentage damage integration. Values remain undesigned. | [BattleTerrainSystem.js](js/systems/BattleTerrainSystem.js), [BattleStatusSystem.js](js/systems/BattleStatusSystem.js) | §18 |
| M-006 | Double Attack | Probability helper hard-caps at 0.9 and execution does not perform complete second patterns or aggregate two counter opportunities per defender. New exact maximum/formula remain TBD. | [classConfig.js](js/config/classConfig.js), [DoubleAttackSystem.js](js/systems/DoubleAttackSystem.js), [BattleController.js](js/systems/BattleController.js) | §18 |
| M-007 | Ordinary physical Counter Attack | normalCounter/resolveNormal are caller-supplied; no production base 1/16 equipped-range ordinary physical resolver implements the full new rule. | [CombatSystem.js](js/systems/CombatSystem.js), [BattleController.js](js/systems/BattleController.js) | §22 |
| M-008 | Independent counter checks and choice | Spell Counter success returns early and suppresses the normal check. No independent-result arbitration / defending-player choice between both successful reaction kinds. | [CombatSystem.js](js/systems/CombatSystem.js) | §22 |
| M-009 | AoE and single-target spell trigger classification | Controller schedules counters for damaging AoE targets, and skips all non-damaging casts instead of classifying normal single-target MAGIC Major triggers. AoE spells should trigger neither counter. | [BattleController.js](js/systems/BattleController.js) | §21–22 |
| M-010 | Damaging-reaction recursion | Only spellCounterGenerated suppresses another Spell Counter; normalCounter remains reachable. No general damage-inflicting-reaction provenance prohibition. | [CombatSystem.js](js/systems/CombatSystem.js), [BattleController.js](js/systems/BattleController.js) | §22 |
| M-011 | Delayed multi-target retaliation | Controller emits TARGET/COUNTER pairs and may push a child retaliation before remaining primary targets. Required primary-first delayed order is absent. | [BattleController.js](js/systems/BattleController.js) | §21 |
| M-012 | Magic and healing base formulas | resolveTarget applies cast.magnitude.amount directly; it does not add caster INT to damage or WIS to healing. Global-rounding provider remains correctly unresolved; modifier composition needs design. | [BattleActionSystem.js](js/systems/BattleActionSystem.js), [MagicSystem.js](js/systems/MagicSystem.js) | §19–20 |
| M-013 | Single-target offensive spell dodge | Single-target damage applies without a caster-INT versus target-AGI comparison. AoE no-dodge behavior itself is consistent. | [BattleActionSystem.js](js/systems/BattleActionSystem.js) | §19 |
| M-014 | Spell center bounds and min range | prepare rejects off-map centers, cursor/range overlay clip to map and the spell schema exposes only castingRange. No complete independent min/max center-placement contract. | [BattleActionSystem.js](js/systems/BattleActionSystem.js), [TargetingSystem.js](js/systems/TargetingSystem.js), [BattleMapState.js](js/states/BattleMapState.js), [spells.js](js/data/spells.js) | §17, 19 |
| M-015 | Spell allegiance and empty single targets | Current targetAllegiances/canTargetCaster fields prohibit general friendly damage/hostile healing; single-tile casts require a center unit. General permitted allegiance/empty targeting remains unimplemented. | [TargetingSystem.js](js/systems/TargetingSystem.js), [BattleActionSystem.js](js/systems/BattleActionSystem.js), [spells.js](js/data/spells.js) | §17, 20 |
| M-016 | Mute eligibility across entry paths | Main BattleController spell-eligibility callback checks Mute, but shared CombatSystem.counters has no direct Mute guard and direct BattleState callers can supply eligibility then reach casting rejection. Full all-path pre-roll ineligibility is not enforced centrally. | [CombatSystem.js](js/systems/CombatSystem.js), [BattleState.js](js/states/BattleState.js), [BattleActionSystem.js](js/systems/BattleActionSystem.js) | §19, 22 |
| M-017 | Terrain modifier representation | normal reads absolute override cost rather than base 1 plus racial modifier; empty tables currently mask the difference. | [BattleTerrainSystem.js](js/systems/BattleTerrainSystem.js) | §9 |
| M-018 | Innate Flying bridge | Races declare FLIGHT movementTraits while FlyingSystem reads FLYING capabilities; Birdfolk/Fairy innate capability is not connected. Source-aware temporary handling alone does not fix it. | [races.js](js/data/races.js), [FlyingSystem.js](js/systems/FlyingSystem.js) | §9, 11 |
| M-019 | Mage entry grant | Mage grant is null; access can mark zero processed. Once-only framework exists but Current 100/Lifetime 0 intent is missing. Retroactive policy remains TBD. | [classes.js](js/data/classes.js), [spellClasses.js](js/data/spellClasses.js), [ClassEntryGrantSystem.js](js/campaign/ClassEntryGrantSystem.js) | §13 |
| M-020 | Five Mage abilities | Robe Training, Wand Training, Arcane Seething, Mage Intelligence Training +1 and Arcane Efficiency are missing. Wizard +2 is not a substitute. | [abilities.js](js/data/abilities.js), [spellClasses.js](js/data/spellClasses.js) | §24 |
| M-021 | Steadfast hostility | Displacement hook tests PLAYER/ZEON specifically and does not block all actually hostile sources, including Wilderness. | [AbilityEffectHooks.js](js/systems/AbilityEffectHooks.js) | §24 |
| M-022 | Skill economy metadata | Protect/Hold the Line explicitly false resolve Minor contrary to Major Skills. Follow Through/Psyche Up/Forage/Refine/Panacea null fields default Major but remain incomplete metadata. | [abilities.js](js/data/abilities.js), [TurnSystem.js](js/systems/TurnSystem.js) | §16, 24 |
| M-023 | Follow Through expenditure/execution | Requirements enforce preconditions but complete first attack, 1 MOV expenditure, legal kill-advance and optional follow-up are not integrated. | [AbilityRequirementSystem.js](js/systems/AbilityRequirementSystem.js), [AbilityEffectHooks.js](js/systems/AbilityEffectHooks.js), [BattleMapState.js](js/states/BattleMapState.js) | §24 |
| M-024 | Panacea | Existing helper cures removable statuses rather than being the intentional temporary no-op. | [ItemSystem.js](js/systems/ItemSystem.js) | §25 |
| M-025 | Refine assumptions | Helper requires a newly created output catalog item and scalar HP+MP comparison. Canonical core does not establish that output form or complete eligibility. | [ItemSystem.js](js/systems/ItemSystem.js) | §25 |
| M-026 | XP and action CP baseline | ExperienceSystem is empty; default CPAwardCalculator returns null. No production 1 XP + 1 CP action baseline or established 100/49 XP constraints integration. | [ExperienceSystem.js](js/systems/ExperienceSystem.js), [ClassProgressionSystem.js](js/campaign/ClassProgressionSystem.js) | §13 |
| M-027 | Summoner direct growth | Future Summoner absent and growth application accepts six primaries only. No applicable direct +2 MAX MP growth support. This does not authorize its undesigned class table. | [CharacterGrowthSystem.js](js/campaign/CharacterGrowthSystem.js), [classes.js](js/data/classes.js) | §12, 14 |
| M-028 | MC defeat exception | Generic AWOL/casualty handling lacks the special MC branch and specified deaths of other members. Detailed recovery procedure still needs design. | [AwolSystem.js](js/campaign/AwolSystem.js), [BattleCasualtySystem.js](js/campaign/BattleCasualtySystem.js) | §27 |
| M-029 | AWOL return eligibility | Old type whitelist and own-faction controller filter remain; records are evaluated only when due. No complete type-independent player-support eligibility reevaluation every absent day. | [AwolSystem.js](js/campaign/AwolSystem.js) | §23 |
| M-030 | Battle-end condition persistence | Campaign boundary commits established casualties/AWOL, without complete persistent remaining HP/MP/condition integration. Fresh battle adapters cannot substitute automatic healing for intended attrition. | [BattleState.js](js/states/BattleState.js), [BattleStatAdapter.js](js/campaign/BattleStatAdapter.js), [ResourceSystem.js](js/campaign/ResourceSystem.js) | §26, 29 |
| M-031 | Settlement recovery | No campaign End Day HP/MP recovery system meeting established City/Fort/Castle 3, Town 4, Village 5-day targets; detailed arithmetic remains TBD. | [ResourceSystem.js](js/campaign/ResourceSystem.js), [CharacterStatsSystem.js](js/campaign/CharacterStatsSystem.js) | §26 |
| M-032 | Other established ability integration | Many martial Skills/reactions and item effects remain detached metadata/helpers, not complete playable commands: e.g. Cover/Guard/Covering Fire/Indomitable timing, weapon-technique effects, ordinary Item/Steal, Forage and Scrounge. BattleMapState reports unresolved commands. Preserve established pieces and defer unknown magnitudes. | [BattleMapState.js](js/states/BattleMapState.js), [AbilityEffectHooks.js](js/systems/AbilityEffectHooks.js), [ItemSystem.js](js/systems/ItemSystem.js), [abilities.js](js/data/abilities.js) | §16, 24–25 |
| M-033 | Hostile Dying collision | Movement currently permits passage through any DYING occupant regardless of faction. Hostile Dying must block passage. | [TacticalMovementRules.js](js/systems/TacticalMovementRules.js) | §9, 23 |
| M-034 | Production Battle Scene renderer and combat integration | Stage 1 implements catalog, authoring, animation preview and resilient lookup contracts. Existing combat still uses enlarged map placeholders and its older continuous backdrop. Production shot transitions, persistent windows, resource bars, sequencer/templates and combat activation are planned Stages 2/3. | [BattleSceneAssets.js](js/editor/BattleSceneAssets.js), [BattleSceneRenderer.js](js/rendering/BattleSceneRenderer.js) | §5, 28–29 |

## 32. Supersession, provenance and future maintenance

The ledger remains the detailed provenance/history authority. Retain its original recovery records, source inventory, implementation-only findings and supersession chains. It intentionally describes design at the end of #9B and is not rewritten to pretend that Prompt #10 decisions existed earlier.

Prompt #10A supersedes earlier AoE radius labels with literal Manhattan radius (§21), preserving existing shapes, tile counts, casting ranges and deterministic ordering. The Prompt #10 report and dated source artifacts retain their historical wording; runtime representation remains implementation evidence rather than canonical terminology.

| Historical statement | Current design |
| --- | --- |
| Earlier 160×144/320×240 buffers; five greens | 480×360 and four exact shades (§5). |
| Remainder `1000 % AGI` after a turn | Subtract 1000 from actual CT, preserving overshoot (§16). |
| Prayer 50%; Martyr once per battle | Prayer 25%; Martyr each new Alive→Dying transition (§22). |
| Ability-price curve labeled final | Broader final purchase costs TBD; working code prices are not final (§13). |
| Thief Evade rejected/omitted | Intended Lv3 Reaction; exact dodge modifier TBD (§24). |
| Whole terrain table/equipment/future classes “missing” | Never-designed/deferred detail; no active recovery failure (§2, §30). |
| All Dying units passable | Friendly transit permitted; hostile Dying blocks passage (§9, §23). |
| Spell Counter first, success suppresses physical check | Independent eligible rolls and defending-player choice if both succeed (§22). |
| Narrow Spell Counter→Spell Counter suppression only | Any damaging reaction cannot generate a damaging reaction (§22). |
| Retaliation interleaved after each area target | Primary sequence first, delayed retaliation in originating-target order; AoE spells generate neither counter (§21). |
| Universal double-attack maximum 90% | Hard maximum required, exact value now TBD (§18). |
| Universal restrictive spell allegiance/center bounds | General friendly/self/empty permission and off-map AoE centers, with explicit mechanic/life/range constraints (§17). |
| Physical/magical/healing base formulas, crit and counter base unresolved | Prompt #10 establishes formulas, 5%/+25% critical and 1/16 counter; dodge curves and global rounding remain TBD. |
| Action minimum awards unresolved or success-only | 1 XP + 1 CP for taking an action including truly empty use; attribution/qualification edges remain TBD (§13). |
| Minimum physical damage could erase explicit prevention | Designer clarification: explicit prevention/immunity may yield 0 (§18, §24). |

Other narrow historical changes remain in ledger SUPER-001–044: control/stationing/schema migrations, map scale/cursor changes, class growth/Mage scope and equipment, Fly/Portal/route midpoint, Trade/Scrounge economy, deployment overflow/Ocean, developer reset separation, Summoner direct MP, MC/AWOL exceptions and settlement taxonomy provenance. The early Capital/Village/Port/Fortress/Shrine taxonomy was prototype implementation data, not an independently approved former designer taxonomy.

Read this specification first for design, then inspect code for current behavior, use §31 and the development documents to plan work, and consult the ledger only as needed for provenance. Future accepted decisions amend the relevant rules, TBDs, mismatches and source notes here. Do not finish dependency-blocked design merely to satisfy an implementation task. The full source coverage and Prompt #10 verification are recorded in the companion report.
