import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, skipEnvelope, isPhone, reducedMotion } from './lib/env';
import { LangContext } from './lib/lang';
import { wedding } from './data/wedding';
import { GoldDefs } from './components/Decor';
import { startAmbience, stopAmbience } from './lib/ambience';
import RumdulIntro from './components/RumdulIntro';
import Cover from './components/Cover';
import TopBar from './components/TopBar';
// everything below the cover downloads in the background while the opening flower shows
const loadSections = () => import('./components/Sections');
const Sections = lazy(loadSections);
import { countVisit } from './lib/api';
import { weddingPhase } from './lib/phase';

export default function App() {
  const [lang, setLang] = useState('km');
  const [revealed, setRevealed] = useState(skipEnvelope);
  const [envelopeGone, setEnvelopeGone] = useState(skipEnvelope);
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
    document.documentElement.dataset.lang = lang;
    ScrollTrigger.refresh();
  }, [lang]);

  // lock scrolling until the envelope is gone
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !envelopeGone);
    if (envelopeGone) ScrollTrigger.refresh();
  }, [envelopeGone]);

  // Lenis smooth scroll on desktop only
  useEffect(() => {
    if (!envelopeGone || isPhone || reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.09, anchors: { offset: 0, duration: 1.6 } });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.__lenis = null; };
  }, [envelopeGone]);

  // an mp3 in wedding.music if there is one, otherwise the generated lotus-pond ambience
  useEffect(() => { if (revealed) countVisit(); }, [revealed]);

  const startMusic = () => {
    const a = audio.current;
    if (!a) { startAmbience(); setPlaying(true); return; }
    a.volume = 0;
    a.play().then(() => { setPlaying(true); gsap.to(a, { volume: 0.7, duration: 3 }); }).catch(() => {});
  };
  const toggleMusic = () => {
    const a = audio.current;
    if (!a) {
      if (playing) stopAmbience(); else startAmbience();
      setPlaying(!playing);
      return;
    }
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else { a.pause(); setPlaying(false); }
  };

  // the pre-wedding film takes the stage: fade the song out while it is heard, bring it back after
  const playingRef = useRef(false);
  playingRef.current = playing;
  useEffect(() => {
    let paused = false;
    const onFilm = (e) => {
      const a = audio.current;
      if (e.detail && playingRef.current) {
        paused = true;
        if (a) gsap.to(a, { volume: 0, duration: 0.6, onComplete: () => a.pause() }); else stopAmbience();
      } else if (!e.detail && paused) {
        paused = false;
        if (a) { gsap.killTweensOf(a); a.play().then(() => gsap.to(a, { volume: 0.7, duration: 2 })).catch(() => {}); } else startAmbience();
      }
    };
    addEventListener('film-sound', onFilm);
    return () => removeEventListener('film-sound', onFilm);
  }, []);

  const phase = weddingPhase(wedding.dateISO);
  // start downloading the sections right away, but mount them only once the cover is revealed
  const [sectionsReady, setSectionsReady] = useState(false);
  useEffect(() => { loadSections().then(() => revealed && setSectionsReady(true)); }, [revealed]);
  const ctx = useMemo(() => ({ lang, setLang }), [lang]);
  return (
    <LangContext.Provider value={ctx}>
      <GoldDefs />
      {wedding.music && <audio ref={audio} src={wedding.music} loop preload="none" />}
      <TopBar visible={revealed} playing={playing} onToggleMusic={toggleMusic} />
      <main>
        <Cover revealed={revealed} />
        {(revealed || sectionsReady) && (
          <Suspense fallback={null}><Sections phase={phase} /></Suspense>
        )}
        <footer className="credit">
          <p>Design inspired by Phanith</p>
        </footer>
      </main>
      {!envelopeGone && (
        <RumdulIntro onStart={startMusic} onReveal={() => setRevealed(true)} onDone={() => setEnvelopeGone(true)} />
      )}
    </LangContext.Provider>
  );
}
