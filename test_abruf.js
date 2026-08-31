require("dotenv").config();

const HOME_LAT = Number(process.env.HOME_LAT);
const HOME_LON = Number(process.env.HOME_LON);
const RADIUS_DEGREE = 0.5;

const REQUEST_INTERVALL = 30000; // 30 Sekunden
const REVISIT_TIMEOUT = 1800000; // 30 Min
const MAX_DISTANCE_TO_DISPLAY = 15; // In KM

const overflights = [];
const lastSeen = new Map();

const TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.OPENSKY_CLIENT_ID,
            client_secret: process.env.OPENSKY_CLIENT_SECRET,
        }),
    });
    if(!res.ok) throw new Error(`Token failed: ${res.status}`);

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    console.log("Neues Token geholt, gültig bis", new Date(tokenExpiresAt).toLocaleTimeString());

    return cachedToken;
}

function parseState(flight) {
  return {
    hexAddress: flight[0],
    callSign: flight[1]?.trim() || null,
    origin: flight[2],
    lastPosUpdate: flight[3],
    lastContact: flight[4],
    longitude: flight[5],
    latitude: flight[6],
    baroAltitude: flight[7],
    onGround: flight[8],
    velocity: flight[9],
    trueTrack: flight[10],
    verticalRate: flight[11],
    sensors: flight[12],
    geoAltitude: flight[13],
    squawk: flight[14],
    spi: flight[15],
    positionSource: flight[16],
    category: flight[17] ?? null,
    distanceFromHome: flight[5] == null || flight[6] == null ? null : distanceInKm(HOME_LAT, HOME_LON, flight[6], flight[5]),
  };
}

function distanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const rad = Math.PI / 180;
    const dLat = (lat1-lat2)*rad;
    const dLon = (lon1-lon2)*rad;
    const a = (Math.sin((dLat)/2)** 2)+Math.cos(lat1*rad)*Math.cos(lat2*rad)*(Math.sin((dLon)/2)** 2);
    const c = 2*Math.asin(Math.sqrt(a));
    return R*c
}

async function getFlights() {
    const token = await getToken();
    const url =
    "https://opensky-network.org/api/states/all" + `?lamin=${HOME_LAT - RADIUS_DEGREE}&lamax=${HOME_LAT + RADIUS_DEGREE}` +
    `&lomin=${HOME_LON - RADIUS_DEGREE * 1.53}&lomax=${HOME_LON + RADIUS_DEGREE * 1.53}` +
    "&extended=1";

    const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
    });

    const daten = await res.json();
    console.log(`${daten.states?.length ?? 0} Flugzeuge im Fenster`);
    console.log("Credits übrig:" + res.headers.get("x-rate-limit-remaining"));
    //console.log(daten.states?.slice(0,3));
    //console.log(parseState(daten.states[0]));

    const flugzeuge = daten.states.map(parseState);
    //console.log(flugzeuge.slice(0, 3));
    return flugzeuge;
}

function isInRadius(flight) {
  return flight.distanceFromHome !== null && flight.distanceFromHome <= MAX_DISTANCE_TO_DISPLAY;
}

function processOverflights(flights) {
    const now = Date.now();

    for(const flight of flights) {
        const seen = lastSeen.get(flight.hexAddress);
        if(seen === undefined || now - seen > REVISIT_TIMEOUT) {
            overflights.unshift({
                callSign: flight.callSign,
                hexAddress: flight.hexAddress,
                origin: flight.origin,
                time: now,
                distanceKm: flight.distanceFromHome,
                altitude: flight.baroAltitude,
            });
            overflights.splice(10);
            console.log(`Überflug: ${flight.callSign} in ${flight.distanceFromHome.toFixed(1)} km`);
        }
        lastSeen.set(flight.hexAddress, now);
    }
}

async function tick() {
    try {
        const flights = (await getFlights()).filter(isInRadius);
        processOverflights(flights);
        console.log(overflights);    
    } catch (err) {
        console.error("Fehler: ", err.message);
    }

}

async function main() {
    
    await tick();
    setInterval(tick, REQUEST_INTERVALL);

}

main().catch(console.error);