import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';

const columns = `
  id, title, description, contact, location, appointment_date AS date,
  start_time, end_time, priority, category, status, reminder, notes,
  created_at, updated_at
`;

export async function findAllAppointments() {
  const [rows] = await pool.query(
    `SELECT ${columns} FROM appointments ORDER BY appointment_date ASC, start_time ASC, created_at ASC`
  );
  return rows;
}

export async function findAppointmentById(id) {
  const [rows] = await pool.query(`SELECT ${columns} FROM appointments WHERE id = ?`, [id]);
  return rows[0] || null;
}

export async function createAppointment(appointment) {
  const id = appointment.id || randomUUID();
  await pool.execute(
    `INSERT INTO appointments
      (id, title, description, contact, location, appointment_date, start_time, end_time,
       priority, category, status, reminder, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, appointment.title, appointment.description, appointment.contact,
      appointment.location, appointment.date, appointment.start_time, appointment.end_time,
      appointment.priority, appointment.category, appointment.status,
      appointment.reminder, appointment.notes,
    ]
  );
  return findAppointmentById(id);
}

export async function updateAppointmentById(id, appointment) {
  const [result] = await pool.execute(
    `UPDATE appointments SET
      title = ?, description = ?, contact = ?, location = ?, appointment_date = ?,
      start_time = ?, end_time = ?, priority = ?, category = ?, status = ?,
      reminder = ?, notes = ?
     WHERE id = ?`,
    [
      appointment.title, appointment.description, appointment.contact,
      appointment.location, appointment.date, appointment.start_time, appointment.end_time,
      appointment.priority, appointment.category, appointment.status,
      appointment.reminder, appointment.notes, id,
    ]
  );
  return result.affectedRows ? findAppointmentById(id) : null;
}

export async function deleteAppointmentById(id) {
  const [result] = await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
