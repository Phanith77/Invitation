import { useEffect, useState } from 'react';
import { useLang } from '../lib/lang';
import NameLogo from './NameLogo';
import { LANGS } from '../i18n';

export default function TopBar({ visible, playing, onToggleMusic }) {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`topbar ${visible ? 'is-visible' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="tb-logo" href="#cover" aria-label="top"><NameLogo /></a>
      <div className="tb-actions">
        <div className="tb-langs" role="group" aria-label="Language">
          {LANGS.map(([code, label]) => (
            <button key={code} className={`tb-lang ${lang === code ? 'on' : ''}`} lang={code} aria-pressed={lang === code} onClick={() => setLang(code)}>{label}</button>
          ))}
        </div>
        <button className={`tb-btn tb-music ${playing ? 'is-playing' : ''}`} onClick={onToggleMusic} aria-label={playing ? t.musicOff : t.musicOn} aria-pressed={playing}>
          <span /><span /><span /><span />
        </button>
      </div>
    </header>
  );
}
