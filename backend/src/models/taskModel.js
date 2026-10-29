import { pool } from '../config/db.js';

const columns = `
  id, task_name, description, task_date, start_time, end_time, duration,
  priority, category, status, progress, repeat_type, due_date, notes, reminder,
  created_at, updated_at
`;

export async function findAllTasks() {
  const [rows] = await pool.query(`SELECT ${columns} FROM tasks ORDER BY task_date ASC, start_time ASC, id DESC`);
  return rows;
}

export async function findTaskById(id) {
  const [rows] = await pool.query(`SELECT ${columns} FROM tasks WHERE id = ?`, [id]);
  return rows[0] || null;
}

export async function createTask(task) {
  const [result] = await pool.execute(
    `INSERT INTO tasks
      (task_name, description, task_date, start_time, end_time, duration, priority, category, status, progress, repeat_type, due_date, notes, reminder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.task_name, task.description, task.task_date, task.start_time, task.end_time,
      task.duration, task.priority, task.category, task.status, task.progress,
      task.repeat_type, task.due_date, task.notes, task.reminder,
    ]
  );
  return findTaskById(result.insertId);
}

export async function updateTaskById(id, task) {
  const [result] = await pool.execute(
    `UPDATE tasks SET
      task_name = ?, description = ?, task_date = ?, start_time = ?, end_time = ?,
      duration = ?, priority = ?, category = ?, status = ?, progress = ?,
      repeat_type = ?, due_date = ?, notes = ?, reminder = ?
     WHERE id = ?`,
    [
      task.task_name, task.description, task.task_date, task.start_time, task.end_time,
      task.duration, task.priority, task.category, task.status, task.progress,
      task.repeat_type, task.due_date, task.notes, task.reminder, id,
    ]
  );
  return result.affectedRows ? findTaskById(id) : null;
}

export async function deleteTaskById(id) {
  const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function updateTaskStatusById(id, status, progress) {
  const [result] = await pool.execute(
    'UPDATE tasks SET status = ?, progress = ? WHERE id = ?',
    [status, progress, id]
  );
  return result.affectedRows ? findTaskById(id) : null;
}
