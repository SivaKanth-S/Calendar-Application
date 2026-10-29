import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardCard, Empty } from '../components/ui';
import { todayISO, isOverdue, formatTime, formatFull } from '../utils/dateUtils';
import { computeStreaks } from '../utils/analyticsUtils';
import { Link, useOutletContext } from 'react-router-dom';

export default function Dashboard() {
  const { events, tasks, appointments } = useApp();
  const { openModal } = useOutletContext();
  const t = todayISO();

  const stats = useMemo(() => {
    const todayEvents = events.filter(e => e.date === t).length;
    const todayTasks = tasks.filter(task => task.dueDate === t).length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;
    const upcomingAppts = appointments.filter(a => a.date >= t && a.status !== 'Cancelled').length;
    const streaks = computeStreaks(tasks);

    return { todayEvents, todayTasks, completedTasks, pendingTasks, overdueTasks, upcomingAppts, streaks };
  }, [events, tasks, appointments, t]);

  const upcoming = useMemo(() => {
    const ev = events.filter(e => e.date >= t && e.status !== 'Cancelled').map(e => ({ ...e, _kind: 'Event' }));
    const ap = appointments.filter(a => a.date >= t && a.status !== 'Cancelled').map(a => ({ ...a, _kind: 'Appt' }));
    return [...ev, ...ap].sort((a, b) => (a.date + (a.startTime || '')).localeCompare(b.date + (b.startTime || ''))).slice(0, 5);
  }, [events, appointments, t]);

  const overdue = useMemo(() => {
    return tasks.filter(t => isOverdue(t.dueDate, t.status)).slice(0, 5);
  }, [tasks]);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">{formatFull(t)}</p>
        </div>
        <div className="streak-badge" title="Productivity Streak">
          <span className="streak-ico">🔥</span>
          <span className="streak-val">{stats.streaks.current} day streak</span>
        </div>
      </div>

      <div className="stats-grid">
        <DashboardCard title="Today's Events" value={stats.todayEvents} icon="📅" accent="#6366f1" />
        <DashboardCard title="Pending Tasks" value={stats.pendingTasks} icon="☑" accent="#f59e0b" />
        <DashboardCard title="Completed" value={stats.completedTasks} icon="✅" accent="#10b981" />
        <DashboardCard title="Overdue" value={stats.overdueTasks} icon="⚠️" accent="#ef4444" sub={`${stats.overdueTasks} tasks need attention`} />
        <DashboardCard title="Upcoming Appts" value={stats.upcomingAppts} icon="🤝" accent="#0ea5e9" />
      </div>

      <div className="dashboard-layout">
        <section className="panel">
          <div className="panel-head">
            <h3>Upcoming Schedule</h3>
            <Link to="/calendar" className="btn sm">View Calendar</Link>
          </div>
          <div className="agenda">
            {upcoming.length === 0 ? (
              <Empty title="Nothing scheduled" hint="Add events or appointments to see them here." />
            ) : (
              upcoming.map(it => (
                <div key={it.id} className="agenda-row no-btn">
                  <span className="agenda-time">{formatTime(it.startTime)}</span>
                  <span className="agenda-title">{it.title}</span>
                  <span className="pill">{it._kind === 'Appt' ? it.contact : it.category}</span>
                  <span className="muted small">{it.date === t ? 'Today' : it.date}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Recent Overdue Tasks</h3>
            <Link to="/tasks" className="btn sm">Manage Tasks</Link>
          </div>
          <div className="task-mini-list">
            {overdue.length === 0 ? (
              <Empty title="No overdue tasks" icon="🎉" hint="You're all caught up!" />
            ) : (
              overdue.map(tk => (
                <div key={tk.id} className="agenda-row no-btn overdue">
                  <span className="agenda-title">{tk.title}</span>
                  <span className="pill danger">Due {tk.dueDate}</span>
                  <button className="btn sm primary" onClick={() => openModal('task')}>Update</button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="panel productivity-summary">
        <div className="panel-head"><h3>Productivity Overview</h3></div>
        <div className="row gap wrap">
          <div className="flex-1">
            <div className="stat-label">Completion Rate</div>
            <div className="prog-large">
              <div className="prog-fill" style={{ width: `${Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks || 1)) * 100)}%` }} />
            </div>
            <div className="muted small mt-1">{Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks || 1)) * 100)}% of tasks completed</div>
          </div>
          <div className="flex-1">
            <div className="stat-label">Longest Streak</div>
            <div className="h1">{stats.streaks.longest} <small className="muted">days</small></div>
          </div>
        </div>
      </section>
    </div>
  );
}
