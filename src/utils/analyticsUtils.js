import { toISODate, todayISO, parseISODate, addDays } from './dateUtils';

export function completionRate(tasks) {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === 'Completed').length;
  return Math.round((done / tasks.length) * 100);
}

export function countBy(tasks, key) {
  const m = {};
  for (const t of tasks) {
    const k = t[key] || 'Unspecified';
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

export function last7Days() {
  const t = todayISO();
  const base = parseISODate(t);
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(base, i - 6)));
}

export function last30Days() {
  const t = todayISO();
  const base = parseISODate(t);
  return Array.from({ length: 30 }, (_, i) => toISODate(addDays(base, i - 29)));
}

export function completionsPerDay(tasks, days) {
  const map = {};
  for (const d of days) map[d] = 0;
  for (const t of tasks) {
    const key = t.completedAt ? t.completedAt.slice(0, 10) : null;
    if (key && key in map) map[key]++;
  }
  return days.map((d) => ({ date: d, count: map[d] }));
}

export function computeStreaks(tasks) {
  const days = new Set(
    tasks.filter((t) => t.status === 'Completed' && t.completedAt).map((t) => t.completedAt.slice(0, 10))
  );
  if (!days.size) return { current: 0, longest: 0 };
  const sorted = [...days].sort();
  // longest
  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISODate(sorted[i - 1]);
    const cur = parseISODate(sorted[i]);
    const diff = Math.round((cur - prev) / 86400000);
    if (diff === 1) { run++; longest = Math.max(longest, run); }
    else if (diff === 0) continue;
    else run = 1;
  }
  // current: consecutive ending today or yesterday
  let current = 0;
  let cursor = parseISODate(todayISO());
  if (!days.has(toISODate(cursor))) {
    cursor = addDays(cursor, -1);
    if (!days.has(toISODate(cursor))) return { current: 0, longest };
  }
  while (days.has(toISODate(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}
