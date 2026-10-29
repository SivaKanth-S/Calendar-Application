import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskflow_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(config);

export async function connectDatabase() {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database.replace(/`/g, '')}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      task_name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      task_date DATE NOT NULL,
      start_time TIME NULL,
      end_time TIME NULL,
      duration INT UNSIGNED NULL,
      priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
      category VARCHAR(100) NOT NULL DEFAULT 'Other',
      status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
      progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
      repeat_type VARCHAR(50) NOT NULL DEFAULT 'none',
      due_date DATE NULL,
      notes TEXT NULL,
      reminder VARCHAR(20) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query('SELECT 1');
  console.log('MySQL connected successfully');
}
