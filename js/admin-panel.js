/* ============================================================
   PANEL ADMIN SIMPLE — 3 secciones: Inicio, Stock, Agregar
   Todo se guarda en localStorage mediante OasisEditor.
   ============================================================ */
(function(){
  'use strict';
  let filtro='Todos', busqueda='', fotoElegida='img/sin-foto.webp';

  function toast(msg){
    const t=document.getElementById('toast'); if(!t) return;
    t.textContent=msg; t.classList.add('show');
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2400);
  }
  function go(name){
    document.querySelectorAll('.adm-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.go===name));
    document.querySelectorAll('.adm-pane').forEach(p=>p.classList.toggle('on',p.id==='pane-'+name));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  document.getElementById('admTabs').addEventListener('click',e=>{
    const b=e.target.closest('[data-go]'); if(b) go(b.dataset.go);
  });
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

  function stats(){
    const cars=window.OasisEditor.allCars();
    const c=s=>cars.filter(x=>(x.status||'Disponible')===s).length;
    const data=[['Total vehículos',cars.length],['Disponibles',c('Disponible')],['Alquilados',c('Alquilado')],['En mantenimiento',c('Mantenimiento')]];
    document.getElementById('admStats').innerHTML=data.map(([l,v])=>`<div class="adm-stat"><span>${l}</span><b>${v}</b></div>`).join('');
  }
  function reservas(){
    const r=window.OasisAuth?.reservas?.()||[];
    const list=r.length?r.slice(0,3).map(x=>({n:x.nombre,v:x.vehiculo,f:x.fechaRecogida})):[
      {n:'Carlos Méndez',v:'Audi Q8 RS 2023',f:'2026-12-18'},
      {n:'María Ruiz',v:'Jeep Rubicon 2020',f:'2026-12-20'},
      {n:'José Almonte',v:'Toyota Highlander 2017',f:'2026-12-22'}
    ];
    document.getElementById('admReservas').innerHTML=list.map(x=>`
      <div class="adm-res"><div><b>${x.n}</b><br><span>${x.v}</span></div><span>${x.f}</span></div>`).join('');
  }
  function renderStock(){
    const cars=window.OasisEditor.allCars();
    const list=cars.filter(c=>(filtro==='Todos'||(c.status||'Disponible')===filtro)&&c.nombre.toLowerCase().includes(busqueda));
    document.getElementById('admCount').textContent=list.length+' vehículos';
    document.getElementById('admList').innerHTML=list.map(c=>{
      const st=c.status||'Disponible', stock=c.stock!==undefined?c.stock:1;
      return `<article class="adm-item" data-id="${c.id}">
        <img src="${c.foto}" alt="${c.nombre}" onerror="this.src='img/sin-foto.webp'">
        <div>
          <h4>${c.nombre}</h4>
          <div class="meta"><b>US $${c.precio}/día</b><span class="adm-badge ${st}">${st}</span>${stock===0?'<span class="adm-badge Agotado">Agotado</span>':`<span>Stock: <b data-car-stock="${c.id}">${stock}</b></span>`}</div>
          <div class="adm-price"><input type="number" value="${c.precio}" data-price-input="${c.id}" min="1"><button class="btn btn-orange btn-sm" data-price-save="${c.id}">Guardar</button></div>
          <div class="adm-acts">
            <select data-status="${c.id}"><option ${st==='Disponible'?'selected':''}>Disponible</option><option ${st==='Alquilado'?'selected':''}>Alquilado</option><option ${st==='Mantenimiento'?'selected':''}>Mantenimiento</option></select>
            <button data-stock-minus="${c.id}">-</button><button data-stock-plus="${c.id}">+</button>
            <button class="danger" data-del="${c.id}">Eliminar</button>
          </div>
        </div></article>`;
    }).join('')||'<p class="lede">No hay vehículos con este filtro.</p>';

    document.querySelectorAll('[data-price-save]').forEach(b=>b.onclick=()=>{
      const id=Number(b.dataset.priceSave), v=Number(document.querySelector(`[data-price-input="${id}"]`).value);
      if(!v||v<1){toast('Precio inválido');return;}
      window.OasisEditor.setPrice(id,v); stats(); renderStock(); toast('Precio actualizado');
    });
    document.querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>{
      window.OasisEditor.setStatus(Number(s.dataset.status),s.value); stats(); renderStock(); toast('Estado actualizado');
    });
    document.querySelectorAll('[data-stock-plus]').forEach(b=>b.onclick=()=>{
      const id=Number(b.dataset.stockPlus), cur=window.OasisEditor.allCars().find(c=>c.id===id).stock||0;
      window.OasisEditor.setStock(id,cur+1); renderStock(); toast('Stock actualizado');
    });
    document.querySelectorAll('[data-stock-minus]').forEach(b=>b.onclick=()=>{
      const id=Number(b.dataset.stockMinus), cur=window.OasisEditor.allCars().find(c=>c.id===id).stock||0;
      window.OasisEditor.setStock(id,cur-1); renderStock(); toast('Stock actualizado');
    });
    document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
      const id=Number(b.dataset.del), c=window.OasisEditor.allCars().find(x=>x.id===id);
      if(!confirm('¿Eliminar '+c.nombre+' del stock?')) return;
      window.OasisEditor.deleteVehicle(id); stats(); renderStock(); toast('Vehículo eliminado');
    });
  }

  function fillGallery(){
    const sel=document.getElementById('vGallery');
    const cars=window.OasisEditor.allCars();
    sel.innerHTML=cars.slice(0,20).map(c=>`<option value="${c.foto}">${c.nombre}</option>`).join('');
    sel.onchange=()=>{ fotoElegida=sel.value; document.getElementById('vPreview').src=fotoElegida; };
    document.getElementById('vGalleryBtn').onclick=()=>{
      const show=sel.style.display==='none';
      sel.style.display=show?'block':'none';
      if(show){fotoElegida=sel.value;document.getElementById('vPreview').src=fotoElegida;}
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    window.OasisEditor.init();
    document.getElementById('admWa').value=window.OasisEditor.state.whatsapp||'';
    document.getElementById('admPaypal').value=window.OasisEditor.getPaypalLink();
    document.getElementById('admSave').onclick=()=>{
      window.OasisEditor.setWhatsapp(document.getElementById('admWa').value.trim());
      window.OasisEditor.state.paypal=document.getElementById('admPaypal').value.trim();
      window.OasisEditor.save(); toast('Ajustes guardados');
    };
    document.getElementById('admSearch').oninput=e=>{ busqueda=e.target.value.toLowerCase().trim(); renderStock(); };
    document.getElementById('admFilters').onclick=e=>{
      const b=e.target.closest('[data-filter]'); if(!b)return;
      filtro=b.dataset.filter;
      document.querySelectorAll('#admFilters .chip').forEach(x=>x.classList.toggle('on',x===b));
      renderStock();
    };
    document.getElementById('vFile').onchange=e=>{
      const f=e.target.files[0]; if(!f)return;
      window.OasisEditor.readImage(f,d=>{fotoElegida=d;document.getElementById('vPreview').src=d;});
      e.target.value='';
    };
    fillGallery();
    document.getElementById('admAddForm').onsubmit=e=>{
      e.preventDefault();
      const v={
        nombre:document.getElementById('vNombre').value.trim(),
        precio:document.getElementById('vPrecio').value,
        categoria:document.getElementById('vCat').value,
        foto:fotoElegida,
        estado:document.getElementById('vEstado').value,
        stock:document.getElementById('vStock').value
      };
      if(!v.nombre){toast('Escribe el nombre');return;}
      window.OasisEditor.addVehicle(v);
      window.OasisEditor.save();
      e.target.reset();
      document.getElementById('vPreview').src='img/sin-foto.webp';
      fotoElegida='img/sin-foto.webp';
      stats(); renderStock(); go('stock'); toast('Vehículo agregado');
    };
    stats(); reservas(); renderStock();
  });
})();
