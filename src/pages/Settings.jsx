import { useApp } from '../context/AppContext';
import { validateImport } from '../services/storage';

export default function Settings() {
  const { theme, setTheme, events, tasks, appointments, importData, resetAll, pushToast } = useApp();

  const exportData = () => {
    const data = { events, tasks, appointments, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('Data exported successfully ✓');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target.result);
        const validated = validateImport(payload);
        importData(validated);
        pushToast('Data imported successfully ✓');
      } catch (err) {
        alert('Error importing data: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      resetAll();
      pushToast('All data cleared');
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="muted">Preferences and data management.</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <h3>Appearance</h3>
          <div className="setting-row">
            <div>
              <strong>Theme</strong>
              <p className="muted small">Switch between light and dark mode.</p>
            </div>
            <div className="segmented-control">
              <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button>
              <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
            </div>
          </div>
        </section>

        <section className="panel">
          <h3>Data Management</h3>
          <div className="setting-row">
            <div>
              <strong>Export Data</strong>
              <p className="muted small">Download your events, tasks, and appointments as JSON.</p>
            </div>
            <button className="btn" onClick={exportData}>Export JSON</button>
          </div>
          <div className="setting-row">
            <div>
              <strong>Import Data</strong>
              <p className="muted small">Upload a previously exported JSON file.</p>
            </div>
            <label className="btn btn-file">
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="setting-row">
            <div>
              <strong>Reset Application</strong>
              <p className="muted small text-danger">Wipe all stored data and start fresh.</p>
            </div>
            <button className="btn danger" onClick={handleReset}>Clear All Data</button>
          </div>
        </section>

        
      </div>
    </div>
  );
}
