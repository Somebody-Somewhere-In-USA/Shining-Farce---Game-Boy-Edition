# Prompt #7 implementation report

## 1. Executive summary

Implemented an expandable battle foundation on the existing classic-script `window.GBTRPG` architecture. It includes 480×360 logical rendering, validated map/deployment providers, continuous CT, a predictive timeline, shared MOV and explicit action classifications, terrain/pathfinding, nested spell/reaction execution, separate map/scene renderers and an isolated playable battle fixture.

The user's final clarification is authoritative: **preserve actual CT overshoot**. At AGI 15, the first activation occurs at 1005 and leaves 5 after acting. This supersedes the attachment's conflicting `floor(1000 % AGI)` formula and remainder-10 example.

The campaign remains schema 8. Production maps, generation, approach mapping, combat balance, AI weights and other explicitly unspecified rules remain unresolved providers. The existing campaign and spell-lab workflows remain available.

## 2. Files created

| Files | Responsibility |
| --- | --- |
| `js/config/battleConfig.js` | CT/deployment defaults, independent action metadata, scene timings |
| `js/systems/BattleTerrainSystem.js` | Battle terrain definitions, validation, race override/context adapter |
| `js/systems/DeploymentSystem.js` | Squad validation, Front/Back rows, seeded placement |
| `js/systems/BattleInitializationSystem.js` | Static/procedural source and approach-provider boundary |
| `js/systems/CTSystem.js` | Continuous initiative, tie ordering, overshoot, cloned prediction |
| `js/systems/CombatEventQueue.js` | Nested action frames, cursor/history and waiting/resume |
| `js/systems/BattleActionSystem.js` | Shared prepare/target/finalize spell mechanics |
| `js/systems/BattleController.js` | CT control, transactional event execution, reactions, action/route boundaries |
| `js/systems/BattleSceneSequence.js` | Semantic scene frames and actor/target composition |
| `js/data/battleFoundationFixture.js` | Explicitly isolated map, deployment, attack and AI fixture |
| `js/rendering/BattleMapRenderer.js` | Scrolling battle map, timeline, resources, targeting, banner |
| `js/rendering/BattleSceneRenderer.js` | Faction sides, sprite motion, pans, effects and palette fades |
| `js/states/BattleMapState.js` | Battle input, menus, counter choices and fixture flow |
| `js/debug/BattleFoundationTests.js` | 80 new deterministic checks |
| `PROMPT7-IMPLEMENTATION.md` | This report |

## 3. Files modified

- Runtime composition and documentation: `index.html`, `README.md`, `docs/ARCHITECTURE.md`, `js/core/Game.js`, `js/states/CampaignMapState.js`, `js/states/EndDayState.js`.
- Resolution/layout: `js/config/gameConfig.js`, `js/rendering/CampaignUIRenderer.js`, `js/rendering/WorldMapRenderer.js`.
- Existing rules: `js/systems/TurnSystem.js`, `ActionCommandSystem.js`, `TacticalMovementRules.js`, `TradeSystem.js`, `HiddenItemSystem.js`, `PathfindingSystem.js`, `AISystem.js`, `TargetingSystem.js`, `MagicSystem.js`, `BattleStatusSystem.js`, `CombatSystem.js`, `js/states/BattleState.js`, `js/campaign/InventorySystem.js`.
- Data: `js/data/spells.js`, `js/data/abilities.js`.
- Verification: `js/debug/FoundationTests.js`, `MapPresentationTests.js`, `ProgressionConsolidationTests.js`, `SpellFrameworkTests.js`, `tools/verify-rendering.cjs`, and generated evidence in `verification/`.

Existing external PNG assets were reused, not replaced. No runtime dependency was added.

## 4. 480×360 migration

`gameConfig.js` and the HTML canvas now declare 480×360. `graphicsConfig.js` and `Renderer` already consume those dimensions, so the real drawing buffer changes. Integer CSS scaling remains independent of game coordinates. The strategic map viewport is 480×312 with its existing 16px header and 32px footer. Footer positions and popup/camera tests were adjusted accordingly.

The new battle UI uses a 352×288 clipped map viewport, a resource sidebar and a top portrait forecast. Existing 16px assets and bitmap text retain their native detail; battle-scene placeholders use integer enlargement. Palette fades use opaque ordered pixels in the darkest authorized green, not literal RGB black or alpha blending. No broad UI redesign or editor was introduced.

## 5. Battle initialization

`BattleInitializationSystem.prepare(scenario, definitions, providers)` returns READY with a detached positioned scenario, map and deployment record, or an explicit unresolved source/orientation result. The map is validated before deployment. Existing scenario unit progression, equipment and resources feed `BattleState`.

`Game.openEndDay` offers Open Battle Map through this boundary. If content/rules are supplied, a completed PLAYER/ZEON result goes through the existing campaign `applyBattleResult`. Missing production content leaves the pending campaign battle intact. The isolated Battle Foundation Test is accessible through existing Debug Tools.

## 6. Static/procedural boundary

- Location encounters request the location's `battleMapId` from `providers.staticMaps`.
- Route encounters call `providers.generate` with the route identity, campaign route-midpoint connections, biomes, biome transitions and infrastructure metadata.
- A provider supplies approach orientation, or the supplied map carries explicit orientation.

The repository does not define a production static-map catalog, full biome generator or authoritative campaign-approach compass mapping. These are not guessed. The fixture constructs a deterministic map and declares test orientations explicitly.

## 7. Deployment

Exactly two opposing squads are required, each with 1–12 units, consistent faction membership and unique unit IDs. Opposing edges are NORTH/SOUTH or EAST/WEST.

The supplied class defaults are implemented: Fighter/Knight/Paladin FRONT; Mage/Archer/Cleric/Thief BACK. Character overrides and optional class metadata extend the service. Unknown designations reject explicitly; Wizard's BACK designation exists only in the test fixture.

Each side has distinct Front and Back rows. Rows have six positions by default; only an over-capacity row expands. Rows are centered perpendicular to the approach axis. Explicit row depths or authored positions are required. Seeded assignment chooses eligible unoccupied positions and permits sparse/staggered placement. Invalid bounds, duplicate slots/IDs, impassable authored slots, reversed Front/Back rows and insufficient capacity reject rather than silently repairing the map.

## 8. Terrain and movement

Supported identities: road, grassland, forest, mountain, desert, river, stone, bridge, and impassable mountain/river/lake/wall/tree/cliff. Traversable terrain defaults to cost 1. Optional race overrides can change cost and traversability by identity/category; no production cost table was created.

Ordinary movement is orthogonal and atomically validates the full path. Friendly/Dying units may be intermediate cells under established rules, but occupied endpoints are rejected. Enemy active units block passage. Flying makes every terrain step cost 1 and bypasses terrain impassability, while preserving bounds and unit collision. Existing Fleet-Footed history, movement restoration, Escape and Portal rules remain in use.

Turn state records `effectiveMov`, `movSpent` and `remainingMov`. Repeated moves do not refresh the allowance. Effective stat derivation includes explicit tactical status modifier metadata without inventing new buffs or values.

## 9. CT algorithm

All units start at zero CT. With no controller or scene pending, the algorithm advances by the minimum number of AGI ticks needed for the next unit to reach 1000. This is equivalent to incrementing each scheduled unit's CT by effective AGI every tick, while avoiding unnecessary empty iterations. AGI must be a positive integer under the existing stat model.

Only one unit owns control. Other ready units remain queued. The entire timeline is frozen during player control, movement, menus, AI selection, animations and pending reaction choices. Ending a turn explicitly releases control. Dying receives automatic maintenance activations; Dead/AWOL/inactive units receive no ordinary turns.

## 10. CT carryover

End Turn subtracts **1000 from the unit's actual CT**. It does not reset to zero or recompute a division remainder.

For AGI 15: 67 ticks reach 1005, leaving 5; the next cycle can reach 1010 and leave 10. Tests cover both the first overshoot and accumulated carry. This follows the user's explicit final answer, “Yes—preserve overshoot (5 CT).”

## 11. Tie breaks

Simultaneously ready units are ordered by descending effective AGI, DEX, MOV and STR, in that sequence. A complete tie is shuffled using the existing deterministic RNG. Randomness is used only for the remaining tied group. Tests cover each stat priority and reproducible full ties.

## 12. Predictive timeline

Prediction clones battle state, CT queues and the tie RNG. It simulates repeated future activations instead of making round-based lists. The horizon extends until every currently active unit appears, even when faster units repeat many times; the UI pages long forecasts.

The controller forecast simulates known Dying countdown/removal and owner-turn Fly/Portal expiration, including deterministic stranded AWOL. It assumes no intervening moves, casts, equipment changes or other player/AI outcomes. Such actions rebuild the forecast from new facts. No forecast consumes live RNG or changes HP, timers, positions or CT.

Tests compare forecasts with 80 actual ordinary activations, Dying maintenance/tie RNG, and known Fly-expiration AWOL behavior.

## 13. Major/Minor economy

Normally one Major Action is available. Attack, Skills, Magic, Steal, Item, Equip, Stance and Scrounge default to Major. Move, Trade, Enter Portal and Escape default to Minor. Explicit established exceptions such as Quick Items, per-ability Minor metadata and once-per-turn restrictions remain supported.

MOV and Major budgets are separate. A unit may move, Trade, move, use its Major Action and move again within its remaining allowance. Neither exhausted MOV nor a spent Major Action automatically ends player control. Existing lifecycle/incapacitation handling can end control. Unresolved Stance effects retain their explicit effect boundary.

Trade's default is now Minor; its legacy explicit policy adapter remains available for existing fixtures/future exceptions. Scrounge metadata now states Major, while its unspecified distance/tie/collection/capacity details remain unresolved.

## 14. Map/scene classification

Action metadata has independent `economy` and `presentation` fields. Attack/Skills/Magic/Steal/Item default to SCENE; Equip/Stance/Scrounge and movement/Trade/Portal/Escape default to MAP. An explicitly Minor ability can still request SCENE presentation. Presentation never determines CP ownership or action cost.

## 15. Battle-scene sequencing

The semantic frame sequence supports darkest-green screen, entrance fade and simultaneous slide for adjacent opponents, approximately 1-second idle, action, effect/hit, approximately 2.5-second result, exit fade and map return. PLAYER always occupies the left and ZEON the right, irrespective of the attacker.

Ranged and friendly interactions begin at the actor, pan across a shared backdrop to the target, show the effect, pan back and show results. Self targeting uses one unique sprite. Multi-target actions visit targets in order; all units need not fit onscreen together. Reaction frames visit the reaction user and return to the interrupted target. Timings and frame descriptions are separate from gameplay calculation.

## 16. Event/reaction queue

Each spell frame retains execution ID, actor, resolved cast, confirmed target IDs, resolved IDs, provenance and a target/event cursor. Preparation validates and pays costs once. TARGET resolves one target, COUNTER checks the corresponding reaction opportunity, and FINISH creates the action receipt once.

`CombatEventQueue` uses a stack so a reaction can push a child action while preserving its parent. Player Spell Counter records a waiting choice without rerolling. Resuming executes the selected child spell before the parent's next target. Event state and mechanics commit together through the existing battle clone/validate/freeze transaction; failure rolls back the cursor, resources and RNG.

Prayer and Arcane Siphon remain shared damage rules and emit semantic presentation interjections. The generic non-spell action boundary accepts an explicit resolver, verifies an executed outcome, consumes the declared budget, creates the owning receipt and sequences reactions/presentation. Missing formulas fail explicitly. The legacy direct cast facade shares prepare/target/finalize logic with the queued controller.

## 17. AoE ordering

Mage area damage includes applicable allies and the caster. Explicit target/life restrictions remain in force: ordinary effects exclude Dying/Dead/AWOL, Raise targets Dying only, and existing friendly-area immunity remains valid. A confirmed damaging area may be centered on an empty or friendly tile rather than silently removing applicable targets by faction.

Affected units sort by Manhattan distance from the center, then clockwise angle starting at north: N, NE, E, SE, S, SW, W, NW where present. A stable coordinate/ID fallback resolves any residual equality. Resource payment/CP occurs once for the action, not once per target.

## 18. Spell Counter anti-recursion

Generated counter spells carry `provenance.spellCounterGenerated = true`. The Spell Counter check ignores only that reaction for these spells. Ordinary eligible reactions, including Prayer and Arcane Siphon, remain available. No global “no reactions” switch is used.

Existing 20% activation, player choice of purchased Mage Lv1 spells, zero MP, no Major Action and no CP are preserved. Enemy choice remains a provider; only the fixture chooses its first eligible spell. Tests cover nested player choice, parent resumption, CP ownership, no duplicate costs and narrow suppression.

## 19. AI and pathfinding

`PathfindingSystem.find` is a pure orthogonal search using the execution validator. It tracks remaining MOV and pending movement-ability state, permits legal intermediate occupancy, rejects occupied endpoints and suppresses movement-restoration side effects while planning.

`PathfindingSystem.plan` also considers friendly, unoccupied Portal transitions. State deduplication prevents zero-cost Portal cycling. `BattleController.route` executes a selected plan atomically with shared MOV. Tests cover detours, Flying, race costs, friendly/hostile/occupied portals and read-only planning.

`AISystem.choose` requires an explicit policy and rejects choices outside supplied candidates. Production battle AI can supply candidate generation and selection. The isolated fixture advances toward reachable opponents, attacks when adjacent and ends its turn; its distance preference, 20-damage attack and spell choice are test content, not production weights.

## 20. Dying, Death, AWOL and conclusion

Prayer runs before lethal damage commits to Dying or conclusion. Dying counters begin at 3 (or the established Martyr-adjusted value), decrement on the unit's own maintenance activations and remove it at zero on turn completion. Dying receives no ordinary control, actions, reactions or ordinary AoE. Raise preserves its prior behavior.

Fly expiration uses the established Escape/AWOL rules and terrain providers. Dead/AWOL map positions and local roster membership are removed. The campaign result retains existing casualty/AWOL fields; schema and campaign commit behavior are unchanged.

Conclusion detection runs after each target and relevant lifecycle change. A pending winner blocks new actions, CT and remaining queued TARGET/COUNTER mechanics immediately. Already-started action receipts may finalize. The current scene finishes, MAP_RETURN renders, and only then does the banner appear. Draw presentation remains supported locally; campaign draw resolution is not invented.

## 21. Save/schema impact

Schema remains **8**. No migration was added. Campaign snapshots do not gain CT, queues, animation frames, camera, cursor or pending combat UI. Existing schema/active-resolution tests remain in the harness. Battle sessions use detached copies; full tactical HP/MP/item/CP reconciliation into campaign state and general recovery remain future rules, as before.

## 22. RNG/determinism

Deployment, CT ties and combat reactions use the existing deterministic RNG with explicit session seeds. Their state is isolated from campaign RNG. Forecasts clone the tie RNG; UI reads never consume live randomness. Transaction failures restore event and reaction RNG state with the rest of the battle. Fixture outcome/rounding injections are explicitly separated from production defaults.

## 23. Tests added/changed

Added **80** Prompt #7 checks spanning map dimensions/source providers, four approach directions, deployment capacity/invalid content, all terrain identities and race overrides, CT carry/ties/freeze/forecast, Dying/Fly prediction, Major/Minor metadata, shared MOV, pathfinding/Portal safety, scene composition/timing, AoE geometry, transactions, nested counters, Prayer, conclusion, AI boundaries and schema isolation.

Retained all 538 prior checks, updating eight superseded expectations:

1. Strategic viewport dimensions now use 480×360.
2. Camera bounds/transforms use the expanded viewport.
3. Cursor scrolling clamps at the new viewport limits.
4. Popup bounds use the new screen edges.
5. Successful default Trade now executes as Minor.
6. Battle Trade still rejects invalid transfers atomically, but no longer waits for an unspecified default cost.
7. Dying remains excluded from ordinary AoE while a living caster inside Mage AoE is now included.
8. Scrounger still preserves unresolved MOV/capacity rules, but Scrounge's Major classification is explicit.

No prior coverage was deleted. Optional offline rendering QA now covers the new map/action/targeting flow, adjacent/ranged/friendly/self/Prayer frames, palette fades and scene-to-victory return alongside the established campaign and spell-lab flows.

## 24. Exact deterministic results

**618 total; 618 passed; 0 failed; 0 skipped.**

- `node tools/test-foundation.cjs`: same deterministic harness exposed in-game.
- `node tools/verify-rendering.cjs PATH_TO_EXISTING_CANVAS_PACKAGE`: same rule harness plus local asset, framebuffer, resize and input/rendering checks.
- 21 external PNGs checked.
- Logical framebuffer: 480×360.
- Five resize cases: 1000×800 → 2×; 960×720 → 2×; 959×719 → 1×; 480×360 → 1×; 200×160 → 1×.
- Sampled assets/screens contain only the five authorized shades and no partial-alpha pixels.

Evidence: `verification/rule-checks.txt`, `verification/results.json`, `verification/render-log.txt` and the generated PNGs. Images are offline Canvas2D renders, not browser screenshots.

## 25. Regression status

The prior campaign, resolution, save/migration, economy/logistics, recruitment, race/growth, class/ability/CP, inventory/equipment, spell/lifecycle, Portal, Prayer, Flying, AWOL and route-midpoint checks pass with the eight documented superseded expectations updated. The old Spell/Portal Lab and campaign test-result controls still pass their input/rendering flows. No server/build/runtime network dependency was introduced.

## 26. Known limitations

- The playable battle uses explicitly labeled fixture maps/balance and existing graphical placeholders; production content is absent.
- Production Open Battle Map reports missing map/approach providers. It does not substitute fixture content into campaign combat.
- The generic action/event foundation does not invent unfinished Attack, Skill, Steal, Item, Stance or Scrounge calculations. Some menu categories therefore expose unresolved rules rather than executable effects.
- Forecasts assume unchanged future actions/positions and predict only established lifecycle changes. They cannot predict decisions or unknown effects.
- Production AI and enemy counter-selection policy require providers. The simple fixture policy is not a finalized tactical opponent.
- Combat state is transient. Existing casualty/result fields integrate with the campaign, but full tactical resource/CP reconciliation and general post-battle recovery remain deferred.
- Direct browser `file://` launch was not verified: an earlier attempt was rejected by the browser URL policy, and no workaround was used. Classic local-script/PNG loading is preserved and verified statically/offline.

## 27. Intentionally TBD

Normal Attack damage/hit/miss/critical formulas; ordinary counter probability/damage; other deferred skill/item outcomes; production AI candidate/scoring policies and weights; enemy Wizard counter spell selection; detailed race terrain-cost tables; full biome/transition generator; production static maps/catalog; campaign-approach compass mapping and production deployment depths; unspecified class deployment designations; global rounding; action CP amounts; unresolved Mage/Cleric range/cost/magnitude/status values; Scrounge's remaining distance/tie/collection/capacity policies; unresolved Stance dodge effects; general post-battle recovery, tactical reconciliation and campaign draw rules.

## 28. Ambiguities resolved without guessing

- **CT:** the attachment's mathematical remainder and “overshoot” conflicted. The user explicitly selected actual overshoot, 5 for the first AGI-15 activation. Implementation and tests follow that answer.
- **Approach/deployment content:** no authoritative campaign compass mapping, production depths or Wizard designation was provided. Providers reject unresolved production data; test metadata is explicit and isolated.
- **Dark screen versus strict palette:** fades use the existing darkest authorized green, preserving the five-color requirement without introducing RGB black.
- **Dying versus ordinary turns:** automatic CT maintenance advances the existing own-turn countdown while withholding ordinary control and forecast portraits.
- **Missing formulas/content:** injectable boundaries remain unresolved. Fixture values and policies are labeled and never promoted into production balance.
