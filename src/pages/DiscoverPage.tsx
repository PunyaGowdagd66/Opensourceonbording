import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Issue } from '../services/api';
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  Bookmark,
  GitPullRequest,
  ExternalLink,
  MessageSquare,
  Star,
  CheckCircle2,
  RefreshCw,
  Tag
} from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const { setSelectedIssueForExplainer, setCurrentView, refreshCounts, user } = useAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [source, setSource] = useState<string>('curated');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('good first issue');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created');

  const [savedIssueIds, setSavedIssueIds] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await api.getGitHubIssues({
        q: searchTerm,
        language: selectedLanguage || undefined,
        label: selectedLabel || undefined,
        repo: selectedRepo || undefined,
        sort: sortBy,
      });
      setIssues(res.issues);
      setSource(res.source);
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedLanguage, selectedLabel, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };

  const handleExplainAI = (issue: Issue) => {
    setSelectedIssueForExplainer(issue);
    setCurrentView('ai-explainer');
  };

  const handleSave = async (issue: Issue) => {
    try {
      await api.saveIssue(issue.id, 'Saved from Discovery', issue);
      setSavedIssueIds(prev => new Set(prev).add(issue.id));
      await refreshCounts();
      showToast(`Bookmarked #${issue.githubIssueId} to your saved issues!`);
    } catch (err: any) {
      showToast(err.message || 'Already saved.');
    }
  };

  const handleStartContribution = async (issue: Issue) => {
    try {
      await api.startContribution(issue.id, 'Started from Discovery', issue);
      await refreshCounts();
      setCurrentView('tracker');
    } catch (err: any) {
      setCurrentView('tracker');
    }
  };

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">GitHub Issue Discovery</h1>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
              source === 'api' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {source === 'api' ? 'Live GitHub REST API' : 'Curated Starter Index'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse verified beginner-friendly issues from real open-source repositories.
          </p>
        </div>

        <button
          onClick={fetchIssues}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by keywords, bug details, or repository (e.g. react, navbar, typo)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Languages */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Language:</span>
            </span>
            {['', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Python'].map(lang => (
              <button
                key={lang || 'all'}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lang || 'All Languages'}
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Label:</span>
            </span>
            {[
              { val: 'good first issue', label: 'Good First Issue' },
              { val: 'help wanted', label: 'Help Wanted' },
              { val: 'documentation', label: 'Docs' },
              { val: '', label: 'Any Label' }
            ].map(item => (
              <button
                key={item.val || 'all'}
                onClick={() => setSelectedLabel(item.val)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                  selectedLabel === item.val
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Querying GitHub REST API...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No issues found matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {issues.map(issue => (
            <div
              key={issue.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://github.com/${issue.repository}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold text-indigo-600 hover:underline"
                  >
                    {issue.repository}
                  </a>
                  <span className="text-xs text-slate-400 font-mono">#{issue.githubIssueId}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                    {issue.language}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{issue.commentsCount}</span>
                  </span>
                  <a
                    href={issue.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Title & Body Excerpt */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                  {issue.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {issue.body}
                </p>
              </div>

              {/* Labels & Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {issue.labels.map(lbl => (
                  <span
                    key={lbl}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200"
                  >
                    {lbl}
                  </span>
                ))}
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
                    onClick={() => handleSave(issue)}
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
          ))}
        </div>
      )}
    </div>
  );
};
