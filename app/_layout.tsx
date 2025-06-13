import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '@/contexts/ThemeContext';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useStore } from '@/store/useStore';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
  });

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const { currentTemperature, currentVoltage, currentCurrent, addAlert } =
    useStore();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          alert('Permissions de notification non accordées');
          return;
        }

        const token = await Notifications.getExpoPushTokenAsync();
        setExpoPushToken(token.data);
        console.log('✅ Expo Push Token:', token.data);
      } else {
        alert('Les notifications push nécessitent un appareil physique.');
      }
    };

    registerForPushNotifications();
  }, []);

  useEffect(() => {
    if (
      currentTemperature == null &&
      currentVoltage == null &&
      currentCurrent == null
    )
      return;

    if (currentTemperature !== null && currentTemperature > 30) {
      const msg = `Température élevée : ${currentTemperature.toFixed(1)}°C`;

      Notifications.scheduleNotificationAsync({
        content: {
          title: '🌡️ Alerte Température',
          body: msg,
        },
        trigger: null,
      });

      addAlert('temp', currentTemperature, msg);
    }

    if (currentVoltage !== null && Math.abs(currentVoltage - 5) > 0.5) {
      const msg = `Tension anormale : ${currentVoltage.toFixed(2)}V`;

      Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ Alerte Tension',
          body: msg,
        },
        trigger: null,
      });

      addAlert('volt', currentVoltage, msg);
    }

    if (currentCurrent !== null && currentCurrent > 20) {
      const msg = `Courant trop élevé : ${currentCurrent.toFixed(2)}A`;

      Notifications.scheduleNotificationAsync({
        content: {
          title: '🔌 Alerte Courant',
          body: msg,
        },
        trigger: null,
      });

      addAlert('curr', currentCurrent, msg);
    }
  }, [currentTemperature, currentVoltage, currentCurrent]);

  return (
    <ThemeProvider>
      <Stack initialRouteName="onboarding">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
