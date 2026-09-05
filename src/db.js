const { Pool } = require("pg");
const pool = new Pool({
  host: process.env.PGHOST || "127.0.0.1",
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});


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

async function deleteOldData() {
    const res = await pool.query(`DELETE FROM overflights WHERE seen_at < now() - interval '1 day'`
    );
    console.log(`${res.rowCount} deleted`);
}

async function getRecentOverflights(limit) {
    const res = await pool.query(
        `SELECT hexaddress, callsign, origin, seen_at, distance_km, altitude_baro, velocity, category 
        FROM overflights 
        ORDER BY seen_at 
        DESC 
        LIMIT $1`, [limit]);
    return res.rows;
}

module.exports = { pool, saveOverflight, updateOverflight, deleteOldData, getRecentOverflights};