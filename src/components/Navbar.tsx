import React from 'react';
import { useAuth, AppView } from '../context/AuthContext';
import {
  Compass,
  Sparkles,
  Bookmark,
  GitPullRequest,
  BookOpen,
  User,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isAdmin,
    currentView,
    setCurrentView,
    savedCount,
    contributionsCount,
    logout,
    setShowAuthModal,
    loginAsDemo,
    setShowOnboardingModal
  } = useAuth();

  const navItems: Array<{ view: AppView; label: string; icon: React.ReactNode; badge?: number; authOnly?: boolean; adminOnly?: boolean }> = [
    { view: 'landing', label: 'Home', icon: <Compass className="w-4 h-4" /> },
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, authOnly: true },
    { view: 'discover', label: 'Discover Issues', icon: <Compass className="w-4 h-4" /> },
    { view: 'recommendations', label: 'Recommended', icon: <Layers className="w-4 h-4" /> },
    { view: 'ai-explainer', label: 'AI Explainer', icon: <Sparkles className="w-4 h-4 text-violet-500" /> },
    { view: 'guidance', label: '12-Step Guide', icon: <BookOpen className="w-4 h-4" /> },
    { view: 'saved', label: 'Saved', icon: <Bookmark className="w-4 h-4" />, badge: savedCount, authOnly: true },
    { view: 'tracker', label: 'Tracker', icon: <GitPullRequest className="w-4 h-4" />, badge: contributionsCount, authOnly: true },
    { view: 'admin', label: 'Admin', icon: <ShieldAlert className="w-4 h-4 text-amber-500" />, adminOnly: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base tracking-tight">OpenSourceOnboard</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">AI</span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">First Contribution Platform</p>
              </div>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                if (item.authOnly && !isAuthenticated) return null;
                if (item.adminOnly && !isAdmin) return null;

                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => loginAsDemo('student')}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student Demo</span>
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  title="Update Skills & Interests"
                >
                  <span>Edit Skills</span>
                </button>

                <button
                  onClick={() => setCurrentView('profile')}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    currentView === 'profile'
                      ? 'border-indigo-300 bg-indigo-50/50 text-indigo-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate font-semibold">{user?.name}</span>
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
