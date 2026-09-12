# RLMS Database Schema — MVP

## Database
MongoDB Atlas database:
`railway_locker_db`

Collections:
`users`, `stations`, `lockers`, `bookings`

## User
```js
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  password: String, // bcrypt hash only
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```
- email unique/lowercase
- public registration always creates `user`
- admin accounts are seeded/created by the team
- never expose password

## Station
```js
{
  _id: ObjectId,
  code: String,
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```
`code` unique. Seed existing prototype stations.

## Locker
```js
{
  _id: ObjectId,
  code: String,
  stationId: ObjectId,
  zone: String,
  size: "small" | "medium" | "large",
  pricePerBlock: Number,
  status: "available" | "out_of_service",
  createdAt: Date,
  updatedAt: Date
}
```
`(stationId, code)` unique. Never use permanent `occupied` status.

## Booking
```js
{
  _id: ObjectId,
  userId: ObjectId,
  lockerId: ObjectId,
  holderName: String,
  phone: String,
  bookingDate: String, // YYYY-MM-DD
  startTime: String,   // HH:mm
  endTime: String,     // HH:mm
  durationHours: Number,
  price: Number,
  status: "active" | "cancelled",
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships
```text
User 1 ---- many Bookings
Locker 1 -- many Bookings
Station 1 - many Lockers
```

## Booking conflict
For same locker/date, active bookings conflict when:
`existingStart < requestedEnd AND requestedStart < existingEnd`

Cancelled bookings do not block availability.

## Minimum indexes
```text
users.email -> unique
stations.code -> unique
lockers(stationId, code) -> unique
bookings(lockerId, bookingDate, status)
```

## Seed
Provide a simple seed script for existing station/locker data. Never silently delete shared data.
