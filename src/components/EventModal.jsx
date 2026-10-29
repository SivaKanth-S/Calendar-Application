import { useState, useMemo } from 'react';
import Modal, { Field } from './ui';
import { CATEGORIES, PRIORITIES, EVENT_STATUSES, REPEAT_OPTIONS, REMINDER_OPTIONS } from '../services/storage';
import { findConflicts } from '../utils/dateUtils';
import { useApp } from '../context/AppContext';

export default function EventModal({ initial, presetDate, onClose }) {
  const { events, appointments, addEvent, updateEvent, pushToast } = useApp();
  const [form, setForm] = useState(() => ({
    title: initial?.title || '',
    description: initial?.description || '',
    date: initial?.date || presetDate || new Date().toISOString().slice(0, 10),
    startTime: initial?.startTime || '09:00',
    endTime: initial?.endTime || '10:00',
    location: initial?.location || '',
    category: initial?.category || 'Meeting',
    priority: initial?.priority || 'Medium',
    reminder: initial?.reminder || '15m',
    repeat: initial?.repeat || 'none',
    repeatInterval: initial?.repeatInterval || 2,
    repeatUnit: initial?.repeatUnit || 'days',
    status: initial?.status || 'Scheduled',
    notes: initial?.notes || '',
  }));
  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [forceSave, setForceSave] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const allItems = useMemo(
    () => [...events.map((e) => ({ ...e })), ...appointments.map((a) => ({ ...a, category: 'Appointment' }))],
    [events, appointments]
  );

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.date) e.date = 'Date is required.';
    if (!form.startTime) e.startTime = 'Start time is required.';
    if (form.startTime && form.endTime && form.endTime <= form.startTime) e.endTime = 'End time must be after start time.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const found = findConflicts({ items: allItems, date: form.date, startTime: form.startTime, endTime: form.endTime, excludeId: initial?.id });
    if (found.length && !forceSave) {
      setConflicts(found);
      return;
    }
    if (initial?.id) {
      updateEvent(initial.id, form);
      pushToast('Event updated ✓');
    } else {
      addEvent(form);
      pushToast('Event created ✓');
    }
    onClose();
  };

  return (
    <Modal title={initial?.id ? 'Edit event' : 'New event'} onClose={onClose} wide>
      <form onSubmit={submit} className="form-grid" noValidate>
        <div className="span-2">
          <Field label="Event title" required>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Design review" aria-invalid={!!errors.title} />
          </Field>
          {errors.title && <div className="err">{errors.title}</div>}
        </div>
        <div className="span-2">
          <Field label="Description">
            <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Agenda, links…" />
          </Field>
        </div>
        <Field label="Date" required>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          {errors.date && <div className="err">{errors.date}</div>}
        </Field>
        <Field label="Location">
          <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Room / link" />
        </Field>
        <Field label="Start time" required>
          <input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
          {errors.startTime && <div className="err">{errors.startTime}</div>}
        </Field>
        <Field label="End time" required>
          <input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
          {errors.endTime && <div className="err">{errors.endTime}</div>}
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Reminder">
          <select value={form.reminder} onChange={(e) => set('reminder', e.target.value)}>
            {REMINDER_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>
        <Field label="Repeat">
          <select value={form.repeat} onChange={(e) => set('repeat', e.target.value)}>
            {REPEAT_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>
        {form.repeat === 'custom' && (
          <>
            <Field label="Every">
              <input type="number" min={1} max={30} value={form.repeatInterval} onChange={(e) => set('repeatInterval', Number(e.target.value))} />
            </Field>
            <Field label="Unit">
              <select value={form.repeatUnit} onChange={(e) => set('repeatUnit', e.target.value)}>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </Field>
          </>
        )}
        <Field label="Status">
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {EVENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div className="span-2">
          <Field label="Notes">
            <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything else…" />
          </Field>
        </div>
        {conflicts.length > 0 && (
          <div className="conflict span-2" role="alert">
            <strong>⚠ Schedule conflict detected.</strong>
            <ul>
              {conflicts.map((c) => (
                <li key={c.id}>“{c.title}” {c.startTime}–{c.endTime} on {c.date}</li>
              ))}
            </ul>
            <label className="check"><input type="checkbox" checked={forceSave} onChange={(e) => setForceSave(e.target.checked)} /> Save anyway</label>
          </div>
        )}
        <div className="form-actions span-2">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{initial?.id ? 'Save changes' : 'Create event'}</button>
        </div>
      </form>
    </Modal>
  );
}
