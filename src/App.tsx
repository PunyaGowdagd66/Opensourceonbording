/**
 * OpenSourceOnboard — An AI-Integrated Full-Stack Platform for Open-Source Onboarding
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { AiExplainerPage } from './pages/AiExplainerPage';
import { ContributionGuidancePage } from './pages/ContributionGuidancePage';
import { SavedIssuesPage } from './pages/SavedIssuesPage';
import { TrackerPage } from './pages/TrackerPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

import { GitPullRequest, Sparkles, BookOpen, Heart, Github } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useAuth();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'discover':
        return <DiscoverPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'ai-explainer':
        return <AiExplainerPage />;
      case 'guidance':
        return <ContributionGuidancePage />;
      case 'saved':
        return <SavedIssuesPage />;
      case 'tracker':
        return <TrackerPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminPage />;
      case 'landing':
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Modals */}
      <AuthModal />
      <OnboardingModal />

      {/* Global Academic & Hackathon Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                <GitPullRequest className="w-3 h-3" />
              </div>
              <span className="font-bold text-slate-800">OpenSourceOnboard</span>
              <span>— Full-Stack AI Open-Source Mentorship Platform</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setCurrentView('guidance')}
                className="hover:text-indigo-600 transition-colors"
              >
                12-Step PR Roadmap
              </button>
              <button
                onClick={() => setCurrentView('recommendations')}
                className="hover:text-indigo-600 transition-colors"
              >
                Recommendation Model
              </button>
              <button
                onClick={() => setCurrentView('ai-explainer')}
                className="hover:text-indigo-600 transition-colors"
              >
                Gemini AI Explainer
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="hover:text-indigo-600 transition-colors"
              >
                Admin Telemetry
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              College Capstone & Hackathon Product • Dual SQL & MongoDB Schema
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
