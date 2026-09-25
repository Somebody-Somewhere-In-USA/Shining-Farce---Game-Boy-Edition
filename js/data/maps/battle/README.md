# Legacy split Battle Map assets

Current publication stores Campaign Map and individual Battle Map records as inert JSON in `index.html`; it no longer downloads `.js` map assets. Use **Export Shipping Index.html** and replace the launcher, or the data-only TXT option. See `README.md` and `docs/WINDOWS-SHIPPING-CORRECTION.md` at the project root.

Already installed split scripts remain compatible with `AuthoredRegistry`. Export their editor JSON backup and import it into the updated project to migrate without copying/unblocking downloaded scripts. Files in this directory are not automatically discovered or loaded. Preserve old files/backups if needed; the corrected launcher has no asset tags referencing this directory.
