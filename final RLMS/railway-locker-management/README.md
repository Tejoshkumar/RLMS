# Frontend

This React application is the traveller and staff interface for the Railway Locker Management System. For full-stack setup, API details, and data model documentation, see the [repository README](../../README.md).

## Stack and scripts

- React 18
- React Router 6
- Vite 5
- CSS in `src/index.css`

```powershell
npm ci
npm run dev -- --host 127.0.0.1
npm run build
npm run preview
```

Configure the API base URL in `.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Source layout

```text
src/
├── api/          Authenticated API clients
├── components/   Booking modal and locker grid/cards
├── data/         Filter labels and fallback data
├── pages/        Login, registration, dashboard, bookings, profile, admin
└── store/        Authentication and locker React contexts
```

The frontend loads authentication, profile, booking, and admin user/booking data through the backend API. Some locker management controls in the admin interface still update browser-side state only; see the repository README for this limitation.
