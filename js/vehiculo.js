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
  window.OasisImg = window.OasisImg || {
    ok(img){ img.classList.add('loaded'); },
    fail(img){
      img.onerror=null;
      if(!/sin-foto\.webp$/.test(img.src)) img.src='img/sin-foto.webp';
      img.classList.add('loaded','fallback');
    },
    watch(img){ setTimeout(()=>window.OasisImg.ok(img),2000); }
  };
  const imgSrc=p=>p;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chev=dir=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir==='prev'?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}"/></svg>`;
  const EXTRAS_DEFAULT=['Radio AM/FM','Bluetooth','USB','MP3','WIFI'];

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

    document.title=`${car.nombre} - US $${car.precio} / día - Oasis Rent A Car`;
    const setMeta=(prop,val,attr='property')=>{
      let el=document.querySelector(`meta[${attr}="${prop}"]`);
      if(!el){ el=document.createElement('meta'); el.setAttribute(attr,prop); document.head.appendChild(el); }
      el.content=val;
    };
    setMeta('og:title',`${car.nombre} - US $${car.precio} / día - Oasis Rent A Car`);
    setMeta('og:description',`Reserva este ${car.nombre} en Oasis. Entrega en aeropuerto.`);
    setMeta('og:image',new URL(car.foto,location.href).href);
    document.getElementById('detailTag').textContent=`${brandOf(car.nombre)} · ${car.categoria} · ID #${car.id}`;
    document.getElementById('detailTitle').textContent=car.nombre;
    document.getElementById('detailPrice').innerHTML=`US $${car.precio} <small>/ día</small>`;

    const fotos=(car.fotos&&car.fotos.length)?car.fotos:[car.foto,...photos.filter(p=>p!==car.foto).slice(0,3)];
    const minis=(car.fotosMini&&car.fotosMini.length)?car.fotosMini.slice(0,fotos.length):fotos;
    let idx=0;
    const gal=document.getElementById('detailGallery');
    gal.innerHTML=
      `<div class="detail-carousel">
        <div class="main"><img src="${imgSrc(fotos[0])}" alt="${esc(car.nombre)}" id="mainPhoto" onerror="OasisImg.fail(this)"></div>
        ${fotos.length>1?`<button class="gal-arrow prev" type="button" aria-label="Foto anterior">${chev('prev')}</button><button class="gal-arrow next" type="button" aria-label="Foto siguiente">${chev('next')}</button>`:''}
        <span class="gal-count" id="galCount">1 / ${fotos.length}</span>
      </div>`+
      (fotos.length>1?`<div class="gal-thumbs">${fotos.map((p,i)=>`<button type="button" data-gal="${i}" aria-label="Ver foto ${i+1}"><img src="${imgSrc(minis[i]||p)}" alt="" loading="lazy" decoding="async" onerror="OasisImg.fail(this)"></button>`).join('')}</div>`:'');
    const mainPhoto=document.getElementById('mainPhoto');
    const galCount=document.getElementById('galCount');
    const thumbs=[...gal.querySelectorAll('[data-gal]')];
    function showPhoto(i){
      idx=(i+fotos.length)%fotos.length;
      mainPhoto.src=imgSrc(fotos[idx]);
      if(galCount) galCount.textContent=(idx+1)+' / '+fotos.length;
      thumbs.forEach((b,j)=>b.classList.toggle('on',j===idx));
    }
    if(thumbs.length) thumbs.forEach(b=>b.onclick=()=>showPhoto(Number(b.dataset.gal)));
    gal.querySelector('.gal-arrow.prev')?.addEventListener('click',()=>showPhoto(idx-1));
    gal.querySelector('.gal-arrow.next')?.addEventListener('click',()=>showPhoto(idx+1));
    document.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft') showPhoto(idx-1);
      if(e.key==='ArrowRight') showPhoto(idx+1);
    });

    const year=(car.nombre.match(/(19|20)\d{2}/)||[])[0]||'—';
    const sp=(E && E.getSpec(car.id)) || {};
    const marca=sp.marca||brandOf(car.nombre);
    const modelo=sp.modelo||car.nombre.replace(/\b(MERCEDES-BENZ|MERCEDES|BMW|AUDI|JEEP|TOYOTA|HYUNDAI|KIA|CHANGAN|LEXUS|PORSCHE|CHEVROLET|HONDA|FORD|RANGE ROVER)\b/i,'').replace(/^-+/,'').replace(/\b(19|20)\d{2}\b/,'').trim()||'—';
    const extras=sp.extras||EXTRAS_DEFAULT;
    const yesNo=v=>extras.includes(v)?'Sí':'No';
    document.getElementById('detailSpecs').innerHTML=[
      ['MARCA',marca],['MODELO',modelo],['AÑO',sp.anio||year],['COMBUSTIBLE',sp.combustible||'Gasolina'],
      ['TRANSMISIÓN',sp.transmision||'Automático'],['ASIENTOS',sp.pasajeros||'5'],['MALETAS',sp.maletas||'3'],['A/C',sp.ac||'Sí'],
      ['RADIO AM/FM',yesNo('Radio AM/FM')],['BLUETOOTH',yesNo('Bluetooth')],['USB',yesNo('USB')],['MP3',yesNo('MP3')],['WIFI',yesNo('WIFI')],
      ['EQUIPAMIENTO',extras.join(', ')||'—'],['ITVS','Al día'],['REVISIÓN','Al día']
    ].map(([k,v])=>`<div><span style="font-size:.7rem;color:var(--muted);letter-spacing:.1em">${k}</span><b>${esc(v)}</b></div>`).join('');

    document.getElementById('detailReserve').href=waReserve(car.nombre,car.precio,'2026-12-18','2026-12-21','Aeropuerto Las Américas');
    document.getElementById('detailPaypal').href=E?E.getPaypalLink():PAYPAL_LINK;

    const q=new URLSearchParams(location.search);
    const f1=q.get('f1')||'2026-12-18', f2=q.get('f2')||'2026-12-21';
    const lugar=q.get('pickup')||'Aeropuerto Las Américas';
    document.getElementById('detailReserve').href=waReserve(car.nombre,car.precio,f1,f2,lugar);

    /* --- Formulario completo de reserva al inicio del detalle --- */
    const rval=id=>document.getElementById(id)?.value.trim()||'';
    const rset=(id,v)=>{ const el=document.getElementById(id); if(el && v) el.value=v; };
    rset('rfF1',f1); rset('rfF2',f2);
    rset('rfAeropuerto',lugar);
    const badge=document.getElementById('reserveCar'); if(badge) badge.textContent=car.nombre;
    const toastMsg=msg=>{
      const t=document.getElementById('toast');
      if(t){ t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),3000); }
      else alert(msg);
    };
    const reserveForm=document.getElementById('reserveForm');
    if(reserveForm) reserveForm.onsubmit=e=>{
      e.preventDefault();
      const required=['rfNombre','rfApellidos','rfWhatsapp','rfDireccion','rfPais','rfF1','rfF2'];
      let bad=null;
      required.forEach(id=>{
        const el=document.getElementById(id); if(!el) return;
        el.classList.toggle('field-error',!el.value.trim());
        if(!el.value.trim() && !bad) bad=el;
      });
      if(bad){ toastMsg('Completa los campos obligatorios.'); bad.focus(); return; }
      if(!termsOK()) return;
      const ini=new Date(rval('rfF1')+'T00:00:00'), fin=new Date(rval('rfF2')+'T00:00:00');
      if(!isNaN(ini.getTime()) && !isNaN(fin.getTime()) && (fin-ini)<72*3600*1000){
        toastMsg('La reserva mínima es de 72 horas (3 días).'); return;
      }
      const lines=[
        'Hola Oasis, quiero reservar este vehículo:',
        'Vehículo: '+car.nombre,
        'Precio: US $'+car.precio+' / día',
        'Nombre: '+rval('rfNombre'),
        'Apellidos: '+rval('rfApellidos'),
        'WhatsApp: '+rval('rfWhatsapp'),
        'Móvil alternativo: '+(rval('rfMovil')||'—'),
        'Email: '+(rval('rfEmail')||'—'),
        'Dirección: '+rval('rfDireccion'),
        'País: '+rval('rfPais'),
        'Fecha inicio: '+rval('rfF1'),
        'Fecha retorno: '+rval('rfF2'),
        'Aeropuerto: '+rval('rfAeropuerto'),
        'Aerolínea: '+(rval('rfAerolinea')||'—'),
        'Hora llegada: '+(rval('rfHora')||'—'),
        'No. de vuelo: '+(rval('rfVuelo')||'—')
      ];
      const wa=(E&&E.state&&E.state.whatsapp?E.state.whatsapp:WA_ASISTENCIA).replace(/\D/g,'')||WA_ASISTENCIA;
      window.open('https://wa.me/'+wa+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
      const A=window.OasisAuth;
      if(A && A.isLogged()) A.createReserva({
        vehiculoId:car.id, vehiculo:car.nombre, precio:car.precio,
        pickup:rval('rfAeropuerto'), entrega:rval('rfAeropuerto'),
        fechaRecogida:rval('rfF1'), fechaRegreso:rval('rfF2'),
        nombre:rval('rfNombre')+' '+rval('rfApellidos'), whatsapp:rval('rfWhatsapp'),
        email:rval('rfEmail'), vuelo:rval('rfVuelo'), aerolinea:rval('rfAerolinea')
      });
      toastMsg('Reserva enviada por WhatsApp.');
    };

    const termsOK=()=>{
      const c=document.getElementById('acceptTermsDetail');
      if(c && !c.checked){ alert('Debes aceptar los Términos y Condiciones para reservar.'); return false; }
      return true;
    };
    document.getElementById('detailReserve').addEventListener('click',e=>{ if(!termsOK()) e.preventDefault(); });
    document.getElementById('detailSave').onclick=()=>{
      if(!termsOK()) return;
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
        <div class="ph"><img src="${imgSrc(c.foto)}" alt="${c.nombre}" loading="lazy" decoding="async" onload="OasisImg.ok(this)" onerror="OasisImg.fail(this)"><span class="id">#${c.id}</span></div>
        <div class="body"><h4>${c.nombre}</h4><div class="price">US $${c.precio} <small>/ día</small></div></div>
      </a>`).join('');
    document.querySelectorAll('#relatedGrid img').forEach(i=>window.OasisImg.watch(i));
  });
})();
