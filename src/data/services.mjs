// Conteúdo comercial dos três pilares.
// Fonte: references/lorz_subpaginas_servicos.md (v0.17). Sem preços, volumes, prazos ou resultados: tudo é definido em proposta.

const contact = (servico, plano) => `/contato?servico=${servico}${plano ? '&plano=' + plano : ''}`;

export const services = [
  {
    slug: 'social-media',
    route: '/servicos/social-media',
    name: 'Social Media',
    accent: 'orange',
    verb: 'Comunicar',
    oneLiner: 'Planejamento, criação e gestão de conteúdo para redes sociais.',
    pitch: 'Para quem publica sem um plano claro, ou não tem tempo de manter a rotina de conteúdo.',
    variantsLabel: 'Planos',
    seo: {
      title: 'Social Media e Gestão de Redes Sociais | Lorz',
      description: 'Estratégia, planejamento e gestão de redes sociais para o seu negócio. Conheça os planos Direção, Gestão e Premium da Lorz.'
    },
    hero: {
      eyebrow: 'Social Media',
      h1: 'Suas redes sociais com mais direção.',
      lead: 'Não basta publicar por publicar. A Lorz ajuda você a organizar a comunicação, planejar conteúdos e manter uma presença alinhada ao seu negócio. Você escolhe o quanto quer fazer por conta própria e o quanto prefere deixar com a gente.',
      primary: { label: 'Conhecer os planos', href: '#planos' },
      secondary: { label: 'Conversar sobre minhas redes', href: contact('social-media') },
      micro: 'Do planejamento à gestão de conteúdo, em um formato adequado à sua rotina.'
    },
    channels: { core: ['Instagram', 'Facebook'], scope: ['Google Perfil da Empresa', 'LinkedIn', 'TikTok', 'YouTube'] },
    value: {
      h2: 'Sua comunicação precisa de um plano, não de mais improviso.',
      text: 'Quando cada publicação é feita de última hora, fica difícil manter uma mensagem consistente, testar ideias e entender o que funciona. Nosso trabalho é trazer clareza para o processo: o que comunicar, para quem, com qual objetivo e como melhorar ao longo do tempo.',
      points: [
        ['Clareza', 'Posicionamento, temas e linguagem conectados ao negócio.'],
        ['Consistência', 'Um calendário que organiza a produção e evita decisões de última hora.'],
        ['Aprendizado', 'Análise de resultados para orientar as próximas escolhas.']
      ]
    },
    offers: {
      id: 'planos',
      h2: 'Encontre a forma certa de cuidar das suas redes.',
      text: 'Algumas pessoas querem executar por conta própria e só precisam de orientação, outras preferem delegar a produção e a publicação, e há quem precise cuidar de mais canais ao mesmo tempo. Cada plano atende a um desses momentos.',
      items: [
        {
          id: 'direcao', name: 'Direção', tag: 'Estratégia e acompanhamento',
          summary: 'Você cuida das publicações enquanto a gente ajuda a definir o caminho.',
          description: 'Para quem quer administrar as próprias redes, mas precisa de uma estratégia clara. Começamos com uma análise do perfil e do posicionamento, construímos um calendário e, a cada mês, avaliamos os resultados para ajustar os próximos passos.',
          includesLabel: 'O que está incluído',
          includes: [
            'Análise inicial do perfil e da comunicação existente.',
            'Orientação de posicionamento, público e linguagem.',
            'Definição de temas e pilares de conteúdo.',
            'Calendário editorial mensal com sugestões de pautas e formatos.',
            'Orientações práticas para executar o planejamento.',
            'Reunião estratégica ao fim de cada mês: o que funcionou, o que não funcionou e o que melhorar.',
            'Atualização do direcionamento e do calendário para o mês seguinte.'
          ],
          who: 'A Lorz analisa, orienta e planeja, enquanto você produz, publica e administra os perfis.',
          for: 'Profissionais autônomos, pequenos negócios e quem quer manter a comunicação com autonomia.',
          cta: { label: 'Quero orientação para minhas redes', href: contact('social-media', 'direcao') }
        },
        {
          id: 'gestao', name: 'Gestão', tag: 'Instagram + Facebook',
          summary: 'Planejamento, criação e publicação sem depender da sua rotina.',
          description: 'Para quem precisa manter Instagram e Facebook ativos com conteúdo planejado e produzido profissionalmente. A Lorz organiza o calendário, desenvolve as peças e legendas, programa ou publica os materiais e acompanha os resultados do trabalho contratado.',
          includesLabel: 'O que está incluído',
          includes: [
            'Diagnóstico e direcionamento inicial da comunicação.',
            'Planejamento e calendário editorial.',
            'Criação de conteúdo nos formatos definidos na proposta, como imagens, carrosséis e vídeos editados.',
            'Legendas e chamadas para ação.',
            'Adaptação de conteúdos entre Instagram e Facebook, quando adequada.',
            'Programação e publicação dos materiais previstos no escopo.',
            'Acompanhamento de indicadores e análise mensal.',
            'Reunião de alinhamento e melhorias.'
          ],
          who: 'A Lorz planeja, produz e publica os conteúdos previstos. Você fornece informações e materiais, aprova as peças e segue responsável pelo relacionamento com seu público.',
          for: 'Empresas que querem delegar a rotina de conteúdo dessas duas redes.',
          cta: { label: 'Quero a gestão das minhas redes', href: contact('social-media', 'gestao') }
        },
        {
          id: 'premium', name: 'Premium', tag: 'Presença digital multicanal',
          summary: 'Mais canais coordenados, com uma comunicação consistente.',
          description: 'Amplia a gestão para além de Instagram e Facebook, para uma presença digital mais integrada, incluindo o Google Perfil da Empresa quando fizer sentido e, se o diagnóstico indicar, outros canais selecionados.',
          includesLabel: 'Base de atuação',
          includes: [
            'Planejamento, criação e publicação para Instagram e Facebook, conforme proposta.',
            'Organização e atualização das informações do Google Perfil da Empresa, quando aplicável.',
            'Planejamento de atualizações e publicações nesse perfil, conforme recursos e escopo.',
            'Possibilidade de atuação em LinkedIn, TikTok e YouTube, conforme objetivos, formatos e orçamento.',
            'Acompanhamento dos indicadores disponíveis nos canais contratados.',
            'Linguagem e identidade coerentes entre as plataformas.'
          ],
          who: 'A Lorz executa a gestão dos canais e entregas contratados. Você aprova os materiais e mantém as respostas e interações com o público.',
          for: 'Marcas com vários pontos de contato que precisam organizar a presença em mais de uma plataforma.',
          cta: { label: 'Conversar sobre uma gestão multicanal', href: contact('social-media', 'premium') }
        }
      ]
    },
    compare: {
      h2: 'O que muda de um plano para outro?',
      cols: ['Direção', 'Gestão', 'Premium'],
      rows: [
        ['Análise e direcionamento', 'Sim', 'Sim', 'Sim'],
        ['Calendário editorial', 'Sim', 'Sim', 'Sim'],
        ['Criação dos conteúdos', 'Você', 'Lorz, conforme proposta', 'Lorz, conforme proposta'],
        ['Publicação', 'Você', 'Lorz, conforme proposta', 'Lorz, conforme proposta'],
        ['Instagram e Facebook', 'Orientação conforme a necessidade', 'Gestão principal', 'Gestão principal'],
        ['Google Perfil da Empresa', 'Não incluído como gestão', 'Não incluído', 'Pode integrar o escopo'],
        ['LinkedIn, TikTok e YouTube', 'Não incluídos como gestão', 'Não incluídos', 'Opcionais, mediante proposta'],
        ['Análise e ajustes', 'Reunião mensal', 'Análise mensal', 'Conforme escopo multicanal'],
        ['Resposta a mensagens e comentários', 'Você', 'Você', 'Você'],
        ['Resposta a avaliações no Google', 'Você', 'Você', 'Você']
      ],
      micro: 'Frequência, formatos, volume de entregas e canais adicionais são definidos na proposta comercial.'
    },
    notice: {
      h2: 'Quem atende seu público continua sendo você.',
      text: 'Nenhum plano de Social Media inclui responder mensagens privadas, comentários ou avaliações, nem realizar atendimento comercial e suporte a seguidores e clientes. A Lorz cuida da estratégia e das entregas de conteúdo contratadas; o relacionamento direto com o público permanece com a sua equipe.',
      extra: ['Gestão de anúncios e investimento em mídia paga não estão incluídos automaticamente.', 'Gravações externas, sessões de fotos e deslocamentos têm orçamento próprio, quando necessários.']
    },
    process: {
      h2: 'Como começamos?',
      steps: [
        ['Conversa inicial', 'Entendemos seu negócio, seu público e o momento atual dos perfis.'],
        ['Diagnóstico', 'Avaliamos o que já existe e identificamos prioridades.'],
        ['Proposta', 'Definimos o plano, os canais, as entregas e o investimento.'],
        ['Planejamento e execução', 'Organizamos o calendário e cada parte cumpre suas responsabilidades.'],
        ['Análise e melhoria', 'Avaliamos os resultados e ajustamos o direcionamento.']
      ],
      cta: { label: 'Quero organizar minhas redes', href: contact('social-media') }
    },
    faq: [
      ['O plano Direção inclui criação de posts?', 'Não. A Lorz prepara a análise, a estratégia e o calendário, além de orientar os ajustes mensais. A criação e a publicação ficam por sua conta.'],
      ['O Gestão inclui quais redes sociais?', 'O foco do plano Gestão é Instagram e Facebook. Outras plataformas podem ser avaliadas no Premium.'],
      ['O Premium inclui todas as redes sociais?', 'Não. A seleção de canais depende do seu negócio e do escopo contratado. Instagram e Facebook são a base; o Google Perfil da Empresa pode fazer parte da gestão, e LinkedIn, TikTok ou YouTube podem ser incluídos conforme a necessidade.'],
      ['A Lorz responde directs e comentários?', 'Não. Mensagens privadas, comentários, avaliações e atendimento ao público são de responsabilidade do cliente em todos os planos.'],
      ['Quantas publicações estão incluídas?', 'O volume e os formatos são apresentados na proposta, depois de entendermos a rotina e os objetivos do negócio.'],
      ['Vocês fazem anúncios pagos?', 'A gestão de anúncios não faz parte automaticamente dos planos. Se for necessária, a possibilidade e o investimento são avaliados separadamente.'],
      ['Preciso fornecer materiais?', 'Depende do formato contratado. Informações sobre o negócio, ofertas, produtos e aprovações são sempre necessárias. Fotos, vídeos e captação externa são definidos no escopo.']
    ],
    final: {
      h2: 'Sua comunicação pode ter um plano mais claro.',
      text: 'Conte como sua empresa usa as redes hoje. A gente ajuda você a encontrar o formato de trabalho que faz sentido para a sua rotina.',
      cta: { label: 'Solicitar proposta de Social Media', href: contact('social-media') }
    },
    cross: { text: 'Precisa de um lugar próprio para receber os contatos que vêm das redes?', label: 'Conheça a criação de sites', route: '/servicos/criacao-de-sites' }
  },

  {
    slug: 'criacao-de-sites',
    route: '/servicos/criacao-de-sites',
    name: 'Criação de Sites',
    accent: 'red',
    verb: 'Apresentar',
    oneLiner: 'Landing pages, sites institucionais e sites com blog, feitos sob medida.',
    pitch: 'Para quem precisa de um endereço próprio que explique o que faz e facilite o contato.',
    variantsLabel: 'Formatos',
    seo: {
      title: 'Criação de Sites e Landing Pages | Lorz',
      description: 'Landing pages, sites institucionais e sites com blog, desenvolvidos de acordo com as necessidades do seu negócio. Solicite uma proposta à Lorz.'
    },
    hero: {
      eyebrow: 'Criação de Sites',
      h1: 'Um site que faz sentido para o seu negócio.',
      lead: 'Seu site pode apresentar seus serviços, reunir informações importantes e facilitar o primeiro contato com seus clientes. A Lorz desenvolve páginas e estruturas de acordo com a necessidade de cada projeto, sem soluções maiores do que o necessário.',
      primary: { label: 'Conhecer os formatos', href: '#formatos' },
      secondary: { label: 'Solicitar proposta de site', href: contact('criacao-de-sites') },
      micro: 'A quantidade de páginas, os recursos e o investimento são definidos depois de uma conversa inicial.'
    },
    value: {
      h2: 'Mais do que estar online, é preciso ser fácil de entender.',
      text: 'Quem entra no seu site precisa descobrir rapidamente o que você oferece, por que aquilo importa e como entrar em contato. Por isso, conteúdo, navegação, leitura em diferentes telas e funcionamento técnico são tratados como partes do mesmo projeto.',
      points: [
        ['Clareza', 'Apresentação objetiva de produtos, serviços e diferenciais.'],
        ['Experiência', 'Navegação pensada para celulares, tablets e computadores.'],
        ['Evolução', 'Estrutura planejada para o que o negócio precisa agora e para melhorias futuras.']
      ]
    },
    offers: {
      id: 'formatos',
      h2: 'Três caminhos para a sua presença digital.',
      text: 'O formato depende do que o site precisa fazer. Nenhum deles tem quantidade fixa de páginas ou artigos: a estrutura é definida depois do briefing.',
      items: [
        {
          id: 'landing-page', name: 'Landing Page', tag: 'Uma página, um objetivo principal',
          summary: 'As informações essenciais reunidas em uma página focada.',
          description: 'Ideal para apresentar um serviço, produto, campanha ou negócio em uma experiência direta. As seções são organizadas para conduzir a pessoa da apresentação até a ação desejada: pedir um orçamento, chamar no WhatsApp ou preencher um formulário.',
          includesLabel: 'Possibilidades de entrega',
          includes: [
            'Uma página com seções definidas conforme o objetivo.',
            'Apresentação do negócio, oferta, benefícios e informações essenciais.',
            'Chamadas para ação e caminhos de contato.',
            'Layout responsivo e navegação clara.',
            'Formulários, integrações e medições, quando previstos na proposta.',
            'Configurações técnicas básicas para publicação e indexação, quando aplicável.'
          ],
          for: 'Um serviço específico, campanhas, profissionais autônomos ou negócios que querem começar com uma página objetiva.',
          cta: { label: 'Quero uma Landing Page', href: contact('criacao-de-sites', 'landing-page') }
        },
        {
          id: 'site-completo', name: 'Site Completo', tag: 'Mais espaço para apresentar o negócio',
          summary: 'Páginas organizadas por assunto para tudo o que sua empresa oferece.',
          description: 'Quando o negócio tem mais informações, serviços ou públicos, uma única página pode não bastar. O site completo tem uma estrutura de navegação com páginas por assunto, para que cada visitante encontre o que é relevante para ele.',
          includesLabel: 'Possibilidades de entrega',
          includes: [
            'Página inicial e páginas internas, na quantidade definida em proposta.',
            'Estrutura de navegação e organização dos conteúdos.',
            'Páginas de serviços, sobre, contato ou outras necessidades identificadas.',
            'Componentes responsivos e formulários, quando necessários.',
            'Metadados, estrutura técnica de SEO e boas práticas de acessibilidade.',
            'Integrações e acompanhamento de eventos, quando contratados.',
            'Publicação, testes e entrega conforme escopo.'
          ],
          for: 'Empresas com diferentes serviços, públicos ou informações que precisam de uma apresentação mais completa.',
          cta: { label: 'Quero um Site Completo', href: contact('criacao-de-sites', 'site-completo') }
        },
        {
          id: 'site-blog', name: 'Site Completo + Blog', tag: 'Site com espaço para conteúdo',
          summary: 'Apresente o negócio e publique conteúdos que respondem às dúvidas do público.',
          description: 'Além da estrutura de um site completo, inclui um blog preparado para organizar e publicar artigos. Uma opção para quem quer compartilhar conhecimento, formar um acervo próprio e desenvolver presença nos mecanismos de busca ao longo do tempo.',
          includesLabel: 'Possibilidades de entrega',
          includes: [
            'Estrutura do site e páginas internas de acordo com o projeto.',
            'Área de blog, listagem e páginas de artigos.',
            'Categorias, navegação e organização editorial conforme a necessidade.',
            'Estrutura técnica de SEO e conteúdo compreensível por buscadores e sistemas de resposta.',
            'Planejamento de temas e produção de artigos, quando contratados.',
            'Publicação e acompanhamento editorial, conforme proposta específica.'
          ],
          for: 'Negócios que querem construir uma biblioteca própria de informações e trabalhar conteúdo de forma contínua.',
          cta: { label: 'Quero um Site + Blog', href: contact('criacao-de-sites', 'site-blog') }
        }
      ]
    },
    compare: {
      h2: 'Qual formato combina com o seu momento?',
      cols: ['Landing Page', 'Site Completo', 'Site + Blog'],
      rows: [
        ['Estrutura principal', 'Uma página', 'Múltiplas páginas', 'Múltiplas páginas + área editorial'],
        ['Objetivo típico', 'Apresentação ou ação específica', 'Apresentação abrangente do negócio', 'Presença institucional + conteúdo'],
        ['Quantidade de páginas', 'Uma página, com seções definidas em proposta', 'Definida após o briefing', 'Definida após o briefing'],
        ['Blog integrado', 'Não', 'Não faz parte da oferta-base', 'Sim'],
        ['Artigos e frequência', 'Não se aplica', 'Não se aplica', 'Definidos após o briefing e a contratação'],
        ['Investimento', 'Proposta personalizada', 'Proposta personalizada', 'Proposta personalizada']
      ],
      micro: 'Não trabalhamos com quantidade fixa de páginas ou artigos antes de conhecer a necessidade. O escopo completo é apresentado na proposta.'
    },
    split: {
      h2: 'No Site + Blog, cada etapa tem seu próprio escopo.',
      items: [
        ['Construção do site', 'Desenvolvimento das páginas, da navegação e da estrutura para receber artigos.'],
        ['Produção editorial', 'Planejamento, escrita, revisão e publicação de artigos, quando esse serviço for contratado.']
      ],
      text: 'As duas etapas podem fazer parte da mesma proposta, mas entregas e valores são apresentados separadamente. A quantidade e a frequência de artigos são definidas depois do primeiro contato.'
    },
    process: {
      h2: 'Do primeiro contato à publicação.',
      steps: [
        ['Entendimento', 'Conversamos sobre o negócio, o público e o papel que o site deve cumprir.'],
        ['Estrutura', 'Definimos páginas, seções, conteúdo, funcionalidades e integrações necessárias.'],
        ['Proposta', 'Apresentamos o escopo, as etapas, o investimento e as condições.'],
        ['Desenvolvimento', 'Criamos as páginas e validamos conteúdo, visual e navegação.'],
        ['Testes e entrega', 'Revisamos funcionamento e responsividade antes da publicação.']
      ],
      cta: { label: 'Conversar sobre meu site', href: contact('criacao-de-sites') }
    },
    faq: [
      ['Quantas páginas um site completo inclui?', 'A quantidade é definida depois da primeira conversa. A proposta apresenta as páginas necessárias, o que será entregue e o investimento correspondente.'],
      ['A landing page pode ter várias seções?', 'Sim. Ela é uma página única, mas pode reunir seções de apresentação, serviços, benefícios e contato, conforme o projeto.'],
      ['O Site + Blog já inclui artigos mensais?', 'A produção de artigos é definida na proposta. A construção do blog e a produção recorrente de conteúdo têm entregas e valores discriminados.'],
      ['Vocês definem os temas dos artigos?', 'Podemos planejar pautas e estruturar a linha editorial quando esse trabalho fizer parte da contratação. Quantidade e frequência são estabelecidas após o briefing.'],
      ['O site funciona em celular?', 'O desenvolvimento considera diferentes tamanhos de tela e inclui testes de responsividade dentro do escopo definido.'],
      ['O domínio e a hospedagem estão incluídos?', 'Essas despesas e responsabilidades são informadas na proposta. Quando necessárias, contratações de terceiros são identificadas separadamente.'],
      ['A Lorz garante o primeiro lugar no Google?', 'Não. Aplicamos boas práticas técnicas e de conteúdo, mas a posição nos resultados de busca depende de fatores externos e não pode ser garantida.'],
      ['Posso pedir alterações depois da entrega?', 'Sim. Correções dentro das condições acordadas e novas solicitações são tratadas conforme a garantia, a manutenção contratada ou um novo orçamento.']
    ],
    final: {
      h2: 'Seu próximo site começa com uma conversa.',
      text: 'Conte o que você precisa apresentar e quais problemas gostaria de resolver. A Lorz propõe a estrutura, as entregas e o investimento adequados ao projeto.',
      cta: { label: 'Solicitar proposta de site', href: contact('criacao-de-sites') }
    },
    cross: { text: 'Precisa também organizar contatos, agendamentos ou informações recebidas pelo site?', label: 'Conheça as ferramentas personalizadas', route: '/servicos/ferramentas-personalizadas' }
  },

  {
    slug: 'ferramentas-personalizadas',
    route: '/servicos/ferramentas-personalizadas',
    name: 'Ferramentas Personalizadas',
    accent: 'cream',
    verb: 'Organizar',
    oneLiner: 'Automações, sistemas internos e dashboards a partir de problemas reais.',
    pitch: 'Para quem perde tempo com planilhas espalhadas, tarefas repetidas e informações difíceis de encontrar.',
    variantsLabel: 'Vertentes',
    seo: {
      title: 'Ferramentas Personalizadas: automações, sistemas e dashboards | Lorz',
      description: 'Automações, sistemas sob medida e dashboards para simplificar processos, integrar informações e apoiar o trabalho da sua empresa. Conheça a Lorz.'
    },
    hero: {
      eyebrow: 'Ferramentas Personalizadas',
      h1: 'Ferramentas feitas para resolver problemas reais.',
      lead: 'Planilhas espalhadas, tarefas repetidas e processos manuais consomem um tempo que poderia ir para o negócio. A Lorz desenvolve soluções digitais a partir do jeito que a sua empresa funciona, e você não precisa chegar sabendo qual tecnologia usar.',
      primary: { label: 'Apresentar meu problema', href: contact('ferramentas-personalizadas') },
      secondary: { label: 'Explorar as possibilidades', href: '#vertentes' },
      micro: 'Você explica a necessidade, e a gente avalia o caminho técnico antes de apresentar uma proposta.'
    },
    value: {
      h2: 'Nem todo problema precisa de um sistema grande.',
      text: 'Às vezes, uma integração simples resolve uma tarefa que consome horas. Em outros casos, um painel ou uma ferramenta interna organiza toda uma rotina. O primeiro passo é identificar o gargalo e escolher a solução com a complexidade necessária, sem criar tecnologia só por criar.',
      points: [
        ['Menos retrabalho', 'Etapas repetitivas automatizadas, quando isso for viável.'],
        ['Mais organização', 'Processos e informações importantes centralizados.'],
        ['Decisões mais claras', 'Indicadores relevantes para a operação, fáceis de acompanhar.']
      ]
    },
    offers: {
      id: 'vertentes',
      h2: 'Três maneiras de simplificar a sua operação.',
      text: 'Os exemplos abaixo são possibilidades de aplicação, não produtos prontos. Cada solução é desenhada a partir de um diagnóstico.',
      items: [
        {
          id: 'automacoes', name: 'Automações e Integrações', tag: 'Conectar ferramentas, reduzir tarefas repetidas',
          summary: 'Suas plataformas e processos trabalhando melhor juntos.',
          description: 'Uma tarefa que passa por várias planilhas, mensagens e ferramentas pode ser automatizada em etapas. Avaliamos o processo atual e desenvolvemos fluxos para organizar dados, encaminhar informações e reduzir atividades manuais.',
          includesLabel: 'Exemplos de aplicação',
          includes: [
            'Captura e organização de contatos recebidos pelo site.',
            'Encaminhamento de solicitações para os responsáveis.',
            'Alertas e lembretes automáticos.',
            'Integração entre formulários, planilhas, CRMs e outros sistemas compatíveis.',
            'Acompanhamento de pedidos, etapas e notificações.',
            'Integrações com WhatsApp por meios autorizados e conforme as regras da plataforma.'
          ],
          cta: { label: 'Quero automatizar um processo', href: contact('ferramentas-personalizadas', 'automacoes') }
        },
        {
          id: 'sistemas', name: 'Sistemas Personalizados', tag: 'Ferramentas para a rotina do negócio',
          summary: 'Um sistema pensado para o processo que você precisa organizar.',
          description: 'Quando uma solução pronta não atende bem à rotina da empresa, pode fazer sentido criar uma ferramenta específica. Desenvolvemos interfaces e fluxos para organizar informações e acompanhar atividades, com funcionalidades definidas a partir de um diagnóstico.',
          includesLabel: 'Exemplos de aplicação',
          includes: [
            'CRM e acompanhamento de oportunidades comerciais.',
            'Sistemas de agendamento e reservas.',
            'Controle de pedidos, solicitações e etapas de execução.',
            'Painéis de trabalho para equipes e áreas internas.',
            'Catálogos e ferramentas de consulta de produtos ou serviços.',
            'Formulários e portais internos adaptados ao processo.'
          ],
          cta: { label: 'Quero avaliar um sistema sob medida', href: contact('ferramentas-personalizadas', 'sistemas') }
        },
        {
          id: 'dados', name: 'Dados e Inteligência', tag: 'Informação que vira visão de negócio',
          summary: 'Dados reunidos para acompanhar o que importa na operação.',
          description: 'Muitos negócios têm informação, mas não conseguem consultá-la com facilidade. Organizamos fontes, definimos indicadores e desenvolvemos painéis para acompanhar resultados e identificar pontos de atenção. Recursos de inteligência artificial entram quando há uma aplicação prática e viável.',
          includesLabel: 'Exemplos de aplicação',
          includes: [
            'Dashboards de vendas, marketing e operação.',
            'Relatórios e atualizações automatizadas.',
            'Integração e organização de dados de fontes compatíveis.',
            'Indicadores e visualizações sob medida.',
            'Classificação e organização assistida de informações.',
            'Assistentes de consulta a informações ou documentos, quando tecnicamente adequados.'
          ],
          cta: { label: 'Quero organizar meus dados', href: contact('ferramentas-personalizadas', 'dados') }
        }
      ]
    },
    examples: {
      h2: 'O que isso pode resolver no dia a dia?',
      head: ['Quando o problema é…', 'Uma solução possível é…'],
      rows: [
        ['Contatos comerciais se perdem entre canais', 'Organizar os leads em um CRM ou fluxo centralizado'],
        ['Agendamentos são controlados manualmente', 'Uma agenda com regras, disponibilidade e confirmações'],
        ['A equipe não sabe em que etapa está cada pedido', 'Um painel de solicitações e status'],
        ['Dados ficam em planilhas e sistemas separados', 'Integrar as fontes e montar um dashboard'],
        ['Uma tarefa é copiada de plataforma em plataforma', 'Automatizar o fluxo, se as integrações permitirem'],
        ['Informações precisam ser consultadas repetidamente', 'Uma base de consulta e, quando fizer sentido, um assistente com IA']
      ],
      micro: 'Os exemplos demonstram possibilidades. A viabilidade e os recursos de cada solução são avaliados antes da contratação.'
    },
    limits: {
      h2: 'Uma solução sob medida começa com um escopo claro.',
      text: 'Cada projeto pode exigir diferentes níveis de desenvolvimento, hospedagem, integrações e manutenção. Tudo isso é avaliado antes do orçamento, para que você entenda o que está sendo construído, o que depende de serviços externos e como a ferramenta será mantida.',
      points: [
        'Integrações dependem de APIs, permissões e termos de uso de cada plataforma.',
        'IA é usada só quando traz vantagem prática, com supervisão e limites definidos.',
        'Custos de implantação e recorrentes (infraestrutura, licenças, APIs) aparecem na proposta.',
        'Projetos maiores podem ser propostos em fases.'
      ]
    },
    process: {
      h2: 'A ferramenta só entra em pauta depois que o problema estiver bem entendido.',
      steps: [
        ['Conversa inicial', 'Você explica o processo atual, as dificuldades e o resultado que espera.'],
        ['Mapeamento', 'Identificamos dados, usuários, ferramentas existentes e limitações técnicas.'],
        ['Proposta', 'Apresentamos funcionalidades, integrações, fases, investimento e eventuais custos recorrentes.'],
        ['Desenvolvimento e validação', 'Construímos, testamos e ajustamos o que foi acordado.'],
        ['Entrega e continuidade', 'Orientamos o uso e definimos, quando necessário, suporte e evolução.']
      ],
      cta: { label: 'Conversar sobre uma ferramenta', href: contact('ferramentas-personalizadas') }
    },
    faq: [
      ['Preciso saber qual sistema quero contratar?', 'Não. Você pode descrever o processo que gostaria de melhorar. A Lorz avalia as opções e propõe uma solução adequada ao problema e ao investimento disponível.'],
      ['Vocês conseguem integrar ferramentas que já uso?', 'Podemos avaliar integrações, desde que as plataformas ofereçam meios técnicos e permissões compatíveis. A viabilidade é confirmada antes da proposta.'],
      ['Posso automatizar processos do WhatsApp?', 'Alguns processos podem ser automatizados por integrações autorizadas, respeitando as regras da plataforma. As possibilidades e os custos dependem do caso.'],
      ['A Lorz faz CRM e dashboards?', 'Sim, como possibilidades dentro de Sistemas Personalizados e Dados e Inteligência. A estrutura e as funcionalidades são definidas após o diagnóstico.'],
      ['Toda solução precisa de inteligência artificial?', 'Não. Usamos IA apenas quando ela traz uma vantagem prática e existe uma forma adequada de controlar seu uso.'],
      ['A manutenção está incluída?', 'O período de correção, as condições de suporte e a eventual manutenção recorrente são informados na proposta. Serviços contínuos não são presumidos como ilimitados.'],
      ['Como o valor é calculado?', 'O investimento depende de funcionalidades, integrações, complexidade, infraestrutura e suporte. Essas informações entram na proposta depois do levantamento inicial.']
    ],
    final: {
      h2: 'Qual parte do seu trabalho poderia ser mais simples?',
      text: 'Conte o que está tomando tempo, gerando retrabalho ou dificultando o acompanhamento da sua operação. Não precisa chegar com uma solução pronta.',
      cta: { label: 'Apresentar meu projeto', href: contact('ferramentas-personalizadas') }
    },
    cross: { text: 'Quer também melhorar o caminho de quem chega até a sua empresa?', label: 'Veja como criamos sites', route: '/servicos/criacao-de-sites' }
  }
];

export const serviceBySlug = Object.fromEntries(services.map(s => [s.slug, s]));
