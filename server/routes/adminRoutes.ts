import { Router, Response } from 'express';
import { db } from '../services/db.js';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/admin/stats
router.get('/stats', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = Array.from(db.users.values());
  const contributions = Array.from(db.contributions.values());
  const issues = Array.from(db.issues.values());
  const aiExplanations = Array.from(db.aiExplanations.values());

  const completedContributions = contributions.filter(c => c.status === 'COMPLETED').length;
  const inProgressContributions = contributions.filter(c => c.status === 'IN_PROGRESS' || c.status === 'STARTED' || c.status === 'TESTING').length;

  return res.json({
    success: true,
    data: {
      totalUsers: users.length,
      totalIssuesCached: issues.length,
      totalContributions: contributions.length,
      completedContributions,
      inProgressContributions,
      aiExplanationsGenerated: aiExplanations.length,
      systemHealth: {
        status: 'HEALTHY',
        database: 'Connected (PostgreSQL Schema + MongoDB Document Layer)',
        llmService: process.env.GEMINI_API_KEY ? 'Active (Gemini 3.8 Flash)' : 'Demonstration Fallback Mode',
        uptimeSeconds: Math.floor(process.uptime())
      }
    }
  });
});

// GET /api/v1/admin/users
router.get('/users', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const usersWithProfiles = Array.from(db.users.values()).map(user => {
    const profile = db.profiles.get(user.id);
    const userContributions = Array.from(db.contributions.values()).filter(c => c.userId === user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      experienceLevel: profile?.experienceLevel || 'BEGINNER',
      skillsCount: profile?.skills?.length || 0,
      contributionsCount: userContributions.length
    };
  });

  return res.json({
    success: true,
    data: usersWithProfiles
  });
});

// GET /api/v1/admin/ai-queries
router.get('/ai-queries', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const explanations = Array.from(db.aiExplanations.values()).map(exp => {
    const issue = db.issues.get(exp.issueId);
    return {
      id: exp.id,
      issueId: exp.issueId,
      issueTitle: issue?.title || 'Unknown Issue',
      repo: issue?.repository || 'GitHub',
      difficulty: exp.difficulty,
      createdAt: exp.createdAt
    };
  });

  return res.json({
    success: true,
    data: explanations
  });
});

export default router;
