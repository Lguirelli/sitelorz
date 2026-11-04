// Dados institucionais. Preencher somente com informações oficiais — nada aqui é inventado.
// Enquanto `siteUrl` estiver vazio, o build publica com `noindex` e sem canonical/JSON-LD.
export const config = {
  name: 'Lorz',
  siteUrl: '',        // ex.: 'https://usuario.github.io/lorz-site' ou 'https://lorz.com.br'
  email: '',          // ex.: 'contato@dominio.com.br' — ativa o envio por e-mail no formulário
  whatsapp: '',       // apenas dígitos com DDI, ex.: '5511999999999' — ativa o envio por WhatsApp
  instagram: '',      // URL completa do perfil oficial, quando houver
  year: 2026,
  // Fontes de marca: coloque os arquivos em assets/fonts/ (ver assets/fonts/LEIA-ME.md).
  // O build só declara @font-face para os arquivos que existirem.
  fonts: [
    // Brandson e Advercase têm um único peso: o intervalo evita negrito sintético.
    { family: 'Brandson', file: 'Brandson.woff2', weight: '100 900' },
    { family: 'Alte Haas', file: 'AlteHaasGrotesk-Regular.woff2', weight: '100 500' },
    { family: 'Alte Haas', file: 'AlteHaasGrotesk-Bold.woff2', weight: '600 900' },
    { family: 'Advercase', file: 'Advercase-Regular.woff2', weight: '100 500' }
  ]
};
