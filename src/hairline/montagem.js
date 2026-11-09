/**
 * Montagem: a website taken apart in layers above a plinth: the page with its
 * title bar, the section bands, the content cards and, floating highest, the
 * contact button. The pointer's x scrubs the gap between the layers, from a
 * site assembled flat to one exploded; its height picks the layer that takes
 * the bright edge. At rest the stack sits slightly apart and the contact
 * button is bright. The slider is the widest gap, in world units.
 *
 * The pattern: scrub and pick. One spring for the gap; the pick is read
 * against the layers' heights at the spring's target, never as drawn.
 */
const {
  Cam, clamp, extremes, facing, fit, lerp, poly, prism, proj, ringAt, rings, rrect, seg, spring, stepS,
  disposer, mk, place, pointer, put, register, solid,
} = HL;

const X1 = 120, Y1 = 88, TK = 2.4, GMIN = 3, GREST = 17;
// each layer: its name, footprint, corner, the height factor (the top one floats a little more) and its marks
const LAYERS = [
  { name: "página", box: [0, 0, X1, Y1], r: 7, f: 1, tone: "navy" },
  { name: "seções", box: [4, 4, X1 - 4, Y1 - 4], r: 6, f: 2, tone: "cream" },
  { name: "conteúdo", box: [8, 8, X1 - 8, Y1 - 8], r: 6, f: 3, tone: "orange" },
  { name: "contato", box: [62, 58, 110, 78], r: 10, f: 4.4, tone: "red" },
];

/** The marks a layer would really have, on its top face at height z: [d, class] pairs. */
function marks(P, i, z) {
  const on = (box, r) => poly(ringAt(P, rrect(...box, r, 4), z));
  const line = (a, b, c, d) => seg(P(a, b, z), P(c, d, z));
  if (i === 0) return [[line(3, 13, X1 - 3, 13), "nf"], [on([30, 4, 92, 9], 2.5), "nf lo"]];
  if (i === 1) return [[on([12, 18, 108, 38], 3) + on([12, 43, 108, 58], 3) + on([12, 63, 108, 76], 3), "nf lo"]];
  if (i === 2) return [[on([14, 16, 42, 46], 3) + on([46, 16, 74, 46], 3) + on([78, 16, 106, 46], 3), "nf lo"],
    [line(14, 56, 96, 56) + line(14, 63, 78, 63) + line(14, 70, 60, 70), "nf lo"]];
  return [[on([70, 64, 102, 72], 4), "nf lo"]];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gmax = value;

  // fitted to the widest gap the slider can give, so nothing leaves the frame at intensity 1
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-8, -8, -6], [X1 + 8, Y1 + 8, -6], [X1 + 8, -8, 0], [-8, Y1 + 8, 0], [0, 0, 26 * 4.4 + TK], [X1, 0, 26 * 4.4 + TK]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const [bo, bi] = rings(-8, -8, X1 + 8, Y1 + 8, 10, 2.2);
  put(solid(g), prism(P, front, bo, bi, -6, 0));
  // the plinth's own mark: four feet where the layers would seat
  const seat = mk("path", { class: "nf lo" }, g);
  seat.setAttribute("d", [[4, 4], [X1 - 4, 4], [4, Y1 - 4], [X1 - 4, Y1 - 4]].map(([u, v]) => seg(P(u - 3, v, 0), P(u + 3, v, 0))).join(""));

  // bottom layer first: a higher layer covers the one under it
  const layers = LAYERS.map((L, i) => {
    // data-tone: the page fills each layer in its own colour
    const grp = mk("g", { "data-tone": L.tone }, g);
    const [ring, inner] = rings(...L.box, L.r, 1.2);
    const drop = mk("path", { class: "nf dash" }, grp), el = solid(grp);
    const mk2 = marks(P, i, 0).map(([, cls]) => mk("path", { class: cls }, grp));
    const dots = i === 0 ? [9, 15, 21].map((u, k) => ({ el: mk("circle", { r: 1.3, class: "dot " + (k ? "off" : "m") }, grp), u, v: 6.5 }))
      : i === 3 ? [{ el: mk("circle", { r: 1.5, class: "dot m" }, grp), u: 98, v: 68 }] : [];
    return { L, i, ring, inner, ext: extremes(P, ring), drop, el, mk2, dots };
  });

  const gap = spring(GREST, { eps: 0.02 });
  let drawn = NaN;
  const zOf = (i, gp) => LAYERS[i].f * gp;

  function draw(gp) {
    if (gp === drawn) return;
    drawn = gp;
    layers.forEach((ly) => {
      const z = zOf(ly.i, gp), below = ly.i === 0 ? 0 : zOf(ly.i - 1, gp) + TK;
      put(ly.el, prism(P, front, ly.ring, ly.inner, z, z + TK));
      ly.drop.setAttribute("d", z - below > 1.5 ? ly.ext.map((s) => seg(P(s.u, s.v, z), P(s.u, s.v, below))).join("") : "");
      marks(P, ly.i, z + TK).forEach(([d], k) => ly.mk2[k].setAttribute("d", d));
      ly.dots.forEach((dt) => place(dt.el, P(dt.u, dt.v, z + TK)));
    });
  }

  const B = register(stage, (dt) => { const m = stepS(gap, dt); draw(Math.max(GMIN * 0.5, gap.x)); return m; });
  bag.add(B.unregister);

  // the scrub runs across the figure's own width on screen
  const xl = P(0, Y1, 0)[0], xr = P(X1, 0, 0)[0];
  const centre = (i, gp) => { const [a, b, c, d] = LAYERS[i].box; return P((a + c) / 2, (b + d) / 2, zOf(i, gp) + TK)[1]; };

  /** The layer whose centre, at the gap the spring is heading for, is nearest the pointer's height; -1 when none is near. */
  function hit(sy, gp) {
    let best = -1, bd = 40;
    LAYERS.forEach((_, i) => { const d = Math.abs(sy - centre(i, gp)); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  let act = -2;
  function setActive(a) {
    if (a === act) return;
    act = a;
    layers.forEach((ly) => ly.el.sil.classList.toggle("hi", a < 0 ? ly.i === 3 : ly.i === a));
    read.textContent = a < 0 ? "rest" : LAYERS[a].name;
  }
  setActive(-1);

  function move([sx, sy]) {
    const u = clamp((sx - xl) / (xr - xl), 0, 1);
    gap.t = lerp(GMIN, gmax, u);
    setActive(sx < xl - 30 || sx > xr + 30 ? -1 : hit(sy, gap.t));
    B.wake();
  }
  let last = null;
  bag.add(pointer(stage, {
    move: (p) => { last = p; move(p); },
    leave: () => { last = null; gap.t = GREST; setActive(-1); B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gmax = v; if (last) move(last); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "montagem",
  means: "Um site separado em camadas: o ponteiro abre o espaço entre elas e escolhe a camada que acende.",
  rules: [1, 3, 5, 6],
  range: [14, 20, 26],
  tour: [[120, 230], [290, 70], [250, 170], null],
  mount,
});
