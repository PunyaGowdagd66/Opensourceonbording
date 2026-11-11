# OpenSourceOnboard — Database Design Documentation

## 1. Dual-Database Strategy

OpenSourceOnboard leverages a hybrid database architecture:

1. **Relational PostgreSQL (via Prisma ORM)**:
   - Enforces referential integrity, ACID transactions, and structured entity relationships for Users, Profiles, Skills, Interests, Repositories, Issues, Saved Issues, and Contribution Lifecycles.
2. **Document-Oriented MongoDB (via Mongoose Schemas)**:
   - Stores semi-structured, evolving AI artifacts: AI generated issue explanations, key terminology glossaries, prompt traces, and extracted documentation chunks.
   - Refers back to SQL entities using stable UUIDs (`userId` and `issueId`).

---

## 2. Relational Entity Relationship Model (PostgreSQL)

```
+------------------+          1:1          +-----------------------+
|      User        |---------------------->|   DeveloperProfile    |
|------------------|                       |-----------------------|
| id (PK, UUID)    |                       | id (PK, UUID)         |
| name             |                       | userId (FK, Unique)   |
| email (Unique)   |                       | experienceLevel       |
| passwordHash     |                       | githubUsername        |
| role (ADMIN/USER)|                       | bio                   |
| createdAt        |                       | weeklyHours           |
+------------------+                       +-----------------------+
        |
        | 1:N
        +-----------------------------------+-----------------------------------+
        |                                   |                                   |
        v 1:N                               v 1:N                               v 1:N
+------------------+                +------------------+                +------------------+
|    UserSkill     |                |   UserInterest   |                |    SavedIssue    |
|------------------|                |------------------|                |------------------|
| id (PK)          |                | id (PK)          |                | id (PK)          |
| userId (FK)      |                | userId (FK)      |                | userId (FK)      |
| skillName        |                | interestName     |                | issueId (FK)     |
| level            |                +------------------+                | notes            |
+------------------+                                                    | savedAt          |
                                                                        +------------------+
                                                                                |
                                                                                | N:1
                                                                                v
+------------------+          1:N          +------------------+         +------------------+
|    Repository    |---------------------->|      Issue       |<--------|   Contribution   |
|------------------|                       |------------------|   1:N   |------------------|
| id (PK, UUID)    |                       | id (PK, UUID)    |         | id (PK, UUID)    |
| githubRepoId     |                       | repositoryId (FK)|         | userId (FK)      |
| fullName (owner) |                       | githubIssueId    |         | issueId (FK)     |
| description      |                       | number           |         | status           |
| stars            |                       | title            |         | startedAt        |
| language         |                       | body             |         | completedAt      |
| htmlUrl          |                       | labels (String[])|         | prUrl            |
+------------------+                       | htmlUrl          |         +------------------+
                                           | difficulty       |                  | 1:N
                                           +------------------+                  v
                                                    | 1:N               +------------------+
                                                    v                   |  Contribution-   |
                                           +------------------+         |  ChecklistItem   |
                                           |    IssueSkill    |         |------------------|
                                           |------------------|         | id (PK)          |
                                           | id (PK)          |         | contributionIdFK |
                                           | issueId (FK)     |         | stepIndex (1-12) |
                                           | skillName        |         | title            |
                                           +------------------+         | completed        |
                                                                        | completedAt      |
                                                                        +------------------+
```

---

## 3. MongoDB Document Schemas

### Collection: `ai_explanations`
```json
{
  "_id": "ObjectId('...')",
  "issueId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "a18ef32b-91cc-4112-b987-9d02b2c3e123",
  "model": "gemini-3.8-flash",
  "summary": "Beginner-friendly explanation of the bug...",
  "problemExplanation": "Why this happens...",
  "requiredSkills": ["React", "CSS"],
  "keyTerms": [
    { "term": "Hydration Mismatch", "definition": "When server HTML differs from client..." }
  ],
  "investigationSteps": ["Clone repo", "Locate src/Navbar.tsx", "..."],
  "suggestedApproach": "Refactor the conditionally rendered element...",
  "prChecklist": ["Write unit test", "Verify in Chrome"],
  "contextSources": ["README.md", "CONTRIBUTING.md", "Issue #402"],
  "createdAt": "2026-11-11T10:00:00Z"
}
```
