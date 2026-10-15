import { lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';

// Travel & stay for guests coming from other provinces or abroad.
export default function Travel() {
  const { lang, t, p } = useLang();
  const tr = wedding.travel;
  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    scrollTl(q('.travel-grid')[0], 'top 85%').from(q('.travel-card'), { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out' });
  });
  if (!tr) return null;
  return (
    <section className="sec sec-paper paper travel" id="travel" ref={ref}>
      <SectionHead k="travelTitle" />
      <div className="travel-grid" lang={lang}>
        <div className="travel-card">
          <p className="travel-head">{t.hotelsTitle}</p>
          {tr.hotels.map((h) => (
            <a className="travel-row" key={h.name} href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20V7L12 3L21 7V20M7 20V13H17V20M7 9H9M11 9H13M15 9H17" /></svg>
              <span><b>{h.name}</b><small>{p(h.note)}</small></span>
              <i aria-hidden="true">→</i>
            </a>
          ))}
        </div>
        <div className="travel-card">
          <p className="travel-head">{t.routesTitle}</p>
          {tr.routes.map((r) => (
            <div className="travel-row" key={r.from.en}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17V7A3 3 0 0 1 8 4H16A3 3 0 0 1 19 7V17M5 13H19M8 20V17M16 20V17M8 15H8.01M16 15H16.01" /></svg>
              <span><b>{p(r.from)}</b><small>{p(r.how)}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
