CREATE TABLE overflights (
    id bigserial PRIMARY KEY,
    hexaddress text NOT NULL,
    callsign text,
    origin text,
    seen_at TIMESTAMPTZ NOT NULL,
    distance_km real,
    min_distance_km real,
    altitude_geo real,
    velocity real,
    category integer

);

CREATE INDEX ON overflights (seen_at DESC);