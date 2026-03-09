import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import TopBar from "../../src/components/common/TopBar";
import BottomNav from "../../src/components/common/BottomNav";
import { useRole } from "../../src/context/RoleContext";
import { useTheme } from "../../src/context/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const MOCK_CONTRACTS = [
  {
    id: "C1",
    car: "Hyundai i20",
    borrower: "Dipak Kongari",
    rentPerDay: 1200,
    deposit: 3000,
    contractHash: "0xA1B2C3...D4E5",
    status: "Active",
    date: "Feb 20, 2026",
  },
  {
    id: "C2",
    car: "Tata Nexon EV",
    borrower: "Amit Sharma",
    rentPerDay: 2500,
    deposit: 4000,
    contractHash: "0xE3F5B6...G7H8",
    status: "Completed",
    date: "Jan 15, 2026",
  },
];

const getTabsForRole = (role) => {
  if (role === "lender") return ["Active", "Pending", "Completed"];
  return ["Active", "Past"];
};

export default function ContractsScreen() {
  const { role } = useRole();
  const { theme } = useTheme();
  const isLender = role === "lender";

  const tabs = getTabsForRole(role);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  
  // Calculate dynamic tab width based on number of tabs to prevent alignment errors
  const currentTabWidth = (width - 40) / tabs.length; 
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: tabs.indexOf(activeTab) * currentTabWidth,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [activeTab]);

  const filteredContracts = MOCK_CONTRACTS.filter((c) => {
    if (!isLender && activeTab === "Past") return c.status === "Completed";
    return c.status === activeTab;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar />

      <View style={styles.headerPadding}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Your Contracts</Text>
        <Text style={[styles.screenSub, { color: theme.subText }]}>Blockchain-verified rental agreements</Text>
      </View>

      {/* ✅ Premium Segmented Tabs */}
      <View style={[styles.tabOuterWrapper, { backgroundColor: theme.card }]}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: theme.primary,
              width: currentTabWidth,
              transform: [{ translateX: indicatorAnim }],
            },
          ]}
        />
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? "#FFF" : theme.subText },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredContracts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-search-outline" size={60} color={theme.subText} opacity={0.3} />
            <Text style={[styles.noContracts, { color: theme.subText }]}>
              No {activeTab.toLowerCase()} contracts found.
            </Text>
          </View>
        ) : (
          filteredContracts.map((contract, index) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              index={index}
              isLender={isLender}
              theme={theme}
            />
          ))
        )}
      </ScrollView>

      <BottomNav currentTab="Contracts" />
    </View>
  );
}

const ContractCard = ({ contract, index, isLender, theme }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true })
    ]).start();
  }, []);

  const statusColor = contract.status === "Active" ? "#10B981" : "#64748B";

  return (
    <Animated.View
      style={[
        styles.contractCard,
        {
          backgroundColor: theme.card,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.carName, { color: theme.text }]}>{contract.car}</Text>
          <Text style={[styles.dateText, { color: theme.subText }]}>{contract.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{contract.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.subText }]}>{isLender ? "BORROWER" : "LENDER"}</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{contract.borrower}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.subText }]}>DAILY RENT</Text>
          <Text style={[styles.infoValue, { color: theme.primary }]}>₹{contract.rentPerDay}</Text>
        </View>
      </View>

      <View style={[styles.hashBox, { backgroundColor: theme.background }]}>
        <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
        <Text style={[styles.hashText, { color: theme.subText }]} numberOfLines={1}>
          TX: {contract.contractHash}
        </Text>
      </View>

      {isLender && contract.status === "Active" && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.buttonText}>Mark as Returned</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.text + "20", borderWidth: 1 }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPadding: { paddingHorizontal: 20, paddingTop: 15, marginBottom: 15 },
  screenTitle: { fontSize: 24, fontWeight: "800" },
  screenSub: { fontSize: 13, marginTop: 4 },

  tabOuterWrapper: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    position: "relative",
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  tabButton: { flex: 1, height: "100%", justifyContent: "center", alignItems: "center", zIndex: 2 },
  tabText: { fontWeight: "700", fontSize: 13 },
  tabIndicator: {
    position: "absolute",
    height: "100%",
    top: 4,
    left: 4,
    borderRadius: 10,
    zIndex: 1,
  },

  scrollContent: { padding: 20, paddingBottom: 120 },
  contractCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  carName: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  dateText: { fontSize: 12, marginTop: 2 },
  
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },

  divider: { height: 1, backgroundColor: "#00000008", marginVertical: 15 },
  
  infoGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: "700" },

  hashBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 5,
  },
  hashText: { fontSize: 11, marginLeft: 6, fontFamily: "monospace" },

  buttonRow: { flexDirection: "row", marginTop: 15, gap: 10 },
  primaryButton: { flex: 1, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 2 },
  secondaryButton: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  noContracts: { textAlign: "center", marginTop: 15, fontSize: 15, fontWeight: "500" },
});