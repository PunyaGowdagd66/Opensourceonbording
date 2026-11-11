import React from 'react';
import { ScoredIssueItem } from '../services/api';
import { X, CheckCircle2, AlertCircle, Sparkles, Brain, Award } from 'lucide-react';

interface ScoreBreakdownModalProps {
  item: ScoredIssueItem | null;
  onClose: () => void;
  onExplainAI: (item: ScoredIssueItem) => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ item, onClose, onExplainAI }) => {
  if (!item) return null;

  const { issue, recommendation } = item;
  const { score, breakdown, matchedSkills, missingSkills, category, reason, difficultyLabel } = recommendation;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                score >= 65 ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {category} • {score}% Match
              </span>
              <span className="text-xs text-slate-500 font-mono">#{issue.githubIssueId}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">{issue.title}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{issue.repository}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close formula breakdown"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Reason banner */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-3 text-xs text-indigo-950">
            <Brain className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-900">Why this was recommended for you:</p>
              <p className="mt-0.5 text-indigo-800">{reason}</p>
            </div>
          </div>

          {/* 5-Criteria Weighted Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Explainable Scoring Formula Breakdown</span>
              <span className="font-mono text-indigo-600 font-semibold normal-case">Total: {score}/100</span>
            </h4>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* Skill Match */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">1. Skill Match (50% Weight)</span>
                  <span className="font-mono font-bold text-slate-900">{breakdown.skillMatch}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${breakdown.skillMatch}%` }} />
                </div>
              </div>

              {/* Experience Match */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">2. Experience Match (20% Weight)</span>
                  <span className="font-mono font-bold text-slate-900">{breakdown.experienceMatch}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${breakdown.experienceMatch}%` }} />
                </div>
              </div>

              {/* Interest Match */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">3. Interest Match (15% Weight)</span>
                  <span className="font-mono font-bold text-slate-900">{breakdown.interestMatch}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-violet-600 h-full rounded-full transition-all" style={{ width: `${breakdown.interestMatch}%` }} />
                </div>
              </div>

              {/* Difficulty Match */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">4. Difficulty Level (10% Weight)</span>
                  <span className="font-mono font-bold text-slate-900">{breakdown.difficultyMatch}/100 ({difficultyLabel})</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${breakdown.difficultyMatch}%` }} />
                </div>
              </div>

              {/* Beginner Label */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">5. Beginner Label (5% Weight)</span>
                  <span className="font-mono font-bold text-slate-900">{breakdown.beginnerLabel}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${breakdown.beginnerLabel}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your Matched Skills</span>
              </p>
              {matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No specific direct skill overlap detected.</p>
              )}
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Skill Gaps / To Learn</span>
              </p>
              {missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-semibold rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No critical missing skill gaps.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onExplainAI(item);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
