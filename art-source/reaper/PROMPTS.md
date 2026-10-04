# Reaper production art

Mode: built-in image generation and image editing. All final art has a transparent background. The user's icy gothic scythe concept supplied the style reference; the production character is an adult demon woman with two long high twin tails.

Prompt briefs:

- **selection-master.png:** Whole adult female monster champion, medieval fantasy isekai anime, distinctive long twin tails, small demon horns, ornate enormous scythe, dark armor, flowing purple hair and mantle, gold metal ornament, luminous cyan soul energy. Fine continuous ink outlines and shaded materials, complete silhouette, no text, no scene, transparent background.
- **gameplay-master.png:** Same registered character and scythe in six distinct full-body poses on a three-column, two-row sheet: idle, running, attacking, recoil, ultimate and blink slash. Preserve the adult face, two high ponytails, outfit, palette and weapon proportions. Transparent cells, no labels or floor. A transparency edit removed the surrounding scene pixels.
- **selection-color-guide.png / gameplay-color-guide.png:** Edit the respective master into a geometrically registered material guide. Pure blue armor and dark scythe body; magenta hair and flowing cloth; yellow metal ornament; red eyes and magical energy; black skin and ink. Continuous, sharp material boundaries. Preserve silhouette, pose positions, canvas dimensions and transparency.
- **reaper-wave.png:** Single ornate anime scythe energy crescent moving right, trail to the left, cyan soul flame and luminous fine ink detail, isolated transparent combat effect, no character or text.
- **reaper-sweep.png:** Broad sweeping circular scythe arc, luminous cyan spectral flame, medieval gothic ornament, hollow center and transparent background.
- **reaper-blink.png:** Vertical magical scythe portal and arrival slash, spectral cyan soul energy, sharp anime fantasy detail, transparent background.
- **reaper-volley.png:** Three piercing scythe crescents moving right, distinct coherent cyan flame trails, transparent background.
- **reaper-eclipse.png:** Elaborate swirling eclipse of spectral scythe energy, hollow center, cyan anime soul flame, transparent ultimate aura, no character or labels.
- **reaper-unbound.png:** Intricate circular gothic moon-and-scythe unbinding aura, hollow center, cyan energy and sharp ornament, transparent background.
- **reaper-siphon.png:** Spectral soul-harvest aura, wisps and ghostly soul ornament, hollow center, coherent cyan anime fantasy style, transparent background.

`tools/process-reaper-art.mjs` packs these real source images into four registered presentation sets and a five-state gameplay atlas. Every presentation includes shaded primary, secondary, accent and power masks. The gameplay sheet keeps the principal silhouette in each pose cell, then builds breathing, running, attack, hurt and ultimate frame sequences. Runtime effects are packed to 512 pixels and tinted to the selected soul-energy color.

Outputs: `public/assets/monsters/reaper/` (20 WebP layers), `public/assets/vfx/reaper*.webp` (seven effects and the basic-attack alias). Source masters and color guides are not included in the Pages artifact.
