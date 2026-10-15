// The rumdul mark (ផ្ការំដួល): a rosette of pointed green leaves, three pointed yellow petals with
// a lighter inner panel, and a round three-lobed heart with a Y seam. One drawing, used everywhere:
// section crests, the name logo, corners, dividers, illustrations, the app icon.
// Returns SVG markup for viewBox "0 0 200 200" (centre 100,100). Pure JS (also used by node scripts).
//
// Petals/heart are <g class="petal">, leaves <g class="leaf">, so existing GSAP animations
// (petals scaling open from the centre) keep working. Colours are inline styles, which win over
// the gold-foil CSS those classes have elsewhere.

const C = 100;
const rot = (x, y, deg) => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [C + x * c - y * s, C + x * s + y * c];
};
const pts = (list, deg) => list.map(([x, y]) => rot(x, y, deg).map((v) => v.toFixed(1)).join(' '));

/** lens shape from (0,r0) outward to the tip at distance r0+len, width w, pointing "up" before rotation */
function lens(deg, r0, len, w, round = 0.25) {
  const y0 = -r0, y1 = -(r0 + len);
  const [a, b, c, d, e, f, g] = pts([[0, y0], [-w, y0 - len * round], [-w * 0.8, y0 - len * 0.75], [0, y1], [w * 0.8, y0 - len * 0.75], [w, y0 - len * round], [0, y0]], deg);
  return `M${a}C${b} ${c} ${d}C${e} ${f} ${g}Z`;
}
function line(deg, r0, r1) {
  const [a, b] = pts([[0, -r0], [0, -r1]], deg);
  return `M${a}L${b}`;
}

export function rumdulMark({ prefix = 'rm', leaves = true } = {}) {
  const P = `${prefix}`;
  const keep = 'filter:none'; // ignore the "light section" foil dimming
  const origin = `transform-origin:${C}px ${C}px`;
  const defs = `<defs>
    <linearGradient id="${P}-lf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3e8f35"/><stop offset="1" stop-color="#6cbf4a"/></linearGradient>
    <linearGradient id="${P}-lf2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2f7a2c"/><stop offset="1" stop-color="#55a83e"/></linearGradient>
    <linearGradient id="${P}-pt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#eeb32e"/><stop offset="1" stop-color="#f9d45a"/></linearGradient>
    <radialGradient id="${P}-bl" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fbe08a"/><stop offset=".6" stop-color="#f2c043"/><stop offset="1" stop-color="#d9a12a"/></radialGradient>
  </defs>`;

  let leafRing = '';
  if (leaves) {
    // back ring: ten long leaves; front ring: ten shorter ones between them
    for (let i = 0; i < 10; i++) {
      const d = i * 36 + 18;
      leafRing += `<g class="leaf" style="${keep};${origin}"><path d="${lens(d, 20, 74, 17)}" fill="url(#${P}-lf2)" stroke="#2a6a26" stroke-width="2" stroke-linejoin="round"/><path d="${line(d, 28, 86)}" stroke="#8fd16a" stroke-width="1.6" stroke-linecap="round"/></g>`;
    }
    for (let i = 0; i < 10; i++) {
      const d = i * 36;
      leafRing += `<g class="leaf" style="${keep};${origin}"><path d="${lens(d, 18, 60, 15)}" fill="url(#${P}-lf)" stroke="#2f7a2c" stroke-width="2" stroke-linejoin="round"/><path d="${line(d, 26, 70)}" stroke="#a6dd7a" stroke-width="1.5" stroke-linecap="round"/></g>`;
    }
  }

  // three pointed petals (up, lower-right, lower-left) with a lighter inner panel
  let petals = '';
  for (const d of [0, 120, 240]) {
    petals += `<g class="petal" style="${keep};${origin}">
      <path d="${lens(d, 6, 64, 36, 0.34)}" fill="url(#${P}-pt)" stroke="#b07d1e" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="${lens(d, 24, 38, 21, 0.32)}" fill="#fde9a6" opacity=".9"/>
    </g>`;
  }

  // the round heart: three lobes joined by a Y seam
  const seams = [0, 120, 240].map((d) => line(d + 60, 0, 22)).join('');
  const heart = `<g class="petal" style="${keep};${origin}">
    <circle cx="${C}" cy="${C}" r="23" fill="url(#${P}-bl)" stroke="#a87418" stroke-width="2.4"/>
    <path d="${seams}" stroke="#a87418" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="${C - 7}" cy="${C - 9}" r="4" fill="#fff6d4" opacity=".7"/>
  </g>`;

  return `${defs}${leafRing}${petals}${heart}`;
}
