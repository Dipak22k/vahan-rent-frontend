import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "./TopBar";

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulated API or local data
    const sampleData = [
      { id: "1", title: "KYC Verified", message: "Your KYC verification was successful 🎉" },
      { id: "2", title: "Contract Update", message: "Your latest contract has been approved." },
      { id: "3", title: "Insurance Renewal", message: "Your vehicle insurance expires in 3 days." },
    ];
    setNotifications(sampleData);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar
        username=""
        onNotificationPress={() => {}}
        onProfilePress={() => navigation.navigate("Profile")}
      />
      <Text style={styles.header}>Notifications</Text>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No new notifications</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFF4F8" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A8A",
    marginTop: 15,
    marginLeft: 20,
  },
  list: { padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#1E3A8A" },
  message: { fontSize: 14, color: "#4B5563", marginTop: 4 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { color: "#6B7280", fontSize: 16, marginTop: 10 },
});
