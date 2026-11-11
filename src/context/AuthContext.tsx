import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, User, DeveloperProfile, Issue } from '../services/api';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'discover'
  | 'recommendations'
  | 'ai-explainer'
  | 'guidance'
  | 'saved'
  | 'tracker'
  | 'profile'
  | 'admin';

interface AuthContextType {
  user: User | null;
  profile: DeveloperProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedIssueForExplainer: Issue | null;
  setSelectedIssueForExplainer: (issue: Issue | null) => void;
  savedCount: number;
  contributionsCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsDemo: (role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCounts: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedIssueForExplainer, setSelectedIssueForExplainer] = useState<Issue | null>(null);
  const [savedCount, setSavedCount] = useState<number>(1);
  const [contributionsCount, setContributionsCount] = useState<number>(2);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  const refreshCounts = async () => {
    if (!user) return;
    try {
      const [saved, contribs] = await Promise.all([
        api.getSavedIssues(),
        api.getContributions(),
      ]);
      setSavedCount(saved.length);
      setContributionsCount(contribs.length);
    } catch {
      // ignore
    }
  };

  const refreshProfile = async () => {
    try {
      const prof = await api.getProfile();
      setProfile(prof);
    } catch {
      // ignore
    }
  };

  // Initial session restoration
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('oso_token');
        if (token) {
          const res = await api.getMe();
          setUser(res.user);
          setProfile(res.profile);
        }
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      refreshCounts();
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.profile);
    setShowAuthModal(false);
    setCurrentView('dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.profile);
    setShowAuthModal(false);
    setShowOnboardingModal(true);
    setCurrentView('dashboard');
  };

  const loginAsDemo = async (role: 'student' | 'admin') => {
    if (role === 'student') {
      await login('alex.dev@university.edu', 'Password123!');
    } else {
      await login('admin@opensourceonboard.dev', 'Password123!');
      setCurrentView('admin');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setProfile(null);
    setCurrentView('landing');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'ADMIN',
        loading,
        currentView,
        setCurrentView,
        selectedIssueForExplainer,
        setSelectedIssueForExplainer,
        savedCount,
        contributionsCount,
        login,
        register,
        loginAsDemo,
        logout,
        refreshProfile,
        refreshCounts,
        showAuthModal,
        setShowAuthModal,
        showOnboardingModal,
        setShowOnboardingModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
