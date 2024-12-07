#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <Firebase_ESP_Client.h>
#include <PulseSensorPlayground.h>
#include <ArduinoJson.h>
#include <time.h>

// ------------------- USER CONFIG -------------------
const char* ssid = "*********";
const char* password = "**********";

// Firebase credentials
#define DATABASE_URL "**********";
#define DATABASE_SECRET "**********";


// ------------------- GLOBAL OBJECTS ----------------
FirebaseData fbdo;
FirebaseConfig config;
PulseSensorPlayground pulseSensor;
WiFiClientSecure client;

const int PulseWire = A0;
const int LED = LED_BUILTIN;
int Threshold = 550;
unsigned long sendDataPrevMillis = 0;
bool timeSynced = false;

bool ensureTimeSync();
void reconnectWiFi();

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi connected!");

  // Initialize Firebase with legacy token
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  Firebase.begin(&config, nullptr);
  Firebase.reconnectWiFi(true);
  Serial.println("Firebase initialized.");

  // Initialize PulseSensor
  pulseSensor.analogInput(PulseWire);
  pulseSensor.blinkOnPulse(LED);
  pulseSensor.setThreshold(Threshold);

  if (pulseSensor.begin()) {
    Serial.println("PulseSensor initialized successfully!");
  } else {
    Serial.println("PulseSensor initialization failed, continuing anyway...");
  }

  // Sync NTP time
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  if (ensureTimeSync()) {
    timeSynced = true;
    Serial.println("Time synced successfully.");
  } else {
    Serial.println("Failed to sync time. Will use 'N/A' for timestamps.");
  }

  // Insecure SSL for testing (optional)
  client.setInsecure();
}

void loop() {
  reconnectWiFi();

  // Every 15 seconds, gather and send data
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Get BPM
    int myBPM = pulseSensor.getBeatsPerMinute();
    Serial.print("Current BPM: ");
    Serial.println(myBPM);

    // Get timestamp
    char timestamp[20] = "N/A";
    if (timeSynced) {
      struct tm timeInfo;
      if (getLocalTime(&timeInfo)) {
        strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", &timeInfo);
      } else {
        Serial.println("Warning: Failed to get time now, using 'N/A'.");
      }
    }

    // Get device IP address as a simple identifier
    IPAddress ip = WiFi.localIP();
    String ipStr = ip.toString(); // e.g. "192.168.1.100"

    // Prepare JSON for Firebase
    FirebaseJson json;
    json.set("heartRate", myBPM);
    json.set("timestamp", timestamp);
    json.set("deviceIP", ipStr);

    Serial.println("Sending data to Firebase...");
    if (Firebase.RTDB.setJSON(&fbdo, "/heartRate", &json)) {
      Serial.println("Data sent successfully!");
    } else {
      Serial.print("Failed to send data to Firebase: ");
      Serial.println(fbdo.errorReason());
    }

    delay(10); // Small delay for stability
  }

  delay(20); // give the Wi-Fi and other background tasks time
}

bool ensureTimeSync() {
  struct tm timeInfo;
  int retries = 0;
  while (!getLocalTime(&timeInfo) && retries < 30) {
    Serial.println("Waiting for NTP time sync...");
    delay(1000);
    retries++;
  }
  return (retries < 30);
}

void reconnectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("Wi-Fi lost, reconnecting...");
  WiFi.begin(ssid, password);
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED && retryCount < 20) {
    delay(500);
    Serial.print(".");
    retryCount++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nReconnected to Wi-Fi!");
    // Attempt to re-sync time if needed
    if (!timeSynced && ensureTimeSync()) {
      timeSynced = true;
      Serial.println("Time re-synced after reconnect.");
    }
  } else {
    Serial.println("\nFailed to reconnect to Wi-Fi.");
  }
}
