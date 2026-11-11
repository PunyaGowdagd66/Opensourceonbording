import { db, IssueEntity } from './db.js';

interface GitHubSearchOptions {
  q?: string;
  language?: string;
  label?: string;
  repo?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

// In-memory cache for GitHub API requests to respect rate limits
const cache = new Map<string, { timestamp: number; data: IssueEntity[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class GitHubService {
  /**
   * Search GitHub issues using official GitHub REST API with graceful caching
   */
  async searchIssues(options: GitHubSearchOptions): Promise<{ issues: IssueEntity[]; source: 'api' | 'cache' | 'curated' }> {
    const cacheKey = JSON.stringify(options);
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return { issues: cached.data, source: 'cache' };
    }

    // Build GitHub query string
    const queryParts: string[] = ['is:issue', 'is:open'];

    if (options.label) {
      queryParts.push(`label:"${options.label}"`);
    } else {
      // Default to beginner-friendly labels if none specified
      queryParts.push('label:"good first issue"');
    }

    if (options.language) {
      queryParts.push(`language:${options.language}`);
    }

    if (options.repo) {
      queryParts.push(`repo:${options.repo}`);
    }

    if (options.q && options.q.trim()) {
      queryParts.push(options.q.trim());
    }

    const githubQuery = encodeURIComponent(queryParts.join(' '));
    const sortParam = options.sort ? `&sort=${options.sort}` : '&sort=created&order=desc';
    const perPage = options.perPage || 20;
    const url = `https://api.github.com/search/issues?q=${githubQuery}${sortParam}&per_page=${perPage}`;

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OpenSourceOnboard-App'
      };

      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const body = await res.json();
        if (body.items && Array.isArray(body.items) && body.items.length > 0) {
          const mapped: IssueEntity[] = body.items.map((item: any) => {
            const repoUrlParts = item.repository_url?.split('/') || [];
            const repoOwner = repoUrlParts[repoUrlParts.length - 2] || 'github';
            const repoName = repoUrlParts[repoUrlParts.length - 1] || 'repo';
            const fullName = `${repoOwner}/${repoName}`;

            return {
              id: `gh_${item.id}`,
              githubIssueId: item.id,
              repository: fullName,
              repoOwner,
              repoName,
              title: item.title,
              body: item.body || 'No description provided.',
              htmlUrl: item.html_url,
              language: options.language || 'JavaScript',
              labels: (item.labels || []).map((l: any) => (typeof l === 'string' ? l : l.name)),
              state: item.state || 'open',
              commentsCount: item.comments || 0,
              stars: 1000,
              createdAt: item.created_at
            };
          });

          // Cache result
          cache.set(cacheKey, { timestamp: Date.now(), data: mapped });
          // Also register in db store
          for (const item of mapped) {
            db.issues.set(item.id, item);
          }

          return { issues: mapped, source: 'api' };
        }
      }
    } catch (err) {
      console.warn('GitHub API live request timed out or rate-limited. Falling back to curated store.', err);
    }

    // Curated local issues matching filters
    const allLocal = Array.from(db.issues.values());
    let filtered = allLocal;

    if (options.language) {
      filtered = filtered.filter(i => i.language.toLowerCase() === options.language?.toLowerCase());
    }

    if (options.label) {
      filtered = filtered.filter(i => i.labels.some(l => l.toLowerCase().includes(options.label!.toLowerCase())));
    }

    if (options.q) {
      const qLower = options.q.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(qLower) ||
        i.body.toLowerCase().includes(qLower) ||
        i.repository.toLowerCase().includes(qLower)
      );
    }

    if (filtered.length === 0) {
      filtered = allLocal; // Return all curated if filter was too narrow
    }

    return { issues: filtered, source: 'curated' };
  }

  /**
   * Retrieves README and CONTRIBUTING guidelines from GitHub
   */
  async getRepoDocs(owner: string, repo: string): Promise<{ readme?: string; contributing?: string }> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'OpenSourceOnboard-App'
      };
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers,
        signal: controller.signal
      }).catch(() => null);

      const contribRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/CONTRIBUTING.md`, {
        headers,
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeout);

      const readmeText = readmeRes && readmeRes.ok ? await readmeRes.text() : undefined;
      const contribText = contribRes && contribRes.ok ? await contribRes.text() : undefined;

      return {
        readme: readmeText ? readmeText.slice(0, 3000) : undefined,
        contributing: contribText ? contribText.slice(0, 3000) : undefined
      };
    } catch {
      return {};
    }
  }
}

export const githubService = new GitHubService();
