# Shining Farce — Prompt #9 Recovery Report

Completed 18 September 2026. Deliverable: `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md`.

This work recovers repository evidence for designer review. It does not establish the final canonical design, resolve conflicting rules, supply missing balance values, or implement gameplay corrections. `SHINING-FARCE-CANONICAL-DESIGN-SPECIFICATION.md` was not created.

## Scope and counts

The ledger contains all 38 requested sections, including separate deferred-design, supersession, conflict, recovery, implementation-only and canonical-candidate tables. Stable record IDs support follow-up decisions without treating implementation as design authority.

| Measure | Count | Interpretation |
| --- | ---: | --- |
| Required major sections | 38 | Methodology through Canonical Candidate Index |
| Substantive topic records | 193 | `R02`–`R32` records, excluding the separate inventory rows below |
| Registered ability inventory | 119 | `ABL` rows; eight current classes |
| Additional documentary ability records | 13 | `DOCABL` rows; absent, historical or prospective evidence |
| Spell inventory | 36 | `SPL` rows; cross-references spell Actions already represented in the ability inventory |
| Shipping item inventory | 10 | `ITM` rows; distinguishes the effective catalog from older empty placeholders |
| Explicit TBD/deferred items | 63 | `TBD-001`–`TBD-063`; grouped unresolved questions, not every null field counted separately |
| Superseded-rule chains | 35 | `SUPER-001`–`SUPER-035`; preserves old and replacement evidence |
| Unresolved conflicts | 10 | `CONFLICT-001`–`CONFLICT-010`; includes uncertain design-to-implementation lineage |
| Needs-recovery items | 14 | `RECOVERY-001`–`RECOVERY-014` |
| Notable implementation-only decisions | 18 | `IMP-001`–`IMP-018`; grouped implementation/fixture conventions |
| Canonical candidate index rows | 37 | Navigation aid with HIGH/MEDIUM/LOW confidence, not approvals |

The 193 topic records plus 178 inventory records yield 371 substantive record locations. This is not a claim of 371 independent mechanics: spell rows deliberately provide detailed views of abilities, and a single topic can contain several linked rules. Conflict, history and candidate tables cross-reference these records rather than increasing that total.

The inventories cover seven ordinary races, eight current classes, legacy class compatibility, named future class concepts, all 119 registered abilities, 36 spells and ten shipping items. Provisional values, unresolved values, fixture content and callable hooks are distinguished from fully integrated battle commands.

## Repository evidence inspected

The starting working tree contains 407 tracked files outside `.git`. The inventory includes 208 text/code files, nine Office documents, 183 PNGs and seven extensionless support files. The text/code corpus comprises 171 JavaScript files, nine CJS tools, three CSS files, one HTML file, three JSON files, 17 Markdown files and four text logs. PNGs comprise 31 assets and 152 retained verification images.

Inspection combined the full file inventory, broad text searches, targeted source reading, Office text/cell extraction, runtime catalog inspection, retained verification records and a fresh deterministic test run. The inventory count does not imply line-by-line manual review of every file or visual review of every image.

| Area | Files/directories and inspection |
| --- | --- |
| Runtime and architecture | `README.md`, `docs/ARCHITECTURE.md`, `index.html`, `js/bootstrap.js`, `js/main.js`, configuration and classic-script load order; offline structure and presentation boundaries |
| Historical implementation reports | `docs/IMPLEMENTATION.md`; `docs/PROMPT2-IMPLEMENTATION.md`; `docs/PROMPT2.5-IMPLEMENTATION.md`; `docs/PROMPT3-IMPLEMENTATION.md`; `docs/PROMPT3.5-IMPLEMENTATION.md`; `docs/PROMPT4-IMPLEMENTATION.md`; `docs/PROMPT5-IMPLEMENTATION.md`; `docs/PROMPT6-IMPLEMENTATION.md`; `docs/PROMPT6A-IMPLEMENTATION.md`; `docs/PROMPT6B-IMPLEMENTATION.md`; `docs/PROMPT7-IMPLEMENTATION.md`; `docs/PROMPT8-IMPLEMENTATION.md`; `docs/PROMPT8A-IMPLEMENTATION.md` |
| Design handoffs | `docs/SHINING_FARCE_HANDOFF_AFTER_PROMPT5.md`; extracted text from `docs/Shining_Farce_Project_Handoff_2026-09-15.docx`, `docs/Shining_Farce_Handoff_2026-09-16.docx`, `docs/Shining_Farce_Handoff_After_Prompt7.docx` and `docs/Shining_Farce_Art_Asset_Generator_Handoff.docx` |
| Class workbook history | Extracted worksheets and original cell coordinates from `docs/Shining_Farce_Class_Design_v1.xlsx` through `docs/Shining_Farce_Class_Design_v5.xlsx`; compared successive versions and documentary descriptions with the current catalogs |
| Configuration and content | `js/config/`, `js/data/`: races, classes, abilities, spells, growth/CP, equipment catalog, campaign world/resources, authored content, terrain and test/debug fixtures |
| Runtime behavior | `js/core/`, `js/campaign/`, `js/entities/`, `js/systems/`, `js/states/`, `js/ui/`, `js/editor/`: persistence, eligibility, action/CP attribution, spell/reaction ordering, casualties, CT, deployment, economy, route movement, authoring, controls and rendering |
| Deterministic evidence | `js/debug/` assertions and fixture boundaries; `tools/test-foundation.cjs` and other verification tools. Tests confirm current implementation, not independent designer adoption |
| Art and retained verification | `assets/README.md`, asset manifest/source references, PNG dimensions; `verification/results.json`, `verification/palette-results.json`, `verification/offline-structure.json`, `verification/rule-checks.txt`, `verification/runtime-scan.txt`, `verification/render-log.txt`, `verification/developer-render-log.txt` and screenshot inventory |
| Git history | Read-only status/diff/history inspection. Available history is consolidated and does not recover all original prompts or designer conversations |

All 67 requested completeness terms were searched across the text/code corpus and extracted Office contents, with related symbol/name variants inspected where relevant. Every requested term appeared somewhere in that corpus. Short terms such as CT produce broad matches; these searches were a discovery aid and were not used as proof of a particular rule. The two new documents were excluded from the source corpus so they could not corroborate themselves.

The effective catalogs were inspected in classic-script order in an isolated Node VM, excluding the application entry point. This matters because a later file can replace an earlier empty registry: the shipping item catalog comes from `js/data/campaignResources.js`, while `js/data/items.js` retains an older empty placeholder. Extracted Office content and audit intermediates were kept outside the repository.

## Important discoveries

1. **Mage design is not fully reflected in current code.** H5, W5 and H6B preserve a 100 Current CP / zero Lifetime CP initial grant and five Mage passives. The current grant remains unresolved and the five passives are absent. No explicit rescission was recovered. See CONFLICT-001/002; the ledger preserves the documented rules instead of treating absence as a replacement decision.
2. **Racial flight declarations and tactical flight capabilities are disconnected.** Birdfolk/Fairy metadata and the flight resolver use different representations. The record distinguishes a declared trait, a movement capability and later limits on granting inherent racial powers. See CONFLICT-003.
3. **AWOL has two unresolved boundaries.** The early MC-survival concept needs reconciliation with the generic losing-side casualty rule (CONFLICT-009). The return-location filter still uses legacy settlement types, potentially excluding newly authored Towns, Cities, Forts and Castles (CONFLICT-010). Neither was repaired during this documentation task.
4. **Ability metadata does not always establish playable behavior.** Five skill costs remain null while the turn system generally treats Skills as Major Actions; Steadfast's current hostility hook does not encompass Wilderness. These are CONFLICT-006/007. The inventories distinguish data, hooks, services and integrated commands.
5. **Several important corrections have recoverable lineage.** Prayer is 25%; CT preserves actual overshoot (AGI15 first reaches1005 and retains5); deployment uses preference then overflow without Front/Back bonuses; Ocean is ordinarily impassable while legitimate Flying uses one MOV. Historical alternatives remain in the supersession ledger.
6. **Visual and architecture documents contain stale generations.** The ledger traces 160×144, 320×240 and 480×360 framebuffers, the later four-color correction, 16px map art and old viewport/scroll constants. Current map-sprite enlargement is not a final Battle Scene art specification.
7. **The source corpus retains substantial future design.** Planned classes, diplomacy, intel, wilderness encounters, Zeon's missions, Jewels and quest/event concepts were recovered alongside implemented systems. The older 10×9 foundation map and provisional economy/spell-lab numbers remain explicitly historical or fixture evidence.

The remaining conflict rows cover Fairy/Pixie identity, Character XP lineage and Summoner MP-growth terminology. The report does not rank any conflicting side as a newly adopted rule; the ledger provides the source details needed for designer review.

## Weak evidence and inspection limits

- Most original implementation prompts and the full design-room conversations are absent from the repository. Reports and handoffs preserve decisions indirectly and sometimes label implementation as “FINALIZED.” Their provenance is stated rather than promoted to verbatim designer authority. External conversation attachments were not used to silently fill repository gaps.
- Missing numerical balance includes combat/XP/action CP, many skill magnitudes/chances, spell MP/range/magnitude, equipment metadata and future class tables. Placeholder behavior is documented separately. No missing number was inferred from a test fixture.
- H5 references a workbook filename that is not an exact match for the retained v4 filename. Workbook chronology is supported by versions/content; filesystem timestamps alone do not establish designer precedence. Missing or uncertain historical sources have recovery records.
- Office documents were inspected through OOXML text and cell extraction. Their visual layout was not rendered, and formatting alone was not treated as proof of a later design decision. No Office files were edited.
- PNG dimensions and retained verification outputs were inspected, but all 152 screenshots were not individually reviewed visually. Existing render/palette/offline results are historical evidence; they were not represented as fresh browser checks. Some retained scans describe older milestones, including the 143-file #6B scan, rather than the current 171 JavaScript files.
- A real browser `file://` launch, native input/gamepad behavior and browser-specific storage were not retested. The fresh regression result below covers the deterministic Node suite. Passing that suite does not certify complete tactical integration or resolve documentary conflicts.
- The preliminary whole-directory hash included `.git` metadata, which changed during app activity. It is therefore not claimed as an unchanged-directory proof. Final Git comparison of all 407 tracked working-tree files is the basis for the unchanged-source confirmation.

## Validation and change boundary

| Check | Result |
| --- | --- |
| Existing regression command | `node tools/test-foundation.cjs` |
| Fresh test result | **778/778 passed; exit code0; no failing checks** |
| Required sections | 38, numbered consecutively |
| Record audit | No duplicate defined IDs; no undefined references among TBD/SUPER/CONFLICT/RECOVERY/IMP IDs; no remaining inventory placeholder markers |
| Source/gameplay changes | `git --no-optional-locks diff --exit-code HEAD --` clean; all 407 existing tracked files unchanged |
| Save schema | Remains **8**; no configuration, migrations or persistence code changed |
| Authored content/assets/tests/history | No edits to existing authored content, PNGs, deterministic tests, implementation reports, handoffs or workbooks |
| New project files | Only `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md` and `docs/PROMPT9-RECOVERY-REPORT.md` |
| Final canonical specification | Not created |

No gameplay fixes were attempted for the discovered conflicts. Human review of the ledger is required before any of its candidates are promoted into the future canonical specification.
