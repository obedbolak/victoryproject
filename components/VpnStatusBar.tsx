// components/VpnStatusBar.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { CustomColors } from "../constants/Theme";
import { useVpn } from "../context/VpnContext";

export default function VpnStatusBar() {
  const { status } = useVpn();

  const cfg = (() => {
    switch (status) {
      case "connected":
        return {
          icon: "shield-check" as const,
          text: "Your connection is secure",
          color: CustomColors.success,
          bg: "rgba(0,230,118,0.1)",
        };
      case "connecting":
        return {
          icon: "shield-sync" as const,
          text: "Establishing secure connection...",
          color: CustomColors.warning,
          bg: "rgba(255,214,0,0.1)",
        };
      case "disconnecting":
        return {
          icon: "shield-sync" as const,
          text: "Disconnecting...",
          color: CustomColors.warning,
          bg: "rgba(255,214,0,0.1)",
        };
      default:
        return {
          icon: "shield-alert" as const,
          text: "Your connection is not protected",
          color: CustomColors.danger,
          bg: "rgba(255,82,82,0.1)",
        };
    }
  })();

  return (
    <View style={[styles.bar, { backgroundColor: cfg.bg }]}>
      <MaterialCommunityIcons name={cfg.icon} size={20} color={cfg.color} />
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  text: { fontSize: 13, fontWeight: "500" },
});
