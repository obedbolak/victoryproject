// constants/Theme.ts

import { MD3DarkTheme } from "react-native-paper";

export const AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#6C63FF",
    primaryContainer: "#4A42D4",
    secondary: "#03DAC6",
    secondaryContainer: "#018786",
    background: "#0A0E21",
    surface: "#1C1F3B",
    surfaceVariant: "#252A4A",
    error: "#CF6679",
    onPrimary: "#FFFFFF",
    onBackground: "#FFFFFF",
    onSurface: "#FFFFFF",
    outline: "#3A3F6B",
    elevation: {
      level0: "transparent",
      level1: "#1C1F3B",
      level2: "#252A4A",
      level3: "#2E3358",
      level4: "#373C66",
      level5: "#404574",
    },
  },
};

export const CustomColors = {
  success: "#00E676",
  warning: "#FFD600",
  danger: "#FF5252",
  gradientStart: "#6C63FF",
  gradientEnd: "#3F51B5",
  cardBackground: "#1C1F3B",
  connectedGlow: "#00E676",
  disconnectedGlow: "#FF5252",
  connectingGlow: "#FFD600",
  surface: "#1C1F3B",
  background: "#0A0E21",
  primary: "#6C63FF",
  textPrimary: "#FFFFFF",
  textSecondary: "#888888",
  textMuted: "#666666",
  gold: "#FFD700",
};
