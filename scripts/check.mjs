// Verificação estática de docs/: links internos, âncoras, recursos, H1 único, title/description únicos.
// Uso: node scripts/check.mjs  (rode depois do build)
import { readFile, readdir, access } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const files = (await readdir(root)).filter(f => f.endsWith('.html'));
const html = Object.fromEntries(await Promise.all(files.map(async f => [f, await readFile(new URL(f, root), 'utf8')])));
const ids = Object.fromEntries(files.map(f => [f, new Set([...html[f].matchAll(/\sid="([^"]+)"/g)].map(m => m[1]))]));
const exists = p => access(new URL(p, root)).then(() => true, () => false);

const errors = [], titles = new Map(), descs = new Map();
for (const f of files) {
  const doc = html[f];
  const h1 = (doc.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${f}: ${h1} elementos H1`);
  const title = doc.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = doc.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!title) errors.push(`${f}: sem <title>`); else if (f !== '404.html') titles.set(title, [...(titles.get(title) || []), f]);
  if (!desc) errors.push(`${f}: sem meta description`); else descs.set(desc, [...(descs.get(desc) || []), f]);
  if (/class="[^"]*eyebrow/.test(doc)) errors.push(`${f}: usa eyebrow`);
  if (/[–—]/.test(doc.replace(/<script[\s\S]*?<\/script>/g, ''))) errors.push(`${f}: contém travessão`);
  if (/pinterest/i.test(doc.replace(/<script[\s\S]*?<\/script>/g, ''))) errors.push(`${f}: menciona Pinterest`);

  for (const [, attr, raw] of doc.replace(/<script>[\s\S]*?<\/script>/g, '').matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(raw) || raw === '#') continue;
    const [pathPart, hash] = raw.split('#');
    const path = pathPart.split('?')[0];
    const target = path === '' ? f : path;
    if (path && !(await exists(target))) { errors.push(`${f}: ${attr} quebrado → ${raw}`); continue; }
    if (hash && target.endsWith('.html') && !ids[target]?.has(hash)) errors.push(`${f}: âncora inexistente → ${raw}`);
  }
}
for (const [t, fs] of titles) if (fs.length > 1) errors.push(`title duplicado "${t}": ${fs.join(', ')}`);
for (const [d, fs] of descs) if (fs.length > 1) errors.push(`description duplicada em: ${fs.join(', ')}`);

// URLs da versão anterior que devem continuar existindo
const required = ['planos.html', 'como-funciona.html'];
for (const r of required) if (!files.includes(r)) errors.push(`Página ausente: ${r}`);
const legacy = ['index.html', 'servicos.html', 'servicos-social-media.html', 'servicos-criacao-de-sites.html', 'servicos-ferramentas-personalizadas.html', 'blog.html', 'blog-pagina-2.html', 'blog-pagina-3.html', 'blog-pagina-4.html', 'sobre.html', 'contato.html', 'politica-de-privacidade.html', '404.html'];
for (const l of legacy) if (!files.includes(l)) errors.push(`URL anterior ausente: ${l}`);

if (errors.length) { console.error(errors.map(e => '✗ ' + e).join('\n')); console.error(`\n${errors.length} problema(s) em ${files.length} páginas.`); process.exit(1); }
console.log(`✓ ${files.length} páginas verificadas: links, âncoras, recursos, H1, títulos e descrições OK.`);
