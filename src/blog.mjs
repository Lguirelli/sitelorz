// Blog: leitura do acervo em content/blog/, listagem, temas, artigos e índice de busca.
import { readFile, readdir } from 'node:fs/promises';
import { esc, href, plain, routeToFile } from './lib/html.mjs';
import { render, splitSections, parseFaq, parseLinks, inline } from './lib/markdown.mjs';
import { breadcrumbs, postCard, faq, icon, textLink, button, arrow, funnelRouter } from './components.mjs';
import { serviceBySlug } from './data/services.mjs';
import { absolute } from './layout.mjs';

export const categories = {
  'social-media': { name: 'Social Media', description: 'Contratação, produção e acompanhamento de redes sociais para empresas.', service: 'social-media' },
  'criacao-de-sites': { name: 'Criação de Sites', description: 'Escolha de estrutura, orçamento, publicação e continuidade do seu site.', service: 'criacao-de-sites' },
  'solucoes-personalizadas': { name: 'Soluções Personalizadas', description: 'Automação, integrações e tecnologia a partir das tarefas do negócio.', service: 'ferramentas-personalizadas' },
  'estrategia-de-conteudo': { name: 'Estratégia de Conteúdo', description: 'Conecte as dúvidas do público aos objetivos e aos canais da marca.', service: 'social-media' },
  'planejamento-editorial': { name: 'Planejamento Editorial', description: 'Pautas, pilares, séries e revisão para uma produção que caiba na rotina.', service: 'social-media' },
  'criacao-de-conteudo': { name: 'Criação de Conteúdo', description: 'Histórias, análises e exemplos para explicar ideias com clareza.', service: 'social-media' },
  'branding-e-identidade': { name: 'Branding e Identidade', description: 'Voz, autoria e formatos que ajudam a reconhecer a marca.', service: 'social-media' },
  'distribuicao-e-conversao': { name: 'Distribuição e Conversão', description: 'Reaproveitamento e conversas que dão continuidade ao conteúdo.', service: 'social-media' }
};
const FEATURED = ['contratar-social-media', 'site-institucional-ou-landing-page', 'o-que-automatizar-primeiro'];
const RELATED_TITLES = /^(Continue a leitura|Leituras relacionadas)$/;
const PER_PAGE = 12;

async function loadPosts() {
  const list = [];
  for (const cat of Object.keys(categories)) {
    const dir = new URL(`../content/blog/${cat}/`, import.meta.url);
    for (const file of (await readdir(dir)).filter(f => f.endsWith('.md')).sort()) {
      const src = (await readFile(new URL(file, dir), 'utf8')).replaceAll('\r', '');
      const m = src.match(/^---\n([\s\S]+?)\n---\n+([\s\S]+)$/);
      if (!m) throw Error('Front matter inválido: ' + file);
      const meta = {};
      for (const line of m[1].split('\n')) { const c = line.indexOf(':'); meta[line.slice(0, c)] = JSON.parse(line.slice(c + 1).trim()); }
      const body = m[2].replace(/^# [^\n]+\n+/, '');
      const cut = body.indexOf('\n\n');
      const intro = body.slice(0, cut).trim();
      const sections = splitSections(body.slice(cut + 2));
      const take = re => { const i = sections.findIndex(s => re.test(s.title || '')); return i < 0 ? null : sections.splice(i, 1)[0]; };
      const faqSec = take(/^Perguntas frequentes$/);
      const relSec = take(RELATED_TITLES);
      const svcSec = take(/^Conheça a solução da Lorz$/);
      const words = plain(body).split(/\s+/).length;
      list.push({
        ...meta,
        categorySlug: cat,
        category: categories[cat].name,
        excerpt: meta.meta_description,
        intro,
        sections,
        faq: faqSec ? parseFaq(faqSec.body) : [],
        relatedRoutes: relSec ? parseLinks(relSec.body).map(l => l.route) : [],
        serviceNote: svcSec ? svcSec.body : null,
        service: serviceBySlug[meta.servico_relacionado] || serviceBySlug[categories[cat].service],
        readTime: Math.max(2, Math.round(words / 200)),
        file: routeToFile(meta.route)
      });
    }
  }
  const featured = FEATURED.map(s => list.find(p => p.slug === s));
  return [...featured, ...list.filter(p => !FEATURED.includes(p.slug))];
}

export const posts = await loadPosts();
export const postsForService = slug => posts.filter(p => p.service?.slug === slug);
const byRoute = Object.fromEntries(posts.map(p => [p.route, p]));

const blogNav = active => `<nav class="topic-nav" aria-label="Temas do blog"><ul>
  <li><a href="blog.html"${active === 'all' ? ' aria-current="page"' : ''}>Todos</a></li>
  ${Object.entries(categories).map(([slug, c]) => `<li><a href="${href('/blog/' + slug + '/')}"${active === slug ? ' aria-current="page"' : ''}>${c.name}</a></li>`).join('')}
</ul></nav>`;

const search = () => `<form class="blog-search" role="search" action="blog.html" data-blog-search>
  <label for="busca" class="sr-only">Buscar no blog</label>
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
  <input id="busca" name="q" type="search" placeholder="Buscar artigos: orçamento, Instagram, automação…" autocomplete="off" enterkeyhint="search">
  <kbd aria-hidden="true">/</kbd>
</form>
<div class="search-results" data-search-results hidden aria-live="polite"></div>`;

const blogHero = ({ h1, lead, crumbs, withSearch }) => `<section class="hero hero-page hero-blog">
  <div class="wrap hero-narrow">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    <h1 class="hero-title hero-title-md">${esc(h1)}</h1>
    <p class="hero-lead">${esc(lead)}</p>
    ${withSearch ? search() : ''}
  </div>
</section>`;

const pagination = (n, total) => `<nav class="pagination" aria-label="Páginas de artigos">
  ${n > 1 ? `<a class="page-step" href="${n === 2 ? 'blog.html' : href('/blog/pagina/' + (n - 1) + '/')}" rel="prev"><span class="flip">${arrow}</span>Anteriores</a>` : '<span></span>'}
  <ol>${Array.from({ length: total }, (_, i) => `<li><a href="${i === 0 ? 'blog.html' : href('/blog/pagina/' + (i + 1) + '/')}"${i + 1 === n ? ' aria-current="page"' : ''} aria-label="Página ${i + 1}">${i + 1}</a></li>`).join('')}</ol>
  ${n < total ? `<a class="page-step" href="${href('/blog/pagina/' + (n + 1) + '/')}" rel="next">Próximos${arrow}</a>` : '<span></span>'}
</nav>`;

const topicsGrid = () => `<section class="section section-tight" aria-labelledby="temas">
  <div class="wrap">
    <div class="section-head"><h2 id="temas" class="reveal">Explore por tema</h2></div>
    <ul class="topic-grid">${Object.entries(categories).map(([slug, c]) => {
      const count = posts.filter(p => p.categorySlug === slug).length;
      return `<li class="reveal"><a class="topic-card" href="${href('/blog/' + slug + '/')}"><span class="topic-count">${count} ${count === 1 ? 'artigo' : 'artigos'}</span><strong>${c.name}</strong><span>${esc(c.description)}</span></a></li>`;
    }).join('')}</ul>
  </div>
</section>`;

function servicePromo(service, note) {
  if (!service) return '';
  return `<aside class="service-promo" data-accent="${service.accent}" aria-label="Serviço relacionado">
  ${icon(service.slug)}
  <div>
    <p class="service-promo-title">${esc(service.name)}</p>
    <p>${note ? inline(note.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')) : esc(service.oneLiner)}</p>
    <div class="actions">${textLink('Conhecer ' + service.name, service.route)}${textLink('Solicitar proposta', '/contato?servico=' + service.slug)}</div>
  </div>
</aside>`;
}

function listingPages() {
  const pages = [];
  const total = Math.ceil(posts.length / PER_PAGE);
  for (let n = 1; n <= total; n++) {
    const route = n === 1 ? '/blog' : `/blog/pagina/${n}/`;
    const slice = posts.slice((n - 1) * PER_PAGE, n * PER_PAGE);
    const [lead, ...rest] = slice;
    const featuredBlock = n === 1 ? `<section class="section section-tight" aria-labelledby="destaques">
  <div class="wrap">
    <div class="section-head"><h2 id="destaques" class="reveal">Para começar</h2></div>
    <div class="featured-grid">${postCard(lead, 'lead')}<div class="featured-side">${rest.slice(0, 2).map(p => postCard(p)).join('')}</div></div>
  </div>
</section>${topicsGrid()}` : '';
    const listItems = n === 1 ? rest.slice(2) : slice;
    pages.push({
      route,
      title: n === 1 ? 'Blog Lorz: comunicação, sites e tecnologia para negócios' : `Blog Lorz · Página ${n} de ${total}`,
      description: n === 1 ? 'Artigos práticos para planejar redes sociais, escolher e manter um site e decidir quando uma ferramenta personalizada faz sentido.' : `Página ${n} de ${total} dos artigos do blog da Lorz sobre comunicação, sites e soluções digitais.`,
      schema: { '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog Lorz', inLanguage: 'pt-BR', url: absolute(route) },
      body: blogHero({
        h1: n === 1 ? 'Ideias claras para decisões sobre comunicação, sites e tecnologia.' : `Todos os artigos, página ${n} de ${total}`,
        lead: `${posts.length} artigos para planejar a presença digital, comparar soluções e organizar a operação, escritos para quem decide e não para especialistas.`,
        withSearch: true
      }) + `<div class="topic-bar"><div class="wrap">${blogNav(n === 1 ? 'all' : null)}</div></div>` + featuredBlock + `<section class="section" aria-labelledby="todos">
  <div class="wrap">
    <div class="section-head"><h2 id="todos" class="reveal">${n === 1 ? 'Mais leituras' : `Artigos ${(n - 1) * PER_PAGE + 1} a ${Math.min(n * PER_PAGE, posts.length)}`}</h2></div>
    <div class="post-grid">${listItems.map(p => postCard(p)).join('')}</div>
    ${pagination(n, total)}
  </div>
</section>` + (n === 1 ? funnelRouter({ id: 'caminhos-blog', h2: 'Quando quiser ir além da leitura.', text: 'Os artigos ajudam a entender o problema. Quando a dúvida passar a ser qual caminho escolher, estes são os próximos passos.' }) : '')
    });
  }
  for (const [slug, c] of Object.entries(categories)) {
    const route = `/blog/${slug}/`;
    const items = posts.filter(p => p.categorySlug === slug);
    const svc = serviceBySlug[c.service];
    pages.push({
      route,
      title: `${c.name} | Blog Lorz`,
      description: c.description,
      schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.name, description: c.description, url: absolute(route), inLanguage: 'pt-BR' },
      body: blogHero({ h1: c.name, lead: `${c.description} ${items.length} ${items.length === 1 ? 'artigo' : 'artigos'} neste tema.`, crumbs: [{ name: 'Início', route: '/' }, { name: 'Blog', route: '/blog' }, { name: c.name, route }] })
        + `<div class="topic-bar"><div class="wrap">${blogNav(slug)}</div></div>`
        + `<section class="section" aria-label="Artigos sobre ${esc(c.name)}"><div class="wrap"><div class="post-grid">${items.map(p => postCard(p)).join('')}</div>
        <div class="topic-service">${servicePromo(svc)}</div></div></section>`
    });
  }
  return pages;
}

function articleSchema(p) {
  const url = absolute(p.route);
  const graph = [{
    '@type': 'BlogPosting', '@id': url + '#artigo', headline: p.title, description: p.excerpt, inLanguage: 'pt-BR',
    articleSection: p.category, keywords: [p.keyword_principal, ...(p.keywords_secundarias || [])].filter(Boolean).join(', ') || undefined,
    mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'Lorz', url: absolute('/') },
    ...(p.author ? { author: { '@type': 'Organization', name: p.author } } : {}),
    ...(p.date_published ? { datePublished: p.date_published } : {}),
    ...(p.date_modified ? { dateModified: p.date_modified } : {}),
    ...(p.image ? { image: absolute(p.image) } : {})
  }, {
    '@type': 'BreadcrumbList', itemListElement: [['Início', '/'], ['Blog', '/blog'], [p.category, `/blog/${p.categorySlug}/`], [p.title, p.route]]
      .map(([name, r], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(r) }))
  }];
  if (p.faq.length) graph.push({ '@type': 'FAQPage', mainEntity: p.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) });
  return { '@context': 'https://schema.org', '@graph': graph };
}

function articlePage(p) {
  const bodyMd = p.sections.map(s => (s.title ? `## ${s.title}\n\n` : '') + s.body).join('\n\n');
  const { html, toc } = render(bodyMd);
  if (p.faq.length) toc.push({ id: 'perguntas', title: 'Perguntas frequentes' });
  let related = p.relatedRoutes.map(r => byRoute[r]).filter(Boolean);
  if (related.length < 3) related = [...related, ...posts.filter(x => x.categorySlug === p.categorySlug && x !== p && !related.includes(x))].slice(0, 3);
  const crumbs = [{ name: 'Início', route: '/' }, { name: 'Blog', route: '/blog' }, { name: p.category, route: `/blog/${p.categorySlug}/` }, { name: p.title, route: p.route }];
  return {
    route: p.route,
    title: p.seo_title || `${p.title} | Lorz`,
    description: p.excerpt,
    type: 'article',
    schema: articleSchema(p),
    bodyClass: 'is-article',
    body: `<div class="read-progress" aria-hidden="true"><span data-progress></span></div>
<article class="article" data-accent="${p.service?.accent || 'red'}">
  <header class="hero hero-page hero-article">
    <div class="wrap">
      ${breadcrumbs(crumbs)}
      <p class="post-meta post-meta-hero"><a class="post-cat" href="${href('/blog/' + p.categorySlug + '/')}">${esc(p.category)}</a><span>${p.readTime} min de leitura</span></p>
      <h1 class="hero-title hero-title-md article-title">${esc(p.title)}</h1>
    </div>
  </header>
  <div class="wrap article-layout">
    <aside class="article-aside">
      ${toc.length > 1 ? `<nav class="toc" aria-label="Neste artigo"><p class="toc-title">Neste artigo</p><ol>${toc.map(t => `<li><a href="#${t.id}">${esc(t.title)}</a></li>`).join('')}</ol></nav>` : ''}
    </aside>
    <div class="prose">
      <p class="article-answer">${inline(p.intro)}</p>
      ${html}
      ${p.faq.length ? `<section class="article-faq" aria-labelledby="perguntas"><h2 id="perguntas">Perguntas frequentes</h2>${faq(p.faq.map(f => [f.q, render(f.a).html]), { markdown: true })}</section>` : ''}
      ${servicePromo(p.service, p.serviceNote)}
    </div>
  </div>
</article>
<section class="section section-alt" aria-labelledby="continue">
  <div class="wrap">
    <div class="section-head split-head"><h2 id="continue" class="reveal">Continue a leitura</h2>${textLink('Ver todos os artigos', '/blog')}</div>
    <div class="post-grid">${related.map(x => postCard(x)).join('')}</div>
  </div>
</section>`
  };
}

export function blogPages() {
  return [...listingPages(), ...posts.map(articlePage)];
}

export const searchIndex = () => posts.map(p => ({
  t: p.title, e: p.excerpt, c: p.category, u: p.file, r: p.readTime,
  k: [p.keyword_principal, ...(p.keywords_secundarias || []), ...(p.tags || [])].filter(Boolean).join(' ')
}));
