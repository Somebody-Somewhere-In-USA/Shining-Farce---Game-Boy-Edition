# Campaign, battle and authoring architecture — Prompt #8

## Design authority and development use

This document records implementation architecture and retained historical contracts. Design intent is consolidated in the [Canonical Design Specification](../CANONICAL-DESIGN-SPECIFICATION.md), prepared for review/acceptance after Prompt #10 and authoritative for design once accepted. Git remains authoritative for implemented behavior. The [Recovery Ledger](SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md) preserves provenance/history; historical handoffs and reports do not override accepted design. There is no clearly current Codex Development Handoff to update; the maintained README and this document carry these development instructions instead.

Read the specification before changing gameplay. Use its §31 mismatch register to distinguish current behavior from required design; older architecture paragraphs below describe what code does, including known differences. Do not invent TBD formulas, catalogs or interactions, and do not promote fixture/default values to design. Future accepted design decisions amend the specification and retain provenance. Documentation review does not itself authorize fixing every mismatch. See [Prompt #10 report](PROMPT10-DOCUMENTATION-REPORT.md).

## Boundaries and loading

Classic script order in `index.html`: namespace/config → definitions → shared core → campaign services → preserved tactical groundwork → rendering/UI/states → editor services/registry → inert authored JSON block → tests → Game/main (which parses/validates page data before game startup). Each file registers on `window.GBTRPG`. No modules, fetch, remote dependencies or build step are involved.

`Campaign` retains privately owned state, frozen public snapshots, a transactional command facade, validation after commands and immutable events dispatched after commit. Definitions remain separate from runtime facts. `CampaignMapState` owns temporary selection/preview/menu data. `EndDayState` owns phase feedback and the test-battle presentation. Neither UI writes campaign facts; renderers receive read-only data and draw it. The original tactical test has its own hero and no strategic campaign reference.

## Visual Platform Philosophy

Shining Farce is Game Boy-inspired, not Game Boy hardware-emulated. The authoritative framebuffer is fixed at **480×360**, configured once in `gameConfig.js` and consumed by `graphicsConfig.js`/`Renderer`. The canvas declaration matches it. The strategic base visual unit is **16×16**, not a maximum asset size. The preserved tactical base remains **16×16**. The game uses explicit CSS display dimensions from PresentationShell, pixelated sampling, integer draw positions, and bitmap text. A standalone Renderer without that presentation manager retains its legacy integer-fit fallback.

Exactly four canonical source shades in `palette.js` are valid throughout game art, text, menus, Terminal, editors and effects: #9BBC0F, #8BAC0F, #306230, #0F380F. `background` aliases `lightest`; five property names represent four distinct colors. No fifth source shade is permitted.

`displayPalettes.js` defines eight explicit four-color output palettes with an `outside` companion color. Earlier alternate framebuffer values remain provisional/tunable; Dark’s reversed grayscale values and all eight companion colors are established owner design. `DisplayPalette` computes an affine RGB matrix through the four canonical colors and installs an sRGB SVG `feColorMatrix` referenced only by the 480×360 game canvas. The alpha row is identity. It recolors the complete composited game output without changing PNGs, renderer draw colors, source validation, or reading potentially origin-tainted canvas pixels. No body/page filter is installed; the Game Boy hardware layer stays outside this canvas. `DisplayPalette.apply` separately sets the existing root `--clear-color` CSS property consumed by the page background. `preview(id)` updates both output and background without writing storage; `choose(id)` also persists. Options uses an opt-in PropertyScreen preview callback with an original-value snapshot; Accept commits, Cancel or dismissal rolls back. Other fields retain their commit-only behavior. Canonical output removes the filter. `Game.handleDisplaySelect` consumes logical Select only when the active state opts in and no developer overlay, terminal, text entry or capture owns input. Campaign stacks, tactical forecast paging, Spell Lab selection and editor frame/variant controls keep priority. Options / Controls also exposes display selection. `shining-farce.display.v1` now writes a version-3 record `{version:3,palette:id,presentationMode:1..3}` independently of controls, editor and campaign content. Experimental small choices normalize to 1, large to 2, frameless/default to 3; recognized legacy preferences are written back on load. `committedId` separates the persisted palette from live preview so saving a size never commits an unaccepted palette preview.

The game owns campaign rules, action consumption and framebuffer rendering. A future host owns device layout and input collection. `Input.enqueueAction(action, { repeat })` accepts `up`, `down`, `left`, `right`, `confirm`, `cancel`, `menu`, `start`, `select`, `terminal`, and `devmenu`; `accept` aliases `confirm`. Keyboard bindings feed the same queue. Directional repeats are accepted; repeated confirmation/menu presses are suppressed. Browser Gamepad API polling maps standard buttons and a dead-zoned left stick to the same queue. Keyboard/controller profiles are versioned and stored separately from campaign state. Touch input remains deferred.

## Strategic Map Interaction

`worldVisuals.js` is static decorative tile data: 64×40 cells (1024×640 world pixels), six external terrain frames, and symbolic rows. `WORLD.locations[].mapPosition` supplies grid-aligned display anchors. The graph still exclusively owns adjacency and path cost; neither tiles nor sprite offsets have movement semantics.

`WorldCamera` owns integer world offsets, screen/world coordinate conversion and clamping. The map rectangle is `(0,16,320,192)`. A 32px inner margin triggers cursor following; the camera clamps to `[0,704] × [0,448]` for the shipped world. It does not scroll during menu navigation. The header and footer stay in screen coordinates. `WorldMapRenderer` clips tile/graph/object drawing to the map rectangle and uses integer Bresenham pixels for routes.

`MapPresentation.derive(campaign, visibilityPolicy)` creates disposable view records:

```text
objectType, objectId, key, locationId, name
worldX, worldY, width, height
spriteId, spriteFrame, visible, selectable, selectionPriority
controller (location only)
faction, hasMC, stationed, stackCount, drawSprite (squads/reports)
```

Locations use their definition anchor. Squad anchors are derived from authoritative `currentLocationId` plus `(32,0)` presentation pixels, or `(48,0)` at a 32px capital. `stationed` derives from the location's faction-specific stationing reference; `hasMC` derives from membership of unit `mc`. These fields never enter campaign serialization. Mutating a derived record cannot move a squad or change stationing.

All squads sharing a node have a common stack anchor. The stationed squad is the default drawn sprite and gets an underline, with `+N` for additional squads. Q cycles the individual objects and displays the chosen sprite. Selection sorts stationed first, then MC/ordinary PLAYER/ZEON identity, then stable ID. Locations have lower selection priority and a separate cell. Only one sprite is drawn at a stack anchor; its art is derived from roster slot 1. `atCell()` performs visible/selectable 16px AABB hit testing, making overlap handling deterministic.

PLAYER squads are always presented. The explicitly named development visibility policy shows all ZEON squads. A replacement policy can return `hidden`, `visible`, or `{ visibility: "reported", locationId }`. Reports require a separate reported node, use a question-mark asset and expose approximate information only; they do not use the true location as an implicit fallback. Normal location/squad lists use the presentation filter. Debug inspection deliberately remains omniscient. No discovery, fog, aging or intelligence simulation is implemented.

`MapPresentation.commands()` is the application query for contextual command availability. PLAYER planning commands are MOVE/CHANGE ROUTE, STATUS, MANAGE, ROUTE/CANCEL ROUTE for existing orders, and STATION for an eligible nonstationed squad. Nonplayer squads and squads outside PLANNING are information-only. Locations offer INFO and SQUADS HERE, plus legal SHOP/RECRUIT services. The derived `hasMC` identity is available for future command policies. Renderers do not decide permissions, and the campaign command facade still validates every mutation.

`CampaignMapState` owns cursor coordinates, overlap index, selected squad, preview path and a view stack. Arrow input moves exactly one 16px cell and clamps at world edges. Confirm selects the highest-priority object or the object chosen by Q. `showPopup()` positions a bitmap menu beside that object's screen anchor through `menuBounds()`: right by default, left when needed, shifted up at the bottom, clamped to framebuffer margins. `CampaignUIRenderer` only draws the supplied list/bounds. Context menus consume directional input; detailed information and the global campaign menu can still use full screens.

MOVE starts at the selected squad's current location. A destination must be a location marker under the spatial cursor. The existing pathfinder produces the dashed preview. Confirmation stays over the map and calls `queueMovement`; cancellation never replaces an existing order. Confirmed routes are drawn thicker from the stored remaining order, including after returning from End Day. No path, travel cost, or movement result is computed in the renderer.

`EndDayState` uses the full viewport with larger information capacity and a visible temporary battle-result list. The isolated tactical test translates its original 160×144 map to `(80,48)` without scaling its art or changing collision/movement coordinates.

## Neutral arrival control correction

`PoliticalControlSystem.controllerAfterArrival()` centralizes the arrival rule used by `WorldUpdateSystem` and resolution replay validation. PLAYER → NEUTRAL stays NEUTRAL; ZEON → NEUTRAL becomes ZEON; PLAYER → ZEON becomes PLAYER; ZEON → PLAYER becomes ZEON. This runs after arrivals commit. Polity allegiance is untouched. Explicit polity support and controller commands retain their existing behavior. No other campaign movement/resolution rules change in Prompt #2.5.

## State schema and stationing migration

### Character schema 4 foundation, extended by schemas 5, 6 and 7

Schema 4 adds explicit `raceId`, `characterLevel`, `currentClassId`, `basePrimary` (STR/DEX/CON/AGI/INT/WIS), `growthRngState`, and independent `classProgress` to units and generated candidates. The old `level` field and archetype stat blocks are removed. Exact persistent record validation rejects derived duplicates. See [Prompt #3.5](PROMPT3.5-IMPLEMENTATION.md) for complete shapes, assumptions and checks.

Schema-3 PLANNING migration preserves existing resource records, ordered rosters and unit identity/location/faction/status. Stable ID seeds generate old units; candidates use their stored seed. Both simulate level-minus-one growth events. Invalid/missing old levels and levels over 100 reject. Active legacy resolutions must finish in the earlier build; schema-5 active resolutions migrate to schema 8 and restore at every phase. Completed old resolution history remains historical and is not replayed as current battles.

### Earlier resource schema 3

Schema 3 adds `treasuries`, `itemInstances`, `shipments`, `travelerOrders`, `recruitPools`, `recruitment`, `nextItemId`, `nextShipmentId`, and `nextUnitId`. Units originally gained `typeId`, `faction`, `level`, `status` and `unassignedLocationId`; schema 4 replaces `level` with the progression fields above. Squadron `unitIds` remain the authoritative ordered membership array. No squad inventory, sprite authority or duplicated unit-to-squad reference is added.

Schema-1/2 PLANNING snapshots migrate through existing stationing conversion and then `ResourceSystem.initialize()`. Existing member order/positions are retained; demo archetypes and resource defaults are deterministic. Legacy orphan units lacked physical facts and receive a documented development fallback at Granseal. Schema-7 restoration never silently defaults missing fields. Old active schema-1/2/3/4 resolutions are rejected with an explicit instruction to complete them in the earlier build before migration; no battle queue is discarded.

## Strategic Visual Scale

The strategic base is now **16×16**, with 32×32 capitals. All 13 new strategic PNGs are authored at native resolution; the optional image verifier checks for detail that cannot come from doubled 8px blocks. `worldVisuals.js` retains its 64×40 cells; visual anchors double, so world bounds grow to 1024×640. Cursor steps, AABB hit testing, terrain source rectangles, unit sprites, route centers, wagon offsets and camera following use the new scale. The framebuffer is now 480×360 with its four authorized shades. Tactical tiles/hero remain 16×16 and their movement rules are unchanged.

## Ordered Squad Rosters

`UnitManagementSystem` owns roster reordering, local transfer and membership changes. A unit derives squad membership by scanning ordered `squad.unitIds`; when assigned, `unassignedLocationId` must be null. When unassigned, that field is the sole physical node authority. Squad movement thereby moves members without writing redundant unit coordinates.

`sprite(state, squad)` reads roster slot 1 and resolves an individual `CAMPAIGN_CHARACTERS[id].strategicSpriteId` override or a reusable `UNIT_TYPES[typeId].strategicSpriteId`. Empty squads use an external flag fallback. MC detection still checks membership of `mc` anywhere in the roster. Slot 1 is representation, not narrative leadership, permissions, bonuses or survival priority.

Reordering preserves membership and time. Transfer/create commands require physical co-location, ACTIVE status, matching faction, no active lone-unit order and a maximum of 12 members. Removing a member or voluntarily dismissing a squad leaves units ACTIVE and unassigned at that node. Battle defeat instead retains records with temporary DEFEATED status at their origin; it does not invoke voluntary dismissal behavior or final recovery mechanics.

## Economy

`treasuries = { PLAYER, ZEON }` is the only general material currency authority. `EconomySystem` validates spending and produces immutable `TREASURY_CHANGED` / `LOCATION_INCOME_COLLECTED` events. `location.economy.dailyIncomeG` is data; physical controller selects the receiving faction. NEUTRAL contributes to neither. `recovery.incomeMultiplier` is an optional 0–1 hook, default 1. Income rounds down to integer G. No wages, food or upkeep are implemented.

Starting development funds are PLAYER 1000 G, ZEON 500 G. Income examples: Granseal 60, Grove 25, Galam 80, Port 40, Fort 15, Shrine/Crossroads 0. The normal UI only queries PLAYER funds; the debug resource inspector may show ZEON funds. Economic data supports both factions, but ZEON spending AI is deferred.

## Shops

`campaignResources.js` extends the existing item registry and location definitions with category/tier catalogs. Categories are WEAPON, ARMOR, ACCESSORY and CONSUMABLE. Availability is `location controller === PLAYER` and location shop tier at least the item's required tier. Catalog entries never deplete. There are no stock counters or restocking rolls.

`EconomySystem.purchase()` validates access, tier and funds before creating a stable item instance at the purchase node. All commands operate on a draft; failure creates no item and deducts no G. `RESOURCES.shopPriceMultiplier` defaults to 1.0 as the explicit future discount hook. Prices are nonnegative integer G. Neutral-commerce exceptions are not implemented.

## Inventory Ownership and Physical Location

Each ordinary copy is an `itemInstances[id]` record:

```js
{
  id: "item1", definitionId: "ironSword", ownerFaction: "PLAYER",
  state: "AVAILABLE", // AVAILABLE | IN_TRANSIT | EQUIPPED | PERSONAL
  place: { type: "LOCATION", id: "granseal" }, // LOCATION | SHIPMENT | UNIT
  assignedUnitId: null
}
```

Only `place` owns physical containment. `assignedUnitId` is an intended recipient, not another physical location. Available copies must occupy a location; transit copies must belong to exactly one shipment; equipped/personal copies must occupy a unit. Validation rejects duplicate equipment slots, duplicate cargo, contradictory physical states and ID-counter reuse. Stable IDs survive serialization. `InventorySystem.aggregate()` derives one PLAYER list with per-definition totals, copy IDs and physical/state distribution; equipped and personal possessions remain visible there. Normal screens use names/copy ordinals, not internal IDs. Squads have no generic inventory.

## Equipment Assignment and Delivery

Equipment authority stays on actual item instances. `InventorySystem.equipment(state, unitId)` derives a `weapon`/`armor`/`accessory` map of instance IDs, preventing a second, contradictory equipment index on units. PERSONAL instances are a separate four-item consumable foundation. Item modifiers are data; consumable behavior remains metadata pending tactical implementation.

`assignItem()` checks ownership, composed race/class restrictions and slot assignments. An available co-located copy equips immediately. A remote copy moves into a supply wagon and carries an `assignedUnitId`; the old equipped copy remains active. A second pending replacement for the same slot is rejected. `stats()` reads only EQUIPPED instances, never assigned/transit items.

Delivery uses committed recipient positions. Cargo reaches a node before automatic equip; replaced gear becomes AVAILABLE at that node. If a recipient moved that day, the wagon waits at its old destination and replans next order lock. If a target is no longer ACTIVE or a personal bag is full, delivered cargo remains AVAILABLE at the arrival node. A wagon can consolidate multiple copies for the same unit when they are at the same origin.

`releaseItem()` unloads/cancels a pending assignment at the wagon's current node or removes a unit possession at that unit's current node. An emptied wagon dissolves. Nothing teleports. BattleScenario unit snapshots now contain detached equipment instance references, possession/definition snapshots and derived active stats from the frozen world. They exclude undelivered bonuses and do not expose the live campaign object.

## Strategic Travelers

`TravelerPath` shares graph-path validation, path creation and one-edge intent extraction. Existing squad orders continue through `StrategicOrderSystem`; wagons/lone units use `travelerOrders` tagged SUPPLY_WAGON or LONE_UNIT. Both consume `WorldPathfindingSystem`, the same route availability and the same one-edge-per-day rule. There is no second graph/pathfinder or squad-sized wagon object.

At ORDER_LOCK, wagon paths are refreshed from supplied knowledge, then orders/resources and all unit/squad positions are frozen. MOVEMENT_INTENT creates squad and non-squad intentions without moving anyone. COLLISION_DETECTION produces existing squad battle conflicts and typed non-squad outcomes from those same frozen positions/intentions. Squad battles can interrupt normally; cargo, funds and traveler positions stay unchanged until the common commit barrier.

The existing squad conflict queue remains independent. `TravelerSystem.interactionPolicies` maps wagon contact to DESTROY_CARGO and lone-unit contact to CAPTURE. Contact is a shared intended destination, arrival at a stationary enemy node, or opposite traversal of the same edge. An unassigned stationary PLAYER unit can also be captured by an arriving ZEON squad. These placeholder contacts use frozen intended paths, regardless of subsequent same-day squad battle outcomes: friendly squads do not absorb or implicitly escort a wagon, and defeating a captor in a separate battle does not retroactively protect cargo.

At the batch commit, squads retain their original staged-resolution semantics and travelers apply recorded outcomes once. Lone units move their unassigned node; captured units remain addressable with CAPTURED status and lose carried items. No wagon/lone-unit tactical BattleScenario is generated. Final individual survival/capture/recovery mechanics are deferred.

## Supply Logistics

`shipments[id]` contains faction, current node, destination node, target unit and cargo instance IDs. The corresponding traveler order holds the remaining graph path; there is no attachment/escort/squad container field. Independent 16px wagon map objects and the Shipments screen expose cargo/progress.

The replaceable knowledge provider returns `dangerousLocationIds` and `dangerousRouteIds`. The default adapter only reads public ZEON control, not hidden actual squad positions. `safeWeight(known)` closes over that supplied knowledge and gives dangerous edges/destinations infinite cost. Hidden squad state is used by physical interception resolution, never by this routing policy. Custom adapters can supply legitimately observed danger; callers should reinject them when restoring for future days, while an already-frozen resolution never calls them again.

At each End Day lock, safe routes are recomputed toward the target's frozen location. If none exists, the wagon holds. Closed routes remove pending traveler orders; wagons may replan next lock. An intercepted wagon and every cargo copy are removed atomically, with a SHIPMENT_INTERCEPTED event and a visible End Day loss count. Delivery dissolves the wagon after moving/equipping each copy exactly once.

## Recruitment Pools

Recruitment tables live on locations and select unit archetypes independently of level. Pools contain stable candidate ID, type ID, level, generated seed and positive G cost. `RecruitmentSystem.recruit()` requires PLAYER control, an extant candidate and sufficient funds, then creates an ACTIVE unassigned unit at that location and removes the candidate. Remote squads cannot instantly receive it.

`RESOURCES.recruitIntervalDays` is 7. Pools initialize on day 1 and refresh in WORLD_UPDATE when entering day 8, then 15, etc. `recruitment` stores the PRNG state, candidate counter, last refresh and next refresh. Unpurchased candidates are replaced automatically; purchased units are independent records. No public manual-refresh/reroll command exists. Low-level deterministic generation is an internal service used by initialization, daily updates and isolated tests.

## Veteran Benchmark

`VeteranBenchmark.calculate(state)` is a replaceable interface. The current conservative approximation uses the 75th-percentile index of ACTIVE PLAYER levels, never an arithmetic roster mean. Candidates use benchmark minus 2, seeded variation of 0 or 1, and the location modifier, clamped to level 1. Cost is archetype base plus 15 G per level. Class/race availability is separate from level generation. Future battle participation/Combat Rating data can replace the benchmark without changing pool scheduling or purchase logic.

## Resource update ordering, validation and APIs

The deterministic ordering is: commit all squad/traveler outcomes → existing arrival-control update → shipment delivery/equipment application → controlled-location income → scheduled recruit refresh → day advance. All daily resource operations occur under the existing WORLD_UPDATE flag and guard. PLAYER → NEUTRAL still leaves control NEUTRAL.

Active resolutions carry `resourceBefore`, `travelerIntents`, `travelerOutcomes` and `resourceSummary` alongside the existing frozen squad world. `ResourceSystem.validateResolution()` regenerates intentions/outcomes and replays commit/delivery/income/refresh against the frozen record, comparing resources and unit state. Corrupt funds, duplicate deliveries or changed traveler destinations are rejected. Battle interruptions and intermediate phases remain JSON serializable.

New Campaign commands are `purchase`, `recruit`, `assignItem`, `releaseItem`, `reorderRoster`, `transferUnit`, `removeUnit`, and `queueLoneUnit`; all require PLANNING and use the existing atomic draft/validate/commit/event path. Existing creation/dismissal/membership commands now respect geographic unit authority. Queries/services derive inventory, equipment, active stats, income and display objects without mutating campaign facts.

New useful events: TREASURY_CHANGED, LOCATION_INCOME_COLLECTED, ITEM_PURCHASED, ITEM_ASSIGNED, ITEM_EQUIPPED, ITEM_RELEASED, SHIPMENT_CREATED, SHIPMENT_REROUTED, SHIPMENT_INTERCEPTED, SHIPMENT_DELIVERED, TRAVELER_MOVED, TRAVELER_ORDER_QUEUED, UNIT_INTERCEPTED, RECRUIT_POOL_REFRESHED and UNIT_RECRUITED. Ordered roster edits use the existing SQUAD_MEMBERS_CHANGED event with ordered IDs. No redundant per-frame representative-change event is needed.

### Resource invariants

```text
Strategic base visuals use 16×16 pixels.
Squad map representation derives from roster slot 1.
Roster slot 1 is not narrative leadership.
Ordinary items do not teleport.
Ordinary recruits do not teleport.
Squads have no generic inventory.
Supply wagons remain independent from squads.
Shops have infinite stock.
Ordinary recruits cost G.
Recruit pools refresh automatically, never manually.
Only PLAYER-controlled locations permit ordinary recruitment.
New strategic travelers participate in frozen End Day movement semantics.
PLAYER movement into NEUTRAL territory still does not change control.
```

### Retained movement schema

Schema version **3** retains `worldId`, `day`, `phase`, `nextArrivalOrder`, `polities`, `locations`, `routes`, `squads`, and `units`, and retains the movement fields added in schema 2:

```text
orders: { [squadId]: MovementOrder }
resolution: ResolutionRecord | null
lastResolution: completed ResolutionRecord | null
nextResolutionId: positive integer
```

Only one completed record is retained; frozen snapshots do not recursively embed past resolutions. The authoritative phase lives at the campaign root, not in a second competing field.

Each location has exactly one defender authority:

```js
stationedSquadIds: { PLAYER: null, ZEON: null }
```

Each non-null value must reference a present squad of that faction. Existing eligible defenders are retained. Otherwise the oldest current arrival is selected, with stable ID as the final tie breaker. Simultaneous arrivals receive monotonically increasing arrival orders in squad-ID order, independent of command insertion order. Manual selection works for either faction during planning. There is no `squad.isStationed` flag and no singular defender alias.

`CampaignState.migrate()` explicitly converts schema 1: require a valid legacy PLAYER defender, preserve it, derive the earliest present ZEON defender, remove `stationedSquadId`, and initialize new resolution fields. Mixed/contradictory stationing representations and corrupt legacy references are rejected. Version 1 had no resolution states, so only PLANNING migrates. The constructor migrates a detached copy, validates it, then freezes it.

Squads still have an ID, faction, independent placeholder unit references, 12-unit maximum, creation day, arrival sequence, mission placeholder and two artifact slots. `travelState` stays null: confirmed routes belong exclusively to orders and daily attempts belong exclusively to intents. This avoids redundant route state on squads. Ordinary inventory and derived equipment statistics now belong to the resource layer described below.

## Movement order schema

```js
{
  squadId: "vanguard",
  destinationLocationId: "galam",
  plannedLocationIds: ["granseal", "crossroads", "galam"],
  plannedRouteIds: ["westRoad", "kingRoad"],
  createdDay: 1
}
```

Paths use the remaining-path representation, not a duplicated step index. The first node must equal the squad's actual location; the final node must match the destination. Every edge must exist, connect its listed endpoints, and be available/unblocked. Commands reject invalid squads/factions, empty or disconnected paths, unavailable edges and non-planning edits. Closing a route during PLANNING cancels orders that include it with a `ROUTE_UNAVAILABLE` event reason. Debug relocation cancels that squad's old order before changing position.

The player can queue, replace or cancel a route without advancing time. Successful arrival removes one edge/node prefix and retains the remainder with the original creation day. Completing the final edge removes the order. Defeat, retreat or halted movement cancels the remaining order. All sample edges take one day. `travelDays` supplies default pathfinding cost; multi-day in-transit edge simulation is not implemented.

`WorldPathfindingSystem` remains policy-neutral Dijkstra. Caller weights must be nonnegative finite values, or Infinity to exclude an edge; no enemy/supply/retreat policy is built in. Unknown endpoints throw, disconnected endpoints return null, same endpoint returns an empty zero-cost path.

## Command facade

| API | Behavior |
| --- | --- |
| `state`, `definitions`, `snapshot()`, `validate()` | Preserved read-only state/definition access, detached export and invariant checks |
| `queueMovement(id, destinationId, path?)` | PLAYER planning order; optional path has `locationIds` and `routeIds` |
| `cancelMovement(id)` | Cancel PLAYER order in PLANNING |
| `queueZeonDemoMovement(id, destinationId, path?)` | Explicit temporary ZEON configuration, PLANNING only |
| `startEndDay()` | Lock orders and enter ORDER_LOCK without advancing positions/day |
| `stepResolution()` | Advance one resumable phase/queue step; reject while a battle awaits a result |
| `resumeResolution()` | Run until the next pending battle or completed day; return pending scenario or null |
| `endDay()` | `startEndDay()` followed by `resumeResolution()` |
| `advanceDay()` | Compatibility alias to complete End Day; never bypasses resolution |
| `applyBattleResult(result)` | Validate/stage result, then resume until next battle or completion |
| `loadDevelopmentScenario(id)` | Explicit planning-only reset to a data-defined test fixture |

Preserved commands (`supportPolity`, `setController`, `createSquad`, `dismissSquad`, `setSquadMembers`, `stationSquad`, `setRouteAvailability`, `relocateForInspection`) now require PLANNING. Queries (`squadsAt`, `neighbors`, `findPath`, `snapshot`) remain available while paused. Inspection relocation is still an adjacent, non-hostile debug command and is not used by the real resolver.

## Frozen orders and movement intentions

The `ZeonOrderProvider` is an injected service, not serialized state. Its default implementation copies preconfigured ZEON orders and otherwise holds. `provide(definitions, frozenState)` receives a read-only snapshot. Future AI can replace the provider without changing intent generation. Invalid/mismatched orders returned by a provider reject the whole End Day command.

ORDER_LOCK captures the pre-resolution day, squads, units, locations, route availability, arrival counter and planning orders. PLAYER orders and the provider's ZEON orders are copied into one `frozenOrders` record. Both factions use the identical `MovementIntentSystem.create()` implementation and snapshot; no provider is called again on resume.

```js
{
  squadId, faction,
  originLocationId, destinationLocationId, routeId,
  remainingOrder // reduced path after success, or null
}
```

Only the next edge becomes an intent. No position, controller, defender or day changes during intent creation. Squads without orders produce no intent.

## Phase machine and resolution record

```text
PLANNING → ORDER_LOCK → MOVEMENT_INTENT → COLLISION_DETECTION
         → RESOLUTION [pause for BattleScenario / resume with BattleResult]
         → WORLD_UPDATE → DAY_ADVANCE → PLANNING
```

Public stepping persists the output of each phase. ORDER_LOCK holds locked inputs; MOVEMENT_INTENT holds generated intents; COLLISION_DETECTION holds the conflict queue. RESOLUTION requests/stages battles and eventually commits the whole movement batch. The UI steps visibly; headless callers can run to the next interruption in one call.

```text
ResolutionRecord
  id, resolutionDay
  frozenWorld, frozenOrders
  movementIntents
  conflicts: [{ id, type, locationId, routeId, participantIds, status, battleCount }]
  nextConflictIndex, resolvedConflictIds
  pendingBattleScenario
  battleResults: [validated result + pair IDs + detached scenario]
  outcomes: { [squadId]: ARRIVE | STAY | RETREAT | DEFEATED }
  movementCommitted, worldUpdated, dayAdvanced
```

There are no closures, iterators, promises, DOM references or live tactical objects in the record. Public records are deeply frozen. After a battle, its result updates only staged outcomes. Live positions and squad existence remain the pre-resolution world until all required conflicts are settled. This makes the final commit simultaneous rather than allowing later movement decisions to observe earlier writes.

The final commit removes defeated squads through `SquadSystem`, preserves their independent units, writes all successful arrivals, consumes/cancels orders, and reconciles both factions' defenders once the batch positions are known. `WorldUpdateSystem` then applies physical control at successful arrival locations. Resource WORLD_UPDATE then delivers cargo, collects income and refreshes scheduled recruit pools; full recovery remains deferred. The clock advances once, the record becomes `lastResolution`, active resolution is cleared, and phase returns to PLANNING.

## Conflict detection and deterministic order

1. **ROUTE_INTERCEPTION:** hostile intents traverse the same route in opposite directions. Create one conflict per hostile pair. Neither side's arrival is committed beforehand.
2. **SIMULTANEOUS_ARRIVAL:** hostile movers project to the same destination.
3. **LOCATION_ATTACK:** hostile projected occupancy includes a stationary squad, such as an active defender.

Ordering is explicit: route conflicts before location conflicts, then route/location ID in code-point order, then sorted participant IDs. Conflicts receive sequence IDs in that order. Intents/commit arrival ties use sorted squad IDs. No random source or order-insertion dependence participates in decisions.

For location conflicts, the snapshot's stationed defender is preferred if still present and eligible. A defender whose intent succeeds elsewhere vacates its old node; if interception or retreat prevents departure, projected occupancy detects the consequence. With multiple friendly squads, one squad per faction participates in each BattleScenario. The remaining reserves are not automatically killed: the same conflict requests further pair battles until one faction remains. Active reserves are selected by arrival order and then ID. When neither side is stationary, PLAYER is the nominal attacker and ZEON the defender; these labels give no combat advantage.

Pending conflicts are checked against recorded outcomes and skipped if an earlier conflict removed the opposition. After the initial queue, projected occupancy is checked again. A retreat can expose a conflict at its origin, or a route survivor can meet a different arriving squad. Such consequence conflicts are appended in location-ID order. This derives consequences from frozen intentions plus battle outcomes; it never recalculates movement orders. Stationary participants cannot retreat again, so surviving-origin conflicts do not loop indefinitely.

Friendly squads never generate battles. After the batch commits, hostile co-occupancy is invalid. An enemy-controlled but undefended location does not create an invented garrison; an unopposed arrival captures it.

## BattleScenario / BattleResult boundary

```text
BattleScenario
  scenarioId, battleType, locationId or routeId
  attackingSquadId, defendingSquadId
  participants: two detached { squadId, name, faction, unitIds, units } snapshots
  context: resolutionId, conflictId, resolutionDay, attackerMoving, defenderMoving

BattleResult
  scenarioId
  winnerFaction: PLAYER | ZEON
  loserOutcome: DEFEATED | RETREATED
```

The entire Campaign object is never passed to a tactical system. The temporary `PlaceholderBattleResolver.result()` only creates/validates this result shape. It implements no combat calculation. The UI explicitly labels decisive results as test wins and offers retreat only for a moving losing side. Attacker/defender victory is represented by the winning participant's faction; either moving side can retreat.

Campaign validates the exact pending scenario ID, legal winner/outcome, and retreat eligibility. It rejects duplicate, stale and stationary-retreat results without changing state. Results are logged with their scenario snapshots so validation can replay the pair selection and outcomes during restoration.

Decisive winners complete their original movement if they were moving; losers are removed at batch commit. Stationary winners remain in place. Moving retreaters stay at the origin for that edge and their route is cancelled. In an opposite-edge retreat, the winner also halts at its origin and loses the remaining order: otherwise the winner would enter the retreater's occupied origin. No chase or final retreat pathfinding is invented. Stationary retreat is deliberately unsupported.

Defeat preserves all independent placeholder unit records, including MC. Future MC-specific survival/recovery and artifact transfer handlers can be attached to campaign battle-result/defeat application, before squad dismissal. No final fate calculation or artifact transfer exists yet.

## Validation, events and restoration

Validation checks versioned plain data, graph/ID references, allegiance/control separation, squad size/unique membership, defender authority, hostile occupancy, order continuity/availability, phases and commit flags. Active records regenerate intents from frozen orders, replay recorded battle scenarios/results, compare staged outcomes, validate queue cursor/history, and compare committed positions/orders/defenders against expected batch outcomes. A bad command discards its draft and pending events; a bad restored state is rejected, not repaired.

```js
const serialized = JSON.stringify(campaign.snapshot());
const restored = new GBTRPG.campaign.Campaign(campaign.definitions, JSON.parse(serialized));
// If a battle is pending, obtain a result for restored.state.resolution.pendingBattleScenario.
restored.applyBattleResult(result); // resumes this same day's remaining queue
// For a saved intermediate phase with no pending battle:
restored.resumeResolution();
```

`events.on(name, listener)` returns an unsubscribe function. Every payload is frozen plain data; listeners see fully committed state. Reentrant campaign commands are rejected. Listener exceptions are isolated/logged; use a later application step for follow-up commands.

Used new events: ORDER_QUEUED, ORDER_CANCELLED, ORDERS_LOCKED, MOVEMENT_INTENT_CREATED, MOVEMENT_CONFLICT_DETECTED, BATTLE_REQUESTED, BATTLE_RESULT_APPLIED, SQUAD_DEFEATED, END_DAY_RESOLUTION_STARTED, END_DAY_RESOLUTION_COMPLETED, CAMPAIGN_PHASE_CHANGED, WORLD_UPDATED. Existing SQUAD_MOVED, LOCATION_CONTROL_CHANGED, SQUAD_STATIONED, SQUAD_DISMISSED and DAY_ADVANCED continue at their respective boundaries. The UI event log remains outside saves.

## Movement Invariants

```text
Planning orders do not move squads.
Only one edge is attempted per squad per day.
All movement intents use the same frozen pre-resolution snapshot.
Intent creation never mutates squad position.
Hostile movement conflicts resolve before arrival is committed.
A day advances only after the entire resolution pipeline completes.
Battle interruption does not discard remaining same-day resolution work.
UI/debug relocation is not strategic movement resolution.
```

Future wilderness encounters can interrupt an attempted movement before batch commit using the same scenario/result boundary. Future supply wagons/lone travelers can reuse graph paths and intent/outcome separation; the shared TravelerPath adapter now serves squads, supply wagons and lone units, while type-specific interactions remain separate.

## Character calculation boundaries

Static races and capacity config load before campaign services. The shared `DeterministicRandom` LCG now serves pool refresh and per-character streams. A refresh still consumes one global seed per candidate; starting/growth rolls consume that candidate's local stream. Units serialize their continuation state independently.

`CharacterGrowthSystem` exposes `generateLevelOneStats`, `getRacialGrowth`, `applyGrowthEvent`, `advanceLevel`, `simulateRecruitGrowth`, and `copyProgression`. Starting and growth each draw the six primary attributes in fixed order. Ordinary advancement and recruit generation share the same operation. `ClassGrowthProvider.getGrowth(classId)` supplies fixed primary bonuses; the eight playable classes supply the finalized primary bonuses; unknown/legacy class bonuses retain the neutral fallback. Transient recruit allocations total level-minus-one; no class history is saved. `classProgress` is separate CP/class-level metadata. `Campaign.advanceCharacterLevel` commits one event with the existing PLANNING/atomicity guard.

`CharacterStatsSystem.deriveStats(unit, equipmentDefinitions, context)` computes effective primaries, capacities, MOV, DEF, movement traits and innate abilities. `context.effects` supplies modifier maps; `context.classProvider.getMovementModifier` supplies a separate MOV adjustment. Only primary stats grow. HP/MP coefficients and racial offsets are provisional; innate DEF is zero. `InventorySystem.stats` passes only equipped definitions. Recruit UI derives from the stored candidate. Derived snapshots are frozen and never persisted as another authority.

`EquipmentEligibility` composes race slots, optional item race restrictions and class restrictions. Inventory ownership/status checks wrap it; UI choices, assignment, delivery and load validation use that shared rule. Physical copies, shipments and personal inventory remain the sole equipment/location authorities.

BattleScenario units expose canonical `stats` and detached `legacyStats` from `BattleStatAdapter`. Legacy ATK is a provisional effective-STR alias. The tactical fixture uses the same generated character model; `Unit.refreshDerivedStats` passes spent current HP/MP so increased capacity cannot refill them. Campaign attrition is not implemented. Race flight and ability metadata are exposed without executing terrain or ability rules.

## Class/CP foundation from schema 6, retained in schema 7

`classProgress[classId]` stores `lifetimeCP`, `currentCP`, validated derived `classLevel`, and `entryGrantCP`. `classConfig.js` holds the provisional 1–10 CP thresholds and final 90% double-attack cap. Class prerequisites are per character, as confirmed by the designer. No prerequisite check is imposed on a recruit's already-held class. `ClassProgressionSystem` owns threshold lookup, prerequisite queries, earning and Action Ability attribution. `CPAwardCalculator` remains unresolved rather than assigning made-up action rewards.

`classes.js` defines Fighter, Knight, Thief, Archer and Alchemist; `spellClasses.js` promotes Mage and adds Cleric/Wizard and explicitly retains the earlier archetypes as compatibility disciplines. `abilities.js` declares the original 66 abilities, category, required level, optional price override, structured effects and implementation status. `AbilityCostSystem` resolves the final level-based price curve; an explicitly null override still blocks purchase. `AbilityLearningSystem` checks level, learned prerequisite IDs, and available Current CP; `AbilityLoadoutSystem` owns learned-action availability and the four manually selected fields. Primary is derived from current class. `AbilityModifierSystem` queries equipped effects for future growth, MOV, capacity and weapon-only ATK.

`ClassManagementSystem` changes class/loadout through campaign transactions without spending days. Newly illegal equipped copies become PERSONAL at their owner; newly illegal assigned copies are released at the wagon's actual location. PERSONAL/unequipped ordinary items may overflow capacity without being deleted. Additional acquisition checks use derived capacity. Equipped copies never consume capacity. Off-hand is a fourth equipment slot. `EquipmentEligibility` composes class and Support grants after absolute race prohibitions and validates hand conflicts.

Schema-4 planning migration defaults learned/loadout fields and converts old CP into both balances. If old independently stored Class Level implies more mastery than old CP, migration uses that level's threshold to preserve progress, up to level 10. Existing higher CP is retained. No Character Level growth is rerolled. Active schema 1–4 snapshots retain the prior rejection policy. Schema 5 now migrates active as well as planning states. Current schema 8 validates every resolution phase.

## Tactical foundation services

`TurnSystem` tracks a separate Major Action budget, remaining MOV, tiles traversed and turn flags. `ActionCommandSystem` feeds the existing `CommandMenu` abstraction with ordered categories and owning Action class IDs. Ability category and Major Action cost are independent. Quick Items supplies the ordinary ITEM exemption only through equipped Support; Equip is still at most one item change per turn.

`TacticalEquipmentSystem` and `StealSystem` use the same physical item record and shared inventory/capacity/eligibility services. Steal outcomes accept a supplied resolved success result; chance calculation is explicitly unresolved. Disarm retains victim ownership in PERSONAL overflow. `DoubleAttackSystem` accepts future probability/modifier calculators, distinguishes normal/counter/second/Skill/Steal eligibility, and applies the 90% cap last.

`TacticalMovementRules` validates complete orthogonal paths before committing. Allied occupied cells may be intermediate, never endpoints. Both Fleet-Footed steps independently obey terrain/occupancy; non-overlapping perpendicular pairs cost one MOV. It counts actual traversed tiles. `MovementSystem.tryTacticalPath` supplies the existing terrain legality check. The exploration demo's movement API is preserved.

`AbilityEffectHooks` contains pure established-rule queries and an explicit future-handler lookup. It does not invent a tactical damage engine, initiative loop, AI or interactive reaction choices. `BattleState` now constructs a detached rule session from existing BattleScenario units/items and commits local commands atomically. Action CP receipts require unique IDs. These local results are not silently merged into campaign state; full tactical result reconciliation remains future work.

`ClassManagementUI` is an in-game bitmap interface exposed by character management. Debug grants are explicit development actions, separate from purchases. The debug tactical inspector can consume abstract Major Actions without pretending that damage or unresolved probabilities were executed. See [Prompt #6 report](PROMPT6-IMPLEMENTATION.md) for ability-by-ability status, open values and verification.

## Prompt 5 service contracts

`AbilityCostSystem.cost(ability)` uses the required Class Level, never Character Level: 100/125/150/175/200/225/250/275/300/350. Omitted `costCP` takes this curve; an explicit numeric override is honored, while null is unresolved. Learning is permanent and never automatic on reaching a level. Spending decreases only Current CP.

`ExecutionReceiptSystem` derives the owning class and PRIMARY/SECONDARY/UNIVERSAL source from the unit and ability data, replacing caller-supplied identity. Qualification requires a valid execution ID, legal/executed true and not cancelled. Success/failure remains evidence for the injected CP calculator, whose default returns null. ATTACK/ITEM/EQUIP/TRADE without an ability are universal; MAGIC/STEAL/SKILLS cannot masquerade as universal actions. Passive influence has no separate award. `BattleState.resolveActionCP` enforces unique receipts and actual equipment availability. This is a trusted resolver boundary, not an implementation of attack/target resolution.

`ClassEntryGrantSystem.access` records first access through generation, class change, secondary selection or CP earning. An absent entry or null marker is unprocessed. A nonnegative `entryGrantCP` stores the processed amount (zero means consumed without a grant). Grants change only Current CP; validation allows Current CP up to Lifetime CP plus that historical grant. Shipped classes all have `initialCurrentCPGrant: null`, meaning no grant. Schema-5 migration marks existing progress, current/secondary classes and owners of learned abilities as consumed with zero extra currency. It migrates live units, candidates, frozen worlds, resource-before candidates and current-generation BattleScenario copies without changing queues, IDs, results, resources, base stats or RNG. Pre-schema-5 completed historical character shapes are left historical.

`AbilityRequirementSystem` shares equipment selectors with class permissions: slot, family, weight, kind, tags and optional exact metadata. Requirements are checked against equipped definitions plus legal race/class/Support permissions and hand conflicts. Secondary access grants no weapon exemption. Backstab uses SHORT/STABBING tags; all Archer actions use a BOW requirement. `equipmentFamilies.js` supplies WAND/ROBE vocabulary without adding a priced item, attack formula or new spellcaster class.

`SpellMenuSystem.families` groups already-accessible learned entries by spell family, preserving ability ID, owner, access source and spell level. `castingOptions` accepts a selected spell plus a replaceable provider. No modifier provider means no method submenu; otherwise NORMAL precedes distinct optional methods, and selection accepts one ID. Prompt #6 now supplies 36 real spell definitions and Wizard casting methods through this same grouping contract; the old fixture checks remain.

`ItemSystem` exposes component restoration, consumption planning, strongest non-overhealing emergency selection, removable status queries, Forage source/capacity queries and Refine transactions. Decisions with undefined probabilities return unresolved until a caller supplies resolved outcomes. HP restoration doubles and MP rounds up after multiplying by 1.25 when Potent Remedies applies. Conservation eligibility follows the item source. Catalyze permanent gains require actual consumption of a temporary stat buff and change basePrimary once, without advancing Character Level or growth RNG. The low-level commit writes consumption/permanent gain only; it does not apply healing/status durations, spend a turn or validate ranged targeting. Refine requires an externally supplied stronger output definition, validates both identical carried inputs, and preserves physical item authority. Consumers must combine these helpers in a transaction after all effect/target/cost rules are resolved. They are not an ITEM combat command.

`TradeSystem` lists adjacent friendly targets and personal item/empty slots, prepares a neutral transaction and transfers existing copies without auto-equipping. This foundation uses the existing orthogonal tactical adjacency convention. Empty/empty is a no-op even after spending the Major Action. Non-empty execution defaults to a Minor Action under Prompt #7. The explicit policy adapter remains available for legacy rule fixtures and future exceptions. `BattleState.trade` wraps the transaction in its detached atomic session.

`HiddenItemSystem` stores placements only in scenario/session data. Scrounger queries require explicit position and distance provider, and a selector when several items qualify. They return a five-tile notice, compass direction or on-tile result. Claiming and all unresolved cost/capacity decisions remain deferred. No permanent exploration history is added to a class.

Covering Fire qualification is a pure pre-attack hook requiring another friendly target, an enemy attacker, legal equipped bow and supplied targeting check. It has no activation counter or cap, chance stays null, and its one reaction attack is neither a counterattack nor double-attack eligible. The continuation hook cancels the pending enemy attack when an externally resolved capability check says it can no longer complete. No reaction scheduler or damage execution is implied.

## Prompt 6: spells and tactical lifecycle

`spells.js` defines 24 Mage elemental spells, 10 Cleric spells, Fly and Portal. `spellClasses.js` adds matching purchasable abilities and the established Cleric/Wizard passives. Mage retains its stable ID and old equipment compatibility. Wizard prerequisites use this character’s Mage Class Level 5. All abilities use the existing CP price, permanent learning and loadout systems. Casting modifiers remain Wizard Action purchases but are filtered out of direct action categories and never award independent CP.

`TargetingSystem` uses Manhattan casting distance and a separate effect-radius helper. **Current implementation encoding only:** its stored radius R covers Manhattan distance R−1 around the selected tile. Prompt #10A defines canonical AoE radius as literal Manhattan distance (0/1/2/3 → 1/5/13/25 tiles); the runtime encoding is unchanged and must not be reused as canonical terminology. Actual intended areas and casting ranges are unchanged. `MagicSystem` resolves a detached cast containing original ability/owner, method, innate radius, modified range/radius/magnitude and paid MP cost. Explicit compatibility plus equipped Arcana determines eligible modifiers. Only one method can be selected. `RuleNumbers.integer` accepts exact integers and requires an explicitly supplied rounding policy for fractions. `spellConfig.js` has no production provisional balance numbers; `spellLabScenario.js` is an isolated, labeled test profile.

`BattleState` owns transient units with `tactical` resources, life state and statuses; positions; local rosters; turns and owner-turn numbers; Portal pairs; action/counter receipts; and presentation state. Its existing clone/commit boundary keeps failed casts, moves, transfers and outcomes atomic. Active status effects are suppressed while Dying/Dead. Ordinary targeting and item/Trade rules exclude these units. Flying overrides terrain passage and destination occupancy while preserving board bounds and unit collision. Movement completion is recorded once per turn and drives both Graceful Step and Mana Step.

`BattleStatusSystem` centralizes damage, Prayer, Martyr, Dying entry/countdown, Raise, spell mitigation/status probability, Flying and movement restoration. `CombatSystem` resolves the exclusive Spell Counter / ordinary-counter opportunity, with normal-counter probability/execution supplied by the existing deferred combat boundary. `BattleState.resolveCounters` deduplicates triggering attack IDs. Spell Counter selects only purchased Mage spells, charges no MP, spends no Major Action and awards no CP. Its selection priority is deliberately unresolved. Status-duration clock policy, including Fly expiration, is not inferred from the unresolved duration design; `expireStatus` is the explicit controller boundary.

Dying units retain their map position, allow passage by both sides, forbid occupied endpoints and cannot act/react/counter. Own-turn start decrements their counter; own-turn end at zero removes their map position and local roster membership. Raise changes only Dying to Alive with half MAX HP and no counter, preserving other statuses. Martyr applies once on the first Dying entry of that unit in this battle. A final combat-capable unit reaching zero immediately records the battle winner and blocks new actions/turns. The current animation completes, MAP_RETURN is rendered, then the banner appears. `CombatCutInState` uses the existing `AnimationPlayer`, with a one-shot completion callback; `BattleRenderer` draws the tactical map, visible counters and external Portal PNGs.

`PortalSystem` validates two independent target endpoints and commits replacement plus forced transfer atomically. A caster’s old pair is removed at commit, so its vacated endpoint may be reused; another caster’s pair cannot be overlapped. Occupied terrain is the explicit placement exception. Forced transfer swaps/transfers units without consulting movement restrictions or altering resources/statuses/counters. Voluntary entry requires matching allegiance, an active movable unit and an unoccupied destination; it changes position alone. Owner-turn expirations skip the casting turn and remove the pair after three later expirations. Highlight queries depend only on cursor selection or the controlled unit’s active friendly interaction, never occupancy alone.

## Schema 7 and tactical result persistence

Schema 7 extends the existing campaign `status` domain with DEAD and accepts validated `BattleResult.deadUnitIds`. It does not add tactical snapshots to campaign saves. Death removes local tactical roster membership immediately. At the existing simultaneous campaign commit, `BattleCasualtySystem` removes those IDs from persistent rosters and marks their unit records DEAD. Items remain physically attached to the retained independent record; no loot/destruction policy is invented. Later battles in the same resolution exclude already-recorded Dead casualties, and replay validation applies those same exclusions in result order.

Schema-6 migration preserves every character/resource fact and bumps the version. An active record already past an old recruitment refresh receives `legacyRecruitGrowth: true`; replay uses the old zero Mage growth for that completed refresh only. Existing candidates are not rerolled or changed, while future refreshes and ordinary Mage growth use +1 INT. Older migrations remain in sequence. Schemas 1–4 retain their prior active-resolution restriction; schema 5/6 queues migrate in place.

The campaign’s End Day screen still uses its established placeholder battle-result interface. No tactical map generator, initiative formula or full combat AI existed to connect automatically. `SpellLabState`, accessible from Debug Tools, provides the executable MAGIC family → spell → method → target flow, Portal entry and lifecycle/animation inspection without modifying campaign facts. A future campaign battle controller can create a `BattleState` with real positions and balance, then submit its completed `result()` through the unchanged result boundary extended by casualties.


## Prompt #6A / schema 8 overrides

This section supersedes Prompt #6 descriptions of first-entry-only Martyr, unresolved player counter selection, temporary Flying duration, and Mage legacy proficiency. The detailed correction report is `PROMPT6A-IMPLEMENTATION.md`.

- `BattleStatusSystem.enterDying` handles each distinct Alive→Dying transition. There is no battle-long Martyr flag. `TargetingSystem.unitAllowed` enforces Raise's Dying-only contract before a transaction commits. `RAISE_BEHAVIORS` defines fractions 0.5 and 1 without introducing an Advanced Healer class/catalog entry.
- `CombatSystem.counters` requests `SPELL_SELECTION` for a successful player reaction, listing only purchased Mage spellLevel 1 definitions. `BattleState.pendingCounter` holds IDs, and `chooseCounter` validates/executes the choice. Other commands pause, the triggering attack is deduplicated, ordinary counter is suppressed, and failed choices roll back. No enemy selection policy is supplied.
- `FlyingSystem.sources` combines optional race/class `capabilities`, future explicit tactical `capabilitySources`, and status entries. Fly owns the status `{id: FLYING, sourceType: SPELL, sourceKey: fly, sourceId, remaining: 3}`. Only that timed source decrements on its affected unit's end turn. No inherent Flying content is introduced.
- Losing final Flying invokes the supplied normal terrain occupancy provider. `escapeRequired` is a position-resolution gate mirrored into turn availability. A dedicated escape transaction validates all eight neighboring destinations and leaves normal action budgets unchanged. Expiration and next-turn start re-evaluate availability; no destinations invokes AWOL. Terrain providers must be explicit; no universal passability fallback is invented.
- Tactical AWOL removes the position and battle roster entry, disables actions, and contributes no active combatant. `BattleState.result` reports AWOL IDs separately from Dead. Existing animation→map→banner ordering also handles final-combatant AWOL.
- `AwolSystem` uses `DeterministicRandom` and `WorldPathfindingSystem`, never a second RNG/pathfinder. It applies losing AWOL at simultaneous commit and uses `BattleCasualtySystem.markDead` on failed survival. Winning AWOL preserves original membership. `ResourceSystem` replay reconstructs the same outcome/seed and returns. Later scenarios exclude losing AWOL IDs.
- Persistent additions: `awol: {seed, pending: {[unitId]: {unitId, faction, battleLocationId, routeId, returnDay, blockedReason}}}` and `legacyEquipment: {[itemInstanceId]: unitId}`. Existing unit status adds AWOL. Both fields participate in resource snapshots/replay. Schema 7→8 adds empty AWOL state and narrow old-item grants in current/frozen records; character progression/items are not rerolled or transferred.
- Due returns run during World Update for the incoming `day + 1`. Selection uses current control/routes and active enemy squads. Returned units become Active, unassigned at the settlement. HP/status recovery is not represented/invented. Failed selection retains the pending record with an explicit reason. Route encounters now use the exact midpoint through BattleLocationSystem (Prompt #6B).
- Mage `legacy` is false. Only a specific migrated equipped/assigned item receives validation compatibility. Existing in-flight deliveries may finish; ordinary equip/assign never consults that grant. Releasing an old staff does not unlock it again. Item records remain independent of casualty state.
- Campaign event IDs `AWOL_RETURNED` / `AWOL_RETURN_UNRESOLVED` use the existing EventBus, bitmap page and event log. No new message framework or browser font is used.


## Prompt #6B: Prayer and authoritative route midpoints

Prayer remains Cleric Lv3 Reaction with production chance 0.25. The existing damage/reaction adapter compares a supplied roll in [0,1) against that threshold, or accepts an explicit resolved-outcome adapter for deterministic inspection. Success leaves 1 HP, creates no Dying counter and preserves statuses. A later eligible lethal event resolves independently; no new RNG system or reaction order is introduced.

`BattleLocationSystem.resolve(definitions, reference)` derives a node position or a virtual `ROUTE_MIDPOINT` from existing scenario/absence IDs. A midpoint exposes two endpoint connections, each with distance `(travelDays ?? 1) / 2`. `distance(definitions, state, reference, destinationId)` returns the minimum connection distance plus the ordinary Dijkstra distance from its endpoint. Thus route battle distance is exactly `L/2 + min(D(A,S), D(B,S))`. Fractions remain fractional for comparison; gameplay rounding is not involved. This is the shared campaign battle-location contract, although AWOL settlement selection is its only production consumer today.

AwolSystem uses this helper only for primary battle-location distance. Existing control/reachability filtering, nearest-enemy safety comparison and uniform final tie choice remain unchanged. Normal processing never emits `BATTLE ROUTE POSITION UNRESOLVED` for a valid route; `NO REACHABLE FRIENDLY SETTLEMENT` remains pending and rechecked.

Schema stays 8 with no data migration or additional persistent representation. Old pending route IDs and due dates are reinterpreted on the next scheduled World Update. Resource validation has a narrowly scoped compatibility input for replaying an old save whose World Update already recorded a route-position hold: it preserves that historical result without new RNG draws. Normal WorldUpdateSystem never supplies those replay-only holds. This also keeps old DAY_ADVANCE saves loadable while allowing the next update to return the unit normally. Survival, delay, stored RNG and previously completed decisions are not rerolled. Future retreat/pursuit/rescue systems are not implemented.


## Prompt #7: current battle foundation

This section supersedes older descriptions of missing initiative, unresolved default Trade/Scrounge action cost, immediate multi-target resolution and the previous framebuffer. Earlier reports describe their historical snapshots.

BattleInitializationSystem separates STATIC location references from PROCEDURAL route inputs. Providers supply maps and campaign-approach orientation. DeploymentSystem validates one opposing squad per side (up to 12), class/character Front/Back designations, authored row depths/positions, centered six-cell rows and independent overflow. Seeded placement never repairs an invalid authored slot.

BattleTerrainSystem owns identity, traversability and optional race overrides. PathfindingSystem.find searches orthogonal paths with the execution validator; plan also considers friendly Portal edges, retaining remaining MOV and pending Fleet-Footed steps to avoid cycles. BattleController.route commits the plan atomically. Flying overrides terrain cost/passability but preserves bounds and unit collision. InventorySystem.stats includes explicit tactical status modifiers without introducing new status values.

BattleState remains an atomic detached rules session. BattleController adds transient CT, event frames and reaction RNG. CTSystem jumps to the next threshold-crossing tick, orders readiness ties by AGI/DEX/MOV/STR then seeded randomness, and subtracts 1000 after acting. No time advances during control. Forecasting clones world/CT RNG and simulates repeated activations plus known Dying/Fly/Portal lifecycle, assuming unchanged future actions and positions. Every currently active unit is represented; arbitrary future action outcomes are not predicted.

BattleActionSystem separates spell preparation, per-target resolution and receipt finalization. The old direct facade and new event controller share these rules. Costs are paid once; confirmed ordered targets and CP ownership remain in the parent action frame. CombatEventQueue stores nested frames, cursors, provenance, a pending decision and history inside the atomic battle transaction. Player Spell Counter selection resumes a child frame before returning to the parent's next target. The spellCounterGenerated provenance flag blocks only Spell Counter, leaving Prayer and Arcane Siphon eligible.

BattleSceneSequence contains timed semantic presentation frames independently of formulas. BattleSceneRenderer uses faction-based sides, continuous integer pans, opaque palette dithering and existing PNG placeholders. BattleMapRenderer owns the scrolling 16px map, repeated timeline portraits, budgets, targeting overlays and banners at 480x360. BattleMapState owns control/menus/counter choices and the isolated test AI. AISystem requires an explicit scoring policy and validates its choice against supplied candidates; production candidate providers and combat policies remain unresolved.

Conclusion runs after each mechanical target and turn lifecycle change. Prayer resolves before Dying/conclusion. A pending winner blocks remaining target/counter mechanics; started receipts finalize, the current scene finishes, then the map renders before the banner. CT cannot advance. Dying units receive automatic lifecycle maintenance instead of control. Dead/AWOL units are removed from map/roster and ordinary forecast.

Game.openEndDay connects prepared production maps to the existing pending battle/result path. Missing content and approach mapping report unresolved boundaries. BattleFoundationFixture supplies isolated deployment, Attack damage 20, the existing lab spell profile, explicit rounding and a simple advancing policy; these values do not enter production configuration or campaign state. The earlier Spell/Portal Lab and campaign test-result controls remain available. Full tactical resource/CP reconciliation and general recovery remain deferred.

See [PROMPT7-IMPLEMENTATION.md](../PROMPT7-IMPLEMENTATION.md) for the complete report. Historical Prompt #7 verification: 618 deterministic checks; schema 8; 21 external PNGs; classic scripts without runtime network/build dependencies.


## Game Boy presentation modes and power

`PRESENTATION_MODES` now exposes only small smooth 1 (300×225 within 600×975), large 2 (480×360 within 780×1105) and responsive frameless 3. Component assets and geometry are unchanged. The experimental backing div and extra modes were removed, including the backing-color validation exception. `Renderer` keeps logical 480×360 and the existing responsive fit path. `presentation`/H and Options labels remain.

Display storage stays at `shining-farce.display.v1` but record version 3 distinguishes the new IDs. Legacy v2 modes 1/2/3→1, 4→2, 5→3; v1 sizes retain 1/2/3 with small now smooth. Constructor normalization immediately saves recognized old records, preventing removed mode values lingering. Default is 3. Committed versus preview palette separation remains intact. Authored/controls/campaign/editor schemas are unchanged.

`PowerPresentation` is outside `GameStateManager`. It owns loading, running, dissolve, off, boot-off, forward, blank, reveal, chant, hold, reverse, final and error phases. `Game.start` creates it and blanks the canvas/sets hardware Off synchronously before asset loading yields. It begins timing after images load and game objects are initialized, without rendering gameplay first. Frameless skips boot. `Game.step` gates developer/state update and rendering while blocked, but continues input-neutral observation, host/shell presentation and the power clock. The RAF loop continues updating its timestamp, so paused time is not injected into simulation afterward.

Power-off captures the existing unfiltered logical canvas by drawing to a detached canvas (no pixel readback, compatible with potentially tainted file-URL canvases). It shuffles 360 row indices with presentation-only Math.random, then replaces `floor(elapsed*360/1000)` full rows in source background color. Snapshot, game objects and menu/editor identities survive. On completion of boot the current state is rendered/resumed; no reconstruction/reset. A transparent native button at (60,0,75,20) covers both switch positions in either shell. It is hidden frameless and disabled during transitions; the state machine also rejects overlap. Button clicks restore canvas focus and do not enqueue gameplay actions.

`BOOT` config lists 28 local PNGs and one local MP3. `PowerPresentation` preloads/dimension-checks all 171×58 images. Logo coordinates are (154,151), choosing integer placement for odd width (154/155 horizontal margins) to keep internal pixels canonical. Blank and dissolve fills use `PALETTE.background`; existing canvas-only SVG mapping turns this into active output entry 0, including reversed Dark. Hardware/page filtering boundaries remain unchanged.

Boot durations: Off 1000; frames 1–25 at 50 ms each, 1250 total; blank 1000; 26–28 300; chant duration; post-audio hold 1000; reverse 28–26 300; final blank 1000 ms. Normal duration is 5850 ms plus chant. `BootAudio` creates detached HTMLAudio, non-looping, and calls play only at the chant cue. Manual click prepares/loads media without premature muted playback. Real ended controls successful completion; rejection/error uses duration metadata or measured 1920 ms. Pending play is bounded at 1000 ms; stalled playing/missing ended at duration+5000 ms. Tokens ignore stale asynchronous callbacks, and abort stops audio, blanks the screen, leaves gameplay frozen and reports an error. Browser permission is never guaranteed.

No gameplay audio engine existed. `GameAudio` registers gameplay media and also inspects document audio/video, capturing only currently playing elements. It pauses those elements without changing currentTime, and attempts resume only after boot. Boot audio stays detached/unregistered. Rejected resume is recorded as a notice. Future gameplay audio should use this ownership boundary; this pass adds no songs or sound effects.

`Input.setSuspended` clears logical edges while preserving physical release requirements. Keyboard codes held before/during boot and active controller buttons/axes are quarantined until keyup/neutral. Suspended input never reaches text handlers, remap capture, menus, palette/mode actions or game updates. Existing held-direction arbitration is unchanged. Power changes do not issue palette events, so ordinary wheel behavior remains intact.

Complete distribution needs `assets/presentation/boot/sega-logo-1.png` through `sega-logo-28.png` and `sega-chant-game-boy.mp3`, alongside the original 46 shell resources. Fixed-file checks validate dimensions/hashes and PNGs remain inside canonical palette validation. Source provenance and render evidence are development documents; runtime uses only local scripts/media. [Detailed report and Windows/Brave steps](POWER-BOOT-IMPLEMENTATION.md).

## Prompt #8 authoring and developer boundaries

`Game` owns a `DeveloperShell` outside `GameStateManager`. Only an open overlay captures input and pauses the underlying state. `DeveloperRuntime` contains effective runtime toggles; it is never serialized. Godmode affects `MagicSystem` effective MP costs, `BattleStatusSystem` damage and transactional HP/MP loss. Greedisgood affects `EconomySystem.price/change`. Normal menus exclude developer controls; contextual End Day test results and previous campaign inspection tools are reached through the developer layer.

`LocalStore` prefixes separate keys `shining-farce.controls.v1` and `shining-farce.editor.v1`; storage exceptions become visible messages. Campaign schema remains 8. Input profile version and editor document version both start at 1. No campaign save is silently replaced, deleted, migrated or populated with editor/cheat data.

`EditorDocument` freezes `{version, world, visuals, battleMaps, nextId, entities}` and mutates only validated clones. `world` contains the existing graph; `visuals` contains decorative tile rows. A location has a stable ID, independent appearance and quest associations, retained settlement configuration, and multiple battle-map references. Effective settlement services compile at shipping-runtime initialization. Original polity affiliation/physical control remain separate from the new settlement allegiance property; ordinary campaign politics are not replaced.

Shared `MapAuthoring` edge resizing computes translation, validates every protected point, then constructs the resized Ocean-filled grid. Campaign locations, positional metadata and runtime visual anchors constrain cropping; battle spots, special deployments and required points constrain battle cropping. No tile scaling occurs. Editors never mutate the active campaign or battle session.

`PropertyScreen` implements immediate booleans, transactional numbers/enums, submenus and multi-select lists. `MapEditorState` owns a separate cursor, clipboard/tool, map camera and Connect state. Terrain identity/variant references live in `BATTLE_TILES`; normal `BattleTerrainSystem` determines passability and movement cost independently. The current catalog contains one existing visual per terrain and can accept additional authored variants without changing the format.

`BattleMapAuthoring` distinguishes structural draft validity from readiness: incomplete drafts can be saved/imported, while shipping export and battle initialization require valid terrain, conditions, opposing approaches, six Front/Back spots per active approach, collision-free eligible positions and full special-character definitions. Conditions are an optional controlling faction plus required boolean story keys. `AuthoredContent.select` reports missing/ambiguous matches unless an explicit chooser resolves ambiguity; `BattleInitializationSystem` accepts campaign state, a story provider and an orientation provider. Procedural route map providers remain unchanged.

Specials instantiate in a separate `scenario.specialUnits` array outside the two participant rosters. Each receives a unique transient identity, normal derived stats, equipment instances, CT and faction. Specials' Dead/AWOL IDs are omitted from campaign results. Wilderness is a distinct combat identity independently hostile to both existing combat factions; strategic treasuries/ownership/saves remain PLAYER/ZEON/NEUTRAL. Wilderness campaign outcomes, encounters and post-battle persistence remain unresolved.

The Windows shipping correction supersedes the physical split-JavaScript installation workflow while retaining its semantic model, registry, validators and portable formats. See [Windows Shipping Correction](WINDOWS-SHIPPING-CORRECTION.md); the [previous report](AUTHORING-PERSISTENCE-IMPLEMENTATION.md) remains historical provenance.

### Current shipping representation

The authoritative shipping source is **`index.html`**, in the unique `<script type="application/json" id="shining-farce-shipping-data">` element inside the `BEGIN/END AUTHORED MAP ASSETS` markers. Its envelope is `{format:"SHINING_FARCE_SHIPPING_PAGE",version:1,campaign,maps}`. `campaign` retains the preceding `{version:1,document,battleMapIds}` representation (all editor fields except the map dictionary); `maps` is an array of complete individual Battle Map definitions. Location reference order, stable IDs, terrain/variants, conditions, approaches, deployment pools, complete specials, required points, entities and arbitrary JSON metadata survive unchanged. Campaign and Battle Maps remain distinct records. A literal `null` payload explicitly selects the demo when there is no legacy source.

`ShippingPage.start(document)` runs inside the existing startup error boundary before `Game.start`. It checks the data element's identity/type, rejects duplicate elements, parses with `JSON.parse`, builds/validates a temporary `AuthoredRegistry` and installs it only after the whole set is ready. Missing data, duplicate map IDs, mismatched indices, malformed fields, invalid references and incomplete deployment fail visibly. Existing `AuthoredContent.campaign` and static Battle Map initialization remain the consumers; `game.authoredContent`, visuals and providers use the assembled v1 document. No runtime JSON request or file picker is needed to play.

The publisher captures the original launcher DOM before game/editor status/style changes. It replaces only the marked authored-data block, removes the preceding legacy bootstrap tag on migration, and preserves installed game-script references. All `<`, `>` and `&` in JSON are escaped as JSON Unicode escapes, preventing names/metadata from closing the data element or injecting HTML. The payload is never executed as JavaScript. This is inert JSON inside HTML, not JavaScript disguised with another extension. The HTML still runs the same installed external classic game scripts.

**Export Shipping Index.html** produces a complete replacement launcher. **Export Shipping Package / ZIP** includes that launcher, `editor-backup.json`, individual/Campaign Map backups under `portable/`, `shipping-data.txt` and `INSTALL.txt`; there are no `.js` entries. Installation replaces only `index.html` in the complete updated project. **Export Shipping Data Block / TXT** supplies the inert marker block for editing the existing launcher when policy blocks downloaded HTML. Neither path removes origin metadata, changes security settings, executes an installer or needs administrator rights. The game cannot guarantee that all Windows/enterprise policies allow downloaded HTML, ZIP or TXT.

Same-ID replacement, adding maps and removing maps all republish the complete ready launcher; no static manifest edit is required. Individual portable JSON remains independently editable/importable. Removal is a confirmed editor transaction allowed only after every location reference is detached. Working-copy saves/imports remain editor-only, and source reload restores the source loaded by the page rather than rereading the filesystem.

### Compatibility and unchanged versions

Full backups remain raw EditorDocument **v1**: `{version,world,visuals,battleMaps,nextId,entities}` plus additional metadata. Browser persistence remains **`shining-farce.editor.v1`**, controls remain version **1**, and campaign save schema remains **8**. Partial JSON remains **`SHINING_FARCE_AUTHORED` version 1**, kinds `CAMPAIGN`, `BATTLE_MAP`, `BATTLE_MAPS`; the new shipping-page envelope is independently versioned **1**. No campaign serialization or save-migration policy changed.

Existing portable imports retain structural draft validation, atomic candidate replacement, explicit collision confirmation, stale-plan rejection, stable IDs/counters and ordered references. Full raw backups replace the document; Campaign Map imports replace campaign fields/merge included maps; Battle Map imports merge without changing campaign references. Structurally valid incomplete drafts remain savable/exportable/importable; publishing requires full readiness and valid starting-campaign initialization.

`AuthoredRegistry`, legacy `AUTHORED_CONTENT` and previous split registerCampaign/registerBattle formats remain supported. A legacy launcher without a data element may initialize only if its explicitly loaded classic assets are present; simultaneous nonempty HTML and legacy/split sources are rejected. Prefer migration by exporting JSON from a working old installation, importing it into the updated project and publishing HTML. Previous package JSON works even when Windows blocked its JS files. No old blocked scripts need to be copied or unblocked. Legacy JS-generation helpers remain available for compatibility regression coverage but are absent from the publishing UI.

The current workspace's interrupted installation was recovered from its validated `editor-backup.json` into the HTML data block. That original backup and its origin metadata remain unchanged; old `map-scripts.html` is no longer a runtime input. The unavailable legacy bootstrap/campaign files were not recreated or unblocked.

### Verification boundary

**863/863 deterministic checks**, 0 failed, 0 skipped: all 837 preceding checks plus 26 new cases. Optional verifiers exercise generated pages in fresh VM/DOM fixtures, old split/monolithic loading, static battle initialization, HTML parsing, ZIP integrity and Canvas2D menus. In-game rule checks isolate and restore the installed registry/visuals so tests also work after publishing custom maps. Browser/Explorer download and attachment handling were not reproduced: the available browser tool blocks `file://`, and native Explorer controls are unavailable. Read-only inspection did confirm `ZoneId=4` on the user's original downloaded ZIP and extracted backup/instruction files. No Windows security metadata or configuration was modified.


## Prompt #8A corrections

`DeploymentSystem.assign` validates all starting pools and specials before selecting positions. Each required side retains at least six Front and six Back positions. Both Front and Back units get a preferred-position pass, preserving order within each group. Units still unplaced then draw from unused valid positions of either group. The existing seeded RNG chooses among eligible spots; no uncontrolled randomness or generated overflow coordinates are introduced. Generated map providers retain their previous centering and row expansion, while authored spots remain unchanged and non-contiguous. Total valid capacity failure throws without mutating the map, scenario or input RNG; all output is local until success. Reserved special coordinates never enter ordinary capacity, and duplicate coordinates across categories/sides/specials are rejected even if an ordinary slot would otherwise remain unused.

Ocean's default definition now lives in `BattleTerrainSystem`, with category IMPASSABLE, traversable false and authoritative status. The campaign Ocean catalog entry references that identity; Ocean fill data is unchanged. `canOccupy` centralizes deployment/special bounds, normal race/terrain eligibility and established Flying sources. Movement/pathfinding already use normal terrain rules plus Flying's 1-MOV override, so no Ocean-specific pathfinder was added. Flight expiry still checks the underlying non-Flying occupancy and applies existing Escape/AWOL rules. No Aquatic status, new race, ability or cost table was added.

Campaign travel is explicitly a location/route graph, not terrain-cell walking. Decorative Ocean does not grant free cell traversal, and this correction does not rasterize route lines or silently block existing graph edges. Future campaign tile movement or route/terrain interaction requires a separate specified rule. `requiredPoints` remains positional metadata with bounds/resize protection, not a newly invented starting-entity system.

See [PROMPT8A-IMPLEMENTATION.md](PROMPT8A-IMPLEMENTATION.md) for the exact algorithm, changed files and 42 correction tests. Prior Prompt #8 Ocean tests retain the blocked assertion and now assert its authoritative status instead of the explicitly superseded unresolved marker. Campaign schema 8 and authoring/control profile versions are unchanged.


## Battle Scene assets — Stage 1 (2026-09-25)

The [Stage-1 report](BATTLE-SCENE-ASSETS-STAGE1.md) records the complete implementation, tests and manual acceptance boundary. `tools/update-asset-catalog.cjs` is developer-only Node built-in tooling invoked by the root batch file. It scans designated flat directories, validates real PNG pixels/metadata and emits deterministic `assetCatalog.js` plus a human-readable report. The generated catalog is loaded by one ordinary classic-script tag; source artwork stays external. A bad file is quarantined individually, with sequence-level rejection only where order/canvas consistency is ambiguous. No browser directory scanning, runtime request, npm install, server or browser-generated JS publication is involved.

`BattleSceneAssets` owns optional `EditorDocument.battleScene` v1 shape/readiness, actual/transitive reference queries, category/search/status queries, explicit catalog-sequence-to-authored-definition creation and pure fallback lookups. Definitions contain ordered PNG references with independent durations. Unit profiles bind actual faction/race/class IDs to Idle/Attack/optional Dodge. Terrain definitions bind independent Background/Floor IDs globally. Effects add participant/viewport anchoring and X/Y offsets. Filename metadata has no gameplay authority. The reference graph is profiles → animations → PNGs and terrains → PNGs, with no cyclic definition composition.

`AssetBrowser` integrates with DeveloperShell and the Battle Map terrain-under-cursor menu. It supplies inspection, safe pixel preview, context selectors, animation/frame editing and presentation properties using the established logical input/property screens. Search/name text uses the existing text handler. `SceneAnimationPlayer` samples independent frame durations across arbitrary deltas/loop boundaries and HOLD/HIDE/FIRST endings. `SceneAssetImages` is a separate lazy cache so production image failures do not abort the existing core-manifest load. Known load failures surface in readiness and the browser; image errors draw safe placeholders. Preview directions translate the displayed image with the input sign. Animation choosers place semantic names before IDs, retain search and rank role/profile metadata matches without forbidding cross-profile authoring. The editor counter remains shared across authored entity kinds; animation numbering need not be contiguous. Preview is nonmutating except explicit draft edits.

Structural validation runs on editor commands/imports/restore and rejects malformed fields. Readiness rejects missing required roles/assets, invalid frames, incompatible categories/canvases and ambiguous profiles; incomplete but structurally valid drafts remain portable/saveable. Optional missing Floor/Dodge produce warnings/fallbacks. `SceneAssetAvailability` independently probes referenced catalog-valid files with local `Image` loads before each UI readiness check or publication. It deduplicates entries and limits concurrency to eight. `SceneAssetLoader` now constructs and loads the exact `?v=<hash>` runtime URL for both preview and verification. Verification requires that load AND a supplemental `&verify=<batch>` load to succeed; an alternate-query success alone is insufficient. Both share onload/onerror handling, await `decode()` where available, validate intrinsic dimensions and use a 15-second timeout per load. The prior query-only verifier could disagree with preview and is superseded; the browser-specific cause of the owner’s observed failure is not yet established. UNVERIFIED/PENDING/FAILED required entries cannot pass the final synchronous publication gate. Session evidence is keyed by ID/path/catalog hash/dimensions; each explicit check probes again and may clear recovered failures. Cancellation or a changed draft suppresses delayed publication. Optional Dodge-only/effect animations and Floors warn on unavailable art; an animation also used as Idle/Attack stays required. Palette/content validation remains the generated catalog’s responsibility, so changed artwork still requires the updater and refresh. The normal publisher calls full readiness. Registry startup retains all existing map/campaign/structural checks while skipping art availability readiness, allowing DevMode repair when installed artwork goes missing. Old documents without this optional subdocument preserve their current placeholder behavior; no fabricated production coverage is inferred.

Editor v1, browser editor key v1, portable v1, shipping envelope v1, control v1 and campaign schema 8 are unchanged. Full/Campaign exports include global scene content; map-only imports preserve it. Authored JSON contains neither PNG bytes nor the derived catalog. The Windows inert `index.html` / JSON / TXT publishing correction remains the normal route. The unchanged combat renderer/sequence still use historical placeholder staging. Production renderer, procedural visuals, sequencer/templates/compound blocks, deterministic scrubbing and combat integration remain future stages; canonical §5 now records their approved direction separately from this implementation.


## Stage-1 acceptance corrections — 2026-09-26

`LocalStore` still uses browser `localStorage`, without unload clearing, expiration, auto-restore or a new canonical persistence system. Writes now require exact immediate read-back. Failed/blocked/discarded saves keep the draft dirty; read errors clear after a successful retry. Restore/import candidate validation remains atomic. Editor Files exposes the key, current page URL and stored-record/error status. Confirmation distinguishes browser storage from durable portable JSON. The owner subsequently verified Working Copy presence and explicit restoration after both a complete Brave restart and Windows restart at the same path/profile. The earlier apparent loss is no longer a demonstrated defect; the owner believes it reflected confusion between live and Editor Campaign Maps. The post-acceptance pass makes no storage changes. File-URL policy caveats and portable backups remain applicable. See the [corrections report](STAGE1-MANUAL-ACCEPTANCE-CORRECTIONS.md) for evidence and limitations.

PropertyScreen draws the selected-row line nine pixels below the text origin, preserving the left arrow and other borders. The full deterministic suite is now **936/936**; independent PNG/publishing/SVG integration checks and offline rendering supplement it. No Stage 2/3 integration or authored/campaign/shipping schema change was made.


## Stage-1 post-acceptance follow-up

The [follow-up report](STAGE1-POST-ACCEPTANCE-FOLLOW-UP.md) records the current 950-check baseline extension, owner acceptance evidence; its missing-PNG and palette follow-up tests have since passed in the owner’s real Windows/Brave/file-URL environment. `gameConfig.UI` derives full-screen list capacity from list origin 26, row height 12, framebuffer height 360 and bottom margin 18, reserving one empty row before the legend. Capacity is 25, replacing the old fixed 12. The normal Campaign Menu actually has 13 entries, so Options formerly fell below the first page. `CampaignUIRenderer.list` now anchors the legend and list counter at `UI.listFooterY = 360 - 18 = 342`, independent of rendered item count. `listBlankRows = 1` explicitly reserves a complete blank row in the capacity calculation. The final permitted item starts at y=314 and its row ends at y=326, leaving 16 pixels before the footer. Short lists leave unused space above the footer. Overflow scrolling/pagination stays with SelectableList. This supersedes the initial follow-up’s moving-footer interpretation; see [final footer correction](STAGE1-FINAL-MENU-FOOTER-CORRECTION.md). Popup, page and PropertyScreen geometry are unchanged.
