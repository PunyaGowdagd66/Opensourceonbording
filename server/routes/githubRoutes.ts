import { Router, Request, Response } from 'express';
import { githubService } from '../services/githubService.js';
import { db } from '../services/db.js';

const router = Router();

// GET /api/v1/github/issues
router.get('/issues', async (req: Request, res: Response) => {
  try {
    const { q, language, label, repo, sort, page, perPage } = req.query;

    const result = await githubService.searchIssues({
      q: q as string | undefined,
      language: language as string | undefined,
      label: label as string | undefined,
      repo: repo as string | undefined,
      sort: sort as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      perPage: perPage ? parseInt(perPage as string, 10) : 20
    });

    return res.json({
      success: true,
      data: {
        issues: result.issues,
        source: result.source,
        total: result.issues.length
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GITHUB_API_ERROR', message: err.message || 'Failed to retrieve GitHub issues.' }
    });
  }
});

// GET /api/v1/github/repositories
router.get('/repositories', (req: Request, res: Response) => {
  const repos = Array.from(db.issues.values()).map(issue => ({
    fullName: issue.repository,
    owner: issue.repoOwner,
    name: issue.repoName,
    language: issue.language,
    stars: issue.stars
  }));

  // Unique by fullName
  const uniqueMap = new Map<string, any>();
  for (const r of repos) {
    if (!uniqueMap.has(r.fullName)) {
      uniqueMap.set(r.fullName, r);
    }
  }

  return res.json({
    success: true,
    data: Array.from(uniqueMap.values())
  });
});

export default router;
