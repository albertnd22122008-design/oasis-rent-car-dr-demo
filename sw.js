/* Service Worker mínimo: cache de la app para uso sin conexión */
const CACHE='oasis-v1';
const FILES=[
  './','./index.html','./admin.html','./vehiculo.html','./login.html',
  './mis-vehiculos.html','./atencion.html','./reserva.html',
  './css/style.css','./css/responsive.css','./css/animations.css',
  './js/main.js','./js/catalog.js','./js/editor.js','./js/paypal.js',
  './js/whatsapp.js','./js/auth.js','./js/admin.js','./js/vehiculo.js',
  './js/login.js','./js/mis-vehiculos.js','./js/atencion.js','./js/reserva.js','./js/install.js',
  './img/logo.png','./img/hero.jpg'
];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return res; }).catch(()=>caches.match('./index.html'))));
});
