// LORZ — interações. Sem dependências; cada módulo só roda se o elemento existir.
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* Cabeçalho: borda ao rolar ------------------------------------------- */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Tema claro/escuro ----------------------------------------------------- */
  const themeBtn = $('[data-theme-toggle]');
  if (themeBtn) {
    const root = document.documentElement, sys = matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : sys.matches;
    const sync = () => { themeBtn.setAttribute('aria-pressed', isDark()); themeBtn.setAttribute('aria-label', isDark() ? 'Ativar modo claro' : 'Ativar modo escuro'); };
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('lorz-tema', root.dataset.theme); } catch (e) {}
      sync();
    });
    sys.addEventListener('change', sync); sync();
  }

  /* Menu móvel ------------------------------------------------------------ */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (toggle && menu) {
    const setOpen = open => {
      toggle.setAttribute('aria-expanded', open);
      toggle.querySelector('.menu-toggle-label').textContent = open ? 'Fechar' : 'Menu';
      document.documentElement.classList.toggle('menu-open', open);
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', e => { if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('[data-header]')) setOpen(false); });
    matchMedia('(min-width: 961px)').addEventListener('change', e => e.matches && setOpen(false));
  }

  /* Painel de serviços (desktop) ----------------------------------------- */
  $$('[data-dropdown]').forEach(item => {
    const btn = $('.panel-toggle', item);
    let timer;
    const set = open => { item.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open); };
    const fine = matchMedia('(hover: hover) and (min-width: 961px)');
    item.addEventListener('pointerenter', () => { if (fine.matches) { clearTimeout(timer); set(true); } });
    item.addEventListener('pointerleave', () => { if (fine.matches) timer = setTimeout(() => set(false), 180); });
    btn.addEventListener('click', () => set(!item.classList.contains('is-open')));
    item.addEventListener('keydown', e => { if (e.key === 'Escape' && item.classList.contains('is-open')) { set(false); btn.focus(); } });
    item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', e => { if (!item.contains(e.target)) set(false); });
  });

  /* Revelação progressiva ------------------------------------------------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* Abas (situações, planos, processos) ---------------------------------- */
  $$('[data-tabs]').forEach(root => {
    const tabs = $$(':scope > .tab-list [role="tab"]', root);
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; panels[k].hidden = k !== i; });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    select(Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true')));
  });

  /* Tela do funil na primeira dobra: destaca uma etapa por vez ------------ */
  $$('[data-flow]').forEach(app => {
    const btns = $$('[data-step]', app);
    let i = 0, timer = null, visible = false, paused = false;
    const body = $('.flowapp-body', app), pill = $('.flow-pill', app), focus = $('.flow-focus', app);
    const stages = $$('.flow-stage', app);
    let morphTimer;
    // Morph: mede o alvo e desloca a pílula e o destaque até ele (tamanho e posição animados no CSS).
    const place = () => {
      const b = btns[i], t = b.parentElement.getBoundingClientRect(), r = b.getBoundingClientRect();
      pill?.style.setProperty('--px', `${r.left - t.left}px`); pill?.style.setProperty('--pw', `${r.width}px`);
      const card = $('.flow-card', stages[i]); if (!card || !focus) return;
      const o = body.getBoundingClientRect(), c = card.getBoundingClientRect();
      focus.style.setProperty('--fx', `${c.left - o.left}px`); focus.style.setProperty('--fy', `${c.top - o.top}px`);
      focus.style.setProperty('--fw', `${c.width}px`); focus.style.setProperty('--fh', `${c.height}px`);
      focus.dataset.accent = stages[i].dataset.accent;
    };
    const go = n => {
      if (n !== i && app.classList.contains('is-ready') && !reduced.matches) { app.classList.add('is-morphing'); clearTimeout(morphTimer); morphTimer = setTimeout(() => app.classList.remove('is-morphing'), 320); }
      i = n; app.dataset.active = n; btns.forEach((b, k) => b.setAttribute('aria-pressed', k === n)); place();
    };
    place(); requestAnimationFrame(() => requestAnimationFrame(() => app.classList.add('is-ready')));
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(app);
    document.fonts?.ready.then(place);
    const tick = () => { stop(); if (!reduced.matches && visible && !paused && !document.hidden) timer = setTimeout(() => { go((i + 1) % btns.length); tick(); }, 3600); };
    const stop = () => clearTimeout(timer);
    btns.forEach((b, k) => b.addEventListener('click', () => { paused = true; stop(); go(k); }));
    app.addEventListener('pointerenter', () => { paused = true; stop(); });
    app.addEventListener('pointerleave', () => { paused = false; tick(); });
    app.addEventListener('focusin', () => { paused = true; stop(); });
    document.addEventListener('visibilitychange', tick);
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; tick(); }, { threshold: .4 }).observe(app);
  });

  /* Comparação no celular: uma coluna por vez ---------------------------- */
  $$('[data-compare-switch]').forEach(group => {
    const table = group.nextElementSibling;
    group.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', group).forEach(x => x.setAttribute('aria-pressed', x === b));
      table.dataset.show = b.dataset.col;
    });
  });

  /* Artigo: progresso de leitura e seção ativa no sumário ---------------- */
  const bar = $('[data-progress]');
  const prose = $('.prose');
  if (bar && prose) {
    let ticking = false;
    const update = () => {
      const r = prose.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * .35 - r.top) / r.height));
      bar.style.transform = `scaleX(${p})`; ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    const links = $$('.toc a');
    const map = new Map(links.map(a => [a.hash.slice(1), a]));
    if (links.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { links.forEach(a => a.classList.remove('is-active')); map.get(en.target.id)?.classList.add('is-active'); }
      }), { rootMargin: '-15% 0px -70% 0px' });
      map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    }
  }

  /* Busca no blog --------------------------------------------------------- */
  const form = $('[data-blog-search]');
  if (form) {
    const input = $('input', form), out = $('[data-search-results]');
    let index = null;
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const load = () => index || (index = fetch('blog-index.json').then(r => r.json()).catch(() => []));
    const run = async () => {
      const q = norm(input.value.trim());
      if (q.length < 2) { out.hidden = true; out.innerHTML = ''; return; }
      const terms = q.split(/\s+/);
      const items = (await load()).map(p => {
        const t = norm(p.t), hay = norm([p.t, p.e, p.c, p.k].join(' '));
        if (!terms.every(w => hay.includes(w))) return null;
        return { p, score: terms.reduce((s, w) => s + (t.includes(w) ? 3 : 0) + (norm(p.k).includes(w) ? 2 : 0) + 1, 0) };
      }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8);
      out.hidden = false;
      out.innerHTML = items.length
        ? `<ul>${items.map(({ p }) => `<li><a href="${p.u}"><strong>${esc(p.t)}</strong><span>${esc(p.c)} · ${p.r} min de leitura</span></a></li>`).join('')}</ul>`
        : `<p class="search-empty">Nenhum artigo encontrado para “${esc(input.value.trim())}”. Tente outro termo ou explore os temas abaixo.</p>`;
    };
    input.addEventListener('focus', load, { once: true });
    input.addEventListener('input', run);
    form.addEventListener('submit', e => { e.preventDefault(); run(); out.querySelector('a')?.focus(); });
    input.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); out.querySelector('a')?.focus(); } if (e.key === 'Escape') { input.value = ''; run(); } });
    out.addEventListener('keydown', e => {
      const items = $$('a', out), i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? input : items[i - 1]).focus(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
    const initial = new URLSearchParams(location.search).get('q');
    if (initial) { input.value = initial; run(); }
  }

  /* Formulário de contato ------------------------------------------------- */
  const cf = $('[data-contact-form]');
  if (cf) {
    const params = new URLSearchParams(location.search);
    const labels = { 'social-media': 'Social Media', 'criacao-de-sites': 'Criação de Sites', 'ferramentas-personalizadas': 'Ferramentas Personalizadas', 'nao-sei': 'Ainda não sei' };
    const plan = $('#plano'), offerField = $('[data-offer-field]');
    const retorno = $('#retorno'), retornoLabel = $('[data-retorno-label]');
    const result = $('[data-form-result]');

    const syncService = () => {
      const s = cf.servico.value;
      $$('[data-when]', cf).forEach(el => el.hidden = el.dataset.when !== s);
      offerField.hidden = !labels[s] || s === 'nao-sei';
      $$('optgroup', plan).forEach(g => { g.hidden = g.dataset.for !== s; g.disabled = g.dataset.for !== s; });
      if (plan.selectedOptions[0]?.parentElement?.dataset?.for !== s) plan.value = '';
    };
    const syncChannel = () => {
      const wa = cf.canal.value === 'whatsapp';
      retornoLabel.textContent = wa ? 'Seu WhatsApp (com DDD)' : 'Seu e-mail';
      retorno.type = wa ? 'tel' : 'email'; retorno.inputMode = wa ? 'tel' : 'email';
      retorno.autocomplete = wa ? 'tel' : 'email';
      retorno.placeholder = wa ? '(11) 99999-9999' : 'voce@empresa.com.br';
    };
    cf.addEventListener('change', e => { if (e.target.name === 'servico') syncService(); if (e.target.name === 'canal') syncChannel(); });

    // Pré-seleção vinda dos CTAs: ?servico=...&plano=...
    const sv = params.get('servico');
    if (labels[sv]) { const r = cf.querySelector(`input[name="servico"][value="${sv}"]`); if (r) r.checked = true; }
    syncService(); syncChannel();
    const pl = params.get('plano');
    if (pl && plan.querySelector(`option[value="${CSS.escape(pl)}"]:not(:disabled)`)) plan.value = pl;
    cf.origem.value = [sv, pl].filter(Boolean).join(' / ') || document.referrer.replace(location.origin, '') || 'direto';

    const validate = () => {
      let first = null;
      const check = (el, ok) => {
        el.setAttribute('aria-invalid', !ok);
        const msg = document.getElementById(el.id + '-erro');
        if (msg) { msg.hidden = ok; ok ? el.removeAttribute('aria-describedby') : el.setAttribute('aria-describedby', msg.id); }
        if (!ok && !first) first = el;
      };
      check(cf.nome, cf.nome.value.trim().length > 1);
      const v = retorno.value.trim();
      check(retorno, cf.canal.value === 'whatsapp' ? v.replace(/\D/g, '').length >= 10 : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      check(cf.mensagem, cf.mensagem.value.trim().length > 5);
      first?.focus();
      return !first;
    };
    $$('input, textarea', cf).forEach(el => el.addEventListener('input', () => el.getAttribute('aria-invalid') === 'true' && validate()));

    const compose = () => {
      const f = new FormData(cf), s = f.get('servico');
      const planName = plan.value ? plan.selectedOptions[0].textContent : '';
      const lines = [
        'Olá, Lorz! Gostaria de conversar sobre um projeto.', '',
        `Nome: ${f.get('nome')}`,
        f.get('negocio') ? `Negócio: ${f.get('negocio')}` : null,
        `Retorno por ${f.get('canal') === 'whatsapp' ? 'WhatsApp' : 'e-mail'}: ${f.get('retorno')}`,
        `Serviço de interesse: ${labels[s]}${planName ? ', plano ' + planName : ''}`,
        ...$$(`[data-when="${s}"] input`, cf).filter(i => i.value.trim()).map(i => `${cf.querySelector(`label[for="${i.id}"]`).childNodes[0].textContent.trim()} ${i.value.trim()}`),
        '', 'O que preciso melhorar ou criar:', f.get('mensagem').trim(), '',
        `Origem: ${f.get('origem')}`
      ];
      return lines.filter(l => typeof l === 'string').join('\n');
    };

    let text = '';
    cf.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate()) return;
      text = compose();
      $('[data-preview]', result).textContent = text;
      const email = cf.dataset.email, wa = cf.dataset.whatsapp;
      const sendE = $('[data-send-email]', result), sendW = $('[data-send-whatsapp]', result);
      sendE.hidden = !email; sendW.hidden = !wa;
      if (email) sendE.href = `mailto:${email}?subject=${encodeURIComponent('Pedido de proposta: ' + labels[cf.servico.value])}&body=${encodeURIComponent(text)}`;
      if (wa) sendW.href = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
      $('[data-result-text]', result).textContent = email || wa
        ? 'Revise o texto abaixo e escolha como enviar. O envio acontece no seu aplicativo de e-mail ou no WhatsApp.'
        : 'Os canais oficiais da Lorz ainda estão sendo configurados, então nada foi enviado. Copie ou baixe a mensagem para enviar quando o contato estiver disponível.';
      result.hidden = false;
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
    });
    $('[data-copy]', result).addEventListener('click', async e => {
      const b = e.currentTarget, original = b.textContent;
      try { await navigator.clipboard.writeText(text); b.textContent = 'Copiado ✓'; }
      catch { b.textContent = 'Selecione e copie o texto'; }
      setTimeout(() => b.textContent = original, 2200);
    });
    $('[data-download]', result).addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      a.download = 'briefing-lorz.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }
})();
