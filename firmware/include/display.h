#ifndef DISPLAY_H
#define DISPLAY_H
#include "wifi.h"

#define PIN_CS   5
#define PIN_DC   0
#define PIN_RST  2
#define PIN_BUSY 15
#define PIN_CLK  20
#define PIN_DIN  21

void displayBegin();
void draw();
void drawFlights(Flight* flights, int n);

#endif