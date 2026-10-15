import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/env';
import { text } from '../i18n';
import { useLang } from '../lib/lang';
import { Crest, Divider } from './Decor';

/** Runs a GSAP build function scoped to the returned ref; reverted on unmount. */
export function useGsap(build, deps = []) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => build(gsap.utils.selector(ref), ref.current), ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/**
 * Plays `tl` whenever `trigger` scrolls into view, in either direction (down or back up), and
 * resets it only once the section is completely off-screen, so nothing visibly un-animates and it
 * plays again the next time it comes into view.
 */
export function replayOnScroll(tl, trigger, start = 'top 80%', { onReset, startPlayed = false } = {}) {
  if (!startPlayed) tl.pause(0);
  const play = () => { if (tl.progress() === 0) tl.play(); };
  const reset = () => { tl.pause(0); onReset?.(); };
  ScrollTrigger.create({ trigger, start, end: 'bottom 20%', onEnter: play, onEnterBack: play });
  ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', onLeave: reset, onLeaveBack: reset });
  return tl;
}
/** A paused timeline wired with replayOnScroll; chain tweens onto it. */
export const scrollTl = (trigger, start, opts) => replayOnScroll(gsap.timeline({ paused: true }), trigger, start, opts);

/** Section heading: crest, title (Moul in Khmer), an English script echo, divider. */
export function SectionHead({ k, crest = true, className = '' }) {
  const { lang, t } = useLang();
  return (
    <header className={`sec-head ${className}`}>
      {crest && <Crest className="sec-crest" />}
      <div className="mask"><h2 className={`sec-title foil ${lang === 'km' ? 'km-moul' : 'en-title'}`} lang={lang}>{t[k]}</h2></div>
      {lang === 'km' && <p className="sec-echo script" lang="en">{text.en[k]}</p>}
      <Divider className="sec-divider" />
    </header>
  );
}

/** Standard heading entrance: crest fans open, title rises, divider draws from the centre. */
export function headIn(q, trigger) {
  // trigger on the heading itself (not the whole section), so scrolling back up replays it exactly when it comes into view
  const tl = scrollTl(q('.sec-head')[0] || trigger, 'top 88%');
  if (q('.sec-crest').length) { // some headings are drawn without a crest
    tl.from(q('.sec-crest .petal'), { scale: 0, duration: 0.8, stagger: { each: 0.04, from: 'center' }, ease: 'back.out(2)' }, 0)
      .from(q('.sec-crest .draw, .sec-crest .leaf'), { opacity: 0, duration: 0.6 }, 0.2);
  }
  tl.from(q('.sec-title'), { yPercent: 110, duration: 1.1, ease: 'expo.out' }, 0.15)
    .from(q('.sec-echo'), { opacity: 0, y: 8, duration: 1 }, 0.5)
    .fromTo(q('.sec-divider .draw'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.2, ease: 'power2.inOut' }, 0.4)
    .from(q('.sec-divider .leaf'), { opacity: 0, duration: 0.6 }, 0.8);
  return tl;
}

/** Parents: "លោក X" on one line, "និងលោកស្រី Y" on the next. */
export function Parents({ heading, parents, className = '' }) {
  const { lang, t, p } = useLang();
  return (
    <div className={`parents ${className}`} lang={lang}>
      {heading && <p className="parents-head">{heading}</p>}
      <p className="parents-name">{t.mr} {p(parents.father)}</p>
      <p className="parents-name">{t.andMrs} {p(parents.mother)}</p>
    </div>
  );
}

/** Original line icons for the programme. Stroke-only so they can draw in. */
const ICONS = {
  gifts: 'M8 33H40M10 33C10 39 16 42 24 42S38 39 38 33M14 33C14 26 18 22 24 22S34 26 34 33M24 22V17M20 13C22 10 26 10 28 13C26 16 22 16 20 13Z',
  rings: 'M19 39A9 9 0 1 0 19 21A9 9 0 1 0 19 39ZM29 39A9 9 0 1 0 29 21A9 9 0 1 0 29 39ZM19 21L16 16H22ZM16 16L19 12L22 16',
  lotus: 'M24 38C18 33 18 23 24 14C30 23 30 33 24 38ZM24 38C16 38 10 33 8 25C15 25 21 30 24 38ZM24 38C32 38 38 33 40 25C33 25 27 30 24 38ZM10 42H38',
  scissors: 'M14 38A5 5 0 1 0 14 28A5 5 0 1 0 14 38ZM34 38A5 5 0 1 0 34 28A5 5 0 1 0 34 38ZM17 29L31 9M31 29L17 9',
  thread: 'M8 26C14 20 20 32 26 26S36 20 40 24M16 22C16 16 22 14 24 18S30 28 34 22M24 26V40M20 36L24 40L28 36',
  feast: 'M14 10H24L22 22C21 25 17 25 16 22ZM19 24V38M14 38H24M26 14H36L34 26C33 29 29 29 28 26ZM31 28V38M26 38H36',
  incense: 'M12 32H36L32 42H16ZM18 32V16M24 32V12M30 32V16M18 11C16 8 20 7 18 4M24 7C22 4 26 3 24 0.5M30 11C28 8 32 7 30 4',
  tent: 'M6 40V20L24 7L42 20V40M6 20H42M14 40V27H34V40M24 27V40M10 20L24 12L38 20',
  tray: 'M8 36H40M13 36L16 42H32L35 36M17 36L24 12L31 36M24 12V8M20.5 24H27.5M19 30H29',
  petals: 'M24 22C20 18 20 12 24 8C28 12 28 18 24 22ZM12 30C10 26 12 21 16 20C18 24 16 29 12 30ZM36 30C38 26 36 21 32 20C30 24 32 29 36 30ZM18 40C17 36 20 33 23 33C24 37 21 40 18 40ZM30 40C31 36 28 33 25 33C24 37 27 40 30 40Z',
  toast: 'M12 8H22L21 20C20 24 15 24 14 20ZM17 23V36M12 36H22M28 10L37 8L38 20C38 24 33 25 32 21ZM34 24L36 36M31 37L40 35',
  music: 'M18 34V12L36 8V30M18 34A4 4 0 1 1 10 34A4 4 0 1 1 18 34ZM36 30A4 4 0 1 1 28 30A4 4 0 1 1 36 30Z',
};
export function RitualIcon({ name }) {
  return (
    <svg className="ritual-ico" viewBox="0 0 48 48" aria-hidden="true">
      <path className="ico-line" d={ICONS[name] || ICONS.lotus} />
    </svg>
  );
}
