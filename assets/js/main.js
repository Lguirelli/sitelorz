// Lorz: interações. Sem dependências; cada módulo só roda se o elemento existir.
// O conteúdo é visível e navegável sem JavaScript; aqui só entram estados e atalhos.
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lg = matchMedia('(min-width: 66rem)');

  /* Tema claro/escuro (temas paper e crt do Cel Retro Tech) ---------------- */
  const themeBtn = $('[data-theme-toggle]');
  if (themeBtn) {
    const root = document.documentElement, sys = matchMedia('(prefers-color-scheme: dark)');
    const metas = $$('meta[data-theme-color]');
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : sys.matches;
    const sync = () => {
      const dark = isDark();
      themeBtn.setAttribute('aria-pressed', dark);
      themeBtn.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
      // A barra do navegador acompanha o tema escolhido no botão, não só o do sistema.
      if (root.dataset.theme) metas.forEach(m => m.setAttribute('content', dark ? '#0A0F23' : '#FAE4CF'));
    };
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('lorz-tema', root.dataset.theme); } catch (e) {}
      sync();
    });
    sys.addEventListener('change', sync); sync();
  }

  /* Menu abaixo de 1056px: painel sob o cabeçalho ------------------------- */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (toggle && menu) {
    const setOpen = open => {
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.documentElement.classList.toggle('menu-open', open);
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', e => { if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('[data-header]')) setOpen(false); });
    lg.addEventListener('change', e => e.matches && setOpen(false));
  }

  /* Submenu de serviços --------------------------------------------------- */
  $$('[data-dropdown]').forEach(item => {
    const btn = $('.lz-header__toggle', item);
    let timer;
    const set = open => { item.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open); };
    const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 66rem)');
    item.addEventListener('pointerenter', () => { if (fine.matches) { clearTimeout(timer); set(true); } });
    item.addEventListener('pointerleave', () => { if (fine.matches) timer = setTimeout(() => set(false), 180); });
    btn.addEventListener('click', () => set(!item.classList.contains('is-open')));
    item.addEventListener('keydown', e => { if (e.key === 'Escape' && item.classList.contains('is-open')) { set(false); btn.focus(); } });
    item.addEventListener('focusout', e => { if (lg.matches && !item.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', e => { if (lg.matches && !item.contains(e.target)) set(false); });
  });

  /* Abas (KeyNav do Cel Retro Tech: setas, Home e End movem a seleção) ----------------- */
  $$('[data-tabs]').forEach(root => {
    const tabs = $$(':scope > .lz-tablist [role="tab"]', root);
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; panels[k].hidden = k !== i; });
      if (focus) { tabs[i].focus(); tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' }); }
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

  /* Comparação no celular (teclas de troca): uma coluna por vez --- */
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
  const prose = $('.lz-prose');
  if (bar && prose) {
    let ticking = false;
    const update = () => {
      const r = prose.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * .35 - r.top) / r.height));
      bar.style.transform = `scaleX(${p})`; ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    const links = $$('.lz-toc a');
    const map = new Map(links.map(a => [a.hash.slice(1), a]));
    if (links.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { links.forEach(a => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); }); const a = map.get(en.target.id); if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'location'); } }
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
        ? `<p class="lz-sr">${items.length} ${items.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}.</p><ul>${items.map(({ p }) => `<li><a href="${p.u}"><strong>${esc(p.t)}</strong><span>${esc(p.c)} · ${p.r} min de leitura</span></a></li>`).join('')}</ul>`
        : `<p class="lz-search-empty">Nenhum artigo encontrado para “${esc(input.value.trim())}”. Tente outro termo, como “site”, “Instagram” ou “automação”, ou explore os temas abaixo.</p>`;
    };
    input.addEventListener('focus', load, { once: true });
    input.addEventListener('input', run);
    form.addEventListener('submit', e => { e.preventDefault(); run().then(() => out.querySelector('a')?.focus()); });
    input.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); out.querySelector('a')?.focus(); } if (e.key === 'Escape') { input.value = ''; run(); } });
    out.addEventListener('keydown', e => {
      const items = $$('a', out), i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? input : items[i - 1]).focus(); }
      if (e.key === 'Escape') { input.focus(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
    const initial = new URLSearchParams(location.search).get('q');
    if (initial) { input.value = initial; run(); }
  }

  /* Formulário de contato: prepara a mensagem, não envia a servidor ------- */
  const cf = $('[data-contact-form]');
  if (cf) {
    const params = new URLSearchParams(location.search);
    const labels = { 'social-media': 'Social Media', 'criacao-de-sites': 'Criação de Sites', 'ferramentas-personalizadas': 'Ferramentas Personalizadas', 'nao-sei': 'Ainda não sei' };
    const plan = $('#plano'), offerField = $('[data-offer-field]');
    const retorno = $('#retorno'), retornoLabel = $('[data-retorno-label]');
    const result = $('[data-form-result]'), summary = $('[data-error-summary]');

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
      if (retorno.getAttribute('aria-invalid') === 'true') validate(false);
    };
    cf.addEventListener('change', e => { if (e.target.name === 'servico') syncService(); if (e.target.name === 'canal') syncChannel(); });

    // Pré-seleção vinda dos CTAs: ?servico=...&plano=...
    const sv = params.get('servico');
    if (labels[sv]) { const r = cf.querySelector(`input[name="servico"][value="${sv}"]`); if (r) r.checked = true; }
    syncService(); syncChannel();
    const pl = params.get('plano');
    if (pl && plan.querySelector(`option[value="${CSS.escape(pl)}"]:not(:disabled)`)) plan.value = pl;
    cf.origem.value = [sv, pl].filter(Boolean).join(' / ') || document.referrer.replace(location.origin, '') || 'direto';

    function validate(moveFocus = true) {
      let first = null;
      const check = (el, ok) => {
        el.setAttribute('aria-invalid', !ok);
        const msg = document.getElementById(el.id + '-erro');
        const help = document.getElementById(el.id + '-ajuda');
        if (msg) msg.hidden = ok;
        el.setAttribute('aria-describedby', [!ok && msg ? msg.id : '', help ? help.id : ''].filter(Boolean).join(' '));
        if (!el.getAttribute('aria-describedby')) el.removeAttribute('aria-describedby');
        if (!ok && !first) first = el;
      };
      check(cf.nome, cf.nome.value.trim().length > 1);
      const v = retorno.value.trim();
      check(retorno, cf.canal.value === 'whatsapp' ? v.replace(/\D/g, '').length >= 10 : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      check(cf.mensagem, cf.mensagem.value.trim().length > 5);
      summary.hidden = !first;
      if (first && moveFocus) first.focus();
      return !first;
    }
    $$('input, textarea', cf).forEach(el => el.addEventListener('input', () => el.getAttribute('aria-invalid') === 'true' && validate(false)));

    const labelOf = i => cf.querySelector(`label[for="${i.id}"]`).textContent.replace(/\s*\(opcional\)\s*$/, '').trim();
    const compose = () => {
      const f = new FormData(cf), s = f.get('servico');
      const planName = plan.value ? plan.selectedOptions[0].textContent : '';
      const lines = [
        'Olá, Lorz! Gostaria de conversar sobre um projeto.', '',
        `Nome: ${f.get('nome').trim()}`,
        f.get('negocio').trim() ? `Negócio: ${f.get('negocio').trim()}` : null,
        `Retorno por ${f.get('canal') === 'whatsapp' ? 'WhatsApp' : 'e-mail'}: ${f.get('retorno').trim()}`,
        `Serviço de interesse: ${labels[s]}${planName ? ', plano ' + planName : ''}`,
        ...$$(`[data-when="${s}"] input`, cf).filter(i => i.value.trim()).map(i => `${labelOf(i)} ${i.value.trim()}`),
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
      // Honesto: a mensagem foi preparada, não enviada.
      $('[data-result-title]', result).textContent = email || wa ? 'Sua mensagem está pronta para enviar.' : 'Sua mensagem está pronta, mas ainda não foi enviada.';
      $('[data-result-text]', result).textContent = email || wa
        ? 'Revise o texto abaixo e escolha como enviar. O envio acontece no seu aplicativo de e-mail ou no WhatsApp.'
        : 'Os canais oficiais da Lorz ainda estão sendo configurados, então nada foi enviado. Copie ou baixe a mensagem para enviar quando o contato estiver disponível.';
      result.hidden = false;
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
    });
    $('[data-copy]', result).addEventListener('click', async e => {
      const label = e.currentTarget.querySelector('span'), original = label.textContent;
      try { await navigator.clipboard.writeText(text); label.textContent = 'Mensagem copiada'; }
      catch { label.textContent = 'Selecione e copie o texto abaixo'; }
      setTimeout(() => label.textContent = original, 2400);
    });
    $('[data-download]', result).addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
      a.download = 'briefing-lorz.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }
})();
