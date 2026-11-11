import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { KNOWN_SKILLS, KNOWN_INTERESTS } from '../utils/recommendation';
import { X, Check, Sparkles, BookOpen, Clock, Github, Code, Compass } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { showOnboardingModal, setShowOnboardingModal, profile, refreshProfile, setCurrentView } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [githubUsername, setGithubUsername] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setSelectedSkills(profile.skills || ['JavaScript', 'React', 'CSS']);
      setSelectedInterests(profile.interests || ['Web Development']);
      setExperienceLevel(profile.experienceLevel || 'BEGINNER');
      setGithubUsername(profile.githubUsername || '');
      setWeeklyHours(profile.weeklyHours || 5);
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (!showOnboardingModal) return null;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        skills: selectedSkills,
        interests: selectedInterests,
        experienceLevel,
        githubUsername,
        weeklyHours,
        bio,
      });
      await refreshProfile();
      setShowOnboardingModal(false);
      setCurrentView('recommendations');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Developer Profile Setup</h3>
              <p className="text-xs text-slate-500">Step {step} of 3: Tailor issue recommendations to your skills</p>
            </div>
          </div>
          <button
            onClick={() => setShowOnboardingModal(false)}
            aria-label="Close profile setup"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2 text-center border-b-2 transition-all ${
              step === 1 ? 'border-indigo-600 text-indigo-700 bg-white font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            1. Skills ({selectedSkills.length})
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-2 text-center border-b-2 transition-all ${
              step === 2 ? 'border-indigo-600 text-indigo-700 bg-white font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            2. Interests ({selectedInterests.length})
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-2 text-center border-b-2 transition-all ${
              step === 3 ? 'border-indigo-600 text-indigo-700 bg-white font-bold' : 'border-transparent text-slate-500'
            }`}
          >
            3. Experience & Goals
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">What programming languages and tools do you know?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our recommendation engine weighs your skills at 50% to find issues where you already understand the stack.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                {KNOWN_SKILLS.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                💡 <strong>College Tip:</strong> If you are starting your first pull request, selecting <strong>JavaScript, HTML, CSS</strong> or <strong>Python</strong> is recommended!
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Which domains are you most interested in?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Helps us prioritize repositories in categories you actually enjoy working on.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                {KNOWN_INTERESTS.map(interest => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Open Source Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        experienceLevel === lvl
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold capitalize">{lvl.toLowerCase()}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {lvl === 'BEGINNER' ? 'First contribution' : lvl === 'INTERMEDIATE' ? 'Made 1-3 PRs' : 'Frequent maintainer'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Username (Optional)</label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. octocat"
                      value={githubUsername}
                      onChange={e => setGithubUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Target Hours</label>
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
                  placeholder="e.g. CS Sophomore eager to make first open source PR in React!"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => (s - 1) as any)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => (s + 1) as any)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Continue to Step {step + 1}
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl shadow-sm shadow-indigo-200 transition-colors flex items-center gap-1.5"
            >
              {saving ? 'Saving...' : 'Save & See Recommendations'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
