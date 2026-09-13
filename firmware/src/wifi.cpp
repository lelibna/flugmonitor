#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "wifi.h"
#include "secret.h"

void initWifi() {
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wifi..");
    while(WiFi.status() != WL_CONNECTED) {
        Serial.print('.');
        delay(100);
    }
    Serial.println(WiFi.localIP());
}

int fetchFlights(Flight *flights, int maxCount) {
    HTTPClient http;
    http.setTimeout(5000);
    http.begin(API_URL);

    int code = http.GET();
    if(code != 200) {
        Serial.printf("HTTP-Error %d: %s\n", code, http.errorToString(code).c_str());
        http.end();
        return -1;
    }

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, http.getStream());
    http.end();

    if(err) {
        Serial.printf("Json-Error: %s\n", err.c_str());
        return -1;
    }

    int n = 0;
    for(JsonObject f : doc.as<JsonArray>()) {
        if(n >= maxCount) break;
        strlcpy(flights[n].cs,   f["cs"]   | "", sizeof(flights[n].cs));
        strlcpy(flights[n].orgn, f["orgn"] | "", sizeof(flights[n].orgn));
        flights[n].alt  = f["alt"]  | 0.0f;
        flights[n].dist = f["dist"] | 0.0f;
        flights[n].mindist = f["mindist"] | 0.0f;
        strlcpy(flights[n].seen, f["seen"] | "", sizeof(flights[n].seen));
        flights[n].v    = f["v"]    | 0;
        n++;
    }
    return n;
}
