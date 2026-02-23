// services/VpnService.ts

import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { ConnectionStatus, Server } from "../types";

const { RNSimpleOpenvpn } = NativeModules;

interface VpnEventData {
  state: string;
  message?: string;
  level?: string;
}

class VpnService {
  private eventEmitter: NativeEventEmitter | null = null;
  private statusCallback: ((status: ConnectionStatus) => void) | null = null;
  private statsCallback:
    | ((stats: { bytesIn: number; bytesOut: number }) => void)
    | null = null;

  constructor() {
    if (RNSimpleOpenvpn) {
      this.eventEmitter = new NativeEventEmitter(RNSimpleOpenvpn);
    }
  }

  /**
   * Listen for VPN state changes from native module
   */
  onStateChange(callback: (status: ConnectionStatus) => void) {
    this.statusCallback = callback;

    if (!this.eventEmitter) return;

    this.eventEmitter.addListener("stateChanged", (event: VpnEventData) => {
      const mappedStatus = this.mapNativeState(event.state);
      callback(mappedStatus);
    });
  }

  /**
   * Map native OpenVPN states to our app states
   */
  private mapNativeState(nativeState: string): ConnectionStatus {
    switch (nativeState?.toUpperCase()) {
      case "VPN_GENERATE_CONFIG":
      case "VPN_CONNECTING":
      case "VPN_RECONNECTING":
      case "VPN_TCP_CONNECT":
      case "VPN_AUTH":
      case "VPN_GET_CONFIG":
      case "VPN_ASSIGN_IP":
        return "connecting";
      case "VPN_CONNECTED":
        return "connected";
      case "VPN_DISCONNECTING":
        return "disconnecting";
      case "VPN_DISCONNECTED":
      case "VPN_ERROR":
      default:
        return "disconnected";
    }
  }

  /**
   * Connect to a server using its OpenVPN config
   */
  async connect(
    server: Server,
    username?: string,
    password?: string,
  ): Promise<void> {
    if (!RNSimpleOpenvpn) {
      throw new Error("OpenVPN native module not available");
    }

    if (!server.ovpnConfig) {
      throw new Error("No OpenVPN configuration found for this server");
    }

    try {
      const options: any = {
        remoteAddress: server.ip,
        ovpnString: server.ovpnConfig,
        notificationTitle: "ShieldVPN",
        compatMode: Platform.select({
          ios: 1, // OpenVPN 2.x compatibility
          android: 2,
        }),
        providerBundleIdentifier: "com.victory.shieldvpn.vpn", // iOS only
        localizedDescription: "ShieldVPN",
      };

      // If server requires auth-user-pass
      if (username && password) {
        options.username = username;
        options.password = password;
      }

      await RNSimpleOpenvpn.connect(options);
    } catch (error) {
      console.error("VPN Connection Error:", error);
      throw error;
    }
  }

  /**
   * Disconnect from VPN
   */
  async disconnect(): Promise<void> {
    if (!RNSimpleOpenvpn) {
      throw new Error("OpenVPN native module not available");
    }

    try {
      await RNSimpleOpenvpn.disconnect();
    } catch (error) {
      console.error("VPN Disconnect Error:", error);
      throw error;
    }
  }

  /**
   * Cleanup listeners
   */
  destroy() {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners("stateChanged");
    }
  }
}

export const vpnService = new VpnService();
export default vpnService;
