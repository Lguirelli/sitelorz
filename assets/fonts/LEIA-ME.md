# Fontes de marca

Arquivos WOFF2 convertidos a partir das fontes instaladas na máquina de desenvolvimento:

| Família | Arquivo | Uso |
|---|---|---|
| Brandson | `Brandson.woff2` | H1, hero, títulos de destaque, wordmark |
| Alte Haas Grotesk | `AlteHaasGrotesk-Regular.woff2`, `AlteHaasGrotesk-Bold.woff2` | H2–H6, navegação, botões, rótulos |
| Advercase | `Advercase-Regular.woff2` | Texto de corpo |

O build (`build.mjs`) só declara `@font-face` para os arquivos que existirem aqui
(lista em `src/config.mjs`). **Confirme que a licença de cada fonte permite uso como webfont
antes de publicar.** Se algum arquivo for removido, o site usa as fontes do sistema.
