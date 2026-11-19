/* hairline kernel sha256:346b48bdef2cdfafd5343eba01494255cf75f9c078e6fcd1aafc62bab62980a1 */
/*
 * HL: everything a figure may call. Read this index; the code under it is the
 * package's src/core, unchanged, and a figure should not need to read it.
 *
 * Every figure is drawn in a 400 × 320 viewBox. World space is x/y on the
 * ground and z up. Plates are filled with the ground colour and painted back
 * to front, so a nearer one covers a farther one: append in that order. At
 * the default camera, Cam(45, 0.5, S), +x runs down to the right and +y down
 * to the left, so the corner with the largest x and y is nearest the viewer:
 * append by ascending x + y, from the far corner (smallest x and y) to it.
 *
 * Camera
 *   Cam(azDeg, k, S)                       a camera: azimuth in degrees, k = sin(elevation) (0.5 is the 2:1 view), S = scale
 *   fit(C, points, cx, cy)                 centres the box of [x, y, z] points on (cx, cy); call it once, before proj
 *                                          it only centres, it never scales: choose S by trying values, with the most extreme pose in points.
 *                                          The six figures use S 1.42 to 2.12; the boxes they fit come out 230 to 310 wide and 180 to 245 tall
 *   proj(C)                                returns P(x, y, z), which gives [sx, sy]
 *   unproj(C, sx, sy, z)                   the world [x, y] under a screen point, on the plane at height z
 *   facing(C)                              returns front(sample): whether a ring sample faces the camera
 * Rounded solids
 *   rrect(u0, v0, u1, v1, r, n)            a rounded rectangle, as a ring of samples {u, v, nu, nv}
 *   circ(R, n)                             a circle, as a ring
 *   rings(x0, y0, x1, y1, r, b)            [ring, inner]: a rounded footprint and its crease ring, inset by b
 *                                          r, the corner radius, is cut to half the shorter side. b, the crease's inset in world units
 *                                          (0.6 to 2.2 in the figures), must stay under half the shorter side or the crease turns inside out
 *   prism(P, front, ring, inner, z0, z1)   {sil, crease}: a solid standing from z0 to z1, as two path strings
 *   ringAt(P, ring, z)                     the ring's points, projected at height z
 *   run(ring, keep)                        the one cyclic run of samples that pass keep
 *   hull(points)                           the convex hull of screen points
 *   extremes(P, ring)                      [left, right, nearest] samples: where dashed drops fall from
 *   fillet(points, radii, n)               rounds every vertex of a closed polygon; returns the new points
 *                                          radii is an array, one radius per vertex, each cut to half its shorter edge; a single number gives NaN.
 *                                          n is the steps round each corner, default 4: each vertex becomes n + 1 points
 *   ghost(P, front, ring, z0, depth)       a reflection's path {d, y0, y1}; reflect() draws it for you
 * Paths and numbers
 *   poly(points)                           a closed path string
 *   open(points)                           an open polyline string
 *   seg(a, b)                              one segment between two screen points [sx, sy], as its own subpath; project world points with P first
 *   clamp(v, a, b)
 *   lerp(a, b, t)
 *   rad(deg)
 *   r2(n)                                  two decimals
 * The continuous clock: one spring per moving number
 *   spring(x, opts)                        at rest on x; write .t to retarget; opts {k, c, m, eps}, default k 100, c 18, m 1
 *   stepS(sp, dt)                          advances by dt seconds; returns whether it is still moving
 * The discrete clock: a 700ms tween on (.32, .72, 0, 1)
 *   tween(v, dur)                          at rest on v; dur defaults to 700 (ms)
 *   tset(tw, to, now, delay)               retargets from where it is, after delay ms: the stagger
 *                                          the same target again does nothing, so calling it on every pointer move is safe
 *   tval(tw, now)                          its value at now
 *   tdone(tw, now)                         whether it has landed
 *   bezier(x1, y1, x2, y2)                 a CSS cubic-bezier, as a function of progress
 *   EASE_LIFT                              the lift curve itself
 *   reducedMotion()                        true when the reader asked for less motion; springs and tweens already land at once
 *   setReducedMotion(on)                   the loop's business, not a figure's
 * Drawing
 *   mk(tag, attrs, parent)                 one svg element: the only way a figure makes a node
 *   solid(parent)                          {g, sil, cr}: a group holding a silhouette path and a crease path
 *   put(solid, paths)                      writes prism()'s {sil, crease} into solid()'s {sil, cr}: sil into sil, crease into cr
 *   flatDot(parent, C, r, cls)             a dot lying on the ground plane; cls is "dot", "dot m" or "dot off"
 *   place(el, point)                       moves a dot or a circle to [sx, sy]
 *   reflect(svg, parent, P, front, ring, z0, depth)   a fading mirror under a solid
 *   fade(svg, y0, y1, a0)                  a vertical fade, as a mask; returns the value for a mask attribute
 * Life
 *   register(stage, tick)                  joins the one frame loop; tick(dt in seconds, now in ms) returns true to ask for another frame; gives {wake, unregister}
 *   pointer(stage, handlers)               {move(point), down(point), leave()}, points in viewBox units; returns its disposer
 *   disposer()                             {add, on, dispose}: collects tear-down, so destroy is bag.dispose
 * The bench's business, not a figure's
 *   css(lightDark)
 *   inject(root)
 *   tour(stage, stops, onStop)             an unseen pointer that walks the stops, [x, y] in viewBox units or null to leave, and gives way to a real one; onStop(i) on each arrival; returns {stop}
 *   LAP                                    the default stops: a diamond around the centre, then a leave
 *
 * Classes, on path, polygon, ellipse and line. They are the whole palette; a
 * figure sets no colour, width or fill of its own.
 *     (none)   filled with the ground colour, medium stroke
 *     sil      the silhouette's stroke        hi    the bright stroke: the only highlight
 *     lo       the dim stroke                 nf    no fill        fo   fill only, no stroke
 *     dash     a dashed guide
 *     dot      a bright dot                   dot m   a medium dot     dot off   a dim dot
 */
var HL = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/hairline/src/core/kernel.ts
  var kernel_exports = {};
  __export(kernel_exports, {
    Cam: () => Cam,
    EASE_LIFT: () => EASE_LIFT,
    LAP: () => LAP,
    bezier: () => bezier,
    circ: () => circ,
    clamp: () => clamp,
    css: () => css,
    disposer: () => disposer,
    extremes: () => extremes,
    facing: () => facing,
    fade: () => fade,
    fillet: () => fillet,
    fit: () => fit,
    flatDot: () => flatDot,
    ghost: () => ghost,
    hull: () => hull,
    inject: () => inject,
    lerp: () => lerp,
    mk: () => mk,
    open: () => open,
    place: () => place,
    pointer: () => pointer,
    poly: () => poly,
    prism: () => prism,
    proj: () => proj,
    put: () => put,
    r2: () => r2,
    rad: () => rad,
    reducedMotion: () => reducedMotion,
    reflect: () => reflect,
    register: () => register,
    ringAt: () => ringAt,
    rings: () => rings,
    rrect: () => rrect,
    run: () => run,
    seg: () => seg,
    setReducedMotion: () => setReducedMotion,
    solid: () => solid,
    spring: () => spring,
    stepS: () => stepS,
    tdone: () => tdone,
    tour: () => tour,
    tset: () => tset,
    tval: () => tval,
    tween: () => tween,
    unproj: () => unproj
  });

  // packages/hairline/src/core/iso.ts
  var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  var lerp = (a, b, t) => a + (b - a) * t;
  var rad = (d) => d * Math.PI / 180;
  var r2 = (n) => Math.round(n * 100) / 100;
  var poly = (pts) => "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L") + "Z";
  var seg = (a, b) => `M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
  var open = (pts) => pts.length < 2 ? "" : "M" + pts.map((p) => r2(p[0]) + " " + r2(p[1])).join("L");
  var Cam = (azDeg, k, S) => ({ az: rad(azDeg), k, S, ox: 0, oy: 0 });
  function proj(C) {
    const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
    return (x, y, z) => {
      const X = x * c - y * s, Y = x * s + y * c;
      return [C.ox + C.S * X, C.oy + C.S * (Y * C.k - z * zf)];
    };
  }
  function unproj(C, sx, sy, z) {
    const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
    const X = (sx - C.ox) / C.S, Y = ((sy - C.oy) / C.S + z * zf) / C.k;
    return [X * c + Y * s, -X * s + Y * c];
  }
  function fit(C, pts, cx, cy) {
    C.ox = 0;
    C.oy = 0;
    const P = proj(C);
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (const p of pts) {
      const q = P(p[0], p[1], p[2]);
      a = Math.min(a, q[0]);
      b = Math.max(b, q[0]);
      c = Math.min(c, q[1]);
      d = Math.max(d, q[1]);
    }
    C.ox = cx - (a + b) / 2;
    C.oy = cy - (c + d) / 2;
  }
  function rrect(u0, v0, u1, v1, r, n = 4) {
    r = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
    const out = [];
    for (const [cu, cv, a0] of [[u1 - r, v1 - r, 0], [u0 + r, v1 - r, 90], [u0 + r, v0 + r, 180], [u1 - r, v0 + r, 270]])
      for (let k = 0; k <= n; k++) {
        const a = rad(a0 + 90 * k / n), ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cu + r * ca, v: cv + r * sa, nu: ca, nv: sa });
      }
    return out;
  }
  function circ(R, n = 96) {
    const out = [];
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      out.push({ u: R * ca, v: R * sa, nu: ca, nv: sa });
    }
    return out;
  }
  function hull(input) {
    const pts = input.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) {
      while (lo.length > 1 && x(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (up.length > 1 && x(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
      up.push(p);
    }
    lo.pop();
    up.pop();
    return lo.concat(up);
  }
  var ringAt = (P, ring, z) => ring.map((q) => P(q.u, q.v, z));
  var facing = (C) => {
    const s = Math.sin(C.az), c = Math.cos(C.az);
    return (q) => q.nu * s + q.nv * c >= -1e-6;
  };
  function run(ring, keep) {
    const n = ring.length;
    let s = -1;
    for (let i = 0; i < n; i++) if (keep(ring[i]) && !keep(ring[(i + n - 1) % n])) {
      s = i;
      break;
    }
    if (s < 0) return keep(ring[0]) ? ring.slice() : [];
    const out = [];
    for (let k = 0; k < n && keep(ring[(s + k) % n]); k++) out.push(ring[(s + k) % n]);
    return out;
  }
  function prism(P, front, ring, inner, z0, z1) {
    return {
      sil: poly(hull(ringAt(P, ring, z1).concat(ringAt(P, ring, z0)))),
      crease: inner ? open(ringAt(P, run(inner, front), z1)) : ""
    };
  }
  var rings = (x0, y0, x1, y1, r, b) => [
    rrect(x0, y0, x1, y1, r),
    rrect(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.3, r - b))
  ];
  function extremes(P, ring) {
    const pr = ring.map((q) => P(q.u, q.v, 0));
    let a = 0, b = 0, c = 0;
    pr.forEach((p, k) => {
      if (p[0] < pr[a][0]) a = k;
      if (p[0] > pr[b][0]) b = k;
      if (p[1] > pr[c][1]) c = k;
    });
    return [ring[a], ring[b], ring[c]];
  }
  function fillet(pts, rs, n = 4) {
    const m = pts.length, out = [];
    for (let i = 0; i < m; i++) {
      const a = pts[(i + m - 1) % m], p = pts[i], b = pts[(i + 1) % m];
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const t = Math.min(rs[i], la / 2, lb / 2);
      const p1 = [p[0] + (a[0] - p[0]) / la * t, p[1] + (a[1] - p[1]) / la * t];
      const p2 = [p[0] + (b[0] - p[0]) / lb * t, p[1] + (b[1] - p[1]) / lb * t];
      for (let k = 0; k <= n; k++) {
        const s = k / n, w = 1 - s;
        out.push([w * w * p1[0] + 2 * w * s * p[0] + s * s * p2[0], w * w * p1[1] + 2 * w * s * p[1] + s * s * p2[1]]);
      }
    }
    return out;
  }
  function ghost(P, front, ring, z0, depth) {
    const f = run(ring, front), lowP = ringAt(P, f, z0 - depth);
    return {
      d: open(lowP) + [f[0], f[f.length - 1]].map((q) => seg(P(q.u, q.v, z0), P(q.u, q.v, z0 - depth))).join(""),
      y0: Math.min(...ringAt(P, f, z0).map((p) => p[1])),
      y1: Math.max(...lowP.map((p) => p[1])) + 2
    };
  }

  // packages/hairline/src/core/motion.ts
  var reduced = false;
  var setReducedMotion = (on) => {
    reduced = on;
  };
  var reducedMotion = () => reduced;
  function spring(x, o = {}) {
    return { x, v: 0, t: x, k: o.k ?? 100, c: o.c ?? 18, m: o.m ?? 1, eps: o.eps ?? 0.01 };
  }
  function stepS(sp, dt) {
    if (reduced) {
      sp.x = sp.t;
      sp.v = 0;
      return false;
    }
    const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (let i = 0; i < n; i++) {
      const a = (-sp.k * (sp.x - sp.t) - sp.c * sp.v) / sp.m;
      sp.v += a * h;
      sp.x += sp.v * h;
    }
    if (Math.abs(sp.x - sp.t) < sp.eps && Math.abs(sp.v) < sp.eps * 10) {
      sp.x = sp.t;
      sp.v = 0;
      return false;
    }
    return true;
  }
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u) => ((ax * u + bx) * u + cx) * u;
    const Y = (u) => ((ay * u + by) * u + cy) * u;
    const dX = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let u = t;
      for (let i = 0; i < 8; i++) {
        const e = X(u) - t;
        if (Math.abs(e) < 1e-5) break;
        const d = dX(u);
        if (Math.abs(d) < 1e-6) break;
        u -= e / d;
      }
      if (!(u >= 0 && u <= 1) || Math.abs(X(u) - t) > 1e-4) {
        let lo = 0, hi = 1;
        u = t;
        for (let i = 0; i < 24; i++) {
          if (X(u) < t) lo = u;
          else hi = u;
          u = (lo + hi) / 2;
        }
      }
      return Y(u);
    };
  }
  var EASE_LIFT = bezier(0.32, 0.72, 0, 1);
  var tween = (v, dur = 700) => ({ from: v, to: v, t0: -1e9, dur });
  var tval = (tw, now) => {
    const p = clamp((now - tw.t0) / tw.dur, 0, 1);
    return tw.from + (tw.to - tw.from) * (reduced ? 1 : EASE_LIFT(p));
  };
  var tset = (tw, to, now, delay) => {
    if (tw.to === to) return;
    tw.from = tval(tw, now);
    tw.to = to;
    tw.t0 = now + delay;
  };
  var tdone = (tw, now) => reduced || now >= tw.t0 + tw.dur;

  // packages/hairline/src/core/stage.ts
  var NS = "http://www.w3.org/2000/svg";
  function mk(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, String(attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  }
  function solid(parent) {
    const g = mk("g", {}, parent);
    return { g, sil: mk("path", { class: "sil" }, g), cr: mk("path", { class: "nf lo" }, g) };
  }
  var put = (el, s) => {
    el.sil.setAttribute("d", s.sil);
    el.cr.setAttribute("d", s.crease);
  };
  var flatDot = (parent, C, r, cls) => mk("ellipse", { rx: r2(r * C.S), ry: r2(r * C.S * C.k), class: cls }, parent);
  var place = (el, q) => {
    el.setAttribute("cx", String(r2(q[0])));
    el.setAttribute("cy", String(r2(q[1])));
  };
  var fid = 0;
  function fade(svg, y0, y1, a0 = 0.7) {
    const id = "hl-fd" + ++fid, defs = mk("defs", {}, svg);
    const lg = mk("linearGradient", { id: id + "g", gradientUnits: "userSpaceOnUse", x1: 0, y1: r2(y0), x2: 0, y2: r2(y1) }, defs);
    mk("stop", { offset: 0, "stop-color": "#fff", "stop-opacity": a0 }, lg);
    mk("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": 0 }, lg);
    const m = mk("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 400, height: 320 }, defs);
    mk("rect", { x: 0, y: 0, width: 400, height: 320, fill: `url(#${id}g)` }, m);
    return `url(#${id})`;
  }
  function reflect(svg, parent, P, front, ring, z0, depth) {
    const r = ghost(P, front, ring, z0, depth);
    const gh = mk("g", { class: "ghost", mask: fade(svg, r.y0, r.y1) }, parent);
    mk("path", { d: r.d }, gh);
  }
  var boards = [];
  var byStage = /* @__PURE__ */ new Map();
  var raf = 0;
  var last = 0;
  var io = null;
  var rm = null;
  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1e3));
    last = now;
    let any = false;
    for (const b of boards.slice()) if (b.vis && b.awake) {
      try {
        b.awake = !!b.tick(dt, now);
      } catch (err) {
        b.awake = false;
        setTimeout(() => {
          throw err;
        });
      }
      any = any || b.awake;
    }
    raf = any ? requestAnimationFrame(frame) : 0;
  }
  function wake(b) {
    b.awake = true;
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  var onMotion = () => {
    setReducedMotion(!!rm?.matches);
    boards.forEach(wake);
  };
  function start() {
    if (io) return;
    io = new IntersectionObserver((es) => {
      for (const e of es) {
        const set = byStage.get(e.target);
        if (!set) continue;
        for (const b of set) {
          b.vis = e.isIntersecting;
          if (b.vis) wake(b);
        }
      }
    }, { rootMargin: "80px" });
    rm = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(rm.matches);
    rm.addEventListener("change", onMotion);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    io = null;
    rm?.removeEventListener("change", onMotion);
    rm = null;
  }
  function register(stage, tick) {
    start();
    const b = { stage, tick, vis: false, awake: true };
    boards.push(b);
    const peers = byStage.get(stage);
    if (peers) {
      for (const p of peers) b.vis = p.vis;
      peers.add(b);
      if (b.vis) wake(b);
    } else {
      byStage.set(stage, /* @__PURE__ */ new Set([b]));
      io.observe(stage);
    }
    tick(0, performance.now());
    let gone = false;
    return {
      wake: () => {
        if (!gone) wake(b);
      },
      unregister: () => {
        if (gone) return;
        gone = true;
        boards = boards.filter((x) => x !== b);
        const set = byStage.get(stage);
        if (set) {
          set.delete(b);
          if (!set.size) {
            byStage.delete(stage);
            io?.unobserve(stage);
          }
        }
        if (!boards.length) stop();
      }
    };
  }
  var handlers = /* @__PURE__ */ new WeakMap();
  var touring = /* @__PURE__ */ new WeakMap();
  function pointer(stage, on) {
    handlers.set(stage, on);
    let tm = 0;
    const pt = (e) => {
      const r = stage.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 400, (e.clientY - r.top) / r.height * 320];
    };
    const move = (e) => {
      clearTimeout(tm);
      touring.get(stage)?.hold();
      on.move(pt(e), e);
    };
    const down = (e) => {
      clearTimeout(tm);
      touring.get(stage)?.hold();
      if (e.pointerType !== "mouse") stage.releasePointerCapture?.(e.pointerId);
      if (on.down) on.down(pt(e), e);
      else on.move(pt(e), e);
    };
    const leave = (e) => {
      clearTimeout(tm);
      tm = window.setTimeout(() => {
        on.leave(e);
        touring.get(stage)?.release();
      }, e.pointerType === "mouse" ? 0 : 1400);
    };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointerleave", leave);
    return () => {
      clearTimeout(tm);
      if (handlers.get(stage) === on) handlers.delete(stage);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointerleave", leave);
    };
  }
  var LAP = [[128, 150], [200, 118], [272, 150], [200, 206], null];
  var TRAVEL = 900;
  var DWELL = 1200;
  var REST = 1800;
  var RESUME = 1200;
  var STAGGER = 450;
  var GHOST = { pointerType: "ghost" };
  var started = 0;
  function entry([x, y]) {
    const dx = x - 200, dy = y - 160;
    if (!dx && !dy) return [200, 320];
    const k = Math.min(dx ? (dx > 0 ? 200 : -200) / dx : Infinity, dy ? (dy > 0 ? 160 : -160) / dy : Infinity);
    return [200 + dx * k, 160 + dy * k];
  }
  function tour(stage, stops, onStop) {
    let i = 0;
    let wait = RESUME + STAGGER * (started++ % 4);
    let t = -1;
    let at = null;
    let origin = [200, 320];
    let hand = false, keys = stage.contains(stage.ownerDocument.activeElement);
    let gone = false;
    const leave = () => {
      at = null;
      t = -1;
      handlers.get(stage)?.leave(GHOST);
    };
    const tick = (dt) => {
      if (hand || keys || !stops.length) return false;
      if (reducedMotion()) {
        if (at) leave();
        return false;
      }
      if (wait > 0) {
        wait -= dt * 1e3;
        return true;
      }
      const stop2 = stops[i];
      if (stop2 === null) {
        if (at) leave();
        onStop?.(i);
        i = (i + 1) % stops.length;
        wait = REST;
        return true;
      }
      const h = handlers.get(stage);
      if (!h) return true;
      if (t < 0) {
        origin = at ?? entry(stop2);
        t = 0;
      }
      t = Math.min(TRAVEL, t + dt * 1e3);
      const k = EASE_LIFT(t / TRAVEL);
      at = [origin[0] + (stop2[0] - origin[0]) * k, origin[1] + (stop2[1] - origin[1]) * k];
      h.move(at, GHOST);
      if (t < TRAVEL) return true;
      onStop?.(i);
      i = (i + 1) % stops.length;
      t = -1;
      wait = DWELL;
      return true;
    };
    const take = () => {
      at = null;
      t = -1;
    };
    const give = () => {
      if (hand || keys) return;
      i = 0;
      t = -1;
      wait = RESUME;
      board.wake();
    };
    const me = {
      hold: () => {
        hand = true;
        take();
      },
      release: () => {
        if (!hand) return;
        hand = false;
        give();
      }
    };
    const focusIn = () => {
      keys = true;
      take();
    };
    const focusOut = (e) => {
      if (keys && !stage.contains(e.relatedTarget)) {
        keys = false;
        give();
      }
    };
    stage.addEventListener("focusin", focusIn);
    stage.addEventListener("focusout", focusOut);
    touring.set(stage, me);
    const board = register(stage, tick);
    return {
      stop: () => {
        if (gone) return;
        gone = true;
        board.unregister();
        stage.removeEventListener("focusin", focusIn);
        stage.removeEventListener("focusout", focusOut);
        if (touring.get(stage) === me) touring.delete(stage);
        if (at) leave();
      }
    };
  }
  function disposer() {
    let fns = [];
    return {
      add: (fn) => {
        fns.push(fn);
      },
      on: (target, type, fn, opts) => {
        const h = fn;
        target.addEventListener(type, h, opts);
        fns.push(() => target.removeEventListener(type, h, opts));
      },
      dispose: () => {
        const run2 = fns;
        fns = [];
        for (let i = run2.length - 1; i >= 0; i--) run2[i]();
      }
    };
  }

  // packages/hairline/src/core/styles.ts
  var LIGHT = { plate: "#ffffff", hi: "#232327", edge: "#a4a4ac", mid: "#c3c3c9", lo: "#e0e0e4" };
  var DARK = { plate: "#08090a", hi: "#d0d6e0", edge: "#5b5d64", mid: "#3e3e44", lo: "#29292d" };
  var KEYS = ["plate", "hi", "edge", "mid", "lo"];
  var vars = (p) => KEYS.map((k) => `--hl-${k}:var(--hairline-${k},${p[k]});`).join("");
  var EASE = "cubic-bezier(0.5,0,0.1,1)";
  var SVG = ":where([data-hairline]>svg)";
  function css(lightDark) {
    const both = Object.fromEntries(KEYS.map((k) => [k, `light-dark(${LIGHT[k]},${DARK[k]})`]));
    return [
      // the box, and the palette: light unless something below says otherwise
      `:where([data-hairline]){display:block;position:relative;aspect-ratio:5/4;touch-action:pan-y;user-select:none;-webkit-user-select:none;--hl-sw:var(--hairline-stroke,0.9);${vars(LIGHT)}}`,
      // the page's color-scheme
      lightDark ? `:where([data-hairline]){${vars(both)}}` : "",
      // an ancestor that says dark
      `:where(.dark,[data-theme="dark"]) :where([data-hairline]){${vars(DARK)}}`,
      // the figure's own theme option
      `:where([data-hairline][data-hairline-theme="light"]){${vars(LIGHT)}}`,
      `:where([data-hairline][data-hairline-theme="dark"]){${vars(DARK)}}`,
      `:where([data-hairline]:focus-visible){outline:1.5px solid var(--hl-hi);outline-offset:2px}`,
      `${SVG}{position:absolute;inset:0;width:100%;height:100%;display:block}`,
      // Riffle's live region: read, not seen
      `:where([data-hairline]>[data-hairline-live]){position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`,
      // the drawing: plates are filled with the plate colour and painted back to front
      `${SVG} :where(path,polygon,ellipse,line){fill:var(--hl-plate);stroke:var(--hl-mid);stroke-width:var(--hl-sw);vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round;transition:stroke 260ms ${EASE}}`,
      `${SVG} :where(.nf){fill:none}`,
      `${SVG} :where(.fo){stroke:none}`,
      `${SVG} :where(.sil){stroke:var(--hl-edge)}`,
      `${SVG} :where(.hi){stroke:var(--hl-hi)}`,
      `${SVG} :where(.lo){stroke:var(--hl-lo)}`,
      `${SVG} :where(.dash){stroke-dasharray:1 3}`,
      `${SVG} :where(.dot){stroke:none;fill:var(--hl-hi);transition:fill 260ms ${EASE}}`,
      `${SVG} :where(.dot.m){fill:var(--hl-edge)}`,
      `${SVG} :where(.dot.off){fill:var(--hl-lo)}`,
      `${SVG} :where(.ghost path){fill:none;stroke:var(--hl-mid)}`
    ].join("");
  }
  var done = /* @__PURE__ */ new WeakSet();
  function inject(root) {
    if (done.has(root)) return;
    done.add(root);
    const doc = root.nodeType === 9 ? root : root.ownerDocument;
    const win = doc.defaultView;
    const text = css(!!win?.CSS?.supports?.("color", "light-dark(#000,#fff)"));
    if (win && "adoptedStyleSheets" in root) {
      try {
        const sheet = new win.CSSStyleSheet();
        sheet.replaceSync(text);
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
        return;
      } catch {
      }
    }
    const style = doc.createElement("style");
    style.setAttribute("data-hairline-style", "");
    style.textContent = text;
    (root.nodeType === 9 ? doc.head ?? doc.documentElement : root).appendChild(style);
  }
  return __toCommonJS(kernel_exports);
})();
/* /hairline kernel */
/* Hairline host: mounts each figure in its [data-hairline-host], writes the read-out in Portuguese and walks one lap of the tour the first time the figure is seen. */
(() => {
  window.hairline = (figure) => {
    document.querySelectorAll(`[data-hairline-host="${figure.name}"]`).forEach((host) => {
      if (host.dataset.mounted) return;
      host.dataset.mounted = '1';
      HL.inject(document);
      const stage = document.createElement('div');
      stage.setAttribute('data-hairline', figure.name);
      stage.setAttribute('role', 'img');
      stage.setAttribute('aria-label', host.dataset.labelA11y || figure.means);
      host.append(stage);
      const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
      const out = host.querySelector('[data-hairline-read]');
      let text = '';
      const read = {
        get textContent() { return text; },
        set textContent(v) { text = v == null ? '' : String(v); if (out) out.textContent = text === 'rest' ? '' : text; },
      };
      figure.mount({ stage, svg, read }, figure.range[1]);
      if (HL.reducedMotion() || !('IntersectionObserver' in window) || !figure.tour) return;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const go = () => { const lap = HL.tour(stage, figure.tour, (i) => { if (figure.tour[i] === null) lap.stop(); }); };
        (function whenBuilt(){ if (!host.classList.contains('build') || (host.classList.contains('built') && !host._op)) setTimeout(go, 600); else setTimeout(whenBuilt, 200); })();
      }, { threshold: 0.6 });
      io.observe(stage);
    });
  };
})();
(() => {
document.body.classList.add('locked');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
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
const TEXTS = 'h3,h4,p,li > span:last-child,footer > span,.num,legend,.needs label > span,.label';
const SKIP = 'svg,script,style,textarea,select,option,.hl-read,.ans,.compare,.pj-stage,.drop';
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
// a malformed hash (a lone %) must not stop the page
const deep = location.hash.length > 1 && (() => { try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return null; } })();
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
/* ========== 3) color masks ========== */
// hero portrait: hard-edged color spot follows the pointer inside the mask
// (the pointer is read at most once per frame, and only while the hero is on screen)
const hr = $('#heroRetrato'); let spot = 0, spotTarget = 0, spotRaf = 0, spotAt = null, heroSeen = true;
if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { heroSeen = e.isIntersecting; }).observe($('.hero'));
addEventListener('pointermove', e => {
  if (!heroSeen && !spot) return;
  spotAt = [e.clientX, e.clientY];
  if (!spotRaf) spotRaf = requestAnimationFrame(spotLoop);
}, {passive:true});
function spotLoop(){
  if (spotAt){
    const r = hr.getBoundingClientRect(), x = (spotAt[0] - r.left) / r.width * 100, y = (spotAt[1] - r.top) / r.height * 100;
    spotAt = null;
    hr.style.setProperty('--mx', x + '%'); hr.style.setProperty('--my', y + '%');
    spotTarget = heroSeen && x > -10 && x < 110 && y > -10 && y < 110 ? 26 : 0;
  }
  if (spot !== spotTarget){
    spot += (spotTarget - spot) * .12; if (Math.abs(spotTarget - spot) < .05) spot = spotTarget;
    hr.style.setProperty('--spot', spot.toFixed(2) + '%');
  }
  spotRaf = spot !== spotTarget ? requestAnimationFrame(spotLoop) : 0;
}


// scope builder: the needs picked shape the preview and the proposal
const needs = $$('.needs input'), pv = $('.scope-preview');
function scope(){
  const on = new Set(needs.filter(n => n.checked).map(n => n.value));
  $$('[data-k]', pv).forEach(el => { const k = el.dataset.k; if (k !== 'base' && k !== 'foot') el.classList.toggle('on', on.has(k)); });
  const site = ['servicos','whats','portfolio','blog','seo'].filter(k => on.has(k));
  const sol = [on.has('crm') || on.has('auto') ? 'Automações' : '', on.has('sistema') ? 'Sistema' : '', on.has('dados') ? 'Painel' : ''].filter(Boolean);
  return { site, sol };
}
needs.forEach(n => n.addEventListener('change', scope));
scope();
$('#pvGo').addEventListener('click', () => {
  const { site, sol } = scope();
  const names = needs.filter(n => n.checked).map(n => '- ' + n.nextElementSibling.textContent);
  const svc = site.length && !sol.length ? 'sSite' : sol.length && !site.length ? 'sSol' : 'sNs';
  $('#' + svc).checked = true;
  $('#fMsg').value = `Quero um projeto com:\n${names.join('\n') || '- (ainda não sei)'}`;
  $('#form').hidden = false; $('#ready').hidden = true;
  $('#contato').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  setTimeout(() => $('#fName').focus({ preventScroll: true }), reduce ? 0 : 700);
});

/* ========== 4) page interactions ========== */
const hdr = $('#hdr');
// menu on smaller screens: opens a dropdown; closes on a link, Escape, a tap outside or a wider screen
const menuBtn = $('#menuBtn');
function setMenu(open){ hdr.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Fechar o menu' : 'Abrir o menu'); }
menuBtn.addEventListener('click', () => setMenu(!hdr.classList.contains('open')));
$$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && hdr.classList.contains('open')){ setMenu(false); menuBtn.focus(); } });
document.addEventListener('click', (e) => { if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false); });
matchMedia('(min-width: 961px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 20), {passive:true});

// compare: spreadsheet vs dashboard (the sheet and the chart are plain HTML)
const cmp = $('#compare'), after = $('#after'), handle = $('#handle'); let drag = false;
function setPos(x){ const r = cmp.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (x - r.left) / r.width)); after.style.clipPath = `inset(0 0 0 ${p*100}%)`; handle.style.left = p*100 + '%'; }
cmp.addEventListener('pointerdown', e => { drag = true; cmp.setPointerCapture(e.pointerId); setPos(e.clientX); });
cmp.addEventListener('pointermove', e => { if (drag || e.pointerType === 'mouse') setPos(e.clientX); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => cmp.addEventListener(ev, () => { drag = false; }));

// process progress (measured at most once per frame)
const steps = $('#steps'), fill = $('#stepFill'), stepEls = $$('.step', steps);
let stepsRaf = 0;
const stepsSoon = () => { if (!stepsRaf) stepsRaf = requestAnimationFrame(stepsProgress); };
function stepsProgress(){
  stepsRaf = 0;
  const mid = innerHeight * .65;
  let last = -1; stepEls.forEach((s,i) => { const on = s.classList.contains('built') && s.getBoundingClientRect().top < mid; s.classList.toggle('on', on); if (on) last = i; });
  // the line never runs ahead of the steps the crew has already built
  const r = steps.getBoundingClientRect(), reach = last < 0 ? 0 : last === stepEls.length - 1 ? 1 : (stepEls[last].getBoundingClientRect().left - r.left + 12) / r.width;
  const p = Math.max(0, Math.min(reach, (mid - r.top) / (r.height * .9)));
  fill.style.transform = `scaleX(${p.toFixed(4)})`;
}
addEventListener('scroll', stepsSoon, {passive:true}); stepsProgress();
new MutationObserver(stepsSoon).observe(steps, { subtree: true, attributes: true, attributeFilter: ['class'] });

// faq: the answer's height morphs from where it is to where it is going, and the text un-blurs into place
$$('.qa button').forEach(b => b.addEventListener('click', () => {
  const q = b.parentElement, ans = $('.ans', q), txt = $('p', ans), open = !q.hasAttribute('data-open');
  const from = ans.getBoundingClientRect().height;
  ans.getAnimations().concat(txt.getAnimations()).forEach(a => a.cancel());
  q.toggleAttribute('data-open', open); b.setAttribute('aria-expanded', open);
  if (reduce) return;
  const to = open ? ans.scrollHeight : 0;
  ans.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: open ? 560 : 420, easing: 'cubic-bezier(.22,1,.36,1)' });
  txt.animate(open
    ? [{ opacity: 0, transform: 'translateY(-10px) scale(.985)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }]
    : [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, transform: 'translateY(-6px)', filter: 'blur(4px)' }],
    { duration: open ? 520 : 260, delay: open ? 70 : 0, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
}));

/* ========== cards: the dropdown of a compact card ========== */
// (the dropdown is a native <details> and the CSS decides which cards are compact; here, only how it closes)
{ const openMore = () => $('details.more[open]');
  addEventListener('keydown', (e) => { const d = e.key === 'Escape' && openMore(); if (d){ d.open = false; d.firstElementChild.focus(); } });
  document.addEventListener('click', (e) => { const d = openMore(); if (d && !d.contains(e.target)) d.open = false; });
}

// contact: prepare the message in the page (nothing is sent)
const form = $('#form'), ready = $('#ready'), out = $('#msgOut'), err = $('#err');
{ const FORMATS = { 'landing-page': ['sSite', 'Landing Page'], 'site-completo': ['sSite', 'Site Completo'], 'solucoes-personalizadas': ['sSol', 'Soluções Personalizadas'] };
  const f = FORMATS[new URLSearchParams(location.search).get('formato')];
  if (f){ $('#' + f[0]).checked = true; $('#fMsg').value = `Tenho interesse em ${f[1]}. `; } }
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form), nome = (d.get('nome')||'').trim(), msg = (d.get('mensagem')||'').trim();
  if (!nome){ err.textContent = 'Informe seu nome.'; $('#fName').focus(); return; }
  if (msg.length < 10){ err.textContent = 'Conte em poucas palavras o que você precisa.'; $('#fMsg').focus(); return; }
  err.textContent = '';
  const biz = (d.get('negocio')||'').trim();
  out.textContent = `Olá, Lorz! Meu nome é ${nome}${biz ? `, do ${biz}` : ''}.\n\nServiço de interesse: ${d.get('servico')}\n\n${msg}\n\nAguardo o retorno para conversarmos.`;
  form.hidden = true; ready.hidden = false; $('#copyStatus').textContent = ''; $('#copy').focus();
});
$('#edit').addEventListener('click', () => { ready.hidden = true; form.hidden = false; $('#fMsg').focus(); });
$('#copy').addEventListener('click', () => {
  const t = out.textContent, st = $('#copyStatus');
  const fallback = () => { const r = document.createRange(); r.selectNodeContents(out); const s = getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = 'Texto selecionado. Use Ctrl+C (ou Copiar) para copiar.'; };
  try { navigator.clipboard.writeText(t).then(() => st.textContent = 'Mensagem copiada.', fallback); } catch { fallback(); }
});
/* ========== 6) principais projetos: carrossel em arco ========== */
/* Os projetos ficam todos aqui. Para incluir, remover ou mudar a ordem, edite esta lista
   (o conteúdo das páginas de cada projeto fica em src/projetos_pages.py).
   name, category  nome e tipo de solução
   tagline         o que o site resolve, numa linha curta (aparece sob o nome)
   description     o que é o site e para quem, em linguagem de cliente
   features        o que o site faz por quem visita (uma frase por item; até três cabem bem)
   page            a página do projeto, com o site funcionando e a explicação completa
   image           retrato 680×1100 em assets/projetos/ (as capturas do projeto compostas sobre uma cor da Lorz)
   bg              versão pequena da captura, usada desfocada no fundo da seção
   alt             o que a imagem mostra, para leitores de tela
   status          'real' (trabalho para um negócio real), 'conceitual' (estudo sem cliente) ou 'demonstrativo' (exemplo fictício)
   url             endereço publicado (opcional); sem url, só a página do projeto aparece */
const PROJECTS = [
  { name: 'Flat Jardim Serrano', category: 'Site completo · Hospedagem', status: 'real', url: null,
    tagline: 'Reservas pelo WhatsApp, com a mensagem pronta', page: 'projeto-flat-jardim-serrano.html',
    image: 'assets/projetos/flat.webp', bg: 'assets/projetos/flat-fundo.webp',
    alt: 'Site do Flat Jardim Serrano no computador e no celular, com o seletor de flats em destaque',
    description: 'Site de uma hospedagem com sete flats para casais. Ajuda o hóspede a escolher e envia o pedido de reserva pronto para o WhatsApp.',
    features: [
      'O hóspede marca o que não pode faltar e vê só os flats que têm tudo.',
      'Escolhe as datas, e o site abre o WhatsApp com a mensagem escrita e as noites contadas.',
      'Cada flat tem sua página, com fotos, o que está incluso e as regras da casa.',
    ] },
  { name: 'Brasa', category: 'Site e pedido online · Hamburgueria', status: 'conceitual', url: null,
    tagline: 'Pedido online, da sacola ao Pix', page: 'projeto-brasa.html',
    image: 'assets/projetos/brasa.webp', bg: 'assets/projetos/brasa-fundo.webp',
    alt: 'Site da Brasa com o hambúrguer em 3D separado em camadas, a sacola no celular e o pagamento por Pix',
    description: 'Site de hamburgueria com cardápio e pedido online: o cliente monta o pedido e paga sem sair do site. Projeto conceitual, em versão de teste.',
    features: [
      'Na abertura, o hambúrguer em 3D gira com o dedo e se desmonta ao descer a página.',
      'A sacola fica guardada, mesmo se o cliente fechar a página sem querer.',
      'Entrega ou retirada, e pagamento por Pix, cartão na entrega ou dinheiro com troco.',
    ] },
  { name: 'Isadora Guirelli', category: 'Landing page · Saúde capilar', status: 'real', url: null,
    tagline: 'Orienta antes do primeiro contato', page: 'projeto-isadora-guirelli.html',
    image: 'assets/projetos/isa.webp', bg: 'assets/projetos/isa-fundo.webp',
    alt: 'Site de Isadora Guirelli no computador e no celular, com os caminhos Sinais de atenção e Cuidados',
    description: 'Site de uma especialista em saúde capilar. Explica os sinais de queda e afinamento dos fios e leva a pessoa até o WhatsApp.',
    features: [
      'Quatro atalhos logo no início levam cada pessoa ao que ela procura.',
      'Páginas curtas explicam o que observar e quando procurar um dermatologista.',
      'No celular, o botão de WhatsApp acompanha a leitura sem cobrir o texto.',
    ] },
  { name: 'Belisca!', category: 'Loja virtual · Snacks', status: 'conceitual', url: null,
    tagline: 'Do catálogo ao checkout, sem sair da loja', page: 'projeto-belisca.html',
    image: 'assets/projetos/belisca.webp', bg: 'assets/projetos/belisca-fundo.webp',
    alt: 'Loja Belisca no computador e no celular, com a vitrine de salgados, o carrinho e a primeira etapa do checkout',
    description: 'Loja virtual de uma mercearia de snacks com doze produtos. O cliente busca, filtra, monta o carrinho e segue pelo checkout. Projeto conceitual, com checkout demonstrativo.',
    features: [
      'O catálogo tem busca e filtros por categoria, marca, preço e tipo.',
      'O carrinho fica guardado, aceita cupom e avisa quanto falta para o frete grátis.',
      'O checkout anda uma etapa por vez, com o resumo do pedido sempre à vista.',
    ] },
  { name: 'Helios 44-2', category: 'Página de produto · 3D', status: 'conceitual', url: null,
    tagline: 'O produto se desmonta conforme a rolagem', page: 'projeto-helios-44-2.html',
    image: 'assets/projetos/helios.webp', bg: 'assets/projetos/helios-fundo.webp',
    alt: 'Página da lente Helios 44-2 no computador e no celular, com o modelo 3D inteiro e depois aberto em peças',
    description: 'Página que apresenta uma objetiva fotográfica clássica por dentro. O modelo 3D se abre peça por peça enquanto a pessoa rola. Projeto conceitual.',
    features: [
      'Nove capítulos, da história da lente à vista de todas as peças em linha.',
      'Cada peça recebe um número, um nome e uma frase sobre o que faz.',
      'O mesmo modelo 3D roda no celular, com o texto reorganizado para a tela estreita.',
    ] },
];
const STATUS = { demonstrativo: 'Projeto demonstrativo', conceitual: 'Projeto conceitual', real: '', publicado: '' };
// the caption of one project, built with textContent (the list is data, never markup)
function capNode(p, i, n, part){
  const flag = STATUS[p.status] || '', c = document.createElement('div'); c.className = 'pj-cap';
  if (part === 'head'){
    c.innerHTML = `${flag ? '<p class="pj-meta"><span class="pj-flag"></span></p>' : ''}
      <h3 class="pj-name"></h3><i class="pj-rule" aria-hidden="true"></i><p class="pj-stack"></p><span class="sr">${p.category}. Projeto ${i + 1} de ${n}.</span>`;
    c.querySelector('.pj-name').textContent = p.name;
    c.querySelector('.pj-stack').textContent = p.tagline || '';
    if (flag) c.querySelector('.pj-flag').textContent = flag;
  } else {
    c.innerHTML = `<p class="pj-desc"></p>${(p.features || []).length ? '<ul class="pj-feats" aria-label="O que o site faz"></ul>' : ''}
      <p class="pj-links">${p.page ? '<a class="pj-open btn"></a>' : ''}${p.url ? '<a class="pj-site" target="_blank" rel="noopener">Abrir o site<span class="sr"> (abre em nova aba)</span></a>' : ''}</p>`;
    c.querySelector('.pj-desc').textContent = p.description;
    (p.features || []).forEach(f => { const li = document.createElement('li'); li.textContent = f; c.querySelector('.pj-feats').appendChild(li); });
    if (p.page){ const a = c.querySelector('.pj-open'); a.href = p.page; a.textContent = 'Ver e testar o projeto'; }
    if (p.url) c.querySelector('.pj-site').href = p.url;
  }
  [...c.children].forEach((k, m) => k.style.setProperty('--i', m));
  return c;
}

(function projects(){
  const sec = $('#projetos'); if (!sec || !PROJECTS.length) return;
  const stage = $('.pj-stage', sec), track = $('.pj-track', sec), capBox = $('.pj-caption', sec), detBox = $('.pj-detail', sec), bgBox = $('.pj-bg', sec);
  const BOXES = [[capBox, 'head'], [detBox, 'body']];
  const nowEl = $('.pj-now', sec), barEl = $('.pj-bar i', sec);
  const n = PROJECTS.length, pad = (k) => String(k).padStart(2, '0');
  $('.pj-total', sec).textContent = pad(n);
  // the list is repeated until the ring has at least eight cards, so the ones on the far side turn round out of sight
  const copies = Math.max(1, Math.ceil(8 / n)), N = n * copies;
  const panels = [];
  for (let j = 0; j < N; j++){
    const p = PROJECTS[j % n], el = document.createElement('div');
    el.className = 'pj-card'; el.dataset.j = j;
    el.innerHTML = `<div class="pj-lift"><img src="${p.image}" alt="" width="680" height="1100" decoding="async" ${j < n ? '' : 'loading="lazy"'} draggable="false"><span class="pj-dim"></span><span class="pj-peek" aria-hidden="true"><b class="pj-peek-name"></b></span></div>`;
    el.querySelector('.pj-peek-name').textContent = p.name;
    track.appendChild(el); panels.push({ el, img: el.querySelector('img'), state: '', shown: true });
  }
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const mod = (v, m) => ((v % m) + m) % m;
  const near = (v) => { let d = mod(v, N); if (d > N / 2) d -= N; return d; };   // signed distance round the ring
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* The wheel. `pos` is where the ring is and `target` where it is going, both in cards and both unbounded (the ring
     never rewinds); every frame `pos` covers a fixed share of what is left, so it slows down as it arrives. Each card's
     place on the arc, tilt, size, blur and light all come from one number: its distance from the centre. */
  let pos = 0, target = 0, active = 0, central = 0, raf = 0, last = 0;
  let R = 2, pw = 300, spacing = 264, radius = 1380, stepDeg = 11;   // set by measure()
  const LERP = 0.075, LERP_DRAG = 0.34;

  function render(){
    const mob = R === 1, shrink = mob ? .2 : .16, fade = mob ? .3 : .24;
    for (let j = 0; j < N; j++){
      const pnl = panels[j], d = near(j - pos), a = Math.abs(d), st = pnl.el.style;
      if (a > R + .75){ if (pnl.shown){ pnl.shown = false; st.visibility = 'hidden'; } continue; }
      if (!pnl.shown){ pnl.shown = true; st.visibility = ''; }
      const deg = d * stepDeg, th = deg * Math.PI / 180;
      const x = Math.sin(th) * radius, y = (1 - Math.cos(th)) * radius;
      st.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${deg.toFixed(2)}deg) scale(${(1 - shrink * a).toFixed(4)})`;
      // full up to the last card that shows, then gone over the next three quarters of a step
      st.opacity = (a <= R ? 1 - fade * a : Math.max(0, (1 - fade * R) * (1 - (a - R) / .7))).toFixed(3);
      const far = Math.min(a, 2);
      st.filter = a < .02 ? '' : `blur(${(1.6 * far).toFixed(2)}px) saturate(${(1 - .13 * far).toFixed(3)}) brightness(${(1 - .12 * far).toFixed(3)})`;
      st.zIndex = String(20 - Math.round(a * 5));
      st.setProperty('--near', Math.max(0, 1 - a).toFixed(3));
      const state = a < .5 ? 'on' : d > 0 ? 'side right' : 'side';
      if (state !== pnl.state){
        pnl.state = state;
        pnl.el.classList.toggle('on', state === 'on');
        pnl.el.classList.toggle('side', state !== 'on');
        pnl.el.classList.toggle('right', state === 'side right');   // its name label sits on the outer side, clear of the active caption
        pnl.img.alt = state === 'on' ? PROJECTS[j % n].alt : '';
        pnl.el.setAttribute('aria-hidden', state === 'on' ? 'false' : 'true');
      }
    }
    // the light on the card that has just taken the centre: once per arrival, never while the ring is still spinning past
    const c = mod(Math.round(pos), N);
    if (c !== central && Math.abs(target - pos) < .2){ central = c; glow(panels[c].el); }
  }
  function glow(el){ if (still.matches) return; el.classList.remove('glow'); void el.offsetWidth; el.classList.add('glow'); }
  track.addEventListener('animationend', (e) => { if (e.animationName === 'pjGlow') e.target.classList.remove('glow'); });

  function frame(now){
    raf = 0;
    const dt = Math.min(64, now - last || 16.7); last = now;
    const dragging = drag && drag.mode;
    // the same share of the distance per 60 Hz frame, whatever the screen's refresh rate
    const k = still.matches ? 1 : 1 - Math.pow(1 - (dragging ? LERP_DRAG : LERP), dt / 16.667);
    pos += (target - pos) * k;
    if (Math.abs(target - pos) < .0008) pos = target;
    render();
    if (pos !== target || dragging) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf){ last = performance.now(); raf = requestAnimationFrame(frame); } };

  // caption: the old one leaves, then the new one comes in; only the newest stays
  function caption(i, first){
    BOXES.forEach(([box, part]) => {
      const c = capNode(PROJECTS[i], i, n, part); if (!first) c.classList.add('in');
      $$('.pj-cap', box).forEach(o => { if (o.classList.contains('out')) o.remove(); else { o.classList.remove('in'); o.classList.add('out'); o.setAttribute('aria-hidden', 'true'); o.querySelectorAll('a').forEach(a => a.tabIndex = -1); setTimeout(() => o.remove(), 260); } });
      box.appendChild(c);
    });
  }
  // background: the new image is decoded first, then fades in over the old one (never through black)
  let bgToken = 0;
  function background(i){
    const t = ++bgToken, img = new Image(); img.src = PROJECTS[i].bg; img.alt = ''; img.className = 'pj-bgimg';
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => {
      if (t !== bgToken) return;
      bgBox.appendChild(img); void img.offsetWidth; img.classList.add('on');
      const old = [...bgBox.children].slice(0, -1);
      setTimeout(() => old.forEach(o => o.remove()), 900);
    });
  }
  function counter(i){ nowEl.textContent = pad(i + 1); barEl.style.transform = `scaleX(${(i + 1) / n})`; }

  // the project the ring is heading to: its text, background and counter change as soon as it is chosen
  let byAuto = false;
  function sync(){
    const a = mod(Math.round(target), N); if (a === active) return;
    active = a; const i = a % n;
    // a change nobody asked for is not announced: screen readers only hear the projects the visitor picks
    BOXES.forEach(([box]) => box.setAttribute('aria-live', byAuto ? 'off' : 'polite'));
    untilt(); caption(i); background(i); counter(i);
    // the next images are fetched ahead, so a fast move never shows an empty background
    [1, -1, 2].forEach(k => { new Image().src = PROJECTS[mod(i + k, n)].bg; });
  }
  let snapT = 0;
  function go(step){
    if (!step) return;
    clearTimeout(snapT);
    target = Math.round(target) + step;
    sync(); kick();
    if (!byAuto) arm();
  }
  // after a gesture: a short pause to be sure it is over, then the nearest card is brought exactly to the centre
  function settle(){ clearTimeout(snapT); snapT = setTimeout(() => { target = Math.round(target); sync(); kick(); arm(); }, 160); }

  /* The ring turns by itself every 3.6 s, with the same movement as a manual step. It waits while the pointer is over
     the carousel, while it has keyboard focus or is being dragged, while it is off screen, and it never runs with
     reduced motion or with the page's animation switch off. Any interaction restarts the wait. */
  let autoT = 0, hover = false, seen = false;
  const canAuto = () => seen && !hover && !drag && !document.hidden && !still.matches && ANIM.on && !stage.matches(':focus-within');
  function arm(){
    clearTimeout(autoT);
    autoT = setTimeout(() => { if (canAuto()){ byAuto = true; go(1); byAuto = false; } arm(); }, 3600);
  }
  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse'){ hover = false; arm(); } });
  stage.addEventListener('focusout', arm);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; arm(); }, { threshold: .35 }).observe(stage);
  else seen = true;

  $('.pj-arrow.prev', sec).addEventListener('click', () => go(-1));
  $('.pj-arrow.next', sec).addEventListener('click', () => go(1));
  // a click on a side card brings it to the centre; a click on the centre one opens the project's page
  // (the keyboard and screen readers reach the same page through the link below the carousel)
  track.addEventListener('click', (e) => {
    if (dragged) return;
    const card = e.target.closest('.pj-card'); if (!card) return;
    if (card.classList.contains('on')){ const p = PROJECTS[active % n]; if (p.page) location.href = p.page; return; }
    go(Math.round(near(+card.dataset.j - target)));
  });
  stage.addEventListener('keydown', (e) => {
    if (e.target.closest('a')) return;
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (k){ e.preventDefault(); go(k); }
    else if (e.key === 'Home'){ e.preventDefault(); go(-(active % n)); }
    else if (e.key === 'End'){ e.preventDefault(); go(n - 1 - (active % n)); }
  });

  // drag (mouse) and swipe (touch): the ring follows the pointer and keeps some of its speed when let go.
  // Vertical movement stays with the page (touch-action: pan-y); a drag never counts as a click.
  let drag = null, dragged = false, press = null;
  stage.addEventListener('pointerdown', (e) => {
    // any press that travels more than a few pixels is not a click, whatever direction it went
    press = { x: e.clientX, y: e.clientY }; dragged = false;
    if (drag || e.button > 0 || e.target.closest('button,a,.pj-detail')) return;   // a second finger is ignored
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, mode: '', mouse: e.pointerType === 'mouse', from: 0, lx: e.clientX, lt: performance.now(), v: 0 };
  });
  stage.addEventListener('pointermove', (e) => {
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) dragged = true;
    if (!drag || e.pointerId !== drag.id) return;
    const mx = e.clientX - drag.x0, my = e.clientY - drag.y0, slop = drag.mouse ? 6 : 10;
    if (!drag.mode){
      if (Math.abs(mx) > slop && Math.abs(mx) > Math.abs(my) * 1.2){
        drag.mode = 'x'; drag.x0 = e.clientX - Math.sign(mx) * slop; drag.from = target; drag.lx = e.clientX; drag.lt = performance.now();
        clearTimeout(snapT); clearTimeout(autoT); untilt();
        stage.setPointerCapture(drag.id); stage.classList.add('grabbing');
      } else if (Math.abs(my) > slop){ drag = null; return; }
    }
    if (drag.mode === 'x'){
      const t = performance.now(), dt = Math.max(1, t - drag.lt);
      drag.v = .6 * ((e.clientX - drag.lx) / dt) + .4 * drag.v; drag.lx = e.clientX; drag.lt = t;   // px per ms, smoothed
      target = drag.from - (e.clientX - drag.x0) / spacing;
      sync(); kick();
    }
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (d.mode !== 'x'){ arm(); return; }
    stage.classList.remove('grabbing');
    dragged = true;
    // inertia: the speed at release carries the ring a little further (none if the pointer had already stopped)
    const coast = e.type === 'pointercancel' || still.matches || performance.now() - d.lt > 90 ? 0 : clamp(-d.v * 260 / spacing, -2.5, 2.5);
    target += coast; sync(); kick(); settle();
  };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);

  // the hover of the reference: the centre panel leans toward the pointer in 3D, the title leans with it a little in
  // front, and the image slides the other way inside (depth). Mouse only, never while dragging or travelling.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let tiltRaf = 0, tiltAt = null;
  function untilt(){
    cancelAnimationFrame(tiltRaf); tiltRaf = 0; tiltAt = null;
    stage.classList.remove('tilt');
    ['--tx', '--ty'].forEach(k => stage.style.setProperty(k, '0deg')); ['--mx', '--my'].forEach(k => stage.style.setProperty(k, '0'));
  }
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !fine.matches || still.matches || R === 1 || (drag && drag.mode) || pos !== target) return;
    const card = e.target.closest && e.target.closest('.pj-card.on');
    if (!card){ if (stage.classList.contains('tilt')) untilt(); return; }
    tiltAt = { x: e.clientX, y: e.clientY, card };
    if (tiltRaf) return;
    tiltRaf = requestAnimationFrame(() => {
      tiltRaf = 0; if (!tiltAt) return;
      const r = tiltAt.card.getBoundingClientRect();
      const nx = clamp((tiltAt.x - r.left) / r.width * 2 - 1, -1, 1), ny = clamp((tiltAt.y - r.top) / r.height * 2 - 1, -1, 1);
      stage.style.setProperty('--ty', (nx * 8).toFixed(2) + 'deg'); stage.style.setProperty('--tx', (-ny * 6).toFixed(2) + 'deg');
      stage.style.setProperty('--mx', nx.toFixed(3)); stage.style.setProperty('--my', ny.toFixed(3));
      stage.classList.add('tilt');
    });
  });
  stage.addEventListener('pointerleave', untilt);
  // the click that follows a moved press is dropped, then the flag is cleared for the next press
  stage.addEventListener('click', () => { setTimeout(() => { dragged = false; press = null; }, 0); }, true);
  // a horizontal wheel or trackpad swipe turns the ring with the fingers; the vertical wheel stays with the page
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    clearTimeout(autoT);
    target += clamp(e.deltaX / spacing, -.5, .5);
    sync(); kick(); settle();
  }, { passive: false });

  // sizes follow the stage; on small screens one neighbour peeks on each side and the text sits below
  function measure(){
    const W = stage.clientWidth, mob = matchMedia('(max-width: 899px)').matches;
    R = mob ? 1 : 2;   // two neighbours on each side on wide screens, one on small ones
    let ph; stage.style.removeProperty('--sth');
    if (mob){ pw = Math.min(W * .74, 360); ph = pw * 1.18; }
    else {
      // the panel is sized by the viewport height and the stage width; the stage then hugs it, so no empty band is left
      const H = track.clientHeight; ph = H * .8; pw = Math.min(ph * 680 / 1100, W * .19); ph = pw * 1100 / 680;
      stage.style.setProperty('--sth', Math.round(ph + 110) + 'px');
    }
    stage.style.setProperty('--pw', pw.toFixed(1) + 'px'); stage.style.setProperty('--ph', ph.toFixed(1) + 'px');
    // the arc: neighbours sit one step apart on a circle whose radius follows the card width;
    // two steps reach about 22 degrees on wide screens
    stepDeg = mob ? 13 : 11; spacing = pw * (mob ? .92 : .88); radius = spacing / Math.sin(stepDeg * Math.PI / 180);
    // the caption box keeps the height of the tallest project, so changing project never moves the page
    // (the head only needs it on small screens, where it sits in the flow; the explanation always does)
    BOXES.forEach(([box, part]) => {
      if (part === 'head' && !mob){ box.style.minHeight = ''; return; }
      const probe = document.createElement('div'); probe.className = box.classList[0] + ' pj-probe'; probe.setAttribute('aria-hidden', 'true');
      probe.style.width = box.clientWidth + 'px'; box.after(probe);
      let h = 0; PROJECTS.forEach((p, i) => { probe.innerHTML = ''; const c = capNode(p, i, n, part); probe.appendChild(c); h = Math.max(h, c.offsetHeight); });
      probe.remove(); box.style.minHeight = h + 'px';
    });
    render();
  }
  let rz = 0; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(measure); });
  if (document.fonts) document.fonts.ready.then(measure);
  document.addEventListener('visibilitychange', arm);
  measure(); caption(0, true); counter(0);
  { const img = new Image(); img.src = PROJECTS[0].bg; img.alt = ''; img.className = 'pj-bgimg on'; bgBox.appendChild(img); }
})();
/* ========== 5) sections built by the crew as you scroll ========== */
function startScrollBuild(){
  const TARGETS = '.sec-head h2, .sec-head > div > p, .sec-head > .fig, .format, .pillars > div, .sol, .compare-wrap > div:first-child, .scope-copy > *, .scope-preview, .pj-stage, .step, .faq > div:first-child, .qa, .contact > div:first-child > *, form.tile';
  const MEDIA = '.sec-head > .fig, .format, .sol, .scope-preview, form.tile';
  const secs = $$('main > section:not(.hero)').map(sec => ({ sec, items: $$(TARGETS, sec), layer: null, t: 0 }));
  const all = secs.flatMap(s => s.items.map(el => (el._s = s, el)));
  const label = el => {
    if (el.matches('.format, .sol')) return 'Card · ' + $('h3', el).textContent;
    if (el.matches('.compare')) return 'Componente · Antes/Depois';
    if (el.matches('.scope-preview')) return 'Componente · Prévia do escopo';
    if (el.matches('.pj-stage')) return 'Carrossel · Projetos';
    if (el.matches('fieldset')) return 'Grupo · ' + $('legend', el).textContent;
    if (el.matches('form')) return 'Form · Contato';
    if (el.matches('.fig')) return 'Hairline · ' + el.dataset.hairlineHost;
    if (el.matches('.pillars > div')) return 'Pilar · ' + $('.num', el).textContent;
    if (el.matches('.compare-wrap > div')) return 'Texto · ' + $('h3', el).textContent;
    if (el.matches('.step')) return 'Etapa · ' + $('h3', el).textContent;
    if (el.matches('.qa')) return 'Acordeão · Pergunta';
    if (el.matches('h2')) return 'H2 · ' + el.textContent.trim().replace(/\s+/g,' ').slice(0, 26);
    if (el.matches('p')) return 'P · Texto';
    return 'Grupo · ' + (el.className.replace(/\b(build|built|media)\b/g,'').trim().split(/\s+/)[0] || 'Camada');
  };
  all.forEach(el => { el.classList.add('build'); el._label = label; if (el.matches(MEDIA)) el.classList.add('media'); });

  // each section shows its own build progress on a ruler while the crew works in it
  function progress(s){
    if (!crewOn()) return;
    if (!s.layer){ s.layer = document.createElement('div'); s.layer.className = 'ed-layer'; s.layer.innerHTML = '<div class="eruler"></div><span class="eprog"></span>'; s.sec.appendChild(s.layer); }
    const n = s.items.filter(e => e.classList.contains('built')).length / s.items.length;
    $('.eruler', s.layer).style.transform = `scaleX(${n})`;
    $('.eprog', s.layer).textContent = n >= 1 ? '✓ Seção pronta' : `Construindo · ${Math.round(n*100)}%`;
    s.layer.classList.add('active');
    clearTimeout(s.t); s.t = setTimeout(() => s.layer && s.layer.classList.remove('active'), 1400);
  }
  isComplete = () => all.every(el => el.classList.contains('built')) && $$('header .build, .hero .build').every(el => el.classList.contains('built'));

  let ticking = false;
  function check(){
    ticking = false;
    if (all.every(el => el.classList.contains('built'))){ assign(); return; }
    const line = innerHeight * .82;
    // built once, the first time it is scrolled to, like the page loading; it never comes apart again
    for (const el of all){
      const r = el.getBoundingClientRect();
      // with the animations off (or arriving from a link) everything is simply there, not revealed on scroll
      if ((r.top < line || !crewOn()) && !el.classList.contains('built') && !el._q) enqueue(el, () => progress(el._s), true);
    }
    // everything that came into view is queued first, then the builder picks in order
    assign();
  }
  addEventListener('scroll', () => { if (!ticking){ ticking = true; requestAnimationFrame(check); } }, {passive:true});
  addEventListener('resize', check);
  window.__sb = {
    reset(){ queue.length = 0; all.forEach(el => { el._q = false; el.style.clipPath = ''; el.classList.remove('built', 'now'); }); secs.forEach(s => { if (s.layer){ s.layer.remove(); s.layer = null; } }); },
    check,
  };
  check();
}
})();
(() => {
"use strict";
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
})();
(() => {
"use strict";
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
})();
(() => {
"use strict";
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
})();
