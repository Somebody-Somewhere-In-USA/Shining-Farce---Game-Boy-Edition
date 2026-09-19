# Prompt #4 implementation report

Implemented class, ability, CP, equipment-permission and tactical-action foundations. The pre-change baseline was **195/195**. The completed suite passes **266/266**: all 195 previous checks retained, plus 71 new checks. Four old expectations changed only for schema 5 or the superseded CP structure.

## 1. Files added

- `js/config/classConfig.js`
- `js/data/classes.js`, `js/data/abilities.js`
- `js/campaign/ClassProgressionSystem.js`, `AbilityLearningSystem.js`, `AbilityLoadoutSystem.js`, `AbilityModifierSystem.js`, `ClassManagementSystem.js`, `ClassMigration.js`
- `js/systems/ActionCommandSystem.js`, `TacticalEquipmentSystem.js`, `StealSystem.js`, `DoubleAttackSystem.js`, `TacticalMovementRules.js`, `AbilityEffectHooks.js`
- `js/ui/ClassManagementUI.js`
- `js/debug/ClassFoundationTests.js`
- This report and additional offline renders in `verification/`.

## 2. Files modified

`index.html` adds classic scripts in dependency order. Configuration/data changes affect `campaignConfig.js` and `campaignResources.js`. Campaign changes affect `Campaign.js`, `CampaignState.js`, `CharacterGrowthSystem.js`, `CharacterValidation.js`, `CharacterStatsSystem.js`, `ClassGrowthProvider.js`, `EquipmentEligibility.js`, `InventorySystem.js`, `ResourceSystem.js` and `TravelerSystem.js`.

The previously empty `TurnSystem.js`, `BattleState.js` and `CommandMenu.js` now expose rule/session/menu interfaces; `MovementSystem.js` gains a tactical path adapter while preserving its original exploration behavior. `CampaignResourceUI.js` links character management and the fourth equipment slot. Existing test integration/expectations, `tools/verify-rendering.cjs`, `README.md`, and `docs/ARCHITECTURE.md` are updated. The prior report is marked historical. No art, map, camera, animation or cut-in assets changed.

## 3. Save schema and migration

Schema **5** adds permanent `learnedAbilityIds` and `abilityLoadout` to units and recruit candidates. Primary Action is derived from `currentClassId`; the stored loadout contains only:

```js
abilityLoadout: {
  secondaryClassId: null,
  reactionId: null,
  supportId: null,
  movementId: null
}
classProgress: {
  fighter: { lifetimeCP: 333, currentCP: 333, classLevel: 3 }
}
```

Schema-4 PLANNING migration preserves existing character/race/growth/location/faction/gear/resource records. Old `cp` becomes both Lifetime and Current CP. Because schema 4 allowed independent `classLevel`, migration conservatively uses the greater of old CP and the new threshold required to preserve the old level. Example: old `{cp:91,classLevel:7}` becomes `{lifetimeCP:1350,currentCP:1350,classLevel:7}`. This can credit CP, deliberately avoiding loss of previously represented mastery. Old levels above the finalized maximum are capped at Class Level 10; earned CP above its threshold is retained. Missing ability/loadout fields receive empty defaults. Existing legacy class IDs remain valid history.

Schema-1/2/3 planning migrations continue through the existing conversion path to schema 5. Active legacy resolutions must complete in the earlier build; they are rejected without resetting battle queues. Current schema-5 records restore through every resolution phase. Historical completed resolution records remain historical. There is no save/load UI.

## 4. Class and progression architecture

Fighter, Knight and Thief are the three concrete playable discipline definitions. Knight requires **that character's Fighter Class Level 3**, following the user's clarification. The generic prerequisite evaluator supports multiple classes; Paladin's Knight 5 + Cleric 5 requirement is represented only as prerequisite example data. No Paladin or Cleric class is fabricated.

Ordinary class changes work through character management anywhere during PLANNING, instantly and without spending a day. Unlocking never automatically changes class. Recruits can already belong to classes they cannot train into. The old swordsman/healer/mage/centaur/starter IDs remain explicitly labeled compatibility disciplines so existing units, recruitment and equipment retain their behavior; they are not new complete class designs.

The configured provisional thresholds are **0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700**, for Class Levels 1–10. Lifetime CP determines the validated cached Class Level. Earning adds to both balances; spending only changes Current CP. Both balances can grow after level 10. Neither Class Level nor CP controls Character Level.

Only a successful, meaningful, available Action Ability is attributed CP. Primary actions give 100% to current class; secondary actions split evenly with an odd extra point to current class. Reaction/Support/Movement influences receive no attribution. No battle-completion CP exists. `CPAwardCalculator.calculate(execution, unit)` returns `null` until the award formula is designed. Rule tests inject explicit amounts; they do not become gameplay formulas.

Fixed class growth remains `null` for the new classes because no authoritative numbers existed. The previous zero-growth compatibility fallback is retained centrally and labeled unresolved. Thief MOV is +2; Fighter/Knight MOV adjustments remain unresolved with the existing neutral zero runtime fallback. Ordinary advancement and generated recruits still share the same N−1 growth engine. Equipped growth Support effects can add future primary growth through a generic modifier hook; their unknown bonuses remain `null`. No past growth is recalculated or logged per level.

## 5. Ability and loadout architecture

The registry contains **42 abilities: 14 each for Fighter, Knight and Thief**, including multiple unlocks at the same level/category. Each has owner class, category, required Class Level, stable ID, description, purchase cost, structured effect metadata and implementation status. All purchase costs remain explicitly `null`: the learning service refuses purchase with `PURCHASE COST UNRESOLVED`. A missing price cannot silently mean free.

Purchases spend only the owning class's Current CP and remain learned across class changes. Primary follows current class automatically. Secondary selects one other class and exposes only learned eligible Action Abilities. Reaction, Support and Movement each hold one learned ability of the correct category. Selecting a class as Secondary grants no abilities.

Character management exposes progression, prerequisites, purchases, learned abilities, all five conceptual slots, effective equipment permissions, capacity, and MOV sources. Debug mode adds explicit **Grant CP to Lv 10**, **Debug Grant / No Purchase**, and tactical rule inspection. These are labeled development operations; they are not ordinary purchases or award formulas.

## 6. Equipment permissions and inventory

The four slots are main weapon (`weapon`, preserving existing IDs), `offHand`, armor, and accessory. Physical item instances remain the authority; no equipment becomes an abstract count. Equipped items consume no carried capacity. PERSONAL now means any carried unequipped ordinary item, including weapons/armor.

The common eligibility service composes race prohibitions, current-class permission selectors, optional item race restrictions, and equipped Support grants. Selectors keep family, melee/ranged/shield kind, and weight separate. Fighter supports medium melee/armor; Knight medium/heavy melee/armor and shields; Thief light weapons/armor, including light bows. Absolute Beastman weapon/armor prohibitions survive all class/Support grants.

Two-Handed blocks every off-hand item. Its calculator doubles `itemDefinition.weaponAttack` only, exposing a separate derived `weaponAttack` value. It never doubles accumulated STR, effective STR, or the legacy total ATK alias. Naturally two-handed weapon metadata also blocks off-hand equipment.

The old catalog did not specify weight tiers or weapon ATK. Those values remain `null`; original class-list permissions preserve legacy equipment behavior. The new classes cannot infer a tier for old weapons/armor. Designers must fill those fields before those items qualify through the new tier permissions. Existing weapon STR modifiers remain provisional and are not reinterpreted as weapon ATK. Test-only resolved item definitions verify weight, off-hand and Two-Handed behavior without shipping invented gear balance.

Changing class/Support safely moves newly illegal equipped gear into the unit's carried inventory, retaining the same item/owner. Newly illegal pending deliveries are released at their actual physical location. Re-equipping carried gear in campaign management can use Current Items / Remove to store it locally, then the normal equipment choice. Tactical Equip uses carried gear directly.

Deep Pockets gives capacity +1 through a modifier. Removing it retains all over-capacity items; further carried acquisition is blocked until space exists. Disarm can also create safe overflow. Supply delivery checks current capacity and eligibility and leaves undeliverable gear at its actual arrival location. No item is destroyed to solve a capacity change.

## 7. Major Action, Skills and Equip foundations

`TurnSystem` tracks Major Action availability independently from remaining MOV, tiles traversed, turn end, attacked state, and once-per-turn commands. Attack/Magic/Steal/Item/Equip normally consume the single Major Action. Consuming one does not end the turn or erase movement. `itemOutsideMajor` is a policy hook for future Alchemist behavior, not an Alchemist implementation. Equip retains its one-item-per-turn limit.

`ActionCommandSystem` and the existing `CommandMenu` expose Attack → Skills → Magic → Steal → Item → Equip → contextual commands → End Turn, omitting empty ability categories. Each ability entry preserves its owning class. Skills coexist with Attack. Action category does not automatically imply Major Action cost: Protect and Hold the Line explicitly leave it available; unresolved costs for Follow Through/Psyche Up are `null`, not invented rules.

`TacticalEquipmentSystem.change()` equips or unequips one selected carried item and spends the Major Action. Replaced gear stays carried, including overflow. It cannot perform multiple swaps with one command.

`BattleState` now provides a detached rule session built from BattleScenario snapshots, with atomic Equip, resolved Steal, and action-CP receipt handling. Duplicate CP receipt IDs are rejected. It neither mutates the campaign snapshot nor implements a complete combat renderer/resolver. Campaign's existing placeholder battle result flow remains unchanged; this pass does not invent tactical-result merging or battle damage formulas.

## 8. Steal and Disarm status

All five Steal categories are implemented in the eligibility/result rule service: carried item, equipped accessory, off-hand, main weapon, armor. Steal deals zero damage, cannot double, requires a valid enemy item/category, and consumes the Major Action. Item/story and targeting legality have callbacks for future tactical rules.

Without Disarm, full carried inventory disables Steal. With Disarm, a successful equipment theft that cannot be carried instead becomes PERSONAL on the victim, retaining ownership even when the victim is full. The victim can later re-equip it with its own Equip Major Action. With available room, the same item ID transfers to the thief. A failed attempt changes no item. A full-inventory Disarm attempt against an already carried item results in **NO_TRANSFER**: there is no equipped item to disarm, and this result earns no meaningful-action CP.

The success formula is unresolved. `StealSystem.probability(context, calculator)` accepts a future calculator; Fast Hands multiplies its result by two. Only the mathematical [0,1] probability range is enforced; no additional gameplay chance cap is invented. `resolveOutcome()` accepts an externally resolved success result for future battle integration and deterministic rule tests. There is no player button pretending to roll an undefined Steal formula.

## 9. Double-attack status

The centralized probability hook accepts attacker/defender context and future calculators. Missing AGI formula returns `UNRESOLVED_FORMULA`; equipped Flurry without a designed modifier returns `UNRESOLVED_MODIFIER`. Any final calculated value is clamped to **90%** after modifiers. Normal Attack, counterattack, reaction attack, second attack, Skills and Steal remain distinct. Only explicitly eligible actions qualify; Steal is always excluded. No AGI formula, Flurry percentage or counterattack system is fabricated.

## 10. Functional abilities and established rule handlers

Fully integrated with existing character/inventory/stat services, once explicitly learned:

- Medium Weapon Training, Medium Armor Training, Heavy Weapon Training, Heavy Armor Training, Equip Shields: permission grants, subject to race and hand legality.
- Move +1: effective MOV +1.
- Deep Pockets: carried capacity +1 with safe removal.
- Two-Handed: off-hand prohibition and weapon-only ATK multiplier when a weapon has a resolved ATK field.

Established behavior implemented as testable tactical rule hooks, awaiting full tactical execution integration:

- Five Steal actions, Disarm and Fast Hands: eligibility, explicit resolved outcomes and chance modifier.
- Fleet-Footed: non-overlapping consecutive perpendicular orthogonal step pairs cost 1 MOV total. Every component still checks existing terrain and occupancy. Straight paths get no bonus. The `MovementSystem.tryTacticalPath()` adapter reuses existing terrain legality, permits allied intermediate cells, and rejects occupied endpoints/enemy passage. The exploration demo remains unchanged.
- Indomitable: exact ceil(10% MAX HP) activation and per-source ceil(50% MAX HP) block threshold.
- Steadfast: enemy displacement immunity; friendly movement and non-enemy causes remain allowed.
- Battlefield Awareness: immunity query for friendly offensive area magic only.
- Chivalry: dynamic friendly adjacent/diagonal DEF contribution; no final rounding rule is invented.
- Backstab: exact aligned adjacent-opposite ally multiplier query, with normal-damage fallback.

These hooks are not claims that a full tactical battle engine now executes those abilities.

## 11. Represented and intentionally deferred

Power Attack, Counter, Feint, Follow Through, Evasive Stance, Psyche Up, Strength Training, Cleave, Thrust, Spear Technique, Shield Bash, Guard, Protect, Cover, Crushing Blow, Constitution Training, Hold the Line, Slip Away, Skirmisher, Flurry, Backstab combat execution, and Escape Artist retain their specified metadata and explicit execution hooks/status. Missing modifiers stay `null`.

Metadata preserves Feint's 80%, Thrust's 80% damage/80% DEF ignore, spear normal/80% line targets, Shield Bash's 75% Stun, Cover's 50%, and Crushing Blow's **two separate ordered operations**. “Spear Technique” is the display name; “Skewer” appears only as provisional-name metadata. Protect is a position swap, not interception. Hold the Line remains anchored and expires on any source movement. Slip Away preserves player decline and AI decision hooks. Skirmisher counts actual traversed tiles, with a turn-end/start timing hook but no invented DEF bonus. Escape Artist has no fabricated survival system.

Purchase costs, CP action awards, class growth numbers, unknown modifiers, complete combat/AI, flight/terrain expansion, class compatibility matrix and the listed future classes remain unresolved.

## 12. Automated checks added

71 new checks cover all requested CP/progression/loadout/equipment/Major Action/Steal/double-attack/movement/migration cases. Additional checks cover unresolved prices, growth-only future effects, metadata fidelity, overflow preservation, deterministic detached battle receipts, atomic failure and duplicate CP rejection. Resolved costs/weapon stats/formulas used by tests are injected test fixtures and restored afterward.

The previous 195 checks remain present. Three migration version assertions now expect 5; one independent-class-progress fixture uses the new Lifetime/Current CP shape. No unrelated existing check was removed.

## 13. Verification results

**266/266 automated checks pass.** Offline keyboard/render QA passes the previous campaign, logistics, battle pause/resume and tactical movement flows plus class requirements, class changing, debug CP, unknown-cost purchasing prevention, explicit debug learning, Secondary/Movement loadouts, equipment permissions and Major Action inspection.

All 19 external PNGs and sampled framebuffer renders use only the five authorized greens, with no partial-alpha pixels. 320×240 output, native 16×16 strategic art and all five integer-resize cases pass. The class list, prerequisite screen, ability details, loadout, permissions and tactical command page were visually inspected. Evidence is in `verification/results.json`, `rule-checks.txt`, and the new class/ability/loadout/turn PNGs.

These are offline Canvas2D renders, not browser screenshots. Direct `file://` browser launch remains unverified under the earlier tool URL-policy restriction, which was not retried or bypassed. The runtime still uses classic local scripts, external PNGs, and no player-facing build/server/npm requirement.

## 14. Limitations and design questions

- The user confirmed character-specific class prerequisites. No global mastery unlock was assumed.
- Ability prices and new class growth remain unresolved. Debug grants provide inspection without disguising missing prices as zero.
- Existing item weight tiers, weapon ATK, new shield catalog entries and weapon ranges need authoritative data. New classes' tier permissions deliberately cannot guess those values.
- Follow Through/Psyche Up Major Action cost, Steal spatial range/chance, Flurry, and other listed modifiers need design. Data and callbacks expose those gaps.
- Chivalry's exact fractional contribution is returned without inventing rounding. A future combat stat/effect adapter must settle fractional DEF handling.
- Post-battle CP/item result reconciliation, full tactical input/AI/combat execution, interactive reactions, anchored blockers and post-defeat survival remain future integrations. The new rule session is detached and inspectable; the existing campaign resolver remains authoritative.
- Class/loadout changes preserve incompatible gear as carried items and cancel newly illegal assignments at their current physical location. Overflow is intentionally valid, with acquisition limits enforced by commands.
