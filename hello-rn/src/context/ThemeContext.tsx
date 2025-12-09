import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme, StatusBarStyle } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS, Colors } from '../constants/theme';

type ThemeContextType = {
  colors: Colors;
  isDark: boolean;
  toggle: () => void;
  statusBarStyle: StatusBarStyle;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: LIGHT_COLORS,
  isDark: false,
  toggle: () => {},
  statusBarStyle: 'dark-content',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [forceDark, setForceDark] = useState<boolean | null>(null);

  const isDark = forceDark ?? (system === 'dark');

  const colors = useMemo(() => (isDark ? DARK_COLORS : LIGHT_COLORS), [isDark]);

  const toggle = () => setForceDark((v) => (v === null ? ! (system === 'dark') : !v));

  const statusBarStyle: StatusBarStyle = isDark ? 'light-content' : 'dark-content';

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggle, statusBarStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
