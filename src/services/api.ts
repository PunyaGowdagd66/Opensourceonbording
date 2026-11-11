/**
 * Client API Client for OpenSourceOnboard
 * Connects to /api/v1 REST endpoints
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface DeveloperProfile {
  id: string;
  userId: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  githubUsername: string;
  bio: string;
  weeklyHours: number;
  skills: string[];
  interests: string[];
  updatedAt: string;
}

export interface Issue {
  id: string;
  githubIssueId: number;
  repository: string;
  repoOwner: string;
  repoName: string;
  title: string;
  body: string;
  htmlUrl: string;
  language: string;
  labels: string[];
  state: string;
  commentsCount: number;
  stars: number;
  createdAt: string;
}

export interface RecommendationBreakdown {
  skillMatch: number;
  experienceMatch: number;
  interestMatch: number;
  difficultyMatch: number;
  beginnerLabel: number;
}

export interface ScoredIssueItem {
  issue: Issue;
  recommendation: {
    score: number;
    breakdown: RecommendationBreakdown;
    matchedSkills: string[];
    missingSkills: string[];
    matchedInterests: string[];
    category: 'High Match' | 'Good Match' | 'Skill Builder' | 'Exploratory';
    reason: string;
    difficultyLabel: 'Beginner' | 'Intermediate' | 'Advanced';
  };
}

export interface AIExplanation {
  id: string;
  issueId: string;
  summary: string;
  problemExplanation: string;
  requiredSkills: string[];
  keyTerms: Array<{ term: string; definition: string }>;
  investigationSteps: string[];
  suggestedApproach: string;
  prChecklist: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isLiveAI?: boolean;
  createdAt: string;
}

export interface SavedIssue {
  id: string;
  userId: string;
  issueId: string;
  notes?: string;
  savedAt: string;
  issue?: Issue;
}

export interface ContributionChecklistItem {
  stepIndex: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface Contribution {
  id: string;
  userId: string;
  issueId: string;
  status: 'SAVED' | 'STARTED' | 'IN_PROGRESS' | 'TESTING' | 'PR_CREATED' | 'COMPLETED';
  startedAt: string;
  completedAt?: string;
  prUrl?: string;
  notes?: string;
  checklist: ContributionChecklistItem[];
  issue?: Issue;
}

function getToken(): string | null {
  return localStorage.getItem('oso_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('oso_token', token);
  } else {
    localStorage.removeItem('oso_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const body = await res.json();
  if (!res.ok || body.success === false) {
    const message = body?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return body.data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string) {
    return request<{ token: string; user: User; profile: DeveloperProfile }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    return request<{ token: string; user: User; profile: DeveloperProfile }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe() {
    return request<{ user: User; profile: DeveloperProfile }>('/api/v1/auth/me');
  },

  async logout() {
    try {
      await request('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
    }
  },

  // Profile
  async getProfile() {
    return request<DeveloperProfile>('/api/v1/profile');
  },

  async updateProfile(updates: Partial<DeveloperProfile>) {
    return request<DeveloperProfile>('/api/v1/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // GitHub
  async getGitHubIssues(params: {
    q?: string;
    language?: string;
    label?: string;
    repo?: string;
    sort?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.language) query.set('language', params.language);
    if (params.label) query.set('label', params.label);
    if (params.repo) query.set('repo', params.repo);
    if (params.sort) query.set('sort', params.sort);

    return request<{ issues: Issue[]; source: string; total: number }>(`/api/v1/github/issues?${query.toString()}`);
  },

  // Recommendations
  async getRecommendations() {
    return request<{
      userCriteria: any;
      recommendations: ScoredIssueItem[];
      formula: string;
    }>('/api/v1/recommendations');
  },

  // AI Explainer
  async explainIssue(payload: {
    issueId: string;
    title: string;
    body: string;
    repoFullName: string;
    htmlUrl: string;
    labels?: string[];
  }) {
    return request<AIExplanation>('/api/v1/ai/explain', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Saved Issues
  async getSavedIssues() {
    return request<SavedIssue[]>('/api/v1/saved-issues');
  },

  async saveIssue(issueId: string, notes?: string, issueData?: Partial<Issue>) {
    return request<SavedIssue>('/api/v1/saved-issues', {
      method: 'POST',
      body: JSON.stringify({ issueId, notes, issueData }),
    });
  },

  async removeSavedIssue(id: string) {
    return request<{ message: string }>(`/api/v1/saved-issues/${id}`, {
      method: 'DELETE',
    });
  },

  // Contributions
  async getContributions() {
    return request<Contribution[]>('/api/v1/contributions');
  },

  async startContribution(issueId: string, notes?: string, issueData?: Partial<Issue>) {
    return request<Contribution>('/api/v1/contributions', {
      method: 'POST',
      body: JSON.stringify({ issueId, notes, issueData }),
    });
  },

  async updateContribution(id: string, updates: { status?: string; prUrl?: string; notes?: string }) {
    return request<Contribution>(`/api/v1/contributions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async toggleChecklistStep(id: string, stepIndex: number, completed?: boolean) {
    return request<Contribution>(`/api/v1/contributions/${id}/checklist/${stepIndex}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  // Admin
  async getAdminStats() {
    return request<any>('/api/v1/admin/stats');
  },

  async getAdminUsers() {
    return request<any[]>('/api/v1/admin/users');
  },

  async getAdminAiQueries() {
    return request<any[]>('/api/v1/admin/ai-queries');
  },
};
