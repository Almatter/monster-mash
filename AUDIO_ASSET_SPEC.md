# Monster Mash audio delivery contract

The runtime is ready for owned or commissioned audio. No music masters or physical recordings are bundled. The empty public/assets/audio/catalog.json is intentional. Original distorted, monster-specific synthesized cues now cover every runtime sound hook; commissioned or owned clips can replace them through the catalog. Do not copy a named soundtrack or download unlicensed clips.

## Music

| Catalog state | Direction | Length / intensity |
|---|---|---|
| menu | Dark fantasy monster gathering: low strings, medieval plucked instruments, ritual percussion, restrained festival energy | 60-120s, low |
| combat | Confident isekai battle rhythm, monstrous swagger, clear melody with space for attacks | 90-150s, medium |
| escalation | More urgent percussion, dramatic modern orchestral layers, dense horde pressure | 90-150s, high |
| titan | Weight, ominous brass/choir textures and an intelligible pulse | 60-120s, extreme |
| results | Brief triumphant/ominous appraisal flourish, looping if the player remains | 20-60s, low |

Deliver stereo 44.1/48kHz Ogg Vorbis plus MP3 alternate masters for platforms that need them. Catalog selects ONE tested file per state; there is no automatic codec fallback. MP3 is the safest single-delivery baseline. Retain lossless WAV masters outside public/. Target about -18 LUFS integrated, true peak <= -1 dBTP. Match perceived loudness between states. Avoid long intro silence. Maximum decoded track length 180 seconds; compressed file cap 24 MiB.

Author seamless loops with matching endpoints and no baked fade. Provide loopStart and loopEnd in seconds against the decoded file (validate codec padding by listening). The engine uses AudioBufferSourceNode looping with a 1.2s crossfade, at most two live tracks. Crossfades are not beat-synchronized. No abrupt state-dependent tempo switch that requires synchronization.

Menu plays after user interaction. Gameplay chooses combat, escalation at Carnage >=4 or time >=300s, and titan while a Titan is alive. Pause/background suspends the audio clock. Restart and return to registry change state on the same AudioContext.

## SFX and UI

Catalog event IDs are declared in src/content-audio.ts. Use mono for positional-neutral impacts, stereo sparingly for large magic or reward flourishes. PNG/art naming conventions do not apply. Prefer small Ogg/MP3 clips; PCM WAV is also supported. Target roughly -18 to -14 LUFS for sustained effects, true peak <= -3 dBTP; short transient loudness must be auditioned against the mix. No long reverb tails in basic attacks. Clip cap 8 seconds / 2 MiB compressed; ideally most attacks are 50-400ms.

Required deliveries:
- basic.sovereign, basic.titan, basic.devourer, basic.calamity, basic.overlord.
- ability.<id> for every ID in src/content-monsters.ts (20 distinct ability hooks, including ultimates).
- ultimateStart, ultimateImpact, meteorImpact.
- hurt, lowHealth, heal, shield, defeat.
- enemyDeath (a grouped small-death texture), heavyDeath, eliteDeath, titanArrival, titanDeath.
- collision, devour, corruption, multikill, carnage, wave.
- feat, achievement, title, menu, confirm.

Use 2-4 interchangeable variants for frequent impacts. Runtime chooses at most eight variants and varies playback rate by +/-3%. Enemy deaths are throttled to one event per 180ms; collision 200ms, mass-kill 1.5s, low-health 6s. Maximum ten SFX plus two UI voices, with priority replacement and explicit cleanup. Lower-priority deaths cannot evict title/defeat cues. A compressor guards peaks; it does not replace proper mastering.

The bundled procedural synthesizer uses original distorted formant, breath, crunch, cracked-stone, cursed-choir, warped-rift, and subdued rune designs for all semantic hooks, including physical attacks/deaths. Two deterministic variants per cue, playback-rate variation, priority caps and throttling limit repetition and mass-kill overload. Catalog files override synthesized cues. Mass-kill cues scale from massacre to extinction without multiplying death voices. Physical headphone and speaker audition plus final music mastering remain launch acceptance checks.

## Catalog example

Paths must remain under assets/audio/. Example only; the files below are not bundled.

```json
{
  "music": {
    "menu": {"file": "assets/audio/music/gathering.mp3", "loopStart": 0.05, "loopEnd": 92.4},
    "combat": {"file": "assets/audio/music/reign.mp3"},
    "escalation": {"file": "assets/audio/music/horde.mp3"},
    "titan": {"file": "assets/audio/music/crown.mp3"}
  },
  "sfx": {
    "basic.titan": ["assets/audio/sfx/titan-slam-01.ogg", "assets/audio/sfx/titan-slam-02.ogg"],
    "ability.worldbreaker": ["assets/audio/sfx/worldbreaker.ogg"],
    "title": ["assets/audio/ui/title.ogg"]
  }
}
```

Master/Music/SFX/UI gains and mute are saved in mm-audio. Context creation/resume requires user interaction. Storage/decode/autoplay errors leave gameplay functional. Loading is limited to two simultaneous requests; decoded buffer cache is capped at approximately 100 MiB (active crossfade sources may temporarily retain additional buffers). Late unloaded SFX are dropped rather than replayed out of sync. Rebuild and test online, offline after successful loading, mute, background/resume, rapid restart, low-end Android and iOS. Browser codec support and final-asset memory remain delivery acceptance checks.

## External music-generation briefs (no music-generation tool in this Codex environment)

The catalog's five music entries remain empty until original music is generated externally. Supply five mastered stereo MP3 files under `public/assets/audio/music/`, then add each `file`, `loopStart`, and `loopEnd` in `public/assets/audio/catalog.json`. Keep every track under 180 seconds and 24 MiB, 44.1/48 kHz, about -18 LUFS integrated with true peak at or below -1 dBTP. Export clean seamless loop boundaries without a baked fade; listen to the encoded MP3 loop because padding can shift it. These prompts call for original compositions and must not imitate any named anime, game, composer, or copyrighted soundtrack.

- **Menu / monster selection — `menu`:** Original 96-second seamless loop, 108-116 BPM, 4/4. A dark medieval monster festival preparing for battle: plucked hammered dulcimer motif, low bowed strings, small frame-drum and taiko-like pulse, restrained horn responses, distant nonverbal choir. Confident and expectant from the monsters' perspective, not mournful. Keep the bass and percussion light enough for UI navigation; close on the opening harmony and downbeat. Leave a 1.2-second crossfade-friendly steady groove at the boundary.
- **Early combat — `combat`:** Original 112-second seamless loop, 142-150 BPM, 4/4. Heroic-villain isekai anime battle drive: aggressive string ostinato, low brass calls, punchy taiko-like drums, nimble fantasy-folk plucks, a memorable original rising theme. Celebratory menace and forward motion, moderate density with transient space for combat SFX. End on the same harmonic pulse and rhythmic grid as the first bar; match menu's tonal center for the unsynchronized 1.2-second transition.
- **High Carnage — `escalation`:** Original 104-second seamless loop, 158-166 BPM, 4/4. The combat theme intensifies into a triumphant horde massacre: faster strings, distorted modern percussion tucked beneath cinematic drums, brass accents, ritual choir syllables without words, brief unstable magical texture. Dense and exhilarating, never tragic. Keep the same tonal center and a compatible four-on-the-floor emphasis so a 1.2-second crossfade from combat is coherent; exact opening and closing downbeats must match.
- **Titan / extreme threat — `titan`:** Original 96-second seamless loop, 126-134 BPM, 4/4 or clear half-time 252-268 pulse. Colossal threat with monstrous confidence: sub brass, massive but controlled drums, low choir clusters, stressed strings, ominous bell strikes, short heroic counter-melody. Extreme weight without drowning warning sounds. Retain the common tonal center and pulse subdivisions for immediate crossfades from combat or escalation; match loop endpoints exactly.
- **Results — `results`:** Original 48-second seamless loop, 100-108 BPM, 4/4. A brief prestige revelation after violent glory: dark fantasy brass resolution, delicate hammered metal and plucks, restrained choir, confident festival motif recalled from menu. Reflective yet victorious, suitable whether the player retired or died. Enter directly without a long intro, settle into a quiet repeating tail, and match the opening harmony at the loop boundary. Compatible with a 1.2-second crossfade from any combat state and back to menu.

The engine already selects menu after interaction, combat on run start, escalation at Carnage >=4 or 300 seconds, Titan while a Titan is alive, results when the run ends, and menu on return. Tracks loop through AudioBufferSourceNode, crossfade over 1.2 seconds, and follow persisted master/music sliders and mute. `tests/audio-browser.mjs` uses synthetic test buffers to verify state changes, looping, crossfades, voice limits, pause/resume, and volume persistence. It does not constitute a listening test of final music.
