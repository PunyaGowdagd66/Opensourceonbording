import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  GitFork,
  GitBranch,
  FileCode,
  ShieldCheck,
  MessageSquareQuote,
  ArrowRight
} from 'lucide-react';

export const ContributionGuidancePage: React.FC = () => {
  const { setCurrentView } = useAuth();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      num: 1,
      title: 'Understand the Issue',
      summary: 'Read the bug report, expected vs actual behavior, and check whether someone else is already assigned.',
      advice: 'Always read existing discussion comments. If an issue is from 2 days ago and another contributor already commented "I would like to work on this", check if maintainers assigned them before you spend hours coding.',
      command: null
    },
    {
      num: 2,
      title: 'Read Repository Documentation',
      summary: 'Inspect README.md, CONTRIBUTING.md, and CODE_OF_CONDUCT.md.',
      advice: 'Most major repositories have strict branch naming conventions, PR templates, and pre-commit hooks. Following their guidelines guarantees faster maintainer reviews.',
      command: null
    },
    {
      num: 3,
      title: 'Set Up Development Environment Locally',
      summary: 'Install prerequisite runtime (e.g. Node.js, Python) and install dependencies.',
      advice: 'Check the package.json "engines" field to match their exact Node or Python version.',
      command: 'npm install\n# or: pnpm install / yarn'
    },
    {
      num: 4,
      title: 'Fork the Repository on GitHub',
      summary: 'Create your personal copy of the repository in your personal GitHub account.',
      advice: 'Click the "Fork" button at the top-right of the GitHub repository page. Uncheck "Copy the main branch only" if the project works on a develop branch.',
      command: null
    },
    {
      num: 5,
      title: 'Clone Your Fork & Set Up Upstream Remote',
      summary: 'Download the codebase to your computer and configure the original repository as upstream.',
      advice: 'Keeping an "upstream" remote lets you sync new commits from maintainers with "git fetch upstream".',
      command: 'git clone https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git\ncd <REPO_NAME>\ngit remote add upstream https://github.com/<ORIGINAL_OWNER>/<REPO_NAME>.git'
    },
    {
      num: 6,
      title: 'Create a Clean Feature Branch',
      summary: 'Always develop on a separate branch, never directly on main.',
      advice: 'Use descriptive branch names with the issue number: fix/issue-123-button-hover or docs/typo-readme.',
      command: 'git checkout -b fix/issue-description'
    },
    {
      num: 7,
      title: 'Investigate & Write a Failing Test',
      summary: 'Locate the source files, inspect the logic, and write a test that reproduces the bug.',
      advice: 'Writing a failing test first (Test-Driven Development) proves that your fix actually works and gives maintainers 100% confidence.',
      command: 'npm test -- --watch'
    },
    {
      num: 8,
      title: 'Implement Minimal, Atomic Changes',
      summary: 'Write clean, focused code addressing only the reported problem.',
      advice: 'Do not reformat unrelated files or change configuration settings. Keep diffs small and readable.',
      command: null
    },
    {
      num: 9,
      title: 'Run Tests & Linting Scripts',
      summary: 'Ensure zero test regressions and verify code formatting.',
      advice: 'If the CI (Continuous Integration) fails on GitHub due to a formatting error, maintainers cannot merge your PR.',
      command: 'npm run lint\nnpm test'
    },
    {
      num: 10,
      title: 'Review Your Git Diffs',
      summary: 'Inspect every changed line before staging.',
      advice: 'Check for leftover console.log statements, temporary commented code, or local IDE files (.vscode).',
      command: 'git status\ngit diff'
    },
    {
      num: 11,
      title: 'Commit, Push, and Open Pull Request',
      summary: 'Push your branch and submit the PR on GitHub.',
      advice: 'Reference the issue in your PR description: "Closes #123" or "Fixes #123". This automatically closes the issue when merged.',
      command: 'git add .\ngit commit -m "fix: improve error message when hook returns undefined (#123)"\ngit push -u origin fix/issue-description'
    },
    {
      num: 12,
      title: 'Follow Maintainer Feedback Politely',
      summary: 'Respond to code review comments and make requested tweaks on your branch.',
      advice: 'Maintainers are volunteers who care deeply about code quality. Accept constructive criticism graciously. Whenever you push new commits to your branch, the PR updates automatically!',
      command: 'git add .\ngit commit -m "refactor: apply maintainer review suggestions"\ngit push'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>The Official Contributor Workflow</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          The 12-Step Open-Source Contribution Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The standardized blueprint used by software engineers and open-source maintainers worldwide.
        </p>
      </div>

      {/* 12-Step Accordion / Cards */}
      <div className="space-y-3">
        {steps.map(step => {
          const isExpanded = expandedStep === step.num;
          return (
            <div
              key={step.num}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded ? 'border-indigo-300 bg-white shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedStep(isExpanded ? null : step.num)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{step.summary}</p>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3 text-xs">
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900 leading-relaxed">
                    <span className="font-bold">Mentor Advice: </span>
                    <span>{step.advice}</span>
                  </div>

                  {step.command && (
                    <div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Terminal className="w-3.5 h-3.5 text-slate-600" />
                          <span>Terminal Commands</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(step.command!, step.num)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          {copiedIndex === step.num ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy commands</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                        {step.command}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Maintainer Etiquette Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
            Open-Source Etiquette: How to Speak With Maintainers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="font-bold text-emerald-400">Do: Be Courteous & Concise</span>
            <p className="text-[11px] leading-relaxed">
              "Hi team! I would love to work on this issue. I have reproduced the bug locally and plan to add test coverage under __tests__/navbar.test.tsx."
            </p>
          </div>
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="font-bold text-rose-400">Don't: Ping Without Context</span>
            <p className="text-[11px] leading-relaxed">
              Avoid commenting "assign me please" without explaining your proposed approach or whether you have read the contribution documentation.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setCurrentView('tracker')}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Track Your Progress In My Contributions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
