import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
for(const [width,height] of [[1440,900],[844,390]]){
 const page=await browser.newPage({viewport:{width,height}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4173/');
 const result=await page.evaluate(async()=>{
  const [{Game},{Renderer}]=await Promise.all([import('./src/simulation.js'),import('./src/renderer.js')]);
  const canvas=document.createElement('canvas');document.body.append(canvas);canvas.style.position="fixed";canvas.style.inset="0";canvas.style.zIndex="100";const renderer=new Renderer(canvas);
  const kinds=['thrall','hound','spitter','wing','brute','elite','titan'];
  const game=new Game(27,{monsterId:'sovereign'});
  for(const [i,kind] of kinds.entries()){game.spawn(kind);const enemy=game.enemies.find(enemy=>enemy.active&&enemy.serial===game.serial);enemy.x=(i-3)*110;enemy.y=i%2?65:-65;}
  await new Promise(resolve=>setTimeout(resolve,800));renderer.draw(game,2);
  return kinds.map(kind=>({kind,loaded:renderer.sprites.get(kind) instanceof HTMLImageElement,naturalWidth:renderer.sprites.get(kind)?.naturalWidth||0}));
 });
 assert.ok(result.every(item=>item.loaded&&item.naturalWidth>=160),JSON.stringify(result));assert.deepEqual(errors,[]);
 await page.locator('canvas').last().screenshot({path:'test-results/enemy-art-'+width+'.png'});
 console.log(width+'x'+height+' enemy sprites loaded and rendered',result.map(item=>item.kind).join(','));await page.close();
}
await browser.close();
