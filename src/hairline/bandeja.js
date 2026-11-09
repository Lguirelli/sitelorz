/**
 * Bandeja: five pages of a website standing in a tray, each known by its
 * layout: a hero (home), three cards (serviços), a portrait and lines
 * (sobre), a list of posts (blog), a form and its button (contato). The page
 * under the pointer stands up and lifts; the ones in front lean forward, the
 * ones behind lean back, staggered outwards from it. At rest they lean back
 * together and the home page's hero is bright. The slider is the lift.
 *
 * The pattern: one of many. Tweens with a stagger by distance; the pick reads
 * the pages' resting top edges, which never move.
 */
const {
  Cam, circ, clamp, facing, fillet, fit, poly, prism, proj, rad, rings, rrect, seg,
  tset, tval, tdone, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 5, W = 84, H = 60, G = 17, TK = 1.4, REST = -14, BACK = -26, FWD = 18, STAG = 45;
const Y0 = -12, Y1 = (N - 1) * G + 12, X0 = -8, X1 = W + 8;
const NAMES = ["contato", "blog", "sobre", "serviços", "home"]; // back to front
const TONES = ["red", "navy", "cream", "orange", "paper"]; // data-tone: the page fills each page in its own colour
const SHAPE = fillet([[0, 0], [W, 0], [W, H], [0, H]], [2, 2, 4, 4]);

/** A page's own layout, in its plane (u across, v up): [[points, closed]], the head rule first. */
function layout(k) {
  const box = (a, b, c, d, r = 2.5) => [rrect(a, b, c, d, r, 3).map((q) => [q.u, q.v]), true];
  const line = (a, b, c) => [[[a, b], [c, b]], false];
  const head = line(5, H - 9, W - 5);
  if (k === 4) return [head, box(6, 24, W - 6, H - 14, 3), line(6, 16, W - 22), line(6, 10, W - 40)];
  if (k === 3) return [head, box(6, 22, 28, H - 14), box(31, 22, 53, H - 14), box(56, 22, W - 6, H - 14), line(6, 12, W - 30)];
  if (k === 2) return [head, [circ(10, 12).map((q) => [20 + q.u, 30 + q.v]), true], line(36, 38, W - 6), line(36, 30, W - 12), line(36, 22, W - 24)];
  if (k === 1) return [head, box(6, 34, W - 6, 43), box(6, 22, W - 6, 31), box(6, 10, W - 6, 19)];
  return [head, box(6, 34, W - 6, 42), box(6, 22, W - 6, 30), box(W - 34, 8, W - 6, 16, 4)];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value;

  const C = Cam(45, 0.5, 1.72);
  fit(C, [[X0, Y0, -6], [X1, Y1, -6], [X1, Y0, 0], [X0, Y1, 0], [X0, Y0, H + 26], [X1, Y0, H + 26]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the tray: its floor, a back rail before the pages and a front rail after them
  const [fo, fi] = rings(X0, Y0, X1, Y1, 9, 2);
  put(solid(g), prism(P, front, fo, fi, -6, 0));
  const [bo, bi] = rings(X0 + 3, Y0 + 3, X1 - 3, Y0 + 8, 2.5, 0.8);
  put(solid(g), prism(P, front, bo, bi, 0, 9));

  const pages = NAMES.map((name, i) => {
    const grp = mk("g", { "data-tone": TONES[i] }, g);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
    const lines = layout(i).map((_, k) => mk("path", { class: k === 0 ? "nf" : "nf lo" }, grp));
    return { name, i, back, face, lines, a: tween(REST), z: tween(0), last: "" };
  });
  const [ro, ri] = rings(X0 + 3, Y1 - 8, X1 - 3, Y1 - 3, 2.5, 0.8);
  put(solid(g), prism(P, front, ro, ri, 0, 12));
  // the tray's mark: a finger pull set into the front rail
  mk("path", { d: poly(rrect(W / 2 - 10, 4, W / 2 + 10, 8, 2, 4).map((q) => P(q.u, Y1 - 3, q.v))), class: "nf lo" }, g);

  function draw(pg, th, z) {
    const key = th.toFixed(2) + "," + z.toFixed(2);
    if (key === pg.last) return;
    pg.last = key;
    const yb = pg.i * G, s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = ([u, v]) => P(u, yb + v * s, v * c + z);
    const wb = ([u, v]) => P(u, yb + v * s - TK * c, v * c + TK * s + z);
    pg.back.setAttribute("d", poly(SHAPE.map(wb)));
    pg.face.setAttribute("d", poly(SHAPE.map(w)));
    layout(pg.i).forEach(([pts, closed], k) => pg.lines[k].setAttribute("d", closed ? poly(pts.map(w)) : seg(w(pts[0]), w(pts[1]))));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    pages.forEach((pg) => { draw(pg, tval(pg.a, now), tval(pg.z, now)); if (!tdone(pg.a, now) || !tdone(pg.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit: each page's top edge in its RESTING pose, which never moves; the nearest within reach wins
  const tops = pages.map((pg) => P(W / 2, pg.i * G + H * Math.sin(rad(REST)), H * Math.cos(rad(REST))));
  const half = (P(W, 0, 0)[0] - P(0, 0, 0)[0]) / 2 + 12;
  function hit([x, y]) {
    let best = -1, bd = 16;
    tops.forEach(([tx, ty], i) => { const d = Math.abs(y - (ty + (x - tx) * 0.5)); if (Math.abs(x - tx) < half && y > ty - 14 && d < bd) { bd = d; best = i; } });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(act, 0);
    act = a;
    pages.forEach((pg) => {
      const delay = Math.abs(pg.i - from) * STAG;
      tset(pg.a, a < 0 ? REST : pg.i < a ? BACK : pg.i > a ? FWD : 0, now, delay);
      tset(pg.z, a === pg.i ? lift : 0, now, delay);
      pg.face.classList.toggle("hi", pg.i === a);
      pg.lines[0].classList.toggle("hi", pg.i === a);
    });
    pages[N - 1].lines[1].setAttribute("class", a < 0 ? "nf hi" : "nf lo");
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { lift = clamp(v, 0, 26); if (act >= 0) { const a = act; act = -2; setActive(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "bandeja",
  means: "As páginas de um site numa bandeja: a página sob o ponteiro se ergue e as vizinhas se inclinam, uma após a outra.",
  rules: [1, 2, 8, 10],
  range: [8, 16, 24],
  tour: [[160, 120], [215, 150], [250, 185], null],
  mount,
});
