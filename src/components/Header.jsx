import React from 'react';
import { ShieldCheck, Bug, ShoppingBag, Users, Plane, HelpCircle, Sliders, Play, RotateCcw, Sun, Moon } from 'lucide-react';
import CandidateTimer from './CandidateTimer';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  mode, 
  setMode, 
  onOpenReportModal, 
  candidateBugCount,
  timeLeft,
  setTimeLeft,
  timerActive,
  setTimerActive,
  onTimeUp,
  onEndTest,
  theme,
  toggleTheme
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                BugHunt QA
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
                  Assessment
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Intern Skill Evaluation Platform</p>
            </div>
          </div>

          {/* Mobile Mode Switcher */}
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
        </div>

        {/* Navigation Tabs (Candidate View) */}
        {mode === 'candidate' ? (
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${activeTab === 'shop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> ShopSphere
            </button>
            <button
              onClick={() => setActiveTab('desk')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${activeTab === 'desk' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <Users className="w-3.5 h-3.5" /> DeskFlow
            </button>
            <button
              onClick={() => setActiveTab('sky')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${activeTab === 'sky' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <Plane className="w-3.5 h-3.5" /> SkyRoutes
            </button>
            <button
              onClick={() => setActiveTab('task')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${activeTab === 'task' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">📋</span> TaskFlow
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Theory Quiz
            </button>
          </nav>
        ) : (
          <div className="text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1.5 rounded-xl font-bold">
            🔧 Interviewer Control Dashboard Active
          </div>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <CandidateTimer 
              isInterviewer={mode === 'interviewer'} 
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              timerActive={timerActive}
              setTimerActive={setTimerActive}
              onTimeUp={onTimeUp}
            />
          </div>

          {mode === 'candidate' && (
            <>
              <button
                onClick={onOpenReportModal}
                className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Bug className="w-4 h-4" /> Report Defect ({candidateBugCount})
              </button>
              <button
                onClick={onEndTest}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Submit Test
              </button>
            </>
          )}

          {/* Mode Switcher */}
          <button
            onClick={() => setMode(mode === 'candidate' ? 'interviewer' : 'candidate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'interviewer' 
                ? 'bg-violet-600 text-white border-violet-500 shadow-md' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {mode === 'candidate' ? 'Interviewer Panel' : 'Back to Test'}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
