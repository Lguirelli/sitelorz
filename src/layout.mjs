// Estrutura comum: <head>, cabeçalho, navegação e rodapé.
import { config } from './config.mjs';
import { esc, href, routeToFile } from './lib/html.mjs';
import { services } from './data/services.mjs';
import { icon, wordmark, arrow } from './components.mjs';

const ASSET_VERSION = '2.2.0';
const indexable = Boolean(config.siteUrl);
export const absolute = route => config.siteUrl ? new URL(routeToFile(route).replace(/^index\.html$/, ''), config.siteUrl.replace(/\/+$/, '') + '/').href : null;

function head({ title, description, route, type = 'website', schema, fontFaces, preload = [] }) {
  const url = absolute(route);
  const ld = indexable && schema ? `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>` : '';
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${indexable ? `<link rel="canonical" href="${url}">` : '<meta name="robots" content="noindex, follow">'}
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Lorz">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${url ? `<meta property="og:url" content="${url}">` : ''}
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B1020" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<script>try{var t=localStorage.getItem('lorz-tema');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="icon" href="assets/brand/lorz-icone.svg" type="image/svg+xml">
${preload.map(f => `<link rel="preload" href="assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
${fontFaces ? `<style>${fontFaces}</style>` : ''}
<link rel="stylesheet" href="assets/css/lorz.css?v=${ASSET_VERSION}">
<script>document.documentElement.classList.add('js')</script>
<script defer src="assets/js/main.js?v=${ASSET_VERSION}"></script>
${ld}
</head>`;
}

function header(route) {
  const current = r => route === r || (r !== '/' && route.startsWith(r)) ? ' aria-current="page"' : '';
  const svcLinks = services.map(s => `<li><a class="nav-service" data-accent="${s.accent}" href="${href(s.route)}"${route === s.route ? ' aria-current="page"' : ''}>${icon(s.slug)}<span><strong>${s.name}</strong><small>${esc(s.oneLiner)}</small></span></a></li>`).join('');
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header" data-header>
  <div class="header-inner">
    <a class="brand" href="index.html" aria-label="Lorz, página inicial">${wordmark()}</a>
    <nav class="main-nav" id="menu" aria-label="Principal" data-menu>
      <ul class="nav-list">
        <li class="nav-item has-panel" data-dropdown>
          <a class="nav-link" href="servicos.html"${current('/servicos')}>Serviços</a>
          <button class="panel-toggle" type="button" aria-expanded="false" aria-controls="painel-servicos"><span class="sr-only">Mostrar serviços</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>
          <div class="nav-panel" id="painel-servicos"><ul>${svcLinks}</ul><a class="nav-panel-all" href="servicos.html">Visão geral dos serviços${arrow}</a></div>
        </li>
        <li class="nav-item"><a class="nav-link" href="planos.html"${current('/planos')}>Planos</a></li>
        <li class="nav-item"><a class="nav-link" href="como-funciona.html"${current('/como-funciona')}>Como funciona</a></li>
        <li class="nav-item"><a class="nav-link" href="blog.html"${current('/blog')}>Conteúdo</a></li>
        <li class="nav-item"><a class="nav-link" href="sobre.html"${current('/sobre')}>Sobre</a></li>
      </ul>
      <a class="btn btn-ghost btn-sm nav-ghost" href="contato.html">Falar com a Lorz</a><a class="btn btn-primary btn-sm nav-cta" href="contato.html">Solicitar proposta</a>
    </nav>
    <div class="header-tools">
    <button class="theme-toggle" type="button" data-theme-toggle aria-label="Alternar modo escuro"><svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg><svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg></button>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="menu-toggle-label">Menu</span><span class="menu-toggle-icon" aria-hidden="true"><i></i><i></i></span>
    </button>
    </div>
  </div>
</header>`;
}

function footer() {
  const topics = [['Social Media', '/blog/social-media/'], ['Criação de Sites', '/blog/criacao-de-sites/'], ['Soluções Personalizadas', '/blog/solucoes-personalizadas/'], ['Estratégia de Conteúdo', '/blog/estrategia-de-conteudo/']];
  const col = (title, links) => `<nav aria-label="${title}"><h2 class="footer-title">${title}</h2><ul>${links.map(([n, r]) => `<li><a href="${href(r)}">${n}</a></li>`).join('')}</ul></nav>`;
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-cta">
      <p class="footer-cta-title">Tem algo para melhorar no seu negócio?</p>
      <a class="btn btn-primary" href="contato.html">Solicitar proposta${arrow}</a>
    </div>
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="index.html" aria-label="Lorz, página inicial">${wordmark(true)}</a>
        <p>Comunicação, presença digital e tecnologia aplicada para negócios que querem crescer com menos atrito.</p>
      </div>
      ${col('Serviços', [...services.map(s => [s.name, s.route]), ['Visão geral', '/servicos']])}
      ${col('Decidir', [['Comparar planos', '/planos'], ['Como funciona', '/como-funciona'], ['Solicitar proposta', '/contato']])}
      ${col('Aprender', [['Todos os artigos', '/blog'], ...topics])}
      ${col('Lorz', [['Sobre', '/sobre'], ['Privacidade', '/politica-de-privacidade']])}
      <nav class="footer-compact" aria-label="Rodapé"><ul>${[['Serviços', '/servicos'], ['Planos', '/planos'], ['Conteúdo', '/blog'], ['Sobre', '/sobre'], ['Contato', '/contato']].map(([n, r]) => `<li><a href="${href(r)}">${n}</a></li>`).join('')}</ul></nav>
    </div>
    <div class="footer-base"><p>© ${config.year} Lorz. Todos os direitos reservados.</p><a class="footer-privacy" href="politica-de-privacidade.html">Privacidade</a>${config.instagram ? `<a href="${esc(config.instagram)}" rel="noopener">Instagram</a>` : ''}<p>Este site não usa cookies de rastreamento.</p></div>
  </div>
</footer>`;
}

/** Monta um documento completo. */
export function page({ route, title, description, body, type, schema, bodyClass = '', fontFaces, preload }) {
  return `<!doctype html>
<html lang="pt-BR">
${head({ title, description, route, type, schema, fontFaces, preload })}
<body class="${bodyClass}">
${header(route)}
<main id="conteudo" tabindex="-1">
${body}
</main>
${footer()}
</body>
</html>
`;
}
