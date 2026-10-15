import { useLayoutEffect, useRef } from 'react';
import { gsap, lite, reducedMotion, isPhone } from '../lib/env';
import { text } from '../i18n';
import { useLang } from '../lib/lang';
import { guestName } from '../lib/guest';
import NameLogo, { logoTimeline } from './NameLogo';

/**
 * Opening scene: a rumdul (ផ្ការំដួល, Cambodia's national flower) bud on a branch in an evening
 * garden. Tap → its three outer petals open one by one in 3D while the three inner petals stay
 * as a small dome, fragrance drifts up as golden motes, the couple's names appear, and the
 * camera dives into the flower.
 *
 * 3D: .rd-cam (perspective) > .rd-tilt > .rd-bob > .rd-plane (tilt, turns to face the camera as it
 * blooms) > .rd-flower > petals. The names and fragrance motes sit beside the plane, upright.
 * Each petal lies flat pointing outward and is lifted with rotateX around its base.
 * Everything in the 3D chain keeps preserve-3d and has no CSS filter or opacity.
 */
const OUTER = 3, INNER = 3, LEAVES = 10; // a rosette of leaves in two rings, like the rumdul mark
const OUTER_PETAL = 'M50 100C24 94 2 74 3 48C4 26 26 10 50 0C74 10 96 26 97 48C98 74 76 94 50 100Z'; // broad, pointed tip (as in the mark)
const PANEL = 'M50 84C34 78 24 64 25 48C26 36 38 24 50 16C62 24 74 36 75 48C76 64 66 78 50 84Z'; // lighter inner panel
const INNER_PETAL = 'M50 100C26 94 6 72 6 46C6 20 26 4 50 4C74 4 94 20 94 46C94 72 74 94 50 100Z'; // lobes of the inner ball
const LEAF = 'M50 100C22 82 10 50 20 24C28 10 40 3 50 0C60 3 72 10 80 24C90 50 78 82 50 100Z'; // broad, pointed
const MOTES = 14;
// falling rumdul petals: [left %, size px, fall seconds, delay seconds, sideways drift vw]
const PETALS = [[8, 12, 13, -2, 8], [22, 9, 16, -9, -6], [36, 14, 12, -5, 10], [51, 10, 18, -13, -8], [63, 13, 14, -1, 6], [76, 9, 17, -7, -10], [88, 12, 15, -11, -5], [45, 8, 20, -16, 12]];

function Part({ kind: cls, i, n, offset = 0, d }) {
  const kind = cls.split(' ')[0]; // "leaf leaf-s" → leaf art, extra class for sizing
  return (
    <div className={`rd-wrap ${cls}`} style={{ '--rz': `${(360 / n) * i + offset}deg` }}>
      <div className="rd-part">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {/* volume: base colour, darker rim, soft central fold, glossy highlight, all clipped to the petal */}
          <g clipPath={`url(#rd-clip-${kind})`}>
            <rect width="100" height="100" fill={`url(#rd-${kind})`} />
            <rect width="100" height="100" fill={`url(#rd-rim-${kind === 'leaf' ? 'leaf' : 'petal'})`} />
            <path d="M50 99C48.5 72 48.5 34 50 3" stroke={kind === 'leaf' ? '#1f5a26' : '#8a5a0a'} strokeOpacity={kind === 'leaf' ? '.5' : '.32'} strokeWidth="3.5" fill="none" />
            <path d="M53 97C53.5 70 52.5 34 51.5 6" stroke={kind === 'leaf' ? '#c6f09a' : '#fff4c8'} strokeOpacity=".55" strokeWidth="1.4" fill="none" />
            {kind === 'outer' && <path d={PANEL} fill="#fde9a6" opacity=".8" />}
            <ellipse cx="36" cy="40" rx="20" ry="30" fill="url(#rd-gloss)" />
          </g>
          <path d={d} fill="none" stroke={kind === 'leaf' ? '#2a6f30' : '#a8761a'} strokeOpacity=".75" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

export default function RumdulIntro({ onStart, onReveal, onDone }) {
  const { lang, t } = useLang();
  const root = useRef(null);
  const state = useRef({ opened: false });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.set(q('.rd-wrap.outer .rd-part'), { rotationX: -84, transformOrigin: '50% 100%' });
      gsap.set(q('.rd-wrap.inner .rd-part'), { rotationX: -88, transformOrigin: '50% 100%' });
      gsap.set(q('.rd-wrap.leaf .rd-part'), { rotationX: -14, transformOrigin: '50% 100%' });
      gsap.set(q('.rd-heart-in'), { opacity: 0, scale: 0.5 });
      gsap.set(q('.rd-plane'), { rotationX: 60 }); // seen from slightly above while closed

      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        .from(q('.rd-sky, .rd-garden'), { opacity: 0, duration: 2.4 }, 0)
        .from(q('.rd-branch'), { opacity: 0, x: (i) => (i ? 60 : -60), duration: 2.4 }, 0.2)
        .from(q('.env-title .mask > *'), { yPercent: 110, duration: 1.4, stagger: 0.15 }, 0.3)
        .from(q('.rd-stage'), { opacity: 0, duration: 1.6 }, 0.4)
        .from(q('.rd-flower'), { z: -240, duration: 2.2 }, 0.4)
        .from(q('.env-hint, .rd-to'), { opacity: 0, y: 10, duration: 1, stagger: 0.15 }, 1.3);

      if (reducedMotion) return;
      // the flower sways on its stem; fireflies drift
      state.current.sway = gsap.timeline({ repeat: -1, yoyo: true })
        .to(q('.rd-bob'), { y: -6, rotationZ: 1.5, duration: 3, ease: 'sine.inOut' });
      gsap.to(q('.env-hint'), { opacity: 0.45, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4 });

      if (lite) return;
      const tilt = q('.rd-tilt')[0];
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: 1, ease: 'power3.out' });
      const ry = gsap.quickTo(tilt, 'rotationY', { duration: 1, ease: 'power3.out' });
      // parallax: far stars move a little, the moon more, the near branches most
      const depth = [['.rd-stars', 6], ['.rd-moon', 14], ['.rd-branch', 30], ['.rd-petals', 18]].map(([sel, k]) => ({
        k, x: gsap.quickTo(q(sel), 'x', { duration: 1.4, ease: 'power3.out' }), y: gsap.quickTo(q(sel), 'y', { duration: 1.4, ease: 'power3.out' }),
      }));
      const parallax = (nx, ny) => depth.forEach((d) => { d.x(-nx * d.k); d.y(-ny * d.k * 0.6); });
      const onMove = (e) => {
        if (state.current.opened) return;
        const nx = (e.clientX / innerWidth) - 0.5, ny = (e.clientY / innerHeight) - 0.5;
        rx(ny * -8);
        ry(nx * 14);
        parallax(nx * 2, ny * 2);
      };
      let base = null;
      const onOrient = (e) => {
        if (state.current.opened || e.beta == null) return;
        base ??= { b: e.beta, g: e.gamma };
        rx(gsap.utils.clamp(-8, 8, -(e.beta - base.b) * 0.4));
        ry(gsap.utils.clamp(-12, 12, (e.gamma - base.g) * 0.5));
        parallax(gsap.utils.clamp(-1, 1, (e.gamma - base.g) / 25), gsap.utils.clamp(-1, 1, (e.beta - base.b) / 25));
      };
      if (!isPhone) addEventListener('pointermove', onMove);
      else addEventListener('deviceorientation', onOrient);
      return () => { removeEventListener('pointermove', onMove); removeEventListener('deviceorientation', onOrient); };
    }, root);
    return () => ctx.revert();
  }, []);

  function open() {
    if (state.current.opened) return;
    state.current.opened = true;
    onStart?.(); // music starts on this tap
    const q = gsap.utils.selector(root);
    state.current.sway?.kill();

    if (reducedMotion) {
      gsap.timeline()
        .to(root.current, { opacity: 0, duration: 0.8, ease: 'power1.inOut' })
        .call(() => onReveal?.(), null, 0.2)
        .call(() => onDone?.());
      return;
    }

    const W = q('.rd-stage')[0].offsetWidth;
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    window.__envTL = tl; // used by the screenshot script to step through frames
    tl.to(q('.env-title, .env-hint, .rd-to'), { opacity: 0, y: -12, duration: 0.6, ease: 'power1.out', overwrite: true }, 0)
      .to(q('.rd-tilt'), { rotationX: 0, rotationY: 0, duration: 0.9 }, 0)
      .to(q('.rd-bob'), { y: 0, rotationZ: 0, duration: 0.6 }, 0)
      // the branches part like curtains as the flower opens
      .to(q('.rd-branch.l'), { x: '-=90', y: '-=30', duration: 2.4, ease: 'power2.inOut', overwrite: 'auto' }, 0.2)
      .to(q('.rd-branch.r'), { x: '+=90', y: '-=30', duration: 2.4, ease: 'power2.inOut', overwrite: 'auto' }, 0.2)
      // the three outer petals open one by one; the inner dome loosens a little
      .to(q('.rd-wrap.outer .rd-part'), { rotationX: -20, duration: 1.6, ease: 'power3.inOut', stagger: 0.32 }, 0.3)
      .to(q('.rd-wrap.inner .rd-part'), { rotationX: -42, duration: 1.4, ease: 'power3.inOut', stagger: 0.12 }, 1.2)
      // as it blooms, the flower turns to face us so the big petals are seen whole
      .to(q('.rd-plane'), { rotationX: 20, duration: 2.4, ease: 'power2.inOut' }, 0.6)
      .to(q('.rd-glow'), { opacity: 1, scale: 1.25, duration: 1.8, ease: 'power2.out' }, 1.0)
      // fragrance: golden motes rise and drift
      .fromTo(q('.rd-mote'), { opacity: 0, y: 0, x: 0, scale: 0.4 }, {
        opacity: 1, scale: 1, y: () => -(0.25 + Math.random() * 0.5) * W, x: () => (Math.random() - 0.5) * W * 0.9,
        duration: 2.6, ease: 'power1.out', stagger: 0.07,
      }, 1.3)
      .to(q('.rd-mote'), { opacity: 0, duration: 1, stagger: 0.05 }, 3.0)
      .to(q('.rd-heart-in'), { opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out' }, 1.8)
      .add(logoTimeline(q('.rd-heart .namelogo')[0]), 1.9)
      // dive into the flower; warm evening light fills the screen
      .to(q('.rd-cam'), { scale: 5.5, y: '14%', duration: 1.5, ease: 'power3.in' }, 4.0)
      .to(q('.rd-sky, .rd-garden, .rd-branch, .rd-flies, .rd-petals'), { opacity: 0, duration: 1.2, ease: 'power1.in' }, 4.0)
      .to(q('.rd-dusk'), { opacity: 1, duration: 0.9, ease: 'power1.in' }, 4.6)
      .call(() => onReveal?.(), null, 5.4)
      .to(root.current, { opacity: 0, duration: 0.9, ease: 'power1.out' }, 5.4)
      .call(() => onDone?.(), null, 6.3);
  }

  return (
    <div className="env-screen rd" ref={root}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          {/* golden-yellow petals with real volume: deep base, bright shoulders, darker rim, gloss */}
          <linearGradient id="rd-outer" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#a8700f" /><stop offset=".22" stopColor="#d79a22" /><stop offset=".58" stopColor="#f2c241" /><stop offset=".88" stopColor="#ffe07a" /><stop offset="1" stopColor="#f5cc52" /></linearGradient>
          <linearGradient id="rd-inner" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#b47a16" /><stop offset=".5" stopColor="#ecbd45" /><stop offset="1" stopColor="#ffe794" /></linearGradient>
          <linearGradient id="rd-leaf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#1f6a2a" /><stop offset=".6" stopColor="#3f9a3a" /><stop offset="1" stopColor="#64b94a" /></linearGradient>
          <radialGradient id="rd-rim-petal" cx=".5" cy=".55" r=".6"><stop offset=".62" stopColor="#5a3200" stopOpacity="0" /><stop offset="1" stopColor="#5a3200" stopOpacity=".55" /></radialGradient>
          <radialGradient id="rd-rim-leaf" cx=".5" cy=".5" r=".6"><stop offset=".6" stopColor="#0c2a10" stopOpacity="0" /><stop offset="1" stopColor="#0c2a10" stopOpacity=".5" /></radialGradient>
          <radialGradient id="rd-gloss"><stop offset="0" stopColor="#fffbe6" stopOpacity=".95" /><stop offset=".45" stopColor="#fff2c0" stopOpacity=".38" /><stop offset="1" stopColor="#fff2c0" stopOpacity="0" /></radialGradient>
          <clipPath id="rd-clip-outer"><path d={OUTER_PETAL} /></clipPath>
          <clipPath id="rd-clip-inner"><path d={INNER_PETAL} /></clipPath>
          <clipPath id="rd-clip-leaf"><path d={LEAF} /></clipPath>
        </defs>
      </svg>
      <div className="rd-sky"><i className="rd-stars" /><i className="rd-moon" /><i className="rd-cloud c1" /><i className="rd-cloud c2" /><i className="rd-shoot" /></div>
      <div className="rd-garden" />
      {/* evening branches with rumdul leaves framing the scene */}
      {[0, 1].map((side) => (
        <svg key={side} className={`rd-branch ${side ? 'r' : 'l'}`} viewBox="0 0 300 300" aria-hidden="true">
          <g transform={side ? 'translate(300 0) scale(-1 1)' : undefined}>
            <path d="M-10 40C60 60 120 90 170 150C190 175 205 200 215 230" stroke="#1d3324" strokeWidth="7" fill="none" strokeLinecap="round" />
            {[[40, 50, -20], [80, 66, 10], [118, 92, -30], [150, 126, 20], [176, 160, -10], [198, 196, 30]].map(([x, y, r], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${r + (i % 2 ? 60 : -40)})`}>
                <path className="rd-leaf" style={{ '--d': `${-i * 0.43 - side * 0.9}s` }} d="M0 0C10 -14 34 -18 56 -8C34 2 12 4 0 0Z" fill={i % 2 ? '#2d5139' : '#24432f'} />
              </g>
            ))}
            <g transform="translate(215 236)">
              <path className="rd-bud" d="M0 0C-9 4 -12 14 -4 18C2 12 4 6 0 0ZM0 0C9 4 12 14 4 18C-2 12 -4 6 0 0ZM0 0C-4 10 0 20 0 22C0 20 4 10 0 0Z" fill="#efdb94" />
            </g>
          </g>
        </svg>
      ))}
      <div className="rd-petals" aria-hidden="true">
        {PETALS.map(([left, size, dur, delay, dx], i) => (
          <i key={i} style={{ left: `${left}%`, '--s': `${size}px`, '--t': `${dur}s`, '--dl': `${delay}s`, '--dx': `${dx}vw` }}><b /></i>
        ))}
      </div>
      <div className="rd-flies" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--i': i, left: `${8 + i * 9}%`, top: `${30 + ((i * 37) % 50)}%` }} />)}</div>

      <header className="env-title">
        <div className="mask"><p className="km-moul foil" lang="km">{text.km.blessingTitle}</p></div>
        <div className="mask"><p className="en-caps">The Wedding Invitation</p></div>
      </header>

      <div className="env-stage rd-stage" role="button" tabIndex={0} aria-label={t.tapToOpen}
        onClick={open} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}>
        <div className="rd-cam">
          <div className="rd-tilt">
            <div className="rd-bob">
              <div className="rd-plane">
                <div className="rd-flower">
                  {Array.from({ length: LEAVES }, (_, i) => <Part key={`l${i}`} kind="leaf" i={i} n={LEAVES} offset={18} d={LEAF} />)}
                  {Array.from({ length: LEAVES }, (_, i) => <Part key={`s${i}`} kind="leaf leaf-s" i={i} n={LEAVES} offset={0} d={LEAF} />)}
                  <i className="rd-glow" />
                  {Array.from({ length: OUTER }, (_, i) => <Part key={`o${i}`} kind="outer" i={i} n={OUTER} d={OUTER_PETAL} />)}
                  {Array.from({ length: INNER }, (_, i) => <Part key={`i${i}`} kind="inner" i={i} n={INNER} offset={60} d={INNER_PETAL} />)}
                  <i className="rd-core" />
                </div>
              </div>
              <i className="rd-motes">{Array.from({ length: MOTES }, (_, i) => <b key={i} className="rd-mote" />)}</i>
              <div className="rd-heart"><div className="rd-heart-in"><NameLogo /></div></div>
            </div>
          </div>
        </div>
      </div>

      {guestName ? (
        <p className="rd-to"><span>{text.km.to}</span><span className="env-to-name foil" lang="km">{guestName}</span></p>
      ) : null}
      <p className="env-hint" lang={lang}>{t.tapToOpen}</p>
      <div className="rd-dusk" />
    </div>
  );
}
