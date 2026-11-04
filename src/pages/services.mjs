import { esc, href } from '../lib/html.mjs';
import { services } from '../data/services.mjs';
import { arrow, breadcrumbs, button, check, crossLink, ctaBand, faq, funnelRouter, icon, minus, postCard, sectionHead, steps, textLink, uiFor } from '../components.mjs';
import { postsForService } from '../blog.mjs';
import { absolute } from '../layout.mjs';
import { generalFaq, hiringSteps } from './home.mjs';

const cell = v => v === 'Sim' ? `<td class="is-yes">${check}<span class="sr-only">Sim</span></td>` : `<td${/^Não/.test(v) ? ' class="is-no"' : ''}>${/^Não/.test(v) ? minus : ''}<span>${esc(v)}</span></td>`;

function serviceHero(s) {
  return `<section class="hero hero-page hero-service" data-accent="${s.accent}">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      ${breadcrumbs([{ name: 'Início', route: '/' }, { name: 'Serviços', route: '/servicos' }, { name: s.name, route: s.route }])}
      <p class="svc-badge">${icon(s.slug)}${esc(s.name)}</p>
      <h1 class="hero-title hero-title-md">${esc(s.hero.h1)}</h1>
      <p class="hero-lead">${esc(s.hero.lead)}</p>
      <div class="actions">${button(s.hero.primary, s.hero.primary.href.startsWith('#') ? 'secondary' : 'primary')}${button(s.hero.secondary, s.hero.secondary.href.startsWith('#') ? 'secondary' : 'primary')}</div>
      <p class="hero-micro">${esc(s.hero.micro)}</p>
    </div>
    <div class="hero-visual">${uiFor(s.slug)}<p class="ui-caption">Ilustração de exemplo do trabalho em ${esc(s.name)}.</p></div>
  </div>
  <nav class="wrap plan-jump" aria-label="${s.variantsLabel} de ${esc(s.name)}">
    <ul>${s.offers.items.map(o => `<li><a href="#${o.id}"><strong>${esc(o.name)}</strong><span>${esc(o.tag)}</span></a></li>`).join('')}</ul>
  </nav>
</section>`;
}

const valueBlock = v => `<section class="section value" aria-labelledby="valor">
  <div class="wrap value-grid">
    ${sectionHead({ h2: v.h2, text: v.text, id: 'valor' })}
    <ul class="value-points">${v.points.map(([t, d], i) => `<li class="reveal" style="--i:${i}">${check}<strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join('')}</ul>
  </div>
</section>`;

export const planCard = (s, it, { compact = false } = {}) => `<article class="plan reveal" id="${compact ? 'p-' : ''}${it.id}" data-accent="${s.accent}" aria-labelledby="${compact ? 'p-' : ''}${it.id}-nome">
  <header class="plan-head">
    <p class="plan-tag">${esc(it.tag)}</p>
    <h3 id="${compact ? 'p-' : ''}${it.id}-nome">${esc(it.name)}</h3>
    <p class="plan-summary">${esc(it.summary)}</p>
    <p class="plan-price"><strong>Sob proposta</strong><span>Investimento definido depois do diagnóstico</span></p>
    ${button(it.cta, 'primary', ' data-plan-cta')}
  </header>
  <div class="plan-body">
    ${compact ? '' : `<p class="plan-desc">${esc(it.description)}</p>`}
    <p class="plan-label">${esc(it.includesLabel)}</p>
    <ul class="check-list">${it.includes.map(x => `<li>${check}<span>${esc(x)}</span></li>`).join('')}</ul>
    ${!compact && (it.who || it.for) ? `<dl class="plan-facts">${it.who ? `<div><dt>Quem faz o quê</dt><dd>${esc(it.who)}</dd></div>` : ''}${it.for ? `<div><dt>Indicado para</dt><dd>${esc(it.for)}</dd></div>` : ''}</dl>` : ''}
  </div>
</article>`;

const offerBlock = s => `<section class="section section-alt offers" id="${s.offers.id}" aria-labelledby="${s.offers.id}-titulo">
  <div class="wrap">
    ${sectionHead({ h2: s.offers.h2, text: s.offers.text, id: s.offers.id + '-titulo', align: 'center' })}
    <div class="plan-grid">${s.offers.items.map(it => planCard(s, it)).join('')}</div>
  </div>
</section>`;

const compareTable = c => `<div class="compare-switch" role="group" aria-label="Escolha a coluna para comparar no celular" data-compare-switch>
      ${c.cols.map((col, i) => `<button type="button" data-col="${i + 1}" aria-pressed="${i === 0}">${esc(col)}</button>`).join('')}
    </div>
    <div class="table-scroll compare-table" data-show="1" role="region" aria-label="${esc(c.h2)}" tabindex="0">
      <table>
        <thead><tr><td></td>${c.cols.map(col => `<th scope="col">${esc(col)}</th>`).join('')}</tr></thead>
        <tbody>${c.rows.map(([label, ...vals]) => `<tr><th scope="row">${esc(label)}</th>${vals.map(cell).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
    <p class="micro">${esc(c.micro)}</p>`;

const compareBlock = c => `<section class="section compare" aria-labelledby="comparar">
  <div class="wrap">
    ${sectionHead({ h2: c.h2, id: 'comparar' })}
    ${compareTable(c)}
  </div>
</section>`;

const noticeBlock = n => `<section class="section section-tight" aria-labelledby="aviso">
  <div class="wrap">
    <div class="notice reveal">
      <svg class="notice-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.5"/></svg>
      <div>
        <h2 id="aviso">${esc(n.h2)}</h2>
        <p>${esc(n.text)}</p>
        <ul>${n.extra.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>`;

const splitBlock = sp => `<section class="section section-tight" aria-labelledby="etapas-blog">
  <div class="wrap">
    <div class="split reveal">
      <h2 id="etapas-blog">${esc(sp.h2)}</h2>
      <div class="split-pair">${sp.items.map(([t, d]) => `<div class="split-item"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('<span class="split-plus" aria-hidden="true">+</span>')}</div>
      <p>${esc(sp.text)}</p>
    </div>
  </div>
</section>`;

const examplesBlock = ex => `<section class="section compare" aria-labelledby="exemplos">
  <div class="wrap">
    ${sectionHead({ h2: ex.h2, id: 'exemplos' })}
    <ul class="examples">${ex.rows.map(([p, s], i) => `<li class="example reveal" style="--i:${i % 3}"><p class="example-problem"><span>${esc(ex.head[0])}</span>${esc(p)}</p>${arrow}<p class="example-solution"><span>${esc(ex.head[1])}</span>${esc(s)}</p></li>`).join('')}</ul>
    <p class="micro">${esc(ex.micro)}</p>
  </div>
</section>`;

const limitsBlock = l => `<section class="section section-tight" aria-labelledby="limites">
  <div class="wrap">
    <div class="notice notice-calm reveal">
      <svg class="notice-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M8 12h8M8 8h8M8 16h5"/></svg>
      <div><h2 id="limites">${esc(l.h2)}</h2><p>${esc(l.text)}</p><ul>${l.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
  </div>
</section>`;

const readsBlock = (reads, h2, lead) => reads.length ? `<section class="section section-alt" aria-labelledby="leituras">
  <div class="wrap">
    <div class="section-head split-head"><div><h2 id="leituras" class="reveal">${esc(h2)}</h2><p class="section-lead reveal">${esc(lead)}</p></div>${textLink('Ir para o conteúdo', '/blog')}</div>
    <div class="post-grid">${reads.map(p => postCard(p)).join('')}</div>
  </div>
</section>` : '';

function servicePage(s) {
  const reads = postsForService(s.slug).slice(0, 3);
  const body = serviceHero(s) + valueBlock(s.value) + offerBlock(s) + (s.compare ? compareBlock(s.compare) : '')
    + (s.notice ? noticeBlock(s.notice) : '') + (s.split ? splitBlock(s.split) : '') + (s.examples ? examplesBlock(s.examples) : '')
    + `<section class="section section-dark process" aria-labelledby="processo"><div class="wrap">${sectionHead({ h2: s.process.h2, id: 'processo' })}${steps(s.process.steps)}<div class="actions">${button(s.process.cta, 'light')}</div></div></section>`
    + (s.limits ? limitsBlock(s.limits) : '')
    + `<section class="section" aria-labelledby="duvidas"><div class="wrap faq-layout">${sectionHead({ h2: 'Perguntas frequentes sobre ' + s.name, text: 'As dúvidas que mais aparecem antes de contratar esta frente.', id: 'duvidas' })}${faq(s.faq)}</div></section>`
    + readsBlock(reads, 'Ainda avaliando? Comece por estas leituras.', `Artigos sobre ${s.name.toLowerCase()} para entender as opções antes da conversa.`)
    + ctaBand(s.final)
    + crossLink(s.cross);
  return {
    route: s.route, title: s.seo.title, description: s.seo.description, bodyClass: 'is-service', body,
    schema: {
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'Service', name: s.name, serviceType: s.name, description: s.seo.description, provider: { '@type': 'Organization', name: 'Lorz', url: absolute('/') }, areaServed: 'BR', url: absolute(s.route),
          hasOfferCatalog: { '@type': 'OfferCatalog', name: s.variantsLabel, itemListElement: s.offers.items.map(o => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.name, description: o.summary } })) } },
        { '@type': 'BreadcrumbList', itemListElement: [['Início', '/'], ['Serviços', '/servicos'], [s.name, s.route]].map(([name, r], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(r) })) },
        { '@type': 'FAQPage', mainEntity: s.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
      ]
    }
  };
}

const guide = [
  ['Publico sem frequência ou sem saber o que dizer', 'social-media', 'direcao'],
  ['Não tenho tempo para produzir e publicar conteúdo', 'social-media', 'gestao'],
  ['Meu negócio só existe no Instagram', 'criacao-de-sites', 'landing-page'],
  ['Preciso apresentar vários serviços ou públicos', 'criacao-de-sites', 'site-completo'],
  ['Quero responder dúvidas do público com artigos', 'criacao-de-sites', 'site-blog'],
  ['Contatos se perdem entre WhatsApp, e-mail e planilhas', 'ferramentas-personalizadas', 'automacoes'],
  ['Controlo pedidos ou agendamentos à mão', 'ferramentas-personalizadas', 'sistemas'],
  ['Tenho dados, mas não consigo enxergar o que importa', 'ferramentas-personalizadas', 'dados']
];

const guideList = () => `<ul class="guide">${guide.map(([t, slug, id], i) => { const s = services.find(x => x.slug === slug); const o = s.offers.items.find(x => x.id === id); return `<li class="reveal" style="--i:${i % 4}" data-accent="${s.accent}"><a href="${href(s.route + '#' + id)}"><span class="guide-q">${esc(t)}</span><span class="guide-a">${icon(slug)}<span><small>${s.name}</small>${esc(o.name)}</span>${arrow}</span></a></li>`; }).join('')}</ul>`;

function hubPage() {
  const body = `<section class="hero hero-page">
  <div class="wrap hero-narrow">
    ${breadcrumbs([{ name: 'Início', route: '/' }, { name: 'Serviços', route: '/servicos' }])}
    <h1 class="hero-title hero-title-md">Soluções para a presença e a rotina do seu negócio.</h1>
    <p class="hero-lead">Comunicação nas redes, um site próprio e ferramentas para organizar a operação: três frentes independentes, que podem se conectar quando fizer sentido.</p>
    <div class="actions"><a class="btn btn-primary" href="#guia">Descobrir por onde começar${arrow}</a><a class="btn btn-secondary" href="planos.html">Comparar planos</a></div>
  </div>
</section>
<section class="section" aria-label="As três frentes">
  <div class="wrap hub-list">
    ${services.map(s => `<article class="hub-item reveal" id="${s.slug}" data-accent="${s.accent}">
      <div class="hub-copy">
        <p class="svc-badge">${icon(s.slug)}${s.name}</p>
        <h2><a href="${href(s.route)}">${esc(s.hero.h1)}</a></h2>
        <p>${esc(s.value.text)}</p>
        <ul class="plan-chips">${s.offers.items.map(o => `<li><a href="${href(s.route + '#' + o.id)}">${esc(o.name)}</a></li>`).join('')}</ul>
        <div class="actions">${button({ label: 'Conhecer ' + s.name, href: s.route }, 'primary')}</div>
      </div>
      <div class="hub-visual">${uiFor(s.slug)}</div>
    </article>`).join('')}
  </div>
</section>
<section class="section section-alt" id="guia" aria-labelledby="guia-titulo">
  <div class="wrap">
    ${sectionHead({ h2: 'Qual frente resolve o seu problema?', text: 'Escolha a situação mais parecida com a sua para ter um ponto de partida. Na conversa inicial, avaliamos juntos o caminho mais adequado.', id: 'guia-titulo', align: 'center' })}
    ${guideList()}
  </div>
</section>
${funnelRouter({ id: 'caminhos-servicos' })}
${ctaBand({ h2: 'Cada projeto começa pelo que você realmente precisa.', text: 'Depois de entender seu objetivo, apresentamos as entregas, o escopo e o investimento, sem prometer o que ainda não foi avaliado.', cta: { label: 'Solicitar proposta', href: '/contato' }, secondary: { label: 'Ver como funciona', href: '/como-funciona' } })}`;
  return {
    route: '/servicos', title: 'Serviços: social media, criação de sites e ferramentas personalizadas | Lorz',
    description: 'Conheça os três serviços da Lorz (gestão de redes sociais, criação de sites e ferramentas personalizadas) e descubra por onde começar.',
    body,
    schema: { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: absolute(s.route) })) }
  };
}

const proposalIncludes = ['Escopo do que será feito e do que fica de fora', 'Entregas, formatos e canais combinados', 'Responsabilidades da Lorz e do seu lado', 'Etapas e prazos de cada fase', 'Investimento e eventuais custos de terceiros', 'Condições de ajuste, suporte e continuidade'];

const plansFaq = [
  ['Por que o site não mostra preços?', 'Porque o investimento depende de frequência, formatos, canais, páginas, integrações e complexidade. Mostrar um valor antes de entender o contexto levaria a uma proposta que não corresponde ao que o seu negócio precisa.'],
  ['Posso combinar planos de frentes diferentes?', 'Sim. Um plano de Social Media pode andar junto com um site ou com uma ferramenta. A proposta organiza as entregas de cada frente e mostra como elas se conectam.'],
  ['E se eu escolher o plano errado?', 'A escolha não acontece sozinha. Na conversa inicial avaliamos o momento do negócio e, se outro formato fizer mais sentido, a proposta já chega com essa indicação.'],
  ['Algum plano inclui atendimento ao público?', 'Não. Nenhum plano de Social Media inclui responder mensagens, comentários ou avaliações. O relacionamento direto com o público continua com a sua equipe.']
];

function plansPage() {
  const body = `<section class="hero hero-page">
  <div class="wrap hero-narrow center">
    ${breadcrumbs([{ name: 'Início', route: '/' }, { name: 'Planos', route: '/planos' }])}
    <h1 class="hero-title hero-title-md">Compare os planos e formatos antes de conversar.</h1>
    <p class="hero-lead">Veja lado a lado o que cada caminho inclui, quem faz o quê e o que fica fora do escopo. O investimento é apresentado em proposta, depois do diagnóstico do seu caso.</p>
  </div>
</section>
<section class="section section-flush" aria-label="Planos por frente">
  <div class="wrap">
    <div class="tabs tabs-plans" data-tabs>
      <div class="tab-list tab-list-center" role="tablist" aria-label="Escolha a frente">
        ${services.map((s, i) => `<button type="button" role="tab" id="plano-tab-${s.slug}" aria-controls="plano-${s.slug}" aria-selected="${i === 0}" data-accent="${s.accent}">${icon(s.slug)}<span>${s.name}</span></button>`).join('')}
      </div>
      ${services.map(s => `<div class="tab-panel tab-panel-stack" role="tabpanel" id="plano-${s.slug}" aria-labelledby="plano-tab-${s.slug}" data-accent="${s.accent}">
        <div class="panel-head"><h2>${esc(s.offers.h2)}</h2><p>${esc(s.offers.text)}</p></div>
        <div class="plan-grid">${s.offers.items.map(it => planCard(s, it, { compact: true })).join('')}</div>
        ${s.compare ? `<div class="panel-compare"><h3>${esc(s.compare.h2)}</h3>${compareTable(s.compare)}</div>` : ''}
        <p class="panel-more">${textLink('Ver a página completa de ' + s.name, s.route)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>
<section class="section section-alt" aria-labelledby="proposta-inclui">
  <div class="wrap promises-grid">
    ${sectionHead({ h2: 'Toda proposta chega por escrito, com estas informações.', text: 'Independentemente da frente ou do plano, você sabe o que vai receber antes de aprovar qualquer execução.', id: 'proposta-inclui' })}
    <ul class="check-list check-list-lg">${proposalIncludes.map(x => `<li class="reveal">${check}<span>${x}</span></li>`).join('')}</ul>
  </div>
</section>
<section class="section" aria-labelledby="duvidas">
  <div class="wrap faq-layout">
    ${sectionHead({ h2: 'Dúvidas sobre planos e investimento.', text: 'O que costuma surgir na hora de escolher um formato de trabalho.', id: 'duvidas' })}
    ${faq(plansFaq)}
  </div>
</section>
${ctaBand({ h2: 'Ainda em dúvida sobre o plano certo?', text: 'Conte o seu momento e o que precisa melhorar. A gente indica o formato mais adequado e explica o motivo na proposta.', cta: { label: 'Solicitar proposta', href: '/contato' }, secondary: { label: 'Ver como funciona', href: '/como-funciona' } })}`;
  return {
    route: '/planos', title: 'Planos e formatos de Social Media, Sites e Ferramentas | Lorz',
    description: 'Compare os planos de Social Media, os formatos de site e as vertentes de ferramentas personalizadas da Lorz: o que cada um inclui e quem faz o quê.',
    body,
    schema: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: plansFaq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  };
}

const responsibilities = [
  ['A Lorz cuida de', ['Diagnóstico, estratégia e planejamento do que foi contratado', 'Criação, desenvolvimento e publicação das entregas previstas', 'Validação com você em cada etapa importante', 'Análise e ajustes dentro do escopo combinado']],
  ['Você cuida de', ['Informações sobre o negócio, ofertas e materiais', 'Aprovação das peças, páginas e funcionalidades', 'Relacionamento direto com o seu público e clientes', 'Contratações de terceiros, quando a proposta indicar']]
];

function howPage() {
  const body = `<section class="hero hero-page">
  <div class="wrap hero-narrow center">
    ${breadcrumbs([{ name: 'Início', route: '/' }, { name: 'Como funciona', route: '/como-funciona' }])}
    <h1 class="hero-title hero-title-md">Como funciona trabalhar com a Lorz.</h1>
    <p class="hero-lead">Do primeiro contato à entrega, cada etapa tem um objetivo claro, e você sabe o que acontece agora e o que vem depois.</p>
    <div class="actions center">${button({ label: 'Solicitar proposta', href: '/contato' })}${button({ label: 'Comparar planos', href: '/planos' }, 'secondary')}</div>
  </div>
</section>
<section class="section" aria-labelledby="etapas">
  <div class="wrap">
    ${sectionHead({ h2: 'Quatro etapas, nenhuma surpresa no caminho.', text: 'A execução só começa depois que o escopo, as responsabilidades e o investimento estão aprovados por escrito.', id: 'etapas' })}
    ${steps(hiringSteps)}
  </div>
</section>
<section class="section section-alt" aria-labelledby="por-frente">
  <div class="wrap">
    ${sectionHead({ h2: 'O processo de cada frente, em detalhe.', text: 'As etapas gerais se adaptam ao tipo de trabalho. Escolha a frente para ver como ela acontece na prática.', id: 'por-frente', align: 'center' })}
    <div class="tabs" data-tabs>
      <div class="tab-list tab-list-center" role="tablist" aria-label="Escolha a frente">
        ${services.map((s, i) => `<button type="button" role="tab" id="proc-tab-${s.slug}" aria-controls="proc-${s.slug}" aria-selected="${i === 0}" data-accent="${s.accent}">${icon(s.slug)}<span>${s.name}</span></button>`).join('')}
      </div>
      ${services.map(s => `<div class="tab-panel tab-panel-stack" role="tabpanel" id="proc-${s.slug}" aria-labelledby="proc-tab-${s.slug}" data-accent="${s.accent}">
        <div class="panel-head"><h3>${esc(s.process.h2)}</h3></div>
        ${steps(s.process.steps)}
        <p class="panel-more">${button(s.process.cta, 'secondary')}</p>
      </div>`).join('')}
    </div>
  </div>
</section>
<section class="section" aria-labelledby="quem-faz">
  <div class="wrap">
    ${sectionHead({ h2: 'Quem faz o quê, combinado desde o início.', text: 'Cada parte sabe pelo que responde, o que evita retrabalho e expectativas desalinhadas.', id: 'quem-faz' })}
    <div class="duty-grid">${responsibilities.map(([t, items], i) => `<div class="duty reveal${i === 0 ? ' duty-lorz' : ''}"><h3>${t}</h3><ul class="check-list">${items.map(x => `<li>${check}<span>${x}</span></li>`).join('')}</ul></div>`).join('')}</div>
  </div>
</section>
<section class="section section-alt" aria-labelledby="proposta">
  <div class="wrap promises-grid">
    ${sectionHead({ h2: 'O que vem escrito na proposta.', text: 'Antes de aprovar, você tem em mãos tudo o que precisa para decidir com segurança.', id: 'proposta' })}
    <ul class="check-list check-list-lg">${proposalIncludes.map(x => `<li class="reveal">${check}<span>${x}</span></li>`).join('')}</ul>
  </div>
</section>
<section class="section" aria-labelledby="duvidas">
  <div class="wrap faq-layout">
    ${sectionHead({ h2: 'Perguntas sobre a contratação.', text: 'Respostas curtas para decidir com mais tranquilidade.', id: 'duvidas' })}
    ${faq(generalFaq)}
  </div>
</section>
${ctaBand({ h2: 'O primeiro passo é uma conversa.', text: 'Conte o contexto e o objetivo com suas palavras. A partir disso, montamos uma proposta com escopo claro para você avaliar.', cta: { label: 'Solicitar proposta', href: '/contato' } })}`;
  return {
    route: '/como-funciona', title: 'Como funciona a contratação | Lorz',
    description: 'Conversa, diagnóstico, proposta e execução: veja como a Lorz conduz cada projeto, quem faz o quê e o que vem escrito na proposta.',
    body
  };
}

export const servicePages = () => [hubPage(), ...services.map(servicePage), plansPage(), howPage()];
