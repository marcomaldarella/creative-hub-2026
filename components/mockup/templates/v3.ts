// Estratto da public/mockup-corso/v3.html: stessi contenuti, ma montati dentro il vero SiteChrome
// (nav e footer reali) invece del menu ricostruito a mano.
export const css = `
  :host{
    /* un solo azzurro in tutto il sito: quello globale (--azzurro in
       globals.css). Il fallback serve solo se il template viene montato
       fuori dal sito. --pad NON e' ridefinito: eredita il gutter del
       sito, cosi' la pagina si allinea a nav e footer reali. */
    --blue:var(--azzurro,#71B8FF);
    --giallo:var(--giallo-fluo,#DEFF3B);
    --ink:#0A0A0A;
    --ink-2:#161616;
    --white:#FFFFFF;
    --blue-soft:color-mix(in srgb,var(--blue) 62%,var(--white));
    --blue-hover:color-mix(in srgb,var(--blue) 80%,var(--white));
    --blue-ink:color-mix(in srgb,var(--ink) 78%,var(--blue));
    --txt-2:rgba(255,255,255,.62);
    --hair:.5px;
  }
  :host,:host *{box-sizing:border-box;margin:0;padding:0;}
  :host{scroll-behavior:smooth;}
  :host{display:block;background:var(--ink);color:var(--white);
    font-family:var(--font-body),system-ui,sans-serif;padding-top:var(--header-h);
    font-size:16px;line-height:1.35;-webkit-font-smoothing:antialiased;}
  [id]{scroll-margin-top:calc(var(--header-h) + 18px);}
  img{display:block;width:100%;height:100%;object-fit:cover;}
  button{font-family:inherit;cursor:pointer;}
  [contenteditable="true"]{outline:none;}
  .arr{display:inline-flex;vertical-align:middle;}
  .arr svg{display:block;}
  .arr.w{transform:rotate(180deg);}


  header.site{display:flex;align-items:center;justify-content:space-between;
    padding:22px var(--pad);border-bottom:var(--hair) solid color-mix(in srgb,var(--blue) 30%,transparent);}
  header.site .logo{font-weight:700;font-size:20px;letter-spacing:-.01em;}
  nav.mainnav{display:flex;gap:32px;align-items:center;}
  nav.mainnav a{color:var(--blue);text-decoration:none;font-size:15px;font-weight:600;}
  .pill{appearance:none;border:none;border-radius:999px;padding:12px 26px;
    font-weight:600;font-size:14.5px;white-space:nowrap;
    display:inline-flex;align-items:center;gap:9px;}
  /* freccia del download: scende di un filo quando passi sul tasto */
  .pill .dl{transition:transform .25s cubic-bezier(.22,1,.36,1);}
  .pill:hover .dl{transform:translateY(2px);}
  .pill-dark{background:var(--blue);color:var(--ink);}
  .pill-dark:hover{background:var(--blue-hover);}
  .pill-outline{background:transparent;border:1px solid var(--ink);color:var(--ink);}
  /* variante per i tasti SOPRA una foto */
  .pill-white{background:transparent;border:1px solid rgba(255,255,255,.55);color:var(--white);
    backdrop-filter:blur(2px);}
  .pill-white:hover{background:var(--white);color:var(--ink);border-color:var(--white);}
  .pill-outline-ink{background:transparent;border:1px solid var(--blue);color:var(--blue);}
  .pill-outline-ink:hover{background:var(--blue);color:var(--ink);}

  .hero{display:grid;grid-template-columns:minmax(520px,45%) 1fr;min-height:calc(100dvh - 150px);}
  .hero-left{padding:44px var(--pad) 48px;display:flex;flex-direction:column;}
  .eyebrow{font-size:13px;font-weight:600;margin-bottom:18px;font-family:var(--font-body),system-ui,sans-serif;color:var(--blue);}
  h1.hero-h1{font-size:clamp(34px,4vw,54px);line-height:.96;font-weight:700;margin:0 0 22px;letter-spacing:-.02em;}
  .hero-sub{font-size:19px;font-weight:500;line-height:1.26;margin:0 0 40px;max-width:420px;}
  .meta-stack{display:flex;flex-direction:column;margin-top:auto;padding-top:40px;margin-bottom:34px;}
  .meta-stack>div{padding:18px 0;border-top:var(--hair) solid color-mix(in srgb,var(--blue) 30%,transparent);}
  .meta-stack>div:last-child{border-bottom:var(--hair) solid color-mix(in srgb,var(--blue) 30%,transparent);}
  .meta-stack>div{display:flex;align-items:baseline;justify-content:space-between;gap:16px;}
  .meta-stack .m-label{font-size:20px;font-weight:700;}
  .meta-stack .m-value{font-size:14.5px;color:var(--blue-soft);}
  .hero-cta{display:flex;flex-wrap:wrap;gap:12px;align-self:flex-start;}
  .hero-cta .pill{text-decoration:none;}
  .hero-right{position:relative;overflow:hidden;min-height:420px;}
  .hero-right img,.hero-right video{position:absolute;inset:0;
    width:100%;height:100%;object-fit:cover;display:block;}

  .marquee-wrap{background:var(--ink);overflow:hidden;padding:20px 0;white-space:nowrap;
    border-top:var(--hair) solid var(--white);border-bottom:var(--hair) solid var(--white);}
  /* due gruppi IDENTICI, ognuno con il proprio distacco di coda (padding-right):
     cosi' translate3d(-50%) coincide esattamente con la larghezza di un gruppo
     e la giunta e' invisibile. Con il gap sulla track mancava un distacco
     proprio nel punto di ricongiunzione. */
  .marquee-track{display:flex;width:max-content;animation:scroll 28s linear infinite;}
  /* stesso identico passo fra tutti gli elementi: frase - tasto - frase.
     Il distacco di coda del gruppo vale quanto il gap, altrimenti il
     ritmo salta nel punto di ricongiunzione del loop */
  .marquee-group{display:flex;align-items:center;gap:46px;padding-right:46px;}
  .mq-unit{display:flex;align-items:center;gap:46px;}
  .marquee-track span{color:var(--white);font-size:clamp(22px,2.4vw,30px);font-weight:700;letter-spacing:-.02em;}
  .marquee-track .pill{background:var(--ink);color:var(--white);border:1px solid var(--white);
    border-radius:999px;padding:12px 28px;font-size:16px;line-height:1.1;}
  @keyframes scroll{from{transform:translate3d(0,0,0);}to{transform:translate3d(-50%,0,0);}}

  section.block{padding:clamp(56px,8vw,96px) var(--pad);}
  section.block.tight{padding-top:32px;}
  h2.sec{font-size:clamp(30px,3.4vw,46px);font-weight:700;letter-spacing:-.02em;line-height:1.02;margin:0 0 26px;}
  /* il tasto si allinea al BASSO del blocco titolo+sottotitolo */
  .sec-flex-head{display:flex;justify-content:space-between;align-items:flex-end;
    flex-wrap:wrap;gap:20px;margin-bottom:40px;}
  .lede{font-size:18px;line-height:1.4;max-width:760px;margin:0 0 18px;font-weight:400;}
  .lede b{font-weight:700;}
  /* attacco svizzero: il primo capoverso sale di un gradino ed e' tutto
     in semibold, poi il testo torna alla misura di lettura.
     :first-child sul FIGLIO DIRETTO, altrimenti prende anche i
     paragrafi dentro altri blocchi della griglia */
  .pan-grid > div > .lede:first-child{font-size:21px;font-weight:600;
    line-height:1.3;letter-spacing:-.01em;margin-bottom:22px;}
  .pan-grid > div > .lede:first-child b{font-weight:inherit;}

  /* il video e' piu' alto del testo: le due colonne si centrano fra
     loro invece di partire entrambe dall'alto e lasciare un vuoto */
  .pan-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,60px);align-items:center;}
  .video-card{background:var(--ink);overflow:hidden;
    display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;position:relative;}
  .video-card img{position:absolute;inset:0;opacity:.45;}
  .video-card .play{width:64px;height:64px;border-radius:50%;background:var(--blue);
    display:flex;align-items:center;justify-content:center;position:relative;}
  .video-card .play::after{content:"";border-left:16px solid var(--ink);border-top:10px solid transparent;
    border-bottom:10px solid transparent;margin-left:4px;}
  .video-cap{position:absolute;top:16px;left:16px;color:#fff;font-size:14px;font-weight:600;z-index:1;}
  .video-cap small{display:block;font-weight:400;font-size:11px;opacity:.7;margin-top:2px;color:#fff;}

  /* indice di sezione: barra in AZZURRO pieno, tutto cio' che ci sta
     sopra in nero (l'azzurro e' chiaro: il bianco non reggerebbe) */
  .subnav{position:sticky;top:var(--header-h);z-index:40;background:var(--blue);
    border-bottom:var(--hair) solid color-mix(in srgb,var(--ink) 30%,transparent);
    display:flex;justify-content:space-between;align-items:stretch;gap:20px;
    padding:0 var(--pad);height:58px;}
  .subnav .course{display:flex;align-items:center;color:var(--ink);font-weight:700;font-size:14px;
    letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  /* le 4 voci si incolonnano sotto le voci del menu vero: la posizione
     arriva da JS (misura le voci nel light DOM), qui c'e' solo il
     ripiego quando il menu non c'e' — mobile o misura non riuscita */
  .subnav .jump{display:flex;align-items:stretch;gap:34px;overflow-x:auto;scrollbar-width:none;}
  .subnav .jump::-webkit-scrollbar{display:none;}
  /* allineata: il blocco parte alla stessa x della PRIMA voce del menu.
     Incolonnare ogni voce sotto la sua (le etichette sono piu' larghe
     delle voci di menu) le faceva toccare. */
  .subnav .jump.aligned{position:absolute;top:0;height:100%;overflow:visible;}
  .subnav .tail{display:flex;align-items:center;gap:26px;margin-left:auto;flex-shrink:0;}
  .subnav .jump a,.subnav .tail .year{position:relative;display:inline-flex;align-items:center;gap:3px;
    color:color-mix(in srgb,var(--ink) 62%,transparent);
    font-size:14px;font-weight:600;letter-spacing:-.025em;text-decoration:none;
    white-space:nowrap;transition:color .22s ease;}
  /* voce non cliccabile: dato, non link — ma nero pieno */
  .subnav .tail .year{color:var(--ink);cursor:default;}
  /* frecce di salto fra le sezioni numerate, in coda alla fila */
  .subnav .steps{display:flex;align-items:center;gap:6px;margin-left:2px;}
  .subnav .step{width:28px;height:28px;border-radius:50%;flex-shrink:0;
    border:1px solid color-mix(in srgb,var(--ink) 35%,transparent);background:transparent;
    color:var(--ink);display:inline-flex;align-items:center;justify-content:center;
    transition:background .2s ease,border-color .2s ease,opacity .2s ease;}
  .subnav .step:hover{background:var(--ink);color:var(--blue);border-color:var(--ink);}
  .subnav .step[disabled]{opacity:.3;pointer-events:none;}
  /* numero e nome della sezione hanno la STESSA misura: il numero piu'
     piccolo creava due allineamenti ottici diversi in ogni voce */
  .subnav .jump .idx{font-size:14px;font-weight:600;letter-spacing:-.025em;
    color:color-mix(in srgb,var(--ink) 38%,transparent);transition:color .22s ease;}
  .subnav .jump a:hover{color:var(--ink);}
  .subnav .jump a.is-active{color:var(--ink);}
  .subnav .jump a.is-active .idx{color:var(--ink);}
  /* voce attiva = mirino: quattro angoli disegnati con otto segmenti di
     gradiente in un solo pseudo-elemento (niente markup in piu') */
  .subnav .jump a::before{content:"";position:absolute;inset:15px -9px;pointer-events:none;
    --c:color-mix(in srgb,var(--ink) 55%,transparent);--t:1.5px;--l:7px;
    background:
      linear-gradient(var(--c),var(--c)) 0 0/var(--l) var(--t) no-repeat,
      linear-gradient(var(--c),var(--c)) 0 0/var(--t) var(--l) no-repeat,
      linear-gradient(var(--c),var(--c)) 100% 0/var(--l) var(--t) no-repeat,
      linear-gradient(var(--c),var(--c)) 100% 0/var(--t) var(--l) no-repeat,
      linear-gradient(var(--c),var(--c)) 0 100%/var(--l) var(--t) no-repeat,
      linear-gradient(var(--c),var(--c)) 0 100%/var(--t) var(--l) no-repeat,
      linear-gradient(var(--c),var(--c)) 100% 100%/var(--l) var(--t) no-repeat,
      linear-gradient(var(--c),var(--c)) 100% 100%/var(--t) var(--l) no-repeat;
    opacity:0;transform:scale(1.06);
    transition:opacity .22s ease,transform .3s cubic-bezier(.22,1,.36,1);}
  .subnav .jump a.is-active::before{opacity:1;transform:none;}

  /* intestazione centrata (titolo + lede) */
  .head-center{text-align:center;max-width:820px;margin:0 auto clamp(44px,5vw,64px);}
  .head-center h2.sec{margin-bottom:18px;}
  .head-center .lede{max-width:640px;margin:0 auto;}

  /* modulo competenze: griglia a filo con hairline ricavata dal gap
     (niente border sulle celle, cosi' le righe non raddoppiano mai) */
  .skillgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--hair);
    background:color-mix(in srgb,var(--blue) 28%,transparent);border:var(--hair) solid color-mix(in srgb,var(--blue) 28%,transparent);}
  /* misure FISSE, non legate alla larghezza della colonna: le sei celle
     devono leggersi come sei voci della stessa lista */
  .skill{background:var(--ink);padding:26px 26px 30px;
    display:flex;flex-direction:column;min-height:210px;transition:background .25s ease;}
  .skill:hover{background:var(--ink-2);}
  .skill .n{font-size:12.5px;font-weight:600;letter-spacing:.04em;color:var(--blue);
    margin-bottom:16px;}
  .skill h3{font-size:21px;font-weight:700;line-height:1.12;letter-spacing:-.02em;margin:0 0 10px;}
  .skill p{font-size:15px;line-height:1.4;color:var(--txt-2);margin:auto 0 0;max-width:30ch;}
  @media(max-width:1080px){.skillgrid{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:620px){.skillgrid{grid-template-columns:1fr;}.skill{min-height:0;}}

  .carousel{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;
    scrollbar-width:none;margin-right:calc(-1 * var(--pad));}
  .carousel::-webkit-scrollbar{display:none;}
  .fac-card{flex:0 0 calc((100% - 2 * 20px)/2.5);scroll-snap-align:start;background:transparent;color:var(--white);}
  .fac-card .img{aspect-ratio:4/3;overflow:hidden;}
  .fac-card .txt{padding:16px 0 0;}
  .fac-card h3{font-size:18px;font-weight:700;margin:0 0 8px;}
  .fac-card p{font-size:14px;line-height:1.4;margin:0;color:var(--txt-2);max-width:38ch;}
  /* comandi del carosello: pallini di posizione a sinistra delle frecce,
     sulla stessa riga */
  .carousel-nav{display:flex;align-items:center;gap:8px;justify-content:flex-end;margin-top:24px;}
  .dots{display:flex;align-items:center;gap:7px;margin-right:12px;}
  .dot{width:7px;height:7px;border-radius:50%;padding:0;border:none;flex-shrink:0;
    background:color-mix(in srgb,var(--blue) 30%,transparent);
    transition:background .25s ease,transform .25s ease;}
  .dot.on{background:var(--blue);transform:scale(1.25);}
  .cnav-btn{width:42px;height:42px;border-radius:50%;border:1px solid var(--blue);background:transparent;
    color:var(--blue);display:flex;align-items:center;justify-content:center;}
  .cnav-btn:hover{background:var(--blue);color:var(--ink);}

  /* struttura del corso: testo SEO a sinistra, accordion incolonnato
     sotto al tasto "Scarica il piano di studi" (stesso bordo destro) */
  .struct-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);
    gap:clamp(30px,4.5vw,84px);align-items:start;}
  .struct-text p{font-size:16px;line-height:1.42;color:var(--txt-2);margin:0 0 16px;max-width:54ch;}
  .struct-text p:last-child{margin-bottom:0;}
  .struct-text b{color:var(--white);font-weight:600;}
  /* stesso attacco svizzero della panoramica */
  .struct-text p:first-child{font-size:21px;font-weight:600;line-height:1.3;
    letter-spacing:-.01em;color:var(--white);margin-bottom:22px;max-width:40ch;}
  .struct-text p:first-child b{font-weight:inherit;}
  .struct-grid .accordion{max-width:none;margin-top:-22px;}
  @media(max-width:1000px){
    .struct-grid{grid-template-columns:1fr;gap:34px;}
    .struct-grid .accordion{margin-top:0;}
  }

  /* ————— mobile ————— */
  @media(max-width:760px){
    /* indice: via il nome del corso troncato e l'anno, restano le voci
       numerate (scorrono) e le frecce di salto */
    .subnav{gap:12px;height:54px;}
    .subnav .course,.subnav .tail .year{display:none;}
    .subnav .jump{gap:20px;flex:1;margin-right:0;padding-right:4px;}
    .subnav .jump a{font-size:13px;}
    .subnav .jump a::before{inset:13px -7px;--l:6px;}
    .subnav .tail{gap:0;}

    /* dati della hero: valore e etichetta uno sotto l'altro, altrimenti
       "3 anni full-time, fino a 6 part-time" va a capo contro "Durata" */
    .meta-stack>div{flex-direction:column;align-items:flex-start;gap:3px;padding:14px 0;}
    .meta-stack .m-label{font-size:18px;}
    .meta-stack{padding-top:28px;margin-bottom:26px;}
    .hero-left{padding-top:32px;padding-bottom:36px;}
    h1.hero-h1{font-size:clamp(30px,8.5vw,38px);}
    .hero-sub{font-size:17px;}

    /* titolo e tasto impilati: affiancati restavano schiacciati */
    .sec-flex-head{flex-direction:column;align-items:flex-start;gap:16px;margin-bottom:28px;}
    .sec-flex-head .pill{align-self:flex-start;}

    .skill{padding:22px 22px 26px;}
    .skill .n{margin-bottom:12px;}
    .pan-grid > div > .lede:first-child{font-size:19px;}
    .head-center{margin-bottom:34px;}
    section.block{padding:52px var(--pad);}
    section.block.tight{padding-top:28px;}
    .carousel-nav{justify-content:space-between;}
  }


  /* ammissioni: accordion a sinistra, riepilogo per parole chiave a
     destra sotto al tasto — si legge tutto a colpo d'occhio senza
     aprire una per una le voci */
  /* rientro: colonna stretta a sinistra per le informazioni di servizio,
     contenuto vero incolonnato piu' a destra (stesso impianto della
     sezione competenze della v2) */
  .adm-grid{display:grid;grid-template-columns:280px minmax(0,1fr);
    gap:clamp(30px,4.5vw,72px);align-items:start;}
  .adm-grid .accordion{max-width:none;}
  /* il riepilogo si appoggia in fondo alla colonna, all'altezza
     dell'ultima voce dell'accordion */
  .adm-keys{align-self:stretch;display:flex;flex-direction:column;justify-content:flex-end;}
  .adm-keys .keysIn{max-width:100%;}
  /* blocco piatto: nessun accento, nessun grassetto — e' informazione
     di margine, non deve competere con l'accordion */
  .adm-keys .kicker{font-size:12px;font-weight:400;letter-spacing:.04em;color:var(--txt-2);
    margin:0 0 12px;}
  .adm-keys ul{list-style:none;display:grid;gap:5px;}
  .adm-keys li{position:relative;padding-left:20px;font-size:14.5px;line-height:1.32;color:var(--txt-2);}
  .adm-keys li::before{content:"";position:absolute;left:0;top:.62em;width:9px;height:1px;background:var(--txt-2);}
  .adm-keys li b{color:inherit;font-weight:inherit;}
  @media(max-width:1000px){
    .adm-grid{grid-template-columns:1fr;gap:28px;}
    .adm-keys{order:1;}
  }

  .accordion{max-width:1000px;}
  .acc-item{border-top:var(--hair) solid color-mix(in srgb,var(--blue) 30%,transparent);}
  .accordion .acc-item:last-child{border-bottom:var(--hair) solid color-mix(in srgb,var(--blue) 30%,transparent);}
  .acc-head{display:flex;justify-content:space-between;align-items:center;padding:22px 0;cursor:pointer;}
  .acc-head h3{font-size:22px;font-weight:700;line-height:1.1;margin:0;}
  .acc-plus{flex-shrink:0;margin-left:20px;width:38px;height:38px;border-radius:999px;border:1px solid color-mix(in srgb,var(--blue) 40%,transparent);
    display:grid;place-items:center;}
  .acc-plus svg{transition:transform .25s ease;}
  .acc-item.open .acc-plus svg{transform:rotate(45deg);}
  .acc-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease;}
  .acc-body>div{overflow:hidden;min-height:0;}
  .acc-item.open .acc-body{grid-template-rows:1fr;}
  .acc-body p{font-size:15.5px;line-height:1.45;margin:0;padding:0 0 26px;font-weight:400;max-width:700px;}

  .promo-two{display:grid;grid-template-columns:1fr 1fr;min-height:420px;}
  /* foto libera: niente titolo sopra, quindi via anche la sfumatura
     che serviva solo a renderlo leggibile */
  .promo-photo{position:relative;overflow:hidden;}
  .promo-photo img{position:absolute;inset:0;}
  .promo-panel{background:var(--blue);color:var(--ink);padding:clamp(32px,4vw,56px);display:flex;flex-direction:column;
    justify-content:center;align-items:flex-start;}
  .promo-panel h2{font-size:clamp(26px,2.6vw,34px);font-weight:700;margin:0 0 18px;letter-spacing:-.01em;}
  .promo-panel p{font-size:15.5px;line-height:1.45;margin:0 0 26px;color:var(--blue-ink);max-width:460px;}

  /* due colonne uguali e larghe: la foto prende meta' schermo, quindi
     il taglio passa da verticale a quadrato */
  .split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,3.5vw,68px);
    align-items:center;padding:0 var(--pad);}
  .split .imgbox{aspect-ratio:1/1;overflow:hidden;}
  .split .imgbox video{width:100%;height:100%;object-fit:cover;display:block;}
  .split h2{font-size:clamp(28px,3vw,42px);font-weight:700;line-height:1.08;margin:0 0 24px;letter-spacing:-.02em;}
  .split p{font-size:16px;line-height:1.45;margin:0 0 16px;}
  .split p b{font-weight:700;}
  /* fascia a schermo pieno: foto a tutto campo, testo sopra in basso a
     sinistra. Il tetto a 940px evita che su monitor alti la foto venga
     tagliata a striscia e il testo resti sperduto in mezzo al nero. */
  .fullshot{position:relative;height:90svh;min-height:520px;max-height:940px;
    display:flex;align-items:flex-end;overflow:hidden;}
  /* il video di sfondo si comporta come la foto: copre tutto il palco.
     object-fit va dichiarato qui, la regola globale vale solo per img */
  .fullshot>img,.fullshot>video{position:absolute;inset:0;
    width:100%;height:100%;object-fit:cover;display:block;}
  .fullshot::after{content:"";position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(to top,rgba(10,10,10,.94) 0%,rgba(10,10,10,.6) 38%,
      rgba(10,10,10,.12) 68%,rgba(10,10,10,.42) 100%);}
  .fullshot .in{position:relative;z-index:1;width:100%;
    padding:clamp(40px,5vw,80px) var(--pad);}
  .fullshot h2{font-size:clamp(32px,4.4vw,64px);font-weight:700;letter-spacing:-.03em;
    line-height:1.02;margin:0 0 18px;max-width:14ch;}
  .fullshot p{font-size:14.5px;line-height:1.35;margin:0 0 9px;
    max-width:56ch;color:rgba(255,255,255,.82);}
  .fullshot .pill{margin-top:18px;}

  /* separatore di sezione: numerino a filo del margine sinistro e riga
     che corre fino al margine destro — dentro il gutter, non a tutta
     pagina come il vecchio bordo */
  .sezRule{display:flex;align-items:center;gap:16px;padding:0 var(--pad);
    margin-top:clamp(52px,6vw,96px);}
  /* il numerino sta SOPRA la riga, non in mezzo: cosi' legge come
     etichetta della sezione che comincia, non come parte del tratto */
  .sezRule span{flex-shrink:0;font-size:12px;font-weight:600;letter-spacing:.02em;
    color:var(--txt-2);align-self:flex-end;margin-bottom:-9px;}
  .sezRule i{flex:1;height:var(--hair);background:color-mix(in srgb,var(--white) 20%,transparent);}
  .teacher{display:grid;grid-template-columns:minmax(0,.4fr) minmax(0,1fr);
    gap:clamp(28px,4vw,64px);align-items:center;max-width:none;}
  .teacher .ph{aspect-ratio:4/5;overflow:hidden;background:var(--ink-2);}
  .teacher h3{font-size:clamp(24px,2.2vw,32px);font-weight:700;letter-spacing:-.02em;margin:0 0 4px;}
  .teacher .role{font-size:13px;font-family:var(--font-body),system-ui,sans-serif;margin-bottom:16px;color:var(--blue);}
  .teacher p{font-size:15.5px;line-height:1.4;max-width:52ch;}

  .cta-dark{margin:0 calc(-1 * var(--pad));position:relative;overflow:hidden;background:var(--blue);min-height:440px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 40px;}
  .cta-dark h2{position:relative;color:var(--ink);font-size:clamp(30px,3.4vw,46px);font-weight:700;
    line-height:1.1;margin:0 0 20px;max-width:720px;letter-spacing:-.02em;}
  .cta-dark p{position:relative;color:var(--blue-ink);font-size:17px;line-height:1.35;margin:0 0 30px;max-width:520px;}
  /* pastiglia nera sul colore pieno: testo BIANCO, l'azzurro su nero
     restava un terzo colore in mezzo alla fascia */
  .cta-dark .pill{position:relative;background:var(--ink);color:var(--white);}
  .cta-dark .pill:hover{background:var(--white);color:var(--ink);}

  /* testimonial a rotazione: le citazioni stanno tutte nella stessa
     cella di griglia e si scambiano in dissolvenza — cosi' l'altezza e'
     quella della piu' lunga e la sezione non salta a ogni cambio */
  /* frecce spinte ai due margini: lo spazio libero si distribuisce in
     parti uguali, quindi la citazione resta comunque centrata */
  .quotes{display:flex;align-items:center;justify-content:space-between;gap:clamp(14px,3vw,44px);}
  .qtrack{display:grid;flex:0 1 900px;min-width:0;}
  .qtrack blockquote{grid-area:1/1;opacity:0;visibility:hidden;transform:translateY(10px);
    transition:opacity .45s ease,transform .6s cubic-bezier(.22,1,.36,1),visibility 0s linear .45s;}
  .qtrack blockquote.is-on{opacity:1;visibility:visible;transform:none;
    transition:opacity .45s ease,transform .6s cubic-bezier(.22,1,.36,1);}
  blockquote.pull2{font-size:clamp(22px,2.2vw,30px);font-weight:600;line-height:1.35;letter-spacing:-.02em;
    max-width:900px;margin:0 auto;text-align:center;}
  @media(max-width:700px){
    .quotes{gap:10px;}
    .cnav-btn{width:36px;height:36px;}
  }
  blockquote.pull2 cite{display:block;margin-top:14px;font-size:13px;font-style:normal;font-weight:500;opacity:.7;}

  .connect-card{flex:0 0 calc((100% - 2 * 20px)/2.5);scroll-snap-align:start;}
  .connect-card .img{aspect-ratio:4/5;overflow:hidden;position:relative;background:var(--ink-2);
    display:flex;align-items:flex-start;padding:26px;margin-bottom:14px;}
  .connect-card .img h3{position:relative;color:#fff;font-size:32px;font-weight:700;
    line-height:1.02;margin:0;letter-spacing:-.02em;z-index:1;}
  .connect-card .img img{position:absolute;inset:0;opacity:.55;}
  .connect-card .cap2{font-size:15.5px;font-weight:600;display:flex;align-items:center;gap:8px;}

  footer.site{background:var(--ink);color:var(--white);padding:64px var(--pad) 28px;border-top:var(--hair) solid color-mix(in srgb,var(--blue) 30%,transparent);}
  .foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:32px;margin-bottom:44px;}
  .foot-col h4{font-size:12px;color:var(--blue-soft);margin:0 0 14px;font-weight:600;}
  .foot-col a{display:block;font-size:14.5px;color:var(--blue);text-decoration:none;margin-bottom:10px;}
  .foot-addr{font-size:14.5px;line-height:1.7;}
  .foot-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:24px;
    border-top:var(--hair) solid color-mix(in srgb,var(--blue) 25%,transparent);font-size:12.5px;color:var(--blue-soft);flex-wrap:wrap;gap:12px;}
  .foot-bottom a{color:var(--blue-soft);text-decoration:none;margin-left:14px;}

  @media(max-width:1000px){
    .hero{grid-template-columns:1fr;}
    .split{grid-template-columns:1fr;gap:30px;}
    .promo-two{grid-template-columns:1fr;}
    .teacher{grid-template-columns:1fr;gap:24px;}
    .teacher .ph{max-width:300px;}
    nav.mainnav{display:none;}
    .fac-card,.connect-card{flex-basis:calc((100% - 20px)/1.15);}
    .pan-grid{grid-template-columns:1fr;}
  }

  header.site{position:relative;z-index:100;}
  .mainnav.mega{gap:30px;}
  .navItem{position:relative;display:flex;align-items:center;height:100%;}
  .navLink{display:inline-flex;align-items:center;gap:6px;color:var(--blue);text-decoration:none;font-size:15px;font-weight:600;transition:color .2s;}
  .navItem:hover .navLink{color:var(--white);}
  .navLink .caret{transition:transform .2s ease;}
  .navItem:hover .navLink .caret{transform:rotate(180deg);}
  .panel{position:absolute;top:100%;left:calc(-1 * var(--pad));right:calc(-1 * var(--pad));background:var(--ink-2);border-top:var(--hair) solid color-mix(in srgb,var(--blue) 25%,transparent);border-bottom:var(--hair) solid color-mix(in srgb,var(--blue) 25%,transparent);opacity:0;visibility:hidden;transform:translateY(-6px);pointer-events:none;transition:opacity .18s ease,transform .22s ease,visibility 0s linear .18s;}
  .navItem:hover .panel,.navItem:focus-within .panel{opacity:1;visibility:visible;transform:none;pointer-events:auto;transition:opacity .2s ease,transform .24s ease;}
  .panelIn{display:grid;grid-template-columns:minmax(260px,400px) 1fr;gap:clamp(36px,5vw,90px);padding:34px var(--pad) 42px;align-items:start;}
  .panelHead{display:flex;flex-direction:column;align-items:flex-start;gap:10px;}
  .panelLabel{font-size:12.5px;letter-spacing:.04em;color:var(--blue);}
  .panelTitle{font-size:clamp(26px,2.6vw,40px);font-weight:700;letter-spacing:-.02em;line-height:.98;color:var(--blue);margin:0;}
  .panelDesc{font-size:14px;line-height:1.5;color:rgba(255,255,255,.55);max-width:36ch;margin:0;}
  .panelExplore{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:var(--blue);}
  .panelList{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(180px,max-content));grid-auto-flow:column;column-gap:clamp(36px,5vw,72px);row-gap:2px;align-content:start;}
  .panelEntry{font-size:15px;font-weight:500;padding:4px 0;color:var(--white);transition:color .15s;}
  .panelEntry:hover{color:var(--blue);}
  @media(max-width:1000px){
    .mainnav.mega{display:none;}
  }

  .topbar{display:flex;align-items:center;justify-content:space-between;gap:24px;
    padding:0 var(--pad);height:34px;font-size:11px;letter-spacing:.06em;
    border-bottom:var(--hair) solid var(--topbar-line, rgba(0,0,0,.2));overflow:hidden;}
  .topbar .topLeft,.topbar .topRight{white-space:nowrap;opacity:.85;}
  .topbar .topRight{display:flex;align-items:center;gap:16px;}
  .topbar .topRight a{color:inherit;text-decoration:none;}
  .topMid{flex:0 1 auto;width:min(560px,42vw);margin:0 auto;overflow:hidden;
    -webkit-mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);
    mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);}
  .topTrack{display:flex;width:max-content;animation:topScroll 24s linear infinite;}
  .topGroup{display:flex;align-items:center;gap:14px;padding-right:44px;white-space:nowrap;}
  @keyframes topScroll{to{transform:translate3d(-50%,0,0);}}
  .topClose{flex-shrink:0;width:18px;height:18px;display:inline-flex;align-items:center;
    justify-content:center;color:inherit;opacity:.6;background:none;border:none;padding:0;}
  .topClose:hover{opacity:1;}
  @media(max-width:900px){.topbar{display:none;}}

  .wordmark{font-weight:600;font-size:17px;letter-spacing:-.01em;white-space:nowrap;
    display:inline-flex;align-items:center;}
  .wordmark em{font-style:normal;display:inline-block;width:26px;height:1px;
    background:currentColor;margin:0 6px;}

  .langsw{font-size:12px;letter-spacing:.02em;color:inherit;opacity:.7;white-space:nowrap;}
  .langsw b{font-weight:600;opacity:1;}

  .siteHead{position:sticky;top:0;z-index:100;background:var(--ink);}
`;

export const html = `
<div class="hero">
  <div class="hero-left">
    <div class="eyebrow" contenteditable="true">Academy · Bachelor of Arts</div>
    <h1 class="hero-h1" contenteditable="true">Corso universitario di produzione musicale a Bologna.</h1>
    <p class="hero-sub" contenteditable="true">Diventa produttore musicale con il Bachelor of Arts in Urban Music Production.</p>

    <div class="meta-stack">
      <div>
        <div class="m-label" contenteditable="true">Ottobre 2026</div>
        <div class="m-value" contenteditable="true">Inizio corso</div>
      </div>
      <div>
        <div class="m-label" contenteditable="true">30 giugno 2026</div>
        <div class="m-value" contenteditable="true">Scadenza candidature (posti limitati)</div>
      </div>
      <div>
        <div class="m-label" contenteditable="true">3 anni full-time, fino a 6 part-time</div>
        <div class="m-value" contenteditable="true">Durata</div>
      </div>
    </div>

    <div class="hero-cta">
      <button class="pill pill-dark"><span contenteditable="true">Scarica il piano di studi</span><svg class="dl" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 4v13M6 11l6 6 6-6"/></svg></button>
      <a class="pill pill-outline-ink" href="#panoramica"><span contenteditable="true">Maggiori informazioni</span></a>
    </div>
  </div>
  <div class="hero-right"><video src="/video/creative-hub-8s-02-1920x1080.mp4" data-src-portrait="/video/creative-hub-8s-02-1080x1920.mp4" poster="/mockup-corso/img/akai.jpg" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video></div>
</div>

<div class="marquee-wrap">
  <div class="marquee-track">
    <div class="marquee-group">
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill">Candidati ora</button></div>
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill">Candidati ora</button></div>
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill">Candidati ora</button></div>
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill">Candidati ora</button></div>
    </div>
    <div class="marquee-group" aria-hidden="true">
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill" tabindex="-1">Candidati ora</button></div>
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill" tabindex="-1">Candidati ora</button></div>
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill" tabindex="-1">Candidati ora</button></div>
      <div class="mq-unit"><span>Candidati entro il 30 Giugno per iniziare a Ottobre</span><button class="pill" tabindex="-1">Candidati ora</button></div>
    </div>
  </div>
</div>

<div class="sezRule"><span>01</span><i></i></div>

<section class="block tight" id="panoramica" style="padding-top:56px;">
  <h2 class="sec" contenteditable="true">Panoramica</h2>
  <div class="pan-grid">
  <div>
  <p class="lede" contenteditable="true">Non è una scuola di produzione musicale come le altre: da Creative Hub Academy esci con un <b>titolo universitario</b>, non con un attestato di partecipazione.</p>
  <p class="lede" contenteditable="true">Ableton, Pro Tools, FL Studio, sintetizzatori e plugin professionali dal primo giorno. Le stesse macchine che trovi negli studi dove andrai a lavorare. La teoria c'è, ma è tarata su hip-hop, rap, R&amp;B ed elettronica — non sul solfeggio. Se non sai leggere uno spartito non è un problema: si parte da come funziona un beat.</p>
  <p class="lede" contenteditable="true">Durante il percorso lavori su progetti reali con artisti e aziende del network. Il portfolio te lo costruisci prima del titolo, non dopo.</p>
  </div>
  <div class="video-card">
    <img src="/mockup-corso/img/class-2.jpg" alt="">
    <div class="video-cap" contenteditable="true">Urban Music Production al Creative Hub<small>Creative Hub Academy — Bologna</small></div>
    <div class="play"></div>
  </div>
  </div>
</section>

<div class="subnav">
  <div class="course" contenteditable="true">Urban Music Production — Bachelor of Arts</div>
  <nav class="jump" aria-label="sezioni del corso">
    <a href="#panoramica"><span class="idx">01.</span><span>Panoramica</span></a>
    <a href="#struttura"><span class="idx">02.</span><span>Struttura</span></a>
    <a href="#ammissioni"><span class="idx">03.</span><span>Ammissioni</span></a>
    <a href="#connetti"><span class="idx">04.</span><span>Connettiti</span></a>
  </nav>
  <span class="tail">
    <span class="year">A.A. 2026/2027</span>
    <span class="steps">
      <button class="step" data-step="-1" aria-label="sezione precedente"><span class="arr w"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
      <button class="step" data-step="1" aria-label="sezione successiva"><span class="arr"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
    </span>
  </span>
</div>

<div class="sezRule"><span></span><i></i></div>

<section class="block">
  <div class="head-center">
    <h2 class="sec" contenteditable="true">Competenze che svilupperai</h2>
    <p class="lede" contenteditable="true">Durante il corso costruisci le competenze creative e tecniche per portare un'idea dal loop iniziale al brano pubblicato, dallo studio al palco.</p>
  </div>
  <div class="skillgrid">
    <article class="skill">
      <span class="n">01</span>
      <h3 contenteditable="true">Beatmaking e produzione</h3>
      <p contenteditable="true">Dal loop al brano finito: arrangiamento e programmazione ritmica.</p>
    </article>
    <article class="skill">
      <span class="n">02</span>
      <h3 contenteditable="true">Sound design</h3>
      <p contenteditable="true">Costruire i suoni invece di scaricarli: sintesi e campionamento.</p>
    </article>
    <article class="skill">
      <span class="n">03</span>
      <h3 contenteditable="true">Mix e mastering</h3>
      <p contenteditable="true">Allo standard dello streaming, sulle macchine della regia.</p>
    </article>
    <article class="skill">
      <span class="n">04</span>
      <h3 contenteditable="true">DJing e performance live</h3>
      <p contenteditable="true">Set, mixaggio dal vivo, presenza sul palco.</p>
    </article>
    <article class="skill">
      <span class="n">05</span>
      <h3 contenteditable="true">Teoria musicale</h3>
      <p contenteditable="true">Applicata direttamente su Ableton, non sullo spartito.</p>
    </article>
    <article class="skill">
      <span class="n">06</span>
      <h3 contenteditable="true">Music business</h3>
      <p contenteditable="true">Diritto d'autore, distribuzione digitale, contratti.</p>
    </article>
  </div>
</section>

<section class="block tight">
  <div class="sec-flex-head">
    <div>
      <h2 class="sec" style="margin-bottom:4px;" contenteditable="true">Il tuo studio di lavoro</h2>
      <p class="lede" style="margin-bottom:0;" contenteditable="true">Progettato per come si impara, si produce e si suona.<br>Ogni dettaglio pensato per chi studia qui.</p>
    </div>
    <button class="pill pill-outline-ink" contenteditable="true">Esplora lo studio</button>
  </div>

  <div class="carousel" id="facCarousel">
    <div class="fac-card">
      <div class="img"><img src="/img/sections/studio-regia.jpg" alt="Regia SSL"></div>
      <div class="txt">
        <h3 contenteditable="true">Regia SSL XL Desk</h3>
        <p contenteditable="true">55 m² di regia con console SSL XL Desk, per registrazione, mix e mastering a livello professionale.</p>
      </div>
    </div>
    <div class="fac-card">
      <div class="img"><img src="/img/sections/studio-regia-b.jpg" alt="Regia B"></div>
      <div class="txt">
        <h3 contenteditable="true">Sala live</h3>
        <p contenteditable="true">Presa diretta con la band intera nella stessa stanza, ISO box incluso.</p>
      </div>
    </div>
    <div class="fac-card">
      <div class="img"><img src="/img/sections/studio-desk.jpg" alt="Postazione studio"></div>
      <div class="txt">
        <h3 contenteditable="true">Tre cabine B-Ear</h3>
        <p contenteditable="true">Voce, podcast e doppiaggio: tre cabine dedicate per ogni tipo di registrazione vocale.</p>
      </div>
    </div>
    <div class="fac-card">
      <div class="img"><img src="/mockup-corso/img/class-1.jpg" alt="Aula"></div>
      <div class="txt">
        <h3 contenteditable="true">Aule di produzione</h3>
        <p contenteditable="true">Postazioni individuali con DAW, monitor e controller — le stesse macchine dei corsi.</p>
      </div>
    </div>
  </div>
  <div class="carousel-nav">
    <button class="cnav-btn" aria-label="indietro" data-scroll-id="facCarousel" data-scroll-by="-400"><span class="arr w"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
    <button class="cnav-btn" aria-label="avanti" data-scroll-id="facCarousel" data-scroll-by="400"><span class="arr"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
  </div>
</section>

<div class="sezRule"><span>02</span><i></i></div>

<section class="block tight" id="struttura">
  <div class="sec-flex-head">
    <h2 class="sec" style="margin-bottom:0;" contenteditable="true">Struttura del corso</h2>
    <button class="pill pill-outline-ink"><span contenteditable="true">Scarica il piano di studi</span><svg class="dl" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 4v13M6 11l6 6 6-6"/></svg></button>
  </div>

  <div class="struct-grid">
  <div class="struct-text">
    <p contenteditable="true">Il corso di produzione musicale del Creative Hub di Bologna dura tre anni full-time, fino a sei part-time.</p>
    <p contenteditable="true">Ogni anno mette insieme laboratorio e teoria: si lavora su Ableton, Pro Tools e FL Studio, con un'ora di lezione individuale a settimana.</p>
    <p contenteditable="true">Dal <b>beatmaking</b> al <b>mix e mastering</b>, fino al music business: a fine triennio hai un portfolio di brani pubblicati, non un attestato.</p>
  </div>

  <div class="accordion" id="yearAccordion">
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Primo anno</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Fondamenti di beatmaking, teoria applicata alla musica elettronica, primi strumenti DAW. Un'ora di lezione individuale a settimana.</p></div></div>
    </div>
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Secondo anno</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Sound design avanzato, mix e mastering, primi progetti con artisti del network. Music business e diritto d'autore.</p></div></div>
    </div>
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Terzo anno</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Progetto finale, DJing e performance live, costruzione del portfolio professionale prima del titolo.</p></div></div>
    </div>
  </div>
  </div>
</section>

<div class="promo-two">
  <div class="promo-photo">
    <img src="/mockup-corso/img/class-3.jpg" alt="">
  </div>
  <div class="promo-panel">
    <h2 contenteditable="true">Partecipa a un workshop di prova</h2>
    <p contenteditable="true">Incontra i nostri tutor di Urban Music Production e scopri come il corso può accompagnare il tuo percorso da producer, beatmaker o sound designer.</p>
    <button class="pill pill-outline" contenteditable="true">Vedi i prossimi workshop</button>
  </div>
</div>

<div class="sezRule"><span>03</span><i></i></div>

<section class="block" id="ammissioni">
  <div class="adm-grid">
  <aside class="adm-keys">
    <div class="keysIn">
    <p class="kicker" contenteditable="true">In breve</p>
    <ul>
      <li contenteditable="true">Serve il <b>diploma</b> di scuola superiore</li>
      <li contenteditable="true">Colloquio motivazionale, <b>non un'audizione</b></li>
      <li contenteditable="true">Rette da <b>294€ al mese</b>, a tasso zero</li>
    </ul>
    </div>
  </aside>

  <div class="adm-main">
  <div class="sec-flex-head">
    <h2 class="sec" style="margin-bottom:0;" contenteditable="true">Ammissioni</h2>
    <button class="pill pill-outline-ink" contenteditable="true">Come candidarsi</button>
  </div>

  <div class="accordion" id="admAccordion">
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Requisiti di ammissione</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Diploma di scuola superiore, o titolo estero equivalente. Un colloquio motivazionale, non un'audizione: non serve saper già suonare o leggere la musica.</p></div></div>
    </div>
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Date del corso e scadenze</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Inizio corso: ottobre 2026. Candidati entro il 30 giugno per 300€ di sconto e uno slot garantito con il tuo tutor. Venti posti all'anno.</p></div></div>
    </div>
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Rette — da 294€ al mese</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Full-time: anticipo 488€ + 11 rate da 392€, tasso zero. Part-time: anticipo 366€ + 11 rate da 294€. Tassa di certificazione separata. Sconto 5% per pagamento anticipato.</p></div></div>
    </div>
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Opportunità di finanziamento</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Rate a tasso zero senza interessi. Borse di studio disponibili: scrivici per sapere quali.</p></div></div>
    </div>
    <div class="acc-item">
      <div class="acc-head"><h3 contenteditable="true">Open day, colloqui e workshop di prova</h3><span class="acc-plus"><svg viewBox="0 0 18 18" width="16" height="16" stroke="currentColor" stroke-width="1.4"><path d="M9 3v12M3 9h12"/></svg></span></div>
      <div class="acc-body"><div><p contenteditable="true">Vieni a vedere prima di candidarti. Puoi partecipare anche con i tuoi genitori.</p></div></div>
    </div>
  </div>
  </div>
  </div>
</section>

<section class="fullshot">
  <video src="/video/creative-hub-8s-1920x1080.mp4" data-src-portrait="/video/creative-hub-8s-1080x1920.mp4" poster="/mockup-corso/img/wide.jpg" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>
  <div class="in">
    <h2 contenteditable="true">La vita in Academy</h2>
    <p contenteditable="true">Al Creative Hub non produci musica da solo. Lavori in studi professionali, ti confronti con altri studenti e artisti del network, partecipi a sessioni con producer e A&amp;R in visita.</p>
    <p contenteditable="true">Presenta i tuoi progetti in ascolti collettivi, collabora con chi studia Film Production o Music Business per progetti trasversali, ricevi feedback costruttivi da chi il mercato lo vive ancora.</p>
    <button class="pill pill-white" contenteditable="true">Scopri la vita in Academy</button>
  </div>
</section>

<div class="sezRule"><span>04</span><i></i></div>

<section class="block tight" id="connetti">
  <div class="sec-flex-head">
    <div>
      <h2 class="sec" style="margin-bottom:4px;" contenteditable="true">Come conoscerci</h2>
      <p class="lede" style="margin-bottom:0;" contenteditable="true">In presenza o online, non vediamo l'ora di incontrarti.</p>
    </div>
    <button class="pill pill-outline-ink" contenteditable="true">Vedi tutti gli eventi</button>
  </div>

  <div class="carousel" id="connCarousel">
    <div class="connect-card">
      <div class="img"><img src="/mockup-corso/img/class-1.jpg" alt=""><h3 contenteditable="true">Open day</h3></div>
      <div class="cap2"><span contenteditable="true">Partecipa a un open day, in sede o online</span><span class="arr"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></div>
    </div>
    <div class="connect-card">
      <div class="img"><img src="/img/sections/studio-regia.jpg" alt=""><h3 contenteditable="true">Tour dello studio</h3></div>
      <div class="cap2"><span contenteditable="true">Prenota una visita alla regia e alla sala live</span><span class="arr"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></div>
    </div>
    <div class="connect-card">
      <div class="img"><img src="/mockup-corso/img/zilocchi.jpg" alt=""><h3 contenteditable="true">Parla con un tutor</h3></div>
      <div class="cap2"><span contenteditable="true">Una chiamata individuale per tutte le tue domande</span><span class="arr"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></div>
    </div>
  </div>
  <div class="carousel-nav">
    <button class="cnav-btn" aria-label="indietro" data-scroll-id="connCarousel" data-scroll-by="-400"><span class="arr w"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
    <button class="cnav-btn" aria-label="avanti" data-scroll-id="connCarousel" data-scroll-by="400"><span class="arr"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
  </div>
</section>

<section class="block">
  <div class="split">
    <div class="imgbox"><video src="/video/creative-hub-6s-03-1080x1920.mp4" poster="/mockup-corso/img/class-4.jpg" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video></div>
    <div>
      <h2 contenteditable="true">Nessun genere. Un metodo.</h2>
      <p contenteditable="true">La musica urban cambia continuamente, e lo trattiamo come condizione di studio. Non ti chiediamo di aderire a uno stile o a una scena. <b>Ci concentriamo sul tuo sviluppo artistico e sulla capacità critica</b>: come pensi, come lavori, dove vuoi portare la tua musica.</p>
      <p contenteditable="true">Che la tua base sia trap, hip-hop, R&amp;B o elettronica, diamo priorità alla profondità e alla direzione, non all'etichetta di genere. Ci aspettiamo che tu <b>rischi, testi idee e ampli il tuo raggio creativo</b>, sviluppando la capacità di argomentare le tue scelte.</p>
      <p contenteditable="true">Le nostre sessioni uniscono la pratica alla riflessione. Esaminiamo le ragioni dietro un lavoro tanto quanto le tecniche usate per produrlo.</p>
    </div>
  </div>
</section>

<div class="sezRule"><span></span><i></i></div>

<section class="block tight">
  <h2 class="sec" contenteditable="true">Chi ti accompagna</h2>
  <div class="teacher">
    <div class="ph"><img src="/mockup-corso/img/zilocchi.jpg" alt="Nicolò Zilocchi"></div>
    <div>
      <h3 contenteditable="true">Nicolò Zilocchi</h3>
      <div class="role" contenteditable="true">Course leader · Urban Music Production</div>
      <p contenteditable="true">Producer e beatmaker, guida il percorso di Urban Music Production. Segue ogni studente con un'ora di lezione individuale a settimana, dal primo loop al progetto finale.</p>
    </div>
  </div>
</section>

<section class="block tight">
  <div class="cta-dark">
    <h2 contenteditable="true">Non sai quale corso scegliere?</h2>
    <p contenteditable="true">Nessun problema. Ti aiutiamo a trovare il percorso in musica, sound o visual che parla di più a te.</p>
    <button class="pill" contenteditable="true">Scopri di più</button>
  </div>
</section>

<section class="block tight" style="padding-bottom:clamp(72px,8vw,110px);">
  <div class="quotes" id="quotes">
    <button class="cnav-btn qnav" data-q="-1" aria-label="citazione precedente"><span class="arr w"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
    <div class="qtrack">
      <blockquote class="pull2 is-on">
        <span contenteditable="true">"Qui non impari solo a usare un software. Impari a finire un pezzo, a farlo suonare come quelli che ascolti, e a portarlo fuori dalla tua stanza."</span>
        <cite contenteditable="true">— studente, Urban Music Production, terzo anno</cite>
      </blockquote>
      <blockquote class="pull2">
        <span contenteditable="true">"Sono entrato che sapevo aprire Ableton e basta. Sono uscito con sei brani pubblicati e due clienti che mi richiamano."</span>
        <cite contenteditable="true">— studente, Urban Music Production, diplomato 2025</cite>
      </blockquote>
      <blockquote class="pull2">
        <span contenteditable="true">"L'ora individuale a settimana è la differenza. Qualcuno che ascolta il tuo pezzo davvero, ogni settimana, e ti dice dove non funziona."</span>
        <cite contenteditable="true">— studentessa, Urban Music Production, secondo anno</cite>
      </blockquote>
    </div>
    <button class="cnav-btn qnav" data-q="1" aria-label="citazione successiva"><span class="arr"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h15M13 5l7 7-7 7"/></svg></span></button>
  </div>
</section>
`;
