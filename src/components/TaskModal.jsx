import { useState } from 'react';
import Modal, { Field } from './ui';
import { CATEGORIES, PRIORITIES, TASK_STATUSES, REPEAT_OPTIONS, REMINDER_OPTIONS } from '../services/storage';
import { useApp } from '../context/AppContext';

export default function TaskModal({ initial, presetDate, onClose }) {
  const { addTask, updateTask, pushToast } = useApp();
  const [form, setForm] = useState(() => ({
    title: initial?.title || '',
    description: initial?.description || '',
    dueDate: initial?.dueDate || presetDate || new Date().toISOString().slice(0, 10),
    startTime: initial?.startTime || '09:00',
    priority: initial?.priority || 'Medium',
    category: initial?.category || 'Work',
    status: initial?.status || 'Pending',
    progress: initial?.progress ?? 0,
    reminder: initial?.reminder || '30m',
    repeat: initial?.repeat || 'none',
    repeatInterval: initial?.repeatInterval || 1,
    repeatUnit: initial?.repeatUnit || 'days',
    notes: initial?.notes || '',
  }));
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task name is required.';
    if (!form.dueDate) errs.dueDate = 'Due date is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (initial?.id) { updateTask(initial.id, form); pushToast('Task updated ✓'); }
    else { addTask(form); pushToast('Task created ✓'); }
    onClose();
  };

  return (
    <Modal title={initial?.id ? 'Edit task' : 'New task'} onClose={onClose} wide>
      <form onSubmit={submit} className="form-grid" noValidate>
        <div className="span-2">
          <Field label="Task name" required>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Finish report" />
          </Field>
          {errors.title && <div className="err">{errors.title}</div>}
        </div>
        <div className="span-2">
          <Field label="Description"><textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        </div>
        <Field label="Due date" required>
          <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          {errors.dueDate && <div className="err">{errors.dueDate}</div>}
        </Field>
        <Field label="Start time"><input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} /></Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={`Progress (${form.progress}%)`}>
          <input type="range" min={0} max={100} step={5} value={form.progress} onChange={(e) => set('progress', Number(e.target.value))} />
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
        <div className="span-2">
          <Field label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
        </div>
        <div className="form-actions span-2">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{initial?.id ? 'Save changes' : 'Create task'}</button>
        </div>
      </form>
    </Modal>
  );
}
