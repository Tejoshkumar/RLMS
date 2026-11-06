import LockerCard from './LockerCard.jsx'

export default function LockerGrid({
  lockersByZone,
  bookings,
  onSelect,
}) {
  if (Object.keys(lockersByZone).length === 0) {
    return (
      <p className="empty-locker-results">
        No lockers match the selected station, zone, and size.
      </p>
    )
  }

  return (
    <div className="locker-grid-wrapper">
      {Object.entries(lockersByZone).map(
        ([zone, zoneLockers]) => (
          <div key={zone} className="zone-section">
            <h3 className="zone-title">
              {zone}
            </h3>

            <div className="locker-grid">
              {zoneLockers.map((locker) => (
                <LockerCard
                  key={locker.id || locker._id}
                  locker={locker}
                  bookings={bookings}
                  onBook={onSelect}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}