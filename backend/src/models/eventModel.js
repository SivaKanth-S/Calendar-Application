import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';

const columns = `
  id, title, description, event_date AS date, start_time, end_time, location,
  priority, category, status, reminder, repeat_type, repeat_interval, repeat_unit,
  notes, created_at, updated_at
`;

export async function findAllEvents() {
  const [rows] = await pool.query(
    `SELECT ${columns} FROM events ORDER BY event_date ASC, start_time ASC, created_at ASC`
  );
  return rows;
}

export async function findEventById(id) {
  const [rows] = await pool.query(`SELECT ${columns} FROM events WHERE id = ?`, [id]);
  return rows[0] || null;
}

export async function createEvent(event) {
  const id = event.id || randomUUID();
  await pool.execute(
    `INSERT INTO events
      (id, title, description, event_date, start_time, end_time, location, priority,
       category, status, reminder, repeat_type, repeat_interval, repeat_unit, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, event.title, event.description, event.date, event.start_time, event.end_time,
      event.location, event.priority, event.category, event.status, event.reminder,
      event.repeat_type, event.repeat_interval, event.repeat_unit, event.notes,
    ]
  );
  return findEventById(id);
}

export async function updateEventById(id, event) {
  const [result] = await pool.execute(
    `UPDATE events SET
      title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?,
      location = ?, priority = ?, category = ?, status = ?, reminder = ?,
      repeat_type = ?, repeat_interval = ?, repeat_unit = ?, notes = ?
     WHERE id = ?`,
    [
      event.title, event.description, event.date, event.start_time, event.end_time,
      event.location, event.priority, event.category, event.status, event.reminder,
      event.repeat_type, event.repeat_interval, event.repeat_unit, event.notes, id,
    ]
  );
  return result.affectedRows ? findEventById(id) : null;
}

export async function deleteEventById(id) {
  const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
