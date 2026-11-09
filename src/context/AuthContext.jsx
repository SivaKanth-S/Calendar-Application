import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const USERS_KEY = 'cal-auth-users';
const SESSION_KEY = 'cal-auth-session';

const DEMO_ACCOUNT = {
  id: 'user-demo',
  name: 'Demo User',
  email: 'demo@planwise.app',
  password: 'demo1234',
};

let demoSeedPromise = null;

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // storage unavailable or full — keep the session in memory
  }
}

function readSession() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const raw = storage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore malformed or blocked storage
    }
  }
  return null;
}

function persistSession(user, remember) {
  try {
    const target = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    other.removeItem(SESSION_KEY);
    target.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // ignore storage failures; the in-memory session still works
  }
}

function clearSession() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      storage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }
}

function makeSalt() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function hashPassword(password, salt) {
  const input = `${salt}:${password}`;
  if (globalThis.crypto?.subtle) {
    try {
      const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    } catch {
      // fall through to the non-crypto fallback
    }
  }
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`;
}

function ensureDemoAccount() {
  if (!demoSeedPromise) {
    demoSeedPromise = (async () => {
      const users = readUsers();
      if (users.some((user) => user.email === DEMO_ACCOUNT.email)) return;
      const salt = makeSalt();
      const passwordHash = await hashPassword(DEMO_ACCOUNT.password, salt);
      const latest = readUsers();
      if (latest.some((user) => user.email === DEMO_ACCOUNT.email)) return;
      latest.push({
        id: DEMO_ACCOUNT.id,
        name: DEMO_ACCOUNT.name,
        email: DEMO_ACCOUNT.email,
        salt,
        passwordHash,
        createdAt: new Date().toISOString(),
      });
      writeUsers(latest);
    })().catch(() => {
      demoSeedPromise = null;
    });
  }
  return demoSeedPromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());

  const login = useCallback(async (email, password, remember = true) => {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized || !password) throw new Error('Enter your email and password.');
    await ensureDemoAccount();
    const account = readUsers().find((item) => item.email === normalized);
    if (!account) throw new Error('No account found for that email. Try the demo account.');
    const passwordHash = await hashPassword(password, account.salt);
    if (passwordHash !== account.passwordHash) throw new Error('Incorrect password. Please try again.');
    const session = { id: account.id, name: account.name, email: account.email };
    persistSession(session, remember);
    setUser(session);
    return session;
  }, []);

  const register = useCallback(async (name, email, password, remember = true) => {
    const normalized = String(email || '').trim().toLowerCase();
    const displayName = String(name || '').trim();
    if (!displayName || !normalized || !password) throw new Error('Fill in all fields to create an account.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    await ensureDemoAccount();
    const users = readUsers();
    if (users.some((item) => item.email === normalized)) throw new Error('An account with that email already exists.');
    const salt = makeSalt();
    const passwordHash = await hashPassword(password, salt);
    const account = {
      id: `user-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
      name: displayName,
      email: normalized,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    writeUsers([...users, account]);
    const session = { id: account.id, name: account.name, email: account.email };
    persistSession(session, remember);
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
