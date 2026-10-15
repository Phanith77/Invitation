import { useEffect, useRef } from 'react';
import { gsap, lite, reducedMotion } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import Photo from '../Photo';
import { useGsap, scrollTl } from '../Shared';
import Blessings from '../Blessings';

const WATER = 0.42; // water starts at this fraction of the section height

/** Canvas: touch the water → ripples + a small lotus lantern that drifts and fades.
 *  Sized from its parent with ResizeObserver; draws only while visible. */
function WaterCanvas({ spawnRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current, parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, raf = 0, visible = false, last = 0;
    const ripples = [], lanterns = [];
    let hinted = false, hint = 0;
    const maxL = lite ? 5 : 12;

    const ro = new ResizeObserver(() => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      const w = parent.clientWidth, h = parent.clientHeight;
      if (w === W && h === H) return;
      W = w; H = h;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    });
    ro.observe(parent);

    const spawn = (x, y) => {
      if (y < H * WATER) return;
      for (let k = 0; k < 3; k++) ripples.push({ x, y, r: 2 + k * 10, a: 0.55 - k * 0.12, life: 0 });
      if (lanterns.length >= maxL) lanterns.shift();
      lanterns.push({ x, y, t: 0, vx: (Math.random() - 0.5) * 6, seed: Math.random() * 10, life: 14 + Math.random() * 6 });
      window.__lanterns = (window.__lanterns || 0) + 1; // read by scripts/functional.mjs
      start();
    };
    // a tap floats a lantern; a finger that moves (scrolling past) does not
    let down = null;
    // taps on the blessing controls are not taps on the water
    const onDown = (e) => { down = e.target.closest('button, a, input, textarea, form') ? null : { x: e.clientX, y: e.clientY, t: performance.now() }; };
    const onUp = (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), held = performance.now() - down.t;
      down = null;
      if (moved > 10 || held > 600) return;
      const r = canvas.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top);
    };
    const onCancel = () => { down = null; };
    if (spawnRef) spawnRef.current = () => spawn(W * (0.25 + Math.random() * 0.5), H * (0.6 + Math.random() * 0.25));
    parent.addEventListener('pointerdown', onDown);
    parent.addEventListener('pointerup', onUp);
    parent.addEventListener('pointercancel', onCancel);

    function lantern(l) {
      const depth = gsap.utils.clamp(0.35, 1, (l.y - H * WATER) / (H * (1 - WATER)) + 0.35); // smaller toward the horizon
      const s = 18 * depth * Math.min(1, W / 600 + 0.5);
      const fade = Math.min(1, l.t / 0.6) * Math.min(1, (l.life - l.t) / 3);
      const flick = 0.85 + 0.15 * Math.sin(l.t * 9 + l.seed) * Math.sin(l.t * 4.3);
      ctx.save();
      ctx.translate(l.x, l.y + Math.sin(l.t * 1.4 + l.seed) * 1.5);
      ctx.globalAlpha = fade;
      // glow + reflection
      let g = ctx.createRadialGradient(0, -s * 0.6, 0, 0, -s * 0.6, s * 3.4);
      g.addColorStop(0, `rgba(255,200,120,${0.45 * flick})`); g.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -s * 0.6, s * 3.4, 0, 7); ctx.fill();
      g = ctx.createLinearGradient(0, 0, 0, s * 2.4);
      g.addColorStop(0, `rgba(255,190,110,${0.35 * flick})`); g.addColorStop(1, 'rgba(255,190,110,0)');
      ctx.fillStyle = g; ctx.fillRect(-s * 0.25, s * 0.2, s * 0.5, s * 2.4);
      // lotus petals
      const petal = (rot, len, col) => {
        ctx.save(); ctx.rotate(rot); ctx.beginPath();
        ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s * 0.32, -len * 0.55, 0, -len); ctx.quadraticCurveTo(s * 0.32, -len * 0.55, 0, 0);
        ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = 'rgba(214,170,90,.7)'; ctx.lineWidth = 0.6; ctx.stroke(); ctx.restore();
      };
      ctx.scale(1, 0.62);
      [-1.25, 1.25, -0.75, 0.75].forEach((r) => petal(r, s * 1.05, '#f1d9c8'));
      [-0.35, 0.35, 0].forEach((r) => petal(r, s * 1.2, '#f7e6da'));
      ctx.scale(1, 1 / 0.62);
      // flame
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.55); ctx.quadraticCurveTo(-s * 0.16, -s * 0.85, 0, -s * (1.25 + 0.12 * flick)); ctx.quadraticCurveTo(s * 0.16, -s * 0.85, 0, -s * 0.55);
      ctx.fillStyle = '#ffd98a'; ctx.fill();
      ctx.restore();
    }

    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) return; // stopped; restarted by visibility/touch
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.life += dt; r.r += dt * 46; r.a -= dt * 0.28;
        if (r.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, 7);
        ctx.strokeStyle = `rgba(255,228,180,${r.a})`; ctx.lineWidth = 1.2; ctx.stroke();
      }
      for (let i = lanterns.length - 1; i >= 0; i--) {
        const l = lanterns[i];
        l.t += dt;
        if (l.t > l.life) { lanterns.splice(i, 1); continue; }
        l.x += l.vx * dt; l.y -= dt * 4 * ((l.y - H * WATER) / H + 0.1); // drifts toward the horizon
        lantern(l);
      }
      if (ripples.length || lanterns.length) start();
    }
    function start() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        if (!hinted && !reducedMotion) { hinted = true; hint = setTimeout(() => spawn(W * 0.5, H * 0.74), 600); } // a first lantern as a hint
        start();
      }
    }, { threshold: 0.25 });
    io.observe(parent);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(hint); ro.disconnect(); io.disconnect();
      parent.removeEventListener('pointerdown', onDown);
      parent.removeEventListener('pointerup', onUp);
      parent.removeEventListener('pointercancel', onCancel);
    };
  }, []);
  return <canvas ref={ref} className="water-canvas" aria-hidden="true" />;
}

// Signature: interactive — the guest floats their own lantern.
export default function Candle() {
  const { lang, t } = useLang();
  const spawnRef = useRef(null);
  const ref = useGsap((q, el) => {
    if (lite) return;
    scrollTl(el, 'top 60%')
      .from(q('.candle-title'), { opacity: 0, letterSpacing: '0.3em', duration: 1.8, ease: 'power3.out', clearProps: 'letterSpacing' }, 0)
      .from(q('.candle-line'), { opacity: 0, y: 14, duration: 1.2 }, 0.4)
      .from(q('.candle-hint'), { opacity: 0, duration: 1 }, 1.2);
    gsap.fromTo(q('.candle-bg img'), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  return (
    <section className="sec candle" id="candle" ref={ref}>
      <div className="candle-bg"><Photo slug={wedding.candlePhoto} sizes="100vw" alt="" eager={false} /></div>
      <div className="candle-shade" />
      <WaterCanvas spawnRef={spawnRef} />
      <Blessings onLantern={() => spawnRef.current?.()} />
      <div className="candle-text" lang={lang}>
        <h2 className={`candle-title foil ${lang === 'km' ? 'km-moul' : 'en-title'}`}>{t.candleTitle}</h2>
        <p className="candle-line">{t.candleLine}</p>
      </div>
      <p className="candle-hint" lang={lang}><span className="hint-dot" />{t.candleHint}</p>
    </section>
  );
}
