// Use the event's Pittsburgh wall time, not the viewer's computer time zone.
export function shiftTimes(time) {
  const [start, end] = time.split(/[–-]/).map(part => part.trim());
  const parse = value => {
    const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) throw new Error('The event time is unavailable.');
    return ((Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(match[2]);
  };
  const startMinutes = parse(/AM|PM/i.test(start) ? start : `${start} ${end.match(/AM|PM/i)?.[0] || ''}`);
  const endMinutes = parse(end);
  const clock = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}${String(minutes % 60).padStart(2, '0')}00`;
  return { start: clock(startMinutes), end: clock(endMinutes), overnight: endMinutes <= startMinutes };
}

export function eventCalendarText(event) {
  const times = shiftTimes(event.time);
  const end = new Date(`${event.date}T12:00:00Z`);
  if (times.overnight) end.setUTCDate(end.getUTCDate() + 1);
  const escape = text => String(text).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dress for Success//Volunteer Events//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE', 'TZID:America/New_York',
    'BEGIN:DAYLIGHT', 'DTSTART:20070311T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'DTSTART:20071104T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'END:STANDARD', 'END:VTIMEZONE',
    'BEGIN:VEVENT', `UID:dfs-volunteer-${event.id}-${event.date}@prototype.dressforsuccess`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;TZID=America/New_York:${event.date.replace(/-/g, '')}T${times.start}`,
    `DTEND;TZID=America/New_York:${end.toISOString().slice(0, 10).replace(/-/g, '')}T${times.end}`,
    `SUMMARY:${escape(event.title)}`, `LOCATION:${escape(event.addr)}`, `DESCRIPTION:${escape(event.desc)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  // Fold at 75 UTF-8 octets for calendar clients, without splitting characters.
  const encoder = new TextEncoder();
  return lines.map(line => {
    let folded = '', bytes = 0;
    for (const character of line) {
      const size = encoder.encode(character).length;
      if (bytes + size > 75) { folded += '\r\n '; bytes = 1; }
      folded += character; bytes += size;
    }
    return folded;
  }).join('\r\n') + '\r\n';
}

export function downloadEventCalendar(event) {
  const url = URL.createObjectURL(new Blob([eventCalendarText(event)], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `dfs-${event.id}-${event.date}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
