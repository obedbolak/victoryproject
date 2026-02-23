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
import { servers } from "../constants/Servers";
import vpnService from "../services/VpnService";
import {
  getFavoriteServers,
  isOnboardingComplete as getOnboardingCompleteStorage,
  getSelectedServer,
  getVpnCredentials,
  getVpnSettings,
  saveFavoriteServers,
  saveSelectedServer,
  saveVpnSettings,
  setOnboardingComplete as setOnboardingCompleteStorage,
} from "../storage/asyncStorage";
import {
  ConnectionStats,
  ConnectionStatus,
  Server,
  VpnSettings,
} from "../types";

interface VpnContextType {
  // State
  status: ConnectionStatus;
  selectedServer: Server | null;
  connectionStats: ConnectionStats;
  errorMessage: string | null;
  favoriteServers: string[];
  isLoading: boolean; // <--- ADDED
  isOnboardingComplete: boolean; // <--- ADDED

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  selectServer: (server: Server) => void;
  toggleFavorite: (serverId: string) => void;
  completeOnboarding: () => Promise<void>;
  clearError: () => void;
  updateSettings: (newValues: Partial<VpnSettings>) => Promise<void>;
  settings: VpnSettings;
}

const defaultStats: ConnectionStats = {
  downloadSpeed: 0,
  uploadSpeed: 0,
  dataUsed: 0,
  connectedTime: 0,
  ipAddress: "",
};

const VpnContext = createContext<VpnContextType | undefined>(undefined);

export function VpnProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [connectionStats, setConnectionStats] =
    useState<ConnectionStats>(defaultStats);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [favoriteServers, setFavoriteServers] = useState<string[]>([]);

  // App Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const [settings, setSettings] = useState<VpnSettings>({
    killSwitch: false,
    autoConnect: false,
    splitTunneling: false,
    protocol: "OpenVPN",
    darkMode: true,
  });

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
    setupVpnListeners();

    return () => {
      vpnService.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadSavedData = async () => {
    try {
      // 1. Check Onboarding
      const onboarded = await getOnboardingCompleteStorage();
      setIsOnboardingComplete(onboarded);

      // 2. Load saved server
      const savedServerId = await getSelectedServer();
      if (savedServerId) {
        const server = servers.find((s) => s.id === savedServerId);
        if (server) setSelectedServer(server);
        else setSelectedServer(servers[0]);
      } else {
        setSelectedServer(servers[0]);
      }

      // 3. Load favorites
      const savedFavorites = await getFavoriteServers();
      if (savedFavorites) {
        setFavoriteServers(savedFavorites);
      }

      // LOAD SETTINGS
      const savedSettings = await getVpnSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error("Failed to load saved data:", error);
      setSelectedServer(servers[0]);
    } finally {
      // Done loading
      setIsLoading(false);
    }
  };

  const setupVpnListeners = () => {
    vpnService.onStateChange((newStatus: ConnectionStatus) => {
      setStatus(newStatus);

      if (newStatus === "connected") {
        startStatsTimer();
      } else if (newStatus === "disconnected" || newStatus === "error") {
        stopStatsTimer();
        setConnectionStats(defaultStats);
      }
    });
  };

  const startStatsTimer = () => {
    connectedAtRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (connectedAtRef.current) {
        const elapsed = Math.floor(
          (Date.now() - connectedAtRef.current) / 1000,
        );
        setConnectionStats((prev) => ({
          ...prev,
          connectedTime: elapsed,
          downloadSpeed: Math.random() * 50 + 10,
          uploadSpeed: Math.random() * 20 + 5,
          dataUsed: prev.dataUsed + Math.random() * 0.1,
          ipAddress: selectedServer?.ip || "",
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

  const connect = useCallback(async () => {
    if (!selectedServer) {
      Alert.alert("Error", "Please select a server first");
      return;
    }
    if (!selectedServer.ovpnConfig) {
      Alert.alert("Error", "No VPN configuration available for this server");
      return;
    }

    try {
      setStatus("connecting");
      setErrorMessage(null);
      const credentials = await getVpnCredentials();
      await vpnService.connect(
        selectedServer,
        credentials?.username,
        credentials?.password,
      );
    } catch (error: any) {
      console.error("Connection failed:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to connect to VPN");
      Alert.alert(
        "Connection Failed",
        error.message ||
          "Unable to connect to the VPN server. Please try again.",
      );
    }
  }, [selectedServer]);

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

  const selectServer = useCallback(
    (server: Server) => {
      if (status === "connected") {
        Alert.alert(
          "Switch Server",
          "You need to disconnect before switching servers. Disconnect now?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Disconnect",
              onPress: async () => {
                await disconnect();
                setSelectedServer(server);
                saveSelectedServer(server.id);
              },
            },
          ],
        );
      } else {
        setSelectedServer(server);
        saveSelectedServer(server.id);
      }
    },
    [status, disconnect],
  );

  const toggleFavorite = useCallback((serverId: string) => {
    setFavoriteServers((prev) => {
      const updated = prev.includes(serverId)
        ? prev.filter((id) => id !== serverId)
        : [...prev, serverId];

      saveFavoriteServers(updated);
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await setOnboardingCompleteStorage();
      setIsOnboardingComplete(true); // Update local state immediately
    } catch (error) {
      console.error("Failed to set onboarding complete", error);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);
  // NEW FUNCTION
  const updateSettings = useCallback(
    async (newValues: Partial<VpnSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newValues };
        saveVpnSettings(updated); // Persist to storage
        return updated;
      });
    },
    [],
  );

  return (
    <VpnContext.Provider
      value={{
        status,
        selectedServer,
        connectionStats,
        errorMessage,
        favoriteServers,
        isLoading, // <--- Exported
        isOnboardingComplete, // <--- Exported
        connect,
        disconnect,
        selectServer,
        toggleFavorite,
        completeOnboarding,
        clearError,
        settings,
        updateSettings, // <--- Exported
      }}
    >
      {children}
    </VpnContext.Provider>
  );
}

export function useVpn() {
  const context = useContext(VpnContext);
  if (context === undefined) {
    throw new Error("useVpn must be used within a VpnProvider");
  }
  return context;
}
