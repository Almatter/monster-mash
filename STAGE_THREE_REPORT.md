# Stage 3 tester — v37

This update is intended for `/test/`, with the existing Stage 2/3 test aliases. Official Stage 3 remains unavailable until its configured opening, Gatebreaker requirement and readiness flag allow it. Existing player progress, title IDs, gates, personal bests and previously issued run codes are retained.

## Controls and presentation

Vault's invalid landing now uses a generated crossed-claw lunar asset instead of a red geometric circle. Bloodmoon and Clinch have a remaining-time bar above the controls. Bloodmoon allows ordinary movement when it has no visible target, while its protection and regeneration continue until its timer expires.

The first relic window now handles arrows, Enter, Space and Escape explicitly, including lost focus and opening-key release. PC can select a relic, choose a power slot, restore a native power at an empty altar, and teleport without using the mouse. Touch buttons provide the same choices.

The rotated gate graphics were removed. The actual illustrated outer bridge approaches remain walkable up to a closer baked mana shroud. Map collision and floor routes reach these visible bridge ends. No gate blocks an altar or points sideways. The map remains sector based with bounded terrain caching.

## Lycanthrope

Ravage is now **Savage Clinch** (Clinch). Its internal ID is retained for existing records and codes. She captures a nearby ordinary enemy, carries its real sprite, and sweeps it through surrounding enemies while moving. The held body adds reach; heavier bodies hit harder. She gains 8% movement speed and 15% damage protection while holding it. It breaks after its duration and credits one defeat. Release II permits brutes; Final Release permits elites below 35% health. Captains, guardians and titans cannot be grabbed.

Captured enemies are excluded from normal targeting, movement, damage and pool reuse. Swapping powers releases the captive safely. Knockback velocity is cleared so a held body cannot create accidental endless collision damage.

Final three-seed Lycanthrope measurements:

| Stage | Measurement | Average | Range | Kills | Dominance |
|---|---|---:|---|---:|---:|
| 1 | Survival | 11:33 | 11:13–11:59 | 31,876 | 2,920,762 |
| 2 | Full hunt including Colossus | 9:42 | 9:11–10:23 | 5,829 | 12,945,969 |
| 3 | Solution-informed clear | 7:15 | 5:55–8:03 | Not the main scoring goal | 26,050,000 |

Stage 2 and Stage 3 clear rates are 3/3, with all three Stage 2 Colossi defeated. These are seeded automated policies, not human play averages. Stage 1/2 changes to this kit do not alter the other champions' abilities.

## Relics and scoring

Every altar randomly offers one of its champion's five powers: the four existing powers or the fifth relic power. Nature, ability, shrine assignment, titan defenses and titan appearance vary independently. The four required natures always have an obtainable offering. Invoking an equipped matching relic near the titan resonates with its defense, including support powers; native powers alone do not open it. This avoids unsolvable rolls involving summons, buffs, fear or movement instead of direct damage. Each newly breached layer grants a finite recovery reserve once; resets cannot farm it.

Guardians still require the body's native core powers to expose their wards. Borrowed powers use the original body identity for this check, so the donor's temporary ability execution cannot pretend to be a native power.

Precision replaces the reward for clearing all grottos. Each of the four needed grottos contributes 2,100,000 to an 8,400,000 pool. Every unrelated cleared grotto deducts 900,000 from that pool. Partial unrelated guardian kills give no objective score. Discerning Collector requires only the four needed grottos and relics. Unbroken Resolve no longer tells players where to look for the solution.

The maximum remains **26,050,000**: precision 8,400,000, defenses 6,000,000, victory 6,000,000, feats 5,600,000 and combat 50,000. Grade uses this finite maximum. The result screen, copied summary and saved card show precision instead of encouraging seven clears. Historical v34–v36 results retain their original score policies and payload shapes.

## Titan encounter and sustain

The titan actively closes distance and alternates a fast rushing strike, a directional cleave and six clustered eruptions around the player. Generated warnings precede every attack. Rush and cleave directions commit during their windups; the player can dodge rather than circling a stationary boss. The cleave art's origin and direction align with its damage cone. Recovery after an attack gives 1.8× damage, creating a counterattack opportunity. Health is reduced from 750,000 to 280,000 to shorten the grind.

Heavy damage is capped relative to low-health bodies, preserving existing tank advantages while avoiding disproportionately lethal caster hits. Dodging a rush or cleave restores a small amount of health and ward for every kit, so a randomized loadout without a dedicated healing power remains viable. Eruptions provide 1.35 seconds of warning, enough for the slowest body's movement. They and the crowd remain bounded.

Calamity's Stage 3 ward trigger adapts to smaller crowds: a six-kill cast rebuilds a smaller ward, using the same 16 ward per kill up to 160 per cast and 240 capacity. Her existing Stage 1/2 sustain and rules are unchanged.

## Encounter measurements and limits

The pilot knows the solution, reads all four inscriptions, attempts only required grottos, fights while travelling, recovers at altars, assembles powers locally, and avoids telegraphed attacks. Real cooldowns, movement, damage and relic custody apply. Collateral clearing can lose precision. Failed runs are included in clear rates and grades; averages below include successful clears only.

| Nature | Clears | Mean successful clear | Grades across seeds 17 / 83 / 127 |
|---|---:|---:|---|
| Lycanthrope | 3 / 3 | 7:15 | S / S / S |
| Overlord | 2 / 3 | 5:48 | A / B / F |
| Calamity | 2 / 3 | 4:34 | S / A / F |
| Devourer | 3 / 3 | 6:22 | S / S / S |
| Titan | 3 / 3 | 6:58 | S / S / S |
| Sovereign | 2 / 3 | 6:07 | A / A / F |
| Reaper | 3 / 3 | 6:11 | S / S / S |

Every body achieves at least A in this sample. Randomized kits and the aggressive encounter still produce failures for some bodies; this is not proof of equal win rates. The roughly five-to-eight-minute informed clears are lower bounds, not evidence that the desired 10–12-minute human puzzle-solving window is met. Discovery, memory and backtracking need tester feedback. The boss fight is substantially shorter than the prior seven-minute grind.

## Verification and assets

293 unit/regression tests pass, including 2,000 seeded offering checks, all 35 donor powers breaching on another body, captive lifecycle, valid bridge routes, dodge mechanics, guardian ownership, precision deductions, stage-specific sustain, historical codes and progress/access preservation. PC and touch checks cover first-open keyboard selection and restoration, Vault art and landing, Bloodmoon movement/protection/countdown, Clinch art/countdown, all seven starts/restarts, local swaps/portals, failed-art loading recovery, S result exports and Stage 2 run-code generation. Build, emitted browser module parsing and Pages artifact checks pass.

New art uses the built-in ImageGen tool with transparent backgrounds. Source PNGs, runtime WebPs and full prompts are listed in `art-source/stage3/PROMPTS-V37.md`. `tools/pack-realm-v37.mjs` reproducibly packs the existing sector art, closer mana shroud and new effects. No runtime procedural placeholder replaces the requested artwork.

Reproduction: `node --test tests/*.test.mjs`, `node tools/build.mjs`, `node tools/check-browser-modules.mjs`, `node tools/check-pages-build.mjs`, `node tests/lycan-controls-browser.mjs`, `node tests/realm-v37-browser.mjs`, `node tests/titan-realm-browser.mjs`, `node tests/hunt-result-code-browser.mjs`, `node tools/measure-titan-realm.mjs`, `node tests/balance.mjs v37-lycan lycanthrope`, and the Lycanthrope subset of `tests/stage-two-balance.mjs`. Measurements and visual artifacts are saved under ignored `test-results/`.
