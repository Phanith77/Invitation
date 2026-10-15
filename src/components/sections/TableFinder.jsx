import { useEffect, useState } from 'react';
import { useLang } from '../../lib/lang';
import { api } from '../../lib/api';
import { guestName } from '../../lib/guest';
import { useGsap, SectionHead, headIn } from '../Shared';

// Table finder (ចំណាត់តុ), shown on the wedding day: the guest types their name and sees their
// table. The couple uploads the seating list in the dashboard (/?admin).
export default function TableFinder() {
  const { lang, t, n } = useLang();
  const [q, setQ] = useState(guestName);
  const [state, setState] = useState({ status: 'idle', matches: [] }); // idle | busy | done | off

  const search = async (value = q) => {
    if (value.trim().length < 2) return;
    setState({ status: 'busy', matches: [] });
    try {
      const r = await api.findTable(value.trim());
      setState({ status: 'done', matches: r.matches || [] });
    } catch (e) {
      setState({ status: e.status === 503 ? 'off' : 'done', matches: [] });
    }
  };
  useEffect(() => { if (guestName) search(guestName); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ref = useGsap((q2, el) => headIn(q2, el));
  return (
    <section className="sec sec-dark tables" id="tables" ref={ref}>
      <SectionHead k="tablesTitle" />
      <p className="tables-line" lang={lang}>{t.tablesLine}</p>
      <form className="tables-form" onSubmit={(e) => { e.preventDefault(); search(); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.rsvpName} aria-label={t.rsvpName} maxLength={80} />
        <button className="btn btn-gold" disabled={state.status === 'busy'}>{state.status === 'busy' ? '…' : t.tablesSearch}</button>
      </form>
      <div className="tables-result" aria-live="polite" lang={lang}>
        {state.status === 'off' && <p className="tables-none">{t.unavailable}</p>}
        {state.status === 'done' && !state.matches.length && <p className="tables-none">{t.tablesNone}</p>}
        {state.matches.map((m) => (
          <div className="table-card paper-card" key={`${m.name}-${m.table}`}>
            <span className="table-name">{m.name}</span>
            <span className="table-label">{t.tableNo}</span>
            <span className="table-no foil">{n(m.table)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
