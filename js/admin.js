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

  function fillSpecSelect(){
    const sel=document.getElementById('specPick');
    if(!sel||!window.OasisEditor) return;
    const cars=window.OasisEditor.allCars();
    sel.innerHTML=cars.map(c=>`<option value="${c.id}">#${c.id} — ${c.nombre}</option>`).join('');
    const load=()=>{
      const s=window.OasisEditor.getSpec(Number(sel.value))||{};
      document.getElementById('specTrans').value=s.transmision||'Automático';
      document.getElementById('specAc').value=s.ac||'Sí';
      document.getElementById('specSeats').value=s.pasajeros||'5';
      document.getElementById('specBags').value=s.maletas||'3';
    };
    sel.onchange=load; load();
    document.getElementById('saveSpec').onclick=()=>{
      window.OasisEditor.setSpec(Number(sel.value),{
        transmision:document.getElementById('specTrans').value,
        ac:document.getElementById('specAc').value,
        pasajeros:document.getElementById('specSeats').value,
        maletas:document.getElementById('specBags').value
      });
      const t=document.getElementById('toast');
      if(t){ t.textContent='Ficha técnica guardada';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200); }
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    if(window.OasisAuth && !window.OasisAuth.require(['master'],'login.html')) return;
    window.OasisEditor.init();
    buildTextFields();
    fillSpecSelect();
    const pv=document.getElementById('previewBtn');
    if(pv) pv.onclick=()=>{ location.href='index.html'; };
  });
})();
