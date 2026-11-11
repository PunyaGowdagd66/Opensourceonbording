/**
 * OpenSourceOnboard — Explainable Weighted Recommendation Engine
 *
 * Implements content-based scoring:
 * Recommendation Score = (Skill Match * 0.50) +
 *                        (Experience Match * 0.20) +
 *                        (Interest Match * 0.15) +
 *                        (Difficulty Match * 0.10) +
 *                        (Beginner Label * 0.05)
 *
 * All sub-scores are normalized to [0, 100].
 */

export interface UserProfileCriteria {
  skills: string[];
  interests: string[];
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface IssueCandidate {
  id: string | number;
  title: string;
  body?: string;
  labels: string[];
  language?: string;
  repoFullName: string;
  stars?: number;
}

export interface RecommendationBreakdown {
  skillMatch: number;      // 0 - 100 (weight 50%)
  experienceMatch: number; // 0 - 100 (weight 20%)
  interestMatch: number;   // 0 - 100 (weight 15%)
  difficultyMatch: number; // 0 - 100 (weight 10%)
  beginnerLabel: number;   // 0 - 100 (weight 5%)
}

export interface RecommendationResult {
  score: number; // 0 - 100
  breakdown: RecommendationBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  matchedInterests: string[];
  category: 'High Match' | 'Good Match' | 'Skill Builder' | 'Exploratory';
  reason: string;
  difficultyLabel: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Known tech skills vocabulary for keyword extraction
export const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'HTML', 'CSS',
  'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'Vue', 'Angular',
  'Tailwind CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Next.js'
];

export const KNOWN_INTERESTS = [
  'Web Development', 'Frontend', 'Backend', 'Full Stack', 'Developer Tools',
  'Documentation', 'Mobile', 'Machine Learning', 'API', 'UI/UX', 'Testing'
];

/**
 * Extracts implied tech skills from text and labels
 */
export function extractSkillsFromIssue(issue: IssueCandidate): string[] {
  const found = new Set<string>();
  const combinedText = `${issue.title} ${issue.body || ''} ${issue.labels.join(' ')} ${issue.language || ''}`.toLowerCase();

  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    if (pattern.test(combinedText)) {
      found.add(skill);
    }
  }

  if (issue.language) {
    const lang = KNOWN_SKILLS.find(s => s.toLowerCase() === issue.language?.toLowerCase());
    if (lang) found.add(lang);
  }

  return Array.from(found);
}

/**
 * Computes recommendation score for an issue relative to a user profile
 */
export function scoreIssue(user: UserProfileCriteria, issue: IssueCandidate): RecommendationResult {
  const issueSkills = extractSkillsFromIssue(issue);
  const normalizedUserSkills = user.skills.map(s => s.toLowerCase());

  // 1. Skill Match (50% weight)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of issueSkills) {
    if (normalizedUserSkills.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  let skillMatchScore = 0;
  if (issueSkills.length === 0) {
    // If no specific skill parsed, neutral baseline if language matches or beginner
    skillMatchScore = 50;
  } else {
    skillMatchScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, issueSkills.length)) * 100));
    // Bonus if at least one primary skill matched
    if (matchedSkills.length > 0 && skillMatchScore < 70) {
      skillMatchScore = Math.max(skillMatchScore, 65);
    }
  }

  // 2. Experience Match (20% weight)
  const lowerLabels = issue.labels.map(l => l.toLowerCase());
  const hasGoodFirstIssue = lowerLabels.some(l =>
    l.includes('good first issue') ||
    l.includes('good-first-issue') ||
    l.includes('beginner') ||
    l.includes('easy') ||
    l.includes('first-timers-only')
  );
  const hasHelpWanted = lowerLabels.some(l => l.includes('help wanted') || l.includes('help-wanted'));
  const hasComplexLabel = lowerLabels.some(l => l.includes('hard') || l.includes('expert') || l.includes('architecture'));

  let experienceScore = 70;
  let difficultyLabel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';

  if (hasGoodFirstIssue) {
    difficultyLabel = 'Beginner';
    experienceScore = user.experienceLevel === 'BEGINNER' ? 100 : user.experienceLevel === 'INTERMEDIATE' ? 85 : 70;
  } else if (hasComplexLabel) {
    difficultyLabel = 'Advanced';
    experienceScore = user.experienceLevel === 'ADVANCED' ? 100 : user.experienceLevel === 'INTERMEDIATE' ? 65 : 40;
  } else {
    difficultyLabel = 'Intermediate';
    experienceScore = user.experienceLevel === 'INTERMEDIATE' ? 95 : user.experienceLevel === 'BEGINNER' ? 75 : 85;
  }

  // 3. Interest Match (15% weight)
  const matchedInterests: string[] = [];
  const combinedInterestText = `${issue.title} ${issue.repoFullName} ${issue.labels.join(' ')}`.toLowerCase();
  for (const interest of user.interests) {
    if (combinedInterestText.includes(interest.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
      matchedInterests.push(interest);
    }
  }
  const interestScore = user.interests.length > 0
    ? (matchedInterests.length > 0 ? 100 : 50)
    : 70;

  // 4. Difficulty Match (10% weight)
  let difficultyScore = 70;
  if (difficultyLabel === 'Beginner' && user.experienceLevel === 'BEGINNER') difficultyScore = 100;
  else if (difficultyLabel === 'Intermediate' && user.experienceLevel === 'INTERMEDIATE') difficultyScore = 95;
  else if (difficultyLabel === 'Advanced' && user.experienceLevel === 'ADVANCED') difficultyScore = 100;
  else if (difficultyLabel === 'Beginner') difficultyScore = 80;
  else difficultyScore = 60;

  // 5. Beginner Label (5% weight)
  const beginnerLabelScore = hasGoodFirstIssue ? 100 : (hasHelpWanted ? 75 : 30);

  // Weighted total:
  // (Skill * 0.50) + (Exp * 0.20) + (Interest * 0.15) + (Diff * 0.10) + (Label * 0.05)
  const rawScore =
    (skillMatchScore * 0.50) +
    (experienceScore * 0.20) +
    (interestScore * 0.15) +
    (difficultyScore * 0.10) +
    (beginnerLabelScore * 0.05);

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Categorize
  let category: 'High Match' | 'Good Match' | 'Skill Builder' | 'Exploratory' = 'Exploratory';
  if (finalScore >= 80) category = 'High Match';
  else if (finalScore >= 65) category = 'Good Match';
  else if (finalScore >= 50) category = 'Skill Builder';

  // Construct explainable reason
  let reason = '';
  if (matchedSkills.length > 0) {
    reason = `Matches your ${matchedSkills.join(', ')} skills`;
    if (hasGoodFirstIssue) reason += ' with beginner-friendly maintainer onboarding';
  } else if (hasGoodFirstIssue) {
    reason = 'Tagged as a Good First Issue with structured contribution setup';
  } else {
    reason = `Aligns with your ${user.experienceLevel.toLowerCase()} experience level in ${issue.language || 'open source'}`;
  }

  return {
    score: finalScore,
    breakdown: {
      skillMatch: skillMatchScore,
      experienceMatch: experienceScore,
      interestMatch: interestScore,
      difficultyMatch: difficultyScore,
      beginnerLabel: beginnerLabelScore
    },
    matchedSkills,
    missingSkills,
    matchedInterests,
    category,
    reason,
    difficultyLabel
  };
}
