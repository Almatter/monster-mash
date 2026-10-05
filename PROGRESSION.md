# Records, feats and prestige

Run Feats award current-run Dominance, repeat under individual cooldowns and reset each incarnation. Permanent records store best-run achievements. Most titles are cosmetic rewards with independent AND-combined requirements; stage-passage titles also grant access to later maps. A basic achievement no longer automatically awards a high-prestige title.

There are 42 prestige titles, plus the existing small starter selection. Stage 1 shows 27; Stage 2 unlocks the remaining hunt and Reaper titles, including The Ashen Gatebreaker. Visible goals and conditions are grouped and expandable in Monster Records.

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
| Reaper mastery (3) | 5k / 50k scythe kills; 2k Graveshift kills | 5 / 20 Reaper runs; upper scythe tier also 15k Eclipse kills |
| Ashen Wilds (11) | Hunt accomplishments | See the current explicit conditions in Monster Records |
| The Gatebreaker | Seven distinct festival days with one champion | Each Stage 1 run reaches 8:30 with at least 15,000 kills; defeat or manual end counts |
| The Ashen Gatebreaker | 12 completed Stage 2 hunts with one champion | 5 completed hunts with the Colossus slain, plus 4 different boons at rank 3 in completed hunts with that same champion; no daily limit |

The Gatebreaker accepts qualifying runs from September 25, 2026 (Indianapolis time), including manually ended runs. Only one qualifying run per calendar day counts, and runs on different champions cannot be combined. The days need not be consecutive. Older runs that did not store per-day trial data cannot be reconstructed reliably from aggregate personal bests alone. The title can be worn like other prestige titles, but it also permits Stage 2 selection once that stage opens October 8 at midnight Eastern. A fresh network time check is required to select it; offline play remains available on Stage 1. The Ashen Gatebreaker becomes visible once Stage 2 access is open. Its 12 clears, 5 Colossus-winning clears and 4 distinct rank-3 boon types all belong to one champion; there is no per-day cap, calendar-day requirement or mandatory streak. Partial hunts and failed hunts cannot advance these mastery goals. Existing per-champion clear and Colossus-winning clear counters contribute. Historical global boon bests cannot establish which champion used them; the seven new per-champion boon counters start with this update. Stage 3 is scheduled for October 15, midnight Eastern, one week after Stage 2. The title grants passage for the entire roster when the date arrives and the Stage 3 map is shipped; its content-ready flag prevents accidentally selecting the old placeholder. Stage 4 remains a future stage. This client-side gate is for normal play, not tamper-proof access control.

Only finished incarnations lasting >=60 seconds count toward run requirements. Lifetime kills and score are saved incrementally every five seconds and on finish/pagehide. Force closing the process can lose the latest interval. Best statistics retain maxima. Source-specific lifetime counters are separated by archetype. A per-run delta ledger and bounded completed-run IDs prevent ordinary repeated save/finish double-counting.

mm-profile version 3 migrates version 1/2 identity, per-kit palettes and records. It preserves previously earned legacy titles, explicitly labeled as legacy in Records, without inventing historical lifetime totals. Unknown/corrupt fields normalize safely; blocked local storage leaves in-memory play usable. This is local last-writer-wins storage: do not play simultaneous tabs, clear site data, or treat it as verified competition data.

Monster Records now offers manual **Export Progress / Import Progress**. Transfer the latest JSON backup before playing on another device. Imports combine rewards and unique trial dates per champion, retain maximum bests and counters, and transfer identity/palettes while keeping device audio/FX preferences. Independent unsynced lifetime totals cannot be summed reliably; the higher value is retained. Imports have a preview and a stored undo snapshot, reject invalid files, and are blocked during matches. No save schema or competition rules changed. Gatebreaker opens Stage 2 for the entire roster, even though its seven days must be earned by one champion. See [LIVE_EVENT_TRANSFER_REPORT.md](LIVE_EVENT_TRANSFER_REPORT.md).

For development, open /art-lab.html directly on localhost. The reset control is not linked from the player UI, only appears on loopback hosts, and requires the exact typed phrase RESET PROGRESSION. Close other game tabs before resetting, then reload them. It clears only progression and an unavailable equipped title; name, palettes and audio preferences remain. This is an accidental-reset safeguard, not authentication.
