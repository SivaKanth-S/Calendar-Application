import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { todayISO, formatFull, formatTime, occurrencesOnDate } from '../utils/dateUtils';
import { Empty } from '../components/ui';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00–21:00

export default function Today() {
  const { events, tasks, appointments } = useApp();
  const t = todayISO();

  const dayItems = useMemo(() => {
    const ev = occurrencesOnDate(events, t).map(e => ({ ...e, _kind: 'event' }));
    const ap = appointments.filter(a => a.date === t).map(a => ({ ...a, _kind: 'appt' }));
    const tk = tasks.filter(x => x.dueDate === t).map(x => ({ ...x, _kind: 'task' }));
    return [...ev, ...ap, ...tk].sort((a, b) => (a.startTime || '23:59').localeCompare(b.startTime || '23:59'));
  }, [events, tasks, appointments, t]);

  const stats = useMemo(() => {
    const pending = tasks.filter(x => x.dueDate === t && x.status !== 'Completed').length;
    const done = tasks.filter(x => x.dueDate === t && x.status === 'Completed').length;
    return { pending, done };
  }, [tasks, t]);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Today</h1>
          <p className="muted">{formatFull(t)}</p>
        </div>
        <div className="row gap">
          <div className="stat-pill"><strong>{stats.pending}</strong> pending</div>
          <div className="stat-pill"><strong>{stats.done}</strong> completed</div>
        </div>
      </div>

      <div className="today-layout">
        <div className="timeline panel">
          {HOURS.map(h => {
            const items = dayItems.filter(it => (it.startTime || '').slice(0, 2) === String(h).padStart(2, '0'));
            return (
              <div key={h} className="time-row">
                <div className="time-label">{h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}</div>
                <div className="time-content">
                  {items.map(it => (
                    <div key={it.id + it._kind} className={`time-item ${it._kind}`}>
                      <div className="time-item-head">
                        <strong>{it.title}</strong>
                        <span>{formatTime(it.startTime)} {it.endTime ? `– ${formatTime(it.endTime)}` : ''}</span>
                      </div>
                      {it.location && <div className="small muted">📍 {it.location}</div>}
                    </div>
                  ))}
                  {items.length === 0 && <div className="time-spacer" />}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="today-aside">
          <section className="panel">
            <h3>Quick Summary</h3>
            {dayItems.length === 0 ? (
              <Empty title="Quiet day" icon="🍃" hint="No events or tasks for today." />
            ) : (
              <ul className="dot-list">
                {dayItems.map(it => (
                  <li key={it.id + it._kind}>
                    <span className={`dot ${it._kind}`} />
                    <div className="flex-1">
                      <div>{it.title}</div>
                      <div className="small muted">{formatTime(it.startTime)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
