// hooks/useMQTT.ts
import { useEffect, useState, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';

// ---------- Types ----------
export interface Reading {
  temperature: number;
  humidity: number;
  gas: number;
  updated: string;
}
export interface GasAlert {
  text: string;
  time: string;
}

// ---------- Broker URL (WebSocket) ----------
const URL = 'wss://mqtt.eclipseprojects.io/mqtt'; // يعمل على الويب و الموبايل

export function useMQTT() {
  const [client, setClient] = useState<MqttClient>();
  const [online, setOnline] = useState(false);
  const [reading, setReading] = useState<Reading>({
    temperature: 0,
    humidity: 0,
    gas: 0,
    updated: '',
  });
  const [alert, setAlert] = useState<GasAlert | null>(null);

  // ---------- Connect once ----------
  useEffect(() => {
    const c = mqtt.connect(URL, {
      protocol: 'wss',
      reconnectPeriod: 4000,
      connectTimeout: 10_000,
      clean: true,
    });
    setClient(c);

    // ----- Life-cycle -----
    c.on('connect', () => {
      setOnline(true);
      c.subscribe([
        'maison/capteurs/all',
        'maison/capteurs/temperature',
        'maison/capteurs/humidite',
        'maison/capteurs/gaz',
        'maison/alerte/gaz',
        'maison/status',
      ]);
    });
    c.on('reconnect', () => setOnline(false));
    c.on('close', () => setOnline(false));
    c.on('offline', () => setOnline(false));
    c.on('error', () => setOnline(false));

    // ----- Messages -----
    c.on('message', (topic, buf) => {
      const msg = buf.toString();
      const now = new Date().toISOString();

      if (topic === 'maison/status') setOnline(msg === 'ONLINE');
      else if (topic === 'maison/capteurs/all') {
        try {
          const j = JSON.parse(msg);
          setReading({
            temperature: +j.temperature,
            humidity: +j.humidity,
            gas: +j.gas,
            updated: now,
          });
        } catch {
          /* ignore */
        }
      } else if (topic.endsWith('/temperature'))
        setReading((p) => ({ ...p, temperature: +msg, updated: now }));
      else if (topic.endsWith('/humidite'))
        setReading((p) => ({ ...p, humidity: +msg, updated: now }));
      else if (topic.endsWith('/gaz'))
        setReading((p) => ({ ...p, gas: +msg, updated: now }));
      else if (topic === 'maison/alerte/gaz')
        setAlert({ text: msg, time: now });
    });

    return () => c.end(true); // cleanup
  }, []);

  // ---------- helpers ----------
  const publish = useCallback(
    (t: string, m: string) => client?.publish(t, m),
    [client]
  );
  const subscribe = useCallback(
    (t: string | string[]) => client?.subscribe(t),
    [client]
  );

  return { online, reading, alert, publish, subscribe };
}
