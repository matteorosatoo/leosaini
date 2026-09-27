// Scelta dello stile: la slide "Non ti ho ancora convinto?", prima dei contatti.
// Ogni stile è un "vestito" dello stesso sito (html[data-stile=…] nel CSS):
// stesse posizioni e animazioni, cambiano solo colori e caratteri.
// Si cambia stile scorrendo a destra o a sinistra sulla slide (o con le frecce / la tastiera).
// Per aggiungere uno stile: una riga qui (con la sua frase), il suo blocco CSS e il suo font in STILI_FONT.
(function(){
  var STILI=[
    {id:'originale',nome:'Red Light',bg:'#0A0A0A',frase:'Sei una persona da notte fonda? Red Light è nato tra le luci della città, per chi le serate le vive fino all’alba.'},
    {id:'couture',nome:'Couture',bg:'#F2EDE6',frase:'Hai l’occhio per la moda? Couture l’ho pensato per chi sfoglia le riviste dalla prima all’ultima pagina.'},
    {id:'poster',nome:'Poster',bg:'#FFE500',frase:'Ti piace farti notare? Poster è per chi entra in una stanza e tutti si girano a guardarlo.'},
    {id:'noir',nome:'Noir',bg:'#070707',frase:'Sei una persona elegante e un po’ misteriosa? Noir l’ho girato per chi aspetta sempre i titoli di coda.'},
    {id:'anni50',nome:'Anni ’50',bg:'#E8751A',frase:'Sei una persona retrò? Lo stile anni ’50 l’ho creato apposta per le persone come te.'}
  ];
  var html=document.documentElement;
  var css=document.createElement('style');
  css.textContent=
    '.tenda{position:fixed;inset:0;z-index:9999;pointer-events:none;transition:clip-path .42s cubic-bezier(.7,0,.2,1)}'+
    '.tenda.da-dx{clip-path:inset(0 0 0 100%)}.tenda.da-sx{clip-path:inset(0 100% 0 0)}.tenda.piena{clip-path:inset(0 0 0 0)}'+
    '.tenda.via-sx{clip-path:inset(0 100% 0 0)}.tenda.via-dx{clip-path:inset(0 0 0 100%)}';
  document.head.appendChild(css);

  function idx(){var id=html.getAttribute('data-stile')||'originale';for(var i=0;i<STILI.length;i++)if(STILI[i].id===id)return i;return 0}
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
  }

  var giostre=[].slice.call(document.querySelectorAll('[data-giostra]'));
  if(!giostre.length)return;
  // i font di tutti gli stili si caricano appena ci si avvicina alla slide, così il cambio è immediato
  var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){STILI.forEach(function(s){font(s.id)});io.disconnect()}},{rootMargin:'150% 0px'});
  giostre.forEach(function(g){io.observe(g)});

  var occupato=false;
  function vai(passo){
    if(occupato)return;occupato=true;
    var s=STILI[(idx()+passo+STILI.length)%STILI.length];
    font(s.id);
    // tenda del nuovo stile che entra dal lato verso cui si scorre, poi esce dall'altro
    var t=document.createElement('div');t.className='tenda '+(passo>0?'da-dx':'da-sx');t.style.background=s.bg;html.appendChild(t);
    requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('piena')})});
    setTimeout(function(){
      applica(s);disegna(true);
      t.classList.remove('piena');t.classList.add(passo>0?'via-sx':'via-dx');
      setTimeout(function(){t.remove();occupato=false},460);
    },440);
  }

  function disegna(nuovo){
    var i=idx(),s=STILI[i];
    giostre.forEach(function(g){
      g.querySelector('.g-nome').textContent=s.nome;
      g.querySelector('.g-frase').textContent=s.frase;
      [].forEach.call(g.querySelectorAll('.g-punti i'),function(p,k){p.classList.toggle('on',k===i)});
      g.setAttribute('aria-label','Stile attuale: '+s.nome);
      if(nuovo){g.classList.remove('arriva');void g.offsetWidth;g.classList.add('arriva')}
    });
  }

  giostre.forEach(function(g){
    var punti=g.querySelector('.g-punti');
    STILI.forEach(function(){punti.appendChild(document.createElement('i'))});
    g.querySelector('.g-prev').addEventListener('click',function(){vai(-1)});
    g.querySelector('.g-next').addEventListener('click',function(){vai(1)});
    // gesto orizzontale sulla slide intera: col dito (touch) o trascinando col mouse
    var zona=g.closest('section')||g,x0=null,y0=0;
    function inizio(x,y){x0=x;y0=y}
    function fine(x,y){if(x0===null)return;var dx=x-x0,dy=y-y0;x0=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)vai(dx<0?1:-1)}
    zona.addEventListener('touchstart',function(e){var t=e.touches[0];inizio(t.clientX,t.clientY)},{passive:true});
    zona.addEventListener('touchend',function(e){var t=e.changedTouches[0];fine(t.clientX,t.clientY)},{passive:true});
    zona.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')inizio(e.clientX,e.clientY)});
    zona.addEventListener('pointerup',function(e){if(e.pointerType==='mouse')fine(e.clientX,e.clientY)});
    // trackpad: scorrimento orizzontale
    var accum=0,blocco=0;
    zona.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();if(Date.now()<blocco)return;accum+=e.deltaX;if(Math.abs(accum)>60){vai(accum>0?1:-1);accum=0;blocco=Date.now()+900}},{passive:false});
    g.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){vai(1);e.preventDefault()}if(e.key==='ArrowLeft'){vai(-1);e.preventDefault()}});
  });
  disegna(false);
})();
