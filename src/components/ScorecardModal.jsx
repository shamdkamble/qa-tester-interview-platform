import React from 'react';
import { Award, CheckCircle, X, Printer, Download, Star, ShieldCheck } from 'lucide-react';

export default function ScorecardModal({ isOpen, onClose, candidateReport, masterBugs, quizScore }) {
  if (!isOpen) return null;

  const candidateName = candidateReport?.candidateName || "Candidate Intern";
  const reportedBugs = candidateReport?.reportedBugs || [];
  const bugCoverage = Math.min(100, Math.round((reportedBugs.length / masterBugs.length) * 100));

  // Determine overall grade
  let grade = "B";
  let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  let recommendation = "RECOMMENDED FOR SECOND ROUND";

  if (bugCoverage >= 75 && (quizScore?.score || 0) >= 6) {
    grade = "S (Exceptional)";
    badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    recommendation = "HIGHLY RECOMMENDED - TOP CANDIDATE";
  } else if (bugCoverage >= 50) {
    grade = "A (Strong QA Skills)";
    badgeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
    recommendation = "RECOMMENDED FOR QA INTERNSHIP";
  } else if (bugCoverage < 30) {
    grade = "C / Needs Training";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
    recommendation = "DOES NOT MEET CURRENT QA INTERN BAR";
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl space-y-6 relative border border-emerald-500/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">{candidateName}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${badgeColor}`}>
                {grade}
              </span>
            </div>
            <p className="text-xs text-slate-400">QA Intern Technical Assessment Report Card • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-slate-400 block text-[10px]">BUGS DISCOVERED</span>
            <span className="text-xl font-extrabold text-emerald-400">{reportedBugs.length} / {masterBugs.length}</span>
            <span className="text-[10px] text-slate-500 block">({bugCoverage}% Coverage)</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-slate-400 block text-[10px]">THEORY QUIZ SCORE</span>
            <span className="text-xl font-extrabold text-cyan-400">{quizScore?.score || 0} / {quizScore?.total || 8}</span>
            <span className="text-[10px] text-slate-500 block">({Math.round(((quizScore?.score || 0) / (quizScore?.total || 8)) * 100)}% Knowledge)</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-slate-400 block text-[10px]">INTERVIEWER RECOMMENDATION</span>
            <span className="text-xs font-extrabold text-amber-300 block py-1">{recommendation}</span>
          </div>
        </div>

        {/* Detailed Reported Bugs List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Logged Defects Details</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {reportedBugs.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-900/50 rounded-lg">No bugs logged during this assessment session.</p>
            ) : (
              reportedBugs.map((bug, idx) => (
                <div key={idx} className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{bug.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {bug.severity} • {bug.category}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    <strong className="text-slate-300">Expected:</strong> {bug.expectedBehavior} | <strong className="text-rose-300">Actual:</strong> {bug.actualBehavior}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evaluation Rubric Breakdown */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-2">
          <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Interviewer Assessment Notes & Feedback
          </h4>
          <p className="text-slate-400 text-[11px]">
            Candidate displayed strong observation skills across boundary value testing and form validation scenarios. Bug reports included clear reproduction steps and expected vs actual behavior.
          </p>
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" /> Print / Export Scorecard PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
          >
            Close Report Card
          </button>
        </div>
      </div>
    </div>
  );
}
