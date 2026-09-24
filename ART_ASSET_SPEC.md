## Shipped production art (September 2026)

All five playable characters now have original distinct-anatomy selection key art, portraits, cut-ins and gameplay sheets. Sovereign is the armored horned incarnation; Titan is a broad basalt beast; Devourer is a lean ivory predator; Calamity is a floating many-armed rune caster; Overlord is a skeletal ossuary commander with coffin wings. Each set has neutral base and four grayscale shaded tint layers. The public catalog points to 100 lossless WebP files (18.2 MiB total), and source masters remain under `art-source/`. `tools/process-*-art.mjs` regenerates layers from those masters; `tools/pack-character-art.mjs --prune-png` losslessly repacks them. Sharp is needed only for regeneration.

The runtime also loads seven original compressed enemy sprites from `public/assets/enemies/` and a subdued medieval floor tile from `public/assets/arena/`; code-native graphics remain safe loading fallbacks. Enemy sprites are static with subtle bob/telegraph effects, not multi-frame attack atlases. The seven-asset group and all five playable sets have been checked in desktop and mobile browser scenes. Four extreme palette combinations were checked per playable monster. The 5-row player sheets derive motion states from one painted gameplay view per character, so expressive frame-by-frame acting remains a future polish opportunity.
# Monster Mash — production art delivery contract

Create original modern isekai anime dark fantasy designs: cel shading, expressive dangerous faces, medieval costumes, memorable monstrous silhouettes and dramatic supernatural power. Do not copy a particular anime character, outfit, logo or UI. Keep horde enemies substantially simpler than the player. The current procedural renderer remains a supported fallback; do not supply placeholder illustrations.

## Supported runtime pipeline

`public/assets/catalog.json` maps monster IDs to optional `gameplay`, `portrait`, `selection` and `cutin` layer sets. An absent set uses existing code-native presentation. Each set contains `base`, `primary`, `secondary`, `accent`, `power` file paths beginning with `assets/`. Missing/broken supplied art fails back safely.

Example structure (the shipped catalog now contains all five playable monster entries):

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

## Enemy, arena and other deliveries

The player layer catalog, seven enemy WebP sprites, procedural enemy fallback, low-contrast arena tile and twenty code-native SVG skill icons are now integrated. The table below specifies optional future animation and icon-master upgrades; its atlas sizes are not a claim that these additional animations are already shipped.

| Asset | Delivery | View / states / anchor |
|---|---|---|
| Common `thrall`, `hound`, `spitter`, `wing` | 64×64 frames; 4 idle/move frames, 3 attack frames; one small atlas | Same overhead angle; contact (32,40); flat strong silhouettes; no tint masks required |
| Heavy `brute`, elite `elite` | 128×128 frames; 4 move, 4 attack, 2 hurt | Contact (64,80), visible armor/crown distinction, stronger contrast |
| Titan enemy `titan` | 256×256 frames; 6 move, 6 slam windup, 6 slam, 2 hurt | Contact (128,160); silhouette independent of enemy telegraph |
| Arena floor | Seamless 512×512 stone/earth tile, low contrast, opaque | Overhead; no baked enemies, gore, UI, light flashes or perspective horizon |
| Props | 128×256 transparent atlas cells | Anchor bottom center; decorative only; keep navigable areas readable |
| Achievement/title/rank icons | Original 128×128 transparent PNG/WebP; 16px inner safe margin | Clear grayscale/gold silhouette at 32px, no text; stable achievement IDs as names |
| Optional beam/vortex/impact effects | 256×256 RGBA grayscale sheets, 6–8 frames; beams may be 512×128 | Center origin; tint by power color; additive-looking highlights on transparent black-free alpha |

Current procedural ability effects are reusable final fallbacks, so external VFX are optional. Record/title icon masters and frame-by-frame enemy acting remain later polish.

## Delivery checklist

Add files under `public/assets/monsters/<id>/`, update only the corresponding catalog entry, run `node tools/build.mjs`, then inspect default plus ivory, cobalt and crimson palettes in preview and gameplay. Check transparency against dark stone, movement origin, four tint channels, hostile readability and mobile memory. New files under assets are cached after a successful load; bump the service-worker cache version for public releases (and the rules version only for gameplay/scoring changes) and test offline replay. Keep original layered source files outside the web payload.

## v3 enforced contract and validation workflow

The loader now enforces exact dimensions **before compositing**: gameplay 1536x1280, portrait 512x512, selection 768x1024, cutin 1024x512. Every layer must match its base. No texture exceeds 2048 pixels on either axis. Keep unused atlas cells transparent. This engine loads only the presentation set needed by the current screen and caches composited Canvas sprite sheets; it does not require a skeletal runtime or shrink presentation key art into gameplay.

Presentation crop safety:
- Selection: keep face/torso within x=96..672 and y=80..880; preserve at least 40px outer transparency. Contain-fit preview does not crop, but these margins protect future tighter layouts.
- Portrait: face in central 384x384 region, avoid horns/eyes on edges. Portrait is used by the results panel, downloaded result card, and current-incarnation Records view.
- Cut-in: reserve the top 40% for the separate name/ability overlay; keep the focal face toward x=300..850, y=240..460. Transparent margins around limbs/hair. One illustration fades into the existing 0.85s cut-in; no video, embedded lettering, or additional animation atlas.

The contact hitbox is a **23-world-unit circle**, fixed independently of visual scale. Frame contact origin (128,160) maps exactly to player (x,y); default drawn size is 128x128 times visual.scale. At scale 1, screen placement is (x-64,y-80). Do not enlarge the hitbox when drawing large horns, capes or magic. Enemy warning circles remain red and projectiles hostile pink regardless of player palette.

Do not bake a ground shadow into the atlas: runtime draws an inexpensive ellipse below the imported sprite. Keep local cel shading in grayscale tint layers and neutral facial shading/linework in base. Base is composited last, so opaque armor in base would hide its tint layer. Four regions are supported today; an extra channel requires an intentional schema/UI change, not an unrecognized extra filename. Selected power color also feeds procedural beams, spell rings, bolts, servant markings and corruption.

A complete composited set retains about 13.5 MiB of RGBA pixels; four cached palettes retain about 54 MiB, excluding decoded source images, Canvas backing stores and transient tint canvases. At most two packs load simultaneously. Keep individual compressed layers below 16 MiB for the validator and prefer much smaller files. Imported full-roster/device memory must still be measured with actual deliveries. Do not include PSD/Krita masters in public/.

### Test one real set

1. Put catalog.json and a single intended monster set under an assets folder, matching the relative paths above.
2. Build/run the project and open http://127.0.0.1:4173/art-lab.html directly. This page is intentionally absent from player navigation.
3. Choose the assets folder itself. Nothing uploads; files are read through local File objects and object URLs are revoked after decoding.
4. Select the monster, cycle all five states, test all four color inputs, scale 0.5-3, light/dark backgrounds, and origin/hitbox guides. The preview shows gameplay, selection, portrait and cut-in separately.
5. Check that face/skin/line art stay unchanged while shaded clothing responds; inspect transparent fringes, feet drift, silhouette, glow and hostile telegraph readability.
6. Copy accepted files into public/assets/, update the catalog, rebuild, then play on desktop and a real phone. Inspect selection, results/card, Records and ultimate cut-in. Test cold load and offline reload.

The tool rejects missing files, misregistered dimensions, unsupported file extensions and oversized files. It cannot judge anatomy, frame continuity, mask overlap, clean linework, lossless encoding or artistic readability automatically. Automated tests use diagnostic pixels to verify alpha, shading, neutral base preservation and folder import; they do not represent a delivered final character.
