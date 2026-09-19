# Shining Farce — Prompt #6 implementation report

Completed 2026-09-16. **454/454 deterministic checks pass:** all 362 prior checks retained, plus 92 new checks. Offline rendering/input checks pass with 21 external PNG assets and the unchanged 320×240 five-green framebuffer.

The executable spell/lifecycle engine and isolated spell lab are implemented. Production spell balance remains unresolved where requested. The campaign End Day screen retains its existing placeholder battle interface; direct browser launch could not be verified because browser automation rejected the local-file URL.

## Inspection and architecture decisions

The baseline had class/CP/growth/loadout services, physical item ownership, a detached transactional BattleState, movement rules and a spell grouping helper. `SPELLS` was empty. MagicSystem, CombatSystem, TargetingSystem, CombatCutInState and BattleRenderer were placeholders. There was no operational normal-counter resolver, tactical initiative loop, campaign-to-tactical map generator, status lifecycle, or complete combat animation flow to reuse.

This pass fills those existing service boundaries, extends BattleState, reuses AnimationPlayer and bitmap UI, and adds focused status/Portal/casualty services. It does not replace campaign simulation or introduce another class progression system. Runtime remains classic scripts under `window.GBTRPG`, local PNGs, no installation/build/server/ES modules/runtime fetch/remote dependency.

## Files added

- `js/config/spellConfig.js`: centralized balance/rounding and unresolved policies.
- `js/data/spellClasses.js`: Mage promotion, Cleric/Wizard and their abilities.
- `js/data/spellLabScenario.js`: explicitly isolated development fixtures.
- `js/systems/BattleStatusSystem.js`: tactical life/status/reaction/movement-restoration rules.
- `js/systems/PortalSystem.js`: placement, transfer, duration, allegiance and highlighting.
- `js/campaign/BattleCasualtySystem.js`: persistent roster casualty commit/replay.
- `js/states/SpellLabState.js`: bitmap spell selection and tactical inspection.
- `js/debug/SpellFrameworkTests.js`: 92 deterministic checks.
- `tools/generate-portal-art.cjs`: optional native PNG authoring utility.
- `assets/world/portal-friendly.png`, `assets/world/portal-enemy.png`: 16×16 smile/angry Portal sprites.
- `docs/PROMPT6-IMPLEMENTATION.md`: this report.

## Files modified

Loading/data/config: `index.html`, `js/data/spells.js`, `js/data/assets.js`, `js/config/campaignConfig.js`.

Campaign: `CampaignState.js`, `ClassGrowthProvider.js`, `RecruitmentSystem.js`, `ResourceSystem.js`, `EndDayResolutionSystem.js`, `BattleBoundary.js`, `ResolutionValidation.js`, `AbilityLearningSystem.js`, `AbilityLoadoutSystem.js` under `js/campaign/`.

Tactical: `MagicSystem.js`, `TargetingSystem.js`, `CombatSystem.js`, `TurnSystem.js`, `TacticalMovementRules.js`, `MovementSystem.js`, `ActionCommandSystem.js`, `ExecutionReceiptSystem.js`, `AbilityEffectHooks.js`, `ItemSystem.js`, `TradeSystem.js` under `js/systems/`.

Presentation: `js/states/BattleState.js`, `CombatCutInState.js`, `CampaignMapState.js`; `js/rendering/BattleRenderer.js`; `js/ui/ClassManagementUI.js`; `js/core/Game.js`.

Verification/documentation: six existing debug suites retain their cases with superseded catalog/schema expectations updated; `tools/verify-rendering.cjs`, `verification/rule-checks.txt`, `verification/results.json`, new/refreshed offline PNG evidence, `README.md`, `docs/ARCHITECTURE.md`.

## Spell data and resolution

**FINALIZED mechanics/data structure.** There are 36 spell definitions and 119 total ability definitions across eight playable disciplines. Every spell has stable identity, family/tier/owner, separate castingRange/effectRadius, typed magnitude, MP cost, element, damage/healing flags, application/cure status lists, allegiance/target type restrictions, caster/Dying/Dead permissions, placement and compatibility metadata.

Casting distance is Manhattan distance ≤ castingRange. Effect radius R is a Manhattan diamond of distance R−1: R1=1 tile, R2=5, R3=13, R4=25; larger radii use the same algorithm. Portal Range 4 is independent of its one-tile endpoints. Target selection and affected-unit filtering are separate queries. Ordinary targets and AoE exclude Dying/Dead; Raise is the normal Dying exception.

The resolved cast preserves the underlying spell ID/class and innate radius, adds the selected method and final paid MP cost, and changes only the specified range/radius/magnitude/cost fields. Damage, healing, cures, Raise, Flying and Portal commit through the existing atomic BattleState command boundary. Unresolved balance, insufficient MP, invalid targets/range, incompatible modifiers and fractional values without a rounding policy reject without changing state. Unsupported future effect types explicitly reject instead of spending MP for a pretend effect.

## Mage

**FINALIZED:** current-class growth +1 INT. The stable `mage` ID is promoted to a playable discipline, preserving the old legacy equipment permissions for compatibility with existing staff/armor users. WAND/ROBE selectors also exist; no invented Wand equipment catalog is added.

Blaze/Fire, Freeze/Ice, Bolt/Lightning, Gale/Air, Quake/Earth and Torrent/Water each have four separate purchasable spell abilities. Required Mage levels are 1/3/5/7; radii are 1/2/2/3. Tiers 1 and 2 share the same family magnitude balance key, so tier 2 does not silently increase per-target damage. Tiers 3/4 explicitly declare their greater magnitude relationship. Actual damage/range/MP remain unresolved in production.

No spell is automatically granted on reaching a Class Level. The established CP prices and Current/Lifetime CP distinction remain intact.

## Cleric

**FINALIZED:** class growth +1 WIS; no invented MOV or equipment bonus. Unspecified prerequisites are not used to impose a new lock.

| Ability | Class Level | Implemented behavior |
| --- | --- | --- |
| Heal 1/2/3/4 | 1/3/5/7 | Restores resolved HP magnitude; respects MAX HP |
| Detox | 2 | Cures POISON only |
| Clear Sight / Unseal | 4 | Cure BLIND / MUTE |
| Raise 1 | 4 | Dying → Alive, clears counter, restores 50% MAX HP; Dead rejects |
| Awaken / Clarity | 6 | Cure SLEEP / CONFUSED |
| Prayer | 3 | Resolved activation prevents adjacent friendly lethal event, leaves exactly 1 HP, preserves statuses |
| Martyr | 7 | First adjacent enemy Dying entry in this battle starts at 2 instead of 3 |
| Faith | 6 | Equipped Support adds +1 WIS on future growth events only |
| Divine Ward | 8 | Incoming spell damage ×0.70; hostile spell status chance minus 0.30, clamped at zero |
| Graceful Step | 10 | First completed non-empty movement restores 5% MAX HP, once per turn |

The five passive unlock levels above use the designer’s clarification during implementation. Cleric has no invented level 8–10 Action. Prayer’s probability stays null/configurable; a supplied resolved activation decision is required when applicable. Poison and other statuses survive Prayer/Raise; a later supplied Poison-damage event can still cause Dying. Poison tick magnitude/timing is not invented.

## Wizard and modifiers

**FINALIZED:** prerequisite this character’s Mage Class Level 5; growth +2 INT; STAFF/ROBE selectors; class MOV 0.

| Casting method | Level | Range | Radius | Magnitude | MP |
| --- | --- | --- | --- | --- | --- |
| Extend | 1 | +1 | unchanged | unchanged | ×1.10 |
| Focus | 3 | unchanged | becomes 1; innate radius must exceed 1 | ×1.75 | ×1.25 |
| Expand | 5 | unchanged | +1 | unchanged per target | ×1.50 |
| Overcharge | 7 | unchanged | unchanged | ×2 | ×2.50 |

Exactly one method applies. All six Mage families inherently support these methods, with Focus’s innate-radius restriction. A purchased method must be accessible through current/secondary Wizard; a purchased spell must be accessible through its own current/secondary Action class. Either Mage/Wizard arrangement works. Methods are not duplicate spells or independent CP-producing actions.

Divine Arcana (Lv4), Hex Arcana (Lv6), Enchanting Arcana (Lv7) and Restorative Arcana (Lv9) authorize compatible spells through class/group metadata. The one-Support-slot rule remains. No future Hexer, Enchanter or Advanced Healer class/spell table was invented. Faith and Intelligence Training use the existing growth provider; Wizard Intelligence Training (Lv8) adds +2 future INT, stacking with the class’s +2.

Spell Counter (Lv2) checks a supplied legal counter opportunity first, rolls 20%, and selects only a purchased eligible Mage spell at 0 MP. A successful Spell Counter never evaluates ordinary counter chance; a failed one can proceed to the supplied normal-counter resolver. Trigger IDs are deduplicated, so a second opportunity cannot be obtained from the same attack. Reactions neither spend Major Action nor award CP. Selection priority remains a centralized unresolved policy; the engine does not invent a preferred spell. Normal physical-counter probability/damage also remain supplied boundaries because the baseline had no such resolver.

Arcane Siphon (Lv6) applies to incoming damaging magic, restores its **resolved paid MP cost**, clamps to MAX MP and multiplies damage by 0.90 before final rounding. Ordinary physical damage does not activate it. Mana Step (Lv10) shares the first-completed-movement trigger with Graceful Step and restores 5% MAX MP.

Underlying spell ownership survives every method. Wizard + secondary Mage modified Blaze attributes ceil(CP/2) to Wizard and floor(CP/2) to Mage; Mage primary keeps all its spell CP. Actual CP amounts remain undefined. Reaction casts do not create a second award. Detached tactical CP remains detached, as in Prompt #5; no unrelated campaign progression reconciliation was invented.

## Dying, death and battle completion

**FINALIZED tactical lifecycle.** The single authoritative transient life field is ALIVE/DYING/DEAD; Dying is not duplicated as an independently curable status-list entry. At 0 HP, counter 3 appears while the tile remains occupied. Dying units cannot act, move, counter, react or generate active ability effects, and ordinary spell/AoE/item/Trade targeting excludes them. Both sides can pass through their tile but cannot finish there.

Own-turn start decrements 3→2→1→0; own-turn end at zero makes the unit Dead, removes its position and removes local roster membership. Raise accepts only Dying, restores half MAX HP using the shared rounding boundary, and never revives Dead. Martyr applies only to the first Dying transition of a unit in this battle, not countdown changes or a second entry after Raise.

Final combat-capable opponent/player reaching 0 records the conclusion immediately and blocks new actions/turns. It does not wait for Dying counters. The existing AnimationPlayer completes the current one-shot animation; then a tactical map frame renders; then Victory/Defeat appears. The deterministic tests and offline input/render sequence verify all three stages. Death Rattle is absent.

No post-battle rule declaring every Dying survivor permanently Dead is invented. Campaign HP/status attrition and detailed survivor recovery remain outside the existing campaign schema.

## Fly

**FINALIZED while-status-active movement.** Flying changes every traversed terrain tile to exactly 1 MOV, overrides impassable terrain traversal and endpoint occupancy, and still obeys map bounds and unit collision. It does not grant passage through living enemies or occupation of an occupied destination.

Only Expand is enabled. Focus, Overcharge and unspecified Extend compatibility reject through metadata. Production range, radius, duration and MP remain null. Applying the status is implemented with supplied values; its unspecified duration clock is not guessed. The controller has an explicit `expireStatus` boundary. Automatic Fly duration scheduling remains deferred pending the duration/clock design.

## Portal

**FINALIZED:** Range 4, Radius 1, exactly two distinct endpoints independently in range; Extend gives Range 5 and preserves Radius 1. Focus/Expand/Overcharge reject. The caster tile is valid in either endpoint order. Empty terrain must be occupiable; an occupied tile is the explicit terrain exception. Placement cannot overlap another caster’s Portal.

Replacement removes only that caster’s old pair after complete validation. Its vacated endpoint may be reused. Different casters retain independent pairs. At cast completion, one occupant transfers or two occupants swap. Forced transfer ignores Dying, Frozen, Stunned and Immobilized movement restrictions and changes position only. It preserves HP, life state, counter, statuses, MOV and action budget.

Voluntary entry requires matching allegiance, a live movable unit, and an empty destination. ENTER PORTAL preserves remaining MOV and Major Action and permits further movement. Owner-turn expiration skips the casting turn, then decrements 3→2→1→0 on three subsequent owner turns. Other units’ turns do not decrement it. No global-round or dead-caster cleanup policy is fabricated.

External friendly smile and enemy angry-face PNGs follow the native 16px/five-color pipeline. Both endpoints flash only for cursor selection or the controlled unit’s active friendly Portal interaction. Arbitrary occupancy does not cause perpetual flashing.

## Save schema and persistent casualties

**Schema 7**, incremented once from 6. No per-unit campaign tactical resource/status fields are added. The existing campaign status domain gains DEAD. Completed tactical results may contain validated, unique `deadUnitIds` belonging to their scenario.

Tactical roster/map removal is immediate. Campaign roster removals are staged until the established simultaneous End Day commit, preserving frozen-world invariants. Independent unit records become DEAD and cannot rejoin a squad; their physical item records remain intact. Later battles in the same resolution omit already recorded Dead casualties. Replay reconstructs those scenarios in result order and validates casualty changes through the ordinary resource/world replay checks.

For abstract route battles, a retained Dead unit uses the existing origin node as its physical campaign fallback; a location battle uses its location. No corpse travel/loot subsystem is invented.

Schema-6 migration preserves existing base stats, growth RNG, learned abilities, loadouts, CP, items, candidates and interrupted queues. A save already past a schema-6 recruit refresh needs `legacyRecruitGrowth: true` on that active resolution: replay uses the old zero Mage growth for the already generated candidates. Their saved stats are unchanged. Future growth/refreshes use the new Mage +1 INT. A test constructs an actual old-growth refresh and restores it under the new rules. Earlier migration paths remain; schemas 1–4 keep the prior restriction on migrating an active resolution.

Transient battle HP/MP, statuses, counters, Portal pairs, positions and animation state are not serialized into campaign saves. The existing campaign mid-resolution save still preserves the pending BattleScenario rather than an in-progress tactical session.

## UI and executable inspection

Open **M → Debug Tools → SPELL / PORTAL LAB**. MAGIC offers family → purchased spell level → compatible casting method → target. Range and effect area are rendered separately; Portal requests two endpoints. Commands allow moving to the cursor, entering Portals, advancing the selected unit’s own turn and explicit test damage. Q selects another unit without silently starting its turn. The screen labels its values as test balance, and the lab never changes campaign state.

Class management displays actual spell Range/Radius/MP/magnitude/element/cures and method multipliers, using TBD where appropriate. Existing purchases, loadouts, CP costs and all earlier bitmap menus remain in the same framebuffer.

## Unresolved values and test-only constants

**No provisional gameplay spell balance was added to production defaults.** `spellConfig.balance` is empty; `rounding`, Prayer chance and counter-spell selection are null. Fractional MP/damage/healing/movement restoration require one supplied rounding policy; there is no hidden floor/ceil convention.

Still TBD: Mage base damage/MP/ranges; Cleric healing magnitudes and spell ranges/radii/MP; Prayer probability; Fly range/radius/MP/duration and expiration clock; Portal MP; normal counter chance/damage; spell hit/resistance/elemental formulas; ordinary initiative/AI; CP award amounts; other previously unresolved systems from Prompt #5. Future statistical buffs can use generic modified magnitudes, but no new buff spell/effect implementation was fabricated.

The **isolated debug lab** deliberately supplies: 100 MAX HP/MP; Range 4 when unspecified; Radius 1 when unspecified; base MP 10; ordinary healing magnitude 20; Mage tier 1/2 magnitude 20, tier 3=40, tier 4=60; stored Fly duration metadata 3 without declaring an automatic production clock; Math.ceil for fractional rule results; and an explicit 100-damage debug command. These values exist only in the fixture/controller. Fixed production spell properties override fixture fallbacks. Laboratory Prayer decisions are explicitly false; no 0% permanent Prayer probability is established.

Presentation-only timings are tunable: Portal flashing changes phase every 600ms; the lab effect animation uses three 180ms frames. These do not determine tactical effect duration or initiative.

## Verification and limitations

- **454/454 rule checks pass**, including the entire 362-case baseline and 92 new spell/class/lifecycle/Portal/migration checks. See `verification/rule-checks.txt`.
- Offline input/render verification passes: all 21 external PNGs and sampled framebuffer output use the five colors without partial alpha; logical size is 320×240 across five resize cases.
- Existing campaign, shops, recruitment, deliveries, queues, class purchases and tactical movement checks pass. New checks exercise the actual bitmap family/level/method/target flow, modified damage/MP, forced/voluntary Portal transfers, both allegiance graphics, pair highlighting, visible Dying counter, and animation→map→banner sequence.
- Representative offline PNGs were inspected visually. See `verification/results.json` and the spell/Portal/victory PNGs.
- Static runtime scan found no new fetch, module import, remote URL or runtime package requirement. Node/Canvas utilities remain optional developer tooling only.
- **Direct browser launch is unverified.** The requested `file://.../index.html` attempt was rejected by the browser URL security policy. No alternate browser, server, raw browser protocol or other workaround was used.

The main architectural mismatch is explicit: the baseline did not have a complete tactical campaign battle loop. This pass implements and verifies the new mechanics in the transaction engine and playable debug lab, with a real casualty result path into campaign commits. It does not pretend to finish tactical map generation, initiative, AI, a normal attack/hit formula, automatic reaction selection or fully authored battle animation art. The campaign’s placeholder End Day battle interface remains available and unchanged in purpose.

Old tests were not deleted or disabled. Only superseded expectations changed: five disciplines to eight, absence of Mage/Cleric/Wizard to their established catalogs, and schema 6 to 7. Earlier reports are historical; this report and current verification files describe Prompt #6.
