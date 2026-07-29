import React from 'react';
import {
  ShieldCheck, Bug, ShoppingBag, Users, Plane, HelpCircle,
  LayoutGrid, Sliders, Sun, Moon, LogOut, Send
} from 'lucide-react';
import CandidateTimer from './CandidateTimer';

const TABS = [
  { id: 'shop', label: 'ShopSphere', icon: ShoppingBag },
  { id: 'desk', label: 'DeskFlow', icon: Users },
  { id: 'sky', label: 'SkyRoutes', icon: Plane },
  { id: 'task', label: 'TaskFlow', icon: LayoutGrid },
  { id: 'quiz', label: 'Theory Quiz', icon: HelpCircle }
];

export default function Header({
  activeTab,
  setActiveTab,
  mode,
  setMode,
  userRole,
  onOpenReportModal,
  candidateBugCount,
  timeLeft,
  setTimeLeft,
  timerActive,
  setTimerActive,
  onTimeUp,
  onEndTest,
  theme,
  toggleTheme,
  candidateName,
  onLogout,
  testCompleted
}) {
  const isAdmin = userRole === 'admin';
  const isCandidateMode = mode === 'candidate';

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-base)_78%,transparent)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col gap-3">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-extrabold tracking-tight text-primary truncate">
                    BugHunt QA
                  </h1>
                  <span className="badge badge-brand hidden sm:inline-flex">Assessment</span>
                </div>
                <p className="text-[10px] text-muted font-mono truncate">
                  {isCandidateMode && candidateName
                    ? candidateName
                    : 'Intern Skill Evaluation Platform'}
                </p>
              </div>
            </div>

            {/* Mobile timer */}
            <div className="md:hidden">
              <CandidateTimer
                isInterviewer={mode === 'interviewer'}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                timerActive={timerActive}
                setTimerActive={setTimerActive}
                onTimeUp={onTimeUp}
              />
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <CandidateTimer
                isInterviewer={mode === 'interviewer'}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                timerActive={timerActive}
                setTimerActive={setTimerActive}
                onTimeUp={onTimeUp}
              />

              {isCandidateMode && !testCompleted && (
                <>
                  <button type="button" onClick={onOpenReportModal} className="btn btn-danger">
                    <Bug className="w-3.5 h-3.5" />
                    Report Defect
                    {candidateBugCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">
                        {candidateBugCount}
                      </span>
                    )}
                  </button>
                  <button type="button" onClick={onEndTest} className="btn btn-primary">
                    <Send className="w-3.5 h-3.5" /> Submit Test
                  </button>
                </>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'candidate' ? 'interviewer' : 'candidate')}
                  className={`btn ${mode === 'interviewer' ? 'btn-violet' : 'btn-ghost'}`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {mode === 'candidate' ? 'Control Panel' : 'Preview Apps'}
                </button>
              )}

              <button type="button" onClick={toggleTheme} className="btn-icon" title="Toggle theme">
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-amber-400" />
                  : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>

              <button type="button" onClick={onLogout} className="btn-icon" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nav + mobile actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {isCandidateMode ? (
              <nav className="nav-track" aria-label="Sandbox navigation">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`nav-pill ${activeTab === id ? 'active' : ''}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono bg-violet-500/10 text-violet-300 border border-violet-500/25">
                <Sliders className="w-3.5 h-3.5" />
                Interviewer Control Dashboard
              </div>
            )}

            {/* Mobile action bar */}
            <div className="flex md:hidden items-center gap-2 flex-wrap">
              {isCandidateMode && !testCompleted && (
                <>
                  <button type="button" onClick={onOpenReportModal} className="btn btn-danger flex-1">
                    <Bug className="w-3.5 h-3.5" /> Report ({candidateBugCount})
                  </button>
                  <button type="button" onClick={onEndTest} className="btn btn-primary">
                    Submit
                  </button>
                </>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'candidate' ? 'interviewer' : 'candidate')}
                  className={`btn ${mode === 'interviewer' ? 'btn-violet' : 'btn-ghost'}`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {mode === 'candidate' ? 'Admin' : 'Apps'}
                </button>
              )}
              <button type="button" onClick={toggleTheme} className="btn-icon">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
              <button type="button" onClick={onLogout} className="btn-icon">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
