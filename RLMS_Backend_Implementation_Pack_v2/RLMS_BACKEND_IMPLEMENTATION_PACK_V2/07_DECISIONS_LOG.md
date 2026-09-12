# RLMS Decisions Log

Living project record for approved deviations from:
- architecture
- database schema
- API contracts
- file ownership
- dependency versions
- booking rules
- team workflow

## Entry format
```text
Date:
Decision:
Reason:
Affected files:
Approved by:
```

---

### 2026-09-06 — Shared database
**Decision:** Use one MongoDB Atlas development database with Mongoose.  
**Reason:** MongoDB is in the syllabus and provides a shared source of truth.  
**Affected files:** `01_ARCHITECTURE.md`, `02_DATABASE_SCHEMA.md`, `05_DEVELOPMENT_RULES.md`  
**Approved by:** Project team

### 2026-09-06 — JWT authentication
**Decision:** Use JWT + bcrypt for MVP authentication.  
**Reason:** Simple REST integration and easy demonstration.  
**Affected files:** `01_ARCHITECTURE.md`, `03_API_SPEC.md`  
**Approved by:** Project team

### 2026-09-06 — Time-based locker availability
**Decision:** A booking blocks only overlapping time on the same date.  
**Reason:** Locker must become available after its booked interval.  
**Affected files:** `01_ARCHITECTURE.md`, `02_DATABASE_SCHEMA.md`, `03_API_SPEC.md`  
**Approved by:** Project team

### 2026-09-06 — Scaffold-first
**Decision:** Module-specific Antigravity implementation starts only after the shared skeleton is committed to `develop` and pulled.  
**Reason:** Prevent multiple agents from inventing conflicting structures.  
**Affected files:** `04_TEAM_TASKS.md`, `05_DEVELOPMENT_RULES.md`, `06_ANTIGRAVITY_MASTER_PROMPT.md`  
**Approved by:** Project team

### 2026-09-06 — Individual Antigravity sessions
**Decision:** Each backend member may use their own Antigravity account/session.  
**Reason:** Shared Git/specifications provide synchronization without shared AI chat context.  
**Affected files:** `04_TEAM_TASKS.md`, `06_ANTIGRAVITY_MASTER_PROMPT.md`  
**Approved by:** Project team

### 2026-09-06 — Pinned dependencies
**Decision:** Pin exact backend dependency versions in `package.json`.  
**Reason:** Prevent different AI sessions/accounts from resolving different dependency versions.  
**Affected files:** `05_DEVELOPMENT_RULES.md`, `04_TEAM_TASKS.md`  
**Approved by:** Project team
