import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadAll, persistAll, uid } from '../services/storage';
import { todayISO, minutesUntil } from '../utils/dateUtils';
import { reminderOffsetMinutes } from '../utils/reminderUtils';
import {
  createAppointment as createAppointmentApi,
  createEvent as createEventApi,
  createTask,
  deleteAppointment as deleteAppointmentApi,
  deleteEvent as deleteEventApi,
  deleteTask as deleteTaskApi,
  fromApiAppointment,
  fromApiEvent,
  fromApiTask,
  getAppointments,
  getEvents,
  getTasks,
  updateAppointment as updateAppointmentApi,
  updateEvent as updateEventApi,
  updateTask as updateTaskApi,
  updateTaskStatus,
} from '../services/api';

const AppContext = createContext(null);
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  const initial = useMemo(() => loadAll(), []);
  const [events, setEvents] = useState(initial.events);
  const [tasks, setTasks] = useState(initial.tasks);
  const [appointments, setAppointments] = useState(initial.appointments);
  const [notifications, setNotifications] = useState(initial.notifications);
  const [theme, setTheme] = useState(initial.theme || 'light');
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const seenKeys = useRef(new Set());
  const [backendConnected, setBackendConnected] = useState(false);
  const eventsRef = useRef(initial.events);
  const tasksRef = useRef(initial.tasks);
  const appointmentsRef = useRef(initial.appointments);

  useEffect(() => {
    let active = true;
    Promise.all([getTasks(), getEvents(), getAppointments()])
      .then(([taskData, eventData, appointmentData]) => {
        if (!active) return;
        setBackendConnected(true);
        // Don't wipe the local demo data if the backend is empty.
        if (Array.isArray(taskData) && taskData.length > 0) {
          setTasks(taskData.map(fromApiTask));
        }
        if (Array.isArray(eventData) && eventData.length > 0) {
          setEvents(eventData.map(fromApiEvent));
        }
        if (Array.isArray(appointmentData) && appointmentData.length > 0) {
          setAppointments(appointmentData.map(fromApiAppointment));
        }
      })
      .catch(() => {
        if (active) setBackendConnected(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => { eventsRef.current = events; }, [events]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { appointmentsRef.current = appointments; }, [appointments]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    persistAll({ theme });
  }, [theme]);

  useEffect(() => { persistAll({ events }); }, [events]);
  useEffect(() => { persistAll({ tasks }); }, [tasks]);
  useEffect(() => { persistAll({ appointments }); }, [appointments]);
  useEffect(() => { persistAll({ notifications }); }, [notifications]);

  const pushToast = useCallback((message, type = 'success') => {
    const id = uid('toast');
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  const notify = useCallback((title, message, kind = 'info') => {
    setNotifications((p) => [{ id: uid('n'), title, message, time: new Date().toISOString(), read: false, kind }, ...p].slice(0, 200));
  }, []);

  // ---- CRUD ----
  const addEvent = useCallback((data) => {
    const ev = { id: uid('ev'), status: 'Scheduled', createdAt: new Date().toISOString(), ...data };
    setEvents((p) => [...p, ev]);
    createEventApi(ev)
      .then((saved) => setEvents((p) => p.map((item) => (item.id === ev.id ? fromApiEvent(saved) : item))))
      .catch(() => {});
    return ev;
  }, []);
  const updateEvent = useCallback((id, patch) => {
    const existing = eventsRef.current.find((e) => e.id === id);
    if (!existing) return;
    const next = { ...existing, ...patch };
    setEvents((p) => p.map((e) => (e.id === id ? next : e)));
    updateEventApi(id, next)
      .then((saved) => setEvents((p) => p.map((e) => (e.id === id ? fromApiEvent(saved) : e))))
      .catch(() => {});
  }, []);
  const deleteEvent = useCallback((id) => {
    setEvents((p) => p.filter((e) => e.id !== id));
    deleteEventApi(id).catch(() => {});
  }, []);

  const addTask = useCallback((data) => {
    const t = { id: uid('t'), status: 'Pending', progress: 0, createdAt: new Date().toISOString(), completedAt: null, ...data };
    setTasks((p) => [...p, t]);
    createTask(t)
      .then((saved) => setTasks((p) => p.map((item) => (item.id === t.id ? fromApiTask(saved) : item))))
      .catch(() => {});
    return t;
  }, []);
  const updateTask = useCallback((id, patch) => {
    const existing = tasksRef.current.find((t) => t.id === id);
    if (!existing) return;
    const next = { ...existing, ...patch };
    if (patch.status === 'Completed' && !existing.completedAt) next.completedAt = new Date().toISOString();
    if (patch.status && patch.status !== 'Completed') next.completedAt = null;
    if (patch.status === 'Completed' && next.progress !== 100) next.progress = 100;
    setTasks((p) => p.map((t) => (t.id === id ? next : t)));
    if (typeof id === 'number') {
      updateTaskApi(id, next).then((saved) => setTasks((p) => p.map((t) => (t.id === id ? fromApiTask(saved) : t)))).catch(() => {});
    }
  }, []);
  const deleteTask = useCallback((id) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    if (typeof id === 'number') deleteTaskApi(id).catch(() => {});
  }, []);

  const updateTaskStatusRemote = useCallback((id, patch) => {
    if (typeof id === 'number') {
      updateTaskStatus(id, { status: patch.status, progress: patch.progress }).then((saved) => {
        setTasks((p) => p.map((t) => (t.id === id ? fromApiTask(saved) : t)));
      }).catch(() => {});
    }
    setTasks((p) => p.map((task) => {
      if (task.id !== id) return task;
      return {
        ...task,
        ...patch,
        progress: patch.status === 'Completed' ? 100 : (patch.progress ?? task.progress),
        completedAt: patch.status === 'Completed' ? (task.completedAt || new Date().toISOString()) : null,
      };
    }));
  }, []);

  const addAppointment = useCallback((data) => {
    const a = { id: uid('ap'), status: 'Scheduled', createdAt: new Date().toISOString(), ...data };
    setAppointments((p) => [...p, a]);
    createAppointmentApi(a)
      .then((saved) => setAppointments((p) => p.map((item) => (item.id === a.id ? fromApiAppointment(saved) : item))))
      .catch(() => {});
    return a;
  }, []);
  const updateAppointment = useCallback((id, patch) => {
    const existing = appointmentsRef.current.find((a) => a.id === id);
    if (!existing) return;
    const next = { ...existing, ...patch };
    setAppointments((p) => p.map((a) => (a.id === id ? next : a)));
    updateAppointmentApi(id, next)
      .then((saved) => setAppointments((p) => p.map((a) => (a.id === id ? fromApiAppointment(saved) : a))))
      .catch(() => {});
  }, []);
  const deleteAppointment = useCallback((id) => {
    setAppointments((p) => p.filter((a) => a.id !== id));
    deleteAppointmentApi(id).catch(() => {});
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  }, []);
  const deleteNotification = useCallback((id) => {
    setNotifications((p) => p.filter((n) => n.id !== id));
  }, []);
  const clearRead = useCallback(() => {
    setNotifications((p) => p.filter((n) => !n.read));
  }, []);

  // ---- Auto reminder scanner (every 30s) ----
  useEffect(() => {
    const scan = () => {
      const mk = (prefix, id, extra = '') => `${prefix}:${id}:${extra}`;
      // upcoming events within reminder window
      for (const ev of events) {
        if (ev.status === 'Cancelled' || ev.status === 'Completed') continue;
        const off = reminderOffsetMinutes(ev.reminder);
        if (off === null) continue;
        const mins = minutesUntil(ev.date, ev.startTime);
        if (mins >= -1 && mins <= off) {
          const key = mk('ev', ev.id, ev.date);
          if (!seenKeys.current.has(key)) {
            seenKeys.current.add(key);
            const label = mins <= 0 ? 'starting now' : `starts in ${mins} min`;
            notify('Upcoming event', `"${ev.title}" ${label}.`, 'reminder');
          }
        }
      }
      for (const t of tasks) {
        if (t.status === 'Completed' || t.status === 'Cancelled') continue;
        if (!t.dueDate) continue;
        const mins = minutesUntil(t.dueDate, t.startTime || '23:59');
        const off = reminderOffsetMinutes(t.reminder) ?? 60;
        if (mins >= -1 && mins <= off) {
          const key = mk('task', t.id, t.dueDate);
          if (!seenKeys.current.has(key)) {
            seenKeys.current.add(key);
            notify('Task due soon', `"${t.title}" is due ${mins <= 0 ? 'now' : `in ${mins} min`}.`, 'task');
          }
        }
        if (t.dueDate < todayISO()) {
          const key = mk('overdue', t.id, t.dueDate);
          if (!seenKeys.current.has(key)) {
            seenKeys.current.add(key);
            notify('Overdue task', `"${t.title}" was due on ${t.dueDate}.`, 'overdue');
          }
        }
      }
    };
    scan();
    const iv = setInterval(scan, 30000);
    return () => clearInterval(iv);
  }, [events, tasks, notify]);

  const importData = useCallback((payload) => {
    setEvents((p) => [...p, ...(payload.events || []).map((e) => ({ id: e.id || uid('ev'), ...e }))]);
    setTasks((p) => [...p, ...(payload.tasks || []).map((t) => ({ id: t.id || uid('t'), ...t }))]);
    setAppointments((p) => [...p, ...(payload.appointments || []).map((a) => ({ id: a.id || uid('ap'), ...a }))]);
  }, []);

  const resetAll = useCallback(() => {
    setEvents([]);
    setTasks([]);
    setAppointments([]);
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      events, tasks, appointments, notifications, theme, toasts, globalSearch,
      setTheme, setGlobalSearch, pushToast, notify,
      addEvent, updateEvent, deleteEvent,
      addTask, updateTask, updateTaskStatus: updateTaskStatusRemote, deleteTask,
      addAppointment, updateAppointment, deleteAppointment,
      markRead, markAllRead, deleteNotification, clearRead,
      importData, resetAll,
      unreadCount: notifications.filter((n) => !n.read).length,
      backendConnected,
    }),
    [events, tasks, appointments, notifications, theme, toasts, globalSearch, backendConnected, pushToast, notify, addEvent, updateEvent, deleteEvent, addTask, updateTask, updateTaskStatusRemote, deleteTask, addAppointment, updateAppointment, deleteAppointment, markRead, markAllRead, deleteNotification, clearRead, importData, resetAll]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
