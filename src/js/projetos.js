/* ========== 6) principais projetos: carrossel em arco ========== */
/* Os projetos ficam todos aqui. Para incluir, remover ou mudar a ordem, edite esta lista
   (o conteúdo das páginas de cada projeto fica em src/projetos_pages.py).
   name, category  nome e tipo de solução
   tagline         o que o site resolve, numa linha curta (aparece sob o nome)
   description     o que é o site e para quem, em linguagem de cliente
   features        o que o site faz por quem visita (uma frase por item; até três cabem bem)
   page            a página do projeto, com o site funcionando e a explicação completa
   image           retrato 680×1100 em assets/projetos/ (as capturas do projeto compostas sobre uma cor da Lorz)
   bg              versão pequena da captura, usada desfocada no fundo da seção
   alt             o que a imagem mostra, para leitores de tela
   status          'real' (trabalho para um negócio real), 'conceitual' (estudo sem cliente) ou 'demonstrativo' (exemplo fictício)
   url             endereço publicado (opcional); sem url, só a página do projeto aparece */
const PROJECTS = [
  { name: 'Flat Jardim Serrano', category: 'Site completo · Hospedagem', status: 'real', url: null,
    tagline: 'Reservas pelo WhatsApp, com a mensagem pronta', page: 'projeto-flat-jardim-serrano.html',
    image: 'assets/projetos/flat.webp', bg: 'assets/projetos/flat-fundo.webp',
    alt: 'Site do Flat Jardim Serrano no computador e no celular, com o seletor de flats em destaque',
    description: 'Site de uma hospedagem com sete flats para casais. Ajuda o hóspede a escolher e envia o pedido de reserva pronto para o WhatsApp.',
    features: [
      'O hóspede marca o que não pode faltar e vê só os flats que têm tudo.',
      'Escolhe as datas, e o site abre o WhatsApp com a mensagem escrita e as noites contadas.',
      'Cada flat tem sua página, com fotos, o que está incluso e as regras da casa.',
    ] },
  { name: 'Brasa', category: 'Site e pedido online · Hamburgueria', status: 'conceitual', url: null,
    tagline: 'Pedido online, da sacola ao Pix', page: 'projeto-brasa.html',
    image: 'assets/projetos/brasa.webp', bg: 'assets/projetos/brasa-fundo.webp',
    alt: 'Site da Brasa com o hambúrguer em 3D separado em camadas, a sacola no celular e o pagamento por Pix',
    description: 'Site de hamburgueria com cardápio e pedido online: o cliente monta o pedido e paga sem sair do site. Projeto conceitual, em versão de teste.',
    features: [
      'Na abertura, o hambúrguer em 3D gira com o dedo e se desmonta ao descer a página.',
      'A sacola fica guardada, mesmo se o cliente fechar a página sem querer.',
      'Entrega ou retirada, e pagamento por Pix, cartão na entrega ou dinheiro com troco.',
    ] },
  { name: 'Isadora Guirelli', category: 'Landing page · Saúde capilar', status: 'real', url: null,
    tagline: 'Orienta antes do primeiro contato', page: 'projeto-isadora-guirelli.html',
    image: 'assets/projetos/isa.webp', bg: 'assets/projetos/isa-fundo.webp',
    alt: 'Site de Isadora Guirelli no computador e no celular, com os caminhos Sinais de atenção e Cuidados',
    description: 'Site de uma especialista em saúde capilar. Explica os sinais de queda e afinamento dos fios e leva a pessoa até o WhatsApp.',
    features: [
      'Quatro atalhos logo no início levam cada pessoa ao que ela procura.',
      'Páginas curtas explicam o que observar e quando procurar um dermatologista.',
      'No celular, o botão de WhatsApp acompanha a leitura sem cobrir o texto.',
    ] },
  { name: 'Belisca!', category: 'Loja virtual · Snacks', status: 'conceitual', url: null,
    tagline: 'Do catálogo ao checkout, sem sair da loja', page: 'projeto-belisca.html',
    image: 'assets/projetos/belisca.webp', bg: 'assets/projetos/belisca-fundo.webp',
    alt: 'Loja Belisca no computador e no celular, com a vitrine de salgados, o carrinho e a primeira etapa do checkout',
    description: 'Loja virtual de uma mercearia de snacks com doze produtos. O cliente busca, filtra, monta o carrinho e segue pelo checkout. Projeto conceitual, com checkout demonstrativo.',
    features: [
      'O catálogo tem busca e filtros por categoria, marca, preço e tipo.',
      'O carrinho fica guardado, aceita cupom e avisa quanto falta para o frete grátis.',
      'O checkout anda uma etapa por vez, com o resumo do pedido sempre à vista.',
    ] },
  { name: 'Helios 44-2', category: 'Página de produto · 3D', status: 'conceitual', url: null,
    tagline: 'O produto se desmonta conforme a rolagem', page: 'projeto-helios-44-2.html',
    image: 'assets/projetos/helios.webp', bg: 'assets/projetos/helios-fundo.webp',
    alt: 'Página da lente Helios 44-2 no computador e no celular, com o modelo 3D inteiro e depois aberto em peças',
    description: 'Página que apresenta uma objetiva fotográfica clássica por dentro. O modelo 3D se abre peça por peça enquanto a pessoa rola. Projeto conceitual.',
    features: [
      'Nove capítulos, da história da lente à vista de todas as peças em linha.',
      'Cada peça recebe um número, um nome e uma frase sobre o que faz.',
      'O mesmo modelo 3D roda no celular, com o texto reorganizado para a tela estreita.',
    ] },
];
const STATUS = { demonstrativo: 'Projeto demonstrativo', conceitual: 'Projeto conceitual', real: '', publicado: '' };
// the caption of one project, built with textContent (the list is data, never markup)
function capNode(p, i, n, part){
  const flag = STATUS[p.status] || '', c = document.createElement('div'); c.className = 'pj-cap';
  if (part === 'head'){
    c.innerHTML = `${flag ? '<p class="pj-meta"><span class="pj-flag"></span></p>' : ''}
      <h3 class="pj-name"></h3><i class="pj-rule" aria-hidden="true"></i><p class="pj-stack"></p><span class="sr">${p.category}. Projeto ${i + 1} de ${n}.</span>`;
    c.querySelector('.pj-name').textContent = p.name;
    c.querySelector('.pj-stack').textContent = p.tagline || '';
    if (flag) c.querySelector('.pj-flag').textContent = flag;
  } else {
    c.innerHTML = `<p class="pj-desc"></p>${(p.features || []).length ? '<ul class="pj-feats" aria-label="O que o site faz"></ul>' : ''}
      <p class="pj-links">${p.page ? '<a class="pj-open btn"></a>' : ''}${p.url ? '<a class="pj-site" target="_blank" rel="noopener">Abrir o site<span class="sr"> (abre em nova aba)</span></a>' : ''}</p>`;
    c.querySelector('.pj-desc').textContent = p.description;
    (p.features || []).forEach(f => { const li = document.createElement('li'); li.textContent = f; c.querySelector('.pj-feats').appendChild(li); });
    if (p.page){ const a = c.querySelector('.pj-open'); a.href = p.page; a.textContent = 'Ver e testar o projeto'; }
    if (p.url) c.querySelector('.pj-site').href = p.url;
  }
  [...c.children].forEach((k, m) => k.style.setProperty('--i', m));
  return c;
}

(function projects(){
  const sec = $('#projetos'); if (!sec || !PROJECTS.length) return;
  const stage = $('.pj-stage', sec), track = $('.pj-track', sec), capBox = $('.pj-caption', sec), detBox = $('.pj-detail', sec), bgBox = $('.pj-bg', sec);
  const BOXES = [[capBox, 'head'], [detBox, 'body']];
  const nowEl = $('.pj-now', sec), barEl = $('.pj-bar i', sec);
  const n = PROJECTS.length, pad = (k) => String(k).padStart(2, '0');
  $('.pj-total', sec).textContent = pad(n);
  // the list is repeated until the ring has at least eight cards, so the ones on the far side turn round out of sight
  const copies = Math.max(1, Math.ceil(8 / n)), N = n * copies;
  const panels = [];
  for (let j = 0; j < N; j++){
    const p = PROJECTS[j % n], el = document.createElement('div');
    el.className = 'pj-card'; el.dataset.j = j;
    el.innerHTML = `<div class="pj-lift"><img src="${p.image}" alt="" width="680" height="1100" decoding="async" ${j < n ? '' : 'loading="lazy"'} draggable="false"><span class="pj-dim"></span><span class="pj-peek" aria-hidden="true"><b class="pj-peek-name"></b></span></div>`;
    el.querySelector('.pj-peek-name').textContent = p.name;
    track.appendChild(el); panels.push({ el, img: el.querySelector('img'), state: '', shown: true });
  }
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const mod = (v, m) => ((v % m) + m) % m;
  const near = (v) => { let d = mod(v, N); if (d > N / 2) d -= N; return d; };   // signed distance round the ring
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* The wheel. `pos` is where the ring is and `target` where it is going, both in cards and both unbounded (the ring
     never rewinds); every frame `pos` covers a fixed share of what is left, so it slows down as it arrives. Each card's
     place on the arc, tilt, size, blur and light all come from one number: its distance from the centre. */
  let pos = 0, target = 0, active = 0, central = 0, raf = 0, last = 0;
  let R = 2, pw = 300, spacing = 264, radius = 1380, stepDeg = 11;   // set by measure()
  const LERP = 0.075, LERP_DRAG = 0.34;

  function render(){
    const mob = R === 1, shrink = mob ? .2 : .16, fade = mob ? .3 : .24;
    for (let j = 0; j < N; j++){
      const pnl = panels[j], d = near(j - pos), a = Math.abs(d), st = pnl.el.style;
      if (a > R + .75){ if (pnl.shown){ pnl.shown = false; st.visibility = 'hidden'; } continue; }
      if (!pnl.shown){ pnl.shown = true; st.visibility = ''; }
      const deg = d * stepDeg, th = deg * Math.PI / 180;
      const x = Math.sin(th) * radius, y = (1 - Math.cos(th)) * radius;
      st.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${deg.toFixed(2)}deg) scale(${(1 - shrink * a).toFixed(4)})`;
      // full up to the last card that shows, then gone over the next three quarters of a step
      st.opacity = (a <= R ? 1 - fade * a : Math.max(0, (1 - fade * R) * (1 - (a - R) / .7))).toFixed(3);
      const far = Math.min(a, 2);
      st.filter = a < .02 ? '' : `blur(${(1.6 * far).toFixed(2)}px) saturate(${(1 - .13 * far).toFixed(3)}) brightness(${(1 - .12 * far).toFixed(3)})`;
      st.zIndex = String(20 - Math.round(a * 5));
      st.setProperty('--near', Math.max(0, 1 - a).toFixed(3));
      const state = a < .5 ? 'on' : d > 0 ? 'side right' : 'side';
      if (state !== pnl.state){
        pnl.state = state;
        pnl.el.classList.toggle('on', state === 'on');
        pnl.el.classList.toggle('side', state !== 'on');
        pnl.el.classList.toggle('right', state === 'side right');   // its name label sits on the outer side, clear of the active caption
        pnl.img.alt = state === 'on' ? PROJECTS[j % n].alt : '';
        pnl.el.setAttribute('aria-hidden', state === 'on' ? 'false' : 'true');
      }
    }
    // the light on the card that has just taken the centre: once per arrival, never while the ring is still spinning past
    const c = mod(Math.round(pos), N);
    if (c !== central && Math.abs(target - pos) < .2){ central = c; glow(panels[c].el); }
  }
  function glow(el){ if (still.matches) return; el.classList.remove('glow'); void el.offsetWidth; el.classList.add('glow'); }
  track.addEventListener('animationend', (e) => { if (e.animationName === 'pjGlow') e.target.classList.remove('glow'); });

  function frame(now){
    raf = 0;
    const dt = Math.min(64, now - last || 16.7); last = now;
    const dragging = drag && drag.mode;
    // the same share of the distance per 60 Hz frame, whatever the screen's refresh rate
    const k = still.matches ? 1 : 1 - Math.pow(1 - (dragging ? LERP_DRAG : LERP), dt / 16.667);
    pos += (target - pos) * k;
    if (Math.abs(target - pos) < .0008) pos = target;
    render();
    if (pos !== target || dragging) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf){ last = performance.now(); raf = requestAnimationFrame(frame); } };

  // caption: the old one leaves, then the new one comes in; only the newest stays
  function caption(i, first){
    BOXES.forEach(([box, part]) => {
      const c = capNode(PROJECTS[i], i, n, part); if (!first) c.classList.add('in');
      $$('.pj-cap', box).forEach(o => { if (o.classList.contains('out')) o.remove(); else { o.classList.remove('in'); o.classList.add('out'); o.setAttribute('aria-hidden', 'true'); o.querySelectorAll('a').forEach(a => a.tabIndex = -1); setTimeout(() => o.remove(), 260); } });
      box.appendChild(c);
    });
  }
  // background: the new image is decoded first, then fades in over the old one (never through black)
  let bgToken = 0;
  function background(i){
    const t = ++bgToken, img = new Image(); img.src = PROJECTS[i].bg; img.alt = ''; img.className = 'pj-bgimg';
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => {
      if (t !== bgToken) return;
      bgBox.appendChild(img); void img.offsetWidth; img.classList.add('on');
      const old = [...bgBox.children].slice(0, -1);
      setTimeout(() => old.forEach(o => o.remove()), 900);
    });
  }
  function counter(i){ nowEl.textContent = pad(i + 1); barEl.style.transform = `scaleX(${(i + 1) / n})`; }

  // the project the ring is heading to: its text, background and counter change as soon as it is chosen
  let byAuto = false;
  function sync(){
    const a = mod(Math.round(target), N); if (a === active) return;
    active = a; const i = a % n;
    // a change nobody asked for is not announced: screen readers only hear the projects the visitor picks
    BOXES.forEach(([box]) => box.setAttribute('aria-live', byAuto ? 'off' : 'polite'));
    untilt(); caption(i); background(i); counter(i);
    // the next images are fetched ahead, so a fast move never shows an empty background
    [1, -1, 2].forEach(k => { new Image().src = PROJECTS[mod(i + k, n)].bg; });
  }
  let snapT = 0;
  function go(step){
    if (!step) return;
    clearTimeout(snapT);
    target = Math.round(target) + step;
    sync(); kick();
    if (!byAuto) arm();
  }
  // after a gesture: a short pause to be sure it is over, then the nearest card is brought exactly to the centre
  function settle(){ clearTimeout(snapT); snapT = setTimeout(() => { target = Math.round(target); sync(); kick(); arm(); }, 160); }

  /* The ring turns by itself every 3.6 s, with the same movement as a manual step. It waits while the pointer is over
     the carousel, while it has keyboard focus or is being dragged, while it is off screen, and it never runs with
     reduced motion or with the page's animation switch off. Any interaction restarts the wait. */
  let autoT = 0, hover = false, seen = false;
  const canAuto = () => seen && !hover && !drag && !document.hidden && !still.matches && ANIM.on && !stage.matches(':focus-within');
  function arm(){
    clearTimeout(autoT);
    autoT = setTimeout(() => { if (canAuto()){ byAuto = true; go(1); byAuto = false; } arm(); }, 3600);
  }
  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse'){ hover = false; arm(); } });
  stage.addEventListener('focusout', arm);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; arm(); }, { threshold: .35 }).observe(stage);
  else seen = true;

  $('.pj-arrow.prev', sec).addEventListener('click', () => go(-1));
  $('.pj-arrow.next', sec).addEventListener('click', () => go(1));
  // a click on a side card brings it to the centre; a click on the centre one opens the project's page
  // (the keyboard and screen readers reach the same page through the link below the carousel)
  track.addEventListener('click', (e) => {
    if (dragged) return;
    const card = e.target.closest('.pj-card'); if (!card) return;
    if (card.classList.contains('on')){ const p = PROJECTS[active % n]; if (p.page) location.href = p.page; return; }
    go(Math.round(near(+card.dataset.j - target)));
  });
  stage.addEventListener('keydown', (e) => {
    if (e.target.closest('a')) return;
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (k){ e.preventDefault(); go(k); }
    else if (e.key === 'Home'){ e.preventDefault(); go(-(active % n)); }
    else if (e.key === 'End'){ e.preventDefault(); go(n - 1 - (active % n)); }
  });

  // drag (mouse) and swipe (touch): the ring follows the pointer and keeps some of its speed when let go.
  // Vertical movement stays with the page (touch-action: pan-y); a drag never counts as a click.
  let drag = null, dragged = false, press = null;
  stage.addEventListener('pointerdown', (e) => {
    // any press that travels more than a few pixels is not a click, whatever direction it went
    press = { x: e.clientX, y: e.clientY }; dragged = false;
    if (drag || e.button > 0 || e.target.closest('button,a,.pj-detail')) return;   // a second finger is ignored
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, mode: '', mouse: e.pointerType === 'mouse', from: 0, lx: e.clientX, lt: performance.now(), v: 0 };
  });
  stage.addEventListener('pointermove', (e) => {
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) dragged = true;
    if (!drag || e.pointerId !== drag.id) return;
    const mx = e.clientX - drag.x0, my = e.clientY - drag.y0, slop = drag.mouse ? 6 : 10;
    if (!drag.mode){
      if (Math.abs(mx) > slop && Math.abs(mx) > Math.abs(my) * 1.2){
        drag.mode = 'x'; drag.x0 = e.clientX - Math.sign(mx) * slop; drag.from = target; drag.lx = e.clientX; drag.lt = performance.now();
        clearTimeout(snapT); clearTimeout(autoT); untilt();
        stage.setPointerCapture(drag.id); stage.classList.add('grabbing');
      } else if (Math.abs(my) > slop){ drag = null; return; }
    }
    if (drag.mode === 'x'){
      const t = performance.now(), dt = Math.max(1, t - drag.lt);
      drag.v = .6 * ((e.clientX - drag.lx) / dt) + .4 * drag.v; drag.lx = e.clientX; drag.lt = t;   // px per ms, smoothed
      target = drag.from - (e.clientX - drag.x0) / spacing;
      sync(); kick();
    }
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (d.mode !== 'x'){ arm(); return; }
    stage.classList.remove('grabbing');
    dragged = true;
    // inertia: the speed at release carries the ring a little further (none if the pointer had already stopped)
    const coast = e.type === 'pointercancel' || still.matches || performance.now() - d.lt > 90 ? 0 : clamp(-d.v * 260 / spacing, -2.5, 2.5);
    target += coast; sync(); kick(); settle();
  };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);

  // the hover of the reference: the centre panel leans toward the pointer in 3D, the title leans with it a little in
  // front, and the image slides the other way inside (depth). Mouse only, never while dragging or travelling.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let tiltRaf = 0, tiltAt = null;
  function untilt(){
    cancelAnimationFrame(tiltRaf); tiltRaf = 0; tiltAt = null;
    stage.classList.remove('tilt');
    ['--tx', '--ty'].forEach(k => stage.style.setProperty(k, '0deg')); ['--mx', '--my'].forEach(k => stage.style.setProperty(k, '0'));
  }
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !fine.matches || still.matches || R === 1 || (drag && drag.mode) || pos !== target) return;
    const card = e.target.closest && e.target.closest('.pj-card.on');
    if (!card){ if (stage.classList.contains('tilt')) untilt(); return; }
    tiltAt = { x: e.clientX, y: e.clientY, card };
    if (tiltRaf) return;
    tiltRaf = requestAnimationFrame(() => {
      tiltRaf = 0; if (!tiltAt) return;
      const r = tiltAt.card.getBoundingClientRect();
      const nx = clamp((tiltAt.x - r.left) / r.width * 2 - 1, -1, 1), ny = clamp((tiltAt.y - r.top) / r.height * 2 - 1, -1, 1);
      stage.style.setProperty('--ty', (nx * 8).toFixed(2) + 'deg'); stage.style.setProperty('--tx', (-ny * 6).toFixed(2) + 'deg');
      stage.style.setProperty('--mx', nx.toFixed(3)); stage.style.setProperty('--my', ny.toFixed(3));
      stage.classList.add('tilt');
    });
  });
  stage.addEventListener('pointerleave', untilt);
  // the click that follows a moved press is dropped, then the flag is cleared for the next press
  stage.addEventListener('click', () => { setTimeout(() => { dragged = false; press = null; }, 0); }, true);
  // a horizontal wheel or trackpad swipe turns the ring with the fingers; the vertical wheel stays with the page
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    clearTimeout(autoT);
    target += clamp(e.deltaX / spacing, -.5, .5);
    sync(); kick(); settle();
  }, { passive: false });

  // sizes follow the stage; on small screens one neighbour peeks on each side and the text sits below
  function measure(){
    const W = stage.clientWidth, mob = matchMedia('(max-width: 899px)').matches;
    R = mob ? 1 : 2;   // two neighbours on each side on wide screens, one on small ones
    let ph; stage.style.removeProperty('--sth');
    if (mob){ pw = Math.min(W * .74, 360); ph = pw * 1.18; }
    else {
      // the panel is sized by the viewport height and the stage width; the stage then hugs it, so no empty band is left
      const H = track.clientHeight; ph = H * .8; pw = Math.min(ph * 680 / 1100, W * .19); ph = pw * 1100 / 680;
      stage.style.setProperty('--sth', Math.round(ph + 110) + 'px');
    }
    stage.style.setProperty('--pw', pw.toFixed(1) + 'px'); stage.style.setProperty('--ph', ph.toFixed(1) + 'px');
    // the arc: neighbours sit one step apart on a circle whose radius follows the card width;
    // two steps reach about 22 degrees on wide screens
    stepDeg = mob ? 13 : 11; spacing = pw * (mob ? .92 : .88); radius = spacing / Math.sin(stepDeg * Math.PI / 180);
    // the caption box keeps the height of the tallest project, so changing project never moves the page
    // (the head only needs it on small screens, where it sits in the flow; the explanation always does)
    BOXES.forEach(([box, part]) => {
      if (part === 'head' && !mob){ box.style.minHeight = ''; return; }
      const probe = document.createElement('div'); probe.className = box.classList[0] + ' pj-probe'; probe.setAttribute('aria-hidden', 'true');
      probe.style.width = box.clientWidth + 'px'; box.after(probe);
      let h = 0; PROJECTS.forEach((p, i) => { probe.innerHTML = ''; const c = capNode(p, i, n, part); probe.appendChild(c); h = Math.max(h, c.offsetHeight); });
      probe.remove(); box.style.minHeight = h + 'px';
    });
    render();
  }
  let rz = 0; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(measure); });
  if (document.fonts) document.fonts.ready.then(measure);
  document.addEventListener('visibilitychange', arm);
  measure(); caption(0, true); counter(0);
  { const img = new Image(); img.src = PROJECTS[0].bg; img.alt = ''; img.className = 'pj-bgimg on'; bgBox.appendChild(img); }
})();
