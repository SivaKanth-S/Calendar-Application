import { useMemo, useState } from 'react';
import { getMonthGrid, getWeekDays, expandOccurrences, formatTime, todayISO, toISODate } from '../utils/dateUtils';
import { categoryColor } from '../services/storage';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00–21:00

function Chip({ item, kind, onClick, onDragStart }) {
  const color = kind === 'appt' ? '#0ea5e9' : categoryColor(item.category);
  return (
    <button
      className="chip"
      style={{ borderLeftColor: color }}
      onClick={(e) => { e.stopPropagation(); onClick(item, kind); }}
      draggable
      onDragStart={(e) => onDragStart(e, item, kind)}
      title={`${item.title} ${item.startTime || ''}–${item.endTime || ''}`}
    >
      <span className="chip-time">{formatTime(item.startTime)}</span>
      <span className="chip-title">{item.title}</span>
      {item.isRecurrence && <span className="chip-recur" title="Recurring">↻</span>}
    </button>
  );
}

export default function Calendar({ view, cursor, onCursor, onSelectDate, selectedDate, onEventClick, onDayDoubleClick, onDropItem }) {
  const range = useMemo(() => {
    if (view === 'month') {
      const y = cursor.getFullYear(), m = cursor.getMonth();
      const first = new Date(y, m, 1);
      const start = new Date(first);
      start.setDate(start.getDate() - first.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 41);
      return { start: toISODate(start), end: toISODate(end) };
    }
    if (view === 'week') {
      const days = getWeekDays(toISODate(cursor));
      return { start: days[0], end: days[6] };
    }
    const iso = toISODate(cursor);
    return { start: iso, end: iso };
  }, [view, cursor]);

  return (
    <InnerCalendar
      view={view} cursor={cursor} onCursor={onCursor}
      range={range} selectedDate={selectedDate}
      onSelectDate={onSelectDate} onEventClick={onEventClick}
      onDayDoubleClick={onDayDoubleClick} onDropItem={onDropItem}
    />
  );
}

import { useApp } from '../context/AppContext';

function InnerCalendar({ view, cursor, range, selectedDate, onSelectDate, onEventClick, onDayDoubleClick, onDropItem }) {
  const { events, appointments } = useApp();
  const [dragOver, setDragOver] = useState(null);

  const evOcc = useMemo(() => expandOccurrences(events.filter((e) => e.status !== 'Cancelled'), range.start, range.end), [events, range]);
  const apOcc = useMemo(() => expandOccurrences(appointments.filter((a) => a.status !== 'Cancelled'), range.start, range.end), [appointments, range]);

  const byDate = useMemo(() => {
    const m = {};
    for (const e of evOcc) { (m[e.occurrenceDate || e.date] = m[e.occurrenceDate || e.date] || []).push({ ...e, _kind: 'event' }); }
    for (const a of apOcc) { (m[a.occurrenceDate || a.date] = m[a.occurrenceDate || a.date] || []).push({ ...a, _kind: 'appt' }); }
    for (const k of Object.keys(m)) m[k].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    return m;
  }, [evOcc, apOcc]);

  const handleDragStart = (e, item, kind) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, kind }));
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDrop = (e, iso, time) => {
    e.preventDefault();
    setDragOver(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      onDropItem?.(data, iso, time);
    } catch { /* ignore */ }
  };

  if (view === 'month') {
    const grid = getMonthGrid(cursor.getFullYear(), cursor.getMonth());
    return (
      <div className="cal-month" role="grid" aria-label="Month view">
        <div className="cal-dow">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="dow">{d}</div>)}</div>
        {grid.map((week, wi) => (
          <div key={wi} className="cal-week-row">
            {week.map((cell) => {
              const items = byDate[cell.iso] || [];
              const isSel = selectedDate === cell.iso;
              const isToday = cell.iso === todayISO();
              return (
                <div
                  key={cell.iso}
                  role="gridcell"
                  aria-label={cell.iso}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelectDate(cell.iso); }}
                  className={`cell${cell.inMonth ? '' : ' outside'}${isSel ? ' selected' : ''}${isToday ? ' today' : ''}${dragOver === cell.iso ? ' dragover' : ''}`}
                  onClick={() => onSelectDate(cell.iso)}
                  onDoubleClick={() => onDayDoubleClick?.(cell.iso)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(cell.iso); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(e, cell.iso)}
                >
                  <div className="cell-date">{Number(cell.iso.slice(8, 10))}</div>
                  <div className="cell-items">
                    {items.slice(0, 3).map((it) => (
                      <Chip key={it._kind + it.id + (it.occurrenceDate || '')} item={it} kind={it._kind} onClick={onEventClick} onDragStart={handleDragStart} />
                    ))}
                    {items.length > 3 && <div className="more">+{items.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  if (view === 'week') {
    const days = getWeekDays(toISODate(cursor));
    return (
      <div className="cal-week">
        <div className="week-head">
          <div className="week-gutter" />
          {days.map((iso) => (
            <button key={iso} className={`week-day-head${iso === todayISO() ? ' today' : ''}${iso === selectedDate ? ' selected' : ''}`} onClick={() => onSelectDate(iso)}>
              <span>{new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <strong>{Number(iso.slice(8, 10))}</strong>
            </button>
          ))}
        </div>
        <div className="week-body">
          <div className="week-gutter-col">{HOURS.map((h) => <div key={h} className="hour-label">{h}:00</div>)}</div>
          {days.map((iso) => (
            <div
              key={iso}
              className={`week-col${dragOver === iso ? ' dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(iso); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, iso)}
            >
              {HOURS.map((h) => {
                const t = `${String(h).padStart(2, '0')}:00`;
                return <div key={t} className="hour-slot" onDoubleClick={() => onDayDoubleClick?.(iso, t)} onClick={() => onSelectDate(iso)} />;
              })}
              <div className="week-events">
                {(byDate[iso] || []).map((it) => (
                  <Chip key={it._kind + it.id} item={it} kind={it._kind} onClick={onEventClick} onDragStart={handleDragStart} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'day') {
    const iso = toISODate(cursor);
    const items = byDate[iso] || [];
    return (
      <div className="cal-day">
        {HOURS.map((h) => {
          const t = `${String(h).padStart(2, '0')}:00`;
          const slotItems = items.filter((it) => (it.startTime || '').slice(0, 2) === String(h).padStart(2, '0'));
          return (
            <div
              key={h}
              className="day-row"
              onDoubleClick={() => onDayDoubleClick?.(iso, t)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, iso, t)}
            >
              <div className="day-hour">{h}:00</div>
              <div className="day-items">
                {slotItems.map((it) => (
                  <Chip key={it._kind + it.id} item={it} kind={it._kind} onClick={onEventClick} onDragStart={handleDragStart} />
                ))}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="muted center pad">No events scheduled for this day.</div>}
      </div>
    );
  }

  // agenda
  const all = [...evOcc.map((e) => ({ ...e, _kind: 'event', _date: e.occurrenceDate || e.date })), ...apOcc.map((a) => ({ ...a, _kind: 'appt', _date: a.occurrenceDate || a.date }))].sort((a, b) => (a._date + (a.startTime || '')).localeCompare(b._date + (b.startTime || '')));
  if (!all.length) return <div className="muted center pad">No events in this range.</div>;
  return (
    <div className="agenda">
      {all.map((it, index) => {
        const showHead = index === 0 || it._date !== all[index - 1]._date;
        return (
          <div key={it._kind + it.id + it._date}>
            {showHead && <div className="agenda-date">{new Date(it._date + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>}
            <button className="agenda-row" onClick={() => onEventClick(it, it._kind)}>
              <span className="agenda-time">{formatTime(it.startTime)} – {formatTime(it.endTime)}</span>
              <span className="dot" style={{ background: it._kind === 'appt' ? '#0ea5e9' : categoryColor(it.category) }} />
              <span className="agenda-title">{it.title}</span>
              <span className="pill">{it._kind === 'appt' ? (it.contact || 'Appointment') : (it.category || '')}</span>
              {it.isRecurrence && <span className="pill">↻</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
