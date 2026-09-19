# Shining Farce — Prompt #9A Recovery Report

Completed 19 September 2026. Updated `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md` using the human designer’s Prompt #9A adjudications. **Nine conflicts are resolved; CONFLICT-009 is partially resolved because the exact MC defeat/recovery procedure remains unknown.** Design decisions and current implementation are recorded separately.

The only project files changed or created are the recovery ledger and this report. No gameplay correction or final canonical specification was implemented. `docs/PROMPT9-RECOVERY-REPORT.md` remains the unchanged historical report of the original recovery pass.

## Authority and scope

The ledger source registry now identifies **P9A** as the direct human-designer prompt supplied in `C:/Users/Arron/.codex/attachments/b2d7b6f8-4cf6-4eec-b77d-9dc1ff0bc191/Pasted text.txt`. P9A section citations refer to that prompt. The affected topic records, ability inventory, conflict table and candidate index reproduce the rulings so the ledger can be reviewed without reopening the attachment.

Historical reports, handoffs, workbook claims and code remain evidence of earlier decisions or implementation. They do not override P9A. Resolved means the design question was adjudicated; it does not mean the gameplay now implements it.

## Conflict dispositions

| Stable ID | Disposition | Recorded adjudication and remaining boundary |
| --- | --- | --- |
| CONFLICT-001 | RESOLVED | Class-entry Current CP without Lifetime CP gain is established. Mage receives **+100 Current Mage CP / +0 Lifetime Mage CP**; **100 is provisional/tunable**. No grants inferred for other classes. Final broader CP costs and grant tuning remain open. |
| CONFLICT-002 | RESOLVED | Mage owns all five omitted abilities: Seething Reaction gives next applicable scalable spell +10% after enemy damage and is consumed by that cast; Robe/Wand Training Supports grant cross-class equipment permission; Mage Intelligence Training Support adds **+1 INT per Character Level while equipped**, distinct from Wizard’s **+2**; Efficiency Support reduces spell MP costs **10%**. Seething edges/rounding and Efficiency rounding remain TBD. |
| CONFLICT-003 | RESOLVED | Birdfolk/Fairy inherently possess Flying. Temporary Fly expiration/removal must preserve independent innate Flying; existing Flying/Ocean behavior remains. No internal capability representation prescribed. |
| CONFLICT-004 | RESOLVED | Historical Pixie wording means Fairy, including the possible Enchanter race reference. It does not establish a separate ordinary Pixie race or finalize adoption of the proposed Enchanter lock. Goblin, Construct, Phoenix, Dragon and Pegasus Centaur are confirmed secret/future concepts; their details remain undesigned. |
| CONFLICT-005 | RESOLVED | Fixed **100 XP per Character Level**; **49 XP maximum per single action**; equal-relative-power kill awards **49 XP**. Relative power, other award cases, full formula, rounding and edges remain TBD. |
| CONFLICT-006 | RESOLVED | **Skills are Major Actions**, including all five named Skills. Follow Through additionally consumes **1 MOV**, with its established no-prior-attack/remaining-MOV/kill/advance/follow-up/once-per-turn conditions. Psyche Up magnitude remains TBD. Forage needs its dedicated prompt; Refine’s exact effect needs recovery; Panacea is an intentional temporary no-op pending consumable content/system. |
| CONFLICT-007 | RESOLVED | Steadfast prevents displacement from actual hostile sources, including Wilderness, and permits legitimate friendly displacement. No blanket reinterpretation of unrelated faction-specific rules. |
| CONFLICT-008 | RESOLVED | Summoner adds **+2 MAX MP directly** whenever a unit gains a Character Level receiving applicable Summoner class growth. This is not +2 INT. For stat-growth amounts, small/medium/large means +1/+2/+3. Other Summoner design remains incomplete. |
| CONFLICT-009 | PARTIALLY RESOLVED | AWOL MC in the defeated MC squad enters the special MC defeat/recovery process instead of ordinary permanent loss; every other member of that defeated squad is killed and permanently removed from active play. Future graveyard/history intended. Exact MC recovery destination, duration, timing and consequences remain NEEDS RECOVERY. |
| CONFLICT-010 | RESOLVED | Old Capital/Village/Port/Fortress/Shrine taxonomy was Codex prototype content, except separately adopted terms. Current settlement types are Village/Town/City/Fort/Castle, with extensibility. AWOL return ignores type, selects the closest player-controlled settlement—pledged support to MC against Zeon—using existing network distance/ties, and reevaluates control/support **each campaign day until return**. |

## Open-record changes

Stable IDs were retained. Answered parts were removed from active uncertainty rather than leaving old questions open under their original wording.

| Record | Treatment |
| --- | --- |
| TBD-007 | Narrowed to relative power, complete XP awards, other action/enemy cases, rounding and edges. Threshold/cap/reference case closed. |
| TBD-009 | Clarified that provisional Lifetime CP thresholds are separate from broader purchase-cost finality; it no longer implies every purchase price is permanently finalized. |
| TBD-012 | Narrowed to Fighter STR, Knight CON and Archer DEX Training amounts; Mage INT amount closed at +1. Wizard +2 remains distinct. |
| TBD-014 | Removed Follow Through/Psyche Up action-classification uncertainty. Psyche Up magnitude, Cleave secondary damage, spear name and remaining historical effect questions survive. |
| TBD-023 | Forage Major classification closed; detailed design/implementation and dedicated-prompt requirement retained. Occupied-tile production, immediate use/throw/store-if-space, repeatable tiles and Conservation exclusions remain recorded. |
| TBD-024 | Reclassified/narrowed to Refine’s exact behavior needing recovery and a dedicated prompt; Major classification closed. Older helper behavior is preserved as evidence, not adopted as the final effect. |
| TBD-025 | Reclassified/narrowed to Panacea’s final behavior after consumable content/system; Major and intentional temporary no-op settled. |
| TBD-032 | Mage ownership and +1 Training amount closed; Seething rounding/general edges and Efficiency rounding/unspecified composition remain open. Mage Lv9 is not filled by inference. |
| TBD-038 | Secret-race intent/names closed; stats, growth, terrain, recruitment, unlocks, permissions, capabilities, content and priority remain open. |
| TBD-039 | Pixie/Fairy identity and Summoner direct-MP amount closed. Possible Enchanter lock adoption and unfinished future class mechanics remain open. |
| TBD-052 | Narrowed MC questions to the exact special procedure and consequences; preserves unresolved general survival/retreat rules elsewhere. The specified MC-squad exemption/fate is settled. |
| TBD-064 | Added broader final spell/Skill/ability CP costs and tuning of Mage’s provisional 100 Current CP grant. Current working prices are not replaced. |
| TBD-065 | Added the intended future graveyard/historical-record feature; no data model, UI or detailed behavior invented. |
| TBD-066 | Added the unchosen policy for already-processed Mage class-entry grants when a future implementation ships. Existing zero-credit markers do not justify inventing retroactive migration here. |
| RECOVERY-004 | Narrowed to secret-race details. Pixie/Fairy and named secret-concept intent are closed. |
| RECOVERY-005 | Narrowed to other missing racial terrain/capability tables. Innate Flying is now established design with an implementation gap. |
| RECOVERY-006 | Narrowed future-class recovery around the settled Fairy reference and Summoner +2 MAX MP exception. |
| RECOVERY-007 | **Closed:** Mage grant and five-ability intent now directly established. Surviving rounding, balance and migration questions have separate records. |
| RECOVERY-009 | Narrowed to relative-power/Combat Rating and broader XP awards; threshold adoption no longer needs recovery. |
| RECOVERY-010 | Narrowed to exact MC defeat/recovery procedure, with historical leads and explicit limits below. |
| RECOVERY-015 | Added exact Refine behavior as a dedicated recovery item. |

No entire existing TBD row was closed because each affected row retains an unanswered component. Ten existing TBD rows were narrowed or reclassified; TBD-009 received a contextual finality correction. Three TBD rows were added. Five recovery rows were narrowed, one closed and one added.

The updated ledger retains all 38 sections, 119 registered-ability rows, 13 documentary-ability rows, 36 spell rows and ten item rows. It has 194 topic records, 66 TBD rows, 15 recovery rows (**14 open, one closed**), 18 implementation-only rows and 49 candidate-index rows. The supersession/history register has 41 stable rows; SUPER-031 is explicitly prototype history rather than a designer-rule replacement chain.

## Implementation mismatches confirmed

The following are future implementation work, not reasons to downgrade the adjudicated design:

- **Mage:** shipping class-entry grants remain null; all five Mage abilities remain absent. Wizard’s +2 Intelligence Training is present and must not be merged with Mage’s +1 version.
- **Innate Flying:** race `movementTraits` declarations are not connected to the Flying resolver’s capability inputs. Existing source-aware hooks do not by themselves implement permanent racial Flying.
- **XP:** `ExperienceSystem` is an empty boundary. Fixed threshold and award constraints are now design facts even though the award engine is absent.
- **Skills:** the five named Skills still have null Major metadata. Follow Through records a minimum remaining MOV condition, but has no implemented 1-MOV expenditure/full execution. **Protect and Hold the Line are also `SKILLS` and carry false Major metadata**; the general “Skills are Major Actions” ruling makes their current Minor resolution a mismatch. This follows the general rule rather than granting a new exception.
- **Refine/Panacea:** existing metadata/helpers describe item combination and all-removable-status curing. Refine’s exact intended effect remains unconfirmed; Panacea’s helper is not a no-op and must not be mistaken for the adjudicated temporary behavior. Neither helper was changed.
- **Steadfast:** its displacement hook is still Player/Zeon-specific, omitting the required broader hostility relationship.
- **Summoner:** the class is absent and the current growth engine accepts primary-stat growth only. It does not implement the direct MAX MP exception.
- **MC casualties:** generic AWOL and casualty code lack the special MC branch and the specified permanent fate of other members in that defeated MC squad.
- **AWOL eligibility:** current code retains the legacy type whitelist and filters `controller===record.faction`. It chooses from live world state when due and retries blocked returns, so the destination is not permanently snapshotted; however, it skips not-yet-due records and does not perform the required daily eligibility evaluation throughout absence. Its controller check alone does not establish the new support-pledge meaning.

Affected primary records and inventories were updated alongside §35, including character stats/XP, races, class growth/grants, CP price finality, Mage abilities, Skills, settlements, End Day, Flying, casualties and hostility. R28-08 separately preserves older general defeat/retreat concepts without applying their individual survival rolls to the newly adjudicated MC-squad circumstance.

## Historical evidence and classification corrections

**Settlement provenance:** SUPER-031 retains its stable ID but is reclassified as implementation-only prototype history. R16-03 and IMP-017 make the same correction. Village’s separate adoption in the current five types does not retroactively validate the earlier taxonomy. Wilderness remains an editor non-settlement mode; it was not added as a sixth current settlement type.

**Other supersession records:** SUPER-036–041 trace XP threshold authority, Skill action costs, Refine/Panacea effect status, Summoner’s direct-stat exception, MC casualty priority and broader CP-cost finality. SUPER-016 retains the earlier purchase-curve adoption and its historical “final” label while linking the later P9A qualification.

**MC recovery evidence:** read-only OOXML extraction rechecked all four Word handoffs, with targeted searches of Markdown reports and current casualty/AWOL code. `docs/Shining_Farce_Project_Handoff_2026-09-15.docx` §9 states nearest player settlement, recovery, then an MC-only squad, with the campaign continuing during recovery. No exact duration or complete destination/distance/tie/eligibility/timing/game-over protocol was recovered. Those statements remain historical leads in RECOVERY-010. The recalled approximately three days was not adopted, and ordinary AWOL’s two-to-four-day delay was not substituted for MC recovery.

The older Refine/Panacea helpers, Minor Skill metadata and CP-price finality language materially differ from P9A. They are preserved and labelled; the new rulings control. No evidence was used to reject a designer ruling, and no additional unresolved conflict ID was needed for these documented implementation/history differences. Original Office files and historical reports were not edited or rendered into new artifacts.

## Candidate-index changes

The index now separates HIGH-confidence adjudicated behavior from its uncertain subcomponents. It directly indexes Mage’s grant mechanism, five abilities and +1/+2 Training distinction; innate/temporary Flying coexistence; Fairy identity and secret-race intent; XP threshold/cap/reference; Skills/Follow Through; temporary Panacea and unresolved Refine status; hostility-based Steadfast; Summoner’s +2 MAX MP; the MC exemption/squad fate; settlement taxonomy; and daily, type-independent AWOL eligibility.

Mage’s 100 grant remains explicitly provisional. Final CP balance, Seething/Efficiency rounding, full XP awards, unfinished classes, and exact MC recovery are not HIGH-confidence completed mechanics. Existing ordinary-AWOL and Dead/conclusion candidates now identify the MC exception rather than implying an unrestricted permanent-loss rule.

## Validation

| Check | Result |
| --- | --- |
| Authorized file scope | Only the recovery ledger modified and this report created |
| Protected-file integrity | SHA-256 comparison of **408 pre-existing files outside the two allowed document paths and `.git`** matched the start-of-task baseline; no protected file added, removed or modified |
| Gameplay/runtime/data/editor/tests/assets | Unchanged, including historical reports, Office handoffs and workbooks |
| Save schema | **8**, unchanged; no save/migration changes |
| Deterministic regression | `node tools/test-foundation.cjs` — **778/778 passed**, exit code0; no tests modified |
| Conflict coverage | All ten stable conflict records adjudicated; nine RESOLVED, CONFLICT-009 PARTIALLY RESOLVED |
| Record structure | All 38 sections retained; no duplicate record IDs, undefined explicit register references or malformed table column counts |
| Scope-specific checks | Mage100 Current/0Lifetime and provisional amount, Mage+1/Wizard+2, fixed100XP/max49/reference49, innate-vs-temporary flight, direct Summoner MAX MP, Fairy identity and prototype settlement provenance verified in affected records |
| Surviving uncertainty | Formula/rounding/ability-detail questions preserved; no exact MC recovery location protocol or duration fabricated |
| Final canonical specification | Not created |

The passing suite confirms the existing implementation is unchanged; it does not certify implementation of the new design rulings. The ledger is ready for continued human review of the remaining recovery and deferred-design records.
