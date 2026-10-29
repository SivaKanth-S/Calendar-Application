import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categoryColor } from '../services/storage';

export default function Header({ onMenu, onNew, searchInputRef }) {
  const { globalSearch, setGlobalSearch, events, tasks, appointments, notifications, unreadCount, theme, setTheme } = useApp();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (q.length < 2) return [];
    const match = (title = '', desc = '', cat = '', date = '') =>
      title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || cat.toLowerCase().includes(q) || date.includes(q);
    const ev = events.filter((e) => match(e.title, e.description, e.category, e.date)).slice(0, 5).map((e) => ({ kind: 'Event', title: e.title, sub: `${e.date} · ${e.category || ''}`, color: categoryColor(e.category), link: '/calendar' }));
    const tk = tasks.filter((t) => match(t.title, t.description, t.category, t.dueDate)).slice(0, 5).map((t) => ({ kind: 'Task', title: t.title, sub: `${t.dueDate || ''} · ${t.status}`, color: categoryColor(t.category), link: '/tasks' }));
    const ap = appointments.filter((a) => match(a.title, a.notes, a.contact, a.date)).slice(0, 5).map((a) => ({ kind: 'Appt', title: a.title, sub: `${a.date} · ${a.contact || ''}`, color: '#0ea5e9', link: '/upcoming' }));
    return [...ev, ...tk, ...ap].slice(0, 10);
  }, [globalSearch, events, tasks, appointments]);

  useEffect(() => {
    const h = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) { setOpen(false); setNotifOpen(false); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">☰</button>
      <div className="search-wrap" ref={boxRef}>
        <span className="search-ico" aria-hidden="true">⌕</span>
        <input
          ref={searchInputRef}
          className="search"
          placeholder="Search events, tasks, appointments…  ( / )"
          value={globalSearch}
          onChange={(e) => { setGlobalSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          aria-label="Global search"
        />
        {open && results.length > 0 && (
          <div className="search-drop" role="listbox" aria-label="Search results">
            {results.map((r, i) => (
              <Link key={i} to={r.link} className="search-item" onClick={() => setOpen(false)}>
                <span className="dot" style={{ background: r.color }} />
                <span className="search-kind">{r.kind}</span>
                <span className="search-title">{r.title}</span>
                <span className="search-sub">{r.sub}</span>
              </Link>
            ))}
          </div>
        )}
        {open && globalSearch.trim().length >= 2 && results.length === 0 && (
          <div className="search-drop"><div className="search-empty">No matches found.</div></div>
        )}
      </div>
      <div className="top-actions">
        <button className="icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme" title="Toggle light/dark">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="notif-wrap">
          <button className="icon-btn" onClick={() => setNotifOpen((v) => !v)} aria-label={`Notifications, ${unreadCount} unread`}>
            🔔{unreadCount > 0 && <span className="badge notif-badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="notif-drop">
              <div className="notif-drop-head"><strong>Notifications</strong><Link to="/reminders" onClick={() => setNotifOpen(false)}>Open center</Link></div>
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className={`notif-row${n.read ? '' : ' unread'}`}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                </div>
              ))}
              {notifications.length === 0 && <div className="search-empty">All caught up 🎉</div>}
            </div>
          )}
        </div>
        <button className="btn primary" onClick={onNew} aria-label="Add event (N)">+ Add Event</button>
        <button className="avatar" onClick={() => navigate('/settings')} aria-label="Profile / settings" title="Profile">U</button>
      </div>
    </header>
  );
}
