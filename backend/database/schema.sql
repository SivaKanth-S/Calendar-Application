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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_date (task_date),
  INDEX idx_task_status (status),
  INDEX idx_task_priority (priority)
);

CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  event_date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  location VARCHAR(255) NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  category VARCHAR(100) NOT NULL DEFAULT 'Other',
  status ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
  reminder VARCHAR(20) NULL DEFAULT '30m',
  repeat_type VARCHAR(50) NOT NULL DEFAULT 'none',
  repeat_interval INT UNSIGNED NOT NULL DEFAULT 1,
  repeat_unit ENUM('days', 'weeks', 'months') NOT NULL DEFAULT 'days',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_date (event_date),
  INDEX idx_event_status (status)
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  contact VARCHAR(150) NULL,
  location VARCHAR(255) NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  category VARCHAR(100) NOT NULL DEFAULT 'Appointment',
  status ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
  reminder VARCHAR(20) NULL DEFAULT '1h',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_appointment_date (appointment_date),
  INDEX idx_appointment_status (status)
);
