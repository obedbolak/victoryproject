// app/premium.tsx

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
import { Button, Surface, Text } from "react-native-paper";
import { CustomColors } from "../constants/Theme";

const FEATURES = [
  {
    icon: "server-network",
    title: "500+ Servers",
    desc: "Access all server locations worldwide",
  },
  {
    icon: "speedometer",
    title: "Unlimited Speed",
    desc: "No bandwidth throttling or speed limits",
  },
  {
    icon: "devices",
    title: "10 Devices",
    desc: "Protect all your devices simultaneously",
  },
  {
    icon: "shield-check",
    title: "Advanced Security",
    desc: "Double VPN, Onion over VPN, and more",
  },
  {
    icon: "block-helper",
    title: "Ad Blocker",
    desc: "Built-in ad and malware blocker",
  },
  {
    icon: "headset",
    title: "Priority Support",
    desc: "24/7 live chat and email support",
  },
] as const;

const PLANS = [
  { dur: "1 Month", price: "$11.99", mo: "$11.99/mo", pop: false, save: null },
  {
    dur: "12 Months",
    price: "$59.99",
    mo: "$4.99/mo",
    pop: true,
    save: "58% OFF",
  },
  {
    dur: "24 Months",
    price: "$83.99",
    mo: "$3.49/mo",
    pop: false,
    save: "71% OFF",
  },
] as const;

export default function PremiumScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.crownCircle}>
            <MaterialCommunityIcons name="crown" size={50} color="#FFD700" />
          </View>

          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>
            Unlock unlimited access to all features
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Surface key={i} style={styles.fItem} elevation={1}>
              <View
                style={[
                  styles.fIcon,
                  { backgroundColor: CustomColors.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={f.icon as any}
                  size={24}
                  color={CustomColors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fTitle}>{f.title}</Text>
                <Text style={styles.fDesc}>{f.desc}</Text>
              </View>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={CustomColors.success}
              />
            </Surface>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.plansHead}>Choose Your Plan</Text>

        <View style={styles.plans}>
          {PLANS.map((p, i) => (
            <TouchableOpacity key={i} activeOpacity={0.8} style={{ flex: 1 }}>
              <Surface
                style={[styles.plan, p.pop && styles.planPop]}
                elevation={p.pop ? 4 : 2}
              >
                {p.pop && (
                  <View style={styles.popBadge}>
                    <Text style={styles.popText}>MOST POPULAR</Text>
                  </View>
                )}
                {p.save && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>{p.save}</Text>
                  </View>
                )}
                <Text style={styles.planDur}>{p.dur}</Text>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planMo}>{p.mo}</Text>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <Button
          mode="contained"
          icon="crown"
          style={styles.cta}
          contentStyle={{ height: 56 }}
          labelStyle={{ fontSize: 18, fontWeight: "800", color: "#000" }}
        >
          Start Free Trial
        </Button>

        <Text style={styles.trial}>7-day free trial • Cancel anytime</Text>
        <Text style={styles.terms}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Subscription automatically renews unless cancelled.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CustomColors.background },
  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CustomColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  crownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 30, fontWeight: "800", color: "#FFD700", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#AAA", textAlign: "center" },
  features: { paddingHorizontal: 16, gap: 8 },
  fItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: CustomColors.surface,
    gap: 12,
  },
  fIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fTitle: { fontSize: 15, fontWeight: "600", color: "#FFF" },
  fDesc: { fontSize: 12, color: "#888", marginTop: 2 },
  plansHead: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  plans: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  plan: {
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: CustomColors.surface,
  },
  planPop: {
    borderWidth: 2,
    borderColor: "#FFD700",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  popBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popText: { fontSize: 9, fontWeight: "800", color: "#000" },
  saveBadge: {
    backgroundColor: "rgba(0,230,118,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  saveText: { fontSize: 10, fontWeight: "700", color: CustomColors.success },
  planDur: { fontSize: 14, fontWeight: "600", color: "#CCC" },
  planPrice: { fontSize: 22, fontWeight: "800", color: "#FFF", marginTop: 4 },
  planMo: { fontSize: 12, color: "#888", marginTop: 4 },
  cta: {
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: 16,
    backgroundColor: "#FFD700",
  },
  trial: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 12 },
  terms: {
    fontSize: 11,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 16,
    lineHeight: 16,
  },
});
