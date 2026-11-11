import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { aiService, ExplainRequestPayload } from '../services/aiService.js';
import { db } from '../services/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'opensourceonboard-hackathon-secure-secret-2026';
const router = Router();

// POST /api/v1/ai/explain
router.post('/explain', async (req, res: Response) => {
  try {
    const { issueId, title, body, repoFullName, htmlUrl, labels } = req.body;

    if (!title || !repoFullName) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Issue title and repository full name are required.' }
      });
    }

    // Optional user ID from token
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { id: string };
        userId = decoded.id;
      } catch {
        // Continue anonymously
      }
    }

    const payload: ExplainRequestPayload = {
      issueId: issueId || `custom_${Date.now()}`,
      title,
      body: body || '',
      repoFullName,
      htmlUrl: htmlUrl || '',
      labels: labels || [],
      userId
    };

    const explanation = await aiService.explainIssue(payload);

    return res.json({
      success: true,
      data: explanation
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'AI_EXPLAIN_ERROR', message: err.message || 'Failed to explain issue with AI.' }
    });
  }
});

export default router;
