import { useEffect, useState } from 'react';
import { FaCircle } from 'react-icons/fa';

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const STATUS_META = {
  up: { label: 'Up', dot: 'text-green-400', text: 'text-green-300', panel: 'border-green-400/20 bg-green-400/10' },
  loading: { label: 'Checking', dot: 'text-yellow-400', text: 'text-yellow-300', panel: 'border-yellow-400/20 bg-yellow-400/10' },
  down: { label: 'Down', dot: 'text-red-400', text: 'text-red-300', panel: 'border-red-400/20 bg-red-400/10' },
  unknown: { label: 'Unknown', dot: 'text-gray-400', text: 'text-gray-300', panel: 'border-gray-400/20 bg-gray-400/10' },
};

const normalizeDbStatus = (value) => {
  if (value === 'connected') return 'up';
  if (value === 'connecting' || value === 'disconnecting') return 'loading';
  if (value === 'disconnected') return 'down';
  return 'unknown';
};

export default function SystemStatusBadge() {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [status, setStatus] = useState({
    frontend: 'up',
    backend: 'loading',
    database: 'loading',
  });
  const [details, setDetails] = useState({
    backendMessage: 'Checking backend...',
    databaseHost: '',
    databaseName: '',
  });

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/health`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!active) return;

        setStatus({
          frontend: 'up',
          backend: res.ok ? 'up' : 'down',
          database: normalizeDbStatus(data?.database?.status),
        });
        setDetails({
          backendMessage: data?.message || 'Backend responded',
          databaseHost: data?.database?.host || '',
          databaseName: data?.database?.name || '',
        });
        setLastChecked(new Date());
      } catch {
        if (!active) return;
        setStatus({
          frontend: 'up',
          backend: 'down',
          database: 'unknown',
        });
        setDetails({
          backendMessage: 'Backend not reachable',
          databaseHost: '',
          databaseName: '',
        });
        setLastChecked(new Date());
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkHealth();
    const timer = setInterval(checkHealth, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const rows = [
    { key: 'frontend', label: 'Frontend', value: status.frontend },
    { key: 'backend', label: 'Backend', value: status.backend },
    { key: 'database', label: 'Database', value: status.database },
  ];

  const mainStatus = status.backend === 'up' && status.database === 'up' ? 'up' : status.backend === 'down' || status.database === 'down' ? 'down' : 'loading';
  const mainMeta = STATUS_META[mainStatus] || STATUS_META.unknown;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-full border px-2.5 py-2 text-xs font-semibold transition-all hover:scale-[1.02] ${mainMeta.panel} ${mainMeta.text}`}
        aria-label="System status"
      >
        <FaCircle className={`text-[9px] ${mainMeta.dot}`} />
        <span className="hidden sm:inline">System {checking ? 'Checking' : mainMeta.label}</span>
        <span className="sm:hidden">Sys</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gold/20 bg-[#17172c] p-4 shadow-2xl shadow-black/40 z-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-semibold">System Status</p>
              <p className="text-xs text-gray-400">Live frontend, backend, and database check</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gold transition-colors"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {rows.map((row) => {
              const meta = STATUS_META[row.value] || STATUS_META.unknown;
              return (
                <div key={row.key} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FaCircle className={`text-[8px] ${meta.dot}`} />
                    <span className="text-sm text-gray-300">{row.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${meta.text}`}>{meta.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 space-y-1 text-xs text-gray-400">
            <p>Backend: {details.backendMessage}</p>
            <p>
              DB: {details.databaseName || 'n/a'}
              {details.databaseHost ? ` on ${details.databaseHost}` : ''}
            </p>
            <p>Frontend is the page you are currently viewing.</p>
            {lastChecked && <p>Last checked: {lastChecked.toLocaleTimeString()}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
