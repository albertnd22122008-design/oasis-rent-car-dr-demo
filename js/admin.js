/* ============================================================
   ADMIN — inicializa el panel en su propia página y gestiona
   la edición de textos (el resto lo hace editor.js).
   ============================================================ */
(function(){
  'use strict';

  const DEFAULT_TEXTS = {
    heroEyebrow:'Santo Domingo · República Dominicana',
    heroTitle:'¡No importa el destino, nosotros te lo llevamos!',
    heroDesc:'Entrega en todos los aeropuertos y hoteles del país. Flota premium, asistencia 24/7 y pago seguro en línea.',
    catalogEyebrow:'FLOTA PREMIUM · ENTREGA EN AEROPUERTO',
    catalogTitle:'CATÁLOGO DE VEHÍCULOS',
    waEyebrow:'ASISTENCIA INMEDIATA',
    waTitle:'Comunícate con nosotros vía WhatsApp',
    waText:'Asistencia vía WhatsApp +1 (809) 693-0840. Estamos disponibles las 24 horas, los 365 días del año.',
    paypalTitle:'¿Por qué usar PayPal como forma de pago Online?',
    paypalSub:'Paga tu reservación en línea, rápido y seguro con PayPal.',
    commitTitle:'Más que una empresa líder',
    commitText:'Más que una empresa líder en alquiler de vehículos, somos una familia comprometida en brindar un servicio de calidad Premium, seguridad y puntualidad, con el objetivo de que usted tenga la mejor experiencia a la hora de rentar auto.',
    aboutP1:'Oasis Rent A Car, más que una empresa de alquiler de vehículos, somos una familia comprometida en brindar un servicio de calidad Premium, seguridad y puntualidad, con el objetivo de alcanzar la satisfacción que anhela nuestros clientes. Los integrantes de esta familia de Oasis Rent A Car, nos colocan como líder en el mercado, gracias a su preparación e intelecto al momento de brindar el servicio.',
    aboutP2:'Oasis Rent A Car nacemos de una necesidad que existía en el mercado de brindar un servicio de alta gama y gama regular en alquiler de vehículos, que fuera de accesibilidad al público en general que visita República Dominicana por diversos motivos, vacaciones, reuniones de trabajo entre otros.',
    legalTitle:'Oasis Investment Group, SRL',
    legalText:'Apegándonos en la ley que rigen las mipymes, somos una entidad corporativa, constituida con el nombre comercial de Oasis Investment Group, SRL, bajo el Registro Nacional de Contribuyentes (RNC) 131-37894-3.',
    needTitle:'¿QUE NECESITAS PARA RENTAR UN VEHÍCULO?',
    reqShort:'Antes de reservar uno de nuestros vehículos le recomendamos tener al día los documentos como; Pasaporte y/o documento de identidad, Tarjeta de Crédito con disponibilidad, Licencia de Conducir.',
    noteTitle:'Nota sobre el servicio',
    misterName:'MISTER OASIS',
    misterQuote:'"SALUDITO, SALUDITO"',
    misterStory:'Jorge Pérez Félix, conocido como Míster Oasis, nacido en una familia humilde y de clase baja, sus padres inculcaron el valor del trabajo y la honestidad, a temprana edad Míster Oasis emprendió su negocio de venta y reparación de computadoras.\nLuego se encaminó al negocio de los vehículos, donde dio sus primeros pasos como consignatario en el año 2006, nueve años después da inicio al proyecto Oasis Rent A Car, la empresa de alquiler de vehículos de amplio reconocimiento en República Dominicana hoy en día.\nEl rápido crecimiento del negocio lo volvió reconocido en las redes sociales gracias a los concursos y ayudas solidarias que aún sigue realizando como parte del compromiso de la empresa.\nHa colaborado con destacados influencers y artistas como; Killadamente, Alexandra MVP, Carlos Montesquieu, el influencer y empresario artístico Santiago Matías "Alofoke", los artistas urbanos Químico Ultra Mega, Kiko el Crazy, Cherry Scom, entre otros, dándole notoriedad entre el mundo artístico.\nFiel creyente en los valores, Míster Oasis es padre de tres hijos, casado con más de 16 años de matrimonio. Su familia constituye lo primordial para él y el motor que lo impulsa a seguir adelante.',
    videosTitle:'Las ocurrencias dentro de Oasis',
    contactTitle:'Hablemos, estamos 24/7',
    formIntro:'De igual modo, puede contactarnos a través del siguiente formulario. Por favor, rellene todos los campos correctamente para darle una mejor respuesta.'
  };

  function buildTextFields(){
    const box=document.getElementById('textFields');
    if(!box) return;
    const state=window.OasisEditor.state;
    box.innerHTML=Object.keys(DEFAULT_TEXTS).map(k=>{
      const value=(state.texts[k]!==undefined?state.texts[k]:DEFAULT_TEXTS[k]).replace(/"/g,'&quot;');
      return `<div class="fgrp"><label>${k}</label><textarea class="input" rows="2" data-text="${k}">${value}</textarea></div>`;
    }).join('');
    box.querySelectorAll('[data-text]').forEach(el=>{
      el.oninput=()=>{
        state.texts[el.dataset.text]=el.value;
        try{ localStorage.setItem('oasis-rent-a-car-v1',JSON.stringify(state)); }catch(e){}
      };
    });
  }

  function toastAdmin(msg){
    const t=document.getElementById('toast');
    if(!t) return;
    t.textContent=msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2200);
  }
  function currentId(){
    const ti=document.getElementById('specId');
    const raw=ti && ti.value.trim() ? ti.value : (document.getElementById('specPick')||{}).value;
    return Number(raw)||1;
  }
  function loadSpec(id){
    const s=window.OasisEditor.getSpec(id)||{};
    document.getElementById('specTrans').value=s.transmision||'Automático';
    document.getElementById('specAc').value=s.ac||'Sí';
    document.getElementById('specSeats').value=s.pasajeros||'5';
    document.getElementById('specBags').value=s.maletas||'3';
  }
  function fillSpecSelect(){
    const sel=document.getElementById('specPick');
    if(!sel||!window.OasisEditor) return;
    const cars=window.OasisEditor.allCars();
    const opts=cars.map(c=>`<option value="${c.id}">#${c.id} — ${c.nombre}</option>`).join('');
    sel.innerHTML=opts;
    const batch=document.getElementById('batchCar'); if(batch) batch.innerHTML=opts;
    const sid=document.getElementById('specId'); if(sid) sid.value=cars[0].id;
    sel.onchange=()=>{ if(sid) sid.value=sel.value; loadSpec(Number(sel.value)); };
    if(sid) sid.oninput=()=>loadSpec(currentId());
    loadSpec(currentId());

    document.getElementById('saveSpec').onclick=()=>{
      window.OasisEditor.setSpec(currentId(),{
        transmision:document.getElementById('specTrans').value,
        ac:document.getElementById('specAc').value,
        pasajeros:document.getElementById('specSeats').value,
        maletas:document.getElementById('specBags').value
      });
      toastAdmin('Ficha técnica guardada para el ID '+currentId());
    };
    document.getElementById('genId').onclick=()=>{
      const next=Math.max(...window.OasisEditor.allCars().map(c=>c.id))+1;
      if(sid) sid.value=next;
      loadSpec(next);
      toastAdmin('ID generado: #'+next);
    };
    document.getElementById('createWithId').onclick=()=>{
      const id=currentId();
      const exists=window.OasisEditor.allCars().some(c=>c.id===id);
      if(exists){ toastAdmin('Ese ID ya existe'); return; }
      const st=window.OasisEditor.state;
      st.added.push({id,nombre:'Vehículo '+id,precio:100,categoria:'SUV',foto:'img/carros/carro-01.webp',descripcion:'Automático • A/C'});
      window.OasisEditor.setSpec(id,{transmision:document.getElementById('specTrans').value,ac:document.getElementById('specAc').value,pasajeros:document.getElementById('specSeats').value,maletas:document.getElementById('specBags').value});
      localStorage.setItem('oasis-rent-a-car-v1',JSON.stringify(st));
      toastAdmin('Carro creado con ID #'+id);
      setTimeout(()=>location.reload(),600);
    };
    renderBatch();
  }

  function renderBatch(){
    const sel=document.getElementById('batchCar');
    const box=document.getElementById('batchList');
    if(!sel||!box) return;
    const id=Number(sel.value);
    const list=window.OasisEditor.getGallery(id);
    box.innerHTML=list.map((p,i)=>`
      <div style="display:flex;gap:.6rem;align-items:center;border:1px solid var(--line);border-radius:10px;padding:.5rem;margin-bottom:.5rem">
        <img src="${p.src}" alt="Foto ${i+1} del vehículo ${id}" style="width:70px;height:55px;object-fit:cover;border-radius:6px">
        <label style="flex:1;font-size:.75rem;display:flex;gap:.4rem;align-items:center">
          <input type="checkbox" data-cover="${i}" ${p.portada?'checked':''} style="accent-color:var(--naranja-oasis)"> Portada
        </label>
        <button type="button" data-del="${i}" class="btn btn-ghost btn-sm" style="min-height:30px;padding:.2rem .6rem">Quitar</button>
      </div>`).join('');
    const count=document.getElementById('batchCount');
    if(count) count.textContent=list.length+' de 10 fotos · Marca las portadas (máx. 3 se muestran al abrir el carro)';
    box.querySelectorAll('[data-cover]').forEach(c=>c.onchange=()=>{
      const arr=window.OasisEditor.getGallery(id);
      arr[Number(c.dataset.cover)].portada=c.checked;
      window.OasisEditor.setGallery(id,arr);
    });
    box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
      const arr=window.OasisEditor.getGallery(id);
      arr.splice(Number(b.dataset.del),1);
      window.OasisEditor.setGallery(id,arr);
      renderBatch();
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    if(window.OasisAuth && !window.OasisAuth.require(['master'],'login.html')) return;
    window.OasisEditor.init();
    buildTextFields();
    fillSpecSelect();
    document.getElementById('batchCar')?.addEventListener('change',renderBatch);
    document.getElementById('batchFiles')?.addEventListener('change',async e=>{
      const id=Number(document.getElementById('batchCar').value);
      const current=window.OasisEditor.getGallery(id);
      const files=[...e.target.files].slice(0,10-current.length);
      if(!files.length){ toastAdmin('Máximo 10 fotos por carro'); return; }
      for(const f of files){
        const data=await new Promise(res=>window.OasisEditor.readImage(f,res));
        current.push({src:data,portada:current.length===0});
      }
      window.OasisEditor.setGallery(id,current);
      e.target.value='';
      renderBatch();
      toastAdmin(files.length+' foto(s) agregada(s) al ID #'+id);
    });
    const pv=document.getElementById('previewBtn');
    if(pv) pv.onclick=()=>{ location.href='index.html'; };
  });
})();
