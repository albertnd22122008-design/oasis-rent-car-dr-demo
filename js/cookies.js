/* ============================================================
   COOKIES — banner bloqueante. Sin aceptar, no se muestra el catálogo.
   ============================================================ */
(function(){
  'use strict';
  const KEY='cookies_aceptadas';
  let accepted = localStorage.getItem(KEY)==='true';
  window.OasisCookies={ accepted:()=>accepted };

  document.addEventListener('DOMContentLoaded',()=>{
    if(accepted) return;
    document.body.classList.add('cookies-blocked');

    const o=document.createElement('div');
    o.className='cookies-overlay';
    o.innerHTML=`
      <div class="cookies-card">
        <p class="eyebrow">COOKIES</p>
        <h2 class="cookies-title">Tu experiencia en Oasis</h2>
        <p class="cookies-text" id="cookiesMsg">Esta web usa cookies para que cargue rápido, guardar tu búsqueda y mejorar tu experiencia. Si no aceptas las cookies, la web no cargará correctamente.</p>
        <div class="cookies-config" id="cookiesConfig">
          <label><input type="checkbox" checked disabled> Cookies necesarias</label>
          <label><input type="checkbox" id="cPerf"> Cookies de rendimiento</label>
          <label><input type="checkbox" id="cAds"> Cookies de publicidad</label>
        </div>
        <div class="cookies-actions" id="cookiesActions">
          <button class="btn btn-orange" id="cAccept">ACEPTAR TODO</button>
          <button class="btn btn-ghost" id="cReject">RECHAZAR</button>
          <button class="btn btn-ghost" id="cSettings">VER CONFIGURACIÓN</button>
        </div>
        <a class="cookies-link" href="cookies.html">Ver Política de Cookies</a>
      </div>`;
    document.body.appendChild(o);

    const save=(all)=>{
      localStorage.setItem(KEY,'true');
      localStorage.setItem('cookies_config',JSON.stringify({
        necesarias:true,
        rendimiento: all ? true : !!(document.getElementById('cPerf')?.checked),
        publicidad: all ? true : !!(document.getElementById('cAds')?.checked)
      }));
      location.reload();
    };

    document.getElementById('cAccept').onclick=()=>save(true);
    document.getElementById('cSettings').onclick=()=>{
      document.getElementById('cookiesConfig').classList.add('show');
    };
    document.getElementById('cReject').onclick=()=>{
      document.getElementById('cookiesMsg').textContent='Debes aceptar las cookies para usar Oasis Rent A Car';
      document.getElementById('cookiesActions').innerHTML='<button class="btn btn-orange" id="cAccept2">ACEPTAR COOKIES</button>';
      document.getElementById('cAccept2').onclick=()=>save(true);
    };
  });
})();
