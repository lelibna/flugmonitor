#include <Arduino.h>
#include <GxEPD2_BW.h>

#define PIN_CS   5
#define PIN_DC   0
#define PIN_RST  2
#define PIN_BUSY 15
#define PIN_CLK  20
#define PIN_DIN  21

GxEPD2_BW<GxEPD2_420_GDEY042T81, GxEPD2_420_GDEY042T81::HEIGHT> display(GxEPD2_420_GDEY042T81(PIN_CS, PIN_DC, PIN_RST, PIN_BUSY));

void displayBegin() {
    pinMode(PIN_CS, OUTPUT);   digitalWrite(PIN_CS, HIGH);
    pinMode(PIN_DC, OUTPUT);   digitalWrite(PIN_DC, HIGH);
    pinMode(PIN_RST, OUTPUT);  digitalWrite(PIN_RST, HIGH);

    SPI.begin(PIN_CLK, -1, PIN_DIN, PIN_CS);
    display.init(115200, true, 2, false);
    display.setRotation(0); // 0/2 = quer, 1/3 = hoch
}

void draw() {
    display.setFullWindow();
    display.firstPage();
    do {
      display.fillScreen(GxEPD_WHITE);
      display.setTextColor(GxEPD_BLACK);
      display.setCursor(10, 30);
      display.print("Test");
      display.drawRect(5, 5, display.width() - 10, display.height() - 10, GxEPD_BLACK);
    } while (display.nextPage());
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    displayBegin();
    draw();
    display.hibernate();
}

void loop() {}