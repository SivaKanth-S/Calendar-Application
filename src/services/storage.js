const KEYS = {
  events: 'cal-events',
  tasks: 'cal-tasks',
  appointments: 'cal-appointments',
  notifications: 'cal-notifications',
  theme: 'cal-theme',
  prefs: 'cal-prefs',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore
  }
}

export function loadAll() {
  const tasks = load(KEYS.tasks, []);
  const events = load(KEYS.events, []);
  const appointments = load(KEYS.appointments, []);
  const notifications = load(KEYS.notifications, []);

  // Seed a demo task list on first run so the UI is not empty.
  // Dynamic import avoids a circular dependency with the seed module.
  let seededTasks = tasks;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    try {
      const cached = typeof localStorage !== 'undefined' && localStorage.getItem('cal-seeded-v1');
      if (!cached) {
        // Synchronously generate seeds without importing (kept light + date-relative).
        seededTasks = buildSeedTasks();
        save(KEYS.tasks, seededTasks);
        try { localStorage.setItem('cal-seeded-v1', '1'); } catch { /* ignore */ }
      } else {
        seededTasks = tasks;
      }
    } catch {
      seededTasks = tasks.length ? tasks : buildSeedTasks();
    }
  }

  // Seed sample events on first run so the UI is not empty.
  let seededEvents = events;
  if (!Array.isArray(events) || events.length === 0) {
    try {
      const cached = typeof localStorage !== 'undefined' && localStorage.getItem('cal-events-seeded-v1');
      if (!cached) {
        seededEvents = buildSeedEvents();
        save(KEYS.events, seededEvents);
        try { localStorage.setItem('cal-events-seeded-v1', '1'); } catch { /* ignore */ }
      } else {
        seededEvents = events;
      }
    } catch {
      seededEvents = events.length ? events : buildSeedEvents();
    }
  }

  // Seed sample appointments on first run so the UI is not empty.
  let seededAppointments = appointments;
  if (!Array.isArray(appointments) || appointments.length === 0) {
    try {
      const cached = typeof localStorage !== 'undefined' && localStorage.getItem('cal-appts-seeded-v1');
      if (!cached) {
        seededAppointments = buildSeedAppointments();
        save(KEYS.appointments, seededAppointments);
        try { localStorage.setItem('cal-appts-seeded-v1', '1'); } catch { /* ignore */ }
      } else {
        seededAppointments = appointments;
      }
    } catch {
      seededAppointments = appointments.length ? appointments : buildSeedAppointments();
    }
  }

  return {
    events: seededEvents,
    tasks: seededTasks,
    appointments: seededAppointments,
    notifications,
    theme: load(KEYS.theme, 'light'),
    prefs: load(KEYS.prefs, { weekStartsOn: 0 }),
  };
}

export function persistAll({ events, tasks, appointments, notifications, theme, prefs }) {
  if (events !== undefined) save(KEYS.events, events);
  if (tasks !== undefined) save(KEYS.tasks, tasks);
  if (appointments !== undefined) save(KEYS.appointments, appointments);
  if (notifications !== undefined) save(KEYS.notifications, notifications);
  if (theme !== undefined) save(KEYS.theme, theme);
  if (prefs !== undefined) save(KEYS.prefs, prefs);
}

export function uid(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function isoPlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function makeSeedTask(data) {
  const now = new Date().toISOString();
  return {
    id: uid('t'),
    status: 'Pending',
    progress: 0,
    priority: 'Medium',
    category: 'Work',
    reminder: '30m',
    repeat: 'none',
    repeatInterval: 1,
    repeatUnit: 'days',
    startTime: '09:00',
    description: '',
    notes: '',
    createdAt: now,
    completedAt: null,
    ...data,
  };
}

export function buildSeedTasks() {
  return [
    makeSeedTask({
      title: 'Finish quarterly report',
      description: 'Compile sales numbers and draft Q3 summary for review.',
      dueDate: isoPlusDays(0),
      startTime: '09:00',
      priority: 'High',
      category: 'Work',
      status: 'In Progress',
      progress: 60,
      reminder: '1h',
      notes: 'Ask finance for final figures.',
    }),
    makeSeedTask({
      title: 'Team standup meeting prep',
      description: 'Update board and blockers before daily standup.',
      dueDate: isoPlusDays(0),
      startTime: '08:30',
      priority: 'Medium',
      category: 'Meeting',
      status: 'Pending',
      progress: 10,
      reminder: '15m',
    }),
    makeSeedTask({
      title: 'Doctor appointment follow-up',
      description: 'Bring lab results and insurance card.',
      dueDate: isoPlusDays(1),
      startTime: '10:30',
      priority: 'High',
      category: 'Appointment',
      status: 'Pending',
      progress: 0,
      reminder: '1d',
    }),
    makeSeedTask({
      title: 'Study React Router',
      description: 'Finish nested routes + outlet context chapter.',
      dueDate: isoPlusDays(1),
      startTime: '18:00',
      priority: 'Medium',
      category: 'Study',
      status: 'Pending',
      progress: 25,
      reminder: '30m',
      repeat: 'weekly',
    }),
    makeSeedTask({
      title: 'Grocery shopping',
      description: 'Milk, eggs, vegetables, coffee beans.',
      dueDate: isoPlusDays(2),
      startTime: '17:00',
      priority: 'Low',
      category: 'Personal',
      status: 'Pending',
      progress: 0,
      reminder: '1h',
    }),
    makeSeedTask({
      title: 'Fix overdue invoice',
      description: 'Client #482 invoice was due last week — send reminder.',
      dueDate: isoPlusDays(-2),
      startTime: '11:00',
      priority: 'High',
      category: 'Work',
      status: 'Pending',
      progress: 20,
      reminder: '30m',
    }),
    makeSeedTask({
      title: 'Gym — legs day',
      description: 'Squats, lunges, calf raises. 45 min.',
      dueDate: isoPlusDays(-1),
      startTime: '07:00',
      priority: 'Low',
      category: 'Personal',
      status: 'In Progress',
      progress: 50,
      reminder: 'none',
      repeat: 'weekly',
    }),
    makeSeedTask({
      title: 'Deploy calendar app v1.0',
      description: 'Build, smoke test, and deploy to staging.',
      dueDate: isoPlusDays(3),
      startTime: '14:00',
      priority: 'High',
      category: 'Work',
      status: 'Pending',
      progress: 80,
      reminder: '1h',
      notes: 'Check env vars before deploy.',
    }),
    makeSeedTask({
      title: 'Read 30 pages of book',
      description: 'Deep Work — chapter 3.',
      dueDate: isoPlusDays(4),
      startTime: '21:00',
      priority: 'Low',
      category: 'Study',
      status: 'Pending',
      progress: 0,
      reminder: 'none',
      repeat: 'daily',
    }),
    makeSeedTask({
      title: 'Pay electricity bill',
      description: 'Paid online — keep receipt.',
      dueDate: isoPlusDays(-3),
      startTime: '12:00',
      priority: 'Medium',
      category: 'Personal',
      status: 'Completed',
      progress: 100,
      reminder: 'none',
      completedAt: new Date().toISOString(),
    }),
    makeSeedTask({
      title: 'Prepare presentation slides',
      description: '10 slides max for Monday demo.',
      dueDate: isoPlusDays(5),
      startTime: '13:00',
      priority: 'Medium',
      category: 'Meeting',
      status: 'Pending',
      progress: 30,
      reminder: '1d',
    }),
    makeSeedTask({
      title: 'Call mom',
      description: 'Birthday planning call.',
      dueDate: isoPlusDays(0),
      startTime: '19:00',
      priority: 'Medium',
      category: 'Personal',
      status: 'Pending',
      progress: 0,
      reminder: '30m',
    }),
  ];
}

export function getSeedTasks() {
  return buildSeedTasks();
}

export function validateImport(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid file: root must be an object.');
  const out = { events: [], tasks: [], appointments: [] };
  for (const k of ['events', 'tasks', 'appointments']) {
    if (payload[k] !== undefined) {
      if (!Array.isArray(payload[k])) throw new Error(`Invalid file: "${k}" must be an array.`);
      out[k] = payload[k].filter((x) => x && typeof x === 'object' && (x.title || x.name));
    }
  }
  return out;
}

export const CATEGORIES = ['Meeting', 'Appointment', 'Personal', 'Study', 'Work', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const EVENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];
export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
export const APPT_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];
export const REPEAT_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Every weekday (Mon–Fri)' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom…' },
];
export const REMINDER_OPTIONS = [
  { value: 'none', label: 'No reminder' },
  { value: 'at', label: 'At event time' },
  { value: '5m', label: '5 minutes before' },
  { value: '10m', label: '10 minutes before' },
  { value: '15m', label: '15 minutes before' },
  { value: '30m', label: '30 minutes before' },
  { value: '1h', label: '1 hour before' },
  { value: '1d', label: '1 day before' },
];

export const CATEGORY_COLORS = {
  Meeting: '#6366f1',
  Appointment: '#0ea5e9',
  Personal: '#ec4899',
  Study: '#f59e0b',
  Work: '#10b981',
  Other: '#8b5cf6',
};

export function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#64748b';
}

function makeSeedEvent(data) {
  const now = new Date().toISOString();
  return {
    id: uid('ev'),
    status: 'Scheduled',
    title: data.title,
    description: data.description || '',
    date: data.date,
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '17:00',
    priority: data.priority || 'Medium',
    category: data.category || 'Work',
    reminder: data.reminder || '30m',
    repeat: data.repeat || 'none',
    repeatInterval: data.repeatInterval || 1,
    repeatUnit: data.repeatUnit || 'days',
    createdAt: now,
  };
}

function makeSeedAppointment(data) {
  const now = new Date().toISOString();
  return {
    id: uid('ap'),
    status: 'Scheduled',
    title: data.title,
    description: data.description || '',
    date: data.date,
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '17:00',
    priority: data.priority || 'Medium',
    category: data.category || 'Other',
    createdAt: now,
  };
}

export function buildSeedEvents() {
  return [
    makeSeedEvent({
      title: 'Project kickoff meeting',
      description: 'Team alignment on Q3 goals and deliverables.',
      date: isoPlusDays(0),
      startTime: '09:00',
      endTime: '10:00',
      priority: 'High',
      category: 'Meeting',
      reminder: '1h',
    }),
    makeSeedEvent({
      title: 'Client review',
      description: 'Present prototype and gather feedback.',
      date: isoPlusDays(1),
      startTime: '14:00',
      endTime: '15:30',
      priority: 'High',
      category: 'Meeting',
      reminder: '30m',
    }),
    makeSeedEvent({
      title: 'Product design review',
      description: 'Review wireframes and user flow.',
      date: isoPlusDays(2),
      startTime: '11:00',
      endTime: '12:30',
      priority: 'Medium',
      category: 'Study',
      reminder: '15m',
    }),
    makeSeedEvent({
      title: 'Sprint planning',
      description: 'Define sprint backlog and tasks.',
      date: isoPlusDays(-1),
      startTime: '10:00',
      endTime: '11:30',
      priority: 'High',
      category: 'Meeting',
      reminder: '1h',
    }),
    makeSeedEvent({
      title: 'UX research interview',
      description: 'User testing session with 3 participants.',
      date: isoPlusDays(3),
      startTime: '13:00',
      endTime: '14:30',
      priority: 'Medium',
      category: 'Study',
      reminder: 'none',
    }),
  ];
}

export function buildSeedAppointments() {
  return [
    makeSeedAppointment({
      title: 'Dentist appointment',
      description: 'Checkup and cleaning.',
      date: isoPlusDays(5),
      startTime: '10:00',
      endTime: '11:00',
      priority: 'High',
      category: 'Appointment',
    }),
    makeSeedAppointment({
      title: 'Lunch with colleague',
      description: 'Discuss project roadmap.',
      date: isoPlusDays(2),
      startTime: '12:30',
      endTime: '13:30',
      priority: 'Medium',
      category: 'Appointment',
    }),
    makeSeedAppointment({
      title: 'Quarterly business review',
      description: 'Present metrics to stakeholders.',
      date: isoPlusDays(10),
      startTime: '16:00',
      endTime: '17:30',
      priority: 'High',
      category: 'Appointment',
    }),
    makeSeedAppointment({
      title: 'Doctor visit',
      description: 'Follow-up consultation.',
      date: isoPlusDays(1),
      startTime: '09:30',
      endTime: '10:30',
      priority: 'Medium',
      category: 'Appointment',
    }),
  ];
}
