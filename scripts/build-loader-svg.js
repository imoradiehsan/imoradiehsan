// Builds logo-loader.svg: a self-contained, seamlessly looping SMIL animation.
// Usage: node scripts/build-loader-svg.js
const fs = require("fs");
const path = require("path");

const COLORS = { blue: "#2160d7", gray: "#b2b6bc", disc: "#ffffff" };
const TIMING = { spin: 2.4, delay: 0, stagger: 0.17, pop: 0.4, hold: 0.5 };
const FPS = 60;

// Geometry in a 500x500 box; the logo's outer edge sits at 80% of the disc radius.
const C = 250, RO = 194, RI = 128, CR = 16, GAP = 24;
const LOGO_SCALE = (250 * 0.8) / RO;
const D = GAP / 2 + CR, ro = RO - CR, ri = RI + CR, T = RO - RI, rt = RO - 0.42 * T;
const toRad = d => d * Math.PI / 180, toDeg = r => r * 180 / Math.PI;
const off = (r, extra = 0) => toDeg(Math.asin((D + extra) / r));
const oOff = off(ro), iOff = off(ri), tOff = off(rt), obOff = off(ro, 0.36 * T), ibOff = off(ri, 0.14 * T);

const BLUE = [125, 353];
const SEGS = [[353, 397], [397, 441], [441, 485]];

const r1 = n => Math.round(n * 10) / 10;
const pt = (r, a) => [C + r * Math.cos(toRad(a - 90)), C + r * Math.sin(toRad(a - 90))];

// Sector path as [template pieces, numbers] so every frame shares one command structure.
function sectorNums(a, b, tipped) {
  const oa = a + oOff, ia = a + iOff;
  const ob = b - (tipped ? obOff : oOff), ib = b - (tipped ? ibOff : iOff);
  const lo = ob - oa > 180 ? 1 : 0, li = ib - ia > 180 ? 1 : 0;
  const n = [...pt(ro, oa), ...pt(ro, ob)];
  if (tipped) n.push(...pt(rt, b - tOff));
  n.push(...pt(ri, ib), ...pt(ri, ia));
  return { n: n.map(r1), lo, li, tipped };
}
function sectorD({ n, lo, li, tipped }) {
  let i = 0;
  const p = () => `${n[i++]} ${n[i++]}`;
  let d = `M${p()}A${ro} ${ro} 0 ${lo} 1 ${p()}`;
  if (tipped) d += `L${p()}`;
  d += `L${p()}A${ri} ${ri} 0 ${li} 0 ${p()}Z`;
  return d;
}

const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x;
const inOut = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const invInOut = y => y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2;
const outBack = x => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const inCubic = x => x * x * x;

const headHome = 0.9 * TIMING.spin;
const swallowedAt = i => 0.9 * invInOut((SEGS[i][0] - BLUE[1] + 30) / 360) * TIMING.spin;
const dotStart = i => Math.max(headHome + TIMING.delay + i * TIMING.stagger, swallowedAt(i));
const CYCLE = Math.max(TIMING.spin, dotStart(2) + TIMING.pop) + TIMING.hold;

function state(time) {
  const t = clamp(time / TIMING.spin);
  const headRot = 360 * inOut(clamp(t / 0.9));
  const tailRot = 360 * inOut(clamp((t - 0.1) / 0.9));
  const segs = SEGS.map(([a], i) => {
    if (time < dotStart(i)) {
      const e = inCubic(clamp((headRot - (a - BLUE[1])) / 30));
      return { sc: 1 - 0.55 * e, o: 1 - e };
    }
    const p = TIMING.pop > 0 ? clamp((time - dotStart(i)) / TIMING.pop) : 1;
    return { sc: 0.45 + 0.55 * outBack(p), o: clamp(p * 1.8) };
  });
  return { tailRot, stretch: headRot - tailRot, segs };
}

// Keep only the keyframes needed to stay within `tol` of the full 60fps track.
function simplify(times, vals, tol) {
  const lerp = (a, b, f) => a.map((v, k) => v + (b[k] - v) * f);
  const keep = [0];
  let i = 0;
  while (i < vals.length - 1) {
    let j = i + 1;
    for (let k = i + 2; k < vals.length; k++) {
      let ok = true;
      for (let m = i + 1; m < k && ok; m++) {
        const f = (times[m] - times[i]) / (times[k] - times[i]);
        const v = lerp(vals[i], vals[k], f);
        ok = v.every((x, q) => Math.abs(x - vals[m][q]) <= tol);
      }
      if (!ok) break;
      j = k;
    }
    keep.push(j);
    i = j;
  }
  return keep;
}

const N = Math.round(CYCLE * FPS);
const times = Array.from({ length: N + 1 }, (_, k) => (k / N) * CYCLE);
const frames = times.map(state);
const kt = idx => idx.map(k => +(times[k] / CYCLE).toFixed(4)).join(";");
const dur = `${+CYCLE.toFixed(3)}s`;
const anim = (tag, attrs, keys, values) =>
  `<${tag} ${attrs} dur="${dur}" repeatCount="indefinite" keyTimes="${kt(keys)}" values="${values}"/>`;

// Blue arc: rotation carries the tail, a path morph carries only the stretch.
const rotVals = frames.map(f => [f.tailRot]);
const rotKeys = simplify(times, rotVals, 0.15);
const blueShapes = frames.map(f => sectorNums(BLUE[0], BLUE[1] + f.stretch, true));
if (blueShapes.some(s => s.lo !== blueShapes[0].lo || s.li !== blueShapes[0].li)) throw new Error("arc flags changed");
const dKeys = simplify(times, blueShapes.map(s => s.n), 0.25);

const blue = `<g fill="${COLORS.blue}" stroke="${COLORS.blue}">` +
  anim("animateTransform", `attributeName="transform" type="rotate"`, rotKeys,
    rotKeys.map(k => `${r1(rotVals[k][0])} ${C} ${C}`).join(";")) +
  `<path d="${sectorD(blueShapes[0])}">` +
  anim("animate", `attributeName="d"`, dKeys, dKeys.map(k => sectorD(blueShapes[k])).join(";")) +
  `</path></g>`;

const segs = SEGS.map(([a, b], i) => {
  const [cx, cy] = pt((RO + RI) / 2, (a + b) / 2).map(r1);
  const sc = frames.map(f => [f.segs[i].sc]), op = frames.map(f => [f.segs[i].o]);
  const sk = simplify(times, sc, 0.004), ok = simplify(times, op, 0.004);
  return `<g transform="translate(${cx} ${cy})"><g>` +
    anim("animateTransform", `attributeName="transform" type="scale"`, sk, sk.map(k => +sc[k][0].toFixed(3)).join(";")) +
    anim("animate", `attributeName="opacity"`, ok, ok.map(k => +op[k][0].toFixed(3)).join(";")) +
    `<path transform="translate(${-cx} ${-cy})" d="${sectorD(sectorNums(a, b, false))}"/></g></g>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" role="img" aria-label="Loading">` +
  `<circle cx="${C}" cy="${C}" r="250" fill="${COLORS.disc}"/>` +
  `<g transform="translate(${C} ${C}) scale(${+LOGO_SCALE.toFixed(4)}) translate(${-C} ${-C})" stroke-width="${2 * CR}" stroke-linejoin="round">` +
  `<g fill="${COLORS.gray}" stroke="${COLORS.gray}">${segs}</g>${blue}</g></svg>\n`;

const out = path.join(__dirname, "..", "logo-loader.svg");
fs.writeFileSync(out, svg);
console.log(`${out}: ${svg.length} bytes, cycle ${dur}, keyframes rot=${rotKeys.length} d=${dKeys.length}`);
