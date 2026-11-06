// Hospedeiro das figuras Hairline no site (o kernel em hairline-kernel.js e a figura em hairline-<nome>.js vêm do
// skill hairline-create, sem alteração). Monta a figura em cada elemento [data-hairline-host="<nome>"], com as cores do
// site (lorz.css, .lz-nodes), escreve a leitura em português e toca uma volta do tour quando a figura aparece na tela.
(() => {
  // Uma figura pode aparecer em mais de um lugar da página (servicos.html): monta uma cópia em cada hospedeiro.
  window.hairline = (figure) => {
    document.querySelectorAll(`[data-hairline-host="${figure.name}"]`).forEach((host) => mountIn(host, figure));
  };

  function mountIn(host, figure) {
    if (host.dataset.hairlineMounted) return;
    host.dataset.hairlineMounted = '1';
    HL.inject(document);
    const stage = document.createElement('div');
    stage.className = 'lz-nodes__stage';
    stage.setAttribute('data-hairline', figure.name);
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', host.dataset.label || figure.means);
    host.append(stage);
    const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);

    // A leitura: o nome da parte sob o ponteiro; em repouso, nada.
    const out = host.querySelector('[data-hairline-read]'), names = JSON.parse(host.dataset.names || '{}');
    let text = '';
    const read = {
      get textContent() { return text; },
      set textContent(v) { text = v == null ? '' : String(v); if (out) out.textContent = text === 'rest' ? '' : names[text] || text; },
    };
    figure.mount({ stage, svg, read }, figure.range[1]);

    // Uma volta só, na primeira vez que a figura aparece; um ponteiro de verdade assume na hora. Sem volta com movimento reduzido.
    if (HL.reducedMotion() || !('IntersectionObserver' in window)) return;
    const stops = figure.tour || HL.LAP;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const lap = HL.tour(stage, stops, (i) => { if (stops[i] === null) lap.stop(); });
    }, { threshold: 0.6 });
    io.observe(stage);
  }
})();
