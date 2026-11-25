/* ============================================================
   MASTER — contraseña maestra, confirmaciones y registro de cambios.
   La contraseña se guarda en localStorage como hash (SHA-256 o FNV).
   ============================================================ */
(function(){
  'use strict';

  const PASS_KEY = 'admin_password';
  const LOG_KEY  = 'admin_log';
  const UNLOCK_KEY = 'oasis-admin-unlocked';
  const NAME_KEY = 'oasis-admin-name';
  const DEFAULT_PASS = 'Oasis2026Master';
  const enc = new TextEncoder();

  function fallbackHash(str){
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for(let i=0;i<str.length;i++){
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
    }
    return 'fnv:' + h1.toString(16).padStart(8,'0') + h2.toString(16).padStart(8,'0');
  }

  async function hash(pass){
    if(window.crypto && crypto.subtle){
      try{
        const buf = await crypto.subtle.digest('SHA-256', enc.encode(pass));
        return 'sha256:' + Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
      }catch(e){ /* file:// sin secure context */ }
    }
    return fallbackHash(pass);
  }

  async function ensure(){
    if(!localStorage.getItem(PASS_KEY)){
      localStorage.setItem(PASS_KEY, await hash(DEFAULT_PASS));
    }
  }

  async function verify(pass){
    await ensure();
    return (await hash(String(pass))) === localStorage.getItem(PASS_KEY);
  }

  async function change(oldPass,newPass){
    if(!(await verify(oldPass))) return { ok:false, error:'La contraseña actual no es correcta.' };
    if(!newPass || String(newPass).length < 8) return { ok:false, error:'La nueva contraseña debe tener al menos 8 caracteres.' };
    localStorage.setItem(PASS_KEY, await hash(String(newPass)));
    log('Contraseña master cambiada','Se actualizó la contraseña de acceso al panel.');
    return { ok:true };
  }

  function who(){
    return sessionStorage.getItem(NAME_KEY) || 'Master';
  }

  function log(action,detail){
    let list = [];
    try{ list = JSON.parse(localStorage.getItem(LOG_KEY)) || []; }catch(e){}
    list.unshift({ ts:new Date().toISOString(), who:who(), action:action, detail:detail || '' });
    localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0,200)));
  }

  function getLog(){
    try{ return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }catch(e){ return []; }
  }

  function clearLog(){
    localStorage.removeItem(LOG_KEY);
  }

  function isUnlocked(){
    return sessionStorage.getItem(UNLOCK_KEY) === '1';
  }

  function unlock(name){
    sessionStorage.setItem(UNLOCK_KEY,'1');
    if(name) sessionStorage.setItem(NAME_KEY, name);
  }

  function lock(){
    sessionStorage.removeItem(UNLOCK_KEY);
    sessionStorage.removeItem(NAME_KEY);
  }

  function closeOnEscape(overlay,close){
    const fn = e=>{ if(e.key==='Escape'){ document.removeEventListener('keydown',fn); close(false); } };
    document.addEventListener('keydown',fn);
    overlay._esc = fn;
  }

  /* Pide la contraseña master para confirmar un cambio. */
  function ask(reason){
    return new Promise(resolve=>{
      const ov = document.createElement('div');
      ov.className = 'pw-overlay';
      ov.innerHTML = `<form class="pw-card" autocomplete="off">
        <p class="eyebrow">CONFIRMAR CAMBIO</p>
        <h3>Contraseña master</h3>
        <p class="lede pw-reason"></p>
        <div class="field"><label>Contraseña master</label><input class="input" type="password" required autocomplete="off"></div>
        <p class="pw-error"></p>
        <div class="btn-row"><button type="button" class="btn btn-ghost" data-cancel>Cancelar</button><button class="btn btn-orange" type="submit">CONFIRMAR →</button></div>
      </form>`;
      document.body.appendChild(ov);
      ov.querySelector('.pw-reason').textContent = reason || 'Introduce la contraseña master para confirmar este cambio.';
      const form = ov.querySelector('form'), inp = ov.querySelector('input'), err = ov.querySelector('.pw-error');
      const close = v=>{ document.removeEventListener('keydown',ov._esc||(()=>{})); ov.remove(); resolve(v); };
      closeOnEscape(ov,close);
      form.onsubmit = async e=>{
        e.preventDefault();
        if(await verify(inp.value)){ close(true); }
        else { err.textContent='Contraseña incorrecta. Inténtalo de nuevo.'; inp.value=''; inp.focus(); }
      };
      ov.querySelector('[data-cancel]').onclick = ()=>close(false);
      ov.addEventListener('click',e=>{ if(e.target===ov) close(false); });
      setTimeout(()=>inp.focus(),60);
    });
  }

  /* Confirmación extra escribiendo una palabra exacta (ej. BORRAR). */
  function confirmTyped(word,title,text){
    return new Promise(resolve=>{
      const ov = document.createElement('div');
      ov.className = 'pw-overlay';
      ov.innerHTML = `<form class="pw-card" autocomplete="off">
        <p class="eyebrow">CONFIRMACIÓN EXTRA</p>
        <h3></h3>
        <p class="lede pw-reason"></p>
        <div class="field"><label>Escribe <b class="pw-word"></b> para confirmar</label><input class="input" required autocomplete="off"></div>
        <p class="pw-error"></p>
        <div class="btn-row"><button type="button" class="btn btn-ghost" data-cancel>Cancelar</button><button class="btn btn-blue" type="submit">CONTINUAR →</button></div>
      </form>`;
      document.body.appendChild(ov);
      ov.querySelector('h3').textContent = title || 'Confirmar acción';
      ov.querySelector('.pw-reason').textContent = text || '';
      ov.querySelector('.pw-word').textContent = word;
      const form = ov.querySelector('form'), inp = ov.querySelector('input'), err = ov.querySelector('.pw-error');
      const close = v=>{ document.removeEventListener('keydown',ov._esc||(()=>{})); ov.remove(); resolve(v); };
      closeOnEscape(ov,close);
      form.onsubmit = e=>{
        e.preventDefault();
        if(inp.value.trim().toUpperCase() === String(word).toUpperCase()){ close(true); }
        else { err.textContent='Escribe exactamente '+word+' para continuar.'; inp.value=''; inp.focus(); }
      };
      ov.querySelector('[data-cancel]').onclick = ()=>close(false);
      ov.addEventListener('click',e=>{ if(e.target===ov) close(false); });
      setTimeout(()=>inp.focus(),60);
    });
  }

  window.OasisMaster = {
    ensure, verify, change, ask, confirmTyped,
    log, getLog, clearLog,
    isUnlocked, unlock, lock, who
  };
})();
