# Prompt #2 — completion report

> Historical report. Prompt #2.5 supersedes the old framebuffer, artwork-palette restriction, map interaction, and neutral-arrival control behavior. See [current completion report](PROMPT2.5-IMPLEMENTATION.md).

## Files added

- `js/campaign/StrategicOrderSystem.js`
- `js/campaign/ZeonOrderProvider.js`
- `js/campaign/MovementIntentSystem.js`
- `js/campaign/MovementConflictSystem.js`
- `js/campaign/BattleBoundary.js`
- `js/campaign/EndDayResolutionSystem.js`
- `js/campaign/WorldUpdateSystem.js`
- `js/campaign/ResolutionValidation.js`
- `js/data/developmentScenarios.js`
- `js/states/EndDayState.js`
- `js/debug/StrategicMovementTests.js`
- This report and new offline evidence images in `verification/`.

## Files substantially modified

`Campaign.js`, `CampaignState.js`, `StationingSystem.js`, `Validation.js`, `CampaignTurnSystem.js`, `CampaignMapState.js`, `WorldMapRenderer.js`, `FoundationTests.js`, `tools/verify-rendering.cjs`, `README.md`, and `docs/ARCHITECTURE.md`.

Smaller extensions: `SquadSystem.js` (batch dismissal/order cleanup), `campaignConfig.js` (schema/phases/events), `Game.js` (End Day state composition), `index.html` (classic script dependencies), and the historical Prompt #1 report link. All original tactical groundwork, external PNGs, palette and asset manifest remain.

## New authoritative state

Schema 2 adds `orders`, `resolution`, `lastResolution`, and `nextResolutionId`. Root `phase` now supports PLANNING, ORDER_LOCK, MOVEMENT_INTENT, COLLISION_DETECTION, RESOLUTION, WORLD_UPDATE, DAY_ADVANCE.

Stationing migrates from `location.stationedSquadId` to the sole `location.stationedSquadIds = { PLAYER, ZEON }` authority. Version 1 restoration preserves its valid PLAYER defender and initializes the oldest eligible ZEON defender, without retaining the old alias. Both factions have deterministic succession. No squad stationing boolean is introduced.

Orders contain `squadId`, `destinationLocationId`, remaining `plannedLocationIds`, remaining `plannedRouteIds`, and `createdDay`. Only the next edge becomes an intent per day. Arrival consumes one edge and preserves a nonempty remainder; failed movement cancels it.

The active resolution record contains `id`, `resolutionDay`, `frozenWorld`, `frozenOrders`, `movementIntents`, `conflicts`, `nextConflictIndex`, `resolvedConflictIds`, `pendingBattleScenario`, `battleResults`, staged `outcomes`, and movement/world/day completion flags. All are plain JSON data. Positions and defeats commit as one batch only after conflicts are settled.

## Conflicts and temporary outcomes

Implemented route interceptions on opposite edges, simultaneous hostile arrivals and attacks on hostile stationed defenders. Friendly arrivals share nodes peacefully. Stable conflict ordering uses route priority, site ID and participant IDs. Multiple independent conflicts pause/resume sequentially. Reserves fight as successive active pairs; prior defeats can skip obsolete conflicts. Final projected occupancy also catches retreat-origin and overlapping-conflict consequences.

`BattleScenario` contains the site/type, active attacker/defender IDs, detached unit snapshots and minimal resolution context. `BattleResult` contains scenario ID, winner faction and loser outcome. No Campaign object is passed across the boundary.

Temporary framebuffer controls explicitly choose PLAYER or ZEON victory, or eligible moving-side retreat. Decisive losers are dismissed at batch commit while unit records, including MC, remain. Moving winners arrive; moving losers retreat to origin and cancel orders. Opposite-edge retreat halts both sides at their respective origins. Stationary retreat is rejected. There is no fake tactical combat logic inside movement systems.

## UI and controls

M → Squad Orders → select squad → Plan / Replace Route. Arrows/WASD select destination. S marks the selected squad's origin; D marks destination. A question mark plus dashes distinguishes proposed paths; exclamation mark plus thicker pixels distinguishes confirmed paths. Z reviews the destination and day/edge count; Yes commits the order without movement or time advance. Confirm/cancel are entirely framebuffer menus.

End Day shows phases, pauses on temporary battle controls, and returns to planning only after all work finishes. M during resolution opens paged locked-state inspection. Debug Tools includes five resettable scenarios, queued/locked order and conflict inspection, and the expanded rule harness. Original inspection and tactical movement screens remain available.

## Verification and results

| Required check | Result |
| --- | --- |
| Campaign/rule harness | **73/73 passed** (includes 34 retained foundation checks) |
| Interrupted-resolution JSON serialization/restoration | **Tested and passed**, including after the first of two battles |
| All intermediate phases restored and resumed | **Tested and passed** |
| Opposite-edge crossing | **Tested and passed**, exactly one conflict for one hostile pair |
| Simultaneous hostile arrival | **Tested and passed** |
| Hostile occupied destination / active defender | **Tested and passed** |
| Multiple same-day conflicts | **Tested and passed**, with stale-result rejection and no replay |
| Day advancement exactly once | **Tested and passed**, no advancement while battle is pending |
| Reserve defenders and both-faction stationing | **Tested and passed** |
| Frozen intentions, phase guards, corruption checks | **Tested and passed** |
| Retreat origins, overlapping conflicts, departing defender | **Tested and passed** |
| Deterministic movement combination sweep | **72 combinations passed** within one harness check |
| Route planning/confirmation/cancel and two-battle UI flow | **Passed offline keyboard-driven checks** |
| Palette, framebuffer and scaling | **Passed offline**: eight PNGs and sampled screens use only four art shades, 160×144 logical size, integer scales 5/2/1/1 across four viewports |
| Actual direct `file://` browser launch | **Not verified**: the task's browser URL policy blocked this during Prompt #1; no retry, server workaround or policy bypass was used |

Screens in `verification/` are offline Canvas2D renders, not browser screenshots. Rule tests run without DOM/rendering using `node tools/test-foundation.cjs`, or without any terminal from Debug Tools → Run Rule Checks. The optional offline rendering utility is never a runtime requirement. Final browser acceptance remains double-clicking `index.html` in an ordinary browser.

## Assumptions and deferred work

- All shipped routes represent one edge/day; no multi-day in-transit state was added.
- The temporary ZEON provider follows configured orders and otherwise holds; it makes no strategic decisions.
- Unopposed arrival takes physical control, even if formerly neutral. Allegiance never changes from movement/battles.
- A moving defender can vacate a location; intercepted/retreating defenders are handled through projected outcomes and subsequent conflicts.
- Simultaneous friendly arrivals use squad-ID order for new arrival sequence numbers; existing eligible defenders keep their role.
- One active squad per side fights at a time, keeping the 12-unit squad boundary intact; reserves are not collectively destroyed.
- Moving retreat uses origin fallback. A crossing retreat halts both sides rather than creating a chase or hostile co-occupancy. Stationary retreat is unsupported until final retreat rules.
- Individual units survive squad dismissal as existing placeholder records. MC recovery, survival probabilities and artifact transfer remain extension points, not mechanics.

Full Zeon AI, tactical combat, economy, recruitment, logistics/inventory, political formulas, quests, Jewel mechanics, wilderness encounters, final retreat routing, individual recovery and save/load UI remain deferred.
