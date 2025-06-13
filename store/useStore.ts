import { create } from 'zustand';

/* ─────────── Types ─────────── */
export interface Reading {
  value: number;
  timestamp: number;
}

export interface Alert {
  id: string;
  type: 'temp' | 'volt' | 'curr';
  value: number;
  timestamp: number;
  message: string;
  read: boolean;
}

/* ─────────── State ─────────── */
interface AppState {
  // MQTT
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  setConnectionStatus: (
    status: 'connecting' | 'connected' | 'disconnected' | 'error'
  ) => void;

  // Température
  currentTemperature: number | null;
  temperatureHistory: Reading[];
  setCurrentTemperature: (v: number) => void;
  addTemperatureReading: (v: number) => void;

  // Tension
  currentVoltage: number | null;
  voltageHistory: Reading[];
  addVoltageReading: (v: number) => void;

  // Courant
  currentCurrent: number | null;
  currentHistory: Reading[];
  addCurrentReading: (v: number) => void;

  // Alertes
  alerts: Alert[];
  addAlert: (
    type: 'temp' | 'volt' | 'curr',
    value: number,
    msg: string
  ) => void;
  markAlertAsRead: (id: string) => void;
  clearAllAlerts: () => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

/* ─────────── Store ─────────── */
export const useStore = create<AppState>((set) => ({
  isConnected: false,
  connectionStatus: 'disconnected',
  setConnectionStatus: (status) =>
    set({ connectionStatus: status, isConnected: status === 'connected' }),

  currentTemperature: null,
  temperatureHistory: [],
  setCurrentTemperature: (v) => set({ currentTemperature: v }),
  addTemperatureReading: (v) =>
    set((s) => {
      const critical = v > 80;
      const reading = { value: v, timestamp: Date.now() };
      const hist = [reading, ...s.temperatureHistory].slice(0, 10);

      const newAlert =
        critical &&
        ({
          id: `alert-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          type: 'temp',
          value: v,
          timestamp: Date.now(),
          message: `Température critique détectée : ${v.toFixed(1)}°C`,
          read: false,
        } as Alert);

      return {
        currentTemperature: v,
        temperatureHistory: hist,
        alerts: newAlert ? [newAlert, ...s.alerts] : s.alerts,
      };
    }),

  currentVoltage: null,
  voltageHistory: [],
  addVoltageReading: (v) =>
    set((s) => {
      const reading = { value: v, timestamp: Date.now() };
      return {
        currentVoltage: v,
        voltageHistory: [reading, ...s.voltageHistory].slice(0, 10),
      };
    }),

  currentCurrent: null,
  currentHistory: [],
  addCurrentReading: (v) =>
    set((s) => {
      const reading = { value: v, timestamp: Date.now() };
      return {
        currentCurrent: v,
        currentHistory: [reading, ...s.currentHistory].slice(0, 10),
      };
    }),

  alerts: [],
  addAlert: (type, value, msg) =>
    set((s) => ({
      alerts: [
        {
          id: `alert-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          type,
          value,
          timestamp: Date.now(),
          message: msg,
          read: false,
        },
        ...s.alerts,
      ],
    })),
  markAlertAsRead: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),
  clearAllAlerts: () => set({ alerts: [] }),

  hasCompletedOnboarding: false,
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));
