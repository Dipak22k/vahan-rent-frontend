import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "../src/components/common/TopBar";
// import LiveMap from "../src/components/map/LiveMap"; // uncomment when you add map logic

// --- COHESIVE COLOR PALETTE ---
const PRIMARY_BLUE = "#1E3A8A";  // Deep Blue
const ACCENT_GOLD = "#FFC300";   // Vibrant Gold/Yellow
const ACTIVE_GREEN = "#10B981";  // Green for Active status

export default function RenterTracking() {
  return (
    <View style={styles.container}>
      {/* ✅ Common TopBar */}
      <TopBar
        username="Amit"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      {/* ✅ Scrollable Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Live Trip Status & Tracking 🧭</Text>
        <Text style={styles.subText}>
          View the <Text style={{ fontWeight: "700" }}>Tata Nexon EV</Text> location and safety information in real time.
        </Text>

        {/* 🚗 Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>[ Map of Vehicle Location ]</Text>
          <Text style={[styles.mapText, { marginTop: 10 }]}>Last Updated: 9:41 AM</Text>
        </View>

        {/* 🔒 Geo-Fencing Alert */}
        <View style={styles.geoFenceContainer}>
          <View style={styles.geoFenceHeader}>
            <Ionicons name="shield-checkmark" size={24} color={ACCENT_GOLD} />
            <Text style={styles.geoFenceTitle}>Geo-Fencing Active</Text>
          </View>
          <Text style={styles.geoFenceInfo}>
            The vehicle is currently within the allowed rental zone. You will be
            notified instantly of any unauthorized boundary exit.
          </Text>
          <TouchableOpacity style={styles.geoFenceButton}>
            <Text style={styles.geoFenceButtonText}>View Zone Map</Text>
          </TouchableOpacity>
        </View>

        {/* 🔘 Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>View Current Trip Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingBottom: 40, // extra space at bottom
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY_BLUE,
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
    height: 300,
    backgroundColor: "#EBF4FF",
    borderWidth: 1,
    borderColor: PRIMARY_BLUE,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  mapText: { color: PRIMARY_BLUE, fontWeight: "700", fontSize: 16 },

  geoFenceContainer: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: ACCENT_GOLD,
    shadowColor: ACCENT_GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  geoFenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  geoFenceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY_BLUE,
  },
  geoFenceInfo: {
    color: "#4B5563",
    marginTop: 5,
    fontSize: 14,
  },
  geoFenceButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: ACTIVE_GREEN,
  },
  geoFenceButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  actionButton: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  actionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
