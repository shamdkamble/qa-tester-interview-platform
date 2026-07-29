import React, { useMemo, useState, useRef } from 'react';
import {
  FileText, Trash2, Download, Upload, Search, Award,
  User, Mail, Calendar, ChevronRight, AlertTriangle, Bug
} from 'lucide-react';
import ScorecardModal from './ScorecardModal';
import {
  loadSubmissions,
  deleteSubmission,
  clearAllSubmissions,
  exportSubmissionsJson,
  importSubmissionsJson
} from '../utils/submissionsStore';

export default function AdminReports({ onRefreshNeeded }) {
  const [submissions, setSubmissions] = useState(() => loadSubmissions());
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [showScorecard, setShowScorecard] = useState(false);
  const fileRef = useRef(null);

  const refresh = () => {
    setSubmissions(loadSubmissions());
    onRefreshNeeded?.();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) => {
      const blob = `${s.candidateName} ${s.candidateEmail} ${s.scoring?.grade} ${s.scoring?.recommendation}`.toLowerCase();
      return blob.includes(q);
    });
  }, [submissions, query]);

  const handleDelete = (id) => {
    if (!confirm('Delete this candidate report permanently?')) return;
    setSubmissions(deleteSubmission(id));
    if (selected?.id === id) setSelected(null);
  };

  const handleClearAll = () => {
    if (!confirm('Delete ALL saved candidate reports? This cannot be undone.')) return;
    setSubmissions(clearAllSubmissions());
    setSelected(null);
  };

  const handleExport = () => {
    const json = exportSubmissionsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bughunt-reports-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const next = importSubmissionsJson(text, { merge: true });
      setSubmissions(next);
      alert(`Imported successfully. ${next.length} total report(s) on file.`);
    } catch {
      alert('Could not import file. Check that it is a valid BugHunt export.');
    }
    e.target.value = '';
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Candidate Reports Library
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Saved when candidates submit. Stored in this browser — export JSON to share across devices.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleExport} className="btn btn-ghost" disabled={submissions.length === 0}>
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
          {submissions.length > 0 && (
            <button type="button" onClick={handleClearAll} className="btn btn-ghost text-rose-400">
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
          <button type="button" onClick={refresh} className="btn btn-outline">Refresh</button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search by name, email, grade…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass-input pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
          <Bug className="w-10 h-10 mx-auto text-muted opacity-40" />
          <p className="text-sm font-semibold text-primary">No saved reports yet</p>
          <p className="text-xs text-secondary max-w-md mx-auto leading-relaxed">
            When a candidate finishes (Submit Test or timer ends), their scorecard is stored here automatically
            for interviewer review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {filtered.map((s) => {
              const active = selected?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s)}
                  className={`w-full text-left glass-panel p-3.5 rounded-xl transition ${
                    active ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10' : 'hover:border-indigo-500/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-primary truncate">{s.candidateName}</div>
                      <div className="text-[11px] text-muted font-mono truncate">{s.candidateEmail || '—'}</div>
                    </div>
                    <span className={`badge shrink-0 ${s.scoring?.badgeClass || 'badge-brand'}`}>
                      {s.scoring?.composite ?? '—'}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
                    <span className="truncate">{s.scoring?.grade || 'Ungraded'}</span>
                    <span className="font-mono shrink-0">{formatDate(s.submittedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="glass-panel rounded-2xl p-10 text-center text-xs text-muted h-full flex flex-col items-center justify-center gap-2 min-h-[280px]">
                <ChevronRight className="w-6 h-6 opacity-40" />
                Select a report to inspect details
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      {selected.candidateName}
                    </h4>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {selected.candidateEmail || '—'}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> {formatDate(selected.submittedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowScorecard(true)}
                      className="btn btn-success"
                    >
                      <Award className="w-3.5 h-3.5" /> Full Scorecard
                    </button>
                    <button type="button" onClick={() => handleDelete(selected.id)} className="btn btn-ghost text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Score strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Composite', value: `${selected.scoring?.composite ?? 0}%` },
                    { label: 'Bug Hunt', value: `${selected.scoring?.bugHuntPct ?? 0}%` },
                    { label: 'Quiz', value: `${selected.scoring?.quizCorrect ?? 0}/${selected.scoring?.quizTotal ?? 8}` },
                    { label: 'Matched', value: `${selected.scoring?.uniqueMatched ?? 0}/${selected.scoring?.totalActive ?? 0}` }
                  ].map((m) => (
                    <div key={m.label} className="surface-muted rounded-xl p-3 text-center">
                      <div className="text-[10px] text-muted uppercase tracking-wider">{m.label}</div>
                      <div className="text-lg font-extrabold font-mono text-primary mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${selected.scoring?.badgeClass || 'badge-brand'}`}>
                    {selected.scoring?.grade}
                  </span>
                  <span className="text-xs text-secondary">{selected.scoring?.recommendation}</span>
                </div>

                {/* Severity tiers */}
                <div>
                  <h5 className="section-label mb-2">Findings by Impact Tier</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'Critical', cls: 'badge-critical', pts: selected.scoring?.tierPoints?.Critical },
                      { key: 'Mid', cls: 'badge-high', pts: selected.scoring?.tierPoints?.Mid },
                      { key: 'Low', cls: 'badge-low', pts: selected.scoring?.tierPoints?.Low }
                    ].map((t) => (
                      <div key={t.key} className="surface-muted rounded-xl p-3 text-center">
                        <span className={`badge ${t.cls}`}>{t.key}</span>
                        <div className="text-xl font-extrabold font-mono text-primary mt-2">
                          {selected.scoring?.tierCounts?.[t.key] ?? 0}
                        </div>
                        <div className="text-[10px] text-muted">
                          of {selected.scoring?.tierAvailable?.[t.key] ?? 0} · {Number(t.pts || 0).toFixed(1)} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reports list */}
                <div>
                  <h5 className="section-label mb-2">
                    Logged Defects ({selected.reportedBugs?.length || 0})
                  </h5>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(selected.reportedBugs || []).length === 0 ? (
                      <p className="text-xs text-muted italic p-3 surface-muted rounded-lg">No defects logged.</p>
                    ) : (
                      selected.reportedBugs.map((bug, idx) => (
                        <div key={bug.id || idx} className="surface-muted rounded-xl p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-primary truncate">{bug.title}</span>
                            <span className="badge badge-brand shrink-0">{bug.severity}</span>
                          </div>
                          <div className="text-[10px] text-muted font-mono">
                            {String(bug.appId || '').toUpperCase()} · {bug.bugId || '—'}
                          </div>
                          <p className="text-[11px] text-secondary line-clamp-2">
                            <strong>Steps:</strong> {bug.stepsToReproduce}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selected.timeLeft != null && (
                  <div className="alert alert-info text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Time remaining at submit: {Math.floor((selected.timeLeft || 0) / 60)}m {(selected.timeLeft || 0) % 60}s
                    {selected.durationSeconds != null && (
                      <span className="ml-1">· Session length target: {Math.round(selected.durationSeconds / 60)} min</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {selected && (
        <ScorecardModal
          isOpen={showScorecard}
          onClose={() => setShowScorecard(false)}
          candidateReport={{
            candidateName: selected.candidateName,
            candidateEmail: selected.candidateEmail,
            reportedBugs: selected.reportedBugs || []
          }}
          masterBugs={selected.activeMasterBugs || []}
          quizScore={selected.quizScore || { score: 0, total: 8 }}
          precomputedScoring={selected.scoring}
        />
      )}
    </div>
  );
}
