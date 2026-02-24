// storage/asyncStorage.ts

import { VpnSettings } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ONBOARDING_COMPLETE: "onboarding_complete",
  VPN_SETTINGS: "vpn_settings",
} as const;

const DEFAULT_SETTINGS: VpnSettings = {
  killSwitch: false,
  autoConnect: false,
  splitTunneling: false,
  protocol: "WireGuard",
  darkMode: true,
};

// ✅ Helper function for safe JSON parsing
const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
};

// ✅ Helper function for error handling
const handleStorageError = (operation: string, error: unknown): void => {
  console.error(`AsyncStorage ${operation} failed:`, error);
};

// ==================== Onboarding ====================
export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === "true";
  } catch (error) {
    handleStorageError("isOnboardingComplete", error);
    return false;
  }
};

export const setOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, "true");
  } catch (error) {
    handleStorageError("setOnboardingComplete", error);
  }
};

// ==================== VPN Settings ====================
export const getVpnSettings = async (): Promise<VpnSettings> => {
  try {
    const json = await AsyncStorage.getItem(KEYS.VPN_SETTINGS);
    const parsed = safeJsonParse<Partial<VpnSettings>>(json, {});
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    handleStorageError("getVpnSettings", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveVpnSettings = async (settings: VpnSettings): Promise<void> => {
  try {
    if (!settings || typeof settings !== "object") {
      throw new Error("Invalid settings object");
    }
    await AsyncStorage.setItem(KEYS.VPN_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    handleStorageError("saveVpnSettings", error);
  }
};

export const clearVpnSettings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.VPN_SETTINGS);
  } catch (error) {
    handleStorageError("clearVpnSettings", error);
  }
};

// ==================== Clear All Data ====================
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    handleStorageError("clearAllData", error);
  }
};
