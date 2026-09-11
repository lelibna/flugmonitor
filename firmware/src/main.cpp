#include <Arduino.h>
#include <ArduinoJson.h>
#include "display.h"
#include "wifi.h"

constexpr int MAX_FLIGHTS {4};

void setup() {
    Serial.begin(115200);
    delay(1000);
    displayBegin();
    initWifi();

    Flight flights[MAX_FLIGHTS];
    int n = fetchFlights(flights, MAX_FLIGHTS);

    if (n < 0) {
      Serial.println("Error");
    } else if (n == 0) {
      Serial.println("No flights.");
    } else {
      for (int i = 0; i < n; i++) {
        Serial.printf("%-8s %5.1f km  %5.1f km height  %.1f km/h  %-10s origin\n",
        flights[i].cs, flights[i].dist, flights[i].alt, flights[i].v, flights[i].orgn);
      }
    }

    drawFlights(flights, n);
    
    //Later Deep Sleep
    //esp_sleep_enable_timer_wakeup(60ULL * 1000000ULL);
    //esp_deep_sleep_start();
    delay(60000);
    ESP.restart();
}

void loop() {}