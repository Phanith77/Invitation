import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import Photo from '../Photo';
import { useGsap, SectionHead } from '../Shared';

// Signature: the section pins and the photo strip travels sideways while the light shifts from day to dusk.
export default function Story() {
  const { lang, t, n } = useLang();
  const ref = useGsap((q, el) => {
    const strip = q('.story-strip')[0];
    if (lite) return; // light version: native horizontal swipe (scroll-snap), no pin
    el.classList.add('is-pinned');
    const dist = () => Math.max(0, strip.scrollWidth - innerWidth);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist() * 1.1}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
    });
    tl.to(strip, { x: () => -dist() }, 0)
      .to(q('.story-dusk'), { opacity: 1 }, 0)
      .to(q('.story-sun'), { yPercent: 260, opacity: 0.15 }, 0)
      .to(el, { '--story-ink': '#f3ead6', duration: 0.12 }, 0.32); // switch quickly: no unreadable mid-grey
    q('.story-panel').forEach((pnl) => {
      gsap.fromTo(pnl.querySelector('img'), { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: pnl, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true } });
    });
  });
  return (
    <section className={`sec story ${lite ? 'is-lite' : ''}`} id="story" ref={ref}>
      <div className="story-day" /><div className="story-dusk" /><div className="story-sun" />
      <div className="story-inner">
        <SectionHead k="storyTitle" crest={false} className="story-head" />
        <div className="story-strip">
          {wedding.storyPhotos.map((slug, i) => (
            <figure className={`story-panel ${i % 2 ? 'low' : ''}`} key={i}>
              <div className="story-photo"><Photo slug={slug} sizes="(min-width: 900px) 34vw, 72vw" alt="" eager={false} /></div>
              <figcaption className="story-cap" lang={lang}>
                <span className="story-no">{n(String(i + 1).padStart(2, '0'))}</span>
                {t.story[i]}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
