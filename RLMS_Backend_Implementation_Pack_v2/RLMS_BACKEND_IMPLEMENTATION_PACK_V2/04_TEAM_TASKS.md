# RLMS Backend Team Plan — 3 Backend Members

## Team structure
```text
Total team = 5
├── 3 members -> Backend
├── 1 member  -> Frontend
└── 1 member  -> Documentation / other
```

## ABSOLUTE ORDER — SCAFFOLD FIRST

**Nobody starts their module-specific Antigravity session until the base skeleton is committed to `develop` and pulled locally.**

Required baseline:
```text
backend/
  server.js
  package.json
  .env.example
  config/db.js
  models/User.js
  models/Station.js
  models/Locker.js
  models/Booking.js
  routes/
  controllers/
  middleware/
```

`server.js` must:
- start successfully
- connect to MongoDB through `db.js`
- expose `GET /api/health`
- return successful JSON

After this commit:
1. Member 1 commits scaffold to `develop`.
2. Members 2 and 3 pull `develop`.
3. Only then do module-specific Antigravity sessions begin.

**No exceptions.**

## Exact file/path ownership

| Path | Owner | Purpose |
|---|---|---|
| `backend/server.js` | Member 1 | Express bootstrap |
| `backend/config/db.js` | Member 1 | MongoDB connection |
| `backend/models/User.js` | Member 1 | User schema |
| `backend/models/Station.js` | Member 2 | Station schema |
| `backend/models/Locker.js` | Member 2 | Locker schema |
| `backend/models/Booking.js` | Member 3 | Booking schema |
| `backend/controllers/authController.js` | Member 1 | Register/login/me |
| `backend/controllers/userController.js` | Member 1 | Profile/password |
| `backend/controllers/stationController.js` | Member 2 | Station API |
| `backend/controllers/lockerController.js` | Member 2 | Locker API |
| `backend/controllers/availabilityController.js` | Member 2 | Availability API |
| `backend/controllers/bookingController.js` | Member 3 | Booking/cancel/history |
| `backend/controllers/adminController.js` | Member 3 | Admin booking/stats |
| `backend/routes/authRoutes.js` | Member 1 | Auth routes |
| `backend/routes/userRoutes.js` | Member 1 | User routes |
| `backend/routes/stationRoutes.js` | Member 2 | Station routes |
| `backend/routes/lockerRoutes.js` | Member 2 | Locker + availability routes |
| `backend/routes/bookingRoutes.js` | Member 3 | Booking routes |
| `backend/routes/adminRoutes.js` | Member 3 | Admin routes |
| `backend/middleware/auth.js` | Member 1 | JWT verification |
| `backend/middleware/admin.js` | Member 1 | Admin authorization |
| `backend/middleware/errorHandler.js` | Member 1 | Error handling |
| `backend/seed/seed.js` | Member 2 | Station/locker seed |
| `backend/package.json` | Member 1 | Shared dependencies |
| `backend/.env.example` | Member 1 | Environment template |

**One file = one owner.** Another member changes an owned file only when required for integration, after informing the owner.

## Member 1 — Backend Lead / Auth / Infrastructure
- scaffold
- Express
- MongoDB connection
- User model
- auth/user controllers and routes
- JWT/admin middleware
- error handler
- package.json
- final integration

## Member 2 — Station / Locker / Availability / Seed
- Station model
- Locker model
- station/locker controllers and routes
- availability controller
- seed data

## Member 3 — Booking / Admin
- Booking model
- booking controller/routes
- overlap logic
- booking creation conflict check
- cancellation/history
- admin booking/stats

## Git
Branches:
```text
main
develop
feature/auth
feature/lockers
feature/bookings
```
No direct commits to `main`.

Before merge:
1. pull latest `develop`
2. resolve conflicts
3. run backend
4. test affected endpoints
5. commit
6. PR into `develop`

## Dependency order
```text
Member 1 scaffold
      ↓
develop
      ↓
Members 2 + 3 pull
      ↓
parallel module work
      ↓
frontend integration
      ↓
testing
```
