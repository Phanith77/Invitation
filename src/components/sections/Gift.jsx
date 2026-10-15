import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';

// Signature: QR cards turn over like place cards being set down. Always visible (no toggle).
export default function Gift() {
  const { lang, t, p } = useLang();
  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    scrollTl(q('.qr-grid')[0], 'top 85%').from(q('.qr-card'), {
      rotationY: (i) => (i % 2 ? -75 : 75), opacity: 0, y: 30, duration: 1.4, stagger: 0.18, ease: 'expo.out', transformPerspective: 900,
    });
  });
  return (
    <section className="sec sec-paper paper gift" id="gift" ref={ref}>
      <SectionHead k="giftTitle" />
      <p className="gift-line" lang={lang}>{t.giftLine}</p>
      <div className="qr-grid">
        {wedding.giftQR.map((g, i) => (
          <figure className="qr-card paper-card" key={i}>
            <div className="qr-img">
              {g.src ? <img src={g.src} alt={p(g.label)} loading="lazy" /> : <span className="qr-pending">{t.qrPending}</span>}
            </div>
            <figcaption lang={lang}>{p(g.label)}</figcaption>
            {g.src ? (
              <a className="btn btn-line" href={g.src} download>{t.saveQR}</a>
            ) : (
              <button className="btn btn-line" disabled>{t.saveQR}</button>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
