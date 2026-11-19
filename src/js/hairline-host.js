/* Hairline host: mounts each figure in its [data-hairline-host], writes the read-out in Portuguese and walks one lap of the tour the first time the figure is seen. */
(() => {
  window.hairline = (figure) => {
    document.querySelectorAll(`[data-hairline-host="${figure.name}"]`).forEach((host) => {
      if (host.dataset.mounted) return;
      host.dataset.mounted = '1';
      HL.inject(document);
      const stage = document.createElement('div');
      stage.setAttribute('data-hairline', figure.name);
      stage.setAttribute('role', 'img');
      stage.setAttribute('aria-label', host.dataset.labelA11y || figure.means);
      host.append(stage);
      const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
      const out = host.querySelector('[data-hairline-read]');
      let text = '';
      const read = {
        get textContent() { return text; },
        set textContent(v) { text = v == null ? '' : String(v); if (out) out.textContent = text === 'rest' ? '' : text; },
      };
      figure.mount({ stage, svg, read }, figure.range[1]);
      if (HL.reducedMotion() || !('IntersectionObserver' in window) || !figure.tour) return;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const go = () => { const lap = HL.tour(stage, figure.tour, (i) => { if (figure.tour[i] === null) lap.stop(); }); };
        (function whenBuilt(){ if (!host.classList.contains('build') || (host.classList.contains('built') && !host._op)) setTimeout(go, 600); else setTimeout(whenBuilt, 200); })();
      }, { threshold: 0.6 });
      io.observe(stage);
    });
  };
})();
