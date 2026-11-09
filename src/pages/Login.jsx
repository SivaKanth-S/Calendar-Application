import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { user, login, register } = useAuth();
  const { theme, setTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setShowPassword(false);
    setForm((current) => ({ ...current, password: '', confirm: '' }));
  };

  const useDemoAccount = () => {
    setMode('login');
    setError('');
    setForm({ name: '', email: 'demo@planwise.app', password: 'demo1234', confirm: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setError('Enter your email and password.');
      return;
    }
    if (mode === 'register') {
      if (form.name.trim().length < 2) {
        setError('Enter your name (at least 2 characters).');
        return;
      }
      if (!EMAIL_PATTERN.test(email)) {
        setError('Enter a valid email address.');
        return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        await register(form.name.trim(), email, form.password, remember);
      } else {
        await login(email, form.password, remember);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <button
        type="button"
        className="btn sm login-theme"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>

      <section className="login-hero">
        <div className="brand login-brand">
          <span className="brand-mark" aria-hidden="true">◑</span>
          <div>
            <div className="brand-name">PlanWise</div>
            <div className="brand-sub">Scheduler</div>
          </div>
        </div>

        <div className="login-hero-body">
          <span className="login-eyebrow">Your day, organized</span>
          <h1>Plan with clarity.<br />Make room for what matters.</h1>
          <p>Events, tasks and appointments in one calm workspace, so you always know what comes next.</p>
          <ul className="login-features">
            <li>
              <span className="login-check" aria-hidden="true">✓</span>
              <div>
                <strong>One shared calendar</strong>
                <span>See events, tasks and appointments side by side.</span>
              </div>
            </li>
            <li>
              <span className="login-check" aria-hidden="true">✓</span>
              <div>
                <strong>Gentle reminders</strong>
                <span>Get nudged before something is due, not after.</span>
              </div>
            </li>
            <li>
              <span className="login-check" aria-hidden="true">✓</span>
              <div>
                <strong>Insights that help</strong>
                <span>Understand where your time actually goes.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="login-hero-foot">PlanWise Scheduler — a calmer way to plan your week.</div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="brand login-mobile-brand">
            <span className="brand-mark" aria-hidden="true">◑</span>
            <div>
              <div className="brand-name">PlanWise</div>
              <div className="brand-sub">Scheduler</div>
            </div>
          </div>

          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="muted">
            {mode === 'login'
              ? 'Sign in to pick up where you left off.'
              : 'Start planning your days in a few seconds.'}
          </p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="login-error" role="alert">{error}</div>}

            {mode === 'register' && (
              <label className="login-field">
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={setField('name')}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  autoFocus
                />
              </label>
            )}

            <label className="login-field">
              Email
              <input
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus={mode === 'login'}
              />
            </label>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <span className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  placeholder="Enter your password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </div>

            {mode === 'register' && (
              <label className="login-field">
                Confirm password
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={setField('confirm')}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </label>
            )}

            <div className="login-row">
              <label className="check login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Remember me
              </label>
            </div>

            <button type="submit" className="btn primary login-submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="login-demo">
            <div>
              <strong>Demo account</strong>
              <span>demo@planwise.app · demo1234</span>
            </div>
            <button type="button" className="btn sm" onClick={useDemoAccount}>Use demo</button>
          </div>

          <p className="login-switch">
            {mode === 'login' ? (
              <>New to PlanWise? <button type="button" onClick={() => switchMode('register')}>Create an account</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => switchMode('login')}>Sign in</button></>
            )}
          </p>

          <p className="login-note">Accounts are stored locally in this browser for the demo.</p>
        </div>
      </section>
    </div>
  );
}
