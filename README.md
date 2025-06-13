# ⚡ PowerRide

> Stay powered, stay safe.

**PowerRide** is a real-time monitoring app built with Expo, designed to connect with an ESP32 device over MQTT. It tracks temperature, voltage, and current — instantly alerting users if any critical threshold is exceeded.

---

## 🚀 Features

- **Live MQTT Monitoring:** Receives data from ESP32 sensors (temperature, voltage, current)
- **Instant Alerts:** Notifies users when thresholds are passed
- **Modern Mobile UI:** Built with React Native (Expo)
- **Easy Setup:** Connects directly to your MQTT broker

---

## 📝 TODO

- [ ] Add push notifications for critical alerts
- [ ] Enable user-customizable thresholds
- [ ] Add dark mode support

---

## 📱 Screenshots



## 📱 Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/4c16b4e5-86f1-460e-a9f4-f8af27b666b9" alt="3" width="180"/>
  <img src="https://github.com/user-attachments/assets/658de88c-4cfb-4399-aeec-5a9414ccb66b" alt="4" width="180"/>
  <img src="https://github.com/user-attachments/assets/9f13ea86-c79a-4a78-93a5-cb2563e5938a" alt="6" width="180"/>
  <img src="https://github.com/user-attachments/assets/a1aa44c6-8615-4f57-a194-1f4cbb82ec48" alt="5" width="180"/>
  <img src="https://github.com/user-attachments/assets/9755a26c-b664-48ad-ab15-7d18d98c1ce1" alt="1" width="180"/>
  <img src="https://github.com/user-attachments/assets/920fd94d-91d5-4f7d-ac20-bed5e515681e" alt="2" width="180"/>
</p>


---

## ⚙️ How It Works

1. **ESP32** reads sensor values (temperature, voltage, current)
2. **ESP32** publishes values to an MQTT broker
3. **PowerRide App** subscribes to these MQTT topics
4. **Alerts** are triggered in the app if a value exceeds safe limits

---

## 🔌 Example MQTT Payload

```text
📤 31.52°C | 11.34V | 3.01A
📤 27.02°C | 11.14V | 3.72A
📤 34.73°C | 12.88V | 2.55A
...
```
