// App.js (or put in a screen if using Expo Router)

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import mqtt from 'mqtt';
const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt'; // <--- must be wss:// and port 8884!

const topics = {
  temperature: 'app/temperature',
  voltage: 'app/voltage',
  current: 'app/current',
  alert: 'app/alert',
};

export default function App() {
  const [temperature, setTemperature] = useState('--');
  const [voltage, setVoltage] = useState('--');
  const [current, setCurrent] = useState('--');
  const [alert, setAlert] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create MQTT client
    const client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
      setConnected(true);
      // Subscribe to all topics
      Object.values(topics).forEach((topic) => {
        client.subscribe(topic);
      });
    });

    client.on('message', (topic, message) => {
      const value = message.toString();
      if (topic === topics.temperature) setTemperature(value);
      if (topic === topics.voltage) setVoltage(value);
      if (topic === topics.current) setCurrent(value);
      if (topic === topics.alert) setAlert(value);
    });

    client.on('error', (e) => {
      setConnected(false);
    });

    client.on('close', () => setConnected(false));

    return () => {
      client.end();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ESP32 Live Monitor</Text>
      <View style={styles.card}>
        <Text style={styles.label}>🌡 Température:</Text>
        <Text style={styles.value}>{temperature} °C</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>⚡ Tension:</Text>
        <Text style={styles.value}>{voltage} V</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>🔌 Courant:</Text>
        <Text style={styles.value}>{current} A</Text>
      </View>
      {alert ? (
        <View style={styles.alert}>
          <Text style={styles.alertText}>🚨 {alert}</Text>
        </View>
      ) : null}
      <Text style={styles.status}>
        MQTT: {connected ? 'Connecté' : 'Déconnecté'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f3fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#7c3aed',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    minWidth: 250,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    width: 120,
    color: '#374151',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
    color: '#4f46e5',
  },
  alert: {
    backgroundColor: '#ffe4e6',
    borderRadius: 8,
    padding: 8,
    marginTop: 18,
  },
  alertText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 18,
  },
  status: {
    position: 'absolute',
    bottom: 24,
    color: '#6366f1',
    fontSize: 16,
  },
});
