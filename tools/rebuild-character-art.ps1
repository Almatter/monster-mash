$ErrorActionPreference='Stop'
foreach ($name in @('sovereign','titan','devourer','calamity','overlord')) { node (Join-Path 'tools' ('process-'+$name+'-art.mjs')); if ($LASTEXITCODE -ne 0) { throw "Art generation failed: $name" } }
node tools/pack-character-art.mjs --prune-png
if ($LASTEXITCODE -ne 0) { throw 'WebP packing failed' }
node tools/sanitize-character-masks.mjs
if ($LASTEXITCODE -ne 0) { throw 'Mask sanitization failed' }
$root=(Resolve-Path -LiteralPath 'public/assets/monsters').Path
Get-ChildItem -LiteralPath $root -Recurse -Filter '*.tmp.webp' -File | ForEach-Object {
 $target=$_.FullName.Substring(0,$_.FullName.Length-9)
 if (-not $target.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unexpected mask destination' }
 Copy-Item -LiteralPath $_.FullName -Destination $target -Force
 Remove-Item -LiteralPath $_.FullName
}
node tools/validate-masks.mjs
if ($LASTEXITCODE -ne 0) { throw 'Mask validation failed' }
