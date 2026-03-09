import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import TopBar from "../../src/components/common/TopBar";
import BottomNav from "../../src/components/common/BottomNav";
import { useRole } from "../../src/context/RoleContext";
import { useTheme } from "../../src/context/ThemeContext";   // ✅ IMPORTANT

const ACTIVE_GREEN = "#10B981";
const WARNING_GOLD = "#F59E0B";
const ALERT_RED = "#EF4444";

const MOCK_POLICIES = [
  {
    id: "POL-AXA-0912",
    carName: "Tata Nexon EV",
    insurer: "Acko General Insurance",
    startDate: "2025-01-15",
    endDate: "2026-01-15",
    premium: "₹5,500 / year",
    status: "Active",
    image: require("../../assets/cars/nexon.png"),
  },
  {
    id: "POL-HDFC-7864",
    carName: "Hyundai i20",
    insurer: "HDFC ERGO",
    startDate: "2025-02-10",
    endDate: "2026-02-09",
    premium: "₹4,800 / year",
    status: "Expiring Soon",
    image: require("../../assets/cars/i20.png"),
  },
];

export default function InsuranceScreen() {
  const { role } = useRole();
  const { theme } = useTheme();              // ✅ THEME ACCESS
  const isLender = role === "lender";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [policies] = useState(MOCK_POLICIES);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return ACTIVE_GREEN;
      case "Expiring Soon":
        return WARNING_GOLD;
      case "Expired":
        return ALERT_RED;
      default:
        return theme.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.heading, { color: theme.text }]}>
            {isLender
              ? "Vehicle Insurance Policies 🛡️"
              : "Rental Insurance Coverage 🚗"}
          </Text>

          <Text style={[styles.subText, { color: theme.subText }]}>
            {isLender
              ? "Manage insurance policies for your vehicles."
              : "Insurance protection for your rented vehicles."}
          </Text>
        </Animated.View>

        {policies.map((policy, index) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            index={index}
            getStatusColor={getStatusColor}
            theme={theme}                      // ✅ PASS THEME
          />
        ))}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.addButtonText}>
            {isLender ? "+ Add Insurance Policy" : "View Policy Details"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav currentTab="Insurance" />
    </View>
  );
}

const PolicyCard = ({ policy, index, getStatusColor, theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statusColor = getStatusColor(policy.status);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 120,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,         // ✅ THEME CARD
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Image source={policy.image} style={styles.carImage} />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={[styles.carName, { color: theme.text }]}>
            {policy.carName}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "22" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {policy.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.insurerText, { color: theme.subText }]}>
          {policy.insurer}
        </Text>

        <Text style={[styles.policyText, { color: theme.subText }]}>
          Policy No: {policy.id}
        </Text>

        <Text style={[styles.policyText, { color: theme.subText }]}>
          Validity: {policy.startDate} → {policy.endDate}
        </Text>

        <Text style={[styles.premiumText, { color: theme.primary }]}>
          {policy.premium}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: statusColor }]}
          >
            <Text style={styles.buttonText}>Renew</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },

  subText: {
    marginBottom: 20,
  },

  card: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 14,
    marginBottom: 15,
    elevation: 3,
  },

  carImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    marginRight: 12,
  },

  cardBody: {
    flex: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  carName: {
    fontSize: 16,
    fontWeight: "800",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  insurerText: {
    fontSize: 13,
    marginTop: 2,
  },

  policyText: {
    fontSize: 12,
    marginTop: 2,
  },

  premiumText: {
    marginTop: 6,
    fontWeight: "800",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  primaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  addButton: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});