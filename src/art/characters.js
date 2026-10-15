// The illustrated couple, drawn from code. Shared by scripts/illustrations.mjs (rendered
// artwork) and the site's AnimatedCouple (live SVG with blinking eyes and a swaying sbai).

export const C = {
  skin: '#c88b5f', skinShade: '#ad7450', hair: '#1c1210', ivory: '#f6ecdc', ivoryShade: '#dfcfb2',
  gold: '#dcb563', goldLight: '#f6e2a6', goldDeep: '#a37427', crimson: '#8f1d2c', crimsonDeep: '#5f0f1c',
  rose: '#c4566a', line: '#4a2c22', blush: '#e08a7a', shoe: '#2a1a14',
};

let uid = 0;
export const id = (p) => `${p}${++uid}`;
export const resetIds = () => { uid = 0; };

// ── characters (local units: feet at y=0, ~1000 tall, centred on x=0) ──
function face(cx, cy, s = 1, open = false) {
  // open eyes (with a blink hook) for the animated web version; serene closed eyes for the artwork
  const eyes = open
    ? `<g class="eyes"><ellipse cx="${cx - 20 * s}" cy="${cy}" rx="${6.5 * s}" ry="${8 * s}" fill="${C.line}"/><ellipse cx="${cx + 20 * s}" cy="${cy}" rx="${6.5 * s}" ry="${8 * s}" fill="${C.line}"/><circle cx="${cx - 18 * s}" cy="${cy - 3 * s}" r="${2 * s}" fill="#fff"/><circle cx="${cx + 22 * s}" cy="${cy - 3 * s}" r="${2 * s}" fill="#fff"/></g>`
    : '';
  return `${eyes}<g stroke="${C.line}" stroke-width="${3 * s}" stroke-linecap="round" fill="none">
    ${open ? '' : `<path d="M${cx - 30 * s} ${cy}q${10 * s} ${7 * s} ${20 * s} 0M${cx + 10 * s} ${cy}q${10 * s} ${7 * s} ${20 * s} 0"/>`}
    <path d="M${cx - 32 * s} ${cy - 16 * s}q${12 * s} ${-7 * s} ${24 * s} ${-2 * s}M${cx + 8 * s} ${cy - 18 * s}q${12 * s} ${-5 * s} ${24 * s} ${2 * s}" stroke-width="${2.6 * s}"/>
    <path d="M${cx - 2 * s} ${cy + 10 * s}q${3 * s} ${10 * s} ${-3 * s} ${12 * s}" stroke-width="${2 * s}" opacity=".6"/>
    <path d="M${cx - 11 * s} ${cy + 32 * s}q${11 * s} ${9 * s} ${22 * s} 0" stroke="#7a2e2a"/>
  </g>
  <circle cx="${cx - 28 * s}" cy="${cy + 20 * s}" r="${10 * s}" fill="${C.blush}" opacity=".35"/>
  <circle cx="${cx + 28 * s}" cy="${cy + 20 * s}" r="${10 * s}" fill="${C.blush}" opacity=".35"/>`;
}

// a small bouquet of rumdul held at the chest (flower bearers)
const posy = (x, wrap, y = -600) => `<g transform="translate(${x} ${y})">
    <path d="M-6 0L6 0L14 70L-14 70Z" fill="#3f8a3c"/><path d="M-20 64Q0 50 20 64L14 78L-14 78Z" fill="${wrap}"/>
    ${[[-30, -6], [0, -22], [30, -6], [-16, 14], [16, 14], [0, 2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#f6d652" stroke="#c99a1e" stroke-width="3"/><circle cx="${x}" cy="${y}" r="5" fill="#e2b52f"/>`).join('')}
    ${[[-44, 6], [44, 6], [-36, -26], [36, -26]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="7" fill="#4fae3e" transform="rotate(${x > 0 ? 30 : -30} ${x} ${y})"/>`).join('')}
  </g>`;

export function groom({ sil = null, eyes = 'closed', pal = {}, mic = false, bouquet = false } = {}) {
  const K = { ...C, sampot: ['#8a5f22', '#c4954a', '#7d541c'], ...pal };
  const f = (c) => sil || c;
  const g = id('gg'), s = id('gs');
  return `<g>
  <defs>
    <linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${f(K.goldDeep)}"/><stop offset=".45" stop-color="${f(K.gold)}"/><stop offset="1" stop-color="${f(K.goldDeep)}"/></linearGradient>
    <linearGradient id="${s}" x1="0" x2="1"><stop offset="0" stop-color="${f(K.sampot[0])}"/><stop offset=".5" stop-color="${f(K.sampot[1])}"/><stop offset="1" stop-color="${f(K.sampot[2])}"/></linearGradient>
  </defs>
  <path d="M-92 -252L-30 -252L-36 -40L-80 -40Z" fill="${f(K.ivory)}"/><path d="M92 -252L30 -252L36 -40L80 -40Z" fill="${f(K.ivory)}"/>
  <ellipse cx="-60" cy="-30" rx="36" ry="16" fill="${f(K.shoe)}"/><ellipse cx="60" cy="-30" rx="36" ry="16" fill="${f(K.shoe)}"/>
  <path d="M-114 -468L114 -468C124 -400 122 -320 100 -250L22 -250L4 -330L-4 -330L-22 -250L-100 -250C-122 -320 -124 -400 -114 -468Z" fill="url(#${s})"/>
  ${sil ? '' : `<path d="M-62 -460Q-74 -360 -58 -262M62 -460Q74 -360 58 -262M0 -460V-336" stroke="#6b4716" stroke-width="3" fill="none" opacity=".55"/>`}
  <path d="M-108 -760C-126 -680 -132 -600 -128 -530" stroke="${f(K.ivory)}" stroke-width="44" stroke-linecap="round" fill="none"/>
  <path d="M-24 -800C-60 -796 -96 -786 -112 -768C-122 -700 -120 -580 -114 -468L114 -468C120 -580 122 -700 112 -768C96 -786 60 -796 24 -800Z" fill="${f(K.ivory)}"/>
  ${sil ? '' : `<path d="M0 -792V-470" stroke="${K.ivoryShade}" stroke-width="3"/>
  ${[-770, -720, -670, -620, -570, -520].map((y) => `<circle cx="7" cy="${y}" r="5" fill="${K.goldDeep}"/>`).join('')}
  <path d="M-112 -768C-118 -700 -116 -580 -112 -470L-80 -470C-90 -600 -92 -700 -86 -780Z" fill="${K.ivoryShade}" opacity=".5"/>`}
  <path d="M-96 -782L-68 -792L104 -500L80 -480Z" fill="url(#${g})"/>
  <rect x="-114" y="-482" width="228" height="20" fill="url(#${g})"/>
  <path d="M-26 -808L26 -808L24 -790L-24 -790Z" fill="url(#${g})"/>
  <path d="M108 -760C130 -690 145 -610 150 -540" stroke="${f(K.ivory)}" stroke-width="42" stroke-linecap="round" fill="none"/>
  <path d="M-17 -826L17 -826L19 -796L-19 -796Z" fill="${f(K.skinShade)}"/>
  <circle cx="-128" cy="-506" r="17" fill="${f(K.skin)}"/><circle cx="152" cy="-516" r="17" fill="${f(K.skin)}"/>
  <ellipse cx="-53" cy="-875" rx="9" ry="15" fill="${f(K.skinShade)}"/><ellipse cx="53" cy="-875" rx="9" ry="15" fill="${f(K.skinShade)}"/>
  <ellipse cx="0" cy="-880" rx="52" ry="62" fill="${f(K.skin)}"/>
  <path d="M-55 -884C-62 -950 -20 -970 4 -968C42 -966 64 -940 56 -882C50 -912 30 -930 0 -930C-30 -930 -48 -914 -55 -884Z" fill="${f(K.hair)}"/>
  ${sil ? '' : face(0, -878, 1, eyes === 'open')}
  ${mic ? `<path d="M150 -520L118 -640" stroke="#2a2a2a" stroke-width="12" stroke-linecap="round"/><ellipse cx="114" cy="-656" rx="16" ry="20" fill="#3a3a3a"/><ellipse cx="110" cy="-662" rx="6" ry="8" fill="#777"/>` : ''}
  ${bouquet && !sil ? posy(10, K.gold, -690) : ''}
</g>`;
}

export function bride({ sil = null, eyes = 'closed', pal = {}, crown = true, bouquet = false } = {}) {
  const K = { ...C, ...pal };
  const f = (c) => sil || c;
  const g = id('bg'), r = id('br'), sb = id('bs');
  const dots = (y, w, n) => Array.from({ length: n }, (_, i) => `<circle cx="${-w + (2 * w * i) / (n - 1)}" cy="${y}" r="3" fill="${K.goldLight}"/>`).join('');
  return `<g>
  <defs>
    <linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${f(K.goldDeep)}"/><stop offset=".5" stop-color="${f(K.goldLight)}"/><stop offset="1" stop-color="${f(K.goldDeep)}"/></linearGradient>
    <linearGradient id="${r}" x1="0" x2="1"><stop offset="0" stop-color="${f(K.crimsonDeep)}"/><stop offset=".45" stop-color="${f(K.crimson)}"/><stop offset="1" stop-color="${f(K.crimsonDeep)}"/></linearGradient>
    <linearGradient id="${sb}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f(K.rose)}"/><stop offset="1" stop-color="${f(K.crimson)}"/></linearGradient>
  </defs>
  <path class="sbai" d="M70 -742C100 -700 110 -500 106 -300L82 -300C86 -480 82 -640 56 -720Z" fill="url(#${sb})"/>
  <ellipse cx="-30" cy="-28" rx="26" ry="12" fill="url(#${g})"/><ellipse cx="30" cy="-28" rx="26" ry="12" fill="url(#${g})"/>
  <path d="M-62 -562L62 -562C70 -420 78 -200 86 -40L-86 -40C-78 -200 -70 -420 -62 -562Z" fill="url(#${r})"/>
  ${sil ? '' : `<path d="M-84 -82L84 -82L86 -40L-86 -40Z" fill="url(#${g})"/><path d="M-80 -118L80 -118L81 -110L-81 -110Z" fill="${K.gold}"/>
  <path d="M-8 -560L8 -560L14 -82L-14 -82Z" fill="url(#${g})" opacity=".85"/>
  <path d="M-40 -540Q-30 -300 -50 -90M40 -540Q34 -300 52 -90" stroke="${K.crimsonDeep}" stroke-width="3" fill="none" opacity=".5"/>`}
  ${limb(76, -728, 96, -532, 30, 17, f(K.skin), f(K.skin))}
  <path d="M-20 -752C-52 -750 -78 -742 -86 -728C-84 -660 -70 -600 -60 -560L60 -560C70 -600 84 -660 86 -728C78 -742 52 -750 20 -752Z" fill="url(#${g})"/>
  ${sil ? '' : `${dots(-700, 50, 9)}${dots(-650, 44, 8)}${dots(-600, 38, 7)}`}
  <path d="M-80 -738C-30 -700 40 -630 66 -560L44 -556C14 -620 -40 -680 -84 -712Z" fill="url(#${sb})"/>
  ${sil ? '' : `<path d="M-80 -738C-30 -700 40 -630 66 -560" stroke="${K.gold}" stroke-width="4" fill="none"/>`}
  <path d="M-64 -576L64 -576L62 -556L-62 -556Z" fill="${f(K.goldDeep)}"/>
  ${limb(-76, -728, -126, -538, 30, 17, f(K.skin), f(K.skin))}
  ${sil ? '' : `<path d="M-112 -640l26 6M-117 -628l24 6" stroke="${K.gold}" stroke-width="6" stroke-linecap="round"/><path d="M80 -632l24 -2M81 -620l23 -2" stroke="${K.gold}" stroke-width="6" stroke-linecap="round"/>`}
  <path d="M-14 -778L14 -778L16 -748L-16 -748Z" fill="${f(K.skinShade)}"/>
  ${bouquet && !sil ? posy(-10, K.rose) : ''}
  <path d="M-42 -754Q0 -708 42 -754Q0 -726 -42 -754Z" fill="url(#${g})"/>
  <ellipse cx="0" cy="-904" rx="42" ry="22" fill="${f(K.hair)}"/>
  <ellipse cx="0" cy="-830" rx="47" ry="57" fill="${f(K.skin)}"/>
  <path d="M-49 -836C-56 -898 -16 -912 0 -912C16 -912 56 -898 49 -836C44 -866 24 -878 0 -878C-24 -878 -44 -866 -49 -836Z" fill="${f(K.hair)}"/>
  <circle cx="-48" cy="-800" r="7" fill="${f(K.gold)}"/><circle cx="48" cy="-800" r="7" fill="${f(K.gold)}"/>
  ${crown ? `
  <path d="M-52 -878L52 -878L48 -900L-48 -900Z" fill="url(#${g})"/>
  <path d="M-46 -900L46 -900L36 -945L-36 -945Z" fill="url(#${g})"/>
  <path d="M-32 -945L32 -945L22 -990L-22 -990Z" fill="url(#${g})"/>
  <path d="M-19 -990L19 -990L10 -1035L-10 -1035Z" fill="url(#${g})"/>
  <path d="M-8 -1035L8 -1035L0 -1100Z" fill="url(#${g})"/>
  <path d="M-52 -890C-70 -900 -78 -880 -66 -868C-60 -876 -56 -882 -52 -884ZM52 -890C70 -900 78 -880 66 -868C60 -876 56 -882 52 -884Z" fill="${f(K.gold)}"/>
  ` : `<circle cx="30" cy="-900" r="13" fill="#f6d652" stroke="#c99a1e" stroke-width="3"/><circle cx="30" cy="-900" r="5" fill="#e2b52f"/>`}
  ${sil ? '' : `${crown ? `<path d="M-46 -900L46 -900M-32 -945L32 -945M-19 -990L19 -990" stroke="${K.goldDeep}" stroke-width="3"/>${dots(-922, 30, 7)}${dots(-968, 18, 5)}` : ''}${face(0, -828, 0.92, eyes === 'open')}${eyes === 'open' && crown ? '<circle class="glint" cx="0" cy="-1060" r="7" fill="#fff8e0"/>' : ''}`}
</g>`;
}

/** tapered limb from (x1,y1) to (x2,y2), width w1 → w2, ending in an oval hand */
export function limb(x1, y1, x2, y2, w1, w2, color, hand) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const mx = (x1 + x2) / 2 + nx * 4, my = (y1 + y2) / 2 + ny * 4;
  const a = `${x1 + nx * w1 / 2} ${y1 + ny * w1 / 2}`, b = `${x2 + nx * w2 / 2} ${y2 + ny * w2 / 2}`;
  const c = `${x2 - nx * w2 / 2} ${y2 - ny * w2 / 2}`, d = `${x1 - nx * w1 / 2} ${y1 - ny * w1 / 2}`;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
  return `<path d="M${a}Q${mx + nx * w1 * 0.45} ${my + ny * w1 * 0.45} ${b}L${c}Q${mx - nx * w1 * 0.45} ${my - ny * w1 * 0.45} ${d}Z" fill="${color}"/>
    <ellipse cx="${x2 + (dx / L) * w2 * 0.55}" cy="${y2 + (dy / L) * w2 * 0.55}" rx="${w2 * 0.62}" ry="${w2 * 0.9}" transform="rotate(${ang} ${x2 + (dx / L) * w2 * 0.55} ${y2 + (dy / L) * w2 * 0.55})" fill="${hand}"/>`;
}

export const couple = (opt = {}) => `<g transform="translate(-138 0)">${groom(opt)}</g><g transform="translate(140 0)">${bride(opt)}</g>`;
