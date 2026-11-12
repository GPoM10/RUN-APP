/* Service worker del comparador: guarda la app para abrirla sin internet y la actualiza sola cuando hay versión nueva. */
const V='rodajes-v522', SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  // clima y APIs: siempre a la red
  if(/coros\.com|tile\.openstreetmap\.org|open-meteo\.com|googleapis\.com\/(drive|upload)|accounts\.google\.com/.test(u.host+u.pathname)) return;
  if(u.origin===location.origin){ // la app: red primero (así una versión nueva llega sola), caché si no hay internet
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));return}
  // Chart.js y fuentes: caché primero, se refresca en segundo plano
  e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp))} return res}).catch(()=>m); return m||net}))});
