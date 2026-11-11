# Lorz: landing de sites e soluções personalizadas

Landing page da Lorz focada em criação de sites e soluções personalizadas. Usa as cores, as fontes e os SVGs da marca e tem três ilustrações isométricas interativas (Hairline).

## Testar no GitHub Pages

1. Crie um repositório no GitHub e envie o conteúdo desta pasta (o `index.html` precisa ficar na raiz).
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, a branch `main` e a pasta `/ (root)`. Salve.
4. Em um ou dois minutos o site fica disponível em `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.

O `index.html` é autossuficiente: fontes, SVGs e scripts estão embutidos. Ele também abre direto no navegador, com dois cliques, sem servidor.

## Estrutura

```
index.html            página principal (gerada a partir de src/)
landing-page.html     subpágina do formato Landing Page
site-completo.html    subpágina do formato Site Completo
solucoes-personalizadas.html  subpágina de Soluções Personalizadas
assets/               CSS, fontes e logo das subpáginas
.nojekyll             faz o GitHub Pages servir os arquivos como estão
src/
  template.html       HTML, CSS e interações da página, com marcadores {{...}} para os assets e scripts
  crew.js             a equipe de cursores e a abertura (motor da construção)
  crew_scroll.js      a construção das seções conforme a rolagem
  projetos.js         lista dos Principais projetos (nome, categoria, imagem, descrição, status, link) e o carrossel
  projetos/           cartazes (680×1100) e fundos dos projetos; o build copia para assets/projetos/
  build.py            embute fontes, SVGs e scripts no template, gera o index.html e chama o subpages.py
  subpages.py         conteúdo e layout das três subpáginas
  brand/              SVGs da Lorz (logo, ícone, retrato positivo e negativo)
  fonts/              Brandson, Alte Haas Grotesk e Advercase (woff2)
  hairline/           kernel Hairline (sem alteração) e as figuras montagem, bandeja e esteira
```

## Editar

Altere `src/template.html`, `src/crew.js`, `src/crew_scroll.js`, `src/subpages.py` ou uma figura em `src/hairline/` e gere a página de novo (Python 3, sem dependências):

```bash
python3 src/build.py
```

## O que a página faz

- Abertura em "modo editor": réguas, guias e caixas de seleção montam a hero; as outras seções são construídas conforme a rolagem.
- Uma equipe de cursores com nome e cor constrói a página: digita os textos, desenha caixas, copia cards, redimensiona figuras e move grupos até o lugar; depois sai da tela. No header, um botão reproduz a construção e uma chave liga e desliga as animações.
- O retrato da marca como máscara de cor, com uma mancha que segue o mouse.
- Seção "Sob medida": o visitante marca o que precisa, a prévia do projeto se monta e o botão leva a seleção para o formulário de contato.
- Ilustrações Hairline: **Montagem** (hero), **Bandeja** (Criação de sites) e **Esteira** (Soluções personalizadas).
- Formulário de contato que só prepara a mensagem para copiar. Nada é enviado: ligue-o a um serviço de formulários ou ao fluxo do site antes de publicar de verdade.
- Tema claro e escuro, de acordo com o sistema. Com "reduzir movimento" ativado, a construção continua, só com esmaecimento.
- Sem JavaScript, a página aparece inteira como conteúdo estático, sem a abertura.
- Principais projetos: carrossel em perspectiva com o projeto ativo no centro, vizinhos girados e o fundo desfocado da imagem ativa. Setas, clique num painel lateral, setas do teclado (com o carrossel em foco) e arrasto no celular. Os projetos são Flat Jardim Serrano, Brasa (marcado como conceitual) e Isadora Guirelli; o nome fica sobre o painel e, abaixo do carrossel, uma frase de contexto e o que cada funcionalidade faz. Para trocar, edite a lista `PROJECTS` em `src/projetos.js` (com `url`, aparece o botão "Abrir projeto").
- Os cards de Criação de sites abrem subpáginas com escopo, mapa de exemplo, exemplos de uso e perguntas de cada formato. As subpáginas não têm a construção animada; só mostram um skeleton enquanto as fontes carregam.
- Quem chega por um link de seção (por exemplo, ao voltar de uma subpágina) vê a página pronta, sem a abertura. O botão "Pedir proposta" das subpáginas já marca o formato no formulário.
