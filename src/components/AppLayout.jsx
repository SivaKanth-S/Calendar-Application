import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import EventModal from './EventModal';
import TaskModal from './TaskModal';
import AppointmentModal from './AppointmentModal';
import { Toasts } from './ui';
import { useApp } from '../context/AppContext';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'event' | 'task' | 'appt'
  const searchRef = useRef(null);
  const { toasts } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleShortcut = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || event.target?.isContentEditable;
      if (event.key === 'Escape') {
        setModal(null);
        return;
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'n') setModal('event');
      if (key === 't') navigate('/today');
      if (key === 'c') navigate('/calendar');
      if (key === 'k') navigate('/tasks');
      if (key === 'd') navigate('/');
      if (key === 'a') navigate('/analytics');
      if (key === 's') navigate('/settings');
      if (event.key === '/' && searchRef.current) {
        event.preventDefault();
        searchRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [navigate]);

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        <Header
          onMenu={() => setMenuOpen((v) => !v)}
          onNew={() => setModal('event')}
          searchInputRef={searchRef}
        />
        <div className="content" key={location.pathname}>
          <Outlet context={{ openModal: setModal }} />
        </div>
      </div>
      {modal === 'event' && <EventModal onClose={() => setModal(null)} />}
      {modal === 'task' && <TaskModal onClose={() => setModal(null)} />}
      {modal === 'appt' && <AppointmentModal onClose={() => setModal(null)} />}
      <Toasts toasts={toasts} />
      {/* hidden hook for keyboard shortcuts */}
      <span data-search-ref style={{ display: 'none' }} />
    </div>
  );
}
