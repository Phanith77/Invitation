import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../lib/lang';
import { api, shrinkPhoto, store } from '../../lib/api';
import { guestName } from '../../lib/guest';
import { useGsap, SectionHead, headIn } from '../Shared';

// Shared guest album (on and after the wedding day): guests add photos (resized in the browser
// first), everyone with the link sees them. The couple can delete any photo and download all
// from the dashboard.
export default function GuestPhotos() {
  const { lang, t, n } = useLang();
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ status: 'idle', done: 0, total: 0 }); // idle | busy | sent | off | error
  const [name, setName] = useState(() => store.get('photoName') || guestName);
  const input = useRef(null);

  useEffect(() => {
    api.photos().then((r) => setItems(r.items || [])).catch((e) => e.status === 503 && setState({ status: 'off' }));
  }, []);

  const upload = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, 10);
    if (!list.length) return;
    store.set('photoName', name);
    setState({ status: 'busy', done: 0, total: list.length });
    const added = [];
    try {
      for (const [i, f] of list.entries()) {
        const blob = await shrinkPhoto(f);
        const r = await api.uploadPhoto(blob, name);
        added.push(r.item);
        setState({ status: 'busy', done: i + 1, total: list.length });
        await new Promise((ok) => setTimeout(ok, 2100)); // stay under the anti-spam limit
      }
      setItems((cur) => [...added.reverse(), ...cur]);
      setState({ status: 'sent' });
    } catch (e) {
      if (added.length) setItems((cur) => [...added.reverse(), ...cur]);
      setState({ status: e.status === 503 ? 'off' : 'error' });
    }
  };

  const ref = useGsap((q, el) => headIn(q, el));
  return (
    <section className="sec sec-dark guest-photos" id="photos" ref={ref}>
      <SectionHead k="photosTitle" />
      <p className="tables-line" lang={lang}>{t.photosLine}</p>
      {state.status === 'off' ? (
        <p className="tables-none" lang={lang}>{t.unavailable}</p>
      ) : (
        <div className="photos-add" lang={lang}>
          <input className="photos-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.rsvpName} aria-label={t.rsvpName} maxLength={40} />
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <button className="btn btn-gold" onClick={() => input.current.click()} disabled={state.status === 'busy'}>
            {state.status === 'busy' ? `${t.photosUploading} ${n(state.done)}/${n(state.total)}` : t.photosAdd}
          </button>
          {state.status === 'sent' && <p className="photos-msg">✓ {t.photosDone}</p>}
          {state.status === 'error' && <p className="rsvp-err" role="alert">{t.tryAgain}</p>}
          <p className="rsvp-privacy">{t.photosPublic}</p>
        </div>
      )}
      <div className="photos-grid">
        {items.map((it) => (
          <a key={it.id} href={it.url} target="_blank" rel="noopener" className="photos-tile">
            <img src={it.url} alt="" loading="lazy" />
            {it.name && <span>{it.name}</span>}
          </a>
        ))}
      </div>
    </section>
  );
}
