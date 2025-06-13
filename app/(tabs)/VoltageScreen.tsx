import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePowerMQTT } from '@/hooks/usePowerMQTT';
import { Zap, Activity, WifiOff } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

export default function VoltageCurrentScreen() {
  const { colors, theme } = useTheme();
  const { online, reading } = usePowerMQTT();

  const voltageProgress = useSharedValue(0);
  const currentProgress = useSharedValue(0);
  const [voltageHistory, setVoltageHistory] = useState<any[]>([]);
  const [currentHistory, setCurrentHistory] = useState<any[]>([]);

  useEffect(() => {
    voltageProgress.value = withSpring(Math.min(reading.voltage / 20, 1));
    currentProgress.value = withSpring(Math.min(reading.current / 20, 1));

    setVoltageHistory((prev) => [
      { value: reading.voltage, timestamp: reading.updated },
      ...prev.slice(0, 9),
    ]);
    setCurrentHistory((prev) => [
      { value: reading.current, timestamp: reading.updated },
      ...prev.slice(0, 9),
    ]);
  }, [reading]);

  const animatedBar = (progress: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        progress.value,
        [0, 0.7, 0.8, 1],
        [colors.success, colors.secondary, colors.warning, colors.error]
      );
      return {
        width: `${progress.value * 100}%`,
        backgroundColor,
      };
    });

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 2,
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

  const chartData = (history: any[], label: string) => ({
    labels: history.map((h) => formatTime(h.timestamp)),
    datasets: [
      {
        data: history.map((h) => h.value),
        color: (opacity = 1) => `rgba(124,58,237,${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: [label],
  });

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
            { backgroundColor: online ? colors.success : colors.error },
          ]}
        >
          <Text style={styles.connectionText}>
            {online ? 'Connected' : 'Disconnected'}
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
            Connecting to MQTT broker...
          </Text>
        </View>
      )}

      {/* Voltage */}
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.iconContainer}>
          <Zap size={40} color={colors.primary} />
        </View>
        <View style={styles.dataContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Voltage
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {reading.voltage.toFixed(2)} V
          </Text>
          <View
            style={[styles.barContainer, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[styles.barFill, animatedBar(voltageProgress)]}
            />
          </View>
        </View>
      </View>

      {/* Current */}
      <View style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.iconContainer}>
          <Activity size={40} color={colors.primary} />
        </View>
        <View style={styles.dataContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Current
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {reading.current.toFixed(2)} A
          </Text>
          <View
            style={[styles.barContainer, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[styles.barFill, animatedBar(currentProgress)]}
            />
          </View>
        </View>
      </View>

      {/* Charts */}
      {[
        { title: 'Voltage History', data: voltageHistory, suffix: 'V' },
        { title: 'Current History', data: currentHistory, suffix: 'A' },
      ].map((s, i) => (
        <View
          key={i}
          style={[
            styles.graphCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.graphTitle, { color: colors.text }]}>
            {s.title}
          </Text>
          {s.data.length > 0 ? (
            <LineChart
              data={chartData(s.data, s.title)}
              width={Dimensions.get('window').width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines
              yAxisSuffix={s.suffix}
              fromZero={true}
            />
          ) : (
            <View style={styles.emptyGraphContainer}>
              <Text
                style={[styles.emptyGraphText, { color: colors.textSecondary }]}
              >
                No data available
              </Text>
            </View>
          )}
        </View>
      ))}

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
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: { marginRight: 16, padding: 12, borderRadius: 12 },
  dataContainer: { flex: 1 },
  label: { fontSize: 14, marginBottom: 4 },
  value: { fontSize: 32, marginBottom: 8 },
  barContainer: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
  },
  barFill: { height: '100%', borderRadius: 4 },
  graphCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  graphTitle: { fontSize: 18, marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
  emptyGraphContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGraphText: { marginTop: 16, fontSize: 14, textAlign: 'center' },
  bottomPadding: { height: 80 },
});
