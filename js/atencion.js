/* ============================================================
   ATENCIÓN — panel de reservas para master y atendedor
   ============================================================ */
(function(){
  'use strict';
  const A=window.OasisAuth;
  if(!A.require(['master','atendedor'],'login.html?next=atencion.html')) return;

  const u=A.current();
  if(u.rol==='master') document.getElementById('adminLink').style.display='inline-flex';
  document.getElementById('logoutBtn').onclick=()=>{ A.logout(); location.href='index.html'; };

  let filtro='Todas';
  const tabs=['Todas',...A.statuses];
  document.getElementById('statusTabs').innerHTML=tabs.map(t=>`<button data-s="${t}" class="${t===filtro?'on':''}">${t.toUpperCase()}</button>`).join('');
  document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
    filtro=b.dataset.s;
    document.querySelectorAll('[data-s]').forEach(x=>x.classList.toggle('on',x===b));
    render();
  });

  function toast(msg){
    const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2200);
  }

  function render(){
    let list=A.reservas();
    if(filtro!=='Todas') list=list.filter(r=>r.status===filtro);
    const el=document.getElementById('lista');
    el.innerHTML=list.length?list.map(r=>`
      <article class="reserva-card">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;align-items:flex-start">
          <div><p class="eyebrow">${r.id} · CÉDULA ${r.cedula||'—'}</p><h3 style="font-size:1.6rem">${r.vehiculo}</h3><p style="color:var(--muted);margin:.3rem 0">${r.nombre} · ${r.telefono||''}</p></div>
          <span class="reserva-estado">${r.status}</span>
        </div>
        <div class="reserva-grid">
          <div><span style="font-size:.7rem;color:var(--muted)">RECOGIDA</span><b>${r.fechaRecogida||'—'}</b></div>
          <div><span style="font-size:.7rem;color:var(--muted)">REGRESO</span><b>${r.fechaRegreso||'—'}</b></div>
          <div><span style="font-size:.7rem;color:var(--muted)">LUGAR</span><b style="font-family:var(--font-body);font-size:.95rem">${r.pickup||'—'}</b></div>
          <div><span style="font-size:.7rem;color:var(--muted)">PRECIO</span><b>US $${r.precio}</b></div>
        </div>
        <div class="status-tabs" style="margin-bottom:0">
          ${A.statuses.map(s=>`<button data-set="${r.id}|${s}" class="${r.status===s?'on':''}">${s.toUpperCase()}</button>`).join('')}
        </div>
      </article>`).join(''):'<div class="panel"><p class="lede">No hay reservas con este estado.</p></div>';

    document.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{
      const [id,status]=b.dataset.set.split('|');
      A.setStatus(id,status); toast('Estado actualizado: '+status); render();
    });
  }
  render();
})();
