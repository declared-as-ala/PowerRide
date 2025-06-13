import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/contexts/ThemeContext';
import { BellOff, Bell } from 'lucide-react-native';

export default function AlertsScreen() {
  const { colors } = useTheme();
  const { alerts } = useStore();

  const renderAlert = ({ item }: any) => {
    let title = '';
    let valueDisplay = '';

    if (item.type === 'temp' && item.value > 30) {
      title = '🌡️ Alerte Température';
      valueDisplay = `Température élevée : ${item.value.toFixed(1)}°C`;
    } else if (item.type === 'volt' && Math.abs(item.value - 5) > 0.5) {
      title = '⚡ Alerte Tension';
      valueDisplay = `Tension anormale : ${item.value.toFixed(2)}V`;
    } else if (item.type === 'curr' && item.value > 20) {
      title = '🔌 Alerte Courant';
      valueDisplay = `Courant trop élevé : ${item.value.toFixed(2)}A`;
    } else {
      return null; // ignorer les fausses alertes
    }

    return (
      <View style={[styles.alertBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.alertTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
          {valueDisplay}
        </Text>
      </View>
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (a.type === 'temp') return a.value > 30;
    if (a.type === 'volt') return Math.abs(a.value - 5) > 0.5;
    if (a.type === 'curr') return a.value > 20;
    return false;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Alertes</Text>

      {filteredAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <BellOff size={64} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }}>
            Aucune alerte critique détectée.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  alertBox: {
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertMessage: {
    marginTop: 6,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});
