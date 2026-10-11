# Map Workshop

Open `map-editor.html` on the game site. No install or account is required.

## Correcting the Titan map

1. Choose a shrine to zoom in; scroll to zoom further. Hold Space and drag to pan, or choose **Pan map**. Touch users can use Pan map and the + / − buttons. **Controls** hides the sidebar for a larger canvas.
2. Choose **Walkable ground**. Green shows the combined walkable surface. Drag white points to trace the floor. Double-click an edge to insert a point, or use **Insert point** and **Remove point**. **Paint walkable ground** widens or joins passages; **Paint blocked ground** removes floor. Later strokes replace earlier strokes. Solid object bases always take precedence.
3. Choose **Solid object bases** for the physical foot of a statue or altar. Choose **Ellipse** or **Polygon** for the base shape. Drag handles, insert/remove polygon points, or drag inside a shape to move it. **Add solid base** creates another footprint without a hiding outline. **Remove selected area** on this layer removes the footprint while keeping the object’s foreground silhouette; hanging banners should have no base.
4. Choose **Foreground / hiding** and trace the part of the painting that should cover a character. Drag the yellow depth line to the object's ground-level front edge. A character whose feet are above that line passes behind the traced shape. The preview uses the same faint player visibility treatment as the game.
5. **Altar / portal / interaction points** changes existing game positions. Each shrine has a distinct **altar interaction** point for inspecting/swapping relics and **portal interaction** point for selecting warp destinations. **Portal art / arrival** controls its visible center and teleport landing. Moving portal art also moves its interaction point while the two are aligned; an independently offset point stays where you put it. **Match portal position** aligns it again. **Ghost relic / portal previews** show the existing game art at its actual size and anchor while you move these points; choose a mysterious relic or the shrine power. **Path centerlines** changes fallback navigation guides; walkability is still determined by the green floor. Added generic markers are design annotations until wired into gameplay.
6. Choose **Walk / hide preview**, select any champion, and click to place it. Move with WASD, arrows, or the on-screen direction buttons. The circle at its feet turns red when there is insufficient clearance. The preview samples a cached raster of the final painted surface; the game uses its compiled 5-world-unit clearance field, so a final in-game check remains necessary.
7. Choose **Aura / encounter boundaries** to reshape the guardian and Titan engagement outlines separately from walking floor. Existing drafts acquire a copy of the current outlines; later floor edits do not change these boundaries. Custom projects can add and remove named encounter boundaries.
8. Under **Mapping view**, choose **Walkable + no walking** to see green usable floor and red blocked space together, or **No walking only**. The red surface includes final blocked paint, solid bases, and void outside authored floor. It reflects paint order, so an overwritten red stroke does not remain falsely red.
9. **Export map** downloads JSON. Send that file back to apply it to the game. Editing a draft never changes a live game or your monster records.

Undo / Redo work across edits and imports. Ctrl+Z / Ctrl+Shift+Z are supported outside form fields. Drafts save automatically in this browser using IndexedDB, including custom artwork. Exports are portable backups. Starting another map replaces the current draft; export it first if you want to keep a separate project. Undo can recover the previous map until the editor is closed.

## Future maps

Choose **New map from image** and load a PNG, JPEG or WebP (up to 10 MB; maximum 16,384 pixels per dimension). Add floor areas, paint passages, create foreground objects, and add named markers for spawn locations, entrances, relics or other design notes. Custom floor areas include editable path centerlines.

Set **Map scale** to the intended number of game world units per image pixel. Larger values make champions smaller relative to the artwork. The existing Titan map retains its registered 7.4 scale. Custom projects export the artwork, scale, geometry, object bases, foreground depth lines, independent encounter boundaries and markers together, and can be reopened with **Import map**.

The workshop is a reusable map-authoring tool. New map projects still need their stage gameplay integration; importing them does not automatically create a playable stage or assign behaviors to arbitrary markers.

## Applying a Titan export in the project

From the repository directory:

```powershell
node tools/apply-realm-map.mjs "C:\path\mana-abyss-v43.json" --check
node tools/apply-realm-map.mjs "C:\path\mana-abyss-v43.json"
node tools/build.mjs
```

The importer validates the schema and required shrine/path IDs, writes `src/realm-map-data.ts`, and rebuilds `src/realm-floor-data.ts`. It restores both files if collision compilation fails. It accepts Titan exports only; future-stage exports remain portable design files until that stage is integrated.

Collision remains a constant-time lookup in gameplay. The painting history is evaluated during offline collision compilation, producing one clearance grid; hidden older strokes do not add per-frame game calculations. The editor also rebuilds a cached final surface when geometry changes and samples that cache while walking. The editor's brushes and geometry validation run outside gameplay. The map opens with a 574 KB overview; zooming in streams the game's detailed tiles, capped at 64 decoded tiles and four concurrent loads. Custom maps use their single imported image. The workshop does not load the simulation or run combat.

## Checks

```powershell
node --test tests/map-editor.test.mjs tests/map-editor-layers.test.mjs
node tests/map-editor-import.mjs
node tests/map-editor-layers-browser.mjs
```

Browser checks require Playwright and Edge/Chromium, using `PLAYWRIGHT_PATH`, `BROWSER_PATH` and optionally `BASE_URL`. The import check uses a separate fixture under `test-results/` and does not replace the game's authored map.

## Export recovery

**Export draft backup** downloads the current draft without requiring validation. If normal export fails, it now downloads this backup automatically and identifies the invalid area. Send the backup for repair; do not reset the editor or clear browser storage. A saved draft that cannot be validated remains protected from autosave overwrites until a valid repaired project is imported. Painted drafts support up to 100,000 individual sections rather than the former 2,000-section limit.
