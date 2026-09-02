const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


async function saveOverflight(flight, now) {
  const res = await pool.query(
    `INSERT INTO overflights (hexaddress, callsign, origin, seen_at, distance_km, altitude_baro, velocity, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      flight.hexAddress,
      flight.callSign,
      flight.origin,
      new Date(now),
      flight.distanceFromHome,
      flight.baroAltitude,
      flight.velocity,
      flight.category,
    ]
  );
  return res.rows[0].id;
}

async function updateOverflight(id, flight) {
  await pool.query(
    `UPDATE overflights SET distance_km = $1, altitude_baro = $2, velocity = $3 WHERE id = $4`,
    [flight.distanceFromHome, flight.baroAltitude, flight.velocity, id]
  );
}

module.exports = { pool, saveOverflight, updateOverflight };