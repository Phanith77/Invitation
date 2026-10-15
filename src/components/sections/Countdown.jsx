import { useEffect, useRef, useState } from 'react';
import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';
import { weddingPhase, daysSince, now } from '../../lib/phase';

function remaining(target) {
  const ms = Math.max(0, target - now().getTime());
  return [Math.floor(ms / 864e5), Math.floor(ms / 36e5) % 24, Math.floor(ms / 6e4) % 60, Math.floor(ms / 1e3) % 60];
}

// Signature: the numbers count up from zero as the section arrives; a slow blessing drifts behind.
export default function Countdown() {
  const { lang, t, n } = useLang();
  const target = wedding.dateISO ? new Date(wedding.dateISO).getTime() : null;
  const phase = weddingPhase(wedding.dateISO);
  const [vals, setVals] = useState(() => (target ? remaining(target) : [0, 0, 0, 0]));
  const [shown, setShown] = useState(lite ? 1 : 0); // 0→1 count-up progress
  const visible = useRef(false);

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => visible.current && setVals(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const ref = useGsap((q, el) => {
    headIn(q, el);
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      el.classList.toggle('is-visible', e.isIntersecting); // pauses the marquee off-screen
    });
    io.observe(el);
    if (!lite) {
      const o = { p: 0 };
      const grid = q('.cd-grid, .cd-married')[0];
      scrollTl(grid, 'top 85%', { onReset: () => setShown(0) })
        .fromTo(o, { p: 0 }, { p: 1, duration: 2.2, ease: 'power3.out', onUpdate: () => setShown(o.p) }, 0)
        .from(q('.cd-unit, .cd-married'), { y: 40, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' }, 0);
    }
    return () => io.disconnect();
  });

  const pad = (v) => String(v).padStart(2, '0');
  return (
    <section className="sec sec-dark countdown" id="countdown" ref={ref}>
      <div className="marquee" aria-hidden="true">
        {[0, 1].map((row) => (
          <div className={`marquee-track ${row ? 'rev' : ''}`} key={row} lang={lang}>
            {[0, 1].map((k) => <span key={k}>{t.marquee} ✦ {t.marquee} ✦ </span>)}
          </div>
        ))}
      </div>
      <SectionHead k={phase === 'after' ? 'afterTitle' : 'countdownTitle'} />
      {phase === 'after' ? (
        // after the wedding: days of married life instead of a countdown
        <div className="cd-married" lang={lang}>
          <span className="cd-num">{n(Math.round(daysSince(wedding.dateISO) * shown))}</span>
          <span className="cd-label">{t.daysMarried}</span>
        </div>
      ) : (
        <div className="cd-grid" role="timer" lang={lang}>
          {vals.map((v, i) => (
            <div className="cd-unit" key={i}>
              <span className="cd-num">{n(pad(Math.round(v * shown)))}</span>
              <span className="cd-label">{t.units[i]}</span>
            </div>
          ))}
        </div>
      )}
      {!target && <p className="cd-tbd" lang={lang}>{t.countdownTBD}</p>}
      {phase === 'today' && <p className="cd-tbd" lang={lang}>{t.todayPill}</p>}
    </section>
  );
}
