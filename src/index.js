require("dotenv").config();
const { distanceInKm } = require("./geo");
const { getFlights } = require("./opensky");
const { saveOverflight, updateOverflight } = require("./db");

const HOME_LAT = Number(process.env.HOME_LAT);
const HOME_LON = Number(process.env.HOME_LON);

const REQUEST_INTERVALL = 30000; // 30 Sekunden
const REVISIT_TIMEOUT = 1800000; // 30 Min
const MAX_DISTANCE_TO_DISPLAY = 15; // In KM

const overflights = [];
const lastSeen = new Map();

function isInRadius(flight) {
  return flight.distanceFromHome !== null && flight.distanceFromHome <= MAX_DISTANCE_TO_DISPLAY;
}

async function processOverflights(flights) {
    const now = Date.now();

    for(const flight of flights) {
        const seen = lastSeen.get(flight.hexAddress);
        const isNew = seen === undefined || now - seen.time > REVISIT_TIMEOUT;

        if(isNew) {
            const entry = {
                callSign: flight.callSign,
                hexAddress: flight.hexAddress,
                origin: flight.origin,
                time: now,
                distanceKm: flight.distanceFromHome,
                altitude: flight.baroAltitude,
            };
            overflights.unshift(entry);
            overflights.splice(10);

            let id = null;
            try {
                id = await saveOverflight(flight, now);
            } catch (err) {
                console.error("DB Error when inserting: ", err.message);
            }
            lastSeen.set(flight.hexAddress, {
                time: now,
                id,
                minDistance: flight.distanceFromHome,
                entry,
            });
        } else {
            seen.time = now;

            if(flight.distanceFromHome < seen.minDistance) {
                seen.minDistance = flight.distanceFromHome;
                seen.entry.distanceKm = flight.distanceFromHome;
                seen.entry.altitude = flight.baroAltitude;

                if(seen.id != null) {
                    try {
                        await updateOverflight(seen.id, flight);
                    } catch (err) {
                        console.error("DB Error when updating: ", err.message);
                    }
                }
            }
        }
    }
}

function withDistance(flight) {
  const distanceFromHome =
    flight.latitude == null || flight.longitude == null ? null : distanceInKm(HOME_LAT, HOME_LON, flight.latitude, flight.longitude);
  return { ...flight, distanceFromHome };
}

function cleanupLastSeen() {
  const now = Date.now();
  for (const [hex, seen] of lastSeen) {
    if (now - seen.time > REVISIT_TIMEOUT) {
      lastSeen.delete(hex);
    }
  }
}

async function tick() {
    try {
        const flights = (await getFlights()).map(withDistance).filter(isInRadius);
        await processOverflights(flights);
        console.log(overflights);    
    } catch (err) {
        console.error("Fehler: ", err.message);
    }

}

async function main() {
    
    await tick();
    setInterval(tick, REQUEST_INTERVALL);
    setInterval(cleanupLastSeen, REVISIT_TIMEOUT);
}

main().catch(console.error);