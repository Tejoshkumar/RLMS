# RLMS REST API Specification — MVP

Base URL:
`http://localhost:5000/api`

All request/response bodies use JSON.

## Standard responses
Success:
```json
{"success": true, "message": "Optional message", "data": {}}
```
Error:
```json
{"success": false, "message": "Human-readable message"}
```

## Auth
`POST /auth/register`
`POST /auth/login`
`GET /auth/me`

Login response includes `token` and safe `user`.

## Users
`GET /users/profile`
`PUT /users/profile`
`PUT /users/change-password`

## Stations
`GET /stations`

## Lockers
`GET /lockers`
`GET /lockers/:id`
`POST /lockers` — admin
`PUT /lockers/:id/status` — admin
`DELETE /lockers/:id` — admin

Optional:
`GET /lockers?stationId=...&size=medium`

## Availability
`GET /lockers/:id/availability?date=2026-09-10&startTime=10:00&endTime=13:00`

Available:
```json
{"success":true,"data":{"available":true}}
```

Unavailable:
```json
{
  "success":true,
  "data":{
    "available":false,
    "message":"Locker is already booked for the selected time.",
    "conflict":{"startTime":"10:00","endTime":"13:00"}
  }
}
```

## Bookings
`POST /bookings` — protected
`GET /bookings/my` — protected
`GET /bookings/:id` — owner/admin
`PUT /bookings/:id/cancel` — owner/admin

Create request:
```json
{
  "lockerId":"...",
  "holderName":"Tejosh",
  "phone":"9876543210",
  "bookingDate":"2026-09-10",
  "startTime":"10:00",
  "durationHours":3
}
```

Backend calculates end time and price. It MUST re-check locker status and active overlapping bookings before insert. Conflict returns HTTP 409:
```json
{"success":false,"message":"Locker is no longer available for the selected time."}
```

## Admin
`GET /admin/users`
`GET /admin/bookings`
`GET /admin/stats`

Admin stats may include total users, lockers, available/out-of-service lockers, active bookings and basic revenue.

## Status codes
`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

## Contract rule
If a contract changes: update this file, append to `07_DECISIONS_LOG.md`, notify backend lead, and update affected code.
