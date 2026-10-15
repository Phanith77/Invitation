// Original decorative elements (leaf scrolls, fan crest, curls). Pure SVG, no text.
import { useId } from 'react';
import { palette } from '../data/wedding';
import { rumdulMark } from '../art/rumdulMark';

/** Shared gradients — rendered once at the app root, referenced as url(#g-foil). */
export function GoldDefs() {
  const f = palette.foil;
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={f[0]} />
          <stop offset=".32" stopColor={f[1]} />
          <stop offset=".5" stopColor={f[2]} />
          <stop offset=".68" stopColor={f[3]} />
          <stop offset="1" stopColor={f[4]} />
        </linearGradient>
        <linearGradient id="g-foil-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={f[0]} />
          <stop offset=".35" stopColor={f[1]} />
          <stop offset=".5" stopColor={f[2]} />
          <stop offset=".65" stopColor={f[3]} />
          <stop offset="1" stopColor={f[4]} />
        </linearGradient>
        <radialGradient id="g-foil-r" cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor={f[2]} />
          <stop offset=".35" stopColor={f[1]} />
          <stop offset=".75" stopColor={f[3]} />
          <stop offset="1" stopColor={f[0]} />
        </radialGradient>
      </defs>
    </svg>
  );
}

const LEAF = 'M0 0C5-7 16-9 25-4C17 2 6 4 0 0Z';

/** Lotus petal pointing along angle `deg` (0 = up) from (x, y): coordinates computed, no transform attr,
 *  so GSAP can scale petals without undoing their rotation. */
export function petalPath(x, y, deg, len, w) {
  const a = (deg * Math.PI) / 180, ux = Math.sin(a), uy = -Math.cos(a), px = -uy, py = ux;
  const P = (along, side) => `${(x + ux * along + px * side).toFixed(1)} ${(y + uy * along + py * side).toFixed(1)}`;
  return `M${P(0, 0)}C${P(len * 0.35, -w)} ${P(len * 0.8, -w * 0.55)} ${P(len, 0)}C${P(len * 0.8, w * 0.55)} ${P(len * 0.35, w)} ${P(0, 0)}Z`;
}
/** Rounded petal (rumdul): narrow base, broad round top. Coordinates computed (no transform attr). */
export function roundPetalPath(x, y, deg, len, w) {
  const a = (deg * Math.PI) / 180, ux = Math.sin(a), uy = -Math.cos(a), px = -uy, py = ux;
  const P = (along, side) => `${(x + ux * along + px * side).toFixed(1)} ${(y + uy * along + py * side).toFixed(1)}`;
  return `M${P(0, 0)}C${P(len * 0.12, -w * 0.6)} ${P(len * 0.5, -w)} ${P(len * 0.82, -w * 0.82)}C${P(len * 1.04, -w * 0.55)} ${P(len * 1.04, w * 0.55)} ${P(len * 0.82, w * 0.82)}C${P(len * 0.5, w)} ${P(len * 0.12, w * 0.6)} ${P(0, 0)}Z`;
}

/** Front view of a rumdul (ផ្ការំដួល): three broad outer petals and a small three-petal centre.
 *  `cls` is the class for every petal (e.g. "petal" so headings can open them). */
function rumdul(cx, cy, r, cls, origin = true) {
  const style = origin ? { transformOrigin: `${cx}px ${cy}px` } : undefined;
  return [
    ...[0, 120, 240].map((d) => <path key={`o${d}`} className={cls} style={style} d={roundPetalPath(cx, cy, d, r, r * 0.52)} />),
    // the inner ball: three rounded lobes, separated by a fine Y seam
    ...[60, 180, 300].map((d) => <path key={`i${d}`} className={cls} style={style} d={roundPetalPath(cx, cy, d, r * 0.5, r * 0.44)} opacity=".92" />),
    <path key="seam" className="rd-seam" d={`M${cx} ${cy}V${cy - r * 0.42}M${cx} ${cy}L${cx + r * 0.36} ${cy + r * 0.21}M${cx} ${cy}L${cx - r * 0.36} ${cy + r * 0.21}`} />,
  ];
}

/* One arm of the corner: a rumdul twig along the left edge with slender leaves, buds and curls.
   The other arm is the same drawing reflected across the diagonal. */
function CornerArm() {
  return (
    <g>
      <path className="draw" d="M15 214C15 168 17 122 24 88C28 70 33 58 40 50" />
      <path className="draw" d="M17 170C30 160 43 164 45 175C46 183 37 186 33 179" />
      <path className="draw" d="M21 126C35 119 46 125 45 135C44 141 37 142 35 137" />
      <path className="draw" d="M16 196C8 190 7 180 13 176" />
      <g className="leaf">
        <path d={petalPath(19, 156, 62, 34, 5.5)} />
        <path d={petalPath(23, 110, 58, 26, 4.5)} />
        <path d={petalPath(16, 200, 48, 20, 4)} />
        <path d={petalPath(22, 150, 24, 12, 4)} />
        <circle cx="47" cy="186" r="1.8" />
        <circle cx="50" cy="128" r="1.5" />
      </g>
    </g>
  );
}

function CornerMark() {
  const prefix = useMarkId();
  return <svg x="2" y="2" width="58" height="58" viewBox="0 0 200 200" dangerouslySetInnerHTML={{ __html: rumdulMark({ prefix }) }} />;
}

/**
 * Corner element. `flip` mirrors it INSIDE the SVG (inner <g>), never via CSS,
 * so GSAP transforms on the <svg> can't undo the mirroring.
 */
export function Corner({ flip = '', className = '' }) {
  const fx = flip.includes('x'), fy = flip.includes('y');
  const t = `translate(${fx ? 220 : 0} ${fy ? 220 : 0}) scale(${fx ? -1 : 1} ${fy ? -1 : 1})`;
  return (
    <svg className={`corner ${className}`} viewBox="0 0 220 220" aria-hidden="true">
      <g transform={t}>
        <g className="corner-art">
          <CornerArm />
          <g transform="matrix(0 1 1 0 0 0)"><CornerArm /></g>
          <CornerMark />
        </g>
      </g>
    </svg>
  );
}

/** unique gradient-id prefix per drawing (React ids contain ':' which SVG url() refs dislike) */
const useMarkId = () => `rm${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

/** The rumdul mark as an inline SVG (see src/art/rumdulMark.js). */
export function RumdulMark({ className = '', leaves = true, ...rest }) {
  const prefix = useMarkId();
  return <svg className={className} viewBox="0 0 200 200" aria-hidden="true" dangerouslySetInnerHTML={{ __html: rumdulMark({ prefix, leaves }) }} {...rest} />;
}

/** Section crest: the rumdul mark (petals open from the centre via the existing .petal animations). */
export function Crest({ className = '' }) {
  return <RumdulMark className={`crest ${className}`} />;
}

function DividerMark() {
  const prefix = useMarkId();
  return <svg x="107" y="-1" width="26" height="26" viewBox="0 0 200 200" dangerouslySetInnerHTML={{ __html: rumdulMark({ prefix }) }} />;
}

/** Horizontal divider: a small rumdul between two drifting lines. */
export function Divider({ className = '' }) {
  const side = (
    <g>
      <path className="draw" d="M106 14C92 14 84 9 70 9C56 9 50 16 36 16C24 16 16 12 8 12" />
      <path className="draw" d="M70 9C64 3 56 3 54 7C53 10 57 11 58 9" />
      <circle className="leaf" cx="36" cy="16" r="1.6" />
      <circle className="leaf" cx="8" cy="12" r="1.3" />
    </g>
  );
  return (
    <svg className={`divider ${className}`} viewBox="0 0 240 24" aria-hidden="true">
      {side}
      <g transform="translate(240 0) scale(-1 1)">{side}</g>
      <DividerMark />
    </svg>
  );
}

export function Butterfly({ className = '' }) {
  const wing = (
    <g className="wing">
      <path d="M20 16C14 3 2 1 3 10C4 16 12 18 20 16Z" />
      <path d="M20 16C12 18 6 26 10 29C14 31 18 24 20 16Z" opacity=".85" />
    </g>
  );
  return (
    <svg className={`butterfly ${className}`} viewBox="0 0 40 32" aria-hidden="true">
      <g className="wing-l" style={{ transformOrigin: '20px 16px' }}>{wing}</g>
      <g transform="translate(40 0) scale(-1 1)"><g className="wing-r" style={{ transformOrigin: '20px 16px' }}>{wing}</g></g>
      <ellipse cx="20" cy="17.5" rx="1.3" ry="8.5" fill="url(#g-foil)" />
      <path d="M20 9C18 5 16 4 15 4M20 9C22 5 24 4 25 4" stroke="url(#g-foil)" strokeWidth=".7" fill="none" />
    </svg>
  );
}

export const HEART = 'M12 21C5 15 1 11.5 1 7.2C1 3.6 3.8 1 7 1C9.2 1 11 2.2 12 4C13 2.2 14.8 1 17 1C20.2 1 23 3.6 23 7.2C23 11.5 19 15 12 21Z';
