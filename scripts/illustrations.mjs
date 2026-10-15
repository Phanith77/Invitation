// Original illustrated scenes for the "Lotus Silk" concept: an illustrated couple in
// Khmer wedding attire, lotus ponds, sugar palms, gift trays. Drawn from code (no stock,
// no copied artwork), rendered to JPG into /photos, then `npm run photos` builds WebP.
// Usage: node scripts/illustrations.mjs
import sharp from 'sharp';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';

mkdirSync('photos', { recursive: true });
for (const f of readdirSync('photos')) if (f.startsWith('placeholder-') || f.startsWith('art-')) rmSync(`photos/${f}`);

import { C, id, resetIds, groom, bride, couple } from '../src/art/characters.js';
import { rumdulMark } from '../src/art/rumdulMark.js';

// ── scenery ──
/** Sugar palm (ដើមត្នោត): a tall straight trunk and a round crown of fan-shaped leaves,
 *  with a few dry leaves hanging below the crown. Silhouette in `color`. */
function palm(x, y, h, color, lean = 0) {
  const tx = x + lean, ty = y - h;
  const f = (v) => v.toFixed(1);
  const bw = h * 0.024, tw = h * 0.015;
  const trunk = `<path d="M${f(x - bw)} ${y}Q${f(x + lean * 0.5 - bw * 0.6)} ${f(y - h * 0.5)} ${f(tx - tw)} ${f(ty)}L${f(tx + tw)} ${f(ty)}Q${f(x + lean * 0.5 + bw * 0.6)} ${f(y - h * 0.5)} ${f(x + bw)} ${y}Z" fill="${color}"/>`;
  const R = h * 0.19;
  let crown = '', skirt = '';
  // dry leaves hanging down under the crown
  for (let i = 0; i < 6; i++) {
    const dx = (i - 2.5) * R * 0.16, len = R * (0.7 + (i % 3) * 0.15);
    skirt += `<path d="M${f(tx + dx * 0.4)} ${f(ty)}L${f(tx + dx - R * 0.09)} ${f(ty + len)}L${f(tx + dx + R * 0.09)} ${f(ty + len * 0.96)}Z" fill="${color}"/>`;
  }
  // fan leaves on short stalks, all around, irregular like a real crown; a solid core hides gaps
  let seed = Math.round(x * 7 + h);
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  crown += `<circle cx="${f(tx)}" cy="${f(ty)}" r="${f(R * 0.55)}" fill="${color}"/>`;
  const n = 26;
  for (let i = 0; i < n; i++) {
    const deg = -90 + (i / n) * 360 + (rnd() - 0.5) * 18;
    const a = (deg * Math.PI) / 180;
    const down = Math.sin(a) > 0.45;
    const stalk = R * (down ? 0.3 : 0.38 + rnd() * 0.22);
    const ex = tx + Math.cos(a) * stalk, ey = ty + Math.sin(a) * stalk;
    const r = R * (down ? 0.42 : 0.5 + rnd() * 0.22);
    let fan = `M${f(ex)} ${f(ey)}`;
    const steps = 12;
    for (let k = 0; k <= steps; k++) {
      const b = a + ((k / steps) * 2 - 1) * (58 * Math.PI) / 180;
      const rr = k % 2 ? r * (0.7 + rnd() * 0.1) : r * (0.92 + rnd() * 0.12); // jagged, pleated edge of a palmyra fan
      fan += `L${f(ex + Math.cos(b) * rr)} ${f(ey + Math.sin(b) * rr)}`;
    }
    crown += `<path d="M${f(tx)} ${f(ty)}L${f(ex)} ${f(ey)}" stroke="${color}" stroke-width="${f(h * 0.007)}"/><path d="${fan}Z" fill="${color}"/>`;
  }
  return trunk + skirt + crown;
}

/** Angkor Wat in silhouette: five lotus-bud towers with stepped tiers on three terraces with
 *  long galleries. Drawn from scratch; local units, 600 wide, base at y = 0. */
function angkor(x, y, s, color) {
  const f = (v) => v.toFixed(1);
  const tower = (cx, base, h, w) => {
    const N = 7, hb = h * 0.9, step = hb / N, L = [];
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const w0 = (w / 2) * (1 - Math.pow(t0, 1.5)) * (1 + 0.1 * Math.sin(Math.PI * t0));
      const w1 = (w / 2) * (1 - Math.pow(t1, 1.5)) * (1 + 0.1 * Math.sin(Math.PI * t1));
      const y0 = base - t0 * hb;
      L.push([cx - w0 - w * 0.05, y0], [cx - w0 - w * 0.05, y0 - step * 0.22], [cx - (w0 + w1) / 2, y0 - step * 0.5], [cx - w1, base - t1 * hb]);
    }
    const top = [cx, base - h];
    const R = L.slice().reverse().map(([px, py]) => [2 * cx - px, py]);
    return `<path d="M${[...L, top, ...R].map(([px, py]) => `${f(px)} ${f(py)}`).join('L')}Z"/>`;
  };
  const roof = (x0, x1, yb, hgt) => `<path d="M${x0} ${yb}L${x0 + 10} ${yb - hgt}L${x1 - 10} ${yb - hgt}L${x1} ${yb}Z"/>`;
  return `<g fill="${color}" transform="translate(${x} ${y}) scale(${s})">
    <rect x="-300" y="-28" width="600" height="28"/>${roof(-300, 300, -28, 12)}
    <rect x="-235" y="-72" width="470" height="34"/>${roof(-235, 235, -72, 12)}
    <rect x="-165" y="-118" width="330" height="36"/>${roof(-165, 165, -118, 12)}
    ${tower(-288, -38, 60, 26)}${tower(288, -38, 60, 26)}
    ${tower(-225, -82, 70, 30)}${tower(225, -82, 70, 30)}
    ${tower(-80, -128, 205, 48)}${tower(80, -128, 205, 48)}
    ${tower(-150, -128, 230, 54)}${tower(150, -128, 230, 54)}
    ${tower(0, -128, 300, 70)}
    <path d="M-40 -28L0 -62L40 -28Z"/><path d="M-30 -72L0 -100L30 -72Z"/>
  </g>`;
}
function lotus(x, y, s, open = 1) {
  const p = id('lp');
  const petal = (rot, len, w) => `<path transform="rotate(${rot})" d="M0 0C${-w} ${-len * 0.4} ${-w * 0.6} ${-len * 0.85} 0 ${-len}C${w * 0.6} ${-len * 0.85} ${w} ${-len * 0.4} 0 0Z" fill="url(#${p})" stroke="#b9566a" stroke-width="1.2"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <defs><linearGradient id="${p}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f7e3dd"/><stop offset=".6" stop-color="#ef9fb0"/><stop offset="1" stop-color="#d4607a"/></linearGradient></defs>
    ${[-62 * open, 62 * open, -40 * open, 40 * open].map((r) => petal(r, 70, 26)).join('')}
    ${[-20 * open, 20 * open, 0].map((r) => petal(r, 80, 24)).join('')}
  </g>`;
}
/** rumdul (ផ្ការំដួល): the shared mark (src/art/rumdulMark.js), same drawing as on the site */
function rumdul(x, y, s) {
  const size = 92 * s;
  return `<svg x="${x - size / 2}" y="${y - size * 0.85}" width="${size}" height="${size}" viewBox="0 0 200 200">${rumdulMark({ prefix: id('rm') })}</svg>`;
}
const pad = (x, y, rx, color) => `<path d="M${x} ${y}m${-rx} 0a${rx} ${rx * 0.32} 0 1 0 ${rx * 2} 0a${rx} ${rx * 0.32} 0 0 0 ${-rx * 0.9} ${-rx * 0.3}L${x} ${y}Z" fill="${color}"/>`;
function lantern(x, y, s) {
  const gl = id('lg');
  return `<defs><radialGradient id="${gl}"><stop offset="0" stop-color="#ffd27a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="${x}" cy="${y - 20 * s}" rx="${120 * s}" ry="${90 * s}" fill="url(#${gl})"/>
  <ellipse cx="${x}" cy="${y + 30 * s}" rx="${14 * s}" ry="${70 * s}" fill="url(#${gl})" opacity=".8"/>
  ${lotus(x, y, s * 0.55, 1.25)}
  <path d="M${x} ${y - 40 * s}q${-9 * s} ${-18 * s} 0 ${-40 * s}q${9 * s} ${22 * s} 0 ${40 * s}Z" fill="#ffe9a8"/>`;
}
function bokeh(w, h, n, color, seed = 1, maxR = 60) {
  let s = seed * 9301, out = '';
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) out += `<circle cx="${r() * w}" cy="${r() * h}" r="${8 + r() * maxR}" fill="${color}" opacity="${0.08 + r() * 0.25}"/>`;
  return `<g filter="url(#blur)">${out}</g>`;
}
const blurDef = (sd) => `<filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

// ── scenes ──
const scenes = {
  // golden-hour cover: couple silhouette on a jetty, sugar palms, temple on the horizon, lotus pond
  'art-01-cover': [2000, 1333, () => `
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1630"/><stop offset=".45" stop-color="#8a3a3f"/><stop offset=".72" stop-color="#e3925a"/><stop offset=".8" stop-color="#f7cf86"/></linearGradient>
    <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9894f"/><stop offset=".4" stop-color="#5e2a2c"/><stop offset="1" stop-color="#1c0e14"/></linearGradient>
    <radialGradient id="sun"><stop offset="0" stop-color="#fff3cf"/><stop offset=".35" stop-color="#ffd98f" stop-opacity=".9"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></radialGradient>${blurDef(14)}</defs>
    <rect width="2000" height="1333" fill="url(#sky)"/>
    <circle cx="1000" cy="860" r="420" fill="url(#sun)"/>
    ${angkor(520, 880, 0.95, '#4a1e26')}
    <rect y="880" width="2000" height="453" fill="url(#wat)"/>
    ${Array.from({ length: 26 }, (_, i) => `<rect x="${1000 - 160 + ((i * 53) % 320)}" y="${900 + i * 15}" width="${60 + (i % 5) * 30}" height="3" fill="#ffe2a6" opacity="${0.5 - i * 0.017}"/>`).join('')}
    ${palm(170, 900, 620, '#24101a', 30)}${palm(330, 900, 470, '#2c1420', -20)}${palm(1780, 900, 660, '#24101a', -40)}${palm(1640, 900, 430, '#2c1420', 15)}
    <path d="M760 1000H1240L1260 1016H740Z" fill="#1a0b12"/>
    <g transform="translate(1000 1000) scale(.5)">${couple({ sil: '#1a0b12' })}</g>
    <g transform="translate(1000 1018) scale(.5 -.22)" opacity=".25">${couple({ sil: '#ffcf8a' })}</g>
    ${pad(220, 1210, 150, '#20311f')}${pad(560, 1290, 120, '#1c2b1c')}${pad(1500, 1250, 170, '#20311f')}${pad(1820, 1170, 110, '#1c2b1c')}
    ${lotus(300, 1180, 1.6)}${lotus(1560, 1215, 1.9)}${lotus(1840, 1150, 1.1, 0.8)}`],

  // flat illustrated couple portrait under a gold arch with garlands
  'art-02-couple': [1333, 2000, () => `
    <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5440"/><stop offset="1" stop-color="#0f1d15"/></linearGradient>
    <linearGradient id="arch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7ecd8"/><stop offset="1" stop-color="#e7d3b0"/></linearGradient>${blurDef(10)}</defs>
    <rect width="1333" height="2000" fill="url(#bg)"/>
    ${bokeh(1333, 900, 26, '#f6d48f', 3)}
    <path d="M216 1880V760A450 450 0 0 1 1116 760V1880Z" fill="url(#arch)"/>
    <path d="M196 1880V760A470 470 0 0 1 1136 760V1880" fill="none" stroke="#dcb563" stroke-width="10"/>
    <path d="M236 1880V760A430 430 0 0 1 1096 760V1880" fill="none" stroke="#dcb563" stroke-width="3"/>
    ${[0, 1, 2, 3, 4].map((i) => { const x = 300 + i * 147; return `<path d="M${x} 640Q${x + 73} ${730 + (i % 2) * 24} ${x + 147} 640" fill="none" stroke="#f3efe2" stroke-width="10" stroke-dasharray="2 14" stroke-linecap="round"/>`; }).join('')}
    <ellipse cx="666" cy="1850" rx="420" ry="40" fill="#000" opacity=".18"/>
    <g transform="translate(666 1850) scale(1.32)">${couple()}</g>
    ${rumdul(260, 1900, 1.4)}${rumdul(1080, 1910, 1.6)}`],

  'art-03-groom': [1600, 1600, () => `
    <defs><radialGradient id="bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#f7e6c4"/><stop offset=".7" stop-color="#d9b47a"/><stop offset="1" stop-color="#a8773a"/></radialGradient>${blurDef(8)}</defs>
    <rect width="1600" height="1600" fill="url(#bg)"/>
    ${bokeh(1600, 1600, 18, '#fff7e0', 7, 80)}
    <g opacity=".28">${rumdul(800, 1560, 8)}</g>
    <g transform="translate(800 2950) scale(2.4)">${groom()}</g>`],

  'art-04-bride': [1600, 1600, () => `
    <defs><radialGradient id="bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fbf1d6"/><stop offset=".65" stop-color="#d8c27c"/><stop offset="1" stop-color="#4f6e4a"/></radialGradient>${blurDef(8)}</defs>
    <rect width="1600" height="1600" fill="url(#bg)"/>
    ${bokeh(1600, 1600, 18, '#fff1ec', 11, 80)}
    <g opacity=".28">${rumdul(800, 1560, 8)}</g>
    <g transform="translate(800 2850) scale(2.2)">${bride()}</g>`],

  // night lotus pond with floating lanterns (candlelight section)
  'art-05-lanterns': [2000, 1333, () => `
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0d1f"/><stop offset=".6" stop-color="#2a1a33"/><stop offset="1" stop-color="#4a2433"/></linearGradient>
    <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1a2a"/><stop offset="1" stop-color="#07070f"/></linearGradient>${blurDef(6)}</defs>
    <rect width="2000" height="1333" fill="url(#sky)"/>
    ${Array.from({ length: 90 }, (_, i) => `<circle cx="${(i * 197) % 2000}" cy="${(i * 113) % 520}" r="${1 + (i % 3)}" fill="#fff" opacity="${0.2 + (i % 5) * 0.12}"/>`).join('')}
    <circle cx="1560" cy="200" r="70" fill="#fbeed0"/><circle cx="1560" cy="200" r="140" fill="#fbeed0" opacity=".08"/>
    ${palm(120, 600, 480, '#120a14', 20)}${palm(1880, 600, 520, '#120a14', -25)}
    ${angkor(600, 600, 0.85, '#160d18')}
    <rect y="600" width="2000" height="733" fill="url(#wat)"/>
    <rect x="1530" y="620" width="60" height="420" fill="#fbeed0" opacity=".07"/>
    ${pad(260, 1160, 170, '#142016')}${pad(1720, 1220, 190, '#142016')}${pad(980, 1290, 140, '#101a12')}
    ${lantern(700, 900, 1.1)}${lantern(1150, 820, 0.8)}${lantern(1420, 980, 1.3)}${lantern(420, 1060, 1.5)}${lantern(980, 1120, 1.7)}
    ${lotus(300, 1140, 1.8)}${lotus(1760, 1200, 2)}`],

  // sunrise over rice fields, couple walking among sugar palms
  'art-06-sunrise': [2000, 1333, () => `
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c9a0"/><stop offset=".6" stop-color="#f7dfb6"/><stop offset="1" stop-color="#fbeed2"/></linearGradient>
    <radialGradient id="sun"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/></radialGradient>${blurDef(10)}</defs>
    <rect width="2000" height="1333" fill="url(#sky)"/>
    <circle cx="1400" cy="560" r="300" fill="url(#sun)"/>
    <path d="M0 760Q500 700 1000 750T2000 730V1333H0Z" fill="#c9b27a"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${800 + i * 60}Q1000 ${780 + i * 70} 2000 ${790 + i * 62}" stroke="#a89155" stroke-width="${2 + i}" fill="none" opacity=".5"/>`).join('')}
    <path d="M0 980Q700 900 1300 1000T2000 1060V1333H0Z" fill="#8d9a55"/>
    ${palm(260, 780, 520, '#6f5a3a', 10)}${palm(420, 770, 380, '#7d6845', -10)}${palm(1620, 770, 560, '#6f5a3a', -20)}${palm(1800, 790, 400, '#7d6845', 25)}
    <g transform="translate(980 1090) scale(.52)">${couple()}</g>`],

  // still life: gift trays for the procession
  'art-07-trays': [1600, 1600, () => `
    <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#355e47"/><stop offset="1" stop-color="#122019"/></linearGradient>
    <linearGradient id="tray" x1="0" x2="1"><stop offset="0" stop-color="#a37427"/><stop offset=".5" stop-color="#f6e2a6"/><stop offset="1" stop-color="#a37427"/></linearGradient>${blurDef(10)}</defs>
    <rect width="1600" height="1600" fill="url(#bg)"/>
    ${bokeh(1600, 900, 22, '#f6d48f', 5)}
    <rect y="1120" width="1600" height="480" fill="#f1e4cc"/><rect y="1120" width="1600" height="18" fill="#dcb563"/>
    ${[[400, 1120, 1], [800, 1100, 1.25], [1200, 1120, 1]].map(([x, y, s]) => `
      <g transform="translate(${x} ${y}) scale(${s})">
        <path d="M-40 0H40L60 -40H-60Z" fill="url(#tray)"/><path d="M-150 -40H150L120 -90H-120Z" fill="url(#tray)"/>
        ${[[-80, -120, '#e8892f'], [0, -125, '#f0a03a'], [80, -120, '#e8892f'], [-40, -185, '#f0a03a'], [40, -185, '#e8892f'], [0, -245, '#f3b04a']].map(([cx, cy, c]) => `<circle cx="${cx}" cy="${cy}" r="42" fill="${c}"/><circle cx="${cx - 12}" cy="${cy - 14}" r="10" fill="#fff" opacity=".35"/>`).join('')}
        <path d="M-20 -290Q0 -330 20 -290" stroke="#3f6b2a" stroke-width="10" fill="none"/>
      </g>`).join('')}
    ${[160, 1440].map((x) => `<rect x="${x - 16}" y="900" width="32" height="220" fill="#f6ecdc"/><path d="M${x} 860q-16 -26 0 -56q16 30 0 56Z" fill="#ffd27a"/><circle cx="${x}" cy="840" r="80" fill="#ffcf73" opacity=".18"/>`).join('')}
    ${rumdul(560, 1260, 1.3)}${rumdul(1050, 1270, 1.5)}`],

  // evening garden: couple under string lights
  'art-08-garden': [1333, 2000, () => `
    <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140c1a"/><stop offset=".7" stop-color="#3b1a24"/><stop offset="1" stop-color="#5a2a28"/></linearGradient>${blurDef(12)}</defs>
    <rect width="1333" height="2000" fill="url(#bg)"/>
    ${bokeh(1333, 1600, 40, '#ffcf7a', 9, 50)}
    ${[0, 1, 2, 3].map((k) => { const y = 260 + k * 170; let d = '', b = ''; for (let i = 0; i <= 12; i++) { const x = (1333 * i) / 12, yy = y + Math.sin((i / 12) * Math.PI) * 120; d += `${i ? 'L' : 'M'}${x} ${yy}`; b += `<circle cx="${x}" cy="${yy + 6}" r="9" fill="#ffe2a0"/><circle cx="${x}" cy="${yy + 6}" r="26" fill="#ffd27a" opacity=".22"/>`; } return `<path d="${d}" stroke="#1a1012" stroke-width="3" fill="none"/>${b}`; }).join('')}
    ${palm(120, 1800, 900, '#0f0a10', 30)}${palm(1240, 1820, 820, '#0f0a10', -30)}
    <rect y="1800" width="1333" height="200" fill="#120a0e"/>
    <g transform="translate(666 1810) scale(.9)">${couple({ sil: '#120a0e' })}</g>`],
};

// ── ritual scenes for the ceremony guide (not part of the gallery) ──
function monk(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-95 0C-95 -60 -70 -120 -40 -138L40 -138C70 -120 95 -60 95 0Z" fill="#d9822b"/>
    <path d="M-40 -138C-10 -100 30 -60 60 0L95 0C95 -60 70 -120 40 -138Z" fill="#b8641c"/>
    <path d="M-12 -150L12 -150L14 -134L-14 -134Z" fill="${C.skinShade}"/>
    <ellipse cx="0" cy="-188" rx="36" ry="42" fill="${C.skin}"/>
    <ellipse cx="-36" cy="-186" rx="7" ry="11" fill="${C.skinShade}"/><ellipse cx="36" cy="-186" rx="7" ry="11" fill="${C.skinShade}"/>
    <path d="M-18 -188q7 5 14 0M4 -188q7 5 14 0" stroke="${C.line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </g>`;
}
const candle = (x, y, s = 1) => `<rect x="${x - 7 * s}" y="${y - 60 * s}" width="${14 * s}" height="${60 * s}" fill="#f6ecdc"/><path d="M${x} ${y - 64 * s}q${-8 * s} ${-14 * s} 0 ${-30 * s}q${8 * s} ${16 * s} 0 ${30 * s}Z" fill="#ffd27a"/><circle cx="${x}" cy="${y - 76 * s}" r="${34 * s}" fill="#ffcf73" opacity=".2"/>`;
const dawnBg = (w, h) => `<defs><radialGradient id="bg" cx=".5" cy=".42" r=".8"><stop offset="0" stop-color="#3f6b52"/><stop offset="1" stop-color="#14251c"/></radialGradient>${blurDef(10)}</defs><rect width="${w}" height="${h}" fill="url(#bg)"/>${bokeh(w, h * 0.7, 18, '#f6d48f', 13)}`;
const tray = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 0H40L60 -40H-60Z" fill="url(#tray)"/><path d="M-150 -40H150L120 -90H-120Z" fill="url(#tray)"/>${[[-80, -120], [0, -125], [80, -120], [-40, -185], [40, -185], [0, -245]].map(([cx, cy], i) => `<circle cx="${cx}" cy="${cy}" r="42" fill="${i % 2 ? '#f0a03a' : '#e8892f'}"/>`).join('')}</g>`;
const trayDef = `<defs><linearGradient id="tray" x1="0" x2="1"><stop offset="0" stop-color="#a37427"/><stop offset=".5" stop-color="#f6e2a6"/><stop offset="1" stop-color="#a37427"/></linearGradient></defs>`;
const ring = (n, rx, ry, cx, cy) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, back: Math.sin(a) < 0 }; });
const petalShape = 'M0 0C-8 -14 -6 -26 0 -32C6 -26 8 -14 0 0Z';
function lights(rows, w, top) {
  return Array.from({ length: rows }, (_, k) => {
    let d = '', b = '';
    for (let i = 0; i <= 10; i++) {
      const x = (w * i) / 10, y = top + k * 110 + Math.sin((i / 10) * Math.PI) * 70;
      d += `${i ? 'L' : 'M'}${x} ${y}`;
      b += `<circle cx="${x}" cy="${y + 5}" r="7" fill="#ffe2a0"/><circle cx="${x}" cy="${y + 5}" r="20" fill="#ffd27a" opacity=".2"/>`;
    }
    return `<path d="${d}" stroke="#120a0e" stroke-width="2" fill="none"/>${b}`;
  }).join('');
}
Object.assign(scenes, {
  'rite-gifts': [1200, 800, () => `${dawnBg(1200, 800)}${trayDef}
    <rect y="640" width="1200" height="160" fill="#0f1d15" opacity=".5"/>
    <g fill="#e9c46a"><path d="M300 200Q420 120 540 200Z"/><rect x="417" y="200" width="6" height="320"/></g>
    <g fill="#e9c46a"><path d="M660 220Q780 140 900 220Z"/><rect x="777" y="220" width="6" height="320"/></g>
    ${tray(260, 660, 0.9)}${tray(600, 650, 1.1)}${tray(940, 660, 0.9)}${rumdul(110, 720, 1.2)}${rumdul(1100, 730, 1.3)}`],
  'rite-lotus': [1200, 800, () => `${dawnBg(1200, 800)}
    <rect y="620" width="1200" height="180" fill="#f1e4cc"/><rect y="620" width="1200" height="10" fill="#dcb563"/>
    ${monk(330, 620, 1.2)}${monk(600, 610, 1.3)}${monk(870, 620, 1.2)}
    ${candle(160, 700, 1.4)}${candle(1040, 700, 1.4)}${rumdul(470, 740, 1.1)}${rumdul(730, 740, 1.1)}`],
  'rite-scissors': [1200, 800, () => `${dawnBg(1200, 800)}
    <g transform="translate(600 760) scale(.6)">${couple()}</g>
    <g transform="translate(240 300) rotate(-30)" fill="none" stroke="#e9c46a" stroke-width="10"><circle cx="-30" cy="90" r="28"/><circle cx="30" cy="90" r="28"/><path d="M-14 66L40 -90M14 66L-40 -90"/></g>
    <g transform="translate(960 300) rotate(20)" fill="#e9c46a"><rect x="-90" y="-20" width="180" height="26" rx="8"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${-84 + i * 12.5}" y="6" width="6" height="56" rx="3"/>`).join('')}</g>
    ${Array.from({ length: 16 }, (_, i) => `<path d="${petalShape}" transform="translate(${80 + ((i * 167) % 1040)} ${120 + ((i * 89) % 420)}) rotate(${i * 37})" fill="#ef9fb0" opacity=".7"/>`).join('')}`],
  'rite-rings': [1200, 800, () => `${dawnBg(1200, 800)}
    ${ring(12, 430, 110, 600, 640).filter((c) => c.back).map((c) => candle(c.x, c.y, 0.9)).join('')}
    <g transform="translate(600 660) scale(.58)">${couple()}</g>
    ${ring(12, 430, 110, 600, 640).filter((c) => !c.back).map((c) => candle(c.x, c.y, 1.1)).join('')}
    <path d="M300 520C320 440 280 380 310 300M900 520C880 430 930 380 900 290" stroke="#f6ecdc" stroke-width="4" fill="none" opacity=".3" stroke-linecap="round"/>`],
  'rite-thread': [1200, 800, () => `${dawnBg(1200, 800)}
    <g transform="translate(600 900) scale(.82)">${couple()}</g>
    <g fill="none" stroke-linecap="round">
      <path d="M560 470C520 430 540 400 580 410C620 420 640 460 610 480C580 500 520 480 500 440" stroke="#f6ecdc" stroke-width="5"/>
      <path d="M100 300C260 340 380 420 560 470M1100 300C940 340 820 420 640 470" stroke="#f6ecdc" stroke-width="3" stroke-dasharray="2 10" opacity=".8"/>
      <path d="M580 470C610 440 650 450 640 480" stroke="#d94a5a" stroke-width="5"/>
    </g>`],
  'rite-feast': [1200, 800, () => `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c0e16"/><stop offset="1" stop-color="#4a1a22"/></linearGradient>${blurDef(10)}</defs>
    <rect width="1200" height="800" fill="url(#bg)"/>${bokeh(1200, 520, 34, '#ffcf7a', 17, 40)}
    ${lights(2, 1200, 90)}
    <path d="M80 560H1120L1180 800H20Z" fill="#f6ecdc"/><path d="M80 560H1120V578H80Z" fill="#dcb563"/>
    ${[260, 600, 940].map((x) => `<ellipse cx="${x}" cy="640" rx="120" ry="34" fill="#fff" stroke="#dcb563" stroke-width="4"/><ellipse cx="${x}" cy="630" rx="70" ry="18" fill="#e8892f"/><circle cx="${x - 30}" cy="622" r="12" fill="#3f6b2a"/>`).join('')}
    ${[160, 430, 770, 1040].map((x) => `<path d="M${x - 18} 520H${x + 18}L${x + 10} 570C${x + 6} 580 ${x - 6} 580 ${x - 10} 570Z" fill="#f6e2a6" opacity=".8"/><rect x="${x - 2}" y="575" width="4" height="30" fill="#dcb563"/>`).join('')}
    ${candle(430, 560, 1)}${candle(770, 560, 1)}`],
});

// ── more ritual scenes: one illustration for every row of the two-day programme ──
const smoke = (x, y, s = 1) => `<path d="M${x} ${y}c${-14 * s} ${-30 * s} ${14 * s} ${-50 * s} 0 ${-80 * s}s${14 * s} ${-50 * s} 0 ${-80 * s}" stroke="#f6ecdc" stroke-width="${3 * s}" fill="none" opacity=".45" stroke-linecap="round"/>`;
// banana-leaf offering cone (បាយសី), tiered green with gold bands and a flower on top
const baysei = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-70 0H70L50 -26H-50Z" fill="url(#tray)"/>
  ${[0, 1, 2, 3, 4].map((k) => { const w = 58 - k * 11, b = -26 - k * 42; return `<path d="M${-w} ${b}L${w} ${b}L${w - 8} ${b - 44}L${-w + 8} ${b - 44}Z" fill="${k % 2 ? '#3f8a3c' : '#2f6f2c'}"/><rect x="${-w}" y="${b - 6}" width="${w * 2}" height="6" fill="#e9c46a"/>`; }).join('')}
  <circle cx="0" cy="-252" r="16" fill="#f6d652" stroke="#c99a1e" stroke-width="3"/></g>`;
const dayBg = (w, h) => `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d9a0"/><stop offset=".6" stop-color="#f3c27a"/><stop offset="1" stop-color="#d98f4e"/></linearGradient>${blurDef(10)}</defs><rect width="${w}" height="${h}" fill="url(#bg)"/>${bokeh(w, h * 0.6, 14, '#fff3d6', 31)}`;
const duskBg = (w, h) => `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26142a"/><stop offset="1" stop-color="#6a2c36"/></linearGradient>${blurDef(10)}</defs><rect width="${w}" height="${h}" fill="url(#bg)"/>${bokeh(w, h * 0.6, 30, '#ffcf7a', 41, 40)}`;
// scalloped canopy edge of the wedding pavilion
const canopy = (w, y, c1, c2) => `<rect x="0" y="0" width="${w}" height="${y}" fill="${c1}"/>${Array.from({ length: Math.ceil(w / 100) }, (_, i) => `<path d="M${i * 100} ${y}q50 60 100 0Z" fill="${i % 2 ? c1 : c2}"/><circle cx="${i * 100 + 50}" cy="${y + 34}" r="6" fill="#e9c46a"/>`).join('')}<rect x="0" y="${y - 10}" width="${w}" height="10" fill="#e9c46a"/>`;
const column = (x, top, bottom) => `<rect x="${x - 16}" y="${top}" width="32" height="${bottom - top}" fill="#f6ecdc"/>${Array.from({ length: Math.floor((bottom - top) / 60) }, (_, i) => `<path d="M${x - 16} ${top + 20 + i * 60}l32 24" stroke="#e9c46a" stroke-width="6"/>`).join('')}`;
const dish = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="78" ry="22" fill="#fff" stroke="#dcb563" stroke-width="3"/><ellipse cx="${x}" cy="${y - 6}" rx="46" ry="12" fill="${c}"/>`;
const glass = (x, y, s = 1, tilt = 0) => `<g transform="translate(${x} ${y}) rotate(${tilt}) scale(${s})"><path d="M-22 -120H22L18 -50C16 -34 -16 -34 -18 -50Z" fill="#f6e2a6" opacity=".9"/><path d="M-20 -96H20L18 -50C16 -34 -16 -34 -18 -50Z" fill="#f2c94c"/><rect x="-3" y="-36" width="6" height="40" fill="#f6ecdc"/><ellipse cx="0" cy="6" rx="22" ry="6" fill="#f6ecdc"/></g>`;
const confetti = (w, h, n, seed) => Array.from({ length: n }, (_, i) => { const x = (i * 197 + seed * 53) % w, y = (i * 131 + seed * 29) % h; return `<rect x="${x}" y="${y}" width="10" height="18" rx="2" fill="${['#f2c94c', '#ef9fb0', '#f6ecdc', '#9fd3a8'][i % 4]}" transform="rotate(${i * 47} ${x} ${y})" opacity=".85"/>`; }).join('');
// palm blossoms (ផ្កាស្លា): little cream sprigs
const sprig = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0V-34" stroke="#c9b48a" stroke-width="3"/>${[-26, -16, -6].map((yy, k) => `<circle cx="${k % 2 ? 6 : -6}" cy="${yy}" r="6" fill="#fff4d6"/>`).join('')}</g>`;
function roneat(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-260 -40Q0 40 260 -40L230 40Q0 110 -230 40Z" fill="#7a3b1a"/><path d="M-260 -40Q0 40 260 -40" stroke="#e9c46a" stroke-width="8" fill="none"/>
    ${Array.from({ length: 15 }, (_, i) => { const xx = -210 + i * 30, yy = -30 + Math.abs(xx) * -0.0 + (xx * xx) / 4000; return `<rect x="${xx - 11}" y="${yy - 26}" width="22" height="${70 - i * 2}" rx="4" fill="#d9a35a" stroke="#8a5a22" stroke-width="2"/>`; }).join('')}
    <path d="M-90 120L-40 40M90 120L40 40" stroke="#5a2a10" stroke-width="14"/><rect x="-120" y="110" width="240" height="20" rx="8" fill="#5a2a10"/></g>`;
}
const drum = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-70 -120Q-90 -60 -70 0H70Q90 -60 70 -120Z" fill="#8a2a22"/><ellipse cx="0" cy="-120" rx="70" ry="20" fill="#f1e4cc" stroke="#5a2a10" stroke-width="5"/>${[-50, -20, 10, 40].map((xx) => `<path d="M${xx} -112L${xx + 10} -6" stroke="#e9c46a" stroke-width="4"/>`).join('')}<path d="M-70 0H70L60 30H-60Z" fill="#5a2a10"/></g>`;
const note = (x, y, s, o) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#f6d48f" opacity="${o}"><ellipse cx="0" cy="0" rx="14" ry="10" transform="rotate(-20)"/><rect x="11" y="-60" width="4" height="60"/><path d="M15 -60q20 10 18 30q-6 -14 -18 -16Z"/></g>`;
function cake(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="6" rx="120" ry="18" fill="#dcb563"/>
    ${[[110, 90], [82, 80], [56, 70]].map(([w, h], k) => { const b = -k * 86; return `<rect x="${-w}" y="${b - h}" width="${w * 2}" height="${h}" rx="10" fill="#fff8ea"/><path d="M${-w} ${b - h + 10}q${w / 4} 22 ${w / 2} 0t${w / 2} 0t${w / 2} 0t${w / 2} 0" stroke="#f2c94c" stroke-width="6" fill="none"/>`; }).join('')}
    ${rumdul(0, -258, 1.1)}</g>`;
}
Object.assign(scenes, {
  // ថ្ងៃចូលរោង: offering to Krong Pealy, the guardian of the land
  'rite-pealy': [1200, 800, () => `${dawnBg(1200, 800)}${trayDef}
    ${palm(120, 700, 520, '#0f1d15', -20)}${palm(1090, 700, 470, '#0f1d15', 24)}
    <rect y="650" width="1200" height="150" fill="#0f1d15" opacity=".55"/>
    <path d="M300 600H900L930 660H270Z" fill="#7a3b1a"/><rect x="300" y="590" width="600" height="14" fill="#e9c46a"/>
    ${baysei(430, 590, 0.9)}${baysei(770, 590, 0.9)}
    <path d="M560 590H640L630 548H570Z" fill="url(#tray)"/>${[580, 600, 620].map((x, k) => `<rect x="${x - 2}" y="${430 + (k % 2) * 16}" width="4" height="${120 - (k % 2) * 16}" fill="#c4551e"/><circle cx="${x}" cy="${430 + (k % 2) * 16}" r="4" fill="#ff8a3a"/>${smoke(x, 426 + (k % 2) * 16, 1)}`).join('')}
    ${candle(330, 590, 1.1)}${candle(870, 590, 1.1)}${rumdul(520, 720, 1)}${rumdul(690, 720, 1)}`],
  // the wedding pavilion opens; relatives gather
  'rite-pavilion': [1200, 800, () => `${dayBg(1200, 800)}
    ${angkor(600, 600, 0.9, '#d89a5c')}
    <rect y="600" width="1200" height="200" fill="#c9783e" opacity=".55"/>
    ${canopy(1200, 150, '#fff8ea', '#f6e2a6')}
    ${column(110, 150, 720)}${column(1090, 150, 720)}${column(420, 150, 700)}${column(780, 150, 700)}
    ${[200, 350, 500, 650, 800, 950].map((x, i) => `<path d="M${x} 200v${60 + (i % 3) * 30}" stroke="#e9c46a" stroke-width="2"/>${rumdul(x, 300 + (i % 3) * 30, 0.6)}`).join('')}
    <path d="M420 700Q600 640 780 700" stroke="#e9c46a" stroke-width="5" fill="none"/>
    ${rumdul(110, 760, 1.3)}${rumdul(1090, 770, 1.3)}${rumdul(600, 760, 1)}`],
  // the betel tray (ខាន់ស្លា) presented to the bride's parents
  'rite-khansla': [1200, 800, () => `${dawnBg(1200, 800)}${trayDef}
    <rect y="620" width="1200" height="180" fill="#f1e4cc"/><rect y="620" width="1200" height="10" fill="#dcb563"/>
    <ellipse cx="600" cy="680" rx="260" ry="40" fill="url(#tray)"/>
    ${baysei(600, 660, 1.45)}
    ${[-200, -150, 150, 200].map((dx, k) => `<path d="M${600 + dx} 650c-30 -40 -10 -80 20 -90c10 40 0 70 -20 90Z" fill="${k % 2 ? '#3f8a3c' : '#2f6f2c'}"/>`).join('')}
    ${candle(250, 700, 1.4)}${candle(950, 700, 1.4)}${rumdul(150, 760, 1.1)}${rumdul(1050, 760, 1.1)}`],
  // the family dinner on the first evening
  'rite-dinner': [1200, 800, () => `${duskBg(1200, 800)}
    ${lights(1, 1200, 80)}
    ${lantern(220, 300, 0.9)}${lantern(980, 300, 0.9)}
    <path d="M60 560H1140L1190 800H10Z" fill="#f6ecdc"/><path d="M60 560H1140V578H60Z" fill="#dcb563"/>
    ${dish(240, 640, '#c4551e')}${dish(600, 650, '#3f8a3c')}${dish(960, 640, '#e8a640')}${dish(420, 720, '#f2c94c')}${dish(780, 720, '#a84a5f')}
    ${[330, 870].map((x) => `<rect x="${x - 26}" y="560" width="52" height="40" rx="6" fill="#fff" stroke="#dcb563" stroke-width="3"/><ellipse cx="${x}" cy="562" rx="26" ry="8" fill="#f1e4cc"/>`).join('')}
    ${candle(520, 620, 0.9)}${candle(680, 620, 0.9)}`],
  // traditional wedding music (ភ្លេងការ)
  'rite-music': [1200, 800, () => `${duskBg(1200, 800)}
    ${lights(1, 1200, 70)}
    <rect y="640" width="1200" height="160" fill="#2a1418" opacity=".7"/>
    ${roneat(600, 560, 1.15)}${drum(190, 700, 1.2)}${drum(1010, 700, 1.2)}
    ${note(330, 300, 1.2, 0.8)}${note(860, 260, 1, 0.7)}${note(520, 210, 0.8, 0.5)}${note(720, 330, 0.9, 0.6)}`],
  // palm blossoms showered on the couple
  'rite-petals': [1200, 800, () => `${dawnBg(1200, 800)}
    <g transform="translate(600 900) scale(.82)">${couple()}</g>
    ${Array.from({ length: 34 }, (_, i) => sprig(40 + ((i * 173) % 1120), 60 + ((i * 97) % 560), i * 41)).join('')}
    ${Array.from({ length: 12 }, (_, i) => `<path d="${petalShape}" transform="translate(${70 + ((i * 211) % 1060)} ${90 + ((i * 113) % 480)}) rotate(${i * 53})" fill="#f6d652" opacity=".75"/>`).join('')}`],
  // lunch under the pavilion
  'rite-lunch': [1200, 800, () => `${dayBg(1200, 800)}
    ${palm(90, 640, 460, '#b8642e', -10)}${palm(1110, 640, 430, '#b8642e', 16)}
    ${canopy(1200, 120, '#fff8ea', '#f6e2a6')}
    <path d="M60 540H1140L1190 800H10Z" fill="#fff8ea"/><path d="M60 540H1140V558H60Z" fill="#e9c46a"/>
    ${dish(250, 620, '#e8892f')}${dish(600, 630, '#3f8a3c')}${dish(950, 620, '#c4551e')}${dish(420, 710, '#f2c94c')}${dish(780, 710, '#8a5f22')}
    ${[340, 860].map((x) => `<path d="M${x - 40} 560c0 -40 80 -40 80 0Z" fill="#e8892f"/><circle cx="${x - 14}" cy="${535}" r="14" fill="#f0a03a"/><circle cx="${x + 14}" cy="${535}" r="14" fill="#e8892f"/><circle cx="${x}" cy="${515}" r="14" fill="#f2c94c"/>`).join('')}`],
  // the couple welcome guests at the door; photos
  'rite-welcome': [1200, 800, () => `${duskBg(1200, 800)}
    <path d="M330 800V320Q600 40 870 320V800" stroke="#e9c46a" stroke-width="16" fill="none"/>
    <path d="M360 800V330Q600 90 840 330V800" stroke="#f6ecdc" stroke-width="4" fill="none" opacity=".6"/>
    ${[...Array(9)].map((_, i) => { const a = Math.PI * (0.05 + i * 0.1125); return rumdul(600 - Math.cos(a) * 270, 330 - Math.sin(a) * 240 + 20, 0.75); }).join('')}
    <g transform="translate(600 900) scale(.7)">${couple({ eyes: 'open' })}</g>
    ${[[160, 220], [1040, 200], [200, 520], [1010, 540]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="70" fill="#fff6dd" opacity=".18"/><path d="M${x} ${y - 40}L${x + 8} ${y - 8}L${x + 40} ${y}L${x + 8} ${y + 8}L${x} ${y + 40}L${x - 8} ${y + 8}L${x - 40} ${y}L${x - 8} ${y - 8}Z" fill="#fff6dd" opacity=".8"/>`).join('')}
    ${rumdul(330, 790, 1.2)}${rumdul(870, 790, 1.2)}`],
  // cake, toast and dancing
  'rite-dance': [1200, 800, () => `${duskBg(1200, 800)}
    ${lights(2, 1200, 70)}${confetti(1200, 560, 40, 3)}
    <g transform="translate(600 920) scale(.74)">${couple({ eyes: 'open' })}</g>
    ${cake(200, 760, 1.1)}
    ${glass(960, 760, 1.4, -14)}${glass(1050, 760, 1.4, 14)}
    <path d="M985 560l10 -40M1000 570l30 -30M970 570l-20 -34" stroke="#f6d48f" stroke-width="4" stroke-linecap="round"/>`],
});

// ── wedding party portraits (round frames on the site) ──
const portraitBg = (c0, c1) => `<defs><radialGradient id="bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></radialGradient>${blurDef(8)}</defs><rect width="800" height="800" fill="url(#bg)"/>${bokeh(800, 800, 10, '#fff8e8', 23, 60)}`;
Object.assign(scenes, {
  'party-groomsman': [800, 800, () => `${portraitBg('#f3ead0', '#9fbf94')}
    <g transform="translate(400 1490) scale(1.3)">${groom({ pal: { goldDeep: '#1f5a3a', gold: '#3f8a5c', sampot: ['#1f5a3a', '#3f8a5c', '#174a2f'] } })}</g>`],
  'party-bridesmaid': [800, 800, () => `${portraitBg('#fbf1d6', '#d9c27c')}
    <g transform="translate(400 1430) scale(1.32)">${bride({ crown: false, pal: { crimson: '#3f8a5c', crimsonDeep: '#1f5a3a', rose: '#8fc79a' } })}</g>`],
  'party-flower': [800, 800, () => `${portraitBg('#fdf3dc', '#e9b9a8')}
    <g transform="translate(400 1430) scale(1.32)">${bride({ crown: false, bouquet: true, pal: { crimson: '#d9798d', crimsonDeep: '#a84a5f', rose: '#f3b6c2' } })}</g>`],
  // a child: the same character drawn smaller, so the whole little figure fits the frame
  'party-child': [800, 800, () => `${portraitBg('#fbf1d6', '#b9d7a8')}
    <g transform="translate(400 760) scale(.62)">${groom({ pal: { ivory: '#fff8ea', goldDeep: '#c99a1e', sampot: ['#c47a1e', '#e8a640', '#a8620f'] } })}</g>
    ${rumdul(170, 700, 1.1)}${rumdul(640, 720, 0.9)}`],
  'party-flower-boy': [800, 800, () => `${portraitBg('#fdf3dc', '#a9cbb0')}
    <g transform="translate(400 1490) scale(1.3)">${groom({ bouquet: true, pal: { ivory: '#fff8ea', goldDeep: '#2f6f8a', gold: '#5fa3bd', sampot: ['#2f6f8a', '#5fa3bd', '#245a70'] } })}</g>`],
  'party-child-girl': [800, 800, () => `${portraitBg('#fdf3dc', '#efc0b4')}
    <g transform="translate(400 740) scale(.6)">${bride({ crown: false, pal: { crimson: '#e58aa0', crimsonDeep: '#b85a72', rose: '#f8c6d0' } })}</g>
    ${rumdul(170, 700, 1.1)}${rumdul(640, 720, 0.9)}`],
  'party-escort': [800, 800, () => `${portraitBg('#f1e6d2', '#c9a7c8')}
    <g transform="translate(400 1430) scale(1.32)">${bride({ crown: false, pal: { crimson: '#6b3f7a', crimsonDeep: '#4a2756', rose: '#a77fb5', goldLight: '#e9d9a8' } })}</g>`],
  'party-father': [800, 800, () => `${portraitBg('#f3ead0', '#c9b48a')}
    <g transform="translate(400 1490) scale(1.3)">${groom({ pal: { hair: '#6f6a66', goldDeep: '#7a5a1e', gold: '#b08a3e', sampot: ['#5a3d1a', '#86602c', '#4a3214'] } })}</g>`],
  'party-mother': [800, 800, () => `${portraitBg('#f6ecd8', '#d2b48f')}
    <g transform="translate(400 1430) scale(1.32)">${bride({ crown: false, pal: { hair: '#6f6a66', crimson: '#8a4b2a', crimsonDeep: '#5e3019', rose: '#c99572' } })}</g>`],
  'party-mc': [800, 800, () => `${portraitBg('#f1e6d2', '#c9b089')}
    <g transform="translate(400 1490) scale(1.3)">${groom({ mic: true, pal: { ivory: '#2a3552', ivoryShade: '#1d2740', goldDeep: '#c99a1e', sampot: ['#2b2b33', '#4a4a55', '#22222a'] } })}</g>`],
});

for (const [name, [w, h, draw]] of Object.entries(scenes)) {
  resetIds();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${draw()}</svg>`;
  const grain = await sharp('public/textures/paper-card.webp').resize(256).toBuffer();
  await sharp(Buffer.from(svg))
    .composite([{ input: grain, tile: true, blend: 'over' }]) // printed grain
    .jpeg({ quality: 90 })
    .toFile(`photos/${name}.jpg`);
  console.log('✓', name);
}
