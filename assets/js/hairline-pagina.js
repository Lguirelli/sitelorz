/**
 * Pagina: a browser window standing on a board: a title bar with its three
 * buttons, and on the page three blocks and a contact button. The part under
 * the pointer comes out of the page towards the viewer and lights; the others
 * come out a little, staggered by distance. At rest the contact button stands
 * out. The slider is how far the chosen part comes out.
 *
 * Each part carries data-tone and its group is-on when chosen, so the site can
 * fill it in its own colour (lorz.css, .lz-nodes__stage).
 */
const { Cam, clamp, fillet, fit, poly, proj, rings, prism, facing, seg, tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid } = HL;

const BOARD = [-14, -4, 114, 34], ZB = 4, Y = 18, TK = 4;
const SHAPE = fillet([[0, 0], [100, 0], [100, 84], [0, 84]], [7, 7, 7, 7]);
const BAR = 72;
const PARTS = [
  { name: "topo", tone: "navy", box: [10, 48, 90, 64], r: 3, rest: 2 },
  { name: "secao", tone: "orange", box: [10, 30, 90, 42], r: 3, rest: 1 },
  { name: "conteudo", tone: "navy", box: [10, 12, 54, 24], r: 3, rest: 1 },
  { name: "contato", tone: "red", box: [62, 12, 90, 24], r: 6, rest: 5 },
];
const LIFT_MAX = 20;
const centre = (p) => [(p.box[0] + p.box[2]) / 2, (p.box[1] + p.box[3]) / 2];
const rect = (p) => { const [a, b, c, d] = p.box; return fillet([[a, b], [c, b], [c, d], [a, d]], [p.r, p.r, p.r, p.r]); };

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;

  const C = Cam(45, 0.5, 1.95);
  fit(C, [[BOARD[0], BOARD[1], -ZB], [BOARD[2], BOARD[3], -ZB], [BOARD[2], BOARD[1], 0], [BOARD[0], BOARD[3], 0], [0, Y, 84], [100, Y, 84], [0, Y + LIFT_MAX + 2, 64], [100, Y + LIFT_MAX + 2, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const w = (u, v, dy = 0) => P(u, Y + dy, v);
  const g = mk("g", {}, svg);

  const [bo, bi] = rings(...BOARD, 9, 2);
  put(solid(g), prism(P, front, bo, bi, -ZB, 0));

  // the window: its back a plate's thickness behind, its face, the title bar with its three buttons
  mk("path", { d: poly(SHAPE.map(([u, v]) => w(u, v, -TK))), class: "lo" }, g);
  mk("path", { d: poly(SHAPE.map(([u, v]) => w(u, v))), class: "sil" }, g);
  mk("path", { d: seg(w(0, BAR), w(100, BAR)), class: "nf" }, g);
  [8, 14, 20].forEach((u, k) => place(mk("circle", { r: 1.6, class: "dot " + (k ? "off" : "m") }, g), w(u, 78)));

  // the parts, nearest last: each a plate that comes out of the page on dashed guides
  const parts = PARTS.map((p) => {
    const grp = mk("g", { "data-tone": p.tone }, g), shape = rect(p);
    const drop = mk("path", { class: "nf dash" }, grp), back = mk("path", { class: "lo" }, grp);
    const inner = mk("g", {}, grp), top = mk("path", { class: "sil" }, inner);
    const dot = mk("circle", { r: 1.6, class: "dot off" }, grp);
    return { p, grp, shape, drop, back, top, dot, z: tween(p.rest), last: NaN };
  }).sort((a, b) => a.p.box[0] - b.p.box[0] || b.p.box[1] - a.p.box[1]);
  parts.forEach((pt) => g.append(pt.grp));

  function draw(pt, d) {
    if (d === pt.last) return;
    pt.last = d;
    const [u, v] = centre(pt.p), [a0, b0, a1, b1] = pt.p.box;
    pt.drop.setAttribute("d", d > 0.5 ? [[a0, b0], [a1, b1]].map(([a, b]) => seg(w(a, b), w(a, b, d))).join("") : "");
    pt.back.setAttribute("d", poly(pt.shape.map(([a, b]) => w(a, b, d))));
    pt.top.setAttribute("d", poly(pt.shape.map(([a, b]) => w(a, b, d + 1.6))));
    place(pt.dot, w(u, v, d + 1.6));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    parts.forEach((pt) => { draw(pt, tval(pt.z, now)); if (!tdone(pt.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: each part's box on its resting plane, which never moves; inside, or nearest within reach, wins
  const restAt = PARTS.map((p) => p.box);
  const near = ([a0, b0, a1, b1], k, sx, sy) => {
    // the pointer on the part's own resting plane, as (u, v); its distance outside the box, zero inside
    const [x0, y0] = w(0, 0, PARTS[k].rest), [x1, y1] = w(1, 0, PARTS[k].rest), [x2, y2] = w(0, 1, PARTS[k].rest);
    const eu = [x1 - x0, y1 - y0], ev = [x2 - x0, y2 - y0], det = eu[0] * ev[1] - eu[1] * ev[0];
    const qx = sx - x0, qy = sy - y0, u = (qx * ev[1] - qy * ev[0]) / det, v = (eu[0] * qy - eu[1] * qx) / det;
    return Math.hypot(Math.max(a0 - u, 0, u - a1), Math.max(b0 - v, 0, v - b1));
  };
  function hit([sx, sy]) {
    let best = -1, bd = 4;
    restAt.forEach((b, k) => { const d = near(b, k, sx, sy); if (d < bd) { bd = d; best = k; } });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(act, 0);
    act = a;
    parts.forEach((pt) => {
      const k = PARTS.indexOf(pt.p);
      tset(pt.z, a < 0 ? pt.p.rest : k === a ? lift : clamp(lift * 0.3, 0, 6), now, Math.abs(k - from) * 45);
      pt.top.classList.toggle("hi", k === a);
      pt.grp.classList.toggle("is-on", k === a);
      pt.dot.setAttribute("class", "dot" + (k === a ? "" : " off"));
    });
    parts.find((pt) => pt.p.name === "contato").top.classList.toggle("hi", a < 0 || a === 3);
    // the chosen part comes nearest the viewer, so it is painted last (rule 06: move the group, do not redraw)
    if (a >= 0) g.append(parts.find((pt) => PARTS.indexOf(pt.p) === a).grp);
    read.textContent = a < 0 ? "rest" : PARTS[a].name;
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = v; if (act >= 0) { const a = act; act = -2; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "pagina",
  means: "Uma janela de navegador: a seção sob o ponteiro sai da página e acende; em repouso, o botão de contato se destaca.",
  rules: [1, 2, 4, 5],
  range: [8, 14, 20],
  tour: [[193, 130], [170, 181], [225, 214], null],
  mount,
});
