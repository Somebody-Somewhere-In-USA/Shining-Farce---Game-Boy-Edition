# Shining Farce — Prompt #6B implementation report

Completed 2026-09-16. **538/538 deterministic checks pass.** Schema remains **8**. Prayer's production activation chance is **25%**. Route-interception battles now use their exact network midpoint for AWOL return placement.

## Scope and preserved baseline

All 509 Prompt #6A checks remain, together with the seven Prayer checks added after the separate 25% clarification. This pass adds 22 checks, bringing 516 to 538. The one old test asserting that route position was unresolved was updated because Prompt #6B explicitly supersedes that rule. No unrelated test was deleted, disabled or weakened.

Prayer's 25% implementation had already landed in the preceding clarification. This pass verifies it without changing its targeting, ordering or RNG architecture. All other Prompt #6A mechanics remain unchanged.

## Prayer

Prayer remains Cleric Lv3 Reaction. Both production configuration and ability metadata specify **0.25**. The existing reaction adapter accepts a validated roll in [0,1), and activation occurs only below 0.25. Explicit resolved-outcome adapters remain available for deterministic debug inspection; they are not a guaranteed production activation rule. There is no new RNG system and no production 50% Prayer value.

Tests verify that success leaves an eligible adjacent friendly at exactly 1 HP, prevents that event's Dying transition, leaves the Dying counter null, and preserves Poison. A later supplied lethal Poison-damage event with failed Prayer causes normal Dying. Previous success/failure boundary, adjacency, self-target exclusion, metadata, invalid-RNG rollback and nonlethal-event tests all remain passing. Automatic Poison tick timing remains part of the existing deferred combat boundary; this pass does not invent it.

## Authoritative battle location and distance

The new small shared `BattleLocationSystem` derives campaign battle positions from the IDs already present in battle scenarios and pending AWOL records:

- A location battle resolves to its existing node, with connection distance 0.
- A route-interception battle resolves to a virtual `ROUTE_MIDPOINT`, with connections to both route endpoints. Each connection has distance `(route.travelDays ?? 1) / 2`.

The distance query delegates endpoint paths to the existing WorldPathfindingSystem, using the same travelDays/default-one convention. For a route with weight L and endpoints A/B:

`D(battle, S) = L/2 + min(D(A,S), D(B,S))`

The virtual position is derived, not serialized. No geometric midpoint, pixel distance, origin/destination preference, edge-count approximation or duplicated pathfinder is introduced. Odd and fractional route weights remain fractional for comparison; the unresolved global gameplay rounding policy is neither called nor changed.

Tests cover route weights 8, 5 and 2.5, the default weight, exact distances to each endpoint, cheaper paths through either endpoint, the supplied 7-versus-6 settlement example, and independence from screen coordinates. Future campaign consumers can query this same abstraction. Retreat, pursuit, reinforcements and rescue are not implemented.

## AWOL integration

AwolSystem now uses the shared battle-location distance query for its primary settlement-distance comparison. Everything after that comparison is unchanged:

1. Filter to reachable settlements controlled by the returning unit's faction.
2. Minimize distance from the battle's node or route midpoint.
3. Among tied settlements, maximize distance from the nearest active enemy squad.
4. Resolve complete ties with the existing deterministic equal-choice RNG convention.

Normal production processing no longer emits **BATTLE ROUTE POSITION UNRESOLVED** merely because a valid battle happened on a route. Existing route-return records now proceed through ordinary settlement selection.

**NO REACHABLE FRIENDLY SETTLEMENT remains unresolved**, retaining and rechecking the pending record exactly as before. No fallback destination, death rule, recovery rule, survival change or absence-duration change was introduced.

Tests cover midpoint settlement selection, both endpoint paths, enemy-distance ties, two-/three-/four-way complete ties, reproducible seeded tie selection, reachability through one endpoint, and the preserved no-settlement boundary. A full Campaign test resolves a real opposite-direction route battle, schedules a surviving losing-faction AWOL unit and returns it at the selected settlement on the established day through End Day/save/restore.

## Schema 8 and old pending returns

**No schema increment or persistent representation migration is needed.** Existing records already contain route ID, faction, due date, RNG state and unit identity. The helper derives the midpoint from existing route definitions. Prayer's chance is configuration, not saved character state.

Old schema-8 pending route records, including those marked BATTLE ROUTE POSITION UNRESOLVED, are conservatively reinterpreted during the next scheduled World Update. They keep their established survival outcome, return day and stored RNG state. Survival and delay are never rerolled. A final settlement tie may still consume its normal selection draw, as before.

There is one narrow replay compatibility provision: an old save paused in DAY_ADVANCE can already contain a completed World Update that recorded a route-position hold. Validation must reproduce that historical completed result rather than return the unit during load and invalidate the snapshot. Resource replay therefore accepts only those existing legacy route holds when reconstructing that completed update. Normal WorldUpdateSystem never supplies this compatibility input, so the next normal update uses the midpoint.

The retired reason string remains only for recognizing/replaying such historical holds and in compatibility tests. It is not a new-production reason for valid route returns. Tests restore both DAY_ADVANCE and PLANNING old saves, preserve their exact snapshots/due dates/RNG, and verify later return without survival/delay rerolls. Another test verifies that an old route hold becomes the still-unresolved no-friendly-settlement case when appropriate.

## Verification and limitations

- **538/538 deterministic checks:** all 509 baseline checks retained, seven preceding Prayer clarification checks retained, 22 new #6B checks.
- Offline rendering/input verification passes with **538 checks**, **21 external PNG assets**, the unchanged **320×240** framebuffer, five authorized greens, no partial alpha, and all five resize cases.
- Runtime scan passes across **143 HTML/JavaScript files**: no fetch, XMLHttpRequest, module imports/exports, module script tags or remote URLs.
- See `verification/rule-checks.txt`, `verification/results.json`, and `verification/runtime-scan.txt`.
- Direct browser/file:// execution remains unverified following the earlier browser URL-policy rejection. This pass did not bypass that policy. Offline rendering is not browser-launch verification.

The midpoint helper and AWOL consumer are production campaign code, including normal End Day processing and save replay. Prayer resolves through the existing tactical damage/reaction boundary. Forced outcomes in debug fixtures remain debug behavior. Automatic campaign tactical combat, broader AI/initiative, future midpoint consumers, general post-battle status persistence, equipment inheritance and global rounding remain deferred. No new unresolved route-position limitation remains for valid route-interception records.

## Files added/modified

Added:

- `js/campaign/BattleLocationSystem.js`
- `js/debug/RouteMidpointTests.js`
- `docs/PROMPT6B-IMPLEMENTATION.md`

Modified:

- `index.html` — classic-script registration for the helper and tests.
- `js/campaign/AwolSystem.js` — midpoint consumer and replay-only legacy hold compatibility.
- `js/campaign/ResourceSystem.js` — preserve already-completed old World Update results during validation replay.
- `js/debug/FoundationTests.js` — include the new suite.
- `js/debug/SpellCorrectionsTests.js` — replace only the explicitly superseded route-unresolved expectation.
- `README.md`, `docs/ARCHITECTURE.md` — current behavior, schema explanation and verification count.
- `verification/rule-checks.txt`, `verification/results.json`, `verification/runtime-scan.txt` — current verification evidence; existing offline renders were regenerated.

Prayer configuration/resolver/ability files required no further changes in this pass because the preceding 25% clarification was already implemented. Historical Prompt #6/#6A reports are retained; this report supersedes their route-position limitation.
