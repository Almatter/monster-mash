# Monster Mash — final art delivery contract

Create original modern isekai anime dark fantasy designs: cel shading, expressive dangerous faces, medieval costumes, memorable monstrous silhouettes and dramatic supernatural power. Do not copy a particular anime character, outfit, logo or UI. Keep horde enemies substantially simpler than the player. The current procedural renderer remains a supported fallback; do not supply placeholder illustrations.

## Supported runtime pipeline

`public/assets/catalog.json` maps monster IDs to optional `gameplay`, `portrait`, `selection` and `cutin` layer sets. An absent set uses existing code-native presentation. Each set contains `base`, `primary`, `secondary`, `accent`, `power` file paths beginning with `assets/`. Missing/broken supplied art fails back safely.

Example structure (paths describe required future deliveries, not existing artwork):

```json
{
  "titan": {
    "gameplay": {
      "base": "assets/monsters/titan/gameplay-base.png",
      "primary": "assets/monsters/titan/gameplay-primary.png",
      "secondary": "assets/monsters/titan/gameplay-secondary.png",
      "accent": "assets/monsters/titan/gameplay-accent.png",
      "power": "assets/monsters/titan/gameplay-power.png"
    },
    "selection": {
      "base": "assets/monsters/titan/selection-base.webp",
      "primary": "assets/monsters/titan/selection-primary.webp",
      "secondary": "assets/monsters/titan/selection-secondary.webp",
      "accent": "assets/monsters/titan/selection-accent.webp",
      "power": "assets/monsters/titan/selection-power.webp"
    }
  }
}
```

Use the same five-file pattern for portrait and cutin. PNG or **lossless** WebP with RGBA transparency. All layers in a set must have exactly the same canvas dimensions and registration. Export sRGB. No baked background. No global hue-shift recoloring.

## Tint layers — exact composition

Each tint file is a grayscale **shaded region with alpha**, not a flat solid mask. White receives the selected color at full brightness; gray provides cel-shaded shadows. Transparent pixels are unaffected. Draw no other color regions in that file. Keep region alpha edges aligned; avoid overlapping opaque regions. Tint files are multiplied by the selected color, alpha-restored, and composited in primary → secondary → accent → power order. `base` is drawn **last**, containing neutral details, faces where untinted, black line work, specular highlights and outlines. Keep tinted regions transparent in base or you will cover the selected color. Soft power glow may extend beyond the silhouette but must fit the frame.

The client composites once on load or palette change, never each frame. Four recent palette packs are retained. Prefer gameplay atlases under 2048 pixels per edge; keep the entire roster's compressed payload modest. A palette must never affect collision radii, damage, stats or scoring. Hostile projectiles remain violet/pink and hostile warning circles remain red regardless of selected colors.

## Gameplay sprites — all five supported packages

Camera: fixed three-quarter overhead, facing toward the viewer with readable shoulders/head and feet. No perspective changes between frames. One direction is enough initially; player aim is represented by attacks. Contact origin is frame pixel **(128,160)** on a 256×256 frame. Keep important art inside a 224×232 safe area; long horns may use the top margin. Each atlas is **1536×1280** (six columns × five rows), transparent, with unused cells transparent.

| Row | State | Frames | Runtime FPS | Notes |
|---|---|---|---|---|
| 0 | idle | 4 | 6 | Breathing/aura, looping |
| 1 | move | 6 | 10 | Grounded locomotion, looping |
| 2 | attack | 6 | 14 | Cleave, bite or casting gesture |
| 3 | hurt | 2 | 10 | Brief readable reaction |
| 4 | ultimate | 6 | 12 | Signature finishing pose |

Animation metadata is in `visual()` in `src/content-monsters.ts`; change it when deliberately delivering another layout. Gameplay display defaults to 128×128 world units scaled by the monster definition. Art should communicate size; do not infer a hitbox from transparent pixels.

| ID | Character direction | Primary | Secondary | Accent | Power |
|---|---|---|---|---|---|
| `titan` | Massive armored ancient beast, heavy horns and physical weight | Armor/body plates | Under-armor and mantle | Bone/horn/trim | Eyes, impact fissures |
| `devourer` | Lean apex predator, expressive fangs, swift posture | Body/fur/scales | Markings and mane | Claws, ornate bone | Eyes, hunger aura |
| `calamity` | Monstrous anime archmage, dangerous composed face, ceremonial silhouette | Robes/armor | Cloak/inner fabric | Seals, jewelry, trim | Eyes, runes, magic |
| `overlord` | Original demon sovereign, regal face and crown, commanding pose | Royal armor/robes | Cape/underlayers | Crown and trim | Eyes, control sigils |
| `sovereign` | Preserve the original horned all-round destroyer as a legacy choice | Body/armor | Mantle | Horns and claws | Core and eyes |

The individual player's chosen name and title are rendered by UI, never baked into artwork. Do not bake an archetype/default name into a portrait.

## Portrait, selection and cut-in

- Portrait: 512×512, face/shoulders, centered, transparent; five registered color layers. Runtime prefers selection art, then portrait, then gameplay/fallback for the registry preview.
- Selection key art: 768×1024, full/three-quarter figure, centered at x=384; feet near y=930, horns below y=40. Use the same color channels. Preview fits without distortion.
- Ultimate cut-in: 1024×512, upper body/action expression, transparent; important face within central 70%. Fast overlay lasts about 0.85 seconds. Name and signature ability are separate text. No cutscene frames needed.
- Keep small versions legible. Clean silhouettes matter more than fine fabric detail. All three image types may be delivered independently.

## Other deliveries and current integration boundary

These are art specifications for later content; the current drop-in catalog directly supports **player** layers only. Enemy/icon/background atlas rendering needs its small respective renderer adapter when those deliveries arrive; do not expect an unused filename alone to replace them.

| Asset | Delivery | View / states / anchor |
|---|---|---|
| Common `thrall`, `hound`, `spitter`, `wing` | 64×64 frames; 4 idle/move frames, 3 attack frames; one small atlas | Same overhead angle; contact (32,40); flat strong silhouettes; no tint masks required |
| Heavy `brute`, elite `elite` | 128×128 frames; 4 move, 4 attack, 2 hurt | Contact (64,80), visible armor/crown distinction, stronger contrast |
| Titan enemy `titan` | 256×256 frames; 6 move, 6 slam windup, 6 slam, 2 hurt | Contact (128,160); silhouette independent of enemy telegraph |
| Arena floor | Seamless 512×512 stone/earth tile, low contrast, opaque | Overhead; no baked enemies, gore, UI, light flashes or perspective horizon |
| Props | 128×256 transparent atlas cells | Anchor bottom center; decorative only; keep navigable areas readable |
| Achievement/title/rank icons | Original 128×128 transparent PNG/WebP; 16px inner safe margin | Clear grayscale/gold silhouette at 32px, no text; stable achievement IDs as names |
| Optional beam/vortex/impact effects | 256×256 RGBA grayscale sheets, 6–8 frames; beams may be 512×128 | Center origin; tint by power color; additive-looking highlights on transparent black-free alpha |

Current procedural ability effects are reusable final fallbacks, so external VFX are optional. No throwaway replacements are required. Prioritize player monsters → portraits/cut-ins → enemy Titans → elites → records/title icons → common horde → environment.

## Delivery checklist

Add files under `public/assets/monsters/<id>/`, update only the corresponding catalog entry, run `node tools/build.mjs`, then inspect default plus ivory, cobalt and crimson palettes in preview and gameplay. Check transparency against dark stone, movement origin, four tint channels, hostile readability and mobile memory. New files under assets are cached after a successful load; bump the service-worker/rules version for public releases and test offline replay. Keep original layered source files outside the web payload.
