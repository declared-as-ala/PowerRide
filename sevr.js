// mqtt-fake-publisher.js
import mqtt from 'mqtt';

const URL = 'wss://mqtt.eclipseprojects.io/mqtt';
const client = mqtt.connect(URL, {
  protocol: 'wss',
  reconnectPeriod: 3000,
  connectTimeout: 10_000,
  clean: true,
});

client.on('connect', () => {
  console.log('[✓] Connected to MQTT broker');

  // Publish fake data every 2 seconds
  setInterval(() => {
    const temp = (Math.random() * 15 + 20).toFixed(2); // 20-35 °C
    const voltage = (Math.random() * 30 + 210).toFixed(2); // 210-240 V
    const current = (Math.random() * 4 + 1).toFixed(2); // 1-5 A

    client.publish('power/temperature', temp);
    client.publish('power/voltage', voltage);
    client.publish('power/current', current);

    console.log(
      `[→] Published: Temp=${temp}°C, Volt=${voltage}V, Curr=${current}A`
    );
  }, 2000);
});

client.on('error', (err) => {
  console.error('[✗] Connection error:', err);
});

client.on('close', () => {
  console.warn('[!] Connection closed');
});
