import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShieldAlert,
  Users,
  GitPullRequest,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [aiQueries, setAiQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [s, u, a] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminAiQueries(),
      ]);
      setStats(s);
      setUsersList(u);
      setAiQueries(a);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-600">
          This dashboard is reserved for faculty advisors, open-source mentors, and system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin & Mentor Telemetry</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-900 uppercase tracking-wider">
              Protected Access
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            System metrics, student onboarding rates, GitHub caching health, and AI query volume.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Registered developer profiles</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indexed Issues</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalIssuesCached || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Curated & cached from GitHub API</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active PR Sprints</span>
            <GitPullRequest className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalContributions || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.completedContributions || 0} contributions successfully merged
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Explanations</span>
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.aiExplanationsGenerated || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Generated via Gemini 3.8 Flash</div>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">System Infrastructure Health</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
            {stats?.systemHealth?.status || 'HEALTHY'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block mb-0.5 font-semibold">Dual Database Layer:</span>
            <span className="text-slate-100 font-mono">{stats?.systemHealth?.database || 'Connected'}</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block mb-0.5 font-semibold">Gemini AI Engine:</span>
            <span className="text-violet-300 font-mono font-bold">{stats?.systemHealth?.llmService || 'Active'}</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-slate-400 block mb-0.5 font-semibold">Server Process Uptime:</span>
            <span className="text-emerald-300 font-mono font-bold">
              {stats?.systemHealth?.uptimeSeconds ? `${Math.floor(stats.systemHealth.uptimeSeconds / 60)} minutes` : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Student Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Student & Contributor Directory</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="pb-3">Developer</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Skills Selected</th>
                <th className="pb-3">Active Contributions</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-semibold text-slate-900">
                    <div>{u.name}</div>
                    <div className="text-[11px] font-normal text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 capitalize text-slate-700">{u.experienceLevel.toLowerCase()}</td>
                  <td className="py-3 font-mono font-semibold text-indigo-600">{u.skillsCount} skills</td>
                  <td className="py-3 font-mono font-bold text-slate-900">{u.contributionsCount}</td>
                  <td className="py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Telemetry Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Recent AI Explanation Generations</h3>

        <div className="space-y-2">
          {aiQueries.map(q => (
            <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-indigo-600 font-bold mr-2">{q.repo}</span>
                <span className="font-semibold text-slate-900">{q.issueTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded font-bold text-[10px]">
                  {q.difficulty}
                </span>
                <span className="text-[11px] text-slate-400">{new Date(q.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
