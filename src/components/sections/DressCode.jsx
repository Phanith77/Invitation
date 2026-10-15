import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';

// Signature: silk swatches unroll from the top like ribbons being hung.
export default function DressCode() {
  const { lang, p } = useLang();
  const dc = wedding.dressCode;
  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    scrollTl(q('.swatches')[0], 'top 85%')
      .fromTo(q('.swatch-silk'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, stagger: 0.12, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
      .fromTo(q('.swatch-name'), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.12 }, 0.6);
  });
  if (!dc) return null;
  return (
    <section className="sec sec-light paper-card dresscode" id="dresscode" ref={ref}>
      <SectionHead k="dressTitle" />
      <p className="dc-note" lang={lang}>{p(dc.note)}</p>
      <ul className="swatches" lang={lang}>
        {dc.colors.map((c) => (
          <li className="swatch" key={c.hex}>
            <div className="swatch-silk" style={{ '--sw': c.hex }}><i /></div>
            <span className="swatch-name">{p(c)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
