// Markdown mínimo e previsível para o acervo do blog:
// ##/### títulos, parágrafos, listas, tabelas, **negrito**, `código` e [links](rota).
import { esc, href, plain, slugify } from './html.mjs';

export function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
      const decoded = url.replaceAll('&amp;', '&');
      if (/^https?:\/\//.test(decoded)) return `<a href="${decoded}" rel="noopener" target="_blank">${label}<span class="sr-only"> (abre em nova aba)</span></a>`;
      if (/^\/(?!\/)|^#/.test(decoded)) return `<a href="${href(decoded)}">${label}</a>`;
      return label;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** Divide o corpo em blocos por título H2: [{title, body}]. O texto antes do primeiro H2 fica com title=null. */
export function splitSections(source) {
  const parts = [];
  let current = { title: null, body: [] };
  for (const line of source.split('\n')) {
    const m = line.match(/^## (.+)$/);
    if (m) { parts.push(current); current = { title: m[1].trim(), body: [] }; }
    else current.body.push(line);
  }
  parts.push(current);
  return parts.map(p => ({ title: p.title, body: p.body.join('\n').trim() })).filter(p => p.title || p.body);
}

export function render(source, { idPrefix = '' } = {}) {
  const lines = source.trim().split('\n');
  const out = [], toc = [], used = new Set();
  let lastHeading = 'Tabela';
  const uid = t => { let id = idPrefix + slugify(t).slice(0, 60) || 'secao'; let n = 2; while (used.has(id)) id = id.replace(/-\d+$/, '') + '-' + n++; used.add(id); return id; };

  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    const h = line.match(/^(#{2,4}) (.+)$/);
    if (h) {
      const level = h[1].length, text = plain(h[2]), id = uid(text);
      lastHeading = text;
      if (level === 2) toc.push({ id, title: text });
      out.push(`<h${level} id="${id}">${inline(h[2])}</h${level}>`);
      i++; continue;
    }

    if (line.startsWith('|') && /^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) {
      const cells = t => t.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim());
      const head = cells(line); i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
      out.push(`<div class="table-scroll" role="region" aria-label="${esc(lastHeading)}" tabindex="0"><table><thead><tr>${head.map(c => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, j) => j === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    if (/^(?:- |\d+\. )/.test(line)) {
      const ordered = /^\d/.test(line), re = ordered ? /^\d+\. / : /^- /, items = [];
      while (i < lines.length && re.test(lines[i].trim())) items.push(lines[i++].trim().replace(re, ''));
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map(t => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    if (line.startsWith('> ')) {
      const q = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) q.push(lines[i++].trim().slice(2));
      out.push(`<blockquote><p>${inline(q.join(' '))}</p></blockquote>`);
      continue;
    }

    const p = [];
    while (i < lines.length && lines[i].trim() && !/^(?:#{2,4} |\|| ?- |\d+\. |> )/.test(lines[i].trim())) p.push(lines[i++].trim());
    if (!p.length) throw Error('Markdown não suportado: ' + lines[i]);
    out.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc };
}

/** Extrai pares pergunta/resposta de um bloco "### Pergunta\n\nResposta". */
export function parseFaq(body) {
  const items = [];
  for (const chunk of body.split(/^### /m).slice(1)) {
    const [q, ...rest] = chunk.split('\n');
    items.push({ q: q.trim(), a: rest.join('\n').trim() });
  }
  return items;
}

/** Extrai rotas internas de uma lista de links. */
export const parseLinks = body => [...body.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)].map(m => ({ label: m[1], route: m[2] }));
