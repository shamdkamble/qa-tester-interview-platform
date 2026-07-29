import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { HelpCircle, Lock, CheckCircle2, Circle } from 'lucide-react';

export default function QuizSection({ onQuizCompleted, isInterviewer }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [isLocked, setIsLocked] = useState(false);

  const handleOptionSelect = (qId, optionIdx) => {
    if (isLocked) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) score += 1;
    });
    return score;
  };

  const handleLockQuiz = () => {
    const finalScore = calculateScore();
    setIsLocked(true);
    if (onQuizCompleted) onQuizCompleted(finalScore, QUIZ_QUESTIONS.length);
  };

  const answered = Object.keys(userAnswers).length;
  const total = QUIZ_QUESTIONS.length;
  const progress = Math.round((answered / total) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="app-chrome">
        <div className="flex items-center gap-3">
          <div className="app-icon bg-gradient-to-br from-amber-500 to-rose-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Theory & Scenario Quiz</h2>
            <p className="text-xs text-secondary">STLC · BVA · Equivalence Partitioning · Defect lifecycle</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isLocked && (
            <div className="hidden sm:block w-32">
              <div className="flex justify-between text-[10px] text-muted mb-1 font-mono">
                <span>Progress</span>
                <span>{answered}/{total}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#f59e0b,#f43f5e)' }} />
              </div>
            </div>
          )}
          {isLocked && (
            <div className="badge badge-brand flex items-center gap-1.5 px-3 py-1.5">
              <Lock className="w-3.5 h-3.5" />
              Answers Locked · Score {calculateScore()}/{total}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 stagger">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const selectedIdx = userAnswers[q.id];

          return (
            <div key={q.id} className="glass-panel p-5 rounded-2xl space-y-3.5">
              <h3 className="text-sm font-semibold text-primary leading-relaxed">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 font-mono text-[11px] mr-2 border border-indigo-500/20">
                  {idx + 1}
                </span>
                {q.question}
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, optIdx) => {
                  const selected = selectedIdx === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleOptionSelect(q.id, optIdx)}
                      disabled={isLocked}
                      className={`p-3 rounded-xl border text-left text-xs transition flex items-start gap-3 ${
                        selected
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-primary font-semibold shadow-lg shadow-indigo-500/10'
                          : 'bg-[var(--bg-muted)] border-[var(--border)] text-secondary hover:border-indigo-500/35 hover:text-primary'
                      } ${isLocked ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                    >
                      {selected
                        ? <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        : (
                          <span className="w-4 h-4 rounded-full border border-[var(--border-strong)] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 text-muted">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                        )}
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isInterviewer && (
                <div className="p-3 surface-muted rounded-xl text-xs text-secondary space-y-1">
                  <span className="text-amber-400 font-bold font-mono text-[11px]">Correct Answer & Rationale</span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isLocked && (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Circle className="w-3 h-3" />
            Answer all questions to enable lock-in. Submissions cannot be changed.
          </p>
          <button
            type="button"
            onClick={handleLockQuiz}
            disabled={answered < total}
            className="btn btn-primary px-8 py-3 text-sm"
          >
            <Lock className="w-4 h-4" />
            Lock In Answers ({answered}/{total})
          </button>
        </div>
      )}
    </div>
  );
}
