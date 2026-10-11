# Map Workshop

Open `map-editor.html` on the game site. No install or account is required.

## Correcting the Titan map

1. Choose a shrine to zoom in; scroll to zoom further. Hold Space and drag to pan, or choose **Pan map**. Touch users can use Pan map and the + / − buttons. **Controls** hides the sidebar for a larger canvas.
2. Choose **Walkable ground**. Green shows the combined walkable surface. Drag white points to trace the floor. Double-click an edge to insert a point, or use **Insert point** and **Remove point**. **Paint walkable ground** widens or joins passages; **Paint blocked ground** removes floor. Later strokes replace earlier strokes. Solid object bases always take precedence.
3. Choose **Solid object bases** for the physical foot of a statue or altar. Drag the center and radius handles or enter values. A banner can have zero base radii, allowing movement beneath it.
4. Choose **Foreground / hiding** and trace the part of the painting that should cover a character. Drag the yellow depth line to the object's ground-level front edge. A character whose feet are above that line passes behind the traced shape. The preview uses the same faint player visibility treatment as the game.
5. **Relic / portal / interaction points** changes existing game positions. **Path centerlines** changes fallback navigation guides; walkability is still determined by the green floor. Added generic markers are design annotations until wired into gameplay.
6. Choose **Walk / hide preview**, select any champion, and click to place it. Move with WASD, arrows, or the on-screen direction buttons. The circle at its feet turns red when there is insufficient clearance. The preview samples the authored geometry; the game uses its compiled 5-world-unit clearance field, so a final in-game check remains necessary.
7. **Export map** downloads JSON. Send that file back to apply it to the game. Editing a draft never changes a live game or your monster records.

Undo / Redo work across edits and imports. Ctrl+Z / Ctrl+Shift+Z are supported outside form fields. Drafts save automatically in this browser using IndexedDB, including custom artwork. Exports are portable backups. Starting another map replaces the current draft; export it first if you want to keep a separate project. Undo can recover the previous map until the editor is closed.

## Future maps

Choose **New map from image** and load a PNG, JPEG or WebP (up to 10 MB; maximum 16,384 pixels per dimension). Add floor areas, paint passages, create foreground objects, and add named markers for spawn locations, entrances, relics or other design notes. Custom floor areas include editable path centerlines.

Set **Map scale** to the intended number of game world units per image pixel. Larger values make champions smaller relative to the artwork. The existing Titan map retains its registered 7.4 scale. Custom projects export the artwork, scale, geometry, object bases, foreground depth lines and markers together, and can be reopened with **Import map**.

The workshop is a reusable map-authoring tool. New map projects still need their stage gameplay integration; importing them does not automatically create a playable stage or assign behaviors to arbitrary markers.

## Applying a Titan export in the project

From the repository directory:

```powershell
node tools/apply-realm-map.mjs "C:\path\mana-abyss-v43.json" --check
node tools/apply-realm-map.mjs "C:\path\mana-abyss-v43.json"
node tools/build.mjs
```

The importer validates the schema and required shrine/path IDs, writes `src/realm-map-data.ts`, and rebuilds `src/realm-floor-data.ts`. It restores both files if collision compilation fails. It accepts Titan exports only; future-stage exports remain portable design files until that stage is integrated.

Collision remains a constant-time lookup in gameplay. The editor's brushes and geometry validation run outside gameplay. The map opens with a 574 KB overview; zooming in streams the game's detailed tiles, capped at 64 decoded tiles and four concurrent loads. Custom maps use their single imported image. The workshop does not load the simulation or run combat.

## Checks

```powershell
node --test tests/map-editor.test.mjs
node tests/map-editor-import.mjs
node tests/map-editor-browser.mjs
```

Browser checks require Playwright and Edge/Chromium, using `PLAYWRIGHT_PATH`, `BROWSER_PATH` and optionally `BASE_URL`. The import check uses a separate fixture under `test-results/` and does not replace the game's authored map.
