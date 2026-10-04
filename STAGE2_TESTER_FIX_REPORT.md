# Stage 2 tester fixes — v24

October 3, 2026. Rules: `2026.10-v24-court-test` and `2026.10-v24-court-hunts`. The release is for the existing Stage 2 testing endpoint. Stage 1 retains `2026.10-v15-autotarget-squad`, its simulation and scoring. Profile schema, earned titles, qualifying days and historical result codes remain compatible.

## Mobile artwork and loading

The reported phone's exact cause is not confirmed without its diagnostics. The screenshots show an unfinished character-art request, not proof that a cache reset is required. Two concrete failure paths were corrected: image requests could remain pending indefinitely, and a failed service-worker cache write could discard a successful network response.

Character artwork now has build-version URLs, bounded download/decode waits, one automatic retry, and a visible **Retry artwork** action when loading fails. The finished base painting can remain visible while color layers load. A match waits for actual character art before starting. Temporary tint canvases release their backing pixels. Successful downloads remain usable when storage is full or inaccessible. First-visit art is cached even if it arrives before the worker controls the page.

Terrain has bounded fetch/decode waits and falls back to normal image decoding if ImageBitmap decoding is unavailable. Failed requests back off instead of issuing every frame. Phones keep at most 24 decoded terrain sections: **24.38 MiB of RGBA pixels**, plus active decoding/browser overhead. Desktop capacity remains 36, **36.56 MiB**. This is the terrain budget, not total browser memory. Mobile prefetch prioritizes visible ground and its safety buffer. Delayed paths still pause simulation and damage together.

Service-worker updates tolerate cache failures, retain coherent installed modules, and activate through the existing safe menu flow. No browser-data or progress reset is required. Debug info now includes artwork and terrain loading states.

## View and scenery

Ordinary portrait and landscape screens fill with the battlefield using their aspect ratio. Every device shows **912,000 square world units**; pixel resolution does not increase that area. Extremely unusual aspect ratios are bounded at 3.6:1. Captain activation was extended beyond the longest supported camera edge.

Sixty-six footprints were traced against the finished district paintings: central landmarks, terraced ridges and larger furnishings. Collision excludes these interiors for champions, enemies and servants. Foreground silhouettes mask actor bodies and their auras behind raised scenery, while the forge arch's open doorway remains transparent. These masks reuse the real painting; they are not visible test shapes or additional terrain textures. Several captain pockets were moved onto clearer ground, retaining multiple retreat directions and all twenty potential sites.

The hub and connecting roads reuse a clear earth sample from the finished Crownfall painting, matching the districts' palette and brushwork. The complete compressed terrain is now **45.56 MiB**, still streamed as 462 sections.

Navigation retains exact segment clearance. Convex-lane shortcuts, reuse of validated destinations and nearest-first node selection remove repeated work. A 2,000-pair comparison returned exactly the same destinations as the unoptimized geometry. The updated navigation graph has 720 nodes.

## Guard strategy and rewards

Opening vanguards now have **1,600 HP and 2,200 guard**, scaling with hunt tier. Intact protection absorbs **85% of frontal damage**; flanking bypasses it. Impact abilities can still break it. An intact guard along a firing lane reduces a captain's beam, claw-wave or ranged-basic damage by **35%**. Area spells and close attacks retain their distinct counters. The existing extra servant damage against captains was reduced from 30% to 10%.

Court seals now award **500,000 Dominance** each; broken guards award 10,000, impact breaks add 20,000 and close captain kills add 25,000. All champions receive a clear-speed bonus up to **3.2 million** at ten minutes or less, declining to zero at fifteen. Ordinary combat remains capped at 500,000. Objective rewards provide the higher score ceiling without restoring endless farming. Old v16–v23 codes use their original reward formula during validation.

## Validation and measurements

- **160 unit checks pass**, including movement, connected routes, captain retreat space, guard counters, bounded scoring, stage gates, save behavior and old result-code compatibility.
- **15/15 real-damage automated hunts clear**: three seeds per champion. The controller explores known possible sites without reading occupancy. These are learned-route clear times, not human survival averages or a verified first-play 10–12-minute duration.
- **Ten Stage 1 comparisons** match the shipped v15 state through 600 seconds, across all champions and two seeds each.
- Desktop/mobile browser checks cover every district, portrait/landscape camera coverage, captain persistence, all kits/results, paused boons, delayed streaming, northern dash retreat and isolated test progress.
- An emulated phone reproduces stalled artwork requests, recovers with Retry artwork, and runs with ImageBitmap deliberately unavailable. It stays at 24 terrain sections. Raised-wall, open-doorway and in-front pixels verify depth masking.
- Offline reload and worker replacement pass under the `/monster-mash/` deployment prefix. The production artifact passes relative-route and PWA-scope checks.

| Champion | Average clear | Average body count | Average Dominance |
|---|---:|---:|---:|
| Devourer | 5:07 | 2,594 | 9,708,542 |
| Titan | 6:53 | 4,084 | 10,275,106 |
| Sovereign | 6:05 | 3,933 | 9,788,803 |
| Calamity | 8:20 | 5,639 | 9,753,444 |
| Overlord | 9:04 | 6,132 | 9,353,238 |

These early clears earn the full speed bonus. Clearing the same objectives at twelve minutes loses 1.28 million of that bonus, placing these equivalent scores around **8.07–8.995 million**. Actual human body counts, guard tactics and seal pickups will vary.

The 200-enemy landmark stress case at fourfold browser CPU throttling measured **24.8 FPS for Devourer** and **17.3 FPS for Overlord with 16 servants**. Update means were 6.35/7.78 ms and draw means 1.34/2.15 ms. This deliberately dense stress case is not a guarantee for the tester's phone; high crowds can still cause dips. The initial naive footprint implementation was substantially slower and was not released.

Raw balance, browser screenshots, navigation comparison, parity and performance evidence are under the ignored `test-results/` directory. The public playtest retains its Gatebreaker/date bypass and separate progress namespace; normal entry retains its gate.
