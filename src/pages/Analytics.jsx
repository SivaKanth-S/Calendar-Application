import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardCard } from '../components/ui';
import { completionRate, countBy, computeStreaks, completionsPerDay, last7Days } from '../utils/analyticsUtils';

export default function Analytics() {
  const { tasks } = useApp();
  
  const stats = useMemo(() => {
    const rate = completionRate(tasks);
    const catDist = countBy(tasks, 'category');
    const priDist = countBy(tasks, 'priority');
    const streaks = computeStreaks(tasks);
    const last7 = completionsPerDay(tasks, last7Days());
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const overdueTasks = tasks.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.dueDate < today && t.status !== 'Completed' && t.status !== 'Cancelled';
    }).length;

    return { rate, catDist, priDist, streaks, last7, totalTasks, completedTasks, pendingTasks, overdueTasks };
  }, [tasks]);

  const maxDaily = Math.max(...stats.last7.map(d => d.count), 1);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Productivity Analytics</h1>
          <p className="muted">Detailed insights into your performance and habits.</p>
        </div>
      </div>

      <div className="stats-grid">
        <DashboardCard title="Completion Rate" value={`${stats.rate}%`} icon="📈" accent="#10b981" />
        <DashboardCard title="Current Streak" value={stats.streaks.current} icon="🔥" accent="#f59e0b" sub={`Longest: ${stats.streaks.longest} days`} />
        <DashboardCard title="Total Tasks" value={stats.totalTasks} icon="📋" accent="#6366f1" />
        <DashboardCard title="Overdue" value={stats.overdueTasks} icon="⚠️" accent="#ef4444" />
      </div>

      <div className="analytics-grid">
        <section className="panel">
          <h3>Daily Productivity (Last 7 Days)</h3>
          <div className="chart-bar-container">
            {stats.last7.map(d => (
              <div key={d.date} className="chart-bar-col">
                <div className="chart-bar-val">{d.count}</div>
                <div className="chart-bar" style={{ height: `${(d.count / maxDaily) * 150}px` }} />
                <div className="chart-bar-label">{d.date.slice(8, 10)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Category Distribution</h3>
          <div className="dist-list">
            {Object.entries(stats.catDist).map(([cat, count]) => (
              <div key={cat} className="dist-row">
                <span className="dist-label">{cat}</span>
                <div className="dist-track"><div className="dist-bar" style={{ width: `${(count / stats.totalTasks) * 100}%` }} /></div>
                <span className="dist-count">{count}</span>
              </div>
            ))}
            {stats.totalTasks === 0 && <div className="muted center">No data yet.</div>}
          </div>
        </section>

        <section className="panel">
          <h3>Priority Breakdown</h3>
          <div className="dist-list">
            {['High', 'Medium', 'Low'].map(pri => {
              const count = stats.priDist[pri] || 0;
              return (
                <div key={pri} className="dist-row">
                  <span className={`pill pri-${pri}`}>{pri}</span>
                  <div className="dist-track"><div className="dist-bar" style={{ width: `${(count / (stats.totalTasks || 1)) * 100}%`, background: pri === 'High' ? '#ef4444' : pri === 'Medium' ? '#f59e0b' : '#10b981' }} /></div>
                  <span className="dist-count">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
