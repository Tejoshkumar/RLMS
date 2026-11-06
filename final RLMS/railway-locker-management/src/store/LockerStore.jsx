import { createContext, useContext, useState, useEffect } from 'react'
import { getLockers } from '../api/lockerApi.js'
import {
  getMyBookings,
  createBooking as createBookingApi,
  cancelBooking as cancelBookingApi,
} from '../api/bookingApi.js'

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
    lockers: [],
    bookings: [],
  }
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
  // LOAD DATA FROM BACKEND
  // =========================

  useEffect(() => {
    ; (async () => {
      try {
        const lockerResponse = await getLockers()

        const lockers =
          Array.isArray(lockerResponse)
            ? lockerResponse
            : lockerResponse?.data || []

        setState((prev) => ({
          ...prev,
          lockers,
        }))

        try {
          const bookingResponse =
            await getMyBookings()

          const bookings =
            Array.isArray(bookingResponse)
              ? bookingResponse
              : bookingResponse?.data || []

          setState((prev) => ({
            ...prev,
            bookings,
          }))
        } catch (bookingError) {
          console.warn(
            'Could not load bookings:',
            bookingError.message
          )

          setState((prev) => ({
            ...prev,
            bookings: [],
          }))
        }
      } catch (lockerError) {
        console.error(
          'Failed to fetch lockers:',
          lockerError
        )
      }
    })()
  }, [])
  // =========================
  // CREATE BOOKING
  // =========================

  async function createBooking({
    userId,
    lockerId,
    station,
    holderName,
    phone,
    bookingDate,
    startTime,
    durationHours,
  }) {
    const duration = Number(durationHours)

    const startDate = new Date(
      `${bookingDate}T${startTime}`
    )

    const endDate = new Date(
      startDate.getTime() +
      duration * 60 * 60 * 1000
    )

    // Booking must remain on the same calendar day
    if (
      endDate.getDate() !== startDate.getDate() ||
      endDate.getMonth() !== startDate.getMonth() ||
      endDate.getFullYear() !== startDate.getFullYear()
    ) {
      throw new Error(
        'Booking duration cannot extend to the next day.'
      )
    }

    const endTime = endDate
      .toTimeString()
      .slice(0, 5)

    if (startTime >= endTime) {
      throw new Error(
        'Booking end time must be after start time.'
      )
    }

    const payload = {
      lockerId,
      holderName,
      phone,
      bookingDate,
      startTime,
      endTime,
    }

    console.log(
      'Booking payload sent to backend:',
      payload
    )

    const response = await createBookingApi(payload)

    // Support both:
    // response = booking
    // OR
    // response = { success, data: booking }
    const booking =
      response?.data || response

    // Make absolutely sure bookings is an array
    const currentBookings = Array.isArray(
      state.bookings
    )
      ? state.bookings
      : []

    const nextState = {
      ...state,

      bookings: [
        ...currentBookings,
        booking,
      ],
    }

    saveState(nextState)

    return booking
  }

  // =========================
  // RELEASE / CANCEL BOOKING
  // =========================

  async function releaseBooking(bookingId) {
    // Call backend
    const cancelledBooking =
      await cancelBookingApi(bookingId)

    const nextState = {
      ...state,

      bookings: state.bookings.map((booking) => {
        const currentId =
          booking.id || booking._id

        if (currentId === bookingId) {
          return {
            ...booking,
            status: 'cancelled',
          }
        }

        return booking
      }),
    }

    saveState(nextState)

    return cancelledBooking
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
      (locker) =>
        (locker.id || locker._id) === lockerId
    )

    if (!locker) {
      throw new Error('Locker not found.')
    }

    // Don't remove locker if it has an active booking
    const hasActiveBooking =
      state.bookings.some((booking) => {
        const bookingLockerId =
          typeof booking.lockerId === 'object'
            ? booking.lockerId.id ||
            booking.lockerId._id
            : booking.lockerId

        return (
          bookingLockerId === lockerId &&
          booking.status === 'active'
        )
      })

    if (hasActiveBooking) {
      throw new Error(
        'Cannot remove a locker with an active booking.'
      )
    }

    const nextState = {
      ...state,

      lockers: state.lockers.filter(
        (locker) =>
          (locker.id || locker._id) !== lockerId
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

      lockers: state.lockers.map((locker) => {
        const currentId =
          locker.id || locker._id

        if (currentId !== lockerId) {
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
      }),
    }

    saveState(nextState)
  }

  // =========================
  // FORCE RELEASE - ADMIN
  // =========================

  function forceRelease(lockerId) {
    const nextState = {
      ...state,

      lockers: state.lockers.map((locker) => {
        const currentId =
          locker.id || locker._id

        return currentId === lockerId
          ? {
            ...locker,
            status: 'available',
          }
          : locker
      }),

      bookings: state.bookings.map(
        (booking) => {
          const bookingLockerId =
            typeof booking.lockerId === 'object'
              ? booking.lockerId.id ||
              booking.lockerId._id
              : booking.lockerId

          return bookingLockerId === lockerId &&
            booking.status === 'active'
            ? {
              ...booking,
              status: 'released',
            }
            : booking
        }
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