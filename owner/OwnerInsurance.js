import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated, // 💡 Import core Animated API
} from "react-native";
import TopBar from "../src/components/common/TopBar";

// MOCK DATA (UNCHANGED)
const MOCK_INSURANCES = [
  {
    id: "1",
    carName: "Hyundai i20",
    insurer: "HDFC Ergo",
    policyNo: "HDFC12345",
    coverage: "Comprehensive",
    expiryDate: "2025-12-15",
    status: "Active",
    image: require("../assets/cars/i20.png"),
  },
  {
    id: "2",
    carName: "Tata Nexon EV",
    insurer: "ICICI Lombard",
    policyNo: "ICICI98765",
    coverage: "Zero Depreciation",
    expiryDate: "2025-11-05",
    status: "Expiring Soon",
    image: require("../assets/cars/nexon.png"),
  },
  {
    id: "3",
    carName: "Maruti Swift",
    insurer: "Bajaj Allianz",
    policyNo: "BA445566",
    coverage: "Third Party",
    expiryDate: "2025-09-10",
    status: "Expired",
    image: require("../assets/cars/swift.png"),
  },
];

// Reusable Animated Policy Card Component
const AnimatedPolicyCard = ({ policy, index }) => {
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
    
    // Helper function for status colors (Enhanced for visual contrast)
    const getStatusColors = (status) => {
        switch (status) {
            case "Active": return { background: "#D1FAE5", text: "#059669", accent: '#10B981' }; 
            case "Expiring Soon": return { background: "#FEF3C7", text: "#D97706", accent: '#F59E0B' }; 
            case "Expired": return { background: "#FEE2E2", text: "#EF4444", accent: '#EF4444' }; 
            default: return { background: "#E5E7EB", text: "#6B7280", accent: '#6B7280' };
        }
    };

    const colors = getStatusColors(policy.status);

    return (
        <Animated.View 
            style={[
                styles.policyCard,
                { 
                    opacity: fadeAnim, 
                    transform: [{ translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [25, 0], // Slide-up effect
                    }) }],
                    borderLeftColor: colors.accent, // Use accent color for card border
                }
            ]}
        >
            <Image source={policy.image} style={styles.carImage} resizeMode="cover" />
            
            <View style={styles.policyInfo}>
                <View style={styles.headerRow}>
                    <Text style={styles.carName}>{policy.carName}</Text>
                    {/* 🔹 Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: colors.background }]}>
                        <Text style={[styles.statusText, { color: colors.text }]}>{policy.status}</Text>
                    </View>
                </View>
                
                <Text style={styles.detailText}>
                    **{policy.coverage}** • {policy.insurer}
                </Text>
                <Text style={styles.detailText}>Policy No: **{policy.policyNo}**</Text>
                
                <Text style={styles.expiryText}>
                    Expiry: **{policy.expiryDate}**
                </Text>

                {/* 🔹 Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.accent }]}
                        onPress={() => alert(`Renewing ${policy.carName}'s policy...`)}
                    >
                        <Text style={styles.buttonText}>
                            {policy.status === "Expired" || policy.status === "Expiring Soon" ? "Renew Now" : "Renew"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButtonSecondary}
                        onPress={() => alert(`View details for ${policy.carName}`)}
                    >
                        <Text style={styles.buttonText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};


export default function OwnerInsurance() {
  const [insuranceList, setInsuranceList] = useState(MOCK_INSURANCES);
  const fadeHeaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in for non-staggered items (Header and Add Button)
    Animated.timing(fadeHeaderAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* ✅ TopBar (UNCHANGED) */}
      <TopBar
        username="Rahul"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Animated Header */}
        <Animated.View style={{ opacity: fadeHeaderAnim }}>
            <Text style={styles.heading}>Vehicle Insurance Overview 🛡️</Text>
            <Text style={styles.subText}>
                Manage, renew, and view your active insurance policies.
            </Text>
        </Animated.View>

        {/* ✅ Insurance Cards */}
        {insuranceList.map((policy, index) => (
          <AnimatedPolicyCard 
              key={policy.id} 
              policy={policy} 
              index={index} 
          />
        ))}

        {/* Animated Add Insurance Button */}
        <Animated.View style={[{ opacity: fadeHeaderAnim }]}>
            <TouchableOpacity
                style={styles.addInsuranceButton}
                onPress={() => alert("Navigate to Add Insurance Form")}
            >
                <Text style={styles.addInsuranceText}>+ Add or Renew Insurance</Text>
            </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES (Enhanced) ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 5,
  },
  subText: { 
    color: "#6B7280", 
    marginBottom: 20, 
    fontSize: 14,
  },
  policyCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5, // Accent border
  },
  carImage: { 
    width: 100, 
    height: 100, // Slightly taller image
    borderRadius: 10, 
    marginRight: 15,
  },
  policyInfo: { 
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  carName: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#1E3A8A",
  },
  detailText: { 
    color: "#4B5563", 
    marginVertical: 1, 
    fontSize: 13,
  },
  expiryText: {
      color: "#374151",
      fontSize: 14,
      fontWeight: '700',
      marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20, // Fully rounded badge
  },
  statusText: { 
    fontWeight: "800", 
    fontSize: 12,
  },
  buttonRow: { 
    flexDirection: "row", 
    gap: 10, 
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    // Note: Background color is dynamic in the component logic
  },
  actionButtonSecondary: {
    backgroundColor: "#2563EB", // Blue for view details
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 13,
  },
  addInsuranceButton: {
    backgroundColor: "#4B44B9",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  addInsuranceText: { 
    color: "#fff", 
    fontWeight: "800", 
    fontSize: 16,
  },
});