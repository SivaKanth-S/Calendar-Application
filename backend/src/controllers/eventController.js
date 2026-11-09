import {
  createEvent,
  deleteEventById,
  findAllEvents,
  findEventById,
  updateEventById,
} from '../models/eventModel.js';
import { badRequest, isDate, validateRange } from '../utils/validate.js';

const priorities = new Set(['Low', 'Medium', 'High']);
const statuses = new Set(['Scheduled', 'Completed', 'Cancelled']);
const repeatUnits = new Set(['days', 'weeks', 'months']);

export async function getEvents(_req, res, next) {
  try {
    res.json({ success: true, data: await findAllEvents() });
  } catch (error) {
    next(error);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await findEventById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function postEvent(req, res, next) {
  try {
    const event = validateEvent(req.body);
    res.status(201).json({ success: true, data: await createEvent(event) });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
}

export async function putEvent(req, res, next) {
  try {
    const event = validateEvent(req.body);
    const updated = await updateEventById(req.params.id, event);
    if (!updated) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const deleted = await deleteEventById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
}

function validateEvent(body = {}) {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw badRequest('title is required');
  }
  const date = body.date || body.event_date;
  if (!isDate(date)) throw badRequest('date must be a valid YYYY-MM-DD date');
  const startTime = body.start_time ?? body.startTime ?? null;
  const endTime = body.end_time ?? body.endTime ?? null;
  validateRange(startTime, endTime);
  if (body.status !== undefined && !statuses.has(body.status)) throw badRequest('status is invalid');
  if (body.priority !== undefined && !priorities.has(body.priority)) throw badRequest('priority is invalid');

  const repeatInterval = body.repeat_interval ?? body.repeatInterval ?? 1;
  const interval = Number(repeatInterval);
  if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
    throw badRequest('repeat_interval must be an integer from 1 to 365');
  }
  const repeatUnit = body.repeat_unit || body.repeatUnit || 'days';
  if (!repeatUnits.has(repeatUnit)) throw badRequest('repeat_unit is invalid');

  return {
    id: body.id ? String(body.id).trim().slice(0, 64) : undefined,
    title: body.title.trim(),
    description: body.description || null,
    date,
    start_time: startTime,
    end_time: endTime,
    location: body.location || null,
    priority: body.priority || 'Medium',
    category: body.category || 'Other',
    status: body.status || 'Scheduled',
    reminder: body.reminder || null,
    repeat_type: body.repeat_type || body.repeat || 'none',
    repeat_interval: interval,
    repeat_unit: repeatUnit,
    notes: body.notes || null,
  };
}
