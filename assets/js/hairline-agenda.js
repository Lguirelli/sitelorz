/**
 * Agenda: a speech bubble standing on a board, its tail as its foot, with an
 * editorial calendar on its face: a header, a 3 × 2 grid and three posts. The
 * post under the pointer comes out of the face towards the viewer and lights;
 * the other two come out a little, staggered by distance. The slider is how
 * far the chosen post comes out.
 *
 * Each post carries data-tone and its group is-on when chosen, so the site can
 * fill it in its own colour (lorz.css, .lz-nodes__stage).
 */
const { Cam, clamp, fillet, fit, poly, proj, rings, prism, facing, seg, tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid } = HL;

const BOARD = [-14, -4, 112, 34], ZB = 4, Y = 18, TK = 4;
const SHAPE = fillet([[0, 16], [14, 16], [6, 0], [32, 16], [98, 16], [98, 84], [0, 84]], [10, 2, 1.5, 3, 10, 10, 10]);
const CAL = [14, 26, 84, 74], HEAD = 64, COLS = [37.3, 60.7], ROW = 45;
const PARTS = [
  { name: "planejar", tone: "orange", c: [25.7, 54.5], rest: 3 },
  { name: "produzir", tone: "orange", c: [72.3, 54.5], rest: 1.5 },
  { name: "publicar", tone: "red", c: [49, 35.5], rest: 5 },
];
const HW = 8, HH = 6.5, LIFT_MAX = 20;
const rect = ([u, v]) => fillet([[u - HW, v - HH], [u + HW, v - HH], [u + HW, v + HH], [u - HW, v + HH]], [2, 2, 2, 2]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;

  const C = Cam(45, 0.5, 1.95);
  fit(C, [[BOARD[0], BOARD[1], -ZB], [BOARD[2], BOARD[3], -ZB], [BOARD[2], BOARD[1], 0], [BOARD[0], BOARD[3], 0], [0, Y, 84], [98, Y, 84], [0, Y + LIFT_MAX + 2, 60]], 200, 166);
  const P = proj(C), front = facing(C);
  const w = (u, v, dy = 0) => P(u, Y + dy, v);
  const g = mk("g", {}, svg);

  const [bo, bi] = rings(...BOARD, 9, 2);
  put(solid(g), prism(P, front, bo, bi, -ZB, 0));

  // the bubble: its back a plate's thickness behind, then its face, then the calendar drawn on the face
  mk("path", { d: poly(SHAPE.map(([u, v]) => w(u, v, -TK))), class: "lo" }, g);
  const face = mk("path", { d: poly(SHAPE.map(([u, v]) => w(u, v))), class: "sil" }, g);
  const [u0, v0, u1, v1] = CAL;
  mk("path", { d: poly(fillet([w(u0, v0), w(u1, v0), w(u1, v1), w(u0, v1)], [3, 3, 3, 3])), class: "nf" }, g);
  mk("path", { d: seg(w(u0, HEAD), w(u1, HEAD)) + [30, 68].map((u) => seg(w(u, v1 - 4), w(u, v1 + 5))).join(""), class: "nf" }, g);
  mk("path", { d: COLS.map((u) => seg(w(u, v0), w(u, HEAD))).join("") + seg(w(u0, ROW), w(u1, ROW)), class: "nf lo" }, g);

  // the posts, nearest last: each a small plate that comes out of the face on dashed guides
  const parts = PARTS.map((p) => {
    const grp = mk("g", { "data-tone": p.tone }, g), shape = rect(p.c);
    const drop = mk("path", { class: "nf dash" }, grp), back = mk("path", { class: "lo" }, grp);
    const inner = mk("g", {}, grp), top = mk("path", { class: "sil" }, inner);
    const dot = mk("circle", { r: 1.6, class: "dot off" }, grp);
    return { p, grp, shape, drop, back, top, dot, z: tween(p.rest), last: NaN };
  }).sort((a, b) => a.p.c[0] - b.p.c[0]);
  parts.forEach((pt) => g.append(pt.grp));

  function draw(pt, d) {
    if (d === pt.last) return;
    pt.last = d;
    const [u, v] = pt.p.c;
    pt.drop.setAttribute("d", d > 0.5 ? [[u - HW, v - HH], [u + HW, v + HH]].map(([a, b]) => seg(w(a, b), w(a, b, d))).join("") : "");
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

  // hit: each post's resting place on screen, which never moves; nearest within reach wins
  const restAt = PARTS.map((p) => w(p.c[0], p.c[1], p.rest + 1.6));
  function hit([sx, sy]) {
    let best = -1, bd = 22;
    restAt.forEach(([x, y], k) => { const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = k; } });
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
    face.classList.toggle("hi", a < 0);
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
  name: "agenda",
  means: "Um balão com o calendário editorial: o post sob o ponteiro sai da página e acende; os outros vêm atrás.",
  rules: [1, 2, 4, 5],
  range: [8, 14, 20],
  tour: [[157, 118], [187, 168], [224, 149], null],
  mount,
});
