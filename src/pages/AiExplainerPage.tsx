import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, AIExplanation, Issue } from '../services/api';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  Lightbulb,
  ExternalLink,
  Code2,
  ArrowRight,
  Bookmark,
  GitPullRequest,
  RefreshCw,
  Terminal,
  HelpCircle
} from 'lucide-react';

export const AiExplainerPage: React.FC = () => {
  const {
    selectedIssueForExplainer,
    setSelectedIssueForExplainer,
    setCurrentView,
    refreshCounts
  } = useAuth();

  const [currentIssue, setCurrentIssue] = useState<Issue | null>(selectedIssueForExplainer);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableIssues, setAvailableIssues] = useState<Issue[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // If no issue passed in context, load available issues from discovery
    const loadDefault = async () => {
      try {
        const res = await api.getGitHubIssues({ label: 'good first issue' });
        setAvailableIssues(res.issues);
        if (!selectedIssueForExplainer && res.issues.length > 0) {
          setCurrentIssue(res.issues[0]);
        }
      } catch (err) {
        console.error('Error fetching fallback issues for explainer:', err);
      }
    };
    loadDefault();
  }, [selectedIssueForExplainer]);

  useEffect(() => {
    if (selectedIssueForExplainer) {
      setCurrentIssue(selectedIssueForExplainer);
    }
  }, [selectedIssueForExplainer]);

  useEffect(() => {
    if (currentIssue) {
      generateExplanation(currentIssue);
    }
  }, [currentIssue]);

  const generateExplanation = async (issue: Issue) => {
    try {
      setLoading(true);
      const res = await api.explainIssue({
        issueId: issue.id,
        title: issue.title,
        body: issue.body,
        repoFullName: issue.repository,
        htmlUrl: issue.htmlUrl,
        labels: issue.labels
      });
      setExplanation(res);
    } catch (err) {
      console.error('Failed to generate AI explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartContribution = async () => {
    if (!currentIssue) return;
    try {
      await api.startContribution(currentIssue.id, 'Started after AI explanation', currentIssue);
      await refreshCounts();
      setCurrentView('tracker');
    } catch {
      setCurrentView('tracker');
    }
  };

  const handleBookmark = async () => {
    if (!currentIssue) return;
    try {
      await api.saveIssue(currentIssue.id, 'Bookmarked from AI Explainer', currentIssue);
      await refreshCounts();
      showToast('Saved to your bookmarked issues!');
    } catch (err: any) {
      showToast(err.message || 'Already saved.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Issue Explainer</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-violet-100 text-violet-800 uppercase tracking-wider">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Grounded AI analysis translating complex technical issues, defining jargon, and creating a beginner checklist.
          </p>
        </div>

        {/* Issue selector dropdown */}
        {availableIssues.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Select Issue:</span>
            <select
              value={currentIssue?.id || ''}
              onChange={e => {
                const found = availableIssues.find(i => i.id === e.target.value);
                if (found) setCurrentIssue(found);
              }}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {availableIssues.map(i => (
                <option key={i.id} value={i.id}>
                  {i.repository} - #{i.githubIssueId} ({i.title.slice(0, 35)}...)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentIssue && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600">{currentIssue.repository}</span>
              <span className="font-mono text-xs text-slate-400">#{currentIssue.githubIssueId}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                {currentIssue.language}
              </span>
            </div>

            <a
              href={currentIssue.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 hover:underline"
            >
              <span>View Original on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{currentIssue.title}</h2>
          <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
            {currentIssue.body}
          </p>
        </div>
      )}

      {/* AI Output Section */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Analyzing Repository Context & Guidelines...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Retrieving documentation from GitHub, parsing technical requirements, and simplifying for beginner contributors.
          </p>
        </div>
      ) : explanation ? (
        <div className="space-y-6">
          {/* Section 1: Plain English Summary & Problem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Beginner-Friendly Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {explanation.summary}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Why This Problem Matters</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {explanation.problemExplanation}
              </p>
            </div>
          </div>

          {/* Section 2: Technical Terminology Glossary */}
          {explanation.keyTerms && explanation.keyTerms.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>Technical Jargon Glossary</span>
              </div>
              <p className="text-xs text-slate-500">
                Unfamiliar words used in the issue description explained in simple developer terms:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {explanation.keyTerms.map(item => (
                  <div key={item.term} className="p-3.5 bg-violet-50/50 border border-violet-100 rounded-xl space-y-1">
                    <span className="font-bold text-xs text-violet-950 block">{item.term}</span>
                    <p className="text-[11px] text-violet-900 leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Step-by-Step Investigation Roadmap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <ListOrdered className="w-4 h-4 text-indigo-600" />
              <span>Step-by-Step Investigation Roadmap</span>
            </div>

            <div className="space-y-2.5">
              {explanation.investigationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 font-medium leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Suggested Approach & PR Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <Code2 className="w-4 h-4" />
                <span>Suggested Code Direction</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                {explanation.suggestedApproach}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pre-PR Quality Checklist</span>
              </div>
              <ul className="space-y-2 text-xs">
                {explanation.prChecklist.map((check, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-indigo-950">Ready to start working on this issue?</h4>
              <p className="text-xs text-indigo-800 mt-0.5">
                Add to your contributions to activate the 12-step interactive progress checklist.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleBookmark}
                className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Bookmark</span>
              </button>

              <button
                onClick={handleStartContribution}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Start 12-Step Tracker</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
