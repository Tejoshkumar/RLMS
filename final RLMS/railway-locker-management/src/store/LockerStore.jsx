import { createContext, useContext, useState } from 'react'
import { SEED_LOCKERS } from '../data/mockData.js'

const LockerContext = createContext(null)

const STORAGE_KEY = 'railway-locker-management:v1'

function genId(prefix = 'ID') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load locker data:', error)
  }

  return {
    lockers: SEED_LOCKERS,
    bookings: [],
  }
}

function isTimeOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1
}

export function LockerProvider({ children }) {
  const [state, setState] = useState(loadInitialState)

  function saveState(nextState) {
    setState(nextState)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextState)
    )
  }

  // =========================
  // CREATE BOOKING
  // =========================

  function createBooking({
    userId,
    lockerId,
    station,
    holderName,
    phone,
    bookingDate,
    startTime,
    durationHours,
  }) {
    const locker = state.lockers.find(
      (l) => l.id === lockerId
    )

    if (!locker) {
      throw new Error('Locker not found.')
    }

    if (locker.outOfService) {
      throw new Error(
        'This locker is currently out of service.'
      )
    }

    const start = new Date(
      `${bookingDate}T${startTime}`
    )

    if (Number.isNaN(start.getTime())) {
      throw new Error(
        'Invalid booking date or time.'
      )
    }

    const duration = Number(durationHours)

    if (!duration || duration <= 0) {
      throw new Error(
        'Invalid booking duration.'
      )
    }

    const end = new Date(
      start.getTime() +
        duration * 60 * 60 * 1000
    )

    // Check for overlapping booking
    const conflictingBooking =
      state.bookings.find((booking) => {
        if (booking.lockerId !== lockerId) {
          return false
        }

        // Cancelled/released bookings don't block locker
        if (
          booking.status === 'cancelled' ||
          booking.status === 'released'
        ) {
          return false
        }

        const existingStart = new Date(
          booking.startTime
        )

        const existingEnd = new Date(
          booking.endTime
        )

        return isTimeOverlapping(
          start,
          end,
          existingStart,
          existingEnd
        )
      })

    if (conflictingBooking) {
      throw new Error(
        'This locker is already booked for the selected date and time.'
      )
    }

    const price =
      Number(locker.pricePerBlock || 0) *
      duration

    const booking = {
      id: genId('BK'),

      userId,
      lockerId,

      station,
      holderName,
      phone,

      bookingDate,

      startTime: start.toISOString(),
      endTime: end.toISOString(),

      durationHours: duration,
      price,

      status: 'active',

      createdAt: new Date().toISOString(),
    }

    const nextState = {
      ...state,

      bookings: [
        ...state.bookings,
        booking,
      ],

      lockers: state.lockers,
    }

    saveState(nextState)

    return booking
  }

  // =========================
  // RELEASE / CANCEL BOOKING
  // =========================

  function releaseBooking(bookingId) {
    const booking = state.bookings.find(
      (b) => b.id === bookingId
    )

    if (!booking) {
      return
    }

    const nextState = {
      ...state,

      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
            }
          : b
      ),
    }

    saveState(nextState)
  }

  // =========================
  // ADD LOCKER - ADMIN
  // =========================

  function addLocker(locker) {
    const newLocker = {
      ...locker,

      id: locker.id || genId('LK'),

      status: 'available',

      outOfService: false,
    }

    const nextState = {
      ...state,

      lockers: [
        ...state.lockers,
        newLocker,
      ],
    }

    saveState(nextState)

    return newLocker
  }

  // =========================
  // REMOVE LOCKER - ADMIN
  // =========================

  function removeLocker(lockerId) {
    const locker = state.lockers.find(
      (l) => l.id === lockerId
    )

    if (!locker) {
      throw new Error('Locker not found.')
    }

    // Don't remove locker if it has
    // an active booking
    const hasActiveBooking =
      state.bookings.some(
        (booking) =>
          booking.lockerId === lockerId &&
          booking.status !== 'cancelled' &&
          booking.status !== 'released'
      )

    if (hasActiveBooking) {
      throw new Error(
        'Cannot remove a locker with an active booking.'
      )
    }

    const nextState = {
      ...state,

      lockers: state.lockers.filter(
        (locker) =>
          locker.id !== lockerId
      ),
    }

    saveState(nextState)
  }

  // =========================
  // OUT OF SERVICE / AVAILABLE
  // =========================

  function toggleOutOfService(lockerId) {
    const nextState = {
      ...state,

      lockers: state.lockers.map(
        (locker) => {
          if (locker.id !== lockerId) {
            return locker
          }

          const goingOutOfService =
            !locker.outOfService

          return {
            ...locker,

            outOfService:
              goingOutOfService,

            status:
              goingOutOfService
                ? 'out-of-service'
                : 'available',
          }
        }
      ),
    }

    saveState(nextState)
  }

  // =========================
  // FORCE RELEASE - ADMIN
  // =========================

  function forceRelease(lockerId) {
    const nextState = {
      ...state,

      lockers: state.lockers.map(
        (locker) =>
          locker.id === lockerId
            ? {
                ...locker,
                status: 'available',
              }
            : locker
      ),

      bookings: state.bookings.map(
        (booking) =>
          booking.lockerId === lockerId &&
          booking.status === 'active'
            ? {
                ...booking,
                status: 'released',
              }
            : booking
      ),
    }

    saveState(nextState)
  }

  // =========================
  // PROVIDER
  // =========================

  return (
    <LockerContext.Provider
      value={{
        lockers: state.lockers,
        bookings: state.bookings,

        createBooking,
        releaseBooking,

        // Admin features
        addLocker,
        removeLocker,
        toggleOutOfService,
        forceRelease,
      }}
    >
      {children}
    </LockerContext.Provider>
  )
}

// =========================
// CUSTOM HOOK
// =========================

export function useLockers() {
  const context = useContext(
    LockerContext
  )

  if (!context) {
    throw new Error(
      'useLockers must be used inside LockerProvider'
    )
  }

  return context
}