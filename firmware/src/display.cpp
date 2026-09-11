#include <GxEPD2_BW.h>
#include "display.h"

GxEPD2_BW<GxEPD2_420_GDEY042T81, GxEPD2_420_GDEY042T81::HEIGHT> display(GxEPD2_420_GDEY042T81(PIN_CS, PIN_DC, PIN_RST, PIN_BUSY));

void displayBegin() {
    pinMode(PIN_CS, OUTPUT);   digitalWrite(PIN_CS, HIGH);
    pinMode(PIN_DC, OUTPUT);   digitalWrite(PIN_DC, HIGH);
    pinMode(PIN_RST, OUTPUT);  digitalWrite(PIN_RST, HIGH);

    SPI.begin(PIN_CLK, -1, PIN_DIN, PIN_CS);
    display.init(115200, true, 2, false);
    display.setRotation(0);
}

void drawFlights(Flight* flights, int n) {
    const int16_t margin = 5;
    const int16_t left   = margin + 1;
    const int16_t right  = display.width()  - margin - 1;
    const int16_t top    = margin + 1;
    const int16_t bottom = display.height() - margin - 1;

    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);
        display.setTextColor(GxEPD_BLACK);
        display.drawRect(margin, margin,
        display.width()  - 2 * margin,
        display.height() - 2 * margin, GxEPD_BLACK);

        if (n <= 0) {
            display.setTextSize(2);
            display.setCursor(left + 10, top + 30);
            display.print("No flights.");
        } else {
            int16_t rowH = (bottom - top) / n;
            for (int i = 0; i < n; i++) {
                int16_t y = top + i * rowH;
                if (i > 0) display.drawLine(left, y, right, y, GxEPD_BLACK);

                display.setTextSize(2);
                display.setCursor(left + 8, y + 8);
                display.print(flights[i].cs);
                display.setCursor(left + 8, y + 32);
                display.print(flights[i].orgn);

                display.setTextSize(1);
                display.setCursor(left + 250, y + 8);
                display.printf("%.1f km dist.", flights[i].dist);
                display.setCursor(left + 250, y + 20);
                display.printf("%.1f km alt.", flights[i].alt);
                display.setCursor(left + 250, y + 32);
                display.printf("%.0f km/h", flights[i].v);
                display.setCursor(left + 250, y + 44);
                display.printf("seen %s", flights[i].seen);
                }
            }
    } while (display.nextPage());
    display.hibernate();
}

