# Stage 4 combat, army readability, and concealment

Champion basic attacks, powers, and continuing damage now pass through one shared defender budget: at most 8% maximum HP per hit and 30% maximum HP over any rolling three seconds. All attacking champions share that defender's budget, including NPC-versus-NPC combat. Invulnerability and shields still apply, and blocked damage does not consume the HP budget. Sustained pressure can kill; an opening ability chain cannot remove a fresh health pool.

Champion damage is multiplied by 0.35 before defenses. Incoming damage against NPC champions also normalizes their existing five-pool bodies, so that extra bookkeeping health does not make the player fight a much longer duel than the NPC. War Level HP growth and vitality perks retain their durability benefit. Damage against ordinary troops is unchanged; actual troops and summoned units retain their separate army role.

Every army has a stable banner color and initial tied to its champion. Troop and sentry art uses cached alpha-preserving recolors. Owner colors also match health bars, camp names, and the minimap. Green ground rings identify the player's troops, red rings identify enemies, and dashed cyan rings identify allies. Conquered armies immediately use their new owner's banner. The War Council includes the legend.

Concealment uses the map editor's existing foreground silhouettes and depth lines. It requires no separately drawn stealth map. A torso behind a silhouette is concealed from opponents on the front side. Opponents that cross behind the same object can see and attack normally. Previously unseen champions, regular troops, and summons are omitted from automatic target selection while concealed. Physical area attacks and existing projectiles can still strike them; hiding is not damage immunity.

An observer that witnesses entry into concealment remembers the entrance/last position for six seconds and may pursue. It does not learn subsequent movement through the object. Unrelated observers do not inherit that last-known position. Attacking or being struck reveals the involved body to the opposing army for two seconds. Sentry bolts stop homing through concealment and retain their last visible aim. Automatic targeting also respects concealment for basic attacks, beams, Reaper focus, Devourer execution, Lycanthrope Bloodmoon, cyclone suggestions, and servants.

Validation:

- 451 automated tests passed, including champion matchup protection, rolling-window boundaries, shield/invulnerability behavior, vitality, troops, cover acquisition/pursuit, temporary reveal, same-side visibility, and sentry tracking.
- Desktop and touch browser tests passed with no page errors. A four-hit excessive-damage combo removed exactly 30% HP in both browsers. All eight owner colors and cached recolors were verified and inspected visually.
- An exploratory 180-second Stage 4 bot screen ran all eight native kits on seed 77 with no stalls. Reaper cleared; Lycanthrope, Overlord, and Calamity reached the time limit alive; Hag, Devourer, Titan, and Sovereign died. This is a smoke test, not a human win-rate or full roster balance estimate. Ordinary army pressure remains dangerous.

Reproduce unit tests with `node --test tests/war-tactics.test.mjs`, browser checks with `node tests/war-tactics-browser.mjs`, and scenario screening with `SCENARIO_LABEL=war-tactics SCENARIO_SECONDS=180 node tools/champion-scenarios.mjs 4 77`. Local screenshots and JSONL results are under `test-results/`.


## Rival attack visibility

Rivals must enter the player's current camera rectangle, inset by 48 world units, before selecting the player for a new basic attack or starting a power against them. The check uses the live `targetView` supplied by the renderer, so portrait, landscape, resized windows, and zoom scaling use the actual visible field instead of the NPC's fixed 800/1100-unit sensing range. Rivals can approach from outside the screen; offscreen NPC-versus-NPC battles and independent troop behavior continue. Projectiles and effects already launched can finish normally.

Additional regression coverage checks every native rival kit, both camera axes and several view shapes, entry into view, and continuing offscreen NPC battles. Desktop/touch browser checks use the renderer's actual world-space camera bounds.


## Rival reaction pacing

Newly noticed targets, target switches, and reacquisition after losing sight now start a seeded 0.45-0.75 second reaction delay before basic attacks or ability choices. Ability decisions are spaced 0.80-1.15 seconds apart instead of 0.35-0.60 seconds. Aim/approach snapshots refresh every 0.20-0.30 seconds instead of following the target's latest position every AI tick. A modest preference for the current focus avoids restarting perception because two nearby troops briefly exchange distance order.

These are gameplay reaction windows, not measured human averages. Physics, movement speed, normal basic-attack intervals, and ability cooldowns remain unchanged. Rivals continue traveling while noticing a threat; viewport and cover eligibility still apply. Existing attacks are allowed to finish.

Validation: 458 tests passed, including new reaction-boundary, reacquisition, aim-copy/refresh, basic-opener and real ability-cadence checks. Desktop/touch tests verify that merely entering view no longer produces an instant ability cast, and that the rival engages after its reaction window.

## Base sentry repairs

Live turrets were clipped by their own map foreground silhouettes. Each turret now excludes only its matching sentry silhouette from rendering and concealment checks; ordinary units still hide behind the same structure. Turrets remain anchored when rival ability proxies apply knockback. Owner-colored SENTRY labels identify active defenses, and destroyed sentries show their remaining 25-second rebuild time.

Sentry range increases from 600 to 800 world units. Hostile champion attacks against friendly or allied occupants, including troops and shielded players, provoke four seconds of targeting priority. Normal troop attacks do not falsely blame their champion. Fixed turret damage against NPC champions compensates for their fivefold bookkeeping health, retaining defenses and the existing incoming-hit cap; damage against the player is unchanged. The firing interval remains 0.9 seconds.

Validation: all 467 automated tests passed, including seven sentry regressions for spawning, concealment, shielded retaliation, troop protection, projectile impact, comparable champion health impact, rebuilding, and anchoring. Production build passed. Desktop and touch browser checks confirmed that all eight generated turret sprites render at their map markers without page errors; the visible pixel count increased from 1,576 to 25,224 per turret after excluding its own mask. Reproduce with `node --test tests/war-sentry.test.mjs` and `node tests/war-sentry-browser.mjs`. The inspected contact sheet is `test-results/war-sentry-visibility.png`.


## Stronger editable defenses and army routes

Sentries now start with 15,000 HP (ordinary titan mobs have 10,000) and 150 damage per shot, with the existing 0.9-second firing interval and War Level scaling. Sentries use titan mass so normal crowd displacement cannot treat them as small troops. NPC champion damage from turrets uses the fixed body normalization and an 18% per-hit ceiling matching the player's protection; ordinary troop damage keeps its earlier ceiling. Champion duel budgets remain unchanged.

Sentries acquire the closest visible hostile body, ignoring stale remembered positions. A champion or minion targeting a friendly/allied champion inside the protected area creates a retaliation target; attacks against other friendly occupants also provoke hostile champions. Shielded and invulnerable attempts still count. Champion aggressors retain priority over troop aggressors while their threat is active, and captured/allied enemies are no longer valid retaliation targets.

Calamity and other continuing beam damage ticks against the player now require the caster to remain inside the player viewport. Previously only aiming and cast initiation checked this, allowing an offscreen beam aimed at another body to damage the player as collateral. Offscreen NPC battles still function, and already launched projectiles retain their existing behavior.

The Stage 4 test workshop supports a dedicated **Stage 4 turrets** layer. Drag markers or edit X/Y to move each generated turret preview together with its solid base and foreground silhouette. **Add turret** creates a defense owned by the nearest camp; **Owning camp** changes its allegiance. Remove selected turret deletes its matching base and hiding shape too. Undo, redo, local draft saving, import and export preserve placements. Up to 64 turrets are supported, with independent rebuilding and capture ownership, without consuming the camp's regular troop quota. Invalid floor/overlapping-base placement shows a warning and is rejected by the map application tool.

**Path / minion centerlines** now guides actual minion travel between fights. Drag existing points, insert bends, or use **Add minion route**. Dropped handles snap to nearby route vertices; join endpoints to connect the network. Selecting a line near its middle works as well as selecting endpoints. Lines and walkable floor are independent: changing bends does not alter collision; removing a route disables it without removing floor. Re-enable a disabled route using its floor area's **Minion route enabled** checkbox. Disconnected routes fall back to floor navigation. Local steering and combat pursuit still respect compiled floor clearance. Graph searches are shared and cached, with each minion retaining its route until its destination changes.

Open `test/map-editor.html?map=war`, edit, then export and send back the JSON to apply it. `node tools/apply-war-map.mjs exported-map.json --check` verifies placements without changing game files. The existing stage release and title gates are unchanged.

Validation: production build and browser module parsing passed; desktop/touch turret rendering, editor placement/ownership, route bends and disabling, floor preservation, undo, draft persistence and exports passed with no page errors. The generated editor export passes the game application check. Existing Stage 4 combat/reaction browser tests and Stage 3/custom-map layers browser tests passed. The older custom-map test helper was corrected to read the project's own draft key rather than the Stage 3 draft.

Final automated suite: 475 tests passed. Reproduce the new regressions with node --test tests/war-defense.test.mjs and editor checks with node tests/war-editor-browser.mjs.


## Battle feed and defeat diagnostics

Stage 4 records champion defeats (including the player's) and destroyed turrets. Each entry snapshots the victim, responsible army and unit type, finishing attack, match time, nearest camp/road or central crossroads, War Level, and actual finishing health damage. NPC proxy damage preserves its spell/poison source; sentry projectile attribution is captured at launch so later ownership changes cannot rewrite it. Unknown sources are labeled unattributed rather than guessed. Ownership is recorded before conquest transfers armies.

For context, each death includes the largest six health-damage contributors from the preceding eight seconds, expressed as a percentage of the victim's maximum HP. Finishing blows and recent contributions are separate; shields and prevented damage do not count as health loss. Healing can allow recent damage to exceed a health bar. Sampling is restricted to champions and turrets, with bounded half-second buckets and a maximum 96 loss events; older turret losses are dropped first, retaining champion history. Ordinary minion deaths are not logged. The diagnostics consume no random rolls and do not modify combat or scoring.

The collapsible live battle feed shows the latest four events on desktop. It defaults off on touch devices and never opens itself or interrupts play. Enable or disable **Show live battle feed** in **War Council**; the preference stays in the browser separately for touch and desktop. The council and results card each contain a collapsed **Battle report**, with expandable entries and **Export battle report** for a readable JSON download. Logging continues with the live feed disabled. Local Copy Results includes the defeat summaries; verified scoring codes retain their existing format and size and do not embed the diagnostic report. Export the separate report when sending tester feedback.

Turrets no longer trigger the unrelated Hollow King HUD label/music cue through their titan mass classification. No balance, targeting, tournament format or release gate changes are included in this reporting update.

Validation: 483 automated tests passed, including eight report regressions covering player/rival powers, poison, troop/sentry attribution, player death, blocked damage, contributor windows, launch attribution, bounded history, snapshots, and identical score/conquest/random behavior with logging disabled. Production build and all 96 browser modules parsed. Desktop and touch browser tests passed for mobile opt-in, feed collapsing/hiding, council controls, results details, JSON export and valid compact scoring codes; existing combat/reaction browser checks also passed. Reproduce with `node --test tests/war-battle.test.mjs` and `node tests/war-battle-browser.mjs`.
