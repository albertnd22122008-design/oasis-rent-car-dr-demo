/* Reserva compartida: vista pública de solo lectura */
(function(){
  const id=new URLSearchParams(location.search).get('id');
  const r=window.OasisAuth.findReserva(id);
  const body=document.getElementById('rBody');
  if(!r){
    document.getElementById('rTitle').textContent='Reserva no encontrada';
    body.innerHTML='<p class="lede">Este enlace no corresponde a una reserva guardada en este navegador.</p>';
    return;
  }
  document.getElementById('rTitle').textContent=r.vehiculo;
  body.innerHTML=`<div class="reserva-card">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem">
      <p class="eyebrow">${r.id}</p><span class="reserva-estado">${r.status}</span>
    </div>
    <div class="reserva-grid">
      <div><span style="font-size:.7rem;color:var(--muted)">CLIENTE</span><b style="font-family:var(--font-body);font-size:1rem">${r.nombre}</b></div>
      <div><span style="font-size:.7rem;color:var(--muted)">RECOGIDA</span><b>${r.fechaRecogida||'—'}</b></div>
      <div><span style="font-size:.7rem;color:var(--muted)">REGRESO</span><b>${r.fechaRegreso||'—'}</b></div>
      <div><span style="font-size:.7rem;color:var(--muted)">LUGAR</span><b style="font-family:var(--font-body);font-size:.95rem">${r.pickup||'—'}</b></div>
    </div>
  </div>`;
})();
