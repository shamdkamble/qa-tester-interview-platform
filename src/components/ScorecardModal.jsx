import React, { useMemo } from 'react';
import { Award, X, Printer, ShieldCheck, Target, BookOpen, CheckCircle2, Circle } from 'lucide-react';

export default function ScorecardModal({ isOpen, onClose, candidateReport, masterBugs, quizScore }) {
  const candidateName = candidateReport?.candidateName || 'Candidate Intern';
  const reportedBugs = candidateReport?.reportedBugs || [];
  const activeMaster = masterBugs || [];

  const scoring = useMemo(() => {
    const matchedIds = new Set();
    reportedBugs.forEach(rb => {
      if (rb.bugId && rb.bugId !== 'other' && activeMaster.some(m => m.id === rb.bugId)) {
        matchedIds.add(rb.bugId);
      }
    });

    const uniqueMatched = matchedIds.size;
    const totalActive = Math.max(activeMaster.length, 1);
    const coverage = Math.min(100, Math.round((uniqueMatched / totalActive) * 100));
    const quizPct = Math.round(((quizScore?.score || 0) / (quizScore?.total || 8)) * 100);
    // Weighted composite: 70% bug hunt, 30% theory
    const composite = Math.round(coverage * 0.7 + quizPct * 0.3);

    let grade = 'B';
    let badgeClass = 'badge-high';
    let recommendation = 'RECOMMENDED FOR SECOND ROUND';

    if (composite >= 80 && (quizScore?.score || 0) >= 6) {
      grade = 'S — Exceptional';
      badgeClass = 'badge-low';
      recommendation = 'HIGHLY RECOMMENDED — TOP CANDIDATE';
    } else if (composite >= 60) {
      grade = 'A — Strong QA Skills';
      badgeClass = 'badge-brand';
      recommendation = 'RECOMMENDED FOR QA INTERNSHIP';
    } else if (composite < 35) {
      grade = 'C — Needs Training';
      badgeClass = 'badge-critical';
      recommendation = 'DOES NOT MEET CURRENT QA INTERN BAR';
    }

    return { uniqueMatched, coverage, quizPct, composite, grade, badgeClass, recommendation, matchedIds };
  }, [reportedBugs, activeMaster, quizScore]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel max-w-2xl glass-panel p-6 space-y-6 relative border border-emerald-500/25">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 btn-icon print:hidden" aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-10 pb-4 border-b border-[var(--border)]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-primary truncate">{candidateName}</h2>
              <span className={`badge ${scoring.badgeClass}`}>{scoring.grade}</span>
            </div>
            <p className="text-xs text-secondary mt-1">
              QA Intern Technical Assessment · {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="surface-muted rounded-xl p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted uppercase tracking-wider">
              <Target className="w-3 h-3" /> Bugs Matched
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {scoring.uniqueMatched}
              <span className="text-sm text-muted font-semibold"> / {activeMaster.length}</span>
            </div>
            <div className="text-[10px] text-muted">{scoring.coverage}% coverage</div>
            <div className="progress-track mt-2">
              <div className="progress-fill" style={{ width: `${scoring.coverage}%` }} />
            </div>
          </div>

          <div className="surface-muted rounded-xl p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted uppercase tracking-wider">
              <BookOpen className="w-3 h-3" /> Theory Quiz
            </div>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono">
              {quizScore?.score || 0}
              <span className="text-sm text-muted font-semibold"> / {quizScore?.total || 8}</span>
            </div>
            <div className="text-[10px] text-muted">{scoring.quizPct}% knowledge</div>
            <div className="progress-track mt-2">
              <div className="progress-fill" style={{ width: `${scoring.quizPct}%`, background: 'linear-gradient(90deg,#06b6d4,#22d3ee)' }} />
            </div>
          </div>

          <div className="surface-muted rounded-xl p-4 text-center space-y-1">
            <div className="text-[10px] text-muted uppercase tracking-wider">Composite Score</div>
            <div className="text-2xl font-extrabold text-amber-300 font-mono">{scoring.composite}%</div>
            <div className="text-[10px] text-amber-200/80 font-semibold leading-snug pt-1">
              {scoring.recommendation}
            </div>
          </div>
        </div>

        {/* Master bug checklist */}
        <div className="space-y-3">
          <h3 className="section-label">Intentional Defect Coverage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {activeMaster.map(bug => {
              const found = scoring.matchedIds.has(bug.id);
              return (
                <div
                  key={bug.id}
                  className={`flex items-start gap-2 p-2.5 rounded-lg text-[11px] border ${
                    found
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-[var(--bg-muted)] border-[var(--border)] text-muted'
                  }`}
                >
                  {found
                    ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    : <Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" />}
                  <span className="leading-snug">{bug.featureArea}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logged defects */}
        <div className="space-y-3">
          <h3 className="section-label">
            Candidate Reports ({reportedBugs.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {reportedBugs.length === 0 ? (
              <p className="text-xs text-muted italic p-3 surface-muted rounded-lg">
                No defects logged during this session.
              </p>
            ) : (
              reportedBugs.map((bug, idx) => (
                <div key={bug.id || idx} className="surface-muted rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-primary truncate">{bug.title}</span>
                    <span className="badge badge-brand shrink-0">{bug.severity}</span>
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed">
                    <strong className="text-primary">Expected:</strong> {bug.expectedBehavior}
                    {' · '}
                    <strong className="text-rose-400">Actual:</strong> {bug.actualBehavior}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="surface-muted rounded-xl p-4 text-xs space-y-2">
          <h4 className="font-bold text-primary flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Scoring Notes
          </h4>
          <p className="text-secondary text-[11px] leading-relaxed">
            Score weights bug-area matches (70%) and theory quiz (30%). Matching uses the feature-area mapping
            selected when logging defects — not free-text title similarity. Custom “Other” reports count toward volume
            but not intentional-bug coverage.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] print:hidden">
          <button type="button" onClick={() => window.print()} className="btn btn-ghost">
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
          <button type="button" onClick={onClose} className="btn btn-primary px-6">
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
