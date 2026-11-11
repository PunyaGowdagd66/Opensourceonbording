# OpenSourceOnboard — Architecture Documentation

## 1. System Overview

**OpenSourceOnboard** is an AI-integrated full-stack platform designed to mentor college students and beginner developers making their first open-source software contributions on GitHub.

The platform bridges the gap between academic programming knowledge (languages like JavaScript, Python, C++, React) and practical open-source contribution practices (finding beginner-friendly issues, navigating large codebases, interpreting technical issue descriptions, and following the pull request workflow).

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 19 + Tailwind CSS + Lucide Icons + Motion                                  |
|  - Landing Page & Authentication (JWT stored securely)                            |
|  - Interactive Onboarding (Skills, Interests, Experience)                         |
|  - Real GitHub Issue Discovery (Search, Filters, Sort)                            |
|  - Explainable Content-Based Recommendation Engine Visualizer                      |
|  - AI Issue Explainer & Technical Terminology Breakdown                           |
|  - 12-Step Contribution Guidance & Interactive Tracker                            |
|  - Admin Dashboard & Analytics                                                    |
+-----------------------------------------------------------------------------------+
                                        |  REST / JSON
                                        v
+-----------------------------------------------------------------------------------+
|                            APPLICATION SERVER TIER                                |
|  Node.js + Express REST API (/api/v1/*)                                           |
|  Middleware:                                                                      |
|    - CORS & Helmet Security Headers                                               |
|    - Rate Limiting                                                                |
|    - Authentication Middleware (JWT verification)                                 |
|    - Role-based Authorization (Admin vs Student)                                  |
|    - Centralized Error Handling & Request Logging                                 |
|                                                                                   |
|  Modules / Controllers:                                                           |
|    - AuthController: Registration, Login, Session Check                           |
|    - ProfileController: User skills, interests, GitHub metadata                   |
|    - GitHubController: Real GitHub REST API integration & caching                |
|    - RecommendationService: Explainable weighted multi-criteria scoring           |
|    - AIService: Google Gemini 3.8 Flash SDK + Documentation grounding            |
|    - ContributionController: 6-stage lifecycle & 12-step checklist tracking      |
|    - AdminController: Usage stats, users, AI query metrics                        |
+-----------------------------------------------------------------------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
+-------------------------------------+   +-------------------------------------+
|         RELATIONAL SQL DATA         |   |         DOCUMENT / AI STORE         |
|  PostgreSQL via Prisma ORM Schema   |   |  MongoDB via Mongoose Patterns      |
|  - Users & DeveloperProfiles        |   |  - AI Issue Explanations            |
|  - Skills & UserSkills              |   |  - AI Chat Sessions / Queries       |
|  - Interests & UserInterests        |   |  - Cached Documentation Chunks      |
|  - Repositories & Issues            |   |    (Referenced via stable IssueId   |
|  - SavedIssues & Contributions      |   |     and UserId from SQL)            |
|  - ContributionChecklistItems       |   |                                     |
+-------------------------------------+   +-------------------------------------+
```

## 2. Request-Response Lifecycle

1. **Client Request**: The React client dispatches HTTP requests via `fetch` to `/api/v1/*` with `Authorization: Bearer <token>`.
2. **Middleware Pipeline**:
   - `helmet` applies HTTP security headers.
   - `cors` verifies allowed origins.
   - `express.json` parses JSON payloads.
   - `authMiddleware` decodes and verifies the JWT, attaching the verified user payload (`req.user`) to the request.
   - `roleMiddleware` restricts administrative endpoints to users with role `ADMIN`.
3. **Controller & Service Layer**:
   - Controllers validate parameters and invoke business services (`githubService`, `recommendationService`, `aiService`, `contributionService`).
   - Pure algorithmic scoring (weighted recommendation algorithm) runs deterministically.
   - External API calls to GitHub REST API include in-memory cache layers to respect rate limits.
   - External AI calls to Google Gemini API use `@google/genai` server-side client with model `gemini-3.8-flash`.
4. **Data Access Layer**:
   - Relational entities follow normalized foreign key schemas.
   - Unstructured AI explanations are stored with relational references.
5. **Unified Response**:
   - All endpoints return `{ success: true, data: ... }` or `{ success: false, error: ... }`.

## 3. Security Architecture

- **Token Security**: Tokens are signed using HMAC SHA-256 with an environment secret (`JWT_SECRET`).
- **Password Protection**: Passwords are never stored in plaintext; hashed with `bcryptjs` (salt rounds = 10).
- **Server-Side API Key Isolation**: Neither `GEMINI_API_KEY` nor GitHub tokens are ever leaked to the browser bundle.
- **Untrusted Input Handling**: GitHub issue content and repository text are treated as untrusted strings and sanitized before rendering and AI prompt injection.
