# OpenSourceOnboard 🚀
> **An AI-Integrated Full-Stack Platform for Open-Source Contribution Onboarding and GitHub Issue Recommendation**

OpenSourceOnboard is a real-world, production-ready full-stack application built for college computer science students, beginner developers, and first-time open-source contributors. It eliminates the intimidation barrier of large GitHub repositories by providing **personalized skill-based issue recommendations**, **grounded Gemini 3.8 Flash AI issue explanations**, and an **interactive 12-step Pull Request roadmap**.

---

## 🌟 Key Features

1. **Developer Profile Management**
   - Configure programming languages (JavaScript, TypeScript, React, Python, CSS, HTML, Node.js, etc.).
   - Select domain interests (Web Development, Developer Tools, UI/UX, Backend, Testing, Documentation).
   - Set weekly hours commitment and optional GitHub handle.

2. **Real GitHub REST API Issue Discovery**
   - Live querying of open-source issues across GitHub repositories (`facebook/react`, `vercel/next.js`, `expressjs/express`, `tailwindlabs/tailwindcss`, `freeCodeCamp`, etc.).
   - Filter by language, label (`good first issue`, `help wanted`, `documentation`), and keywords.
   - Built-in caching to gracefully handle unauthenticated GitHub API rate limits.

3. **Explainable 5-Factor Weighted Recommendation Algorithm**
   - Pure, deterministic, transparent scoring:
     $$\text{Score} = (\text{Skill Match} \times 0.50) + (\text{Experience Match} \times 0.20) + (\text{Interest Match} \times 0.15) + (\text{Difficulty Match} \times 0.10) + (\text{Beginner Label} \times 0.05)$$
   - Full mathematical breakdown viewable for every issue.
   - Identifies matched skills and missing skills / topics to learn.

4. **AI-Powered Issue Explainer (Gemini 3.8 Flash)**
   - Plain-English issue summaries.
   - Technical terminology glossary defining jargon (e.g., Hydration Mismatch, Regression Test, Atomic Commits).
   - Step-by-step investigation roadmap showing which files to inspect and how to reproduce bugs with failing tests.
   - Pre-PR quality and testing checklist.

5. **12-Step Open-Source Contribution Roadmap**
   - Standardized contributor workflow from forking, cloning, branching, testing, commit conventions, to maintainer review etiquette.
   - Interactive checklist with real-time progress percentages.
   - Direct Pull Request link tracking.

6. **Saved Bookmarks & Kanban Contribution Tracker**
   - Bookmark candidate issues with personal study notes.
   - Transition bookmarks to active contributions in one click.
   - Celebratory completion badge upon maintainer merge!

7. **Admin & Mentor Telemetry Dashboard**
   - System health metrics, dual-database status, and uptime.
   - Contributor accounts directory with skills and PR counts.
   - Recent AI query logs.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans typography.
- **Backend**: Node.js, Express.js REST API (`/api/v1/*`), Controller-Service-Route architecture.
- **AI Integration**: Google Gemini API via `@google/genai` TypeScript SDK (model: `gemini-3.8-flash`) executed strictly server-side.
- **Databases**:
  - Relational SQL: PostgreSQL entity relationship model documented via Prisma schema (`server/prisma/schema.prisma`).
  - Document Store: MongoDB document model for AI explanations, terminology glossaries, and prompt traces.
- **Authentication**: JWT token signing and verification with `bcryptjs` password hashing.
- **Testing**: Node built-in test runner (`node:test`, `node:assert/strict`) via `npx --yes tsx --test`.

---

## 📂 Project Directory Structure

```
OpenSourceOnboard/
├── docs/
│   ├── ARCHITECTURE.md          # System architecture & data flow
│   ├── DATABASE_DESIGN.md       # Dual PostgreSQL & MongoDB schemas
│   ├── API_DOCUMENTATION.md     # REST API endpoints reference
│   ├── BUILD_PROGRESS.md        # Milestone tracking log
│   └── DECISIONS.md             # Architecture Decisions Records (ADRs)
├── server/
│   ├── middleware/              # Auth & role-based middleware
│   ├── prisma/                  # schema.prisma relational model
│   ├── routes/                  # Express REST routes (/api/v1/*)
│   └── services/                # DB store, GitHub API client, Gemini AI service
├── src/
│   ├── components/              # Navbar, AuthModal, OnboardingModal, ScoreBreakdownModal
│   ├── context/                 # AuthContext & global state
│   ├── pages/                   # Landing, Dashboard, Discover, Recommended, Explainer, Guidance, Saved, Tracker, Profile, Admin
│   ├── services/                # Client API methods
│   ├── utils/                   # Recommendation engine & unit tests
│   ├── App.tsx                  # Main router shell
│   └── index.css                # Tailwind base & styles
├── index.html                   # HTML entry point
├── package.json
├── server.ts                    # Full-stack Express server with Vite middleware
└── tsconfig.json
```

---

## 🚀 Quickstart & Running Locally

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="opensourceonboard-secure-key"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Recommendation Algorithm Unit Tests
```bash
npx --yes tsx --test src/utils/recommendation.test.ts
```

---

## 🎓 College Viva & Demonstration Guide

- **Demo Student Account**:
  - Email: `alex.dev@university.edu`
  - Password: `Password123!`
  - (Or click the 1-click **"Student Demo"** button on the landing page or navbar)
- **Demo Admin Account**:
  - Email: `admin@opensourceonboard.dev`
  - Password: `Password123!`
  - (Or click the 1-click **"Marcus (Admin)"** button in the sign-in modal)
