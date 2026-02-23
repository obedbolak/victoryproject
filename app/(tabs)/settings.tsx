// app/(tabs)/settings.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  List,
  Portal,
  RadioButton,
  Surface,
  Switch,
  Text,
} from "react-native-paper";
import { CustomColors } from "../../constants/Theme";
import { useVpn } from "../../context/VpnContext";

export default function SettingsScreen() {
  const { settings, updateSettings } = useVpn();
  const [showProto, setShowProto] = useState(false);

  function Row({
    icon,
    iconColor,
    title,
    desc,
    right,
    onPress,
  }: {
    icon: string;
    iconColor: string;
    title: string;
    desc: string;
    right?: React.ReactNode;
    onPress?: () => void;
  }) {
    return (
      <Surface style={styles.card} elevation={1}>
        <List.Item
          title={title}
          description={desc}
          titleStyle={styles.rowTitle}
          descriptionStyle={styles.rowDesc}
          onPress={onPress}
          left={() => (
            <View
              style={[styles.iconWrap, { backgroundColor: iconColor + "20" }]}
            >
              <MaterialCommunityIcons
                name={icon as any}
                size={22}
                color={iconColor}
              />
            </View>
          )}
          right={() => <>{right}</>}
          style={{ paddingVertical: 4 }}
        />
      </Surface>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.heading}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Connection */}
        <Text style={styles.section}>CONNECTION</Text>

        <Row
          icon="shield-lock"
          iconColor="#6C63FF"
          title="Kill Switch"
          desc="Block internet if VPN disconnects"
          right={
            <Switch
              value={settings.killSwitch}
              onValueChange={(v) => updateSettings({ killSwitch: v })}
              color={CustomColors.primary}
            />
          }
        />
        <Row
          icon="flash"
          iconColor="#FFD600"
          title="Auto Connect"
          desc="Connect on app launch"
          right={
            <Switch
              value={settings.autoConnect}
              onValueChange={(v) => updateSettings({ autoConnect: v })}
              color={CustomColors.primary}
            />
          }
        />
        <Row
          icon="call-split"
          iconColor="#03DAC6"
          title="Split Tunneling"
          desc="Choose which apps use VPN"
          right={
            <Switch
              value={settings.splitTunneling}
              onValueChange={(v) => updateSettings({ splitTunneling: v })}
              color={CustomColors.primary}
            />
          }
        />
        <Row
          icon="protocol"
          iconColor="#FF7043"
          title="VPN Protocol"
          desc={settings.protocol}
          onPress={() => setShowProto(true)}
          right={
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#888"
            />
          }
        />

        {/* General */}
        <Text style={styles.section}>GENERAL</Text>

        <Row
          icon="bell-outline"
          iconColor="#E040FB"
          title="Notifications"
          desc="Connection alerts and updates"
          right={<Switch value={true} color={CustomColors.primary} />}
        />
        <Row
          icon="theme-light-dark"
          iconColor="#78909C"
          title="Dark Mode"
          desc="Always on"
          right={<Switch value={true} color={CustomColors.primary} disabled />}
        />

        {/* About */}
        <Text style={styles.section}>ABOUT</Text>

        <Row
          icon="information-outline"
          iconColor="#42A5F5"
          title="App Version"
          desc="1.0.0 (Build 1)"
        />
        <Row
          icon="file-document-outline"
          iconColor="#66BB6A"
          title="Privacy Policy"
          desc="Read our privacy policy"
          right={
            <MaterialCommunityIcons name="open-in-new" size={20} color="#888" />
          }
        />
        <Row
          icon="file-document-outline"
          iconColor="#FFA726"
          title="Terms of Service"
          desc="Read our terms"
          right={
            <MaterialCommunityIcons name="open-in-new" size={20} color="#888" />
          }
        />
        <Row
          icon="help-circle-outline"
          iconColor="#AB47BC"
          title="Help & Support"
          desc="FAQs and contact us"
          right={
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#888"
            />
          }
        />
        <Row
          icon="star-outline"
          iconColor="#FFD700"
          title="Rate Us"
          desc="Love the app? Rate us!"
          right={
            <MaterialCommunityIcons name="open-in-new" size={20} color="#888" />
          }
        />
      </ScrollView>

      {/* Protocol picker */}
      <Portal>
        <Dialog
          visible={showProto}
          onDismiss={() => setShowProto(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={{ color: "#FFF", fontWeight: "700" }}>
            Select Protocol
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={settings.protocol}
              onValueChange={(v) => {
                updateSettings({
                  protocol: v as "WireGuard" | "OpenVPN" | "IKEv2",
                });
                setShowProto(false);
              }}
            >
              {(
                [
                  {
                    v: "WireGuard",
                    d: "Fastest & most secure",
                    rec: true,
                  },
                  { v: "OpenVPN", d: "Widely compatible", rec: false },
                  { v: "IKEv2", d: "Best for mobile", rec: false },
                ] as const
              ).map((p) => (
                <View key={p.v} style={styles.protoRow}>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={styles.protoName}>{p.v}</Text>
                      {p.rec && (
                        <View style={styles.recBadge}>
                          <Text style={styles.recText}>Recommended</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.protoDesc}>{p.d}</Text>
                  </View>
                  <RadioButton
                    value={p.v}
                    color={CustomColors.primary}
                    uncheckedColor="#666"
                  />
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProto(false)} textColor="#888">
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CustomColors.background },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 8 },
  heading: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  scroll: { paddingBottom: 100, paddingHorizontal: 16 },
  section: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    backgroundColor: CustomColors.surface,
    marginBottom: 8,
    overflow: "hidden",
  },
  rowTitle: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  rowDesc: { color: "#888", fontSize: 12, marginTop: 2 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  dialog: {
    backgroundColor: CustomColors.surface,
    borderRadius: 20,
  },
  protoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  protoName: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  protoDesc: { fontSize: 13, color: "#888", marginTop: 2 },
  recBadge: {
    backgroundColor: "rgba(0,230,118,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recText: {
    fontSize: 10,
    color: CustomColors.success,
    fontWeight: "700",
  },
});
