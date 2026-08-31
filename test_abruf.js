require("dotenv").config();

const TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

async function getToken() {
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
    return (await res.json()).access_token;
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

async function main() {
    const token = await getToken();
    const url = "https://opensky-network.org/api/states/all?lamin=47.0&lomin=10.1&lamax=51.0&lomax=14.1&extended=1";

    const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
    });
    console.log("Credits übrig:" + res.headers.get("x-rate-limit-remaining"));

    const daten = await res.json();
    console.log(`${daten.states?.length ?? 0} Flugzeuge im Fenster`);
    console.log(daten.states?.slice(0,3));

    console.log(parseState(daten.states[0]));
    const flugzeuge = daten.states.map(parseState);
    console.log(flugzeuge.slice(0, 3));
}

main().catch(console.error);