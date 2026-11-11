import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ScoredIssueItem, Issue } from '../services/api';
import { ScoreBreakdownModal } from '../components/ScoreBreakdownModal';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  GitPullRequest,
  ExternalLink,
  Brain,
  Sliders,
  ArrowRight
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const {
    profile,
    setSelectedIssueForExplainer,
    setCurrentView,
    refreshCounts,
    setShowOnboardingModal
  } = useAuth();

  const [scoredIssues, setScoredIssues] = useState<ScoredIssueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH' | 'GOOD' | 'BUILDER'>('ALL');
  const [breakdownModalItem, setBreakdownModalItem] = useState<ScoredIssueItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendations();
      setScoredIssues(res.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [profile]);

  const filteredIssues = scoredIssues.filter(item => {
    if (activeTab === 'HIGH') return item.recommendation.score >= 80;
    if (activeTab === 'GOOD') return item.recommendation.score >= 65 && item.recommendation.score < 80;
    if (activeTab === 'BUILDER') return item.recommendation.score < 65;
    return true;
  });

  const handleExplainAI = (issue: Issue) => {
    setSelectedIssueForExplainer(issue);
    setCurrentView('ai-explainer');
  };

  const handleBookmark = async (issue: Issue) => {
    try {
      await api.saveIssue(issue.id, 'Bookmarked from Recommendations', issue);
      await refreshCounts();
      showToast(`Saved #${issue.githubIssueId} to bookmarks!`);
    } catch (err: any) {
      showToast(err.message || 'Already saved.');
    }
  };

  const handleStartContribution = async (issue: Issue) => {
    try {
      await api.startContribution(issue.id, 'Started from Recommendations', issue);
      await refreshCounts();
      setCurrentView('tracker');
    } catch {
      setCurrentView('tracker');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Personalized Issue Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Explainable content-based ranking matching your skills, experience level, and preferred domains.
          </p>
        </div>

        <button
          onClick={() => setShowOnboardingModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>Update Profile Skills</span>
        </button>
      </div>

      {/* Explainable Formula Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Transparent & Explainable Scoring Model
              </span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-indigo-100 font-semibold bg-white/10 px-3.5 py-2 rounded-xl inline-block">
              Score = (Skill × 50%) + (Experience × 20%) + (Interest × 15%) + (Difficulty × 10%) + (Beginner Label × 5%)
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Unlike black-box algorithms, every score is completely inspectable. Click "Formula Breakdown" on any issue card below to view how each criteria was scored.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10 shrink-0 text-xs space-y-1">
            <div className="font-bold text-white mb-1">Your Active Criteria:</div>
            <div className="text-slate-300">
              Skills ({profile?.skills?.length || 0}):{' '}
              <span className="text-emerald-400 font-semibold">
                {(profile?.skills || ['JavaScript', 'React', 'CSS']).slice(0, 4).join(', ')}
                {(profile?.skills?.length || 0) > 4 ? '...' : ''}
              </span>
            </div>
            <div className="text-slate-300">
              Level: <span className="text-indigo-300 font-semibold">{profile?.experienceLevel || 'Beginner'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Recommendations ({scoredIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('HIGH')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'HIGH'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          High Match (80%+) ({scoredIssues.filter(i => i.recommendation.score >= 80).length})
        </button>
        <button
          onClick={() => setActiveTab('GOOD')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'GOOD'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Good Match (65-79%) ({scoredIssues.filter(i => i.recommendation.score >= 65 && i.recommendation.score < 80).length})
        </button>
        <button
          onClick={() => setActiveTab('BUILDER')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'BUILDER'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Skill Builders ({scoredIssues.filter(i => i.recommendation.score < 65).length})
        </button>
      </div>

      {/* Recommendations Cards */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Calculating weighted compatibility scores...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No issues in this category</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching to the 'All' tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map(item => {
            const { issue, recommendation } = item;
            const isHigh = recommendation.score >= 80;

            return (
              <div
                key={issue.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row with Score Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`px-3 py-1 rounded-xl text-xs font-extrabold font-mono flex items-center gap-1.5 ${
                      isHigh
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : recommendation.score >= 65
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <span>{recommendation.score}%</span>
                      <span>•</span>
                      <span>{recommendation.category}</span>
                    </div>

                    <span className="text-xs font-mono font-bold text-indigo-600">{issue.repository}</span>
                    <span className="text-xs font-mono text-slate-400">#{issue.githubIssueId}</span>
                  </div>

                  <button
                    onClick={() => setBreakdownModalItem(item)}
                    className="self-start sm:self-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>Formula Breakdown</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Title & Body */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {issue.body}
                  </p>
                </div>

                {/* Explainable Reason pill */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs">
                  <Brain className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-slate-700">
                    <span className="font-bold text-slate-900">Why recommended: </span>
                    <span>{recommendation.reason}</span>
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {recommendation.matchedSkills.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Matched:</span>
                      {recommendation.matchedSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[11px] border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {recommendation.missingSkills.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Topic to learn:</span>
                      {recommendation.missingSkills.slice(0, 2).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-800 font-medium rounded text-[11px] border border-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExplainAI(issue)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explain with AI</span>
                    </button>

                    <button
                      onClick={() => handleBookmark(issue)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Bookmark</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleStartContribution(issue)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>Start Contribution</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Breakdown Modal */}
      <ScoreBreakdownModal
        item={breakdownModalItem}
        onClose={() => setBreakdownModalItem(null)}
        onExplainAI={item => handleExplainAI(item.issue)}
      />
    </div>
  );
};
