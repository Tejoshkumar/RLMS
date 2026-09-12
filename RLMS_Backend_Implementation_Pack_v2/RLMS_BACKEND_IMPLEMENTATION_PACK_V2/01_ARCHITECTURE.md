# Railway Locker Management System (RLMS)
## Backend Architecture — MVP Baseline

**Status:** Implementation baseline  
**Backend team:** 3 members  
**Other team members:** 1 frontend-focused, 1 documentation/other work  
**Goal:** Get a reliable working full-stack college project quickly without over-engineering.

## 1. Target architecture
```text
Existing React + Vite Frontend
          |
          | HTTP / JSON
          v
Node.js + Express REST API
          |
          +--> JWT auth middleware
          +--> Admin middleware
          +--> Controllers / business logic
          |
          v
       Mongoose
          |
          v
     MongoDB Atlas
```

Technology:
- Node.js + Express
- MongoDB Atlas + Mongoose
- bcrypt
- jsonwebtoken
- cors
- dotenv
- REST + JSON

## 2. Core collections
Only these four collections are required:
`users`, `stations`, `lockers`, `bookings`.

## 3. Authentication
Use JWT for the MVP and bcrypt for password hashing.
- Public registration creates only `user` accounts.
- Login returns JWT + safe user information.
- Protected routes verify `Authorization: Bearer <token>`.
- Admin authorization uses the backend/database role.
- Password hashes are never returned.

## 4. Critical booking rule
A locker is **time-based available**, not permanently occupied.

Example:
```text
Locker 101
Sept 10, 10:00–13:00 -> booked
Sept 10, 11:00–14:00 -> NOT AVAILABLE
Sept 10, 13:00–16:00 -> AVAILABLE
Sept 11, 10:00–13:00 -> AVAILABLE
```

Conflict:
`existingStart < requestedEnd AND requestedStart < existingEnd`

Only active bookings for the same locker/date block availability.

The server checks availability through the availability API and again immediately before creating a booking.

## 5. Frontend migration
Do not redesign the current frontend.
```text
localStorage auth      -> /api/auth/*
mock locker data       -> /api/stations + /api/lockers
localStorage bookings  -> /api/bookings/*
```
MongoDB/backend becomes the persistence source of truth.

## 6. MVP non-goals
Do not implement unless explicitly required:
- payment gateway
- SMS/email OTP
- password-reset email service
- QR/IoT locker hardware
- real luggage scanning
- WebSockets
- Redis
- microservices
- complex analytics
- complex staff permissions
- separate payment/notification/audit collections

## 7. Definition of done
- register/login works
- bcrypt passwords
- JWT protected APIs
- admin authorization
- stations/lockers from MongoDB
- server-side date/time availability
- overlapping bookings rejected with HTTP 409
- bookings persist
- users view/cancel bookings
- basic admin operations work
- two sessions share MongoDB state
- localStorage is not the persistence source of truth
