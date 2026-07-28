import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { HelpCircle, CheckCircle, XCircle, Award, RefreshCw } from 'lucide-react';

export default function QuizSection({ onQuizCompleted, isInterviewer }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleOptionSelect = (qId, optionIdx) => {
    if (submitted) return;
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

  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    setSubmitted(true);
    if (onQuizCompleted) {
      onQuizCompleted(finalScore, QUIZ_QUESTIONS.length);
    }
  };

  const score = calculateScore();
  const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">QA Theoretical & Scenario Quiz</h2>
            <p className="text-xs text-slate-400">Assess core understanding of STLC, Boundary Analysis, Equivalence Partitioning & Defect Management</p>
          </div>
        </div>

        {submitted && (
          <div className="px-4 py-2 bg-indigo-950/60 border border-indigo-500/40 rounded-xl flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs text-slate-400 block font-mono">Theoretical Score</span>
              <span className="text-sm font-extrabold text-white">{score} / {QUIZ_QUESTIONS.length} ({percentage}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Questions Grid */}
      <div className="space-y-4">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const isAnswered = userAnswers[q.id] !== undefined;
          const selectedIdx = userAnswers[q.id];
          const isCorrect = selectedIdx === q.correctIndex;

          return (
            <div key={q.id} className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  <span className="text-indigo-400 font-mono mr-2">Q{idx + 1}.</span> {q.question}
                </h3>
                {submitted && (
                  isCorrect ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1 shrink-0 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" /> Correct (+1)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center gap-1 shrink-0 font-mono">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  let optStyle = "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-indigo-500/40";
                  
                  if (submitted) {
                    if (optIdx === q.correctIndex) {
                      optStyle = "bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-semibold";
                    } else if (selectedIdx === optIdx) {
                      optStyle = "bg-rose-950/60 border-rose-500/50 text-rose-200 line-through opacity-80";
                    }
                  } else if (selectedIdx === optIdx) {
                    optStyle = "bg-indigo-950/80 border-indigo-500 text-indigo-200 font-semibold shadow-lg shadow-indigo-500/10";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(q.id, optIdx)}
                      disabled={submitted}
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

              {/* Explanation (Shown when submitted or in interviewer view) */}
              {(submitted || isInterviewer) && (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <span className="text-amber-400 font-bold font-mono">Correct Answer & Rationale:</span>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Quiz CTA */}
      {!submitted ? (
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(userAnswers).length < QUIZ_QUESTIONS.length}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-xl transition disabled:opacity-40"
          >
            Submit Quiz Assessment ({Object.keys(userAnswers).length} / {QUIZ_QUESTIONS.length} Answered)
          </button>
        </div>
      ) : (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => { setSubmitted(false); setUserAnswers({}); }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset Quiz Answers
          </button>
        </div>
      )}
    </div>
  );
}
