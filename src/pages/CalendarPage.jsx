import { useState } from 'react';
import Calendar from '../components/Calendar';
import { addDays, addMonths, todayISO } from '../utils/dateUtils';
import { useApp } from '../context/AppContext';
import EventModal from '../components/EventModal';
import AppointmentModal from '../components/AppointmentModal';

export default function CalendarPage() {
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [editing, setEditing] = useState(null); // { item, kind }

  const { updateEvent, updateAppointment } = useApp();

  const move = (n) => {
    if (view === 'month') setCursor(addMonths(cursor, n));
    else if (view === 'week') setCursor(addDays(cursor, n * 7));
    else setCursor(addDays(cursor, n));
  };

  const handleDrop = (data, iso, time) => {
    if (data.kind === 'event') updateEvent(data.id, { date: iso, startTime: time || undefined });
    else if (data.kind === 'appt') updateAppointment(data.id, { date: iso, startTime: time || undefined });
  };

  const title = () => {
    if (view === 'month') return cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (view === 'day') return cursor.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    // week: show range
    return 'Weekly View';
  };

  return (
    <div className="page fade-in">
      <div className="page-head cal-head">
        <div>
          <h1>Calendar</h1>
          <p className="muted">{title()}</p>
        </div>
        <div className="row gap">
          <div className="segmented-control">
            {['month', 'week', 'day', 'agenda'].map(v => (
              <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
            ))}
          </div>
          <div className="row gap">
            <button className="btn" onClick={() => move(-1)}>Prev</button>
            <button className="btn" onClick={() => { setCursor(new Date()); setSelectedDate(todayISO()); }}>Today</button>
            <button className="btn" onClick={() => move(1)}>Next</button>
          </div>
        </div>
      </div>

      <div className="panel cal-container">
        <Calendar
          view={view}
          cursor={cursor}
          onCursor={setCursor}
          selectedDate={selectedDate}
          onSelectDate={(iso) => { setSelectedDate(iso); setCursor(new Date(iso + 'T12:00')); }}
          onEventClick={(item, kind) => setEditing({ item, kind })}
          onDayDoubleClick={(iso, time) => setEditing({ item: { date: iso, startTime: time }, kind: 'event', isNew: true })}
          onDropItem={handleDrop}
        />
      </div>

      {editing && editing.kind === 'event' && (
        <EventModal
          initial={editing.isNew ? editing.item : undefined}
          editingId={editing.isNew ? undefined : editing.item.id}
          onClose={() => setEditing(null)}
        />
      )}
      {editing && editing.kind === 'appt' && (
        <AppointmentModal
          initial={editing.item}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
