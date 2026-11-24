/* ============================================================
   I18N — cambiador de idiomas (100+ idiomas)
   El traductor externo solo se carga cuando el usuario elige
   un idioma distinto de español, para no afectar la velocidad.
   ============================================================ */
(function(){
  'use strict';

  const LANGS = `af|Afrikaans|sq|Albanés|am|Amárico|ar|Árabe|hy|Armenio|az|Azerbaiyano|eu|Vasco|be|Bielorruso|bn|Bengalí|bs|Bosnio|bg|Búlgaro|my|Birmano|ca|Catalán|ceb|Chebuano|zh|Chino|zh-TW|Chino tradicional|co|Córcego|hr|Croata|cs|Checo|da|Danés|nl|Neerlandés|en|Inglés|eo|Esperanto|et|Estonio|tl|Filipino|fi|Finés|fr|Francés|fr-CA|Francés canadiense|gl|Gallego|ka|Georgiano|de|Alemán|el|Griego|gu|Guyaratí|ht|Haitiano|ha|Hausa|he|Hebreo|hi|Hindi|hmn|Hmong|hu|Húngaro|is|Islandés|ig|Igbo|id|Indonesio|ga|Irlandés|it|Italiano|ja|Japonés|jv|Javanés|kn|Canarés|kk|Kazajo|km|Jemer|ko|Coreano|ku|Kurdo|ky|Kirguís|lo|Laosiano|la|Latín|lv|Letón|lt|Lituano|lb|Luxemburgués|mk|Macedonio|mg|Malagasy|ms|Malayo|ml|Malayalam|mt|Maltés|mi|Maorí|mr|Maratí|mn|Mongol|ne|Nepalí|no|Noruego|ny|Chichewa|fa|Persa|pl|Polaco|pt|Portugués|pt-BR|Portugués Brasil|pa|Punjabí|ro|Rumano|ru|Ruso|sm|Samoano|gd|Gaélico escocés|sr|Serbio|st|Sesotho|sn|Shona|sd|Sindhi|si|Cingalés|sk|Eslovaco|sl|Esloveno|so|Somalí|es|Español|su|Sundanés|sw|Suajili|sv|Sueco|tg|Tayiko|ta|Tamil|te|Telugu|th|Tailandés|tr|Turco|uk|Ucraniano|ur|Urdu|uz|Uzbeko|vi|Vietnamita|cy|Galés|fy|Frísón|xh|Xhosa|yi|Yidis|yo|Yoruba|zu|Zulu`;

  const list=LANGS.split('|');
  const LANGS_ARR=[];
  for(let i=0;i<list.length;i+=2) LANGS_ARR.push({code:list[i],name:list[i+1]});

  let ready=false, pending=null;
  window.oasisTranslateInit=function(){
    if(typeof google==='undefined'||!google.translate) return;
    new google.translate.TranslateElement({pageLanguage:'es',includedLanguages:LANGS_ARR.map(x=>x.code).join(',')},'oasis_translate');
    ready=true;
    if(pending) applyLang(pending);
  };

  function loadTranslator(){
    if(document.getElementById('oasis_gtranslate')) return;
    const div=document.createElement('div');
    div.id='oasis_translate'; div.style.display='none';
    document.body.appendChild(div);
    const s=document.createElement('script');
    s.id='oasis_gtranslate';
    s.src='https://translate.google.com/translate_a/element.js?cb=oasisTranslateInit';
    document.head.appendChild(s);
  }

  function applyLang(code){
    if(!ready){ pending=code; loadTranslator(); return; }
    const sel=document.querySelector('#oasis_translate select');
    if(!sel){ pending=code; return; }
    sel.value=code;
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    localStorage.setItem('oasis_idioma',code);
  }

  function build(){
    const saved=localStorage.getItem('oasis_idioma')||'es';
    const holder=document.createElement('div');
    holder.className='lang-wrap';
    holder.innerHTML=`
      <button type="button" class="lang-btn" aria-label="Cambiar idioma" aria-expanded="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg> <span class="lang-code">${saved.toUpperCase()}</span></button>
      <div class="lang-panel">
        <input class="input lang-search" placeholder="Buscar idioma..." aria-label="Buscar idioma">
        <div class="lang-list">
          ${LANGS_ARR.map(l=>`<button type="button" data-lang="${l.code}" class="${l.code===saved?'on':''}">${l.name} <small>${l.code}</small></button>`).join('')}
        </div>
      </div>`;
    document.body.appendChild(holder);

    const btn=holder.querySelector('.lang-btn');
    const panel=holder.querySelector('.lang-panel');
    const search=holder.querySelector('.lang-search');
    btn.onclick=()=>{
      const open=panel.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
      if(open) search.focus();
    };
    search.oninput=()=>{
      const q=search.value.toLowerCase().trim();
      holder.querySelectorAll('[data-lang]').forEach(b=>{
        b.style.display=b.textContent.toLowerCase().includes(q)?'':'none';
      });
    };
    holder.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{
      const code=b.dataset.lang;
      holder.querySelector('.lang-code').textContent=code.toUpperCase();
      holder.querySelectorAll('[data-lang]').forEach(x=>x.classList.toggle('on',x===b));
      panel.classList.remove('open');
      if(code==='es'){
        localStorage.setItem('oasis_idioma','es');
        location.reload();
      } else applyLang(code);
    });

    if(saved!=='es') loadTranslator();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();
})();
