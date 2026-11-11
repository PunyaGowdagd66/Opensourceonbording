import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { KNOWN_SKILLS, KNOWN_INTERESTS } from '../utils/recommendation';
import {
  User,
  Check,
  Plus,
  Save,
  CheckCircle2,
  Github,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, setCurrentView } = useAuth();

  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [githubUsername, setGithubUsername] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (profile) {
      setSkills(profile.skills || ['JavaScript', 'React', 'CSS']);
      setInterests(profile.interests || ['Web Development']);
      setExperienceLevel(profile.experienceLevel || 'BEGINNER');
      setGithubUsername(profile.githubUsername || '');
      setWeeklyHours(profile.weeklyHours || 5);
      setBio(profile.bio || '');
    }
  }, [profile]);

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        skills,
        interests,
        experienceLevel,
        githubUsername,
        weeklyHours,
        bio,
      });
      await refreshProfile();
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Developer profile and skills successfully updated!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Developer Profile</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage your programming languages, domains, and open-source contribution goals.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('recommendations')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>See New Matches</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Details Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Account Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Programming Skills Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Programming Skills & Languages</h3>
              <p className="text-xs text-slate-500">
                These skills carry 50% weight in the recommendation scoring engine.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {skills.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {KNOWN_SKILLS.map(skill => {
              const active = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests & Domains Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Preferred Domains & Topics</h3>
            <p className="text-xs text-slate-500">
              Prioritizes repositories and issues focused on these areas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {KNOWN_INTERESTS.map(interest => {
              const active = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{interest}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience & Goals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Experience & Contribution Target</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Experience Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperienceLevel(lvl)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    experienceLevel === lvl
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold capitalize">{lvl.toLowerCase()}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {lvl === 'BEGINNER' ? 'First contribution' : lvl === 'INTERMEDIATE' ? 'Made 1-3 PRs' : 'Frequent maintainer'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Username</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. alexrivera"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Commitment</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={weeklyHours}
                  onChange={e => setWeeklyHours(parseInt(e.target.value, 10) || 5)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Developer Bio</label>
            <textarea
              rows={2}
              placeholder="e.g. Computer Science sophomore preparing for first open-source PR."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-200 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
