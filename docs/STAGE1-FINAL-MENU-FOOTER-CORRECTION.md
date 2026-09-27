# Stage-1 final menu-footer correction

Completed 2026-09-27. Starting HEAD: `b1174de` (`Editor Saving`), with the preceding Stage-1 work already uncommitted. Existing changes were preserved. The complete baseline passed **950/950 deterministic checks**.

## Cause and correction

`CampaignUIRenderer.list` calculated the footer from the current visible-item count: `listTop + (visible + 1) * listRowHeight`. This incorrectly moved the footer upward for shorter lists, including the 13-entry Campaign Menu.

Normal full-screen scrolling lists now use a fixed footer origin, **y=342**, derived from framebuffer height 360 minus bottom margin 18. The legend and list-position counter share that position regardless of item count or selection. Short lists start at the existing y=26 origin and leave unused space above the footer.

Shared metrics retain row height 12 and explicitly reserve one complete blank row:

```text
listFooterY = 360 - 18 = 342
listBlankRows = 1
capacity = floor((342 - 26) / 12) - 1 = 25
```

The last permitted item starts at y=314. Its 12-pixel row ends at y=326, leaving 16 pixels before the footer—at least one complete blank row. A further item would violate that reservation. Capacity remains **25**, so all **13 Campaign Menu entries**, including Options / Controls, fit without scrolling.

Popup/page layouts and editor PropertyScreen geometry, arrow and underline are unchanged. Scrolling and wrapping still use the existing SelectableList behavior.

## Files changed in this correction

- `js/config/gameConfig.js`: explicit fixed-footer and blank-row metrics; derived capacity.
- `js/rendering/CampaignUIRenderer.js`: use fixed footer Y for normal full-screen lists.
- `js/debug/AssetAcceptanceTests.js`: update four focused layout regressions.
- `CANONICAL-DESIGN-SPECIFICATION.md`, `docs/ARCHITECTURE.md`, `docs/SHINING-FARCE-CANONICAL-RECOVERY-LEDGER.md`: record the clarified fixed-footer rule and owner acceptance.
- `docs/STAGE1-POST-ACCEPTANCE-FOLLOW-UP.md`: add a status note identifying the accepted work and superseded footer interpretation.
- This report.

The already manually accepted PNG-availability and palette work was **not redesigned or modified**. SceneAssetLoader, SceneAssetAvailability, preview loading, shipping gates, palette values/preview/persistence, companion backgrounds, Working Copy and schemas were untouched. No version or format change was necessary.

## Verification

The complete final deterministic suite passes **950/950**. Four existing tests were updated to the newly established design, checking:

- Short-list origin, fixed footer and unused space above it.
- All 13 actual Campaign Menu entries visible while navigating, with the footer fixed.
- Exactly maximum-capacity rendering, a complete blank-row reservation and no room for another row.
- Overflow selection, scrolling and wrapping with constant footer position and clearance.

The targeted developer/UI rendering verifier passed. Offline renders of the Campaign Menu, full-capacity list and final overflow page were visually inspected; all have the footer at the bottom. Existing PropertyScreen, Options, palette and contextual-input checks remain passing. Offline structure verification and `git diff --check` passed.

Rendered evidence is under `%TEMP%/sf-fixed-footer/`, including `campaign-menu-options-visible.png`, `menu-full-capacity.png` and `menu-overflow-last.png`. These are offline Canvas renders, not a new Brave manual test. The owner's supplied prompt establishes that the previous PNG-availability and palette changes passed real Windows/Brave/file-URL acceptance.

## Remaining owner retest

Open the normal Campaign Menu. Confirm all 13 entries, including **OPTIONS / CONTROLS**, are immediately visible; **Z OK  X BACK** stays at the bottom, with ample empty space above it, while navigating among entries. If convenient, also inspect an overflowing normal scrolling list for correct scrolling and footer clearance.
