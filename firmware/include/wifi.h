#ifndef WIFI_H
#define WIFI_H

struct Flight {
    char cs[12];
    char orgn[32];
    float alt;
    float dist;
    char seen[6];
    float v;
};

void initWifi();
int fetchFlights(Flight* flights, int maxCount);

#endif