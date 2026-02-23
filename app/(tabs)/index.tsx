// app/(tabs)/index.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Surface, Text } from "react-native-paper";
import ConnectionButton from "../../components/ConnectionButton";
import ConnectionStats from "../../components/ConnectionStats";
import VpnStatusBar from "../../components/VpnStatusBar";
import { CustomColors } from "../../constants/Theme";
import { useVpn } from "../../context/VpnContext";

export default function HomeScreen() {
  const {
    status,
    connect,
    disconnect,
    selectedServer, // ← add this
    connectionStats,
  } = useVpn();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>ShieldVPN</Text>
          <Text style={styles.tagline}>Your Privacy, Our Priority</Text>
        </View>
        <TouchableOpacity
          style={styles.proBadge}
          onPress={() => router.push("/premium")}
        >
          <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
          <Text style={styles.proLabel}>PRO</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Status banner */}
        <VpnStatusBar />

        {/* Big connect button */}
        <ConnectionButton />

        {/* Selected server card */}
        {selectedServer ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/servers")}
          >
            <Surface style={styles.serverCard} elevation={2}>
              <View style={styles.sLeft}>
                <Text style={styles.flag}>{selectedServer?.flag}</Text>
                <View>
                  <Text style={styles.sCountry}>{selectedServer?.country}</Text>
                  <Text style={styles.sCity}>{selectedServer?.city}</Text>
                </View>
              </View>
              <View style={styles.sRight}>
                <View style={styles.pingRow}>
                  <MaterialCommunityIcons
                    name="signal"
                    size={14}
                    color={CustomColors.success}
                  />
                  <Text style={styles.pingVal}>{selectedServer?.ping}ms</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#888"
                />
              </View>
            </Surface>
          </TouchableOpacity>
        ) : (
          <Surface style={styles.autoCard} elevation={2}>
            <MaterialCommunityIcons
              name="flash"
              size={24}
              color={CustomColors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.autoTitle}>Smart Connect</Text>
              <Text style={styles.autoDesc}>
                Automatically picks the fastest server
              </Text>
            </View>
          </Surface>
        )}

        {/* Live stats (only when connected) */}
        <ConnectionStats />

        {/* IP card */}
        <Surface style={styles.ipCard} elevation={2}>
          <View style={styles.ipRow}>
            <View>
              <Text style={styles.ipLabel}>Your IP Address</Text>
              <Text style={styles.ipValue}>
                {status === "connected"
                  ? (selectedServer?.ip ?? "10.0.0.1")
                  : "192.168.x.x"}
              </Text>
            </View>
            <View
              style={[
                styles.ipBadge,
                {
                  backgroundColor:
                    status === "connected"
                      ? "rgba(0,230,118,0.15)"
                      : "rgba(255,82,82,0.15)",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={status === "connected" ? "eye-off" : "eye"}
                size={16}
                color={
                  status === "connected"
                    ? CustomColors.success
                    : CustomColors.danger
                }
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color:
                    status === "connected"
                      ? CustomColors.success
                      : CustomColors.danger,
                }}
              >
                {status === "connected" ? "Hidden" : "Visible"}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Feature badges */}
        <View style={styles.featureRow}>
          {[
            {
              icon: "shield-lock",
              label: "AES-256",
              sub: "Encryption",
              c: "#6C63FF",
            },
            {
              icon: "file-document-remove",
              label: "No Logs",
              sub: "Policy",
              c: "#03DAC6",
            },
            {
              icon: "lightning-bolt",
              label: "Fast",
              sub: "Servers",
              c: "#FFD600",
            },
          ].map((f, i) => (
            <Surface key={i} style={styles.featureCard} elevation={1}>
              <MaterialCommunityIcons
                name={f.icon as any}
                size={28}
                color={f.c}
              />
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureSub}>{f.sub}</Text>
            </Surface>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CustomColors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
  },
  appName: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  tagline: { fontSize: 13, color: "#888", marginTop: 2 },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  proLabel: { color: "#FFD700", fontWeight: "700", fontSize: 14 },
  scroll: { paddingBottom: 100, gap: 16 },

  /* Server card */
  serverCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: CustomColors.surface,
  },
  sLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  flag: { fontSize: 32 },
  sCountry: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  sCity: { fontSize: 13, color: "#888" },
  sRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  pingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  pingVal: { fontSize: 13, color: CustomColors.success, fontWeight: "600" },

  /* Auto-select */
  autoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: CustomColors.surface,
    gap: 12,
  },
  autoTitle: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  autoDesc: { fontSize: 13, color: "#888", marginTop: 2 },

  /* IP */
  ipCard: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: CustomColors.surface,
  },
  ipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ipLabel: { fontSize: 13, color: "#888" },
  ipValue: { fontSize: 18, fontWeight: "700", color: "#FFF", marginTop: 4 },
  ipBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  /* Features */
  featureRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12 },
  featureCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: CustomColors.surface,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 8,
  },
  featureSub: { fontSize: 11, color: "#888", marginTop: 2 },
});
