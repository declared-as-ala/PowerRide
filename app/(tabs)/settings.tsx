import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  Pressable,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store/useStore';
import {
  Settings,
  Sun,
  Moon,
  Info,
  Thermometer,
  Bell,
  Zap,
  Shield,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          icon:
            theme === 'dark' ? (
              <Moon size={20} color={colors.primary} />
            ) : (
              <Sun size={20} color={colors.primary} />
            ),
          type: 'toggle',
          value: theme === 'dark',
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'criticalAlerts',
          title: 'Critical Temperature Alerts',
          description: 'Receive alerts when temperature exceeds 80°C',
          icon: <Bell size={20} color={colors.primary} />,
          type: 'toggle',
          value: true,
          onToggle: () => {},
        },
      ],
    },
    {
      title: 'Sensor',
      items: [
        {
          id: 'sensorInfo',
          title: 'DS18B20 Temperature Sensor',
          description: 'View sensor specifications and calibration',
          icon: <Thermometer size={20} color={colors.primary} />,
          type: 'link',
          onPress: () => {},
        },
        {
          id: 'powerSettings',
          title: 'Power Management',
          description: 'Configure sensor reading frequency',
          icon: <Zap size={20} color={colors.primary} />,
          type: 'link',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'about',
          title: 'About PowerRide',
          description: 'Version 1.0.0',
          icon: <Info size={20} color={colors.primary} />,
          type: 'link',
          onPress: () => {},
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          description: 'View privacy policy and security information',
          icon: <Shield size={20} color={colors.primary} />,
          type: 'link',
          onPress: () => Linking.openURL('https://example.com/privacy'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    return (
      <View
        key={item.id}
        style={[styles.settingItem, { borderBottomColor: colors.border }]}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + '10' },
            ]}
          >
            {item.icon}
          </View>
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.settingTitle,
                { color: colors.text, fontFamily: 'Poppins-Medium' },
              ]}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.settingDescription,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'Poppins-Regular',
                  },
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="white"
          />
        )}

        {item.type === 'link' && (
          <Pressable onPress={item.onPress}>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    );
  };

  const renderSection = (section: any, index: any) => {
    return (
      <View key={section.title} style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.primary, fontFamily: 'Poppins-Medium' },
          ]}
        >
          {section.title}
        </Text>
        <View
          style={[
            styles.sectionContent,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {section.items.map(renderSettingItem)}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Settings size={28} color={colors.primary} />
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text, fontFamily: 'Poppins-Bold' },
          ]}
        >
          Settings
        </Text>
      </View>

      {settingsSections.map(renderSection)}

      <View style={styles.footer}>
        <Text
          style={[
            styles.footerText,
            { color: colors.textSecondary, fontFamily: 'Poppins-Regular' },
          ]}
        >
          PowerRide Temperature Monitor v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 8,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  footerText: {
    fontSize: 12,
  },
});
