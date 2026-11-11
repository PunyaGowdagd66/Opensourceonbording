import { Router, Response } from 'express';
import { db, ProfileEntity } from '../services/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/profile
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let profile = db.profiles.get(user.id);
  if (!profile) {
    profile = {
      id: `prof_${Date.now()}`,
      userId: user.id,
      experienceLevel: 'BEGINNER',
      githubUsername: '',
      bio: '',
      weeklyHours: 5,
      skills: ['JavaScript', 'HTML', 'CSS'],
      interests: ['Web Development'],
      updatedAt: new Date().toISOString()
    };
    db.profiles.set(user.id, profile);
  }

  return res.json({
    success: true,
    data: profile
  });
});

// PUT /api/v1/profile
router.put('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const existing = db.profiles.get(user.id) || {
    id: `prof_${Date.now()}`,
    userId: user.id,
    experienceLevel: 'BEGINNER' as const,
    githubUsername: '',
    bio: '',
    weeklyHours: 5,
    skills: [],
    interests: [],
    updatedAt: new Date().toISOString()
  };

  const {
    experienceLevel,
    githubUsername,
    bio,
    weeklyHours,
    skills,
    interests
  } = req.body;

  const updated: ProfileEntity = {
    ...existing,
    experienceLevel: experienceLevel || existing.experienceLevel,
    githubUsername: githubUsername !== undefined ? githubUsername.trim() : existing.githubUsername,
    bio: bio !== undefined ? bio.trim() : existing.bio,
    weeklyHours: weeklyHours !== undefined ? Number(weeklyHours) : existing.weeklyHours,
    skills: Array.isArray(skills) ? skills : existing.skills,
    interests: Array.isArray(interests) ? interests : existing.interests,
    updatedAt: new Date().toISOString()
  };

  db.profiles.set(user.id, updated);

  return res.json({
    success: true,
    data: updated
  });
});

export default router;
