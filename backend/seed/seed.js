// backend/seed/seed.js
import 'dotenv/config';
import connectDB from '../config/db.js';
import Station from '../models/Station.js';
import Locker from '../models/Locker.js';

// Mock data definitions (mirroring frontend mockData)
const STATIONS = [
  { code: 'VSKP', name: 'Visakhapatnam Junction' },
  { code: 'VJA', name: 'Vijayawada Junction' },
  { code: 'SC', name: 'Secunderabad Junction' },
  { code: 'HYB', name: 'Hyderabad Deccan' },
  { code: 'SBC', name: 'Bengaluru City Junction' },
];

const ZONES = ['Concourse', 'Platform 1-2', 'Platform 3-4', 'Platform 5-6'];
const SIZES = ['Small', 'Medium', 'Large'];
const SIZE_PRICE = { Small: 30, Medium: 50, Large: 80 }; // per 6‑hour block
const LOCKERS_PER_ZONE = 20;

(async () => {
  console.log('Connecting to MongoDB...');
  await connectDB();

  // ---------- Seed Stations (upsert) ----------
  for (const st of STATIONS) {
    await Station.updateOne(
      { code: st.code },
      { $set: { name: st.name } },
      { upsert: true }
    );
  }
  const stationCount = await Station.countDocuments();
  console.log(`Stations seeded: ${stationCount}`);

  // Map station code -> _id for locker creation
  const stationMap = {};
  const stations = await Station.find({});
  stations.forEach((s) => (stationMap[s.code] = s._id));

  // ---------- Seed Lockers (upsert) ----------
  let globalCounter = 1;
  for (const st of STATIONS) {
    const stationId = stationMap[st.code];
    for (const zone of ZONES) {
      for (let i = 0; i < LOCKERS_PER_ZONE; i++) {
        const size = SIZES[i % SIZES.length];
        const price = SIZE_PRICE[size];
        const code = String(globalCounter).padStart(3, '0');
        const lockerData = {
          code,
          stationId,
          zone,
          size: size.toLowerCase(),
          pricePerBlock: price,
          status: 'available',
        };
        await Locker.updateOne({ stationId, code }, { $set: lockerData }, { upsert: true });
        globalCounter++;
      }
    }
  }

  const lockerCount = await Locker.countDocuments();
  console.log(`Lockers seeded: ${lockerCount}`);
  console.log('Seed completed successfully');

  // Graceful shutdown
  await import('mongoose').then((m) => m.default.disconnect());
})().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
