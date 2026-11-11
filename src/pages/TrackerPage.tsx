import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Contribution, Issue } from '../services/api';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  Award,
  Layers,
  ChevronRight,
  Bookmark
} from 'lucide-react';

export const TrackerPage: React.FC = () => {
  const { setCurrentView, setSelectedIssueForExplainer, refreshCounts } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [prUrlInput, setPrUrlInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await api.getContributions();
      setContributions(res);
      if (res.length > 0 && !selectedId) {
        setSelectedId(res[0].id);
        setPrUrlInput(res[0].prUrl || '');
        setNotesInput(res[0].notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const activeContrib = contributions.find(c => c.id === selectedId) || contributions[0];

  useEffect(() => {
    if (activeContrib) {
      setPrUrlInput(activeContrib.prUrl || '');
      setNotesInput(activeContrib.notes || '');
    }
  }, [activeContrib?.id]);

  const handleToggleStep = async (stepIndex: number, currentCompleted: boolean) => {
    if (!activeContrib) return;
    try {
      const updated = await api.toggleChecklistStep(activeContrib.id, stepIndex, !currentCompleted);
      setContributions(prev => prev.map(c => c.id === updated.id ? updated : c));
      await refreshCounts();
    } catch (err) {
      console.error('Failed to toggle step:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeContrib) return;
    try {
      setUpdating(true);
      const updated = await api.updateContribution(activeContrib.id, { status: newStatus });
      setContributions(prev => prev.map(c => c.id === updated.id ? updated : c));
      await refreshCounts();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!activeContrib) return;
    try {
      setUpdating(true);
      const updated = await api.updateContribution(activeContrib.id, {
        prUrl: prUrlInput,
        notes: notesInput
      });
      setContributions(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (err) {
      console.error('Failed to save details:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleExplainAI = (issue: Issue) => {
    setSelectedIssueForExplainer(issue);
    setCurrentView('ai-explainer');
  };

  const completedStepsCount = activeContrib?.checklist ? activeContrib.checklist.filter(s => s.completed).length : 0;
  const progressPercent = Math.round((completedStepsCount / 12) * 100);

  const statuses = ['STARTED', 'IN_PROGRESS', 'TESTING', 'PR_CREATED', 'COMPLETED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contribution Tracker</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track your progress across the 12 open-source stages from local setup to maintainer merge.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('discover')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Issue to Tracker</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Loading contribution records...</p>
        </div>
      ) : contributions.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <GitPullRequest className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No active contributions started yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select an issue from Discovery or Recommendations and click "Start Contribution" to track your pull request roadmap here.
          </p>
          <button
            onClick={() => setCurrentView('recommendations')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
          >
            <span>Browse Recommended Issues</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contributions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Contributions ({contributions.length})
            </h3>
            <div className="space-y-2">
              {contributions.map(contrib => {
                const isSelected = activeContrib?.id === contrib.id;
                const completed = contrib.checklist ? contrib.checklist.filter(s => s.completed).length : 0;
                return (
                  <button
                    key={contrib.id}
                    onClick={() => setSelectedId(contrib.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-mono text-indigo-700 font-bold truncate">
                        {contrib.issue?.repository || 'Repository'}
                      </span>
                      <span className={`px-2 py-0.2 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        contrib.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {contrib.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {contrib.issue?.title || 'Contribution task'}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{completed} of 12 steps</span>
                      <span>{Math.round((completed / 12) * 100)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Active Contribution Detail & 12-Step Checklist */}
          {activeContrib && (
            <div className="lg:col-span-2 space-y-6">
              {/* Active Issue Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                {/* Completion Banner */}
                {activeContrib.status === 'COMPLETED' && (
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-xs flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-200 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">Contribution Completed & Merged! 🎉</h4>
                      <p className="text-xs text-emerald-100 mt-0.5">
                        Outstanding effort! You navigated the issue, implemented the patch, and saw it merged into open-source.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {activeContrib.issue?.repository}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      #{activeContrib.issue?.githubIssueId}
                    </span>
                  </div>

                  {activeContrib.issue && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExplainAI(activeContrib.issue!)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Explainer</span>
                      </button>

                      <a
                        href={activeContrib.issue.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeContrib.issue?.title}
                </h2>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">12-Step Contribution Progress</span>
                    <span className="text-indigo-600 font-bold font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Current Lifecycle Status:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {statuses.map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          activeContrib.status === st
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PR URL & Notes Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Pull Request Details & Notes</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your GitHub Pull Request URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/facebook/react/pull/12345"
                      value={prUrlInput}
                      onChange={e => setPrUrlInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Personal Notes / Logs
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified test suite on Node v20"
                      value={notesInput}
                      onChange={e => setNotesInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveDetails}
                    disabled={updating}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    {updating ? 'Saving...' : 'Save Details'}
                  </button>
                </div>
              </div>

              {/* Interactive 12-Step Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">12-Step Contribution Checklist</h3>
                  <span className="text-xs text-slate-500">Click steps to toggle completion</span>
                </div>

                <div className="space-y-2">
                  {activeContrib.checklist?.map(step => (
                    <div
                      key={step.stepIndex}
                      onClick={() => handleToggleStep(step.stepIndex, step.completed)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        step.completed
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => {}} // handled by parent div
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {step.stepIndex}. {step.title}
                          </span>
                          {step.completed && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-emerald-100 text-emerald-800">
                              Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
