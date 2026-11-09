-- TaskFlow seed data for tasks, events and appointments.
-- Run: mysql -u root taskflow_db < seed.sql
-- Dates are relative to CURDATE() so the demo always looks live.
-- Idempotent: fixed IDs mean re-running refreshes rows instead of duplicating them.

USE taskflow_db;

INSERT INTO tasks
  (id, task_name, description, task_date, start_time, end_time, duration, priority, category, status, progress, repeat_type, due_date, notes, reminder)
VALUES
  (1, 'Finish quarterly report', 'Compile sales numbers and draft Q3 summary for review.', CURDATE(), '09:00:00', '10:30:00', 90, 'High', 'Work', 'In Progress', 60, 'none', CURDATE(), 'Ask finance for final figures.', '1h'),
  (2, 'Team standup meeting prep', 'Update board and blockers before daily standup.', CURDATE(), '08:30:00', '09:00:00', 30, 'Medium', 'Meeting', 'Pending', 10, 'none', CURDATE(), NULL, '15m'),
  (3, 'Call mom', 'Birthday planning call.', CURDATE(), '19:00:00', NULL, NULL, 'Medium', 'Personal', 'Pending', 0, 'none', CURDATE(), NULL, '30m'),
  (4, 'Doctor appointment follow-up', 'Bring lab results and insurance card.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00', '11:30:00', 60, 'High', 'Appointment', 'Pending', 0, 'none', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL, '1d'),
  (5, 'Study React Router', 'Finish nested routes + outlet context chapter.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', 60, 'Medium', 'Study', 'Pending', 25, 'weekly', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL, '30m'),
  (6, 'Grocery shopping', 'Milk, eggs, vegetables, coffee beans.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:00:00', NULL, NULL, 'Low', 'Personal', 'Pending', 0, 'none', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NULL, '1h'),
  (7, 'Deploy calendar app v1.0', 'Build, smoke test, and deploy to staging.', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '16:00:00', 120, 'High', 'Work', 'Pending', 80, 'none', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Check env vars before deploy.', '1h'),
  (8, 'Read 30 pages of book', 'Deep Work — chapter 3.', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '21:00:00', NULL, NULL, 'Low', 'Study', 'Pending', 0, 'daily', DATE_ADD(CURDATE(), INTERVAL 4 DAY), NULL, 'none'),
  (9, 'Prepare presentation slides', '10 slides max for Monday demo.', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '13:00:00', '15:00:00', 120, 'Medium', 'Meeting', 'Pending', 30, 'none', DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL, '1d'),
  (10, 'Fix overdue invoice', 'Client #482 invoice was due last week — send reminder.', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:00:00', NULL, NULL, 'High', 'Work', 'Pending', 20, 'none', DATE_SUB(CURDATE(), INTERVAL 2 DAY), NULL, '30m'),
  (11, 'Gym — legs day', 'Squats, lunges, calf raises. 45 min.', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:00:00', '07:45:00', 45, 'Low', 'Personal', 'In Progress', 50, 'weekly', DATE_SUB(CURDATE(), INTERVAL 1 DAY), NULL, 'none'),
  (12, 'Pay electricity bill', 'Paid online — keep receipt.', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '12:00:00', NULL, NULL, 'Medium', 'Personal', 'Completed', 100, 'none', DATE_SUB(CURDATE(), INTERVAL 3 DAY), NULL, 'none')
ON DUPLICATE KEY UPDATE
  task_name = VALUES(task_name),
  description = VALUES(description),
  task_date = VALUES(task_date),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  duration = VALUES(duration),
  priority = VALUES(priority),
  category = VALUES(category),
  status = VALUES(status),
  progress = VALUES(progress),
  repeat_type = VALUES(repeat_type),
  due_date = VALUES(due_date),
  notes = VALUES(notes),
  reminder = VALUES(reminder);

INSERT INTO events
  (id, title, description, event_date, start_time, end_time, location, priority, category, status, reminder, repeat_type, repeat_interval, repeat_unit, notes)
VALUES
  ('seed-ev-1', 'Project kickoff meeting', 'Team alignment on Q3 goals and deliverables.', CURDATE(), '09:00:00', '10:00:00', NULL, 'High', 'Meeting', 'Scheduled', '1h', 'none', 1, 'days', NULL),
  ('seed-ev-2', 'Client review', 'Present prototype and gather feedback.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '15:30:00', NULL, 'High', 'Meeting', 'Scheduled', '30m', 'none', 1, 'days', NULL),
  ('seed-ev-3', 'Product design review', 'Review wireframes and user flow.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00', '12:30:00', NULL, 'Medium', 'Study', 'Scheduled', '15m', 'none', 1, 'days', NULL),
  ('seed-ev-4', 'Sprint planning', 'Define sprint backlog and tasks.', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:30:00', NULL, 'High', 'Meeting', 'Scheduled', '1h', 'none', 1, 'days', NULL),
  ('seed-ev-5', 'UX research interview', 'User testing session with 3 participants.', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '13:00:00', '14:30:00', NULL, 'Medium', 'Study', 'Scheduled', 'none', 'none', 1, 'days', NULL)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  event_date = VALUES(event_date),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  location = VALUES(location),
  priority = VALUES(priority),
  category = VALUES(category),
  status = VALUES(status),
  reminder = VALUES(reminder),
  repeat_type = VALUES(repeat_type),
  repeat_interval = VALUES(repeat_interval),
  repeat_unit = VALUES(repeat_unit),
  notes = VALUES(notes);

INSERT INTO appointments
  (id, title, description, contact, location, appointment_date, start_time, end_time, priority, category, status, reminder, notes)
VALUES
  ('seed-ap-1', 'Dentist appointment', 'Checkup and cleaning.', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00:00', '11:00:00', 'High', 'Appointment', 'Scheduled', '1h', NULL),
  ('seed-ap-2', 'Lunch with colleague', 'Discuss project roadmap.', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '12:30:00', '13:30:00', 'Medium', 'Appointment', 'Scheduled', '1h', NULL),
  ('seed-ap-3', 'Quarterly business review', 'Present metrics to stakeholders.', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 10 DAY), '16:00:00', '17:30:00', 'High', 'Appointment', 'Scheduled', '1h', NULL),
  ('seed-ap-4', 'Doctor visit', 'Follow-up consultation.', NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00', '10:30:00', 'Medium', 'Appointment', 'Scheduled', '1h', NULL)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  contact = VALUES(contact),
  location = VALUES(location),
  appointment_date = VALUES(appointment_date),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  priority = VALUES(priority),
  category = VALUES(category),
  status = VALUES(status),
  reminder = VALUES(reminder),
  notes = VALUES(notes);
