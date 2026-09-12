# RLMS Development Rules

## 1. Mandatory scaffold-first gate
No module-specific Antigravity work before the shared skeleton is committed to `develop` and pulled.

Baseline:
```text
backend/server.js
backend/package.json
backend/.env.example
backend/config/db.js
backend/models/User.js
backend/models/Station.js
backend/models/Locker.js
backend/models/Booking.js
backend/routes/
backend/controllers/
backend/middleware/
GET /api/health
working MongoDB connection
```

## 2. Exact file names
Use the paths in `04_TEAM_TASKS.md`. Do not invent alternate naming conventions.

## 3. Pinned dependencies
All backend members must use exactly these versions in `package.json`:
```json
{
  "dependencies": {
    "bcrypt": "6.0.0",
    "cors": "2.8.5",
    "dotenv": "17.2.2",
    "express": "5.1.0",
    "jsonwebtoken": "9.0.2",
    "mongoose": "8.18.0"
  },
  "devDependencies": {
    "nodemon": "3.1.10"
  }
}
```
If a version must change: update `package.json`, test, record the reason in `07_DECISIONS_LOG.md`, and notify all backend members.

## 4. Paste specs into the first Antigravity message
Every new Antigravity session must receive, directly in the first message:
- `01_ARCHITECTURE.md`
- `02_DATABASE_SCHEMA.md`
- `03_API_SPEC.md`
- `05_DEVELOPMENT_RULES.md`
- relevant ownership section from `04_TEAM_TASKS.md`
- relevant current entries from `07_DECISIONS_LOG.md`

The agent must still inspect the repository. Do not rely only on repository discovery.

## 5. Living decision log
Any approved deviation from architecture/schema/API/file ownership/dependency versions/business rules must be appended to `07_DECISIONS_LOG.md` with:
```text
Date:
Decision:
Reason:
Affected files:
Approved by:
```

## 6. AI agents implement, not architect
If an AI agent believes an architectural change is required, it must stop and ask the backend lead before broad changes.

## 7. Frontend
Do not redesign or remove working frontend functionality.

## 8. Backend is source of truth
Never trust frontend role, user ID, price, availability, or validation.

## 9. Passwords/JWT
Use bcrypt. Never store plain text. Never expose password hashes. Verify JWT server-side. Admin role comes from verified backend identity.

## 10. Booking overlap
For same locker/date:
`existingStart < requestedEnd AND requestedStart < existingEnd`

Re-check immediately before booking creation. Return HTTP 409 on conflict.

## 11. Time format
Date: `YYYY-MM-DD`
Time: `HH:mm`

## 12. Database
MongoDB Atlas + Mongoose. React never connects directly to MongoDB.

## 13. Environment
```env
PORT=5000
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
```
Never commit `.env`; commit `.env.example`.

## 14. No unnecessary features
No payment, OTP, email services, Redis, WebSockets, microservices, IoT, etc. without explicit new requirements.

## 15. Testing
After meaningful changes:
- start backend
- test health
- test affected API
- test error path
- verify MongoDB persistence

## 16. Git
No direct commits to `main`. Feature branches merge into `develop`.

## 17. Completion
A feature is complete only when backend behavior, database persistence, error handling, and relevant integration work.
