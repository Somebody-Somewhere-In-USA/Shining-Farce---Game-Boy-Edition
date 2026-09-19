# Shining Farce — Canonical Design Recovery Ledger

Repository evidence through Prompt #8A; recovered 18 September 2026 for Prompt #9. **This is an evidence ledger for human review, not the canonical design specification.** No gameplay decision is made by this document.

## 1. Ledger Methodology

Each numbered record separates intended design, current implementation, and uncertainty. A report calling something “FINALIZED” is not automatically a designer quotation: for example, `docs/PROMPT5-IMPLEMENTATION.md` defines that word as a rule implemented in its applicable service. Code, assertions and passing tests establish implementation, not adoption by the designer. A missing implementation does not rescind a documented decision.

| Code | Evidence classification |
| --- | --- |
| A | Explicit designer decision recorded as accepted/established in a design handoff or request |
| B | Explicit later designer correction or replacement |
| C | Implementation confirmation: report, source, or deterministic check |
| D | Implementation-only choice without sufficient evidence of designer adoption |
| E | Fixture/debug/example content, not production design |
| F | Provisional/tunable design or working balance |
| G | Explicitly TBD/deferred |
| H | Historical/superseded evidence, retained for lineage |
| I | Conflict or uncertain lineage requiring review |
| J | **UNKNOWN / NEEDS DESIGNER RECOVERY** |

Combined classifications apply to different parts of a record, not to a blanket claim of certainty. “Implemented” can mean a data declaration, a callable rule hook, a detached transaction, or a playable command; the distinction is stated. Null fields are interpreted in context: `Covering Fire.activationLimit = null` means no cap, whereas `chance = null` means unresolved probability.

Evidence paths are repository-relative. Named headings, symbols, sheet names/cells and milestones locate evidence without relying on unstable line numbers. Short source labels below expand to these exact paths throughout the ledger. `P7 §10`, for example, means the CT carryover section of the Prompt #7 implementation report, not the unavailable original prompt.

| Label | Exact source and chronological role |
| --- | --- |
| P1 | `docs/IMPLEMENTATION.md` — Campaign Core Foundation; 34-check historical implementation |
| P2 | `docs/PROMPT2-IMPLEMENTATION.md` — strategic movement; 73 checks |
| P2.5 | `docs/PROMPT2.5-IMPLEMENTATION.md` — spatial presentation; 87 checks |
| P3 | `docs/PROMPT3-IMPLEMENTATION.md` — economy/logistics/16px assets; 133 checks |
| P3.5 | `docs/PROMPT3.5-IMPLEMENTATION.md` — races/stats; 195 checks |
| P4 | `docs/PROMPT4-IMPLEMENTATION.md` — class foundation; 266 checks; records individual-character prerequisite clarification |
| H4 | `docs/Shining_Farce_Project_Handoff_2026-09-15.docx` — design-room handoff after #4, including future campaign/narrative concepts |
| P5 | `docs/PROMPT5-IMPLEMENTATION.md` — consolidation; 362 checks |
| H5 | `docs/SHINING_FARCE_HANDOFF_AFTER_PROMPT5.md` — 2026-09-15 design handoff after #5 and subsequent Mage design |
| W1–W5 | `docs/Shining_Farce_Class_Design_v1.xlsx` through `docs/Shining_Farce_Class_Design_v5.xlsx` — ordered workbook versions; chronology inferred from version/content, not filesystem dates |
| P6 | `docs/PROMPT6-IMPLEMENTATION.md` — spell framework; 454 checks |
| P6A | `docs/PROMPT6A-IMPLEMENTATION.md` — corrective pass plus subsequent Prayer clarification; final report 516 checks, comprising 509 plus seven Prayer checks |
| P6B | `docs/PROMPT6B-IMPLEMENTATION.md` — midpoint and Prayer verification; 538 checks |
| H6B | `docs/Shining_Farce_Handoff_2026-09-16.docx` — explicit design state after #6B |
| P7 | `docs/PROMPT7-IMPLEMENTATION.md` — battle foundation and final CT answer; 618 checks |
| H7 | `docs/Shining_Farce_Handoff_After_Prompt7.docx` — 2026-09-17 design state, including prospective developer-tool ideas |
| P8 | `docs/PROMPT8-IMPLEMENTATION.md` — 2026-09-18 developer/editor/input/four-color migration; 736 checks |
| P8A | `docs/PROMPT8A-IMPLEMENTATION.md` — deployment/Ocean corrections; 778 checks |
| ART | `docs/Shining_Farce_Art_Asset_Generator_Handoff.docx` — 2026-09-18 art handoff; four colors and explicit limits of that handoff's knowledge |
| ARCH | `docs/ARCHITECTURE.md` — cumulative implementation document; early paragraphs retain old facts, later numbered-prompt sections explicitly override them |

All 17 pre-existing Markdown documents, four Word handoffs, five workbooks, configuration/data, runtime/service/UI/editor code, debug tests, optional tools and verification records were inventoried and searched. OOXML text/cells were extracted read-only; workbook versions were compared, including comparison sheets. Asset dimensions come from manifests, documented contracts and PNG headers, never visual estimation. Screenshots are evidence of rendering only. No new asset or gameplay verification captures were generated.

The repository does not contain the original full implementation prompts or complete designer conversations. A handoff's attribution to the designer is therefore retained as documentary evidence, with its limitations; this ledger does not pretend to have recovered the underlying transcript. Git has two consolidation-era commits (`11bb7b9`, `6dcc6ea`), not a complete prompt-by-prompt history. Version labels and explicit correction statements establish most chronology.

Identical facts are recorded once and cross-referenced. Sections 33–38 consolidate open questions, supersession, conflicts, recovery gaps, implementation choices and candidates. Their IDs are stable review targets. Missing rules are **UNKNOWN / NEEDS DESIGNER RECOVERY**. Neither a fixture's number nor an apparent bug is repaired here.

## 2. Project / Runtime Architecture

| Record | Recovered design and current evidence | Status | Evidence |
| --- | --- | --- | --- |
| R02-01 | ZIP → extract complete folder → double-click `index.html`; vanilla JS, classic scripts in dependency order, one `window.GBTRPG` namespace, local replaceable PNGs. No player install/server/build/npm, ES modules, runtime fetch/XHR or remote dependency. Optional Node/Canvas tools are development tools only. | A/C | H4 §1; H7 §1; `index.html`; `js/bootstrap.js`; `js/core/Assets.js`; ARCH “Boundaries and loading”; `tools/test-foundation.cjs` |
| R02-02 | Campaign owns privately held state, deeply frozen views, clone/validate/commit commands and immutable post-commit events. Definitions differ from runtime facts. UI/renderers do not own campaign rules. Tactical receives detached `BattleScenario`; returns validated `BattleResult`. | A/C, implementation details D | P1 “Implemented”; P2 “New authoritative state”; `js/campaign/Campaign.js` command facade; `js/campaign/CampaignState.js`; `js/campaign/BattleBoundary.js`; `js/core/EventBus.js` |
| R02-03 | Logical framebuffer lineage: 160×144 (#1/#2) → 320×240 (#2.5–#6B) → 480×360 (#7 onward). Real drawing-buffer migration, not stretching old content. Integer enlargement; nearest-neighbor; tiny windows retain 1× and may scroll. | B/H/C | P1 verification; P2.5 §3–5; P7 §4; H7 §1; `js/config/gameConfig.js`; `js/config/graphicsConfig.js`; `js/rendering/Renderer.js`; `css/game.css` |
| R02-04 | Campaign schema is 8. Battle CT/resources/status/event stack/presentation remain transient; full tactical session saving and resource reconciliation are not established. Editor document and control profile each version 1, separate from campaign. | C/G | P6A “AWOL campaign resolution and save schema”; P7 §21; P8 persistence; `js/config/campaignConfig.js`; `js/states/BattleState.js`; `js/editor/EditorDocument.js`; §32 below |
| R02-05 | Mobile/Android host shell is a later packaging concept: pixel handheld overlay, bottom virtual controls, host separated from game framebuffer; desktop retains clean game viewport. No touch host is implemented. Broader host-shell colors do not license extra game colors. | A/G | H4 §4; `assets/README.md`; ARCH visual philosophy; `js/core/Input.js` action interface |
| R02-06 | Current structural evidence: 171 local classic scripts, one stylesheet, no missing dependencies/syntax errors; 22 runtime PNG manifest entries, 31 total asset PNGs. Browser double-click and real Xbox hardware remain unverified. Offline Canvas2D captures are not browser screenshots. | C/E, verification limitation | P8A outcome; `verification/offline-structure.json`; `verification/palette-results.json`; `verification/results.json`; `js/data/assets.js` |

## 3. Terminology

| Record | Term and distinction | Status / evidence |
| --- | --- | --- |
| R03-01 | **Campaign Map** = graph world, locations, control, squads, travel and interceptions. **Battle Map** = individual-unit tile battlefield. **Battle Scene** = cinematic presentation of an action-resolution chain. “Tactical map” is historically ambiguous and discouraged in current design-room terminology. | A; H7 §2; P7 §§14–16. Old code filenames such as `js/systems/TacticalMovementRules.js` are retained implementation names. |
| R03-02 | Character Level ≠ Class Level; Current CP ≠ Lifetime CP; Action Ability ≠ Major Action. Primary/Secondary describes ownership/access, not two independent Major budgets. | A/C; H4 §§14–16; H5 §§5–9; P5 §§4–5; `js/systems/TurnSystem.js` |
| R03-03 | “Wilderness Location” means no active settlement; WILDERNESS combat faction means hostile unaffiliated units. NEUTRAL settlement/controller and polity allegiance are separate domains. Legacy HEALER/SWORDSMAN/CENTAUR disciplines are compatibility IDs, not newly finalized classes. | C/A; P8 location/faction sections; P4 §4; `js/editor/LocationModel.js`; `js/data/classes.js`; `js/systems/FactionSystem.js` |
| R03-04 | Light/heavy bow denote distinct weapon types/stat profiles, **not numerical weapon weight**. Existing LIGHT/MEDIUM/HEAVY selector labels are categorical metadata; no mass, encumbrance or weight-to-speed formula is recovered. | B/C; H6B §1/§14; H7 §5; `js/data/equipmentFamilies.js`; `js/campaign/EquipmentEligibility.js` |

## 4. Visual Specification

| Record | Recovered specification | Status / evidence |
| --- | --- | --- |
| R04-01 | Current four colors: `#9BBC0F`, `#8BAC0F`, `#306230`, `#0F380F`; visible pixels opaque, transparent asset pixels permitted. No fifth shade, antialiasing, gradients, partial-alpha color blending or browser fonts in game UI. `PALETTE.background` aliases lightest. | B/C; ART §§2–4; P8 four-color migration; `js/config/palette.js`; `js/rendering/PixelTextRenderer.js`; `verification/palette-results.json` |
| R04-02 | #1/#2 restricted art to four shades while retaining `#CADC9F` as background context; #2.5 allowed all five greens for art. #8 removes `#CADC9F` from runtime and shipping PNGs. Historical five-color instructions are superseded, not concurrent alternatives. | H/B/C; P1 verification; P2.5 files/acceptance; H4 §3; P8 migration |
| R04-03 | Campaign native tiles/squads/cursors/wagons/ordinary markers 16×16 since #3; capital icon 32×32, still one graph node. #2.5 used 8×8 strategic cells. Battle tiles and map hero 16×16. H5 says even Centaur occupies one square. These contracts do not establish future Battle Scene sprite dimensions. | A/B/C; H4 §3; H5 “Visual / runtime baseline”; P2.5 §3–6; P3 §4; `assets/README.md`; `js/config/gameConfig.js` |
| R04-04 | Shipped campaign sample 64×40 cells = 1024×640px. Current Campaign viewport `(0,16,480,312)`, 16px header/32px footer; unedited world clamp maxima 544×328 by subtraction. Earlier viewport 320×192 and maxima 704×448 are historical. Battle viewport 352×288 is current layout, not a universal design constraint. | C/D; `js/config/gameConfig.js` MAP_VIEW; `js/rendering/WorldCamera.js`; `js/rendering/BattleMapRenderer.js`; P3 §4; P7 §4. Maxima calculation is explicitly derived from source dimensions. |
| R04-05 | Bitmap font atlas 96×32, 16 columns of 6×8 cells/5×7 ink; window atlas 12×12 with 4px nine-slice cells; cursor atlas 24×16 with `(16,0,8,8)` menu arrow. Terrain sheet 96×16/six cells; location sheet 64×16/four cells; Portal faces 16×16. | C/D asset contracts; `assets/README.md`; `js/data/assets.js`; `js/rendering/PixelTextRenderer.js` |
| R04-06 | Campaign terrain, locations, route lines and squad offsets are independent layers. Control uses hollow bar/one line/two blocks for Neutral/Player/Zeon; station underline and +N stack count; proposed route dashed, confirmed thicker; Q cycles stack. Presentation choices do not change geography. | A/C/D styling; P2.5 §§7–11; P3 §5–6; `js/ui/MapPresentation.js`; `js/rendering/WorldMapRenderer.js` |
| R04-07 | Scene uses existing enlarged map-sprite placeholders and opaque palette dithering. Final Battle Scene sprite frame size, background sizes, sheet layout and animation production standard are **UNKNOWN / NEEDS DESIGNER RECOVERY**. ART explicitly excludes producing this art. Its omission of map tile/sprite dimensions is a scope limitation, not evidence that earlier 16px contracts were revoked. | G/J/C; ART §§5–8/10/12; P7 §§4/15/26; `js/rendering/BattleSceneRenderer.js`; RECOVERY-001 |

## 5. Input / Controls

| Record | Action | Keyboard defaults | Standard gamepad defaults | Evidence/status |
| --- | --- | --- | --- | --- |
| R05-01 | Up/down/left/right | Arrows and W/S/A/D | D-pad indices 12/13/14/15; left-stick axes 0/1 | C; `js/core/Input.js` keyboard/buttons/pollGamepads; P8 input section |
| R05-02 | Confirm/Accept | Enter, Space, Z | A / 0 | Same; `accept` aliases `confirm` |
| R05-03 | Cancel | Escape, Backspace, X | B / 1 | Same |
| R05-04 | Menu | Tab, M | RT / 7 | Same |
| R05-05 | Start | P | Menu / 9 | Same; campaign also opens menu; tile picker previous variant |
| R05-06 | Select | Q | LB / 4 | Same; campaign stack cycling, battle forecast paging, tile picker next variant |
| R05-07 | Terminal | Backtick/grave | View / 8 | A/C; H7 §8.1; P8 Terminal; Input defaults |
| R05-08 | Dev Menu | `]` | RB / 5 | C; P8 developer layer; unavailable without Devmode |

| Record | Architecture / interaction | Status / evidence |
| --- | --- | --- |
| R05-09 | Logical queue shared by keyboard/gamepad; repeated directions accepted, repeat confirmations/menu suppressed; remap devices separately, explicit conflict reassignment/cancel, restore defaults, preserve required navigation. Controls persist independently; text entry still keyboard. | A/C; H4 §4; P8 input/remapping; `js/core/Input.js`; `js/editor/DeveloperShell.js` controls/text screens; `js/debug/DeveloperToolsTests.js` |
| R05-10 | Stick threshold 0.55; button threshold >0.5; initial repeat 350ms then 110ms; queue capacity 32; standard mapping filtering and per-poll deduplication. These are implementation values, not recovered balance decisions. Keyboard direction repeats use incoming repeat events. | D; `js/core/Input.js` pollGamepads/gamepadAction/enqueueAction; IMP-001 |
| R05-11 | Property screen: navigate while unfocused; Accept boolean toggles immediately, number/enum focuses a draft, directions change, Accept commits, Cancel restores; submenus/text/multi-select separate. Editor cursor movement never paints; Accept paints. Cancel opens context; Menu tools. | C; P8 “Common property interaction”/authoring; `js/editor/PropertyScreen.js`; `js/editor/MapEditorState.js` |

## 6. Character Data Model

| Record | Recovered design / implementation | Status / evidence |
| --- | --- | --- |
| R06-01 | Growing primaries STR/DEX/CON/AGI/INT/WIS. STR melee; DEX ranged; CON HP, physical-debuff resistance and daily recovery; AGI initiative/dodge/single-target-spell dodge/double attacks; INT MP/spell damage; WIS healing/buffs/mental-magical resistance. Responsibilities are designed; most combat formulas remain TBD. | A/C/G; H4 §12; P3.5 §§5–9; `js/config/characterStatsConfig.js`; `js/campaign/CharacterStatsSystem.js`; §33 |
| R06-02 | Character Level cap 100 is current supported implementation. Level N has exactly N−1 growth events: six independent inclusive racial rolls plus fixed current class/support growth, accumulated permanently. Changing class never recalculates past growth. Generated recruits use same engine; no full per-level class history. | A/C/F cap provenance; P3.5 §§8–11; H4 §12; `js/campaign/CharacterGrowthSystem.js`; `js/campaign/CharacterValidation.js`; `js/debug/CharacterStatsTests.js` |
| R06-03 | Provisional MAX HP = `max(1,10+2×effective CON+racial HP offset+direct modifiers)`; MAX MP = `max(0,effective INT+racial MP offset+direct modifiers)`. MOV = `max(0,racial MOV+current class MOV+equipment/effects)`; DEF from equipment/effects, innate 0, no Beastman compensation. MOV/DEF do not grow; HP/MP not independently grown. | A/F/C; H4 §12; P3.5 §7; `CharacterStatsSystem.deriveStats`; `characterStatsConfig.capacity` |
| R06-04 | Persistent identity: stable id/name/typeId/faction/status/unassignedLocationId plus raceId, characterLevel, currentClassId, basePrimary, growthRngState, classProgress, learnedAbilityIds and abilityLoadout. Squad membership derives from ordered squad IDs; no duplicate unit→squad authority. Derived stats recomputed; candidates store generated progression, not rerolled on purchase. | C; P3.5 §5; P4 §3; P5 §3; `CharacterGrowthSystem.progressionKeys`; `js/campaign/UnitManagementSystem.js`; `js/campaign/CharacterValidation.js` |
| R06-05 | Campaign status ACTIVE/DEFEATED/CAPTURED/DEAD/AWOL differs from transient ALIVE/DYING/DEAD/AWOL tactical life and status effects. Current HP/MP and most persistent attrition are not campaign fields. Refreshing derived tactical stats preserves spent resources, clamps decreases, never implicitly heals. | C/G; P3.5 §15; P6/P6A lifecycle/schema; `js/campaign/BattleStatAdapter.js`; `js/entities/Unit.js`; `js/systems/BattleStatusSystem.js` |
| R06-06 | XP concept: H4 says 100 XP per Character Level; meaningful successful accomplishments, killing-blow kill XP, relative Combat Rating scaling, no shared/battle-completion award. Later reports say XP thresholds/awards deferred, and `ExperienceSystem` is empty. Preserve proposed concept, do not adopt 100 as implemented or silently erase it. | I/G; H4 §14; P5 §16; `js/systems/ExperienceSystem.js`; CONFLICT-005 |
| R06-07 | Growth randomness serialized separately per character; LCG `(1664525×state+1013904223) mod 2^32`, fixed STR/DEX/CON/AGI/INT/WIS order, inclusive integer mapping. These exact generator constants are implementation decisions; deterministic/repeatable growth is the design. | A/C/D; P3.5 §8; `js/core/DeterministicRandom.js`; `js/campaign/CharacterGrowthSystem.js` |

## 7. Races

All seven ordinary races below exist in current `G.data.RACES`. **Every numeric start/growth range, MOV and HP/MP offset is provisional balance (F), not a final racial terrain table.** Tuple order is STR, DEX, CON, AGI, INT, WIS. Intervals are inclusive. Evidence for every row: `js/data/races.js` named race object (C/F), P3.5 §§6/21, H4 §13 (recorded design). This is a complete data extraction, not interpolation.

| Record | Race / production ID | Starting ranges | Growth ranges per level | MOV | HP / MP offsets | Declarations |
| --- | --- | --- | --- | --- | --- | --- |
| R07-01 | HUMAN | 8–12; 8–12; 8–12; 8–12; 8–12; 8–12 | +1–2; +1–2; +1–2; +1–2; +1–2; +1–2 | 5 | 0 / 0 | None additional |
| R07-02 | ELF | 7–10; 10–13; 7–10; 10–13; 10–13; 10–13 | +0–1; +1–3; +0–1; +1–3; +1–3; +1–3 | 5 | -4 / 8 | None additional |
| R07-03 | DWARF | 10–13; 7–10; 10–13; 7–10; 7–10; 8–12 | +1–3; +0–1; +1–3; +0–1; +0–1; +1–2 | 4 | 6 / -4 | None additional |
| R07-04 | CENTAUR | 10–13; 8–12; 8–12; 10–13; 8–12; 8–12 | +1–3; +1–2; +1–2; +1–3; +1–2; +1–2 | 7 | 4 / 0 | None additional |
| R07-05 | BIRDFOLK | 8–12; 11–14; 7–10; 11–14; 8–12; 10–13 | +1–2; +2–3; +0–1; +2–3; +1–2; +1–3 | 7 | -4 / 0 | FLIGHT |
| R07-06 | BEASTMAN | 10–13; 7–10; 8–12; 10–13; 8–12; 7–10 | +1–3; +0–1; +1–2; +1–3; +1–2; +0–1 | 5 | 4 / 0 | forbidden weapon; forbidden armor |
| R07-07 | FAIRY | 8–12; 7–10; 5–8; 11–14; 10–13; 11–14 | +1–2; +0–1; +0–1; +2–3; +1–3; +2–3 | 7 | -10 / 6 | FLIGHT; singleTargetDebuffCure |

| Record | Additional recovered race evidence | Status / evidence |
| --- | --- | --- |
| R07-08 | Beastman cannot equip weapons or armor; accessories allowed. Current eligibility also rejects off-hand definitions categorized WEAPON or ARMOR; no separate universal shield rule is inferred. No natural DEF compensation. Race restrictions outrank class/support permission. | A/C; H4 §§12–13; P3.5 §12; `js/campaign/EquipmentEligibility.js` allows |
| R07-09 | Birdfolk and Fairy declare `movementTraits:["FLIGHT"]`; Centaur does not. Current Flying resolver reads `capabilities:["FLYING"]` and tactical sources, not this field. Racial flight is designed/declarative but not automatically effective. | A/C/I; P3.5 §13; P6A Fly sources; `js/data/races.js`; `js/systems/FlyingSystem.js` sources; CONFLICT-003 |
| R07-10 | Fairy innate single-target debuff cure is a settled concept only. Internal `singleTargetDebuffCure` is not a final display name; no range/MP/category/cooldown/status taxonomy supplied. | A/G/C hook; P3.5 §14; `js/data/races.js` RACIAL_ABILITIES |
| R07-11 | Secret/later race candidates: Goblin, Construct, Phoenix, Dragon, Pegasus Centaur. None is an ordinary production race. Full stats, restrictions, recruitment and unlocks **UNKNOWN / NEEDS DESIGNER RECOVERY**. Pixie appears as a possible Enchanter race lock but is not established as a synonym for Fairy. | G/J/I; H4 §13; H5 §21 Enchanter; current RACES; RECOVERY-004; CONFLICT-004 |
| R07-12 | Race/class compatibility matrix remains empty; recruitment selection is independent of class-change prerequisites. Editor can select actual race/class IDs, but no final rarity/common/uncommon/forbidden matrix or new candidate generator exists. Terrain override tables are absent; no cost matrix may be fabricated. | G/C; H4 §29; P3.5 §22; P8 recruitment; `js/data/races.js` compatibility; `js/editor/LocationModel.js`; `js/systems/BattleTerrainSystem.js` normal |
| R07-13 | Aren/Sarah/Jaha/Kaz and generic healer/mage/swordsman use HUMAN development profiles; Chester uses CENTAUR. Orc art/type uses HUMAN placeholder stats, not an eighth ordinary race or lore. Race-specific final sprite catalog is incomplete; map-scale unit art is 16px, Centaur one tile. | E/G; P3.5 §21; `js/data/campaignResources.js` UNIT_TYPES/CAMPAIGN_CHARACTERS; H5 visual section; `assets/README.md` |

## 8. Classes

Eight playable disciplines are registered, plus four nonplayable compatibility IDs. Fixed growth below applies on Character Level events, never Class Level events. Blank/unknown defaults are not zero design decisions. All class prerequisites use **that character's own Class Levels**, explicitly confirmed during #4 (P4 §§4/14). Full ability tables follow in §11; missing future tables are not filled.

| Record | Class / role | Prerequisites; fixed growth | MOV; native equipment | Deployment; entry CP; implementation | Evidence / status |
| --- | --- | --- | --- | --- | --- |
| R08-01 | Fighter — conventional armed melee, remains useful beside Knight | None; +1 STR | MOV TBD (runtime 0 fallback); medium melee, medium armor | Front; no grant; playable, 14 definitions | A/C/G; H4 §19; H5 §10; P5 §7; W5 Fighter B4:B12; `js/data/classes.js` fighter; `js/config/battleConfig.js` |
| R08-02 | Knight — heavy protection/control | Fighter 3; +1 STR/+1 CON | MOV TBD (0 fallback); medium/heavy melee, medium/heavy armor, shields | Front; no grant; playable, 14 definitions | A/C/G; H5 §11; P4 §4; P5 §7; W5 Knight; classes.knight |
| R08-03 | Thief — stealing/mobile skirmisher | None; +1 AGI | +2; light weapons including light bow, light armor | Back; no grant; playable, 14 definitions; Evade excluded | A/C; H5 §12; W5 Thief with warning below; classes.thief |
| R08-04 | Archer — precision/range/covering fire | None; +1 DEX | 0; bows/light armor; current selector accepts known non-heavy bows, Bow Training adds heavy | Back; no grant; playable, 11 definitions | A/C; H5 §13; P5 §8/§21; W5 Archer; classes.archer; exact medium-bow interpretation is D |
| R08-05 | Alchemist — consumable mastery/scavenging | None currently; +1 WIS | MOV TBD (0 fallback); light weapons/light armor F | Deployment TBD; no grant; playable, 13 definitions | A/F/G/C; H5 §15; W5 Alchemist B6:B9; P5 §9; classes.alchemist |
| R08-06 | Mage — foundational elemental caster | None; +1 INT | 0 in W5/current code, older H5 cautions MOV authority; Wands/Robes only, no native Staff | Back; designed one-time 100 Current CP/0 Lifetime CP **not shipped**; 24 spell abilities, five documented passives absent | A/C/I; H5 §20; W5 Mage B9/B23, rows18–19; H6B §7; P6A equipment; `js/data/spellClasses.js`; CONFLICT-001/002 |
| R08-07 | Cleric — healing/cures/preservation | Foundational in W5; prerequisite unspecified in H6B/current metadata, no enforced lock; +1 WIS | MOV/equipment unspecified, current permissions empty; no finalized off-hand permission | Back; current grant null, no documented specific grant; playable, 15 definitions | A/G/C; W5 Cleric B4:B12; H6B §5; P6 Cleric; spellClasses.cleric |
| R08-08 | Wizard — spell modification/spatial magic | Mage 5; +2 INT | 0; Staves/Robes | Deployment TBD (Back is fixture only); current grant null; playable, 14 definitions | A/C/G/E; W5 Wizard; H6B §8; P7 §7; spellClasses.wizard; `js/data/battleFoundationFixture.js` |
| R08-09 | Paladin — advanced martial/divine, basic healing | **Knight 5 + Cleric 5 finalized**; conceptual +3 STR/+2 CON/+1 WIS | MOV/equipment/full table TBD | Front recorded in #7 defaults; not a class registry entry; grant TBD | A prerequisite/default; G conceptual fields; H4 §18; H5 §21; H7 §3.2; `CLASS_PREREQUISITE_EXAMPLES`; battleConfig.deploymentDefaults |
| R08-10 | Ranger — possible sword Fighter/Archer hybrid | Fighter/Archer levels proposed, exact levels TBD; growth TBD | Sword + heavy bow simultaneously intended; slot/hand rules TBD; MOV TBD | No class entry/default/grant; Surefooted reservation only | G; H5 §14; W5 Archer B28; `js/data/classes.js` absence; squad named RANGERS in demo is unrelated |
| R08-11 | Hexer — status/debuff caster | Some Mage + Cleric mastery conceptual; +2 WIS/+1 CON conceptual | Equipment/MOV TBD | No class/table/default/grant; Wizard Hex Arcana references future owner ID | G; H5 §21; H6B §12; `js/data/spellClasses.js` hexArcana |
| R08-12 | Enchanter — buffs/enhancement | Possibly Pixie-only; exact lock/prerequisites TBD; +2 INT/+1 AGI conceptual | Equipment/MOV TBD | No class/table/default/grant; Enchanting Arcana boundary | G/I; H5 §21; H6B §12; spellClasses.enchantingArcana; CONFLICT-004 |
| R08-13 | Elementalist — high elemental specialization/unusual geometry | High Mage + Wizard mastery, exact levels TBD; +3 INT conceptual | Equipment/MOV TBD | No class/table/default/grant; chain lightning, fire line/cone, ice cross/wall/path, air corridor are examples only | G; H5 §21; H6B §12; `js/debug/ProgressionConsolidationTests.js` future-class absence |
| R08-14 | Summoner — battlefield monsters | Race/prerequisites TBD; “medium MP growth” not reconciled with derived MP model | Equipment/MOV TBD | No class/table/default/grant | G/I; H5 §21; CONFLICT-008 |
| R08-15 | Unnamed Advanced Healer | Several Cleric levels conceptual, exact threshold TBD; +2 WIS conceptual | Equipment/MOV TBD | Owns future Raise 2 (100% MAX HP, Dying only), not Cleric; table/default/grant TBD; `advancedHealer` only compatibility-group token | A ownership/G remainder; H5 §21; H6B §§5/12; P6A Raise; `js/data/spells.js` RAISE_BEHAVIORS |
| R08-16 | Druid; unnamed time spellcaster | Both maybe concepts; no established growth/prerequisites | Equipment/MOV TBD | No implementation or tables | G/H; H4 §18 “no Shaman/Druid for now” → H5 §21 reopens Druid; no decision establishing timecaster name |
| R08-17 | Swordsman, Healer, Centaur, Starter | Compatibility disciplines only; growth/MOV neutral fallback | Legacy item class-list handling | Not selectable playable designs; no abilities or grants | C/D/H; P4 §4; `js/data/classes.js` legacy loop. Mage originally in this loop but promoted by spellClasses. |
| R08-18 | Rejected/reserved labels | Swordsman/Spearman/Axeman as separate designed weapon classes disliked; no Monk/Brawler or Shaman “for now” | No complete rules recovered | Do not erase legacy Swordsman ID or interpret rejection as permanent ban on every future concept | H/G; H4 §18; H5 Druid correction |

W1 stored unresolved martial growth; W2 introduced provisional +1 STR / +1 STR+CON / +1 AGI, W2 added Archer, W3 Alchemist, W4 Mage, W5 Cleric/Wizard and six-family Mage. W5 still repeats “provisional” growth wording while P5/H6B record finalized working class bonuses. Preserve that wording; it is not proof of a later balance reversal. H5 names `Shining_Farce_Class_Design_v4_with_Mage.xlsx`, while the repository file is `Shining_Farce_Class_Design_v4.xlsx`; matching Mage content does not prove byte-identical artifact identity (RECOVERY-002).

## 9. CP / Class Progression

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R09-01 | Class Levels 1–10 derive from Lifetime CP thresholds `0,100,250,450,700,1000,1350,1750,2200,2700`. Threshold curve provisional; cap 10 established. 2700 is recovered, not 2750. Lifetime never decreases; earning adds Current and Lifetime; spending only Current. Both may continue above Lv10 threshold. | A/F/C; H5 §5; H6B §3; P4 §4; `js/config/classConfig.js`; `js/campaign/ClassProgressionSystem.js` |
| R09-02 | Final default ability prices by required Class Level: `100,125,150,175,200,225,250,275,300,350`. Explicit numeric override permitted; explicit null refuses purchase. No automatic learning at threshold; purchases permanent and duplicate purchase rejected. | A/C; H5 §5; P5 §4; `AbilityCostSystem.cost`; `js/campaign/AbilityLearningSystem.js` |
| R09-03 | Universal Attack/Item/Equip/Trade → 100% current class; current-class Action → 100%; secondary Action → ceil(amount/2) current + floor(amount/2) owner. 11→6/5. STEAL is Thief-owned; MAGIC/SKILLS grouping does not erase ownership. Reactions/Supports/Movement do not independently earn CP. | A/C; H5 §5; H6B §3; P5 §5; `js/systems/ExecutionReceiptSystem.js`; `ClassProgressionSystem.awardAction` |
| R09-04 | Actual award amount and success/failure policy TBD. Legal executed noncancelled receipts retain success evidence; calculator may award an executed failure. Unique execution IDs prevent replay. Menus/cancellation earn nothing. “10 CP/action” discussed, not accepted. No invented per-target or modifier/counter CP. | A/G/C; H5 §§5/24; P5 §5 replaces #4 success-only filter; `js/systems/ExecutionReceiptSystem.js`; `BattleState.resolveActionCP` |
| R09-05 | Entry-grant mechanism once per character/class access, Current only, records processed amount; generation/reclass/secondary/CP access are implementation trigger points. Old migration marks known access processed with zero credit. No class currently ships a grant. Mage's documented 100 remains an implementation gap, not a general free-grant rule. | A/C/I; H5 §§6/20; P5 §6; `js/campaign/ClassEntryGrantSystem.js`; `js/data/classes.js`; CONFLICT-001 |
| R09-06 | Class change global/menu/instant in PLANNING, no day cost; individual prerequisites; unlocking does not auto-change. Recruits may arrive in a class they cannot independently enter. Incompatible gear stays physical and is reconciled, not destroyed. | A/C; H4 §14; P4 §§4/6; `js/campaign/ClassManagementSystem.js`; `ClassProgressionSystem.prerequisites`; `js/campaign/InventorySystem.js` |

## 10. Ability Loadout

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R10-01 | Primary = purchased current-class Actions, derived automatically. Secondary = purchased Actions from one other selected class. Exactly one purchased Reaction, one Support, one Movement. Learning and equipping are distinct; switching class preserves purchases. | A/C; H4 §15; H6B §3; P4 §5; `js/campaign/AbilityLoadoutSystem.js`; `js/campaign/CharacterValidation.js` |
| R10-02 | Secondary selection neither grants abilities nor equipment permission. Ability requirements validate actual legal equipped item metadata; passives affect rules only when equipped and active. Dying suppresses ordinary active effects. | A/C; H5 §§9/13; P5 §13; `js/systems/AbilityRequirementSystem.js`; `AbilityLoadoutSystem.effects`; `BattleStatusSystem.active` |
| R10-03 | One MAGIC menu combines current/secondary learned spell families → individually learned tier → compatible casting method → target; owner, source, purchase state and CP attribution survive grouping. Wizard methods require accessible purchased Wizard Action but no independent action/CP award. | A/C; H5 §§18–19; H6B §8; P6 modifiers/UI; `js/systems/SpellMenuSystem.js`; `js/systems/MagicSystem.js` |

## 11. Complete Ability Inventory

The current registry contains **119 entries**: Fighter 14, Knight 14, Thief 14, Archer 11, Alchemist 13, Mage 24, Cleric 15, Wizard 14. The tables below enumerate each stable ID rather than implying that a menu label means complete combat execution. Spell rows refer to the exact spell inventory in §12 for range/radius/magnitude/MP and targets.

Documentary design sources for the per-class tables: Fighter/Knight/Thief H4 §§19–21 and H5 §§10–12; Archer/Alchemist H5 §§13/15; Mage H6B §7; Cleric/Wizard H6B §§5/8 and H7 §4.2. W5 class sheets rows 17–20 corroborate categories/levels, subject to explicit Evade/Mage warnings. Implementation evidence for every runtime row is its named object in `js/data/abilities.js` or `js/data/spellClasses.js`, plus P4 §§7–11, P5 §§8–15 and P6 class sections. These paired sources distinguish A design structure from C metadata/hook confirmation.

Every price is Current CP from `AbilityCostSystem.cost`, not an action reward. `FUNCTIONAL`, `FUNCTIONAL_RULE`, `RULE_HOOK`, `DEFERRED` below are **literal source metadata**, not independent completion certifications. Spell transaction machinery exists, but unresolved production balance blocks casting. Many martial/item effects still require an external resolver; `BattleMapState` exposes unresolved Skills/Steal/Item/Scrounge messages. Growth/equipment/capacity services are functional independently of a complete combat resolver.

Economy/presentation columns describe current metadata resolution: Action `majorAction:false` → Minor; true → Major; null is explicitly noted, because `TurnSystem.metadata` currently falls through to a default Major despite unresolved source fields (CONFLICT-006). Reactions/passives do not spend ordinary Major Actions merely by activating. Stance command is Major/Map and ends turn; Scrounge command is Major/Map; actual Firing Position cost remains unresolved. Wizard casting methods modify a cast, not standalone Minor commands.

### FIGHTER — 14 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-001 / `powerAttack` | POWER ATTACK | ACTION / 1 / 100 | Stronger melee attack with reduced hit chance. TBD: damageMultiplier, accuracyModifier. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` powerAttack; DEFERRED |
| ABL-002 / `counter` | COUNTER | REACTION / 2 / 125 | Increases legal counterattack chance. TBD: modifier. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` counter; DEFERRED |
| ABL-003 / `feint` | FEINT | ACTION / 3 / 150 | 80% melee damage with increased accuracy. TBD: accuracyModifier. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` feint; DEFERRED |
| ABL-004 / `followThrough` | FOLLOW THROUGH | ACTION / 4 / 175 | Before attacking, attack with at least 1 MOV left; on a kill advance into the target square if legal, then allow a regular Attack. | No special weapon gate recorded | TBD field; runtime Major default (CONFLICT-006); Scene default | C: `js/data/abilities.js` followThrough; DEFERRED |
| ABL-005 / `evasiveStance` | EVASIVE STANCE | SUPPORT / 5 / 200 | Adds a turn-ending stance command that boosts dodge until next turn. TBD: dodgeBonus. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Map command | C: `js/data/abilities.js` evasiveStance; DEFERRED |
| ABL-006 / `psycheUp` | PSYCHE UP | ACTION / 6 / 225 | Boost another friendly unit's physical attack through the end of its next turn. TBD: physicalAttackModifier. | No special weapon gate recorded | TBD field; runtime Major default (CONFLICT-006); Scene default | C: `js/data/abilities.js` psycheUp; DEFERRED |
| ABL-007 / `mediumWeaponTraining` | MEDIUM WEAPON TRAINING | SUPPORT / 6 / 225 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` mediumWeaponTraining; FUNCTIONAL |
| ABL-008 / `strengthTraining` | STRENGTH TRAINING | SUPPORT / 7 / 250 | Improves future STR growth while equipped. TBD: bonus. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` strengthTraining; DEFERRED |
| ABL-009 / `cleave` | CLEAVE | ACTION / 8 / 275 | Axe attack against a target and one unit to its left or right. TBD: secondaryDamageMultiplier. | {"slot":"weapon","families":["AXE"]} | Major; Scene default | C: `js/data/abilities.js` cleave; DEFERRED |
| ABL-010 / `spearTechnique` | SPEAR TECHNIQUE | ACTION / 8 / 275 | Spear attack in a straight line: adjacent target at normal damage, farther target at 80%. | {"slot":"weapon","families":["SPEAR"]} | Major; Scene default | C: `js/data/abilities.js` spearTechnique; DEFERRED |
| ABL-011 / `thrust` | THRUST | ACTION / 8 / 275 | Sword attack: 80% damage, ignoring 80% of target DEF. | {"slot":"weapon","families":["SWORD"]} | Major; Scene default | C: `js/data/abilities.js` thrust; DEFERRED |
| ABL-012 / `battlefieldAwareness` | BATTLEFIELD AWARENESS | SUPPORT / 9 / 300 | Unaffected by friendly offensive area magic, including damage, debuffs and status spells. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` battlefieldAwareness; RULE_HOOK |
| ABL-013 / `mediumArmorTraining` | MEDIUM ARMOR TRAINING | SUPPORT / 9 / 300 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` mediumArmorTraining; FUNCTIONAL |
| ABL-014 / `movePlusOne` | MOVE +1 | MOVEMENT / 10 / 350 | Adds one MOV while equipped. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` movePlusOne; RULE_HOOK |

### KNIGHT — 14 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-015 / `shieldBash` | SHIELD BASH | ACTION / 1 / 100 | Low damage shield attack with 75% Stun chance. TBD: damageMultiplier. | {"slot":"offHand","kinds":["SHIELD"]} | Major; Scene default | C: `js/data/abilities.js` shieldBash; DEFERRED |
| ABL-016 / `guard` | GUARD | REACTION / 2 / 125 | Shield determines activation chance; reduces incoming attack damage. TBD: reduction. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` guard; DEFERRED |
| ABL-017 / `chivalry` | CHIVALRY | SUPPORT / 3 / 150 | Adjacent and diagonally adjacent allies gain 5% of source total DEF while nearby. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` chivalry; RULE_HOOK |
| ABL-018 / `protect` | PROTECT | ACTION / 4 / 175 | Swap positions with a friendly unit; spend remaining MOV and prevent further voluntary movement. Once per turn. | No special weapon gate recorded | Minor; Scene default | C: `js/data/abilities.js` protect; DEFERRED |
| ABL-019 / `heavyWeaponTraining` | HEAVY WEAPON TRAINING | SUPPORT / 4 / 175 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` heavyWeaponTraining; FUNCTIONAL |
| ABL-020 / `cover` | COVER | REACTION / 5 / 200 | 50% chance to take an adjacent ally's incoming physical attack. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` cover; DEFERRED |
| ABL-021 / `twoHanded` | TWO-HANDED | SUPPORT / 6 / 225 | Use both hands and double the equipped weapon's ATK; off-hand items are forbidden. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` twoHanded; FUNCTIONAL |
| ABL-022 / `crushingBlow` | CRUSHING BLOW | ACTION / 7 / 250 | Mace or hammer: add full target DEF to damage, then resolve against half target DEF. | {"slot":"weapon","families":["MACE","HAMMER"]} | Major; Scene default | C: `js/data/abilities.js` crushingBlow; DEFERRED |
| ABL-023 / `constitutionTraining` | CONSTITUTION TRAINING | SUPPORT / 7 / 250 | Improves future CON growth while equipped. TBD: bonus. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` constitutionTraining; DEFERRED |
| ABL-024 / `steadfast` | STEADFAST | MOVEMENT / 8 / 275 | Immune to enemy-caused forced displacement; permits friendly repositioning and voluntary movement. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` steadfast; RULE_HOOK |
| ABL-025 / `equipShields` | EQUIP SHIELDS | SUPPORT / 8 / 275 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` equipShields; FUNCTIONAL |
| ABL-026 / `holdTheLine` | HOLD THE LINE | ACTION / 9 / 300 | Select two adjacent squares enemies cannot enter until next turn; spend MOV and anchor the effect to this position. | No special weapon gate recorded | Minor; Scene default | C: `js/data/abilities.js` holdTheLine; DEFERRED |
| ABL-027 / `heavyArmorTraining` | HEAVY ARMOR TRAINING | SUPPORT / 9 / 300 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` heavyArmorTraining; FUNCTIONAL |
| ABL-028 / `indomitable` | INDOMITABLE | SUPPORT / 10 / 350 | At or below ceil(10% MAX HP), block each damage source of ceil(50% MAX HP) or less. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` indomitable; RULE_HOOK |

### THIEF — 14 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-029 / `stealItem` | STEAL ITEM | ACTION / 1 / 100 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` stealItem; RULE_HOOK |
| ABL-030 / `stealAccessory` | STEAL ACCESSORY | ACTION / 2 / 125 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` stealAccessory; RULE_HOOK |
| ABL-031 / `stealOffHand` | STEAL OFF-HAND | ACTION / 3 / 150 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` stealOffHand; RULE_HOOK |
| ABL-032 / `stealWeapon` | STEAL WEAPON | ACTION / 4 / 175 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` stealWeapon; RULE_HOOK |
| ABL-033 / `fastHands` | FAST HANDS | SUPPORT / 4 / 175 | Doubles calculated Steal success chance. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` fastHands; RULE_HOOK |
| ABL-034 / `stealArmor` | STEAL ARMOR | ACTION / 5 / 200 | Attempt to steal the indicated carried item or equipped slot. TBD: successFormula. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` stealArmor; RULE_HOOK |
| ABL-035 / `slipAway` | SLIP AWAY | REACTION / 6 / 225 | When struck by an adjacent enemy, may choose a legal adjacent move or choose to stay, without MOV cost. TBD: chance. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` slipAway; DEFERRED |
| ABL-036 / `skirmisher` | SKIRMISHER | SUPPORT / 6 / 225 | After traversing at least 3 tiles, gain DEF on ending the turn until next turn starts. TBD: defBonus. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` skirmisher; DEFERRED |
| ABL-037 / `flurry` | FLURRY | SUPPORT / 7 / 250 | Greatly increases calculated double-attack chance, respecting the universal cap. TBD: modifier. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` flurry; DEFERRED |
| ABL-038 / `disarm` | DISARM | SUPPORT / 8 / 275 | Steal remains available with full inventory; successful equipment theft instead disarms when it cannot be carried. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` disarm; RULE_HOOK |
| ABL-039 / `backstab` | BACKSTAB | ACTION / 9 / 300 | 150% melee damage when an ally is directly opposite across the target on the same row or column; otherwise normal damage. | {"slot":"weapon","kinds":["MELEE"],"tags":["SHORT","STABBING"]} | Major; Scene default | C: `js/data/abilities.js` backstab; DEFERRED |
| ABL-040 / `escapeArtist` | ESCAPE ARTIST | SUPPORT / 9 / 300 | Improves survival chance after squad defeat. TBD: modifier. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` escapeArtist; DEFERRED |
| ABL-041 / `fleetFooted` | FLEET-FOOTED | MOVEMENT / 10 / 350 | Each legal consecutive perpendicular pair of orthogonal steps costs 1 MOV total. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` fleetFooted; RULE_HOOK |
| ABL-042 / `deepPockets` | DEEP POCKETS | SUPPORT / 10 / 350 | Carry one extra personal item. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` deepPockets; FUNCTIONAL |

### ARCHER — 11 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-043 / `aimedShot` | AIMED SHOT | ACTION / 1 / 100 | Bow attack with substantially increased accuracy. TBD: accuracyModifier. | {"slot":"weapon","families":["BOW"],"kinds":["RANGED"]} | Major; Scene default | C: `js/data/abilities.js` aimedShot; DEFERRED |
| ABL-044 / `powerShot` | POWER SHOT | ACTION / 3 / 150 | Bow attack with increased damage and reduced accuracy. TBD: damageModifier, accuracyModifier. | {"slot":"weapon","families":["BOW"],"kinds":["RANGED"]} | Major; Scene default | C: `js/data/abilities.js` powerShot; DEFERRED |
| ABL-045 / `lightArmorTraining` | LIGHT ARMOR TRAINING | SUPPORT / 4 / 175 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` lightArmorTraining; FUNCTIONAL |
| ABL-046 / `suppressingShot` | SUPPRESSING SHOT | ACTION / 5 / 200 | On hit, reduce target MOV until its next turn. TBD: movReduction. | {"slot":"weapon","families":["BOW"],"kinds":["RANGED"]} | Major; Scene default | C: `js/data/abilities.js` suppressingShot; DEFERRED |
| ABL-047 / `eagleEye` | EAGLE EYE | SUPPORT / 6 / 225 | Improves bow accuracy. TBD: bonus. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` eagleEye; DEFERRED |
| ABL-048 / `longShot` | LONG SHOT | ACTION / 7 / 250 | Bow attack beyond ordinary maximum range. TBD: rangeExtension, accuracyPenalty. | {"slot":"weapon","families":["BOW"],"kinds":["RANGED"]} | Major; Scene default | C: `js/data/abilities.js` longShot; DEFERRED |
| ABL-049 / `bowTraining` | BOW TRAINING | SUPPORT / 7 / 250 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` bowTraining; FUNCTIONAL |
| ABL-050 / `coveringFire` | COVERING FIRE | REACTION / 8 / 275 | May fire before a legal-range enemy attacks another ally; stop its pending attack if it can no longer complete it. TBD: chance. No frequency cap; only another friendly target; not counter/double-attack. | {"slot":"weapon","families":["BOW"],"kinds":["RANGED"]} | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` coveringFire; RULE_HOOK |
| ABL-051 / `piercingShot` | PIERCING SHOT | ACTION / 9 / 300 | Bow attack ignoring a large portion of DEF. TBD: ignoreDefenseFraction. | {"slot":"weapon","families":["BOW"],"kinds":["RANGED"]} | Major; Scene default | C: `js/data/abilities.js` piercingShot; DEFERRED |
| ABL-052 / `dexterityTraining` | DEXTERITY TRAINING | SUPPORT / 9 / 300 | Improves future DEX growth while equipped. TBD: bonus. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` dexterityTraining; DEFERRED |
| ABL-053 / `firingPosition` | FIRING POSITION | MOVEMENT / 10 / 350 | Concept: move up to 1 tile, then fire 1 tile farther. Timing and movement cost unresolved. TBD: timing, movCost. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` firingPosition; DEFERRED |

### ALCHEMIST — 13 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-054 / `tossItem` | TOSS ITEM | ACTION / 1 / 100 | Use and consume an eligible consumable at range; Conservation cannot preserve it. TBD: range. | No special weapon gate recorded | Major; Scene default | C: `js/data/abilities.js` tossItem; RULE_HOOK |
| ABL-055 / `purifyingMedicine` | PURIFYING MEDICINE | SUPPORT / 2 / 125 | HP-restorative items may remove one random removable negative status. TBD: chance. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` purifyingMedicine; RULE_HOOK |
| ABL-056 / `emergencyMedicine` | EMERGENCY MEDICINE | REACTION / 3 / 150 | After qualifying damage below 60% MAX HP, use the strongest carried healing item whose full modified healing fits missing HP. TBD: eventGranularity. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` emergencyMedicine; RULE_HOOK |
| ABL-057 / `forage` | FORAGE | ACTION / 4 / 175 | Produce a tile-based item to use, throw or store. Tiles may be foraged repeatedly. TBD: table. | No special weapon gate recorded | TBD field; runtime Major default (CONFLICT-006); Scene default | C: `js/data/abilities.js` forage; RULE_HOOK |
| ABL-058 / `conservation` | CONSERVATION | SUPPORT / 4 / 175 | High chance to preserve a normally used consumable; excludes Toss and immediate Forage use/throw. TBD: chance. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` conservation; RULE_HOOK |
| ABL-059 / `quickItems` | QUICK ITEMS | SUPPORT / 5 / 200 | Ordinary Item no longer consumes or prevents the normal Major Action. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` quickItems; FUNCTIONAL |
| ABL-060 / `lightWeaponTraining` | LIGHT WEAPON TRAINING | SUPPORT / 6 / 225 | Grants the listed equipment permission across classes. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` lightWeaponTraining; FUNCTIONAL |
| ABL-061 / `refine` | REFINE | ACTION / 7 / 250 | Atomically combine two identical eligible consumables into one with more than their combined scalable effect. TBD: multiplier. | No special weapon gate recorded | TBD field; runtime Major default (CONFLICT-006); Scene default | C: `js/data/abilities.js` refine; RULE_HOOK |
| ABL-062 / `potentRemedies` | POTENT REMEDIES | SUPPORT / 8 / 275 | HP restoration x2; MP restoration x1.25, rounded up. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` potentRemedies; RULE_HOOK |
| ABL-063 / `panacea` | PANACEA | ACTION / 9 / 300 | Use an eligible curative item to remove all removable negative statuses; ordinary consumption rules apply. | No special weapon gate recorded | TBD field; runtime Major default (CONFLICT-006); Scene default | C: `js/data/abilities.js` panacea; RULE_HOOK |
| ABL-064 / `catalyze` | CATALYZE | SUPPORT / 9 / 300 | Extend consumable temporary effects; actual consumption of a temporary stat buff may permanently add +1 to one affected stat. TBD: durationExtension, chance. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` catalyze; RULE_HOOK |
| ABL-065 / `scrounger` | SCROUNGER | MOVEMENT / 10 / 350 | At turn start detect hidden items within 5 tiles; Scrounge gives direction or collects an item on your tile. TBD: distanceMetric, tiePolicy, movCost, fullInventoryPolicy. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Map command | C: `js/data/abilities.js` scrounger; RULE_HOOK |
| ABL-066 / `deepSatchel` | DEEP SATCHEL | SUPPORT / 10 / 350 | Carry one extra personal item. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/abilities.js` deepSatchel; FUNCTIONAL |

### MAGE — 24 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-067 / `blaze1` | BLAZE 1 | ACTION / 1 / 100 | See §12 `blaze1`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` blaze1; FUNCTIONAL_RULE |
| ABL-068 / `bolt1` | BOLT 1 | ACTION / 1 / 100 | See §12 `bolt1`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` bolt1; FUNCTIONAL_RULE |
| ABL-069 / `freeze1` | FREEZE 1 | ACTION / 1 / 100 | See §12 `freeze1`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` freeze1; FUNCTIONAL_RULE |
| ABL-070 / `gale1` | GALE 1 | ACTION / 1 / 100 | See §12 `gale1`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` gale1; FUNCTIONAL_RULE |
| ABL-071 / `quake1` | QUAKE 1 | ACTION / 1 / 100 | See §12 `quake1`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` quake1; FUNCTIONAL_RULE |
| ABL-072 / `torrent1` | TORRENT 1 | ACTION / 1 / 100 | See §12 `torrent1`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` torrent1; FUNCTIONAL_RULE |
| ABL-073 / `blaze2` | BLAZE 2 | ACTION / 3 / 150 | See §12 `blaze2`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` blaze2; FUNCTIONAL_RULE |
| ABL-074 / `bolt2` | BOLT 2 | ACTION / 3 / 150 | See §12 `bolt2`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` bolt2; FUNCTIONAL_RULE |
| ABL-075 / `freeze2` | FREEZE 2 | ACTION / 3 / 150 | See §12 `freeze2`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` freeze2; FUNCTIONAL_RULE |
| ABL-076 / `gale2` | GALE 2 | ACTION / 3 / 150 | See §12 `gale2`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` gale2; FUNCTIONAL_RULE |
| ABL-077 / `quake2` | QUAKE 2 | ACTION / 3 / 150 | See §12 `quake2`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` quake2; FUNCTIONAL_RULE |
| ABL-078 / `torrent2` | TORRENT 2 | ACTION / 3 / 150 | See §12 `torrent2`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` torrent2; FUNCTIONAL_RULE |
| ABL-079 / `blaze3` | BLAZE 3 | ACTION / 5 / 200 | See §12 `blaze3`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` blaze3; FUNCTIONAL_RULE |
| ABL-080 / `bolt3` | BOLT 3 | ACTION / 5 / 200 | See §12 `bolt3`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` bolt3; FUNCTIONAL_RULE |
| ABL-081 / `freeze3` | FREEZE 3 | ACTION / 5 / 200 | See §12 `freeze3`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` freeze3; FUNCTIONAL_RULE |
| ABL-082 / `gale3` | GALE 3 | ACTION / 5 / 200 | See §12 `gale3`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` gale3; FUNCTIONAL_RULE |
| ABL-083 / `quake3` | QUAKE 3 | ACTION / 5 / 200 | See §12 `quake3`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` quake3; FUNCTIONAL_RULE |
| ABL-084 / `torrent3` | TORRENT 3 | ACTION / 5 / 200 | See §12 `torrent3`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` torrent3; FUNCTIONAL_RULE |
| ABL-085 / `blaze4` | BLAZE 4 | ACTION / 7 / 250 | See §12 `blaze4`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` blaze4; FUNCTIONAL_RULE |
| ABL-086 / `bolt4` | BOLT 4 | ACTION / 7 / 250 | See §12 `bolt4`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` bolt4; FUNCTIONAL_RULE |
| ABL-087 / `freeze4` | FREEZE 4 | ACTION / 7 / 250 | See §12 `freeze4`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` freeze4; FUNCTIONAL_RULE |
| ABL-088 / `gale4` | GALE 4 | ACTION / 7 / 250 | See §12 `gale4`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` gale4; FUNCTIONAL_RULE |
| ABL-089 / `quake4` | QUAKE 4 | ACTION / 7 / 250 | See §12 `quake4`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` quake4; FUNCTIONAL_RULE |
| ABL-090 / `torrent4` | TORRENT 4 | ACTION / 7 / 250 | See §12 `torrent4`: DAMAGE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` torrent4; FUNCTIONAL_RULE |

### CLERIC — 15 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-091 / `heal1` | HEAL 1 | ACTION / 1 / 100 | See §12 `heal1`: HEAL. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` heal1; FUNCTIONAL_RULE |
| ABL-092 / `detox` | DETOX | ACTION / 2 / 125 | See §12 `detox`: CURE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` detox; FUNCTIONAL_RULE |
| ABL-093 / `heal2` | HEAL 2 | ACTION / 3 / 150 | See §12 `heal2`: HEAL. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` heal2; FUNCTIONAL_RULE |
| ABL-094 / `prayer` | PRAYER | REACTION / 3 / 150 | 25% chance: an adjacent friendly unit remains at 1 HP instead of entering Dying. Statuses remain. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` prayer; FUNCTIONAL_RULE |
| ABL-095 / `clearSight` | CLEAR SIGHT | ACTION / 4 / 175 | See §12 `clearSight`: CURE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` clearSight; FUNCTIONAL_RULE |
| ABL-096 / `raise1` | RAISE 1 | ACTION / 4 / 175 | See §12 `raise1`: RAISE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` raise1; FUNCTIONAL_RULE |
| ABL-097 / `unseal` | UNSEAL | ACTION / 4 / 175 | See §12 `unseal`: CURE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` unseal; FUNCTIONAL_RULE |
| ABL-098 / `heal3` | HEAL 3 | ACTION / 5 / 200 | See §12 `heal3`: HEAL. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` heal3; FUNCTIONAL_RULE |
| ABL-099 / `awaken` | AWAKEN | ACTION / 6 / 225 | See §12 `awaken`: CURE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` awaken; FUNCTIONAL_RULE |
| ABL-100 / `clarity` | CLARITY | ACTION / 6 / 225 | See §12 `clarity`: CURE. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` clarity; FUNCTIONAL_RULE |
| ABL-101 / `faith` | FAITH | SUPPORT / 6 / 225 | Future WIS growth +1 while equipped. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` faith; FUNCTIONAL_RULE |
| ABL-102 / `heal4` | HEAL 4 | ACTION / 7 / 250 | See §12 `heal4`: HEAL. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` heal4; FUNCTIONAL_RULE |
| ABL-103 / `martyr` | MARTYR | REACTION / 7 / 250 | An adjacent enemy newly entering Dying immediately has its counter reduced by 1. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` martyr; FUNCTIONAL_RULE |
| ABL-104 / `divineWard` | DIVINE WARD | SUPPORT / 8 / 275 | Spell damage x0.7; hostile spell status chance minus 30 percentage points. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` divineWard; FUNCTIONAL_RULE |
| ABL-105 / `gracefulStep` | GRACEFUL STEP | MOVEMENT / 10 / 350 | First completed movement each turn restores 5% MAX HP. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` gracefulStep; FUNCTIONAL_RULE |

### WIZARD — 14 registered abilities


| Record / stable ID | Name | Category / Class Lv / CP | Recorded behavior / unresolved mechanics | Equipment requirement | Economy / presentation | Current evidence |
| --- | --- | --- | --- | --- | --- | --- |
| ABL-106 / `extend` | EXTEND | ACTION / 1 / 100 | Casting method; modifies an accessible compatible spell. No independent CP award. | No special weapon gate recorded | Method attached to cast, no standalone action; Not independently specified | C: `js/data/spellClasses.js` extend; FUNCTIONAL_RULE |
| ABL-107 / `spellCounter` | SPELL COUNTER | REACTION / 2 / 125 | 20% chance before normal counter; player chooses a purchased Lv1 Mage spell for 0 MP. TBD: selection. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` spellCounter; FUNCTIONAL_RULE |
| ABL-108 / `focus` | FOCUS | ACTION / 3 / 150 | Casting method; modifies an accessible compatible spell. No independent CP award. TBD: radiusBonus. | No special weapon gate recorded | Method attached to cast, no standalone action; Not independently specified | C: `js/data/spellClasses.js` focus; FUNCTIONAL_RULE |
| ABL-109 / `divineArcana` | DIVINE ARCANA | SUPPORT / 4 / 175 | Authorizes compatible cleric spells for accessible Wizard casting methods. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` divineArcana; FUNCTIONAL_RULE |
| ABL-110 / `expand` | EXPAND | ACTION / 5 / 200 | Casting method; modifies an accessible compatible spell. No independent CP award. | No special weapon gate recorded | Method attached to cast, no standalone action; Not independently specified | C: `js/data/spellClasses.js` expand; FUNCTIONAL_RULE |
| ABL-111 / `arcaneSiphon` | ARCANE SIPHON | REACTION / 6 / 225 | Damaging magic restores its paid MP cost and deals 10% less damage. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` arcaneSiphon; FUNCTIONAL_RULE |
| ABL-112 / `hexArcana` | HEX ARCANA | SUPPORT / 6 / 225 | Authorizes compatible hexer spells for accessible Wizard casting methods. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` hexArcana; FUNCTIONAL_RULE |
| ABL-113 / `overcharge` | OVERCHARGE | ACTION / 7 / 250 | Casting method; modifies an accessible compatible spell. No independent CP award. | No special weapon gate recorded | Method attached to cast, no standalone action; Not independently specified | C: `js/data/spellClasses.js` overcharge; FUNCTIONAL_RULE |
| ABL-114 / `enchantingArcana` | ENCHANTING ARCANA | SUPPORT / 7 / 250 | Authorizes compatible enchanter spells for accessible Wizard casting methods. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` enchantingArcana; FUNCTIONAL_RULE |
| ABL-115 / `fly` | FLY | ACTION / 8 / 275 | See §12 `fly`: STATUS. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` fly; FUNCTIONAL_RULE |
| ABL-116 / `intelligenceTraining` | INTELLIGENCE TRAINING | SUPPORT / 8 / 275 | Future INT growth +2 while equipped. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` intelligenceTraining; FUNCTIONAL_RULE |
| ABL-117 / `portal` | PORTAL | ACTION / 9 / 300 | See §12 `portal`: PORTAL. | No special weapon gate recorded | Major; Scene default | C: `js/data/spellClasses.js` portal; FUNCTIONAL_RULE |
| ABL-118 / `restorativeArcana` | RESTORATIVE ARCANA | SUPPORT / 9 / 300 | Authorizes compatible advancedHealer spells for accessible Wizard casting methods. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` restorativeArcana; FUNCTIONAL_RULE |
| ABL-119 / `manaStep` | MANA STEP | MOVEMENT / 10 / 350 | First completed movement each turn restores 5% MAX MP. | No special weapon gate recorded | Passive/reaction/movement slot; no independent ordinary Major; Not independently specified | C: `js/data/spellClasses.js` manaStep; FUNCTIONAL_RULE |

### Documented abilities missing from the current registry, historical names, and reservations

| Record | Ability / owner / category / level / CP | Established behavior and equipment | Economy/presentation; implementation; uncertainty | Evidence/status |
| --- | --- | --- | --- | --- |
| DOCABL-01 | Arcane Seething / Mage Reaction Lv6 / 225 | Enemy damage makes next applicable scalable spell 10% stronger: offensive damage, HP restoration, numeric buff magnitude; consumed by that cast | Reaction interjection concept; no runtime entry/handler. Rounding, eligibility and stacking edge cases TBD | A/G/I; H5 §20; H6B §7; W5 Mage G18; CONFLICT-002 |
| DOCABL-02 | Robe Training / Mage Support Lv2 / 125 | Cross-class permission to equip robes, subject to underlying race restrictions | Passive; no entry. Permission framework exists, not this purchased ability | A/I; same sources; W5 Mage C19 |
| DOCABL-03 | Wand Training / Mage Support Lv4 / 175 | Cross-class permission to equip wands | Passive; no entry; no shipping Wand item | A/I; same sources; W5 Mage E19 |
| DOCABL-04 | Intelligence Training / Mage Support Lv8 / 275 | Increases future INT growth while equipped; exact bonus TBD | No Mage-owned entry. Existing `intelligenceTraining` belongs to Wizard and grants +2; do not transfer that value to Mage | A/G/I; H5 §20; H6B §7; W5 Mage I19; `js/data/spellClasses.js` intelligenceTraining |
| DOCABL-05 | Arcane Efficiency / Mage Support Lv10 / 350 | Spell MP cost reduced 10% | No entry; rounding and modifier composition TBD | A/G/I; H5 §20; H6B §7; W5 Mage K19 |
| DOCABL-06 | Evade / Thief Reaction Lv3 / price not adopted | Workbook says chance to avoid an otherwise successful physical attack | **Not authoritative conversation design**, explicitly warned by H5; absent current code. Do not create it merely because W5 still contains it | H/I; W1–W5 Thief D18; H5 §12 “IMPORTANT SUPERSEDED ARTIFACT WARNING”; no complete original decision transcript |
| DOCABL-07 | Surefooted / future Ranger Movement / level & price TBD | Additional terrain movement cost −1, minimum normal cost 1 | Concept only; not Archer. No final stacking/terrain table or execution | A reservation/G; H5 §§13–14; W5 Archer B28 |
| DOCABL-08 | Desoul / Wizard spell idea / level & price TBD | Small instant-death chance concept | No final table, eligibility, chance or implementation | G; H5 §21 Wizard |
| DOCABL-09 | Elemental Affinity / Elemental Mastery | Removed from Mage discussion; may suit Elementalist | Names/concepts only, category/level/effect/price TBD; no entries | H/G; H5 §§20–21/24 |
| DOCABL-10 | Raise 2 / future unnamed Advanced Healer Action / level & price TBD | Dying only; remove Dying/counter, restore 100% MAX HP; Dead never revivable | Behavior constant/test only; no purchasable class/spell entry; range/radius/MP TBD | A/G/C hook; H6B §5; P6A Raise; `js/data/spells.js` RAISE_BEHAVIORS[2] |
| DOCABL-11 | Death Rattle / future class Support / level & price TBD | Possible final action while Dying | Class, timing, exception to incapacitation/conclusion and implementation TBD | G; H6B §§6/13; `js/debug/SpellFrameworkTests.js` “DEATH RATTLE IS NOT IMPLEMENTED” |
| DOCABL-12 | Fairy cure / racial innate / no Class Level or CP established | One-target debuff cure concept | Internal ID only; category, cost, target taxonomy/range/cooldown TBD | A/G/C metadata; P3.5 §14; `js/data/races.js` RACIAL_ABILITIES |
| DOCABL-13 | Skewer | Provisional name for Fighter Lv8 spear technique, **not an extra ability** | Current display SPEAR TECHNIQUE; adjacent normal + directly behind 80%; final name TBD | H/G/C; H4 §19; W5 Fighter I17; `abilities.spearTechnique.effect.provisionalName` |

Specific cautions: Covering Fire has no frequency cap and is not a counter/double attack; null cap is intentional. Emergency Medicine is strictly below 60%, 100% proc, uses strongest full modified heal that does not overheal; Potent Remedies applies before selection. Conservation excludes Toss/immediate Forage use/throw; stored forage items later use ordinary rules. Catalyze's permanent +1 requires actual consumption, so a conserved item cannot roll it. Chivalry is dynamic eight-neighbor DEF based on source total DEF; fractional rounding TBD. Crushing Blow adds full target DEF, then halves target DEF for resolution: preserve both operations. Indomitable uses explicit ceil thresholds, not a global rounding convention. Sources: H5 §§10–15, P4 §§10–11, P5 §§8–9, corresponding `js/data/abilities.js` objects and `js/systems/AbilityEffectHooks.js`/`js/systems/ItemSystem.js`.

## 12. Magic / Spell System

| Record | Recovered structure | Status / evidence |
| --- | --- | --- |
| R12-01 | Each spell carries identity, owner, family/tier, required Class Level, separate casting range/effect radius, magnitude type/value, MP, element, damage/heal flags, statuses cured/applied, allegiance/life restrictions, placement and modifier compatibility. Unresolved values block production casting; no silent lab fallback. | A/C/G; W5 Shared Rules B13; P6 spell data; `js/data/spells.js`; `js/systems/MagicSystem.js` definition/resolve/validateReady |
| R12-02 | Six Mage families: Blaze FIRE, Freeze ICE, Bolt LIGHTNING, Gale AIR, Quake EARTH, Torrent WATER. Each tier 1/2/3/4 unlocks at Mage 1/3/5/7, individually purchased for 100/150/200/250. Radii 1/2/2/3. Tiers1/2 same per-target base magnitude; tier3 substantially greater; tier4 greater than3. Exact values/elemental interactions/ranges/MP TBD. | A/C/G; W5 Mage B25/B29; H6B §7; `js/data/spells.js` family loop; P6 Mage |
| R12-03 | Range uses Manhattan distance ≤ range. Radius R includes Manhattan distance ≤ R−1; R1/2/3/4 = 1/5/13/25 tiles. Formula for tile count `1+2(R−1)R` is a mathematical restatement, not a new damage rule. Range and radius never interchangeable. | A/C; W5 Shared Rules B14; H6B §7; `js/systems/TargetingSystem.js` diamond/affectedTiles |
| R12-04 | Normal or one mutually exclusive accessible Wizard method. Extend range +1, MP×1.10; Focus innate radius>1 → radius1, magnitude×1.75, MP×1.25; Expand radius+1, MP×1.5; Overcharge magnitude×2, MP×2.5. Unmentioned fields unchanged. | A/C; W5 Wizard B17/D17/F17/H17/B23; H6B §8; `js/data/spellClasses.js`; `MagicSystem.resolve` |
| R12-05 | Compatible Mage spells inherently modifiable when both spell/method accessible, either current/secondary arrangement. Divine Arcana Lv4 extends Cleric; Hex Arcana Lv6 Hexer; Enchanting Arcana Lv7 Enchanter; Restorative Arcana Lv9 future Advanced Healer. These supports do not grant missing spells/classes or extra Support slots. | A/C/G; H6B §8; P6 Wizard; `MagicSystem.compatible`; `js/data/spellClasses.js` arcana effects |
| R12-06 | Modified spell retains its class/CP owner; modifier no separate CP; reaction casts no CP. One resource payment and receipt per cast, not per target. Global rounding remains null: fractions need an explicitly supplied policy. Lab uses ceil, not a final design decision. | A/C/G/E; H6B §§8/13; P6 unresolved values; P7 §§16–18; `js/config/spellConfig.js` RuleNumbers; `js/systems/BattleActionSystem.js` prepare/finish |
| R12-07 | Previous-tier purchase prerequisite remains proposed/TBD; all tiers exist independently without production prerequisite chain. H5's four-family 2800 CP total was arithmetically correct for 16 spells then; six-family 4200 is a derived sum, not evidence of new balancing intent. | G/H/C; H5 §20; H6B §7; W5 Mage B26; `js/data/spells.js`; `js/campaign/AbilityLearningSystem.js` |

### Exact current spell inventory

Every row is C evidence from `js/data/spells.js`, with class-level/purchase structure A from H6B §§5/7/8. `TBD` means an intentionally unresolved production field, not zero. All rows have a corresponding Action ability in §11. Mage damaging area can affect applicable allies/self under #7 even though its original direct-target allegiance field remains ENEMY. Cures/Heal/Raise are friendly by current definitions; Portal endpoint placement has its separate rules.

| Record / spell ID | Family / element / owner | Spell tier / Class Lv / CP | Range / radius | Magnitude / MP | Targets, effect, method compatibility |
| --- | --- | --- | --- | --- | --- |
| SPL-001 / `blaze1` | BLAZE / FIRE / mage | 1 / 1 / 100 | TBD / 1 | TBD (blazeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-002 / `blaze2` | BLAZE / FIRE / mage | 2 / 3 / 150 | TBD / 2 | TBD (blazeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-003 / `blaze3` | BLAZE / FIRE / mage | 3 / 5 / 200 | TBD / 2 | TBD (blazeMagnitude3; SUBSTANTIALLY_GREATER) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-004 / `blaze4` | BLAZE / FIRE / mage | 4 / 7 / 250 | TBD / 3 | TBD (blazeMagnitude4; GREATER_THAN_TIER_3) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-005 / `freeze1` | FREEZE / ICE / mage | 1 / 1 / 100 | TBD / 1 | TBD (freezeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-006 / `freeze2` | FREEZE / ICE / mage | 2 / 3 / 150 | TBD / 2 | TBD (freezeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-007 / `freeze3` | FREEZE / ICE / mage | 3 / 5 / 200 | TBD / 2 | TBD (freezeMagnitude3; SUBSTANTIALLY_GREATER) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-008 / `freeze4` | FREEZE / ICE / mage | 4 / 7 / 250 | TBD / 3 | TBD (freezeMagnitude4; GREATER_THAN_TIER_3) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-009 / `bolt1` | BOLT / LIGHTNING / mage | 1 / 1 / 100 | TBD / 1 | TBD (boltMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-010 / `bolt2` | BOLT / LIGHTNING / mage | 2 / 3 / 150 | TBD / 2 | TBD (boltMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-011 / `bolt3` | BOLT / LIGHTNING / mage | 3 / 5 / 200 | TBD / 2 | TBD (boltMagnitude3; SUBSTANTIALLY_GREATER) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-012 / `bolt4` | BOLT / LIGHTNING / mage | 4 / 7 / 250 | TBD / 3 | TBD (boltMagnitude4; GREATER_THAN_TIER_3) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-013 / `gale1` | GALE / AIR / mage | 1 / 1 / 100 | TBD / 1 | TBD (galeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-014 / `gale2` | GALE / AIR / mage | 2 / 3 / 150 | TBD / 2 | TBD (galeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-015 / `gale3` | GALE / AIR / mage | 3 / 5 / 200 | TBD / 2 | TBD (galeMagnitude3; SUBSTANTIALLY_GREATER) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-016 / `gale4` | GALE / AIR / mage | 4 / 7 / 250 | TBD / 3 | TBD (galeMagnitude4; GREATER_THAN_TIER_3) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-017 / `quake1` | QUAKE / EARTH / mage | 1 / 1 / 100 | TBD / 1 | TBD (quakeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-018 / `quake2` | QUAKE / EARTH / mage | 2 / 3 / 150 | TBD / 2 | TBD (quakeMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-019 / `quake3` | QUAKE / EARTH / mage | 3 / 5 / 200 | TBD / 2 | TBD (quakeMagnitude3; SUBSTANTIALLY_GREATER) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-020 / `quake4` | QUAKE / EARTH / mage | 4 / 7 / 250 | TBD / 3 | TBD (quakeMagnitude4; GREATER_THAN_TIER_3) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-021 / `torrent1` | TORRENT / WATER / mage | 1 / 1 / 100 | TBD / 1 | TBD (torrentMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-022 / `torrent2` | TORRENT / WATER / mage | 2 / 3 / 150 | TBD / 2 | TBD (torrentMagnitude1; BASE) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-023 / `torrent3` | TORRENT / WATER / mage | 3 / 5 / 200 | TBD / 2 | TBD (torrentMagnitude3; SUBSTANTIALLY_GREATER) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-024 / `torrent4` | TORRENT / WATER / mage | 4 / 7 / 250 | TBD / 3 | TBD (torrentMagnitude4; GREATER_THAN_TIER_3) / TBD | DAMAGE; UNIT; area allies/enemies/self; methods extend/focus/expand/overcharge |
| SPL-025 / `heal1` | HEAL / none assigned / cleric | 1 / 1 / 100 | TBD / TBD | TBD / TBD | HEAL; UNIT; FRIENDLY; methods extend/focus/expand/overcharge with Divine Arcana |
| SPL-026 / `heal2` | HEAL / none assigned / cleric | 2 / 3 / 150 | TBD / TBD | TBD / TBD | HEAL; UNIT; FRIENDLY; methods extend/focus/expand/overcharge with Divine Arcana |
| SPL-027 / `heal3` | HEAL / none assigned / cleric | 3 / 5 / 200 | TBD / TBD | TBD / TBD | HEAL; UNIT; FRIENDLY; methods extend/focus/expand/overcharge with Divine Arcana |
| SPL-028 / `heal4` | HEAL / none assigned / cleric | 4 / 7 / 250 | TBD / TBD | TBD / TBD | HEAL; UNIT; FRIENDLY; methods extend/focus/expand/overcharge with Divine Arcana |
| SPL-029 / `detox` | DETOX / none assigned / cleric | 1 / 2 / 125 | TBD / TBD | 0 / TBD | Cures POISON; UNIT; FRIENDLY; methods extend/expand with Divine Arcana |
| SPL-030 / `clearSight` | CLEAR SIGHT / none assigned / cleric | 1 / 4 / 175 | TBD / TBD | 0 / TBD | Cures BLIND; UNIT; FRIENDLY; methods extend/expand with Divine Arcana |
| SPL-031 / `unseal` | UNSEAL / none assigned / cleric | 1 / 4 / 175 | TBD / TBD | 0 / TBD | Cures MUTE; UNIT; FRIENDLY; methods extend/expand with Divine Arcana |
| SPL-032 / `awaken` | AWAKEN / none assigned / cleric | 1 / 6 / 225 | TBD / TBD | 0 / TBD | Cures SLEEP; UNIT; FRIENDLY; methods extend/expand with Divine Arcana |
| SPL-033 / `clarity` | CLARITY / none assigned / cleric | 1 / 6 / 225 | TBD / TBD | 0 / TBD | Cures CONFUSED; UNIT; FRIENDLY; methods extend/expand with Divine Arcana |
| SPL-034 / `raise1` | RAISE / none assigned / cleric | 1 / 4 / 175 | TBD / TBD | 0.5 / TBD | RAISE; DYING_UNIT; FRIENDLY; methods extend/expand with Divine Arcana |
| SPL-035 / `fly` | FLY / none assigned / wizard | 1 / 8 / 275 | TBD / TBD | 0 / TBD | Applies FLYING 3 turns; UNIT; FRIENDLY; methods expand |
| SPL-036 / `portal` | PORTAL / none assigned / wizard | 1 / 9 / 300 | 4 / 1 | 0 / TBD | PORTAL; TILE; FRIENDLY/ENEMY; methods extend |

| Record | Spell-specific boundaries | Status / evidence |
| --- | --- | --- |
| R12-08 | Raise1 Cleric Lv4 restores 50% MAX HP only to Dying, clears counter, leaves other statuses; no Alive/Dead/AWOL targeting. Raise2 future ownership above. Cure spells remove only named statuses. Heal1–4 magnitudes and tier-specific geometry are not recovered. | A/C/G; H6B §5; P6A Raise; `TargetingSystem.unitAllowed`; `BattleStatusSystem.raise` |
| R12-09 | Current cure/Raise compatibility allows Extend/Expand and excludes magnitude methods; explicit availability is code evidence. Their exact per-spell compatibility adoption is less strongly documented than generic Divine Arcana; do not infer every future curative spell shares it. | C/D/G; `js/data/spells.js` cure loop/raise1; P6 modifier structure; IMP-013 |
| R12-10 | Fly Wizard Lv8: source-specific Flying, 3 affected-unit turns, end-turn countdown; Expand yes, Focus/Overcharge no, Extend TBD/disabled. Range/radius/MP TBD. Portal Wizard Lv9: native range4/radius1, Extend range5 MP×1.10, other methods incompatible, MP TBD. | A/B/C/G; H6B §§9/11; P6A Fly/Portal; `js/data/spells.js`; §§22/28 |

## 13. Weapons / Armor / Equipment

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R13-01 | Slots weapon/main hand, offHand, armor, accessory. Equipped items do not occupy personal capacity (normally4); loose weapons/armor are PERSONAL too. Physical item instance is authoritative; equipped map derived. Capacity loss preserves overflow, blocks new acquisition until legal. | A/C; H4 §§11/22; P4 §6; `js/campaign/InventorySystem.js`; `AbilityModifierSystem.capacity`; `js/systems/TacticalEquipmentSystem.js` |
| R13-02 | Families SWORD/AXE/SPEAR/MACE/HAMMER/BOW/STAFF/WAND; ROBE armor family; categorical LIGHT/MEDIUM/HEAVY and MELEE/RANGED/SHIELD selectors. Class permissions listed §8. No numeric weapon weight, encumbrance, mass or weight-derived MOV system. | A/C/D vocabulary; H6B §1; P5 §§13–14; `js/data/equipmentFamilies.js`; `js/campaign/EquipmentEligibility.js` |
| R13-03 | Secondary actions cannot bypass weapon legality. Backstab requires MELEE + SHORT/STABBING tags; examples knife/dagger/gladius/baselard/punch dagger are not shipping item definitions. Cleave axe, Thrust sword, spear technique spear, Crushing Blow mace/hammer, Shield Bash off-hand shield; Archer Actions eligible bow. | A/C; W2–W5 Thief B31; H5 classes; `js/data/abilities.js` weaponRequirements; `AbilityRequirementSystem.equipment` |
| R13-04 | Two-Handed doubles equipped weapon's `weaponAttack` only, not STR/total ATK; blocks all off-hand. Naturally two-handed item metadata also blocks off-hand. No generic dual-wield/ranged range/weapon-damage formulas recovered. Ranger simultaneous sword/heavy bow remains future. | A/C/G; H4 §20; P4 §6; `EquipmentEligibility.withEquipment`; `js/campaign/CharacterStatsSystem.js`; §33 |
| R13-05 | Mage Wands/Robes only; Wizard Staves/Robes. #6 legacy Mage fallback incorrectly allowed new Staff/old armor access; #6A disables it. Schema8 preserves only specific already-equipped/assigned item exceptions, including delivery. Release does not grant re-equip privilege. No Wand/Bow/Shield item invented to fill gaps. | B/C; H6B §7/14; P6A equipment audit; `spellClasses.mage`; `CampaignState.migrate`; `InventorySystem.eligible` |
| R13-06 | Weapon/armor weights and weapon ATK in the shipping legacy catalog remain null. Existing STR bonuses are provisional modifiers, not weapon ATK. Empty `js/data/weapons.js` is not the actual current item catalog: `js/data/campaignResources.js` supplies ITEMS after the empty placeholder. | C/F/G; P4 §6; P5 §20; `index.html` order; `js/data/campaignResources.js` ITEMS/postprocessing |
| R13-07 | Inheritance from permanently Dead units and strengthening was approved for future exploration; transfer, eligibility, relationships, item XP and formulas unestablished. Current retained items are not an inheritance mechanic. Two Jewel artifact slots are separate from ordinary gear. | G/C; H6B §13; H4 §26; `js/campaign/BattleCasualtySystem.js`; `js/campaign/SquadSystem.js` |

### Actual shipping item catalog

All ten entries below are current C/F development data from `js/data/campaignResources.js` ITEMS, introduced P3 and amended by P3.5/#4/#6A. Prices, stat modifiers and Herb amount are not promoted to final balance. Listed legacy class permissions are item metadata; current class/race permission checks still apply (especially Mage Staff restriction).

| Record / item ID | Name / category / slot | Tier / price G | Modifiers / effect | Family / legacy class list / missing fields |
| --- | --- | --- | --- | --- |
| ITM-001 / `ironSword` | IRON SWORD / WEAPON / weapon | 1 / 50 | {"str":2} | SWORD; swordsman; categorical tier unresolved; weapon ATK/range unresolved |
| ITM-002 / `steelSword` | STEEL SWORD / WEAPON / weapon | 2 / 110 | {"str":5} | SWORD; swordsman; categorical tier unresolved; weapon ATK/range unresolved |
| ITM-003 / `lance` | BRONZE LANCE / WEAPON / weapon | 1 / 45 | {"str":3} | SPEAR; centaur; categorical tier unresolved; weapon ATK/range unresolved |
| ITM-004 / `staff` | WOODEN STAFF / WEAPON / weapon | 1 / 35 | {"str":2} | STAFF; healer/mage; categorical tier unresolved; weapon ATK/range unresolved |
| ITM-005 / `cloth` | CLOTH ROBE / ARMOR / armor | 1 / 30 | {"def":1} | ROBE; no item-level class list; categorical tier unresolved |
| ITM-006 / `mail` | CHAIN MAIL / ARMOR / armor | 2 / 80 | {"def":3} | none assigned; no item-level class list; categorical tier unresolved |
| ITM-007 / `charm` | WARD CHARM / ACCESSORY / accessory | 1 / 40 | {"def":1} | none assigned; no item-level class list |
| ITM-008 / `ring` | POWER RING / ACCESSORY / accessory | 2 / 90 | {"str":2} | none assigned; no item-level class list |
| ITM-009 / `herb` | HEALING HERB / CONSUMABLE / carried consumable | 1 / 10 | {}; {"kind":"HEAL","amount":10} | none assigned; no item-level class list |
| ITM-010 / `antidote` | ANTIDOTE / CONSUMABLE / carried consumable | 1 / 12 | {}; {"kind":"CURE_POISON"} | none assigned; no item-level class list |

## 14. Squads / Roster

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R14-01 | Maximum12 per squad; overall roster may be much larger, no final global cap recovered. Ordered membership authoritative/player-reorderable; slot1 derives strategic sprite, not leader/MC identity. No duplicate authoritative squad.spriteId. Empty/debug squad flag fallback. | A/C/D fallback; H4 §8; P3 §§5–6; `js/campaign/SquadSystem.js`; `UnitManagementSystem.sprite`; `js/config/campaignConfig.js` |
| R14-02 | Multiple same-faction squads co-locate; one stationed active defender per faction at location. Existing eligible defender remains; otherwise oldest arrival, stable ID tie. Manual stationing allowed. Opposing reserves fight separate squad pairs, not one merged >12 force. | A/C/D ties; H4 §8; P2 state/conflicts; `js/campaign/StationingSystem.js`; `js/campaign/MovementConflictSystem.js`; `js/campaign/BattleBoundary.js` |
| R14-03 | Co-located transfer/join/create instant, matching faction/ACTIVE/cap enforced; remote join requires travel. Voluntary dismissal leaves ACTIVE units locally; defeated squad removed but independent records retained. General defeat survival/MC recovery not implemented; specific Dead/AWOL rules separate. | A/C/G; H4 §§8–11; P3 §§6/12; `js/campaign/UnitManagementSystem.js`; `SquadSystem.dismiss`; `js/campaign/TravelerSystem.js` |
| R14-04 | Lone units are independent LONE_UNIT travelers, not squad cargo. Current interception placeholder CAPTURED + carried item loss. Specials exist outside two normal starting rosters with independent transient IDs; not automatic recruitment/persistence. | C/E/G; P3 §11–12; P8 specials; `BattleMapAuthoring.instantiateSpecials`; `BattleState.result` |

## 15. Campaign Map

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R15-01 | Graph nodes/edges control travel; decorative tiles and pixel anchor distance do not. Queue/confirm path without time/movement; End Day attempts next edge, retains successful remainder, cancels failed/retreated order. Routes use nonnegative travelDays weights in Dijkstra, but multi-day in-edge transit is not implemented. | A/C/G; H4 §7; P2; P3 §20; `js/campaign/WorldPathfindingSystem.js`; `js/campaign/StrategicOrderSystem.js`; `js/campaign/TravelerPath.js`; P8A graph boundary |
| R15-02 | Shipped map64×40×16px is example content; editor min30×30, no arbitrary max designed. N/S/E/W signed resize adds/removes rows/columns; additions Ocean `w`; N/W translate anchors, S/E retain; protect locations, required points, squad/traveler display offsets; fail atomically on unsafe crop. | C/E; P8 authoring; `js/editor/MapAuthoring.js` resize; `js/editor/EditorDocument.js`; `js/data/worldVisuals.js` |
| R15-03 | Opposite-direction same-route squads intercept at exact route midpoint. Network virtual source distance `L/2 + min(D(A,S),D(B,S))`, not pixels or preferred origin; fractions retained. Existing graph routes do not become blocked because decorative Ocean painted beneath line. | A/B/C; H6B §10; P6B; P8A; `js/campaign/BattleLocationSystem.js`; `js/debug/RouteMidpointTests.js`; `js/debug/DeploymentOceanTests.js` |
| R15-04 | Terrain, location and route editor layers separate. Paint/copy terrain never changes location ID/config or graph. Location move redraws straight route endpoints; does not change path weight. World smaller than viewport centered without stretching. | C; P8; `js/editor/MapEditorState.js`; `js/editor/MapAuthoring.js`; `js/rendering/WorldCamera.js` |

## 16. Locations / Settlements / Routes

| Record | Recovered rule / current vocabulary | Status / evidence |
| --- | --- | --- |
| R16-01 | Stable Location ID independent of editable name/coordinates/appearance. Copy new ID with configuration/map references; move preserves ID/routes; confirmed delete removes connected routes/polity references but refuses protected runtime/starting entity references. | C; P8 locations; `js/editor/EditorDocument.js` location transactions; `js/editor/MapAuthoring.js` protection |
| R16-02 | Current editor settlement types Village/Town/City/Fort/Castle; enabled false exposes Wilderness, no active allegiance/shops/recruits/income but retains stored settings. New blank location zero income. Allegiance PLAYER/ZEON/NEUTRAL; separate from physical controller and polity alignment. | C; P8; `js/editor/LocationModel.js` normalize/effective/compile/validate |
| R16-03 | Legacy CAPITAL/VILLAGE/PORT/FORTRESS/SHRINE/CROSSROADS retained in sample. Normalize CAPITAL→Castle, FORTRESS→Fort, PORT→Town, VILLAGE/SHRINE→Village; CROSSROADS/WILDERNESS disabled settlement. This is compatibility mapping, not a ruling that every shrine is a village or a new canonical world taxonomy. | H/C/D; `js/data/world.js`; `LocationModel.normalize`; P6A settlement selection vs P8 |
| R16-04 | Shared default tier1 sets all stored shop tiers incl disabled; per-category enable/tier override; integer min1, no designed max. Categories Consumable/Weapon/Armor/Accessory. Allowed recruits use actual race/class lists; no editable recruit-level formula. Income nonnegative integer G. | C; P8 location properties; `LocationModel.validate`; `js/editor/MapEditorState.js` properties |
| R16-05 | Appearance capital/village/sign/fort/shrine independent of gameplay type. Quest associations stable IDs only. Multiple static map refs, conditions controller/null plus all boolean story keys; unique match required or explicit chooser. Procedural biome/transition/infrastructure config is provider input, not full encounter scripting. | C/G; P8 Battle Maps; `AuthoredContent.select`; `js/systems/BattleInitializationSystem.js`; `LocationModel.appearances` |
| R16-06 | Seven sample nodes Granseal, Old Crossroads, Elder Grove, Galam Capital, Galam Port, Border Fort, Dawn Shrine; seven named routes and three polities Granseal/Galam/Dawn Order. Names/geography are development content, not recovered final world map. Conditional/blocked/story-lock route availability exists; manual waypoints future. | E/G/C; P1 assumptions; H4 §7; `js/data/world.js`; `js/data/demoCampaign.js`; `js/campaign/WorldPathfindingSystem.js` |
| R16-07 | Future wilderness encounter per player squad/edge/day; geography/danger strength, not player scaling; Zeon suppression radius suggested2, not finalized. Likely excludes wagons/lone units. Win-completes-edge/retreat-origin proposals not fully finalized. | G/F; H4 §24; `js/data/world.js` wilderness hooks; no production encounter provider |

## 17. Campaign Turn / End Day

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R17-01 | PLANNING → ORDER_LOCK (freeze player and Zeon orders) → MOVEMENT_INTENT from frozen state → COLLISION_DETECTION → RESOLUTION (pause/resume each battle) → WORLD_UPDATE → DAY_ADVANCE → PLANNING. Exactly one day increment after all conflicts; no sequential observer advantage. | A/C; H4 §7; P2; `js/campaign/CampaignTurnSystem.js`; `js/campaign/EndDayResolutionSystem.js`; `js/campaign/ResolutionValidation.js`; `js/debug/StrategicMovementTests.js` |
| R17-02 | Route interception, simultaneous hostile arrival, stationed defender attack; route conflicts before node conflicts; stable IDs/arrival ordering, consequence conflicts after retreat/overlap. One active squad per side; reserves remain independent. All movement/defeats commit in common batch after battles. | A/C/D deterministic order; P2 conflicts; ARCH conflict detection; `js/campaign/MovementConflictSystem.js`; `js/campaign/BattleBoundary.js` |
| R17-03 | Update sequence: movement/traveler commit → arrival control → delivery/equipment → income → recruit refresh → due AWOL processing → day advance. Saves validate replay without rerolling completed updates. | C; P3 §17; P6A AWOL; `ResourceSystem.update`; `js/campaign/WorldUpdateSystem.js`; `js/campaign/ResolutionValidation.js` |
| R17-04 | Current Zeon provider copies configured demo orders, otherwise holds; frozen at lock, not recomputed on resume. Not the designed strategic AI. Battle interruptions preserve queue and prevent unrelated planning edits. | C/E/G; `js/campaign/ZeonOrderProvider.js`; P2 assumptions; P7 limitations |

## 18. Economy / Recruitment / Logistics

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R18-01 | G only general material currency; separate nonnegative integer PLAYER/ZEON treasuries, controlled eligible location income during World Update; no wages/food/upkeep. Sample1000/500 starting G, income60/25/80/40/15/0/0 provisional/demo. Recovery multiplier default1 and floor-income implementation do not establish general rounding. | A/C/F/D; H4 §11; P3 §7/20; `js/campaign/EconomySystem.js`; `ResourceSystem.initialize`; `js/data/campaignResources.js` profiles |
| R18-02 | Infinite shop stock by location/category/tier; lower tiers included, PLAYER control required, no time cost; purchases create physical local item, no teleport. Price modifier currently1. No final discounts/neutral trade/spending AI. No physical squad presence check is current implementation, not universally established commerce design. | A/C/D/G; P3 §§8/20; H4 §11; `EconomySystem.available/purchase` |
| R18-03 | Ordinary recruit costs G, requires PLAYER settlement, remains physically there. Pools automatically refresh7 days, first day8; persistent candidate IDs/seed/counter, no normal reroll. Preview/recruit/save never regenerate stats. New authored eligibility does not generate new pools without provider. | A/C/G; H4 §11; P3 §§13–14; P8 recruitment; `js/campaign/RecruitmentSystem.js` |
| R18-04 | Demo benchmark: sort ACTIVE PLAYER Character Levels, index floor((n−1)×0.75), default1 if none. Candidate level clamp1..100 of benchmark−2+(seed%2)+location modifier; archetype base+15×level G. These are replaceable working approximations; future story/day/participation/Combat Rating formula TBD. | F/D/E/G; P3 §14; P8 preserved boundaries; `RecruitmentSystem.generate`; `VeteranBenchmark.calculate`; `js/data/campaignResources.js` |
| R18-05 | One inventory view, individually identified item copies; physical `place` LOCATION/UNIT/SHIPMENT; state AVAILABLE/IN_TRANSIT/EQUIPPED/PERSONAL. Assigned recipient is intent, not second container. No generic squad inventory. | A/C; H4 §11; P3 §9; `js/campaign/InventorySystem.js`; `ResourceSystem.validate` |
| R18-06 | Remote assignment makes independent wagon; old gear active until delivery; common origin/recipient consolidation; follows recipient on later frozen plans; no safe known path→hold; obsolete destination→wait. Routing uses knowledge provider/public control, not hidden squad truth. | A/C; H4 §11; P3 §§10–12; `js/campaign/TravelerSystem.js`; `js/campaign/TravelerPath.js`; `InventorySystem.assign` |
| R18-07 | Frozen-intention wagon contact destroys cargo without tactical battle; lone contact captured/item loss; shared destination/stationary enemy/opposite route. Friendly squads do not implicitly escort, even if enemy later loses a separate battle. Explicit temporary outcomes, not final escort/survival design. | C/E/G; P3 §11–12/20; `TravelerSystem.interactionPolicies`; `js/debug/ResourceTests.js` |
| R18-08 | W3/W5 Alchemist B25 says comparable Alchemist recruits should generally cost less than Clerics because consumables cost money and Cleric MP recovers naturally. This is a balance note, not a recovered recruit price ratio or finalized natural-MP recovery schedule. Current catalog has legacy archetypes, no Alchemist/Cleric production pricing. | F/G; W5 Alchemist B25; `js/data/campaignResources.js` UNIT_TYPES; H6B §13 recovery TBD |

## 19. Battle Creation

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R19-01 | Opposing squads at node or opposite travel on route create detached battle; exactly one squad per side initially, max12 each; specials separate. Location maps may be static, route maps procedural at exact midpoint. | A/C; H7 §3.1–3.2; P7 §§5–7; `js/campaign/BattleBoundary.js`; `BattleInitializationSystem.prepare` |
| R19-02 | Static source from location refs/conditions; procedural provider receives route biomes/transitions/infrastructure/midpoint. Intended mixed-biome transitions, roads and bridges; no shipped full generator/catalog. Missing provider/orientation returns explicit unresolved status, leaves pending campaign battle intact. | A/C/G; H7 §3.1; P7 §6; P8 static selection; `BattleInitializationSystem.source/prepare`; `AuthoredContent.select`; `js/data/authored-content.js` null |
| R19-03 | N/S or E/W approaches required, campaign-to-compass mapping remains provider-driven/TBD. No geometry-based orientation inference or default Wizard deployment invented. Fixture supplies map, depths3/2, Wizard Back, seed77, attacks/AI. | A/C/E/G; H7 §3.2; P7 §7; `js/systems/DeploymentSystem.js`; `js/data/battleFoundationFixture.js` |

## 20. Battle Map Specification

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R20-01 | Minimum30×30 tiles, may be larger; tiles16px. Cell = terrain identity string or `{terrainId,variantId}`; no cell-authored movement costs. Race/terrain resolver supplies movement. New maps/expanded cells Ocean. No arbitrary maximum dimension. | A/C; H7 §3.1; P8 editor; `BattleTerrainSystem.validate`; `BattleMapAuthoring.create/resize`; `MapAuthoring.validateTile` |
| R20-02 | Map stores ID/dimensions/tiles, conditions, opposing approaches, per-side FRONT/BACK arrays, specialDeployments, requiredPoints. Every required side ≥6 per category for readiness. RequiredPoints are protected positional metadata, not auto-spawned units. | C; P8/P8A; `js/editor/BattleMapAuthoring.js` shape/points/validate; `DeploymentSystem.assign` |
| R20-03 | Draft structural validation allows incomplete deployment; readiness for shipping/init requires valid known terrain/variants/conditions, unique eligible coordinates/IDs, full specials and capacity. Paint/resize fails atomically on invalid protected crops. Preview normal renderer, no campaign encounter/mutation. | C; P8 validation/preview; `js/editor/EditorDocument.js`; `BattleMapAuthoring.validate`; `js/editor/MapEditorState.js` |
| R20-04 | Current variants one existing visual per terrain, framework allows multiple sharing mechanics. Stairs-as-road/directional examples are design possibilities, not added shipping variants. Specials copy full character/gear definition with explicit rebuild semantics, never mutate source character. | A/C/G; ART §8; P8 specials; `MapAuthoring.BATTLE_TILES`; `js/editor/BattleMapAuthoring.js`; `js/editor/EditorDocument.js` |

R20-05 — **E/H, legacy fixture:** `js/data/maps.js` retains `TEST_MAP` / `foundation_test`, a 10×9 numeric-cell map. `js/data/terrain.js` supplies grass (move cost1, passable) and wall (Infinity, impassable), both with zero DEF/evasion bonuses. These older fixture definitions do not establish an exception to the later minimum30×30 authored battle-map requirement or replace the identity/variant terrain system.

## 21. Deployment

| Record | Chronological recovered rule | Status / evidence |
| --- | --- | --- |
| R21-01 | #7 Front/Back designation controls initial placement only; not lasting stance/stat/target restriction. Front toward enemy, Back behind; generated six-position centered rows expand independently above6, other row not shrunk. E/W centered vertically, N/S horizontally. | A/C/H scope; H7 §3.2; P7 §7; `DeploymentSystem.designation/rows` |
| R21-02 | #8 individual authored coordinates may be noncontiguous, ≥6 Front and6 Back each required side, no rectangle/depth-band requirement. Actual category shortage previously rejected; #8A explicitly replaces category exclusivity with preference/overflow. Generated rows still retain old shape. | B/C; P8 deployment; P8A algorithm; `BattleMapAuthoring.validate`; `DeploymentSystem.assign` |
| R21-03 | Current: validate all pools/special coordinates first; group Front/Back; preferred pass Front then Back preserving group order, seeded unused unit-valid selection; queue unplaced units; only after both groups preferred pass, overflow into unused valid either-category cells on same side. 7F/1B reserves Back preference before excess Front; 12F/0B can use six+six. | B/C; P8A exact algorithm; `DeploymentSystem.assign`; `js/debug/DeploymentOceanTests.js` |
| R21-04 | Every unit unique valid position; all authored cells globally collision-checked even if unused; specials never ordinary capacity; ordinary pool cells base traversable (Flying does not legalize Ocean pool), specials may use effective Flying occupancy. Fail whole assignment on insufficient valid capacity, invent no coordinates/drop no units. | B/C; P8A capacity/Ocean; `BattleTerrainSystem.canOccupy`; `BattleMapAuthoring.instantiateSpecials` |
| R21-05 | Per-unit seeded greedy selection is current implementation, not a proven global matching solver for arbitrary future terrain restrictions. Default designations Fighter/Knight/Paladin Front, Mage/Archer/Cleric/Thief Back; Alchemist/Wizard defaults unspecified. Explicit override first, class metadata second, configured defaults third. | C/D/G; `DeploymentSystem.designation/assign`; P7 §7; P8A determinism; IMP-010 |

## 22. Terrain / Movement

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R22-01 | Traversable identities road, grassland, forest, mountain, desert, river, stone, bridge; impassableMountain/River/Lake/Wall/Tree/Cliff; Ocean added authoritatively #8A. Distinguish ordinary mountain/river from impassable variants. Current shared grass/wall sprites do not erase mechanical identity. | A/C; H7 §3.3; P8A Ocean; `js/systems/BattleTerrainSystem.js` BATTLE_TERRAIN |
| R22-02 | Default traversable step1 MOV; race `terrainOverrides` by identity/category can override cost/traversability, production tables absent. Orthogonal paths; full-path atomic validation. Allies/Dying may be traversed but not occupied at endpoint; active enemies block passage, bounds always enforced. | A/C/G; H7 §3.3; P7 §8; `TacticalMovementRules.traverse`; `BattleTerrainSystem.normal/context`; `js/systems/PathfindingSystem.js` |
| R22-03 | One effective MOV budget per turn; repeated Move shares remaining allowance, no refresh. Fleet-Footed pairs consecutive legal perpendicular steps at total1 instead of2; both component moves checked. Exact interactions with future racial surcharges are not newly designed here. | A/C; H5 §12; H7 §3.3; `TurnSystem.start`; `js/systems/TacticalMovementRules.js`; `js/debug/ClassFoundationTests.js` |
| R22-04 | Flying terrain cost1, ignores terrain prohibitions, retains bounds/occupancy/hostile passage rules. Source-aware race/class/tactical/status inputs; spell source lasts3 affected-unit end turns and refreshes itself only. Racial declaration bridge absent (§7). | A/B/C/I; H6B §9; P6A; `js/systems/FlyingSystem.js`; `js/systems/TacticalMovementRules.js` |
| R22-05 | Final Flying expires on illegal ground: normal actions gated; next turn escape to one of eight adjacent normally occupiable empty cells, no illegal destination; no escape now or at next-turn recheck→AWOL. Escape current implementation leaves MOV/Major budgets, no CP. Impaired movement interactions beyond existing gates unresolved. | A/C/D/G; H6B §9; P6A Fly escape; `FlyingSystem.checkPosition/destinations/escape`; `TurnSystem.availability` |
| R22-06 | Ocean authoritative, ordinary units cannot traverse/occupy; established Flying allowed at1 MOV. No Aquatic race/status/swimming/ship rule or numeric normal Ocean MOV cost established. Resolver's fallback cost1 on a disallowed tile is not a traversal permission or designed Ocean cost. | B/C/G; P8A Ocean; `BattleTerrainSystem.normal/canOccupy`; `js/debug/DeploymentOceanTests.js` |
| R22-07 | Pure orthogonal pathfinding uses execution legality, remaining MOV and movement-ability state; route planner includes friendly unoccupied Portal transitions, deduplicates zero-cost cycles; route execution atomic. Destination scoring separate from routing. | A/C/D algorithm; H7 §3.10; P7 §19; `PathfindingSystem.find/plan`; `BattleController.route` |
| R22-08 | Portal two distinct endpoints within range4, caster tile permitted, no overlap other pair; one pair/caster, validated recast replaces own only. Occupied endpoints forced transfer/swap, even Dying/Frozen/Stunned/Immobilized without curing; voluntary friendly-only entry requires empty exit, preserves MOV/Major. Lasts3 subsequent caster turns, casting turn skipped. Dead-caster cleanup beyond this clock TBD. | A/C/G; H6B §11; P6 Portal; `PortalSystem.place/enter/endTurn`; `spells.portal` |

## 23. CT / Initiative

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R23-01 | Participating units CT0; discrete ticks +effective AGI; ready≥1000. Code jumps to earliest crossing, equivalent to empty tick iteration for unchanged stats. Positive integer AGI required by current implementation. Entire timeline freezes during control/menus/move/AI/scenes/animations/reaction choices. | A/C/D validation; H7 §3.4; P7 §§9–10; `js/systems/CTSystem.js` initialize/next; `js/systems/BattleController.js` |
| R23-02 | End Turn subtracts1000 from actual CT, preserving excess. AGI15: 67×15=1005, leaves5; later may leave10. Original `floor(1000 % AGI)` would be10, and is explicitly superseded by user's final overshoot answer. Do not reproduce the mistaken “66 remainder5” conversational arithmetic as a rule. | B/C/H; P7 §§1/10/28; H7 §3.4/§10; CTSystem.end |
| R23-03 | Same-tick tie higher AGI→DEX→MOV→STR→seeded random among complete ties. Ready queue retains other ready units while one acts. Exact RNG/shuffle mechanism implementation-only; ordered attributes design. | A/C/D; H7 §3.4; P7 §11; CTSystem.compare/order |
| R23-04 | Forecast clones state and RNG, includes repeated fast-unit activations and all active units, simulates known Dying/Fly/Portal lifecycle assuming unchanged future actions/positions. Never consumes live RNG. Dying maintenance scheduled without ordinary control/portrait; Dead/AWOL/inactive no ordinary activation. | A/C; P7 §§12/20; H7 §3.4; CTSystem.forecast/scheduled; `js/debug/BattleFoundationTests.js` |

## 24. Turn / Action Economy

| Record | Commands / rule | Economy | Presentation | Evidence/status |
| --- | --- | --- | --- | --- |
| R24-01 | Attack, Skills default, Magic, Steal, Item | Major default | Scene default | A/C; H7 §3.5; P7 §§13–14; `battleConfig.actions`; `TurnSystem.metadata` |
| R24-02 | Equip/Unequip, Stances, Scrounge | Major | Map | Same; Equip one item operation/turn; stance effects unresolved |
| R24-03 | Move, Trade, Enter Portal, Escape Illegal Terrain | Minor | Map | Same; Trade cost supersedes old TBD; Move uses remaining MOV |
| R24-04 | End Turn | Releases control; CT−1000 | Map/turn flow | A/C; H7 §3.4–3.5; `BattleController.endTurn` |
| R24-05 | One normal Major, independent MOV; spending either does not auto-end turn. Move2→Trade→Move1→Major→Move3 allowed with MOV6. Incapacitation/explicit turn-ending abilities can end control. | Independent budgets | Presentation never sets cost | A/C; H7 §3.3–3.5; TurnSystem; BattleController |
| R24-06 | Quick Items ordinary Item exempt Major, permits Item+Attack/Magic/Steal, not two ordinary Majors. Protect/Hold the Line explicitly false Major metadata but spend/lock MOV. Follow Through/Psyche Up/Forage/Refine/Panacea retain null costs despite current default resolution. | Exceptions / unresolved conflict | Separate classification | A/C/I; H5 classes; P4 §7; P5 §16; CONFLICT-006 |

## 25. Targeting / AoE

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R25-01 | Manhattan range and radius diamonds (§12). Applicable AoE includes enemies/allies/caster on confirmed tiles, including empty/friendly center for damaging area; explicit life/target rules retained. Battlefield Awareness blocks friendly offensive area magic, not enemy magic. | A/B/C; H7 §3.7; P7 §17; `js/systems/TargetingSystem.js`; `js/systems/MagicSystem.js`; `AbilityEffectHooks.magicAffected` |
| R25-02 | Target order measured from selected center, not caster: increasing Manhattan distance bands, clockwise from North (N→NE→E→SE→S→SW→W→NW positions as present). Empty center simply has no target at distance0. Residual coordinate/ID tie fallback implementation-only. | A/C/D; H7 §3.7; P7 §17; `TargetingSystem.ordered`; IMP-006 |
| R25-03 | Dying excluded from ordinary single-target/area/item/trade actions; Raise normal exception. Dead/AWOL not targetable; forced Portal relocation is movement transaction, not permission to attack Dying. Spell allegiance restrictions still constrain cures/healing. | A/C; H6B §§5–6/11; P6A Raise; `TargetingSystem.unitAllowed`; `js/systems/PortalSystem.js`; `js/systems/TradeSystem.js` |

## 26. Battle Scene

| Record | Established presentation, separate from mechanics | Status / evidence |
| --- | --- | --- |
| R26-01 | Adjacent: darkest-green screen, battlefield fade and simultaneous actor/target slide-in, ~1s idle, action/hit reaction, result ~2.5s, fade/map return. PLAYER left/ZEON right regardless initiator. Avoid RGB black outside palette. | A/C; H7 §3.6; P7 §15; `js/systems/BattleSceneSequence.js`; `js/rendering/BattleSceneRenderer.js`; `battleConfig.sceneTiming` |
| R26-02 | Ranged/friendly: show actor, start action, whip-pan continuous background to target, effect, return actor/results. Self-target only one actor sprite. Multi-target visits sequentially; no need all on screen at once. Wilderness-vs-Zeon receives opposing sides under #8. | A/C; H7 §3.6; P8 factions; `js/systems/BattleSceneSequence.js`; `js/rendering/BattleSceneRenderer.js` |
| R26-03 | Reaction interjects camera/action then resumes parent composition/target; mechanics from events, never animation authority. Conclusion stops future mechanics immediately while started presentation finishes→map frame→banner. Final art/sheets/dimensions TBD (§4). | A/C/G; H7 §§3.8/4.1; P7 §§16/20; `js/systems/CombatEventQueue.js`; `js/systems/BattleController.js`; ART §10 |
| R26-04 | Current extra timing values100/350/250/180/250/250ms for black/entrance/action/pan/effect/exit are code tuning, unlike documented approximate1s/2.5s. Enlarged placeholder sprite layout is not final art spec. | D/E; `battleConfig.sceneTiming`; `js/rendering/BattleSceneRenderer.js`; IMP-002 |

## 27. Reactions / Nested Resolution

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R27-01 | Ordinary legal-weapon-range counter opportunity universal concept; base chance/damage unresolved. Fighter Counter improves chance by unknown amount. Double attacks separate: AGI advantage formula TBD, final cap90%, Steal ineligible; ordinary/reaction/counter/second attacks require explicit eligibility. | A/G/C hooks; H5 §§8/13; H7 §6; `CombatSystem.counters`; `js/systems/DoubleAttackSystem.js`; abilities.counter/flurry |
| R27-02 | Prayer Cleric Lv3: qualifying adjacent friendly lethal event, **25%** roll `<0.25`, leaves exactly1 HP, no Dying/counter, statuses remain; no self rescue. Resolves before lethal transition/conclusion. Supplied debug decision is not guaranteed production success. | B/C; H6B §5; H7 §4.2; P6A subsequent clarification/P6B; `spellConfig.prayerChance`; `BattleStatusSystem.damage`; `js/debug/SpellCorrectionsTests.js` |
| R27-03 | Martyr Cleric Lv7: adjacent enemy newly Alive→Dying counter3→2; each new transition, including after Raise; not countdown ticks. Old battle-long first-entry restriction superseded. No damage/healing-received interpretation recovered. | B/C; H6B §5; P6A Martyr; `BattleStatusSystem.enterDying` |
| R27-04 | Spell Counter Wizard Lv2:20%, checked before ordinary counter; success suppresses ordinary check, failure allows it. Player chooses legally eligible purchased Mage **Lv1** spell, zero MP/Major/CP; selection waits transactionally, no reroll/cancel substitution. Enemy choice provider TBD. | A/B/C/G; H6B §8; H7 §3.9; `CombatSystem.counters`; `BattleState.chooseCounter`; `js/systems/BattleController.js` |
| R27-05 | Spell Counter-generated spell cannot trigger Spell Counter; other reactions may trigger. Provenance flag, not blanket no-reactions. Arcane Siphon Wizard Lv6 always on damaging magic: restore resolved paid MP (counter paid0), damage×0.90 before final rounding. | A/B/C/G rounding; H7 §3.9/4.2; H6B §8; `js/systems/CombatSystem.js`; `js/systems/BattleStatusSystem.js`; `js/systems/BattleActionSystem.js` |
| R27-06 | Stack/event frames retain parent actor/cast/ordered targets/cursor/history/provenance and waiting choice. Costs paid once, child counter executes then parent resumes. Transaction failure restores resources/cursors/RNG; unique receipts/trigger IDs prevent duplicate processing. Multiple reactions possible across AoE chain, but no total priority rule for every future reaction recovered. | A/C/D/G; H7 §3.8; P7 §§16–18; `js/systems/CombatEventQueue.js`; `js/systems/BattleController.js`; `js/systems/BattleActionSystem.js` |

## 28. Dying / Dead / AWOL

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R28-01 | At0 HP Dying counter3 unless Prayer prevents; no move/action/react/counter, ordinary targets/area excluded; tile pass-through allowed, cannot stop there. Own maintenance start decrements3→2→1→0; end at0 becomes Dead, removes map/roster, never revivable. Martyr/Raise exceptions above. | A/B/C; H6B §6; H7 §4.1; `BattleStatusSystem.startTurn/endTurn`; `js/systems/CTSystem.js` |
| R28-02 | Dying/Dead/AWOL count zero active combatants; last active unit lost immediately determines conclusion symmetrically. Future poison cannot reverse it; no remaining queued target mechanics. General Dying survivor fate after battle unspecified; do not auto-kill every Dying survivor. | A/C/G; H6B §6; H7 §4.1; P7 §20; `CombatSystem.detectConclusion`; `js/debug/SpellCorrectionsTests.js` |
| R28-03 | Tactical AWOL from stranded Fly expiry removes position/local roster, no Dying countdown, no targeting/actions; not synonymous with Dead. Win returns AWOL to original squad after battle; recovery amounts/status clearing TBD. | A/C/G; H6B §§9–10; P6A AWOL; `FlyingSystem.awol`; `AwolSystem.apply` |
| R28-04 | Losing AWOL independent50% survival; fail permanent casualty, succeed equally likely2/3/4 campaign-day delay. Due date resolution day+delay; World Update incoming day processes. RNG/outcomes/due dates persist, never reroll on load. This is specific AWOL, not final general squad-defeat survival. | A/C; H6B §10; P6A campaign resolution; `js/campaign/AwolSystem.js`; `js/debug/SpellCorrectionsTests.js` |
| R28-05 | Return settlement controlled by own faction/reachable, minimize battle network distance; tied maximize distance to nearest active enemy squad; complete tie equal deterministic random choice. Route midpoint formula §15. Message “[Name] has returned from the wilderness.” Active/unassigned on return, no invented HP/MP recovery. | A/B/C; H6B §10; P6B; `AwolSystem.settlement/update`; `BattleLocationSystem.distance` |
| R28-06 | No reachable friendly settlement retains pending `NO REACHABLE FRIENDLY SETTLEMENT`, rechecked later; ultimate fallback TBD. Old `BATTLE ROUTE POSITION UNRESOLVED` survives only replay compatibility for completed old update, not new valid-route returns. | G/H/C; P6B schema compatibility; `ResourceSystem.validateResolution`; `AwolSystem.update` |
| R28-07 | Earlier general defeat concepts: squad dissolves, individual survival factors Combat Rating/class/gear/circumstances/retreat, normal cap around95% proposed, one-use guarantee possible; MC guaranteed survival, nearest player settlement, recovery then MC-only squad; conscious retreaters survive. Not implemented as general system, and MC exception to later lethal AWOL is not reconciled. | A concept/F/G/I; H4 §9; H6B §10; `AwolSystem.apply`; CONFLICT-009 |

## 29. Factions

| Record | Recovered rule | Status / evidence |
| --- | --- | --- |
| R29-01 | Narrative war against demon king Zeon; MC recruits and seeks polity support; finale kills Zeon concept. Only PLAYER/ZEON actively field strategic conquering squads, other polities neutral/supporting rather than independent map-painting AI. | A/G narrative; H4 §§6/10; `js/config/campaignConfig.js` Faction/Allegiance/Controller |
| R29-02 | Polity alignment NEUTRAL/PLAYER; location controller NEUTRAL/PLAYER/ZEON, no OCCUPIED enum. Support converts non-Zeon-held polity locations to PLAYER; held locations remain ZEON until liberated. Walking PLAYER into neutral does not annex; ZEON does; either captures undefended opponent control. | A/B/C; H4 §10; P2.5 §12; `js/campaign/PoliticalControlSystem.js`; `js/debug/FoundationTests.js`; `js/debug/MapPresentationTests.js` |
| R29-03 | Wilderness combat faction hostile independently to PLAYER/ZEON and friendly to itself; not Neutral polity or third strategic treasury. Multi-faction target/CT/conclusion exists; Wilderness campaign win cannot silently become Zeon win. Post-battle political consequences TBD. | C/G; P8 Wilderness; `js/systems/FactionSystem.js`; `BattleState.result`; `BattleBoundary.validateResult` |
| R29-04 | Petition concepts: MC physically at petition site, eligibility separate from chance; Trust/Reputation/Fear/Zeon Pressure/Confidence/story; rough chance range; failed retry next day without day cost/generic trust penalty; scripted support alternative. Benefit recovery/polity-support requirements remain broader design beyond current income/control hooks. | A/G; H4 §10; `js/data/world.js` politics/story hooks; `js/campaign/PoliticalControlSystem.js` only partial |
| R29-05 | Jewels future: Light fair-race location, physical squad carriage/MC transfer, Zeon delivery to Granseal ritual requiring control; ~3-polity trigger provisional, ritual/reset TBD. Evil post-Zeon-return rare quest/monster site; legitimate discovery only. Two dedicated artifact slots, no sale/discard/deposit/wagon; retreat keeps; destruction drop fallback TBD. | A concepts/F/G; H4 §26; `js/campaign/SquadSystem.js` artifacts placeholder; no acquisition/ritual system |

R29-06 — **A/G, future quest concepts:** H4 §27 describes campaign quest state with availability, source, objectives, completion/failure, rewards and dialogue. MC generally must physically accept settlement quests; any player squad can perform objectives unless `requiresMC`. Reusable objectives include travel, defeat, liberation/defense/control, obtain/deliver, recruit/talk, support, survival and escort. Campaign events drive progress; quest-specific conditionals should not live inside combat/movement. Temporary route/wilderness Event Sites host encounters and discoveries. Rewards use existing systems, generally without quest-completion XP/CP; failure occurs only when authored. A global active/completed/failed journal preserves actual-versus-known state separation. This is documentary future design, not an implemented quest engine (TBD-059).

## 30. AI

| Record | Recovered intent / current behavior | Status / evidence |
| --- | --- | --- |
| R30-01 | Tactical AI should be ruthless, seek high effective harm/vulnerable targets, use damage intelligently, permit worthwhile friendly-fire sacrifice, avoid trapping/oscillation. Exact utility weights/candidate policy TBD. | A/G; H7 §3.10; P7 §19; `AISystem.choose` requires provider |
| R30-02 | Fixture moves toward reachable enemy, attacks adjacent for20, otherwise ends; first eligible counter choice fixture only. Not production attack formula or enemy spell preference. Current non-test BattleMap requires candidate provider. | E/C/G; `js/data/battleFoundationFixture.js` attack/choose; `js/states/BattleMapState.js` AI; P7 §§19/26 |
| R30-03 | Strategic Zeon future non-omniscient: legitimate last-known observations, persistent missions (capture/defend/reinforce/recover/hunt/block/escort/deliver), objective/treasury/geography-aware recruiting/equipping, preparation if weak, difficulty improves judgment not cheats. No player-order/wagon-destination mind-reading. Current hold/demo provider doesn't implement this. | A/G/C/E; H4 §26; `js/campaign/ZeonOrderProvider.js`; `js/campaign/TravelerSystem.js` knowledge boundary |
| R30-04 | Intel future settlement rumors, trust/fear/control/reputation/frontline affecting accuracy, no elaborate spy network; actual and known state separate. Current development omniscience is explicit presentation fixture, not intended production fog/intel. Every-other-turn enemy re-equip idea after Disarm remains proposal. | G/E; H4 §§22/25; P2.5 §15; `js/ui/MapPresentation.js` visibility; W5 Thief A26 |

## 31. Developer Tools / Editors

| Record | Recovered behavior | Status / evidence |
| --- | --- | --- |
| R31-01 | Terminal typed command Enter, grave/Escape close; `godmode` PLAYER HP/MP-loss protection/free otherwise-legitimate casting, no heal/unlock; `greedisgood` effective G costs0 retaining prices/income; `devmode` access toggle no reset/save modification. Flags transient. | C/B compared H7 reset proposal; P8 Terminal/cheats; `js/core/DeveloperRuntime.js`; `js/editor/DeveloperShell.js` |
| R31-02 | Context Dev Menu outside ordinary state manager, only open overlay captures input/pauses. Explicit Reset Current Game confirms runtime reset, preserves controls/editor storage. Test win/retreat moved to developer-only controls. | C; P8 developer layer; `js/core/Game.js`; `js/editor/DeveloperShell.js`; H7 §8 earlier intent preserved §34 |
| R31-03 | Campaign paint/copy/clear tool; separate location create/copy/edit/move/delete/connect; PropertyScreen conventions §5; maps grow/crop all edges with protected anchors and Ocean. Accepted edits mutate frozen draft through validation, not active campaign. | C; P8; `js/editor/EditorDocument.js`; `js/editor/MapEditorState.js`; `js/editor/MapAuthoring.js`; `js/editor/PropertyScreen.js` |
| R31-04 | Battle editor identity/variant picker, separate deployment groups and full special definitions, conditions, validation, normal-renderer preview, multiple maps/location. No arbitrary quest/NPC/script/treasure/event language added; no production test-battle shortcut without missing providers. | C/G; P8; `js/editor/BattleMapAuthoring.js`; `js/editor/AuthoredContent.js`; `js/editor/MapEditorState.js` |
| R31-05 | Connect source/neighbors flash500ms; Portal selected/active friendly pair flashes600ms phase. Property name max80, page24 rows and text limits are UI implementation choices. Slow flashing design doesn't establish all exact cadence values. | D/C; P8 Connect; `js/editor/MapEditorState.js`; `spellConfig.portalFlashMs`; `js/editor/PropertyScreen.js`; `LocationModel.validate` |
| R31-06 | Preserved debug tools: scenarios A–H travel/crossing/same destination/defender/two battles/delivery/interception/lone recruit; rule checks, tactical movement test, Spell/Portal Lab, Battle Foundation Test, race previews, debug level/CP/learning. Explicitly disposable/inspection operations, not normal player progression. | E/C; README development scenarios; `js/data/developmentScenarios.js`; `js/editor/DeveloperShell.js`; `js/ui/ClassManagementUI.js`; `js/states/SpellLabState.js` |

## 32. Persistence / Saves / Authored Content

| Record | Schema/version lineage | Evidence/status |
| --- | --- | --- |
| R32-01 | Campaign1 initial state →2 orders/resolution/faction stationing →3 economy/items/shipments/recruits →4 race/stats/growth →5 Lifetime/Current CP/learned/loadout →6 entry-grant marker →7 DEAD/casualty results →8 AWOL stream/pending + legacy equipment exceptions. #6B/#7/#8/#8A no further increment. | C/H; P1/P2/P3/P3.5/P4/P5/P6/P6A schema sections; `CampaignState.migrate`; `js/campaign/CharacterMigration.js`; `js/campaign/ClassMigration.js`; config schema8 |
| R32-02 | Supported old PLANNING migrations deterministic; active schemas1–4 rejected pending finish in old build, not reset. Active5/6/7 migrate with queue/resource preservation. Schema4 old cp/classLevel reconciled upward to threshold preserving mastery (cap10). Completed historical snapshots remain historical. | C/D compatibility policy; P4 §3; P5 §3; `js/campaign/CampaignState.js`; `js/campaign/ClassMigration.js`; `js/campaign/ResolutionValidation.js` |
| R32-03 | Preserve stored candidates/growth, no reroll; old completed Mage-zero-growth refresh replay uses legacyRecruitGrowth only for that history. Old completed route-hold replay preserved, next live update midpoint. Legacy equipment item-specific, never new proficiency. | C/H; P6 schema; P6A equipment; P6B compatibility; `ResourceSystem.validateResolution`; migration code |
| R32-04 | Campaign serialization API/internal validation exists, no player Save/Load/Continue/autosave UI. Reload fresh shipped campaign; pending campaign BattleScenario can persist in snapshot, not mid-tactical CT/event/UI state. General tactical HP/MP/items/CP/result reconciliation TBD. | C/G; README state; P7 §21/26; `Campaign.snapshot`; `BattleState.result`; RECOVERY-011 |
| R32-05 | Editor version1 `{version,world,visuals,battleMaps,nextId,entities}`; explicit local save/confirmed restore under `shining-farce.editor.v1`; controls1 separate `shining-farce.controls.v1`; failures visible. Storage varies by browser/folder; no campaign overwrite. | C/D keys; P8 persistence; `js/core/LocalStore.js`; `js/editor/EditorDocument.js`; `js/core/Input.js` |
| R32-06 | Portable JSON backup/import validates before replacement, can preserve incomplete drafts; no executing imported code. Shipping export readiness-gated classic `window.GBTRPG.data.AUTHORED_CONTENT=...`; download then manual replace `js/data/authored-content.js`, redistribute whole folder. Default placeholder null; no arbitrary filesystem write/server/fetch. | C; P8 workflow; `js/editor/EditorFiles.js`; `EditorDocument.shipping`; `js/editor/AuthoredContent.js`; `js/data/authored-content.js` |
| R32-07 | Authored world edits not automatically applied/migrated into existing campaign saves; definitions must remain compatible. Special units are transient; their Dead/AWOL IDs omitted from campaign casualties. Post-battle story persistence/recruitment unresolved. | C/G; P8 boundaries; `Game.resetCurrent`; `BattleState.result`; `js/editor/BattleMapAuthoring.js` |

## 33. Explicitly Deferred / TBD Design

This is the consolidated open-question register. It includes explicit deferrals and unresolved fields, not every ordinary null metadata value. Current defaults are listed to prevent accidental canonicalization. Related abilities remain individually inventoried in §11. Items explicitly settled later (Prayer probability, actual CT overshoot, default Trade/Scrounge economy, Portal Extend, Fly duration, route midpoint, Ocean status and authored deployment overflow) belong in §34 rather than this open list.

| ID | Subsystem / unresolved question | Evidence | Current fallback/fixture and risk |
| --- | --- | --- | --- |
| TBD-001 | Normal physical attack damage/hit/miss, critical chance/damage, STR/DEX/DEF formulas | H7 §6; P7 §27; `BattleController.action`; `battleFoundationFixture.attack` | Fixture adjacent20 damage; high risk if called production |
| TBD-002 | Ordinary counter probability/damage, Fighter Counter increase | H5 §8; H7 §6; `CombatSystem.counters`; abilities.counter | Supplied resolver only; no settled probability |
| TBD-003 | Double-attack AGI advantage formula; Flurry modifier; eligibility of each attack kind | H4 §17; P4 §9; `js/systems/DoubleAttackSystem.js` | Null formula/modifier; cap90% already final |
| TBD-004 | Steal success formula, spatial range, category difficulty and any gameplay cap | H4 §§22/28; P4 §§8/14; `js/systems/StealSystem.js` | Resolved-outcome hook; clamp0..1 is probability validity, not designed cap |
| TBD-005 | CON physical-debuff resistance/daily recovery; AGI dodge and single-target spell dodge; WIS buff/resistance formulas | H4 §§12/28; P3.5 §22 | Stat responsibilities exist, formulas absent |
| TBD-006 | Final MAX HP/MP coefficients, race ranges/MOV/offset balance | P3.5 §§7/21; `js/config/characterStatsConfig.js`; `js/data/races.js` | Provisional exact working values §6–7; high risk |
| TBD-007 | XP action awards, Combat Rating definition/scaling, threshold lineage | H4 §14; P5 §16; `js/systems/ExperienceSystem.js` | Empty boundary; 100 XP prior concept disputed in CONFLICT-005 |
| TBD-008 | Actual CP/action and executed success/failure award policy | H5 §§5/24; P5 §5; `CPAwardCalculator` in `js/campaign/ClassProgressionSystem.js` | Null; no10/action default |
| TBD-009 | Final balance of Lifetime CP threshold curve | H6B §3; `classConfig.thresholds` | Provisional curve, distinct from final purchase-price curve |
| TBD-010 | Fighter/Knight/Alchemist/Cleric and future class MOV modifiers; unspecified deployment defaults | P5 §§7/9; H7 §6; `js/data/classes.js`; `js/config/battleConfig.js` | MOV0 fallback; Wizard Back fixture only |
| TBD-011 | Cleric equipment/prerequisite confirmation, Alchemist final equipment | H6B §5; H5 §15; `spellClasses.cleric`; `classes.alchemist` | Empty Cleric permissions/no imposed lock; provisional light Alchemist |
| TBD-012 | Growth Training values: Fighter STR, Knight CON, Archer DEX, documented Mage INT | H5 class tables; H6B §7; abilities growth effects | Null gives no invented bonus; Wizard +2 is separate settled ability |
| TBD-013 | Power Attack damage/accuracy; Feint accuracy; Evasive Stance dodge | H5 §10; abilities.powerAttack/feint/evasiveStance | Nulls; Feint80% known |
| TBD-014 | Follow Through/Psyche Up Major cost; Psyche Up magnitude; Cleave secondary damage; final spear-technique name | H5 §10; P4 §§11/14; abilities objects | Cost null but generic default Major, CONFLICT-006; “Skewer” provisional |
| TBD-015 | Shield Bash low damage, shield Guard chance profiles/reduction, Chivalry fractional DEF rounding | H5 §11; P4 §11; abilities.shieldBash/guard/chivalry | 75% Stun/5% aura settled; remainder unresolved |
| TBD-016 | Slip Away chance; Skirmisher DEF; Escape Artist survival modifier | H5 §12; abilities.slipAway/skirmisher/escapeArtist | Metadata/hooks, null numeric modifiers |
| TBD-017 | Aimed/Power Shot accuracy/damage; Suppressing Shot MOV; Long Shot extension/penalty; Piercing Shot DEF ignore; Eagle Eye bonus | H5 §13; P5 §8; archer effects | Bow checks work; attack effects largely deferred |
| TBD-018 | Covering Fire activation chance and full pre-attack execution | H5 §13; P5 §8; `AbilityEffectHooks.coveringFire` | Chance null; no-cap and interrupt timing established |
| TBD-019 | Firing Position movement cost/timing and Long Shot composition | H5 §13; abilities.firingPosition | Up to1 tile/+1 range concept; no free-move assumption |
| TBD-020 | Toss range/targeting and full consumable command integration | H5 §15; P5 §9; abilities.tossItem; `js/systems/ItemSystem.js` | Consumption helper only; no invented throw range |
| TBD-021 | Purifying Medicine probability/status selection; Conservation probability/RNG | H5 §15; P5 §9; ItemSystem | Injected decisions; not automatic50% Conservation |
| TBD-022 | Emergency Medicine qualifying-damage granularity and automatic scheduling | P5 §9; abilities.emergencyMedicine | Trigger threshold/100%/selection established; boundary still hook |
| TBD-023 | Forage terrain loot tables, item creation, action cost and complete targeting | H5 §15; abilities.forage | Repeatable tile + use/throw/store known; table/cost null |
| TBD-024 | Refine potency multiplier/output catalog/action cost | H5 §15; P5 §9; ItemSystem.refinePlan | Requires externally defined output exceeding combined input effects |
| TBD-025 | Panacea action cost/full status-use execution | H5 §15; abilities.panacea; ItemSystem | All-removable query only; null cost caveat |
| TBD-026 | Catalyze duration extension, tiny proc chance and complete temporary-effect lifecycle | H5 §15/24; P5 §9; ItemSystem | Actual-consumption/+1 gate known; no0.1–0.5% default |
| TBD-027 | Scrounger metric/ties/MOV price/collection/full-bag policy; hidden-item persistence | H5 §§15–16; P7 §27; `js/systems/HiddenItemSystem.js` | Radius5/compass/on-tile query; Major established #7, other costs not |
| TBD-028 | Mage spell damage/range/MP, elemental interactions/status consequences, hit/resistance | H6B §§7/13; `js/data/spells.js`; `spellConfig.balance` | Empty production balance; lab20/40/60, range4, MP10 not design |
| TBD-029 | Cleric Heal magnitudes, ranges/radii/MP; cure/Raise ranges/radii/MP | H6B §§5/13; spells cleric entries | Null production values; cure types/Raise50% known |
| TBD-030 | Global fractional damage/healing/MP/restoration/percentage rounding | H6B §13; `RuleNumbers.integer`; `spellConfig.rounding` | Null/reject until provider; lab ceil not global rule. Explicit local ceil rules remain |
| TBD-031 | Previous spell-tier learning prerequisite chain | H5 §20; H6B §7; W5 Mage B26 | No chain assigned; structural prerequisite support ≠ decision |
| TBD-032 | Mage Lv9 intentionally open; Seething rounding/edge cases; Mage Training bonus; Efficiency rounding/composition | H5 §20; H6B §7; W5 Mage | Five designed passives absent runtime; CONFLICT-002 |
| TBD-033 | Fly production range/radius/MP and Extend compatibility | H6B §9/13; `spells.fly` | Duration3 settled; Expand only, other methods disabled |
| TBD-034 | Portal production MP, dead-caster pair cleanup, unsupported impairment interactions | P6 Portal; H6B §11/13; `js/systems/PortalSystem.js` | Range4/Extend5/duration settled; no new cleanup rule |
| TBD-035 | Enemy Spell Counter choice; total ordering of every future reaction; multi-Prayer priority adoption | H7 §6; P7 §16/27; `js/systems/CombatSystem.js`; `js/systems/BattleStatusSystem.js` | Explicit policy/iteration, no finalized AI or universal priority table |
| TBD-036 | Detailed racial terrain movement/traversability and compatibility matrix | H4 §29; H7 §6; `js/data/races.js`; `BattleTerrainSystem.normal` | Defaults traversable1, empty tables; no fabricated Centaur/Elf costs |
| TBD-037 | Fairy debuff cure category/range/cost/cooldown/status taxonomy | P3.5 §14; races.RACIAL_ABILITIES | Concept metadata only |
| TBD-038 | Secret races Goblin/Construct/Phoenix/Dragon/Pegasus Centaur | H4 §13; P3.5 §22 | Not ordinary registry; complete data unknown |
| TBD-039 | Hexer exact prerequisites/table/equipment/MOV; Enchanter race lock/table; Summoner mechanics/growth | H5 §21 | Future-class tokens/concepts only; Pixie/MP conflicts preserved |
| TBD-040 | Elementalist prerequisites/AoE/table; Ranger prerequisites/growth/sword+bow hand legality/Surefooted level | H5 §§14/21 | Geometry/equipment examples not completed classes |
| TBD-041 | Advanced Healer name/prerequisites/table; Raise2 level/range/MP; Paladin full class table/equipment/MOV | H5 §21; H6B §§5/12 | Paladin Knight5+Cleric5 and Raise2 owner/fraction settled |
| TBD-042 | Druid/timecaster class concepts, Desoul, Death Rattle owner/timing/final action | H5 §21; H6B §§6/13 | No entries or finalized ability tables |
| TBD-043 | Final item catalog tiers/weapon ATK/ranges/shields/bows/Wands; Wand basic attack and general off-hand rules | P4 §14; P5 §§14/20; H7 §6; `js/data/campaignResources.js` | Legacy STR item modifiers/tier-null catalogs; no weapon-weight formula |
| TBD-044 | Equipment inheritance/strengthening/item XP/relationships after death | H6B §13 | Retained item records only |
| TBD-045 | Production static Battle Map catalog and full biome/transition generator | H7 §6; P7 §27; `js/systems/BattleInitializationSystem.js` | Null shipping authored content/explicit fixture map |
| TBD-046 | Campaign approach→compass mapping and production generated deployment depths | H7 §3.2/§6; P7 §7 | Provider required; depths3/2 fixture only |
| TBD-047 | Future aquatic Ocean exceptions or campaign route/painted-terrain interaction | P8A Ocean/graph boundary | No Aquatic/swimming/boats/route-raster policy |
| TBD-048 | Production tactical AI candidate/scoring/utility weights | H7 §3.10; P7 §19 | Fixture attack-first/move-first choices, not permanent coefficients |
| TBD-049 | General post-battle HP/MP/status recovery, settlement treatment, injuries, Dying survivor fate | H6B §13; H7 §6; P7 §21 | Detached full-resource fixtures, no persistent attrition policy |
| TBD-050 | Full tactical CP/items/HP/MP reconciliation into campaign, campaign draw/Wilderness result rules | P7 §21/27; P8 boundaries; `BattleState.result` | Only established outcome/casualty/AWOL boundary persists |
| TBD-051 | No reachable friendly settlement AWOL fallback | H6B §10; P6B AWOL | Pending hold/recheck, not designer-selected eventual destination/death |
| TBD-052 | General defeated-unit survival/cap/Combat Rating factors, MC recovery, retreat geography/territory costs | H4 §9/28; P2 assumptions | Moving-origin retreat/DEFEATED records temporary; specific AWOL not universal |
| TBD-053 | Recruitment story/day progression/participation benchmark, production candidate counts/prices/rarity | P8 location/recruitment; H4 §11 | Old benchmark/tables retained; new settlements no invented candidates |
| TBD-054 | Final economy prices/income, recovery multipliers, discounts/commerce exceptions, Zeon spending/logistics | P3 §§20–21; H4 §§11/26 | Demo balance and default1 hooks |
| TBD-055 | Diplomatic willingness/Trust/Fear/Reputation/Confidence formula and liberation recovery | H4 §10/28 | Polity support/control APIs only; no complete petition loop |
| TBD-056 | Wilderness suppression radius, encounter chance/table/geographic strength and travel result | H4 §24/28 | Suggested radius2, likely player squads; not shipped |
| TBD-057 | Intel observations/accuracy/aging/report detail and non-omniscient Zeon strategic mission policy | H4 §§25–26 | Omniscient debug visibility; hold provider; knowledge routing boundary |
| TBD-058 | Jewel trigger timing, ritual duration/interruption, fair locations, drop fallback | H4 §26/28 | Two artifact slots only; ~3 polities provisional |
| TBD-059 | Quest/event/NPC/treasure scripting, event sites, journal, special-unit story persistence | H4 §27; P8 boundaries | IDs/boolean story conditions, no quest language or auto-recruitment |
| TBD-060 | Save slots/Continue/autosave/save permissions/mid-battle saves and authored-world compatibility policy | H4 §29; P8 persistence | Serialization API only; editor/control storage separate |
| TBD-061 | Final Battle Scene art/animation dimensions/standards and complete production asset roster | ART §§5–12; H7 §6; P7 §26 | 64px-rendered map placeholders, not sheet specification |
| TBD-062 | Mobile/Android host packaging/touch shell | H4 §4/29 | Logical action adapter only, no shell |
| TBD-063 | Hidden occupation treasures: conditions, disappearance/claimed flags, rewards | H5 §16; W5 Alchemist B26 | Scenario hiddenItems foundation, not campaign treasure persistence |

## 34. Superseded Design Ledger

Only defensible replacement chains are listed. A later implementation expansion is labelled as such rather than fabricated as a quoted designer decision. Stale prose remains untouched. Recovery of a formerly missing value is distinguished from an arbitrary change.

| ID | Topic | Historical rule | Superseded by / scope | Evidence |
| --- | --- | --- | --- | --- |
| SUPER-001 | Framebuffer first migration |160×144 #1/#2 |320×240 #2.5 | P1/P2 verification → P2.5 §3–5 |
| SUPER-002 | Framebuffer second migration |320×240 through #6B |480×360 real buffer #7 onward | H6B §1 → P7 §4/H7 §1; gameConfig |
| SUPER-003 | Early palette permission |Four art shades, old fifth background |All five greens allowed for artwork #2.5 | P1/P2 historical notices → P2.5 §2/§16 |
| SUPER-004 | Current palette |Five greens incl #CADC9F |Four only, old fifth removed #8 | H7 §1 → P8 migration/ART §2; palette.js |
| SUPER-005 | Strategic scale/representation |#2.5 8px generic MC/PLAYER/ZEON |#3 native16px roster-slot1-specific units,32px capital | P2.5 §§3–6 → P3 §§4–6 |
| SUPER-006 | Map interaction |Location cycling/neighbor navigation #1 |Spatial cursor, camera/context/stack route planning #2.5 | P1 controls → P2.5 §§7–11 |
| SUPER-007 | Neutral arrival |#2 unopposed PLAYER could annex neutral |PLAYER arrival preserves neutral, Zeon can conquer | P2 assumptions → P2.5 §12; PoliticalControlSystem |
| SUPER-008 | Stationing authority |Singular player stationedSquadId schema1 |Faction-specific stationedSquadIds schema2 | P2 new state; CampaignState.migrate |
| SUPER-009 | Resource schema |Schema2 movement-only records |Schema3 economy/items/travelers/recruits | P3 §3 |
| SUPER-010 | Character schema |Schema3 archetype/level stats |Schema4 explicit race/Character Level/base growth/derived stats | P3.5 §§3–5 |
| SUPER-011 | Class schema |Schema4 cp/independent classLevel |Schema5 Lifetime/Current CP/learned/loadout, preserving prior mastery | P4 §3; ClassMigration |
| SUPER-012 | Entry-grant schema |Schema5 no processed marker |Schema6 once-only processed grant accounting, migration no retroactive award | P5 §§3/6 |
| SUPER-013 | Casualty schema |Schema6 lacks permanent DEAD result domain |Schema7 DEAD/casualty commit | P6 schema |
| SUPER-014 | AWOL/legacy schema |Schema7 lacks AWOL schedule/item exceptions |Schema8 adds both; later prompts stay8 | P6A schema; campaignConfig |
| SUPER-015 | Martial growth recovery |#4 values unknown/null; W1 unavailable |#5 FighterSTR1/KnightSTR1CON1/ThiefAGI1; ArcherDEX1/AlchemistWIS1 | W2 recovery; P5 §7; H5 §4 |
| SUPER-016 | Ability purchase prices |#4 null/refuses purchase |#5 level-based final100…350 curve | P4 §5 → P5 §4; AbilityCostSystem |
| SUPER-017 | CP qualification |#4 successful/meaningful-only filter |#5 legal executed noncancelled receipt, success policy supplied by calculator; universal attribution explicit | P4 §4 → P5 §5/20 |
| SUPER-018 | Mage scope |Legacy nonplayable class; four families designed after#5 |#6 playable Mage +1INT, six families/24 spells | H5 §20/W4 → W5/P6 Mage; spellClasses/spells. Five passives/grant not silently superseded. |
| SUPER-019 | Mage equipment |#6 WAND/ROBE plus legacy Staff/armor acceptance |#6A WAND/ROBE only, item-specific old exceptions | P6 Mage → P6A equipment audit; H6B §7 |
| SUPER-020 | Martyr trigger |#6 first Dying entry in whole battle only |#6A each new Alive→Dying transition, including after Raise | P6 lifecycle → P6A Martyr/H6B §5 |
| SUPER-021 | Prayer probability |#6 null; H6B reports an earlier provisional50% |Final25% clarification after#6A, confirmed#6B | P6 Cleric → P6A subsequent clarification/P6B/H6B §14. No shipped50% source recovered. |
| SUPER-022 | Player Spell Counter choice |#6 unresolved selection policy and broad purchased-Mage wording |#6A mandatory player choice of purchased eligible Mage Lv1; enemy policy still TBD | P6 Wizard → P6A Spell Counter/H6B §8 |
| SUPER-023 | Flying duration/source lifecycle |#6 duration/clock unresolved |#6A spell source3 affected-unit turns; escape/AWOL/source-aware expiry | P6 Fly → P6A Fly/H6B §9 |
| SUPER-024 | Portal Extend status |H6B §14 reports earlier Portal-modifier uncertainty; W5 Wizard rows33–37 do not state its modifier allowlist |Approved Portal Extend range4→5, MP×1.10; other methods no | P6 Portal already implements Extend; P6A Portal confirms deliberate approval; H6B §11/14. Fly Extend remains TBD. |
| SUPER-025 | Route AWOL location |#6A BATTLE ROUTE POSITION UNRESOLVED |#6B exact network midpoint, old completed holds replay-only | P6A settlement → P6B; BattleLocationSystem |
| SUPER-026 | CT carryover |Attachment remainder expression floor(1000%AGI), remainder10 example |Final explicit answer: subtract1000 from actualCT, initial AGI15 excess5 | P7 §§1/10/28; H7 §§3.4/10 |
| SUPER-027 | Trade/Scrounge default cost |#5 default Trade and Scrounge cost TBD |#7 Trade Minor; Scrounge Major (other Scrounger policies remain TBD) | P5 §10/null inventory → P7 §13/23 |
| SUPER-028 | Mage AoE targets |Earlier damage target ENEMY/self excluded |#7 applicable area includes allies/caster, explicit restrictions retained | P7 §17/23; spells areaAllegiances; TargetingSystem |
| SUPER-029 | Nested Spell Counter |No final recursion contract in older framework |#7 generated counter cannot trigger Spell Counter; other reactions allowed | H7 §3.9; P7 §18; provenance flag |
| SUPER-030 | Devmode entry/reset |H7 §8.2 intended entry reset, persistent scope unresolved |#8 toggle no reset; separate confirmed runtime-reset command | H7 → P8 Terminal/developer layer. Replacement implementation/request report, not recovered original prompt quotation. |
| SUPER-031 | Settlement authoring vocabulary |Legacy CAPITAL/PORT/FORTRESS/SHRINE/CROSSROADS |#8 retained configuration plus Village/Town/City/Fort/Castle/Wilderness authoring vocabulary | P8 locations; LocationModel.normalize. Old data retained; AWOL consumer gap CONFLICT-010. |
| SUPER-032 | Authored deployment |#7 rows; #8 arbitrary authored spots but category capacity rejection |#8A two preferred passes then same-side unused-category overflow; still≥6/category | P7 §7 → P8 deployment → P8A exact algorithm |
| SUPER-033 | Ocean status |#8 authoring fill, blocked conservative UNRESOLVED |#8A authoritative ordinary impassable, established Flying allowed | P8 boundaries → P8A Ocean; BattleTerrainSystem |
| SUPER-034 | Druid rejection scope |H4 “no Shaman/Druid for now” |H5 Druid reintroduced as maybe, still no final class | H4 §18 → H5 §21 |
| SUPER-035 | Ability reservations |Surefooted on Archer / elemental affinity-style Mage proposals |Surefooted reserved Ranger; Affinity/Mastery removed Mage, possible Elementalist; Lv1 spell counter reserved Wizard and later designed there | H5 §§13–14/20/24; H6B §8; absent current Mage/Archer entries |

## 35. Conflicts Requiring Designer Review

These are review questions, not instructions to change code. Several are clear design-versus-implementation gaps with unresolved scope, rather than two equally valid designs. Explicit corrections already traced in §34 are not reopened here.

| ID | Topic | Source A | Source B | Nature of conflict | Current implementation | Designer decision required |
| --- | --- | --- | --- | --- | --- | --- |
| CONFLICT-001 | Mage initial100 Current CP | H5 §20; W5 Mage B23; H6B §7 say designed one-time100, no Lifetime CP | `js/data/classes.js` all grants null; spellClasses leaves Mage null; README calls entry grants unresolved | Explicit design survives in handoffs but not shipping setting; no recorded rescission | Mage first-access records0 grant | Confirm implementation scope for recorded Mage-only grant and migration treatment; do not grant every class |
| CONFLICT-002 | Five Mage passives | H5 §20/W5 Mage rows18–19/H6B §7 preserve Seething/Robe/Wand/INT Training/Efficiency | Current `js/data/abilities.js` + `js/data/spellClasses.js` Mage has24 spell Actions only | Documented design absent, not proved superseded; Wizard owns same-name INT Training with different numeric certainty | No five Mage entries/handlers; no Mage +2 assumption | Confirm omitted implementation scope; recover Mage Training amount and Seething/Efficiency edges separately |
| CONFLICT-003 | Inherent racial flight | H4 §13/P3.5 §13/races BIRDFOLK/FAIRY FLIGHT declarations | P6A explicitly adds no inherent powers; FlyingSystem.sources reads capabilities FLYING, not movementTraits FLIGHT | Settled declaration remains unconnected to effective terrain ability; no documentary revocation | Ordinary Birdfolk/Fairy data supplies no effective source by itself | Clarify timing/adapter intended for racial flight, without inventing terrain exceptions |
| CONFLICT-004 | Pixie vs Fairy identity | H5 §21 Enchanter “Possibly Pixie-only” | Races/H4 ordinary roster only FAIRY, no PIXIE | No safe evidence of synonym, rename, secret race or deliberate separate race | Enchanter absent; compatibility matrix empty | Identify intended race name/lock and whether proposal adopted |
| CONFLICT-005 | XP100 threshold status | H4 §14 “Prior design:100 XP=Character Level” | P5 §16 XP awards/thresholds deferred; ExperienceSystem empty | Historical design concept vs later broad unresolved wording without explicit threshold replacement | No XP implementation | Recover/adopt/reject threshold explicitly; do not derive awards from debug leveling |
| CONFLICT-006 | Null per-ability action costs | H5/P5 preserve Follow Through/Psyche Up/Forage/Refine/Panacea cost TBD; current abilities still majorAction:null | P7 default Skills Major; TurnSystem.metadata only checks false, otherwise default | Unclear whether default intentionally supersedes unresolved per-ability fields; availability's null guard cannot see null after Boolean consumesMajor | Would charge default Major if resolved externally; full effects still deferred | Specify these five action costs and scope of #7 default; ledger does not normalize them |
| CONFLICT-007 | Steadfast vs Wilderness hostile source | H4 Knight/H5 §11 immune to enemy-caused displacement; P8 Wilderness hostile to PLAYER/ZEON | AbilityEffectHooks.displacementAllowed limits protected source-faction handling to PLAYER/ZEON | New combat-faction domain not reflected in this existing hook | Wilderness displacement not blocked by that hook; full forced-displacement skill execution incomplete | Confirm all hostile factions intended for Steadfast and future source policies; no gameplay patch here |
| CONFLICT-008 | Summoner “medium MP growth” | H5 §21 Summoner | H4 §12/P3.5 derivedMP from INT; only six primaries grow | Direct-MP concept cannot be translated to +INT or offset without design | No Summoner class | Recover whether meant INT growth, capacity modifier or obsolete concept |
| CONFLICT-009 | MC guaranteed survival vs losing AWOL | H4 §9 MC survival guaranteed/recovery concept | H6B §10 independent50% losing-AWOL failure death; AwolSystem.apply has no MC exception | Specific later AWOL text does not explicitly address earlier MC guarantee | MC handled like other losing AWOL, can markDead | Clarify applicability of MC guarantee to AWOL/permanent tactical death and campaign failure |
| CONFLICT-010 | Authored settlement types and AWOL eligibility | P8/LocationModel.compile emits VILLAGE/TOWN/CITY/FORT/CASTLE; H6B §10 eligible controlled settlement | AwolSystem.settlement filters only CAPITAL/VILLAGE/PORT/FORTRESS/SHRINE | Post-editor types partly omitted from old consumer; no intended exclusion of Town/City/Fort/Castle found | Authored VILLAGE eligible; new TOWN/CITY/FORT/CASTLE fail old type filter | Confirm settlement eligibility vocabulary; classify as implementation integration gap, not designed exclusion |

## 36. Missing / Needs Recovery

Every item below is **UNKNOWN / NEEDS DESIGNER RECOVERY** for the specified missing part. Explicitly deferred mechanics also appear in §33; this section highlights lost provenance/incomplete prior-design recovery rather than pretending every open idea was once finalized.

| ID | Missing material / exact recovery need | Available evidence and limit |
| --- | --- | --- |
| RECOVERY-001 | Final Battle Scene art sizes, animation sheet/grid/frame standards, production backgrounds/effects | ART explicitly says unestablished; code64×64 display of16px placeholders cannot supply intended asset size |
| RECOVERY-002 | Complete original prompt/conversation lineage and workbook artifact identity | Reports/handoffs survive; only two Git commits. H5 cites v4_with_Mage filename absent repository; current v4 has Mage but equivalence not provable |
| RECOVERY-003 | Original authoritative rejection/omission of Thief Evade and whether later workbook repetition was deliberate | H5 warns old workbook not accepted; W1–W5 retain Evade; no raw conversation. Current code excludes it |
| RECOVERY-004 | Full secret-race roster decisions and Pixie/Fairy relationship | H4 lists five candidates; H5 possible Pixie lock; no definitions or final stats |
| RECOVERY-005 | Detailed racial terrain/capability tables and racial-flight activation integration | Seven complete numerical race profiles exist, but terrainOverrides absent; flight metadata/engine disconnect CONFLICT-003 |
| RECOVERY-006 | Future class full tables, equipment/MOV/deployment/grants and exact mastery prerequisites | H5 concepts + Paladin exact prerequisite + future Raise2 owner only; classes in §8 must not disappear from future review |
| RECOVERY-007 | Mage grant/passive implementation intent and any missing later corrective decision | Three design artifacts agree; shipping records disagree; no explicit retraction discovered |
| RECOVERY-008 | Final weapon/bow/Wand/Shield catalog stats, range profiles and off-hand arrangements | Legacy ten items plus selector vocabulary only; no invented numerical weight/medium-bow design |
| RECOVERY-009 | Original XP100 adoption context and full Combat Rating rules | H4 records prior concept, later documents defer; empty ExperienceSystem |
| RECOVERY-010 | MC survival/defeat/wilderness-return priority and general post-battle fate | H4 general guarantees vs later specific AWOL death; no complete reconciled campaign-failure rules |
| RECOVERY-011 | Full tactical-to-campaign resource/status/CP reconciliation and save/load design | Casualty/AWOL result path exists; no complete HP/MP/items/CP merge or mid-battle save contract |
| RECOVERY-012 | Final narrative/world/polity/quest/artifact content beyond preserved concepts | H4 §§6/10/24–27; seven-node demo, empty hooks; not a full story bible or encounter catalog |
| RECOVERY-013 | Which workbook balance annotations were adopted as final, especially Alchemist recruit price/“MP recovers naturally” and growth provisional labels | W5 Alchemist B25 and class B12; H5/P5 later/earlier acceptance language overlaps. No exact recovery schedule or price ratio |
| RECOVERY-014 | Primary source for provisional Prayer50% and unadopted proposal values | H6B §14 reports historical50%; P6 production config was null. Repository does not contain a shipped50% implementation or full discussion; final25% secure |

## 37. Implementation-Only Decisions

These are D/E records unless a specific subpart is documented as design. They should not enter a future specification merely because tests assert them.

| ID | Current value / behavior | Evidence | Boundary / risk |
| --- | --- | --- | --- |
| IMP-001 | Stick0.55, button>0.5, repeats350/110ms, queue32, accepted key pattern/button0–31 validation | `js/core/Input.js` | Input tuning/validation, not designer-established constants |
| IMP-002 | Scene black100/entrance350/action250/pan180/effect250/exit250ms; 64px placeholder draw; anchors/layout | `battleConfig.sceneTiming`; `BattleSceneRenderer.draw` | ~1000 idle/~2500 result documented; remaining values/render size implementation |
| IMP-003 | Portal600ms and Connect500ms flashing; UI paging/text/name bounds | `spellConfig.portalFlashMs`; `js/editor/MapEditorState.js`; `js/editor/PropertyScreen.js`; `LocationModel.validate` | “Slow flash” does not independently adopt exact timing; max80 name is UI constraint |
| IMP-004 | Storage key strings/version1; editor ID/counter shape; defensive frozen cloning | `js/core/LocalStore.js`; `js/editor/EditorDocument.js`; `js/core/Input.js` | Persistence format choices, not game mechanics; campaign schema separately traced |
| IMP-005 | LCG1664525/1013904223, ID-derived seed, fixed draw ordering | `js/core/DeterministicRandom.js`; `js/campaign/CharacterGrowthSystem.js` | Determinism intended; exact PRNG is implementation |
| IMP-006 | Conflict ID ordering, same-day arrival ID tie, residual AoE y/x/id order, equal item-heal item-ID tie | `js/campaign/MovementConflictSystem.js`; `js/campaign/StationingSystem.js`; `TargetingSystem.ordered`; `js/systems/ItemSystem.js` | Deterministic tie convention, not additional tactical advantage/priority design |
| IMP-007 | Unspecified class MOV0/growth{}; legacy ATK=effective STR; initial tactical resources full/clamping | `js/campaign/ClassGrowthProvider.js`; `js/campaign/BattleStatAdapter.js`; `js/entities/Unit.js` | Explicit fallback/compatibility; not final unknown class bonus, damage formula or post-battle heal |
| IMP-008 | Demo funds1000/500, incomes60/25/80/40/15/0/0, recruit base+15×level, upper-quartile−2+(seed%2) | `js/data/campaignResources.js`; `ResourceSystem.initialize`; `js/campaign/RecruitmentSystem.js` | F/E working balance, not final economy/production level rules |
| IMP-009 | Spell Lab100HP/MP, unspecified range4/radius1/MP10, magnitude20/40/60, ceil; debug damage100 | `js/data/spellLabScenario.js`; `js/states/SpellLabState.js` | E only; fixed spell properties override fixtures; normal balance empty |
| IMP-010 | Battle fixture30×30 map, row depths3/2, seed77, Wizard Back, adjacent Attack20; deployment per-unit greedy seeded selection | `js/data/battleFoundationFixture.js`; `DeploymentSystem.assign` | E/D; no production depths/attack balance or global matching guarantee |
| IMP-011 | Fixture attack-first then move/end; enemy first eligible counter; debug omniscient visibility | `battleFoundationFixture.choose`; `js/states/BattleMapState.js`; `js/ui/MapPresentation.js` | E, not ruthless production utility/legitimate intel policy |
| IMP-012 | Old orphan unit Granseal/PLAYER/level3 and ORC HUMAN profile; old CP raised to preserve class mastery | P3.5 §4/21; P4 §3; `js/campaign/CharacterMigration.js`; `js/campaign/ClassMigration.js`; `js/data/campaignResources.js` | Compatibility facts, not narrative/biological/recruit defaults |
| IMP-013 | Cure/Raise modifier allowlists; Cleric empty permission list/no imposed prerequisite; Archer known non-heavy bow selector | `js/data/spells.js`; `js/data/spellClasses.js`; `classes.archer`; P5 §21 | C/D where exact adoption weak; not permission to invent missing gear or final race locks |
| IMP-014 | Readiness rejects all duplicate unused authored slots; base-traversable ordinary pool even for flying squad; draft structural-vs-ready validation | `BattleMapAuthoring.validate`; `DeploymentSystem.assign`; P8A | C implementation enforcing design validity; do not infer new deployment combat buffs |
| IMP-015 | CT16 nominal slots, renderer19 displayed entries/page; forecast10000 iteration guard; next-threshold jump | `battleConfig.timelineSlots`; `BattleMapRenderer.draw`; `CTSystem.next/forecast` | UI/performance guards, not designer turn cap or new timeline rule |
| IMP-016 | Economy floor of income×multiplier and ceil of item price×shop multiplier before developer-cost override; normal Ocean disallowed resolver still returns fallbackcost1; floating exact-integer tolerance1e−9 | `js/campaign/EconomySystem.js`; `BattleTerrainSystem.normal`; `RuleNumbers.integer` | Local implementation, not global rounding/Ocean movement policy |
| IMP-017 | Legacy type→new settlement mapping; existing demo controllers preserved over authored allegiance; new controls initialized from allegiance | `LocationModel.normalize/compile`; `AuthoredContent.campaign` | Compatibility policy; does not redefine polity diplomacy; CONFLICT-010 consumer mismatch |
| IMP-018 | Campaign non-AWOL route casualty retained record at origin; traveler capture/no implicit escort; old battle retreat-origin fallback | P6 casualty section; `js/campaign/BattleCasualtySystem.js`; `js/campaign/TravelerSystem.js`; P2 assumptions | D/E/G physical placeholders; not final corpse/loot/retreat/survival design |

## 38. Canonical Candidate Index

Navigation aid for human review only. HIGH = explicit decision with consistent later evidence; MEDIUM = strong evidence with adoption/provenance/context still needing review; LOW = incomplete/ambiguous, normally linked to conflict/recovery. A HIGH candidate does not make all neighboring fixture constants canonical.

| Topic | Candidate rule | Confidence | Primary evidence | Implementation confirmed? |
| --- | --- | --- | --- | --- |
| Runtime | Classic offline local-file architecture, external PNGs, no play-time build/server/dependencies | HIGH | H4 §1/H7 §1; R02-01 | Structurally yes; real browser launch unverified |
| Visuals |480×360 true framebuffer; four exact greens | HIGH | H7 §1; ART §§2/4; P7/P8; R04 | Yes configuration/retained QA |
| Map art |16px Campaign/Battle map tiles and map units;32px capital marker | HIGH | H4 §3/H5 visual; P3; assets README | Yes; not final Scene sheets |
| Progression |Character vs Class Level separate; six primaries; permanent racial+current class growth | HIGH | H4 §§12/14; H6B §4 | Yes |
| Races |Seven ordinary race identities and Beastman equipment restrictions | HIGH | H4 §13; P3.5 | Yes declarations; flight gap separate |
| Race balance |Exact recovered numeric profile tables | MEDIUM | P3.5 §21; races.js; §7 | Yes, intentionally provisional |
| Class prerequisites |Individual-character mastery; KnightFighter3; WizardMage5; PaladinKnight5+Cleric5 | HIGH | P4 clarification; H6B §§8/12 | Knight/Wizard yes; Paladin example only |
| Class growth |Eight working class bonuses in §8 | HIGH | H6B §4; P5/P6 | Yes; workbook provisional wording retained |
| Purchase/loadout |100…350 price curve, individual permanent purchases, Primary/Secondary/one each passive slot | HIGH | H5/H6B; P5 | Yes |
| CP attribution |Universal/current100%; secondary ceil/floor split; no passive independent CP | HIGH | H6B §3 | Yes receipts; amount unresolved |
| Mage grant/passives |Documented100 grant and five passives | LOW | CONFLICT-001/002 | No; recovery candidates, not silently removed |
| Spell structure |Six families×four tiers,1/3/5/7 unlocks,1/2/2/3 radii, separate range/magnitude/MP | HIGH | H6B §7/W5 | Yes data/framework; balance unresolved |
| Wizard |Four exclusive methods and exact factors, ownership retained, Arcana access | HIGH | H6B §8/W5 Wizard | Yes with supplied balance/rounding |
| Physical inventory |Stable copies, dedicated equipment, personal4, no squad inventory/teleporting | HIGH | H4 §11; P3/P4 | Yes |
| Equipment |MageWands/Robes; WizardStaves/Robes; light/heavy bows distinct types, no numerical weight system | HIGH | H6B §1/7/14 | Permissions yes; missing catalog items |
| Squad |Max12, ordered roster-slot1 sprite, separate MC identity, one stationed squad/faction | HIGH | H4 §8; P2/P3 | Yes |
| Campaign time |Frozen simultaneous End Day, next edge only, battles pause/resume, day once | HIGH | H4 §7; P2 | Yes |
| Campaign terrain |Decorative grid separate from route graph | HIGH | H4 §7; P8A graph boundary | Yes |
| Economy/logistics |G/infinite shops/local recruits/items/independent wagons; no wages/food | HIGH | H4 §11; P3 | Yes; numeric balance provisional |
| Battle sources |Location static vs route procedural midpoint; explicit providers | HIGH | H7 §3.1 | Boundary yes; production content absent |
| Deployment |≥6Front+6Back/category/required side, preference then overflow, separate specials, unique valid positions | HIGH | P8A exact algorithm; R21 | Yes,42 correction tests |
| Terrain/Ocean |Normal traversable1 unless race override; Ocean ordinary impassable; Flying1 with collisions/bounds | HIGH | H7 §3.3; P8A | Yes; racial flight bridge absent |
| CT |Start0,+AGI ticks,≥1000, subtract1000 actual overshoot; tie AGI/DEX/MOV/STR/random; frozen control | HIGH | H7 §3.4/P7 final clarification | Yes |
| Action model |Major/Minor and Map/Scene independent; shared MOV; explicit End Turn | HIGH | H7 §3.5 | Yes; null-cost conflict isolated |
| Area sequence |Manhattan bands around center, clockwise North; applicable allies/self | HIGH | H7 §3.7 | Yes |
| Battle Scene |Adjacent/ranged/friendly/self/multi-target/reaction flows; animation not rule authority | HIGH | H7 §§3.6/3.8 | Placeholder presentation yes; art standards absent |
| Prayer |25%, adjacent friendly lethal→1HP before Dying/conclusion, statuses retained | HIGH | H6B §5/H7 §4.2; P6B | Yes |
| Martyr/Raise |Each new Dying entry3→2; Raise1 Dying-only50%; future Raise2 owner100% | HIGH | H6B §5 | Raise1/Martyr yes; Raise2 behavior hook only |
| Counter/Siphon |Spell Counter20%, player MageLv1 choice, free/noCP, narrow anti-recursion; Siphon paidMP/0.90 | HIGH | H6B §8/H7 §3.9 | Yes boundaries; enemy policy TBD |
| Fly/Portal |Source-aware affected-turn Fly3, illegal escape/AWOL; Portal paired/allegiance/3caster turns/Extend | HIGH | H6B §§9/11 | Yes with missing balance providers |
| Life/conclusion |Dying/Dead/AWOL inactive; own-turn countdown; no Dead revival; immediate zero-active conclusion | HIGH | H7 §4.1 | Yes |
| AWOL |Specific losing50%/2–4days/network return tie hierarchy | HIGH | H6B §10/P6B | Yes legacy settlement vocabulary; CONFLICT-009/010 limits |
| Factions |PLAYER/ZEON strategic domains; Neutral control/allegiance distinct; Wilderness combat hostility | HIGH | H4 §6/10; P8 | Yes, partial old-hook gaps flagged |
| Editor model |Separate immutable draft, identity/variant tiles, individual spots/specials, validation/preview/export | MEDIUM | P8/P8A; ART corroboration | Yes; original #8 request absent repository |
| Developer entry |Devmode no reset; separate confirmed runtime reset; cheats transient | MEDIUM | P8 explicitly replaces H7 concept | Yes |
| Persistence |Schema8 campaign; separate editor/control1; local draft+JSON backup+manual shippingJS replacement | MEDIUM | P6A/P8/P8A | Yes; browser-specific storage not live-tested |
| Future class/campaign concepts |Keep named planned classes, diplomacy/intel/Jewels/quests for design review | LOW | H4 §§24–29/H5 §21; §33/36 | Mostly no; do not fabricate tables/formulas |

End of recovery ledger. The human designer must review unresolved classifications and conflicts before any material is promoted into a canonical specification.
