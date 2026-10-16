# Unmasked flight — October 16, 2026

Generated with the built-in image generation tool. Reference: `gameplay-master.png`, the approved Hag pose sheet. Runtime packing: `tools/process-hag-art.mjs`. Both source images are 2172 × 724 pixels with transparent alpha. Four flight poses occupy the unused final four cells of the gameplay atlas's hurt row; the atlas remains 1536 × 1280.

## Sprite prompt

Use case: stylized-concept. Production game sprite sheet, FOUR animation frames in a single horizontal strip, transparent background, no text, no panels, no ground or scenery. Reference image is the approved Monster Mash Hag identity: use the monstrous TRUE HAG shown bottom right, not the beautiful woman. Create her missing flying animation: gray wrinkled fae skin, long hooked nose and sharp teeth, wild black-gray hair, copper ring-decorated pointed burgundy witch hat, ragged burgundy dress train with copper circle fasteners, long copper ring engraved staff tipped with a green venom orb. She straddles that staff in flight, crouched knees and clawed hands, full side/three-quarter view FACING RIGHT, dress and hair trail left. Four clearly separated equal square cells across the image; same character, same scale and position in each cell; subtle loop progression of banking/body lean, hat and train flutter. Entire staff, hat and train fit INSIDE each cell with generous transparent margins. Clean sharp ink silhouettes and painterly shading matching the reference. True hag must remain visibly monstrous in all four frames. No beautiful glamour form. No glow cloud around the character, no trail effects, no labels, no checkerboard printed into the image. Actual transparent alpha.

Saved: `unmasked-flight-master.png`. Original generation: `exec-54ce8123-ce3c-4c62-bcfd-873eda55e6db.png`.

## Material-guide prompt

Edit target: this four-frame transparent monster witch flight animation strip. Create an AUTHORING MATERIAL ID GUIDE with EXACTLY the same four silhouettes, pixel layout, positions, staff shapes, proportions, transparency and canvas aspect ratio. No artistic changes or pose shifts. Replace all burgundy dress fabric and witch hat with solid pure RED (#ff0000); all hair with pure GREEN (#00ff00); all copper/gold staff, rings, jewelry and fasteners with pure BLUE (#0000ff); venom orb/eyes/magic with pure MAGENTA (#ff00ff); all gray skin including face, ears, arms, fingers, legs and feet with pure CYAN (#00ffff). Flat solid fills, keep black outline ink between regions, no lighting or gradients or brown background. This is a precise recoloring mask guide, not a new character design. Preserve true transparent alpha outside every silhouette. Four frames in same places.

Saved: `unmasked-flight-color-guide.png`. Original generation: `exec-1b1ec8b4-5b03-4905-ab59-8e04833533fa.png`.

Source alpha clips the final material masks. Runtime files are `public/assets/monsters/hag/gameplay-{base,primary,secondary,accent,power,skin}.webp`. Browser-facing inspection: `test-results/hag-facing-contact-sheet.png`.
