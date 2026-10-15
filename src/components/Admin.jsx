// Couple-only dashboard at /?admin: visit counts, RSVP list + totals, blessings (with delete),
// seating list for the table finder, guest photos (delete / download all), printable PDFs.
// The key is the ADMIN_KEY environment variable on Vercel ("dev" when running locally).
import { useEffect, useState } from 'react';
import { zipSync } from 'fflate';
import { api } from '../lib/api';
import { wedding } from '../data/wedding';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function Admin() {
  const [key, setKey] = useState(() => { try { return sessionStorage.getItem('adminKey') || ''; } catch { return ''; } });
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [seating, setSeating] = useState('');
  const [seatMsg, setSeatMsg] = useState('');
  const [photos, setPhotos] = useState([]);
  const [zipping, setZipping] = useState(false);

  const load = async (k = key) => {
    setErr('');
    try {
      const d = await api.admin(k);
      setData(d);
      api.allTables(k).then((r) => setSeating((r.rows || []).map((x) => `${x.name}, ${x.table}`).join('\n'))).catch(() => {});
      api.photos().then((r) => setPhotos(r.items || [])).catch(() => {});
      try { sessionStorage.setItem('adminKey', k); } catch { /* ignore */ }
    } catch (e) {
      setData(null);
      setErr(e.status === 401 ? 'លេខសម្ងាត់មិនត្រឹមត្រូវ · Wrong key' : e.status === 503 ? 'Storage is not configured yet (see README)' : 'Could not load');
    }
  };
  useEffect(() => { if (key) load(key); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id) => {
    if (!confirm('លុបពរជ័យនេះ? · Delete this blessing?')) return;
    await api.removeBlessing(key, id);
    load();
  };
  // seating list: one guest per line, "name, table" (a CSV export from Excel also works)
  const saveSeating = async () => {
    const rows = seating.split('\n').map((l) => l.split(/[,	;]/)).filter((c) => c.length >= 2)
      .map((c) => ({ name: c.slice(0, -1).join(' ').trim(), table: c[c.length - 1].trim() })).filter((r) => r.name && r.table);
    try { const r = await api.saveTables(key, rows); setSeatMsg(`✓ ${r.count} នាក់ · guests saved`); } catch { setSeatMsg('មិនអាចរក្សាទុក · Could not save'); }
  };
  const removePhoto = async (id) => {
    if (!confirm('លុបរូបនេះ? · Delete this photo?')) return;
    await api.removePhoto(key, id);
    setPhotos((list) => list.filter((p) => p.id !== id));
  };
  const downloadPhotos = async () => {
    setZipping(true);
    const files = {};
    for (const [i, p] of photos.entries()) {
      const buf = new Uint8Array(await (await fetch(p.url)).arrayBuffer());
      files[`${String(i + 1).padStart(3, '0')}-${(p.name || 'guest').replace(/[^\p{L}\p{N}]+/gu, '-')}.jpg`] = [buf, { level: 0 }];
    }
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([zipSync(files)], { type: 'application/zip' })), download: 'wedding-photos.zip' });
    a.click();
    setZipping(false);
  };
  const downloadCsv = () => {
    const rows = [['name', 'attending', 'people', 'invited to', 'note', 'time'], ...data.rsvp.map((r) => [r.name, r.attending ? 'yes' : 'no', r.people, (r.events || []).join(' + '), r.note, new Date(r.t).toISOString()])];
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' })), download: 'rsvp.csv' });
    a.click();
  };

  const yes = data?.rsvp.filter((r) => r.attending) || [];
  return (
    <main className="tool" lang="km">
      <h1 className="km-moul foil">ផ្ទាំងគ្រប់គ្រង</h1>
      <p className="tool-sub">Dashboard · {wedding.groom.en} &amp; {wedding.bride.en}</p>
      <form className="tool-actions" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input type="password" placeholder="Admin key" value={key} onChange={(e) => setKey(e.target.value)} style={{ maxWidth: 260 }} />
        <button className="btn btn-gold">បើក · Open</button>
      </form>
      {err && <p className="rsvp-err" role="alert">{err}</p>}
      {data && (
        <>
          <div className="tool-stats">
            <div className="tool-stat"><b>{data.visits.total}</b>ចំនួនបើកមើល · Visits</div>
            <div className="tool-stat"><b>{yes.length}</b>នឹងចូលរួម · Attending replies</div>
            <div className="tool-stat"><b>{yes.reduce((s, r) => s + (r.people || 0), 0)}</b>ចំនួនមនុស្ស · People</div>
            <div className="tool-stat"><b>{data.rsvp.length - yes.length}</b>មិនអាចចូលរួម · Can't attend</div>
            <div className="tool-stat"><b>{data.blessings.length}</b>ពរជ័យ · Blessings</div>
          </div>
          <h2>ចំនួនបើកមើលប្រចាំថ្ងៃ · Visits per day</h2>
          <div className="tool-bars">
            {[...data.visits.days].reverse().map((d) => (
              <div key={d.day} title={`${d.day}: ${d.count}`}><i style={{ height: `${Math.min(100, d.count * 6)}%` }} /><span>{d.day.slice(8)}</span></div>
            ))}
          </div>
          <h2>ការឆ្លើយតប · RSVP <button className="btn btn-line" style={{ minHeight: 34, marginLeft: 10 }} onClick={downloadCsv}>CSV</button></h2>
          <table>
            <thead><tr><th>ឈ្មោះ</th><th>ចូលរួម</th><th>នាក់</th><th>ពិធី</th><th>សារ</th></tr></thead>
            <tbody>{data.rsvp.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.attending ? '✓' : '✗'}</td><td>{r.people}</td><td>{(r.events || []).join(' + ')}</td><td>{r.note}</td></tr>)}</tbody>
          </table>
          <h2>ពរជ័យ · Blessings</h2>
          <ul className="tool-list">
            {data.blessings.map((b) => (
              <li key={b.id}><div><strong>{b.name}</strong><span>{b.message}</span></div><button className="btn btn-line" onClick={() => remove(b.id)}>លុប · Delete</button></li>
            ))}
          </ul>

          <h2>ចំណាត់តុ · Seating list</h2>
          <p className="tool-note">ភ្ញៀវម្នាក់ក្នុងមួយបន្ទាត់៖ ឈ្មោះ, លេខតុ · One guest per line: name, table (paste from Excel works too). Guests find their table on the wedding day.</p>
          <textarea className="tool-seat" rows={8} value={seating} onChange={(e) => setSeating(e.target.value)} placeholder={'លោក សុខា, 5\nកញ្ញា ស្រីពៅ, 12'} />
          <div className="tool-actions"><button className="btn btn-gold" onClick={saveSeating}>រក្សាទុក · Save</button>{seatMsg && <span className="tool-note">{seatMsg}</span>}</div>

          <h2>រូបថតភ្ញៀវ · Guest photos ({photos.length})
            {photos.length > 0 && <button className="btn btn-line" style={{ minHeight: 34, marginLeft: 10 }} onClick={downloadPhotos} disabled={zipping}>{zipping ? '…' : 'ទាញយកទាំងអស់ · Download all (.zip)'}</button>}
          </h2>
          <div className="tool-photos">
            {photos.map((p) => (
              <figure key={p.id}><img src={p.url} alt="" loading="lazy" /><figcaption>{p.name}</figcaption><button className="btn btn-line" onClick={() => removePhoto(p.id)}>លុប</button></figure>
            ))}
          </div>

          <h2>ឯកសារបោះពុម្ព · Printables</h2>
          <ul className="tool-list">
            <li><div><strong>ផ្ទាំងរូបភាព QR នៅកន្លែងកម្មវិធី · Venue QR poster (A4)</strong></div><a className="btn btn-line" href="/print/poster-a4.pdf" download>PDF</a></li>
            <li><div><strong>កាតលេខតុ · Table cards (A6)</strong></div><a className="btn btn-line" href="/print/table-cards-a6.pdf" download>PDF</a></li>
            <li><div><strong>ធៀបក្រដាសសម្រាប់ចាស់ទុំ · Paper invitation for elders (A5)</strong></div><a className="btn btn-line" href="/print/invitation-a5.pdf" download>PDF</a></li>
          </ul>
        </>
      )}
    </main>
  );
}
