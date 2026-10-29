export function pad(n) {
  return String(n).padStart(2, '0');
}

export function toISODate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function parseISODate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function addYears(date, n) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + n);
  return d;
}

export function formatDate(iso, opts = {}) {
  const d = parseISODate(iso);
  if (!d) return iso || '';
  return d.toLocaleDateString(undefined, { weekday: opts.weekday ? 'long' : undefined, month: 'short', day: 'numeric', year: opts.year ? 'numeric' : undefined });
}

export function formatFull(iso) {
  const d = parseISODate(iso);
  if (!d) return iso || '';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function isTodayISO(iso) {
  return iso === todayISO();
}

export function isOverdue(dueISO, status) {
  if (!dueISO) return false;
  if (status === 'Completed' || status === 'Cancelled') return false;
  return dueISO < todayISO();
}

export function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m || 0)} ${ampm}`;
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

export function findConflicts({ items, date, startTime, endTime, excludeId }) {
  if (!date || !startTime || !endTime) return [];
  return (items || []).filter(
    (e) =>
      e.id !== excludeId &&
      e.date === date &&
      e.status !== 'Cancelled' &&
      e.startTime &&
      e.endTime &&
      overlaps(startTime, endTime, e.startTime, e.endTime)
  );
}

/** Month grid: returns array of weeks, each week array of { iso, inMonth } */
export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 Sun
  const start = addDays(first, -startDay);
  const weeks = [];
  let cur = start;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push({ iso: toISODate(cur), inMonth: cur.getMonth() === month });
      cur = addDays(cur, 1);
    }
    weeks.push(week);
    // stop early if we've passed the month and completed a full week outside
    if (cur.getMonth() !== month && cur > new Date(year, month + 1, 0)) break;
  }
  return weeks;
}

export function getWeekDays(anchorISO) {
  const anchor = parseISODate(anchorISO) || new Date();
  const sunday = addDays(anchor, -anchor.getDay());
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(sunday, i)));
}

/**
 * Expand recurring events into occurrences within [rangeStartISO, rangeEndISO].
 * Supports repeat: none|daily|weekdays|weekly|biweekly|monthly|yearly|custom
 * custom uses repeatInterval + repeatUnit (days|weeks|months)
 */
export function expandOccurrences(items, rangeStartISO, rangeEndISO) {
  const out = [];
  const rs = parseISODate(rangeStartISO);
  const re = parseISODate(rangeEndISO);
  if (!rs || !re) return out;
  for (const ev of items || []) {
    if (!ev.date) continue;
    const base = parseISODate(ev.date);
    if (!base) continue;
    const repeat = ev.repeat || 'none';
    if (repeat === 'none') {
      if (ev.date >= rangeStartISO && ev.date <= rangeEndISO) out.push({ ...ev, occurrenceDate: ev.date, isRecurrence: false });
      continue;
    }
    // iterate day by day (bounded: max 400 days to keep perf sane)
    // if base is after range end, skip
    if (base > re) continue;
    // For weekly/biweekly/monthly/yearly anchored on original weekday/day, step from base
    // Simpler robust approach: walk from base forward until re, checking membership.
    let cursor = new Date(base);
    // fast-forward for daily-ish repeats
    if (cursor < rs) {
      const diffDays = Math.floor((rs - cursor) / 86400000);
      if (repeat === 'daily' || repeat === 'weekdays') cursor = addDays(cursor, Math.max(0, diffDays - 1));
      else if (repeat === 'weekly') cursor = addDays(cursor, Math.floor(diffDays / 7) * 7);
      else if (repeat === 'biweekly') cursor = addDays(cursor, Math.floor(diffDays / 14) * 14);
    }
    let guard = 0;
    while (cursor <= re && guard < 1500) {
      guard++;
      const iso = toISODate(cursor);
      if (iso >= rangeStartISO && iso >= ev.date) {
        let match = false;
        const day = cursor.getDay();
        if (repeat === 'daily') match = true;
        else if (repeat === 'weekdays') match = day >= 1 && day <= 5;
        else if (repeat === 'weekly') match = Math.round((cursor - base) / 86400000) % 7 === 0;
        else if (repeat === 'biweekly') match = Math.round((cursor - base) / 86400000) % 14 === 0;
        else if (repeat === 'monthly') match = cursor.getDate() === base.getDate();
        else if (repeat === 'yearly') match = cursor.getMonth() === base.getMonth() && cursor.getDate() === base.getDate();
        else if (repeat === 'custom') {
          const n = Number(ev.repeatInterval || 1);
          const unit = ev.repeatUnit || 'days';
          const diff = Math.floor((cursor - base) / 86400000);
          if (unit === 'days') match = diff % n === 0;
          else if (unit === 'weeks') match = diff % (n * 7) === 0;
          else if (unit === 'months') {
            const mDiff = (cursor.getFullYear() - base.getFullYear()) * 12 + (cursor.getMonth() - base.getMonth());
            match = mDiff % n === 0 && cursor.getDate() === base.getDate();
          }
        }
        if (match) out.push({ ...ev, date: iso, occurrenceDate: iso, isRecurrence: iso !== ev.date });
      }
      // step
      if (repeat === 'monthly' || (repeat === 'custom' && ev.repeatUnit === 'months')) {
        cursor = addMonths(cursor, 1);
        // for monthly anchored on day: if month lacks that day, addMonths overflows — normalize by skipping
        if (repeat === 'monthly' && cursor.getDate() !== base.getDate()) {
          // jump to next month same attempt; the check above will fail, keep stepping monthly
        }
      } else if (repeat === 'yearly') {
        cursor = addYears(cursor, 1);
      } else {
        cursor = addDays(cursor, 1);
      }
      // early break for weekly anchored far: still fine
    }
  }
  return out;
}

export function occurrencesOnDate(items, iso) {
  return expandOccurrences(items, iso, iso);
}

export function minutesUntil(dateISO, timeStr) {
  if (!dateISO) return Infinity;
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  const d = parseISODate(dateISO);
  if (!d) return Infinity;
  d.setHours(h || 0, m || 0, 0, 0);
  return Math.round((d - new Date()) / 60000);
}
