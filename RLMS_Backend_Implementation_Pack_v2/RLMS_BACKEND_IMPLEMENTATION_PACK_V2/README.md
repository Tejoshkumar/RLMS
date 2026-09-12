# RLMS Backend Implementation Pack v2

This pack is the shared implementation contract for the **3 backend members**.

## Required workflow

1. Put these files in the RLMS repository root.
2. Member 1 creates the base backend scaffold.
3. Connect scaffold to MongoDB Atlas.
4. Add `GET /api/health`.
5. Verify it runs.
6. Commit scaffold to `develop`.
7. Members 2 and 3 pull `develop`.
8. Only then start module-specific Antigravity sessions.
9. Paste the relevant specification directly into the first Antigravity message.
10. Use `07_DECISIONS_LOG.md` for approved deviations.

## Database connection

Use one shared MongoDB Atlas development database.

Each developer keeps a local `.env`:
```env
PORT=5000
MONGO_URI=<shared-development-uri>
JWT_SECRET=<shared-development-secret>
CLIENT_URL=http://localhost:5173
```

Never commit `.env`. Commit `.env.example`.

The React frontend never connects directly to MongoDB. Express/Mongoose owns the connection.

## Team
```text
5 total
3 backend
1 frontend
1 documentation/other
```

## Scope
This is intentionally an MVP. Do not expand it into an enterprise system.
