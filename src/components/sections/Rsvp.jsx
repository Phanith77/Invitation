import { useState } from 'react';
import { gsap, lite } from '../../lib/env';
import { useLang } from '../../lib/lang';
import { api, store } from '../../lib/api';
import { guestName, guestEvents } from '../../lib/guest';
import { Corner } from '../Decor';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';

const saved = () => { try { return JSON.parse(store.get('rsvp') || 'null'); } catch { return null; } };

// Signature: the reply card lifts like a place card being turned toward the guest.
export default function Rsvp() {
  const { lang, t, n } = useLang();
  const prev = saved();
  const [form, setForm] = useState(() => prev?.answer || { name: guestName, attending: true, people: 1, note: '' });
  const [state, setState] = useState(prev ? 'done' : 'edit'); // edit | sending | done | off | error
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    scrollTl(q('.rsvp-card')[0], 'top 85%').fromTo(q('.rsvp-card'), { rotationX: 35, y: 50, opacity: 0, transformPerspective: 1000, transformOrigin: '50% 100%' },
      { rotationX: 0, y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', clearProps: 'transform,opacity' });
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setState('sending');
    try {
      const r = await api.rsvp({ ...form, id: prev?.id, events: guestEvents.map((e) => e.id) });
      store.set('rsvp', JSON.stringify({ id: r.id, answer: form }));
      setState('done');
    } catch (err) {
      setState(err.status === 503 ? 'off' : 'error');
    }
  };

  return (
    <section className="sec sec-light paper-card rsvp" id="rsvp" ref={ref}>
      <Corner className="sec-corner tl" />
      <Corner flip="x" className="sec-corner tr" />
      <SectionHead k="rsvpTitle" />
      <div className="rsvp-card paper" lang={lang}>
        {state === 'off' ? (
          <p className="rsvp-msg">{t.unavailable}</p>
        ) : state === 'done' ? (
          <div className="rsvp-done">
            <p className="rsvp-big foil">{form.attending ? t.rsvpThanksYes : t.rsvpThanksNo}</p>
            <p className="rsvp-msg">{form.name}{form.attending ? ` · ${n(form.people)} ${t.rsvpPeopleUnit}` : ''}</p>
            <button className="btn btn-line" onClick={() => setState('edit')}>{t.rsvpEdit}</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="rsvp-line">{t.rsvpLine}</p>
            <label className="field">{t.rsvpName}
              <input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={80} required autoComplete="name" />
            </label>
            <div className="choice" role="radiogroup" aria-label={t.rsvpTitle}>
              <button type="button" role="radio" aria-checked={form.attending} className={form.attending ? 'on' : ''} onClick={() => set('attending', true)}>{t.rsvpYes}</button>
              <button type="button" role="radio" aria-checked={!form.attending} className={!form.attending ? 'on' : ''} onClick={() => set('attending', false)}>{t.rsvpNo}</button>
            </div>
            {form.attending && (
              <div className="field">{t.rsvpPeople}
                <div className="stepper">
                  <button type="button" aria-label="−" onClick={() => set('people', Math.max(1, form.people - 1))}>−</button>
                  <output aria-live="polite">{n(form.people)}</output>
                  <button type="button" aria-label="+" onClick={() => set('people', Math.min(10, form.people + 1))}>+</button>
                </div>
              </div>
            )}
            <label className="field">{t.rsvpNote}
              <textarea value={form.note} onChange={(e) => set('note', e.target.value)} maxLength={300} rows={2} />
            </label>
            <button className="btn btn-gold rsvp-send" disabled={state === 'sending'}>{state === 'sending' ? '…' : t.rsvpSend}</button>
            {state === 'error' && <p className="rsvp-err" role="alert">{t.tryAgain}</p>}
            <p className="rsvp-privacy">{t.rsvpPrivacy}</p>
          </form>
        )}
      </div>
    </section>
  );
}
