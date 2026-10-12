# Shrine guardian teams

Each shrine retains its defender (18,000 health), caster (6,500) and skirmisher (6,500). Their native-power wards still require core champion powers to expose them. The three now coordinate positioning and pressure inside their authored guardian zone.

The skirmisher engages immediately on entry, including across the full shrine rather than a 550-unit leash. It pursues at 215 units/second and uses a locked-direction lunge after a 0.45-second warning. Swept impact deals 95 base damage and applies a 0.22-second shove at 680 units/second. Close attacks use a separate cooldown and deal 65. Vault, Bloodmoon and dodge immunity prevent the shove. The push uses swept floor collision, so it cannot throw the champion over a cliff.

The defender moves at up to 175 units/second to stand about 105 units between its caster and the player. Its directional guard has a 3,600-point reserve. Frontal hits on a guarding defender can be absorbed by 80%; covered ranged hits on the caster by 65%, spending that same reserve. Flanking, close attacks and overhead/area attacks bypass caster cover. Disruptive impacts break the guard for six seconds. It then regenerates after three seconds without a hit. Losing the caster removes the defender's protection. Its close shield bash has a 0.7-second warning and deals 105 base damage.

The caster retreats when crowded and casts from medium range. It cycles three-projectile volleys (160 base damage each), a broad mana burst (240), and a three-part bombardment (200 per impact). Targets are locked during the warning, rather than following the player until impact. Warnings last 0.8, 1.25 and 1.4 seconds respectively; the slowest body has time to leave the burst footprint. The spell and directional guard visuals reuse actual generated artwork. Warning textures render above champion auras for legibility.

Guardians remain inside their shrine's authored zone. Leaving cancels new actions and sends them home. Guardian projectiles use swept hit detection and stop at nonwalkable shrine scenery or the shrine boundary. Team lookups are cached at five refreshes per second; at most one warned spell per caster is active.

Checks: the full unit suite, `tests/realm-guardian-team.test.mjs`, desktop/touch `tests/realm-guardian-team-browser.mjs`, existing mimic/interaction checks, and the production artifact check. Browser emulation verifies layouts and behavior but does not replace physical-device performance testing.

## Mana-born Titan pressure

The Titan now has 190,000 health (formerly 280,000), about 32% less. Each newly broken defense raises pressure immediately; reaching the next health quarter retains that pressure. Leaving and resetting the arena restores the original pace.

Movement rises from 112 to 193 units/second across four defenses. Recovery between attacks drops from 1.1 to 0.704 seconds and the rush travels its committed route in 0.30 seconds rather than 0.42. Cleave reach grows from 280 to 360 units and eruption coverage grows from six to ten marked impacts. Attacks snapshot their coverage at the start of the warning so a breach cannot enlarge an already advertised attack.

Rush and cleave warnings remain 0.85 and 1.05 seconds; eruption impacts retain 1.35 seconds of warning. Later eruptions leave a 100-degree escape lane toward the arena center, verified reachable by the slowest body. Damage values are unchanged. The extra danger comes from movement, cadence and coverage. Test: tests/realm-titan-pressure.test.mjs.
