// components/ServerCard.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Surface, Text } from "react-native-paper";
import { CustomColors } from "../constants/Theme";

// ─── Server Type (for future multi-server support) ─────────────────

export interface ServerInfo {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  protocol: string;
  isPremium?: boolean;
  ping?: number;
  load?: number;
}

// ─── Props ──────────────────────────────────────────────────────────

interface Props {
  server: ServerInfo;
  onPress?: (server: ServerInfo) => void;
  isSelected?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (serverId: string) => void;
  showFavoriteButton?: boolean;
  showStats?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────

export default function ServerCard({
  server,
  onPress,
  isSelected = false,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = true,
  showStats = true,
}: Props) {
  const ping = server.ping ?? 0;
  const load = server.load ?? 0;

  const pingColor =
    ping < 50
      ? CustomColors.success
      : ping < 100
        ? CustomColors.warning
        : CustomColors.danger;

  const loadColor =
    load < 40
      ? CustomColors.success
      : load < 70
        ? CustomColors.warning
        : CustomColors.danger;

  const handlePress = () => {
    if (onPress) {
      onPress(server);
    }
  };

  const handleFavoritePress = () => {
    if (onToggleFavorite) {
      onToggleFavorite(server.id);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Surface
        style={[
          styles.card,
          isSelected && styles.selected,
          server.isPremium && styles.premium,
        ]}
        elevation={2}
      >
        {/* Left - Server Info */}
        <View style={styles.left}>
          <Text style={styles.flag}>{server.flag}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.country}>{server.country}</Text>
              {server.isPremium ? (
                <View style={styles.proBadge}>
                  <MaterialCommunityIcons
                    name="crown"
                    size={12}
                    color="#FFD700"
                  />
                  <Text style={styles.proText}>PRO</Text>
                </View>
              ) : (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeText}>FREE</Text>
                </View>
              )}
            </View>
            <Text style={styles.city}>{server.city || server.name}</Text>
            <View style={styles.protoBadge}>
              <Text style={styles.protoText}>{server.protocol}</Text>
            </View>
          </View>
        </View>

        {/* Right - Stats & Actions */}
        <View style={styles.right}>
          {showStats && (ping > 0 || load > 0) && (
            <View style={styles.stats}>
              {ping > 0 && (
                <View style={styles.pingRow}>
                  <MaterialCommunityIcons
                    name="signal"
                    size={14}
                    color={pingColor}
                  />
                  <Text style={[styles.ping, { color: pingColor }]}>
                    {ping}ms
                  </Text>
                </View>
              )}
              {load > 0 && (
                <>
                  <View style={styles.loadTrack}>
                    <View
                      style={[
                        styles.loadFill,
                        { width: `${load}%`, backgroundColor: loadColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.loadLabel}>{load}% load</Text>
                </>
              )}
            </View>
          )}

          {showFavoriteButton && onToggleFavorite && (
            <IconButton
              icon={isFavorite ? "heart" : "heart-outline"}
              iconColor={isFavorite ? "#FF5252" : "#888"}
              size={20}
              onPress={handleFavoritePress}
              style={{ margin: 0 }}
            />
          )}
        </View>

        {/* Selected Indicator */}
        {isSelected && (
          <View style={styles.check}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={CustomColors.success}
            />
          </View>
        )}
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    backgroundColor: CustomColors.surface,
  },
  selected: {
    borderWidth: 1.5,
    borderColor: CustomColors.primary,
  },
  premium: {
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 36,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  country: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  city: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  proText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFD700",
  },
  freeBadge: {
    backgroundColor: "rgba(76,175,80,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 10,
    fontWeight: "700",
    color: CustomColors.success,
  },
  protoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(108,99,255,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  protoText: {
    fontSize: 10,
    color: CustomColors.primary,
    fontWeight: "600",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stats: {
    alignItems: "flex-end",
  },
  pingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ping: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadTrack: {
    width: 50,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginTop: 6,
  },
  loadFill: {
    height: "100%",
    borderRadius: 2,
  },
  loadLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  check: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
