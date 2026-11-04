// Gera o site estático em docs/ (pasta publicada pelo GitHub Pages).
// Uso: node build.mjs   — sem dependências externas.
import { mkdir, rm, writeFile, cp, readdir, access } from 'node:fs/promises';
import { config } from './src/config.mjs';
import { routeToFile } from './src/lib/html.mjs';
import { page, absolute } from './src/layout.mjs';
import { homePage } from './src/pages/home.mjs';
import { servicePages } from './src/pages/services.mjs';
import { institutionalPages } from './src/pages/institutional.mjs';
import { blogPages, searchIndex } from './src/blog.mjs';

const OUT = new URL('./docs/', import.meta.url);
const exists = p => access(p).then(() => true, () => false);

// Fontes de marca: só declara as que existem em assets/fonts/.
const fontFiles = [];
for (const f of config.fonts) if (await exists(new URL('./assets/fonts/' + f.file, import.meta.url))) fontFiles.push(f);
const fontFaces = fontFiles.map(f => `@font-face{font-family:"${f.family}";src:url("assets/fonts/${f.file}") format("woff2");font-weight:${f.weight};font-display:swap}`).join('');
const preload = fontFiles.filter(f => ['Brandson', 'Advercase'].includes(f.family)).map(f => f.file);

const pages = [homePage(), ...servicePages(), ...blogPages(), ...institutionalPages()];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const seen = new Set();
for (const p of pages) {
  const file = routeToFile(p.route);
  if (seen.has(file)) throw Error('Rota duplicada: ' + file);
  seen.add(file);
  let html = page({ ...p, fontFaces, preload });
  // A 404 pode ser servida em qualquer profundidade de URL: define a base para a raiz do site.
  if (file === '404.html') html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<script>(function(){var p=location.pathname.split('/');var b=location.hostname.endsWith('github.io')&&p.length>2?'/'+p[1]+'/':'/';document.write('<base href="'+b+'">')})()</script>`);
  await writeFile(new URL(file, OUT), html);
}

await cp(new URL('./assets/', import.meta.url), new URL('./assets/', OUT), {
  recursive: true,
  filter: src => !/LEIA-ME\.md$|paleta-oficial\.png$/.test(src)
});
await writeFile(new URL('blog-index.json', OUT), JSON.stringify(searchIndex()));
await writeFile(new URL('.nojekyll', OUT), '');

if (config.siteUrl) {
  const urls = [...seen].filter(f => f !== '404.html').map(f => `<url><loc>${absolute('/' + f.replace(/\.html$/, '').replace(/^index$/, ''))}</loc></url>`);
  await writeFile(new URL('sitemap.xml', OUT), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  await writeFile(new URL('robots.txt', OUT), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', config.siteUrl.replace(/\/+$/, '') + '/').href}\n`);
} else {
  await writeFile(new URL('robots.txt', OUT), 'User-agent: *\nDisallow: /\n# Configure siteUrl em src/config.mjs para liberar a indexação.\n');
}

console.log(`✓ ${seen.size} páginas geradas em docs/ · fontes de marca: ${fontFiles.length ? fontFiles.map(f => f.file).join(', ') : 'nenhuma (usando fallback)'} · indexação: ${config.siteUrl ? 'ativa' : 'desativada (siteUrl vazio)'}`);
