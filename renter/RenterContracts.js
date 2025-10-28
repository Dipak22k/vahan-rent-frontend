import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated, // 💡 Import core Animated API
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For professional icons
import TopBar from "../src/components/common/TopBar";

// --- MOCK DATA (UNCHANGED) ---
const ACTIVE_CONTRACTS = [
  {
    id: "SC-0x92AF123",
    carName: "Tata Nexon EV",
    startDate: "2025-10-05",
    endDate: "2025-10-15",
    lockedAmount: "₹25,000",
    status: "Locked",
    owner: "Rajesh (Owner)",
  },
  {
    id: "SC-0xD8F212A",
    carName: "Hyundai i20",
    startDate: "2025-10-01",
    endDate: "2025-10-10",
    lockedAmount: "₹12,000",
    status: "Locked",
    owner: "Sneha (Owner)",
  },
];

const PAST_CONTRACTS = [
  {
    id: "SC-0xA3E982B",
    carName: "Kia Sonet",
    startDate: "2025-08-10",
    endDate: "2025-08-17",
    releasedAmount: "₹17,500",
    status: "Released",
    owner: "Vikram (Owner)",
  },
  {
    id: "SC-0xB4F92A9",
    carName: "Maruti Swift",
    startDate: "2025-07-20",
    endDate: "2025-07-27",
    releasedAmount: "₹9,400",
    status: "Released",
    owner: "Anita (Owner)",
  },
];

// --- Reusable Animated Contract Card Component ---
const ContractCard = ({ contract, index, activeTab }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered fade-in effect
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: 150 + index * 120, // Staggered delay for list items
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);
    
    // Determine styles based on contract type
    const isActive = activeTab === "Active";
    const statusColor = isActive ? "#EAB308" : "#10B981"; // Yellow/Gold for Locked, Green for Released
    const iconName = isActive ? "lock-closed-outline" : "checkmark-circle-outline";
    const buttonBg = isActive ? "#1E3A8A" : "#10B981"; // Deep Blue for Active, Green for Past

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
            <View style={styles.cardHeader}>
                <Text style={styles.carName}>{contract.carName}</Text>
                <Ionicons name={iconName} size={24} color={statusColor} />
            </View>

            <Text style={styles.contractId}>
                Contract ID: **{contract.id}**
            </Text>
            
            <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>Owner:</Text>
                <Text style={styles.ownerText}>{contract.owner}</Text>
            </View>
            
            <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>Period:</Text>
                <Text style={styles.dateText}>
                    {contract.startDate} → {contract.endDate}
                </Text>
            </View>
            
            <View style={styles.amountBadge}>
                <Text style={styles.amountLabel}>
                    {isActive ? "LOCKED AMOUNT" : "RELEASED AMOUNT"}
                </Text>
                <Text style={styles.amountText}>
                    {isActive ? contract.lockedAmount : contract.releasedAmount}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.blockchainButton, { backgroundColor: buttonBg }]}
                onPress={() =>
                    alert(
                        `Viewing blockchain transaction for ${contract.carName}`
                    )
                }
            >
                <Text style={styles.blockchainText}>
                    View Blockchain Details
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function RenterContracts() {
  const [activeTab, setActiveTab] = useState("Active");

  return (
    <View style={styles.container}>
      <TopBar
        username="Amit"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      <ScrollView stickyHeaderIndices={[0]} style={{ flex: 1 }}>
        {/* 🔹 Enhanced Tabs Container */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Active" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Active")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Active" && styles.activeTabText,
              ]}
            >
              Active Contracts (2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "Past" && styles.activeTab]}
            onPress={() => setActiveTab("Past")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Past" && styles.activeTabText,
              ]}
            >
              Past Contracts (2)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔹 Contract List */}
        <View style={styles.content}>
          {activeTab === "Active"
            ? ACTIVE_CONTRACTS.map((contract, index) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  index={index}
                  activeTab={activeTab}
                />
              ))
            : PAST_CONTRACTS.map((contract, index) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  index={index}
                  activeTab={activeTab}
                />
              ))}

          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    // Add shadow to make it float above the content when scrolling
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1, // Ensure tabs stay above content
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8, // Less rounded than original
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 15,
  },
  activeTab: {
    backgroundColor: "#1E3A8A", // Deep Primary Blue
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5, // Status accent border
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
  },
  carName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  contractId: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
      color: "#4B5563",
      fontWeight: '600',
      fontSize: 14,
  },
  ownerText: {
    color: "#1E3A8A", // Deep Blue
    fontWeight: '700',
    fontSize: 14,
  },
  dateText: {
    color: "#374151",
    fontWeight: '600',
  },
  amountBadge: {
      backgroundColor: '#F3F4F6', // Light gray background for emphasis
      borderRadius: 10,
      padding: 12,
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  amountLabel: {
      color: "#6B7280",
      fontWeight: '600',
      fontSize: 12,
  },
  amountText: {
    color: "#1E3A8A",
    fontWeight: "800",
    fontSize: 18,
  },
  blockchainButton: {
    marginTop: 15,
    // Background color is set dynamically in the component
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  blockchainText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});