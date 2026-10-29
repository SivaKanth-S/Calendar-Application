import { useApp } from '../context/AppContext';

export function NotificationPanel() {
  const { notifications, markRead, markAllRead, deleteNotification, clearRead } = useApp();
  const unread = notifications.filter((n) => !n.read);
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Notification center {unread.length > 0 && <span className="badge danger">{unread.length} unread</span>}</h3>
        <div className="row gap">
          <button className="btn sm" onClick={markAllRead}>Mark all read</button>
          <button className="btn sm" onClick={clearRead}>Clear read</button>
        </div>
      </div>
      <div className="notif-list">
        {notifications.length === 0 && <div className="muted center pad">All caught up 🎉</div>}
        {notifications.map((n) => (
          <div key={n.id} className={`notif${n.read ? '' : ' unread'}`}>
            <div className="notif-main">
              <div className="notif-title">{!n.read && <span className="unread-dot" />} {n.title} <span className={`kind kind-${n.kind}`}>{n.kind}</span></div>
              <div className="notif-msg">{n.message}</div>
              <div className="notif-time">{new Date(n.time).toLocaleString()}</div>
            </div>
            <div className="row gap">
              {!n.read && <button className="btn sm" onClick={() => markRead(n.id)}>Read</button>}
              <button className="btn sm danger-ghost" onClick={() => deleteNotification(n.id)} aria-label={`Delete notification ${n.title}`}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReminderPanel({ items }) {
  if (!items.length) return <div className="muted center pad">No reminders right now.</div>;
  return (
    <div className="rem-list">
      {items.map((r, i) => (
        <div key={i} className="rem-row">
          <span className="rem-ico" aria-hidden="true">⏰</span>
          <div>
            <div className="rem-title">{r.title}</div>
            <div className="muted small">{r.detail}</div>
          </div>
          <span className={`pill pri-${r.priority || 'Medium'}`}>{r.when}</span>
        </div>
      ))}
    </div>
  );
}
