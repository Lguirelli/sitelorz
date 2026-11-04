// Auditoria visual com Playwright: responsividade e contraste nos temas claro e escuro.
// Uso: npm run build && npm run qa   (usa o Edge ou o Chrome instalado; não baixa navegador)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

const PORT = 4180;
const BASE = `http://127.0.0.1:${PORT}/`;
const pages = ['index.html', 'servicos.html', 'servicos-social-media.html', 'servicos-criacao-de-sites.html', 'servicos-ferramentas-personalizadas.html', 'planos.html', 'como-funciona.html', 'sobre.html', 'contato.html', 'blog.html', 'blog-criacao-de-sites.html', 'blog-criacao-de-sites-quanto-custa-criar-site.html', 'politica-de-privacidade.html', '404.html'];
const viewports = [[360, 780], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
const shots = new Set(['390x844', '1440x900']);
const themes = ['light', 'dark'];
const out = new URL('../qa/', import.meta.url);

const browsers = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const executablePath = process.env.QA_BROWSER || browsers.find(existsSync);
if (!executablePath) { console.error('Nenhum navegador Chromium encontrado. Defina QA_BROWSER com o caminho do executável.'); process.exit(1); }

const server = spawn(process.execPath, [new URL('./serve.mjs', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), String(PORT)], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 600));
await mkdir(out, { recursive: true });

// Roda dentro da página: retorna vazamentos horizontais, textos com contraste insuficiente e alvos de toque pequenos.
function audit() {
  document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in'));
  const vw = document.documentElement.clientWidth;
  const parse = c => { const m = c.match(/[\d.]+/g)?.map(Number) || [0, 0, 0, 0]; return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const mix = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const bgOf = el => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c.a > 0) { layers.push(c); if (c.a >= .99) break; } }
    let base = parse(getComputedStyle(document.body).backgroundColor); if (base.a < 1) base = { r: 255, g: 255, b: 255, a: 1 };
    return layers.reverse().reduce((acc, l) => mix(l, acc), base);
  };
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden], .sr-only, [aria-hidden="true"] svg') && Number(cs.opacity) > .1; };
  const name = el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');

  const overflow = [];
  document.querySelectorAll('body *').forEach(el => {
    if (!visible(el) || el.closest('.table-scroll, .topic-nav, .nav-panel, .main-nav')) return;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) overflow.push(`${name(el)} (${Math.round(r.left)}→${Math.round(r.right)})`);
  });

  const contrast = [];
  document.querySelectorAll('body *').forEach(el => {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    if (!visible(el)) return;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color), bg = bgOf(el);
    const fgFlat = fg.a < 1 ? mix(fg, bg) : fg;
    const L1 = lum(fgFlat), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    if (ratio < need) contrast.push(`${name(el)} "${el.textContent.trim().slice(0, 40)}" ${ratio.toFixed(2)}:1 (mín. ${need})`);
  });

  const targets = [];
  if (vw < 768) document.querySelectorAll('a, button, [role="tab"], input, select, textarea, summary').forEach(el => {
    if (!visible(el) || el.closest('.prose p, .prose li, .micro, .breadcrumbs, .site-footer nav, .faq-answer, .post-meta, .tab-svc, .cross-inner')) return;
    const r = el.getBoundingClientRect();
    if (r.height < 32 || r.width < 32) targets.push(`${name(el)} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
  });

  return { scroll: document.documentElement.scrollWidth > vw + 1, overflow: overflow.slice(0, 8), contrast, targets: targets.slice(0, 10) };
}

const browser = await chromium.launch({ executablePath });
const report = [];
let problems = 0;
try {
  for (const theme of themes) for (const [w, h] of viewports) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, reducedMotion: 'reduce', isMobile: w < 768, hasTouch: w < 768 });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      const r = await page.evaluate(audit);
      const key = `${theme} ${w}x${h} ${p}`;
      const issues = (r.scroll ? 1 : 0) + r.overflow.length + r.contrast.length + r.targets.length;
      problems += issues;
      if (issues) report.push({ key, ...r });
      if (shots.has(`${w}x${h}`)) await page.screenshot({ path: new URL(`${theme}-${w}-${p.replace('.html', '')}.png`, out).pathname.replace(/^\/(\w:)/, '$1'), fullPage: p === 'index.html' });
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}

await writeFile(new URL('relatorio.json', out), JSON.stringify(report, null, 2));
for (const r of report) {
  console.log(`\n✗ ${r.key}`);
  if (r.scroll) console.log('  rolagem horizontal na página');
  r.overflow.forEach(x => console.log('  vaza da tela: ' + x));
  r.contrast.forEach(x => console.log('  contraste: ' + x));
  r.targets.forEach(x => console.log('  alvo de toque pequeno: ' + x));
}
const total = themes.length * viewports.length * pages.length;
console.log(problems ? `\n${problems} problema(s) em ${report.length} de ${total} combinações. Capturas em qa/.` : `\n✓ ${total} combinações (páginas × larguras × temas) sem problemas de responsividade, contraste ou toque. Capturas em qa/.`);
process.exit(problems ? 1 : 0);
