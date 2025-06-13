/**
 *  ESP32 + ACS712 + C11A063 + DS18B20
 *  – envoie les mesures sur MQTT (HiveMQ WebSocket broker)
 *  Topics :
 *      app/temperature   → °C          (float, ex. 26.3)
 *      app/voltage       → V           (float, ex. 12.10)
 *      app/current       → A           (float, ex. 0.12  — signe = sens)
 *      app/alert         → texte court (si seuil dépassé)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ---------- Wi-Fi ----------
const char* ssid     = "Castello2.4";         // <-- change si besoin
const char* password = "Castello2.4";     // <-- change si besoin

// ---------- MQTT ----------
const char* mqtt_server   = "broker.hivemq.com";
const int   mqtt_port     = 1883;        // port TCP
const char* topicTemp     = "app/temperature";
const char* topicVolt     = "app/voltage";
const char* topicCurr     = "app/current";
const char* topicAlert    = "app/alert";

WiFiClient  espClient;
PubSubClient mqtt(espClient);

// ---------- Capteurs ----------
#define ACS_PIN       34      // Courant
#define C11A_PIN      35      // Tension
#define ONE_WIRE_BUS  13      // DS18B20

float refVoltage = 3.3;
const int adcMax = 4095;

// — ACS712 —
float offsetACS      = 2.40;   // ← calibre à vide !
float sensitivityACS = 0.100;  // 20 A → 100 mV/A  | 30 A → 66 mV/A | 5 A → 185 mV/A

// — DS18B20 —
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ---------- Fonctions ----------
void connectWiFi() {
  Serial.print("Wi-Fi…");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print('.'); }
  Serial.print(" connecté. IP = ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("MQTT…");
    String clientId = String("esp32_") + String((uint32_t)ESP.getEfuseMac(), HEX);

    if (mqtt.connect(clientId.c_str())) {
      Serial.println(" connecté");
      // (pas d’abonnement, on ne fait qu’ENVOYER)
    } else {
      Serial.print(" échec, rc=");
      Serial.print(mqtt.state());
      Serial.println(" → retry 2 s");
      delay(2000);
    }
  }
}

// ---------- Setup ----------
void setup() {
  Serial.begin(115200);
  analogReadResolution(12);      // ADC 0-4095
  sensors.begin();

  connectWiFi();
  mqtt.setServer(mqtt_server, mqtt_port);
}

// ---------- Boucle ----------
void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!mqtt.connected())           connectMQTT();
  mqtt.loop();                     // entretien client

  // --- COURANT (ACS712) ---
  float voltsACS = analogRead(ACS_PIN) * refVoltage / adcMax;
  float currentA = (voltsACS - offsetACS) / sensitivityACS;
  if (abs(currentA) < 0.05) currentA = 0.0;   // zone morte 50 mA

  // --- TENSION (C11A063) ---
  float voltsC11 = analogRead(C11A_PIN) * refVoltage / adcMax;
  // (si tu mesures plus de 3 V → ajouter un pont diviseur !)

  // --- TEMPÉRATURE (DS18B20) ---
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  // --- ENVOI MQTT ---
  mqtt.publish(topicTemp, String(tempC, 2).c_str(), true);
  mqtt.publish(topicVolt, String(voltsC11, 2).c_str(), true);
  mqtt.publish(topicCurr, String(currentA, 3).c_str(), true);

  // --- Option : alerte ---
  if (tempC > 80.0)               mqtt.publish(topicAlert, "TEMP_HIGH", true);
  if (abs(currentA) > 10.0)       mqtt.publish(topicAlert, "CURR_HIGH", true);

  // --- DEBUG série ---
  Serial.printf("🌡 %.2f °C | ⚡ %.2f V | 🔌 %.3f A\n", tempC, voltsC11, currentA);

  delay(1000);
}
