// hooks/usePowerMQTT.ts
import { useEffect, useState, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface PowerReading {
  temperature: number;
  voltage: number;
  current: number;
  updated: string;
}

const URL = 'wss://mqtt.eclipseprojects.io/mqtt';

export function usePowerMQTT() {
  const [client, setClient] = useState<MqttClient>();
  const [online, setOnline] = useState(false);
  const [reading, setReading] = useState<PowerReading>({
    temperature: 0,
    voltage: 0,
    current: 0,
    updated: '',
  });

  useEffect(() => {
    const c = mqtt.connect(URL, {
      protocol: 'wss',
      reconnectPeriod: 4000,
      connectTimeout: 10000,
      clean: true,
    });
    setClient(c);

    c.on('connect', () => {
      setOnline(true);
      c.subscribe(['power/temperature', 'power/voltage', 'power/current']);
    });
    c.on('reconnect', () => setOnline(false));
    c.on('close', () => setOnline(false));
    c.on('offline', () => setOnline(false));
    c.on('error', () => setOnline(false));

    c.on('message', (topic, buf) => {
      const msg = buf.toString();
      const val = parseFloat(msg);
      const now = new Date().toISOString();
      setReading((prev) => {
        const update: Partial<PowerReading> = {};
        if (topic.endsWith('/temperature')) update.temperature = val;
        else if (topic.endsWith('/voltage')) update.voltage = val;
        else if (topic.endsWith('/current')) update.current = val;
        return { ...prev, ...update, updated: now };
      });
    });

    return () => c.end(true);
  }, []);

  const publish = useCallback(
    (t: string, m: string) => client?.publish(t, m),
    [client]
  );

  return { online, reading, publish };
}
