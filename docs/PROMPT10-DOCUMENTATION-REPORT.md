# Shining Farce — Prompt #10 documentation report

Drafted 2026-09-19; final document and file-integrity validation completed 2026-09-23. Documentation/design-authority consolidation only. The canonical specification is prepared for human review and acceptance; this report does not assert that the designer has already accepted it.

## A. Files created

- [CANONICAL-DESIGN-SPECIFICATION.md](../CANONICAL-DESIGN-SPECIFICATION.md): project-wide current design, provenance references, ability catalog, deferred questions and implementation mismatches.
- [PROMPT10-DOCUMENTATION-REPORT.md](PROMPT10-DOCUMENTATION-REPORT.md): this report and source-coverage audit.

## B. Files modified

- [README.md](../README.md): added authority and future-development guidance above the existing implementation description.
- [ARCHITECTURE.md](ARCHITECTURE.md): added authority and development-use guidance, qualifying the older implementation paragraphs.

**Handoff finding:** no clearly current document corresponding to “Codex Development Handoff” exists. The actual named handoffs are the 2026-09-15 and 2026-09-16 DOCX documents, the Markdown After Prompt5 handoff, the After Prompt7 DOCX and the separate Art Asset Generator handoff. The latest general named handoff is [Shining_Farce_Handoff_After_Prompt7.docx](Shining_Farce_Handoff_After_Prompt7.docx), a historical snapshot that predates #8/#8A/#9 adjudications. README and ARCHITECTURE contain the maintained development guidance through #8A. Following the user's clarification, authority instructions were added to those actual documents; no invented `CODEX-DEVELOPMENT-HANDOFF.md` was created, and historical handoffs were not rewritten.

The Recovery Ledger, existing implementation reports, Office artifacts and runtime files remain unchanged. Temporary assembly/audit scripts and protected-file hashes were kept outside the repository.

## C. Canonical-spec summary

The specification has **32 main sections**, covering authority/methodology/terminology; runtime/visuals/input; campaign/factions/quests/AI; locations/travel/economy/logistics; Battle Maps/terrain/Flying/Portal/deployment; races/stats/progression/classes/equipment; CT/actions/targeting/physical combat/magic/healing/AoE/reactions/life states; the ability catalog/items/recovery/MC; editors/saves; TBDs/mismatches/provenance.

- **125 ability entries:** the 119 ledger registry entries plus five recovered Mage abilities and Thief Evade. The count does not imply 125 implemented abilities. It includes the existing 36 spells; those are not another 36 unique abilities. Future reservations are described separately without invented tables.
- **73 explicit TBD/deferred register entries:** all 68 original IDs retained with their current unresolved scope, plus five grouped new interaction/architecture questions. Settled portions are removed rather than left contradicting the main text. There are **zero active NEEDS RECOVERY** entries.
- **33 known implementation mismatch/gap entries:** complete list in section F and canonical §31. Missing established integration is distinguished from undesigned numerical content.
- **Provisional rules retained:** racial starting/growth ranges, racial MOV and HP/MP offsets; MAX HP/MP coefficients; Lifetime CP threshold curve; tunable Mage 100 Current-only entry grant; Alchemist light equipment. Mage MOV 0 retains its qualified working-value provenance. Future class growth proposals and Fairy-only Enchanter are explicitly concepts/tentative, while the eight current fixed class growths remain established. The implemented ability-price curve, Character Level 100 support, demo economics and fixture numbers are not silently promoted to final balance.

## D. Source reconciliation

Reviewed the current [Recovery Ledger](SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md) in full **before writing** the specification: all 38 sections, 196 topic records, 119 ability rows, 13 documentary ability records, 36 spell rows, 10 item rows, 68 TBDs, 44 supersession records, 10 adjudications, 15 closed recovery records, 20 implementation-only findings and 55 candidate-index entries. Overlapping inventories are not independent mechanics.

Read the full After Prompt7 handoff through its extracted paragraphs; freshly checked that extraction against the repository DOCX. Used README, relevant ARCHITECTURE passages, Prompt #8A's deployment/Ocean implementation report, Prompt #9B's recovery report and ledger source references for current development state. Earlier handoffs, v1–v5 class workbooks and reports are corroborating sources **through their reconciled ledger records**; this task does not claim a fresh full read of every historical artifact. Source disputes already adjudicated by #9A/#9B were not reopened. In particular v4_with_Mage and v4 are the same recovery artifact by designer confirmation.

Read Prompt #10 in full and applied the designer's subsequent explicit clarification: **damage prevention/immunity may yield 0 despite the ordinary successful-physical-hit minimum of 1**. This resolves the potential Indomitable conflict without changing its threshold ceilings. No unanswered documentary conflict remains from that question.

Inspected relevant current code rather than relying on ledger/code agreement: CombatSystem, BattleController, BattleActionSystem, BattleStatusSystem, BattleState, BattleMapState, TargetingSystem, MagicSystem, DoubleAttackSystem, TacticalMovementRules, BattleTerrainSystem, FlyingSystem, AbilityEffectHooks, AbilityRequirementSystem, ExperienceSystem, ClassProgressionSystem, class/spell/race/equipment data and AWOL/casualty/reconciliation boundaries. The files named in section F are concrete evidence for the differences; implementation metadata does not confer design authority.

**Newly established from earlier TBDs:** physical STR/DEX formulas and minimum/pipeline, critical chance/damage, base physical counter chance and ordinary physical resolution, ratio-based stat pairings, INT + Spell Power, WIS + Spell Healing Power, no spell crit/natural Double Attack, general target permissions/off-map centers, Terrain Defense architecture, independent reaction checks/recursion/timing, and 1 XP + 1 CP action baseline. Their unresolved curves, values, composition and eligibility edges remain visible.

**Superseded or narrowed rather than silently downgraded:** the former 90% Double Attack maximum is explicitly superseded by a hard maximum whose value is now TBD. Old Spell-Counter-first suppression, narrow recursion prevention, counter interleaving/AoE triggers, friendly-only spell filters and all-Dying passage are replaced by the new explicit rules. Broader CP purchase balance was already non-final after #9A; #10 does not resurrect its old final label. No additional established numeric rule was discarded as unsupported.

**Geometry reconciliation:** After Prompt7 and ledger R12-03 explicitly define catalog Radius 1/2/3/4 as 1/5/13/25 tiles. Prompt #10 establishes Manhattan-radius architecture without a replacement numeric tier convention. Canonical §21 therefore distinguishes geometric radius r from catalog R, with r=R−1, preserving the established tile counts and method behavior. No extra area was invented.

**Timing reconciliation:** existing local defensive/prevention effects (Prayer, Guard, Siphon, Seething) operate where needed to resolve the current primary target; generated retaliation waits for the complete primary sequence. Covering Fire retains its explicit pre-attack timing under the specific-mechanic exception. Immediate battle conclusion still stops subsequent mechanics. Remaining combinations, such as Spell Counter arbitration across both Double Attack passes, min-range modifiers and percentage-method composition with stat-plus-power formulas, are explicit TBDs rather than fabricated answers.

The authority model applies upon review/acceptance: canonical spec = design intent; Git = implemented behavior; ledger = provenance/history; actual development documentation = implementation guidance; implementation reports = task history. Future accepted decisions amend the canonical specification.

## E. New combat-design verification

Each Prompt #10 combat subsection is accounted for below. Verification means documentary cross-check, not newly passing gameplay implementation.

| Prompt rule | Canonical sections | Confirmed representation |
| --- | --- | --- |
| 6.1 Physical damage | §18 | STR/DEX + Weapon ATK − DEF; modifiers → Terrain Defense → global rounding → final minimum 1; dodge/miss 0; designer-approved explicit prevention/immunity 0 exception. |
| 6.2 Rounding | §19, 30 | One eventual global convention, exact choice TBD; explicit CP/Indomitable/Potent Remedies exceptions retained. |
| 6.3 Physical dodge | §18 | Defender AGI versus melee STR/ranged DEX; ratio, neutral equality, diminishing returns, hard maximum; no Accuracy stat; exact probabilities TBD. |
| 6.4 Critical | §18 | 5% chance after connection, +25% damage, no assumed stat modifier, no spell critical. |
| 6.5 Counter Attack | §22 | 1/16; AGI does not alter baseline; hostility/range/survival/capability; normal physical processing, free budgets, single/no Double. |
| 6.6 Double Attack | §18, 22 | Same target/full pattern twice, independent attack resolution; AGI/AGI ratio curve/max TBD; two physical-counter opportunities, at most one per defender delayed after both; 31/256 base chance. |
| 6.7 Weapon range | §17 | Weapon min/max, Manhattan, own 0/orthogonal 1; no ordinary LOS or gameplay elevation. |
| 6.8 Friendly/self/empty physical | §17 | General permission within explicit constraints; truly empty single target consumes action, affects none, no dodge/crit/double/counter. |
| 6.9 Minimum Safe Range | §17 | Separate selectable-risk property; below Minimum Range unselectable; bazooka example only, no universal spell property. |
| 6.10 Beam architecture | §18 | Eight directions, nonstraight single-target example, terminates selected tile, all allegiances, nearest-first, independent defenses, distance/penetration distinction, delayed hostile retaliation, Dying ignored. |
| 6.11 Terrain Defense | §18 | Physical percentage reduction after modifiers; magic bypass; actual values TBD, illustrative terrain percentages not canon. |
| 6.12 Magic damage | §19 | INT + Spell Power; no DEF/Terrain Defense/critical, full independent AoE, no assumed superior single-target damage. |
| 6.13 Spell accuracy | §19 | ST offensive INT vs AGI, ratio/diminishing/hard cap TBD; no AoE dodge/accuracy. |
| 6.14 Spell centers | §17, 21 | Min/max Manhattan center range, occupied/empty/impassable/Ocean/off-map allowed; mathematical coordinate extension; in-bounds effects only; area may reach inside min range. |
| 6.15 AoE shapes | §21 | Manhattan diamond; retained one-based catalog convention; specific overrides allowed, Chain Lightning undesigned. |
| 6.16 Allegiance | §17, 19–20 | No universal restrictive allegiance filter; friendly damage, hostile healing, self/empty allowed with explicit mechanic/life constraints. |
| 6.17 Healing | §20 | WIS + healing power, no accuracy, full AoE, clamp/lost excess, no ordinary Dying heal, Raise 1 50% with global rounding; no new Raise 2 design. |
| 6.18 Mute | §19, 22 | All casting methods blocked unless explicit exception; Spell Counter unavailable before roll; physical counter still possible. |
| 6.19 Spell Counter | §22 | 20%; ordinary Attack/normal ST MAGIC Major triggers; independent physical check and defending-player choice when both win; eligible purchased Mage Lv1 selection, melee-class access. |
| 6.20 Recursion | §22 | Damaging reactions cannot generate damaging reactions; eligible non-damaging reactions remain; established deterministic windows only. |
| 6.21 AoE retaliation | §21–22 | AoE spells generate neither Counter Attack nor Spell Counter. |
| 6.22 Sequential effects | §21 | Deterministic one-unit-at-a-time primary processing with immediate state/capability changes. |
| 6.23 Delayed reactions | §21–22 | Complete primary sequence before retaliation; same originating-unit order; Double Attack both passes first. |
| 6.24 AoE order | §21 | Center, Manhattan distance bands, clockwise from North through the established directional order. |
| 6.25 Dying presence/targets | §23 | Physical tile occupancy remains; ordinary targets/AoE ignore; explicit Raise exception. |
| 6.26 Dying movement/beam | §9, 18, 23 | Friendly transit/no endpoint; hostile blocks passage/occupancy; no LOS obstruction; beam ignores victim/penetration. |
| 6.27 Spells and Double Attack | §18 | No natural Double Attack for ST or AoE spells; only future explicit exception. |
| 7 Action XP/CP | §13 | 1 XP + 1 CP includes truly empty action; preserve 49 XP maximum/equal-power kill, known class ownership; qualification/pool/additional-award edges TBD. |

## F. Every recorded implementation mismatch/gap

The following 33 entries match canonical §31 one-for-one. No gameplay correction was made. Absent production catalogs, future art, exact rounding and undesigned formulas are separately deferred; they are not assigned invented implementations merely to clear this register.

| ID | Topic | Current difference / scope | Inspected code evidence | Canonical section |
| --- | --- | --- | --- | --- |
| M-001 | Physical damage and critical integration | Production Attack remains an injected resolver; fixture deals fixed 20 to an adjacent enemy. No integrated STR/DEX + Weapon ATK − DEF pipeline, critical roll or final minimum/prevention handling. | [BattleController.js](../js/systems/BattleController.js), [battleFoundationFixture.js](../js/data/battleFoundationFixture.js), [BattleStatusSystem.js](../js/systems/BattleStatusSystem.js) | §18 |
| M-002 | Physical dodge / Evade | No production defender-AGI versus STR/DEX dodge resolver; Thief Evade is absent. Exact probability remains TBD, but established architecture and ability are missing. | [DoubleAttackSystem.js](../js/systems/DoubleAttackSystem.js), [abilities.js](../js/data/abilities.js), [battleFoundationFixture.js](../js/data/battleFoundationFixture.js) | §18, 24 |
| M-003 | Weapon range and ordinary friendly/self/empty targeting | Attack UI passes a unit ID, losing an empty coordinate; the fixture requires adjacent enemy. No production equipped-weapon min/max range or complete permitted targeting/no-roll empty behavior. | [BattleMapState.js](../js/states/BattleMapState.js), [BattleController.js](../js/systems/BattleController.js), [battleFoundationFixture.js](../js/data/battleFoundationFixture.js) | §17–18 |
| M-004 | Minimum Safe Range / special patterns | No integrated Minimum Safe Range or full weapon-pattern/beam Attack architecture. This is an absent architecture, not approval of example weapon numbers. | [BattleController.js](../js/systems/BattleController.js), [campaignResources.js](../js/data/campaignResources.js) | §17–18 |
| M-005 | Terrain Defense | Battle terrain has no production Terrain Defense percentage damage integration. Values remain undesigned. | [BattleTerrainSystem.js](../js/systems/BattleTerrainSystem.js), [BattleStatusSystem.js](../js/systems/BattleStatusSystem.js) | §18 |
| M-006 | Double Attack | Probability helper hard-caps at 0.9 and execution does not perform complete second patterns or aggregate two counter opportunities per defender. New exact maximum/formula remain TBD. | [classConfig.js](../js/config/classConfig.js), [DoubleAttackSystem.js](../js/systems/DoubleAttackSystem.js), [BattleController.js](../js/systems/BattleController.js) | §18 |
| M-007 | Ordinary physical Counter Attack | normalCounter/resolveNormal are caller-supplied; no production base 1/16 equipped-range ordinary physical resolver implements the full new rule. | [CombatSystem.js](../js/systems/CombatSystem.js), [BattleController.js](../js/systems/BattleController.js) | §22 |
| M-008 | Independent counter checks and choice | Spell Counter success returns early and suppresses the normal check. No independent-result arbitration / defending-player choice between both successful reaction kinds. | [CombatSystem.js](../js/systems/CombatSystem.js) | §22 |
| M-009 | AoE and single-target spell trigger classification | Controller schedules counters for damaging AoE targets, and skips all non-damaging casts instead of classifying normal single-target MAGIC Major triggers. AoE spells should trigger neither counter. | [BattleController.js](../js/systems/BattleController.js) | §21–22 |
| M-010 | Damaging-reaction recursion | Only spellCounterGenerated suppresses another Spell Counter; normalCounter remains reachable. No general damage-inflicting-reaction provenance prohibition. | [CombatSystem.js](../js/systems/CombatSystem.js), [BattleController.js](../js/systems/BattleController.js) | §22 |
| M-011 | Delayed multi-target retaliation | Controller emits TARGET/COUNTER pairs and may push a child retaliation before remaining primary targets. Required primary-first delayed order is absent. | [BattleController.js](../js/systems/BattleController.js) | §21 |
| M-012 | Magic and healing base formulas | resolveTarget applies cast.magnitude.amount directly; it does not add caster INT to damage or WIS to healing. Global-rounding provider remains correctly unresolved; modifier composition needs design. | [BattleActionSystem.js](../js/systems/BattleActionSystem.js), [MagicSystem.js](../js/systems/MagicSystem.js) | §19–20 |
| M-013 | Single-target offensive spell dodge | Single-target damage applies without a caster-INT versus target-AGI comparison. AoE no-dodge behavior itself is consistent. | [BattleActionSystem.js](../js/systems/BattleActionSystem.js) | §19 |
| M-014 | Spell center bounds and min range | prepare rejects off-map centers, cursor/range overlay clip to map and the spell schema exposes only castingRange. No complete independent min/max center-placement contract. | [BattleActionSystem.js](../js/systems/BattleActionSystem.js), [TargetingSystem.js](../js/systems/TargetingSystem.js), [BattleMapState.js](../js/states/BattleMapState.js), [spells.js](../js/data/spells.js) | §17, 19 |
| M-015 | Spell allegiance and empty single targets | Current targetAllegiances/canTargetCaster fields prohibit general friendly damage/hostile healing; single-tile casts require a center unit. General permitted allegiance/empty targeting remains unimplemented. | [TargetingSystem.js](../js/systems/TargetingSystem.js), [BattleActionSystem.js](../js/systems/BattleActionSystem.js), [spells.js](../js/data/spells.js) | §17, 20 |
| M-016 | Mute eligibility across entry paths | Main BattleController spell-eligibility callback checks Mute, but shared CombatSystem.counters has no direct Mute guard and direct BattleState callers can supply eligibility then reach casting rejection. Full all-path pre-roll ineligibility is not enforced centrally. | [CombatSystem.js](../js/systems/CombatSystem.js), [BattleState.js](../js/states/BattleState.js), [BattleActionSystem.js](../js/systems/BattleActionSystem.js) | §19, 22 |
| M-017 | Terrain modifier representation | normal reads absolute override cost rather than base 1 plus racial modifier; empty tables currently mask the difference. | [BattleTerrainSystem.js](../js/systems/BattleTerrainSystem.js) | §9 |
| M-018 | Innate Flying bridge | Races declare FLIGHT movementTraits while FlyingSystem reads FLYING capabilities; Birdfolk/Fairy innate capability is not connected. Source-aware temporary handling alone does not fix it. | [races.js](../js/data/races.js), [FlyingSystem.js](../js/systems/FlyingSystem.js) | §9, 11 |
| M-019 | Mage entry grant | Mage grant is null; access can mark zero processed. Once-only framework exists but Current 100/Lifetime 0 intent is missing. Retroactive policy remains TBD. | [classes.js](../js/data/classes.js), [spellClasses.js](../js/data/spellClasses.js), [ClassEntryGrantSystem.js](../js/campaign/ClassEntryGrantSystem.js) | §13 |
| M-020 | Five Mage abilities | Robe Training, Wand Training, Arcane Seething, Mage Intelligence Training +1 and Arcane Efficiency are missing. Wizard +2 is not a substitute. | [abilities.js](../js/data/abilities.js), [spellClasses.js](../js/data/spellClasses.js) | §24 |
| M-021 | Steadfast hostility | Displacement hook tests PLAYER/ZEON specifically and does not block all actually hostile sources, including Wilderness. | [AbilityEffectHooks.js](../js/systems/AbilityEffectHooks.js) | §24 |
| M-022 | Skill economy metadata | Protect/Hold the Line explicitly false resolve Minor contrary to Major Skills. Follow Through/Psyche Up/Forage/Refine/Panacea null fields default Major but remain incomplete metadata. | [abilities.js](../js/data/abilities.js), [TurnSystem.js](../js/systems/TurnSystem.js) | §16, 24 |
| M-023 | Follow Through expenditure/execution | Requirements enforce preconditions but complete first attack, 1 MOV expenditure, legal kill-advance and optional follow-up are not integrated. | [AbilityRequirementSystem.js](../js/systems/AbilityRequirementSystem.js), [AbilityEffectHooks.js](../js/systems/AbilityEffectHooks.js), [BattleMapState.js](../js/states/BattleMapState.js) | §24 |
| M-024 | Panacea | Existing helper cures removable statuses rather than being the intentional temporary no-op. | [ItemSystem.js](../js/systems/ItemSystem.js) | §25 |
| M-025 | Refine assumptions | Helper requires a newly created output catalog item and scalar HP+MP comparison. Canonical core does not establish that output form or complete eligibility. | [ItemSystem.js](../js/systems/ItemSystem.js) | §25 |
| M-026 | XP and action CP baseline | ExperienceSystem is empty; default CPAwardCalculator returns null. No production 1 XP + 1 CP action baseline or established 100/49 XP constraints integration. | [ExperienceSystem.js](../js/systems/ExperienceSystem.js), [ClassProgressionSystem.js](../js/campaign/ClassProgressionSystem.js) | §13 |
| M-027 | Summoner direct growth | Future Summoner absent and growth application accepts six primaries only. No applicable direct +2 MAX MP growth support. This does not authorize its undesigned class table. | [CharacterGrowthSystem.js](../js/campaign/CharacterGrowthSystem.js), [classes.js](../js/data/classes.js) | §12, 14 |
| M-028 | MC defeat exception | Generic AWOL/casualty handling lacks the special MC branch and specified deaths of other members. Detailed recovery procedure still needs design. | [AwolSystem.js](../js/campaign/AwolSystem.js), [BattleCasualtySystem.js](../js/campaign/BattleCasualtySystem.js) | §27 |
| M-029 | AWOL return eligibility | Old type whitelist and own-faction controller filter remain; records are evaluated only when due. No complete type-independent player-support eligibility reevaluation every absent day. | [AwolSystem.js](../js/campaign/AwolSystem.js) | §23 |
| M-030 | Battle-end condition persistence | Campaign boundary commits established casualties/AWOL, without complete persistent remaining HP/MP/condition integration. Fresh battle adapters cannot substitute automatic healing for intended attrition. | [BattleState.js](../js/states/BattleState.js), [BattleStatAdapter.js](../js/campaign/BattleStatAdapter.js), [ResourceSystem.js](../js/campaign/ResourceSystem.js) | §26, 29 |
| M-031 | Settlement recovery | No campaign End Day HP/MP recovery system meeting established City/Fort/Castle 3, Town 4, Village 5-day targets; detailed arithmetic remains TBD. | [ResourceSystem.js](../js/campaign/ResourceSystem.js), [CharacterStatsSystem.js](../js/campaign/CharacterStatsSystem.js) | §26 |
| M-032 | Other established ability integration | Many martial Skills/reactions and item effects remain detached metadata/helpers, not complete playable commands: e.g. Cover/Guard/Covering Fire/Indomitable timing, weapon-technique effects, ordinary Item/Steal, Forage and Scrounge. BattleMapState reports unresolved commands. Preserve established pieces and defer unknown magnitudes. | [BattleMapState.js](../js/states/BattleMapState.js), [AbilityEffectHooks.js](../js/systems/AbilityEffectHooks.js), [ItemSystem.js](../js/systems/ItemSystem.js), [abilities.js](../js/data/abilities.js) | §16, 24–25 |
| M-033 | Hostile Dying collision | Movement currently permits passage through any DYING occupant regardless of faction. Hostile Dying must block passage. | [TacticalMovementRules.js](../js/systems/TacticalMovementRules.js) | §9, 23 |

## G. Validation and limitations

- Ran **`node tools/test-foundation.cjs`** after the documentation edits: **778 total, 778 passed, 0 failed, 0 skipped**, exit code 0. Later edits were documentation/coverage clarifications only and did not justify repeating runtime tests.
- Campaign save schema remains **8**; editor/control versions remain **1**. No schema change or migration was made.
- Checked 32 numbered main sections, 125 catalog rows, all 73 consecutive TBD IDs, all 33 consecutive mismatch IDs, all 196 topic dispositions, all 119 registry IDs and all 36 spell identifiers. Documentary ability records and history/implementation inventories are accounted for below.
- Checked Markdown table structure, local links, section references and absence of assembly placeholders. Searched terminology/old values: Fairy is current; Pixie and “tactical map” occur only in terminology cautions; numerical weight is explicitly rejected; Prayer 50% and Double Attack 90% appear only as superseded history; the old purchase curve is qualified as implementation balance.
- Compared SHA-256 hashes against the pre-edit file baseline. Only README and ARCHITECTURE were modified; the canonical spec and this report are the only new repository files. Runtime, tests, assets, schemas, ledger and historical artifacts were unchanged. Gameplay behavior did not change.
- Final validation on 2026-09-23 confirmed **409 protected existing files unchanged**, **149 local document links valid**, complete record/ability/spell coverage and consistent Markdown table columns. `git diff --check` passed. The branch and four-file working-tree status below were reconfirmed.
- The full ledger coverage below distinguishes incorporation, intentional reference and exclusion. Source counts/links check coverage, not semantic proof; the rules were also reviewed against the prompt and ledger, particularly counter timing, area notation, explicit immunity and unresolved arithmetic.
- No new browser/UI or controller verification was performed for this Markdown-only task. Prior local-browser/controller limitations remain historical. Passing implementation tests demonstrates stability, **not conformance to every newly established design rule**.

## H. Git state

Current branch: **main**. Working tree was clean before this task. Left intentionally uncommitted:

```text
 M README.md
 M docs/ARCHITECTURE.md
?? CANONICAL-DESIGN-SPECIFICATION.md
?? docs/PROMPT10-DOCUMENTATION-REPORT.md
```

No commit, merge, branch creation or runtime modification was performed.

## I. Ledger coverage audit

### Topic records

Every one of the ledger's 196 substantive Rxx-yy records has a disposition below. A section reference incorporates the record's established portion, not every historical/code value embedded in that record. Numeric defaults, examples and unresolved portions are explicitly qualified in the specification and the inventory exclusions below. Exact asset/compatibility contracts intentionally referenced in existing documentation remain implementation information rather than final game-balance authority.

| Ledger record | Canonical section(s) | Disposition |
| --- | --- | --- |
| R02-01 | §4, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R02-02 | §4, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R02-03 | §4, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R02-04 | §4, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R02-05 | §4, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R02-06 | §4, 29 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R03-01 | §3 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R03-02 | §3 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R03-03 | §3 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R03-04 | §3 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R04-01 | §5, 32 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R04-02 | §5, 32 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R04-03 | §5, 32 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R04-04 | §5, 32 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R04-05 | §5, 32 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R04-06 | §5, 32 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R04-07 | §5, 32 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R05-01 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-02 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-03 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-04 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-05 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-06 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-07 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R05-08 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-09 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R05-10 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R05-11 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R06-01 | §11–13, 26, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R06-02 | §11–13, 26, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R06-03 | §11–13, 26, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R06-04 | §11–13, 26, 29 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R06-05 | §11–13, 26, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R06-06 | §11–13, 26, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R06-07 | §11–13, 26, 29 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R06-08 | §11–13, 26, 29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-01 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-02 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-03 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-04 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-05 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-06 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-07 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-08 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-09 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-10 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-11 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-12 | §9, 11 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R07-13 | §9, 11 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R08-01 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-02 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-03 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-04 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-05 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-06 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-07 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-08 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-09 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-10 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-11 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-12 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-13 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-14 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-15 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-16 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R08-17 | §14, 24 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R08-18 | §14, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R09-01 | §13 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R09-02 | §13 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R09-03 | §13 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R09-04 | §13 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R09-05 | §13 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R09-06 | §13 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R10-01 | §13, 19 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R10-02 | §13, 19 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R10-03 | §13, 19 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-01 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-02 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-03 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-04 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-05 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-06 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-07 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-08 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-09 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R12-10 | §9, 19–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R13-01 | §15, 25 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R13-02 | §15, 25 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R13-03 | §15, 25 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R13-04 | §15, 25 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R13-05 | §15, 25 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R13-06 | §15, 25 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R13-07 | §15, 25 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R14-01 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R14-02 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R14-03 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R14-04 | §6–7 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R15-01 | §7, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R15-02 | §7, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R15-03 | §7, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R15-04 | §7, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R16-01 | §6–8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R16-02 | §6–8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R16-03 | §6–8, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R16-04 | §6–8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R16-05 | §6–8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R16-06 | §6–8, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R16-07 | §6–8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R17-01 | §7, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R17-02 | §7, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R17-03 | §7, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R17-04 | §7, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R18-01 | §7, 26 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R18-02 | §7, 26 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R18-03 | §7, 26 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R18-04 | §7, 26 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R18-05 | §7, 26 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R18-06 | §7, 26 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R18-07 | §7, 26 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R18-08 | §7, 26 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R18-09 | §7, 26 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R19-01 | §8, 10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R19-02 | §8, 10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R19-03 | §8, 10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R20-01 | §8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R20-02 | §8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R20-03 | §8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R20-04 | §8, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R20-05 | §8, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R21-01 | §10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R21-02 | §10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R21-03 | §10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R21-04 | §10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R21-05 | §10 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-01 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-02 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-03 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-04 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-05 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-06 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-07 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R22-08 | §9, 17, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R23-01 | §16 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R23-02 | §16 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R23-03 | §16 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R23-04 | §16 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R24-01 | §16, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R24-02 | §16, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R24-03 | §16, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R24-04 | §16, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R24-05 | §16, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R24-06 | §16, 24 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R25-01 | §17, 20–21, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R25-02 | §17, 20–21, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R25-03 | §17, 20–21, 23 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R26-01 | §5, 21 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R26-02 | §5, 21 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R26-03 | §5, 21 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R26-04 | §5, 21 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R27-01 | §18, 21–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R27-02 | §18, 21–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R27-03 | §18, 21–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R27-04 | §18, 21–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R27-05 | §18, 21–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R27-06 | §18, 21–22 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-01 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-02 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-03 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-04 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-05 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-06 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-07 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R28-08 | §23, 27 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R29-01 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R29-02 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R29-03 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R29-04 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R29-05 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R29-06 | §6–7 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R30-01 | §6 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R30-02 | §6 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R30-03 | §6 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R30-04 | §6 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R31-01 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R31-02 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R31-03 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R31-04 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R31-05 | §5, 28 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R31-06 | §5, 28 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R32-01 | §29 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R32-02 | §29 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R32-03 | §29 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R32-04 | §29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R32-05 | §29 | Referenced or summarized as implementation/compatibility/fixture evidence; exact defaults excluded from established gameplay authority. |
| R32-06 | §29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |
| R32-07 | §29 | Incorporated; explicitly qualified implementation/provisional/future portions are not promoted. |

### Ability, spell and item inventories

All **ABL-001–119** appear individually in canonical §24 with owner, category, Class Level and current behavior. Prices and literal FUNCTIONAL/RULE_HOOK status flags were excluded because neither establishes final purchase balance or complete execution. Spell rows cross-reference canonical §9/§19/§20; no old allegiance restriction or Spell-Counter-first wording survives as current design. DOCABL-01–06 add the five intended Mage abilities and Evade; DOCABL-07–13 preserve limited future/reserved/naming facts in §11/§14/§24 without invented class tables.

| Documentary record | Canonical destination | Disposition |
| --- | --- | --- |
| DOCABL-01 | §24 Mage / §19 / §30 | Seething +10% next scalable spell; edges deferred. |
| DOCABL-02 | §24 Mage | Robe Training Lv2 preserved. |
| DOCABL-03 | §24 Mage | Wand Training Lv4 preserved. |
| DOCABL-04 | §24 Mage / §13 | Mage +1 INT Training distinct from Wizard +2. |
| DOCABL-05 | §24 Mage / §19 | Efficiency −10% MP; rounding/composition TBD. |
| DOCABL-06 | §24 Thief / §18 | Evade Lv3 intended; formula/magnitude TBD. |
| DOCABL-07 | §24 future reservations | Surefooted reserved Ranger; additional cost −1/min1; level/interactions TBD. |
| DOCABL-08 | §24 future reservations | Desoul idea, no new instant-death mechanics. |
| DOCABL-09 | §24 / §32 | Affinity/Mastery removed from Mage, possible Elementalist only. |
| DOCABL-10 | §14 / §20 | Existing Advanced Healer/Dying/100% Raise 2 facts retained; no new design. |
| DOCABL-11 | §24 future reservations | Death Rattle concept; no exception invented. |
| DOCABL-12 | §11 / §24 | Fairy cure concept; detailed design deferred. |
| DOCABL-13 | §24 | Skewer provisional alias, not an additional ability. |

| Spell provenance range | Canonical destination | Disposition |
| --- | --- | --- |
| SPL-001–024 | §19 six families × four tiers; §24 individual rows | Names, elements, unlocks, area progression and power relationships incorporated; exact powers/ranges/MP remain TBD, prices omitted. |
| SPL-025–028 | §20 Heal 1–4; §24 | Names/unlocks and new healing formula retained; per-tier balance/geometry deferred. |
| SPL-029–033 | §20 cures; §24 | Named-status cures/unlocks retained; old universal friendly filter superseded, remaining balance deferred. |
| SPL-034 | §20 Raise 1; §24 | Dying-only/50%/unrelated-status preservation; no Dead revival. |
| SPL-035–036 | §9 Fly/Portal; §24 | Duration, source/placement/method rules retained; unresolved balance remains TBD. |
| ITM-001–010 | §15/§25; ledger §13 intentionally retained as current item evidence | All ten shipping item prices, modifiers, tier fields, Herb 10 and legacy permission lists excluded from final catalog authority: #9B confirms the production catalog was never designed. Physical inventory/slot/permission architecture is incorporated. |

### Deferred, historical, adjudication and implementation inventories

| Ledger inventory | Coverage/disposition |
| --- | --- |
| TBD-001–068 (68) | Same identifiers in canonical §30 with current unresolved scope after #10; no settled base formula/chance/action minimum remains falsely open. Five additional interaction/architecture entries are TBD-069–073. |
| SUPER-001–044 (44) | Canonical §32 states current key replacements and intentionally references the complete historical chains in the ledger; obsolete values are excluded from current rules. SUPER-031 remains prototype taxonomy history, not a falsely inferred former designer taxonomy. |
| CONFLICT-001–010 (10) | All remain adjudicated, incorporated in Mage/grant/flight/naming/XP/Skills/hostility/Summoner/MC/AWOL sections and corresponding mismatch entries. No inference that resolved adjudication equals implemented code. |
| RECOVERY-001–015 (15) | Closed status retained in §2/§30; no active NEEDS RECOVERY. Never-designed details remain deferred, v4 identity and missing conversations remain provenance limitations. |
| IMP-001–003 | Input timing, scene tuning/64px placeholders, flash/page/name limits intentionally excluded as design constants (§5/§28). |
| IMP-004–006 | Storage shapes/keys, exact PRNG and residual deterministic tie algorithms referenced as implementation details (§4/§5/§16/§29). |
| IMP-007–013 | Null fallbacks, demo economy/recruits/spell lab/battle values, fixture AI, migration identities and weakly adopted allowlists excluded or explicitly qualified (§6/§7/§12/§14/§19/§29/§31). |
| IMP-014 | Deployment readiness/ordinary-pool Ocean/special distinctions incorporated (§8/§10). No combat bonus inferred. |
| IMP-015–016 | Forecast/UI guards, economic rounding, prohibited-Ocean cost fallback and numeric tolerance excluded as universal mechanics (§5/§16/§19/§29). |
| IMP-017 | Prototype taxonomy history explicitly distinguished; AWOL mismatch M-029 retained (§7/§23/§32). |
| IMP-018 | Traveler/casualty/retreat placeholders are current implementation, not finalized survival/loot design (§7/§23/§27). |
| IMP-019–020 | Absolute terrain override and Refine output assumptions recorded as mismatches M-017/M-025, not adopted design (§9/§25). |
| Candidate index (55) | All navigation topics covered by the 196 record mappings and inventories above. Confidence labels were not mechanically promoted to current authority; #10 supersedes affected counter/XP/dodge/targeting summaries. |

The specification can be read as the current design without reconstructing these historical tables; this audit retains traceability without making the ledger a competing design source.
