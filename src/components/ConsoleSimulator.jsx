import React, { useState } from 'react';
import {
  Terminal, Trash2, ChevronUp, ChevronDown,
  CheckCircle, AlertTriangle, XCircle, Info
} from 'lucide-react';

export default function ConsoleSimulator({ logs, onClearLogs }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    if (filter === 'error') return log.type === 'error';
    if (filter === 'warn') return log.type === 'warn';
    if (filter === 'network') return log.type === 'network';
    return true;
  });

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      case 'warn': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'network': return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
      default: return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
    }
  };

  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] backdrop-blur-xl shadow-[0_-8px_40px_-12px_var(--shadow-color)]">
      {/* Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-[var(--bg-muted)] transition text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-secondary uppercase truncate">
            DevTools Console
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {errorCount > 0 && (
              <span className="badge badge-critical">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {errorCount}
              </span>
            )}
            {warnCount > 0 && (
              <span className="badge badge-high">{warnCount} warn</span>
            )}
            <span className="text-muted hidden sm:inline">({logs.length} events)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted hidden sm:inline">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen
            ? <ChevronDown className="w-4 h-4 text-muted" />
            : <ChevronUp className="w-4 h-4 text-muted" />}
        </div>
      </button>

      {isOpen && (
        <div className="h-56 px-3 pb-3 flex flex-col border-t border-[var(--border)] font-mono text-xs">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `All (${logs.length})`, active: 'bg-indigo-600 text-white' },
                { id: 'error', label: `Errors (${errorCount})`, active: 'bg-rose-600 text-white' },
                { id: 'network', label: 'Network', active: 'bg-cyan-600 text-white' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFilter(f.id); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    filter === f.id
                      ? f.active
                      : 'bg-[var(--bg-muted)] text-secondary hover:text-primary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClearLogs(); }}
              className="btn btn-ghost py-1 px-2 text-[11px]"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1">
            {filteredLogs.length === 0 ? (
              <div className="text-muted italic text-center py-8 text-[11px]">
                No console output yet. Interact with the sandboxes to generate logs.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg flex items-start gap-2 border text-[11px] ${
                    log.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                      : log.type === 'warn'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                        : log.type === 'network'
                          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'
                          : 'bg-[var(--bg-muted)] border-[var(--border)] text-secondary'
                  }`}
                >
                  {getLogIcon(log.type)}
                  <span className="text-muted shrink-0">{log.timestamp}</span>
                  <span className="font-semibold shrink-0 opacity-80">[{log.source}]</span>
                  <span className="break-all leading-relaxed">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
