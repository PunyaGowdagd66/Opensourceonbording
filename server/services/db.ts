import bcrypt from 'bcryptjs';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface ProfileEntity {
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

export interface IssueEntity {
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

export interface SavedIssueEntity {
  id: string;
  userId: string;
  issueId: string;
  notes?: string;
  savedAt: string;
}

export interface ContributionEntity {
  id: string;
  userId: string;
  issueId: string;
  status: 'SAVED' | 'STARTED' | 'IN_PROGRESS' | 'TESTING' | 'PR_CREATED' | 'COMPLETED';
  startedAt: string;
  completedAt?: string;
  prUrl?: string;
  notes?: string;
  checklist: Array<{
    stepIndex: number;
    title: string;
    description: string;
    completed: boolean;
    completedAt?: string;
  }>;
}

export interface AIExplanationEntity {
  id: string;
  issueId: string;
  userId?: string;
  summary: string;
  problemExplanation: string;
  requiredSkills: string[];
  keyTerms: Array<{ term: string; definition: string }>;
  investigationSteps: string[];
  suggestedApproach: string;
  prChecklist: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
}

export const DEFAULT_12_STEPS = [
  { stepIndex: 1, title: 'Understand the Issue', description: 'Carefully read the issue description, reproduction steps, and expected behavior.' },
  { stepIndex: 2, title: 'Read Repository Documentation', description: 'Review the project README.md, CONTRIBUTING.md, and code of conduct.' },
  { stepIndex: 3, title: 'Set Up Development Environment', description: 'Install required Node/Python versions and project dependencies locally.' },
  { stepIndex: 4, title: 'Fork the Repository', description: 'Create your personal fork of the repository on your GitHub account.' },
  { stepIndex: 5, title: 'Clone the Repository', description: 'Clone your fork to your local computer and set the upstream remote.' },
  { stepIndex: 6, title: 'Create a Feature Branch', description: 'Checkout a clean descriptive git branch (e.g., git checkout -b fix/issue-123).' },
  { stepIndex: 7, title: 'Investigate & Reproduce', description: 'Locate the source files, inspect the code, and confirm the bug or missing feature.' },
  { stepIndex: 8, title: 'Implement Changes', description: 'Write minimal, focused, and clean code that directly addresses the issue.' },
  { stepIndex: 9, title: 'Run Tests & Linting', description: 'Execute unit tests and formatting scripts to ensure no regressions were introduced.' },
  { stepIndex: 10, title: 'Review Your Diffs', description: 'Inspect git diff to ensure no leftover console.log or unintended file modifications.' },
  { stepIndex: 11, title: 'Prepare & Submit Pull Request', description: 'Push branch, open PR on GitHub referencing the issue number (e.g. Closes #123).' },
  { stepIndex: 12, title: 'Follow Maintainer Feedback', description: 'Respond politely to maintainer reviews and push updates to the PR branch as needed.' }
];

class DatabaseStore {
  users: Map<string, UserEntity> = new Map();
  profiles: Map<string, ProfileEntity> = new Map();
  issues: Map<string, IssueEntity> = new Map();
  savedIssues: Map<string, SavedIssueEntity> = new Map();
  contributions: Map<string, ContributionEntity> = new Map();
  aiExplanations: Map<string, AIExplanationEntity> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Password123!', salt);

    // 1. Seed Student User
    const studentUser: UserEntity = {
      id: 'usr_student_01',
      name: 'Alex Rivera',
      email: 'alex.dev@university.edu',
      passwordHash: demoPasswordHash,
      role: 'USER',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    };
    this.users.set(studentUser.id, studentUser);

    this.profiles.set(studentUser.id, {
      id: 'prof_student_01',
      userId: studentUser.id,
      experienceLevel: 'BEGINNER',
      githubUsername: 'alexrivera-student',
      bio: 'Sophomore Computer Science student enthusiastic about React, TypeScript, and open source tooling.',
      weeklyHours: 6,
      skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Git'],
      interests: ['Web Development', 'Frontend', 'Developer Tools'],
      updatedAt: new Date().toISOString()
    });

    // 2. Seed Admin User
    const adminUser: UserEntity = {
      id: 'usr_admin_01',
      name: 'Prof. Marcus Chen',
      email: 'admin@opensourceonboard.dev',
      passwordHash: demoPasswordHash,
      role: 'ADMIN',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    };
    this.users.set(adminUser.id, adminUser);

    this.profiles.set(adminUser.id, {
      id: 'prof_admin_01',
      userId: adminUser.id,
      experienceLevel: 'ADVANCED',
      githubUsername: 'marcus-chen-oss',
      bio: 'Open source mentor and faculty advisor for university software engineering labs.',
      weeklyHours: 10,
      skills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker'],
      interests: ['Full Stack', 'Developer Tools', 'Testing'],
      updatedAt: new Date().toISOString()
    });

    // 3. Seed Realistic Curated Open-Source Issues from Real GitHub Repositories
    const sampleIssues: IssueEntity[] = [
      {
        id: 'iss_react_01',
        githubIssueId: 28410,
        repository: 'facebook/react',
        repoOwner: 'facebook',
        repoName: 'react',
        title: 'Improve error message when custom hook returns undefined in React 19',
        body: 'When a custom hook inadvertently returns undefined instead of the expected tuple or object, the runtime throws an unhelpful TypeError. We should provide an actionable dev-mode warning pointing to the hook name.',
        htmlUrl: 'https://github.com/facebook/react/issues/28410',
        language: 'JavaScript',
        labels: ['good first issue', 'Difficulty: starter', 'Component: Developer Tools'],
        state: 'open',
        commentsCount: 14,
        stars: 232000,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 'iss_nextjs_02',
        githubIssueId: 64201,
        repository: 'vercel/next.js',
        repoOwner: 'vercel',
        repoName: 'next.js',
        title: 'Add accessibility aria-label to Image component placeholder loader',
        body: 'The default SVG placeholder generated when `placeholder="blur"` is used lacks an accessible aria-label or role="presentation", resulting in lighthouse accessibility warnings.',
        htmlUrl: 'https://github.com/vercel/next.js/issues/64201',
        language: 'TypeScript',
        labels: ['good first issue', 'area: Accessibility', 'documentation'],
        state: 'open',
        commentsCount: 9,
        stars: 128000,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'iss_express_03',
        githubIssueId: 5412,
        repository: 'expressjs/express',
        repoOwner: 'expressjs',
        repoName: 'express',
        title: 'Clarify res.cookie secure flag documentation and example in README',
        body: 'The documentation for `res.cookie` does not clearly emphasize that `secure: true` requires HTTPS in production, causing confusion for beginner backend students.',
        htmlUrl: 'https://github.com/expressjs/express/issues/5412',
        language: 'JavaScript',
        labels: ['good first issue', 'docs', 'help wanted'],
        state: 'open',
        commentsCount: 6,
        stars: 65000,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'iss_tailwind_04',
        githubIssueId: 13950,
        repository: 'tailwindlabs/tailwindcss',
        repoOwner: 'tailwindlabs',
        repoName: 'tailwindcss',
        title: 'Document container queries utility examples in CSS v4 guides',
        body: 'Now that CSS container queries are supported out-of-the-box in Tailwind v4, we need simple interactive code examples demonstrating @min-* and @max-* queries for mobile card components.',
        htmlUrl: 'https://github.com/tailwindlabs/tailwindcss/issues/13950',
        language: 'CSS',
        labels: ['good first issue', 'documentation', 'help wanted'],
        state: 'open',
        commentsCount: 12,
        stars: 84000,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'iss_freecodecamp_05',
        githubIssueId: 51200,
        repository: 'freeCodeCamp/freeCodeCamp',
        repoOwner: 'freeCodeCamp',
        repoName: 'freeCodeCamp',
        title: 'Fix typo and add hint for React state update challenge in curriculum',
        body: 'Step 42 of the React certification curriculum has a missing closing bracket in the boilerplate example and lacks a hint explaining why setState callbacks are asynchronous.',
        htmlUrl: 'https://github.com/freeCodeCamp/freeCodeCamp/issues/51200',
        language: 'JavaScript',
        labels: ['good first issue', 'help wanted', 'scope: curriculum'],
        state: 'open',
        commentsCount: 22,
        stars: 412000,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'iss_prettier_06',
        githubIssueId: 16210,
        repository: 'prettier/prettier',
        repoOwner: 'prettier',
        repoName: 'prettier',
        title: 'Preserve comments inside TypeScript interface index signatures',
        body: 'A single-line comment placed directly after an index signature `[key: string]: any; // comment` gets moved to the next line improperly in the TypeScript printer.',
        htmlUrl: 'https://github.com/prettier/prettier/issues/16210',
        language: 'TypeScript',
        labels: ['good first issue', 'lang: typescript', 'bug'],
        state: 'open',
        commentsCount: 8,
        stars: 49000,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
      }
    ];

    for (const issue of sampleIssues) {
      this.issues.set(issue.id, issue);
    }

    // Seed saved issue for student
    const saved1: SavedIssueEntity = {
      id: 'sav_01',
      userId: studentUser.id,
      issueId: 'iss_react_01',
      notes: 'Reviewed in CS301 lab. Good candidate for first PR.',
      savedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    };
    this.savedIssues.set(saved1.id, saved1);

    // Seed active contribution for student
    const contrib1: ContributionEntity = {
      id: 'con_01',
      userId: studentUser.id,
      issueId: 'iss_nextjs_02',
      status: 'IN_PROGRESS',
      startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      notes: 'Forked repository and verified the image component aria-label locally.',
      checklist: DEFAULT_12_STEPS.map(step => ({
        ...step,
        completed: step.stepIndex <= 6,
        completedAt: step.stepIndex <= 6 ? new Date(Date.now() - (7 - step.stepIndex) * 3600000).toISOString() : undefined
      }))
    };
    this.contributions.set(contrib1.id, contrib1);

    // Seed completed contribution for student
    const contrib2: ContributionEntity = {
      id: 'con_02',
      userId: studentUser.id,
      issueId: 'iss_tailwind_04',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      prUrl: 'https://github.com/tailwindlabs/tailwindcss/pull/13962',
      notes: 'Merged! Added responsive container query example cards to documentation.',
      checklist: DEFAULT_12_STEPS.map(step => ({
        ...step,
        completed: true,
        completedAt: new Date(Date.now() - (13 - step.stepIndex) * 3600000).toISOString()
      }))
    };
    this.contributions.set(contrib2.id, contrib2);
  }
}

export const db = new DatabaseStore();
