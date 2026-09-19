# Shining Farce — Prompt #6A implementation report

Completed 2026-09-16. **516/516 deterministic checks pass**: all 454 prior checks remain, with only explicitly superseded expectations updated, plus 62 correction/Prayer checks. Offline rendering/input verification passes, including all 21 existing external PNG assets, the 320×240 framebuffer, the five-green palette and five resize cases. No production artwork, runtime dependencies or installation step was added.

This report supersedes the affected rules in the historical Prompt #6 report.

## Integration scope

**Integrated in the tactical engine:** corrected Martyr; hard Raise targeting; player Spell Counter request/choice transactions; timed, source-aware Fly; illegal-terrain escape; tactical AWOL; active-combatant conclusion; Portal modifier contract. These run through the existing BattleState transaction facade. Failed commands preserve the complete prior snapshot.

**Integrated in the campaign:** validated AWOL battle-result IDs, simultaneous commit, independent survival/delay rolls, permanent failed-return casualties, persisted absences, End Day return processing, network-based settlement selection, named bitmap messages, and schema migration. This is exercised through real Campaign commands and save/restore, not only helper calls.

**Interactive debug lab:** Debug Tools → SPELL / PORTAL LAB now offers DEBUG SPELL COUNTER, DEBUG FLY ESCAPE and DEBUG FLY STRANDED. The counter requires a real menu choice. Fly shows its remaining turns; test walls indicate illegal terrain; mandatory escape lists valid neighbors; AWOL removes the sprite and blocks actions. Explicit fixture damage, balance and activation outcomes remain labeled debug behavior.

**Future-content architecture only:** Raise 2 behavior and optional inherent/equipment Flying capability metadata. No Advanced Healer class, progression entry, inherent Flying race/class or new equipment item was invented.

**Still deferred:** automatic tactical campaign combat, initiative/AI and normal attack resolution. The campaign retains its existing placeholder battle interface; it accepts tactical results through its existing boundary. This corrective pass does not finish that larger battle loop. There is still no player-facing save/load UI; persistent snapshot/constructor restore is verified.

## Corrected mechanics

### Martyr and Raise

Martyr remains Cleric Lv7 Reaction. Each distinct Alive→Dying transition starts the normal counter at 3 and immediately changes it to 2 when a qualifying adjacent enemy has Martyr. Countdown changes never call this transition hook. Raise clears Dying, so a later lethal event can trigger Martyr again. The permanent `hasEnteredDying` restriction is removed.

Raise 1 remains Cleric Lv4 and restores 50% MAX HP. The actual targeting layer accepts Dying only and rejects healthy Alive, injured Alive, Dead, AWOL and other life states. Invalid casts commit no MP, action, HP/status changes, CP or receipt. Other statuses remain untouched.

`G.data.RAISE_BEHAVIORS` defines the Dying-only fractions for Raise 1 (0.5) and future Raise 2 (1). The existing generic Raise resolver clears the counter and restores the specified fraction. Raise 2 is tested with an isolated fixture and is absent from the purchasable spell/ability/class catalogs. Its future owner's name, class ID, prerequisites, unlock level, MP, Range and other class details remain undefined.

### Spell Counter

Wizard Lv2 Reaction retains the 20% check before ordinary counter. Candidates must be purchased Mage definitions with spellLevel 1 and must pass the existing legal-counter eligibility adapter. Higher versions never substitute for a missing Lv1 purchase.

On player success, the engine returns `SPELL_SELECTION` and stores the triggering attack, defender, attacker and eligible spell IDs. It does not call a selection policy for the player. The controller presents the candidates; `chooseCounter` validates and casts the selected spell. Other battle commands pause until that response resolves. Cancelling the menu cannot silently select or discard the successful reaction. Invalid selection rolls back and leaves the choice pending.

The selected reaction costs 0 MP, preserves Major Action, creates no independent CP award and suppresses the ordinary counter check. Trigger IDs remain deduplicated before and after selection. A failed activation permits the supplied ordinary counter check. Enemy selection remains an explicit unresolved policy; no AI preference was added.

### Fly sources, turns and escape

Effective Flying combines:

- optional `capabilities: ["FLYING"]` on the current race or class;
- optional explicit tactical capability-source records for future equipment/abilities;
- Flying status-source entries.

The Fly spell owns a distinct entry with `sourceType: "SPELL"`, `sourceKey: "fly"`, caster `sourceId`, and `remaining: 3`. Only this entry ticks at the end of the affected unit's turn: 3→2→1→removed. Other units' turns do not tick it. Race/class and independent sources survive. Reapplication refreshes this spell's source without deleting other sources. No production race or class receives inherent Flying in this pass.

Existing Flying movement remains cost 1 per tile, can traverse/occupy otherwise impassable terrain, and obeys map bounds and unit collisions. Fly permits Expand only. Extend remains unresolved and disabled; Focus and Overcharge reject.

Loss of the final source checks the supplied normal occupancy provider. Legal terrain has no special effect. Otherwise all eight immediate neighbors are checked for bounds, normal occupancy, empty destination and any supplied destination restriction. A legal escape sets `escapeRequired`. Normal actions, ordinary movement, voluntary Portal entry and ending/restarting that unresolved turn are blocked. On the next turn, destination availability is checked again. No destination at expiration or at that next-turn check causes AWOL.

The escape is a dedicated position-correction transaction before normal turn use, permitting orthogonal or diagonal exit but never another illegal or occupied tile. It leaves existing MOV/Major Action budgets unchanged and awards no CP; no additional escape price was supplied or invented. The lab exposes only valid destinations in its required-escape menu. Impaired-movement interactions beyond the existing movement restrictions have not been given new rules.

### AWOL and immediate conclusion

AWOL is a separate tactical life state. It removes the position and tactical roster entry, clears no HP/status as a recovery rule, uses no Dying counter, and blocks acting/targeting/being targeted. It never counts as an active combatant.

Dying, Dead and AWOL cannot keep a faction in the battle. The last active friendly entering Dying determines Defeat immediately, even if the surviving enemy has a future lethal Poison event. The symmetrical enemy case determines Victory. Once conclusion is pending, further turns/damage cannot change it. Current animation completion → tactical map frame → banner remains intact. A non-animation AWOL conclusion also presents the map before the banner.

### Portal

Extend is intentionally approved: native Range 4 becomes 5, Radius remains 1, and MP is multiplied by 1.10. Focus, Expand and Overcharge reject. Native Portal MP remains TBD, and fractional results still require an explicit rounding policy. All previous Portal placement, forced transfer, voluntary entry, expiry and rendering tests remain.

## Mage equipment audit

Before this pass, Mage had WAND/ROBE selectors **and** `legacy: true`. EquipmentEligibility's legacy fallback accepted non-off-hand equipment when allowedClasses was absent or included Mage. This gave new/current Mages actual Staff access through the old Wooden Staff's allowedClasses, and broad access to old armor without finalized family metadata.

Mage now has `legacy: false` and WAND/ROBE permissions only. Wizard retains STAFF/ROBE. The existing Cloth Robe is tagged `armorFamily: "ROBE"`; no item is added. No Wand item exists, and one has not been invented to fill that catalog gap.

Schema migration records narrowly scoped `legacyEquipment[itemInstanceId] = unitId` exceptions for incompatible already-equipped or already-assigned old Mage items. These preserve equipped records, their existing derived stat effects, and pending physical deliveries without giving class proficiency. Existing assigned staff shipments can finish. Ordinary equip/assign does not consult the legacy exception: after releasing the old staff, the Mage cannot equip it again. Changing to an incompatible class continues to use the existing equipment reconciliation.

Tests cover class permissions, the actual existing robe, preserved old equipped staffs, release/re-equip rejection, interrupted resolution migration and in-flight staff delivery. Items remain independent records after death; no inheritance, transfer, strengthening or item XP was added.

## AWOL campaign resolution and save schema

Schema increments **once, 7→8**, because persistent representation actually changes:

- `awol: { seed, pending }` stores a separate stream using the existing DeterministicRandom implementation and pending unit-return records.
- Each pending record stores unit ID, faction, battle location/route, return day and an explicit unresolved reason when needed.
- `legacyEquipment` stores the item-specific migration exceptions above.
- The existing persistent unit status domain adds AWOL.

Both new root fields participate in frozen resource snapshots and resolution replay. Schema-7 migration adds empty AWOL scheduling, initializes its deterministic stream, derives only existing-item exceptions, and updates active/historical resource snapshots. Existing characters, growth RNG, base stats, CP, Class Levels, learned abilities, loadouts, physical items, candidates, queues and earlier migration guarantees remain intact. No transient tactical snapshot is added to campaign saves.

Battle results carry `awolUnitIds` separately from `deadUnitIds`; IDs must be unique scenario members and cannot overlap. The tactical result is reconciled at the established simultaneous commit:

1. Winning AWOL units retain their original squad membership. No recovery amounts/status clearing are applied.
2. Each losing AWOL independently draws a 50% survival result.
3. Failure invokes the shared permanent casualty helper, removes membership and retains unit/item records.
4. Success removes membership, marks the unit AWOL and independently draws 2, 3 or 4 days using the existing uniform integer RNG convention.

The return day is battle resolution day + delay. World Update processes returns due on the incoming campaign day (`day + 1`), so the normal exactly-once day pipeline owns elapsed time. Save/restore preserves the due date and RNG; replay derives the same outcomes without rerolling them. Successful delayed return marks the unit Active and unassigned at the selected settlement, without restoring HP/MP or clearing general statuses.

### Settlement selection

The existing Dijkstra pathfinder and route travelDays weights determine network distance. Pixel positions and node-name order are not distance measures. Existing settlement types are CAPITAL, VILLAGE, PORT, FORTRESS and SHRINE; CROSSROADS is not treated as a settlement.

At return time, eligible settlements must be controlled by the unit's faction and reachable from the battle location. Choose the minimum battle distance. For ties, maximize the minimum path distance to any active opposing squad. If still tied, choose once with the existing deterministic uniform integer operation over every remaining candidate. No reachable enemy gives an infinite enemy distance consistently, allowing the final equal tie choice. Tests exercise two-, three- and four-way ties and multiple enemy squads.

If no reachable friendly settlement exists, keep the absence record with `NO REACHABLE FRIENDLY SETTLEMENT`, expose the unresolved event/message, and reconsider availability on later World Updates. This is a retained unresolved boundary, not an invented fallback destination or death rule.

**Additional explicit boundary:** route-interception scenarios have only a route ID, with no defined point along it. Network distance from that battle position cannot be determined without inventing an origin or midpoint. Such delayed returns retain `BATTLE ROUTE POSITION UNRESOLVED` until that design is supplied. Location-battle returns are fully integrated.

Return events use the existing EventBus, bitmap pages and event log. The displayed message includes the unit's name: “[Unit Name] has returned from the wilderness.”

## Verification

- **516/516 deterministic checks** in `verification/rule-checks.txt` (454 retained + 62 new).
- Earlier tests were neither deleted nor disabled. Superseded assertions changed only for schema 8, Mage's removed legacy proficiency, Martyr retriggering, required player counter choice and the explicit terrain provider for Flying expiry.
- Offline input/render verification passed in `verification/results.json`. It drives the actual family/level/method/target menus and previous campaign flows, plus player counter choice, cancellation gating, zero-MP execution, three-turn Fly, diagonal escape, AWOL removal and a real campaign wilderness-return message.
- All **21 PNGs** and sampled framebuffers pass five-green/no-partial-alpha checks; logical framebuffer stays **320×240** across five resize cases.
- Representative counter-choice, Fly/escape, AWOL and named-return PNGs were visually inspected. These are offline Canvas2D renders, not browser screenshots.
- `verification/runtime-scan.txt`: 141 runtime/HTML files scanned, with no fetch, XMLHttpRequest, module imports/exports, module script tags or remote URLs.
- Direct browser/file:// execution remains **unverified**. The preceding Prompt #6 launch was rejected by browser URL policy; this pass did not repeat or bypass that rejection. Offline tests do not prove browser launch acceptance.

## Files added or modified

Added:

- `js/systems/FlyingSystem.js`
- `js/campaign/AwolSystem.js`
- `js/debug/SpellCorrectionsTests.js`
- `docs/PROMPT6A-IMPLEMENTATION.md`
- `verification/runtime-scan.txt` and new counter/Fly/AWOL verification PNGs

Modified runtime/data:

- `index.html`, `js/config/campaignConfig.js`
- `js/data/spells.js`, `js/data/spellClasses.js`, `js/data/campaignResources.js`
- `js/systems/BattleStatusSystem.js`, `TargetingSystem.js`, `TurnSystem.js`, `TacticalMovementRules.js`, `MagicSystem.js`, `CombatSystem.js`, `PortalSystem.js`
- `js/states/BattleState.js`, `SpellLabState.js`, `CampaignMapState.js`
- `js/rendering/BattleRenderer.js`, `CampaignUIRenderer.js`
- `js/campaign/CampaignState.js`, `BattleCasualtySystem.js`, `BattleBoundary.js`, `EndDayResolutionSystem.js`, `ResolutionValidation.js`, `ResourceSystem.js`, `InventorySystem.js`, `TravelerSystem.js`

Modified verification/documentation:

- `js/debug/FoundationTests.js`, `StrategicMovementTests.js`, `ResourceTests.js`, `CharacterStatsTests.js`, `ClassFoundationTests.js`, `ProgressionConsolidationTests.js`, `SpellFrameworkTests.js`
- `tools/verify-rendering.cjs`
- `README.md`, `docs/ARCHITECTURE.md`
- `verification/rule-checks.txt`, `verification/results.json`, regenerated offline renders

The historical Prompt #6 report is retained unchanged.

## Still unresolved / deliberately deferred

Global production rounding remains null. Fractional MP, damage, healing and movement restoration require an explicit policy; tests/lab supply Math.ceil without making it the production convention.

Other unresolved values remain: Mage damage/MP/ranges; Cleric healing magnitudes, spell ranges/radii/MP, unspecified class prerequisites/equipment/MOV; Fly Range/Radius/MP and Extend compatibility; Portal MP; Raise 2's future class/progression/balance; enemy Spell Counter selection and ordinary counter chance/damage; full hit/resistance/elemental formulas; CP award amounts; initiative and AI. Previously unresolved broader systems remain outside this corrective pass.

No general post-battle HP/MP restoration, persistent Poison/Blind/Mute policy, settlement recovery, injury system or equipment inheritance was added. AWOL route-battle return distance and unavailable-settlement handling remain explicit design boundaries. Automatic campaign tactical combat and browser launch verification remain architectural/verification limitations, not completed features.


## Subsequent clarification — Prayer 25%

Prayer's activation chance is finalized at **25%**, shared by spell configuration and ability metadata. Eligible lethal damage accepts a supplied `prayerRoll` in [0,1): values below 0.25 activate, and 0.25 or higher fail. Success leaves 1 HP and preserves other statuses. Existing explicit `prayerDecision` adapters receive the finalized 0.25 chance; the debug lab may still force an outcome for deterministic inspection. Missing/invalid RNG rejects atomically rather than inventing randomness. No campaign schema change is needed.

Seven additional checks cover success/failure boundaries, metadata and adapter consistency, invalid/missing RNG rollback, and no roll for nonlethal damage. Updated files also include `js/config/spellConfig.js`; current total is 516/516.
