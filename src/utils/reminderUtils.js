import { parseISODate } from './dateUtils';

export function reminderOffsetMinutes(reminder) {
  switch (reminder) {
    case 'at': return 0;
    case '5m': return 5;
    case '10m': return 10;
    case '15m': return 15;
    case '30m': return 30;
    case '1h': return 60;
    case '1d': return 24 * 60;
    default: return null;
  }
}

export function reminderFireTime(dateISO, timeStr, reminder) {
  const off = reminderOffsetMinutes(reminder);
  if (off === null || !dateISO) return null;
  const d = parseISODate(dateISO);
  if (!d) return null;
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return new Date(d.getTime() - off * 60000);
}

export function reminderLabel(v) {
  const map = { none: 'No reminder', at: 'At event time', '5m': '5 min before', '10m': '10 min before', '15m': '15 min before', '30m': '30 min before', '1h': '1 hour before', '1d': '1 day before' };
  return map[v] || v || '—';
}
