/* ============================================================
   INSTALL — agregar la web al inicio (PWA) + estado del usuario
   ============================================================ */
(function(){
  'use strict';
  let deferred=null;

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault(); deferred=e;
  });

  function Instructions(){
    const t=document.getElementById('toast');
    if(!t) return;
    t.textContent='Android: menú ⋮ → Agregar a pantalla de inicio · iPhone: Compartir → Agregar a pantalla de inicio';
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),6000);
  }

  async function install(){
    if(deferred){
      deferred.prompt();
      await deferred.userChoice;
      deferred=null;
      return;
    }
    Instructions();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('installBtn')?.addEventListener('click',install);
    document.getElementById('installBtnMobile')?.addEventListener('click',e=>{e.preventDefault();install();});

    const ub=document.getElementById('userBtn');
    if(ub && window.OasisAuth && window.OasisAuth.isLogged()){
      const u=window.OasisAuth.current();
      ub.href='mis-vehiculos.html';
      const label=ub.querySelector('.user-label');
      if(label) label.textContent='HOLA, '+u.nombre.split(' ')[0].toUpperCase();
      else ub.append(' '+u.nombre.split(' ')[0].toUpperCase());
    }

    if('serviceWorker' in navigator){
      const hadController=!!navigator.serviceWorker.controller;
      let refreshing=false;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(!hadController||refreshing) return;
        refreshing=true;
        location.reload();
      });
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    }
  });
})();
