import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { todayISO, isOverdue } from '../utils/dateUtils';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: '▦', end: true, key: 'd' },
  { to: '/calendar', label: 'Calendar', icon: '📅', key: 'c' },
  { to: '/tasks', label: 'Tasks', icon: '☑', key: 'k' },
  { to: '/today', label: 'Today', icon: '☀', key: 't' },
  { to: '/upcoming', label: 'Upcoming', icon: '⏭', key: 'u' },
  { to: '/reminders', label: 'Reminders', icon: '⏰', key: 'r' },
  { to: '/analytics', label: 'Analytics', icon: '📊', key: 'a' },
  { to: '/settings', label: 'Settings', icon: '⚙', key: 's' },
];

export default function Sidebar({ open, onClose }) {
  const { tasks, events } = useApp();
  const t = todayISO();
  const todayCount = events.filter((e) => e.date === t).length + tasks.filter((x) => x.dueDate === t && x.status !== 'Completed' && x.status !== 'Cancelled').length;
  const overdueCount = tasks.filter((x) => isOverdue(x.dueDate, x.status)).length;

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">◑</span>
          <div>
            <div className="brand-name">PlanWise</div>
            <div className="brand-sub">Scheduler</div>
          </div>
        </div>
        <nav className="nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <span className="nav-icon" aria-hidden="true">{l.icon}</span>
              <span>{l.label}</span>
              {l.to === '/today' && todayCount > 0 && <span className="badge">{todayCount}</span>}
              {l.to === '/tasks' && overdueCount > 0 && <span className="badge danger">{overdueCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          
        </div>
      </aside>
    </>
  );
}
