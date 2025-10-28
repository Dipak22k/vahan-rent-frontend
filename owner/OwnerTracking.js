import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import TopBar from "../src/components/common/TopBar";
// import LiveMap from "../src/components/map/LiveMap"; // uncomment when you add map logic

export default function RenterTracking() {
  return (
    <View style={styles.container}>
      {/* ✅ Common TopBar */}
      <TopBar
        username="Amit"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      {/* ✅ Main Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>Live Vehicle Tracking</Text>
        <Text style={styles.subText}>
          Track your rented car’s current location and trip progress in real time.
        </Text>

        {/* 🚗 Map Placeholder (for LiveMap component) */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>[ Live Map will appear here 🗺️ ]</Text>
        </View>

        {/* 🔒 Geo-Fencing Alert */}
        <View style={styles.geoFenceContainer}>
          <Text style={styles.geoFenceTitle}>Geo-Fencing Active</Text>
          <Text style={styles.geoFenceInfo}>
            You’ll get notified if the vehicle exits the allowed zone.
          </Text>
        </View>

        {/* 🔘 Button for details */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>View Trip Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFF4F8" },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: "#DDE3F0",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  mapText: { color: "#6B7280", fontWeight: "600" },
  geoFenceContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  geoFenceTitle: { fontSize: 16, fontWeight: "700", color: "#4B44B9" },
  geoFenceInfo: { color: "#4B5563", marginTop: 5, fontSize: 14 },
  actionButton: {
    backgroundColor: "#4B44B9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
