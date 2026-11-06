/**
 * Nós: a patch board with the Lorz character standing on a round plinth as the
 * source node, and three nodes wired to the plinth by cables laid flat on the
 * board: a puck with three dots (social), a browser slab (site) and a geared
 * drum (ferramentas). The node under the pointer lifts off the board and its
 * cable takes the bright stroke; the other two rise a little after it,
 * staggered by distance. The slider is the lift.
 *
 * Lorz: the character is the page's own <symbol id="lz-retrato">, stood upright
 * facing the viewer; where the page has none (the bench), only the plinth shows.
 * Each node, cable and port carries data-node, and the active node is-on, so the
 * site can light each one in its own colour (lorz.css, .lz-nodes__stage).
 */
const {
  Cam, circ, clamp, extremes, facing, fillet, fit, open, poly, prism, proj, rings, ringAt, seg, unproj,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

const BOARD = [-10, -10, 126, 108], ZB = 4;
const BASE = { cx: 8, cy: 8, R: 11, h: 6 }, FIG = { w: 70, h: 80 };
const NODES = [
  { name: "social", kind: "puck", cx: 18, cy: 82, R: 13, h: 16, rest: 3, cable: [[10, 19], [10, 70]] },
  { name: "site", kind: "slab", box: [52, 58, 94, 92], h: 9, rest: 8, cable: [[17, 15], [34, 15], [34, 38], [72, 38], [72, 58]] },
  { name: "ferramentas", kind: "gear", cx: 104, cy: 28, R: 14, h: 22, rest: 1, cable: [[19, 5], [104, 5], [104, 14]] },
];
const at = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));

/** The node's footprint and crease rings. */
function foot(n) {
  if (n.kind === "slab") return rings(...n.box, 5, 1.6);
  return [at(circ(n.R, 40), n.cx, n.cy), at(circ(n.R - 1.6, 40), n.cx, n.cy)];
}
const centre = (n) => (n.kind === "slab" ? [(n.box[0] + n.box[2]) / 2, (n.box[1] + n.box[3]) / 2] : [n.cx, n.cy]);

/** What makes each node what it is, on its top at height z: [d, class] marks, plus dot positions. */
function marks(P, n, z) {
  if (n.kind === "puck") return { lines: [], dots: [-5.5, 0, 5.5].map((d) => P(n.cx + d * 0.7, n.cy - d * 0.7, z)) };
  if (n.kind === "slab") {
    const [x0, y0, x1, y1] = n.box, w = (x, y) => P(x, y, z);
    return {
      lines: [
        [seg(w(x0 + 2, y0 + 9), w(x1 - 2, y0 + 9)), "nf"],
        [poly(fillet([w(x0 + 8, y0 + 12), w(x1 - 4, y0 + 12), w(x1 - 4, y0 + 24), w(x0 + 8, y0 + 24)], [1.5, 1.5, 1.5, 1.5])), "nf lo"],
        [poly(fillet([w(x0 + 8, y1 - 7), w(x1 - 4, y1 - 7), w(x1 - 4, y1 - 4), w(x0 + 8, y1 - 4)], [1, 1, 1, 1])), "nf lo"],
      ],
      dots: [5, 9, 13].map((d) => w(x0 + d, y0 + 5)),
    };
  }
  const teeth = [];
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2, r = Math.floor(k / 2.5) % 2 ? n.R - 4 : n.R - 2;
    teeth.push(P(n.cx + r * Math.cos(a), n.cy + r * Math.sin(a), z));
  }
  return { lines: [[poly(teeth), "nf lo"], [poly(ringAt(P, at(circ(3, 16), n.cx, n.cy), z)), "nf"]], dots: [] };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;

  const C = Cam(45, 0.5, 1.5);
  fit(C, [[BOARD[0], BOARD[1], -ZB], [BOARD[2], BOARD[3], -ZB], [BOARD[2], BOARD[1], 0], [BOARD[0], BOARD[3], 0], [8, 8, 80], [104, 28, 52], [94, 92, 40], [18, 82, 46]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the board, then the cables lying on it: everything flat is painted before anything that stands
  const [bo, bi] = rings(...BOARD, 9, 2);
  put(solid(g), prism(P, front, bo, bi, -ZB, 0));
  const cables = NODES.map((n) => {
    // an open run with rounded bends: fillet the closed loop, then drop the closing corner it adds
    const pts = n.cable.map(([x, y]) => P(x, y, 0));
    const d = open(pts.length > 2 ? [pts[0], ...fillet(pts, pts.map(() => 5)).slice(5, -5), pts[pts.length - 1]] : pts);
    return mk("path", { d, class: "nf", "data-node": n.name }, g);
  });
  // a port at each end of every cable: where it leaves the plinth, and where it plugs into its node
  const ports = NODES.map((n) => [n.cable[0], n.cable[n.cable.length - 1]].map(([x, y]) => { const c = mk("circle", { r: 1.8, class: "dot off", "data-node": n.name }, g); place(c, P(x, y, 0)); return c; }));

  // the source: a round plinth at the far corner, and the character standing on it, upright and facing the viewer
  const plinth = solid(g);
  put(plinth, prism(P, front, at(circ(BASE.R, 40), BASE.cx, BASE.cy), at(circ(BASE.R - 1.6, 40), BASE.cx, BASE.cy), 0, BASE.h));
  const [fx, fy] = P(BASE.cx, BASE.cy, BASE.h);
  mk("use", { href: "#lz-retrato", class: "retrato", x: fx - FIG.w / 2, y: fy - FIG.h + 8, width: FIG.w, height: FIG.h }, g);
  const lHi = (on) => plinth.sil.classList.toggle("hi", on);

  const nodes = NODES.map((n) => {
    const grp = mk("g", { "data-node": n.name }, g), [o, i] = foot(n);
    const drop = mk("path", { class: "nf dash" }, grp), riser = mk("path", { class: "nf lo" }, grp);
    const s = solid(grp);
    const lines = marks(P, n, 0).lines.map(([, cls]) => mk("path", { class: cls }, grp));
    const dots = marks(P, n, 0).dots.map((_, k) => mk("circle", { r: 1.5, class: "dot " + (k === 1 ? "m" : "off") }, grp));
    return { n, grp, o, i, s, drop, riser, lines, dots, z: tween(n.rest), last: NaN };
  });

  function draw(nd, z) {
    if (z === nd.last) return;
    nd.last = z;
    const { n, o, i } = nd, e = n.cable[n.cable.length - 1];
    put(nd.s, prism(P, front, o, i, z, z + n.h));
    const ex = extremes(P, o);
    nd.drop.setAttribute("d", z > 0.5 ? ex.slice(0, 2).map((q) => seg(P(q.u, q.v, 0), P(q.u, q.v, z))).join("") : "");
    nd.riser.setAttribute("d", seg(P(e[0], e[1], 0), P(e[0], e[1], z)));
    const m = marks(P, n, z + n.h);
    nd.lines.forEach((el, k) => el.setAttribute("d", m.lines[k][0]));
    nd.dots.forEach((el, k) => place(el, m.dots[k]));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    nodes.forEach((nd) => { draw(nd, tval(nd.z, now)); if (!tdone(nd.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: the pointer on each node's resting top, nearest middle wins, within its reach
  function hit([sx, sy]) {
    let best = -1, bd = Infinity;
    NODES.forEach((n, k) => {
      const [x, y] = unproj(C, sx, sy, n.rest + n.h), [cx, cy] = centre(n);
      const r = n.kind === "slab" ? 26 : n.R + 6, d = Math.hypot(x - cx, y - cy);
      if (d < r && d < bd) { bd = d; best = k; }
    });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(act, 0);
    act = a;
    nodes.forEach((nd, k) => {
      const to = a < 0 ? nd.n.rest : k === a ? lift : clamp(lift * 0.3, 0, 8);
      tset(nd.z, to, now, Math.abs(k - from) * 45);
      nd.s.sil.classList.toggle("hi", k === a);
      nd.grp.classList.toggle("is-on", k === a);
      cables[k].classList.toggle("hi", k === a);
      nd.riser.classList.toggle("hi", k === a);
      ports[k].forEach((c) => c.setAttribute("class", "dot" + (k === a ? "" : " off")));
    });
    lHi(a < 0);
    read.textContent = a < 0 ? "rest" : NODES[a].name;
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
  name: "nos",
  means: "O personagem da Lorz ligado a três nós: o que está sob o ponteiro sobe do painel e acende na sua cor.",
  rules: [1, 2, 4, 5],
  range: [10, 18, 28],
  tour: [[122, 177], [188, 205], [271, 189], null],
  mount,
});
