# Facing, targeting, and minion interception study — 2026-09-28

Shipped ruleset: `2026.10-v15-autotarget-squad`. The ranged-attack and minion-targeting changes make new runs incomparable with v14 records; older MM4 codes remain readable.

## Shipped behavior

- The Sovereign, Titan, and Devourer gameplay atlases were authored facing left. Their draw direction is now corrected so each leads with its head when walking left or right. Pure vertical movement and standing still retain the last horizontal side.
- Titan's Iron Stampede uses current or last movement direction, with right as the fresh-run default. Pointer and touch aim do not redirect it.
- Overlord's Edict of Ruin and Calamity's Ruin Lance aim every shot at the closest enemy inside their own range, regardless of mouse or tap position. Calamity's Oblivion Ray tracks the closest enemy inside beam range throughout its duration. The player's manual point selection for Starfall and Vortex is unchanged.
- Overlord's minions count other minions' current target claims when choosing prey. They prefer an unclaimed weak mob when the travel cost is reasonable, can still focus an elite or Titan, and can all attack the only available target. Patrol, defensive search, attack damage, and ally cap are unchanged.

## Projectile interception experiment — not shipped

An isolated worktree branched from the shipped v15 commit added swept-path collision for shooter projectiles against active Overlord minions (20-unit hit radius, minion takes the existing shot damage and dies at zero health). The game's existing player collision, shot speed/damage, minion stats, other champions, targeting, and active-play policy were held constant. Direct tests verified that an ally on the path absorbs a shot while an off-path ally does not.

Thirty-six predetermined seeds were compared as matched pairs: `77,123,444,17,53,101,222,555,987,2026,314,909,7,11,19,29,37,41,61,89,131,167,211,257,333,404,606,808,1001,1337,1597,1777,2048,4096,8191,9999`. Runs used natural death, no health reset or artificial invulnerability. These are automated-policy averages, not a human survival guarantee.

| Overlord | Average survival | Average Body Count | Average Dominance |
| --- | ---: | ---: | ---: |
| No interception (shipped) | 11:09 (668.8 s) | 32,849 | 3,148,045 |
| Minions intercept (prototype) | 11:10 (670.3 s) | 32,970 | 3,162,518 |

The prototype absorbed **127.9 shooter shots per run** on average (range 86–154). Paired survival changed by **+1.6 seconds** on average: 18 seeds improved, 15 worsened, and 3 tied. The paired differences ranged from −64 to +52 seconds; the approximate 95% interval for the mean difference is −7.6 to +10.8 seconds. Thus the sample does not establish a meaningful survival benefit despite visible interceptions. Body Count changed by +121 and Dominance by +14,473 on average, also small compared with run variation. Interception has not been added to the game or the deployed build.

## Validation

79 unit tests passed, including movement-direction, nearest-target, ray-tracking, and squad-claim cases. Production build and GitHub Pages artifact checks passed (175 files). A browser rendering check confirmed all five champions' facing and combat art at desktop and landscape sizes. The beta verifier, movement/outcome, and first-player-clarity browser flows passed. The isolated interception prototype's two direct collision tests passed.
