# Platform Lockers — Railway Locker Management (frontend)

A React frontend for managing station lockers: a live "locker wall" for
booking or reserving a locker, a bookings page for the traveller, and an
admin console for staff.

## Stack

- React 18 + React Router
- Vite (dev server / bundler)
- Plain CSS (`src/index.css`) — no UI framework
- State is kept in React context and persisted to `localStorage`, so this
  runs entirely in the browser with no backend. Swap `src/store/LockerStore.jsx`
  for real API calls when you wire it up to a server.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  data/mockData.js        seed lockers (zones, sizes, pricing)
  store/LockerStore.jsx   app state: lockers + bookings, persisted locally
  components/
    LockerCard.jsx         single locker in the wall
    LockerGrid.jsx          lockers grouped by zone
    BookingModal.jsx        book-now / reserve-for-later form
  pages/
    Dashboard.jsx           the locker wall + filters
    MyBookings.jsx          traveller's bookings, release a locker
    Admin.jsx                add lockers, mark out of service, force-release
  App.jsx                  shell: sidebar nav + departure-board style header
  index.css                design tokens and all styling
```

## Notes

- Locker statuses: `available`, `reserved`, `occupied`, `out-of-service`.
- Booking flow supports both "store luggage now" (occupied immediately) and
  "reserve for later today" (reserved, not yet occupied).
- Everything is client-side only — data resets if you clear browser storage.
  Connect the store to a real API for multi-user, persistent behavior.
