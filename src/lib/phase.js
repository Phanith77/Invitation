// Before / on / after the wedding day, in Phnom Penh time (UTC+7).
// For testing, ?now=2026-12-12T09:45+07:00 pretends it is that moment.
const override = new URLSearchParams(location.search).get('now');
export const now = () => (override ? new Date(override) : new Date());

const TZ = 7 * 3600e3;
const ymd = (d) => new Date(d.getTime() + TZ).toISOString().slice(0, 10);
const minutesOfDay = (d) => { const l = new Date(d.getTime() + TZ); return l.getUTCHours() * 60 + l.getUTCMinutes(); };

/** 'before' | 'today' | 'after' */
export function weddingPhase(dateISO) {
  if (!dateISO) return 'before';
  const n = now(), d = new Date(dateISO);
  if (ymd(n) === ymd(d)) return 'today';
  return n < d ? 'before' : 'after';
}

/** is today one of the programme's days? (the opening day counts too) */
export const isProgrammeDay = (days = []) => days.some((d) => d.iso === ymd(now()));

/** index of the ritual happening now (last one that has started), -1 before the first */
export function currentRitual(programme) {
  const n = now(), m = minutesOfDay(n);
  let idx = -1;
  programme.forEach((it, i) => {
    if (it.at) { if (new Date(it.at) <= n) idx = i; return; }
    const [h, min] = String(it.time).split(':').map(Number);
    if (!Number.isNaN(h) && h * 60 + (min || 0) <= m) idx = i;
  });
  return idx;
}

export const daysSince = (dateISO) => Math.max(0, Math.floor((now() - new Date(dateISO)) / 864e5));
