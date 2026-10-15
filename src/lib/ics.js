// Builds a .ics calendar file for the main ceremony (no data leaves the device).
const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s = '') => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

export function downloadICS({ startISO, hours = 6, title, location, description, url }) {
  if (!startISO) return false;
  const start = new Date(startISO);
  const end = new Date(start.getTime() + hours * 3600e3);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding-invite//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-wedding@invite`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(description)}`,
    url ? `URL:${url}` : '',
    // reminders: one day before and two hours before
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'END:VALARM',
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  a.download = 'wedding.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  return true;
}

/** Google Calendar "add event" link (opens the Calendar app or web on any device). */
export function googleCalendarUrl({ startISO, hours = 6, title, location, description }) {
  if (!startISO) return null;
  const start = new Date(startISO), end = new Date(start.getTime() + hours * 3600e3);
  const q = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${stamp(start)}/${stamp(end)}`, location, details: description });
  return `https://calendar.google.com/calendar/render?${q}`;
}
