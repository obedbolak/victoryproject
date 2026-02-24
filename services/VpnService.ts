// services/VpnService.ts

import { NativeEventEmitter, NativeModules } from "react-native";
import { ConnectionStats, ConnectionStatus } from "../types";

const { WireGuardVpn } = NativeModules;

interface VpnEventData {
  state: string;
  message?: string;
}

interface NativeVpnStats {
  rxBytes?: number;
  txBytes?: number;
  lastHandshake?: number;
}

interface NativeConnectOptions {
  config: string;
  tunnelName: string;
  notificationTitle: string;
  notificationText: string;
}

interface ConnectOptions {
  config: string;
  serverName?: string;
}

class VpnService {
  private eventEmitter: NativeEventEmitter | null = null;
  private statusCallback: ((status: ConnectionStatus) => void) | null = null;
  private statsCallback:
    | ((
        stats: Pick<
          ConnectionStats,
          "bytesIn" | "bytesOut" | "lastHandshake" | "ipAddress"
        >,
      ) => void)
    | null = null;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private currentConfig: string | null = null;
  private isConnected: boolean = false;

  constructor() {
    if (WireGuardVpn) {
      this.eventEmitter = new NativeEventEmitter(WireGuardVpn);
      this.setupEventListeners();
    }
  }

  // ─── Event Listeners Setup ─────────────────────────────────────────

  private setupEventListeners(): void {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener("stateChanged", (event: VpnEventData) => {
      const mappedStatus = this.mapNativeState(event.state);

      if (mappedStatus === "connected") {
        this.isConnected = true;
        this.startStatsPolling();
      } else if (mappedStatus === "disconnected" || mappedStatus === "error") {
        this.isConnected = false;
        this.stopStatsPolling();
      }

      if (this.statusCallback) {
        this.statusCallback(mappedStatus);
      }
    });
  }

  // ─── State Management ──────────────────────────────────────────────

  /**
   * Listen for VPN state changes
   */
  onStateChange(callback: (status: ConnectionStatus) => void): void {
    this.statusCallback = callback;
  }

  /**
   * Listen for traffic stats
   */
  onStatsUpdate(
    callback: (
      stats: Pick<
        ConnectionStats,
        "bytesIn" | "bytesOut" | "lastHandshake" | "ipAddress"
      >,
    ) => void,
  ): void {
    this.statsCallback = callback;
  }

  /**
   * Map native WireGuard states to app connection states
   */
  private mapNativeState(nativeState: string): ConnectionStatus {
    const state = nativeState?.toUpperCase() || "";

    switch (state) {
      case "CONNECTING":
      case "REASSERTING":
      case "PREPARING":
        return "connecting";
      case "CONNECTED":
      case "READY":
        return "connected";
      case "DISCONNECTING":
        return "disconnecting";
      case "RECONNECTING":
        return "reconnecting";
      case "DISCONNECTED":
      case "INVALID":
      case "NONE":
        return "disconnected";
      case "ERROR":
        return "error";
      default:
        return "disconnected";
    }
  }

  // ─── Stats Polling ─────────────────────────────────────────────────

  private startStatsPolling(): void {
    this.stopStatsPolling();

    this.statsInterval = setInterval(async () => {
      try {
        if (WireGuardVpn?.getStats && this.statsCallback) {
          const stats: NativeVpnStats = await WireGuardVpn.getStats();
          if (stats) {
            this.statsCallback({
              bytesIn: stats.rxBytes || 0,
              bytesOut: stats.txBytes || 0,
              lastHandshake: stats.lastHandshake,
              ipAddress: "", // WireGuard doesn't expose this via stats
            });
          }
        }
      } catch {
        // Silently fail if not connected
      }
    }, 2000);
  }

  private stopStatsPolling(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  // ─── Connection ────────────────────────────────────────────────────

  /**
   * Connect to Proton VPN using WireGuard config
   */
  async connect(options: ConnectOptions): Promise<void> {
    if (!WireGuardVpn) {
      throw new Error(
        "WireGuard native module not available. " +
          "Ensure you are running a dev build (not Expo Go).",
      );
    }

    // Validate config has required fields
    if (!this.isValidWireGuardConfig(options.config)) {
      throw new Error(
        "Invalid WireGuard configuration. " +
          "Please ensure the config contains [Interface] and [Peer] sections.",
      );
    }

    try {
      this.currentConfig = options.config;

      const serverName = options.serverName || "Proton VPN";

      const connectOptions: NativeConnectOptions = {
        config: options.config,
        tunnelName: "proton-vpn",
        notificationTitle: "ShieldVPN",
        notificationText: `Connected to ${serverName}`,
      };

      await WireGuardVpn.connect(connectOptions);
    } catch (error) {
      this.currentConfig = null;
      console.error("VPN Connection Error:", error);
      throw error;
    }
  }

  /**
   * Validate WireGuard config format
   */
  private isValidWireGuardConfig(config: string): boolean {
    const hasInterface = /\[Interface\]/i.test(config);
    const hasPeer = /\[Peer\]/i.test(config);
    const hasPrivateKey = /PrivateKey\s*=/i.test(config);
    const hasPublicKey = /PublicKey\s*=/i.test(config);

    return hasInterface && hasPeer && hasPrivateKey && hasPublicKey;
  }

  /**
   * Disconnect from VPN
   */
  async disconnect(): Promise<void> {
    if (!WireGuardVpn) {
      throw new Error("WireGuard native module not available");
    }

    try {
      await WireGuardVpn.disconnect();
      this.currentConfig = null;
      this.isConnected = false;
    } catch (error) {
      console.error("VPN Disconnect Error:", error);
      throw error;
    }
  }

  /**
   * Reconnect to VPN
   */
  async reconnect(): Promise<void> {
    if (!this.currentConfig) {
      throw new Error("No config to reconnect with");
    }

    const config = this.currentConfig;
    await this.disconnect();

    // Small delay to let the tunnel fully tear down
    await new Promise((resolve) => setTimeout(resolve, 500));

    await this.connect({ config });
  }

  // ─── Getters ───────────────────────────────────────────────────────

  /**
   * Check if currently connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current config (if connected)
   */
  getCurrentConfig(): string | null {
    return this.currentConfig;
  }

  /**
   * Check if native module is available
   */
  isAvailable(): boolean {
    return !!WireGuardVpn;
  }

  // ─── Cleanup ───────────────────────────────────────────────────────

  /**
   * Cleanup all listeners and intervals
   */
  destroy(): void {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners("stateChanged");
    }
    this.stopStatsPolling();
    this.statusCallback = null;
    this.statsCallback = null;
    this.currentConfig = null;
    this.isConnected = false;
  }
}

export const vpnService = new VpnService();
export default vpnService;
