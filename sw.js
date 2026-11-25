/* Service Worker: caché de la app para uso sin conexión */
const CACHE='oasis-v5';
const FILES=[
  './','./index.html','./admin.html','./vehiculo.html','./login.html',
  './mis-vehiculos.html','./atencion.html','./reserva.html','./cookies.html',
  './privacidad.html','./terminos.html','./404.html',
  './css/style.min.css','./css/responsive.min.css','./css/animations.min.css',
  './js/main.min.js','./js/catalog.min.js','./js/editor.min.js','./js/paypal.min.js',
  './js/whatsapp.min.js','./js/auth.min.js','./js/admin.min.js','./js/admin-panel.min.js',
  './js/master.min.js','./js/vehiculo.min.js','./js/login.min.js','./js/mis-vehiculos.min.js',
  './js/atencion.min.js','./js/reserva.min.js','./js/cookies.min.js','./js/i18n.min.js',
  './js/install.min.js','./js/lite.min.js',
  './img/logo.svg','./img/hero.webp','./img/fondo-elegante.webp','./img/owner.webp',
  './img/sin-foto.webp','./img/menu.svg','./img/close.svg','./img/lock.svg',
  './img/user.svg','./img/check.svg','./img/support.svg','./img/whatsapp.svg',
  './img/whatsapp-outline.svg','./img/download.svg','./img/paypal.svg'
];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin) return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(res=>{
      const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c));
      return res;
    }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    const network=fetch(e.request).then(res=>{
      const c=res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c));
      return res;
    }).catch(()=>cached);
    return cached||network;
  }));
});
