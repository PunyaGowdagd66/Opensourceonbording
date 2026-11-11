import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ScoredIssueItem, Contribution, SavedIssue, Issue } from '../services/api';
import { ScoreBreakdownModal } from '../components/ScoreBreakdownModal';
import {
  Sparkles,
  Compass,
  Bookmark,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  Code2,
  ExternalLink,
  Plus
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    user,
    profile,
    setCurrentView,
    setSelectedIssueForExplainer,
    setShowOnboardingModal,
    savedCount,
    contributionsCount,
    refreshCounts
  } = useAuth();

  const [topRecommendations, setTopRecommendations] = useState<ScoredIssueItem[]>([]);
  const [activeContribution, setActiveContribution] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [breakdownItem, setBreakdownItem] = useState<ScoredIssueItem | null>(null);
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [recRes, contribRes] = await Promise.all([
          api.getRecommendations(),
          api.getContributions(),
        ]);

        if (recRes && recRes.recommendations) {
          setTopRecommendations(recRes.recommendations.slice(0, 3));
        }

        if (contribRes && contribRes.length > 0) {
          const inProgress = contribRes.find(c => c.status !== 'COMPLETED') || contribRes[0];
          setActiveContribution(inProgress);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Calculate Contribution Readiness Score (0-100)
  const skillsCount = profile?.skills?.length || 0;
  const hasInterests = (profile?.interests?.length || 0) > 0;
  const profileReadiness = Math.min(40, (skillsCount >= 3 ? 25 : skillsCount * 8) + (hasInterests ? 15 : 0));
  const savedReadiness = Math.min(25, savedCount * 12.5);
  const contribReadiness = Math.min(35, contributionsCount * 17.5);
  const totalReadinessScore = Math.min(100, Math.round(profileReadiness + savedReadiness + contribReadiness));

  const handleExplainAI = (issue: Issue) => {
    setSelectedIssueForExplainer(issue);
    setCurrentView('ai-explainer');
  };

  const handleSaveIssue = async (issue: Issue) => {
    try {
      setSavingIssueId(issue.id);
      await api.saveIssue(issue.id, 'Saved from Dashboard', issue);
      await refreshCounts();
    } catch (err) {
      console.error('Failed to save issue:', err);
    } finally {
      setSavingIssueId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/50 via-blue-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>{profile?.experienceLevel || 'Beginner'} Contributor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Developer'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              You are on track for your open-source journey. Your skills and preferences are active, and our recommendation engine is constantly scanning for beginner-friendly GitHub issues matching your stack.
            </p>
          </div>

          {/* Readiness Score Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[220px] text-center shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Readiness Score</span>
              <span className="font-mono font-bold text-indigo-700">{totalReadinessScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalReadinessScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {totalReadinessScore >= 80 ? '🎉 Excellent! Ready to submit a PR!' : 'Complete profile & track steps to reach 100%'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setCurrentView('recommendations')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{topRecommendations.length}+</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Top Recommendations</div>
          <div className="text-[11px] text-slate-500 mt-1">Matched to {skillsCount} skills</div>
        </button>

        <button
          onClick={() => setCurrentView('saved')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{savedCount}</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Saved Bookmarks</div>
          <div className="text-[11px] text-slate-500 mt-1">Issues queued for study</div>
        </button>

        <button
          onClick={() => setCurrentView('tracker')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{contributionsCount}</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Active Contributions</div>
          <div className="text-[11px] text-slate-500 mt-1">In 12-step roadmap</div>
        </button>

        <div className="p-5 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">Active</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {profile?.weeklyHours || 5} hrs
          </div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">Weekly Goal</div>
          <div className="text-[11px] text-slate-500 mt-1">Focus commitment</div>
        </div>
      </div>

      {/* Main Grid: Active Journey + Skills Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Contribution Journey & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Contribution in Progress */}
          {activeContribution && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <GitPullRequest className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Contribution In Progress</h3>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                  {activeContribution.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-mono text-slate-500">{activeContribution.issue?.repository || 'GitHub Repo'}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {activeContribution.issue?.title || 'Active contribution task'}
                  </h4>
                </div>

                {/* 12-Step Progress Bar */}
                {activeContribution.checklist && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600">Roadmap Progress:</span>
                      <span className="font-bold text-indigo-600">
                        {activeContribution.checklist.filter(s => s.completed).length} / 12 Steps Completed
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(activeContribution.checklist.filter(s => s.completed).length / 12) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setCurrentView('tracker')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Open 12-Step Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {activeContribution.issue && (
                    <button
                      onClick={() => handleExplainAI(activeContribution.issue!)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-violet-600"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      <span>Review AI Breakdown</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Top Recommended Issues Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personalized Issue Recommendations</h3>
                <p className="text-xs text-slate-500">Based on your {skillsCount} programming skills and beginner friendliness</p>
              </div>
              <button
                onClick={() => setCurrentView('recommendations')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Scored</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topRecommendations.map(({ issue, recommendation }) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                        recommendation.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {recommendation.score}% Match
                      </span>
                      <span className="text-xs font-mono text-slate-400">{issue.repository}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{issue.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{recommendation.reason}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setBreakdownItem({ issue, recommendation })}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Inspect 5-factor weighted score calculation"
                    >
                      Formula Breakdown
                    </button>
                    <button
                      onClick={() => handleExplainAI(issue)}
                      className="px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Explain with AI</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Profile Summary & Suggested Next Steps */}
        <div className="space-y-6">
          {/* Profile Quickcard */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Developer Profile</h3>
              <button
                onClick={() => setShowOnboardingModal(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Configured Skills ({profile?.skills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(profile?.skills || ['JavaScript', 'React', 'CSS']).map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Interests
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(profile?.interests || ['Web Development']).map(interest => (
                  <span
                    key={interest}
                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {profile?.githubUsername && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>GitHub Profile:</span>
                <span className="font-mono font-semibold text-slate-800">@{profile.githubUsername}</span>
              </div>
            )}
          </div>

          {/* Action Checklist for Beginners */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Suggested Next Steps</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Profile configured with {profile?.skills?.length || 0} skills</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Issue recommendation engine initialized</span>
              </div>
              <button
                onClick={() => setCurrentView('discover')}
                className="w-full text-left p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 flex items-center justify-between transition-colors"
              >
                <span className="font-semibold">Find a beginner issue to bookmark</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              </button>
              <button
                onClick={() => setCurrentView('guidance')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors"
              >
                <span>Read 12-Step Contribution Guide</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        item={breakdownItem}
        onClose={() => setBreakdownItem(null)}
        onExplainAI={item => handleExplainAI(item.issue)}
      />
    </div>
  );
};
