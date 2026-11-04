// Utilitários de HTML e rotas.
// Todas as páginas são arquivos planos na raiz publicada (ex.: /blog/social-media/x/ → blog-social-media-x.html),
// o que mantém os endereços da versão anterior e funciona em subpastas do GitHub Pages.

export const esc = (s = '') => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** Converte uma rota lógica ("/servicos/social-media") no arquivo publicado ("servicos-social-media.html"). */
export function routeToFile(route) {
  const [path, hash = ''] = route.split('#');
  const clean = path.replace(/^\/+|\/+$/g, '');
  const file = clean === '' ? 'index.html' : clean.replaceAll('/', '-') + '.html';
  return file + (hash ? '#' + hash : '');
}

/** Link interno relativo. Aceita rota lógica, arquivo .html, âncora ou URL externa. */
export function href(target) {
  if (!target) return '#';
  if (/^(https?:|mailto:|tel:|#)/.test(target)) return target;
  if (target.endsWith('.html') || target.includes('.html#') || target.includes('.html?')) return target;
  if (target.startsWith('/')) {
    const [path, query] = target.split('?');
    return routeToFile(path) + (query ? '?' + query : '');
  }
  return target;
}

export const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const plain = s => String(s).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`#|]/g, '');

export const attrs = obj => Object.entries(obj)
  .filter(([, v]) => v !== undefined && v !== null && v !== false)
  .map(([k, v]) => v === true ? k : `${k}="${esc(v)}"`).join(' ');
