# OpenSourceOnboard — REST API Documentation

Base URL: `/api/v1`

All responses follow standard JSON structures:
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new developer account.
- **Request Body**:
  ```json
  {
    "name": "Alex River",
    "email": "alex.dev@university.edu",
    "password": "Password123!"
  }
  ```
- **Response**: `201 Created` with JWT token and sanitized user profile.

### `POST /api/v1/auth/login`
Authenticates existing developer or admin.
- **Request Body**:
  ```json
  {
    "email": "alex.dev@university.edu",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` with JWT token and user profile.

### `GET /api/v1/auth/me`
Fetches active user details and profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 2. Developer Profile Endpoints

### `GET /api/v1/profile`
Fetches current developer profile with skills and interests.

### `PUT /api/v1/profile`
Updates profile details:
```json
{
  "skills": ["JavaScript", "React", "CSS"],
  "interests": ["Web Development", "Developer Tools"],
  "experienceLevel": "BEGINNER",
  "githubUsername": "alexriver-dev",
  "bio": "CS Sophomore eager to make first open source PR!"
}
```

---

## 3. GitHub Issue Discovery

### `GET /api/v1/github/issues`
Queries GitHub REST API with real search, caching, and fallback:
- **Query Params**:
  - `q`: search keyword
  - `language`: filter by language (e.g., JavaScript, Python, TypeScript)
  - `label`: filter by label (e.g., `good first issue`, `help wanted`)
  - `repo`: specific repo name
  - `sort`: `created`, `updated`, `reactions`, `comments`

---

## 4. Recommendation Engine

### `GET /api/v1/recommendations`
Runs the explainable weighted recommendation algorithm against discovered issues and user skills:
- **Response**: List of scored issues with:
  - `recommendationScore`: 0-100 score
  - `breakdown`: Component scores (Skill Match, Experience, Interest, Difficulty, Beginner Label)
  - `matchedSkills`: Array of overlapping skills
  - `missingSkills`: Skills required by issue but not yet in profile
  - `recommendationReason`: Human-readable explanation of why this was recommended

---

## 5. AI Issue Explainer

### `POST /api/v1/ai/explain`
Generates beginner-friendly explanation via Gemini 3.8 Flash model.
- **Request Body**:
  ```json
  {
    "issueId": "string",
    "title": "string",
    "body": "string",
    "repoFullName": "string",
    "htmlUrl": "string"
  }
  ```
- **Response**:
  ```json
  {
    "summary": "...",
    "problemExplanation": "...",
    "requiredSkills": ["React", "CSS"],
    "keyTerms": [{ "term": "Hydration", "definition": "..." }],
    "investigationSteps": ["Step 1", "Step 2"],
    "suggestedApproach": "...",
    "prChecklist": ["Step 1", "Step 2"]
  }
  ```

---

## 6. Saved Issues & Contributions

### `GET /api/v1/saved-issues`
Returns user's bookmarked issues.

### `POST /api/v1/saved-issues`
Saves an issue for later.

### `DELETE /api/v1/saved-issues/:id`
Removes an issue from saved list.

### `GET /api/v1/contributions`
Returns all active and completed contributions for current user.

### `POST /api/v1/contributions`
Starts a new contribution journey for an issue.

### `PATCH /api/v1/contributions/:id`
Updates contribution status (`STARTED`, `IN_PROGRESS`, `TESTING`, `PR_CREATED`, `COMPLETED`).

### `PATCH /api/v1/contributions/:id/checklist/:stepIndex`
Toggles completion of a step in the 12-step contribution checklist.

---

## 7. Admin Endpoints

### `GET /api/v1/admin/stats`
(Admin only) Returns aggregate users, issues analyzed, active contributions, and AI call metrics.
