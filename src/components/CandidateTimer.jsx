import React, { useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function CandidateTimer({
  isInterviewer,
  timeLeft,
  setTimeLeft,
  timerActive,
  setTimerActive,
  onTimeUp
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!timerActive) return;

    if (timeLeft <= 0) {
      if (!firedRef.current && onTimeUp) {
        firedRef.current = true;
        onTimeUp();
      }
      return;
    }

    firedRef.current = false;
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, timerActive, onTimeUp, setTimeLeft]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const urgent = timeLeft < 180 && timeLeft > 0;
  const expired = timeLeft <= 0;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs border transition-colors ${
        expired
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          : urgent
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : timerActive
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-[var(--bg-muted)] border-[var(--border)] text-secondary'
      }`}
    >
      <Timer className={`w-3.5 h-3.5 ${timerActive && !expired ? 'animate-pulse' : ''}`} />
      <span className={`font-bold tracking-wider tabular-nums ${urgent ? 'animate-pulse' : ''}`}>
        {formatTime(timeLeft)}
      </span>

      {isInterviewer && (
        <div className="flex items-center gap-0.5 ml-1 pl-2 border-l border-[var(--border)]">
          <button
            type="button"
            onClick={() => setTimerActive(!timerActive)}
            className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-muted hover:text-primary transition"
            title={timerActive ? 'Pause timer' : 'Start timer'}
          >
            {timerActive
              ? <Pause className="w-3 h-3 text-amber-400" />
              : <Play className="w-3 h-3 text-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setTimeLeft(1800);
              setTimerActive(false);
              firedRef.current = false;
            }}
            className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-muted hover:text-rose-400 transition"
            title="Reset to 30 min"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
