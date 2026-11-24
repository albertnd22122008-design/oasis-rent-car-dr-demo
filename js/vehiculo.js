/* ============================================================
   VEHÍCULO — página de detalle independiente (?id=1)
   ============================================================ */
(function(){
  'use strict';

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

  const photos=[
    'img/carros/carro-01.webp','img/carros/carro-02.webp','img/carros/carro-03.webp','img/carros/carro-04.webp',
    'img/carros/carro-05.webp','img/carros/carro-06.webp','img/carros/carro-07.webp','img/carros/carro-08.webp'
  ];
  const imgSrc=p=> window.OasisLite ? window.OasisLite.img(p) : p;

  document.addEventListener('DOMContentLoaded',()=>{
    const E=window.OasisEditor;
    if(E) E.apply();

    const id=Number(new URLSearchParams(location.search).get('id'));
    const cars=E ? E.allCars() : (typeof CATALOG!=='undefined'?CATALOG:[]);
    const car=cars.find(c=>c.id===id);

    if(!car){
      document.getElementById('detailTitle').textContent='Vehículo no encontrado';
      document.getElementById('detailTag').textContent='ERROR';
      return;
    }

    document.title=`${car.nombre} — OASIS Rent A Car`;
    document.getElementById('detailTag').textContent=`${brandOf(car.nombre)} · ${car.categoria} · ID #${car.id}`;
    document.getElementById('detailTitle').textContent=car.nombre;
    document.getElementById('detailPrice').innerHTML=`US $${car.precio} <small>/ día</small>`;

    const gallery=[car.foto,...photos.filter(p=>p!==car.foto).slice(0,3)];
    document.getElementById('detailGallery').innerHTML=
      `<div class="main"><img src="${imgSrc(car.foto)}" alt="${car.nombre}" id="mainPhoto"></div>`+
      gallery.slice(1).map(p=>`<div class="side" data-photo="${p}"><img src="${imgSrc(p)}" alt="${car.nombre}" loading="lazy" decoding="async"></div>`).join('');
    document.querySelectorAll('[data-photo]').forEach(el=>el.onclick=()=>{
      document.getElementById('mainPhoto').src=imgSrc(el.dataset.photo);
    });

    const year=(car.nombre.match(/(19|20)\d{2}/)||[])[0]||'—';
    const sp=(E && E.getSpec(car.id)) || {};
    document.getElementById('detailSpecs').innerHTML=[
      ['AÑO',year],['ASIENTOS',sp.pasajeros||'5'],['MALETAS',sp.maletas||'3'],
      ['TRANSMISIÓN',sp.transmision||'Automático'],['A/C',sp.ac||'Sí'],['CATEGORÍA',car.categoria]
    ].map(([k,v])=>`<div><span style="font-size:.7rem;color:var(--muted);letter-spacing:.1em">${k}</span><b>${v}</b></div>`).join('');

    document.getElementById('detailReserve').href=waReserve(car.nombre,car.precio,'2026-12-18','2026-12-21','Aeropuerto Las Américas');
    document.getElementById('detailPaypal').href=E?E.getPaypalLink():PAYPAL_LINK;

    const q=new URLSearchParams(location.search);
    const f1=q.get('f1')||'2026-12-18', f2=q.get('f2')||'2026-12-21';
    const lugar=q.get('pickup')||'Aeropuerto Las Américas';
    document.getElementById('detailReserve').href=waReserve(car.nombre,car.precio,f1,f2,lugar);

    document.getElementById('detailSave').onclick=()=>{
      const A=window.OasisAuth;
      if(!A || !A.isLogged()){ location.href='login.html?next='+encodeURIComponent(location.pathname+location.search); return; }
      A.createReserva({
        vehiculoId:car.id, vehiculo:car.nombre, precio:car.precio,
        pickup:lugar, entrega:lugar, fechaRecogida:f1, fechaRegreso:f2
      });
      const t=document.getElementById('toast');
      if(t){ t.textContent='Reserva guardada en "Mis vehículos"'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }
    };

    document.getElementById('relatedGrid').innerHTML=cars.filter(c=>c.id!==car.id).slice(0,4).map(c=>`
      <a class="card" href="vehiculo.html?id=${c.id}" style="display:block">
        <div class="ph"><img src="${imgSrc(c.foto)}" alt="${c.nombre}" loading="lazy" decoding="async"><span class="id">#${c.id}</span></div>
        <div class="body"><h4>${c.nombre}</h4><div class="price">US $${c.precio} <small>/ día</small></div></div>
      </a>`).join('');
  });
})();
