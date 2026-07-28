import React, { useState } from 'react';
import { Terminal, Trash2, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

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
      case 'error': return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'network': return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
      default: return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 shadow-2xl backdrop-blur-md transition-all duration-300">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            Mock DevTools Console & Network Logs
          </span>
          <div className="flex items-center gap-2 text-xs font-mono">
            {errorCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
              </span>
            )}
            {warnCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {warnCount} Warnings
              </span>
            )}
            <span className="text-slate-500 text-[11px]">({logs.length} total events)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {isOpen ? 'Click to collapse' : 'Click to inspect console logs'}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Console Window */}
      {isOpen && (
        <div className="h-56 p-3 flex flex-col border-t border-slate-800/80 font-mono text-xs">
          {/* Controls */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                All ({logs.length})
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${filter === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                Errors ({errorCount})
              </button>
              <button
                onClick={() => setFilter('network')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${filter === 'network' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                Network Calls
              </button>
            </div>

            <button
              onClick={onClearLogs}
              className="px-2 py-1 flex items-center gap-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition text-[11px]"
              title="Clear Console"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 italic text-center py-6">No console output recorded yet. Interact with the application to generate logs.</div>
            ) : (
              filteredLogs.map((log, idx) => (
                <div 
                  key={idx}
                  className={`p-2 rounded flex items-start gap-2 border ${
                    log.type === 'error' 
                      ? 'bg-rose-950/40 border-rose-800/40 text-rose-200'
                      : log.type === 'warn'
                      ? 'bg-amber-950/40 border-amber-800/40 text-amber-200'
                      : log.type === 'network'
                      ? 'bg-cyan-950/40 border-cyan-800/40 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  {getLogIcon(log.type)}
                  <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
                  <span className="font-semibold shrink-0 text-[11px]">[{log.source}]:</span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
