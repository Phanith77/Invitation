import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, ScrollTrigger, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import Photo from '../Photo';
import { useGsap, SectionHead, headIn } from '../Shared';

function Lightbox({ index, setIndex, onClose }) {
  const { t, n } = useLang();
  const photos = wedding.gallery;
  const track = useRef(null);
  const drag = useRef(null);
  const go = useCallback((d) => setIndex((i) => (i + d + photos.length) % photos.length), [photos.length, setIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    addEventListener('keydown', onKey);
    window.__lenis?.stop();
    document.documentElement.classList.add('is-viewer');
    return () => {
      removeEventListener('keydown', onKey);
      window.__lenis?.start();
      document.documentElement.classList.remove('is-viewer');
    };
  }, [go, onClose]);

  const setX = (px) => { track.current.style.transform = `translate3d(calc(${-index * 100}% + ${px}px),0,0)`; };
  const onDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, dx: 0 };
    track.current.style.transition = 'none';
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    drag.current.dx = e.clientX - drag.current.x;
    setX(drag.current.dx);
  };
  const onUp = () => {
    if (!drag.current) return;
    const { dx } = drag.current;
    drag.current = null;
    track.current.style.transition = '';
    if (dx < -50) go(1);
    else if (dx > 50) go(-1);
    else setX(0);
  };
  useEffect(() => { setX(0); }); // keep transform in sync after index changes

  // portal to <body> so it sits above the top bar, outside the section's stacking context
  return createPortal(
    <div className="viewer" role="dialog" aria-modal="true">
      <div className="viewer-track" ref={track} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {photos.map((ph, k) => (
          <div className="viewer-slide" key={ph.slug}>
            {Math.abs(k - index) <= 1 && <Photo slug={ph.slug} sizes="100vw" alt="" draggable={false} />}
          </div>
        ))}
      </div>
      <p className="viewer-count">{n(index + 1)} / {n(photos.length)}</p>
      <button className="viewer-btn viewer-close" onClick={onClose} aria-label={t.close}>×</button>
      <button className="viewer-btn viewer-prev" onClick={() => go(-1)} aria-label={t.prev}>‹</button>
      <button className="viewer-btn viewer-next" onClick={() => go(1)} aria-label={t.next}>›</button>
    </div>,
    document.body,
  );
}

// Signature: tiles are unveiled in batches like prints lifted from a box, bottom edge first.
export default function Gallery() {
  const [open, setOpen] = useState(-1);
  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    const tiles = q('.g-tile');
    const hide = (els) => { gsap.set(els, { clipPath: 'inset(100% 0% 0% 0%)' }); els.forEach((t) => delete t.dataset.shown); };
    const show = (batch) => {
      const fresh = batch.filter((t) => !t.dataset.shown);
      if (!fresh.length) return;
      fresh.forEach((t) => (t.dataset.shown = '1'));
      gsap.timeline()
        .fromTo(fresh, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, stagger: 0.1, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
        // explicit end value: tile images have a CSS transform transition (hover zoom)
        .fromTo(fresh.map((b) => b.querySelector('img')), { scale: 1.25 }, { scale: 1, duration: 1.8, stagger: 0.1, ease: 'expo.out', clearProps: 'transform,scale' }, 0.1);
    };
    hide(tiles);
    // play when a tile scrolls in from below or from above; reset once it is completely off-screen
    ScrollTrigger.batch(tiles, { start: 'top 92%', end: 'bottom 8%', onEnter: show, onEnterBack: show });
    ScrollTrigger.batch(tiles, { start: 'top bottom', end: 'bottom top', onLeave: hide, onLeaveBack: hide });
  });
  return (
    <section className="sec sec-dark gallery" id="gallery" ref={ref}>
      <SectionHead k="galleryTitle" />
      <div className="g-grid">
        {wedding.gallery.map((ph, i) => (
          <button className="g-tile" key={ph.slug} onClick={() => setOpen(i)} style={{ aspectRatio: `${ph.w} / ${ph.h}` }} aria-label={`${i + 1}`}>
            <Photo slug={ph.slug} sizes="(min-width: 1000px) 25vw, (min-width: 640px) 33vw, 50vw" alt="" eager={false} />
          </button>
        ))}
      </div>
      {open >= 0 && <Lightbox index={open} setIndex={setOpen} onClose={() => setOpen(-1)} />}
    </section>
  );
}
