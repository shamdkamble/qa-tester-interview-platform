import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { ADMIN_PIN } from './config/auth';
import {
  validateAccessToken,
  recordTokenRedemption,
  formatExpiry,
  secondsUntil
} from './utils/accessTokens';
import { computeAssessmentScore } from './utils/scoring';
import { addSubmission } from './utils/submissionsStore';
import {
  User, Shield, HelpCircle, ArrowRight, Play, CheckCircle, Clock,
  AlertTriangle, Bug, Sun, Moon, Sparkles, BookOpen, LogOut,
  ListChecks, Award, FileWarning, Terminal, KeyRound
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
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [candidateLoginError, setCandidateLoginError] = useState('');
  const [candidateStep, setCandidateStep] = useState('details'); // 'details' | 'token'
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [loginTab, setLoginTab] = useState('candidate'); // 'candidate' | 'admin'
  const [accessExpiredNotice, setAccessExpiredNotice] = useState(false);

  // Master bugs
  const [activeBugIds, setActiveBugIds] = useState(MASTER_BUGS.map(b => b.id));

  // Candidate state
  const [candidateBugs, setCandidateBugs] = useState([]);
  const [candidateName, setCandidateName] = useState('QA Fresher Candidate');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [quizScore, setQuizScore] = useState({ score: 0, total: 8 });
  /** Validated token session: { token, exp, jti } */
  const [tokenSession, setTokenSession] = useState(null);

  // Latest session snapshot for deadline auto-submit (avoids stale closures)
  const sessionRef = useRef({});
  sessionRef.current = {
    testCompleted,
    candidateBugs,
    candidateName,
    candidateEmail,
    quizScore,
    activeBugIds,
    timeLeft,
    userRole,
    isLoggedIn,
    tokenSession
  };

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

  /** Step 1: name + email → ask for token */
  const handleCandidateDetailsContinue = (e) => {
    e.preventDefault();
    setCandidateLoginError('');
    if (!studentNameInput.trim() || !studentEmailInput.trim()) return;
    setCandidateStep('token');
  };

  /** Step 2: validate admin-issued token */
  const handleCandidateTokenSubmit = (e) => {
    e.preventDefault();
    setCandidateLoginError('');

    const result = validateAccessToken(accessTokenInput);
    if (!result.ok) {
      setCandidateLoginError(result.error);
      return;
    }

    const name = studentNameInput.trim();
    const email = studentEmailInput.trim();
    const token = accessTokenInput.trim();

    recordTokenRedemption(token, { email, name });

    setCandidateName(name);
    setCandidateEmail(email);
    setTokenSession({
      token,
      exp: result.payload.exp,
      jti: result.payload.jti,
      secondsRemaining: result.secondsRemaining
    });
    setUserRole('candidate');
    setMode('candidate');
    setIsLoggedIn(true);
    setShowInstructions(true);
    setAccessExpiredNotice(false);
    addLog('info', 'Access Gate', `Token accepted for ${email}. Valid until ${formatExpiry(result.payload.exp)}.`);
  };

  const handleStartCandidateTest = () => {
    // Session length = remaining token validity (max 4h from generation)
    const exp = tokenSession?.exp;
    const secs = exp
      ? Math.max(60, secondsUntil(exp))
      : 1800;
    setTimeLeft(secs);
    setShowInstructions(false);
    setTimerActive(true);
    addLog(
      'info',
      'Assessment System',
      `Candidate "${candidateName}" started the assessment. Token expires ${exp ? formatExpiry(exp) : 'N/A'}.`
    );
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === ADMIN_PIN) {
      setUserRole('admin');
      setMode('interviewer');
      setIsLoggedIn(true);
      setAdminPinError(false);
      addLog('info', 'Auth Gateway', 'Administrator authenticated. Master Control panel unlocked.');
    } else {
      setAdminPinError(true);
    }
  };

  const handleEndTest = useCallback((reason = 'manual') => {
    const snap = sessionRef.current;
    if (snap.testCompleted) return;

    const bugs = snap.candidateBugs || [];
    const qScore = snap.quizScore || { score: 0, total: 8 };
    const name = snap.candidateName;
    const email = snap.candidateEmail;
    const bugIds = snap.activeBugIds || [];
    const remaining = snap.timeLeft ?? 0;

    const activeMaster = MASTER_BUGS.filter(b => bugIds.includes(b.id));
    const scoring = computeAssessmentScore({
      reportedBugs: bugs,
      masterBugs: activeMaster,
      quizScore: qScore
    });

    try {
      addSubmission({
        candidateName: name,
        candidateEmail: email,
        reportedBugs: bugs,
        quizScore: qScore,
        activeBugIds: [...bugIds],
        activeMasterBugs: activeMaster,
        scoring,
        timeLeft: remaining,
        accessTokenJti: snap.tokenSession?.jti || null,
        submitReason: reason
      });
      addLog('info', 'Report Archive', `Submission saved — ${name} (${scoring.composite}%, ${scoring.grade}).`);
    } catch (err) {
      addLog('error', 'Report Archive', 'Failed to persist submission to browser storage.');
      console.error(err);
    }

    setTimerActive(false);
    setTestCompleted(true);
    setShowAutoScorecard(true);
    setShowSubmitConfirm(false);
    setIsReportModalOpen(false);

    if (reason === 'token_expired') {
      setAccessExpiredNotice(true);
      addLog('warn', 'Assessment System', 'Access token expired. Assessment auto-submitted.');
    } else {
      addLog('warn', 'Assessment System', 'Assessment session ended. Auto-scoring report generated.');
    }
  }, []);

  const requestEndTest = () => {
    if (testCompleted) return;
    setShowSubmitConfirm(true);
  };

  // Auto-submit when the candidate's access token expires
  useEffect(() => {
    const tick = () => {
      const snap = sessionRef.current;
      if (!snap.isLoggedIn || snap.userRole !== 'candidate' || snap.testCompleted) return;
      const exp = snap.tokenSession?.exp;
      if (!exp) return;
      if (Date.now() >= exp) {
        handleEndTest('token_expired');
      }
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [handleEndTest]);

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
    setAccessTokenInput('');
    setCandidateLoginError('');
    setCandidateStep('details');
    setAdminPinInput('');
    setAdminPinError(false);
    setActiveTab('shop');
    setShowAutoScorecard(false);
    setShowSubmitConfirm(false);
    setCandidateEmail('');
    setAccessExpiredNotice(false);
    setTokenSession(null);
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
              <span className="badge badge-low">Token-gated access</span>
            </div>
          </div>

          {/* Auth card */}
          <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-1 animate-scale-in">
            <div className="nav-track m-3 mb-0">
              <button
                type="button"
                onClick={() => { setLoginTab('candidate'); setCandidateLoginError(''); }}
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
                  {candidateStep === 'details' ? (
                    <>
                      <div>
                        <h2 className="text-lg font-bold text-primary">Start Assessment</h2>
                        <p className="text-xs text-secondary mt-0.5">
                          Enter your details. You will be asked for an access token next.
                        </p>
                      </div>

                      <form onSubmit={handleCandidateDetailsContinue} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-secondary mb-1.5">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Your full name"
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
                            placeholder="you@example.com"
                            value={studentEmailInput}
                            onChange={(e) => setStudentEmailInput(e.target.value)}
                            className="glass-input font-mono"
                            autoComplete="email"
                          />
                        </div>

                        <div className="alert alert-info">
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            You need a valid access token from your interviewer. Tokens last <strong>4 hours</strong> from generation.
                          </span>
                        </div>

                        <button type="submit" className="btn btn-success w-full py-3 text-sm">
                          Continue — Enter Token <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                          <KeyRound className="w-5 h-5 text-violet-400" /> Enter Access Token
                        </h2>
                        <p className="text-xs text-secondary mt-0.5">
                          Paste the token shared by your interviewer for{' '}
                          <strong className="text-primary font-mono">{studentEmailInput}</strong>.
                        </p>
                      </div>

                      <form onSubmit={handleCandidateTokenSubmit} className="space-y-4">
                        {candidateLoginError && (
                          <div className="alert alert-error">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{candidateLoginError}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-secondary mb-1.5">Access Token</label>
                          <input
                            type="text"
                            required
                            placeholder="BHQ.••••••••.••••••••"
                            value={accessTokenInput}
                            onChange={(e) => {
                              setAccessTokenInput(e.target.value);
                              setCandidateLoginError('');
                            }}
                            className="glass-input font-mono text-sm"
                            autoComplete="off"
                            spellCheck={false}
                            autoFocus
                          />
                        </div>

                        <div className="alert alert-warn text-[11px]">
                          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            When the token expires (4 hours after it was generated), the test auto-submits and access closes.
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setCandidateStep('details'); setCandidateLoginError(''); }}
                            className="btn btn-ghost flex-1"
                          >
                            Back
                          </button>
                          <button type="submit" className="btn btn-success flex-[2] py-3 text-sm">
                            Validate &amp; Continue <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Interviewer Access</h2>
                    <p className="text-xs text-secondary mt-0.5">
                      Generate candidate tokens, review reports, and control sandbox bugs.
                    </p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    {adminPinError && (
                      <div className="alert alert-error">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Invalid PIN. Please try again or contact the assessment administrator.</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">Access PIN</label>
                      <input
                        type="password"
                        placeholder="Enter access PIN"
                        value={adminPinInput}
                        onChange={(e) => {
                          setAdminPinInput(e.target.value);
                          setAdminPinError(false);
                        }}
                        className="glass-input tracking-[0.2em] text-center text-sm font-mono"
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="surface-muted rounded-xl p-3.5 space-y-1.5 text-[11px] text-secondary leading-relaxed">
                      <p className="font-semibold text-primary text-xs">What you get</p>
                      <p>• Generate 4-hour access tokens for any candidate</p>
                      <p>• Review saved candidate reports and scorecards</p>
                      <p>• Inject or disable intentional bugs in sandboxes</p>
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
      <div className="app-shell min-h-screen flex flex-col items-center p-4 md:p-6 py-8 md:py-10">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <div className="max-w-3xl w-full glass-panel-glow p-6 md:p-8 rounded-2xl space-y-6 animate-scale-in">
          <div className="text-center pb-5 border-b border-[var(--border)]">
            <div className="inline-flex items-center gap-2 badge badge-brand mb-3">
              <BookOpen className="w-3 h-3" /> Candidate Instructions
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary">
              Welcome, {candidateName}
            </h2>
            <p className="text-sm text-secondary mt-1.5 max-w-lg mx-auto leading-relaxed">
              Read this fully before starting. The session clock begins only after you click{' '}
              <strong className="text-primary">Start Test</strong> at the bottom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: Clock,
                label: 'Access ends',
                value: tokenSession?.exp ? formatExpiry(tokenSession.exp) : 'Token window',
                color: 'text-amber-400'
              },
              { icon: Bug, label: 'Sandboxes', value: '4 Live Apps', color: 'text-rose-400' },
              { icon: Award, label: 'Scoring', value: '75% Hunt + 25% Quiz', color: 'text-emerald-400' }
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

          <div className="space-y-6 text-secondary max-h-[55vh] overflow-y-auto pr-1">
            {/* Goal */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/25">1</span>
                What you are being tested on
              </h3>
              <div className="pl-8 space-y-2 text-xs md:text-sm leading-relaxed">
                <p>
                  This is a <strong className="text-primary">QA intern assessment</strong>. You will explore four mock product apps that contain
                  intentional defects. Your job is to <strong className="text-primary">find bugs, log them properly</strong>, and complete a short theory quiz.
                </p>
                <p>
                  Apps are real interactive UIs (not screenshots). Click around, change inputs, submit forms, resize the window,
                  and open the bottom <strong className="text-primary">DevTools Console</strong> for errors and warnings.
                </p>
              </div>
            </section>

            {/* Sandboxes */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/25">2</span>
                The four sandbox apps (top tabs)
              </h3>
              <div className="pl-8 space-y-2 text-xs md:text-sm leading-relaxed">
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong className="text-primary">ShopSphere</strong> — e-commerce: cart, promo codes, checkout, card validation, layout</li>
                  <li><strong className="text-primary">DeskFlow</strong> — user signup, directory, password/DOB rules, settings/cloud sync, XSS</li>
                  <li><strong className="text-primary">SkyRoutes</strong> — flight search: dates, passengers, currency conversion</li>
                  <li><strong className="text-primary">TaskFlow</strong> — tasks, checklists, priority edits, chat scroll, HTML in descriptions</li>
                </ul>
                <p className="text-muted">
                  Tip: try invalid values, empty fields, negative numbers, future dates, rapid double-clicks, and currency/date edge cases.
                </p>
              </div>
            </section>

            {/* How to raise bugs */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 text-xs font-bold flex items-center justify-center border border-rose-500/25">3</span>
                How to raise a bug on this platform
              </h3>
              <div className="pl-8 space-y-3 text-xs md:text-sm leading-relaxed">
                <p>
                  When you find something wrong, click the red <strong className="text-rose-400">Report Defect</strong> button in the top header.
                  A form opens. Fill it carefully — incomplete reports score lower.
                </p>

                <div className="surface-muted rounded-xl p-3.5 space-y-2.5">
                  <p className="font-semibold text-primary flex items-center gap-1.5 text-xs">
                    <ListChecks className="w-3.5 h-3.5 text-indigo-400" /> Step-by-step defect form
                  </p>
                  <ol className="list-decimal pl-4 space-y-2 text-[11px] md:text-xs">
                    <li>
                      <strong className="text-primary">Affected Application</strong> — pick which sandbox (ShopSphere, DeskFlow, SkyRoutes, or TaskFlow).
                    </li>
                    <li>
                      <strong className="text-primary">Suspected Feature Area</strong> — this is critical for scoring.
                      Choose the dropdown option that best matches where the bug lives (e.g. promo code, password validator, return date).
                      If nothing fits, choose <em>Other / Custom Component</em>.
                    </li>
                    <li>
                      <strong className="text-primary">Defect Title</strong> — short clear summary in your own words
                      (e.g. “Promo SAVE20 applies $20 flat instead of 20%”).
                    </li>
                    <li>
                      <strong className="text-primary">Category &amp; Severity</strong> — your best judgment (Functional, BVA, UI, Security, etc.).
                      Note: your final hunt score uses the platform’s master severity of matched bugs, not only what you select here.
                    </li>
                    <li>
                      <strong className="text-primary">Steps to Reproduce</strong> — numbered steps someone else can follow exactly
                      (open app → action → observe).
                    </li>
                    <li>
                      <strong className="text-primary">Expected Behavior</strong> — what should happen if the product were correct.
                    </li>
                    <li>
                      <strong className="text-primary">Actual Behavior</strong> — what you observed instead.
                    </li>
                    <li>
                      Click <strong className="text-rose-400">Submit Defect</strong>. The counter on Report Defect increases. Log each distinct issue separately.
                    </li>
                  </ol>
                </div>

                <div className="alert alert-info text-[11px] md:text-xs">
                  <FileWarning className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Why Feature Area matters:</strong> scoring matches your report to intentional injected bugs using that dropdown.
                    Wrong mapping = no credit for that intentional bug even if you described it well. Prefer the closest area over “Other” when possible.
                  </span>
                </div>

                <div className="alert alert-info text-[11px] md:text-xs">
                  <Terminal className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Console:</strong> expand the bottom “DevTools Console” bar. Errors and warnings while you test can reveal bugs
                    (e.g. sync failures). Log those as defects too if they indicate product issues.
                  </span>
                </div>
              </div>
            </section>

            {/* Grading */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/25">4</span>
                How you are graded
              </h3>
              <div className="pl-8 space-y-3 text-xs md:text-sm leading-relaxed">
                <p>
                  Your final score is a <strong className="text-primary">composite</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="surface-muted rounded-xl p-3">
                    <div className="text-[10px] text-muted uppercase tracking-wider">Bug Hunt</div>
                    <div className="text-lg font-extrabold text-emerald-400 font-mono">75%</div>
                    <p className="text-[11px] text-secondary mt-1">Weighted by how severe the matched intentional bugs are.</p>
                  </div>
                  <div className="surface-muted rounded-xl p-3">
                    <div className="text-[10px] text-muted uppercase tracking-wider">Theory Quiz</div>
                    <div className="text-lg font-extrabold text-cyan-400 font-mono">25%</div>
                    <p className="text-[11px] text-secondary mt-1">8 MCQs on STLC, BVA, EP, defect lifecycle.</p>
                  </div>
                </div>

                <p className="font-semibold text-primary text-xs">Bug hunt points (impact tiers)</p>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="surface-muted rounded-lg p-2.5">
                    <span className="badge badge-critical">Critical</span>
                    <p className="mt-2 text-primary font-bold">Highest points</p>
                    <p className="text-muted mt-0.5">Critical &amp; High master bugs (e.g. security, major validation)</p>
                  </div>
                  <div className="surface-muted rounded-lg p-2.5">
                    <span className="badge badge-high">Mid</span>
                    <p className="mt-2 text-primary font-bold">Medium points</p>
                    <p className="text-muted mt-0.5">Medium-severity logic / calculation issues</p>
                  </div>
                  <div className="surface-muted rounded-lg p-2.5">
                    <span className="badge badge-low">Low</span>
                    <p className="mt-2 text-primary font-bold">Lowest points</p>
                    <p className="text-muted mt-0.5">UI/layout polish issues — still count, worth less</p>
                  </div>
                </div>

                <ul className="space-y-1.5 list-disc pl-4 text-[11px] md:text-xs">
                  <li>Finding more <strong className="text-primary">Critical-tier</strong> defects raises your grade faster than many Low UI issues alone.</li>
                  <li>Clear steps + expected vs actual keep full points; very thin write-ups may reduce credit slightly.</li>
                  <li>Custom “Other” findings can add a small participation bonus if well written, but do not replace mapped intentional bugs.</li>
                  <li>You do <strong className="text-primary">not</strong> need to find every bug to pass — solid coverage of important issues + decent quiz is enough for a strong intern score.</li>
                </ul>

                <div className="surface-muted rounded-xl p-3 text-[11px] md:text-xs space-y-1">
                  <p className="font-semibold text-primary">Indicative grade bands</p>
                  <p><strong className="text-emerald-400">S / A</strong> — strong impact findings + good quiz → recommended for internship</p>
                  <p><strong className="text-amber-400">B</strong> — promising base → often second-round</p>
                  <p><strong className="text-cyan-400">C</strong> — developing — coaching needed</p>
                  <p><strong className="text-rose-400">D</strong> — below current intern bar</p>
                </div>
              </div>
            </section>

            {/* Quiz */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/25">5</span>
                Theory Quiz tab
              </h3>
              <div className="pl-8 space-y-2 text-xs md:text-sm leading-relaxed">
                <p>
                  Open <strong className="text-primary">Theory Quiz</strong> in the top navigation. Answer all 8 questions, then click{' '}
                  <strong className="text-primary">Lock In Answers</strong>. After lock-in you cannot change answers.
                </p>
                <p className="text-muted">
                  Do not leave the quiz for the last second — time-up auto-submits whatever is complete.
                </p>
              </div>
            </section>

            {/* Submit */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/25">6</span>
                Ending the test
              </h3>
              <div className="pl-8 space-y-2 text-xs md:text-sm leading-relaxed">
                <p>
                  When finished (or when time is almost up), click <strong className="text-primary">Submit Test</strong> in the header.
                  Confirm once — the session locks, your scorecard is generated, and your report is saved for the interviewer.
                </p>
              </div>
            </section>

            <div className="alert alert-warn">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-[11px] md:text-xs leading-relaxed">
                <strong>Token deadline:</strong>{' '}
                Your access token is valid for <strong>4 hours from when the interviewer generated it</strong>
                {tokenSession?.exp ? <> (expires <strong>{formatExpiry(tokenSession.exp)}</strong>)</> : null}.
                When it expires, the platform <strong>auto-submits</strong> whatever defects and quiz answers you have.
                You can also submit earlier via <strong>Submit Test</strong>. Work methodically — quality reports on important bugs beat rushing many weak ones.
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
        onTimeUp={() => handleEndTest('timer')}
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
                {accessExpiredNotice
                  ? 'Your access token expired. Your work was auto-submitted and this session is locked.'
                  : 'Your session has closed. Review your report card below, or sign out when finished.'}
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
              <button type="button" onClick={() => handleEndTest('manual')} className="btn btn-primary">
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
