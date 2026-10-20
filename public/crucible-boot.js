// Pin the entire module graph before its first import, including under an older worker.
const version=new URL(import.meta.url).searchParams.get('v')||'';
const modules=/*__MODULES__*/[];
const map=document.createElement('script');map.type='importmap';
map.textContent=JSON.stringify({imports:Object.fromEntries(modules.map(path=>[new URL(path,document.baseURI).href,new URL(path+'?v='+version,document.baseURI).href]))});
document.head.append(map);
const entry=document.body.dataset.crucible==='player'?'./src/crucible-player.js':'./src/crucible-prototype.js';
import(entry+'?v='+version).catch(error=>{
 document.getElementById('loadStatus').textContent='The battlefield could not start: '+error.message;
 const retry=document.createElement('button');retry.textContent='Retry loading';retry.onclick=()=>location.reload();document.getElementById('loading').append(retry);
});
