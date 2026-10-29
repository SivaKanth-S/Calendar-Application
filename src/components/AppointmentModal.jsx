import { useState } from 'react';
import Modal, { Field } from './ui';
import { APPT_STATUSES, REMINDER_OPTIONS } from '../services/storage';
import { findConflicts } from '../utils/dateUtils';
import { useApp } from '../context/AppContext';

export default function AppointmentModal({ initial, presetDate, onClose }) {
  const { events, appointments, addAppointment, updateAppointment, pushToast } = useApp();
  const [form, setForm] = useState(() => ({
    title: initial?.title || '',
    contact: initial?.contact || '',
    date: initial?.date || presetDate || new Date().toISOString().slice(0, 10),
    startTime: initial?.startTime || '10:00',
    endTime: initial?.endTime || '10:30',
    location: initial?.location || '',
    reminder: initial?.reminder || '1h',
    status: initial?.status || 'Scheduled',
    notes: initial?.notes || '',
  }));
  const [errors, setErrors] = useState({});
  const [conflict, setConflict] = useState(false);
  const [force, setForce] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.date) errs.date = 'Date is required.';
    if (!form.startTime) errs.startTime = 'Start time is required.';
    if (form.endTime <= form.startTime) errs.endTime = 'End time must be after start time.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const items = [...events, ...appointments];
    const found = findConflicts({ items, date: form.date, startTime: form.startTime, endTime: form.endTime, excludeId: initial?.id });
    if (found.length && !force) { setConflict(true); return; }
    if (initial?.id) { updateAppointment(initial.id, form); pushToast('Appointment updated ✓'); }
    else { addAppointment(form); pushToast('Appointment created ✓'); }
    onClose();
  };

  return (
    <Modal title={initial?.id ? 'Edit appointment' : 'New appointment'} onClose={onClose}>
      <form onSubmit={submit} className="form-grid" noValidate>
        <div className="span-2">
          <Field label="Title" required><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Call with client" /></Field>
          {errors.title && <div className="err">{errors.title}</div>}
        </div>
        <Field label="Person / contact"><input value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="Name" /></Field>
        <Field label="Location"><input value={form.location} onChange={(e) => set('location', e.target.value)} /></Field>
        <Field label="Date" required><input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {APPT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Start time" required><input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} /></Field>
        <Field label="End time"><input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />{errors.endTime && <div className="err">{errors.endTime}</div>}</Field>
        <Field label="Reminder">
          <select value={form.reminder} onChange={(e) => set('reminder', e.target.value)}>
            {REMINDER_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>
        <div className="span-2"><Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field></div>
        {conflict && <div className="conflict span-2" role="alert">⚠ Schedule conflict detected. <label className="check"><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> Save anyway</label></div>}
        <div className="form-actions span-2">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{initial?.id ? 'Save' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
}
