# Stage 4: Throne War and Hag

Test the game at `test/?stage=4`. All four stages and all eight champions are available there; test progress remains separate from event progress.

The test map workshop is `test/map-editor.html?map=war`. Choose **Stage 4 · Throne War** in its map selector. Mana Abyss, Throne War and custom projects have independent saved drafts. The regular editor keeps Stage 4 hidden until the same public release gate opens.

## War scenario

Eight champions begin with a camp, a sentry and troop production. Seven NPC champions choose seeded vanguard, raider, cultivator or warden behaviors. Some form temporary pacts. They can defeat and conquer one another. A fallen champion transfers all camps, troops and surviving native summons to the winner. NPC winners can inherit a defeated champion’s power. Pacts expire or dissolve before they can prevent a final victory.

Each fallen champion raises War Level. Remaining champions and armies become stronger; siege units join later waves. Destroyed sentries stay visibly disabled and rebuild after 25 seconds. Sentries choose the nearest hostile, but retaliate against an enemy champion that damages their defending champion in range.

Farm hostile troops for chosen perks. Open **War Council** to rally your army toward a camp, choose perks or equip captured champion powers. Swapping preserves an ability’s remaining cooldown; duplicate equipped powers are disallowed. The last independent leader wins. Retreating, defending camps and letting rival armies weaken each other are valid strategies.

Champion hits are bounded so an individual attack cannot remove the player’s entire health pool. Rival champions have additional health and capped individual incoming hits, so one four-button burst does not dispose of them. These are initial playtest values, not measured human win rates.

## Hag

Widow Venom is a ranged basic with four seconds of poison. Thorn Hexes scatter armed traps ahead of her. Caustic Miasma creates a slowing poison cloud; press its button again while the cloud exists to ignite it. Briarflight gives five seconds of free movement over obstacles, landing on the last safe floor if needed. The Unmasked Revel reveals her true Hag form and scatters repeated waves of traps for nine seconds.

Curses and kills restore a bounded glamour shield. Her base, flight and unbound appearances use generated art. Costume, hair, copper, magic and skin have separate masks clipped to the source alpha. Copper in spell artwork remains copper when venom is recolored.

Hag has three base mastery titles, three hunt titles, three depths titles and three war titles, plus stage-specific achievements. All eight champions have three Stage 4 titles and a war victory achievement.

## Rewards and public access

Stage 4 has a 120,000,000 maximum Dominance pool: 1 million combat, 35 million conquered camps, 35 million champion conquests, 30 million victory, and up to 19 million for clear speed. Rival conquests can consolidate several camps into one opponent; claiming that opponent transfers their empire.

A war clear grants 25,000 mastery points, with 1,000 per rival camp, 2,000 per rival champion, 250 per chosen perk, and 6,000 per champion war title. Earlier stages still earn mastery at their established rates. Stage 4 offers the largest rewards without invalidating earlier progression.

Public Stage 4 and Hag require **October 22, 2026 at midnight Eastern**, **The Deep Gatebreaker**, and the preceding passage requirements. Test routes bypass those access checks and use separate progress storage. Normal menus, records, champion selection and map-editor choices respect access.

## Map and editor

A generated master was sliced into 16 references. Each sector was separately regenerated, preserving the master’s connections. The assembled terrain is 5,120 × 5,120 pixels over an 8,192 × 8,192 world. It ships as 64 streamed WebP tiles with gutters, not one large decoded game image. The map has broad winding roads, eight distinctly decorated camps and connected combat courtyards.

The editor includes ground paint, blocked ground, solid bases, foreground silhouettes, camp territory references, champion spawns, sentries and barracks. The combined mapping view shows walking and no walking together. Last paint wins; solid bases override paint. A moved sentry or barracks marker carries its matching base and hiding outline with it. Their ghost previews match the game’s placement and scale.

Foreground outlines describe the raised visible silhouette. The yellow line marks the ground height at which a champion passes behind it. A solid base describes only its actual footprint. Use Walk / hide preview and arrows, WASD or the touch pad to check both. War territory outlines are references; they do not confine its champions or armies.

Export your map JSON and send it back to apply it, or run:

```
node tools/apply-war-map.mjs path/to/throne-war-v1.json --check
node tools/apply-war-map.mjs path/to/throne-war-v1.json
node tools/build.mjs
```

The importer validates camp identity, dimensions, scale and spawn floors. It compiles paint and bases into one clearance field; the game does constant-time lookups rather than recalculating painted layers during play. The editor overview, collision geometry and runtime structure positions share the same coordinate system.

Custom image projects remain supported and have their own saved draft. Built-in geometry is registered to its fixed art scale. Art repacking preserves an existing edited map unless `--reset-geometry` is explicitly supplied.

## Art sources and rebuilding

All generation used the built-in imagegen tool. The original five production prompts and sector enhancement template are saved in `art-source/stage4/generation-manifest.json`. Each sector source is saved losslessly as WebP. Rebuildable PNG assemblies are ignored by Git. Hag sources and material guides are in `art-source/hag/`.

The material guide edit prompt preserves exact source silhouettes and replaces cloth with red, hair with green, copper with blue, magic with magenta, and skin with cyan. Generated guides are used as continuous region labels; source shading and alpha supply the final masks. Gameplay frames are packed from the generated poses, including the riding-staff pose and monstrous unbound form.

```
node tools/process-hag-art.mjs
node tools/pack-war-art.mjs
node tools/apply-war-map.mjs public/assets/stage4/map-document.json
```

Runtime limits include a 144-body war pool, a shared cap of 28 native summons, bounded camp production, 24 terrain images on touch devices, eight compact NPC atlases, cached foreground masks and bounded navigation fields. Nearby champions update more frequently than distant champions. Summons have targetable bodies and transfer on conquest without exceeding their shared cap.

## Validation

417 automated tests pass, including camp connectivity, NPC empire transfers, sentry retaliation, borrowed abilities, cooldown preservation, summon control/capture, Hag’s prior-stage ward interaction, public release gates and authenticated war results. All 88 browser modules parse, and the 199 MB Pages artifact passes deployment checks.

Desktop and touch browser passes verified play, Miasma ignition, flight, Unmask, War Council, result codes, editor export, draft switching and restoration. The normal page and normal editor hide Hag and Stage 4 before their passage/date gate; the test workshop exposes all eight champions. No browser errors occurred in these passes.

A phone-sized browser with 4× CPU throttling measured 5.0 ms at the 95th percentile for simulation and 6.7 ms for drawing in the staged war scene; maximum drawing time was 24.8 ms. That is an emulation check, not a physical-phone or human balance measurement.
