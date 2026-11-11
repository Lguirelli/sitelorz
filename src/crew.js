/* ========== 1) the crew: cursors that build the page ========== */
// Like a shared design file: several cursors, each with a colour and a name, work in parallel.
// Each one takes the nearest waiting part, flies to it and builds it the way that part is made:
// a crosshair drags a box (a grey placeholder, then the real thing), a text cursor types the
// words in, an arrow places a group. When the whole page is built, the crew leaves the screen.
const crewEl = $('#crew');
// the animations switch in the header; the choice is remembered in this browser
const ANIM = { on: (() => { try { return localStorage.getItem('lorz-anim') !== 'off'; } catch { return true; } })(), force: false };
const crewOn = () => ANIM.on || ANIM.force;
const pace = reduce ? 0.7 : 1;
const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2);
const CUR = {
  arrow: '<svg viewBox="0 0 22 22"><path d="M3 2 L3 17.5 L7.4 13.4 L10.4 20 L13 18.9 L10 12.4 L16 12.4 Z" fill="var(--wc)" stroke="var(--navy-950)" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 22 22"><path d="M11 2v18M2 11h18" stroke="var(--navy-950)" stroke-width="4.4" stroke-linecap="round"/><path d="M11 2v18M2 11h18" stroke="var(--wc)" stroke-width="2" stroke-linecap="round"/></svg>',
  text: '<svg viewBox="0 0 22 22"><path d="M8 3h6M8 19h6M11 3v16" stroke="var(--navy-950)" stroke-width="4.2" stroke-linecap="round"/><path d="M8 3h6M8 19h6M11 3v16" stroke="var(--wc)" stroke-width="2" stroke-linecap="round"/></svg>',
};
CUR.move = '<svg viewBox="0 0 22 22"><path d="M11 2v18M2 11h18M11 2l-3 3M11 2l3 3M11 20l-3-3M11 20l3-3M2 11l3-3M2 11l3 3M20 11l-3-3M20 11l-3 3" stroke="var(--navy-950)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 2v18M2 11h18M11 2l-3 3M11 2l3 3M11 20l-3-3M11 20l3-3M2 11l3-3M2 11l3 3M20 11l-3-3M20 11l-3 3" stroke="var(--wc)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
CUR.copy = CUR.arrow.replace('</svg>', '<circle cx="16.5" cy="17" r="5" fill="var(--wc)" stroke="var(--navy-950)" stroke-width="1.4"/><path d="M16.5 14.5v5M14 17h5" stroke="var(--wi)" stroke-width="1.6" stroke-linecap="round"/></svg>');
CUR.resize = '<svg viewBox="0 0 22 22"><path d="M4 4l14 14M4 4v6M4 4h6M18 18v-6M18 18h-6" stroke="var(--navy-950)" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4l14 14M4 4v6M4 4h6M18 18v-6M18 18h-6" stroke="var(--wc)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HOT = { arrow: [3, 2], cross: [11, 11], text: [11, 11], move: [11, 11], copy: [3, 2], resize: [11, 11] };
const VERB = { move: 'Mover', resize: 'Redimensionar' };
const TEAM = [['Design','--orange-500','--navy-950','draw'],['Front','--red-400','--navy-950','resize'],['Dev','--cream-200','--navy-950','move'],['UX','--orange-700','--cream-50','copy'],['Conteúdo','--red-600','--cream-50','type'],['Redação','--orange-300','--navy-950','type']];
// how each part gets built: typed, drawn as a box, copied from the one before it, resized from small, or moved into place
const sameKind = (a, b) => a && b && a.classList.contains('build') && a.tagName === b.tagName && a.classList[0] === b.classList[0];
const kindOf = (el) => {
  if (el.matches('h1,h2,p,.lede,.compare-wrap > div:first-child')) return 'text';
  if (el.matches('.format,.sol,.pillars > div,.step,.qa,.needs') && sameKind(el.previousElementSibling, el)) return 'copy';
  if (el.matches('.fig,.retrato,.compare,.scope-preview,.pj-stage,form')) return 'resize';
  if (el.matches('.format,.sol,.pillars > div,.step')) return 'cross';
  return 'move';
};
const nameOf = (el) => el.dataset.label || (el._label ? el._label(el) : 'Camada');

// the text blocks inside a part, typed one after another once its space exists
const TEXTS = 'h3,h4,p,li > span:last-child,footer > span,.num,legend,.needs label > span,.label,.pv-sum strong';
const SKIP = 'svg,script,style,textarea,select,option,.hl-read,.ans,.compare,.pj-stage';
// running text is typed as a whole and never split into boxes: a box could send a lone full stop to the next line
const WHOLE = 'h1,h2,h3,h4,p';
function textsIn(el){
  const ok = (t) => !t.closest(SKIP) && (t.textContent || '').trim();
  let blocks = [...el.querySelectorAll(TEXTS)].filter(t => t.offsetWidth && t.getClientRects().length && ok(t));
  blocks = blocks.filter(t => !blocks.some(u => u !== t && u.contains(t)));
  if (!el._wrapped){
    // loose text (a button's label, a link, a tag) gets its own span so it can be typed without hiding its box
    el._wrapped = true;
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walk.nextNode()){ const n = walk.currentNode, p = n.parentElement; if (n.nodeValue.trim() && !p.closest(SKIP) && !p.closest(WHOLE) && !blocks.some(b => b.contains(p)) && !p.classList.contains('tw')) nodes.push(n); }
    nodes.forEach(n => {
      const m = n.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/), span = document.createElement('span');
      span.className = 'tw'; span.textContent = m[2];
      const frag = document.createDocumentFragment();
      if (m[1]) frag.append(m[1]); frag.append(span); if (m[3]) frag.append(m[3]);
      n.replaceWith(frag);
    });
  }
  // only text that is actually on screen in this layout (a hidden menu item has no place to be typed in)
  const loose = [...el.querySelectorAll('.tw')].filter(t => t.offsetWidth && t.getClientRects().length && ok(t) && !blocks.some(b => b.contains(t)));
  return [...blocks, ...loose].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
const hideText = (t) => { t.style.clipPath = 'inset(-6px 100% -6px -6px)'; };
const groupOf = (el) => el.closest('main > section') || 'top';
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

const workers = TEAM.map(([name, c, i, role]) => {
  const root = document.createElement('div'); root.className = 'wk off'; root.style.cssText = `--wc:var(${c});--wi:var(${i})`;
  root.innerHTML = `<span class="wk-cur"></span><span class="wk-tag">${name}</span>`;
  const sel = document.createElement('div'); sel.className = 'wk-sel'; sel.style.cssText = root.style.cssText;
  sel.innerHTML = '<i></i><i></i><i></i><i></i><span></span><b></b>';
  const car = document.createElement('i'); car.className = 'wk-caret'; car.style.cssText = root.style.cssText;
  crewEl.append(sel, car, root);
  return { name, role, root, sel, car, cur: $('.wk-cur', root), tag: $('span', sel), dim: $('b', sel), kind: '', fix: false, x: 0, y: 0, born: false, state: 'rest', task: null, pi: 0, t0: 0, dur: 0, from: [0, 0], hop: 0 };
});
function setKind(w, k){ if (w.kind !== k){ w.kind = k; w.cur.innerHTML = CUR[k]; w.root.style.setProperty('--hx', HOT[k][0]); w.root.style.setProperty('--hy', HOT[k][1]); } }
function click(w){ w.root.classList.remove('click'); void w.root.offsetWidth; w.root.classList.add('click'); }
// everything the crew draws lives in page coordinates, so it scrolls with the content (no frame of lag)
const pg = (x, y) => `translate(${x + scrollX}px,${y + scrollY}px)`;
// parts in the sticky header stay put on screen: while a cursor works there, its marks live in a fixed layer
const crewFix = document.createElement('div'); crewFix.id = 'crewFix'; crewFix.setAttribute('aria-hidden', 'true'); crewEl.after(crewFix);
const hdrEl = $('#hdr');
// the crew's layer is as tall as the content (the body), so it never stretches the page itself
new ResizeObserver(() => { crewEl.style.height = document.body.offsetHeight + 'px'; }).observe(document.body);
const stuck = (el) => !!el.closest('header');
const pw = (w, x, y) => w.fix ? `translate(${x}px,${y}px)` : pg(x, y);
function layer(w, fix){ if (w.fix === fix) return; w.fix = fix; (fix ? crewFix : crewEl).append(w.sel, w.car, w.root); }
function caret(w, x, y, h, on){ if (on){ w.car.style.transform = pw(w, x, y); w.car.style.height = h + 'px'; } w.car.classList.toggle('on', on); }
const offscreen = (x, y) => { const cx = innerWidth/2, cy = innerHeight/2, a = Math.atan2(y - cy, x - cx) || Math.random()*6.28, R = Math.hypot(cx, cy) + 80; return [cx + Math.cos(a)*R, cy + Math.sin(a)*R]; };
const at = (r, fx, fy) => [r.left + r.width*fx, r.top + r.height*fy];
function home(el){ const r = el.getBoundingClientRect(), o = el._op || { dx: 0, dy: 0, s: 1 }; return { left: r.left - o.dx, top: r.top - o.dy, width: r.width / o.s, height: r.height / o.s }; }
function pose(el, dx, dy, s){ el._op = { dx, dy, s }; el.style.translate = `${dx}px ${dy}px`; el.style.scale = String(s); }
function unpose(el){ el._op = null; el.style.translate = ''; el.style.scale = ''; el.style.transformOrigin = ''; }
function drawSel(w, r, fx = 1, fy = 1){
  // the name tag never hides: under the sticky header it moves inside the box, just below the header; at the top edge it goes under the box
  const hb = w.fix ? 0 : hdrEl.getBoundingClientRect().bottom, inside = !w.fix && r.top - 26 < hb, under = w.fix && r.top < 26;
  w.sel.classList.toggle('in', inside); w.sel.classList.toggle('under', under);
  w.tag.style.top = inside ? Math.max(4, hb - r.top + 18) + 'px' : '';
  Object.assign(w.sel.style, { transform: pw(w, r.left - 4, r.top - 4), width: r.width*fx + 8 + 'px', height: r.height*fy + 8 + 'px' });
  const size = Math.round(r.width*fx) + ' × ' + Math.round(r.height*fy);
  if (w.size !== size) w.dim.textContent = w.size = size;
}
// a part the crew builds appears at once (its fade is only for parts finished off screen)
function show(el){ el.classList.add('now', 'built'); }
function label(w, verb, el){ w.tag.textContent = verb + ' · ' + nameOf(el); }
// a cursor with nothing to do: out of sight, marks off
function rest(w){ w.task = null; w.state = 'rest'; w.root.classList.add('off'); w.sel.classList.remove('on', 'ph'); w.car.classList.remove('on'); }

/* The steps that build one part. Each step says where the cursor starts (aim), how long it takes,
   and what one frame of it looks like; steps run one after another, never two at once. */
// the lines a block of text sits on, relative to the block (one box per line)
function lineBoxes(block){
  const rg = document.createRange(); rg.selectNodeContents(block);
  const b = block.getBoundingClientRect(), lines = [];
  for (const r of rg.getClientRects()){
    if (r.width < 1) continue;
    const L = lines.find(l => Math.abs(l.top - r.top) < 4);
    if (L){ L.left = Math.min(L.left, r.left); L.right = Math.max(L.right, r.right); L.bottom = Math.max(L.bottom, r.bottom); }
    else lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
  }
  lines.sort((a, c) => a.top - c.top);
  return lines.length ? lines.map(l => ({ top: l.top - b.top, bottom: l.bottom - b.top, left: l.left - b.left, right: l.right - b.left })) : [{ top: 0, bottom: b.height, left: 0, right: b.width }];
}
// reveal f of the text in reading order: the full lines above, part of the current one; returns where the caret is
function typeClip(block, lines, f){
  const W = block.getBoundingClientRect().width, total = lines.reduce((n, l) => n + l.right - l.left, 0);
  let d = f * total, i = 0;
  while (i < lines.length - 1 && d > lines[i].right - lines[i].left){ d -= lines[i].right - lines[i].left; i++; }
  const l = lines[i], x = l.left + Math.min(d, l.right - l.left), nx = lines[i + 1], bot = nx ? Math.min(l.bottom, nx.top) : l.bottom;
  block.style.clipPath = f >= 1 ? '' : `polygon(-6px -6px, ${W + 6}px -6px, ${W + 6}px ${l.top}px, ${x}px ${l.top}px, ${x}px ${bot}px, -6px ${bot}px)`;
  return { x, top: l.top, h: l.bottom - l.top };
}
function typeStep(w, el, block, wholeSel, first = true){
  const chars = (block.textContent || '').trim().length, beat = first ? 140 : 50, typing = clampN(chars * 4.6, 110, 560);
  let lines = null;
  const start = () => { const r = block.getBoundingClientRect(), L = (lines || lineBoxes(block))[0]; return [r.left + L.left - 3, r.top + (L.top + L.bottom) / 2]; };
  return { cur: 'text', dur: (beat + typing) * pace,
    aim: start,
    begin: () => { label(w, 'Digitar', el); lines = lineBoxes(block); },
    step: (e, p) => {
      // a short beat for the click, then the letters come at an even pace
      if (!lines) lines = lineBoxes(block);
      const ms = p * (beat + typing), f = clampN((ms - beat) / typing, 0, 1), c = typeClip(block, lines, f), r = block.getBoundingClientRect();
      caret(w, r.left + c.x, r.top + c.top, c.h, ms > beat * .7);
      drawSel(w, wholeSel ? el.getBoundingClientRect() : r);
      return start();
    },
    end: () => { block.style.clipPath = ''; caret(w, 0, 0, 0, false); } };
}
// edit a text in place: click where the change starts, select the old words, type the new ones over them
const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
// the shared start and end of two texts, cut at word boundaries
function sameEnds(a, b){
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  while (i > 0 && !/\s/.test(a[i - 1])) i--;
  let j = 0; while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
  while (j > 0 && !/\s/.test(a[a.length - j] || ' ')) j--;
  return [i, j];
}
function caretAt(block, offset){
  const n = block.firstChild, rg = document.createRange();
  if (n && n.nodeType === 3){ rg.setStart(n, Math.min(offset, n.length)); rg.collapse(true); const r = rg.getClientRects()[0] || rg.getBoundingClientRect(); if (r && (r.height || r.left)) return r; }
  const b = block.getBoundingClientRect(); return { left: b.left, top: b.top, height: b.height };
}
// the held height is let go smoothly, once the new words are in
function release(b){
  if (!b.style.minHeight) return;
  const h = b.getBoundingClientRect().height; b.style.minHeight = '';
  const n = b.getBoundingClientRect().height; if (Math.abs(n - h) < 1) return;
  b.style.minHeight = h + 'px'; b.style.transition = 'min-height .3s cubic-bezier(.2,.7,.2,1)'; void b.offsetWidth; b.style.minHeight = n + 'px';
  setTimeout(() => { b.style.minHeight = ''; b.style.transition = ''; }, 320);
}
function editStep(w, el, block, first){
  const neu = block._new, old = block.textContent, [pi, si] = sameEnds(old, neu);
  const pre = old.slice(0, pi), suf = old.slice(old.length - si), oldMid = old.slice(pi, old.length - si), newMid = neu.slice(pi, neu.length - si);
  const beat = first ? 140 : 50, select = 170, typing = clampN(newMid.length * 4.6, 110, 560);
  // the cursor clicks where the change starts
  const start = () => { const c = caretAt(block, pi); return [c.left - 2, c.top + c.height / 2]; };
  let marked = false;
  return { cur: 'text', dur: (beat + select + typing) * pace,
    aim: start,
    begin: () => label(w, 'Corrigir', el),
    step: (e, p) => {
      const ms = p * (beat + select + typing);
      if (ms < beat){ /* the click */ }
      else if (ms < beat + select){
        if (!marked){ marked = true; block.innerHTML = esc(pre) + '<span class="wk-mark">' + esc(oldMid) + '</span>' + esc(suf); }
        caret(w, 0, 0, 0, false);
      } else {
        const n = Math.round(newMid.length * clampN((ms - beat - select) / typing, 0, 1));
        block.textContent = pre + newMid.slice(0, n) + suf || '\u200b';
        const c = caretAt(block, pi + n); caret(w, c.left, c.top, c.height, true);
      }
      drawSel(w, el.getBoundingClientRect());
      return start();
    },
    end: () => { block.textContent = neu; block._new = null; block._edit = false; caret(w, 0, 0, 0, false); release(block); } };
}
// a viewport point, turned into the copy's own position inside the section that holds it
function placeGhost(g, x, y, s){
  const op = g.offsetParent || document.body, o = op.getBoundingClientRect();
  g.style.transform = `translate(${x - o.left - op.clientLeft}px,${y - o.top - op.clientTop}px) scale(${s})`;
}
function later(task){ textsIn(task.el).forEach(hideText); task.next = { el: task.el, kind: 'inside', done: task.done }; }
function plan(w, task){
  const el = task.el, kind = task.kind, steps = task.steps = [];
  if (kind === 'inside'){
    // a copied part has its words edited (select the old, type the new); a drawn one has them typed in
    textsIn(el).filter(b => !b._edit || b._new !== b.textContent || (b.textContent = b._new, b._edit = false))
      .forEach((b, i) => steps.push(b._edit ? editStep(w, el, b, i === 0) : typeStep(w, el, b, true, i === 0)));
  } else if (kind === 'text'){
    steps.push(Object.assign(typeStep(w, el, el, false), { begin: () => { label(w, 'Digitar', el); hideText(el); show(el); } }));
  } else if (kind === 'cross'){
    const r0 = home(el);
    steps.push({ cur: 'cross', dur: clampN((r0.width + r0.height) * .5, 320, 620) * pace,
      aim: () => at(home(el), 0, 0),
      begin: () => { label(w, 'Desenhar', el); w.sel.classList.add('ph'); },
      step: (e) => { const r = el.getBoundingClientRect(); drawSel(w, r, Math.max(e, .02), Math.max(e, .02)); return at(r, e, e); },
      end: () => { w.sel.classList.remove('ph'); textsIn(el).forEach(hideText); show(el); later(task); } });
  } else if (kind === 'copy'){
    const src = el.previousElementSibling;
    let ghost = null;
    steps.push({ cur: 'copy', dur: 520 * pace,
      aim: () => { const r = src.getBoundingClientRect(); return at(r, .5, .5); },
      begin: () => {
        label(w, 'Copiar', src);
        const r = src.getBoundingClientRect();
        ghost = task.ghost = src.cloneNode(true);
        ghost.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); ghost.removeAttribute('id');
        ghost.setAttribute('aria-hidden', 'true'); ghost.classList.add('now', 'built');
        ghost.querySelectorAll('a,button,input,select,textarea').forEach(n => { n.tabIndex = -1; });
        const shut = ghost.hasAttribute('data-open'); if (shut) ghost.removeAttribute('data-open');
        Object.assign(ghost.style, { position: 'absolute', left: '0', top: '0', visibility: 'hidden', margin: '0', width: r.width + 'px', height: r.height + 'px', translate: 'none', transition: 'none', zIndex: '55', pointerEvents: 'none', clipPath: '' });
        ghost.classList.add('wk-lift');
        // placed on top of the original before it is shown, so it never appears anywhere else
        src.parentNode.appendChild(ghost);
        if (shut) ghost.style.height = '';
        placeGhost(ghost, r.left, r.top, 1);
        ghost.style.visibility = '';
        task.slot = document.createElement('div'); task.slot.className = 'wk-slot'; task.slot.style.cssText = w.root.style.cssText;
        { const H = home(el); Object.assign(task.slot.style, { transform: pg(H.left, H.top), width: H.width + 'px', height: H.height + 'px' }); }
        crewEl.prepend(task.slot);
      },
      step: (e) => {
        const a = src.getBoundingClientRect(), b = home(el), x = a.left + (b.left - a.left) * e, y = a.top + (b.top - a.top) * e - Math.sin(Math.PI * e) * 18;
        placeGhost(ghost, x, y, 1 + Math.sin(Math.PI * Math.min(1, e * 1.4)) * .02);
        Object.assign(task.slot.style, { transform: pg(b.left, b.top), width: b.width + 'px', height: b.height + 'px' });
        const r = { left: x, top: y, width: a.width, height: ghost.offsetHeight }; drawSel(w, r); return at(r, .5, .5);
      } });
    // dropped: the duplicate becomes the new part, still carrying the original's words
    const drop = steps[steps.length - 1];
    drop.end = () => {
      const old = textsIn(src), mine = textsIn(el);
      // every block is measured with its new words and with the old ones, all at once, and keeps the taller
      const ed = mine.filter((b, i) => !b.children.length && old[i]);
      const hNew = ed.map(b => b.getBoundingClientRect().height);
      const ps = [...new Set([el, ...ed.map(b => b.parentElement)])], pNew = ps.map(q => q.getBoundingClientRect().height);
      ed.forEach(b => { b._new = b.textContent; b.textContent = old[mine.indexOf(b)].textContent; b._edit = true; });
      ed.forEach((b, i) => { b.style.minHeight = Math.max(hNew[i], b.getBoundingClientRect().height) + 'px'; });
      // the part itself and every row that wraps (a footer with two labels, a group of chips) are held too, so a longer label cannot reflow them mid-edit
      ps.forEach((q, i) => { q._hold = true; q.style.minHeight = Math.max(pNew[i], q.getBoundingClientRect().height) + 'px'; });
      mine.forEach(b => { if (!ed.includes(b)) hideText(b); });
      if (task.slot){ task.slot.remove(); task.slot = null; }
      el.classList.add('no-ph'); show(el); ghost.remove(); task.ghost = null;
      task.next = { el, kind: 'inside', done: task.done };
    };
  } else {
    // move or resize: the part is posed away (or small) and brought to its place
    const o = task.o;
    steps.push({ cur: kind, dur: (kind === 'resize' ? 460 : 380) * pace,
      aim: () => { const H = home(el); return kind === 'resize' ? [H.left + H.width * o.s, H.top + H.height * o.s] : [H.left + o.dx + H.width / 2, H.top + o.dy + H.height / 2]; },
      begin: () => { label(w, VERB[kind], el); textsIn(el).forEach(hideText); el.style.transformOrigin = '0 0'; pose(el, o.dx, o.dy, o.s); show(el); },
      step: (e) => { const k = 1 - e; pose(el, o.dx * k, o.dy * k, o.s + (1 - o.s) * e); const r = el.getBoundingClientRect(); drawSel(w, r); return kind === 'resize' ? [r.right, r.bottom] : at(r, .5, .5); },
      end: () => { unpose(el); later(task); } });
  }
}

const queue = [];
let isComplete = () => false, raf = 0;
function finish(task){
  const el = task.el;
  if (task.ghost){ task.ghost.remove(); task.ghost = null; }
  if (task.slot){ task.slot.remove(); task.slot = null; }
  if (el._op) unpose(el);
  el.classList.add('built'); el.style.clipPath = '';
  // its text comes later, from the content cursor: keep it hidden until then
  if (task.next){ const n = task.next; task.next = null; queue.push(n); return; }
  el.querySelectorAll('[style*="clip-path"]').forEach(n => { n.style.clipPath = ''; });
  textsIn(el).forEach(b => { if (b._edit){ b.textContent = b._new; b._new = null; b._edit = false; } release(b); });
  [el, ...el.querySelectorAll('*')].forEach(q => { if (q._hold){ q._hold = false; release(q); } });
  el._q = false; el._done = true; task.done && task.done(el);
}
// a task dropped half way: no copy, slot or pose left behind, and copied words go back to the part's own
function abort(t){
  if (t.ghost){ t.ghost.remove(); t.ghost = null; }
  if (t.slot){ t.slot.remove(); t.slot = null; }
  if (t.el._op) unpose(t.el);
  [t.el, ...t.el.querySelectorAll('*')].forEach(n => {
    if (n._edit){ n.textContent = n._new; n._new = null; n._edit = false; n.style.minHeight = ''; }
    if (n._hold){ n._hold = false; n.style.minHeight = ''; }
  });
  t.el._q = false;
}
function enqueue(el, done, defer){
  if (el._q || el.classList.contains('built')) return;
  el._q = true; queue.push({ el, done }); if (!defer) assign();
}
// A small team, one job each, every cursor doing one thing at a time. The order is a builder's:
// a part's text is typed only after its space exists, a copy waits until the part it copies is
// finished (text included), and loose headings wait until the structure of their section is in place.
const kOf = (t) => t.kind || kindOf(t.el);
const RANK = { cross: 0, resize: 0, move: 0, copy: 1, text: 2, inside: 2 };
const ROLE = { cross: 'draw', resize: 'resize', move: 'move', copy: 'copy', text: 'type', inside: 'type' };
const SECTIONS = $$('main > section');
const groupIndex = (el) => SECTIONS.indexOf(groupOf(el));   // the header ('top') is -1: it comes first
const structurePending = (g, except) => queue.some(t => t !== except && groupOf(t.el) === g && RANK[kOf(t)] === 0) || workers.some(w => w.task && groupOf(w.task.el) === g && RANK[w.task.kind] === 0);
const taskReady = (t) => { const k = kOf(t); return k === 'copy' ? !!t.el.previousElementSibling._done : k === 'text' ? !structurePending(groupOf(t.el), t) : true; };
const before = (a, b) => groupIndex(a.el) - groupIndex(b.el) || RANK[kOf(a)] - RANK[kOf(b)] || (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
let crewHold = true;
function assign(){
  // parts already scrolled past (or with the animations off) are simply finished
  const on = crewOn(), skip = (t) => { if (!on) return true; const r = t.el.getBoundingClientRect(); return !r.width || r.bottom < -40 || r.top > innerHeight + 240 || getComputedStyle(t.el).visibility === 'hidden'; };
  for (let i = 0; i < queue.length; ){ if (skip(queue[i])) finish(queue.splice(i, 1)[0]); else i++; }   // finish() may queue the part's text: it is visited too
  if (crewHold && crewOn()){ return; }
  for (const w of workers){
    if (w.state !== 'rest') continue;
    const cands = queue.filter(t => ROLE[kOf(t)] === w.role && taskReady(t)).sort(before);
    if (!cands.length) continue;
    const task = cands[0];
    queue.splice(queue.indexOf(task), 1);
    const kind = task.kind = kOf(task), H = home(task.el);
    task.o = reduce ? { dx: 0, dy: 0, s: 1 } : kind === 'move' ? moveFrom(task.el, H) : kind === 'resize' ? { dx: 0, dy: 0, s: .42 } : { dx: 0, dy: 0, s: 1 };
    const [tx, ty] = at(H, 0, 0);
    // each cursor jumps from where it stopped; the first time, it comes in from the edge
    if (!w.born){ [w.x, w.y] = offscreen(tx + (workers.indexOf(w) - 2.5) * 90, ty); w.born = true; }
    w.task = task; w.pi = 0;
    layer(w, stuck(task.el));
    { const [hx, hy] = HOT[w.kind || 'arrow']; w.root.style.transform = pw(w, w.x - hx, w.y - hy); }
    w.root.classList.remove('off');
    plan(w, task);
    if (!task.steps.length){ rest(w); finish(task); return assign(); }
    hopTo(w, performance.now());
  }
  if (!queue.length && workers.every(w => w.state === 'rest') && isComplete()){
    workers.forEach(w => { w.born = false; });
    if (ANIM.force){ ANIM.force = false; crewEl.hidden = !crewOn(); }
  }
  if (crewOn() && !raf) raf = requestAnimationFrame(tick);
}
function moveFrom(el, H){
  const busy = workers.filter(w => w.task && w.task.el !== el).map(w => home(w.task.el));
  const hit = (r) => busy.reduce((n, b) => n + Math.max(0, Math.min(r.right, b.left + b.width) - Math.max(r.left, b.left)) * Math.max(0, Math.min(r.bottom, b.top + b.height) - Math.max(r.top, b.top)), 0);
  let best = null; const top = stuck(el);   // the header's parts slide in sideways, never over the hero
  for (let i = 0; i < 16; i++){
    const a = (i / 16) * Math.PI * 2 + Math.random() * .3, d = 60 + Math.random() * 50, dx = Math.cos(a) * d, dy = top ? 0 : Math.sin(a) * d * .7;
    const r = { left: H.left + dx, top: H.top + dy, right: H.left + dx + H.width, bottom: H.top + dy + H.height };
    const out = Math.max(0, -r.left) + Math.max(0, r.right - innerWidth) + Math.max(0, (top ? 0 : 64) - r.top) + Math.max(0, r.bottom - innerHeight);
    const score = hit(r) * 4 + out * 400 + Math.random();
    if (!best || score < best.score) best = { score, dx, dy };
  }
  return { dx: best.dx, dy: best.dy, s: 1 };
}
// the cursor jumps to where the next step starts, in a short arc
function hopTo(w, now){
  const s = w.task.steps[w.pi]; setKind(w, s.cur);
  const [tx, ty] = s.aim(), d = Math.hypot(tx - w.x, ty - w.y);
  w.state = 'hop'; w.t0 = now; w.from = [w.x, w.y]; w.hop = Math.min(70, d * .25);
  w.dur = clampN(d * .4, d < 140 ? 60 : 110, 380) * pace;
}
// the crew moves at 30 frames per second, whatever the screen's refresh rate
const FRAME = 1000 / 30; let lastFrame = 0;
function tick(now){
  raf = 0;
  if (now - lastFrame < FRAME - 1){ raf = requestAnimationFrame(tick); return; }
  lastFrame = now;
  let busy = false;
  for (const w of workers){
    if (w.state === 'rest') continue;
    busy = true;
    const p = Math.min(1, (now - w.t0) / w.dur), e = ease(p), task = w.task, s = task && task.steps[w.pi];
    if (w.state === 'hop'){
      const [tx, ty] = s.aim();
      w.x = w.from[0] + (tx - w.from[0]) * e; w.y = w.from[1] + (ty - w.from[1]) * e - Math.sin(Math.PI * e) * w.hop;
      if (p >= 1){ w.state = 'work'; w.t0 = now; w.dur = s.dur; click(w); s.begin && s.begin(); [w.x, w.y] = s.step(0, 0); w.sel.classList.add('on'); }
    } else if (w.state === 'work'){
      [w.x, w.y] = s.step(e, p);
      if (p >= 1){ s.end && s.end(); w.pi++; if (w.pi < task.steps.length) hopTo(w, now); else { w.state = 'hold'; w.t0 = now; w.dur = 100 * pace; } }
    } else if (w.state === 'hold'){
      drawSel(w, task.el.getBoundingClientRect());
      if (p >= 1){
        rest(w);
        finish(task);
        assign();
      }
    }
    const [hx, hy] = HOT[w.kind || 'arrow'];
    w.root.style.transform = pw(w, w.x - hx, w.y - hy);
  }
  // assign() may already have asked for the next frame: one loop is enough
  if (busy && crewOn() && !raf) raf = requestAnimationFrame(tick);
}
function setAnim(on, save = true){
  ANIM.on = on;
  if (save) try { localStorage.setItem('lorz-anim', on ? 'on' : 'off'); } catch {}
  $('#animToggle').setAttribute('aria-pressed', String(on));
  crewEl.hidden = !crewOn();
  if (!crewOn()){
    workers.forEach(w => { const t = w.task; rest(w); w.born = false; if (t) finish(t); });
    while (queue.length) finish(queue.shift());
    if (window.__sb) window.__sb.check();   // the rest of the page appears at once
  }
}
workers.forEach(w => setKind(w, 'arrow'));
const deep = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
setAnim(ANIM.on && !deep, false);
$('#animToggle').addEventListener('click', () => setAnim(!ANIM.on));

/* ========== 2) intro: the hero built by the crew ========== */
const intro = $('#intro'), editor = $('#editor');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const wait = ms => new Promise(r => setTimeout(r, ms));
let introRunning = false;
async function runIntro(force){
  const builds = $$('header .build, .hero .build');
  intro.hidden = false; editor.hidden = false; intro.classList.remove('gone'); editor.classList.remove('gone'); editor.innerHTML = '';
  $('#intro .mark').classList.remove('lit'); const bar = $('#intro .bar i'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; void bar.offsetWidth; bar.style.transition = '';
  if (!ANIM.on && !force){
    builds.forEach(b => { b.classList.add('built'); b._done = true; }); intro.hidden = true; editor.hidden = true; document.body.classList.remove('locked'); crewHold = false; assign();
    if (window.__sb) window.__sb.check();
    if (deep) deep.scrollIntoView({ behavior: 'instant' });
    return;
  }
  crewHold = true;
  introRunning = true; ANIM.force = !!force; crewEl.hidden = false; document.body.classList.add('locked');
  const w = (ms) => wait(ms * pace);
  scrollTo({ top: 0, behavior: 'instant' });
  await w(100); bar.style.transform = 'scaleX(1)';
  await w(500); $('#intro .mark').classList.add('lit');
  await w(350); intro.classList.add('gone');
  editor.innerHTML = '<div class="ruler"></div><div class="ruler-v"></div>';
  await wait(30);
  $$('.ruler, .ruler-v', editor).forEach(r => r.classList.add('on'));
  [['h',.28],['h',.7],['v',.08],['v',.52],['v',.92]].forEach(([t,p],i) => { const g = document.createElement('div'); g.className = 'guide ' + t; g.style[t==='h'?'top':'left'] = (p*100) + '%'; editor.appendChild(g); setTimeout(() => g.classList.add('on'), 120 + i*90); });
  await w(300);
  document.body.classList.remove('locked');   // no need to wait: the hero keeps being built while the visitor scrolls
  // the crew takes the hero's parts in their build order, several at once
  const list = builds.map((el,i) => ({ el, o: +(el.dataset.order ?? -1), i })).sort((a,b) => a.o - b.o || a.i - b.i).map(x => x.el);
  crewHold = false;
  await new Promise(res => { let left = list.length; list.forEach(el => enqueue(el, () => { if (--left === 0) res(); }, true)); assign(); });
  await w(350);
  editor.classList.add('gone');
  document.body.classList.remove('locked');
  setTimeout(() => { editor.hidden = true; intro.hidden = true; editor.innerHTML = ''; }, 800);
  introRunning = false;
}
// the sections are prepared right away (so nothing shows unbuilt), the crew waits for the opening
startScrollBuild();
runIntro();
// replay: take the page apart and build it again, from the top
$('#animReplay').addEventListener('click', async (e) => {
  if (introRunning) return;
  const btn = e.currentTarget; btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
  scrollTo({ top: 0, behavior: 'instant' });
  // stop whatever the crew is doing before taking the page apart
  [...queue, ...workers.map(w => w.task)].forEach(t => t && abort(t));
  queue.length = 0;
  $$('.build').forEach(el => { el._done = false; });
  workers.forEach(w => { rest(w); w.born = false; });
  document.querySelectorAll('.build [style*="clip-path"], .build[style*="clip-path"]').forEach(n => { n.style.clipPath = ''; });
  if (window.__sb) window.__sb.reset();
  $$('header .build, .hero .build').forEach(el => el.classList.remove('built', 'now'));
  await wait(250);
  await runIntro(true);
  if (window.__sb) window.__sb.check();
});
