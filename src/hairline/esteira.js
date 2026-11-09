/**
 * Esteira: a conveyor carries order tickets out of an intake hood, under a
 * sorting arch and into a filing cabinet. Before the arch the tickets lie
 * askew; under it they are straightened, and they leave it in line. The belt
 * always runs; hovering it slows the line so one ticket can be followed, and
 * that ticket takes the bright edge. At rest the arch is bright. The slider
 * is the belt's speed, in world units per second.
 *
 * The pattern: dilate time. An ambient loop with a spring on the rate.
 */
const {
  Cam, clamp, facing, fit, lerp, poly, prism, proj, rings, rrect, seg, spring, stepS, unproj,
  disposer, mk, place, pointer, put, register, solid,
} = HL;

const BX0 = -20, BX1 = 190, BW = 30, BZ = 7, TZ = BZ, TK = 1.4;
const NT = 6, SP = 32, LOOP = NT * SP, XS = -12, ARCH = 85, IN1 = 8, OUT0 = 160;
const TILT = [16, -12, 22, -18, 9, -20], SHIFT = [3, -4, 2, -3, 4, -2];
const STAGE = (x) => (x < ARCH - 9 ? "entrada" : x < ARCH + 9 ? "triagem" : "organizado");

/** A rounded ticket footprint turned by deg about its centre and set at (cx, cy): [ring, inner]. */
function ticketRings(cx, cy, deg) {
  const a = (deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
  const turn = (ring) => ring.map((q) => ({ u: cx + q.u * co - q.v * si, v: cy + q.u * si + q.v * co, nu: q.nu * co - q.nv * si, nv: q.nu * si + q.nv * co }));
  return [turn(rrect(-8, -10, 8, 10, 3, 4)), turn(rrect(-7, -9, 7, 9, 2, 4))];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let speed = value;

  const C = Cam(45, 0.5, 1.42);
  fit(C, [[-30, -14, -6], [200, 44, -6], [200, -14, 0], [-30, 44, 0], [-24, -6, 28], [194, -6, 30]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  // data-tone: the page fills each part in its own colour
  const box = (parent, x0, y0, x1, y1, r, b, z0, z1, tone) => { const s = solid(parent); if (tone) s.g.setAttribute("data-tone", tone); const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); return s; };

  // plinth and belt, then the slats that show the belt running
  box(g, -30, -14, 200, 44, 10, 2.2, -6, 0);
  box(g, BX0, 0, BX1, BW, 12, 1.6, 0, BZ, "navy");
  const slats = mk("path", { class: "nf lo" }, g);
  // the far walls and post, behind the tickets
  box(g, -24, -6, IN1, -1, 2, 0.8, 0, 10);
  box(g, ARCH - 5, -7, ARCH + 5, -1, 2, 0.8, 0, 30, "red");
  box(g, OUT0, -6, 194, -1, 2, 0.8, 0, 10);

  const tickets = Array.from({ length: NT }, (_, k) => {
    const grp = mk("g", { "data-tone": "paper" }, g), el = solid(grp), lines = mk("path", { class: "nf lo" }, grp);
    return { k, el, lines, x: 0, last: NaN };
  });

  // the near walls and post, the arch's lintel, then the two hoods above the belt
  box(g, -24, BW + 1, IN1, BW + 6, 2, 0.8, 0, 10);
  box(g, ARCH - 5, BW + 1, ARCH + 5, BW + 7, 2, 0.8, 0, 30, "red");
  const lintel = box(g, ARCH - 7, -7, ARCH + 7, BW + 7, 2.5, 1, 30, 36, "red");
  place(mk("circle", { r: 1.6, class: "dot m" }, g), P(ARCH, BW + 7, 33));
  box(g, OUT0, BW + 1, 194, BW + 6, 2, 0.8, 0, 10);
  box(g, -24, -6, IN1, BW + 6, 5, 1.6, 10, 28, "orange");
  mk("path", { d: poly(rrect(-17, 4, 1, 26, 3, 4).map((q) => P(q.u, q.v, 28))), class: "nf lo" }, g);
  box(g, OUT0, -6, 194, BW + 6, 5, 1.6, 10, 30, "cream");
  // the cabinet's two drawers and their pulls, on its near face
  const face = (u0, z0, u1, z1) => poly(rrect(u0, z0, u1, z1, 2, 3).map((q) => P(q.u, BW + 6, q.v)));
  mk("path", { d: face(OUT0 + 6, 13, 188, 19.5) + face(OUT0 + 6, 22, 188, 28), class: "nf lo" }, g);
  [16.2, 25].forEach((z) => place(mk("circle", { r: 1.2, class: "dot off" }, g), P(177, BW + 6, z)));

  const rate = spring(1, { eps: 0.002 });
  let phase = 0, over = null, act = -2;

  function drawTicket(t) {
    if (t.x === t.last) return;
    t.last = t.x;
    const m = clamp((t.x - (ARCH - 11)) / 22, 0, 1), tilt = lerp(TILT[t.k], 0, m), dy = lerp(SHIFT[t.k], 0, m);
    const [ring, inner] = ticketRings(t.x, BW / 2 + dy, tilt);
    put(t.el, prism(P, front, ring, inner, TZ, TZ + TK));
    const a = (tilt * Math.PI) / 180, w = (u, v) => P(t.x + u * Math.cos(a) - v * Math.sin(a), BW / 2 + dy + u * Math.sin(a) + v * Math.cos(a), TZ + TK);
    t.lines.setAttribute("d", seg(w(-4, -6), w(-4, 6)) + seg(w(0, -6), w(0, 3)) + seg(w(4, -6), w(4, 5)));
  }

  function pick() {
    let a = -1;
    if (over) {
      let bd = SP / 2;
      tickets.forEach((t) => { const d = Math.abs(t.x - over[0]); if (t.x > IN1 && t.x < OUT0 && d < bd) { bd = d; a = t.k; } });
    }
    if (a === act) return;
    act = a;
    tickets.forEach((t) => t.el.sil.classList.toggle("hi", t.k === a));
    lintel.sil.classList.toggle("hi", a < 0);
    read.textContent = a < 0 ? "rest" : `pedido ${1041 + a} · ${STAGE(tickets[a].x)}`;
  }

  let lastStage = "", lastOrder = "";
  const B = register(stage, (dt) => {
    stepS(rate, dt);
    phase = (phase + speed * rate.x * dt) % LOOP;
    tickets.forEach((t) => { t.x = XS + ((t.k * SP + LOOP - phase) % LOOP); });
    // wrapped tickets come out of the intake in front of those that went in at the end: keep them in x order
    const order = tickets.slice().sort((p, q) => p.x - q.x), key = order.map((t) => t.k).join("");
    if (key !== lastOrder) { lastOrder = key; order.forEach((t, i) => { if (i) order[i - 1].el.g.parentNode.after(t.el.g.parentNode); }); }
    tickets.forEach(drawTicket);
    let d = "";
    for (let j = 0; j < 18; j++) { const x = BX0 + ((j * 12 + LOOP * 2 - phase) % 216); if (x > IN1 + 2 && x < OUT0 - 2) d += seg(P(x, 3, BZ), P(x, BW - 3, BZ)); }
    slats.setAttribute("d", d);
    pick();
    if (act >= 0) { const s = STAGE(tickets[act].x); if (s !== lastStage) { lastStage = s; read.textContent = `pedido ${1041 + act} · ${s}`; } }
    return true;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: (p) => {
      const w = unproj(C, p[0], p[1], TZ);
      over = w[1] > -10 && w[1] < BW + 10 && w[0] > IN1 - 6 && w[0] < OUT0 + 6 ? w : null;
      rate.t = over ? 0.12 : 1;
      B.wake();
    },
    leave: () => { over = null; rate.t = 1; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { speed = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "esteira",
  means: "Uma esteira leva pedidos tortos por uma triagem que os alinha até o arquivo; o ponteiro desacelera para acompanhar um.",
  rules: [6, 7, 8, 4],
  range: [10, 22, 36],
  tour: [[150, 150], [205, 165], [255, 195], null],
  mount,
});
