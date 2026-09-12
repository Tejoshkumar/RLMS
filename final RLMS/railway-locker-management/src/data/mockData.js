// Seed data for the locker wall. Each locker belongs to a zone (roughly
// mapped to a platform/concourse area) and has a size tier.

export const STATIONS = [
  {
    id: 'VSKP',
    name: 'Visakhapatnam Junction',
  },
  {
    id: 'VJA',
    name: 'Vijayawada Junction',
  },
  {
    id: 'SC',
    name: 'Secunderabad Junction',
  },
  {
    id: 'HYB',
    name: 'Hyderabad Deccan',
  },
  {
    id: 'SBC',
    name: 'Bengaluru City Junction',
  },
]
export const ZONES = ['Concourse', 'Platform 1–2', 'Platform 3–4', 'Platform 5–6']
export const SIZES = ['Small', 'Medium', 'Large']

const SIZE_PRICE = { Small: 30, Medium: 50, Large: 80 } // currency per 6 hours

const LOCKERS_PER_ZONE = 20

function seedLockers() {
  const lockers = []
  let counter = 1

  STATIONS.forEach((station) => {
    ZONES.forEach((zone) => {
      for (let i = 0; i < 20; i++) {
        const size = SIZES[i % 3]

        lockers.push({
          id: `LK-${String(counter).padStart(3, '0')}`,
          code: String(counter).padStart(3, '0'),

          stationId: station.id,
          station: station.name,

          zone,
          size,
          pricePerBlock: SIZE_PRICE[size],

          status: 'available',
          outOfService: false,
        })

        counter++
      }
    })
  })

  return lockers
}

export const SEED_LOCKERS = seedLockers()
