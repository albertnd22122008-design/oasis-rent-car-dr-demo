/* ============================================================
   MODO LIGERO — quita blur/animaciones y usa fotos de 400px.
   Preferencia guardada en localStorage.
   ============================================================ */
(function(){
  'use strict';
  const KEY='oasis-lite';
  let on = localStorage.getItem(KEY)==='1';

  function apply(){
    document.body.classList.toggle('lite', on);
    document.querySelectorAll('.lite-toggle').forEach(b=>{
      b.classList.toggle('on', on);
      b.textContent = on ? 'MODO LIGERO: ON' : 'MODO LIGERO: OFF';
    });
  }

  window.OasisLite = {
    isOn: ()=>on,
    img(path){
      return on && path.includes('img/carros/') ? path.replace('img/carros/','img/carros-small/') : path;
    }
  };

  document.addEventListener('DOMContentLoaded',()=>{
    apply();
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='lite-toggle';
    btn.textContent=on?'MODO LIGERO: ON':'MODO LIGERO: OFF';
    btn.setAttribute('aria-label','Activar o desactivar modo ligero');
    btn.onclick=()=>{
      on=!on;
      localStorage.setItem(KEY, on?'1':'0');
      apply();
      location.reload(); // recarga con imágenes de la calidad correspondiente
    };
    document.body.appendChild(btn);
  });
})();
