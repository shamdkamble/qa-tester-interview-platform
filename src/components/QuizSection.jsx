import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { HelpCircle, Lock } from 'lucide-react';

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
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleLockQuiz = () => {
    const finalScore = calculateScore();
    setIsLocked(true);
    if (onQuizCompleted) {
      onQuizCompleted(finalScore, QUIZ_QUESTIONS.length);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-sans">QA Theoretical & Scenario Quiz</h2>
            <p className="text-xs text-slate-400">Assess core understanding of STLC, BVA, EP & Defect Management</p>
          </div>
        </div>

        {isLocked && (
          <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Answers Locked
          </div>
        )}
      </div>

      {/* Questions Grid */}
      <div className="space-y-4">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const selectedIdx = userAnswers[q.id];

          return (
            <div key={q.id} className="glass-panel p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">
                <span className="text-indigo-400 font-mono mr-2">Q{idx + 1}.</span> {q.question}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  let optStyle = "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-indigo-500/40";
                  
                  if (selectedIdx === optIdx) {
                    optStyle = "bg-indigo-950/80 border-indigo-500 text-indigo-200 font-semibold shadow-lg shadow-indigo-500/10";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(q.id, optIdx)}
                      disabled={isLocked}
                      className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-3 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center font-mono text-[11px] shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown strictly in interviewer view) */}
              {isInterviewer && (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <span className="text-amber-400 font-bold font-mono">Correct Answer & Rationale:</span>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lock In Answers CTA */}
      {!isLocked && (
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleLockQuiz}
            disabled={Object.keys(userAnswers).length < QUIZ_QUESTIONS.length}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-xl transition disabled:opacity-40"
          >
            Lock In Answers ({Object.keys(userAnswers).length} / {QUIZ_QUESTIONS.length} Answered)
          </button>
        </div>
      )}
    </div>
  );
}
