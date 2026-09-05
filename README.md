# Flightmonitor

**In Progress**

A self-hosted service which collects flights over a chosen area and provides the last overflights via it's own API. 
Client is an E-Paper-Display connected to an ESP32.

## How does it work?

You choose a point with coordinates. The backend will request data of the positions of flights in the square area around the coordinate.
From this data it is calculated how far these flights were from the chosen coordinate and if they came closer than a configured distance the flight will be marked as overflight. 
The distance is calculated with the Haversine formula.

## Run

Copy the example .env and fill it out:

`cp .env.example .env`

You will need an Opensky Account for the Credentials.


Run `docker compose up`

The web interface is at `localhost:3000/`
The JSON API for the client is at `localhost:3000/api/display`

## Credits

Position data from [OpenSky Network](https://opensky-network.org/).

Icons from [Bootstrap Icons](https://icons.getbootstrap.com/).

## Why is the requested are larger than the overflight radius?

A plane might cross a narrow window in under a minute. Within a 30 second polling interval, a small box would miss a good share of traffic. 
The service therefore requests a bigger box and decides for itself what counts as an overflight


