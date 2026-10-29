import { NotificationPanel } from '../components/Panels';

export default function Reminders() {
  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Reminders & Notifications</h1>
          <p className="muted">Stay on top of your schedule and tasks.</p>
        </div>
      </div>

      <div className="panel max-w-4xl mx-auto">
        <NotificationPanel />
      </div>
    </div>
  );
}
