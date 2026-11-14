'use strict';
const CACHE_PREFIX='meihua-shell-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=CACHE_PREFIX+'de0f7cdff7d6fbc5';
const ROOT=self.registration.scope;
const SHELL=["index.html","manifest.webmanifest","pwa.js","assets/icon-180.png","assets/icon-192.png","assets/icon-512.png","assets/icon-1024.png","assets/startup-art.png"];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.all(SHELL.map(async file=>{const url=new URL(file,ROOT).href;const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Cannot cache '+file);await cache.put(url,response);}));})());});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(CACHE_PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==new URL(ROOT).origin)return;
 const root=new URL(ROOT),path=url.pathname;
 const navigation=request.mode==='navigate'&&(path===root.pathname||path===root.pathname+'index.html');
 const resource=SHELL.some(file=>path===new URL(file,ROOT).pathname);
 if(!navigation&&!resource)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const key=navigation?new URL('index.html',ROOT).href:url.origin+url.pathname;return await cache.match(key)||fetch(request);})());
});
