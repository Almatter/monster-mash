import { readdir, readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
await mkdir('dist/src', { recursive: true });
for (const name of await readdir('src')) {
  if (!name.endsWith('.ts')) continue;
  const source = await readFile(`src/${name}`, 'utf8');
  const js = stripTypeScriptTypes(source, { mode: 'strip' }).replaceAll(/from '(\.\/[^']+)\.ts'/g, "from '$1.js'");
  await writeFile(`dist/src/${name.replace('.ts', '.js')}`, js);
}
for (const name of await readdir('public')) await copyFile(`public/${name}`, `dist/${name}`);
console.log('Production build ready in dist/ (no runtime dependencies).');
