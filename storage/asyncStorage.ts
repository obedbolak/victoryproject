// storage/asyncStorage.ts

import { VpnSettings } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ONBOARDING_COMPLETE: "onboarding_complete",
  SELECTED_SERVER: "selected_server_id",
  VPN_USERNAME: "vpn_username",
  VPN_PASSWORD: "vpn_password",
  PREMIUM_STATUS: "premium_status",
  VPN_SETTINGS: "vpn_settings",
};

const DEFAULT_SETTINGS: VpnSettings = {
  killSwitch: false,
  autoConnect: false,
  splitTunneling: false,
  protocol: "OpenVPN",
  darkMode: true,
};
// Onboarding
export const isOnboardingComplete = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return value === "true";
};

export const setOnboardingComplete = async (): Promise<void> => {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, "true");
};

// Selected Server
export const getSelectedServer = async (): Promise<string | null> => {
  return AsyncStorage.getItem(KEYS.SELECTED_SERVER);
};

export const saveSelectedServer = async (serverId: string): Promise<void> => {
  await AsyncStorage.setItem(KEYS.SELECTED_SERVER, serverId);
};

// VPN Credentials (for auth-user-pass)
export const saveVpnCredentials = async (
  username: string,
  password: string,
): Promise<void> => {
  await AsyncStorage.setItem(KEYS.VPN_USERNAME, username);
  await AsyncStorage.setItem(KEYS.VPN_PASSWORD, password);
};

export const getVpnCredentials = async (): Promise<{
  username: string;
  password: string;
} | null> => {
  const username = await AsyncStorage.getItem(KEYS.VPN_USERNAME);
  const password = await AsyncStorage.getItem(KEYS.VPN_PASSWORD);
  if (username && password) {
    return { username, password };
  }
  return null;
};

export const clearVpnCredentials = async (): Promise<void> => {
  await AsyncStorage.multiRemove([KEYS.VPN_USERNAME, KEYS.VPN_PASSWORD]);
};

// Premium
export const getPremiumStatus = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(KEYS.PREMIUM_STATUS);
  return value === "true";
};

export const setPremiumStatus = async (isPremium: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEYS.PREMIUM_STATUS, isPremium.toString());
};

// Favorites (if you want to persist them, but currently we keep them in memory)

export const getFavoriteServers = async (): Promise<string[]> => {
  const value = await AsyncStorage.getItem("favorite_servers");
  return value ? JSON.parse(value) : [];
};

export const saveFavoriteServers = async (
  serverIds: string[],
): Promise<void> => {
  await AsyncStorage.setItem("favorite_servers", JSON.stringify(serverIds));
};

export const clearFavoriteServers = async (): Promise<void> => {
  await AsyncStorage.removeItem("favorite_servers");
};

// VPN Settings
export const getVpnSettings = async (): Promise<VpnSettings> => {
  try {
    const json = await AsyncStorage.getItem(KEYS.VPN_SETTINGS);
    return json
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveVpnSettings = async (settings: VpnSettings): Promise<void> => {
  await AsyncStorage.setItem(KEYS.VPN_SETTINGS, JSON.stringify(settings));
};
export const clearVpnSettings = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.VPN_SETTINGS);
};
