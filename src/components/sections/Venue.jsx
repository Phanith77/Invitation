import { gsap, lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { text } from '../../i18n';
import { useLang } from '../../lib/lang';
import { downloadICS, googleCalendarUrl } from '../../lib/ics';
import { guestEvents } from '../../lib/guest';
import { Corner, Crest } from '../Decor';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';

/** start of an event: the wedding date with the event's own time (Phnom Penh, UTC+7) */
const eventStart = (time) => `${wedding.dateISO.slice(0, 10)}T${time || '07:00'}:00+07:00`;

function EventCard({ ev }) {
  const { lang, t, p, n } = useLang();
  const { lat, lng } = ev.venue;
  const hasPin = lat != null && lng != null;
  const mapsUrl = hasPin ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null;
  const dirUrl = hasPin ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null;
  const place = `${p(ev.venue.name)}, ${p(ev.venue.address)}`;
  const event = {
    startISO: wedding.dateISO && eventStart(ev.time),
    hours: ev.id === 'reception' ? 4 : 8,
    title: `${p(ev.name)} · ${wedding.groom.en} & ${wedding.bride.en}`,
    location: place,
    description: `${text.km.blessingTitle} · ${wedding.groom.km} & ${wedding.bride.km}${mapsUrl ? `\n${mapsUrl}` : ''}`,
    url: mapsUrl,
  };
  const gcal = googleCalendarUrl(event);
  const tgLocation = mapsUrl ? `https://t.me/share/url?url=${encodeURIComponent(mapsUrl)}&text=${encodeURIComponent(place)}` : null;
  return (
    <div className="venue-card" lang={lang} data-event={ev.id}>
      <Crest className="venue-crest" />
      <p className="venue-event">{p(ev.name)} · {n(ev.time)}</p>
      <div className="mask"><h3 className="venue-name foil km-moul">{p(ev.venue.name)}</h3></div>
      <p className="venue-addr">{p(ev.venue.address)}</p>
      <div className="venue-map">
        {hasPin ? (
          <iframe title={`map ${ev.id}`} src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        ) : (
          <div className="venue-map-pending">{t.mapPending}</div>
        )}
      </div>
      <div className="venue-actions">
        <a className={`btn btn-gold ${hasPin ? '' : 'is-disabled'}`} href={mapsUrl || undefined} target="_blank" rel="noopener" aria-disabled={!hasPin}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22S5 14.5 5 9.5A7 7 0 0 1 19 9.5C19 14.5 12 22 12 22ZM12 12A2.5 2.5 0 1 0 12 7A2.5 2.5 0 1 0 12 12Z" /></svg>
          {t.openMaps}
        </a>
        <a className={`btn btn-line ${dirUrl ? '' : 'is-disabled'}`} href={dirUrl || undefined} target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3L21 12L12 21L3 12ZM9 13V11H14M12.5 9L14.5 11L12.5 13" /></svg>
          {t.directions}
        </a>
        <a className={`btn btn-line ${tgLocation ? '' : 'is-disabled'}`} href={tgLocation || undefined} target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4L3 11L10 13.5M21 4L17.5 20L10 13.5M21 4L10 13.5V19L13 16" /></svg>
          {t.sendLocation}
        </a>
      </div>
      <div className="venue-actions venue-cal">
        <button className="btn btn-line" onClick={() => downloadICS(event)} disabled={!wedding.dateISO}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6H19V20H5ZM5 10H19M9 3V7M15 3V7M12 13V17M10 15H14" /></svg>
          {t.saveCalendar}
        </button>
        <a className={`btn btn-line ${gcal ? '' : 'is-disabled'}`} href={gcal || undefined} target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6H19V20H5ZM5 10H19M9 3V7M15 3V7" /><path d="M9 15H15M12 12V18" /></svg>
          {t.googleCal}
        </a>
      </div>
      {ev.parking && (
        <div className="parking" lang={lang}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M9.5 17V7H13A3 3 0 0 1 13 13H9.5" /></svg>
          <div>
            <p className="parking-title">{t.parkingTitle}</p>
            <p className="parking-note">{p(ev.parking.note)}</p>
            {ev.parking.lat != null && (
              <a className="parking-link" href={`https://www.google.com/maps/search/?api=1&query=${ev.parking.lat},${ev.parking.lng}`} target="_blank" rel="noopener">{t.openParking} →</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Signature: each map unfolds downward from its crest like a card opened on a table.
// One card per part of the day the guest is invited to.
export default function Venue() {
  const { lang, t } = useLang();
  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    q('.venue-card').forEach((card) => {
      const c = gsap.utils.selector(card);
      scrollTl(card, 'top 80%')
        .from(c('.venue-crest .petal'), { scale: 0, duration: 0.9, stagger: { each: 0.05, from: 'center' }, ease: 'back.out(2)' }, 0)
        .from(c('.venue-name'), { yPercent: 110, duration: 1.1, ease: 'expo.out' }, 0.2)
        .from(c('.venue-addr, .venue-event'), { opacity: 0, duration: 1 }, 0.4)
        .from(c('.venue-map'), { scaleY: 0, transformOrigin: '50% 0%', duration: 1.4, ease: 'expo.inOut' }, 0.5)
        // fromTo with explicit end values: .btn has CSS transitions, so a value read on refresh could be mid-transition
        .fromTo(c('.venue-actions .btn'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, clearProps: 'all' }, 1.2);
    });
  });
  return (
    <section className="sec sec-light paper-card venue" id="venue" ref={ref}>
      <Corner className="sec-corner tl" />
      <Corner flip="x" className="sec-corner tr" />
      <SectionHead k="venueTitle" crest={false} />
      <div className="venue-list">
        {guestEvents.map((ev) => <EventCard ev={ev} key={ev.id} />)}
      </div>
      <p className="venue-reminder" lang={lang}>{t.reminderNote}</p>
    </section>
  );
}
