// Refresh the worker before loading the module graph on a fresh page visit.
// Otherwise an older worker can pin old renderer modules while a player starts
// a new match, making the safe in-match update deferral last that entire run.
(async()=>{
 const boot=document.currentScript,entry=boot.dataset.main,build=boot.dataset.build;
 const modules=/*__MODULES__*/[];
 // Keep every import, including deferred imports, on this page's build even
 // when an older worker is still installing its replacement.
 if(build&&modules.length){const imports={};for(const path of modules){const url=new URL(path,document.baseURI);imports[url.href]=url.href+'?v='+build;}const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports});document.head.append(map);}
 let timer;
 try{
  await Promise.race([(async()=>{if('serviceWorker' in navigator){
   const root=new URL('./',document.baseURI),registration=await navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.href,updateViaCache:'none'});
   await registration.update();
   const installing=registration.installing;
   if(installing)await new Promise(resolve=>{const done=()=>{if(['installed','activated','redundant'].includes(installing.state)){installing.removeEventListener('statechange',done);resolve();}};installing.addEventListener('statechange',done);done();});
   if(registration.waiting)await new Promise(resolve=>{const done=()=>{navigator.serviceWorker.removeEventListener('controllerchange',done);resolve();};navigator.serviceWorker.addEventListener('controllerchange',done);registration.waiting.postMessage({type:'SKIP_WAITING'});});
  }})(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Update check timed out')),12000);})]);
 }catch{/* Offline/storage-restricted browsers can still load the cached game. */}
 clearTimeout(timer);
 const script=document.createElement('script');script.type='module';script.src=entry+(build?'?v='+build:'');document.body.append(script);
})();
