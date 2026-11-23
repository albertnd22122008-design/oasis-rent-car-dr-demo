/* ============================================================
   MIS VEHÍCULOS — área privada del cliente (solo con cédula)
   ============================================================ */
(function(){
  'use strict';
  const A=window.OasisAuth;
  if(!A.require(['cliente','master','atendedor'],'login.html?next=mis-vehiculos.html')) return;

  const u=A.current();
  document.getElementById('hello').textContent=`Hola, ${u.nombre}. Cédula: ${u.cedula}. Aquí están tus reservas y su estado en tiempo real.`;
  document.getElementById('logoutBtn').onclick=()=>{ A.logout(); location.href='index.html'; };

  const dias=(fecha)=>{
    if(!fecha) return null;
    const d=new Date(fecha+'T12:00:00');
    return Math.round((d.getTime()-Date.now())/86400000);
  };

  function card(r){
    const dRecogida=dias(r.fechaRecogida), dRegreso=dias(r.fechaRegreso);
    const countdown = dRecogida===null ? '—' : dRecogida>0 ? `Faltan ${dRecogida} día${dRecogida===1?'':'s'}` : dRecogida===0 ? 'Entrega hoy' : `Entregada hace ${Math.abs(dRecogida)} día${Math.abs(dRecogida)===1?'':'s'}`;
    const restante = dRegreso===null ? '—' : dRegreso>0 ? `Te quedan ${dRegreso} día${dRegreso===1?'':'s'} de renta` : 'La renta finalizó';
    const link=location.origin+location.pathname.replace('mis-vehiculos.html','reserva.html')+'?id='+encodeURIComponent(r.id);
    const share=async()=>{
      const text=`Mi reserva Oasis: ${r.vehiculo} · ${r.fechaRecogida} al ${r.fechaRegreso} · Estado: ${r.status}`;
      if(navigator.share){ try{ await navigator.share({title:'Mi reserva Oasis',text,url:link}); return; }catch(e){} }
      navigator.clipboard?.writeText(link+' — '+text);
      const t=document.getElementById('toast'); t.textContent='Enlace copiado para compartir'; t.classList.add('show');
      setTimeout(()=>t.classList.remove('show'),2200);
    };
    return `<article class="reserva-card">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:.8rem;align-items:start">
        <div><p class="eyebrow">${r.usuarioId?('RESERVA ' + r.id):r.id}</p><h3 style="font-size:1.8rem">${r.vehiculo}</h3></div>
        <span class="reserva-estado">${r.status}</span>
      </div>
      <div class="reserva-grid">
        <div><span style="font-size:.7rem;color:var(--muted)">RECOGIDA</span><b>${r.fechaRecogida||'—'}</b></div>
        <div><span style="font-size:.7rem;color:var(--muted)">REGRESO</span><b>${r.fechaRegreso||'—'}</b></div>
        <div><span style="font-size:.7rem;color:var(--muted)">LUGAR</span><b style="font-family:var(--font-body);font-size:.95rem">${r.pickup||'—'}</b></div>
        <div><span style="font-size:.7rem;color:var(--muted)">PRECIO / DÍA</span><b>US $${r.precio}</b></div>
      </div>
      <div style="margin-top:1.2rem;display:flex;flex-wrap:wrap;gap:1.5rem;align-items:end">
        <div><p style="font-size:.7rem;color:var(--muted);margin:0">TIEMPO PARA LA ENTREGA</p><p class="countdown">${countdown}</p></div>
        <div><p style="font-size:.7rem;color:var(--muted);margin:0">DURACIÓN RESTANTE</p><p style="font-weight:700;margin:.4rem 0 0">${restante}</p></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.2rem">
        <button class="btn btn-ghost btn-sm" data-share="${r.id}">COMPARTIR RESERVA ↗</button>
        <a class="btn btn-orange btn-sm" href="https://wa.me/18096930840?text=${encodeURIComponent('Hola Oasis, tengo una reserva a mi nombre '+u.nombre+', cédula '+u.cedula+',ID '+r.id+'.')}" target="_blank" rel="noopener">CONSULTAR POR WHATSAPP</a>
      </div>
    </article>`;
  }

  const list=A.misReservas();
  document.getElementById('reservas').innerHTML=list.length ? list.map(card).join('') :
    `<div class="panel"><h3>Aún no tienes reservas</h3><p class="lede">Elige un vehículo y guárdalo aquí desde su página de detalle.</p><a class="btn btn-orange" href="index.html#vehiculos" style="margin-top:1rem">VER VEHÍCULOS →</a></div>`;
  document.querySelectorAll('[data-share]').forEach(b=>{
    b.onclick=()=>{
      const r=A.findReserva(b.dataset.share);
      if(!r) return;
      const link=location.href.split('?')[0].replace('mis-vehiculos.html','reserva.html')+'?id='+encodeURIComponent(r.id);
      const text=`Mi reserva Oasis: ${r.vehiculo} · ${r.fechaRecogida} al ${r.fechaRegreso} · Estado: ${r.status}`;
      if(navigator.share){ navigator.share({title:'Mi reserva Oasis',text,url:link}).catch(()=>{}); }
      else { navigator.clipboard?.writeText(link+' — '+text); const t=document.getElementById('toast');t.textContent='Enlace copiado';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200); }
    };
  });
})();
