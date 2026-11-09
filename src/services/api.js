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

export const getEvents = () => request('/events');
export const getEvent = (id) => request(`/events/${id}`);
export const createEvent = (event) => request('/events', { method: 'POST', body: JSON.stringify(toApiEvent(event)) });
export const updateEvent = (id, event) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(toApiEvent(event)) });
export const deleteEvent = (id) => request(`/events/${id}`, { method: 'DELETE' });

export const getAppointments = () => request('/appointments');
export const getAppointment = (id) => request(`/appointments/${id}`);
export const createAppointment = (appointment) => request('/appointments', { method: 'POST', body: JSON.stringify(toApiAppointment(appointment)) });
export const updateAppointment = (id, appointment) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(toApiAppointment(appointment)) });
export const deleteAppointment = (id) => request(`/appointments/${id}`, { method: 'DELETE' });

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

function toApiEvent(event) {
  return {
    id: event.id,
    title: event.title || event.event_name,
    description: event.description || '',
    date: event.date || event.event_date,
    start_time: event.startTime || event.start_time || null,
    end_time: event.endTime || event.end_time || null,
    location: event.location || '',
    priority: event.priority || 'Medium',
    category: event.category || 'Other',
    status: event.status || 'Scheduled',
    reminder: event.reminder || null,
    repeat_type: event.repeat || event.repeat_type || 'none',
    repeat_interval: Number(event.repeatInterval ?? event.repeat_interval ?? 1),
    repeat_unit: event.repeatUnit || event.repeat_unit || 'days',
    notes: event.notes || '',
  };
}

export function fromApiEvent(event) {
  return {
    ...event,
    date: formatDateValue(event.date || event.event_date),
    startTime: formatTimeValue(event.start_time),
    endTime: formatTimeValue(event.end_time),
    repeat: event.repeat_type || 'none',
    repeatInterval: event.repeat_interval ?? 1,
    repeatUnit: event.repeat_unit || 'days',
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
}

function toApiAppointment(appointment) {
  return {
    id: appointment.id,
    title: appointment.title,
    description: appointment.description || '',
    contact: appointment.contact || '',
    location: appointment.location || '',
    date: appointment.date || appointment.appointment_date,
    start_time: appointment.startTime || appointment.start_time || null,
    end_time: appointment.endTime || appointment.end_time || null,
    priority: appointment.priority || 'Medium',
    category: appointment.category || 'Appointment',
    status: appointment.status || 'Scheduled',
    reminder: appointment.reminder || null,
    notes: appointment.notes || '',
  };
}

export function fromApiAppointment(appointment) {
  return {
    ...appointment,
    date: formatDateValue(appointment.date || appointment.appointment_date),
    startTime: formatTimeValue(appointment.start_time),
    endTime: formatTimeValue(appointment.end_time),
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at,
  };
}

function formatDateValue(value) {
  return value ? String(value).slice(0, 10) : '';
}

function formatTimeValue(value) {
  return value ? String(value).slice(0, 5) : '';
}
