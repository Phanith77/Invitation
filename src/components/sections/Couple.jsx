import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { Butterfly, HEART } from '../Decor';
import Photo from '../Photo';
import { useGsap, SectionHead, headIn, Parents, scrollTl } from '../Shared';

// lotus-petal circle (pointed lobes), shared by the photo mask and the gold outline
function scallop(cx, cy, r, n, amp) {
  let d = '';
  for (let i = 0; i <= n * 16; i++) {
    const a = (i / (n * 16)) * Math.PI * 2 - Math.PI / 2;
    const ph = ((i / (n * 16)) * n) % 1;
    const rr = r + amp * Math.pow(1 - Math.abs(2 * ph - 1), 1.6);
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`;
  }
  return d + 'Z';
}
const MASK_PATH = scallop(100, 100, 86, 12, 12);
const LINE_PATH = scallop(100, 100, 92, 12, 9);
const MASK = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><path d='${scallop(100, 100, 82, 12, 11)}'/></svg>`)}")`;

function Person({ who, photo, role, of, parents }) {
  const { lang, p } = useLang();
  return (
    <article className="person">
      <div className="frame">
        <svg className="frame-line" viewBox="0 0 200 200" aria-hidden="true">
          <path d={MASK_PATH} className="frame-back" />
          <path d={LINE_PATH} className="frame-gold" />
        </svg>
        <div className="frame-photo" style={{ WebkitMaskImage: MASK, maskImage: MASK }}>
          <Photo slug={photo} sizes="(min-width: 900px) 26vw, 64vw" alt="" eager={false} />
        </div>
      </div>
      <p className="person-role" lang={lang}>{role}</p>
      <div className="mask"><h3 className="person-name km-moul foil" lang="km">{who.km}</h3></div>
      <p className="person-en script" lang="en">{who.en}</p>
      <Parents heading={of} parents={parents} className="person-parents" />
    </article>
  );
}

// Signature: the two scalloped frames swing in from opposite sides, gold edges drawing as they land.
export default function Couple() {
  const { t } = useLang();
  const ref = useGsap((q, el) => {
    headIn(q, el);
    const people = q('.person');
    if (lite) {
      scrollTl(el, 'top 70%').from(people, { opacity: 0, duration: 1, stagger: 0.2 });
      return;
    }
    people.forEach((p, i) => {
      const s = gsap.utils.selector(p);
      scrollTl(p, 'top 80%')
        .from(s('.frame'), { rotation: i ? 50 : -50, xPercent: i ? 40 : -40, scale: 0.7, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0)
        .fromTo(s('.frame-gold'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.8, ease: 'power2.inOut' }, 0.2)
        .from(s('.frame-photo img'), { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.1)
        .from(s('.person-role'), { opacity: 0, y: 10, duration: 0.8 }, 0.6)
        .from(s('.person-name'), { yPercent: 110, duration: 1.1, ease: 'expo.out' }, 0.7)
        .from(s('.person-en, .person-parents'), { opacity: 0, duration: 1, stagger: 0.15 }, 1.0);
    });
    scrollTl(q('.couple-amp')[0], 'top 85%').from(q('.couple-amp'), { scale: 0, rotation: -30, duration: 1, ease: 'back.out(2.5)' });
  });
  return (
    <section className="sec sec-paper paper couple" id="couple" ref={ref}>
      <SectionHead k="coupleTitle" />
      <div className="couple-grid">
        <Person who={wedding.groom} photo={wedding.groomPhoto} role={t.groom} of={t.sonOf} parents={wedding.groomParents} />
        <div className="couple-amp" aria-hidden="true">
          <svg viewBox="0 0 24 22"><path d={HEART} /></svg>
          <Butterfly className="couple-bfly" />
        </div>
        <Person who={wedding.bride} photo={wedding.bridePhoto} role={t.bride} of={t.daughterOf} parents={wedding.brideParents} />
      </div>
    </section>
  );
}
