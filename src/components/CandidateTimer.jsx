import React, { useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function CandidateTimer({ isInterviewer, timeLeft, setTimeLeft, timerActive, setTimerActive, onTimeUp }) {
  useEffect(() => {
    if (!timerActive) return;

    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, timerActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-200">
      <Timer className={`w-4 h-4 ${timerActive && timeLeft > 0 ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
      <span className={`font-bold tracking-wider ${timeLeft < 180 ? 'text-rose-400 animate-pulse' : ''}`}>
        {formatTime(timeLeft)}
      </span>
      
      {isInterviewer && (
        <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-800">
          <button
            onClick={() => setTimerActive(!timerActive)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
            title={timerActive ? "Pause Timer" : "Start Timer"}
          >
            {timerActive ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
          </button>
          <button
            onClick={() => { setTimeLeft(1800); setTimerActive(false); }}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
            title="Reset to 30 Min"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
