import TaskList from '../components/TaskList';
import { useOutletContext } from 'react-router-dom';

export default function Tasks() {
  const { openModal } = useOutletContext();

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Task Management</h1>
          <p className="muted">Organize, prioritize, and track your work.</p>
        </div>
        <button className="btn primary" onClick={() => openModal('task')}>+ Add Task</button>
      </div>

      <div className="panel">
        <TaskList />
      </div>
    </div>
  );
}
