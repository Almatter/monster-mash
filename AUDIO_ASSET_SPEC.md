# Monster Mash audio delivery contract

The runtime is ready for owned or commissioned audio. No music masters or physical recordings are bundled. The empty public/assets/audio/catalog.json is intentional. Original synthesized cues now cover every runtime sound hook; commissioned or owned clips can replace them through the catalog. Do not copy a named soundtrack or download unlicensed clips.

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

The bundled procedural synthesizer uses short tonal, filtered-noise, impact, rumble, horn and chime designs for all semantic hooks, including physical attacks/deaths. Two deterministic variants per cue, playback-rate variation, priority caps and throttling limit repetition and mass-kill overload. Catalog files override synthesized cues. These original cues are functional production-intent feedback; a custom recorded/sampled SFX master pass and finished music score would improve the final mix.

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
