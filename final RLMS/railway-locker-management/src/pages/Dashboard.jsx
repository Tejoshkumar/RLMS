import { useMemo, useState } from 'react'
import { useLockers } from '../store/LockerStore.jsx'
import { STATIONS, ZONES, SIZES } from '../data/mockData.js'
import LockerGrid from '../components/LockerGrid.jsx'
import BookingModal from '../components/BookingModal.jsx'

export default function Dashboard({ currentUser }) {
  const {
    lockers,
    bookings,
    createBooking,
  } = useLockers()

  const [selectedStation, setSelectedStation] =
    useState(STATIONS[0].id)

  const [zoneFilter, setZoneFilter] =
    useState('All zones')

  const [sizeFilter, setSizeFilter] =
    useState('All sizes')

  const [selectedLocker, setSelectedLocker] =
    useState(null)

  const [confirmation, setConfirmation] =
    useState(null)

  // Lockers belonging to selected station
  const stationLockers = lockers.filter(
    (locker) =>
      locker.stationId === selectedStation
  )

  // Apply zone and size filters
  const filtered = stationLockers.filter(
    (locker) => {
      if (
        zoneFilter !== 'All zones' &&
        locker.zone !== zoneFilter
      ) {
        return false
      }

      if (
        sizeFilter !== 'All sizes' &&
        locker.size !== sizeFilter
      ) {
        return false
      }

      return true
    }
  )

  // Group lockers by zone
  const lockersByZone = useMemo(() => {
    const grouped = {}

    filtered.forEach((locker) => {
      if (!grouped[locker.zone]) {
        grouped[locker.zone] = []
      }

      grouped[locker.zone].push(locker)
    })

    return grouped
  }, [filtered])

  // ============================
  // CONFIRM BOOKING
  // ============================

  function handleConfirm({
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

    try {
      const booking =
        createBooking({
          userId: currentUser.id,

          lockerId: selectedLocker.id,

          station:
            STATIONS.find(
              (station) =>
                station.id ===
                selectedStation
            )?.name,

          holderName,
          phone,

          bookingDate,
          startTime,
          durationHours,
        })

      // Close booking modal
      setSelectedLocker(null)

      // Show confirmation
      setConfirmation({
        code: selectedLocker.code,
        id: booking.id,
      })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div>
      {/* ============================
          FILTERS
      ============================ */}

      <div className="filters">

        {/* Railway Station */}
        <select
          value={selectedStation}
          onChange={(e) => {
            setSelectedStation(
              e.target.value
            )

            setZoneFilter('All zones')
            setSizeFilter('All sizes')
          }}
        >
          {STATIONS.map((station) => (
            <option
              key={station.id}
              value={station.id}
            >
              {station.name}
            </option>
          ))}
        </select>

        {/* Zone */}
        <select
          value={zoneFilter}
          onChange={(e) =>
            setZoneFilter(e.target.value)
          }
        >
          <option>All zones</option>

          {ZONES.map((zone) => (
            <option
              key={zone}
              value={zone}
            >
              {zone}
            </option>
          ))}
        </select>

        {/* Size */}
        <select
          value={sizeFilter}
          onChange={(e) =>
            setSizeFilter(e.target.value)
          }
        >
          <option>All sizes</option>

          {SIZES.map((size) => (
            <option
              key={size}
              value={size}
            >
              {size}
            </option>
          ))}
        </select>

      </div>

      {/* ============================
          BOOKING CONFIRMATION
      ============================ */}

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
            — see it under My bookings.
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

      {/* ============================
          LOCKER GRID
      ============================ */}

    <LockerGrid
  lockersByZone={lockersByZone}
  bookings={bookings}
  onSelect={setSelectedLocker}
/>

      {/* ============================
          BOOKING MODAL
      ============================ */}

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