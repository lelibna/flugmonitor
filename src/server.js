require("dotenv").config();
const express = require("express");
const path = require("path");
const { getRecentOverflights } = require("./db");
const app = express();
app.set('view engine', "pug");
app.use(express.static(path.join(__dirname, "..", "img")));

app.get('/', async (req, res) => {
    try {
        const flights = await getRecentOverflights(10);
        res.render("index", {flights});
    } catch (err) {
        console.error("DB query error:", err.message);
        res.status(500).json({error: "database unavailable"});
    }
});

app.get('/api/display', async (req, res) => {
    try {
        const flights = await getRecentOverflights(10);
        res.json(
            flights.map((f) => ({
                cs: f.callsign,
                orgn: f.origin,
                alt: f.altitude_baro == null ? null : Number((f.altitude_baro / 1000).toFixed(1)),
                dist: f.distance_km == null ? null : Number(f.distance_km.toFixed(1)),
                seen: Math.floor(f.seen_at.getTime()/1000),
                v: Math.round(f.velocity*3.6),
            }))
        );
    } catch (err) {
        console.error("DB error:", err.message);
        res.status(500).json({error: "unavailable"});
    }
})

app.listen(3000, () => console.log("Server läuft auf Port 3000."));

module.exports = {app};