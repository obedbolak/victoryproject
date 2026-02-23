import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { CustomColors } from "../constants/Theme";
import { useVpn } from "../context/VpnContext";

export default function ConnectionButton() {
  const { status, connect, disconnect } = useVpn();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isConnected = status === "connected";
  const isConnecting = status === "connecting" || status === "disconnecting";

  // Pulse animation for connected state
  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected]);

  // Rotate animation for connecting state
  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isConnecting]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handlePress = () => {
    if (isConnecting) return; // Prevent double taps
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const getButtonColor = () => {
    if (status === "error") return CustomColors.danger;
    if (isConnected) return CustomColors.success;
    if (isConnecting) return CustomColors.warning;
    return CustomColors.primary;
  };

  const getButtonText = () => {
    switch (status) {
      case "connected":
        return "PROTECTED";
      case "connecting":
        return "CONNECTING...";
      case "disconnecting":
        return "STOPPING...";
      case "error":
        return "RETRY";
      default:
        return "TAP TO CONNECT";
    }
  };

  const getIcon = () => {
    if (isConnecting) return "loading";
    if (isConnected) return "shield-check";
    if (status === "error") return "alert-circle-outline";
    return "power";
  };

  return (
    <View style={styles.container}>
      {/* Pulse Effect Rings */}
      {isConnected && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
              borderColor: CustomColors.success,
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.5, 0],
              }),
            },
          ]}
        />
      )}

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={isConnecting}
      >
        <View style={[styles.button, { backgroundColor: getButtonColor() }]}>
          <Animated.View
            style={isConnecting ? { transform: [{ rotate: spin }] } : {}}
          >
            <MaterialCommunityIcons
              name={getIcon() as any}
              size={64}
              color="#FFF"
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <Text style={[styles.statusText, { color: getButtonColor() }]}>
        {getButtonText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  pulseRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
  },
  button: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  statusText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
});
