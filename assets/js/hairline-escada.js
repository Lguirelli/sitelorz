/**
 * Escada: four steps climbing from the near left to the far right on a board,
 * one stage of hiring each, with a marker puck on every tread. The step under
 * the pointer lifts its marker off the tread and lights it; the markers on the
 * other steps lift a little after it, staggered by distance. At rest the last
 * marker floats above the top step: where the way arrives. The slider is the
 * lift.
 *
 * Each marker carries data-tone and its group is-on when chosen, so the site
 * can fill it in its own colour (lorz.css, .lz-nodes__stage).
 */
const { Cam, circ, clamp, extremes, facing, fit, prism, proj, rings, seg, unproj, tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid } = HL;

const BOARD = [-12, -118, 70, 12], ZB = 4, W = 58, D = 26, H = 18, R = 7.5, MH = 4;
const STEPS = [
  { name: "conversa", tone: "orange", rest: 0 },
  { name: "diagnostico", tone: "orange", rest: 0 },
  { name: "proposta", tone: "orange", rest: 0 },
  { name: "execucao", tone: "red", rest: 7 },
];
const at = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
const top = (k) => (k + 1) * H, cy = (k) => -(k + 0.5) * D;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;

  const C = Cam(45, 0.5, 1.9);
  fit(C, [[BOARD[0], BOARD[1], -ZB], [BOARD[2], BOARD[3], -ZB], [BOARD[2], BOARD[1], 0], [BOARD[0], BOARD[3], 0], [0, -4 * D, top(3) + 28 + MH], [W, -4 * D, top(3)]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const [bo, bi] = rings(...BOARD, 9, 2);
  put(solid(g), prism(P, front, bo, bi, -ZB, 0));

  // the steps from the far top one to the near first one, each with its marker painted before the step in front of it
  const marks = [];
  for (let k = 3; k >= 0; k--) {
    const [o, i] = rings(0, -(k + 1) * D, W, -k * D, 3, 1.6);
    put(solid(g), prism(P, front, o, i, 0, top(k)));
    const s = STEPS[k], grp = mk("g", { "data-tone": s.tone }, g);
    const ring = at(circ(R, 32), W / 2, cy(k)), inner = at(circ(R - 1.4, 32), W / 2, cy(k));
    const drop = mk("path", { class: "nf dash" }, grp), sol = solid(grp);
    const dot = mk("circle", { r: 1.6, class: "dot off" }, grp);
    marks[k] = { k, s, grp, ring, inner, drop, sol, dot, z: tween(s.rest), last: NaN };
  }

  function draw(m, z) {
    if (z === m.last) return;
    m.last = z;
    const z0 = top(m.k) + z;
    put(m.sol, prism(P, front, m.ring, m.inner, z0, z0 + MH));
    m.drop.setAttribute("d", z > 0.5 ? extremes(P, m.ring).slice(0, 2).map((q) => seg(P(q.u, q.v, top(m.k)), P(q.u, q.v, z0))).join("") : "");
    place(m.dot, P(W / 2, cy(m.k), z0 + MH));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    marks.forEach((m) => { draw(m, tval(m.z, now)); if (!tdone(m.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: the pointer on each step's own resting tread; the tread that holds it wins
  function hit([sx, sy]) {
    for (let k = 0; k < 4; k++) {
      const [x, y] = unproj(C, sx, sy, top(k));
      if (x > -2 && x < W + 2 && y > -(k + 1) * D - 1 && y < -k * D + 1) return k;
    }
    return -1;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(act, 0);
    act = a;
    marks.forEach((m) => {
      const to = a < 0 ? m.s.rest : m.k === a ? lift : clamp(lift * 0.3, 0, 8);
      tset(m.z, to, now, Math.abs(m.k - from) * 45);
      m.sol.sil.classList.toggle("hi", m.k === a || (a < 0 && m.k === 3));
      m.grp.classList.toggle("is-on", m.k === a);
      m.dot.setAttribute("class", "dot" + (m.k === a ? "" : " off"));
    });
    read.textContent = a < 0 ? "rest" : STEPS[a].name;
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
  name: "escada",
  means: "Quatro degraus, uma etapa da contratação em cada: o marco do degrau sob o ponteiro sobe e acende.",
  rules: [1, 2, 4, 5],
  range: [12, 20, 28],
  tour: [[146, 234], [216, 139], [251, 92], null],
  mount,
});
