# Lorz: landing de sites e soluções personalizadas

Landing page da Lorz focada em criação de sites e soluções personalizadas. Usa as cores, as fontes e os SVGs da marca e tem três ilustrações isométricas interativas (Hairline).

## Publicar

É um site estático: basta enviar esta pasta para qualquer hospedagem de arquivos. No GitHub Pages:

1. Crie um repositório e envie o conteúdo desta pasta (o `index.html` precisa ficar na raiz).
2. Em **Settings → Pages**, escolha **Deploy from a branch**, a branch `main` e a pasta `/ (root)`.
3. Em um ou dois minutos o site fica disponível em `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.

O arquivo `.nojekyll` precisa ir junto: sem ele o GitHub Pages ignora a pasta `demos/flat/_next/` e o demo do Flat não abre.

Para ver no computador, sirva a pasta (as máscaras em SVG e as fontes não carregam abrindo o arquivo direto):

```bash
python -m http.server 5840
```

## Estrutura

```
index.html                    página principal
landing-page.html, site-completo.html, solucoes-personalizadas.html   subpáginas dos formatos
projeto-*.html                uma página por projeto (Flat Jardim Serrano, Brasa, Isadora Guirelli, Belisca!, Helios 44-2)
assets/
  index.css, index.js         estilo e script da página principal (gerados)
  sub.css                     estilo das subpáginas (gerado)
  fonts/                      Brandson, Alte Haas Grotesk e Advercase (woff2)
  brand/                      retrato (claro e escuro) e ícone da Lorz
  projetos/                   cartazes, fundos e capturas dos projetos (WebP)
demos/                        os cinco sites funcionando, abertos dentro das páginas de projeto (com "noindex")
.nojekyll                     faz o GitHub Pages servir os arquivos como estão
src/                          fontes do site (não precisam ser publicadas)
  build.py                    gera tudo o que está na raiz e em assets/ (menos fontes, imagens e brand/)
  layout.py                   <head>, cabeçalho, rodapé, ícones e a política de segurança (CSP) de todas as páginas
  index.html                  o corpo da página principal
  css/                        base.css (fontes e paleta), index.css e sub.css
  js/                         prelude, crew (equipe de cursores e abertura), page (interações), projetos (lista e
                              carrossel) e crew_scroll (construção das seções na rolagem)
  hairline/                   kernel Hairline (sem alteração) e as figuras montagem, bandeja e esteira
  sprite.svg                  os ícones; cada página leva só os que usa
  brand/lorz-logo.svg         o logo, embutido no CSS como máscara
  subpages.py                 conteúdo e layout das três subpáginas de formato
  projetos_pages.py           conteúdo e layout das páginas de projeto
  demo_flat.py                prepara a exportação do Flat (Next.js) para demos/flat/ (instruções no topo do arquivo)
```

## Editar

Altere os arquivos em `src/` e gere o site de novo (Python 3, sem dependências):

```bash
python src/build.py
```

Fontes, imagens e os SVGs em `assets/brand/` são editados direto em `assets/`. O CSS e o JS saem com a versão do
conteúdo no endereço (`?v=...`), então uma publicação nova nunca fica presa no cache do visitante.

## Segurança e privacidade

- Nenhuma página da Lorz carrega recursos de fora do próprio site, grava cookies ou envia dados. A única coisa
  guardada no navegador é a escolha da chave de animações.
- Cada página leva uma CSP que só libera os arquivos do próprio site e os scripts embutidos daquela página.
- O formulário de contato não envia nada (só prepara o texto para copiar), e a CSP bloqueia qualquer envio enquanto ele não for ligado a um serviço.
- Os demos são cópias dos sites dos clientes: mantêm os contatos públicos de cada negócio (WhatsApp e Instagram)
  e também não carregam nada de fora (as fontes dos demos da Isadora e do Helios ficam em `assets/fonts/` de cada um).

## O que a página faz

- Abertura em "modo editor": réguas, guias e caixas de seleção montam a hero; as outras seções são construídas conforme a rolagem.
- Uma equipe de cursores com nome e cor constrói a página: digita os textos, desenha caixas, copia cards, redimensiona figuras e move grupos até o lugar; depois sai da tela. No header, um botão reproduz a construção e uma chave liga e desliga as animações.
- O retrato da marca como máscara de cor, com uma mancha que segue o mouse.
- Seção "Sob medida": o visitante marca o que precisa, a prévia do projeto se monta e o botão leva a seleção para o formulário de contato.
- Ilustrações Hairline: **Montagem** (hero), **Bandeja** (Criação de sites) e **Esteira** (Soluções personalizadas).
- Formulário de contato que só prepara a mensagem para copiar. Nada é enviado: para ligá-lo a um serviço de formulários, libere o endereço do serviço em `form-action` (ou `connect-src`) na CSP, em `src/layout.py`.
- Tema claro e escuro, de acordo com o sistema. Com "reduzir movimento" ativado, a construção continua, só com esmaecimento.
- Sem JavaScript, a página aparece inteira como conteúdo estático, sem a abertura.
- Principais projetos: carrossel em arco. Os cartões giram como uma roda: o do centro fica de frente, nítido e em tamanho cheio; os vizinhos descem pela curva, inclinados, menores e levemente desfocados. O movimento é interpolado a cada quadro (sem saltos), com inércia ao soltar o arrasto e alinhamento ao cartão mais próximo. Setas, clique num cartão lateral, setas do teclado (com o carrossel em foco), arrasto com o mouse, swipe no celular e rolagem horizontal. A roda avança sozinha a cada 3,6 s e espera enquanto o ponteiro está sobre ela, enquanto tem foco do teclado ou está fora da tela; com "reduzir movimento" ou com a chave de animações desligada, não avança. Sobre o painel ficam o nome e o que o site resolve; abaixo do carrossel, uma explicação em linguagem de cliente e o que o site faz. O clique no painel central ou o botão "Ver e testar o projeto" abre a página do projeto, com o cabeçalho e o rodapé da Lorz, o site funcionando (em modo computador ou celular), para quem ele serve, o que ele faz e o que vem junto. Para trocar, edite `PROJECTS` em `src/js/projetos.js` e `PROJECTS` em `src/projetos_pages.py` (com `url`, aparece o link "Abrir o site").
- Cards que se adaptam ao próprio espaço (Container Queries): com três colunas, quando um card fica estreito demais, ele mostra só o essencial e um botão "Ver detalhes", que abre o resto num dropdown sob o card, sem mover os outros (um `<details>` nativo: mouse, teclado, toque e leitores de tela; fecha com Esc ou clique fora). Vale para os cards de formato e de solução da página principal e para os de escopo e de exemplos das subpáginas de formato; as páginas de projeto não. Antes de um card apertar em duas colunas, a grade passa para uma coluna (abaixo de 744 px).
- Os cards de Criação de sites abrem subpáginas com escopo, mapa de exemplo, exemplos de uso e perguntas de cada formato. As subpáginas não têm a construção animada; só mostram um skeleton enquanto as fontes carregam.
- Quem chega por um link de seção (por exemplo, ao voltar de uma subpágina) vê a página pronta, sem a abertura. O botão "Pedir proposta" das subpáginas já marca o formato no formulário.
