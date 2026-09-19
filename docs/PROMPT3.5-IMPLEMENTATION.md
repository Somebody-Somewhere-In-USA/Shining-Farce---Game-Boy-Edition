# Prompt #3.5 implementation report

Historical report. Current class/CP/loadout state and verification are recorded in [Prompt #4](PROMPT4-IMPLEMENTATION.md).

Implemented race, character attributes, deterministic progression, generated-recruit growth, and shared derived stats on the existing campaign engine. The original 133 checks are retained, with six expectations updated where the new schema/stat model supersedes the old one. **195/195 checks pass**, including 62 new checks. Offline rendering and keyboard-flow verification also pass.

## 1. Files added

- `js/config/characterStatsConfig.js`: primary keys, level cap, provisional capacity formulas and isolated legacy mapping.
- `js/data/races.js`: all seven ordinary races, ranges, capacity offsets, movement traits, restrictions, and innate ability metadata.
- `js/core/DeterministicRandom.js`: shared serialized 32-bit PRNG and stable ID seeding.
- `js/campaign/CharacterGrowthSystem.js`: starting rolls, racial growth, additive class growth, ordinary level advancement and recruit simulation.
- `js/campaign/CharacterStatsSystem.js`: one effective-stat derivation service.
- `js/campaign/ClassGrowthProvider.js`: replaceable class growth and movement interfaces.
- `js/campaign/CharacterValidation.js`, `CharacterMigration.js`: schema validation and legacy conversion.
- `js/campaign/EquipmentEligibility.js`: composed race and class equipment legality.
- `js/campaign/BattleStatAdapter.js`: isolated legacy tactical view and current-resource handling.
- `js/ui/CharacterStatView.js`: shared readable stat-page formatting.
- `js/debug/CharacterStatsTests.js`: 62 new checks.
- This report and new stat/race renders under `verification/`.

## 2. Files substantially modified

`index.html` loads the new classic scripts in dependency order. `campaignConfig.js` declares schema 4 and the level-change event. `campaignResources.js` replaces archetype stat blocks with explicit race assignments and converts provisional ATK item modifiers to STR modifiers.

Campaign integration changes are in `UnitManagementSystem.js`, `RecruitmentSystem.js`, `InventorySystem.js`, `ResourceSystem.js`, `CampaignState.js`, `Campaign.js`, and `BattleBoundary.js`. Tactical fixture integration changes are in `data/characters.js` and `entities/Unit.js`. UI changes are in `CampaignResourceUI.js` and `CampaignMapState.js`.

The existing `FoundationTests.js`, `ResourceTests.js`, and `StrategicMovementTests.js` retain their checks and integrate the new suite. `tools/verify-rendering.cjs`, `README.md`, and `docs/ARCHITECTURE.md` describe/check the current behavior. Prompt #3's report is marked historical. No art files changed.

## 3. Schema/version change

The campaign schema advances from **3 to 4**. Units and candidates replace `level` with `characterLevel`, gain explicit race and current class IDs, accumulated primary attributes, a serialized per-character growth stream, and independent class-progress storage. Effective capacities, MOV, DEF and equipment-adjusted attributes are recomputed.

## 4. Migration behavior

Supported schema-1/2 PLANNING states retain the existing stationing/resource migration, then receive schema-4 characters. Bare pre-resource units retain the previous development fallback: level 3; known named archetype or swordsman; legacy `orc*` IDs select the existing orc archetype; orphan units default to PLAYER at Granseal because those old records lack location/faction facts.

Schema-3 PLANNING states preserve IDs, names, faction, status, physical location, ordered squad membership, equipment/possessions, item IDs, shipments, traveler orders, treasuries, counters, pool IDs, costs and refresh schedule. Existing character levels from 1–100 are preserved. Old units use a stable hash of their existing ID, then simulate exactly level-minus-one events. Candidates retain their original seed and level and use the same simulation. Loading the same legacy input repeatedly produces identical output; conversion works on a clone.

Missing/invalid schema-3 unit types or levels are rejected. Levels above the supported cap are rejected, not silently clamped. Active legacy resolutions must finish in the previous build before migration. Their battle queues are never reset. Current schema-4 states restore during every phase, including pending battles. Completed `lastResolution` records remain historical snapshots; legacy history is not retroactively rewritten into schema-4 battles. There is still no save/load UI.

## 5. Authoritative persistent unit-stat shape

```js
{
  id: "mc", name: "AREN", typeId: "swordsman", faction: "PLAYER",
  status: "ACTIVE", unassignedLocationId: null,
  raceId: "HUMAN", characterLevel: 3, currentClassId: "swordsman",
  basePrimary: { str: 13, dex: 14, con: 12, agi: 12, int: 15, wis: 16 },
  growthRngState: /* serialized unsigned 32-bit integer */ 123,
  classProgress: {}
}
```

The numeric example illustrates the shape; the engine owns actual seeded values. `basePrimary` stores permanent accumulated growth without equipment. `growthRngState` stores the next-draw continuation state, not a history. Class progress can later hold `{ classId: { cp, classLevel } }`; neither its sum nor individual class levels determine Character Level. New records have an empty map. XP awards and CP thresholds are not implemented.

Candidates have `{id, typeId, seed, costG}` plus the same six progression fields. Recruitment copies those fields rather than regenerating them under the new recruit ID.

## 6. Race-definition shape

Each entry in `G.data.RACES` declares `id`, `name`, six inclusive `starting` ranges, six inclusive `growth` ranges, `mov`, `startingMaxHpModifier`, `startingMaxMpModifier`, `movementTraits`, `equipmentRestrictions.forbiddenSlots`, `innateAbilities`, and an empty `compatibility` extension point. Exactly HUMAN, ELF, DWARF, CENTAUR, BIRDFOLK, BEASTMAN and FAIRY are ordinary races. Their primary ranges and movement values follow the prompt.

Provisional capacity offsets are centralized alongside each race:

| Race | MOV | HP offset | MP offset | Special declaration |
| --- | ---: | ---: | ---: | --- |
| Human | 5 | 0 | 0 | — |
| Elf | 5 | -4 | +8 | — |
| Dwarf | 4 | +6 | -4 | — |
| Centaur | 7 | +4 | 0 | Ground movement |
| Birdfolk | 7 | -4 | 0 | Flight |
| Beastman | 5 | +4 | 0 | Weapon and armor forbidden |
| Fairy | 7 | -10 | +6 | Flight; debuff-cure concept |

## 7. Derived-stat architecture

`CharacterStatsSystem.deriveStats(unit, equipmentDefinitions, context)` is the sole effective-stat calculator. `InventorySystem.stats()` selects only physically EQUIPPED definitions and delegates. UI and battle snapshots consume the same results; recruit previews derive directly from the stored candidate.

Current **provisional** formulas in `CHARACTER_STATS.capacity` are:

```text
MAX HP = max(1, 10 + 2 × effective CON + racial HP offset + direct modifiers)
MAX MP = max(0,      1 × effective INT + racial MP offset + direct modifiers)
MOV    = max(0, racial MOV + current class MOV modifier + equipment/effect MOV)
DEF    = equipment DEF + effect DEF
```

Primary equipment/effect modifiers are applied before CON/INT capacity derivation. Direct capacity modifiers also compose. Racial offsets are applied once when deriving capacity; they never multiply by level or become additional growth rolls. No innate racial/class DEF exists. Returned snapshots are frozen plain data and include racial movement/ability declarations.

## 8. Deterministic Level-1 generation

The shared PRNG uses the existing recruitment LCG constants, `state = (1664525 × state + 1013904223) mod 2^32`, with `Math.imul` for exact 32-bit behavior. Each attribute draws separately, in fixed STR/DEX/CON/AGI/INT/WIS order. Inclusive integer mapping uses the full unsigned state. Level 1 consumes six starting-stat draws and **zero growth events**. No `Math.random()` or UI-triggered rerolls are used.

## 9. Deterministic racial growth

Each growth event makes six independent racial draws and adds the current class provider's fixed primary bonuses. The accumulated base and final RNG state commit together with Character Level. The cap is 100. DEF, MOV, HP and MP are not accepted as class-growth keys.

`Campaign.advanceCharacterLevel(unitId)` exposes one explicit progression event through the existing atomic command facade and emits `CHARACTER_LEVEL_CHANGED`. It requires an active unit and PLANNING. This is a foundation/debug command, not an invented XP threshold system.

## 10. Recruit growth simulation

`simulateRecruitGrowth()` generates Level-1 stats and calls ordinary `advanceLevel()` exactly `N - 1` times. A level-10 recruit receives nine events. Existing settlement type selection, benchmark policy, prices, physical recruitment location and automatic seven-day refresh remain intact. Refresh advances the pool seed once per candidate; each candidate's growth uses its own copied stream. Character growth never consumes another unit's stream.

The candidate's complete generated progression is stored when its pool is created. Opening previews, recruiting, equipping, saving/restoring and inspecting battles do not reroll it. Recruitment remains independent of future class-training unlocks.

## 11. Class-growth hook/interface

`ClassGrowthProvider.getGrowth(classId)` returns a partial fixed bonus map such as `{str: 2, wis: 1}`; unspecified primary bonuses are zero. `getMovementModifier(classId)` separately returns an effective MOV adjustment. The shipped implementation returns **zero bonuses and zero MOV adjustment**, explicitly provisional because no class balance tables exist.

Recruit simulation accepts transient allocations such as `[{classId: "swordsman", events: 3}, {classId: "priest", events: 6}]`. Their total must be `N - 1`. These are simulation inputs only. They are not saved as class levels or a per-level history. Tests demonstrate mixed providers without shipping invented class definitions. Future class changes keep accumulated base stats and change which provider applies to later growth.

## 12. Equipment restriction integration

`EquipmentEligibility.allows()` composes race forbidden slots, optional item race restrictions and existing item class restrictions against explicit `raceId/currentClassId`. `InventorySystem.eligible()` adds faction, ownership and active-unit rules.

This same path serves the alternatives UI, local assignment, remote assignment and actual delivery. Save validation uses the structural rule for equipped and assigned items. Beastmen cannot equip weapons or armor; eligible accessories and consumables still work. An accessory supply wagon is tested through delivery. Pending replacements remain inactive; no gear teleports and no physical ownership rules changed.

## 13. Movement-trait representation

Birdfolk and Fairy declare `movementTraits: ["FLIGHT"]`. Centaur declares no flight trait despite MOV 7. Derived/battle snapshots expose these declarations for a future terrain/movement adapter. No flight costs, terrain bypass or Centaur-specific terrain rules were added.

## 14. Racial-ability representation

Fairy declares `innateAbilities: ["singleTargetDebuffCure"]`. `RACIAL_ABILITIES` identifies its source as RACE and records the concept `CURE_ONE_TARGET_DEBUFF`. The ID is an internal hook, not a finalized ability name. No MP cost, range, cooldown, action type or status-category taxonomy is invented. Ability exposure is data-driven.

## 15. Tactical compatibility handling

BattleScenario units carry their authoritative progression, equipped item IDs, canonical derived `stats`, detached possessions, and a separate `legacyStats` view. Legacy ATK exists only in `BattleStatAdapter` as a provisional alias of effective STR, not a finalized melee damage formula. The old tactical hero fixture now generates from an explicit HUMAN character model instead of a hardcoded ATK/DEF/HP block.

The adapter accepts current HP/MP separately. Supplied resources retain their value, clamped only if capacity decreases. `Unit.refreshDerivedStats()` passes existing current resources; equipment/stat inspection does not heal or refill. New tactical fixtures start full. Campaign units still have no persistent current HP/MP or attrition/recovery simulation. Tactical grid movement/collision remain unchanged.

## 16. UI changes

Unit status and recruit details show race, Character Level, current placeholder class, all six primaries, MAX HP/MAX MP, MOV and DEF. They show actual generated/equipped values. The same formatting helper adds movement traits and racial ability concepts.

Enable Debug Tools to use **Races / Stat Previews**, which displays all seven races at Level 1 with a fixed seed, or **Debug Character Level Up**, which applies one real growth event. Previews are read-only. The latter is explicitly a debug mutation. No class-changing UI was added.

## 17. Validation changes

Schema-4 character and candidate records have exact allowed fields. Validation rejects unknown/missing races, missing/additional primaries, non-finite/unsafe/negative base values, levels outside 1–100 or fractional levels, invalid/missing unsigned RNG state, malformed class progress, illegal equipped/assigned items, and duplicate derived/legacy/history fields. Effective stat overflow is rejected. Candidate seed, price, type, location, schedule and existing physical/logistical invariants remain validated. No derived values are silently written back.

## 18. Tests added

The 62 new checks cover all seven racial ranges and inclusive growth endpoints; a fixed PRNG vector; serialized continuation; independent draws; zero events at level 1; nine at level 10; generated/ordinary equivalence for every race; additive and mixed class bonuses; independent class progress; invalid allocations; level cap and phase guards; capacity derivation and offsets; non-growing MOV/DEF; equipment/effect composition; pure stat/UI reads; recruit preview/purchase/restore identity; explicit races; Beastman eligibility and remote accessory delivery; illegal save rejection; flight/Fairy hooks; tactical resource preservation; battle snapshots; malformed state; overflow; migration preservation and active-legacy rejection.

## 19. Total test results

**195/195 passing: 133 existing + 62 added.** The six existing expectation changes are two schema assertions, three old ATK assertions (now effective STR relative to accumulated base), and the recruit benchmark's renamed Character Level field. Existing movement, control, squads, equipment, logistics, recruitment schedule, battle pause/resume and End Day checks still pass.

## 20. Visual/runtime verification

The offline Canvas2D verifier passes keyboard-driven recruitment preview/purchase, unit status, seven race previews and debug advancement, alongside all previous map/shop/equipment/logistics/battle/tactical flows. Stat pages, Fairy's hook and Beastman's restriction page were visually inspected; no clipping or unreadable overflow was found.

All 19 external PNGs and sampled framebuffers contain only the five authorized greens and no partial-alpha pixels. The framebuffer remains 320×240, all five integer-scaling cases pass, and native 16×16 strategic detail remains intact. No sprites were redesigned. New evidence includes `verification/character-stats.png`, `recruitment-stats.png`, `race-*.png`, `character-level-up.png` and `results.json`.

These are **offline Canvas2D renders, not browser screenshots**. Direct browser `file://` launch remains unverified: a prior browser URL-policy denial has not been retried or bypassed. The runtime still uses local classic scripts and external PNGs with no server, build, npm or terminal requirement for play.

## 21. Assumptions made

- HP/MP coefficients and offsets above are provisional numeric placeholders. The prompt's racial ranges/MOV are centralized provisional balance data.
- Current class growth and MOV bonuses default to zero until designed.
- Named Aren, Sarah, Jaha and Kaz use explicit HUMAN development profiles; Chester uses CENTAUR. Generic swordsman/healer/mage types use HUMAN. These assignments do not establish additional character lore or a race/class matrix.
- The existing ORC enemy artwork/type uses an explicit HUMAN stat profile temporarily. It remains visibly ORC and faction ZEON. This is a compatibility assumption, not an eighth ordinary race or a biological declaration.
- Existing weapon and Power Ring ATK bonuses become provisional STR bonuses of the same amount. Armor/ward DEF modifiers remain. The legacy tactical ATK alias is also provisional.
- Bare schema-1/2 fallbacks, cap rejection, historical record preservation, and full resources for fresh tactical fixtures are described above.

## 22. Deferred work

Full classes, class changing/unlocks, CP/XP thresholds and awards, race/class compatibility categories, promoted classes, final combat/healing/evasion/resistance/turn-order formulas, full flight/terrain behavior, Fairy cure mechanics, secret races, Combat Rating, enemy scaling, wilderness, survival/recovery, diplomacy, quests, Zeon AI, Jewels, save/load UI, and mobile packaging remain deferred.

## Explicit completion answers

| Requested confirmation | Answer |
| --- | --- |
| STR/DEX/CON/AGI/INT/WIS are the authoritative growing primaries | Yes |
| MAX HP/MAX MP derive centrally from CON/INT | Yes; provisional configurable coefficients |
| MOV/DEF are excluded from ordinary growth | Yes |
| Every unit has an explicit race | Yes; compatibility mappings documented |
| All seven ordinary races are data-driven | Yes |
| Level-1 ranges generate deterministically | Yes |
| Racial growth uses serialized deterministic randomness | Yes |
| A level-10 generated recruit gets exactly nine events | Yes |
| Generated and ordinary progression share the authoritative engine | Yes |
| No full per-level class history is required or persisted | Yes |
| Future class growth can plug in without rewriting race logic | Yes |
| Beastmen cannot equip weapons or armor | Yes |
| Birdfolk/Fairy expose racial flight | Yes |
| Fairy exposes the debuff-cure hook without unfinished mechanics | Yes |
| Existing equipment/logistics/recruitment/squads/End Day pass | Yes |
| No-build `file://` runtime architecture remains | Yes; browser launch itself remains unverified |
