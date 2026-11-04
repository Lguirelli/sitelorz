# Lorz: site institucional e comercial (v2.0, estética SaaS)

Nova versão do site da Lorz, construída do zero. O ZIP `LORZ-v0.17-GitHub-Pages-Comercial.zip` foi usado apenas como fonte de **conteúdo** (textos comerciais, especificação dos serviços, 43 artigos do blog) e de **identidade** (paleta oficial, ícone L, wordmark). Layout, componentes, CSS, JavaScript, navegação e animações são novos.

## Como rodar

Requer **Node.js 20+**. O site não tem dependências de execução. Para a auditoria visual, rode `npm install` uma vez: ela instala só o `playwright-core`, que usa o Edge ou o Chrome já instalado (ou o executável indicado em `QA_BROWSER`). O relatório e as capturas ficam em `qa/`.

```bash
npm run dev     # gera docs/ e abre em http://127.0.0.1:4173
npm run build   # só gera docs/
npm test        # gera e verifica links, âncoras, recursos, H1, títulos, descrições, eyebrows e travessões
npm run deploy  # gera, verifica e publica docs/ na raiz da main do GitHub
npm run qa      # Playwright: 14 páginas × 7 larguras × temas claro e escuro (rolagem, contraste AA, alvos de toque)
```

## Publicar no GitHub Pages

O site está em **https://lguirelli.github.io/sitelorz/**, servido pela raiz da branch `main` do repositório [Lguirelli/sitelorz](https://github.com/Lguirelli/sitelorz).

- A `main` do GitHub guarda **só o site pronto**, com os HTML na raiz (Pages: *Deploy from a branch*, `main`, `/ (root)`).
- O código-fonte fica na branch local `codigo`.
- Para publicar uma alteração: `npm run deploy`. O comando gera `docs/`, roda as verificações e envia o conteúdo de `docs/` como um novo commit em cima da `main` remota, sem reescrever o histórico. Se nada mudou, ele avisa e não envia.
- Na primeira publicação, o Git pede o login do GitHub (Git Credential Manager ou `gh auth login`).

Todos os links são relativos, então o site funciona em `usuario.github.io/repositorio/` ou em domínio próprio.

## Decisão tecnológica

**Gerador estático próprio em Node, sem framework e sem dependências.** O site tem 64 páginas de conteúdo previsível (páginas institucionais, 3 serviços, 43 artigos, 8 temas, paginação). Um framework como Astro ou Next traria um `node_modules`, etapa de build no CI e atualizações de dependências sem benefício real para esse volume. Com templates em JavaScript puro (template strings), o build roda em menos de um segundo, o HTML publicado é semântico e legível, e qualquer pessoa com Node consegue manter o projeto. O JavaScript no navegador é um único arquivo de ~13 KB (sem minificação); tudo funciona sem JS, exceto busca do blog e montagem da mensagem do formulário.

## Estrutura

```text
build.mjs                  Orquestra o build → docs/
src/
  config.mjs               E-mail, WhatsApp, URL do site, fontes (preencher só com dados oficiais)
  data/services.mjs        Conteúdo comercial dos três pilares (planos, formatos, FAQ, processo)
  layout.mjs               <head>, cabeçalho, menu, rodapé
  components.mjs           Componentes: botões, FAQ, etapas, CTA, cards, ícones, wordmark
  blog.mjs                 Leitura do acervo, listagem, temas, artigos, schema e índice de busca
  pages/home.mjs           Página inicial
  pages/services.mjs       Hub de serviços + template das 3 páginas de serviço
  pages/institutional.mjs  Sobre, Contato, Privacidade, 404
  lib/html.mjs             Escape, rotas → arquivos, links relativos
  lib/markdown.mjs         Markdown do acervo (títulos, listas, tabelas, links)
content/blog/<tema>/*.md   43 artigos (front matter com SEO e rota original)
assets/css/lorz.css        Sistema visual completo (tokens, componentes, movimento)
assets/js/main.js          Menu, painel de serviços, revelação, comparador, sumário, busca, formulário
assets/brand/              Logo oficial (lorz-logo.svg), ícone (lorz-icone.svg) e paleta de referência
assets/fonts/              Brandson, Alte Haas Grotesk e Advercase em WOFF2
scripts/serve.mjs          Servidor local de pré-visualização
scripts/check.mjs          Verificação de integridade do site gerado
docs/                      Site gerado (publicado pelo GitHub Pages)
```

## Arquitetura de informação

| Página | Arquivo | Papel |
|---|---|---|
| Início | `index.html` | Proposta de valor, problemas, 3 pilares, conexão entre frentes, contratação, princípios, blog, FAQ, CTA |
| Serviços | `servicos.html` | Visão geral + **guia rápido "qual frente resolve meu problema?"** (situação → serviço/plano) |
| Social Media | `servicos-social-media.html` | Planos Direção, Gestão, Premium; comparação; aviso de não atendimento ao público |
| Criação de Sites | `servicos-criacao-de-sites.html` | Landing Page, Site Completo, Site + Blog; comparação; construção × produção editorial |
| Ferramentas Personalizadas | `servicos-ferramentas-personalizadas.html` | Automações, Sistemas, Dados; exemplos por problema; limites técnicos |
| Blog | `blog.html`, `blog-pagina-N.html`, `blog-<tema>.html`, artigos | Busca, temas, destaques, artigos com sumário e serviço relacionado |
| Sobre | `sobre.html` | Posicionamento, capacidades, princípios, processo |
| Planos | `planos.html` | Decisão: planos das três frentes em abas, comparação, o que vem na proposta |
| Como funciona | `como-funciona.html` | Decisão: etapas, processo por frente, quem faz o quê, perguntas sobre contratação |
| Contato | `contato.html` | Formulário com campos condicionais por serviço |

Melhoria em relação à estrutura sugerida: o **guia rápido** no hub de serviços e o **índice de planos no hero** de cada serviço levam o visitante direto à opção adequada; cada CTA de plano abre o contato já com serviço e plano selecionados (`contato.html?servico=…&plano=…`).

**Todas as 64 URLs da v0.17 foram mantidas** (mesmos nomes de arquivo), e os links internos dos artigos (`/blog/...`, `/servicos/...`) são convertidos automaticamente.

## Modo escuro

O site segue o tema do sistema (`prefers-color-scheme`), e o botão ao lado do menu alterna entre claro e escuro e grava a escolha no navegador. As cores são tokens no topo de `assets/css/lorz.css`, redefinidos para o tema escuro. O mascote é aplicado como máscara CSS sobre os SVGs oficiais, e a cor vem de `--mascot-color`.

## Funil

- **Atração:** blog, bloco "Onde o seu negócio trava hoje?" na home e páginas de serviço.
- **Consideração:** hub de serviços, páginas de serviço com cartões de plano e comparação, `planos.html`.
- **Decisão:** `como-funciona.html`, perguntas frequentes e pedido de proposta com serviço e plano pré-selecionados.
- O bloco "Em que momento você está?" aparece na home, no hub de serviços e no blog e leva cada visitante ao próximo passo da sua etapa.

## Direção visual (v2.0)

Interface clara no estilo SaaS: telas de produto ilustrativas (calendário editorial, site com formulário, painel de contatos), uma tela do funil na primeira dobra que destaca as etapas atrair, converter e organizar, cartões de plano com "Sob proposta" no lugar do preço e abas para comparar frentes. Logo oficial (`assets/brand/lorz-logo.svg`) no cabeçalho e no rodapé, ícone L no favicon e mascote (`retrato-vetorizado.svg` e a versão negativa) no fechamento das páginas, no Sobre, no contato e na 404. Sem eyebrows e sem travessões: `scripts/check.mjs` falha se algum aparecer.

## Direção visual anterior (v1.0)

- **Conceito "L":** o ícone oficial (um L) vira o gesto gráfico do site: a linha em L que cresce nos heros, o diagrama da home (redes → site → ferramentas ao longo de um L), o marcador dos eyebrows e o recorte de canto dos cards do blog.
- **Paleta oficial:** Firmament Blue `#0A0F23` como base escura (heros, cabeçalho, rodapé), fundo claro derivado do Autumn White, Demonic Red `#BB2234` para ação, Atomic Orange `#FB8603` como destaque pontual. Cada pilar tem um acento: Social Media = laranja, Sites = vermelho, Ferramentas = creme/azul.
- **Tipografia:** Brandson nos títulos principais, Alte Haas Grotesk em H2–H6 e interface, Advercase no corpo.
- **Movimento:** títulos do hero sobem por máscara, o L é desenhado e um sinal percorre o fluxo entre serviços, revelação progressiva ao rolar, transições entre páginas (View Transitions), FAQ com altura animada. Tudo desativado com `prefers-reduced-motion`, e o conteúdo é visível sem JavaScript.

## SEO e AEO

- Title e description únicos por página, um H1 por página, breadcrumbs, hierarquia H2/H3.
- Artigos abrem com a **resposta direta** destacada e têm FAQ em `<details>`.
- JSON-LD: `Organization`, `WebSite`, `Service` + `OfferCatalog` (sem preços), `BlogPosting`, `BreadcrumbList`, `FAQPage` com as perguntas reais.
- Enquanto `siteUrl` estiver vazio em `src/config.mjs`, o build publica com `noindex`, `robots.txt` bloqueando e **sem** canonical/JSON-LD/sitemap — igual à proteção da versão anterior. Ao informar a URL real, tudo isso é gerado automaticamente.

## Recursos temporários e pendências

| Item | Situação | O que fazer |
|---|---|---|
| E-mail e WhatsApp | Vazios em `src/config.mjs` (não havia dado oficial no ZIP) | Preencher e rodar `npm run build`: o formulário passa a oferecer "Enviar por e-mail/WhatsApp" e a página de contato mostra os canais |
| Formulário de contato | Monta a mensagem no navegador; o visitante copia ou baixa. Aviso "Canal em configuração" visível | Preencher os canais acima (ou integrar um serviço de formulário) e revisar a página de Privacidade |
| `siteUrl` / indexação | Desativada | Informar a URL pública e reconstruir |
| Logo oficial em SVG | Não estava no ZIP. Foi usado o arquivo original `lorz-retro-preto-branco.svg` (Downloads), limpo e recortado em `assets/brand/lorz-logo.svg`: cabeçalho só com as letras, rodapé com a assinatura MARKETING | Para trocar o logo, substitua o arquivo; o build lê os caminhos dele |
| Fontes | **Não estavam no ZIP.** Foram convertidas para WOFF2 a partir das fontes instaladas neste computador | Confirmar a licença de uso web de Brandson, Alte Haas Grotesk e Advercase |
| Vermelho | O brief indica `#BB2234`; a imagem da paleta escreve `BB2233` | Usado `#BB2234` (diferença imperceptível) |
| Autor e datas dos artigos | O acervo não tinha autor nem datas | Preencher `author`, `date_published` e `date_modified` no front matter |
| Instagram | Campo vazio em `src/config.mjs` | Preencher para exibir no rodapé |

Não há depoimentos, clientes, cases, números, preços, prazos ou volumes de entrega no site — por decisão, já que nenhum desses dados existe no material de referência.

## Como editar

- **Textos dos serviços:** `src/data/services.mjs`.
- **Novo artigo:** crie `content/blog/<tema>/<slug>.md` com o mesmo front matter dos existentes (`title`, `meta_description`, `slug`, `route`, `servico_relacionado`…). Seções "Perguntas frequentes", "Continue a leitura" e "Conheça a solução da Lorz" viram, respectivamente, FAQ, cards relacionados e o bloco de serviço.
- **Cores, tipografia, espaçamentos:** tokens no topo de `assets/css/lorz.css`.
