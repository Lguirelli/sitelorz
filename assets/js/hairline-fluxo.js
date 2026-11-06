/**
 * Fluxo: a chart's axes laid on a board, a post at the far corner and two
 * rails along the floor, and three nodes standing over it at rising heights,
 * like points on a line: a puck, a cube and a tower, joined in order by
 * cables with square bends. The node under the pointer rises further and
 * lights with the cable that feeds it; the other two rise a little after it,
 * staggered by distance. The slider is the rise.
 *
 * Each node carries data-tone and its group is-on when chosen, so the site can
 * fill it in its own colour (lorz.css, .lz-nodes__stage).
 */
const { Cam, circ, clamp, extremes, facing, fit, open, prism, proj, rings, seg, unproj, tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid } = HL;

const BOARD = [-14, -122, 50, 16], ZB = 4;
const NODES = [
  { name: "entrada", tone: "navy", kind: "puck", c: [26, -16], R: 11, h: 8, rest: 8 },
  { name: "automacao", tone: "orange", kind: "cube", c: [26, -58], R: 10, h: 14, rest: 24 },
  { name: "resultado", tone: "red", kind: "tower", c: [26, -100], R: 9, h: 20, rest: 44 },
];
const at = (ring, [cx, cy]) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
const foot = (n) => n.kind === "cube"
  ? rings(n.c[0] - n.R, n.c[1] - n.R, n.c[0] + n.R, n.c[1] + n.R, 4, 1.6)
  : [at(circ(n.R, 40), n.c), at(circ(n.R - 1.6, 40), n.c)];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;

  const C = Cam(45, 0.5, 1.95);
  fit(C, [[BOARD[0], BOARD[1], -ZB], [BOARD[2], BOARD[3], -ZB], [BOARD[2], BOARD[1], 0], [BOARD[0], BOARD[3], 0], [-6, 6, 84], [26, -100, 44 + 20 + 24], [50, -122, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the board, then the axes: two rails on the floor and the post at the far corner where they meet
  const [bo, bi] = rings(...BOARD, 9, 2);
  put(solid(g), prism(P, front, bo, bi, -ZB, 0));
  const [yo, yi] = rings(-6, -116, 0, 0, 2, 0.8);
  put(solid(g), prism(P, front, yo, yi, 0, 3));
  const [xo, xi] = rings(0, 0, 44, 6, 2, 0.8);
  put(solid(g), prism(P, front, xo, xi, 0, 3));
  const [po, pi] = rings(-6, 0, 0, 6, 2, 0.8);
  put(solid(g), prism(P, front, po, pi, 0, 84));
  // ticks on the post, one at each node's resting height
  mk("path", { d: NODES.map((n) => seg(P(-3, 0, n.rest + n.h / 2), P(-3, -6, n.rest + n.h / 2))).join(""), class: "nf lo" }, g);

  // the cables, behind the nodes they join: out of one node's side, up or down, into the next one's
  const mid = (n, z) => z + n.h / 2;
  const cables = NODES.slice(1).map((n) => mk("path", { class: "nf", "data-tone": n.tone }, g));

  const nodes = NODES.map((n) => {
    const grp = mk("g", { "data-tone": n.tone }, g), [o, i] = foot(n);
    const drop = mk("path", { class: "nf dash" }, grp);
    const s = solid(grp);
    const mark = mk("path", { class: "nf lo" }, grp);
    const dot = mk("circle", { r: 1.6, class: "dot off" }, grp);
    return { n, grp, o, i, s, drop, mark, dot, z: tween(n.rest), last: NaN };
  });
  // painted from the far end of the axis to the near one
  nodes.slice().reverse().forEach((nd) => g.append(nd.grp));

  function draw(nd, z) {
    if (z === nd.last) return false;
    nd.last = z;
    const { n, o, i } = nd, [cx, cy] = n.c, top = z + n.h;
    put(nd.s, prism(P, front, o, i, z, top));
    nd.drop.setAttribute("d", extremes(P, o).slice(0, 2).map((q) => seg(P(q.u, q.v, 0), P(q.u, q.v, z))).join(""));
    // what makes each one itself, on its top: a ring on the puck, a cross seam on the cube, nothing but its height on the tower
    const r = n.R - 5;
    nd.mark.setAttribute("d", n.kind === "puck" ? open(at(circ(r, 24), n.c).map((q) => P(q.u, q.v, top)).concat([P(cx + r, cy, top)]))
      : n.kind === "cube" ? seg(P(cx - r, cy, top), P(cx + r, cy, top)) + seg(P(cx, cy - r, top), P(cx, cy + r, top)) : "");
    place(nd.dot, P(cx, cy, top));
    return true;
  }
  function wire() {
    cables.forEach((el, k) => {
      const a = nodes[k], b = nodes[k + 1], za = mid(a.n, a.last), zb = mid(b.n, b.last);
      const xm = a.n.c[0], ym = (a.n.c[1] + b.n.c[1]) / 2;
      el.setAttribute("d", open([P(a.n.c[0], a.n.c[1], za), P(xm, ym, za), P(xm, ym, zb), P(b.n.c[0], b.n.c[1], zb)]));
    });
  }

  const B = register(stage, (_dt, now) => {
    let moving = false, changed = false;
    nodes.forEach((nd) => { changed = draw(nd, tval(nd.z, now)) || changed; if (!tdone(nd.z, now)) moving = true; });
    if (changed) wire();
    return moving;
  });
  bag.add(B.unregister);

  // hit: the pointer on each node's resting top, nearest middle wins, within its reach
  function hit([sx, sy]) {
    let best = -1, bd = Infinity;
    NODES.forEach((n, k) => {
      const [x, y] = unproj(C, sx, sy, n.rest + n.h), d = Math.hypot(x - n.c[0], y - n.c[1]);
      if (d < n.R + 7 && d < bd) { bd = d; best = k; }
    });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(act, 0);
    act = a;
    nodes.forEach((nd, k) => {
      const to = nd.n.rest + (a < 0 ? 0 : k === a ? lift : clamp(lift * 0.3, 0, 7));
      tset(nd.z, to, now, Math.abs(k - from) * 45);
      nd.s.sil.classList.toggle("hi", k === a || (a < 0 && k === 2));
      nd.grp.classList.toggle("is-on", k === a);
      nd.dot.setAttribute("class", "dot" + (k === a ? "" : " off"));
      if (k > 0) cables[k - 1].classList.toggle("hi", k === a);
    });
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
  name: "fluxo",
  means: "Três nós de uma automação sobre um eixo: o nó sob o ponteiro sobe e acende com o cabo que o alimenta.",
  rules: [1, 2, 4, 5],
  range: [8, 14, 22],
  tour: [[160, 220], [218, 153], [276, 81], null],
  mount,
});
