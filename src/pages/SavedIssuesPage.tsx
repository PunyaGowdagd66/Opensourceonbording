import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, SavedIssue, Issue } from '../services/api';
import {
  Bookmark,
  Sparkles,
  GitPullRequest,
  Trash2,
  ExternalLink,
  MessageSquare,
  FileText,
  Compass,
  ArrowRight
} from 'lucide-react';

export const SavedIssuesPage: React.FC = () => {
  const { setCurrentView, setSelectedIssueForExplainer, refreshCounts } = useAuth();
  const [savedList, setSavedList] = useState<SavedIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.getSavedIssues();
      setSavedList(res);
    } catch (err) {
      console.error('Failed to fetch saved issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.removeSavedIssue(id);
      setSavedList(prev => prev.filter(s => s.id !== id && s.issueId !== id));
      await refreshCounts();
    } catch (err) {
      console.error('Failed to remove saved issue:', err);
    }
  };

  const handleExplainAI = (issue: Issue) => {
    setSelectedIssueForExplainer(issue);
    setCurrentView('ai-explainer');
  };

  const handleStartContribution = async (issue: Issue) => {
    try {
      await api.startContribution(issue.id, 'Started from Saved Issues', issue);
      await refreshCounts();
      setCurrentView('tracker');
    } catch {
      setCurrentView('tracker');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Issues</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Issues bookmarked for reference, study, or upcoming contribution sprints.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('discover')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors self-start sm:self-auto shadow-xs"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Discover More Issues</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Loading saved bookmarks...</p>
        </div>
      ) : savedList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No saved issues yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse discovered issues or recommended matches and click "Bookmark" to save them here for later investigation.
          </p>
          <button
            onClick={() => setCurrentView('discover')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Explore Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedList.map(item => {
            const issue = item.issue;
            if (!issue) return null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">{issue.repository}</span>
                    <span className="font-mono text-xs text-slate-400">#{issue.githubIssueId}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                      {issue.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      Saved {new Date(item.savedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{issue.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{issue.body}</p>
                </div>

                {item.notes && (
                  <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Your Study Notes: </span>
                      <span>{item.notes}</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExplainAI(issue)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explain with AI</span>
                    </button>

                    <a
                      href={issue.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Open on GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleStartContribution(issue)}
                    className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Start Contribution Tracker</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
