import React, { useState } from 'react';
import { Bug, X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MASTER_BUGS } from '../data/masterBugsList';

export default function BugReportModal({ isOpen, onClose, onSubmitBug, currentApp }) {
  const [bugData, setBugData] = useState({
    title: '',
    appId: currentApp || 'shop',
    bugId: '', // Matches master bug ID or "other"
    category: 'Functional',
    severity: 'Medium',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    candidateNotes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Filter master bugs list by the selected application
  const availableBugs = MASTER_BUGS.filter(bug => bug.appId === bugData.appId);

  const handleAppChange = (appId) => {
    setBugData(prev => ({
      ...prev,
      appId,
      bugId: '', // reset bug mapping
      title: '',
      category: 'Functional',
      severity: 'Medium'
    }));
  };

  const handleBugSelection = (bugId) => {
    setBugData(prev => ({
      ...prev,
      bugId,
      // Keep title, category, severity blank/default so they fill it in manually
      title: '',
      category: 'Functional',
      severity: 'Medium'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bugData.bugId) {
      alert("Please select a Suspected Bug Area (or select 'Other' for a custom bug)!");
      return;
    }
    onSubmitBug({
      ...bugData,
      id: Date.now(),
      reportedAt: new Date().toLocaleTimeString()
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setBugData({
        title: '',
        appId: currentApp || 'shop',
        bugId: '',
        category: 'Functional',
        severity: 'Medium',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        candidateNotes: ''
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl glass-panel-glow p-6 rounded-2xl space-y-4 relative border border-indigo-500/30">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Log QA Defect Report</h3>
            <p className="text-xs text-slate-400">Describe the bug and link it to a functional feature area</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Bug Report Logged Successfully!</h4>
            <p className="text-xs text-slate-400">Your defect has been saved and will be automatically scored.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Affected Application *</label>
                <select
                  value={bugData.appId}
                  onChange={(e) => handleAppChange(e.target.value)}
                  className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
                >
                  <option value="shop">ShopSphere Store</option>
                  <option value="desk">DeskFlow User Portal</option>
                  <option value="sky">SkyRoutes Flight Booking</option>
                  <option value="task">TaskFlow Messaging Sandbox</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Suspected Feature Area *</label>
                <select
                  value={bugData.bugId}
                  onChange={(e) => handleBugSelection(e.target.value)}
                  required
                  className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
                >
                  <option value="">-- Choose Feature Area --</option>
                  {availableBugs.map(bug => (
                    <option key={bug.id} value={bug.id}>
                      {bug.featureArea}
                    </option>
                  ))}
                  <option value="other">Other / Custom Component</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Defect Title / Summary *</label>
              <input
                type="text"
                required
                placeholder="Describe the defect summary in your own words..."
                value={bugData.title}
                onChange={(e) => setBugData({ ...bugData, title: e.target.value })}
                className="w-full p-2.5 glass-input rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Category *</label>
                <select
                  value={bugData.category}
                  onChange={(e) => setBugData({ ...bugData, category: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
                >
                  <option>Functional</option>
                  <option>Boundary Value Analysis</option>
                  <option>UI / Layout</option>
                  <option>Console / Network Error</option>
                  <option>Security / Sanitization</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Severity Level *</label>
                <select
                  value={bugData.severity}
                  onChange={(e) => setBugData({ ...bugData, severity: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg bg-slate-900 text-slate-200"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Exact Steps to Reproduce *</label>
              <textarea
                required
                rows={3}
                placeholder="1. Open app&#10;2. Interact with component&#10;3. Observe the behavior"
                value={bugData.stepsToReproduce}
                onChange={(e) => setBugData({ ...bugData, stepsToReproduce: e.target.value })}
                className="w-full p-2.5 glass-input rounded-lg font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Expected Behavior *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What the application should do..."
                  value={bugData.expectedBehavior}
                  onChange={(e) => setBugData({ ...bugData, expectedBehavior: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Actual Behavior Observed *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="What the application actually did..."
                  value={bugData.actualBehavior}
                  onChange={(e) => setBugData({ ...bugData, actualBehavior: e.target.value })}
                  className="w-full p-2.5 glass-input rounded-lg text-rose-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Defect Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
