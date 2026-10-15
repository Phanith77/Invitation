import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { Corner } from '../Decor';
import Photo from '../Photo';
import { useGsap, SectionHead, headIn, Parents, scrollTl } from '../Shared';

// Signature: the arched photo rises out of its gold arch while the arch line draws around it.
export default function Invitation() {
  const { lang, t } = useLang();
  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) {
      scrollTl(el, 'top 70%').from(q('.inv-arch, .inv-words .mask > *, .parents'), { opacity: 0, duration: 1, stagger: 0.08 });
      return;
    }
    const tl = scrollTl(q('.inv-arch')[0], 'top 80%');
    tl.fromTo(q('.inv-arch-line'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.8, ease: 'power2.inOut' }, 0)
      .fromTo(q('.inv-photo'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.2)
      .from(q('.inv-photo img'), { scale: 1.3, duration: 2.4, ease: 'expo.out' }, 0.3);
    gsap.to(q('.inv-photo img'), { yPercent: -8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    scrollTl(q('.inv-words')[0], 'top 82%').from(q('.inv-words .mask > *'), { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'expo.out' });
    scrollTl(q('.inv-parents')[0], 'top 88%').from(q('.parents'), { opacity: 0, x: (i) => (i ? 30 : -30), duration: 1.2, stagger: 0.15, ease: 'power3.out' });
  });

  return (
    <section className="sec sec-light paper-card invitation" id="invitation" ref={ref}>
      <Corner className="sec-corner tl" />
      <Corner flip="x" className="sec-corner tr" />
      <SectionHead k="inviteTitle" />
      <div className="inv-grid">
        <div className="inv-arch">
          <svg className="inv-arch-svg" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
            <path className="inv-arch-line" d="M0 400V152.8A150 152.8 0 0 1 300 152.8V400Z" />
          </svg>
          <div className="inv-photo"><Photo slug={wedding.invitePhoto} sizes="(min-width: 900px) 30vw, 70vw" alt="" eager={false} /></div>
        </div>
        <div className="inv-text">
          <div className="inv-words" lang={lang}>
            {t.inviteWords.map((line, i) => (
              <div className="mask" key={i}><p className={i === 3 ? 'inv-key' : ''}>{line}</p></div>
            ))}
          </div>
          <div className="inv-parents">
            <Parents heading={t.groomParents} parents={wedding.groomParents} />
            <Parents heading={t.brideParents} parents={wedding.brideParents} />
          </div>
        </div>
      </div>
    </section>
  );
}
