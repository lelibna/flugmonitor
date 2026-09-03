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

app.listen(3000, () => console.log("Server läuft auf Port 3000."));

module.exports = {app};