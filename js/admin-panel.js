/* ============================================================
   PANEL ADMIN — contraseña master, stock, categorías, videos,
   contenido, registro de cambios y borrado seguro.
   ============================================================ */
(function(){
  'use strict';

  let filtro='Todos', busqueda='', fotoElegida='img/sin-foto.webp', booted=false;
  const E = ()=>window.OasisEditor;
  const M = ()=>window.OasisMaster;

  function toast(msg){
    const t=document.getElementById('toast'); if(!t) return;
    t.textContent=msg; t.classList.add('show');
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2800);
  }
  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }
  function go(name){
    document.querySelectorAll('.adm-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.go===name));
    document.querySelectorAll('.adm-pane').forEach(p=>p.classList.toggle('on',p.id==='pane-'+name));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  async function askDo(reason,action,detail,fn){
    if(!(await M().ask(reason))) return false;
    try{
      await fn();
      M().log(action,detail);
      return true;
    }catch(e){ toast('Error: '+e.message); return false; }
  }

  function stats(){
    const cars=E().allCars();
    const c=s=>cars.filter(x=>(x.status||'Disponible')===s).length;
    const data=[['Total vehículos',cars.length],['Disponibles',c('Disponible')],['Alquilados',c('Alquilado')],['En mantenimiento',c('Mantenimiento')]];
    const el=document.getElementById('admStats');
    if(el) el.innerHTML=data.map(([l,v])=>`<div class="adm-stat"><span>${l}</span><b>${v}</b></div>`).join('');
  }

  function reservas(){
    const r=window.OasisAuth?.reservas?.()||[];
    const list=r.length?r.slice(0,3).map(x=>({n:x.nombre,v:x.vehiculo,f:x.fechaRecogida})):[
      {n:'Carlos Méndez',v:'Audi Q8 RS 2023',f:'2026-12-18'},
      {n:'María Ruiz',v:'Jeep Rubicon 2020',f:'2026-12-20'},
      {n:'José Almonte',v:'Toyota Highlander 2017',f:'2026-12-22'}
    ];
    const el=document.getElementById('admReservas');
    if(el) el.innerHTML=list.map(x=>`
      <div class="adm-res"><div><b>${esc(x.n)}</b><br><span>${esc(x.v)}</span></div><span>${esc(x.f)}</span></div>`).join('');
  }

  function categoryValues(selected){
    const cats=(E().state.categories||[]).filter(c=>c.type==='category').map(c=>c.value);
    const values=[...new Set([...cats.filter(Boolean),'SUV','Lujo','Económico',selected].filter(Boolean))];
    return values.map(v=>`<option value="${esc(v)}"${v===selected?' selected':''}>${esc(v)}</option>`).join('');
  }

  /* ---------------- STOCK ---------------- */
  function renderStock(){
    const cars=E().allCars();
    const list=cars.filter(c=>(filtro==='Todos'||(c.status||'Disponible')===filtro)&&c.nombre.toLowerCase().includes(busqueda));
    const count=document.getElementById('admCount');
    if(count) count.textContent=list.length+' vehículos';
    const box=document.getElementById('admList');
    if(!box) return;
    box.innerHTML=list.map(c=>{
      const st=c.status||'Disponible', stock=c.stock!==undefined?c.stock:1;
      return `<article class="adm-item" data-id="${c.id}">
        <img src="${esc(c.foto)}" alt="${esc(c.nombre)}" onerror="this.src='img/sin-foto.webp'">
        <div>
          <h4>${esc(c.nombre)}</h4>
          <div class="meta"><b>US $${c.precio}/día</b><span class="adm-badge ${esc(st)}">${esc(st)}</span>${stock===0?'<span class="adm-badge Agotado">Agotado</span>':`<span>Stock: <b data-car-stock="${c.id}">${stock}</b></span>`}</div>
          <div class="adm-price"><input type="number" value="${c.precio}" data-price-input="${c.id}" min="1"><button class="btn btn-orange btn-sm" data-price-save="${c.id}">Guardar</button></div>
          <div class="adm-acts">
            <select data-status="${c.id}"><option ${st==='Disponible'?'selected':''}>Disponible</option><option ${st==='Alquilado'?'selected':''}>Alquilado</option><option ${st==='Mantenimiento'?'selected':''}>Mantenimiento</option></select>
            <select data-catsel="${c.id}" title="Categoría">${categoryValues(c.categoria)}</select>
            <button data-stock-minus="${c.id}">-</button><button data-stock-plus="${c.id}">+</button>
            <label class="adm-file">CAMBIAR FOTO<input type="file" data-photo="${c.id}" accept="image/*"></label>
            <button class="danger" data-del="${c.id}">Eliminar</button>
          </div>
        </div></article>`;
    }).join('')||'<p class="lede">No hay vehículos con este filtro.</p>';

    box.querySelectorAll('[data-price-save]').forEach(b=>b.onclick=async()=>{
      const id=Number(b.dataset.priceSave), inp=box.querySelector(`[data-price-input="${id}"]`);
      const v=Number(inp.value);
      if(!v||v<1){ toast('Precio inválido'); return; }
      const car=E().allCars().find(c=>c.id===id);
      const ok=await askDo('Cambiar el precio de '+car.nombre,'Precio cambiado',`#${id} ${car.nombre}: US $${car.precio} → US $${v}`,()=>E().setPrice(id,v));
      if(ok){ stats(); renderStock(); toast('Precio actualizado'); }
    });

    box.querySelectorAll('[data-status]').forEach(s=>s.onchange=async()=>{
      const id=Number(s.dataset.status), old=E().allCars().find(c=>c.id===id)?.status||'Disponible', val=s.value;
      if(val===old) return;
      const ok=await askDo('Cambiar el estado del vehículo #'+id,'Estado cambiado',`#${id}: ${old} → ${val}`,()=>E().setStatus(id,val));
      if(ok){ stats(); renderStock(); toast('Estado actualizado'); }
      else s.value=old;
    });

    box.querySelectorAll('[data-catsel]').forEach(s=>s.onchange=async()=>{
      const id=Number(s.dataset.catsel), car=E().allCars().find(c=>c.id===id);
      const old=car?.categoria||'', val=s.value;
      if(val===old) return;
      const ok=await askDo('Cambiar la categoría de '+car.nombre,'Categoría cambiada',`#${id} ${car.nombre}: ${old} → ${val}`,()=>E().setCategory(id,val));
      if(ok){ renderStock(); toast('Categoría actualizada'); }
      else s.value=old;
    });

    box.querySelectorAll('[data-stock-plus]').forEach(b=>b.onclick=async()=>{
      const id=Number(b.dataset.stockPlus), cur=E().allCars().find(c=>c.id===id)?.stock||0;
      const ok=await askDo('Aumentar el stock del vehículo #'+id,'Stock cambiado',`#${id}: ${cur} → ${cur+1}`,()=>E().setStock(id,cur+1));
      if(ok){ stats(); renderStock(); toast('Stock actualizado'); }
    });
    box.querySelectorAll('[data-stock-minus]').forEach(b=>b.onclick=async()=>{
      const id=Number(b.dataset.stockMinus), cur=E().allCars().find(c=>c.id===id)?.stock||0;
      if(cur<=0){ toast('El stock ya está en 0'); return; }
      const ok=await askDo('Reducir el stock del vehículo #'+id,'Stock cambiado',`#${id}: ${cur} → ${cur-1}`,()=>E().setStock(id,cur-1));
      if(ok){ stats(); renderStock(); toast('Stock actualizado'); }
    });

    box.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
      const id=Number(b.dataset.del), car=E().allCars().find(x=>x.id===id);
      if(!confirm('¿Eliminar '+car.nombre+' del stock?')) return;
      const ok=await askDo('Eliminar '+car.nombre+' del catálogo','Vehículo eliminado',`#${id} ${car.nombre}`,()=>E().deleteVehicle(id));
      if(ok){ stats(); renderStock(); toast('Vehículo eliminado'); }
    });

    box.querySelectorAll('[data-photo]').forEach(inp=>inp.onchange=async()=>{
      const f=inp.files[0]; if(!f) return;
      const id=Number(inp.dataset.photo), car=E().allCars().find(x=>x.id===id);
      const ok=await M().ask('Cambiar la foto de '+car.nombre);
      if(!ok){ inp.value=''; return; }
      E().readImage(f,d=>{
        E().state.photos[id]=d;
        E().save(); E().apply();
        M().log('Foto cambiada',`#${id} ${car.nombre}`);
        renderStock(); toast('Foto actualizada');
      });
      inp.value='';
    });
  }

  /* ---------------- CATEGORÍAS ---------------- */
  function renderCats(){
    const list=E().state.categories||[];
    const box=document.getElementById('admCats');
    const count=document.getElementById('admCatsCount');
    if(count) count.textContent=list.length+' filtros';
    if(!box) return;
    box.innerHTML=list.map((c,i)=>{
      const fixed=c.type==='all';
      return `<div class="adm-cat" data-cid="${esc(c.id)}">
        <div class="adm-cat-fields">
          <input class="input" data-clabel="${esc(c.id)}" value="${esc(c.label)}" placeholder="Nombre del filtro" ${fixed?'readonly':''}>
          <select class="input" data-ctype="${esc(c.id)}" ${fixed?'disabled':''}>
            <option value="category"${c.type==='category'?' selected':''}>Categoría</option>
            <option value="brand"${c.type==='brand'?' selected':''}>Marca</option>
            <option value="all"${c.type==='all'?' selected':''}>Todos</option>
          </select>
          <input class="input" data-cvalue="${esc(c.id)}" value="${esc(c.value||'')}" placeholder="Valor" ${fixed?'readonly':''}>
        </div>
        <div class="adm-acts">
          <button data-cup="${esc(c.id)}" ${i<=1?'disabled':''} title="Subir">↑</button>
          <button data-cdown="${esc(c.id)}" ${i>=list.length-1?'disabled':''} title="Bajar">↓</button>
          <button class="btn btn-orange btn-sm" data-csave="${esc(c.id)}" ${fixed?'disabled':''}>Guardar</button>
          <button class="danger" data-cdel="${esc(c.id)}" ${fixed?'disabled':''}>Borrar</button>
        </div>
      </div>`;
    }).join('')||'<p class="lede">No hay categorías. Crea la primera abajo.</p>';

    box.querySelectorAll('[data-csave]').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.csave;
      const label=box.querySelector(`[data-clabel="${id}"]`).value.trim();
      const type=box.querySelector(`[data-ctype="${id}"]`).value;
      const value=box.querySelector(`[data-cvalue="${id}"]`).value.trim();
      if(!label||!value){ toast('Completa nombre y valor'); return; }
      const next=list.map(c=>c.id===id?{...c,label:label.toUpperCase(),type,value}:c);
      const ok=await askDo('Guardar la categoría '+label,'Categoría editada',`${label} (${type}: ${value})`,()=>E().setCategories(next));
      if(ok){ renderCats(); fillCatOptions(); toast('Categoría actualizada'); }
    });

    box.querySelectorAll('[data-cdel]').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.cdel, cat=list.find(c=>c.id===id);
      if(!confirm('¿Borrar el filtro '+cat.label+'? Los vehículos no se borran.')) return;
      const next=list.filter(c=>c.id!==id);
      const ok=await askDo('Borrar el filtro '+cat.label,'Categoría borrada',cat.label,()=>E().setCategories(next));
      if(ok){ renderCats(); fillCatOptions(); toast('Categoría borrada'); }
    });

    const move=async(id,dir)=>{
      const i=list.findIndex(c=>c.id===id); if(i<0) return;
      const j=i+dir; if(j<1||j>=list.length) return;
      const next=[...list]; [next[i],next[j]]=[next[j],next[i]];
      const ok=await askDo('Cambiar el orden de los filtros','Categorías reordenadas',`${list[i].label} ↔ ${list[j].label}`,()=>E().setCategories(next));
      if(ok){ renderCats(); fillCatOptions(); }
    };
    box.querySelectorAll('[data-cup]').forEach(b=>b.onclick=()=>move(b.dataset.cup,-1));
    box.querySelectorAll('[data-cdown]').forEach(b=>b.onclick=()=>move(b.dataset.cdown,1));
  }

  function bindCategoryAdd(){
    const btn=document.getElementById('catAdd');
    if(!btn) return;
    btn.onclick=async()=>{
      const label=document.getElementById('catLabel').value.trim();
      const type=document.getElementById('catType').value;
      const value=document.getElementById('catValue').value.trim();
      if(!label||!value){ toast('Completa nombre y valor'); return; }
      const list=[...(E().state.categories||[])];
      if(!list.some(c=>c.type==='all')) list.unshift({id:'all',label:'TODOS',type:'all',value:''});
      if(list.some(c=>c.label.toUpperCase()===label.toUpperCase())){ toast('Esa categoría ya existe'); return; }
      list.push({id:'cat-'+Date.now(),label:label.toUpperCase(),type,value});
      const ok=await askDo('Crear la categoría '+label,'Categoría creada',`${label} (${type}: ${value})`,()=>E().setCategories(list));
      if(ok){
        document.getElementById('catLabel').value='';
        document.getElementById('catValue').value='';
        renderCats(); fillCatOptions(); toast('Categoría creada');
      }
    };
  }

  /* ---------------- VIDEOS ---------------- */
  function ytId(input){
    const s=String(input||'').trim();
    const m=s.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    return m?m[1]:s;
  }
  function renderVideos(){
    const list=E().state.videos||[];
    const box=document.getElementById('admVideos');
    const count=document.getElementById('admVideosCount');
    if(count) count.textContent=list.length+' videos';
    if(!box) return;
    box.innerHTML=list.map((v,i)=>`<div class="adm-video">
      <div class="fgrp"><label>Video ${i+1} · Título</label><input class="input" data-vtitle="${i}" value="${esc(v.title||'')}" placeholder="Título del video"></div>
      <div class="fgrp"><label>Link o ID de YouTube</label><input class="input" data-vlink="${i}" value="${esc(v.id||'')}" placeholder="https://youtu.be/..."></div>
      <button type="button" class="danger adm-video-del" data-vdel="${i}">Quitar</button>
    </div>`).join('')||'<p class="lede">No hay videos. Añade el primero.</p>';
    box.querySelectorAll('[data-vdel]').forEach(b=>b.onclick=()=>{
      const next=[...list]; next.splice(Number(b.dataset.vdel),1); E().state.videos=next; renderVideos();
    });
  }
  function bindVideoButtons(){
    const add=document.getElementById('videoAdd'), save=document.getElementById('videoSave');
    if(add) add.onclick=()=>{ const list=[...(E().state.videos||[])]; list.push({title:'',id:''}); E().state.videos=list; renderVideos(); };
    if(save) save.onclick=async()=>{
      const list=[...(E().state.videos||[])].map((v,i)=>{
        const t=document.querySelector(`[data-vtitle="${i}"]`)?.value.trim()||'';
        const raw=document.querySelector(`[data-vlink="${i}"]`)?.value.trim()||'';
        return {title:t||('Video '+(i+1)),id:ytId(raw)};
      }).filter(v=>v.id);
      if(!list.length){ toast('Añade al menos un video válido'); return; }
      for(const v of list){ if(!/^[A-Za-z0-9_-]{6,}$/.test(v.id)){ toast('Link de YouTube inválido: '+v.id); return; } }
      const ok=await askDo('Guardar los videos de la web','Videos actualizados',list.map(v=>v.title).join(', '),()=>E().setVideos(list));
      if(ok){ renderVideos(); toast('Videos guardados'); }
    };
  }

  /* ---------------- CONTENIDO ---------------- */
  function fillContent(){
    const s=E().state, t=s.texts||{}, c=s.contact||{};
    const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=v||''; };
    set('cHeroTitle',t.heroTitle||'¡No importa el destino, nosotros te lo llevamos!');
    set('cHeroDesc',t.heroDesc||'Entrega en todos los aeropuertos y hoteles del país. Flota premium, asistencia 24/7 y pago seguro en línea.');
    set('cCatalogTitle',t.catalogTitle||'CATÁLOGO DE VEHÍCULOS');
    set('cVideosTitle',t.videosTitle||'Las ocurrencias dentro de Oasis');
    set('cContactTitle',t.contactTitle||'Hablemos, estamos 24/7');
    set('cAddress',c.address);
    set('cTel1',c.tel1);
    set('cTel2',c.tel2);
    set('cWa1',c.wa1);
    set('cWa2',c.wa2);
    set('cEmail',c.email);
    set('cHours',c.hours);
    set('cHoursNote',c.hoursNote);
    set('cFooter',c.footerText);
  }
  function bindContentSave(){
    const btn=document.getElementById('contentSave');
    if(!btn) return;
    btn.onclick=async()=>{
      const val=id=>document.getElementById(id)?.value||'';
      const texts={
        heroTitle:val('cHeroTitle').trim(),
        heroDesc:val('cHeroDesc').trim(),
        catalogTitle:val('cCatalogTitle').trim(),
        videosTitle:val('cVideosTitle').trim(),
        contactTitle:val('cContactTitle').trim()
      };
      const contact={
        address:val('cAddress').trim(), tel1:val('cTel1').trim(), tel2:val('cTel2').trim(),
        wa1:val('cWa1').trim(), wa2:val('cWa2').trim(), email:val('cEmail').trim(),
        hours:val('cHours').trim(), hoursNote:val('cHoursNote').trim(), footerText:val('cFooter').trim()
      };
      const ok=await askDo('Guardar los textos y datos de contacto','Contenido actualizado','Hero, contacto y footer',()=>{
        E().setTexts(texts); E().setContact(contact); E().apply();
      });
      if(ok){ toast('Contenido guardado'); }
    };
  }

  /* ---------------- IMÁGENES ---------------- */
  const HERO_DEFAULT='img/hero.webp', MISTER_DEFAULT='img/mister-oasis.jpg';
  let heroPending=null, misterPending=null;

  function renderImages(){
    const s=E().state;
    const hp=document.getElementById('admHeroPreview');
    if(hp) hp.style.backgroundImage=`url("${s.heroImage||HERO_DEFAULT}")`;
    const mp=document.getElementById('admMisterPreview');
    if(mp) mp.src=s.misterImage||MISTER_DEFAULT;
    const hf=document.getElementById('admHeroFile'), mf=document.getElementById('admMisterFile');
    if(hf) hf.value='';
    if(mf) mf.value='';
    heroPending=null; misterPending=null;
  }
  function bindImages(){
    const hf=document.getElementById('admHeroFile');
    if(hf) hf.onchange=()=>{
      const f=hf.files&&hf.files[0]; if(!f) return;
      E().readImage(f,d=>{
        heroPending=d;
        const p=document.getElementById('admHeroPreview');
        if(p) p.style.backgroundImage=`url("${d}")`;
        toast('Foto del hero lista para guardar');
      });
    };
    const mf=document.getElementById('admMisterFile');
    if(mf) mf.onchange=()=>{
      const f=mf.files&&mf.files[0]; if(!f) return;
      E().readImage(f,d=>{
        misterPending=d;
        const p=document.getElementById('admMisterPreview');
        if(p) p.src=d;
        toast('Foto de Míster Oasis lista para guardar');
      });
    };
    document.getElementById('admHeroSave')?.addEventListener('click',async()=>{
      if(!heroPending){ toast('Elige una foto del hero primero'); return; }
      const d=heroPending;
      const ok=await askDo('Cambiar la foto de fondo del hero','Foto del hero cambiada','Se subió una nueva imagen de fondo',()=>{
        E().state.heroImage=d; E().save(); E().apply();
      });
      if(ok){ toast('Foto del hero guardada'); renderImages(); }
    });
    document.getElementById('admHeroReset')?.addEventListener('click',async()=>{
      const ok=await askDo('Restaurar la foto original del hero','Foto del hero restaurada','Se volvió a la imagen original',()=>{
        E().state.heroImage=HERO_DEFAULT; E().save(); E().apply();
      });
      if(ok) renderImages();
    });
    document.getElementById('admMisterSave')?.addEventListener('click',async()=>{
      if(!misterPending){ toast('Elige una foto de Míster Oasis primero'); return; }
      const d=misterPending;
      const ok=await askDo('Cambiar la foto de Míster Oasis','Foto de Míster Oasis cambiada','Se subió una nueva imagen',()=>{
        E().state.misterImage=d; E().save(); E().apply();
      });
      if(ok){ toast('Foto de Míster Oasis guardada'); renderImages(); }
    });
    document.getElementById('admMisterReset')?.addEventListener('click',async()=>{
      const ok=await askDo('Quitar la foto de Míster Oasis','Foto de Míster Oasis restaurada','Se volvió a la imagen original',()=>{
        E().state.misterImage=MISTER_DEFAULT; E().save(); E().apply();
      });
      if(ok) renderImages();
    });
    renderImages();
  }

  /* ---------------- SEGURIDAD ---------------- */
  function renderLog(){
    const box=document.getElementById('admLog');
    if(!box) return;
    const list=M().getLog();
    box.innerHTML=list.length?list.map(e=>{
      const d=new Date(e.ts);
      const when=isNaN(d)?e.ts:d.toLocaleString('es-DO',{dateStyle:'short',timeStyle:'short'});
      return `<div class="log-item"><b>${esc(e.action)}</b><span>${esc(when)} · ${esc(e.who)}</span><p>${esc(e.detail)}</p></div>`;
    }).join(''):'<p class="lede">Todavía no hay cambios registrados.</p>';
  }
  function bindSecurity(){
    const pw=document.getElementById('pwSave');
    if(pw) pw.onclick=async()=>{
      const old=document.getElementById('pwOld').value;
      const n1=document.getElementById('pwNew').value;
      const n2=document.getElementById('pwNew2').value;
      if(n1!==n2){ toast('Las contraseñas nuevas no coinciden'); return; }
      const res=await M().change(old,n1);
      if(!res.ok){ toast(res.error); return; }
      document.getElementById('pwOld').value='';
      document.getElementById('pwNew').value='';
      document.getElementById('pwNew2').value='';
      renderLog(); toast('Contraseña master actualizada');
    };

    const lc=document.getElementById('logClear');
    if(lc) lc.onclick=async()=>{
      if(!confirm('¿Limpiar todo el registro de cambios?')) return;
      const ok=await askDo('Limpiar el registro de cambios','Registro limpiado','Se borró el historial',()=>M().clearLog());
      if(ok){ renderLog(); toast('Registro limpiado'); }
    };

    const wipe=document.getElementById('wipeAll');
    if(wipe) wipe.onclick=async()=>{
      if(!(await M().confirmTyped('BORRAR','Borrar todo','Esto elimina todos los vehículos, fotos, textos y categorías. La web quedará en blanco, solo con el logo.'))) return;
      if(!(await M().ask('Escribe tu contraseña master para borrar todo definitivamente.'))) return;
      E().wipeAll();
      M().log('Borrado total','Se eliminó todo el contenido de la web.');
      stats(); renderStock(); renderCats(); renderVideos(); fillContent(); renderImages(); renderLog();
      toast('Web borrada. Solo queda el logo.');
    };

    const restore=document.getElementById('restoreAll');
    if(restore) restore.onclick=async()=>{
      if(!confirm('¿Restaurar la web original? Se borrarán todos los cambios guardados.')) return;
      if(!(await M().ask('Confirma con la contraseña master para restaurar la web original.'))) return;
      M().log('Web restaurada','Se restableció el contenido original.');
      E().restoreAll();
    };

    const out=document.getElementById('admLogout');
    if(out) out.onclick=()=>{ M().lock(); location.reload(); };
  }

  /* ---------------- AGREGAR ---------------- */
  function fillCatOptions(){
    const sel=document.getElementById('vCat'); if(!sel) return;
    const cats=(E().state.categories||[]).filter(c=>c.type==='category').map(c=>c.value);
    const values=[...new Set([...cats.filter(Boolean),'SUV','Lujo','Económico'])];
    sel.innerHTML=values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  }
  function fillGallery(){
    const sel=document.getElementById('vGallery'); if(!sel) return;
    const cars=E().allCars();
    sel.innerHTML=cars.slice(0,20).map(c=>`<option value="${esc(c.foto)}">${esc(c.nombre)}</option>`).join('');
    sel.onchange=()=>{ fotoElegida=sel.value; document.getElementById('vPreview').src=fotoElegida; };
    const btn=document.getElementById('vGalleryBtn');
    if(btn) btn.onclick=()=>{
      const show=sel.style.display==='none';
      sel.style.display=show?'block':'none';
      if(show){fotoElegida=sel.value;document.getElementById('vPreview').src=fotoElegida;}
    };
  }

  function bindAddForm(){
    const form=document.getElementById('admAddForm'); if(!form) return;
    const file=document.getElementById('vFile');
    if(file) file.onchange=e=>{
      const f=e.target.files[0]; if(!f)return;
      E().readImage(f,d=>{fotoElegida=d;document.getElementById('vPreview').src=d;});
      e.target.value='';
    };
    form.onsubmit=async e=>{
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
      const ok=await askDo('Agregar el vehículo '+v.nombre,'Vehículo agregado',`${v.nombre} · US $${v.precio}/día · ${v.categoria}`,()=>{
        E().addVehicle(v); E().save();
      });
      if(!ok) return;
      form.reset();
      document.getElementById('vPreview').src='img/sin-foto.webp';
      fotoElegida='img/sin-foto.webp';
      stats(); renderStock(); fillGallery(); go('stock'); toast('Vehículo agregado');
    };
  }

  /* ---------------- ARRANQUE ---------------- */
  function boot(){
    if(booted) return; booted=true;

    E().init();

    const wa=document.getElementById('admWa');
    const pp=document.getElementById('admPaypal');
    if(wa) wa.value=E().state.whatsapp||'';
    if(pp) pp.value=E().getPaypalLink();

    document.getElementById('admSave')?.addEventListener('click',async()=>{
      const w=document.getElementById('admWa').value.trim();
      const p=document.getElementById('admPaypal').value.trim();
      const ok=await askDo('Guardar los ajustes de WhatsApp y PayPal','Ajustes guardados',`WhatsApp: ${w} · PayPal: ${p?'sí':'no'}`,()=>{
        E().setWhatsapp(w); E().state.paypal=p; E().save();
      });
      if(ok) toast('Ajustes guardados');
    });

    const search=document.getElementById('admSearch');
    if(search) search.oninput=e=>{ busqueda=e.target.value.toLowerCase().trim(); renderStock(); };
    const filters=document.getElementById('admFilters');
    if(filters) filters.onclick=e=>{
      const b=e.target.closest('[data-filter]'); if(!b)return;
      filtro=b.dataset.filter;
      filters.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));
      renderStock();
    };

    document.getElementById('admTabs')?.addEventListener('click',e=>{
      const b=e.target.closest('[data-go]'); if(b) go(b.dataset.go);
    });
    document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

    fillCatOptions();
    fillGallery();
    bindAddForm();
    bindCategoryAdd();
    bindVideoButtons();
    bindContentSave();
    bindImages();
    bindSecurity();

    stats(); reservas(); renderStock(); renderCats(); renderVideos(); fillContent(); renderImages(); renderLog();
  }

  document.addEventListener('DOMContentLoaded',async()=>{
    await M().ensure();
    const form=document.getElementById('lockForm');
    if(M().isUnlocked()){
      document.documentElement.classList.add('admin-unlocked');
      boot();
    }else{
      document.getElementById('lockPass')?.focus();
    }
    if(form) form.onsubmit=async e=>{
      e.preventDefault();
      const pass=document.getElementById('lockPass').value;
      const name=document.getElementById('lockName').value.trim();
      const err=document.getElementById('lockError');
      if(await M().verify(pass)){
        M().unlock(name);
        err.textContent='';
        document.documentElement.classList.add('admin-unlocked');
        boot();
        M().log('Acceso al panel','Entrada con contraseña master.');
        renderLog();
      }else{
        err.textContent='Contraseña incorrecta. Inténtalo de nuevo.';
        document.getElementById('lockPass').value='';
        document.getElementById('lockPass').focus();
      }
    };
  });
})();
