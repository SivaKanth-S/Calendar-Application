-- Create database
CREATE DATABASE IF NOT EXISTS calendar_app DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE calendar_app;

-- Table for categories (used by tasks/events/appointments)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#64748b',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for priorities
CREATE TABLE IF NOT EXISTS priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for task/status types
CREATE TABLE IF NOT EXISTS task_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- Table for appointments statuses
CREATE TABLE IF NOT EXISTS appointment_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- Table for events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    priority VARCHAR(20),
    category VARCHAR(50),
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    reminder VARCHAR(10) DEFAULT '30m',
    repeat ENUM('none', 'daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom') DEFAULT 'none',
    repeat_interval INT DEFAULT 1,
    repeat_unit ENUM('days', 'weeks', 'months') DEFAULT 'days',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Table for appointments
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    priority VARCHAR(20),
    category VARCHAR(50),
    status ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Table for tasks
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    start_time TIME,
    end_time TIME,
    progress INT DEFAULT 0,
    priority VARCHAR(20),
    category VARCHAR(50),
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    completed_at TIMESTAMP NULL,
    reminder VARCHAR(10) DEFAULT '30m',
    repeat ENUM('none', 'daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom') DEFAULT 'none',
    repeat_interval INT DEFAULT 1,
    repeat_unit ENUM('days', 'weeks', 'months') DEFAULT 'days',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_due_date (due_date),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- Insert default categories
INSERT IGNORE INTO categories (name, color) VALUES
('Meeting', '#6366f1'),
('Appointment', '#0ea5e9'),
('Personal', '#ec4899'),
('Study', '#f59e0b'),
('Work', '#10b981'),
('Other', '#8b5cf6');

-- Insert default priorities
INSERT IGNORE INTO priorities (name, level) VALUES
('Low', 1),
('Medium', 2),
('High', 3);

-- Insert default task statuses
INSERT IGNORE INTO task_statuses (name) VALUES
('Pending'),
('In Progress'),
('Completed'),
('Cancelled');

-- Insert default appointment statuses
INSERT IGNORE INTO appointment_statuses (name) VALUES
('Scheduled'),
('Confirmed'),
('Completed'),
('Cancelled');