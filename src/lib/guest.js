// Personal guest links: ?to=<name> puts the guest's name on the envelope and the cover;
// ?e=rituals,reception limits which parts of the day this guest is invited to (default: all).
// Nothing is stored; everything lives only in the link.
import { wedding } from '../data/wedding';

const q = new URLSearchParams(location.search);
export const guestName = (q.get('to') || '').replace(/[<>{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);

const wanted = (q.get('e') || '').split(',').map((s) => s.trim()).filter(Boolean);
/** the events this guest is invited to */
export const guestEvents = wedding.events.filter((e) => !wanted.length || wanted.includes(e.id));
const ids = new Set(guestEvents.map((e) => e.id));
/** the programme rows for those events */
export const guestProgramme = wedding.programme.filter((it) => !it.event || ids.has(it.event));
/** the guest's main venue (the reception if invited, otherwise their first event) */
export const guestVenue = (guestEvents.find((e) => e.id === 'reception') || guestEvents[0] || wedding.events[0]).venue;

export const guestLink = (base, name, events = []) => {
  const u = `${base.replace(/\/?$/, '/')}?to=${encodeURIComponent(name.trim())}`;
  return events.length && events.length < wedding.events.length ? `${u}&e=${events.join(',')}` : u;
};
