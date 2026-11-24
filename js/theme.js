/* ============================================================
   TEMA — alternar entre versión clara (blanca) y oscura
   ============================================================ */
(function(){
  'use strict';
  function build(){
    const E=window.OasisEditor; if(!E) return;
    let dark=E.state.theme==='dark';

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='theme-btn';
    btn.setAttribute('aria-label','Cambiar tema claro/oscuro');
    function label(){
      btn.innerHTML=dark
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4m0-12.8l-1.4 1.4m-10 10l-1.4 1.4"/><circle cx="12" cy="12" r="4"/></svg> CLARO'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg> OSCURO';
    }
    label();
    btn.onclick=()=>{
      dark=!dark;
      E.setTheme(dark?'dark':'light');
      label();
    };
    document.body.appendChild(btn);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();
})();
