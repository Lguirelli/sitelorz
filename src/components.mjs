// Componentes de interface reutilizáveis (funções que retornam HTML).
import { esc, href } from './lib/html.mjs';
import { inline } from './lib/markdown.mjs';
import { readFileSync } from 'node:fs';

// Logo oficial (assets/brand/lorz-logo.svg): as quatro letras + a assinatura "MARKETING".
const logoPaths = [...readFileSync(new URL('../assets/brand/lorz-logo.svg', import.meta.url), 'utf8').matchAll(/<path[^>]* d="([^"]+)"/g)].map(m => m[1]);

/** Logo oficial inline, na cor do texto. `full` inclui a assinatura (rodapé); sem ela, só as letras (cabeçalho). */
export const wordmark = (full = false) =>
  `<svg class="logo${full ? ' logo-full' : ''}" viewBox="${full ? '170 229 811 427' : '170 229 811 319'}" aria-hidden="true" focusable="false">${logoPaths.slice(0, full ? 5 : 4).map(d => `<path d="${d}"/>`).join('')}</svg>`;

/** Ícone oficial (assets/brand/lorz-icone.svg) inline. */
export const lmark = (cls = '') =>
  `<svg class="lmark ${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect class="lmark-bg" width="64" height="64" rx="12"/><path class="lmark-l" d="M20 14h10v34h17v10H20z"/></svg>`;

/** Mascote da marca, aplicado como máscara: o SVG dá a forma e a cor vem de --mascot-color.
    `dark` usa a versão negativa (traço vazado), feita para fundos escuros. */
export const mascot = ({ dark = false, cls = '' } = {}) =>
  `<span class="mascot${dark ? ' mascot-neg' : ''} ${cls}" aria-hidden="true"></span>`;

const ICONS = {
  'social-media': '<path d="M8 8h32v24H22l-8 8v-8H8z"/><path d="M16 16v8h14"/>',
  'criacao-de-sites': '<path d="M6 9h36v30H6z"/><path d="M6 17h36"/><path d="M12 24v9h12"/>',
  'ferramentas-personalizadas': '<path d="M8 8v32h32"/><path d="M17 31v-8M25 31V16M33 31v-12"/>'
};
export const icon = (slug, cls = '') =>
  `<svg class="svc-icon ${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${ICONS[slug] || ''}</svg>`;

export const arrow = '<svg class="arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h9.5M8.5 4l4 4-4 4"/></svg>';
export const check = '<svg class="tick" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8.5 6.5 12 13 4.5"/></svg>';
export const minus = '<svg class="tick tick-no" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 8h8"/></svg>';

export const button = ({ label, href: to }, variant = 'primary', extra = '') =>
  `<a class="btn btn-${variant}" href="${href(to)}"${extra}>${esc(label)}${variant === 'primary' || variant === 'light' ? arrow : ''}</a>`;

export const textLink = (label, to) => `<a class="text-link" href="${href(to)}">${esc(label)}${arrow}</a>`;

export function sectionHead({ h2, text, id, align = '' }) {
  return `<div class="section-head ${align}"><h2${id ? ` id="${id}"` : ''} class="reveal">${esc(h2)}</h2>${text ? `<p class="section-lead reveal">${esc(text)}</p>` : ''}</div>`;
}

export function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Você está em"><ol>${items.map((it, i) =>
    `<li>${i === items.length - 1 ? `<span aria-current="page">${esc(it.name)}</span>` : `<a href="${href(it.route)}">${esc(it.name)}</a>`}</li>`).join('')}</ol></nav>`;
}

/** Etapas de um processo: a ordem importa, então o número fica. */
export function steps(list) {
  return `<ol class="steps">${list.map(([t, d], i) =>
    `<li class="step reveal" style="--i:${i}"><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>`;
}

/** FAQ com <details> nativo: acessível por teclado e legível sem JavaScript. */
export function faq(items, { markdown = false } = {}) {
  return `<div class="faq">${items.map(([q, a]) =>
    `<details class="faq-item"><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><div class="faq-answer">${markdown ? a : `<p>${esc(a)}</p>`}</div></details>`).join('')}</div>`;
}

/** Fechamento de página: mascote, convite e ação principal. */
export function ctaBand({ h2, text, cta, secondary }) {
  return `<section class="cta-band" aria-labelledby="cta-final">
  <div class="wrap">
    <div class="cta-panel">
      <div class="cta-copy">
        <h2 id="cta-final" class="reveal">${esc(h2)}</h2>
        <p class="reveal">${esc(text)}</p>
        <div class="actions reveal">${button(cta, 'light')}${secondary ? button(secondary, 'ghost-light') : ''}</div>
      </div>
      <div class="cta-mascot" aria-hidden="true">
        <div class="bubble">Conta pra gente o que está travando?</div>
        ${mascot({ dark: true })}
      </div>
    </div>
  </div>
</section>`;
}

export function crossLink({ text, label, route }) {
  return `<aside class="cross-link" aria-label="Serviço relacionado"><div class="wrap cross-inner"><p>${esc(text)}</p>${textLink(label, route)}</div></aside>`;
}

/** Os três caminhos do funil: aprender, comparar, decidir. */
export function funnelRouter({ id = 'caminhos', h2 = 'Em que momento você está?', text = 'Cada visita começa num ponto diferente da decisão. Escolha o seu e siga pelo caminho mais curto até a próxima resposta.' } = {}) {
  const paths = [
    { k: 'learn', t: 'Ainda estou entendendo o problema', d: 'Artigos práticos sobre redes sociais, sites e tecnologia para negócios, escritos para quem decide e não para especialistas.', cta: { label: 'Explorar o conteúdo', href: '/blog' } },
    { k: 'compare', t: 'Estou comparando soluções', d: 'Veja lado a lado o que cada plano e formato inclui, quem faz o quê e o que fica fora do escopo antes de conversar.', cta: { label: 'Comparar planos', href: '/planos' } },
    { k: 'decide', t: 'Já sei o que preciso', d: 'Conte o objetivo com suas palavras e receba uma proposta por escrito, com escopo, entregas, responsabilidades e investimento.', cta: { label: 'Solicitar proposta', href: '/contato' } }
  ];
  return `<section class="section router" aria-labelledby="${id}">
  <div class="wrap">
    ${sectionHead({ h2, text, id, align: 'center' })}
    <ol class="router-list">${paths.map((p, i) => `<li class="route reveal" data-stage="${p.k}" style="--i:${i}">
      <span class="route-meter" aria-hidden="true"><i></i><i></i><i></i></span>
      <h3>${esc(p.t)}</h3>
      <p>${esc(p.d)}</p>
      ${button(p.cta, i === 2 ? 'primary' : 'secondary')}
    </li>`).join('')}</ol>
  </div>
</section>`;
}

/** Cartão editorial. `size` = 'lead' | 'default'. */
export function postCard(p, size = 'default') {
  return `<article class="post-card post-card-${size}" data-accent="${p.service?.accent || 'red'}">
  <a class="post-card-link" href="${href(p.route)}">
    <p class="post-meta"><span class="post-cat">${esc(p.category)}</span><span>${p.readTime} min de leitura</span></p>
    <h3 class="post-title">${esc(p.title)}</h3>
    ${size === 'lead' ? `<p class="post-excerpt">${esc(p.excerpt)}</p>` : ''}
    <span class="post-read">Ler artigo${arrow}</span>
  </a>
</article>`;
}

/* --- Telas ilustrativas ---------------------------------------------------
   Interfaces de exemplo que mostram como cada frente funciona. Não são telas de
   um produto real nem trazem números: servem para o visitante enxergar o processo. */

const frame = (title, body, cls = '') => `<figure class="ui ${cls}">
  <div class="ui-bar"><span class="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="ui-title">${title}</span></div>
  <div class="ui-body">${body}</div>
</figure>`;

export const uiSocial = () => frame('Calendário editorial', `
  <div class="cal" aria-hidden="true">
    ${['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(d => `<span class="cal-day">${d}</span>`).join('')}
    <div class="cal-post" style="--c:1"><b>Carrossel</b><span>Bastidores do serviço</span><em data-s="ok">Aprovado</em></div>
    <div class="cal-post" style="--c:3"><b>Vídeo curto</b><span>Dúvida frequente</span><em data-s="wip">Em produção</em></div>
    <div class="cal-post" style="--c:5"><b>Post</b><span>Novidade do mês</span><em data-s="plan">Agendado</em></div>
    <div class="cal-post cal-post-wide" style="--c:2"><b>Reunião mensal</b><span>O que funcionou e o que ajustar</span></div>
  </div>`, 'ui-social');

export const uiSite = () => frame('seunegocio.com.br', `
  <div class="site" aria-hidden="true">
    <div class="site-nav"><i></i><span></span><span></span><span></span></div>
    <div class="site-hero"><b>Seu serviço explicado em uma frase.</b><span></span><span class="short"></span></div>
    <div class="site-form">
      <label>Nome<span></span></label>
      <label>O que você precisa?<span class="tall"></span></label>
      <em>Pedir orçamento</em>
    </div>
  </div>`, 'ui-site');

export const uiTools = () => frame('Painel de contatos', `
  <div class="board" aria-hidden="true">
    ${[['Novo contato', [['Pedido pelo site', 'Landing page'], ['Mensagem no Instagram', 'Encaminhado']]], ['Em conversa', [['Agendamento', 'Lembrete enviado']]], ['Proposta enviada', [['Orçamento', 'Aguardando retorno']]]]
      .map(([col, cards]) => `<div class="board-col"><p>${col}</p>${cards.map(([t, s]) => `<div class="board-card"><b>${t}</b><span>${s}</span></div>`).join('')}</div>`).join('')}
  </div>`, 'ui-tools');

export const uiFor = slug => ({ 'social-media': uiSocial, 'criacao-de-sites': uiSite, 'ferramentas-personalizadas': uiTools }[slug]());

export const md = inline;
