# Railway Locker Management System

A full-stack railway-station locker management application. Travellers can find lockers by station, zone, and size, check booking availability, reserve a time slot, and manage their account and bookings. Staff have an admin dashboard for monitoring users, bookings, and lockers.

## Application overview

| Layer | Technology | Location |
|---|---|---|
| Frontend | React 18, React Router 6, Vite, CSS | `final RLMS/railway-locker-management/` |
| Backend | Node.js, Express 5 (ES modules) | `backend/` |
| Database | MongoDB with Mongoose | Configured through the backend environment |
| Authentication | JSON Web Tokens and bcrypt | Backend auth and protected routes |

The browser communicates with the Express API; it does not connect directly to MongoDB.

## Features

### Traveller

- Register and sign in with an account.
- Browse lockers by station, zone, and locker size.
- Select a locker and time slot; the API checks for booking conflicts when confirming.
- View and cancel bookings.
- View booking status: `active`, `cancelled`, or `completed`.
- Update profile details and change password.

### Admin

- View user and booking records, including readable user, locker, and station details.
- Review system statistics in the admin dashboard.
- Use protected REST endpoints to create, update, and delete stations and lockers.

**Current implementation note:** the admin dashboard reads users and bookings from the protected API. Locker controls rendered in the frontend currently update the browser-side locker store and are not persisted through the locker administration API.

### Booking lifecycle

- Booking time uses a date and 24-hour `HH:mm` start/end times.
- Booking overlaps for the same locker and date are rejected.
- Prices are calculated in six-hour blocks, rounding a partial block up.
- Active bookings are changed to `completed` after their end time by a backend job that runs at startup and then approximately once per minute.
- The booking form's security screening is a client-side simulation; it is not a real station security integration.

## Repository layout

```text
.
├── backend/
│   ├── config/          MongoDB connection
│   ├── controllers/     API handlers
│   ├── middleware/     Authentication, authorization, error handling
│   ├── models/          User, Station, Locker, Booking schemas
│   ├── routes/          Express API routes
│   ├── seed/            Station and locker seed script
│   ├── services/        Booking expiry job
│   └── test/            Backend tests
├── final RLMS/
│   └── railway-locker-management/
│       └── src/
│           ├── api/     Frontend API clients
│           ├── components/
│           ├── pages/
│           └── store/   Auth and locker React contexts
└── RLMS_Backend_Implementation_Pack_v2/
    └── RLMS_BACKEND_IMPLEMENTATION_PACK_V2/
```

## Prerequisites

- Node.js (recommended: a current LTS release)
- npm
- MongoDB connection string for a database the developer is authorized to use

## Local development

Open two terminals from the repository root.

### 1. Configure the backend

```powershell
if (!(Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
```

Set the values in `backend/.env`:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-long-random-secret>
```

Keep `.env` files private; do not commit database credentials or signing secrets.
`CLIENT_URL` remains in the backend example file, but the current server uses the explicit development-origin allowlist in `backend/server.js` rather than reading that variable.

Install dependencies and start the API:

```powershell
Set-Location backend
npm ci
npm run dev
```

The API listens on `http://localhost:5000` by default. Its health endpoint is `http://localhost:5000/api/health`.

### 2. Configure and start the frontend

In another terminal:

```powershell
if (!(Test-Path 'final RLMS\railway-locker-management\.env')) { Copy-Item 'final RLMS\railway-locker-management\.env.example' 'final RLMS\railway-locker-management\.env' }
Set-Location 'final RLMS\railway-locker-management'
npm ci
npm run dev -- --host 127.0.0.1
```

The frontend's local URL is `http://127.0.0.1:5173/`. The frontend `.env` sets `VITE_API_URL=http://localhost:5000`; change it when using a different API address.

The backend currently allows browser origins on localhost/127.0.0.1 ports 5173, 5174, and 5175. If Vite selects another port, add that origin to the CORS allowlist in `backend/server.js`.

### Seed stations and lockers

With the backend environment configured:

```powershell
Set-Location backend
npm run seed
```

The seed script upserts the configured stations and locker records. It does not remove other existing records from the database.

### Build and tests

Build the frontend for production:

```powershell
Set-Location 'final RLMS\railway-locker-management'
npm run build
npm run preview
```

Run backend tests:

```powershell
Set-Location backend
node --test
```

## API reference

Base URL: `http://localhost:5000`. Successful responses generally use `{ success, message, data }`; errors include a message. Routes marked **Auth** require `Authorization: Bearer <token>`. Routes marked **Admin** additionally require the authenticated user's admin role.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | API health check |
| `POST` | `/api/auth/register` | Public | Register a traveller |
| `POST` | `/api/auth/login` | Public | Sign in and receive a JWT |
| `GET` | `/api/auth/me` | Auth | Get current user |
| `GET` | `/api/users/profile` | Auth | Read own profile |
| `PUT` | `/api/users/profile` | Auth | Update own name, email, or phone |
| `PUT` | `/api/users/change-password` | Auth | Change own password |
| `GET` | `/api/stations` | Public | List stations |
| `GET` | `/api/stations/:id` | Public | Get a station |
| `POST` | `/api/stations` | Admin | Create a station |
| `PUT` | `/api/stations/:id` | Admin | Update a station |
| `DELETE` | `/api/stations/:id` | Admin | Delete a station |
| `GET` | `/api/lockers` | Public | List lockers; accepts `stationId`, `zone`, `size`, and `status` filters |
| `GET` | `/api/lockers/:id` | Public | Get a locker |
| `GET` | `/api/lockers/:id/availability` | Public | Check a slot with `date`, `startTime`, and `endTime` query parameters |
| `POST` | `/api/lockers` | Admin | Create a locker |
| `PUT` | `/api/lockers/:id` | Admin | Update a locker |
| `DELETE` | `/api/lockers/:id` | Admin | Delete a locker |
| `POST` | `/api/bookings` | Auth | Create a booking |
| `GET` | `/api/bookings/my` | Auth | List the signed-in user's bookings |
| `GET` | `/api/bookings/:id` | Auth | Get an owned booking |
| `PUT` | `/api/bookings/:id/cancel` | Auth | Cancel an active owned booking |
| `GET` | `/api/admin/users` | Admin | List users |
| `GET` | `/api/admin/bookings` | Admin | List bookings with populated user, locker, and station references |
| `GET` | `/api/admin/stats` | Admin | Get dashboard statistics |

## Data model

- **User:** name, unique email, phone, hashed password, role (`user` or `admin`), timestamps.
- **Station:** unique station code, name, timestamps.
- **Locker:** code, station reference, zone, size (`small`, `medium`, `large`), price per six-hour block, status (`available`, `out_of_service`).
- **Booking:** user and locker references, holder contact details, booking date/time, duration, price, status (`active`, `cancelled`, `completed`), timestamps.

## Access and security notes

- Passwords are hashed with bcrypt; passwords are not returned by user profile endpoints.
- Protected routes use bearer tokens. Admin routes require an admin role.
- Registration creates a regular user. There is no public admin-registration or admin-bootstrap endpoint; provision administrator access through a controlled, trusted process.
- Use a unique `JWT_SECRET` and a private database credential for each environment.
- Configure production CORS origins, HTTPS, database access controls, and secret storage before deployment. The checked-in CORS allowlist is for local development.

## Troubleshooting

- **API fails to start:** check that `backend/.env` exists and `MONGO_URI` is valid and reachable.
- **Frontend cannot reach API:** confirm the API is listening at `VITE_API_URL` and the frontend origin is in the backend CORS allowlist.
- **Admin endpoints return 401/403:** sign in with a valid token and verify that the account has the `admin` role.
- **No lockers appear:** run the seed script against the intended database, then check `GET /api/lockers`.

## License

No license file is currently included in this repository. Contact the repository owner before redistributing this software.
