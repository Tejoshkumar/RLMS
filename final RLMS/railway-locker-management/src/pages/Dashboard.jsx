import { useMemo, useState, useEffect } from 'react'
import { useLockers } from '../store/LockerStore.jsx'
import { getStations } from '../api/stationApi.js'
import LockerGrid from '../components/LockerGrid.jsx'
import BookingModal from '../components/BookingModal.jsx'

export default function Dashboard({ currentUser }) {
  const {
    lockers,
    bookings,
    createBooking,
  } = useLockers()

  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] =
    useState('')

  const [zoneFilter, setZoneFilter] =
    useState('All zones')

  const [sizeFilter, setSizeFilter] =
    useState('All sizes')

  const [selectedLocker, setSelectedLocker] =
    useState(null)

  const [confirmation, setConfirmation] =
    useState(null)

  const [bookingError, setBookingError] =
    useState(null)

  // ==================================================
  // NORMALIZE DATA
  // ==================================================

  const lockerList = Array.isArray(lockers)
    ? lockers
    : Array.isArray(lockers?.data)
      ? lockers.data
      : []

  const bookingList = Array.isArray(bookings)
    ? bookings
    : Array.isArray(bookings?.data)
      ? bookings.data
      : Array.isArray(bookings?.data?.bookings)
        ? bookings.data.bookings
        : []

  // ==================================================
  // LOAD STATIONS FROM BACKEND
  // ==================================================

  useEffect(() => {
    let mounted = true

    async function loadStations() {
      try {
        const fetched = await getStations()

        if (!mounted) return

        const stationList = Array.isArray(fetched)
          ? fetched
          : Array.isArray(fetched?.data)
            ? fetched.data
            : []

        setStations(stationList)

        if (stationList.length > 0) {
          setSelectedStation(
            stationList[0].id ||
            stationList[0]._id ||
            ''
          )
        }
      } catch (err) {
        console.error(
          'Failed to load stations:',
          err
        )

        if (mounted) {
          setStations([])
          setSelectedStation('')
        }
      }
    }

    loadStations()

    return () => {
      mounted = false
    }
  }, [])

  // ==================================================
  // LOCKERS BELONGING TO SELECTED STATION
  // ==================================================

  const stationLockers = lockerList.filter(
    (locker) => {
      const stationReference =
        locker.stationId || locker.station?._id || locker.station?.id
      const lockerStationId =
        stationReference?._id || stationReference

      return (
        String(lockerStationId) ===
        String(selectedStation)
      )
    }
  )

  const zoneLockers = stationLockers.filter(
    (locker) => {
      if (
        zoneFilter !== 'All zones' &&
        locker.zone !== zoneFilter
      ) {
        return false
      }

      return true
    }
  )

  const availableZones = [...new Set(
    stationLockers
      .map((locker) => locker.zone)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))

  const availableSizes = [...new Set(
    zoneLockers
      .map((locker) => locker.size)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b))

  // Match using actual API values (for example, "small"), not display labels.
  const filtered = zoneLockers.filter(
    (locker) =>
      sizeFilter === 'All sizes' ||
      locker.size === sizeFilter
  )

  // ==================================================
  // GROUP LOCKERS BY ZONE
  // ==================================================

  const lockersByZone = useMemo(() => {
    const grouped = {}

    filtered.forEach((locker) => {
      const zone = locker.zone || 'Other'

      if (!grouped[zone]) {
        grouped[zone] = []
      }

      grouped[zone].push(locker)
    })

    return grouped
  }, [filtered])

  // ==================================================
  // CONFIRM BOOKING
  // ==================================================

  async function handleConfirm({
    holderName,
    phone,
    durationHours,
    bookingDate,
    startTime,
  }) {
    if (!currentUser) {
      return
    }

    if (!selectedLocker) {
      return
    }

    setBookingError(null)

    try {
      const booking = await createBooking({
        userId:
          currentUser.id ||
          currentUser._id,

        lockerId:
          selectedLocker.id ||
          selectedLocker._id,

        station:
          stations.find(
            (station) =>
              String(
                station.id ||
                station._id
              ) ===
              String(selectedStation)
          )?.name,

        holderName,
        phone,
        bookingDate,
        startTime,
        durationHours,
      })

      const bookingId =
        booking?.id ||
        booking?._id ||
        booking?.data?.id ||
        booking?.data?._id

      const bookingPrice =
        booking?.price ??
        booking?.data?.price ??
        0

      const lockerCode =
        selectedLocker.code ||
        selectedLocker.id ||
        selectedLocker._id

      // Close booking modal
      setSelectedLocker(null)

      // Show confirmation using backend response
      setConfirmation({
        code: lockerCode,
        id: bookingId,
        price: bookingPrice,
      })

      setBookingError(null)
    } catch (error) {
      console.error(
        'Booking failed:',
        error
      )

      if (error?.status === 409) {
        setBookingError(
          'Locker is no longer available for the selected time. Please choose another time or locker.'
        )
      } else {
        setBookingError(
          error?.message ||
          'Booking failed. Please try again.'
        )
      }
      throw error
    }
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div>

      {/* ============================================
          FILTERS
      ============================================ */}

      <div className="filters">

        {/* Railway Station */}
        <label className="filter-control" htmlFor="station-filter">
          <span>Station</span>
          <select
            id="station-filter"
            value={selectedStation}
            onChange={(e) => {
              setSelectedStation(e.target.value)
              setZoneFilter('All zones')
              setSizeFilter('All sizes')
              setBookingError(null)
            }}
          >
            {stations.length === 0 && (
              <option value="">No stations available</option>
            )}
            {stations.map((station) => {
              const stationId = station.id || station._id

              return (
                <option key={stationId} value={stationId}>
                  {station.name}
                </option>
              )
            })}
          </select>
        </label>

        {/* Zone */}
        <label className="filter-control" htmlFor="zone-filter">
          <span>Zone</span>
          <select
            id="zone-filter"
            value={zoneFilter}
            onChange={(e) => {
              setZoneFilter(e.target.value)
              setSizeFilter('All sizes')
            }}
          >
            <option value="All zones">All zones</option>
            {availableZones.map((zone) => (
              <option key={`zone-${zone}`} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </label>

        {/* Size */}
        <label className="filter-control" htmlFor="size-filter">
          <span>Locker size</span>
          <select
            id="size-filter"
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
          >
            <option value="All sizes">All sizes</option>
            {availableSizes.map((size) => (
              <option key={`size-${size}`} value={size}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </option>
            ))}
          </select>
        </label>

      </div>

      <p className="filter-results" aria-live="polite">
        Showing {filtered.length} {filtered.length === 1 ? 'locker' : 'lockers'}
      </p>

      {/* ============================================
          BOOKING CONFIRMATION
      ============================================ */}

      {confirmation && (
        <div
          style={{
            background:
              'rgba(232,163,61,0.14)',

            border:
              '1px solid rgba(232,163,61,0.4)',

            color: '#8a5a12',

            padding: '12px 16px',

            borderRadius: 8,

            fontSize: 13.5,

            marginBottom: 20,

            display: 'flex',

            justifyContent:
              'space-between',

            alignItems: 'center',

            gap: 12,
          }}
        >
          <span>
            Locker{' '}
            <strong>
              {confirmation.code}
            </strong>{' '}
            is booked and assigned to
            you. Booking ref{' '}
            <strong>
              {confirmation.id}
            </strong>{' '}
            (₹{confirmation.price}) —
            see it under My bookings.
          </span>

          <button
            className="btn btn-ghost"
            onClick={() =>
              setConfirmation(null)
            }
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ============================================
          BOOKING ERROR
      ============================================ */}

      {bookingError && (
        <div
          style={{
            background:
              'rgba(255,0,0,0.1)',

            border:
              '1px solid rgba(255,0,0,0.4)',

            color: '#a00',

            padding: '12px 16px',

            borderRadius: 8,

            marginBottom: 20,
          }}
        >
          {bookingError}
        </div>
      )}

      {/* ============================================
          LOCKER GRID
      ============================================ */}

      <LockerGrid
        lockersByZone={lockersByZone}
        bookings={bookingList}
        onSelect={setSelectedLocker}
      />

      {/* ============================================
          BOOKING MODAL
      ============================================ */}

      <BookingModal
        locker={selectedLocker}
        onClose={() =>
          setSelectedLocker(null)
        }
        onConfirm={handleConfirm}
      />

    </div>
  )
}