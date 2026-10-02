# Live-event menu update — October 1, 2026

Stage 1 simulation, champion kits, enemy behavior, scoring, release progression, Gatebreaker requirements and opening date are unchanged. Rules remain `2026.10-v15-autotarget-squad`. Save schema remains v3 and the existing `mm-profile` key remains in use. No reset or migration runs on loading the update.

## Device transfer

Open **Monster Records**, choose **Export Progress**, send the downloaded JSON file to the other device, then choose **Import Progress** there. Review and apply the backup before playing on the new device. Repeat this handoff when switching back. A result card or run code describes one run and cannot transfer a profile.

Backups include identity, palettes for all champions, earned titles and legacy rewards, record bests, scoped personal bests, lifetime/champion counters, completed run IDs and dated stage trials. Sound/FX settings remain device-local. Unfinished-run bookkeeping is removed from a portable snapshot; live matches cannot be imported, undone or exported, and matches cannot be resumed on another device.

Imports keep maximum lifetime/best counters, union earned rewards, and combine unique qualifying dates independently for each champion. Reimporting does not duplicate counters or qualifying days. Always transfer the latest backup before switching: old saves have only cumulative counters, so independent unsynced sessions on two devices cannot be reliably summed. The higher total is retained; this limitation is explained in the interface and preview help.

A preview allows cancellation without writes. Applying an import first saves the current profile in `mm-profile-before-import`, then persists the combined profile; in-memory data changes only after successful writes. Undo restores that snapshot and explains that subsequent progress will be removed. Storage errors leave current progress unchanged. Invalid, oversized, unsupported or incomplete backup files are rejected before mutation. Profiles are local editable data, not authenticated server accounts.

Gatebreaker still requires seven qualifying dates on one champion. Those dates can span devices through transfer. Once earned, the title opens Stage 2 for **all five champions**, subject to the existing official opening check: October 8, 2026, midnight Eastern. Imports do not bypass this date. The records page now states that access covers every champion.

## Artwork

Only Devourer's four selection tint masks were rebuilt using an imagegen material guide and the existing drawing. Source shading is clamped to avoid byte overflow. Base, gameplay, portrait and cut-in images are unchanged. See `art-source/devourer/SELECTION_COLOR_GUIDE.md` for the saved prompt and reproducible processing.

## Verification

- 91 unit tests pass, including deterministic gameplay, palette neutrality, existing Stage 1 abilities, title gating and seven new progress transfer tests.
- Browser phone → PC → phone handoff passes: preview/cancel, persistence after reload, identity/palettes, earned rewards, seven same-champion dates, exact sequential cumulative totals, duplicate imports, malformed file rejection, undo and active-run guards.
- All 80 art masks validate. Before/after compositions reviewed with strongly contrasting colors; small detached material flecks decreased by 63%.
- Production build succeeds. New modules enter the same content-hashed service-worker cache as the existing game; the existing safe-update behavior continues to wait until the player returns to the menu.
- A simulated update during paused combat remains waiting through combat and results; it activates only on return to the menu. Saved identity and the offline progress-transfer menu survive activation.

Tests use desktop Edge with mobile viewport/touch emulation. Native iOS/Android file picker and share workflows still need human device testing. Stage 2 balance options are proposals in `STAGE2_OPTIONS.md`, not implemented by this update.
