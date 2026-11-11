import { Router, Response } from 'express';
import { db } from '../services/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { scoreIssue, UserProfileCriteria, IssueCandidate } from '../../src/utils/recommendation.js';

const router = Router();

// GET /api/v1/recommendations
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const profile = db.profiles.get(user.id) || {
    skills: ['JavaScript', 'HTML', 'CSS'],
    interests: ['Web Development'],
    experienceLevel: 'BEGINNER' as const
  };

  const userCriteria: UserProfileCriteria = {
    skills: profile.skills || [],
    interests: profile.interests || [],
    experienceLevel: profile.experienceLevel || 'BEGINNER'
  };

  const allIssues = Array.from(db.issues.values());

  const scoredIssues = allIssues.map(issue => {
    const candidate: IssueCandidate = {
      id: issue.id,
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
      language: issue.language,
      repoFullName: issue.repository,
      stars: issue.stars
    };

    const recommendation = scoreIssue(userCriteria, candidate);

    return {
      issue,
      recommendation
    };
  });

  // Sort by recommendation score descending
  scoredIssues.sort((a, b) => b.recommendation.score - a.recommendation.score);

  return res.json({
    success: true,
    data: {
      userCriteria,
      recommendations: scoredIssues,
      formula: 'Score = (Skill Match × 50%) + (Experience Match × 20%) + (Interest Match × 15%) + (Difficulty Match × 10%) + (Beginner Label × 5%)'
    }
  });
});

export default router;
