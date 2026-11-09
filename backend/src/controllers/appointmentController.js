import {
  createAppointment,
  deleteAppointmentById,
  findAllAppointments,
  findAppointmentById,
  updateAppointmentById,
} from '../models/appointmentModel.js';
import { badRequest, isDate, validateRange } from '../utils/validate.js';

const priorities = new Set(['Low', 'Medium', 'High']);
const statuses = new Set(['Scheduled', 'Confirmed', 'Completed', 'Cancelled']);

export async function getAppointments(_req, res, next) {
  try {
    res.json({ success: true, data: await findAllAppointments() });
  } catch (error) {
    next(error);
  }
}

export async function getAppointment(req, res, next) {
  try {
    const appointment = await findAppointmentById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function postAppointment(req, res, next) {
  try {
    const appointment = validateAppointment(req.body);
    res.status(201).json({ success: true, data: await createAppointment(appointment) });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
}

export async function putAppointment(req, res, next) {
  try {
    const appointment = validateAppointment(req.body);
    const updated = await updateAppointmentById(req.params.id, appointment);
    if (!updated) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    const deleted = await deleteAppointmentById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
}

function validateAppointment(body = {}) {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    throw badRequest('title is required');
  }
  const date = body.date || body.appointment_date;
  if (!isDate(date)) throw badRequest('date must be a valid YYYY-MM-DD date');
  const startTime = body.start_time ?? body.startTime ?? null;
  const endTime = body.end_time ?? body.endTime ?? null;
  validateRange(startTime, endTime);
  if (body.status !== undefined && !statuses.has(body.status)) throw badRequest('status is invalid');
  if (body.priority !== undefined && !priorities.has(body.priority)) throw badRequest('priority is invalid');

  return {
    id: body.id ? String(body.id).trim().slice(0, 64) : undefined,
    title: body.title.trim(),
    description: body.description || null,
    contact: body.contact || null,
    location: body.location || null,
    date,
    start_time: startTime,
    end_time: endTime,
    priority: body.priority || 'Medium',
    category: body.category || 'Appointment',
    status: body.status || 'Scheduled',
    reminder: body.reminder || null,
    notes: body.notes || null,
  };
}
