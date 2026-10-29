CREATE DATABASE IF NOT EXISTS taskflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskflow_db;

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
);
