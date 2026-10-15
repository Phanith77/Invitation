import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';

// Pre-wedding film: plays by itself with sound while it is on screen (the guest already tapped the
// envelope, which lets browsers play sound; if one still refuses, it plays muted until tapped) and
// pauses when scrolled away. A tap opens it full-screen from the same moment. While the film is
// heard, the background song steps aside (the 'film-sound' event, handled in App).
export default function PreWedding() {
  const { lang, t } = useLang();
  const v = wedding.video;
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const inline = useRef(null);
  const [vidEl, setVidEl] = useState(null); // the observer follows the element actually on the page
  const full = useRef(null);
  const auto = !!v?.src && !v.youtube && !matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData;

  // autoplay while a quarter of the film is visible (the reveal clip-path hides much of it at first); pause when it leaves or the viewer opens
  useEffect(() => {
    const vid = vidEl;
    if (!auto || !vid) return;
    if (open) { vid.pause(); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { vid.pause(); return; }
      vid.muted = false;
      vid.play().catch(() => { vid.muted = true; vid.play().catch(() => {}); });
    }, { threshold: 0.25 });
    io.observe(vid);
    return () => io.disconnect();
  }, [auto, open, vidEl]);

  // let the background song pause while the film is heard, and come back after
  const heard = open || (playing && !muted);
  useEffect(() => {
    dispatchEvent(new CustomEvent('film-sound', { detail: heard }));
  }, [heard]);
  useEffect(() => () => dispatchEvent(new CustomEvent('film-sound', { detail: false })), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    window.__lenis?.stop();
    document.documentElement.classList.add('is-viewer');
    return () => { removeEventListener('keydown', onKey); window.__lenis?.start(); document.documentElement.classList.remove('is-viewer'); };
  }, [open]);

  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    scrollTl(q('.film')[0], 'top 85%')
      .fromTo(q('.film'), { clipPath: 'inset(12% 22% 12% 22% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from(q('.film-play'), { scale: 0.4, opacity: 0, duration: 0.9, ease: 'back.out(2.4)' }, 0.9);
  });
  if (!v || (!v.src && !v.youtube)) return null;
  const poster = v.poster || (v.youtube ? `https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg` : undefined);
  return (
    <section className="sec sec-dark prewedding" id="film" ref={ref}>
      <SectionHead k="videoTitle" />
      <button className={`film ${playing ? 'is-playing' : ''}`} onClick={() => setOpen(true)} aria-label={t.playVideo}>
        {auto ? (
          <video ref={(el) => { inline.current = el; setVidEl(el); }} src={v.src} poster={poster} loop playsInline preload="metadata" aria-hidden="true"
            onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={(e) => setMuted(e.currentTarget.muted)} />
        ) : poster && <img src={poster} alt="" loading="lazy" />}
        <span className="film-bars" aria-hidden="true" />
        <span className="film-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5L19 12L8 19Z" /></svg></span>
        <span className="film-label" lang={lang}>{playing ? (muted ? t.filmTapSound : t.filmTapFull) : t.playVideo}</span>
      </button>
      {open && createPortal(
        <div className="viewer film-viewer" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          {v.youtube ? (
            <iframe title="film" src={`https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <video ref={full} src={v.src} poster={v.poster} controls autoPlay playsInline
              onLoadedMetadata={() => { if (full.current && inline.current) full.current.currentTime = inline.current.currentTime; }} />
          )}
          <button className="viewer-btn viewer-close" onClick={() => setOpen(false)} aria-label={t.close}>×</button>
        </div>,
        document.body,
      )}
    </section>
  );
}
