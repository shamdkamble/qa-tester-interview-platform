import React, { useState } from 'react';
import Header from './components/Header';
import ShopSphereApp from './sandboxes/ShopSphereApp';
import DeskFlowApp from './sandboxes/DeskFlowApp';
import SkyRoutesApp from './sandboxes/SkyRoutesApp';
import QuizSection from './components/QuizSection';
import InterviewerDashboard from './components/InterviewerDashboard';
import BugReportModal from './components/BugReportModal';
import ConsoleSimulator from './components/ConsoleSimulator';
import ScorecardModal from './components/ScorecardModal';
import { MASTER_BUGS } from './data/masterBugsList';
import { User, Shield, HelpCircle, ArrowRight } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'candidate' | 'admin'
  const [mode, setMode] = useState('candidate'); // 'candidate' | 'interviewer'
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'desk' | 'sky' | 'quiz'

  // Timer states
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes (1800s)
  const [timerActive, setTimerActive] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showAutoScorecard, setShowAutoScorecard] = useState(false);

  // Login forms state
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);

  // Master Bugs control state (Interviewer can toggle individual bug IDs)
  const [activeBugIds, setActiveBugIds] = useState(
    MASTER_BUGS.map(b => b.id)
  );

  // Candidate logged bugs state
  const [candidateBugs, setCandidateBugs] = useState([]);
  const [candidateName, setCandidateName] = useState('QA Fresher Candidate');
  const [quizScore, setQuizScore] = useState({ score: 0, total: 8 });

  // Console Logs Simulator State
  const [logs, setLogs] = useState([
    { id: 1, type: 'network', source: 'System', message: 'QA Assessment Environment Initialized. 3 Sandbox Applications Ready.', timestamp: new Date().toLocaleTimeString() },
    { id: 2, type: 'info', source: 'System', message: 'Master Bug Injection Engine Active (13 intentional bugs available).', timestamp: new Date().toLocaleTimeString() }
  ]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Add Log Helper
  const addLog = (type, source, message) => {
    setLogs(prev => [
      {
        id: Date.now() + Math.random(),
        type,
        source,
        message,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  // Toggle bug ON/OFF in Interviewer Dashboard
  const handleToggleBug = (bugId) => {
    setActiveBugIds(prev => {
      const exists = prev.includes(bugId);
      const updated = exists ? prev.filter(id => id !== bugId) : [...prev, bugId];
      const bugObj = MASTER_BUGS.find(b => b.id === bugId);
      addLog(
        exists ? 'warn' : 'info', 
        'Bug Control Engine', 
        `Interviewer ${exists ? 'DISABLED' : 'INJECTED'} bug: "${bugObj?.title}"`
      );
      return updated;
    });
  };

  // Handle Candidate Bug Submission
  const handleCandidateBugSubmit = (newBugReport) => {
    setCandidateBugs(prev => [newBugReport, ...prev]);
    addLog('info', 'Candidate Reporter', `New Defect Logged: "${newBugReport.title}" (${newBugReport.severity})`);
  };

  // Login Handlers
  const handleStudentLogin = (e) => {
    e.preventDefault();
    if (!studentNameInput.trim() || !studentEmailInput.trim()) return;

    setCandidateName(studentNameInput);
    setUserRole('candidate');
    setMode('candidate');
    setIsLoggedIn(true);
    setTimerActive(true);
    addLog('info', 'Assessment System', `Candidate "${studentNameInput}" started 30-minute testing session.`);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput === 'admin') {
      setUserRole('admin');
      setMode('interviewer');
      setIsLoggedIn(true);
      setAdminPinError(false);
      addLog('info', 'Auth Gateway', 'Administrator authenticated. Master Control panel unlocked.');
    } else {
      setAdminPinError(true);
    }
  };

  // Auto-Submit Assessment Handler
  const handleEndTest = () => {
    setTimerActive(false);
    setTestCompleted(true);
    setShowAutoScorecard(true);
    addLog('warn', 'Assessment System', 'Assessment session ended. Auto-scoring report generated.');
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setMode('candidate');
    setTestCompleted(false);
    setCandidateBugs([]);
    setTimeLeft(1800);
    setTimerActive(false);
  };

  // Render Login Screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        {/* Logo Title */}
        <div className="text-center space-y-2 mb-8 max-w-lg">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">BugHunt QA Sandbox</h1>
          <p className="text-sm text-slate-400">Interviews & Fresher QA Intern Assessment Suite</p>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Login Portal */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Student / Candidate</h2>
                <p className="text-xs text-slate-400">Sign in to begin the 30-min bug hunting assessment</p>
              </div>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  className="w-full p-3 glass-input rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Your Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@example.com"
                  value={studentEmailInput}
                  onChange={(e) => setStudentEmailInput(e.target.value)}
                  className="w-full p-3 glass-input rounded-xl font-mono"
                />
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
                <strong className="text-slate-300 block">Assessment Instructions:</strong>
                <p>• You have <strong>30 minutes</strong> to find hidden bugs across 3 apps.</p>
                <p>• Log defect reports and complete the QA quiz before submitting.</p>
                <p>• System will auto-submit when the countdown reaches zero.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
              >
                Start Technical Assessment <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>

          {/* Admin Login Portal */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Interviewer / Admin</h2>
                <p className="text-xs text-slate-400">Unlock the master bug controller & scorecard sheet</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              {adminPinError && (
                <div className="p-2.5 bg-rose-955 border border-rose-800 text-rose-300 rounded-lg">
                  Invalid Pin Code. Use the default passcode: <strong className="font-mono text-white">1234</strong>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Interviewer Pin Code</label>
                <input
                  type="password"
                  placeholder="Enter Pin Code (Default: 1234)"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full p-3 glass-input rounded-xl tracking-widest text-center text-sm font-mono"
                />
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
                <strong className="text-slate-300 block">Interviewer Controls:</strong>
                <p>• Access dedicated list of reproducing methods for all 13 bugs.</p>
                <p>• Enable or disable individual bugs before handing test to candidates.</p>
                <p>• Review logs and grade candidates automatically.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
              >
                Access Interview Dashboard <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
        setMode={setMode}
        onOpenReportModal={() => {
          if (testCompleted) {
            alert("Your assessment is completed. No more defects can be logged.");
            return;
          }
          setIsReportModalOpen(true);
        }}
        candidateBugCount={candidateBugs.length}
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        timerActive={timerActive}
        setTimerActive={setTimerActive}
        onTimeUp={handleEndTest}
        onEndTest={handleEndTest}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {testCompleted && userRole === 'candidate' ? (
          <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <HelpCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white">Assessment Closed & Submitted</h2>
            <p className="text-xs text-slate-400">
              Your 30-minute session has ended. Your performance scorecard has been generated below.
            </p>
            <button
              onClick={() => setShowAutoScorecard(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg"
            >
              View My Report Card
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl ml-3"
            >
              Sign Out / Restart
            </button>
          </div>
        ) : (
          <div>
            {mode === 'candidate' ? (
              <div>
                {activeTab === 'shop' && (
                  <ShopSphereApp activeBugs={activeBugIds} addLog={addLog} />
                )}

                {activeTab === 'desk' && (
                  <DeskFlowApp activeBugs={activeBugIds} addLog={addLog} />
                )}

                {activeTab === 'sky' && (
                  <SkyRoutesApp activeBugs={activeBugIds} addLog={addLog} />
                )}

                {activeTab === 'quiz' && (
                  <QuizSection 
                    isInterviewer={false}
                    onQuizCompleted={(score, total) => {
                      setQuizScore({ score, total });
                      addLog('info', 'Assessment Quiz', `Candidate completed theoretical quiz: ${score}/${total} score.`);
                    }} 
                  />
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Quick logout */}
                <div className="flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Logout Admin Control Panel
                  </button>
                </div>
                <InterviewerDashboard
                  masterBugs={MASTER_BUGS}
                  activeBugIds={activeBugIds}
                  onToggleBug={handleToggleBug}
                  candidateBugs={candidateBugs}
                  onClearCandidateBugs={() => setCandidateBugs([])}
                  quizScore={quizScore}
                  candidateName={candidateName}
                  setCandidateName={setCandidateName}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Candidate Bug Report Modal */}
      <BugReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitBug={handleCandidateBugSubmit}
        currentApp={activeTab}
      />

      {/* Auto score summary modal for candidate when test completes */}
      <ScorecardModal
        isOpen={showAutoScorecard}
        onClose={() => setShowAutoScorecard(false)}
        candidateReport={{ candidateName, reportedBugs: candidateBugs }}
        masterBugs={MASTER_BUGS.filter(b => activeBugIds.includes(b.id))}
        quizScore={quizScore}
      />

      {/* Embedded DevTools Console Simulator */}
      <ConsoleSimulator
        logs={logs}
        onClearLogs={() => setLogs([])}
      />
    </div>
  );
}
