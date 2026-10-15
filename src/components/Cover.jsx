import { useLayoutEffect, useRef } from 'react';
import { gsap, lite, allowWebGL } from '../lib/env';
import { wedding } from '../data/wedding';
import { useLang } from '../lib/lang';
import { text } from '../i18n';
import NameLogo, { logoTimeline } from './NameLogo';
import { Corner, Crest, Divider } from './Decor';
import Photo, { photoSrc } from './Photo';
import CoverGL from './CoverGL';
import { replayOnScroll } from './Shared';
import { guestName, guestVenue } from '../lib/guest';
import { weddingPhase } from '../lib/phase';

export default function Cover({ revealed }) {
  const { lang, t, p } = useLang();
  const root = useRef(null);
  const logo = useRef(null);

  // hide before the reveal so nothing flashes under the envelope
  useLayoutEffect(() => {
    const q = gsap.utils.selector(root);
    gsap.set(q('.cv-in'), { autoAlpha: 0 });
  }, []);

  useLayoutEffect(() => {
    if (!revealed) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.set(q('.cv-in'), { autoAlpha: 1 });
      if (lite) {
        gsap.from(q('.cover-inner > *, .corner, .scroll-cue'), { opacity: 0, duration: 1, stagger: 0.06 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: 'silk' } });
      // signature: the photo settles while the gold frame draws itself in from the corners
      tl.fromTo(q('.cover-bg img'), { scale: 1.2 }, { scale: 1, duration: 4, ease: 'expo.out' }, 0)
        .fromTo(q('.cover-shade'), { opacity: 1 }, { opacity: 0.86, duration: 3 }, 0)
        .fromTo(q('.corner .draw'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 2, ease: 'power2.inOut', stagger: 0.02 }, 0.1)
        .from(q('.corner .leaf'), { opacity: 0, duration: 0.8, stagger: 0.015 }, 0.9) // leaves carry SVG transforms: animate opacity only
        .from(q('.cover-crest .petal'), { scale: 0, rotation: -25, duration: 0.9, stagger: { each: 0.05, from: 'center' }, ease: 'back.out(1.8)' }, 0.3)
        .from(q('.cover-crest .draw, .cover-crest .leaf'), { opacity: 0, duration: 0.8 }, 0.7)
        .fromTo(q('.cover-title'), { clipPath: 'inset(-40% 110% -40% -10%)' }, { clipPath: 'inset(-40% -10% -40% -10%)', duration: 1.3, ease: 'power2.inOut', clearProps: 'clipPath' }, 0.6)
        .add(logoTimeline(logo.current), 1.0)
        .from(q('.cover-names'), { opacity: 0, letterSpacing: '0.12em', filter: 'blur(6px)', duration: 1.6, clearProps: 'filter,letterSpacing' }, 2.4)
        .fromTo(q('.cover-divider .draw'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.2 }, 2.7)
        .from(q('.cover-divider .leaf'), { opacity: 0, duration: 0.6, stagger: 0.05 }, 3.0)
        .from(q('.cv-line > *'), { yPercent: 115, duration: 1.1, stagger: 0.09, ease: 'expo.out' }, 3.0)
        .from(q('.date-sep'), { scaleY: 0, duration: 0.8, stagger: 0.08 }, 3.3)
        .from(q('.scroll-cue'), { opacity: 0, y: -10, duration: 1 }, 4.0);
      // after the first reveal, replay it whenever the cover comes back into view
      replayOnScroll(tl, root.current, 'top 60%', { startPlayed: true });
      // shimmer only on the two big gold elements
      gsap.to(q('.cover-title, .cover-logo .nl-name'), { backgroundPosition: '200% 0', duration: 6, repeat: -1, ease: 'none', delay: 4 });
    }, root);
    return () => ctx.revert();
  }, [revealed]);

  const d = wedding.dateParts;
  const phase = weddingPhase(wedding.dateISO);
  const cells = [d.weekday, d.day, d.month, d.year];
  return (
    <section className="cover" id="cover" ref={root}>
      <div className="cover-bg"><Photo slug={wedding.coverPhoto} sizes="100vw" alt="" /></div>
      {allowWebGL && <CoverGL src={photoSrc(wedding.coverPhoto, 2000)} active={revealed} />}
      <div className="cover-shade" />
      <div className="cv-in cover-corners">
        <Corner className="c-tl" />
        <Corner flip="x" className="c-tr" />
        <Corner flip="y" className="c-bl" />
        <Corner flip="xy" className="c-br" />
      </div>
      <div className="cover-inner cv-in">
        <Crest className="cover-crest" />
        {phase !== 'before' && <p className="cover-pill" lang={lang}>{phase === 'today' ? t.todayPill : t.afterPill}</p>}
        {phase === 'today' && wedding.live?.url && (
          <a className="cover-live" href={wedding.live.url} target="_blank" rel="noopener" lang={lang}><i aria-hidden="true" />{t.liveWatch} · {wedding.live.platform}</a>
        )}
        <h1 className="cover-title km-moul foil" lang="km">{text.km.blessingTitle}</h1>
        <NameLogo ref={logo} className="cover-logo" />
        <p className="cover-names script">{wedding.groom.en} <span>&amp;</span> {wedding.bride.en}</p>
        <Divider className="cover-divider" />
        <div className="cv-line mask"><p className="cover-invite" lang={lang}>{t.respectfullyInvite}</p></div>
        {guestName && <div className="cv-line mask"><p className="cover-guest foil">{guestName}</p></div>}
        <div className="date-row" lang={lang}>
          {cells.map((c, i) => (
            <div className="date-cell" key={i}>
              {i > 0 && <i className="date-sep" />}
              <div className="cv-line mask"><span className="date-label">{t.dateLabels[i]}</span></div>
              <div className="cv-line mask"><span className="date-val">{p(c)}</span></div>
            </div>
          ))}
        </div>
        <div className="cv-line mask"><p className="cover-lunar" lang={lang}>{p(wedding.lunar)}</p></div>
        <div className="cv-line mask"><p className="cover-venue" lang={lang}>{p(guestVenue.name)} · {p(guestVenue.address)}</p></div>
      </div>
      <a className="scroll-cue cv-in" href="#invitation" lang={lang}><span>{t.scroll}</span><i /></a>
    </section>
  );
}
