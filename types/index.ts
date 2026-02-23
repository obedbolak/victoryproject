// types/index.ts

export interface Server {
  id: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  load: number;
  isPremium: boolean;
  ip: string;
  protocol: "WireGuard" | "OpenVPN" | "IKEv2";

  ovpnConfig?: string; // <-- ADD THIS: raw .ovpn config string
}

export interface ConnectionStats {
  downloadSpeed: number;
  uploadSpeed: number;
  dataUsed: number;
  connectedTime: number;
  ipAddress: string;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

export interface VpnState {
  status: ConnectionStatus;
  selectedServer: Server | null;
  stats: ConnectionStats;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  favoriteServers: string[];
  killSwitch: boolean;
  autoConnect: boolean;
  protocol: "WireGuard" | "OpenVPN" | "IKEv2";
  splitTunneling: boolean;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface VpnSettings {
  killSwitch: boolean;
  autoConnect: boolean;
  splitTunneling: boolean;
  protocol: "OpenVPN" | "WireGuard" | "IKEv2";
  darkMode: boolean;
}
