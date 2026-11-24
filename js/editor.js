/* ============================================================
   EDITOR — panel "EDITAR WEB", subir logo/fotos, precios,
   colores, fuentes, link de PayPal y guardado en localStorage.
   ============================================================ */
(function(){
  'use strict';

  const STORE_KEY = 'oasis-rent-a-car-v1';

  const DEFAULT_STATE = {
    logo:'',
    heroImage:'img/hero.webp',
    ownerImage:'img/owner.webp',
    paypal:'',                 // vacío = usa PAYPAL_LINK de paypal.js
    colors:{ primary:'#FF5A00', secondary:'#1E4FFF', background:'#0F0F0F', text:'#FFFFFF' },
    fonts:{ display:"ui-serif,Georgia,serif", body:"system-ui,-apple-system,'Segoe UI',Roboto,sans-serif" },
    texts:{}, photos:{}, prices:{}, specs:{}, added:[],
    contact:{
      address:'Ruta 66, #4, Salida del Aeropuerto Internacional de las Américas. Las Caletas, (Código postal 11606) Santo Domingo Este, República Dominicana.',
      tel1:'(809) 549-1531', tel2:'+1 (646) 647-8727', wa1:'(809) 549-1531',
      wa2:'+1 (809) 693-0840', email:'info@oasisrentcar.com',
      hours:'Lunes A Viernes: 8:00am A 7:00pm / Sábados: 8:30am A 5:00pm',
      hoursNote:'No importa la hora ni el día, hacemos entregas las 24 horas, los 365 días del año.',
      footerText:'© 2017 - 2026 • Oasis Investment Group, SRL. RNC: 131-37894-3. Todos los derechos reservados | República Dominicana.'
    },
    sections:{
      hero:true, marquee:true, vehiculos:true, whatsapp:true, paypal:true, conocenos:true,
      legal:true, requisitos:true, nota:true, mister:true, videos:true, contacto:true, footer:true
    }
  };

  const FONTS = [
    ['Serif',"ui-serif,Georgia,serif"], ['Sans',"system-ui,-apple-system,sans-serif"],
    ['Arial',"Arial,sans-serif"], ['Verdana',"Verdana,sans-serif"], ['Trebuchet',"'Trebuchet MS',sans-serif"], ['Courier',"'Courier New',monospace"]
  ];
  const SECTIONS = [
    ['hero','Hero'],['marquee','Marquee'],['vehiculos','Flota'],['whatsapp','WhatsApp'],
    ['paypal','PayPal'],['conocenos','Conócenos'],['legal','Términos Legales'],['requisitos','Qué Necesitas'],
    ['nota','Nota Servicio'],['mister','Mister Oasis'],['videos','Videos'],['contacto','Contacto'],['footer','Footer']
  ];
  const CONTACT_FIELDS = {
    eAddress:'address', eTel1:'tel1', eTel2:'tel2', eWa1:'wa1',
    eWa2:'wa2', eEmail:'email', eHours:'hours', eHoursNote:'hoursNote'
  };

  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(STORE_KEY));
      if(!raw) return structuredClone(DEFAULT_STATE);
      return {
        ...structuredClone(DEFAULT_STATE), ...raw,
        colors:{...DEFAULT_STATE.colors,...raw.colors},
        fonts:{...DEFAULT_STATE.fonts,...raw.fonts},
        texts:{...raw.texts}, photos:{...raw.photos}, prices:{...raw.prices}, specs:{...raw.specs},
        added:[...(raw.added||[])],
        contact:{...DEFAULT_STATE.contact,...raw.contact},
        sections:{...DEFAULT_STATE.sections,...raw.sections}
      };
    }catch(e){ return structuredClone(DEFAULT_STATE); }
  }

  let S = load();
  let timer;

  function persist(showToast){
    clearTimeout(timer);
    timer = setTimeout(()=>{
      try{ localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
      catch(e){ toast('Almacenamiento lleno: usa fotos más pequeñas'); }
    },120);
    if(showToast) toast('Cambios guardados');
  }

  function toast(msg){
    const t=document.getElementById('toast');
    if(!t) return;
    t.textContent=msg; t.classList.add('show');
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2400);
  }

  function notifyChange(){
    if(window.OasisCatalog) window.OasisCatalog.refresh();
  }

  /* --- API pública --- */
  const Editor = {
    state:S,
    getPaypalLink:()=> S.paypal || (typeof PAYPAL_LINK!=='undefined' ? PAYPAL_LINK : ''),
    getPrice:(id)=> S.prices[id]!==undefined ? S.prices[id] : null,
    getPhoto:(id)=> S.photos[id] || null,
    getSpec:(id)=> S.specs[id] || null,
    setSpec:(id,value)=>{ S.specs[id]={...(S.specs[id]||{}),...value}; persist(); },
    allCars(){
      const base = typeof CATALOG!=='undefined' ? CATALOG.map(c=>({...c})) : [];
      return [...base, ...S.added.map(c=>({...c}))].map(c=>({
        ...c,
        precio: S.prices[c.id]!==undefined ? S.prices[c.id] : c.precio,
        foto: S.photos[c.id] || c.foto
      }));
    },
    apply(){
      const r=document.documentElement.style;
      r.setProperty('--primary',S.colors.primary);
      r.setProperty('--secondary',S.colors.secondary);
      r.setProperty('--bg',S.colors.background);
      r.setProperty('--text',S.colors.text);
      r.setProperty('--font-display',S.fonts.display);
      r.setProperty('--font-body',S.fonts.body);

      const logoBox=document.getElementById('logoBox');
      if(logoBox){
        logoBox.innerHTML = S.logo
          ? `<img src="${S.logo}" alt="OASIS Rent a Car">`
          : `<img src="img/logo.png" alt="OASIS Rent a Car">`;
      }
      const hero=document.getElementById('heroBg');
      if(hero) hero.style.backgroundImage=`url("${S.heroImage}")`;
      const owner=document.getElementById('ownerPhoto');
      if(owner) owner.src=S.ownerImage||'img/owner.webp';

      document.querySelectorAll('[data-paypal]').forEach(a=>a.href=Editor.getPaypalLink());
      document.querySelectorAll('[data-mail]').forEach(a=>a.href='mailto:'+S.contact.email);
      Object.entries(S.contact).forEach(([k,v])=>{
        document.querySelectorAll(`[data-bind="${k}"]`).forEach(el=>el.textContent=v);
      });
      document.querySelectorAll('[data-edit]').forEach(el=>{
        const k=el.dataset.edit;
        if(S.texts[k]!==undefined && el.innerText!==S.texts[k]) el.innerText=S.texts[k];
      });
      document.querySelectorAll('[data-section]').forEach(el=>{
        el.style.display = S.sections[el.dataset.section]===false ? 'none' : '';
      });
    },
    init(){ bindUI(); Editor.apply(); }
  };
  window.OasisEditor = Editor;

  /* --- Panel --- */
  const panel=document.getElementById('panel');
  function openPanel(){
    if(!panel) return;
    panel.classList.add('open');
    document.body.classList.add('editing');
    document.getElementById('previewPill')?.classList.remove('show');
  }
  function closePanel(){
    if(!panel) return;
    panel.classList.remove('open');
    document.body.classList.remove('editing');
  }
  window.OasisClosePanel=closePanel;

  function readImage(file,cb){
    const fr=new FileReader();
    fr.onload=()=>{
      const im=new Image();
      im.onload=()=>{
        const max=1400, sc=Math.min(1,max/Math.max(im.width,im.height));
        const cv=document.createElement('canvas');
        cv.width=Math.round(im.width*sc); cv.height=Math.round(im.height*sc);
        cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
        cb(cv.toDataURL('image/jpeg',.8));
      };
      im.onerror=()=>cb(fr.result);
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  }

  function bindPhoto(inputId,previewId,cb){
    const inp=document.getElementById(inputId), prev=document.getElementById(previewId);
    if(!inp) return;
    inp.onchange=()=>{
      const f=inp.files[0]; if(!f) return;
      readImage(f,d=>{ cb(d); if(prev) prev.src=d; Editor.apply(); persist(); notifyChange(); });
    };
  }

  function bindUI(){
    document.getElementById('editBtn')?.addEventListener('click',openPanel);
    document.getElementById('closePanel')?.addEventListener('click',closePanel);
    document.getElementById('previewBtn')?.addEventListener('click',()=>{
      closePanel();
      document.getElementById('previewPill')?.classList.add('show');
      toast('Vista previa activada');
    });
    document.getElementById('previewPill')?.addEventListener('click',()=>{
      document.getElementById('previewPill')?.classList.remove('show');
      openPanel();
    });
    document.getElementById('saveBtn')?.addEventListener('click',()=>{
      localStorage.setItem(STORE_KEY,JSON.stringify(S));
      toast('Cambios guardados');
    });
    document.getElementById('resetBtn')?.addEventListener('click',()=>{
      if(confirm('¿Restablecer el diseño original? Se borrarán tus cambios.')){
        localStorage.removeItem(STORE_KEY); location.reload();
      }
    });

    document.querySelectorAll('#panelTabs button').forEach(b=>{
      b.onclick=()=>{
        document.querySelectorAll('#panelTabs button').forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
        document.querySelectorAll('.tabpane').forEach(p=>p.classList.toggle('on',p.dataset.pane===b.dataset.tab));
      };
    });

    /* Textos editables con clic directo */
    document.addEventListener('blur',e=>{
      const el=e.target;
      if(el && el.matches && el.matches('[data-edit]') && document.body.classList.contains('editing')){
        S.texts[el.dataset.edit]=el.innerText.trim(); persist();
      }
    },true);

    bindPhoto('logoFile','logoPreview',d=>{ S.logo=d; });
    bindPhoto('heroFile','heroPreview',d=>{ S.heroImage=d; });
    bindPhoto('ownerFile','ownerPreview',d=>{ S.ownerImage=d; });
    bindPhoto('carFile','carPreview',d=>{
      const id=Number(document.getElementById('carPick').value); S.photos[id]=d;
    });
    document.getElementById('removeLogo')?.addEventListener('click',()=>{
      S.logo=''; const p=document.getElementById('logoPreview'); if(p)p.src='img/logo.png';
      Editor.apply(); persist();
    });

    const pp=document.getElementById('paypalLink');
    if(pp){
      pp.value=S.paypal || Editor.getPaypalLink();
      pp.oninput=e=>{ S.paypal=e.target.value; Editor.apply(); persist(false); };
    }

    [['cPrimary','primary'],['cSecondary','secondary'],['cBg','background'],['cText','text']].forEach(([id,k])=>{
      const el=document.getElementById(id);
      if(!el) return;
      el.value=S.colors[k];
      el.oninput=e=>{ S.colors[k]=e.target.value; Editor.apply(); persist(false); };
    });

    const opts=FONTS.map(([l,v])=>`<option value="${v}">${l}</option>`).join('');
    const fd=document.getElementById('fDisplay'), fb=document.getElementById('fBody');
    if(fd){ fd.innerHTML=opts; fd.value=S.fonts.display; fd.onchange=e=>{S.fonts.display=e.target.value;Editor.apply();persist(false)}; }
    if(fb){ fb.innerHTML=opts; fb.value=S.fonts.body; fb.onchange=e=>{S.fonts.body=e.target.value;Editor.apply();persist(false)}; }

    Object.entries(CONTACT_FIELDS).forEach(([id,k])=>{
      const el=document.getElementById(id);
      if(!el) return;
      el.value=S.contact[k];
      el.oninput=e=>{ S.contact[k]=e.target.value; Editor.apply(); persist(false); };
    });

    fillCarSelects();
    document.getElementById('savePrice')?.addEventListener('click',()=>{
      const id=Number(document.getElementById('pricePick').value);
      const p=Number(document.getElementById('priceVal').value);
      if(!p||p<1){ toast('Precio inválido'); return; }
      S.prices[id]=p; persist(); notifyChange(); toast('Precio actualizado');
    });
    document.getElementById('addCar')?.addEventListener('click',()=>{
      const name=document.getElementById('newName').value.trim();
      if(!name){ toast('Escribe el nombre del carro'); return; }
      const id=Math.max(...Editor.allCars().map(c=>c.id))+1;
      S.added.push({
        id, nombre:name + ' ' + (new Date().getFullYear()),
        precio:Number(document.getElementById('newPrice').value)||100,
        categoria:document.getElementById('newCat').value,
        foto:`img/carros/carro-${String((id%73)+1).padStart(2,'0')}.jpg`
      });
      document.getElementById('newName').value='';
      persist(); fillCarSelects(); notifyChange(); toast('Carro agregado');
    });

    renderToggles();
  }

  function fillCarSelects(){
    const cars=Editor.allCars();
    const opts=cars.map(c=>`<option value="${c.id}">#${c.id} — ${c.nombre}</option>`).join('');
    const cp=document.getElementById('carPick'), pk=document.getElementById('pricePick');
    if(cp){ cp.innerHTML=opts; const p=document.getElementById('carPreview'); if(p)p.src=cars[0].foto; }
    if(pk){ pk.innerHTML=opts; const v=document.getElementById('priceVal'); if(v)v.value=cars[0].precio; }
    cp&&(cp.onchange=e=>{
      const c=Editor.allCars().find(x=>x.id===Number(e.target.value));
      const p=document.getElementById('carPreview'); if(p&&c)p.src=c.foto;
    });
    pk&&(pk.onchange=e=>{
      const c=Editor.allCars().find(x=>x.id===Number(e.target.value));
      const v=document.getElementById('priceVal'); if(v&&c)v.value=c.precio;
    });
  }

  function renderToggles(){
    const box=document.getElementById('sectionToggles');
    if(!box) return;
    box.innerHTML=SECTIONS.map(([k,l])=>`
      <div class="check"><span>${l}</span><input type="checkbox" data-sec="${k}" ${S.sections[k]!==false?'checked':''} style="width:20px;height:20px;accent-color:var(--naranja)"></div>`).join('');
    box.querySelectorAll('[data-sec]').forEach(c=>{
      c.onchange=e=>{ S.sections[e.target.dataset.sec]=e.target.checked; Editor.apply(); persist(false); };
    });
  }
})();
