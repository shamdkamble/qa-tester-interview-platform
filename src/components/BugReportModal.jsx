import React, { useState, useEffect } from 'react';
import { Bug, X, Send, CheckCircle2 } from 'lucide-react';
import { MASTER_BUGS } from '../data/masterBugsList';

const EMPTY_FORM = {
  title: '',
  appId: 'shop',
  bugId: '',
  category: 'Functional',
  severity: 'Medium',
  stepsToReproduce: '',
  expectedBehavior: '',
  actualBehavior: '',
  candidateNotes: ''
};

export default function BugReportModal({ isOpen, onClose, onSubmitBug, currentApp }) {
  const [bugData, setBugData] = useState({ ...EMPTY_FORM, appId: currentApp || 'shop' });
  const [submitted, setSubmitted] = useState(false);

  // Sync app when modal opens
  useEffect(() => {
    if (isOpen) {
      setBugData(prev => ({
        ...prev,
        appId: currentApp && currentApp !== 'quiz' ? currentApp : prev.appId || 'shop',
        bugId: '',
        title: prev.title
      }));
      setSubmitted(false);
    }
  }, [isOpen, currentApp]);

  if (!isOpen) return null;

  const availableBugs = MASTER_BUGS.filter(bug => bug.appId === bugData.appId);

  const handleAppChange = (appId) => {
    setBugData(prev => ({
      ...prev,
      appId,
      bugId: '',
      title: '',
      category: 'Functional',
      severity: 'Medium'
    }));
  };

  const handleBugSelection = (bugId) => {
    setBugData(prev => ({
      ...prev,
      bugId,
      title: prev.title,
      category: 'Functional',
      severity: 'Medium'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bugData.bugId) return;

    onSubmitBug({
      ...bugData,
      id: Date.now(),
      reportedAt: new Date().toLocaleTimeString()
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setBugData({ ...EMPTY_FORM, appId: currentApp || 'shop' });
    }, 1100);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="bug-report-title">
      <div className="modal-panel max-w-xl glass-panel-glow p-6 space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 btn-icon"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center justify-center shrink-0">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h3 id="bug-report-title" className="text-lg font-bold text-primary">Log Defect Report</h3>
            <p className="text-xs text-secondary">Describe the issue and map it to a feature area for scoring</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-14 text-center space-y-3 animate-scale-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-primary">Defect Logged</h4>
            <p className="text-xs text-secondary">Saved and queued for automatic scoring.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Affected Application *</label>
                <select
                  value={bugData.appId}
                  onChange={(e) => handleAppChange(e.target.value)}
                  className="glass-input"
                >
                  <option value="shop">ShopSphere Store</option>
                  <option value="desk">DeskFlow User Portal</option>
                  <option value="sky">SkyRoutes Flight Booking</option>
                  <option value="task">TaskFlow Messaging Sandbox</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Suspected Feature Area *</label>
                <select
                  value={bugData.bugId}
                  onChange={(e) => handleBugSelection(e.target.value)}
                  required
                  className="glass-input"
                >
                  <option value="">— Choose feature area —</option>
                  {availableBugs.map(bug => (
                    <option key={bug.id} value={bug.id}>{bug.featureArea}</option>
                  ))}
                  <option value="other">Other / Custom Component</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Defect Title / Summary *</label>
              <input
                type="text"
                required
                placeholder="Summarize the defect in your own words…"
                value={bugData.title}
                onChange={(e) => setBugData({ ...bugData, title: e.target.value })}
                className="glass-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Category *</label>
                <select
                  value={bugData.category}
                  onChange={(e) => setBugData({ ...bugData, category: e.target.value })}
                  className="glass-input"
                >
                  <option>Functional</option>
                  <option>Boundary Value Analysis</option>
                  <option>UI / Layout</option>
                  <option>Console / Network Error</option>
                  <option>Security / Sanitization</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Severity *</label>
                <select
                  value={bugData.severity}
                  onChange={(e) => setBugData({ ...bugData, severity: e.target.value })}
                  className="glass-input"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Steps to Reproduce *</label>
              <textarea
                required
                rows={3}
                placeholder={"1. Open app\n2. Interact with component\n3. Observe the behavior"}
                value={bugData.stepsToReproduce}
                onChange={(e) => setBugData({ ...bugData, stepsToReproduce: e.target.value })}
                className="glass-input font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Expected Behavior *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What should happen…"
                  value={bugData.expectedBehavior}
                  onChange={(e) => setBugData({ ...bugData, expectedBehavior: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Actual Behavior *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What actually happened…"
                  value={bugData.actualBehavior}
                  onChange={(e) => setBugData({ ...bugData, actualBehavior: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn btn-danger px-5">
                <Send className="w-3.5 h-3.5" /> Submit Defect
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
