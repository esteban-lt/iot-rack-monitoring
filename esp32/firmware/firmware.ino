// Rack node: ESP32 + MPU6050 + RC522 + LEDs + buzzer -> MQTT -> ThingsBoard
// Libraries: PubSubClient, MFRC522, ArduinoJson (v7)

#include <Wire.h>
#include <SPI.h>
#include <WiFi.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <time.h>

// Credentials live in secrets.h (copy secrets.example.h)
#include "secrets.h"

const char* FIRMWARE_VERSION = "1.1.0";

const int PIN_SDA = 21;
const int PIN_SCL = 22;
const int PIN_BUZZER = 25;
const int PIN_LED_GREEN = 27;
const int PIN_LED_YELLOW = 26;
const int PIN_LED_RED = 33;
const int PIN_RFID_SS = 5;
const int PIN_RFID_RST = 4;
const int PIN_SCK = 18;
const int PIN_MISO = 19;
const int PIN_MOSI = 23;

// ThingsBoard shared attributes are the source of truth; these are only the fallback
// until the first value arrives (received values are cached in flash).
float tiltWarnDeg = 3.0;
float tiltAlarmDeg = 5.0;
float impactThresholdG = 3.0;
const float HYST_DEG = 0.5;

// Allowed ranges for received thresholds (keep in sync with web/src/app/racks/schemas/thresholds-schema.ts)
const float TILT_MIN_DEG = 1.0;
const float TILT_MAX_DEG = 90.0;
const float TILT_MIN_GAP_DEG = 1.0;
const float IMPACT_MIN_G = 1.5;
const float IMPACT_MAX_G = 4.0;

const float TILT_FILTER_ALPHA = 0.05;
const unsigned long TILT_HOLD_MS = 800;   // tilt must persist this long to raise the level

const bool BUZZER_ACTIVE = true;

const unsigned long SAMPLE_MS = 20;
const unsigned long PUBLISH_MS = 5000;    // ThingsBoard free plan: do not go below 3000 ms
const unsigned long RECONNECT_MS = 5000;
const unsigned long IMPACT_COOLDOWN_MS = 2000;
const unsigned long RFID_POLL_MS = 300;

const uint8_t MPU_ADDR = 0x68;
const uint8_t REG_PWR_MGMT_1 = 0x6B;
const uint8_t REG_ACCEL_CONFIG = 0x1C;
const uint8_t REG_ACCEL_XOUT_H = 0x3B;
const float ACCEL_LSB_PER_G = 8192.0;     // +-4 g range

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
MFRC522 rfid(PIN_RFID_SS, PIN_RFID_RST);
Preferences prefs;

float ax = 0, ay = 0, az = 1, tiltX = 0, tiltY = 0, tilt = 0, tempC = 0;
const char* statusText = "ok";
int level = 0;   // 0 = ok, 1 = warning, 2 = alarm
int lastLevel = 0;
String rackUid = "";

// Low-pass filtered acceleration, used only for tilt
float fAx = 0, fAy = 0, fAz = 1;
unsigned long riseSince = 0;

bool buzzerEnabled = true;
bool alarmSilenced = false;   // re-armed when the rack is back to ok

double vibSum = 0;
int vibCount = 0;

unsigned long lastSample = 0, lastPublish = 0, lastReconnect = 0, lastImpact = 0, lastRfid = 0;

// Calibration: the node can be mounted in any orientation. With the rack plumb and the node fixed,
// the gravity direction at rest is stored as "up" and all angles are measured relative to it:
//   tilt = total angle from vertical, tilt_x = front/back, tilt_y = side
const unsigned long CALIB_DURATION_MS = 2000;
const unsigned long CALIB_START_DELAY_MS = 3000;   // time to step away after boot / RFID tap
const unsigned long CALIB_RETRY_MS = 5000;
const float CALIB_MAX_STD_G = 0.04;                // reject if the rack is moving
const float CALIB_MAG_TOL_G = 0.15;                // |a| must be ~1 g
const float CALIB_MIN_HORIZ = 0.3;

float refU[3] = {0, 0, 1};   // up
float refF[3] = {1, 0, 0};   // front
float refS[3] = {0, 1, 0};   // side = U x F
bool calibrated = false;
long long calibTs = 0;       // epoch ms, 0 until NTP syncs
const char* calibStatus = "none";   // none | scheduled | running | ok | failed

bool calibScheduled = false, calibRunning = false, calibRetry = false;
unsigned long calibStartAt = 0, calibWindowStart = 0;
int calibN = 0;
double calibSum[3], calibSumSq[3];

void buzzerOn()  { if (BUZZER_ACTIVE) digitalWrite(PIN_BUZZER, HIGH); else tone(PIN_BUZZER, 2000); }
void buzzerOff() { if (BUZZER_ACTIVE) digitalWrite(PIN_BUZZER, LOW);  else noTone(PIN_BUZZER); }

void setLeds(bool g, bool y, bool r) {
  digitalWrite(PIN_LED_GREEN, g);
  digitalWrite(PIN_LED_YELLOW, y);
  digitalWrite(PIN_LED_RED, r);
}

void actuatorsTest() {
  setLeds(true, false, false);  delay(400);
  setLeds(false, true, false);  delay(400);
  setLeds(false, false, true);  delay(400);
  setLeds(false, false, false);
  buzzerOn(); delay(200); buzzerOff();
}

void mpuWrite(uint8_t reg, uint8_t value) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(value);
  Wire.endTransmission();
}

bool mpuReadRaw(int16_t *raw) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(REG_ACCEL_XOUT_H);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom(MPU_ADDR, (uint8_t)14) != 14) return false;
  for (int i = 0; i < 7; i++) {
    uint8_t hi = Wire.read();
    uint8_t lo = Wire.read();
    raw[i] = (int16_t)((hi << 8) | lo);
  }
  return true;
}

float dot3(const float* a, const float* b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

void cross3(const float* a, const float* b, float* out) {
  out[0] = a[1] * b[2] - a[2] * b[1];
  out[1] = a[2] * b[0] - a[0] * b[2];
  out[2] = a[0] * b[1] - a[1] * b[0];
}

bool normalize3(float* v) {
  float n = sqrt(dot3(v, v));
  if (n < 1e-6) return false;
  v[0] /= n; v[1] /= n; v[2] /= n;
  return true;
}

bool buildFrame(const float* gravity, float* u, float* f, float* s) {
  for (int i = 0; i < 3; i++) u[i] = gravity[i];
  if (!normalize3(u)) return false;

  // Front = sensor Z axis (board normal) projected on the horizontal plane.
  // If the board lies flat that projection vanishes, so use the X axis instead.
  const float axisZ[3] = {0, 0, 1};
  const float axisX[3] = {1, 0, 0};
  const float* axis = axisZ;
  float d = dot3(axisZ, u);
  if (sqrt(fmax(0.0f, 1.0f - d * d)) < CALIB_MIN_HORIZ) { axis = axisX; d = dot3(axisX, u); }
  for (int i = 0; i < 3; i++) f[i] = axis[i] - d * u[i];
  if (!normalize3(f)) return false;

  cross3(u, f, s);
  return normalize3(s);
}

void saveCalibration() {
  prefs.putFloat("ux", refU[0]); prefs.putFloat("uy", refU[1]); prefs.putFloat("uz", refU[2]);
  prefs.putFloat("fx", refF[0]); prefs.putFloat("fy", refF[1]); prefs.putFloat("fz", refF[2]);
  prefs.putLong64("calib_ts", calibTs);
}

void loadCalibration() {
  if (!prefs.isKey("ux")) return;
  float u[3] = {prefs.getFloat("ux"), prefs.getFloat("uy"), prefs.getFloat("uz")};
  float f[3] = {prefs.getFloat("fx"), prefs.getFloat("fy"), prefs.getFloat("fz")};
  float s[3];
  cross3(u, f, s);
  if (!normalize3(s)) return;
  for (int i = 0; i < 3; i++) { refU[i] = u[i]; refF[i] = f[i]; refS[i] = s[i]; }
  calibTs = prefs.getLong64("calib_ts", 0);
  calibrated = true;
  calibStatus = "ok";
}

long long nowEpochMs() {
  time_t t = time(nullptr);
  return t > 1700000000 ? (long long)t * 1000LL : 0;
}

void publishState() {
  if (!mqtt.connected()) return;
  char payload[200];
  snprintf(payload, sizeof(payload),
           "{\"calibrated\":%s,\"calib_status\":\"%s\",\"calib_ts\":%lld,\"buzzer_enabled\":%s}",
           calibrated ? "true" : "false", calibStatus, calibTs, buzzerEnabled ? "true" : "false");
  bool ok = mqtt.publish("v1/devices/me/attributes", payload);
  Serial.printf("%s %s\n", ok ? "TX" : "TX FAILED", payload);
}

// Returns false if a calibration is already scheduled or running.
// With retry, a rejected calibration (rack moving) is attempted again automatically.
bool startCalibration(unsigned long delayMs, bool retry) {
  if (calibRunning || calibScheduled) return false;
  calibScheduled = true;
  calibRetry = retry;
  calibStartAt = millis() + delayMs;
  calibStatus = "scheduled";
  Serial.printf("Calibration scheduled in %lu ms (keep the rack still and plumb)\n", delayMs);
  publishState();
  return true;
}

void calibAddSample(float x, float y, float z) {
  calibSum[0] += x;  calibSumSq[0] += x * x;
  calibSum[1] += y;  calibSumSq[1] += y * y;
  calibSum[2] += z;  calibSumSq[2] += z * z;
  calibN++;
}

void finishCalibration() {
  calibRunning = false;
  bool success = false;

  if (calibN >= 10) {
    float mean[3];
    double variance = 0;
    for (int i = 0; i < 3; i++) {
      mean[i] = calibSum[i] / calibN;
      variance += calibSumSq[i] / calibN - (double)mean[i] * mean[i];
    }
    float stdG = sqrt(fmax(0.0, variance));
    float mag = sqrt(dot3(mean, mean));
    float u[3], f[3], s[3];

    if (stdG > CALIB_MAX_STD_G) {
      Serial.printf("Calibration rejected: rack moving (std=%.3f g)\n", stdG);
    } else if (fabs(mag - 1.0) > CALIB_MAG_TOL_G) {
      Serial.printf("Calibration rejected: |a|=%.2f g (expected ~1 g)\n", mag);
    } else if (!buildFrame(mean, u, f, s)) {
      Serial.println("Calibration rejected: invalid frame");
    } else {
      for (int i = 0; i < 3; i++) { refU[i] = u[i]; refF[i] = f[i]; refS[i] = s[i]; }
      fAx = mean[0]; fAy = mean[1]; fAz = mean[2];
      riseSince = 0;
      calibrated = true;
      calibTs = nowEpochMs();
      saveCalibration();
      success = true;
      Serial.printf("Calibration OK: up=(%.3f, %.3f, %.3f) front=(%.3f, %.3f, %.3f)\n",
                    u[0], u[1], u[2], f[0], f[1], f[2]);
    }
  } else {
    Serial.println("Calibration rejected: not enough samples");
  }

  calibStatus = success ? "ok" : "failed";
  if (!success && calibRetry) {
    calibScheduled = true;
    calibStartAt = millis() + CALIB_RETRY_MS;
  }
  publishState();

  if (success) { buzzerOn(); delay(120); buzzerOff(); }
}

void connectWifi() {
  Serial.printf("Connecting to WiFi '%s'", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nWiFi OK, IP: %s, RSSI: %d dBm\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    Serial.println("\nWiFi not connected yet (will keep retrying).");
  }
}

void publishRackUid() {
  if (rackUid.length() == 0) return;
  char payload[64];
  snprintf(payload, sizeof(payload), "{\"rack_uid\":\"%s\"}", rackUid.c_str());
  bool ok = mqtt.publish("v1/devices/me/attributes", payload);
  Serial.printf("%s %s\n", ok ? "TX" : "TX FAILED", payload);
}

void publishDeviceInfo() {
  char payload[160];
  snprintf(payload, sizeof(payload),
           "{\"mac\":\"%s\",\"ip\":\"%s\",\"firmware_version\":\"%s\"}",
           WiFi.macAddress().c_str(), WiFi.localIP().toString().c_str(), FIRMWARE_VERSION);
  bool ok = mqtt.publish("v1/devices/me/attributes", payload);
  Serial.printf("%s %s\n", ok ? "TX" : "TX FAILED", payload);
}

void applyThresholds(JsonVariantConst attrs) {
  float warn = attrs["tilt_warn_deg"].is<float>() ? attrs["tilt_warn_deg"].as<float>() : tiltWarnDeg;
  float alarm = attrs["tilt_alarm_deg"].is<float>() ? attrs["tilt_alarm_deg"].as<float>() : tiltAlarmDeg;
  float impact = attrs["impact_g"].is<float>() ? attrs["impact_g"].as<float>() : impactThresholdG;

  bool tiltValid = warn >= TILT_MIN_DEG && alarm <= TILT_MAX_DEG && alarm - warn >= TILT_MIN_GAP_DEG;
  bool impactValid = impact >= IMPACT_MIN_G && impact <= IMPACT_MAX_G;

  if (tiltValid) {
    tiltWarnDeg = warn;
    tiltAlarmDeg = alarm;
    prefs.putFloat("warn", tiltWarnDeg);
    prefs.putFloat("alarm", tiltAlarmDeg);
  }
  if (impactValid) {
    impactThresholdG = impact;
    prefs.putFloat("impact", impactThresholdG);
  }
  if (!tiltValid || !impactValid) Serial.println("Thresholds out of range, ignored");
  Serial.printf("Thresholds: warn=%.1f alarm=%.1f impact=%.1f\n", tiltWarnDeg, tiltAlarmDeg, impactThresholdG);
}

void requestThresholds() {
  bool ok = mqtt.publish("v1/devices/me/attributes/request/1",
                         "{\"sharedKeys\":\"tilt_warn_deg,tilt_alarm_deg,impact_g\"}");
  Serial.println(ok ? "TX thresholds request" : "TX FAILED thresholds request");
}

void onMqttMessage(char* topic, byte* payload, unsigned int length) {
  String t(topic);

  if (t == "v1/devices/me/attributes" || t.startsWith("v1/devices/me/attributes/response/")) {
    JsonDocument attrsDoc;
    if (deserializeJson(attrsDoc, payload, length)) return;
    // The answer to our request wraps the values in "shared"; live updates arrive flat
    JsonVariantConst attrs = attrsDoc.as<JsonVariantConst>();
    if (t != "v1/devices/me/attributes") attrs = attrsDoc["shared"].as<JsonVariantConst>();
    applyThresholds(attrs);
    return;
  }

  const String prefix = "v1/devices/me/rpc/request/";
  if (!t.startsWith(prefix)) return;
  String requestId = t.substring(prefix.length());

  JsonDocument doc;
  if (deserializeJson(doc, payload, length)) return;
  const char* method = doc["method"] | "";
  Serial.printf("RPC %s (id %s)\n", method, requestId.c_str());

  String reply = "{\"ok\":true}";
  if (strcmp(method, "silenceAlarm") == 0) {
    alarmSilenced = true;
    buzzerOff();
  } else if (strcmp(method, "setBuzzer") == 0) {
    buzzerEnabled = doc["params"].as<bool>();
    if (!buzzerEnabled) buzzerOff();
    prefs.putBool("buzz", buzzerEnabled);
    publishState();
  } else if (strcmp(method, "calibrate") == 0) {
    // The result is reported later in the calib_* client attributes
    if (startCalibration(1000, false)) reply = "{\"ok\":true,\"calibrating\":true}";
    else reply = "{\"ok\":false,\"error\":\"calibration in progress\"}";
  } else {
    reply = "{\"ok\":false,\"error\":\"unknown method\"}";
  }

  // Two-way RPC: always answer, or the dashboard reports a timeout
  String respTopic = "v1/devices/me/rpc/response/" + requestId;
  mqtt.publish(respTopic.c_str(), reply.c_str());
}

void connectMqtt() {
  if (WiFi.status() != WL_CONNECTED) return;
  Serial.print("Connecting to ThingsBoard MQTT... ");
  // Client id derived from the MAC so several nodes never kick each other out
  String mac = WiFi.macAddress();
  mac.replace(":", "");
  String clientId = "rack-node-" + mac;
  if (mqtt.connect(clientId.c_str(), TB_TOKEN, NULL)) {
    Serial.println("connected.");
    configTime(0, 0, "pool.ntp.org", "time.google.com");
    mqtt.subscribe("v1/devices/me/rpc/request/+");   // without this, commands never arrive
    mqtt.subscribe("v1/devices/me/attributes");
    mqtt.subscribe("v1/devices/me/attributes/response/+");
    requestThresholds();
    publishDeviceInfo();
    publishRackUid();
    publishState();
  } else {
    Serial.printf("failed, rc=%d\n", mqtt.state());   // rc=5 means wrong token
  }
}

void publishTelemetry() {
  char payload[256];
  snprintf(payload, sizeof(payload),
           "{\"tilt_x\":%.2f,\"tilt_y\":%.2f,\"tilt\":%.2f,\"vib_rms\":%.3f,"
           "\"ax\":%.3f,\"ay\":%.3f,\"az\":%.3f,\"temp_c\":%.1f,"
           "\"status\":\"%s\",\"rssi\":%d}",
           tiltX, tiltY, tilt, vibCount > 0 ? sqrt(vibSum / vibCount) : 0.0,
           ax, ay, az, tempC, statusText, WiFi.RSSI());
  bool ok = mqtt.publish("v1/devices/me/telemetry", payload);
  Serial.printf("%s %s\n", ok ? "TX" : "TX FAILED", payload);
}

void publishImpact(float g) {
  char payload[64];
  snprintf(payload, sizeof(payload), "{\"impact\":true,\"impact_g\":%.2f}", g);
  bool ok = mqtt.publish("v1/devices/me/telemetry", payload);
  Serial.printf("%s %s\n", ok ? "TX" : "TX FAILED", payload);
}

void handleRfid() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  if (uid != rackUid) {
    rackUid = uid;
    prefs.putString("uid", rackUid);
    Serial.printf("Rack assigned: %s\n", rackUid.c_str());
    if (mqtt.connected()) publishRackUid();
    buzzerOn(); delay(120); buzzerOff();
    startCalibration(CALIB_START_DELAY_MS, true);   // new rack: take a new plumb reference
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== Rack node ===");

  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  buzzerOff();
  setLeds(false, false, false);
  actuatorsTest();

  Wire.begin(PIN_SDA, PIN_SCL);
  mpuWrite(REG_PWR_MGMT_1, 0x00);
  delay(100);
  mpuWrite(REG_ACCEL_CONFIG, 0x08);   // +-4 g
  int16_t raw[7];
  Serial.println(mpuReadRaw(raw) ? "MPU read OK" : "MPU read FAILED (check wiring)");

  SPI.begin(PIN_SCK, PIN_MISO, PIN_MOSI, PIN_RFID_SS);
  rfid.PCD_Init();

  prefs.begin("rack", false);
  rackUid = prefs.getString("uid", "");
  Serial.printf("Stored rack_uid: %s\n", rackUid.length() ? rackUid.c_str() : "(none)");

  tiltWarnDeg = prefs.getFloat("warn", tiltWarnDeg);
  tiltAlarmDeg = prefs.getFloat("alarm", tiltAlarmDeg);
  impactThresholdG = prefs.getFloat("impact", impactThresholdG);
  Serial.printf("Cached thresholds: warn=%.1f alarm=%.1f impact=%.1f\n", tiltWarnDeg, tiltAlarmDeg, impactThresholdG);

  buzzerEnabled = prefs.getBool("buzz", true);
  loadCalibration();
  if (calibrated) {
    Serial.println("Calibration loaded from flash");
  } else {
    Serial.println("No calibration stored: calibrating automatically (keep the rack still)");
    startCalibration(CALIB_START_DELAY_MS, true);
  }

  mqtt.setServer(TB_HOST, TB_PORT);
  mqtt.setBufferSize(512);
  mqtt.setSocketTimeout(3);
  mqtt.setCallback(onMqttMessage);

  connectWifi();
  connectMqtt();
}

void loop() {
  unsigned long now = millis();

  if (!mqtt.connected()) {
    if (now - lastReconnect >= RECONNECT_MS) {
      lastReconnect = now;
      connectMqtt();
    }
  } else {
    mqtt.loop();
  }

  if (now - lastRfid >= RFID_POLL_MS) {
    lastRfid = now;
    handleRfid();
  }

  if (now - lastSample >= SAMPLE_MS) {
    lastSample = now;

    int16_t raw[7];
    if (!mpuReadRaw(raw)) return;

    ax = raw[0] / ACCEL_LSB_PER_G;
    ay = raw[1] / ACCEL_LSB_PER_G;
    az = raw[2] / ACCEL_LSB_PER_G;
    tempC = raw[3] / 340.0 + 36.53;

    // Calibration is non-blocking: the loop keeps serving MQTT/RPC while it averages
    if (calibScheduled && !calibRunning && (long)(now - calibStartAt) >= 0) {
      calibScheduled = false;
      calibRunning = true;
      calibWindowStart = now;
      calibN = 0;
      for (int i = 0; i < 3; i++) { calibSum[i] = 0; calibSumSq[i] = 0; }
      calibStatus = "running";
      Serial.println("Calibrating...");
      publishState();
    }
    if (calibRunning) {
      calibAddSample(ax, ay, az);
      if (now - calibWindowStart >= CALIB_DURATION_MS) finishCalibration();
    }

    // Tilt uses low-pass filtered acceleration so short knocks barely move it
    fAx += TILT_FILTER_ALPHA * (ax - fAx);
    fAy += TILT_FILTER_ALPHA * (ay - fAy);
    fAz += TILT_FILTER_ALPHA * (az - fAz);

    float g[3] = {fAx, fAy, fAz};
    if (normalize3(g) && sqrt(fAx * fAx + fAy * fAy + fAz * fAz) > 0.2) {   // skip free fall
      float gu = dot3(g, refU), gf = dot3(g, refF), gs = dot3(g, refS);
      tilt = atan2(sqrt(gf * gf + gs * gs), gu) * 180.0 / PI;
      tiltX = atan2(gf, gu) * 180.0 / PI;
      tiltY = atan2(gs, gu) * 180.0 / PI;
    }

    // Vibration and impacts use the raw (unfiltered) acceleration
    float mag = sqrt(ax * ax + ay * ay + az * az);
    vibSum += (mag - 1.0) * (mag - 1.0);
    vibCount++;

    if (mag >= impactThresholdG && now - lastImpact >= IMPACT_COOLDOWN_MS) {
      lastImpact = now;
      if (mqtt.connected()) publishImpact(mag);
    }

    // Level changes use hysteresis; raising it requires TILT_HOLD_MS of sustained tilt
    int target = level;
    if (target == 2 && tilt < tiltAlarmDeg - HYST_DEG) target = 1;
    if (target == 1 && tilt < tiltWarnDeg - HYST_DEG) target = 0;
    if (target < 2 && tilt >= tiltAlarmDeg) target = 2;
    if (target < 1 && tilt >= tiltWarnDeg) target = 1;

    if (target < level) {
      level = target;
      riseSince = 0;
    } else if (target > level) {
      if (riseSince == 0) riseSince = now;
      if (now - riseSince >= TILT_HOLD_MS) { level = target; riseSince = 0; }
    } else {
      riseSince = 0;
    }
    statusText = (level == 2) ? "alarm" : (level == 1) ? "warning" : "ok";

    // Publish right away on status changes so the dashboard and alarms react without waiting
    if (level != lastLevel) {
      lastLevel = level;
      if (mqtt.connected()) publishTelemetry();
    }

    if (level == 0) alarmSilenced = false;

    // Traffic-light logic, works without network (offline = blinking yellow)
    bool blinkOn = (now / 500) % 2;
    if (level == 2) {
      setLeds(false, false, true);
      if (buzzerEnabled && !alarmSilenced) buzzerOn(); else buzzerOff();
    } else {
      buzzerOff();
      if (!mqtt.connected()) setLeds(false, blinkOn, false);
      else if (level == 1) setLeds(false, true, false);
      else setLeds(true, false, false);
    }
  }

  if (now - lastPublish >= PUBLISH_MS) {
    lastPublish = now;
    if (mqtt.connected()) publishTelemetry();
    vibSum = 0;
    vibCount = 0;
  }
}
