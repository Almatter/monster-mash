// The build replaces this marker with a digest of every shipped runtime file.
const CACHE='monster-mash-static-__BUILD_HASH__';
const ASSETS=['./','index.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'}))))));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('monster-mash-static-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
const SCOPE=new URL(self.registration.scope);
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;event.respondWith((async()=>{const cache=await caches.open(CACHE),hit=await cache.match(event.request);if(hit)return hit;const response=await fetch(event.request,{cache:'no-cache'});if(response.ok&&(url.pathname.includes('/assets/')||event.request.mode==='navigate'))await cache.put(event.request,response.clone());return response;})());});
