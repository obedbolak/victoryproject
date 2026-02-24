// constants/Servers.ts

import { OnboardingSlide } from "../types";

// ==================== Proton VPN WireGuard Config ====================
// Config for: US-FREE#154
// Device: victory-app
// Generated from: https://account.protonvpn.com/downloads

export const PROTON_WIREGUARD_CONFIG = `[Interface]
# Key for victory-app 
# Bouncing = 2
PrivateKey = IG3/aQkduMu+eAtmEldfnCb7ZRkbWbuSjJ/v6RtHQ34=
Address = 10.2.0.2/32
DNS = 10.2.0.1

[Peer]
# US-FREE#154
PublicKey = 93rOlHiU4A7ACRTdqButvAjwrccdOgOIHwFMumODvgo=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = 138.199.52.193:51820
PersistentKeepalive = 25`;

// Server info extracted from config
export const PROTON_SERVER_INFO = {
  name: "US-FREE#154",
  country: "United States",
  flag: "🇺🇸",
  city: "Free",
  endpoint: "138.199.52.193:51820",
  protocol: "WireGuard",
};

// ==================== Onboarding Slides ====================
export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Secure Your Connection",
    description:
      "Protect your online privacy with military-grade encryption. Browse the internet safely and anonymously.",
    icon: "shield-lock",
    color: "#6C63FF",
  },
  {
    id: "2",
    title: "Global Server Network",
    description:
      "Connect to servers across multiple countries. Enjoy blazing fast speeds with our optimized network.",
    icon: "earth",
    color: "#3F51B5",
  },
  {
    id: "3",
    title: "One Tap Connect",
    description:
      "Get protected in seconds. Simply select a server and tap connect.",
    icon: "flash",
    color: "#00BCD4",
  },
  {
    id: "4",
    title: "No Logs Policy",
    description:
      "We never track, collect, or share your data. Your privacy is our top priority — always.",
    icon: "eye-off",
    color: "#4CAF50",
  },
];
