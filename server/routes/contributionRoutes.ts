import { Router, Response } from 'express';
import { db, SavedIssueEntity, ContributionEntity, DEFAULT_12_STEPS } from '../services/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// =================== SAVED ISSUES ===================

// GET /api/v1/saved-issues
router.get('/saved-issues', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userSaved = Array.from(db.savedIssues.values())
    .filter(s => s.userId === userId)
    .map(s => {
      const issue = db.issues.get(s.issueId);
      return {
        ...s,
        issue
      };
    });

  return res.json({
    success: true,
    data: userSaved
  });
});

// POST /api/v1/saved-issues
router.post('/saved-issues', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { issueId, notes, issueData } = req.body;

  if (!issueId) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Issue ID is required.' }
    });
  }

  // If client passed full issueData (e.g. from GitHub live search), register it in db
  if (issueData && !db.issues.has(issueId)) {
    db.issues.set(issueId, {
      id: issueId,
      githubIssueId: issueData.githubIssueId || Math.floor(Math.random() * 90000),
      repository: issueData.repository || 'unknown/repo',
      repoOwner: issueData.repoOwner || 'unknown',
      repoName: issueData.repoName || 'repo',
      title: issueData.title,
      body: issueData.body || '',
      htmlUrl: issueData.htmlUrl || '',
      language: issueData.language || 'JavaScript',
      labels: issueData.labels || [],
      state: 'open',
      commentsCount: issueData.commentsCount || 0,
      stars: issueData.stars || 100,
      createdAt: new Date().toISOString()
    });
  }

  // Check duplicate
  for (const s of db.savedIssues.values()) {
    if (s.userId === userId && s.issueId === issueId) {
      return res.json({
        success: true,
        data: {
          ...s,
          issue: db.issues.get(issueId)
        },
        message: 'Issue is already saved.'
      });
    }
  }

  const newSaved: SavedIssueEntity = {
    id: `sav_${Date.now()}`,
    userId,
    issueId,
    notes: notes || '',
    savedAt: new Date().toISOString()
  };

  db.savedIssues.set(newSaved.id, newSaved);

  return res.status(201).json({
    success: true,
    data: {
      ...newSaved,
      issue: db.issues.get(issueId)
    }
  });
});

// DELETE /api/v1/saved-issues/:id
router.delete('/saved-issues/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  let targetKey: string | undefined;
  for (const [key, s] of db.savedIssues.entries()) {
    if ((s.id === id || s.issueId === id) && s.userId === userId) {
      targetKey = key;
      break;
    }
  }

  if (targetKey) {
    db.savedIssues.delete(targetKey);
    return res.json({ success: true, message: 'Issue removed from saved list.' });
  }

  return res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Saved issue not found.' }
  });
});

// =================== CONTRIBUTIONS ===================

// GET /api/v1/contributions
router.get('/contributions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userContributions = Array.from(db.contributions.values())
    .filter(c => c.userId === userId)
    .map(c => ({
      ...c,
      issue: db.issues.get(c.issueId)
    }));

  return res.json({
    success: true,
    data: userContributions
  });
});

// POST /api/v1/contributions
router.post('/contributions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { issueId, notes, issueData } = req.body;

  if (!issueId) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Issue ID is required.' }
    });
  }

  if (issueData && !db.issues.has(issueId)) {
    db.issues.set(issueId, {
      id: issueId,
      githubIssueId: issueData.githubIssueId || Math.floor(Math.random() * 90000),
      repository: issueData.repository || 'unknown/repo',
      repoOwner: issueData.repoOwner || 'unknown',
      repoName: issueData.repoName || 'repo',
      title: issueData.title,
      body: issueData.body || '',
      htmlUrl: issueData.htmlUrl || '',
      language: issueData.language || 'JavaScript',
      labels: issueData.labels || [],
      state: 'open',
      commentsCount: issueData.commentsCount || 0,
      stars: issueData.stars || 100,
      createdAt: new Date().toISOString()
    });
  }

  // Check if existing contribution
  for (const c of db.contributions.values()) {
    if (c.userId === userId && c.issueId === issueId) {
      return res.json({
        success: true,
        data: {
          ...c,
          issue: db.issues.get(issueId)
        },
        message: 'Contribution journey already active.'
      });
    }
  }

  const newContrib: ContributionEntity = {
    id: `con_${Date.now()}`,
    userId,
    issueId,
    status: 'STARTED',
    startedAt: new Date().toISOString(),
    notes: notes || '',
    checklist: DEFAULT_12_STEPS.map(step => ({
      ...step,
      completed: step.stepIndex === 1,
      completedAt: step.stepIndex === 1 ? new Date().toISOString() : undefined
    }))
  };

  db.contributions.set(newContrib.id, newContrib);

  return res.status(201).json({
    success: true,
    data: {
      ...newContrib,
      issue: db.issues.get(issueId)
    }
  });
});

// PATCH /api/v1/contributions/:id
router.patch('/contributions/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { status, prUrl, notes } = req.body;

  let contrib = db.contributions.get(id);
  if (!contrib || contrib.userId !== userId) {
    // Check by issueId
    for (const c of db.contributions.values()) {
      if (c.issueId === id && c.userId === userId) {
        contrib = c;
        break;
      }
    }
  }

  if (!contrib) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Contribution record not found.' }
    });
  }

  if (status) {
    contrib.status = status;
    if (status === 'COMPLETED' && !contrib.completedAt) {
      contrib.completedAt = new Date().toISOString();
      // Mark all checklist steps completed
      contrib.checklist = contrib.checklist.map(step => ({
        ...step,
        completed: true,
        completedAt: step.completedAt || new Date().toISOString()
      }));
    }
  }

  if (prUrl !== undefined) contrib.prUrl = prUrl.trim();
  if (notes !== undefined) contrib.notes = notes.trim();

  db.contributions.set(contrib.id, contrib);

  return res.json({
    success: true,
    data: {
      ...contrib,
      issue: db.issues.get(contrib.issueId)
    }
  });
});

// PATCH /api/v1/contributions/:id/checklist/:stepIndex
router.patch('/contributions/:id/checklist/:stepIndex', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id, stepIndex } = req.params;
  const targetStep = parseInt(stepIndex, 10);
  const { completed } = req.body;

  let contrib = db.contributions.get(id);
  if (!contrib || contrib.userId !== userId) {
    for (const c of db.contributions.values()) {
      if (c.issueId === id && c.userId === userId) {
        contrib = c;
        break;
      }
    }
  }

  if (!contrib) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Contribution record not found.' }
    });
  }

  contrib.checklist = contrib.checklist.map(step => {
    if (step.stepIndex === targetStep) {
      const nextCompleted = completed !== undefined ? Boolean(completed) : !step.completed;
      return {
        ...step,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined
      };
    }
    return step;
  });

  // Calculate new status based on checklist progression
  const completedCount = contrib.checklist.filter(s => s.completed).length;
  if (completedCount === 12) {
    contrib.status = 'COMPLETED';
    if (!contrib.completedAt) contrib.completedAt = new Date().toISOString();
  } else if (completedCount >= 10) {
    contrib.status = 'PR_CREATED';
  } else if (completedCount >= 8) {
    contrib.status = 'TESTING';
  } else if (completedCount >= 5) {
    contrib.status = 'IN_PROGRESS';
  } else if (completedCount >= 2) {
    contrib.status = 'STARTED';
  }

  db.contributions.set(contrib.id, contrib);

  return res.json({
    success: true,
    data: {
      ...contrib,
      issue: db.issues.get(contrib.issueId)
    }
  });
});

export default router;
