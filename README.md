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
index.html            página pronta (gerada a partir de src/)
.nojekyll             faz o GitHub Pages servir os arquivos como estão
src/
  template.html       HTML, CSS e JS da página, com marcadores {{...}} para os assets
  build.py            embute fontes, SVGs e scripts no template e gera o index.html
  brand/              SVGs da Lorz (logo, ícone, retrato positivo e negativo)
  fonts/              Brandson, Alte Haas Grotesk e Advercase (woff2)
  hairline/           kernel Hairline (sem alteração) e as figuras montagem, bandeja e esteira
```

## Editar

Altere `src/template.html` ou uma figura em `src/hairline/` e gere a página de novo (Python 3, sem dependências):

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
