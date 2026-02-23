// components/ConnectionStats.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import { CustomColors } from "../constants/Theme";
import { useVpn } from "../context/VpnContext";

export default function ConnectionStats() {
  // UPDATED: Destructure specific values instead of 'state'
  const { status, connectionStats } = useVpn();

  // UPDATED: Check status directly
  if (status !== "connected") return null;

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const fmtData = (mb: number) =>
    mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;

  // UPDATED: Use connectionStats object
  const cards = [
    {
      icon: "arrow-down-bold",
      color: CustomColors.success || "#03DAC6",
      value: connectionStats.downloadSpeed.toFixed(1),
      label: "Mbps ↓",
    },
    {
      icon: "arrow-up-bold",
      color: CustomColors.primary || "#6C63FF",
      value: connectionStats.uploadSpeed.toFixed(1),
      label: "Mbps ↑",
    },
    {
      icon: "clock-outline",
      color: "#FFD600",
      value: fmtTime(connectionStats.connectedTime),
      label: "Duration",
    },
    {
      icon: "database",
      color: "#FF7043",
      value: fmtData(connectionStats.dataUsed),
      label: "Data Used",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Render first two cards */}
        {cards.slice(0, 2).map((c, i) => (
          <Surface key={i} style={styles.card} elevation={1}>
            <MaterialCommunityIcons
              name={c.icon as any}
              size={24}
              color={c.color}
            />
            <Text style={styles.value}>{c.value}</Text>
            <Text style={styles.label}>{c.label}</Text>
          </Surface>
        ))}
      </View>
      <View style={styles.row}>
        {/* Render last two cards */}
        {cards.slice(2, 4).map((c, i) => (
          <Surface key={i} style={styles.card} elevation={1}>
            <MaterialCommunityIcons
              name={c.icon as any}
              size={24}
              color={c.color}
            />
            <Text style={styles.value}>{c.value}</Text>
            <Text style={styles.label}>{c.label}</Text>
          </Surface>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: CustomColors.surface,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});
