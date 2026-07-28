import React, { useState } from 'react';
import { Shield, Key, CheckCircle, XCircle, Power, Eye, Award, Sliders, Trash2, FileText, Bug } from 'lucide-react';
import ScorecardModal from './ScorecardModal';

export default function InterviewerDashboard({ 
  masterBugs, 
  activeBugIds, 
  onToggleBug, 
  candidateBugs, 
  onClearCandidateBugs, 
  quizScore,
  candidateName,
  setCandidateName
}) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // If not unlocked yet
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="glass-panel-glow p-8 rounded-2xl space-y-6 text-center border border-indigo-500/40 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Interviewer Control Suite</h2>
            <p className="text-xs text-slate-400 mt-1">Enter PIN to access master bug toggles & candidate scoring</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 text-xs">
            {pinError && (
              <p className="p-2 bg-rose-950/60 text-rose-300 border border-rose-800 rounded text-xs">
                Incorrect PIN. (Default PIN: <strong className="font-mono text-white">1234</strong>)
              </p>
            )}

            <div>
              <input
                type="password"
                placeholder="Enter Access PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-3 glass-input rounded-xl text-center font-mono text-base tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              Unlock Interviewer Controls
            </button>
          </form>

          <p className="text-[11px] text-slate-500 italic">
            Default PIN is 1234 for quick access during interviews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Interviewer Master Dashboard
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                AUTHENTICATED
              </span>
            </h2>
            <p className="text-xs text-slate-400">Inject/remove intentional bugs in real-time & evaluate candidate defect reports</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400">Candidate Name:</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="p-1.5 glass-input rounded-lg text-xs font-semibold w-40"
              placeholder="Candidate Name"
            />
          </div>

          <button
            onClick={() => setShowScorecard(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Award className="w-4 h-4" /> Generate Final Scorecard
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master Bug Injector (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bug className="w-4 h-4 text-violet-400" /> Master Intentional Bugs ({activeBugIds.length} Active)
            </h3>
            <span className="text-xs text-slate-500">Toggle switch to inject or fix bugs on the fly</span>
          </div>

          <div className="space-y-3">
            {masterBugs.map((bug) => {
              const isEnabled = activeBugIds.includes(bug.id);

              return (
                <div 
                  key={bug.id} 
                  className={`p-4 rounded-xl border transition ${
                    isEnabled 
                      ? 'bg-slate-900/80 border-indigo-500/40 shadow-md shadow-indigo-950/40' 
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {bug.appName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          bug.severity === 'Critical' ? 'badge-critical' :
                          bug.severity === 'High' ? 'badge-high' :
                          bug.severity === 'Medium' ? 'badge-medium' : 'badge-low'
                        }`}>
                          {bug.severity}
                        </span>
                        <span className="text-[11px] text-slate-400">{bug.category}</span>
                      </div>

                      <h4 className="font-bold text-slate-200 text-sm">{bug.title}</h4>
                      <p className="text-xs text-slate-400">{bug.description}</p>

                      <div className="pt-2 text-[11px] font-mono text-indigo-300 bg-indigo-950/30 p-2 rounded border border-indigo-900/40">
                        <strong>💡 How Candidate Triggers:</strong> {bug.howToReproduce}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleBug(bug.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition ${
                        isEnabled 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {isEnabled ? 'INJECTED (ON)' : 'DISABLED (OFF)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Reported Bugs Review Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Logged Bugs ({candidateBugs.length})
            </h3>
            {candidateBugs.length > 0 && (
              <button
                onClick={onClearCandidateBugs}
                className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Session
              </button>
            )}
          </div>

          <div className="glass-panel p-4 rounded-xl space-y-3 min-h-[400px]">
            {candidateBugs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs italic space-y-2">
                <Bug className="w-8 h-8 mx-auto opacity-30" />
                <p>No defects logged by candidate yet.</p>
                <p className="text-[11px] text-slate-600">Reports logged via "Report Defect" button will appear here in real-time.</p>
              </div>
            ) : (
              candidateBugs.map((bug) => (
                <div key={bug.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{bug.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{bug.reportedAt}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{bug.appId.toUpperCase()}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px]">{bug.severity}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    <strong className="text-slate-300">Steps:</strong> {bug.stepsToReproduce}
                  </p>

                  <div className="pt-1 text-[10px] text-emerald-400 border-t border-slate-800 flex justify-between">
                    <span>Expected: {bug.expectedBehavior}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Scorecard Modal */}
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
