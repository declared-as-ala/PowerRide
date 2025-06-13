import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Thermometer,
  WifiOff,
  TriangleAlert as AlertTriangle,
  Waves,
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { usePowerMQTT } from '@/hooks/usePowerMQTT';

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

export default function DashboardScreen() {
  const { colors, theme } = useTheme();
  const { online, reading } = usePowerMQTT();

  const temperatureProgress = useSharedValue(0);
  const [temperatureHistory, setTemperatureHistory] = React.useState<
    { value: number; timestamp: number }[]
  >([]);

  useEffect(() => {
    if (reading.temperature !== 0) {
      const value = reading.temperature;
      const normalized = Math.min(Math.max(value / 100, 0), 1);
      temperatureProgress.value = withSpring(normalized, {
        damping: 15,
        stiffness: 90,
      });

      setTemperatureHistory((prev) => [
        { value, timestamp: Date.now() },
        ...prev.slice(0, 9),
      ]);
    }
  }, [reading.temperature]);

  const temperatureIndicatorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      temperatureProgress.value,
      [0, 0.7, 0.8, 1],
      [colors.success, colors.secondary, colors.warning, colors.error]
    );
    return {
      width: `${temperatureProgress.value * 100}%`,
      backgroundColor,
    };
  });

  const chartData = {
    labels: temperatureHistory
      .slice()
      .reverse()
      .map((d) => formatTime(d.timestamp)),
    datasets: [
      {
        data: temperatureHistory
          .slice()
          .reverse()
          .map((d) => d.value),
        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Température °C'],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) =>
      theme === 'dark'
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(31, 41, 55, ${opacity})`,
    labelColor: (opacity = 1) =>
      theme === 'dark'
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(31, 41, 55, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const isCritical = reading.temperature > 80;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Power Dashboard
        </Text>
        <View
          style={[
            styles.connectionBadge,
            {
              backgroundColor: online ? colors.success : colors.error,
            },
          ]}
        >
          <Text style={styles.connectionText}>
            MQTT: {online ? 'connected' : 'disconnected'}
          </Text>
        </View>
      </View>

      {!online && (
        <View
          style={[
            styles.connectionCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <WifiOff size={24} color={colors.error} />
          <Text style={[styles.connectionMessage, { color: colors.text }]}>
            Connexion au broker MQTT en cours...
          </Text>
        </View>
      )}

      <View
        style={[
          styles.temperatureCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.temperatureIconContainer}>
          <Thermometer
            size={40}
            color={isCritical ? colors.error : colors.primary}
          />
        </View>

        <View style={styles.temperatureDataContainer}>
          <Text
            style={[styles.temperatureLabel, { color: colors.textSecondary }]}
          >
            Température actuelle
          </Text>

          <View style={styles.temperatureValueContainer}>
            <Text
              style={[
                styles.temperatureValue,
                { color: isCritical ? colors.error : colors.text },
              ]}
            >
              {reading.temperature.toFixed(1)}°C
            </Text>
            {isCritical && (
              <View style={styles.criticalBadge}>
                <AlertTriangle size={16} color="white" />
                <Text style={styles.criticalText}>Critique</Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.temperatureBarContainer,
              { backgroundColor: colors.border },
            ]}
          >
            <Animated.View
              style={[styles.temperatureBarFill, temperatureIndicatorStyle]}
            />
          </View>

          <Text
            style={[styles.lastUpdatedText, { color: colors.textSecondary }]}
          >
            {reading.updated
              ? `Mis à jour : ${new Date(reading.updated).toLocaleTimeString()}`
              : 'En attente...'}
          </Text>
        </View>
      </View>

      {temperatureHistory.length > 0 ? (
        <View
          style={[
            styles.graphCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.graphTitle, { color: colors.text }]}>
            Historique Température
          </Text>
          <View style={styles.graphContainer}>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              yAxisSuffix="°C"
            />
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.graphCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.graphTitle, { color: colors.text }]}>
            Historique Température
          </Text>
          <View style={styles.emptyGraphContainer}>
            <Waves size={40} color={colors.textSecondary} />
            <Text
              style={[styles.emptyGraphText, { color: colors.textSecondary }]}
            >
              Aucune donnée de température encore reçue.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 28 },
  connectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectionText: { color: 'white', fontSize: 12 },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    gap: 12,
  },
  connectionMessage: { fontSize: 14, flex: 1 },
  temperatureCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  temperatureIconContainer: { marginRight: 16, padding: 12, borderRadius: 12 },
  temperatureDataContainer: { flex: 1 },
  temperatureLabel: { fontSize: 14, marginBottom: 4 },
  temperatureValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperatureValue: { fontSize: 32, marginRight: 8 },
  criticalBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  criticalText: { color: 'white', fontSize: 12 },
  temperatureBarContainer: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
  },
  temperatureBarFill: { height: '100%', borderRadius: 4 },
  lastUpdatedText: { fontSize: 12 },
  graphCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  graphTitle: { fontSize: 18, marginBottom: 16 },
  graphContainer: { alignItems: 'center' },
  chart: { marginVertical: 8, borderRadius: 16 },
  emptyGraphContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGraphText: { marginTop: 16, fontSize: 14, textAlign: 'center' },
  bottomPadding: { height: 80 },
});
