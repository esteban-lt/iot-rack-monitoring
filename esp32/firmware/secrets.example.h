// Copy this file to secrets.h and fill in the values for each node.
// secrets.h is ignored by git; this example is the one that gets versioned.
#pragma once

const char* WIFI_SSID = "your-wifi-ssid";    // 2.4 GHz network
const char* WIFI_PASS = "your-wifi-password";
const char* TB_HOST   = "thingsboard.cloud"; // "eu.thingsboard.cloud" if your account is on the EU server
const int   TB_PORT   = 1883;
const char* TB_TOKEN  = "device-access-token"; // one token per node (ThingsBoard > Devices > Copy access token)
