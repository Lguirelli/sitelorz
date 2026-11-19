/* ========== 5) sections built by the crew as you scroll ========== */
function startScrollBuild(){
  const TARGETS = '.sec-head h2, .sec-head > div > p, .sec-head > .fig, .format, .pillars > div, .sol, .compare-wrap > div:first-child, .scope-copy > *, .scope-preview, .pj-stage, .step, .faq > div:first-child, .qa, .contact > div:first-child > *, form.tile';
  const MEDIA = '.sec-head > .fig, .format, .sol, .scope-preview, form.tile';
  const secs = $$('main > section:not(.hero)').map(sec => ({ sec, items: $$(TARGETS, sec), layer: null, t: 0 }));
  const all = secs.flatMap(s => s.items.map(el => (el._s = s, el)));
  const label = el => {
    if (el.matches('.format, .sol')) return 'Card · ' + $('h3', el).textContent;
    if (el.matches('.compare')) return 'Componente · Antes/Depois';
    if (el.matches('.scope-preview')) return 'Componente · Prévia do escopo';
    if (el.matches('.pj-stage')) return 'Carrossel · Projetos';
    if (el.matches('fieldset')) return 'Grupo · ' + $('legend', el).textContent;
    if (el.matches('form')) return 'Form · Contato';
    if (el.matches('.fig')) return 'Hairline · ' + el.dataset.hairlineHost;
    if (el.matches('.pillars > div')) return 'Pilar · ' + $('.num', el).textContent;
    if (el.matches('.compare-wrap > div')) return 'Texto · ' + $('h3', el).textContent;
    if (el.matches('.step')) return 'Etapa · ' + $('h3', el).textContent;
    if (el.matches('.qa')) return 'Acordeão · Pergunta';
    if (el.matches('h2')) return 'H2 · ' + el.textContent.trim().replace(/\s+/g,' ').slice(0, 26);
    if (el.matches('p')) return 'P · Texto';
    return 'Grupo · ' + (el.className.replace(/\b(build|built|media)\b/g,'').trim().split(/\s+/)[0] || 'Camada');
  };
  all.forEach(el => { el.classList.add('build'); el._label = label; if (el.matches(MEDIA)) el.classList.add('media'); });

  // each section shows its own build progress on a ruler while the crew works in it
  function progress(s){
    if (!crewOn()) return;
    if (!s.layer){ s.layer = document.createElement('div'); s.layer.className = 'ed-layer'; s.layer.innerHTML = '<div class="eruler"></div><span class="eprog"></span>'; s.sec.appendChild(s.layer); }
    const n = s.items.filter(e => e.classList.contains('built')).length / s.items.length;
    $('.eruler', s.layer).style.transform = `scaleX(${n})`;
    $('.eprog', s.layer).textContent = n >= 1 ? '✓ Seção pronta' : `Construindo · ${Math.round(n*100)}%`;
    s.layer.classList.add('active');
    clearTimeout(s.t); s.t = setTimeout(() => s.layer && s.layer.classList.remove('active'), 1400);
  }
  isComplete = () => all.every(el => el.classList.contains('built')) && $$('header .build, .hero .build').every(el => el.classList.contains('built'));

  let ticking = false;
  function check(){
    ticking = false;
    if (all.every(el => el.classList.contains('built'))){ assign(); return; }
    const line = innerHeight * .82;
    // built once, the first time it is scrolled to, like the page loading; it never comes apart again
    for (const el of all){
      const r = el.getBoundingClientRect();
      // with the animations off (or arriving from a link) everything is simply there, not revealed on scroll
      if ((r.top < line || !crewOn()) && !el.classList.contains('built') && !el._q) enqueue(el, () => progress(el._s), true);
    }
    // everything that came into view is queued first, then the builder picks in order
    assign();
  }
  addEventListener('scroll', () => { if (!ticking){ ticking = true; requestAnimationFrame(check); } }, {passive:true});
  addEventListener('resize', check);
  window.__sb = {
    reset(){ queue.length = 0; all.forEach(el => { el._q = false; el.style.clipPath = ''; el.classList.remove('built', 'now'); }); secs.forEach(s => { if (s.layer){ s.layer.remove(); s.layer = null; } }); },
    check,
  };
  check();
}
