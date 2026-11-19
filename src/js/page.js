/* ========== 3) color masks ========== */
// hero portrait: hard-edged color spot follows the pointer inside the mask
// (the pointer is read at most once per frame, and only while the hero is on screen)
const hr = $('#heroRetrato'); let spot = 0, spotTarget = 0, spotRaf = 0, spotAt = null, heroSeen = true;
if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { heroSeen = e.isIntersecting; }).observe($('.hero'));
addEventListener('pointermove', e => {
  if (!heroSeen && !spot) return;
  spotAt = [e.clientX, e.clientY];
  if (!spotRaf) spotRaf = requestAnimationFrame(spotLoop);
}, {passive:true});
function spotLoop(){
  if (spotAt){
    const r = hr.getBoundingClientRect(), x = (spotAt[0] - r.left) / r.width * 100, y = (spotAt[1] - r.top) / r.height * 100;
    spotAt = null;
    hr.style.setProperty('--mx', x + '%'); hr.style.setProperty('--my', y + '%');
    spotTarget = heroSeen && x > -10 && x < 110 && y > -10 && y < 110 ? 26 : 0;
  }
  if (spot !== spotTarget){
    spot += (spotTarget - spot) * .12; if (Math.abs(spotTarget - spot) < .05) spot = spotTarget;
    hr.style.setProperty('--spot', spot.toFixed(2) + '%');
  }
  spotRaf = spot !== spotTarget ? requestAnimationFrame(spotLoop) : 0;
}


// scope builder: the needs picked shape the preview and the proposal
const needs = $$('.needs input'), pv = $('.scope-preview');
function scope(){
  const on = new Set(needs.filter(n => n.checked).map(n => n.value));
  $$('[data-k]', pv).forEach(el => { const k = el.dataset.k; if (k !== 'base' && k !== 'foot') el.classList.toggle('on', on.has(k)); });
  const site = ['servicos','whats','portfolio','blog','seo'].filter(k => on.has(k));
  const sol = [on.has('crm') || on.has('auto') ? 'Automações' : '', on.has('sistema') ? 'Sistema' : '', on.has('dados') ? 'Painel' : ''].filter(Boolean);
  return { site, sol };
}
needs.forEach(n => n.addEventListener('change', scope));
scope();
$('#pvGo').addEventListener('click', () => {
  const { site, sol } = scope();
  const names = needs.filter(n => n.checked).map(n => '- ' + n.nextElementSibling.textContent);
  const svc = site.length && !sol.length ? 'sSite' : sol.length && !site.length ? 'sSol' : 'sNs';
  $('#' + svc).checked = true;
  $('#fMsg').value = `Quero um projeto com:\n${names.join('\n') || '- (ainda não sei)'}`;
  $('#form').hidden = false; $('#ready').hidden = true;
  $('#contato').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  setTimeout(() => $('#fName').focus({ preventScroll: true }), reduce ? 0 : 700);
});

/* ========== 4) page interactions ========== */
const hdr = $('#hdr');
// menu on smaller screens: opens a dropdown; closes on a link, Escape, a tap outside or a wider screen
const menuBtn = $('#menuBtn');
function setMenu(open){ hdr.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Fechar o menu' : 'Abrir o menu'); }
menuBtn.addEventListener('click', () => setMenu(!hdr.classList.contains('open')));
$$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && hdr.classList.contains('open')){ setMenu(false); menuBtn.focus(); } });
document.addEventListener('click', (e) => { if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false); });
matchMedia('(min-width: 961px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 20), {passive:true});

// compare: spreadsheet vs dashboard (the sheet and the chart are plain HTML)
const cmp = $('#compare'), after = $('#after'), handle = $('#handle'); let drag = false;
function setPos(x){ const r = cmp.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (x - r.left) / r.width)); after.style.clipPath = `inset(0 0 0 ${p*100}%)`; handle.style.left = p*100 + '%'; }
cmp.addEventListener('pointerdown', e => { drag = true; cmp.setPointerCapture(e.pointerId); setPos(e.clientX); });
cmp.addEventListener('pointermove', e => { if (drag || e.pointerType === 'mouse') setPos(e.clientX); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => cmp.addEventListener(ev, () => { drag = false; }));

// process progress (measured at most once per frame)
const steps = $('#steps'), fill = $('#stepFill'), stepEls = $$('.step', steps);
let stepsRaf = 0;
const stepsSoon = () => { if (!stepsRaf) stepsRaf = requestAnimationFrame(stepsProgress); };
function stepsProgress(){
  stepsRaf = 0;
  const mid = innerHeight * .65;
  let last = -1; stepEls.forEach((s,i) => { const on = s.classList.contains('built') && s.getBoundingClientRect().top < mid; s.classList.toggle('on', on); if (on) last = i; });
  // the line never runs ahead of the steps the crew has already built
  const r = steps.getBoundingClientRect(), reach = last < 0 ? 0 : last === stepEls.length - 1 ? 1 : (stepEls[last].getBoundingClientRect().left - r.left + 12) / r.width;
  const p = Math.max(0, Math.min(reach, (mid - r.top) / (r.height * .9)));
  fill.style.transform = `scaleX(${p.toFixed(4)})`;
}
addEventListener('scroll', stepsSoon, {passive:true}); stepsProgress();
new MutationObserver(stepsSoon).observe(steps, { subtree: true, attributes: true, attributeFilter: ['class'] });

// faq: the answer's height morphs from where it is to where it is going, and the text un-blurs into place
$$('.qa button').forEach(b => b.addEventListener('click', () => {
  const q = b.parentElement, ans = $('.ans', q), txt = $('p', ans), open = !q.hasAttribute('data-open');
  const from = ans.getBoundingClientRect().height;
  ans.getAnimations().concat(txt.getAnimations()).forEach(a => a.cancel());
  q.toggleAttribute('data-open', open); b.setAttribute('aria-expanded', open);
  if (reduce) return;
  const to = open ? ans.scrollHeight : 0;
  ans.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: open ? 560 : 420, easing: 'cubic-bezier(.22,1,.36,1)' });
  txt.animate(open
    ? [{ opacity: 0, transform: 'translateY(-10px) scale(.985)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }]
    : [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, transform: 'translateY(-6px)', filter: 'blur(4px)' }],
    { duration: open ? 520 : 260, delay: open ? 70 : 0, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
}));

/* ========== cards: the dropdown of a compact card ========== */
// (the dropdown is a native <details> and the CSS decides which cards are compact; here, only how it closes)
{ const openMore = () => $('details.more[open]');
  addEventListener('keydown', (e) => { const d = e.key === 'Escape' && openMore(); if (d){ d.open = false; d.firstElementChild.focus(); } });
  document.addEventListener('click', (e) => { const d = openMore(); if (d && !d.contains(e.target)) d.open = false; });
}

// contact: prepare the message in the page (nothing is sent)
const form = $('#form'), ready = $('#ready'), out = $('#msgOut'), err = $('#err');
{ const FORMATS = { 'landing-page': ['sSite', 'Landing Page'], 'site-completo': ['sSite', 'Site Completo'], 'solucoes-personalizadas': ['sSol', 'Soluções Personalizadas'] };
  const f = FORMATS[new URLSearchParams(location.search).get('formato')];
  if (f){ $('#' + f[0]).checked = true; $('#fMsg').value = `Tenho interesse em ${f[1]}. `; } }
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form), nome = (d.get('nome')||'').trim(), msg = (d.get('mensagem')||'').trim();
  if (!nome){ err.textContent = 'Informe seu nome.'; $('#fName').focus(); return; }
  if (msg.length < 10){ err.textContent = 'Conte em poucas palavras o que você precisa.'; $('#fMsg').focus(); return; }
  err.textContent = '';
  const biz = (d.get('negocio')||'').trim();
  out.textContent = `Olá, Lorz! Meu nome é ${nome}${biz ? `, do ${biz}` : ''}.\n\nServiço de interesse: ${d.get('servico')}\n\n${msg}\n\nAguardo o retorno para conversarmos.`;
  form.hidden = true; ready.hidden = false; $('#copyStatus').textContent = ''; $('#copy').focus();
});
$('#edit').addEventListener('click', () => { ready.hidden = true; form.hidden = false; $('#fMsg').focus(); });
$('#copy').addEventListener('click', () => {
  const t = out.textContent, st = $('#copyStatus');
  const fallback = () => { const r = document.createRange(); r.selectNodeContents(out); const s = getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = 'Texto selecionado. Use Ctrl+C (ou Copiar) para copiar.'; };
  try { navigator.clipboard.writeText(t).then(() => st.textContent = 'Mensagem copiada.', fallback); } catch { fallback(); }
});
