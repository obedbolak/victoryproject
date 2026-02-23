// app/_layout.tsx

import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { AppTheme, CustomColors } from "../constants/Theme";
import { VpnProvider, useVpn } from "../context/VpnContext";

function RootNavigator() {
  // ✅ FIX: Destructure values directly, don't use 'state'
  const { isLoading, isOnboardingComplete } = useVpn();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!isOnboardingComplete && !inOnboarding) {
      // Not done onboarding → go to onboarding
      router.replace("/onboarding");
    } else if (isOnboardingComplete && inOnboarding) {
      // Done onboarding → go to home tabs
      router.replace("/(tabs)");
    }
  }, [isOnboardingComplete, isLoading, segments]);

  // Show loading splash while checking AsyncStorage
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={CustomColors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: CustomColors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="premium"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={AppTheme}>
      {/* VpnProvider wraps the Navigator to provide Context */}
      <VpnProvider>
        <RootNavigator />
      </VpnProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CustomColors.background,
  },
});
