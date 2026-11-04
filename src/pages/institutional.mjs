import { esc, href } from '../lib/html.mjs';
import { config } from '../config.mjs';
import { services } from '../data/services.mjs';
import { breadcrumbs, check, ctaBand, icon, mascot, sectionHead, steps, textLink, arrow } from '../components.mjs';
import { hiringSteps } from './home.mjs';

function aboutPage() {
  const body = `<section class="hero hero-page hero-about">
  <div class="wrap about-hero">
    <div>
      ${breadcrumbs([{ name: 'Início', route: '/' }, { name: 'Sobre', route: '/sobre' }])}
      <h1 class="hero-title hero-title-md">Comunicação, presença digital e tecnologia no mesmo raciocínio.</h1>
      <p class="hero-lead">A Lorz é uma marca de serviços criativos e digitais para negócios que precisam se apresentar melhor, facilitar o caminho dos clientes e organizar a própria rotina.</p>
    </div>
    <div class="about-mark" aria-hidden="true"><div class="bubble">Oi! Eu represento a Lorz por aqui.</div>${mascot()}</div>
  </div>
</section>
<section class="section" aria-labelledby="visao">
  <div class="wrap about-grid">
    ${sectionHead({ h2: 'O digital funciona melhor quando as partes se conversam.', id: 'visao' })}
    <div class="prose prose-plain reveal">
      <p>As redes sociais despertam o interesse de quem ainda não conhece a sua marca, o site apresenta os serviços e facilita o contato, e a tecnologia dá continuidade organizando as informações e as tarefas que vêm depois.</p>
      <p>Seu negócio pode precisar de uma dessas frentes ou da combinação entre elas. Quando existe conexão, fica mais fácil manter uma comunicação consistente em toda a experiência, do primeiro post ao atendimento.</p>
    </div>
  </div>
</section>
<section class="section section-dark positioning" aria-labelledby="posicionamento">
  <div class="wrap">
    ${sectionHead({ h2: 'A Lorz não é só uma agência de posts, nem só uma desenvolvedora de sites, e também não é uma plataforma pronta.', text: 'A Lorz combina três capacidades para atender negócios que não querem, nem precisam, virar especialistas em marketing ou tecnologia.', id: 'posicionamento' })}
    <ul class="capabilities">
      ${[
        ['social-media', 'Comunicação', 'Entender como a empresa se apresenta, conversa com o público e comunica o valor do que oferece.'],
        ['criacao-de-sites', 'Presença digital', 'Criar canais e experiências que tornam o negócio mais acessível, profissional e preparado para receber oportunidades.'],
        ['ferramentas-personalizadas', 'Tecnologia aplicada', 'Desenvolver ferramentas sob medida para simplificar processos comerciais e operacionais.']
      ].map(([slug, t, d], i) => `<li class="reveal" style="--i:${i}" data-accent="${services.find(s => s.slug === slug).accent}">${icon(slug)}<h3>${t}</h3><p>${d}</p></li>`).join('')}
    </ul>
  </div>
</section>
<section class="section principles" aria-labelledby="principios">
  <div class="wrap promises-grid">
    ${sectionHead({ h2: 'O que orienta cada escolha.', id: 'principios' })}
    <dl class="promise-list">
      <div class="reveal"><dt>${check}Clareza em cada etapa</dt><dd>Você entende o que está sendo desenvolvido, por que isso importa e quais são as próximas etapas.</dd></div>
      <div class="reveal"><dt>${check}Criatividade com propósito</dt><dd>O visual chama atenção, mas cada escolha precisa ajudar a sua marca a comunicar alguma coisa.</dd></div>
      <div class="reveal"><dt>${check}Tecnologia que facilita a rotina</dt><dd>A ferramenta certa é aquela que facilita o trabalho, não a que adiciona mais etapas.</dd></div>
      <div class="reveal"><dt>${check}Sem pacotes engessados</dt><dd>A solução acompanha a necessidade, e o escopo, os limites e o investimento ficam por escrito antes do início.</dd></div>
    </dl>
  </div>
</section>
<section class="section section-alt process" aria-labelledby="processo">
  <div class="wrap">
    ${sectionHead({ h2: 'Do primeiro contato à proposta.', id: 'processo' })}
    ${steps(hiringSteps)}
  </div>
</section>
${ctaBand({ h2: 'Vamos entender o que o seu negócio precisa.', text: 'Conte seu objetivo e os desafios atuais. A partir disso, definimos uma proposta com escopo claro.', cta: { label: 'Iniciar uma conversa', href: '/contato' }, secondary: { label: 'Ver os serviços', href: '/servicos' } })}`;
  return { route: '/sobre', title: 'Sobre a Lorz | Comunicação, presença digital e tecnologia aplicada', description: 'Conheça a Lorz: uma marca de serviços criativos e digitais que combina comunicação, presença digital e tecnologia aplicada para negócios.', body };
}

function contactPage() {
  const offerOptions = services.map(s => `<optgroup label="${esc(s.name)}" data-for="${s.slug}">${s.offers.items.map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join('')}</optgroup>`).join('');
  const conditional = {
    'social-media': [['perfis', 'Quais perfis você tem hoje?', 'Ex.: @suaempresa no Instagram, página no Facebook…'], ['delegar', 'Você quer executar ou delegar a produção?', 'Ex.: quero orientação para fazer sozinho / quero delegar tudo']],
    'criacao-de-sites': [['objetivo-site', 'Qual é o principal objetivo do site?', 'Ex.: apresentar serviços, receber pedidos de orçamento…'], ['site-atual', 'Você já tem um site? Quais recursos deseja?', 'Endereço atual, se houver, e o que gostaria de ter']],
    'ferramentas-personalizadas': [['como-hoje', 'Como essa atividade é feita hoje?', 'Ex.: pedidos anotados em planilha e confirmados no WhatsApp'], ['ferramentas', 'Quais ferramentas vocês já usam?', 'Ex.: planilhas, CRM, sistema de agendamento…']]
  };
  const body = `<section class="hero hero-page hero-contact">
  <div class="wrap hero-narrow">
    ${breadcrumbs([{ name: 'Início', route: '/' }, { name: 'Contato', route: '/contato' }])}
    <h1 class="hero-title hero-title-md">Conte o que você precisa.</h1>
    <p class="hero-lead">Você não precisa preencher um briefing técnico. Explique seu objetivo com suas palavras, mesmo que ainda não saiba qual solução procura.</p>
  </div>
</section>
<section class="section contact" aria-label="Formulário de contato">
  <div class="wrap contact-grid">
    <form class="form" id="briefing" novalidate data-contact-form data-email="${esc(config.email)}" data-whatsapp="${esc(config.whatsapp)}">
      <fieldset class="form-group">
        <legend>Sobre você</legend>
        <div class="field"><label for="nome">Seu nome</label><input id="nome" name="nome" autocomplete="name" required><p class="field-error" id="nome-erro" hidden>Informe seu nome.</p></div>
        <div class="field"><label for="negocio">Nome do negócio <span class="optional">opcional</span></label><input id="negocio" name="negocio" autocomplete="organization"></div>
        <div class="field">
          <span class="label" id="canal-label">Como prefere receber o retorno?</span>
          <div class="segmented" role="radiogroup" aria-labelledby="canal-label">
            <label><input type="radio" name="canal" value="email" checked><span>E-mail</span></label>
            <label><input type="radio" name="canal" value="whatsapp"><span>WhatsApp</span></label>
          </div>
        </div>
        <div class="field"><label for="retorno" data-retorno-label>Seu e-mail</label><input id="retorno" name="retorno" type="email" autocomplete="email" inputmode="email" required><p class="field-error" id="retorno-erro" hidden>Informe um contato válido para o retorno.</p></div>
      </fieldset>
      <fieldset class="form-group">
        <legend>Sobre o projeto</legend>
        <div class="field">
          <span class="label" id="servico-label">Serviço de interesse</span>
          <div class="choice-grid" role="radiogroup" aria-labelledby="servico-label">
            ${services.map(s => `<label class="choice" data-accent="${s.accent}"><input type="radio" name="servico" value="${s.slug}">${icon(s.slug)}<span>${s.name}</span></label>`).join('')}
            <label class="choice"><input type="radio" name="servico" value="nao-sei" checked><svg class="pillar-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="16"/><path d="M19.5 19a4.5 4.5 0 1 1 6.5 4c-1.3.7-2 1.6-2 3v1M24 32v1"/></svg><span>Ainda não sei</span></label>
          </div>
        </div>
        <div class="field" data-offer-field hidden><label for="plano">Interesse específico <span class="optional">opcional</span></label><select id="plano" name="plano"><option value="">Ainda não sei</option>${offerOptions}</select></div>
        ${Object.entries(conditional).map(([slug, fields]) => `<div class="conditional" data-when="${slug}" hidden>${fields.map(([id, l, ph]) => `<div class="field"><label for="${id}">${l} <span class="optional">opcional</span></label><input id="${id}" name="${id}" placeholder="${esc(ph)}"></div>`).join('')}</div>`).join('')}
        <div class="field"><label for="mensagem">O que você precisa melhorar ou criar?</label><textarea id="mensagem" name="mensagem" rows="6" required placeholder="Conte o contexto, o objetivo e o que já existe."></textarea><p class="field-error" id="mensagem-erro" hidden>Conte em poucas palavras o que você precisa.</p></div>
        <p class="field-hint">Não inclua dados sensíveis, senhas ou informações de clientes.</p>
      </fieldset>
      <input type="hidden" name="origem" value="">
      <div class="form-submit">
        <button class="btn btn-primary" type="submit">${config.email || config.whatsapp ? 'Enviar solicitação' : 'Preparar minha mensagem'}${arrow}</button>
        <p class="micro">O envio é um pedido de contato e não representa aprovação automática de orçamento ou prazo. <a href="politica-de-privacidade.html">Privacidade</a>.</p>
      </div>
      <div class="form-result" data-form-result hidden tabindex="-1" aria-live="polite">
        <h2 class="form-result-title">Sua mensagem está pronta.</h2>
        <p data-result-text></p>
        <pre class="form-preview" data-preview></pre>
        <div class="actions" data-result-actions>
          <a class="btn btn-primary" data-send-email hidden>Enviar por e-mail${arrow}</a>
          <a class="btn btn-primary" data-send-whatsapp hidden target="_blank" rel="noopener">Enviar pelo WhatsApp${arrow}</a>
          <button class="btn btn-secondary" type="button" data-copy>Copiar mensagem</button>
          <button class="btn btn-secondary" type="button" data-download>Baixar como arquivo</button>
        </div>
      </div>
    </form>
    <aside class="contact-aside">
      <div class="contact-card contact-card-mascot"><span class="avatar">${mascot()}</span><p><b>Lorz</b>Pode escrever do seu jeito. A gente organiza as informações e volta com as perguntas certas.</p></div>
      <div class="contact-card">
        <h2>O que acontece depois</h2>
        <ol class="mini-steps">${hiringSteps.slice(0, 3).map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('')}</ol>
      </div>
      ${config.email || config.whatsapp ? `<div class="contact-card"><h2>Prefere falar direto?</h2><ul class="contact-direct">${config.email ? `<li><a href="mailto:${esc(config.email)}">${esc(config.email)}</a></li>` : ''}${config.whatsapp ? `<li><a href="https://wa.me/${esc(config.whatsapp)}" rel="noopener" target="_blank">WhatsApp</a></li>` : ''}</ul></div>`
        : `<div class="contact-card contact-card-note"><h2>Canal em configuração</h2><p>Os canais oficiais de atendimento da Lorz estão sendo configurados. Enquanto isso, o formulário organiza sua mensagem para você copiar ou baixar, e nada é enviado automaticamente.</p></div>`}
      <div class="contact-card"><h2>Ainda comparando opções?</h2><ul class="contact-links">${services.map(s => `<li>${textLink(s.name, s.route)}</li>`).join('')}<li>${textLink('Ler o blog', '/blog')}</li></ul></div>
    </aside>
  </div>
</section>`;
  return { route: '/contato', title: 'Contato e proposta | Lorz', description: 'Conte o que você precisa melhorar ou criar. A Lorz entende o contexto e apresenta uma proposta com escopo, entregas e investimento.', body, bodyClass: 'is-contact' };
}

function privacyPage() {
  const blocks = [
    ['O que acontece com o formulário', `Os campos são processados no seu navegador. Este site não envia formulários a um servidor, não cria contas e não guarda o conteúdo em cookies ou armazenamento local. ${config.email || config.whatsapp ? 'Ao escolher enviar, a mensagem é aberta no seu aplicativo de e-mail ou no WhatsApp, e o envio só acontece quando você confirma por lá.' : 'A mensagem preparada pode ser copiada ou baixada como arquivo no seu dispositivo.'}`],
    ['Serviços externos', 'Fontes, imagens e scripts são servidos pelo próprio site. Não há ferramentas de publicidade, análise de audiência ou rastreamento incorporadas. O provedor de hospedagem pode processar registros técnicos de acesso para entregar as páginas.'],
    ['Quando houver recebimento de contatos', 'As informações sobre o responsável pelo tratamento, os canais de atendimento e o uso das mensagens serão publicadas aqui antes que o recebimento direto de contatos seja ativado.'],
    ['Seus arquivos', 'Uma mensagem baixada fica apenas no seu dispositivo, e você pode editá-la ou excluí-la quando quiser. Fechar ou recarregar a página descarta os campos preenchidos.'],
    ['Dados sensíveis', 'Não inclua no formulário senhas, documentos, dados de saúde, informações financeiras ou dados pessoais de terceiros.']
  ];
  const body = `<section class="hero hero-page"><div class="wrap">${breadcrumbs([{ name: 'Início', route: '/' }, { name: 'Privacidade', route: '/politica-de-privacidade' }])}<h1 class="hero-title hero-title-md">Privacidade, com clareza.</h1><p class="hero-lead">Como esta versão do site lida com as informações que você digita.</p></div></section>
<section class="section"><div class="wrap"><div class="prose prose-plain legal">${blocks.map(([t, d]) => `<h2>${t}</h2><p>${d}</p>`).join('')}</div></div></section>`;
  return { route: '/politica-de-privacidade', title: 'Privacidade | Lorz', description: 'Como o site da Lorz trata as informações do formulário de contato: processamento local, sem rastreamento e sem cookies de publicidade.', body };
}

function notFoundPage() {
  const body = `<section class="hero hero-page hero-404"><div class="wrap notfound">
  <div class="notfound-mascot" aria-hidden="true">${mascot()}<span class="notfound-code">404</span></div><div>
  <h1 class="hero-title hero-title-md">Esta página não existe ou mudou de lugar.</h1>
  <p class="hero-lead">O endereço pode ter sido digitado errado ou o conteúdo foi reorganizado. Estes caminhos costumam ajudar:</p>
  <ul class="notfound-links">
    <li><a href="index.html">Página inicial${arrow}</a></li>
    <li><a href="servicos.html">Serviços${arrow}</a></li>
    <li><a href="blog.html">Blog${arrow}</a></li>
    <li><a href="contato.html">Contato${arrow}</a></li>
  </ul>
</div></div></section>`;
  return { route: '/404', title: 'Página não encontrada | Lorz', description: 'O endereço acessado não foi encontrado no site da Lorz.', body };
}

export const institutionalPages = () => [aboutPage(), contactPage(), privacyPage(), notFoundPage()];
