$ErrorActionPreference='Stop'
node tools/pack-vfx.mjs
if ($LASTEXITCODE -ne 0) { throw 'VFX packing failed' }
$root=(Resolve-Path -LiteralPath 'public/assets').Path
foreach ($path in @('vfx/sovereign','vfx/titan','vfx/devourer','vfx/calamity','vfx/overlord','vfx/hostile-bolt','vfx/hostile-elite','vfx/hostile-titan','arena/brazier')) {
 $target=Join-Path $root ($path+'.webp');$prepared=Join-Path $root ($path+'.packed.webp')
 if (-not $target.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unexpected VFX destination' }
 Copy-Item -LiteralPath $prepared -Destination $target -Force
 Remove-Item -LiteralPath $prepared
}
