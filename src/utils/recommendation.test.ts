import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreIssue, extractSkillsFromIssue, UserProfileCriteria, IssueCandidate } from './recommendation';

test('extractSkillsFromIssue extracts recognized languages and libraries', () => {
  const issue: IssueCandidate = {
    id: 101,
    title: 'Fix button hover styling in React navbar component',
    body: 'The CSS classes need adjustment for mobile responsiveness using Tailwind CSS.',
    labels: ['good first issue', 'frontend'],
    language: 'TypeScript',
    repoFullName: 'facebook/react'
  };

  const extracted = extractSkillsFromIssue(issue);
  assert.ok(extracted.includes('React'), 'Should find React');
  assert.ok(extracted.includes('CSS'), 'Should find CSS');
  assert.ok(extracted.includes('TypeScript'), 'Should find TypeScript');
  assert.ok(extracted.includes('Tailwind CSS'), 'Should find Tailwind CSS');
});

test('scoreIssue produces higher score for matching skills than unrelated skills', () => {
  const reactDev: UserProfileCriteria = {
    skills: ['JavaScript', 'React', 'CSS'],
    interests: ['Web Development', 'Frontend'],
    experienceLevel: 'BEGINNER'
  };

  const reactIssue: IssueCandidate = {
    id: 1,
    title: 'Fix React form submission handler',
    body: 'Requires understanding of React state and JavaScript hooks.',
    labels: ['good first issue'],
    language: 'JavaScript',
    repoFullName: 'vercel/next.js'
  };

  const cppIssue: IssueCandidate = {
    id: 2,
    title: 'Optimize C++ memory pool allocator',
    body: 'Refactor low-level pointer arithmetic and assembly vectors.',
    labels: ['architecture', 'hard'],
    language: 'C++',
    repoFullName: 'llvm/llvm-project'
  };

  const reactScore = scoreIssue(reactDev, reactIssue);
  const cppScore = scoreIssue(reactDev, cppIssue);

  assert.ok(reactScore.score > cppScore.score, `React score (${reactScore.score}) should exceed C++ score (${cppScore.score})`);
  assert.ok(reactScore.score >= 80, 'React issue should be High Match');
  assert.ok(reactScore.matchedSkills.includes('React'), 'Should list React as matched skill');
  assert.equal(reactScore.category, 'High Match');
});

test('scoreIssue handles missing skills and calculates breakdown components accurately', () => {
  const user: UserProfileCriteria = {
    skills: ['Python'],
    interests: ['Backend'],
    experienceLevel: 'BEGINNER'
  };

  const issue: IssueCandidate = {
    id: 3,
    title: 'Add Docker container support and Node.js testing',
    body: 'Setup Dockerfile and verify Express endpoints.',
    labels: ['good first issue', 'help wanted'],
    language: 'JavaScript',
    repoFullName: 'expressjs/express'
  };

  const result = scoreIssue(user, issue);

  assert.ok(result.score >= 0 && result.score <= 100, 'Score should be between 0 and 100');
  assert.ok(result.breakdown.skillMatch >= 0 && result.breakdown.skillMatch <= 100);
  assert.ok(result.breakdown.beginnerLabel === 100, 'Good first issue should give 100 for beginner label');
  assert.ok(result.missingSkills.includes('Docker') || result.missingSkills.includes('Node.js') || result.missingSkills.includes('Express'));
});
