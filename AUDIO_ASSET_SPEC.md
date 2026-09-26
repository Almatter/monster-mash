# Monster Mash audio specification

Monster Mash ships original procedural music and original synthesized SFX. No downloaded samples, licensed recordings, runtime library, or external music-generation service are required. `public/assets/audio/catalog.json` can optionally override cues/tracks with owned files.

## Six musical identities

`src/procedural-music.ts` renders one 7-stem theme on demand, then reuses its synchronized looping sources through the entire run. A menu-to-champion or champion-to-menu change renders the next theme asynchronously and replaces the old buffers. Music state changes only automate stem gains. PCM is mono 22.05 kHz; a theme uses 16.5–23.7 MB depending on tempo/bars. All notes and rhythmic choices are deterministic and independent of simulation RNG.

| Theme | BPM | Harmonic character | Primary motif and rhythm | Bass, percussion and texture |
|---|---:|---|---|---|
| Monster Mash menu | 104 | D natural minor / festival modal | Sparse dulcimer call with delayed response | Light frame-drum pulse, restrained low drone, occasional bell; 16 bars / 36.9s |
| Sovereign | 108 | D harmonic minor / royal cadence | Rising crowned interval and bell answers | Stately bass pulses, ritual drum accents and choir-like pad; 16 bars |
| Overlord | 100 | E Phrygian / funeral march | Tight semitone command figure | Four-beat marching bass/toms, denser choir and dark command pulses; 16 bars |
| Titan | 84 | G minor / open fifths | Wide hammering figure with rests | Slow massive kick/tom, deep drone and metallic bell resonance; 12 bars |
| Devourer | 144 | C Phrygian | Semitone predator figure over a 3+3+2 syncopation | Fast warped bass, irregular toms and breath/formant-like tone; 16 bars |
| Calamity | 132 | A harmonic minor / unstable arcana | Quick arpeggio with chromatic tension | Offbeat explosive drums, high inharmonic magic tone and surging bass; 16 bars |

Seven reusable stems carry harmony/drone, character bass, character percussion, signature motif, Carnage counterline, Unbound/Final line, and Titan threat/results accents. Mixes cover **menu, base combat, high Carnage, Unbound, Final Release, Titan, and results**. A live Titan takes priority. Final Release adds the densest rhythm and countermelody; results resolves to a quieter cadence. Internal low-pass filtering and conservative stem gains leave room for SFX. Ultimates, Titan death, title/achievement and defeat briefly duck the music. The music bus is multiplied by 2.4 after the saved slider setting; the master compressor (−8 dB threshold, 12:1 ratio) guards peaks and SFX remain on their existing bus. Intentional music ducking remains active.

Music begins after the browser's required user gesture. Fresh profiles default MUSIC to 100%; a stored volume, including zero, takes precedence. Master, music, SFX, UI and mute remain stored in `mm-audio`. Pause/background suspends the audio clock; page disposal disconnects sources. No per-beat AudioNodes or unbounded scheduled notes are created. The local-only `music-lab.html` allows champion and state audition. `node tools/render-music-preview.mjs <menu|sovereign|overlord|titan|devourer|calamity>` writes an auditionable WAV under ignored `test-results/`.

## SFX and optional replacement files

`src/content-audio.ts` declares cue IDs. `src/synth-sfx.ts` supplies two original generated variants for most cues, four for other basic attacks, and six for Devourer basic attacks. Slow seeded modulation and small playback-rate variation keep repeated attacks related but distinct. SFX are capped at ten simultaneous voices plus two UI voices with throttling and priority eviction. Distinct sounds cover basic attacks for each monster, all twenty abilities, ultimates, hurt/heal/shield/defeat, enemy deaths, Carnage/multikills, records and menu controls.

Owned/commissioned files may replace cues in `public/assets/audio/catalog.json`: `sfx` maps cue IDs to up to eight paths under `assets/audio/`; `music` maps menu/combat/escalation/unbound/final/titan/results to a path plus optional loop endpoints. Decode limits are 2 MiB/8s for SFX and 24 MiB/180s for music. Audio remains optional if decode/autoplay fails. This catalog need not be filled for beta/public tests because procedural audio already works.

Automated browser checks verify six distinct theme signatures, state transitions without source restarts, stable node counts, nonclipping finite PCM, 100% fresh default, saved preference preservation, pause/mute/resume, and disposal. **Human headphone/speaker audition remains a launch acceptance check**; this environment had no listening-capable tool.
