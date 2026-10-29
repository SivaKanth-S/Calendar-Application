import {
  createTask,
  deleteTaskById,
  findAllTasks,
  findTaskById,
  updateTaskById,
  updateTaskStatusById,
} from '../models/taskModel.js';

const priorities = new Set(['Low', 'Medium', 'High']);
const statuses = new Set(['Pending', 'In Progress', 'Completed', 'Cancelled']);

export async function getTasks(_req, res, next) {
  try {
    res.json({ success: true, data: await findAllTasks() });
  } catch (error) {
    next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await findTaskById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function postTask(req, res, next) {
  try {
    const task = validateTask(req.body);
    res.status(201).json({ success: true, data: await createTask(task) });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
}

export async function putTask(req, res, next) {
  try {
    const task = validateTask(req.body);
    const updated = await updateTaskById(req.params.id, task);
    if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const deleted = await deleteTaskById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    next(error);
  }
}

export async function patchTaskStatus(req, res, next) {
  try {
    const body = req.body || {};
    if (!statuses.has(body.status)) return res.status(400).json({ success: false, message: 'Invalid task status' });
    const progress = body.progress === undefined ? (body.status === 'Completed' ? 100 : 0) : validateProgress(body.progress);
    const updated = await updateTaskStatusById(req.params.id, body.status, progress);
    if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
}

function validateTask(body = {}) {
  if (!body.task_name || typeof body.task_name !== 'string' || !body.task_name.trim()) {
    throw badRequest('task_name is required');
  }
  if (!isDate(body.task_date)) throw badRequest('task_date must be a valid YYYY-MM-DD date');
  if (!statuses.has(body.status)) throw badRequest('status is invalid');
  if (body.priority !== undefined && !priorities.has(body.priority)) throw badRequest('priority is invalid');
  if (body.progress !== undefined) validateProgress(body.progress);
  if (body.start_time && !isTime(body.start_time)) throw badRequest('start_time is invalid');
  if (body.end_time && !isTime(body.end_time)) throw badRequest('end_time is invalid');
  if (body.due_date && !isDate(body.due_date)) throw badRequest('due_date is invalid');
  if (body.start_time && body.end_time && body.end_time <= body.start_time) throw badRequest('end_time must be after start_time');

  return {
    task_name: body.task_name.trim(),
    description: body.description || null,
    task_date: body.task_date,
    start_time: body.start_time || null,
    end_time: body.end_time || null,
    duration: body.duration === '' || body.duration == null ? null : Number(body.duration),
    priority: body.priority || 'Medium',
    category: body.category || 'Other',
    status: body.status,
    progress: body.status === 'Completed' ? 100 : Number(body.progress || 0),
    repeat_type: body.repeat_type || body.repeat || 'none',
    due_date: body.due_date || body.dueDate || body.task_date,
    notes: body.notes || null,
    reminder: body.reminder || null,
  };
}

function validateProgress(value) {
  const progress = Number(value);
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) throw badRequest('progress must be an integer from 0 to 100');
  return progress;
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}
