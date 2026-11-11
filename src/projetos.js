/* ========== 6) principais projetos: carrossel em perspectiva ========== */
/* Os projetos ficam todos aqui. Para incluir, remover ou mudar a ordem, edite esta lista.
   name, category  nome e tipo de solução
   description     uma frase de contexto: o que é o site e para quem
   features        o que cada funcionalidade faz (uma frase por item; até três cabem bem)
   image           retrato 680×1100 em assets/projetos/ (as capturas do projeto compostas sobre uma cor da Lorz)
   bg              versão pequena da captura, usada desfocada no fundo da seção
   alt             o que a imagem mostra, para leitores de tela
   status          'real' (trabalho para um negócio real), 'conceitual' (estudo sem cliente) ou 'demonstrativo' (exemplo fictício)
   url             destino do botão "Abrir projeto"; sem url, o botão não aparece */
const PROJECTS = [
  { name: 'Flat Jardim Serrano', category: 'Site completo · Hospedagem', status: 'real', url: null,
    image: 'assets/projetos/flat.jpg', bg: 'assets/projetos/flat-fundo.jpg',
    alt: 'Site do Flat Jardim Serrano no computador e no celular, com o seletor de flats em destaque',
    description: 'Site dos sete flats privativos para casais do Flat Jardim Serrano, em Serra Negra (SP).',
    features: [
      'Seletor de flats: você marca o que não pode faltar e vê só as unidades que têm tudo.',
      'Consultar datas: o formulário conta as noites e abre o WhatsApp com a mensagem pronta.',
      'Uma página por flat, com fotos, comodidades e regras, no tema claro ou escuro.',
    ] },
  { name: 'Brasa', category: 'Site e pedido online · Hamburgueria', status: 'conceitual', url: null,
    image: 'assets/projetos/brasa.jpg', bg: 'assets/projetos/brasa-fundo.jpg',
    alt: 'Site da Brasa com o hambúrguer em 3D separado em camadas, a sacola no celular e o pagamento por Pix',
    description: 'Site de hamburgueria com cardápio, história da casa e pedido online, hoje em modo de demonstração.',
    features: [
      'Hambúrguer em 3D: arraste para girar; ao rolar a página, as camadas se separam.',
      'Pedido em quatro passos: sacola, entrega ou retirada, pagamento e revisão.',
      'Pix com código copia e cola, cartão na maquininha ou dinheiro com troco.',
    ] },
  { name: 'Isadora Guirelli', category: 'Landing page · Saúde capilar', status: 'real', url: null,
    image: 'assets/projetos/isa.jpg', bg: 'assets/projetos/isa-fundo.jpg',
    alt: 'Site de Isadora Guirelli no computador e no celular, com os caminhos Sinais de atenção e Cuidados',
    description: 'Site de tricologia para quem percebeu queda ou afinamento dos fios e quer entender os próximos passos.',
    features: [
      'Quatro caminhos logo no início: sinais, cuidados, como funciona e contato.',
      'Páginas que explicam o que observar nos fios e quando procurar um dermatologista.',
      'Atalho do WhatsApp no celular, que some quando outro contato já está na tela.',
    ] },
];
const STATUS = { demonstrativo: 'Projeto demonstrativo', conceitual: 'Projeto conceitual', real: '', publicado: '' };
// the caption of one project, built with textContent (the list is data, never markup)
function capNode(p, i, n, part){
  const flag = STATUS[p.status] || '', c = document.createElement('div'); c.className = 'pj-cap';
  if (part === 'head'){
    c.innerHTML = `<p class="pj-meta"><span class="pj-cat"></span>${flag ? '<span class="pj-flag"></span>' : ''}</p>
      <h3 class="pj-name"></h3><i class="pj-rule" aria-hidden="true"></i><span class="sr">Projeto ${i + 1} de ${n}.</span>`;
    c.querySelector('.pj-cat').textContent = p.category; c.querySelector('.pj-name').textContent = p.name;
    if (flag) c.querySelector('.pj-flag').textContent = flag;
  } else {
    c.innerHTML = `<p class="pj-desc"></p>${(p.features || []).length ? '<ul class="pj-feats" aria-label="Funcionalidades"></ul>' : ''}
      ${p.url ? '<a class="pj-open btn" target="_blank" rel="noopener">Abrir projeto<span class="sr"> (abre em nova aba)</span></a>' : ''}`;
    c.querySelector('.pj-desc').textContent = p.description;
    (p.features || []).forEach(f => { const li = document.createElement('li'); li.textContent = f; c.querySelector('.pj-feats').appendChild(li); });
    if (p.url) c.querySelector('.pj-open').href = p.url;
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
  // with few projects the list is repeated, so one copy can wait hidden behind each side while the other is on screen
  const copies = Math.max(1, Math.ceil(8 / n)), N = n * copies;
  const panels = [];
  for (let j = 0; j < N; j++){
    const p = PROJECTS[j % n], el = document.createElement('div');
    el.className = 'pj-card'; el.dataset.j = j;
    el.innerHTML = `<div class="pj-lift"><img src="${p.image}" alt="" width="680" height="1100" decoding="async" ${j < n ? '' : 'loading="lazy"'} draggable="false"><span class="pj-dim"></span><span class="pj-peek" aria-hidden="true"><span class="pj-peek-cat"></span><b class="pj-peek-name"></b></span></div>`;
    el.querySelector('.pj-peek-cat').textContent = p.category; el.querySelector('.pj-peek-name').textContent = p.name;
    track.appendChild(el); panels.push({ el, pos: 0 });
  }
  let active = 0, R = 2;   // R: how many neighbours show on each side

  // where each offset sits: the centre in front, neighbours turned toward it, the far ones smaller and behind
  const X = [0, .84, 1.52, 2.1], S = [1, .86, .72, .6], Y = [0, 24, 30, 34], Z = [0, -70, -150, -230], SH = [0, .4, .62, .85];
  const XM = [0, 1.02, 1.9], SM = [1, .88, .76], YM = [0, 10, 14];
  function place(pnl, pos){
    const a = Math.abs(pos), s = Math.sign(pos), mob = R === 1, k = Math.min(a, mob ? 2 : 3);
    const x = (mob ? XM : X)[k] + (a > k ? (a - k) * .6 : 0);
    const st = pnl.el.style;
    st.setProperty('--x', (s * x).toFixed(3));
    st.setProperty('--s', (mob ? SM : S)[k]);
    st.setProperty('--ry', (-s * (mob ? YM : Y)[k]) + 'deg');
    st.setProperty('--z', (mob ? 0 : Z[k]) + 'px');
    st.setProperty('--sh', a === 0 ? 0 : SH[Math.min(a, 3)]);
    st.zIndex = 20 - a;
    st.opacity = a > R ? 0 : 1;
    pnl.el.classList.toggle('on', a === 0);
    pnl.el.classList.toggle('side', a > 0 && a <= R);
    pnl.el.classList.toggle('right', pos > 0);   // its name label sits on the outer side, clear of the active caption
    const img = pnl.el.querySelector('img');
    img.alt = a === 0 ? PROJECTS[+pnl.el.dataset.j % n].alt : '';
    pnl.el.setAttribute('aria-hidden', a === 0 ? 'false' : 'true');
  }
  function layout(first){
    panels.forEach((pnl, j) => {
      let pos = ((j - active) % N + N) % N; if (pos > N / 2) pos -= N;
      // a panel that went round the back (hidden before and after) moves without a transition
      const wrapped = !first && Math.abs(pos - pnl.pos) > N / 2;
      if (first || wrapped){ pnl.el.style.transition = 'none'; place(pnl, pos); void pnl.el.offsetWidth; pnl.el.style.transition = ''; }
      else place(pnl, pos);
      pnl.pos = pos;
    });
  }

  // caption: the old one leaves, then the new one comes in; only the newest stays
  function caption(i, first){
    BOXES.forEach(([box, part]) => {
      const c = capNode(PROJECTS[i], i, n, part); if (!first) c.classList.add('in');
      $$('.pj-cap', box).forEach(o => { if (o.classList.contains('out')) o.remove(); else { o.classList.remove('in'); o.classList.add('out'); o.setAttribute('aria-hidden', 'true'); o.querySelectorAll('a').forEach(a => a.tabIndex = -1); setTimeout(() => o.remove(), 220); } });
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

  function go(step){
    if (!step) return;
    active = ((active + step) % N + N) % N;
    const i = active % n;
    layout(false); caption(i); background(i); counter(i);
    // the next images are fetched ahead, so a fast click never shows an empty panel or background
    [1, -1, 2].forEach(k => { const q = PROJECTS[((i + k) % n + n) % n]; new Image().src = q.bg; });
  }
  const shortest = (j) => { let d = ((j - active) % N + N) % N; if (d > N / 2) d -= N; return d; };

  $('.pj-arrow.prev', sec).addEventListener('click', () => go(-1));
  $('.pj-arrow.next', sec).addEventListener('click', () => go(1));
  // a click on a side panel brings it to the centre (it never opens the project)
  track.addEventListener('click', (e) => {
    if (dragged) return;
    const card = e.target.closest('.pj-card'); if (!card || card.classList.contains('on')) return;
    go(shortest(+card.dataset.j));
  });
  stage.addEventListener('keydown', (e) => {
    if (e.target.closest('a')) return;
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (k){ e.preventDefault(); go(k); }
    else if (e.key === 'Home'){ e.preventDefault(); go(-(active % n)); }
    else if (e.key === 'End'){ e.preventDefault(); go(n - 1 - (active % n)); }
  });

  // drag (mouse) and swipe (touch): the track follows the pointer; a long drag or a quick flick changes project.
  // Vertical movement stays with the page (touch-action: pan-y); a drag never counts as a click.
  let drag = null, dragged = false, pw = 300, press = null;
  stage.addEventListener('pointerdown', (e) => {
    // any press that travels more than a few pixels is not a click, whatever direction it went
    press = { x: e.clientX, y: e.clientY }; dragged = false;
    if (drag || e.button > 0 || e.target.closest('button,a,.pj-detail')) return;   // a second finger is ignored
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), dx: 0, mode: '', mouse: e.pointerType === 'mouse' };
  });
  stage.addEventListener('pointermove', (e) => {
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) dragged = true;
    if (!drag || e.pointerId !== drag.id) return;
    const mx = e.clientX - drag.x0, my = e.clientY - drag.y0, slop = drag.mouse ? 6 : 10;
    if (!drag.mode){
      if (Math.abs(mx) > slop && Math.abs(mx) > Math.abs(my) * 1.2){
        drag.mode = 'x'; drag.t0 = performance.now(); drag.x0 = e.clientX - Math.sign(mx) * slop;
        stage.setPointerCapture(drag.id); track.classList.add('drag'); stage.classList.add('grabbing');
      } else if (Math.abs(my) > slop){ drag = null; return; }
    }
    if (drag.mode === 'x'){ drag.dx = e.clientX - drag.x0; track.style.translate = `${(drag.dx * .6).toFixed(1)}px 0`; }
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (d.mode !== 'x') return;
    track.classList.remove('drag'); stage.classList.remove('grabbing');
    track.style.translate = '';        // eases back from wherever the pointer left it
    dragged = true;
    const dist = Math.abs(d.dx), v = dist / Math.max(1, performance.now() - d.t0);
    if (e.type === 'pointercancel' || (dist < pw * .35 && v < .11)) return;
    go((d.dx < 0 ? 1 : -1) * (dist > pw * 1.3 ? 2 : 1));
  };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  // the click that follows a moved press is dropped, then the flag is cleared for the next press
  stage.addEventListener('click', () => { setTimeout(() => { dragged = false; press = null; }, 0); }, true);
  // a horizontal trackpad swipe moves one project at a time; vertical wheel stays with the page
  // one project per gesture: after a change, the rest of that swipe (its momentum included) is ignored until it stops
  let wheelX = 0, wheelLock = 0;
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    const t = performance.now();
    if (t < wheelLock){ wheelLock = t + 220; return; }
    wheelX += e.deltaX;
    if (Math.abs(wheelX) > 40){ go(wheelX > 0 ? 1 : -1); wheelX = 0; wheelLock = t + 220; }
  }, { passive: false });

  // sizes follow the stage; on small screens one neighbour peeks on each side and the text sits below
  function measure(){
    const W = stage.clientWidth, mob = matchMedia('(max-width: 899px)').matches;
    R = mob ? 1 : Math.min(2, Math.floor((n - 1) / 2));   // with few projects, no copy shows twice on screen
    let ph;
    if (mob){ pw = Math.min(W * .74, 360); ph = pw * 1.18; }
    else { const H = track.clientHeight; ph = H * .8; pw = Math.min(ph * 680 / 1100, W * .25); ph = pw * 1100 / 680; }
    stage.style.setProperty('--pw', pw.toFixed(1) + 'px'); stage.style.setProperty('--ph', ph.toFixed(1) + 'px');
    // the caption box keeps the height of the tallest project, so changing project never moves the page
    // (the head only needs it on small screens, where it sits in the flow; the explanation always does)
    BOXES.forEach(([box, part]) => {
      if (part === 'head' && !mob){ box.style.minHeight = ''; return; }
      const probe = document.createElement('div'); probe.className = box.classList[0] + ' pj-probe'; probe.setAttribute('aria-hidden', 'true');
      probe.style.width = box.clientWidth + 'px'; box.after(probe);
      let h = 0; PROJECTS.forEach((p, i) => { probe.innerHTML = ''; const c = capNode(p, i, n, part); probe.appendChild(c); h = Math.max(h, c.offsetHeight); });
      probe.remove(); box.style.minHeight = h + 'px';
    });
    layout(true);
  }
  let rz = 0; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(measure); });
  if (document.fonts) document.fonts.ready.then(measure);
  measure(); caption(0, true); counter(0);
  { const img = new Image(); img.src = PROJECTS[0].bg; img.alt = ''; img.className = 'pj-bgimg on'; bgBox.appendChild(img); }
})();
