import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const sharp=createRequire(import.meta.url)('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
await mkdir('art-source/stage3/sectors',{recursive:true});
for(let row=0;row<3;row++)for(let col=0;col<3;col++){
 const paths=[col>0?'M 0 768 L 768 768':'',col<2?'M 768 768 L 1536 768':'',row>0?'M 768 0 L 768 768':'',row<2?'M 768 768 L 768 1536':''].filter(Boolean);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1536"><rect width="1536" height="1536" fill="#101018"/>${paths.map(d=>`<path d="${d}" fill="none" stroke="#aaa4b7" stroke-width="300"/>`).join('')}<circle cx="768" cy="768" r="${col===1&&row===1?540:330}" fill="#aaa4b7"/>${col!==1||row!==1?'<rect x="718" y="378" width="100" height="65" fill="#6f6179"/>':''}</svg>`;
 await sharp(Buffer.from(svg)).png().toFile(`art-source/stage3/sectors/layout-${col}-${row}.png`);
}
await writeFile('art-source/stage3/sectors/README.md','Authoring layout references only; never shipped. Gray shows walkable floor, dark shows chasms/walls. All shipped terrain is generated illustrated sector artwork.\n');
