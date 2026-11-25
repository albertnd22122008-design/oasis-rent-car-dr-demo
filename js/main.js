/* ============================================================
   MAIN — lógica principal: buscador, filtros, catálogo, modales,
   reveal on scroll, parallax y cursor personalizado.
   ============================================================ */
(function(){
  'use strict';

  const E = window.OasisEditor;
  const PHOTOS = [
    'img/carros/carro-01.webp','img/carros/carro-02.webp','img/carros/carro-03.webp','img/carros/carro-04.webp',
    'img/carros/carro-05.webp','img/carros/carro-06.webp','img/carros/carro-07.webp','img/carros/carro-08.webp'
  ];

  let filter='TODOS', query='', sort='', shown=6;

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  function getFilters(){
    const list=(E.state.categories||[]).filter(c=>['all','category','brand'].includes(c.type));
    return list.length?list:[{id:'all',label:'TODOS',type:'all',value:''}];
  }

  /** Ruta de imagen según el modo ligero. */
  function imgSrc(path){ return window.OasisLite ? window.OasisLite.img(path) : path; }

  /** Imagen con WebP + respaldo JPG, carga diferida y skeleton. */
  function picture(src, alt){
    const webp=imgSrc(src), jpg=(/[th]\.webp$/.test(src))?webp:src.replace('.webp','.jpg');
    return `<picture><source srcset="${webp}" type="image/webp"><img src="${jpg}" alt="${alt}" loading="lazy" decoding="async"
      onload="OasisImg.ok(this)" onerror="OasisImg.fail(this)"></picture>`;
  }

  function brandOf(nombre){
    const n=nombre.toUpperCase();
    if(n.includes('MERCEDES')) return 'MERCEDES';
    if(n.includes('BMW')) return 'BMW';
    if(n.includes('AUDI')) return 'AUDI';
    if(n.includes('JEEP')) return 'JEEP';
    if(n.includes('TOYOTA')) return 'TOYOTA';
    if(n.includes('HYUNDAI')) return 'HYUNDAI';
    if(n.includes('KIA')) return 'KIA';
    if(n.includes('CHANGAN')) return 'CHANGAN';
    if(n.includes('LEXUS')) return 'LEXUS';
    if(n.includes('PORSCHE')) return 'PORSCHE';
    if(n.includes('CHEVROLET')) return 'CHEVROLET';
    if(n.includes('HONDA')) return 'HONDA';
    if(n.includes('FORD')) return 'FORD';
    if(n.includes('RANGE ROVER')) return 'RANGE ROVER';
    return 'OTRO';
  }

  /* ---------- Contenido dinámico ---------- */
  function renderMarquee(){
    const items=['SUV','LUJO','ECONÓMICO','ENTREGA EN AEROPUERTO','PAGO CON PAYPAL','SERVICIO 24/7'];
    const el=document.getElementById('marqueeTrack');
    if(el) el.innerHTML=[...items,...items].map(x=>`<span>${x} <b aria-hidden="true"></b></span>`).join('');
  }

  function renderPaypalCards(){
    const items=[
      ['SEGURIDAD','Sus datos financieros no se comparten con el vendedor'],
      ['PROTECCIÓN','Sus pagos están protegidos por el programa de protección del comprador'],
      ['RAPIDEZ','Recibimos y verificamos su pago instantáneamente'],
      ['FLEXIBILIDAD','Usted elige cómo pagar: tarjeta, cuenta bancaria o saldo de PayPal'],
      ['COMODIDAD','Pague en 2 clics. No tendrá que introducir sus datos en cada compra'],
      ['MULTIMONEDAS','PayPal acepta más de 24 monedas']
    ];
    const el=document.getElementById('paypalCards');
    if(el && !el.dataset.ready){
      el.dataset.ready='1';
      el.innerHTML=items.map(([t,d])=>`<div class="feature"><div class="ic"><img src="img/check.svg" alt="" class="check-ico"></div><h4>${t}</h4><p>${d}</p></div>`).join('');
    }
  }

  function renderNeeds(){
    const items=[
      'El período de renta mínimo es de 72 horas, que es igual a 3 días mínimo de rentas.',
      'Los vehículos deben ser devueltos igual como se entregaron.',
      'Contar con una tarjeta de crédito con fondos disponibilidad.',
      'Licencia de conducir vigente sin importar el país de origen.',
      'Presentar documentos de identidad.'
    ];
    const el=document.getElementById('needList');
    if(el) el.innerHTML=items.map(x=>`<div class="check"><img src="img/check.svg" class="check-ico" alt=""><span>${x}</span></div>`).join('');
  }

  function renderNotes(){
    const items=[
      ['ENTREGA','Hacemos entrega en todos los aeropuertos y hoteles del país.'],
      ['ASISTENCIA 24H','En caso de problemas mecánicos, contamos con un personal las 24 horas dispuesto a brindar la asistencia necesaria en cualquier punto del país, sin ningún costo adicional, (809) 693-0840.'],
      ['EMERGENCIA','Si llegara a tener un accidente donde fuera necesaria la asistencia médica, debes marcar Sistema Nacional De Atención A Emergencias 911.']
    ];
    const el=document.getElementById('serviceNotes');
    if(el) el.innerHTML=items.map(([t,d])=>`<div class="feature"><div class="ic">!</div><h4>${t}</h4><p>${d}</p></div>`).join('');
  }

  function renderVideos(){
    const vids=(E.state.videos||[]).filter(v=>v && v.id);
    const el=document.getElementById('videoGrid');
    if(el) el.innerHTML=vids.map((v,i)=>`
      <div class="video-card" data-video="${esc(v.id)}" role="button" tabindex="0" aria-label="Ver video ${esc(v.title)}">
        <img src="${imgSrc(PHOTOS[i%PHOTOS.length])}" alt="${esc(v.title)}" loading="lazy" decoding="async"><div class="play">▶</div>
      </div>`).join('')||'<p class="lede">Pronto publicaremos nuevos videos.</p>';
  }

  /* ---------- Catálogo ---------- */
  function matches(c){
    if(filter!=='TODOS'){
      const cat=getFilters().find(x=>x.label===filter);
      if(cat){
        if(cat.type==='brand' && brandOf(c.nombre)!==cat.value) return false;
        if(cat.type==='category'){
          if(cat.maxPrice && c.precio>=cat.maxPrice) return false;
          if(!cat.maxPrice && c.categoria!==cat.value) return false;
        }
      }else{
        if(filter==='ECONÓMICO' && c.precio>=100) return false;
        if(filter==='LUJO' && c.categoria!=='Lujo') return false;
        if(filter==='SUV' && c.categoria!=='SUV') return false;
        if(!['ECONÓMICO','LUJO','SUV'].includes(filter) && brandOf(c.nombre)!==filter) return false;
      }
    }
    if(query && !c.nombre.toLowerCase().includes(query)) return false;
    return true;
  }

  function cardHTML(c){
    const f1=document.getElementById('f1').value||'2026-12-18';
    const f2=document.getElementById('f2').value||'2026-12-21';
    const lugar=document.getElementById('pickup').value;
    const wa=waReserve(c.nombre,c.precio,f1,f2,lugar);
    const paypal=E.getPaypalLink();
    return `<article class="card">
      <div class="ph">
        <a href="vehiculo.html?id=${c.id}&f1=${f1}&f2=${f2}&pickup=${encodeURIComponent(lugar)}" aria-label="Ver ${c.nombre}">${picture(c.foto, c.nombre)}</a>
        <span class="id">#${c.id}</span><span class="tag">${brandOf(c.nombre)}</span>
      </div>
      <div class="body">
        <h4><a href="vehiculo.html?id=${c.id}&f1=${f1}&f2=${f2}&pickup=${encodeURIComponent(lugar)}" style="color:inherit">${c.nombre}</a></h4>
        <div class="price">US $${c.precio} <small>/ día</small></div>
        <div class="card-state"><span data-car-status="${c.id}">${c.status||'Disponible'}</span> · Stock <b data-car-stock="${c.id}">${c.stock!==undefined?c.stock:1}</b></div>
        <div class="acts">
          <a class="btn btn-ghost btn-sm" href="vehiculo.html?id=${c.id}&f1=${f1}&f2=${f2}&pickup=${encodeURIComponent(lugar)}">VER DETALLES</a>
          <a class="btn btn-orange btn-sm" href="${wa}" target="_blank" rel="noopener">RESERVAR</a>
          <a class="btn btn-blue btn-sm" data-paypal href="${paypal}" target="_blank" rel="noopener">PAGAR</a>
        </div>
      </div>
    </article>`;
  }

  function renderCars(){
    let list=E.allCars().filter(matches);
    if(sort==='asc') list.sort((a,b)=>a.precio-b.precio);
    if(sort==='desc') list.sort((a,b)=>b.precio-a.precio);
    const grid=document.getElementById('carGrid');
    if(grid) grid.innerHTML=list.slice(0,shown).map(cardHTML).join('')||'<p class="lede">No se encontraron vehículos.</p>';
    grid?.querySelectorAll('img').forEach(i=>window.OasisImg?.watch(i));
    const info=document.getElementById('pageInfo');
    if(info) info.textContent=`Página 1 de ${Math.max(1,Math.ceil(list.length/12))} · ${list.length} vehículos`;
    const more=document.getElementById('loadMore');
    if(more) more.style.display=shown<list.length?'':'none';

    document.querySelectorAll('[data-gallery]').forEach(b=>{
      b.onclick=()=>{
        const c=E.allCars().find(x=>x.id===Number(b.dataset.gallery));
        if(!c) return;
        const imgs=(c.fotosMini&&c.fotosMini.length?c.fotosMini:[c.foto]).slice(0,10);
        openModal(`<button class="close" onclick="OasisCloseModal()" aria-label="Cerrar"><img src="img/close.svg" alt=""></button><h3>${c.nombre}</h3><div class="gallery">${imgs.map(p=>`<img src="${imgSrc(p)}" alt="${c.nombre}" loading="lazy" decoding="async">`).join('')}</div>`);
      };
    });
    document.querySelectorAll('[data-paypal]').forEach(a=>a.href=E.getPaypalLink());
  }
  window.OasisCatalog={ refresh:renderCars };

  function renderFilters(){
    const box=document.getElementById('filters');
    if(!box) return;
    const list=getFilters();
    if(!list.some(c=>c.label===filter)) filter='TODOS';
    box.innerHTML=list.map(c=>`<button class="chip ${c.label===filter?'on':''}" data-f="${esc(c.label)}">${esc(c.label)}</button>`).join('');
    box.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{
      filter=b.dataset.f; shown=6; renderFilters(); renderCars();
    });
  }

  /* ---------- Modales ---------- */
  function openModal(html){
    const o=document.getElementById('overlay'),m=document.getElementById('modal');
    if(m) m.innerHTML=html;
    if(o) o.classList.add('open');
  }
  window.OasisCloseModal=()=>{
    const o=document.getElementById('overlay'),m=document.getElementById('modal');
    if(o)o.classList.remove('open'); if(m)m.innerHTML='';
  };
  document.getElementById('overlay')?.addEventListener('click',e=>{if(e.target.id==='overlay')window.OasisCloseModal()});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ window.OasisCloseModal(); if(window.OasisClosePanel)window.OasisClosePanel(); }
  });

  /* ---------- Eventos ---------- */
  function initEvents(){
    const f1=document.getElementById('f1'), f2=document.getElementById('f2');
    if(f1) f1.value='2026-12-18';
    if(f2) f2.value='2026-12-21';

    document.getElementById('searchForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      if(!document.getElementById('acceptTerms')?.checked){ alert('Debes aceptar los Términos y Condiciones para continuar.'); return; }
      if(!f1.value||!f2.value){ alert('Elige ambas fechas'); return; }
      if(f2.value<=f1.value){ alert('La fecha de regreso debe ser después de la recogida'); return; }
      filter='TODOS'; shown=6; renderFilters(); renderCars();
      document.getElementById('vehiculos')?.scrollIntoView({behavior:'smooth'});
    });
    document.getElementById('searchInput')?.addEventListener('input',e=>{
      query=e.target.value.trim().toLowerCase(); shown=6; renderCars();
    });
    document.getElementById('sortSelect')?.addEventListener('change',e=>{ sort=e.target.value; renderCars(); });
    document.getElementById('loadMore')?.addEventListener('click',()=>{ shown+=6; renderCars(); });

    /* Carga progresiva: el resto de carros entra al hacer scroll */
    const moreBtn=document.getElementById('loadMore');
    if(moreBtn && 'IntersectionObserver' in window){
      const ioMore=new IntersectionObserver(es=>{
        if(es[0].isIntersecting && moreBtn.style.display!=='none'){ shown+=6; renderCars(); }
      },{rootMargin:'400px'});
      ioMore.observe(moreBtn);
    }
    document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('mobileMenu')?.classList.toggle('open'));
    document.querySelectorAll('#mobileMenu a').forEach(a=>a.onclick=()=>document.getElementById('mobileMenu')?.classList.remove('open'));
    document.getElementById('toTop')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

    document.getElementById('openReq')?.addEventListener('click',()=>{
      const short=E.state.texts.reqShort||'Pasaporte, tarjeta de crédito con disponibilidad y licencia de conducir vigente.';
      openModal(`<button class="close" onclick="OasisCloseModal()" aria-label="Cerrar"><img src="img/close.svg" alt=""></button><h3>Requisitos para rentar</h3><div id="needList"></div><p class="lede" style="margin-top:1rem">${short}</p><a class="btn btn-orange" style="margin-top:1rem" href="https://wa.me/18096930840" target="_blank" rel="noopener">¿DUDAS? ESCRÍBENOS</a>`);
      renderNeeds();
    });

    document.addEventListener('click',e=>{
      const v=e.target.closest('[data-video]');
      if(v) openModal(`<button class="close" onclick="OasisCloseModal()" aria-label="Cerrar"><img src="img/close.svg" alt=""></button><h3>Video</h3><iframe width="100%" height="400" src="https://www.youtube.com/embed/${v.dataset.video}?autoplay=1" title="Video Oasis" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="border-radius:12px"></iframe>`);
    });

    document.getElementById('contactForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      if(document.getElementById('cCaptcha').value.trim()!=='3'){ alert('Respuesta incorrecta. Escribe 3 para confirmar que eres una persona.'); return; }
      const n=document.getElementById('cName').value;
      const em=document.getElementById('cEmail').value;
      const su=document.getElementById('cSubject').value;
      const ms=document.getElementById('cMsg').value;
      window.open(waContact(n,su,em,ms),'_blank','noopener');
      window.location.href=`mailto:${E.state.contact.email}?subject=${encodeURIComponent(su)}&body=${encodeURIComponent(ms)}`;
      const ok=document.getElementById('formOk'); if(ok) ok.style.display='block';
      e.target.reset();
    });

    /* Links de WhatsApp y PayPal */
    document.querySelectorAll('[data-wa]').forEach(a=>{
      const k=a.dataset.wa;
      if(k==='contacto1') a.href=`https://wa.me/18095491531`;
      else if(k==='contacto2'||k==='fuera') a.href=`https://wa.me/18096930840`;
      else a.href=waGeneral();
    });

    /* Reveal on scroll */
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>es.forEach(x=>{
        if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); }
      }),{threshold:.1});
      document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
    }else{
      document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('in'));
    }

    /* Parallax del hero + navbar */
    const heroBg=document.getElementById('heroBg');
    let ticking=false;
    window.addEventListener('scroll',()=>{
      if(ticking) return; ticking=true;
      requestAnimationFrame(()=>{
        if(heroBg) heroBg.style.transform=`translate3d(0,${Math.min(window.scrollY*.25,180)}px,0) scale(1.06)`;
        document.getElementById('nav')?.classList.toggle('small',window.scrollY>40);
        ticking=false;
      });
    },{passive:true});

    /* Cursor personalizado solo en desktop */
    if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches){
      document.body.classList.add('custom-cursor');
      const dot=document.createElement('div'), ring=document.createElement('div');
      dot.className='cursor-dot'; ring.className='cursor-ring';
      document.body.append(dot,ring);
      let mx=0,my=0,rx=0,ry=0;
      window.addEventListener('mousemove',e=>{
        mx=e.clientX; my=e.clientY;
        dot.style.transform=`translate3d(${mx}px,${my}px,0)`;
        ring.classList.toggle('hover',!!e.target.closest('a,button,input,select,.card'));
      },{passive:true});
      (function loop(){ rx+=(mx-rx)*.15; ry+=(my-ry)*.15; ring.style.transform=`translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); })();
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded',()=>{
    const blocked = window.OasisCookies && !window.OasisCookies.accepted();
    if(blocked){
      const grid=document.getElementById('carGrid');
      if(grid) grid.innerHTML='';
      return;
    }
    renderMarquee(); renderPaypalCards(); renderNeeds(); renderNotes(); renderVideos();
    if(window.OasisEditor) window.OasisEditor.init();
    renderFilters(); renderCars(); initEvents();

    /* Si el panel admin cambia datos en otra pestaña, se refleja al instante */
    window.addEventListener('storage',e=>{
      if(e.key==='oasis-rent-a-car-v1') location.reload();
    });
  });
})();
