# Shining Farce — Prompt #5 implementation report

Implemented 2026-09-15. **362/362 automated checks pass**, including all 266 prior checks and 96 new checks. Offline rendering/input verification passes. The local classic-script runtime, graphics, map and physical inventory architecture are preserved.

Status terminology: **FINALIZED** means the specified rule is implemented in its applicable service. **PROVISIONAL/TUNABLE** means explicitly provisional data is retained. **DEFERRED/TBD** means metadata or a hook exists but the complete tactical behavior/formula does not. A rule hook is not a completed combat ability.

## 1. Files added

- `js/campaign/AbilityCostSystem.js`
- `js/campaign/ClassEntryGrantSystem.js`
- `js/systems/ExecutionReceiptSystem.js`
- `js/systems/AbilityRequirementSystem.js`
- `js/systems/SpellMenuSystem.js`
- `js/systems/TradeSystem.js`
- `js/systems/HiddenItemSystem.js`
- `js/data/equipmentFamilies.js`
- `js/debug/ProgressionConsolidationTests.js`
- `docs/PROMPT5-IMPLEMENTATION.md` (this report)

## 2. Files modified

Loading/data/config: `index.html`, `js/config/campaignConfig.js`, `js/config/classConfig.js`, `js/data/classes.js`, `js/data/abilities.js`.

Campaign services: `js/campaign/CampaignState.js`, `CharacterGrowthSystem.js`, `CharacterValidation.js`, `ClassProgressionSystem.js`, `ClassManagementSystem.js`, `AbilityLearningSystem.js`, `AbilityModifierSystem.js`, `EquipmentEligibility.js`.

Tactical/UI: `js/systems/TurnSystem.js`, `ActionCommandSystem.js`, `AbilityEffectHooks.js`, `ItemSystem.js`, `js/states/BattleState.js`, `js/ui/ClassManagementUI.js`.

Verification/documentation: `js/debug/FoundationTests.js`, `StrategicMovementTests.js`, `ResourceTests.js`, `CharacterStatsTests.js`, `ClassFoundationTests.js`, `tools/verify-rendering.cjs`, `README.md`, `docs/ARCHITECTURE.md`. Refreshed `verification/rule-checks.txt`, `verification/results.json` and offline PNG evidence, including new Archer/Alchemist, priced-ability, Quick Items and Trade screens. No game artwork, map, package or runtime dependency was added.

## 3. Schema and migration

**FINALIZED: schema 6**, one increment from schema 5. Only the class-entry marker extends persistent character state. Schema-5 live units, recruit candidates, frozen resolution units, resource-before candidates, pending battles and recorded battle snapshots receive matching grant markers. Current balances, learned abilities, loadouts, IDs, physical items, queues, results, basePrimary and growth RNG remain intact. Active End Day phases and a paused two-battle queue migrate and continue without restarting the day.

Migration credits no historical grant: known class access is marked processed with zero credit. Restoring schema 6 does not run migration or credit a grant. Current-class access must have a processed marker. Earlier schema 1–4 active-resolution rejection rules remain; those builds must finish their active resolution before migration. Pre-schema-5 completed historical character shapes remain historical rather than being rerolled or made live.

## 4. Exact CP purchase prices

**FINALIZED.** `AbilityCostSystem.cost` is the single lookup used by learning and UI. Price depends on required Class Level:

| Class Level | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Current CP | 100 | 125 | 150 | 175 | 200 | 225 | 250 | 275 | 300 | 350 |

An omitted `costCP` uses the curve; an explicit numeric override is supported. Explicit null remains unresolved and cannot be purchased. All 66 shipped abilities use the default curve. Purchase checks level, learned prerequisites, available Current CP and duplicate learning. It deducts only Current CP; Class Level and Lifetime CP are unchanged. Reaching Class Level never automatically teaches an ability. CP continues accumulating after Class Level 10.

## 5. Exact CP attribution

**FINALIZED attribution; DEFERRED award amounts.** A receipt must have a valid unique execution ID, legal/executed true, and not be cancelled. Success/failure is passed to the replaceable calculator rather than hard-coded as a no-CP filter. The default calculator returns null.

Universal ATTACK/ITEM/EQUIP/TRADE executions credit 100% to current class. A primary Action Ability does likewise. A secondary Action Ability credits ceil(amount/2) to current class and floor(amount/2) to its owning class. Ability ownership is derived from definitions and accessible loadout, overriding supplied owner/source labels. STEAL, MAGIC and SKILLS grouping never changes the owner and cannot be used as a universal-action shortcut. Reaction, Support and Movement influence has no separate CP award.

`BattleState` rejects duplicate receipt IDs and checks equipped-weapon requirements for ability execution receipts. Resolved Steal outcomes create legal executed receipts even on failure. Menus, cancelled selections and unavailable actions do not invent awards. This remains a trusted future-resolver boundary, not a hit/damage/target resolver. Detached battle CP does not automatically merge into campaign results.

## 6. Class-entry Current CP grants

**FINALIZED optional mechanism, no shipped grants.** Static `initialCurrentCPGrant: null` means no grant. Persistent `classProgress[classId].entryGrantCP` is null/unset for unprocessed access or a nonnegative integer recording the amount processed. Zero records consumed access with no grant.

First access occurs through generated current class, class changing, selecting secondary class or earning CP in a new class. Configured grants increase only Current CP. They do not change Lifetime CP, Class Level, Character Level, growth or learned abilities. The processed amount permits validation of Current CP greater than Lifetime CP without introducing a second currency authority. Switching away/back and save/restore cannot repeat the grant. Migration marks current/secondary classes, progress entries and learned-ability owners consumed with no credit. All five playable classes have no initial grant.

## 7. Final class growth

**FINALIZED:** Fighter +1 STR; Knight +1 STR and +1 CON; Thief +1 AGI; Archer +1 DEX; Alchemist +1 WIS per ordinary Character Level growth event. They add to racial growth, using the unchanged deterministic per-character stream. Generated level N receives N−1 events. Class changes preserve past growth. Ordinary growth still never adds MOV or innate DEF.

Archer class MOV is explicitly 0; Thief remains +2. Unspecified class MOV retains the earlier zero runtime fallback, without declaring its final design value. Strength/Constitution/Dexterity Training bonuses remain TBD.

## 8. Archer ability status

Archer is selectable without prerequisites. Equipment selectors allow known non-heavy bows and light armor; Bow Training extends heavy-bow permission. Race restrictions and hand legality still apply. All Action Abilities share the generic BOW/RANGED requirement, including secondary access.

| Level / ability | Implemented | Deferred |
| --- | --- | --- |
| 1 Aimed Shot | Price, learning, Major Action, bow gating | Accuracy amount and attack resolution |
| 3 Power Shot | Price, learning, Major Action, bow gating | Damage/accuracy amounts and resolution |
| 4 Light Armor Training | FINALIZED equipped permission | Existing catalog weight assignments |
| 5 Suppressing Shot | Bow gating; on-hit MOV debuff metadata, expires target turn start | MOV amount, hit/status scheduler |
| 6 Eagle Eye | Equipped bow-accuracy metadata | Accuracy amount/formula |
| 7 Long Shot | Major Action and bow gating | Range extension and accuracy penalty |
| 7 Bow Training | FINALIZED heavy-bow permission | Shipping heavy-bow item statistics |
| 8 Covering Fire | Pure qualifying-trigger and pending-attack continuation hooks | Activation chance, reaction scheduler and damage |
| 9 Piercing Shot | Major Action and bow gating | DEF-ignore amount and damage |
| 9 Dexterity Training | Future growth modifier hook | Bonus amount |
| 10 Firing Position | Concept metadata: move up to 1 tile, +1 range | Exact movement cost/timing and execution |

Covering Fire excludes self-targets, requires another friendly target and a legally targetable enemy within bow range, fires before the triggering attack, has no activation counter/cap, and is neither a counterattack nor double-attack eligible. A resolved attacker-capability result can cancel the pending attack. Chance stays null; no once-per-turn limit was invented. Surefooted is absent. No free Firing Position movement is implemented.

## 9. Alchemist ability status

Alchemist is selectable without prerequisites. **PROVISIONAL/TUNABLE:** light weapons/light armor permissions. Its +1 WIS growth is final; unspecified MOV is still unresolved.

| Level / ability | Implemented | Deferred |
| --- | --- | --- |
| 1 Toss Item | Major Action, consumable source always consumes and bypasses Conservation | Range, targeting and complete item action |
| 2 Purifying Medicine | HP-item qualification; one removable negative status query, injected outcome/selection | Probability and status execution |
| 3 Emergency Medicine | Strictly below 60%, qualifying-damage gate, 100% activation, strongest full modified heal that fits missing HP | Damage-event granularity and automatic reaction execution |
| 4 Forage | Repeatable-tile metadata; use/throw/store sources, storage capacity query | Tables, item production, targets and action cost |
| 4 Conservation | Source exclusions, unresolved-result guard and supplied preservation outcome | Probability/RNG policy |
| 5 Quick Items | FINALIZED equipped Support policy exempts ordinary ITEM from Major Action before/after another action | Full ITEM combat command |
| 6 Light Weapon Training | FINALIZED equipped light-weapon permission | Existing catalog weight assignments |
| 7 Refine | Validates two distinct identical consumables; atomic caller can replace them with one externally defined stronger copy; stale inputs reject | Multiplier, output definitions, action cost and menu |
| 8 Potent Remedies | FINALIZED component query: HP ×2, MP ceil(×1.25), applied before emergency selection | Full healing execution |
| 9 Panacea | Eligible-curative query returns all removable negative statuses; ordinary consumption source | Action cost and status execution |
| 9 Catalyze | Actual-consumption gate; injected tiny-chance outcome and affected-stat selection; +1 basePrimary commit, no level/RNG advance | Duration extension, probability and complete temporary-effect lifecycle |
| 10 Deep Satchel | FINALIZED +1 capacity while equipped; removing it preserves overflow | None for this capacity rule |
| 10 Scrounger | Hidden scenario item data, five-tile detection/query, eight compass directions or on-item result | Distance metric, ties, costs, collection and full-inventory policy |

Conservation may preserve Emergency Medicine. Potent Remedies modifies each candidate before selection; no candidate whose full healing exceeds missing HP is chosen. Toss and immediate Forage use/throw never roll Conservation. A stored Forage item later uses ordinary rules. Preserved buffs never roll Catalyze's permanent gain. Consumption and Refine commits validate stale physical inputs so replay cannot duplicate a permanent gain or mint another refined copy.

`ItemSystem.commit` is deliberately a low-level consumption/permanent-stat mutator. It does not heal HP, remove statuses, extend durations, spend actions or authorize ranged targets. Those effects require a future resolved transaction. Test-only context effects exercise composition without introducing extra Support slots.

## 10. Trade

**FINALIZED transaction rules, DEFERRED successful action cost.** Friendly targets use the existing orthogonal adjacent-cell convention. Only PERSONAL copies enter slot lists; empty slots reflect capacity. Item/item, item/empty and empty/item preserve IDs and change physical owner location without auto-equipping. Empty/empty returns NO_TRANSACTION and preserves the turn, even if a Major Action was already used. Full inventories cannot receive into nonexistent empty slots; swaps preserve counts, including existing overflow.

A non-empty transaction returns UNRESOLVED_TRADE_COST until a future caller supplies a boolean Major Action policy. Tests inject policies; production does not choose one. `BattleState.trade` commits atomically. The bitmap debug inventory preview shows both inventories and empty slots, clearly states preview/no transfer and unresolved cost, and does not claim campaign co-location is tactical adjacency.

## 11. MAGIC and command ownership

**FINALIZED generic grouping.** One MAGIC top-level category aggregates accessible learned actions from primary and secondary classes. Each entry retains ability ID, owning class, source, level, category, Major Action cost and availability. SKILLS and STEAL keep the same ownership contract. Ordinary commands remain separate from Action Abilities.

No new Mage, Cleric or Wizard discipline/table ships. Existing legacy mage compatibility remains unchanged. MAGIC aggregation is proven with temporary test fixtures rather than invented playable spells.

## 12. Spell families and levels

**FINALIZED structural foundation.** `spellFamily`, `spellFamilyName`, `spellLevel` and optional `prerequisiteAbilityIds` support family grouping and prerequisite learning. Groups contain only already learned and accessible levels; entries keep distinct owning ability IDs. Tests cover two levels of one family plus a second class/family.

An optional casting-options provider receives the selected spell. Without modifiers there is no method submenu. With modifiers it exposes NORMAL and unique methods; selection accepts one modifier ID. No Wizard arithmetic, costs or duplicated spell entries are fabricated. The full spell-selection/casting UI remains deferred.

## 13. Weapon requirements

**FINALIZED shared selectors.** Slots, families, weights, kinds, tags and optional exact metadata are supported. Both menu availability and the battle receipt boundary check the actual equipped definitions and their legality. Secondary Action does not grant equipment permission. Backstab uses SHORT and STABBING metadata rather than item names. Existing sword/spear/mace/hammer and shield requirements are routed through the same mechanism.

## 14. Wands and Robes

**FINALIZED vocabulary/selector foundation only.** WAND is a weapon family; ROBE is an armor family, with `weaponFamily`/`armorFamily` (or generic equipmentFamily) matching. No Wand damage/basic-attack formula, item prices, weights, ranges, MP costs or fabricated equipment entries were added. Existing shop equipment remains compatible with its earlier definitions.

## 15. Executable behavior versus hooks

Executable now: campaign class/loadout changes, normal CP purchases, optional once-only grants, deterministic growth, equipment permission/requirement queries, equipped capacity/Quick Items policy, receipt attribution and deduplication, detached Trade under supplied policy, and pure item/reaction/spell/hidden-item queries. Low-level item commits execute physical consumption/refinement or an explicitly resolved permanent gain.

Still deferred: complete combat, reaction timing/targeting, HP/status application, item-action menus, spell casting, Forage production, Scrounger collection, actual Archer attacks, AI and merging these detached tactical changes into campaign BattleResults. Placeholder battle resolution remains the existing development boundary. No claim is made that metadata alone completes an ability.

## 16. Unresolved and provisional values

**PROVISIONAL/TUNABLE retained:** CP-to-Class-Level thresholds; HP/MP derivation coefficients/racial offsets; legacy equipment STR/DEF modifiers and economy values; Alchemist equipment permissions; inherited neutral fallbacks for unspecified class growth/MOV.

**DEFERRED/TBD:** actual per-action CP amounts and success/failure award policy; XP awards/thresholds; full physical/magic/healing, hit, dodge, status/debuff resistance and turn-order formulas; counter chance; double-attack AGI formula (90% cap remains final); Steal probability; Flurry modifier; class Growth Training bonuses; unspecified class MOV; old item weights and weapon ATK. Fighter/Knight/Thief unresolved effect fields are retained, not filled with new estimates.

New unresolved values: Archer attack accuracy/damage, Long Shot extension/penalty, Suppressing Shot MOV reduction, Piercing Shot DEF-ignore fraction, Eagle Eye bonus, Covering Fire chance, Firing Position timing/cost; Toss range; Purifying Medicine/Conservation/Catalyze probabilities; emergency damage-event granularity; Forage tables and action cost; Refine multiplier/output design/action cost; Panacea action cost; Catalyze duration extension; Scrounger metric/tie/action/MOV/full-inventory/collection behavior; successful Trade Major Action cost; future spell MP/damage/healing/range/AoE and Wand/Wizard calculations.

Forage, Refine and Panacea use null action costs because this prompt does not finalize them. Test outcome providers and test-only equipment/spells are not production balance defaults. The null-field inventory below records the exact static ability fields left unresolved.

## 17. Tests added

96 new checks cover all ten prices, overrides and purchases, universal/primary/secondary ownership, failed/cancelled receipts, both requested cross-class examples, entry grants and save/migration protection, all five additive growth profiles, no retroactive growth, Archer equipment and trigger rules, Quick Items combinations, consumption exceptions, emergency selection, Potent rounding, Catalyze gating and stale replay, purification/Panacea queries, Refine validation, safe overflow, all Trade slot cases, atomicity, hidden-item unresolved policies, spell families/prerequisites/ownership/method selection and WAND/ROBE selectors.

Migration tests cover schema-5 live phases, two pending/resolved battles, complete history and earlier-schema completed records. Original 266 checks remain; only superseded expectations were updated.

## 18. Total automated result

**362/362 pass.** `node tools/test-foundation.cjs` and the in-game Debug Tools → Run Rule Checks use the same harness. Full output: `verification/rule-checks.txt`. No additional runtime packages were introduced.

## 19. Offline rendering/input verification

**PASS.** `tools/verify-rendering.cjs` used an already available external Canvas2D package. All 19 PNG assets and sampled framebuffer renders use the five authorized colors with no partial alpha. Logical resolution remains 320×240 over five resize cases. Existing strategic, resource, recruit, growth, delivery, End Day, sequential-battle and tactical movement/collision inputs pass.

New input checks cover normal priced purchases, Archer/Alchemist lists and detail pagination, required-bow unavailability, Quick Items before/after Attack, and Trade inventory preview. Representative PNGs were visually inspected. `verification/results.json` records the full result; images are offline renders, not browser screenshots.

Direct `file://` browser launch remains unverified: browser automation previously rejected local-file navigation under its URL policy. That restriction was not retried or bypassed. Classic local-file loading is preserved; this pass does not claim to have launched the browser.

## 20. Changed expectations and regressions

No failing regression remains. Explicitly superseded assertions: three playable disciplines become five; null purchase prices become the final curve; null class growth becomes finalized bonuses; new records include processed current-class access; schema expectation becomes 6; CP no longer requires hard-coded successful/meaningful flags; Trade appears in command lists. The earlier unresolved-price guard is retained using an explicit-null fixture. Price-override fixtures now remove temporary properties when restoring data, avoiding cross-test contamination.

The existing catalog has no bow entries and does not define equipment weight tiers, so new class permissions do not invent compatible gear. Archer requirements consequently show unavailable without configured eligible equipment. Tests supply temporary legal bows and weights. This is an intentional data limitation, not a claim of complete Archer combat gameplay.

## 21. Design questions and choices

No additional designer answer was needed to complete the requested foundation. All listed TBD values remain open. Trade adjacency follows the existing orthogonal tactical convention; diagonal adjacency can be changed at the shared target query if desired. Archer's base bow permission accepts known light/medium bows and reserves heavy bows for Bow Training, matching the requested heavy-bow distinction. Unknown weights do not silently bypass that distinction.

Emergency Medicine uses stable item ID only to choose between copies with identical full healing; it does not alter strength or the threshold. Scrounger ties, by contrast, explicitly remain unresolved as requested. Current CP entry grants are processed on actual class access, not merely by browsing a class menu. Refine's executable sample contract is limited to defined restoration components with an externally supplied stronger output; other scalable effects await their definitions.

Covering Fire’s null activation limit means **FINALIZED: no cap**, rather than an unknown cap.

### Static ability null-field inventory

| Ability | Fields intentionally null |
| --- | --- |
| POWER ATTACK | `effect.damageMultiplier`, `effect.accuracyModifier` |
| COUNTER | `effect.modifier` |
| FEINT | `effect.accuracyModifier` |
| FOLLOW THROUGH | `majorAction` |
| EVASIVE STANCE | `effect.dodgeBonus` |
| PSYCHE UP | `effect.physicalAttackModifier`, `majorAction` |
| STRENGTH TRAINING | `effect.bonus` |
| CLEAVE | `effect.secondaryDamageMultiplier` |
| SHIELD BASH | `effect.damageMultiplier` |
| GUARD | `effect.reduction` |
| CONSTITUTION TRAINING | `effect.bonus` |
| STEAL ITEM | `effect.successFormula` |
| STEAL ACCESSORY | `effect.successFormula` |
| STEAL OFF-HAND | `effect.successFormula` |
| STEAL WEAPON | `effect.successFormula` |
| STEAL ARMOR | `effect.successFormula` |
| SLIP AWAY | `effect.chance` |
| SKIRMISHER | `effect.defBonus` |
| FLURRY | `effect.modifier` |
| ESCAPE ARTIST | `effect.modifier` |
| AIMED SHOT | `effect.accuracyModifier` |
| POWER SHOT | `effect.damageModifier`, `effect.accuracyModifier` |
| SUPPRESSING SHOT | `effect.movReduction` |
| EAGLE EYE | `effect.bonus` |
| LONG SHOT | `effect.rangeExtension`, `effect.accuracyPenalty` |
| COVERING FIRE | `effect.chance`, `effect.activationLimit` |
| PIERCING SHOT | `effect.ignoreDefenseFraction` |
| DEXTERITY TRAINING | `effect.bonus` |
| FIRING POSITION | `effect.timing`, `effect.movCost` |
| TOSS ITEM | `effect.range` |
| PURIFYING MEDICINE | `effect.chance` |
| EMERGENCY MEDICINE | `effect.eventGranularity` |
| FORAGE | `effect.table`, `majorAction` |
| CONSERVATION | `effect.chance` |
| REFINE | `effect.multiplier`, `majorAction` |
| PANACEA | `majorAction` |
| CATALYZE | `effect.durationExtension`, `effect.chance` |
| SCROUNGER | `effect.distanceMetric`, `effect.tiePolicy`, `effect.majorAction`, `effect.movCost`, `effect.fullInventoryPolicy` |
