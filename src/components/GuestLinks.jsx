// Private helper page (/?guests): paste the guest list, get one personal link per guest.
// Runs entirely in the browser; nothing is uploaded or stored.
import { useMemo, useState } from 'react';
import { wedding } from '../data/wedding';
import { guestLink } from '../lib/guest';

const defaultBase = () => (wedding.siteUrl && !wedding.siteUrl.includes('example') ? wedding.siteUrl : location.origin);

export default function GuestLinks() {
  const [list, setList] = useState('លោក សុខា\nលោកស្រី ចន្ទា\nកញ្ញា ស្រីពៅ\nMr. David Lee');
  const [base, setBase] = useState(defaultBase);
  const [copied, setCopied] = useState(-1);
  const [events, setEvents] = useState(() => wedding.events.map((e) => e.id));
  const toggle = (id) => setEvents((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const names = useMemo(() => [...new Set(list.split('\n').map((s) => s.trim()).filter(Boolean))], [list]);
  const rows = names.map((name) => ({ name, url: guestLink(base, name, events) }));
  const message = (r) => `សូមគោរពអញ្ជើញ ${r.name}\n${wedding.groom.km} & ${wedding.bride.km}\n${r.url}`;

  const copy = async (text, i) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked: the link is still selectable */ }
    setCopied(i);
    setTimeout(() => setCopied(-1), 1600);
  };
  const csv = () => {
    const body = 'name,link\n' + rows.map((r) => `"${r.name.replace(/"/g, '""')}",${r.url}`).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv' })), download: 'guest-links.csv' });
    a.click();
  };

  return (
    <main className="tool" lang="km">
      <h1 className="km-moul foil">តំណភ្ជាប់សម្រាប់ភ្ញៀវ</h1>
      <p className="tool-sub">Personal guest links · {wedding.groom.en} &amp; {wedding.bride.en}</p>
      <p className="tool-note">សរសេរឈ្មោះភ្ញៀវម្នាក់ក្នុងមួយបន្ទាត់។ ឈ្មោះនឹងបង្ហាញលើស្រោមធៀប។ គ្មានទិន្នន័យត្រូវបានរក្សាទុកទេ។<br />One name per line. The name appears on the envelope; nothing is stored.</p>
      <label className="tool-label">ឈ្មោះភ្ញៀវ · Guest names
        <textarea value={list} onChange={(e) => setList(e.target.value)} rows={8} />
      </label>
      <label className="tool-label">អាសយដ្ឋានគេហទំព័រ · Site address
        <input value={base} onChange={(e) => setBase(e.target.value)} />
      </label>
      <fieldset className="tool-events">
        <legend>ពិធីដែលអញ្ជើញ · Invited to</legend>
        {wedding.events.map((e) => (
          <label key={e.id}><input type="checkbox" checked={events.includes(e.id)} onChange={() => toggle(e.id)} /> {e.name.km} · {e.name.en} ({e.time})</label>
        ))}
      </fieldset>
      <div className="tool-actions">
        <button className="btn btn-gold" onClick={() => copy(rows.map((r) => `${r.name}\t${r.url}`).join('\n'), 'all')}>{copied === 'all' ? '✓ បានចម្លង' : 'ចម្លងទាំងអស់ · Copy all'}</button>
        <button className="btn btn-line" onClick={csv}>CSV</button>
      </div>
      <ol className="tool-list">
        {rows.map((r, i) => (
          <li key={r.name}>
            <div><strong>{r.name}</strong><a href={r.url} target="_blank" rel="noopener">{r.url}</a></div>
            <div className="tool-row-actions">
              <button className="btn btn-line" onClick={() => copy(message(r), i)}>{copied === i ? '✓' : 'ចម្លង'}</button>
              <a className="btn btn-line" href={`https://t.me/share/url?url=${encodeURIComponent(r.url)}&text=${encodeURIComponent(`សូមគោរពអញ្ជើញ ${r.name}`)}`} target="_blank" rel="noopener">Telegram</a>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
