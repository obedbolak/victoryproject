// types/index.ts

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "reconnecting"
  | "error";

export interface ConnectionStats {
  bytesIn: number;
  bytesOut: number;
  downloadSpeed: number;
  uploadSpeed: number;
  dataUsed: number;
  connectedTime: number;
  ipAddress: string;
  lastHandshake?: number;
}

export interface VpnSettings {
  killSwitch: boolean;
  autoConnect: boolean;
  splitTunneling: boolean;
  protocol: "WireGuard";
  darkMode: boolean;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}
