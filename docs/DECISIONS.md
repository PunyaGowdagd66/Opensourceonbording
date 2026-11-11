# OpenSourceOnboard — Architecture Decisions Record (ADR)

## ADR-001: Express with Vite Middleware for Full-Stack Integration
- **Context**: The application requires backend REST endpoints (`/api/v1/*`), secure server-side Gemini AI integration, real GitHub API caching, and a React 19 client.
- **Decision**: Serve both the REST API and the Vite development server using an Express server (`server.ts`).
- **Consequences**: Zero CORS issues in dev, unified port 3000, secure server-side secrets handling.

## ADR-002: Server-Side Gemini API SDK (`@google/genai`)
- **Context**: The platform provides AI Issue Explanations and terminology simplification.
- **Decision**: Keep the `GEMINI_API_KEY` exclusively on the server and use `ai.models.generateContent` with `gemini-3.8-flash` via `@google/genai` with `User-Agent: aistudio-build`.
- **Consequences**: No API keys exposed to browser bundles, robust error handling with deterministic fallback when API credentials are unconfigured.

## ADR-003: Explainable Weighted Recommendation Algorithm
- **Context**: Students need to understand *why* an open-source issue is recommended to them.
- **Decision**: Implement a transparent, explainable scoring formula:
  `Score = (Skill Match × 0.50) + (Experience Match × 0.20) + (Interest Match × 0.15) + (Difficulty Match × 0.10) + (Beginner Label × 0.05)`
- **Consequences**: Fully explainable, unit-tested without black-box ML dependencies.

## ADR-004: Dual Relational & Document Schema Architecture
- **Context**: Need strong ACID relationships for users, profiles, skills, and contributions, while AI explanations and chat context are semi-structured.
- **Decision**: PostgreSQL schema for structured user & contribution workflows; MongoDB document schema pattern for AI generation traces and summaries.
