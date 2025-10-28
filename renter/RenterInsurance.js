import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated, // 💡 Core Animated API
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "../src/components/common/TopBar";

// --- MOCK DATA (UNCHANGED) ---
const ACTIVE_INSURANCE = [
  {
    id: "POL-AXA-0912",
    carName: "Tata Nexon EV",
    insurer: "Acko General Insurance",
    startDate: "2025-01-15",
    endDate: "2026-01-15",
    premium: "₹5,500 / year",
    status: "Active",
    image: require("../assets/cars/nexon.png"),
  },
  {
    id: "POL-HDF-7864",
    carName: "Hyundai i20",
    insurer: "HDFC ERGO",
    startDate: "2025-02-10",
    endDate: "2026-02-09",
    premium: "₹4,800 / year",
    status: "Expiring Soon",
    image: require("../assets/cars/i20.png"),
  },
  {
    id: "POL-ICICI-8823",
    carName: "Maruti Swift",
    insurer: "ICICI Lombard",
    startDate: "2024-12-01",
    endDate: "2025-12-01",
    premium: "₹4,200 / year",
    status: "Active",
    image: require("../assets/cars/swift.png"),
  },
];

// --- Reusable Animated Policy Card Component ---
const AnimatedPolicyCard = ({ policy, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered fade-in effect
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: 150 + index * 120, // Staggered delay
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const isExpiring = policy.status === "Expiring Soon";
    const statusColor = isExpiring ? "#F59E0B" : "#10B981"; // Gold/Amber or Green

    return (
        <Animated.View 
            style={[
                styles.card,
                { 
                    opacity: fadeAnim, 
                    transform: [{ translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0], // Slide-up effect
                    }) }],
                    borderLeftColor: statusColor, // Status color accent border
                }
            ]}
        >
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image source={policy.image} style={styles.carImage} resizeMode="contain" />
            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
                <View style={styles.infoHeader}>
                    <Text style={styles.carName}>{policy.carName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isExpiring ? '#FEF3C7' : '#D1FAE5' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {policy.status}
                        </Text>
                    </View>
                </View>

                <Text style={styles.policyId}>Insurer: **{policy.insurer}**</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Policy No:</Text>
                    <Text style={styles.policyText}>{policy.id}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Validity:</Text>
                    <Text style={styles.policyText}>
                        {policy.startDate} → {policy.endDate}
                    </Text>
                </View>

                <View style={styles.premiumBadge}>
                    <Text style={styles.premiumLabel}>Annual Premium</Text>
                    <Text style={styles.premiumText}>
                        {policy.premium}
                    </Text>
                </View>
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.policyButton} // Deep Blue
                    onPress={() => alert(`Viewing policy details for ${policy.carName}`)}
                >
                    <Text style={styles.policyButtonText}>View Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.policyButton,
                        styles.renewButton,
                        { backgroundColor: isExpiring ? statusColor : '#374151' }, // Gold/Amber if expiring, dark gray otherwise
                    ]}
                    onPress={() => alert(`Renewal process started for ${policy.carName}`)}
                >
                    <Text style={styles.policyButtonText}>Renew Now</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};


export default function RenterInsurance() {
  return (
    <View style={styles.container}>
      {/* 🔹 TopBar (Cohesive style assumed) */}
      <TopBar
        username="Amit"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      {/* 🔹 Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Car Insurance Policies</Text>
        <Text style={styles.subText}>
          Policies covering cars currently under rental.
        </Text>

        {ACTIVE_INSURANCE.map((policy, index) => (
          <AnimatedPolicyCard key={policy.id} policy={policy} index={index} />
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: 20 },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A", // Deep Blue
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 18,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5, // Status accent border defined dynamically
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  carImage: {
    width: '80%',
    height: 80,
  },
  infoContainer: {
    padding: 15,
  },
  infoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
  },
  carName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
      fontWeight: '700',
      fontSize: 12,
  },
  policyId: {
    color: "#4B5563",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
      color: "#6B7280",
      fontWeight: '600',
  },
  policyText: {
      color: "#374151",
      fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF4FF', // Light blue background for premium
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    marginBottom: 10,
  },
  premiumLabel: {
      color: '#1E3A8A',
      fontWeight: '600',
      fontSize: 13,
  },
  premiumText: {
    color: "#1E3A8A",
    fontWeight: "800",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
  },
  policyButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#1E3A8A", // Deep Blue for View Policy
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  renewButton: {
    // Background color is set dynamically for status indication
  },
  policyButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});