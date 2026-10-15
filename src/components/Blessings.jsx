// Blessing wall on the lotus pond: guests write a short blessing; it floats as a lantern note.
// Notes are HTML (Khmer is never drawn in canvas/SVG text). Shown a few at a time, cycling.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../lib/lang';
import { api } from '../lib/api';
import { guestName } from '../lib/guest';

const SLOTS = [[28, 58], [70, 67], [34, 77], [68, 50]]; // x%, y% of each note's centre on the water (kept clear of the edges)

export default function Blessings({ onLantern }) {
  const { lang, t } = useLang();
  const [items, setItems] = useState([]);
  const [shown, setShown] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: guestName, message: '' });
  const [state, setState] = useState('idle'); // idle | sending | sent | off | error
  const cursor = useRef(0);
  const root = useRef(null);

  // load when the pond comes into view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      api.blessings().then((r) => setItems(r.items || [])).catch((err) => err.status === 503 && setState('off'));
    }, { rootMargin: '200px' });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  // cycle notes through the slots
  useEffect(() => {
    if (!items.length) return;
    const tick = () => {
      setShown(SLOTS.slice(0, Math.min(SLOTS.length, items.length)).map((slot, i) => ({ ...items[(cursor.current + i) % items.length], slot, key: `${cursor.current}-${i}` })));
      cursor.current = (cursor.current + 1) % items.length;
    };
    tick();
    const id = setInterval(tick, 7000);
    return () => clearInterval(id);
  }, [items]);

  const send = async (e) => {
    e.preventDefault();
    setState('sending');
    try {
      const r = await api.bless(form);
      setItems((list) => [r.item, ...list]);
      cursor.current = 0;
      setState('sent');
      setOpen(false);
      setForm((f) => ({ ...f, message: '' }));
      onLantern?.();
    } catch (err) {
      setState(err.status === 503 ? 'off' : 'error');
    }
  };

  return (
    <div className="blessings" ref={root} lang={lang}>
      <div className="bless-notes" aria-live="polite">
        {shown.map((b) => (
          <figure className="bless-note" key={b.key} style={{ left: `${b.slot[0]}%`, top: `${b.slot[1]}%` }}>
            <blockquote>{b.message}</blockquote>
            <figcaption>— {b.name}</figcaption>
          </figure>
        ))}
      </div>
      {state !== 'off' && (
        <button className="btn btn-gold bless-open" onClick={(e) => { e.stopPropagation(); setOpen(true); }} onPointerUp={(e) => e.stopPropagation()}>
          {state === 'sent' ? `✓ ${t.blessThanks}` : t.blessWrite}
        </button>
      )}
      {open && createPortal(
        <div className="bless-sheet" role="dialog" aria-modal="true" aria-label={t.blessWrite} onPointerUp={(e) => e.stopPropagation()} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form className="bless-form paper-card" onSubmit={send}>
            <p className="bless-title foil">{t.blessTitle}</p>
            <label className="field">{t.blessName}
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={40} required />
            </label>
            <label className="field">{t.blessMsg}
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={160} rows={3} required minLength={2} />
              <small>{form.message.length}/160</small>
            </label>
            <p className="rsvp-privacy">{t.blessPublic}</p>
            {state === 'error' && <p className="rsvp-err" role="alert">{t.tryAgain}</p>}
            <div className="bless-actions">
              <button type="button" className="btn btn-line" onClick={() => setOpen(false)}>{t.cancel}</button>
              <button className="btn btn-gold" disabled={state === 'sending'}>{state === 'sending' ? '…' : t.blessSend}</button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </div>
  );
}
