
const HOME_LAT = Number(process.env.HOME_LAT);
const HOME_LON = Number(process.env.HOME_LON);
const RADIUS_DEGREE = 0.5;

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
  };
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
    console.log(`${daten.states?.length ?? 0} flights`);
    console.log("Credits left:" + res.headers.get("x-rate-limit-remaining"));

    const flugzeuge = daten.states.map(parseState);
    return flugzeuge;
}

module.exports = { getFlights, parseState };