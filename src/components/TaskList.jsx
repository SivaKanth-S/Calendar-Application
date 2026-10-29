import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, PRIORITIES, TASK_STATUSES } from '../services/storage';
import { isOverdue, formatTime } from '../utils/dateUtils';
import { Empty, ConfirmDialog } from './ui';
import TaskModal from './TaskModal';

export default function TaskList({ compact } = {}) {
  const { tasks, updateTaskStatus, deleteTask, addTask, pushToast } = useApp();
  const [q, setQ] = useState('');
  const [fCat, setFCat] = useState('All');
  const [fPri, setFPri] = useState('All');
  const [fStatus, setFStatus] = useState('All');
  const [sort, setSort] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let rows = tasks.filter((t) => {
      if (fCat !== 'All' && t.category !== fCat) return false;
      if (fPri !== 'All' && t.priority !== fPri) return false;
      if (fStatus === 'Overdue') { if (!isOverdue(t.dueDate, t.status)) return false; }
      else if (fStatus !== 'All' && t.status !== fStatus) return false;
      if (query && !(t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query) || t.category?.toLowerCase().includes(query) || (t.dueDate || '').includes(query))) return false;
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      let r = 0;
      if (sort === 'dueDate') r = (a.dueDate || '').localeCompare(b.dueDate || '');
      else if (sort === 'priority') { const w = { High: 3, Medium: 2, Low: 1 }; r = (w[a.priority] || 0) - (w[b.priority] || 0); }
      else if (sort === 'status') r = (a.status || '').localeCompare(b.status || '');
      else if (sort === 'title') r = (a.title || '').localeCompare(b.title || '');
      else if (sort === 'progress') r = (a.progress || 0) - (b.progress || 0);
      return r * dir;
    });
    return rows;
  }, [tasks, q, fCat, fPri, fStatus, sort, sortDir]);

  const toggle = (id) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    setSelected((s) => (s.size === filtered.length ? new Set() : new Set(filtered.map((t) => t.id))));
  };

  const bulkComplete = () => {
    selected.forEach((id) => updateTaskStatus(id, { status: 'Completed', progress: 100 }));
    pushToast(`${selected.size} task(s) completed ✓`);
    setSelected(new Set());
  };
  const bulkDelete = () => {
    selected.forEach((id) => deleteTask(id));
    pushToast(`${selected.size} task(s) deleted`);
    setSelected(new Set());
  };
  const duplicate = (t) => {
    const { id: _id, ...rest } = t;
    addTask({ ...rest, title: `${t.title} (copy)`, status: 'Pending', completedAt: null });
    pushToast('Task duplicated ✓');
  };

  const th = (label, key) => (
    <th>
      <button
        className="th-sort"
        onClick={() => { if (sort === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); else { setSort(key); setSortDir('asc'); } }}
        aria-label={`Sort by ${label}`}
      >
        {label} {sort === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
      </button>
    </th>
  );

  return (
    <div className="tasklist">
      {!compact && (
        <div className="toolbar">
          <input className="input" placeholder="Search tasks…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tasks" />
          <select value={fCat} onChange={(e) => setFCat(e.target.value)} aria-label="Filter category">
            <option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={fPri} onChange={(e) => setFPri(e.target.value)} aria-label="Filter priority">
            <option>All</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label="Filter status">
            <option>All</option>{TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}<option>Overdue</option>
          </select>
        </div>
      )}
      {selected.size > 0 && (
        <div className="bulkbar">
          <span>{selected.size} selected</span>
          <button className="btn sm primary" onClick={bulkComplete}>Complete</button>
          <button className="btn sm danger" onClick={bulkDelete}>Delete</button>
          <button className="btn sm" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}
      {filtered.length === 0 ? (
        <Empty icon="☑" title="No tasks found" hint="Try adjusting search or filters — or create a new task." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} aria-label="Select all" /></th>
                {th('Task', 'title')}
                {th('Date', 'dueDate')}
                <th>Time</th>
                {th('Priority', 'priority')}
                <th>Category</th>
                {th('Status', 'status')}
                {th('Progress', 'progress')}
                <th>Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const overdue = isOverdue(t.dueDate, t.status);
                return (
                  <tr key={t.id} className={overdue ? 'overdue' : ''}>
                    <td><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} aria-label={`Select ${t.title}`} /></td>
                    <td>
                      <div className="task-name">{t.title}{overdue && <span className="pill danger">Overdue</span>}</div>
                      {t.description && <div className="muted small">{t.description.slice(0, 60)}</div>}
                    </td>
                    <td>{t.dueDate || '—'}</td>
                    <td>{formatTime(t.startTime) || '—'}</td>
                    <td><span className={`pill pri-${t.priority}`}>{t.priority}</span></td>
                    <td><span className="pill cat">{t.category}</span></td>
                    <td>
                      <select value={t.status} onChange={(e) => updateTaskStatus(t.id, { status: e.target.value })} aria-label={`Status of ${t.title}`}>
                        {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="prog"><div className="prog-fill" style={{ width: `${t.progress || 0}%` }} /><span>{t.progress || 0}%</span></div>
                    </td>
                    <td className="small">{t.reminder && t.reminder !== 'none' ? t.reminder : '—'}</td>
                    <td>
                      <div className="row gap actions">
                        <button className="btn sm" onClick={() => setEditing(t)} aria-label={`Edit ${t.title}`}>Edit</button>
                        {t.status !== 'Completed' && <button className="btn sm primary" onClick={() => { updateTaskStatus(t.id, { status: 'Completed', progress: 100 }); pushToast('Task completed ✓'); }} aria-label={`Complete ${t.title}`}>Done</button>}
                        <button className="btn sm" onClick={() => duplicate(t)} aria-label={`Duplicate ${t.title}`}>Copy</button>
                        <button className="btn sm danger-ghost" onClick={() => setConfirmDel(t)} aria-label={`Delete ${t.title}`}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {editing && <TaskModal initial={editing} onClose={() => setEditing(null)} />}
      {confirmDel && (
        <ConfirmDialog
          title="Delete task?"
          message={`“${confirmDel.title}” will be permanently deleted.`}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => { deleteTask(confirmDel.id); pushToast('Task deleted'); setConfirmDel(null); }}
        />
      )}
    </div>
  );
}
