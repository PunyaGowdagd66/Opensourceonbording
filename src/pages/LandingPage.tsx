import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { scoreIssue, UserProfileCriteria, IssueCandidate } from '../utils/recommendation';
import {
  Compass,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  ArrowRight,
  Code2,
  ShieldAlert,
  Brain,
  Terminal,
  Zap,
  Users,
  Star,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setShowAuthModal, loginAsDemo } = useAuth();

  // Interactive Live Simulator state on Landing Page
  const [simSkills, setSimSkills] = useState<string[]>(['JavaScript', 'React', 'CSS']);
  const [simExp, setSimExp] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  const sampleCandidate: IssueCandidate = {
    id: 'demo_101',
    title: 'Improve error message when custom hook returns undefined in React 19',
    body: 'When a custom hook returns undefined, developers encounter a confusing TypeError. We should provide an actionable dev-mode warning.',
    labels: ['good first issue', 'Difficulty: starter'],
    language: 'JavaScript',
    repoFullName: 'facebook/react',
    stars: 232000
  };

  const simResult = scoreIssue(
    { skills: simSkills, interests: ['Web Development', 'Frontend'], experienceLevel: simExp },
    sampleCandidate
  );

  const toggleSimSkill = (s: string) => {
    setSimSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-white">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Built for College Students & Beginner Developers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Your First Open-Source Contribution{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Stop feeling overwhelmed by massive GitHub codebases. OpenSourceOnboard matches issues to your exact skills, explains technical problems in simple language with AI, and guides you step-by-step to your first merged Pull Request.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => loginAsDemo('student')}
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Try Instant Student Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentView('discover')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Explore Real GitHub Issues</span>
              </button>
            </div>

            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-100 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-slate-900">500+</div>
                <div className="text-xs text-slate-500 font-medium">Starter Issues Indexed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-indigo-600">5-Factor</div>
                <div className="text-xs text-slate-500 font-medium">Explainable Match Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-violet-600">AI Powered</div>
                <div className="text-xs text-slate-500 font-medium">Issue Simplifier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-emerald-600">12-Step</div>
                <div className="text-xs text-slate-500 font-medium">PR Roadmap Checklist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Simulator: "Select JavaScript, React and CSS" */}
      <section className="py-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Interactive Algorithm Demo</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Try the Recommendation Engine Live
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Toggle skills below to see how our explainable formula recalibrates compatibility with a real <strong>facebook/react</strong> good first issue in real time.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">1. Select Your Current Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['JavaScript', 'React', 'CSS', 'HTML', 'Python', 'C++', 'Node.js', 'TypeScript'].map(s => {
                    const active = simSkills.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSimSkill(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {active ? `✓ ${s}` : `+ ${s}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">2. Experience Level:</span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setSimExp(lvl)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        simExp === lvl ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Live Output Card */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    {sampleCandidate.language}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">
                    good first issue
                  </span>
                  <span className="text-xs font-mono text-slate-400">{sampleCandidate.repoFullName}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{sampleCandidate.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{sampleCandidate.body}</p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Matched Skills: </span>
                    <span className="font-bold text-emerald-700">
                      {simResult.matchedSkills.length > 0 ? simResult.matchedSkills.join(', ') : 'None yet'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Category: </span>
                    <span className="font-bold text-indigo-700">{simResult.category}</span>
                  </div>
                </div>
              </div>

              {/* Score Gauge & Action */}
              <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-xl border border-indigo-100 text-center space-y-3">
                <div>
                  <div className="text-3xl font-extrabold text-indigo-900 font-mono">
                    {simResult.score}%
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider mt-0.5">
                    Compatibility Score
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 italic">
                  "{simResult.reason}"
                </div>

                <button
                  onClick={() => setCurrentView('discover')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore In Discovery</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 7 Barriers Faced by Students vs Our Solution */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Problem & The Breakthrough</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Why Open-Source Feels So Hard for Beginners
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Millions of students study web development, yet less than 3% ever make a pull request. Here is how OpenSourceOnboard eliminates every obstacle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4 font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Intimidating Technical Descriptions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Issue descriptions often assume years of domain knowledge and use dense jargon like "hydration mismatch" or "re-entrancy".
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>Our AI translates issues into plain student language.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Finding the Right Starter Issues</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generic GitHub search lists thousands of issues, but 90% are either abandoned, too complex, or lacking reproduction steps.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Curated live search with good-first-issue filters.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Unknown Skill Requirements</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students cannot tell if their CSS or JavaScript knowledge is enough to solve an issue before wasting hours reading files.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-blue-600" />
                <span>Explainable 5-factor weighted skill match scoring.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4 font-bold">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Complex Git Workflow Confusion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Forks, remotes, branches, rebase, and maintainer review etiquette are not taught properly in standard university curricula.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-700" />
                <span>Interactive 12-step roadmap with copyable commands.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-bold">
                5
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Lost Progress & Disorganization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students bookmark issues in browser tabs and forget where they left off in the middle of local environment setup.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kanban contribution board and personal bookmarks.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 font-bold">
                6
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Fear of Maintainer Rejection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Imposter syndrome makes students fear harsh reviews or unhelpful comments from senior maintainers.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pre-PR checklist ensuring clean linting & polite tone.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Contribution Journey */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">The 4-Step Journey</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              From Zero to Your First Merged PR
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                01
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Set Your Profile</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add the languages you know (e.g., React, JavaScript, CSS, Python) and your target weekly contribution hours.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                02
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Get Matched</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our weighted algorithm scores issues by skill overlap, difficulty, and beginner friendliness.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                03
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Explain with AI</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini AI breaks down the issue, decodes jargon, highlights relevant files, and provides an implementation checklist.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-3">
                04
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Follow 12-Step PR</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track your progress from fork to clone, testing, PR submission, and celebration when maintainers merge your code!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to become an open-source contributor?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Experience the full platform right now. Try our instant student demo with pre-populated skills, or create your custom profile.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => loginAsDemo('student')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Launch Student Demo (Alex Rivera)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Sign Up With Email
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
