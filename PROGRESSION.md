# Records, feats and prestige

Run Feats award current-run Dominance, repeat under individual cooldowns and reset each incarnation. Permanent records store best-run achievements. Titles are cosmetic rewards with independent AND-combined requirements; a basic achievement no longer automatically awards a high-prestige title.

There are 26 prestige titles, plus the existing small starter selection. All goals and every condition are visible in Monster Records.

| Family | Main thresholds | Additional requirement |
|---|---|---|
| Slaughter (4) | 25k / 100k / 500k / 2m lifetime slain | 2 / 5 / 15 / 50 completed incarnations |
| Dominance (3) | 2.5m / 25m / 150m lifetime Dominance | 3 / 15 / 50 incarnations |
| Carnage (3) | 60 / 180 / 360 consecutive seconds at x5 in one run | 3 / 8 / 20 incarnations |
| Titan hunting (3) | 5 / 20 / 100 Titans | 25 / 100 / 500 elites |
| Survival (3) | 8 / 12 / 20 minutes in one run | 3 / 10 / 30 incarnations |
| Titan mastery (2) | 5k / 50k collision kills | 5 / 20 Titan runs; upper tier also 10k trample kills |
| Devourer mastery (2) | 5k / 50k consumed prey | 5 / 20 Devourer runs; upper tier also 50 elites consumed |
| Calamity mastery (2) | 20k / 250k spell kills | 5 / 20 Calamity runs; upper tier also 300 kills in one activation |
| Overlord mastery (2) | 10k / 100k servant kills | 5 / 20 Overlord runs; upper tier also 25k corruption explosion kills |
| Sovereign mastery (2) | 5k / 50k devoured AND beam kills | 5 / 20 Sovereign runs |

Only finished incarnations lasting >=60 seconds count toward run requirements. Lifetime kills and score are saved incrementally every five seconds and on finish/pagehide. Force closing the process can lose the latest interval. Best statistics retain maxima. Source-specific lifetime counters are separated by archetype. A per-run delta ledger and bounded completed-run IDs prevent ordinary repeated save/finish double-counting.

mm-profile version 3 migrates version 1/2 identity, per-kit palettes and records. It preserves previously earned legacy titles, explicitly labeled as legacy in Records, without inventing historical lifetime totals. Unknown/corrupt fields normalize safely; blocked local storage leaves in-memory play usable. This is local last-writer-wins storage: do not play simultaneous tabs, clear site data, or treat it as verified competition data.

For development, open /art-lab.html directly on localhost. The reset control is not linked from the player UI, only appears on loopback hosts, and requires the exact typed phrase RESET PROGRESSION. Close other game tabs before resetting, then reload them. It clears only progression and an unavailable equipped title; name, palettes and audio preferences remain. This is an accidental-reset safeguard, not authentication.
