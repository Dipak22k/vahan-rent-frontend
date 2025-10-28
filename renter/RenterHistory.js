import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated, // 💡 Import core Animated API
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "../src/components/common/TopBar";

// --- MOCK DATA (UNCHANGED) ---
const ACTIVE_RENTALS = [
  {
    id: "1",
    carName: "Hyundai i20",
    startDate: "2025-10-01",
    endDate: "2025-10-10",
    pricePerDay: 1200,
    status: "Active",
  },
  {
    id: "2",
    carName: "Tata Nexon EV",
    startDate: "2025-10-05",
    endDate: "2025-10-15",
    pricePerDay: 2500,
    status: "Active",
  },
];

const PAST_RENTALS = [
  {
    id: "1",
    carName: "Maruti Swift",
    startDate: "2025-09-10",
    endDate: "2025-09-15",
    totalCost: 4750,
    status: "Completed",
  },
  {
    id: "2",
    carName: "Kia Sonet",
    startDate: "2025-08-20",
    endDate: "2025-08-25",
    totalCost: 8900,
    status: "Completed",
  },
];

// --- Reusable Animated Rental Card Component ---
const RentalCard = ({ rental, index, activeTab }) => {
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
    
    const isActive = activeTab === "Active";
    const accentColor = isActive ? "#2563EB" : "#10B981"; // Blue for Active, Green for Completed

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
                    borderLeftColor: accentColor,
                    // Mute past cards slightly
                    backgroundColor: isActive ? '#fff' : '#FAFAFA',
                    opacity: isActive ? fadeAnim : fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.9],
                    }),
                }
            ]}
        >
            <Text style={styles.carName}>{rental.carName}</Text>
            
            <View style={styles.detailsRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.dateText}>
                    {rental.startDate} → {rental.endDate}
                </Text>
            </View>

            <View style={styles.costRow}>
                <Text style={styles.costLabel}>
                    {isActive ? "Price" : "Total Cost"}
                </Text>
                <Text style={styles.costText}>
                    ₹{isActive ? rental.pricePerDay.toLocaleString('en-IN') + ' / day' : rental.totalCost.toLocaleString('en-IN')}
                </Text>
            </View>

            {isActive ? (
                // Active Rental Actions
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.extendButton]}
                        onPress={() => alert(`Request sent to extend ${rental.carName}`)}
                    >
                        <Text style={styles.actionText}>Extend Rental</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.messageButton]}
                        onPress={() => alert(`Message sent to owner of ${rental.carName}`)}
                    >
                        <Text style={styles.actionText}>Message Owner</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // Past Rental Status
                <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.completedText}>
                        Rental Completed
                    </Text>
                </View>
            )}
        </Animated.View>
    );
}

export default function RenterHistory() {
  const [activeTab, setActiveTab] = useState("Active");

  return (
    <View style={styles.container}>
      {/* ✅ Top Bar */}
      <TopBar
        username="Amit"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      <ScrollView stickyHeaderIndices={[0]} style={{ flex: 1 }}>
          {/* ✅ Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "Active" && styles.activeTab]}
              onPress={() => setActiveTab("Active")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Active" && styles.activeTabText,
                ]}
              >
                Active ({ACTIVE_RENTALS.length})
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
                Past ({PAST_RENTALS.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Rentals List */}
          <View style={styles.content}>
            {activeTab === "Active"
              ? ACTIVE_RENTALS.map((rental, index) => (
                  <RentalCard key={rental.id} rental={rental} index={index} activeTab={activeTab} />
                ))
              : PAST_RENTALS.map((rental, index) => (
                  <RentalCard key={rental.id} rental={rental} index={index} activeTab={activeTab} />
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1, 
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
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
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
  },
  carName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  dateText: {
    color: "#374151",
    fontWeight: '600',
  },
  costRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 15,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
  },
  costLabel: {
      color: "#4B5563",
      fontWeight: "600",
      fontSize: 14,
  },
  costText: {
    color: "#1E3A8A",
    fontWeight: "800",
    fontSize: 18,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  extendButton: {
    backgroundColor: "#10B981", // Green for Extend
  },
  messageButton: {
    backgroundColor: "#FFC300", // Gold Accent for Message
  },
  actionText: {
    color: "#1E3A8A", // Deep blue text on gold
    fontWeight: "800",
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5', // Light green background
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  completedText: {
    color: "#10B981",
    fontWeight: "800",
    fontSize: 14,
  },
});