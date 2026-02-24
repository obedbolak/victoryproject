// context/VpnContext.tsx

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import {
  PROTON_SERVER_INFO,
  PROTON_WIREGUARD_CONFIG,
} from "../constants/Servers";
import vpnService from "../services/VpnService";
import {
  isOnboardingComplete as getOnboardingCompleteStorage,
  getVpnSettings,
  saveVpnSettings,
  setOnboardingComplete as setOnboardingCompleteStorage,
} from "../storage/asyncStorage";
import { ConnectionStats, ConnectionStatus, VpnSettings } from "../types";

// ─── Context Type ────────────────────────────────────────────────────

interface VpnContextType {
  // State
  status: ConnectionStatus;
  connectionStats: ConnectionStats;
  errorMessage: string | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  settings: VpnSettings;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  clearError: () => void;
  updateSettings: (newValues: Partial<VpnSettings>) => Promise<void>;
}

// ─── Defaults ────────────────────────────────────────────────────────

const defaultStats: ConnectionStats = {
  bytesIn: 0,
  bytesOut: 0,
  downloadSpeed: 0,
  uploadSpeed: 0,
  dataUsed: 0,
  connectedTime: 0,
  ipAddress: "",
  lastHandshake: undefined,
};

const defaultSettings: VpnSettings = {
  killSwitch: false,
  autoConnect: false,
  splitTunneling: false,
  protocol: "WireGuard",
  darkMode: true,
};

// ─── Context ─────────────────────────────────────────────────────────

const VpnContext = createContext<VpnContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────

export function VpnProvider({ children }: { children: ReactNode }) {
  // Connection state
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [connectionStats, setConnectionStats] =
    useState<ConnectionStats>(defaultStats);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // App state
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [settings, setSettings] = useState<VpnSettings>(defaultSettings);

  // Refs for timers and tracking
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const previousBytesRef = useRef<{ bytesIn: number; bytesOut: number }>({
    bytesIn: 0,
    bytesOut: 0,
  });

  // ─── Initialization ─────────────────────────────────────────────

  useEffect(() => {
    loadSavedData();
    setupVpnListeners();

    return () => {
      vpnService.destroy();
      stopStatsTimer();
    };
  }, []);

  const loadSavedData = async () => {
    try {
      // 1. Check onboarding
      const onboarded = await getOnboardingCompleteStorage();
      setIsOnboardingComplete(onboarded);

      // 2. Load settings
      const savedSettings = await getVpnSettings();
      setSettings({ ...defaultSettings, ...savedSettings });
    } catch (error) {
      console.error("Failed to load saved data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── VPN Event Listeners ────────────────────────────────────────

  const setupVpnListeners = () => {
    vpnService.onStateChange((newStatus: ConnectionStatus) => {
      setStatus(newStatus);

      switch (newStatus) {
        case "connected":
          startStatsTimer();
          break;
        case "disconnected":
          stopStatsTimer();
          resetStats();
          break;
        case "error":
          stopStatsTimer();
          resetStats();
          setErrorMessage("VPN connection encountered an error");
          break;
        case "reconnecting":
          // Keep stats running during reconnection
          break;
      }
    });

    // Listen for native stats updates
    vpnService.onStatsUpdate((nativeStats) => {
      setConnectionStats((prev) => {
        const now = Date.now();
        const elapsed = connectedAtRef.current
          ? Math.floor((now - connectedAtRef.current) / 1000)
          : 0;

        // Calculate speeds from byte deltas (2-second interval)
        const downloadSpeed = Math.max(
          0,
          (nativeStats.bytesIn - previousBytesRef.current.bytesIn) / 2,
        );
        const uploadSpeed = Math.max(
          0,
          (nativeStats.bytesOut - previousBytesRef.current.bytesOut) / 2,
        );

        previousBytesRef.current = {
          bytesIn: nativeStats.bytesIn,
          bytesOut: nativeStats.bytesOut,
        };

        return {
          ...prev,
          bytesIn: nativeStats.bytesIn,
          bytesOut: nativeStats.bytesOut,
          downloadSpeed,
          uploadSpeed,
          dataUsed: nativeStats.bytesIn + nativeStats.bytesOut,
          connectedTime: elapsed,
          lastHandshake: nativeStats.lastHandshake,
          ipAddress: nativeStats.ipAddress || prev.ipAddress,
        };
      });
    });
  };

  // ─── Stats Timer ────────────────────────────────────────────────

  const startStatsTimer = () => {
    connectedAtRef.current = Date.now();
    previousBytesRef.current = { bytesIn: 0, bytesOut: 0 };

    // Update connected time every second
    timerRef.current = setInterval(() => {
      if (connectedAtRef.current) {
        const elapsed = Math.floor(
          (Date.now() - connectedAtRef.current) / 1000,
        );
        setConnectionStats((prev) => ({
          ...prev,
          connectedTime: elapsed,
        }));
      }
    }, 1000);
  };

  const stopStatsTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    connectedAtRef.current = null;
  };

  const resetStats = () => {
    setConnectionStats(defaultStats);
    previousBytesRef.current = { bytesIn: 0, bytesOut: 0 };
  };

  // ─── Actions ────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    try {
      setStatus("connecting");
      setErrorMessage(null);

      // Connect using WireGuard config
      await vpnService.connect({
        config: PROTON_WIREGUARD_CONFIG,
        serverName: PROTON_SERVER_INFO.name,
      });
    } catch (error: any) {
      console.error("Connection failed:", error);
      setStatus("error");
      const message = error.message || "Failed to connect to VPN";
      setErrorMessage(message);
      Alert.alert(
        "Connection Failed",
        `Unable to connect to ${PROTON_SERVER_INFO.name}.\n\n${message}`,
      );
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setStatus("disconnecting");
      await vpnService.disconnect();
    } catch (error: any) {
      console.error("Disconnect failed:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to disconnect");
    }
  }, []);

  const reconnect = useCallback(async () => {
    try {
      setStatus("reconnecting");
      setErrorMessage(null);
      await vpnService.reconnect();
    } catch (error: any) {
      console.error("Reconnect failed:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to reconnect");
      Alert.alert(
        "Reconnection Failed",
        error.message || "Unable to reconnect. Please try manually.",
      );
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await setOnboardingCompleteStorage();
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error("Failed to set onboarding complete:", error);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    if (status === "error") {
      setStatus("disconnected");
    }
  }, [status]);

  const updateSettings = useCallback(
    async (newValues: Partial<VpnSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newValues };
        saveVpnSettings(updated);
        return updated;
      });
    },
    [],
  );

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <VpnContext.Provider
      value={{
        // State
        status,
        connectionStats,
        errorMessage,
        isLoading,
        isOnboardingComplete,
        settings,

        // Actions
        connect,
        disconnect,
        reconnect,
        completeOnboarding,
        clearError,
        updateSettings,
      }}
    >
      {children}
    </VpnContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────

export function useVpn() {
  const context = useContext(VpnContext);
  if (context === undefined) {
    throw new Error("useVpn must be used within a VpnProvider");
  }
  return context;
}
