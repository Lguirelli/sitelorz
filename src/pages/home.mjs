import { esc, href } from '../lib/html.mjs';
import { services } from '../data/services.mjs';
import { arrow, button, check, ctaBand, faq, funnelRouter, icon, mascot, postCard, sectionHead, steps, textLink, uiFor } from '../components.mjs';
import { posts, categories } from '../blog.mjs';
import { absolute } from '../layout.mjs';

export const generalFaq = [
  ['Preciso contratar os três serviços?', 'Não. Você pode contratar uma frente específica ou combinar serviços. A conversa inicial ajuda a entender por onde vale começar, porque cada frente precisa responder a uma necessidade concreta do negócio.'],
  ['A Lorz atende negócios que estão começando?', 'Sim. Avaliamos projetos em diferentes fases, e o ponto de partida é sempre entender o objetivo para construir uma proposta compatível com a necessidade.'],
  ['Como funciona o orçamento?', 'Começa por uma conversa sobre o que você precisa. Depois disso, a proposta apresenta escopo, entregas, responsabilidades, prazos e investimento. Não trabalhamos com pacotes fechados antes de conhecer o contexto.'],
  ['Preciso entender de tecnologia para contratar?', 'Não. Você descreve o problema com suas palavras, e a escolha das ferramentas e do caminho técnico faz parte do nosso trabalho.'],
  ['Posso melhorar algo que já existe?', 'Sim. Avaliamos os perfis, o site ou as ferramentas que você já usa para entender o que vale manter, ajustar ou reconstruir antes de propor um caminho.']
];

export const hiringSteps = [
  ['Conversa', 'Você conta o contexto, o objetivo e o que precisa melhorar, sem precisar chegar com um briefing técnico.'],
  ['Diagnóstico', 'Avaliamos o que já existe e identificamos prioridades, limites e possibilidades para o seu caso.'],
  ['Proposta', 'Você recebe por escrito o escopo, as entregas, as responsabilidades, o prazo e o investimento antes de qualquer execução.'],
  ['Execução e ajuste', 'Construímos o que foi acordado, validamos com você e ajustamos conforme o escopo combinado.']
];

/** Primeira dobra: o funil inteiro como uma tela de produto. */
const flowApp = () => {
  const stages = [
    { k: 'atrair', label: 'Atrair', svc: 'social-media', body: `<p class="flow-k">Post agendado</p><b>Dúvida frequente respondida em vídeo curto</b><span class="chips"><i>Instagram</i><i>Facebook</i></span>` },
    { k: 'converter', label: 'Converter', svc: 'criacao-de-sites', body: `<p class="flow-k">Formulário do site</p><b>Pedido de orçamento recebido</b><span class="fake-field"></span><span class="fake-btn">Pedir orçamento</span>` },
    { k: 'organizar', label: 'Organizar', svc: 'ferramentas-personalizadas', body: `<p class="flow-k">Painel de contatos</p><b>Contato registrado e encaminhado</b><span class="status"><i></i>Em conversa</span>` }
  ];
  return `<figure class="flowapp" data-flow data-active="0" aria-labelledby="flow-cap">
  <div class="flowapp-bar">
    <span class="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <div class="flow-tabs" role="group" aria-label="Destacar uma etapa do caminho do cliente">
      ${stages.map((s, i) => `<button type="button" aria-pressed="${i === 0}" data-step="${i}">${s.label}</button>`).join('')}
    </div>
  </div>
  <div class="flowapp-body">
    <ol class="flow-track">
      ${stages.map((s, i) => {
        const svc = services.find(x => x.slug === s.svc);
        return `<li class="flow-stage" data-accent="${svc.accent}" style="--i:${i}">
        <span class="flow-node">${icon(s.svc)}</span>
        <div class="flow-card">${s.body}<a class="flow-svc" href="${href(svc.route)}">${svc.name}${arrow}</a></div>
      </li>`;
      }).join('')}
    </ol>
    <div class="flow-toast" aria-hidden="true"><span class="avatar">${mascot()}</span><p><b>Lorz</b>Novo contato chegou pelo site e já está no painel.</p></div>
  </div>
  <figcaption id="flow-cap" class="ui-caption">Ilustração de como as três frentes se conectam: as redes atraem, o site transforma interesse em contato e as ferramentas organizam o que vem depois.</figcaption>
</figure>`;
};

const problems = [
  { slug: 'social-media', tab: 'Redes sem direção', h3: 'Você publica, mas a comunicação ainda não deixa claro por que alguém deveria escolher o seu negócio.', d: 'Com um plano de conteúdo, um calendário que cabe na rotina e análise mensal, cada publicação passa a ter objetivo e o aprendizado orienta o mês seguinte.' },
  { slug: 'criacao-de-sites', tab: 'Sem um lugar próprio', h3: 'Quem procura o seu negócio não encontra um lugar simples para entender o que você faz e entrar em contato.', d: 'Um site ou landing page organiza a apresentação, responde às dúvidas mais comuns e leva o visitante até o pedido de orçamento sem desvios.' },
  { slug: 'ferramentas-personalizadas', tab: 'Rotina no improviso', h3: 'Sua equipe perde tempo com planilhas espalhadas, informações repetidas e tarefas manuais.', d: 'Automações, sistemas internos e painéis feitos a partir do seu processo reduzem o retrabalho e deixam claro em que etapa está cada pedido.' }
];

const problemTabs = () => `<section class="section problems" aria-labelledby="travas">
  <div class="wrap">
    ${sectionHead({ h2: 'Onde o seu negócio trava hoje?', text: 'A maioria dos negócios não tem falta de esforço, e sim falta de estrutura em algum ponto do caminho do cliente. Escolha o que mais se parece com a sua situação.', id: 'travas', align: 'center' })}
    <div class="tabs" data-tabs>
      <div class="tab-list" role="tablist" aria-label="Situações comuns">
        ${problems.map((p, i) => { const s = services.find(x => x.slug === p.slug); return `<button type="button" role="tab" id="trava-tab-${i}" aria-controls="trava-${i}" aria-selected="${i === 0}" data-accent="${s.accent}">${icon(p.slug)}<span>${esc(p.tab)}</span></button>`; }).join('')}
      </div>
      ${problems.map((p, i) => { const s = services.find(x => x.slug === p.slug); return `<div class="tab-panel" role="tabpanel" id="trava-${i}" aria-labelledby="trava-tab-${i}" data-accent="${s.accent}" tabindex="0">
        <div class="tab-copy">
          <h3>${esc(p.h3)}</h3>
          <p>${esc(p.d)}</p>
          <p class="tab-svc">Frente indicada: <a href="${href(s.route)}">${s.name}</a></p>
          <ul class="plan-chips">${s.offers.items.map(o => `<li><a href="${href(s.route + '#' + o.id)}">${esc(o.name)}</a></li>`).join('')}</ul>
          <div class="actions">${button({ label: 'Conhecer ' + s.name, href: s.route }, 'secondary')}</div>
        </div>
        <div class="tab-visual">${uiFor(p.slug)}</div>
      </div>`; }).join('')}
    </div>
  </div>
</section>`;

const plansOverview = () => `<section class="section section-alt plans-overview" aria-labelledby="planos-visao">
  <div class="wrap">
    <div class="section-head split-head"><div><h2 id="planos-visao" class="reveal">Nove formatos de trabalho, escolhidos pelo que você precisa agora.</h2><p class="section-lead reveal">Cada frente tem caminhos com níveis diferentes de envolvimento. O investimento é sempre apresentado em proposta, depois de entendermos o contexto.</p></div>${textLink('Comparar todos os planos', '/planos')}</div>
    <div class="plan-matrix">
      ${services.map(s => `<div class="matrix-col reveal" data-accent="${s.accent}">
        <a class="matrix-head" href="${href(s.route)}">${icon(s.slug)}<span><strong>${s.name}</strong><small>${esc(s.oneLiner)}</small></span></a>
        <ul>${s.offers.items.map(o => `<li><a href="${href(s.route + '#' + o.id)}"><strong>${esc(o.name)}</strong><span>${esc(o.summary)}</span></a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>
  </div>
</section>`;

const promises = [
  ['Clareza em cada etapa', 'Você entende o que está sendo desenvolvido, por que isso importa e quais são os próximos passos.'],
  ['Criatividade com propósito', 'O visual chama atenção, mas cada escolha precisa ajudar a sua marca a comunicar alguma coisa.'],
  ['Tecnologia que simplifica', 'A ferramenta certa facilita o trabalho, e uma solução que acrescenta etapas à rotina deixa de cumprir o seu papel.'],
  ['Escopo honesto', 'Não prometemos resultado garantido, e a proposta deixa claro o que está incluído e o que fica de fora.']
];

export function homePage() {
  const featured = posts.slice(0, 3);
  const body = `
<section class="hero hero-home">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 class="hero-title">Do primeiro clique ao cliente organizado<i class="dot">.</i></h1>
      <p class="hero-lead">A Lorz cuida das redes sociais que atraem, do site que transforma interesse em contato e das ferramentas que organizam o que vem depois, sem exigir que você entenda de tecnologia.</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="contato.html">Solicitar proposta${arrow}</a>
        <a class="btn btn-secondary btn-lg" href="planos.html">Comparar planos</a>
      </div>
      <ul class="hero-assure">
        <li>${check}Proposta por escrito antes de qualquer execução</li>
        <li>${check}Sem pacote fechado: o escopo parte do seu contexto</li>
      </ul>
    </div>
    ${flowApp()}
  </div>
  <div class="wrap channels">
    <p>Canais e formatos com que a Lorz trabalha</p>
    <ul>${['Instagram', 'Facebook', 'Google Perfil da Empresa', 'LinkedIn', 'TikTok', 'YouTube', 'Landing pages', 'Sites com blog', 'Automações', 'Dashboards'].map(c => `<li>${c}</li>`).join('')}</ul>
  </div>
</section>

${funnelRouter()}

${problemTabs()}

<section class="section section-dark process" aria-labelledby="processo">
  <div class="wrap">
    <div class="section-head split-head"><div><h2 id="processo" class="reveal">Antes de executar qualquer coisa, a gente entende o contexto e combina tudo com você.</h2><p class="section-lead reveal">Como cada negócio tem uma necessidade diferente, não trabalhamos com pacote fechado. A proposta descreve o que será feito, de que forma e com qual investimento.</p></div>${textLink('Ver o processo completo', '/como-funciona')}</div>
    ${steps(hiringSteps)}
  </div>
</section>

${plansOverview()}

<section class="section promises" aria-labelledby="principios">
  <div class="wrap promises-grid">
    <div class="promises-intro">
      ${sectionHead({ h2: 'O que você pode esperar de quem trabalha com você.', text: 'A competência de um trabalho aparece na clareza com que ele é conduzido, do primeiro contato à entrega.', id: 'principios' })}
      <div class="promises-mascot" aria-hidden="true">${mascot()}</div>
    </div>
    <dl class="promise-list">${promises.map(([t, d], i) => `<div class="reveal" style="--i:${i}"><dt>${check}${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
  </div>
</section>

<section class="section section-alt" aria-labelledby="leituras">
  <div class="wrap">
    <div class="section-head split-head"><div><h2 id="leituras" class="reveal">Aprenda antes de contratar.</h2><p class="section-lead reveal">${posts.length} artigos para entender as opções, comparar caminhos e chegar à conversa com as perguntas certas.</p></div>${textLink('Ver todos os artigos', '/blog')}</div>
    <div class="post-grid">${featured.map(p => postCard(p)).join('')}</div>
    <ul class="topic-chips">${Object.entries(categories).map(([slug, c]) => `<li><a href="${href('/blog/' + slug + '/')}">${c.name}</a></li>`).join('')}</ul>
  </div>
</section>

<section class="section" aria-labelledby="duvidas">
  <div class="wrap faq-layout">
    ${sectionHead({ h2: 'Perguntas que costumam vir antes da primeira conversa.', text: 'Se a sua dúvida não estiver aqui, ela pode ir direto no pedido de proposta.', id: 'duvidas' })}
    ${faq(generalFaq)}
  </div>
</section>

${ctaBand({ h2: 'Cada projeto começa pelo que você realmente precisa.', text: 'Conte seu objetivo com suas palavras. Depois de entender o contexto, apresentamos as entregas, o escopo e o investimento, sem prometer o que ainda não foi avaliado.', cta: { label: 'Solicitar proposta', href: '/contato' }, secondary: { label: 'Ver como funciona', href: '/como-funciona' } })}
`;
  return {
    route: '/',
    title: 'Lorz | Social media, criação de sites e ferramentas personalizadas',
    description: 'A Lorz une comunicação, presença digital e tecnologia: gestão de redes sociais, criação de sites e ferramentas personalizadas para negócios. Solicite uma proposta.',
    bodyClass: 'is-home',
    schema: {
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'Organization', '@id': absolute('/') + '#org', name: 'Lorz', url: absolute('/'), logo: absolute('/') + 'assets/brand/lorz-logo.svg', description: 'Serviços de social media, criação de sites e ferramentas personalizadas para negócios.' },
        { '@type': 'WebSite', name: 'Lorz', url: absolute('/'), inLanguage: 'pt-BR', publisher: { '@id': absolute('/') + '#org' } },
        { '@type': 'FAQPage', mainEntity: generalFaq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
      ]
    },
    body
  };
}
