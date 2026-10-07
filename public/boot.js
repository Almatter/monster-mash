// Refresh the worker before loading the module graph on a fresh page visit.
// Otherwise an older worker can pin old renderer modules while a player starts
// a new match, making the safe in-match update deferral last that entire run.
(async()=>{
 const entry=document.currentScript.dataset.main;
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
 const script=document.createElement('script');script.type='module';script.src=entry;document.body.append(script);
})();
