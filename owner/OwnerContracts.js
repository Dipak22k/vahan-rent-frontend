import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated, // 💡 Core Animated API
  Dimensions,
} from "react-native";
import TopBar from "../src/components/common/TopBar";

const { width } = Dimensions.get('window');
// Three tabs means each tab is roughly one-third of the screen width for the indicator
const tabWidth = width / 3; 

// MOCK DATA (UNCHANGED)
const MOCK_CONTRACTS = [
  {
    id: "C1",
    car: "Hyundai i20",
    renter: "Dipak",
    startDate: "2025-10-20",
    endDate: "2025-10-28",
    rentPerDay: 1200,
    deposit: 3000,
    contractHash: "0xA1B2C3D4E5",
    status: "Active",
  },
  {
    id: "C2",
    car: "Tata Nexon EV",
    renter: "Amit",
    startDate: "2025-10-10",
    endDate: "2025-10-18",
    rentPerDay: 2500,
    deposit: 4000,
    contractHash: "0xE3F5B6C7D8",
    status: "Completed",
  },
  {
    id: "C3",
    car: "Maruti Swift",
    renter: "Rahul",
    startDate: "2025-10-25",
    endDate: "2025-10-30",
    rentPerDay: 950,
    deposit: 2000,
    contractHash: "0xF1A9E7B3D2",
    status: "Pending",
  },
];

// Helper to determine indicator position
const getIndicatorPosition = (tab) => {
    switch (tab) {
        case "Active": return 0;
        case "Pending": return tabWidth;
        case "Completed": return tabWidth * 2;
        default: return 0;
    }
};

// Reusable Animated Contract Card Component
const AnimatedContractCard = ({ contract, activeTab, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Reset animation value when tab changes
        fadeAnim.setValue(0); 
        
        // Staggered fade-in effect
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            delay: 100 + index * 100, // Staggered delay for list items
            useNativeDriver: true,
        }).start();
    }, [activeTab]); // Reruns animation when the activeTab changes

    const getStatusColors = (status) => {
        switch (status) {
            case "Active": return { background: "#D1FAE5", text: "#10B981" }; // Green
            case "Pending": return { background: "#FEF3C7", text: "#F59E0B" }; // Yellow/Orange
            case "Completed": return { background: "#E5E7EB", text: "#6B7280" }; // Gray
            default: return { background: "#E5E7EB", text: "#6B7280" };
        }
    };

    const statusColors = getStatusColors(contract.status);

    return (
        <Animated.View 
            style={[
                styles.contractCard, 
                { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0], // Slight slide-up
                }) }] }
            ]}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.carName}>{contract.car}</Text>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColors.background }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>{contract.status}</Text>
                </View>
            </View>
            
            <Text style={styles.renterText}>Renter: **{contract.renter}**</Text>
            
            <View style={styles.detailRow}>
                <Text style={styles.detailText}>
                    **Period:** {contract.startDate} → {contract.endDate}
                </Text>
            </View>
            
            <Text style={styles.priceText}>
                <Text style={styles.priceLabel}>Rent/Day:</Text> ₹{contract.rentPerDay} | <Text style={styles.priceLabel}>Deposit:</Text> ₹{contract.deposit}
            </Text>

            <Text style={styles.hashText}>
                Contract Hash: {contract.contractHash}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                {activeTab === "Active" && (
                    <>
                        <TouchableOpacity
                            style={styles.actionButtonPrimary}
                            onPress={() => alert("Car marked as returned ✅")}
                        >
                            <Text style={styles.smallButtonText}>Mark Returned</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButtonSecondary}
                            onPress={() => alert("Messaging renter...")}
                        >
                            <Text style={styles.smallButtonText}>Message</Text>
                        </TouchableOpacity>
                    </>
                )}

                {activeTab === "Pending" && (
                    <TouchableOpacity
                        style={styles.actionButtonPrimary}
                        onPress={() => alert("Contract Approved ✅")}
                    >
                        <Text style={styles.smallButtonText}>Approve Contract</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};


export default function OwnerContracts() {
  const [activeTab, setActiveTab] = useState("Active");

  // 💡 Animation Setup for the tab indicator underline
  const indicatorAnim = useRef(new Animated.Value(getIndicatorPosition(activeTab))).current; 

  // Function to run the sliding animation
  useEffect(() => {
      Animated.timing(indicatorAnim, {
          toValue: getIndicatorPosition(activeTab),
          duration: 300,
          useNativeDriver: true,
      }).start();
  }, [activeTab]);

  // Filter contracts based on selected tab (UNCHANGED LOGIC)
  const filteredContracts = MOCK_CONTRACTS.filter(
    (c) => c.status === activeTab
  );

  return (
    <View style={styles.container}>
      {/* ✅ Top Bar (UNCHANGED) */}
      <TopBar
        username="Rahul"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      {/* 🔝 Enhanced Tab Switch */}
      <View style={styles.tabContainer}>
        {["Active", "Pending", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Animated Indicator Line */}
        <Animated.View 
            style={[
                styles.tabIndicator, 
                { transform: [{ translateX: indicatorAnim }] }
            ]}
        />
      </View>

      {/* ✅ Contracts List (With Animated Cards) */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredContracts.length === 0 ? (
          <Text style={styles.noContracts}>No {activeTab} contracts found.</Text>
        ) : (
          filteredContracts.map((contract, index) => (
            <AnimatedContractCard 
                key={contract.id} 
                contract={contract} 
                activeTab={activeTab} 
                index={index} 
            />
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES (Enhanced) ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" }, // Lighter background
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    position: 'relative', 
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 1, // Ensure text is above the indicator line
  },
  tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: tabWidth, 
      height: 3,
      backgroundColor: "#4B44B9", // Primary color indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#1E3A8A", // Darker when active
    fontWeight: "700",
  },
  scrollContent: { 
      padding: 20,
      paddingBottom: 40,
  },
  noContracts: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
    fontSize: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  contractCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#4B44B9', // Accent color
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  carName: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#1E3A8A",
  },
  renterText: { 
    color: "#374151", 
    marginVertical: 4, 
    fontSize: 15,
  },
  detailText: { 
    color: "#6B7280", 
    fontSize: 14,
    marginBottom: 2,
  },
  priceLabel: {
    fontWeight: '700',
    color: '#374151',
  },
  priceText: {
    color: "#4B44B9", 
    fontWeight: "800", 
    fontSize: 16,
    marginTop: 5,
    marginBottom: 8,
  },
  hashText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
    fontFamily: "monospace",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: { 
    fontWeight: "800", 
    fontSize: 13,
  },
  buttonRow: { 
    flexDirection: "row", 
    marginTop: 15, 
    gap: 10,
  },
  actionButtonPrimary: {
    backgroundColor: "#4B44B9", // Primary action button
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#4B44B9",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  actionButtonSecondary: {
    backgroundColor: "#1E3A8A", // Secondary action button (Dark Blue)
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  smallButtonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 14,
  },
});