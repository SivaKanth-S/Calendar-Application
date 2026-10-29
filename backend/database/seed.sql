-- TaskFlow seed task list
-- Run: mysql -u root -p taskflow_db < seed.sql
-- Dates are relative to CURDATE() so the demo always looks live.
USE taskflow_db;

INSERT INTO tasks
  (task_name, description, task_date, start_time, end_time, duration, priority, category, status, progress, repeat_type, due_date, notes, reminder)
VALUES
  ('Finish quarterly report', 'Compile sales numbers and draft Q3 summary for review.', CURDATE(), '09:00:00', '10:30:00', 90, 'High', 'Work', 'In Progress', 60, 'none', CURDATE(), 'Ask finance for final figures.', '1h'),
  ('Team standup meeting prep', 'Update board and blockers before daily standup.', CURDATE(), '08:30:00', '09:00:00', 30, 'Medium', 'Meeting', 'Pending', 10, 'none', CURDATE(), NULL, '15m'),
  ('Call mom', 'Birthday planning call.', CURDATE(), '19:00:00', NULL, NULL, 'Medium', 'Personal', 'Pending', 0, 'none', CURDATE(), NULL, '30m'),
  ('Doctor appointment follow-up', 'Bring lab results and insurance card.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00', '11:30:00', 60, 'High', 'Appointment', 'Pending', 0, 'none', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL, '1d'),
  ('Study React Router', 'Finish nested routes + outlet context chapter.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', 60, 'Medium', 'Study', 'Pending', 25, 'weekly', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL, '30m'),
  ('Grocery shopping', 'Milk, eggs, vegetables, coffee beans.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:00:00', NULL, NULL, 'Low', 'Personal', 'Pending', 0, 'none', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NULL, '1h'),
  ('Deploy calendar app v1.0', 'Build, smoke test, and deploy to staging.', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '16:00:00', 120, 'High', 'Work', 'Pending', 80, 'none', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Check env vars before deploy.', '1h'),
  ('Read 30 pages of book', 'Deep Work — chapter 3.', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '21:00:00', NULL, NULL, 'Low', 'Study', 'Pending', 0, 'daily', DATE_ADD(CURDATE(), INTERVAL 4 DAY), NULL, 'none'),
  ('Prepare presentation slides', '10 slides max for Monday demo.', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '13:00:00', '15:00:00', 120, 'Medium', 'Meeting', 'Pending', 30, 'none', DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL, '1d'),
  ('Fix overdue invoice', 'Client #482 invoice was due last week — send reminder.', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:00:00', NULL, NULL, 'High', 'Work', 'Pending', 20, 'none', DATE_SUB(CURDATE(), INTERVAL 2 DAY), NULL, '30m'),
  ('Gym — legs day', 'Squats, lunges, calf raises. 45 min.', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:00:00', '07:45:00', 45, 'Low', 'Personal', 'In Progress', 50, 'weekly', DATE_SUB(CURDATE(), INTERVAL 1 DAY), NULL, 'none'),
  ('Pay electricity bill', 'Paid online — keep receipt.', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '12:00:00', NULL, NULL, 'Medium', 'Personal', 'Completed', 100, 'none', DATE_SUB(CURDATE(), INTERVAL 3 DAY), NULL, 'none');
