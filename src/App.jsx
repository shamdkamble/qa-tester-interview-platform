import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ShopSphereApp from './sandboxes/ShopSphereApp';
import DeskFlowApp from './sandboxes/DeskFlowApp';
import SkyRoutesApp from './sandboxes/SkyRoutesApp';
import TaskFlowApp from './sandboxes/TaskFlowApp';
import QuizSection from './components/QuizSection';
import InterviewerDashboard from './components/InterviewerDashboard';
import BugReportModal from './components/BugReportModal';
import ConsoleSimulator from './components/ConsoleSimulator';
import ScorecardModal from './components/ScorecardModal';
import { MASTER_BUGS } from './data/masterBugsList';
import {
  User, Shield, HelpCircle, ArrowRight, Play, CheckCircle, Clock,
  AlertTriangle, Bug, Sun, Moon, Sparkles, Target, BookOpen, LogOut
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'candidate' | 'admin'
  const [mode, setMode] = useState('candidate'); // 'candidate' | 'interviewer'
  const [activeTab, setActiveTab] = useState('shop');

  // Theme
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // Instructions
  const [showInstructions, setShowInstructions] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(1800);
  const [timerActive, setTimerActive] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showAutoScorecard, setShowAutoScorecard] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Login forms
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [loginTab, setLoginTab] = useState('candidate'); // 'candidate' | 'admin'

  // Master bugs
  const [activeBugIds, setActiveBugIds] = useState(MASTER_BUGS.map(b => b.id));

  // Candidate state
  const [candidateBugs, setCandidateBugs] = useState([]);
  const [candidateName, setCandidateName] = useState('QA Fresher Candidate');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [quizScore, setQuizScore] = useState({ score: 0, total: 8 });

  // Console logs
  const [logs, setLogs] = useState([
    {
      id: 1,
      type: 'network',
      source: 'System',
      message: 'QA Assessment Environment Initialized. 4 Sandbox Applications Ready.',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 2,
      type: 'info',
      source: 'System',
      message: `Master Bug Injection Engine Active (${MASTER_BUGS.length} intentional defects available).`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  const handleCandidateBugSubmit = (newBugReport) => {
    setCandidateBugs(prev => [newBugReport, ...prev]);
    addLog('info', 'Candidate Reporter', `New Defect Logged: "${newBugReport.title}" (${newBugReport.severity})`);
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();
    if (!studentNameInput.trim() || !studentEmailInput.trim()) return;

    setCandidateName(studentNameInput.trim());
    setCandidateEmail(studentEmailInput.trim());
    setUserRole('candidate');
    setMode('candidate');
    setIsLoggedIn(true);
    setShowInstructions(true);
  };

  const handleStartCandidateTest = () => {
    setShowInstructions(false);
    setTimerActive(true);
    addLog('info', 'Assessment System', `Candidate "${candidateName}" acknowledged instructions and started the 30-minute test.`);
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

  const handleEndTest = () => {
    setTimerActive(false);
    setTestCompleted(true);
    setShowAutoScorecard(true);
    setShowSubmitConfirm(false);
    addLog('warn', 'Assessment System', 'Assessment session ended. Auto-scoring report generated.');
  };

  const requestEndTest = () => {
    if (testCompleted) return;
    setShowSubmitConfirm(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setMode('candidate');
    setTestCompleted(false);
    setCandidateBugs([]);
    setTimeLeft(1800);
    setTimerActive(false);
    setShowInstructions(false);
    setQuizScore({ score: 0, total: 8 });
    setStudentNameInput('');
    setStudentEmailInput('');
    setAdminPinInput('');
    setAdminPinError(false);
    setActiveTab('shop');
    setShowAutoScorecard(false);
    setShowSubmitConfirm(false);
    setCandidateEmail('');
  };

  // Role-safe mode change: candidates cannot open interviewer panel
  const handleSetMode = (nextMode) => {
    if (userRole !== 'admin') return;
    setMode(nextMode);
  };

  const ThemeToggle = ({ className = '' }) => (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-icon ${className}`}
      title="Toggle light / dark theme"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
    </button>
  );

  // ─── Login Screen ───────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="app-shell min-h-screen flex flex-col">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-4 py-10">
          {/* Brand */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="relative mx-auto mb-5 w-16 h-16">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 via-indigo-500 to-violet-600 blur-xl opacity-50 animate-pulse-glow" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-2xl">
                <Shield className="w-8 h-8" strokeWidth={2.2} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
              BugHunt <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">QA</span>
            </h1>
            <p className="mt-2 text-sm text-secondary max-w-md mx-auto leading-relaxed">
              Professional assessment suite for QA interns — hunt intentional defects across live product sandboxes.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="badge badge-brand">4 Sandbox Apps</span>
              <span className="badge badge-medium">{MASTER_BUGS.length} Injected Defects</span>
              <span className="badge badge-low">Live Scoring</span>
            </div>
          </div>

          {/* Auth card */}
          <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-1 animate-scale-in">
            {/* Segmented control */}
            <div className="nav-track m-3 mb-0">
              <button
                type="button"
                onClick={() => setLoginTab('candidate')}
                className={`nav-pill flex-1 justify-center ${loginTab === 'candidate' ? 'active' : ''}`}
              >
                <User className="w-3.5 h-3.5" /> Candidate
              </button>
              <button
                type="button"
                onClick={() => setLoginTab('admin')}
                className={`nav-pill flex-1 justify-center ${loginTab === 'admin' ? 'active' : ''}`}
              >
                <Shield className="w-3.5 h-3.5" /> Interviewer
              </button>
            </div>

            <div className="p-6 space-y-5">
              {loginTab === 'candidate' ? (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Start Assessment</h2>
                    <p className="text-xs text-secondary mt-0.5">Enter your details to review guidelines and begin.</p>
                  </div>

                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={studentNameInput}
                        onChange={(e) => setStudentNameInput(e.target.value)}
                        className="glass-input"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="alex.rivera@example.com"
                        value={studentEmailInput}
                        onChange={(e) => setStudentEmailInput(e.target.value)}
                        className="glass-input font-mono"
                        autoComplete="email"
                      />
                    </div>

                    <div className="alert alert-info">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>You will see full instructions before the 30-minute timer starts. No pressure until you click Start.</span>
                    </div>

                    <button type="submit" className="btn btn-success w-full py-3 text-sm">
                      Continue to Instructions <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Interviewer Access</h2>
                    <p className="text-xs text-secondary mt-0.5">Unlock bug controls, session review, and scoring.</p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    {adminPinError && (
                      <div className="alert alert-error">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          Invalid PIN. Default passcode: <strong className="font-mono text-primary">1234</strong>
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">Access PIN</label>
                      <input
                        type="password"
                        placeholder="Enter PIN (default: 1234)"
                        value={adminPinInput}
                        onChange={(e) => {
                          setAdminPinInput(e.target.value);
                          setAdminPinError(false);
                        }}
                        className="glass-input tracking-[0.35em] text-center text-sm font-mono"
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="surface-muted rounded-xl p-3.5 space-y-1.5 text-[11px] text-secondary leading-relaxed">
                      <p className="font-semibold text-primary text-xs">What you get</p>
                      <p>• Reproduce steps for all {MASTER_BUGS.length} intentional defects</p>
                      <p>• Inject or disable bugs before a candidate starts</p>
                      <p>• Review logged defects and generate scorecards</p>
                    </div>

                    <button type="submit" className="btn btn-violet w-full py-3 text-sm">
                      Open Control Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <p className="mt-8 text-[11px] text-muted font-mono">BugHunt QA Assessment Platform · v2.0</p>
        </div>
      </div>
    );
  }

  // ─── Candidate Instructions ─────────────────────────────────
  if (isLoggedIn && userRole === 'candidate' && showInstructions) {
    return (
      <div className="app-shell min-h-screen flex flex-col justify-center items-center p-4 md:p-6">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <div className="max-w-3xl w-full glass-panel-glow p-6 md:p-8 rounded-2xl space-y-6 animate-scale-in">
          <div className="text-center pb-5 border-b border-[var(--border)]">
            <div className="inline-flex items-center gap-2 badge badge-brand mb-3">
              <BookOpen className="w-3 h-3" /> Pre-Assessment Briefing
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary">
              Welcome, {candidateName}
            </h2>
            <p className="text-sm text-secondary mt-1.5">
              Read carefully — the timer starts only when you confirm below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Clock, label: 'Duration', value: '30 Minutes', color: 'text-amber-400' },
              { icon: Bug, label: 'Sandboxes', value: '4 Live Apps', color: 'text-rose-400' },
              { icon: Target, label: 'Scoring', value: 'Auto + Manual', color: 'text-emerald-400' }
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="surface-muted rounded-xl p-3.5 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div>
                  <span className="text-[10px] text-muted uppercase tracking-wider block">{label}</span>
                  <span className="text-sm font-bold text-primary">{value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-secondary">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/25">1</span>
                The Bug Hunt
              </h3>
              <p className="pl-8 text-xs md:text-sm">
                Explore <strong className="text-primary">ShopSphere</strong>, <strong className="text-primary">DeskFlow</strong>,{' '}
                <strong className="text-primary">SkyRoutes</strong>, and <strong className="text-primary">TaskFlow</strong> via the top tabs.
                Probe inputs, calculations, layouts, dates, and the bottom console for errors.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/25">2</span>
                Log Defects
              </h3>
              <p className="pl-8 text-xs md:text-sm">
                Use <strong className="text-rose-400">Report Defect</strong> in the header. Map each report to the correct feature area
                so scoring can match your findings. Include clear steps, expected vs actual behavior.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/25">3</span>
                Theory Quiz
              </h3>
              <p className="pl-8 text-xs md:text-sm">
                Complete the <strong className="text-primary">Theory Quiz</strong> tab (8 MCQs on STLC, BVA, EP, and defect management) before time runs out.
              </p>
            </div>

            <div className="alert alert-warn">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Timer warning:</strong> Once started, the 30-minute clock runs continuously. At zero, the session locks and scores whatever you have submitted.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button type="button" onClick={handleLogout} className="btn btn-ghost">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <button
              type="button"
              onClick={handleStartCandidateTest}
              className="btn btn-success py-3 px-8 text-sm animate-pulse-glow"
            >
              <Play className="w-4 h-4 fill-current" /> I Understand — Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Application Shell ─────────────────────────────────
  return (
    <div className="app-shell min-h-screen flex flex-col pb-14">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
        setMode={handleSetMode}
        userRole={userRole}
        onOpenReportModal={() => {
          if (testCompleted) return;
          setIsReportModalOpen(true);
        }}
        candidateBugCount={candidateBugs.length}
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        timerActive={timerActive}
        setTimerActive={setTimerActive}
        onTimeUp={handleEndTest}
        onEndTest={requestEndTest}
        theme={theme}
        toggleTheme={toggleTheme}
        candidateName={candidateName}
        onLogout={handleLogout}
        testCompleted={testCompleted}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-5 md:py-6">
        {testCompleted && userRole === 'candidate' ? (
          <div className="max-w-xl mx-auto glass-panel-glow p-8 md:p-10 rounded-2xl text-center space-y-5 animate-scale-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Assessment Submitted</h2>
              <p className="text-sm text-secondary mt-2 leading-relaxed">
                Your session has closed. Review your report card below, or sign out when finished.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button type="button" onClick={() => setShowAutoScorecard(true)} className="btn btn-success px-6 py-2.5">
                <HelpCircle className="w-4 h-4" /> View Report Card
              </button>
              <button type="button" onClick={handleLogout} className="btn btn-ghost px-6 py-2.5">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {mode === 'candidate' ? (
              <div className="animate-fade-in">
                {activeTab === 'shop' && <ShopSphereApp activeBugs={activeBugIds} addLog={addLog} />}
                {activeTab === 'desk' && <DeskFlowApp activeBugs={activeBugIds} addLog={addLog} />}
                {activeTab === 'sky' && <SkyRoutesApp activeBugs={activeBugIds} addLog={addLog} />}
                {activeTab === 'task' && <TaskFlowApp activeBugs={activeBugIds} addLog={addLog} />}
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
              <InterviewerDashboard
                masterBugs={MASTER_BUGS}
                activeBugIds={activeBugIds}
                onToggleBug={handleToggleBug}
                candidateBugs={candidateBugs}
                onClearCandidateBugs={() => setCandidateBugs([])}
                quizScore={quizScore}
                candidateName={candidateName}
                setCandidateName={setCandidateName}
                preAuthenticated={userRole === 'admin'}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Bug report modal */}
      <BugReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitBug={handleCandidateBugSubmit}
        currentApp={activeTab}
      />

      {/* Scorecard */}
      <ScorecardModal
        isOpen={showAutoScorecard}
        onClose={() => setShowAutoScorecard(false)}
        candidateReport={{ candidateName, candidateEmail, reportedBugs: candidateBugs }}
        masterBugs={MASTER_BUGS.filter(b => activeBugIds.includes(b.id))}
        quizScore={quizScore}
      />

      {/* Submit confirmation */}
      {showSubmitConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-panel max-w-md glass-panel-glow p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Submit Assessment?</h3>
                <p className="text-xs text-secondary mt-1 leading-relaxed">
                  This ends your session permanently. You will not be able to log more defects or change quiz answers.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowSubmitConfirm(false)} className="btn btn-ghost">
                Keep Working
              </button>
              <button type="button" onClick={handleEndTest} className="btn btn-primary">
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Console — only during active sessions */}
      <ConsoleSimulator logs={logs} onClearLogs={() => setLogs([])} />
    </div>
  );
}
