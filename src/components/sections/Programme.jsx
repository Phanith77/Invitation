import { useState } from 'react';
import { gsap, ScrollTrigger, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { currentRitual, isProgrammeDay } from '../../lib/phase';
import { guestProgramme, guestEvents } from '../../lib/guest';
import { Corner } from '../Decor';
import Photo from '../Photo';
import { useGsap, SectionHead, headIn, RitualIcon, scrollTl } from '../Shared';

// Signature: a gold thread draws down with the scroll; each ritual's icon draws and lights as the thread reaches it.
// Tapping a ritual opens the ceremony guide (illustration + what it means).
// The programme runs over the days in wedding.programmeDays (from the opening day, ថ្ងៃចូលរោង), each
// with a heading and its date. On those days the ritual happening now is marked, with the next one.
const KM_DAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const KM_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
function dayDate(iso, lang, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  if (lang === 'km') return `ថ្ងៃ${KM_DAYS[d.getUTCDay()]} ទី${n(d.getUTCDate())} ខែ${KM_MONTHS[d.getUTCMonth()]} ឆ្នាំ${n(d.getUTCFullYear())}`;
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function Programme() {
  const { lang, t, p, n } = useLang();
  const [open, setOpen] = useState(-1);
  const days = wedding.programmeDays || [];
  const today = isProgrammeDay(days);
  const nowIdx = today ? currentRitual(guestProgramme) : -2;

  const ref = useGsap((q, el) => {
    headIn(q, el);
    const list = q('.prog-list')[0];
    if (lite) {
      gsap.set(q('.prog-thread-fill'), { scaleY: 1 });
      q('.prog-item').forEach((it) => it.classList.add('is-lit'));
      return;
    }
    gsap.fromTo(q('.prog-thread-fill'), { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: list, start: 'top 62%', end: 'bottom 62%', scrub: 0.6 },
    });
    q('.prog-item').forEach((it, i) => {
      const s = gsap.utils.selector(it);
      scrollTl(it, 'top 64%', { onReset: () => it.classList.remove('is-lit') })
        .call(() => it.classList.add('is-lit'), null, 0.01)
        .fromTo(s('.ico-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' }, 0)
        .from(s('.prog-node'), { scale: 0.4, duration: 0.9, ease: 'back.out(2.5)' }, 0)
        .from(s('.prog-time'), { opacity: 0, x: i % 2 ? 20 : -20, duration: 0.9, ease: 'power3.out' }, 0.2)
        .from(s('.prog-name'), { yPercent: 110, duration: 1, ease: 'expo.out' }, 0.3);
    });
  });

  const toggle = (i) => setOpen((o) => (o === i ? -1 : i));
  // the guide changes the page height: re-measure pinned sections once it has finished opening/closing
  const onGuideMoved = (e) => e.propertyName === 'grid-template-rows' && ScrollTrigger.refresh();

  return (
    <section className="sec sec-light paper-card programme" id="programme" ref={ref}>
      <Corner flip="y" className="sec-corner bl" />
      <Corner flip="xy" className="sec-corner br" />
      <SectionHead k="programmeTitle" />
      {today && nowIdx >= 0 && (
        <p className="prog-today" lang={lang}><span className="hint-dot" />{t.today} · {t.nowHappening}: {p(guestProgramme[nowIdx])}</p>
      )}
      <p className="prog-hint" lang={lang}>{t.tapRitual}</p>
      <div className="prog-list">
        <div className="prog-thread" aria-hidden="true"><i className="prog-thread-fill" /></div>
        <ol className="prog-items" lang={lang}>
          {guestProgramme.map((it, i) => {
            const prev = guestProgramme[i - 1];
            const newDay = days.length > 1 && (!prev || (it.day || 0) !== (prev.day || 0));
            const day = days[it.day || 0];
            return [
            // each day opens with its name and date
            newDay && day && (
              <li className="prog-day" key={`d-${it.day}`}>
                <span className="prog-day-name">{p(day)}</span>
                <span className="prog-day-date">{dayDate(day.iso, lang, n)}</span>
              </li>
            ),
            // when the guest is invited to more than one part of the day, each part gets a heading
            guestEvents.length > 1 && (newDay || it.event !== prev?.event) && (
              <li className="prog-event" key={`e-${it.day}-${it.event}`}>
                <span>{p(wedding.events.find((e) => e.id === it.event)?.name)}</span>
                <small>{p(wedding.events.find((e) => e.id === it.event)?.venue.name)}</small>
              </li>
            ),
            <li className={`prog-item ${i % 2 ? 'alt' : ''} ${i === nowIdx ? 'is-now' : ''} ${today && i < nowIdx ? 'is-done' : ''}`} key={i}>
              <div className="prog-node"><RitualIcon name={it.icon} /></div>
              <div className="prog-body">
                <p className="prog-time">
                  {n(it.time)}
                  {i === nowIdx && <span className="prog-badge now">{t.nowHappening}</span>}
                  {today && i === nowIdx + 1 && <span className="prog-badge">{t.upNext}</span>}
                </p>
                <div className="mask"><p className="prog-name">{p(it)}</p></div>
                {it.about && (
                  <button className="prog-more" aria-expanded={open === i} aria-controls={`guide-${i}`} onClick={() => toggle(i)}>
                    {t.meaning} <i aria-hidden="true" />
                  </button>
                )}
              </div>
              {it.about && (
                <div className={`prog-guide ${open === i ? 'is-open' : ''}`} id={`guide-${i}`} onTransitionEnd={onGuideMoved}>
                  <div className="prog-guide-inner">
                    {it.art && <Photo slug={it.art} sizes="(min-width: 760px) 520px, 90vw" alt="" eager={false} />}
                    <p>{p(it.about)}</p>
                  </div>
                </div>
              )}
            </li>,
            ];
          })}
        </ol>
      </div>
    </section>
  );
}
