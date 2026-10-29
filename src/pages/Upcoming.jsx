import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { todayISO, formatFull, formatTime, expandOccurrences, addDays } from '../utils/dateUtils';
import { Empty } from '../components/ui';

export default function Upcoming() {
  const { events, tasks, appointments } = useApp();
  const [days, setDays] = useState(14);
  const t = todayISO();
  const end = toISODate(addDays(new Date(), days));

  const all = useMemo(() => {
    const ev = expandOccurrences(events.filter(e => e.status !== 'Cancelled'), t, end).map(e => ({ ...e, _kind: 'Event' }));
    const ap = appointments.filter(a => a.date >= t && a.date <= end && a.status !== 'Cancelled').map(a => ({ ...a, _kind: 'Appt' }));
    const tk = tasks.filter(x => x.dueDate >= t && x.dueDate <= end && x.status !== 'Completed').map(x => ({ ...x, _kind: 'Task', date: x.dueDate }));
    return [...ev, ...ap, ...tk].sort((a, b) => (a.date + (a.startTime || '23:59')).localeCompare(b.date + (b.startTime || '23:59')));
  }, [events, tasks, appointments, t, end]);

  // group by date
  const groups = useMemo(() => {
    const m = new Map();
    for (const it of all) {
      if (!m.has(it.date)) m.set(it.date, []);
      m.get(it.date).push(it);
    }
    return [...m.entries()];
  }, [all]);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Upcoming</h1>
          <p className="muted">Next {days} days of planned activities.</p>
        </div>
        <select className="input sm" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Next 7 days</option>
          <option value={14}>Next 14 days</option>
          <option value={30}>Next 30 days</option>
          <option value={90}>Next 3 months</option>
        </select>
      </div>

      <div className="upcoming-list">
        {groups.length === 0 ? (
          <Empty title="Nothing upcoming" icon="⌛" hint="Your schedule is clear for the selected period." />
        ) : (
          groups.map(([date, items]) => (
            <section key={date} className="up-group">
              <h3 className="up-date">{formatFull(date)} {date === t && <span className="pill">Today</span>}</h3>
              <div className="up-items">
                {items.map(it => (
                  <div key={it.id + it._kind + (it.occurrenceDate || '')} className={`up-row ${it._kind.toLowerCase()}`}>
                    <div className="up-time">{formatTime(it.startTime) || 'All day'}</div>
                    <div className="up-main">
                      <div className="up-title">{it.title}</div>
                      {it.description && <div className="muted small">{it.description}</div>}
                    </div>
                    <div className="row gap">
                      <span className="pill">{it._kind}</span>
                      {it.priority && <span className={`pill pri-${it.priority}`}>{it.priority}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}


