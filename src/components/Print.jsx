// Printable versions, rendered at /?print=poster | tables | a5 and saved as PDFs by scripts/print.mjs:
//   poster  — A4 venue poster: scan to open the invitation, the map and the table finder
//   tables  — A6 table cards, one per table: "តុលេខ N" with a QR to the table finder
//   a5      — A5 paper invitation for elders (Khmer, with English names), matching the digital one
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { wedding } from '../data/wedding';
import { text, pick, khmerNum } from '../i18n';
import { RumdulMark, Divider, Corner } from './Decor';
import NameLogo from './NameLogo';

const site = () => (wedding.siteUrl && !wedding.siteUrl.includes('example') ? wedding.siteUrl : location.origin).replace(/\/$/, '');
const km = (o) => pick(o, 'km');

function QR({ value, className = '' }) {
  const [svg, setSvg] = useState('');
  useEffect(() => { QRCode.toString(value, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#2a2414', light: '#0000' } }).then(setSvg); }, [value]);
  return <div className={`pr-qr ${className}`} dangerouslySetInnerHTML={{ __html: svg }} data-ready={svg ? '1' : '0'} />;
}

const dateLine = () => { const d = wedding.dateParts; return `ថ្ងៃ${d.weekday.km} ទី${d.day.km} ខែ${d.month.km} ឆ្នាំ${d.year.km}`; };
const reception = () => wedding.events.find((e) => e.id === 'reception') || wedding.events[0];
const mapUrl = (v) => `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;

function Poster() {
  const rec = reception();
  return (
    <div className="pr-page pr-a4">
      <Corner className="pr-c tl" /><Corner flip="x" className="pr-c tr" /><Corner flip="y" className="pr-c bl" /><Corner flip="xy" className="pr-c br" />
      <RumdulMark className="pr-mark" />
      <p className="pr-title km-moul foil">{text.km.blessingTitle}</p>
      <NameLogo className="pr-logo" />
      <p className="pr-names script">{wedding.groom.en} &amp; {wedding.bride.en}</p>
      <p className="pr-date km-moul">{dateLine()}</p>
      <p className="pr-lunar">{wedding.lunar.km}</p>
      <Divider className="pr-div" />
      <div className="pr-big-qr"><QR value={site()} /><p>ស្កេនដើម្បីមើលធៀប · Scan to open the invitation</p></div>
      <div className="pr-qr-row">
        <div><QR value={mapUrl(rec.venue)} /><p>ផែនទី · Map</p></div>
        <div><QR value={`${site()}/#tables`} /><p>ស្វែងរកតុ · Find your table</p></div>
      </div>
    </div>
  );
}

function TableCards() {
  const n = Math.max(1, Math.min(60, parseInt(new URLSearchParams(location.search).get('n'), 10) || 12));
  return Array.from({ length: n }, (_, i) => (
    <div className="pr-page pr-a6" key={i}>
      <Corner className="pr-c tl" /><Corner flip="xy" className="pr-c br" />
      <div className="pr-a6-left">
        <RumdulMark className="pr-mark-s" />
        <p className="pr-table-label km-moul">តុលេខ · Table</p>
        <p className="pr-table-no foil km-moul">{khmerNum(i + 1)}</p>
        <p className="pr-names-s script">{wedding.groom.en} &amp; {wedding.bride.en}</p>
      </div>
      <div className="pr-a6-right"><QR value={`${site()}/#tables`} /><p>ស្វែងរកតុរបស់អ្នក<br />Find your table</p></div>
    </div>
  ));
}

function A5() {
  const tk = text.km;
  return (
    <div className="pr-page pr-a5">
      <Corner className="pr-c tl" /><Corner flip="x" className="pr-c tr" /><Corner flip="y" className="pr-c bl" /><Corner flip="xy" className="pr-c br" />
      <RumdulMark className="pr-mark-s" />
      <p className="pr-title km-moul foil">{tk.blessingTitle}</p>
      <div className="pr-words">{tk.inviteWords.map((l, i) => <p key={i} className={i === 3 ? 'km-moul' : ''}>{l}</p>)}</div>
      <div className="pr-couple">
        <div><p className="pr-role">{tk.groom}</p><p className="km-moul pr-person">{wedding.groom.km}</p><p className="pr-en">{wedding.groom.en}</p>
          <p className="pr-parents">{tk.sonOf}<br />{tk.mr} {km(wedding.groomParents.father)}<br />{tk.andMrs} {km(wedding.groomParents.mother)}</p></div>
        <div><p className="pr-role">{tk.bride}</p><p className="km-moul pr-person">{wedding.bride.km}</p><p className="pr-en">{wedding.bride.en}</p>
          <p className="pr-parents">{tk.daughterOf}<br />{tk.mr} {km(wedding.brideParents.father)}<br />{tk.andMrs} {km(wedding.brideParents.mother)}</p></div>
      </div>
      <p className="pr-date km-moul">{dateLine()}</p>
      <p className="pr-lunar">{wedding.lunar.km}</p>
      <div className="pr-events">
        {wedding.events.map((ev) => (
          <div key={ev.id}>
            <p className="km-moul pr-ev">{km(ev.name)} · ម៉ោង {khmerNum(ev.time)}</p>
            <p className="pr-addr">{km(ev.venue.name)} · {km(ev.venue.address)}</p>
          </div>
        ))}
      </div>
      <div className="pr-a5-qr"><QR value={site()} /><p>ស្កេនដើម្បីមើលធៀបឌីជីថល ផែនទី និងកម្មវិធីលម្អិត</p></div>
    </div>
  );
}

export default function Print() {
  const kind = new URLSearchParams(location.search).get('print');
  useEffect(() => { document.documentElement.classList.add('is-print'); }, []);
  return <main className="pr">{kind === 'tables' ? <TableCards /> : kind === 'a5' ? <A5 /> : <Poster />}</main>;
}
