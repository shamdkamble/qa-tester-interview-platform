import React, { useState } from 'react';
import {
  Key, Power, Award, Sliders, Trash2, FileText, Bug, LogOut, CheckCircle2, Library
} from 'lucide-react';
import ScorecardModal from './ScorecardModal';
import AdminReports from './AdminReports';
import { loadSubmissions } from '../utils/submissionsStore';
import { ADMIN_PIN } from '../config/auth';

export default function InterviewerDashboard({
  masterBugs,
  activeBugIds,
  onToggleBug,
  candidateBugs,
  onClearCandidateBugs,
  quizScore,
  candidateName,
  setCandidateName,
  preAuthenticated = false,
  onLogout
}) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(preAuthenticated);
  const [pinError, setPinError] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [filterApp, setFilterApp] = useState('all');
  const [dashTab, setDashTab] = useState('reports'); // default to reports so admin sees library first
  const [savedCount, setSavedCount] = useState(() => loadSubmissions().length);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 animate-scale-in">
        <div className="glass-panel-glow p-8 rounded-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center mx-auto">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Interviewer Control Suite</h2>
            <p className="text-xs text-secondary mt-1">Enter PIN to access bug toggles, reports library & scoring</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
            {pinError && (
              <div className="alert alert-error">
                Incorrect PIN. Please try again or contact the assessment administrator.
              </div>
            )}
            <input
              type="password"
              placeholder="Enter access PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="glass-input text-center font-mono text-base tracking-[0.2em]"
            />
            <button type="submit" className="btn btn-violet w-full py-3">
              Unlock Controls
            </button>
          </form>
        </div>
      </div>
    );
  }

  const apps = [
    { id: 'all', label: 'All' },
    { id: 'shop', label: 'ShopSphere' },
    { id: 'desk', label: 'DeskFlow' },
    { id: 'sky', label: 'SkyRoutes' },
    { id: 'task', label: 'TaskFlow' }
  ];

  const filteredBugs = filterApp === 'all'
    ? masterBugs
    : masterBugs.filter(b => b.appId === filterApp);

  const activeCount = activeBugIds.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="app-icon bg-gradient-to-br from-violet-600 to-indigo-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary flex flex-wrap items-center gap-2">
              Master Dashboard
              <span className="badge badge-low">
                <CheckCircle2 className="w-3 h-3" /> Authenticated
              </span>
            </h2>
            <p className="text-xs text-secondary">Reports library · Bug injection · Live session scoring</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dashTab === 'controls' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <label className="text-muted whitespace-nowrap">Live candidate</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="glass-input py-1.5 w-40 text-xs font-semibold"
                  placeholder="Name"
                />
              </div>
              <button type="button" onClick={() => setShowScorecard(true)} className="btn btn-success">
                <Award className="w-4 h-4" /> Live Scorecard
              </button>
            </>
          )}
          {onLogout && (
            <button type="button" onClick={onLogout} className="btn btn-ghost">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>
      </div>

      {/* Dashboard tabs */}
      <div className="nav-track w-full sm:w-auto">
        <button
          type="button"
          onClick={() => {
            setDashTab('reports');
            setSavedCount(loadSubmissions().length);
          }}
          className={`nav-pill ${dashTab === 'reports' ? 'active' : ''}`}
        >
          <Library className="w-3.5 h-3.5" />
          Candidate Reports
          {savedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/15 text-[10px] font-bold">{savedCount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setDashTab('controls')}
          className={`nav-pill ${dashTab === 'controls' ? 'active' : ''}`}
        >
          <Bug className="w-3.5 h-3.5" />
          Bug Controls & Live Session
        </button>
      </div>

      {dashTab === 'reports' ? (
        <AdminReports onRefreshNeeded={() => setSavedCount(loadSubmissions().length)} />
      ) : (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Bugs', value: activeCount, sub: `of ${masterBugs.length}` },
              { label: 'Live Logs', value: candidateBugs.length, sub: 'this session' },
              { label: 'Quiz Score', value: `${quizScore?.score ?? 0}/${quizScore?.total ?? 8}`, sub: 'theory' },
              { label: 'Saved Reports', value: savedCount, sub: 'in library' }
            ].map(s => (
              <div key={s.label} className="glass-panel rounded-xl p-3.5">
                <div className="text-[10px] text-muted uppercase tracking-wider">{s.label}</div>
                <div className="text-xl font-extrabold text-primary font-mono mt-0.5">{s.value}</div>
                <div className="text-[10px] text-secondary">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bug injector */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="section-label flex items-center gap-2">
                  <Bug className="w-3.5 h-3.5 text-violet-400" />
                  Intentional Bugs ({activeCount} active)
                </h3>
                <div className="nav-track">
                  {apps.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setFilterApp(a.id)}
                      className={`nav-pill ${filterApp === a.id ? 'active' : ''}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredBugs.map((bug) => {
                  const isEnabled = activeBugIds.includes(bug.id);
                  const sevClass =
                    bug.severity === 'Critical' ? 'badge-critical' :
                    bug.severity === 'High' ? 'badge-high' :
                    bug.severity === 'Medium' ? 'badge-medium' : 'badge-low';

                  return (
                    <div
                      key={bug.id}
                      className={`glass-panel p-4 rounded-xl transition ${
                        isEnabled
                          ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                          : 'opacity-55'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="badge badge-brand font-mono">{bug.appName}</span>
                            <span className={`badge ${sevClass}`}>{bug.severity}</span>
                            <span className="text-[11px] text-muted">{bug.category}</span>
                          </div>
                          <h4 className="font-bold text-primary text-sm leading-snug">{bug.title}</h4>
                          <p className="text-xs text-secondary leading-relaxed">{bug.description}</p>
                          <div className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 leading-relaxed">
                            <strong className="text-indigo-200">How to trigger:</strong> {bug.howToReproduce}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleBug(bug.id)}
                          className={`btn shrink-0 text-[11px] ${
                            isEnabled
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {isEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live session logs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="section-label flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Live Session Logs ({candidateBugs.length})
                </h3>
                {candidateBugs.length > 0 && (
                  <button type="button" onClick={onClearCandidateBugs} className="text-[11px] text-rose-400 hover:underline flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="glass-panel p-4 rounded-xl space-y-3 min-h-[400px]">
                {candidateBugs.length === 0 ? (
                  <div className="text-center py-16 text-muted text-xs space-y-2">
                    <Bug className="w-8 h-8 mx-auto opacity-30" />
                    <p>No live defects in this browser session.</p>
                    <p className="text-[11px] opacity-70">Submitted assessments appear under Candidate Reports.</p>
                  </div>
                ) : (
                  candidateBugs.map((bug) => (
                    <div key={bug.id} className="surface-muted rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-primary truncate">{bug.title}</span>
                        <span className="text-[10px] text-muted font-mono shrink-0">{bug.reportedAt}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="badge badge-brand">{String(bug.appId).toUpperCase()}</span>
                        <span className="badge badge-medium">{bug.severity}</span>
                      </div>
                      <p className="text-[11px] text-secondary line-clamp-2 leading-relaxed">
                        <strong className="text-primary">Steps:</strong> {bug.stepsToReproduce}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <ScorecardModal
        isOpen={showScorecard}
        onClose={() => setShowScorecard(false)}
        candidateReport={{ candidateName, reportedBugs: candidateBugs }}
        masterBugs={masterBugs.filter(b => activeBugIds.includes(b.id))}
        quizScore={quizScore}
      />
    </div>
  );
}
