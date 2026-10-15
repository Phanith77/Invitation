import { useRef, useState } from 'react';
import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import NameLogo, { logoTimeline } from '../NameLogo';
import AnimatedCouple from '../AnimatedCouple';
import { useGsap, scrollTl } from '../Shared';
import { weddingPhase } from '../../lib/phase';

const CANDLES = [0.8, 1.1, 1.1, 0.8];

function Candle({ h }) {
  return (
    <div className="tk-candle" style={{ '--h': h }}>
      <div className="tk-glow" />
      <svg className="tk-flame" viewBox="0 0 20 34" aria-hidden="true">
        <path d="M10 2C14 10 17 15 17 21A7 7 0 0 1 3 21C3 15 6 10 10 2Z" fill="#ffcf73" />
        <path d="M10 13C12 17 13 19 13 22A3 3 0 0 1 7 22C7 19 8 17 10 13Z" fill="#fff6dc" />
      </svg>
      <i className="tk-wick" />
      <div className="tk-body" />
    </div>
  );
}

const ICONS = {
  telegram: <path d="M21.5 3.5 2.8 10.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.2-15c.3-1.3-.5-1.9-1.5-1.6ZM8.2 13.4l9.9-6.2c.5-.3.9-.1.5.2l-8.1 7.3-.3 3.4-2-4.7Z" />,
  messenger: <path d="M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.2v3.1l3-1.6c1.2.3 2.4.5 3.8.5 5.6 0 10-4.1 10-9.7S17.6 2 12 2Zm1 12.9-2.5-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.5 5.8Z" />,
  facebook: <path d="M14 8.5V6.6c0-.9.6-1.1 1-1.1h2.6V1.6L14 1.5c-4 0-4.9 3-4.9 4.9v2.1H6.8v4h2.3V22.5H14V12.5h3.3l.4-4H14Z" />,
  link: <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
};

export default function Thanks() {
  const { lang, t } = useLang();
  const [copied, setCopied] = useState(false);
  const logo = useRef(null);
  const url = wedding.siteUrl && !wedding.siteUrl.includes('example') ? wedding.siteUrl : location.origin + location.pathname;
  const msg = `${t.blessingTitle} · ${wedding.groom.en} & ${wedding.bride.en}`;
  const enc = encodeURIComponent;
  const isMobile = matchMedia('(pointer: coarse)').matches;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: url });
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  const messenger = (e) => {
    // Messenger has no public web share URL without an app id: use the app on phones, the share sheet or copy elsewhere
    if (isMobile) return;
    e.preventDefault();
    if (navigator.share) navigator.share({ title: msg, url }).catch(() => {});
    else copy();
  };

  // Signature: candles light one by one, then the name logo writes itself as a closing signature.
  const ref = useGsap((q, el) => {
    if (lite) { q('.tk-candle').forEach((c) => c.classList.add('is-lit')); return; }
    const tl = scrollTl(el, 'top 65%', { onReset: () => q('.tk-candle').forEach((c) => c.classList.remove('is-lit')) });
    q('.tk-candle').forEach((c, i) => {
      tl.call(() => c.classList.add('is-lit'), null, 0.3 + i * 0.35)
        .fromTo(c.querySelector('.tk-flame'), { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, 0.3 + i * 0.35);
    });
    tl.from(q('.tk-couple'), { opacity: 0, y: 24, duration: 1.4, ease: 'expo.out' }, 0.9)
      .from(q('.tk-title'), { clipPath: 'inset(-40% 110% -40% -10%)', duration: 1.4, ease: 'power2.inOut', clearProps: 'clipPath' }, 1.6)
      .from(q('.tk-line'), { opacity: 0, y: 12, duration: 1 }, 2.2)
      .add(logoTimeline(logo.current), 2.4)
      // explicit end values: .share-btn has a CSS transform transition (see Venue)
      .fromTo(q('.share-btn'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', clearProps: 'all' }, 3.0);
  });

  const shares = [
    { k: 'telegram', label: t.shareTelegram, href: `https://t.me/share/url?url=${enc(url)}&text=${enc(msg)}` },
    { k: 'messenger', label: t.shareMessenger, href: `fb-messenger://share/?link=${enc(url)}`, onClick: messenger },
    { k: 'facebook', label: t.shareFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
  ];
  return (
    <section className="sec sec-dark thanks" id="thanks" ref={ref}>
      <div className="tk-candles">
        {CANDLES.slice(0, 2).map((h, i) => <Candle h={h} key={i} />)}
        <AnimatedCouple className="tk-couple" />
        {CANDLES.slice(2).map((h, i) => <Candle h={h} key={i + 2} />)}
      </div>
      <h2 className={`tk-title foil ${lang === 'km' ? 'km-moul' : 'en-title'}`} lang={lang}>{t.thanksTitle}</h2>
      <p className="tk-line" lang={lang}>{weddingPhase(wedding.dateISO) === 'after' ? t.thanksAfter : t.thanksLine}</p>
      <NameLogo ref={logo} className="tk-logo" />
      <a className="btn btn-gold tk-download" href="/card.jpg" download={`wedding-${wedding.groom.shortEn}-${wedding.bride.shortEn}.jpg`} lang={lang}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4V15M7 10.5L12 15.5L17 10.5M5 19.5H19" /></svg>
        {t.downloadCard}
      </a>
      <a className="tk-print" href="/print/invitation-a5.pdf" download lang={lang}>{t.printVersion} ↓</a>
      <p className="share-head" lang={lang}>{t.shareLine}</p>
      <div className="share-grid" lang={lang}>
        {shares.map((s) => (
          <a key={s.k} className={`share-btn share-${s.k}`} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener" onClick={s.onClick}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[s.k]}</svg>
            <span>{s.label}</span>
          </a>
        ))}
        <button className="share-btn share-link" onClick={copy}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS.link}</svg>
          <span>{copied ? t.copied : t.copyLink}</span>
        </button>
      </div>
    </section>
  );
}
