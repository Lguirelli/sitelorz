/**
 * Lupa: a stack of four index cards on a board, a little askew, the top one
 * ruled with five lines, and a magnifying glass hovering over its far corner.
 * The glass follows the pointer over the top card on a spring; the line under
 * it lights. The slider is how high the glass hovers.
 *
 * The glass carries data-tone and is-on while it searches, and its lens
 * data-part="glass", so the site can fill them in its own colours (lorz.css).
 */
const { Cam, circ, clamp, extremes, facing, fit, poly, prism, proj, rad, ringAt, rrect, seg, spring, stepS, unproj, disposer, mk, pointer, put, register, solid } = HL;

const BOARD = [-16, -14, 102, 78], ZB = 4, CW = 84, CH = 60, T = 2, GAP = 3;
const CARDS = [[-8, -6, 6], [5, 4, -4], [-3, -2, 3], [0, 0, 0]];
const LINES = [[10, 66], [20, 56], [30, 70], [40, 48], [50, 60]], U0 = 10;
const TOP = 3 * GAP + T, R = 14, RI = 10.5, HAND = 26, REST = [60, 14];

/** A ring turned by deg about (cx, cy), normals with it. */
function turn(ring, deg, cx, cy, dx, dy) {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return ring.map((q) => ({ ...q, u: cx + dx + (q.u - cx) * c - (q.v - cy) * s, v: cy + dy + (q.u - cx) * s + (q.v - cy) * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c }));
}
const at = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let hover = value;

  const C = Cam(45, 0.5, 2.2);
  fit(C, [[BOARD[0], BOARD[1], -ZB], [BOARD[2], BOARD[3], -ZB], [BOARD[2], BOARD[1], 0], [BOARD[0], BOARD[3], 0], [70, 0, TOP + 24 + 3], [70 + R + HAND, 8, TOP + 24]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const bo = rrect(...BOARD, 9, 6), bi = rrect(BOARD[0] + 2, BOARD[1] + 2, BOARD[2] - 2, BOARD[3] - 2, 7, 6);
  put(solid(g), prism(P, front, bo, bi, -ZB, 0));

  // the cards, bottom up, each turned a little about its middle
  CARDS.forEach(([deg, dx, dy], k) => {
    const o = turn(rrect(0, 0, CW, CH, 5, 6), deg, CW / 2, CH / 2, dx, dy), i = turn(rrect(1.2, 1.2, CW - 1.2, CH - 1.2, 3.8, 6), deg, CW / 2, CH / 2, dx, dy);
    put(solid(g), prism(P, front, o, i, k * GAP, k * GAP + T));
  });
  const lines = LINES.map(([v, len]) => mk("path", { d: seg(P(U0, v, TOP), P(U0 + len, v, TOP)), class: "nf lo" }, g));

  // the glass: dashed drops to the card, its rim, its lens with two glints, and the handle nearer the viewer
  const grp = mk("g", { "data-tone": "red" }, g);
  const drop = mk("path", { class: "nf dash" }, grp), rim = solid(grp);
  const lens = mk("path", { "data-part": "glass" }, grp), glint = mk("path", { class: "nf lo" }, grp);
  const hand = solid(grp);

  const sx = spring(REST[0]), sy = spring(REST[1]);
  let last = "";
  function draw() {
    const x = sx.x, y = sy.x, key = x.toFixed(2) + "," + y.toFixed(2) + "," + hover;
    if (key === last) return;
    last = key;
    const z = TOP + hover, o = at(circ(R, 40), x, y);
    drop.setAttribute("d", extremes(P, o).slice(0, 2).map((q) => seg(P(q.u, q.v, TOP), P(q.u, q.v, z))).join(""));
    put(rim, prism(P, front, o, at(circ(RI, 40), x, y), z, z + 3));
    lens.setAttribute("d", poly(ringAt(P, at(circ(RI, 40), x, y), z + 3)));
    glint.setAttribute("d", [[-4, 6.5], [-0.5, 4]].map(([d, h]) => seg(P(x - h + d, y + d - 3, z + 3), P(x + h + d, y + d - 3 - h, z + 3))).join(""));
    const [ho, hi] = [rrect(x + R - 1, y - 3, x + R + HAND, y + 3, 3, 4), rrect(x + R, y - 2, x + R + HAND - 1, y + 2, 2, 4)];
    put(hand, prism(P, front, ho, hi, z, z + 3));
  }

  const B = register(stage, (dt) => {
    const moving = stepS(sx, dt) | stepS(sy, dt);
    draw();
    return !!moving;
  });
  bag.add(B.unregister);

  // the line under the glass's target, never under the glass on screen
  const lineAt = (x, y) => LINES.findIndex(([v, len]) => Math.abs(y - v) < 4.5 && x > U0 - 4 && x < U0 + len + 4);

  let act = -2, on = false;
  function show(a) {
    if (a === act && on === (a > -2)) return;
    lines.forEach((el, k) => el.setAttribute("class", "nf " + (k === a ? "hi" : "lo")));
    rim.sil.classList.toggle("hi", a < 0);
    act = a;
  }
  function aim(p) {
    if (!p) { sx.t = REST[0]; sy.t = REST[1]; grp.classList.remove("is-on"); show(-1); read.textContent = "rest"; B.wake(); return; }
    const [x, y] = unproj(C, p[0], p[1], TOP);
    sx.t = clamp(x, 8, CW - 4); sy.t = clamp(y, 6, CH - 4);
    const a = lineAt(sx.t, sy.t);
    grp.classList.add("is-on"); show(a);
    read.textContent = a < 0 ? "busca" : "linha " + (a + 1);
    B.wake();
  }
  aim(null);

  bag.add(pointer(stage, { move: aim, leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { hover = v; last = ""; B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "lupa",
  means: "Uma pilha de fichas e uma lupa: a lupa segue o ponteiro sobre a ficha de cima e acende a linha que encontra.",
  rules: [1, 4, 5, 8],
  range: [6, 12, 20],
  tour: [[198, 119], [183, 142], [144, 139], null],
  mount,
});
