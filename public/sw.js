// The build replaces this marker with a digest of every shipped runtime file.
const CACHE='monster-mash-static-__BUILD_HASH__';
const ASSETS=['./','index.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})))).catch(()=>{})));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil((async()=>{try{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('monster-mash-static-')&&key!==CACHE).map(key=>caches.delete(key)));const cache=await caches.open(CACHE);if(!await cache.match(new URL('src/main.js',self.registration.scope).href))await cache.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})));}catch{}await self.clients.claim();})()));
const SCOPE=new URL(self.registration.scope);
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;event.respondWith((async()=>{
 let cache,hit;try{cache=await caches.open(CACHE);hit=await cache.match(event.request)??await cache.match(url.pathname,{ignoreSearch:true});}catch{}
 // A running build keeps its modules together until the menu safely activates an update.
 const path=url.pathname.slice(SCOPE.pathname.length);
 // Reuse immutable artwork for this build instead of revalidating and rewriting
 // every terrain tile when its decoded image leaves the small in-memory cache.
 if(hit&&url.searchParams.get('v')===CACHE.slice('monster-mash-static-'.length)&&path.startsWith('assets/'))return hit;
 if(hit&&!url.search&&ASSETS.includes(path)&&path.startsWith('src/'))return hit;
 try{const response=await fetch(event.request,{cache:'no-cache'});if(response.ok){if(cache)try{await cache.put(event.request,response.clone());}catch{}return response;}if(hit)return hit;return response;}catch(error){if(hit)return hit;throw error;}
})());});
