import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { Chip, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ServerCard from "../../components/ServerCard";
import { servers } from "../../constants/Servers"; // The list with OVPN configs
import { CustomColors } from "../../constants/Theme";
import { useVpn } from "../../context/VpnContext";
import { Server } from "../../types";

type FilterType = "All" | "Favorites" | "Premium";

export default function ServersScreen() {
  const { selectServer, selectedServer, favoriteServers } = useVpn();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const filteredServers = useMemo(() => {
    return servers.filter((server) => {
      const matchesSearch =
        server.country.toLowerCase().includes(search.toLowerCase()) ||
        server.city.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Favorites"
            ? favoriteServers.includes(server.id)
            : server.isPremium;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, favoriteServers]);

  const renderItem = ({ item }: { item: Server }) => (
    <ServerCard
      server={item}
      onPress={(s) => selectServer(s)}
      isSelected={selectedServer?.id === item.id}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Servers</Text>
        <Surface style={styles.searchBar} elevation={0}>
          <MaterialCommunityIcons name="magnify" size={20} color="#888" />
          <TextInput
            placeholder="Search country or city..."
            placeholderTextColor="#666"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </Surface>
      </View>

      <View style={styles.filters}>
        {(["All", "Favorites", "Premium"] as FilterType[]).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              filter === f && { backgroundColor: CustomColors.primary },
            ]}
            textStyle={{ color: filter === f ? "#FFF" : "#888" }}
            mode="outlined"
          >
            {f}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredServers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="server-network-off"
              size={48}
              color="#444"
            />
            <Text style={styles.emptyText}>No servers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomColors.background },
  header: { padding: 16 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CustomColors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#FFF",
    fontSize: 16,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "transparent",
    borderColor: "#333",
  },
  listContent: { paddingBottom: 20, paddingTop: 8 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: { color: "#888", marginTop: 12, fontSize: 16 },
});
