# Shining Farce — Prompt #8A Implementation Report

## Outcome

Implemented the narrow deployment-preference/overflow and authoritative Ocean corrections. Prompt #8's developer/editor/input/persistence systems remain in place. Campaign save schema remains **8**; editor and control-profile versions remain **1**. The framebuffer remains **480×360**, Campaign Map tiles remain **16px**, and the four-color palette is unchanged.

Final deterministic results: **778 total / 778 passed / 0 failed / 0 skipped**.

| Suite | Passed | Failed |
| --- | ---: | ---: |
| New Prompt #8A checks | 42 | 0 |
| Prompt #8 checks | 118 | 0 |
| Prompt #7 checks | 80 | 0 |
| Earlier checks | 538 | 0 |
| Total | 778 | 0 |

All 736 prior test cases remain present and pass. One Prompt #8 assertion was deliberately updated because this prompt supersedes it: Ocean must now report AUTHORITATIVE rather than UNRESOLVED. Its existing non-traversability assertion remains, and the new suite adds traversal, occupancy, deployment, pathfinding and Flying coverage. No previous test was removed or relaxed to permit invalid placement.

The complete existing offline Canvas2D rendering exercise passed, including normal campaign/battle flows and the developer/editor/control interfaces. All **31 shipping PNGs**, including the **22 runtime manifest entries**, still conform to exactly four colors. The scan checked **20,284 opaque asset pixels** and found **0 forbidden-color pixels and 0 partial-alpha pixels**. Runtime palette scans cover 162 source files. Static checks found **171 local classic scripts**, one local stylesheet, no missing resources, no syntax errors, and no production runtime fetch/XHR dependency.

## Exact deployment-assignment algorithm

`DeploymentSystem.assign` now operates as follows:

1. Validate the two opposing squads, their existing 12-unit maximum, unique unit IDs and explicit opposite-side orientation. Class defaults and explicit character overrides still determine Front/Back designation.
2. Reserve explicitly authored special deployment coordinates in a separate collision set. They are never added to an ordinary squad position pool.
3. For each participating side, obtain its authored Front/Back arrays, or use the existing generated-row provider. Require at least six positions in each category. Validate coordinate bounds, base ordinary terrain eligibility and uniqueness across categories, both participating sides and special coordinates. Even a conflicting authored position that would otherwise remain unused is rejected.
4. Check total authored capacity. Preserve the existing generated-row centering and depth ordering; do not impose those row shapes or depths on individually authored positions.
5. For each side, run a **preferred-position pass**: Front units first, then Back units, retaining their relative input order within each group. For each unit, choose among unused, unit-valid positions in its own category. If none remain, put that unit in an overflow queue instead of rejecting the squad.
6. Only after both categories have had their preferred pass, process the overflow queue. Choose an unused, unit-valid coordinate from that side's combined Front/Back pools. A coordinate already assigned to any ordinary unit is excluded.
7. If an overflow unit has no remaining legal position, fail with an insufficient-total-valid-capacity error. No unit is removed, no coordinate is invented, and no overlap is permitted.
8. Return the complete assignment only after all placements succeed. Inputs are never mutated: cloned pools, positions, used-coordinate sets and RNG state remain local until the function returns.

With six Front and six Back spots, 7 Front/1 Back first places six Front units and the Back unit in their preferred categories, then places the seventh Front unit into a different unused Back spot. The reverse case works the same way. Squads of 12 Front or 12 Back units use all 12 ordinary spots without needing extra authored rows.

### Determinism

Position selection retains the existing seeded `DeterministicRandom` stream. Candidate ordering comes from the authored arrays; participant and within-group unit order remain stable. Each actual placement uses the same seeded integer selector as before. The preferred pass consumes no random selection for an unplaced unit; that unit selects when processed as overflow.

Identical maps, squads, overrides, orientations and seeds produce identical coordinates and returned RNG state. No `Math.random`, clock-based placement or external/live RNG is used. Generated fixtures with sufficient preferred capacity retain the previous selection order and centered row construction.

### Capacity and collision failures

Readiness still requires **at least six Front and six Back positions per required side**, independently of the actual squad composition. A missing/undersized category remains invalid even if the other category is large enough. The direct assignment service enforces this minimum too.

Total authored capacity is checked, and individual placement also checks the unit's effective terrain eligibility. Thus structurally sufficient pools can still fail if fewer than enough coordinates are valid for the actual units. A deterministic fixture verifies that this failure leaves inputs unchanged. Malformed pools never borrow special coordinates or generate additional authored positions.

Normal initialization still validates authored maps before assignment and checks the final ordinary/special merge. The assignment service now additionally catches collisions across the full starting pools before it selects units. Special instantiation also rejects duplicate special IDs/coordinates and verifies effective occupancy, covering callers using procedural/legacy map providers as well as the strict static-map readiness path.

`requiredPoints` remains existing positional metadata with bounds and resizing protection. It does not instantiate occupants; this correction does not invent another starting-entity type or reinterpret those anchors as units.

## Authoritative Ocean and Flying rules

Ocean's definition now lives in **`BattleTerrainSystem.js`**, alongside the other runtime terrain identities, instead of being installed as an unresolved editor-only addition:

```text
id: ocean
category: IMPASSABLE
traversable: false
spriteId: tileOcean
ruleStatus: AUTHORITATIVE
```

Ocean is intentionally non-traversable and non-occupiable by ordinary units. The existing normal race/terrain resolver remains the extension boundary; no Aquatic status, aquatic race, swimming system, ability, movement-cost table, ship or other exception was added.

The new `BattleTerrainSystem.canOccupy(map, unit, x, y)` combines bounds, known terrain, existing Flying sources and ordinary race/terrain eligibility. Deployment and special-unit validation use it for effective unit occupancy. Generic ordinary Front/Back slots must still lie on base traversable terrain, so Ocean slots fail readiness and initialization even when a particular participating unit happens to fly.

Legitimately Flying special units may retain explicitly authored Ocean coordinates. Non-Flying specials are rejected there. The test suite exercises this using a temporary Flying capability fixture and restores production race definitions afterward; no production race/class was granted new flight powers.

### Battle movement and pathfinding

The established movement implementation already applies Flying before normal terrain passability and charges Flying **1 MOV per tile**. The pathfinder invokes that same movement validator, so no separate Ocean-specific search rule was added.

Ordinary units cannot use Ocean as either an intermediate path tile or endpoint. Flying units can traverse and finish on Ocean at 1 MOV per tile. Bounds, hostile passage blocking and occupied endpoints remain enforced.

The terrain context's underlying ordinary occupancy query remains available for Flying expiration. When the Flying source ends on Ocean, existing behavior applies: require an eligible adjacent Escape where one exists, or become AWOL if no legal escape tile exists. Both cases are tested. No expiration/recovery rule was replaced.

### Campaign Map behavior and the existing graph boundary

Campaign Ocean remains symbol `w`, the automatic fill for every added row/column. Its editor catalog entry now references the authoritative `ocean` terrain identity. Battle Map creation and expansion likewise still fill with Ocean.

**Campaign travel is already explicitly defined as movement along location/route graph edges, not tile-by-tile traversal of the decorative Campaign Map.** A drawn straight route line is not a terrain-cell path. This correction preserves that established movement system, as requested; it does not rasterize route lines, invent boats/bridges, or silently change graph availability based on painted tiles.

Accordingly, Ocean means ordinary terrain-cell traversal is blocked wherever terrain movement is evaluated. Existing graph routes continue to follow their own availability/blocked/travel rules. There is no free terrain-cell squad pathfinder to update. A future rule relating graph routes to painted Ocean would require an explicit route/terrain policy; none was invented here. A regression check confirms editing decorative Ocean leaves existing graph pathfinding unchanged.

## Editor validation

The existing readiness requirements remain: valid dimensions and conditions, opposing approaches, at least six individual Front and Back spots per required side, bounds, unique coordinates, eligible ordinary terrain, valid special definitions and collision-free starts. Non-contiguous and unevenly placed coordinates remain valid.

Special validation and editor placement now share the effective occupancy helper with initialization. Ocean is a settled impassable identity rather than an unresolved warning. Painting, resize transactions, tile/variant data, separate special definitions, static map selection, preview, draft persistence and export schemas are unchanged.

## Tests added and changed

New `js/debug/DeploymentOceanTests.js` adds **42 checks** covering:

- Preferred placement with both pools available; 6/2, 7/1, 1/7, 7/5, 5/7, 12/0, 0/12 and 6/6 squad distributions.
- Reserving Back preference before Front overflow, and using an additional authored Front spot before overflow.
- Normal battle initialization after preferred capacity is exhausted; repeatable seeded assignments; input immutability.
- Total unit-valid capacity failure; insufficient structural capacity; fewer than six Front or Back positions; unchanged non-contiguous/uneven layouts.
- Collisions across Front/Back categories, opposing sides, specials versus ordinary slots, and specials versus specials.
- Specials remaining extra units at their explicit coordinates and never providing ordinary capacity.
- Ocean's authoritative identity, with no added production race-specific Ocean exception.
- Ordinary Ocean transit, endpoints, deployment and special placement rejection.
- Flying transit, occupancy, 1-MOV costs, bounds and collision enforcement.
- Ordinary and Flying pathfinding, including the existing route planner; pure search results.
- Flying expiration with a reachable shore and with no legal escape.
- Legitimately Flying special initialization on Ocean.
- Campaign/Battle creation and N/S/E/W expansion retaining Ocean fill.
- Existing Campaign graph paths remaining separate from decorative terrain editing.

`DeveloperToolsTests.js` retains its old Ocean blocked check and changes the superseded status assertion to AUTHORITATIVE. `FoundationTests.js` and `index.html` register the new suite in both the offline runner and in-game rule checks.

Evidence is in `verification/rule-checks.txt`, `verification/results.json`, `verification/render-log.txt` and `verification/offline-structure.json`.

## Files changed

Runtime corrections:

- `js/systems/DeploymentSystem.js` — preferred pass, overflow pass, minimum/category/total capacity checks and global starting-coordinate collision validation.
- `js/systems/BattleTerrainSystem.js` — authoritative Ocean definition and shared effective occupancy helper.
- `js/editor/MapAuthoring.js` — remove unresolved Ocean installation; link Campaign Ocean to the shared terrain identity.
- `js/editor/BattleMapAuthoring.js` — shared special occupancy checks and special instantiation validation.
- `js/editor/EditorDocument.js` — use the same occupancy check for special placement.

Testing/loading:

- **Added** `js/debug/DeploymentOceanTests.js`.
- `js/debug/DeveloperToolsTests.js` — superseded Ocean status assertion only.
- `js/debug/FoundationTests.js`, `index.html` — new suite registration.

Documentation/evidence:

- `README.md`, `docs/ARCHITECTURE.md`, `assets/README.md` — current preference, Ocean, graph-boundary and verification wording.
- **Added** `docs/PROMPT8A-IMPLEMENTATION.md` — this report.
- `verification/rule-checks.txt`, `results.json`, `render-log.txt`, `offline-structure.json` and refreshed offline captures — verification evidence.

No runtime PNGs, palette constants, input/controller code, Terminal/cheat behavior, settlement/economy rules, save schemas, CT/provenance mechanics or persistence/export format were changed. Historical Prompt #8 reports remain historical; current documentation reflects these corrections.

## Manual verification still required

Direct browser `file://` launch and physical Xbox controller behavior remain unverified in this environment. The prior browser URL-policy block was not bypassed. The successful graphics verification used offline Canvas2D, not a browser launch.

Useful follow-up manual checks:

1. Double-click `index.html`; confirm the existing editor and controller/remapping screens still work. Run the in-game rule checks and confirm 778/778.
2. In an authored Battle Map, retain six Front/six Back spots per active side. Validate an uneven, non-contiguous layout; removing one required spot or painting a spot Ocean should report invalid readiness.
3. Preview Ocean painting and expansion; confirm art, fill behavior and tile scale remain unchanged.
4. With an explicitly configured battle fixture/provider, initialize 7 Front/1 Back and 1 Front/7 Back squads; inspect distinct preferred/overflow positions and the unchanged special coordinate. No turnkey production orientation/AI provider was added.
5. Use the established Flying fixture to cross and finish on Ocean, then expire Flying and verify the existing Escape/AWOL behavior. Ordinary units should have no legal Ocean path.
