import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import TopBar from "../src/components/common/TopBar";

export default function AddCar() {
  return (
    <View style={styles.container}>
      <TopBar
        username="Rahul"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      <View style={styles.content}>
        <Text style={styles.heading}>Add New Vehicle</Text>
        <Text style={styles.subText}>
          Provide your car’s details and make it available for rentals.
        </Text>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Proceed to Add Vehicle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFF4F8" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#4B44B9",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 25,
  },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
