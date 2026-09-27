// Scelta dello stile: i tasti nella schermata dei contatti.
// Ogni stile è un "vestito" dello stesso sito (html[data-stile=…] nel CSS):
// stesse posizioni e animazioni, cambiano solo colori e caratteri.
// Per aggiungere uno stile: una riga qui, il suo blocco CSS e il suo font in STILI_FONT.
(function(){
  var STILI=[
    {id:'originale',nome:'Originale',bg:'#0A0A0A',fg:'#E3262E'},
    {id:'couture',nome:'Couture',bg:'#F2EDE6',fg:'#B3001B'}
  ];
  var html=document.documentElement;

  var css=document.createElement('style');
  css.textContent=
    '.tenda{position:fixed;inset:0;z-index:9999;clip-path:inset(0 0 0 0);transition:clip-path .65s cubic-bezier(.7,0,.2,1)}'+
    '.tenda.entra{clip-path:inset(100% 0 0 0)}.tenda.via{clip-path:inset(0 0 100% 0)}'+
    '.sc-btn{display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit}'+
    '.sc-btn i{flex:none;width:44px;height:44px;border-radius:8px;background:var(--sb);color:var(--sf);border:1px solid rgba(127,127,127,.45);display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:700}';
  document.head.appendChild(css);

  function attuale(){return html.getAttribute('data-stile')||'originale'}
  function font(id){
    var u=(window.STILI_FONT||{})[id];
    if(!u||document.querySelector('link[data-font="'+id+'"]'))return;
    var l=document.createElement('link');l.rel='stylesheet';l.href=u;l.setAttribute('data-font',id);document.head.appendChild(l);
  }
  function applica(s){
    if(s.id==='originale')html.removeAttribute('data-stile');else html.setAttribute('data-stile',s.id);
    try{sessionStorage.setItem('stile',s.id)}catch(e){}
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',s.bg);
    try{var u=new URL(location.href);if(s.id==='originale')u.searchParams.delete('stile');else u.searchParams.set('stile',s.id);history.replaceState(null,'',u)}catch(e){}
    disegna();
  }
  // Cambio: la tenda del nuovo stile copre tutto, sotto si cambia vestito e si torna all'inizio, poi la tenda si ritira
  function vai(s){
    if(s.id===attuale())return;
    font(s.id);
    var t=document.createElement('div');t.className='tenda entra';t.style.background=s.bg;html.appendChild(t);
    requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.remove('entra')})});
    setTimeout(function(){
      applica(s);
      html.style.scrollSnapType='none';scrollTo(0,0);html.style.scrollSnapType='';
      if(window.ScrollTrigger)ScrollTrigger.refresh();
      setTimeout(function(){t.classList.add('via');setTimeout(function(){t.remove()},750)},300);
    },720);
  }

  var boxes=[].slice.call(document.querySelectorAll('[data-scelta]'));
  function disegna(){
    var cur=attuale();
    boxes.forEach(function(box){
      box.textContent='';
      STILI.forEach(function(s){
        var b=document.createElement('button');b.type='button';b.className='sc-btn';
        b.style.setProperty('--sb',s.bg);b.style.setProperty('--sf',s.fg);
        b.setAttribute('aria-pressed',String(s.id===cur));
        var sw=document.createElement('i');sw.textContent='Aa';sw.setAttribute('aria-hidden','true');
        var n=document.createElement('b');n.textContent=s.nome;
        b.appendChild(sw);b.appendChild(n);
        b.addEventListener('click',function(){vai(s)});
        box.appendChild(b);
      });
    });
  }
  disegna();
})();
