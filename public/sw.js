// Bump this version with every deployment. Waiting workers activate when old tabs close.
const CACHE='monster-mash-static-v1';
const ASSETS=['./','index.html','style.css','icon.svg','manifest.webmanifest','verify.html','src/main.js','src/data.js','src/simulation.js','src/renderer.js','src/scoring.js','src/audio.js','src/run-code.js','src/verify.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('monster-mash-static-')&&key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));});

