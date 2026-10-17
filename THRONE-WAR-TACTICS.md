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
