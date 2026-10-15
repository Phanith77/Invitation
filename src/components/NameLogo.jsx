// Couple name logo: groom top-left, bride bottom-right, joined by a flourish with a
// heart and a butterfly, under a small crest. Khmer names are HTML (never SVG text).
import { forwardRef } from 'react';
import gsap from 'gsap';
import { wedding } from '../data/wedding';
import { Crest, Butterfly, HEART } from './Decor';

export const FLOURISH = 'M4 45C1 44 1 40 5 40C8 40 9 44 6 46C17 51 28 47 38 40C45 35 51 30 57 32C62 34 59 41 54 39C49 37 53 29 63 26C74 23 86 21 96 18';

const NameLogo = forwardRef(function NameLogo({ className = '', ...rest }, ref) {
  return (
    <div ref={ref} className={`namelogo ${className}`} role="img" aria-label={`${wedding.groom.shortKm} & ${wedding.bride.shortKm}`} {...rest}>
      <Crest className="nl-crest" />
      <svg className="nl-art" viewBox="0 0 100 66" aria-hidden="true">
        <path className="nl-flourish" d={FLOURISH} />
        <g transform="translate(57.5 16.5) scale(.27)"><path className="nl-heart" d={HEART} /></g>
      </svg>
      <span className="nl-name nl-g foil" lang="km">{wedding.groom.shortKm}</span>
      <span className="nl-name nl-b foil" lang="km">{wedding.bride.shortKm}</span>
      <Butterfly className="nl-bfly" />
    </div>
  );
});
export default NameLogo;

/** Logo entrance: names wipe in left→right, flourish draws, heart pops, butterfly flies in. */
export function logoTimeline(root, { lite = false } = {}) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline();
  if (lite) return tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.8 });
  const W = root.getBoundingClientRect().width || 200;
  const names = q('.nl-name');
  const reveal = { clipPath: 'inset(-40% -10% -40% -10%)', duration: 1.1, ease: 'power2.inOut', clearProps: 'clipPath' };
  tl.set(root, { opacity: 1 })
    .from(q('.nl-crest .petal'), { scale: 0, opacity: 0, duration: 0.7, stagger: { each: 0.04, from: 'center' }, ease: 'back.out(2)' }, 0)
    .from(q('.nl-crest .draw, .nl-crest .leaf'), { opacity: 0, duration: 0.6 }, 0.2)
    .fromTo(names[0], { clipPath: 'inset(-40% 110% -40% -10%)' }, reveal, 0.25)
    .fromTo(q('.nl-flourish'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.5, ease: 'power1.inOut' }, 0.6)
    .fromTo(names[1], { clipPath: 'inset(-40% 110% -40% -10%)' }, { ...reveal }, 1.1)
    .fromTo(q('.nl-heart'), { scale: 0, transformOrigin: '50% 60%' }, { scale: 1, duration: 0.7, ease: 'back.out(3.2)' }, 1.5)
    .fromTo(q('.nl-bfly'), { opacity: 0, x: -W * 0.95, y: W * 0.42 }, {
      opacity: 1, x: 0, y: 0, duration: 2.2, ease: 'power1.inOut',
      motionPath: { path: [{ x: -W * 0.55, y: -W * 0.08 }, { x: -W * 0.25, y: W * 0.12 }, { x: 0, y: 0 }], curviness: 1.4 },
    }, 1.0)
    .fromTo(q('.nl-bfly .wing-l, .nl-bfly .wing-r'), { scaleX: 1 }, { scaleX: 0.35, duration: 0.14, repeat: 15, yoyo: true, ease: 'sine.inOut' }, 1.0);
  return tl;
}
