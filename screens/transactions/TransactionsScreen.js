import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import TopBar from "../../src/components/common/TopBar";
import BottomNav from "../../src/components/common/BottomNav";
import CONFIG from "../../src/api/config";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have vector-icons installed

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${CONFIG.BASE_URL}/api/payments/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.log("TRANSACTION ERROR:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  const renderItem = ({ item }) => {
    const isCredit = item.type === "credit";
    const statusColor = item.status === "failed" ? "#DC2626" : theme.subText;

    return (
      <TouchableOpacity activeOpacity={0.7} style={styles.transactionRow}>
        {/* AVATAR / ICON */}
        <View style={[styles.iconContainer, { backgroundColor: isCredit ? "#e8f5e9" : "#f3e5f5" }]}>
          <Text style={[styles.avatarText, { color: isCredit ? "#2e7d32" : "#5f259f" }]}>
            {(item.title || "C")[0].toUpperCase()}
          </Text>
          {/* Small status overlay icon */}
          <View style={styles.statusBadge}>
            <Ionicons 
              name={isCredit ? "arrow-down-outline" : "arrow-up-outline"} 
              size={10} 
              color="#fff" 
            />
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.detailsContainer}>
          <View style={styles.rowBetween}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {isCredit ? "Received from" : "Paid to"}
            </Text>
            <Text style={[styles.amount, { color: theme.text }]}>
              ₹{item.amount}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[styles.subtitle, { color: theme.subText }]} numberOfLines={1}>
              {item.title || "User / Merchant Name"}
            </Text>
            {item.status === "failed" && (
              <Text style={styles.failedText}>Failed</Text>
            )}
          </View>

          <Text style={[styles.timestamp, { color: theme.subText }]}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', { 
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar title="History" />

      {loading ? (
        <ActivityIndicator size="large" color="#5f259f" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#5f259f"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={theme.subText} />
              <Text style={{ color: theme.subText, marginTop: 10 }}>No transactions yet</Text>
            </View>
          }
        />
      )}
      <BottomNav currentTab="Transactions" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  transactionRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarText: { fontSize: 18, fontWeight: "bold" },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#5f259f",
    borderRadius: 10,
    padding: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  detailsContainer: { flex: 1, marginLeft: 14 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 15, fontWeight: "500" },
  amount: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 2 },
  timestamp: { fontSize: 12, marginTop: 6, opacity: 0.8 },
  failedText: { color: "#DC2626", fontSize: 12, fontWeight: "600" },
  emptyState: { alignItems: "center", marginTop: 100 },
});