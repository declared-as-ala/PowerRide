import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme types and colors
export type ThemeType = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  card: string;
}

export const LightTheme: ThemeColors = {
  primary: '#7C3AED', // violet
  secondary: '#3B82F6', // blue
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  card: '#FFFFFF',
};

export const DarkTheme: ThemeColors = {
  primary: '#9061F9', // lighter violet
  secondary: '#60A5FA', // lighter blue
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  border: '#374151',
  card: '#262626',
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(
    deviceTheme === 'dark' ? 'dark' : 'light'
  );
  const colors = theme === 'light' ? LightTheme : DarkTheme;

  useEffect(() => {
    // Update theme when device theme changes
    if (deviceTheme) {
      setTheme(deviceTheme === 'dark' ? 'dark' : 'light');
    }
  }, [deviceTheme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
