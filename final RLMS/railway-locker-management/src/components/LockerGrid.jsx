import LockerCard from './LockerCard.jsx'

export default function LockerGrid({
  lockersByZone,
  bookings,
  onSelect,
}) {
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
                  key={locker.id}
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