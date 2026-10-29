const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `API request failed with status ${response.status}`);
  }
  return payload.data;
}

export const getTasks = () => request('/tasks');
export const getTask = (id) => request(`/tasks/${id}`);
export const createTask = (task) => request('/tasks', { method: 'POST', body: JSON.stringify(toApiTask(task)) });
export const updateTask = (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(toApiTask(task)) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
export const updateTaskStatus = (id, data) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) });

function toApiTask(task) {
  return {
    task_name: task.title || task.task_name,
    description: task.description || '',
    task_date: task.dueDate || task.task_date,
    start_time: task.startTime || task.start_time || null,
    end_time: task.endTime || task.end_time || null,
    duration: task.duration || null,
    priority: task.priority || 'Medium',
    category: task.category || 'Other',
    status: task.status || 'Pending',
    progress: Number(task.progress || 0),
    repeat_type: task.repeat || task.repeat_type || 'none',
    due_date: task.dueDate || task.due_date || task.task_date,
    notes: task.notes || '',
    reminder: task.reminder || null,
  };
}

export function fromApiTask(task) {
  return {
    ...task,
    id: task.id,
    title: task.task_name,
    dueDate: formatDateValue(task.due_date || task.task_date),
    taskDate: formatDateValue(task.task_date),
    startTime: formatTimeValue(task.start_time),
    endTime: formatTimeValue(task.end_time),
    repeat: task.repeat_type || 'none',
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

function formatDateValue(value) {
  return value ? String(value).slice(0, 10) : '';
}

function formatTimeValue(value) {
  return value ? String(value).slice(0, 5) : '';
}
