import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
   Platform, // ✅ ADD THIS
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import CONFIG from "../../src/api/config";

const { width } = Dimensions.get("window");

export default function OfferDetailsScreen({ route, navigation }) {
  const { offerId } = route.params;
  const { theme } = useTheme();

  const [offer, setOffer] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOffer = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("userData");

    console.log("OFFER ID:", offerId); // 🔥 DEBUG
      const parsedUser = JSON.parse(userData);
      setUserId(parsedUser._id);

      const res = await axios.get(`${CONFIG.BASE_URL}/api/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffer(res.data);
    } catch (err) {
      alert("Error fetching offer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, []);
const handleAccept = async () => {
  try {
    setActionLoading(true);

    const token = await AsyncStorage.getItem("userToken");

    const res = await fetch(
      `${CONFIG.BASE_URL}/api/offers/${offerId}/accept`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // ✅ Store BOTH offer + order
    setOffer({
      ...data.offer,
      order: data.order,
    });

  } catch (err) {
    alert(err.message);
  } finally {
    setActionLoading(false);
  }
};


const handleProceedToPay = async () => {
  try {
    setActionLoading(true);

    const token = await AsyncStorage.getItem("userToken");

    // 🔥 call accept again ONLY to get order (safe way)
    const res = await fetch(
      `${CONFIG.BASE_URL}/api/offers/${offerId}/accept`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // ✅ Navigate here
    navigation.navigate("Checkout", {
      offer: data.offer,
      order: data.order,
    });

  } catch (err) {
    alert(err.message);
  } finally {
    setActionLoading(false);
  }
};


  const handleReject = async () => {
  try {
    setActionLoading(true);

    const token = await AsyncStorage.getItem("userToken");

    const res = await fetch(
      `${CONFIG.BASE_URL}/api/offers/${offerId}/reject`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Reject failed");
    }

    // ✅ Update UI instantly
    setOffer((prev) => ({
      ...prev,
      status: "rejected",
    }));

    // ✅ Go back to chat (optional but better UX)
    navigation.goBack();

  } catch (err) {
    console.log("REJECT ERROR:", err.message);
    alert(err.message || "Failed to reject offer");
  } finally {
    setActionLoading(false);
  }
};
 const handleDelete = async () => {
  try {
    setActionLoading(true);

    const token = await AsyncStorage.getItem("userToken");

    await fetch(`${CONFIG.BASE_URL}/api/offers/${offerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ Instead of refetch (which caused blank screen before)
    setOffer((prev) => ({
      ...prev,
      status: "cancelled",
    }));

  } catch (err) {
    console.log("DELETE ERROR:", err);
    alert("Failed to delete offer");
  } finally {
    setActionLoading(false);
  }
};

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending": return { bg: "#FFF8E1", text: "#F57C00", icon: "time" };
      case "accepted": return { bg: "#E3F2FD", text: "#1976D2", icon: "checkmark-circle" };
      case "paid": return { bg: "#E8F5E9", text: "#388E3C", icon: "card" };
      case "rejected": return { bg: "#FFEBEE", text: "#D32F2F", icon: "close-circle" };
      default: return { bg: "#F5F5F5", text: "#757575", icon: "help-circle" };
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!offer) return <View style={styles.centered}><Text>Offer not found</Text></View>;

  const isBorrower = userId?.toString() === offer.borrowerId?.toString();
  const isLender = userId?.toString() === offer.lenderId?.toString();
  const status = getStatusConfig(offer.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Offer Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={20} color={status.text} />
          <Text style={[styles.statusLabel, { color: status.text }]}>
            Offer is {offer.status.toUpperCase()}
          </Text>
        </View>

        {/* Pricing Card */}
        <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
          <Text style={styles.cardLabel}>TOTAL PAYABLE</Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>₹{offer.totalPrice.toLocaleString('en-IN')}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.rowBetween}>
            <Text style={styles.detailLabel}>Daily Rate</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>₹{offer.pricePerDay}</Text>
          </View>
        </View>

        {/* Dates Section */}
        <Text style={styles.sectionHeader}>Rental Duration</Text>
        <View style={[styles.dateContainer, { backgroundColor: theme.card }]}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>START DATE</Text>
            <Text style={[styles.dateText, { color: theme.text }]}>
              {new Date(offer.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#BDC3C7" />
          <View style={styles.dateItem}>
            <Text style={[styles.dateLabel, { textAlign: 'right' }]}>END DATE</Text>
            <Text style={[styles.dateText, { color: theme.text, textAlign: 'right' }]}>
              {new Date(offer.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Role Helper Text */}
        <Text style={styles.helperText}>
          {isLender ? "You sent this offer to the borrower." : "You received this offer from the lender."}
        </Text>

      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
        
        {offer.status === "pending" && isBorrower && (
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleReject} style={[styles.actionBtn, styles.rejectBtn]}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAccept} style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.btnText}>Accept Offer</Text>
            </TouchableOpacity>
          </View>
        )}

        {offer.status === "pending" && isLender && (
          <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, { backgroundColor: "#000" }]}>
            <Text style={styles.btnText}>Withdraw Offer</Text>
          </TouchableOpacity>
        )}

                {offer.status === "accepted" && (
  <TouchableOpacity
    onPress={handleProceedToPay}
    style={[styles.actionBtn, { backgroundColor: theme.primary }]}
  >
    <Text style={styles.btnText}>
      Proceed to Pay ₹{offer.totalPrice}
    </Text>
  </TouchableOpacity>
)}

        {offer.status === "paid" && (
          <View style={styles.confirmedBadge}>
            <Ionicons name="checkmark-done-circle" size={24} color="#388E3C" />
            <Text style={styles.confirmedText}>Booking Confirmed</Text>
          </View>
        )}
      </View>

      {actionLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  // Header
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10, // Keeps header above content
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700" 
  },
  // Content Layout
  scrollContent: { 
    padding: 20,
    paddingBottom: 140, // IMPORTANT: Height of footer + extra space so nothing is hidden
    flexGrow: 1, 
  },
  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center'
  },
  statusLabel: { 
    marginLeft: 8, 
    fontWeight: '700', 
    fontSize: 13 
  },
  // Main Pricing Card
  mainCard: {
    padding: 24,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  cardLabel: { 
    fontSize: 12, 
    color: '#95A5A6', 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  totalAmount: { 
    fontSize: 36, 
    fontWeight: '800', 
    marginVertical: 10 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#ECF0F1', 
    width: '100%', 
    marginVertical: 15 
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  detailLabel: { 
    color: '#7F8C8D', 
    fontSize: 15 
  },
  detailValue: { 
    fontWeight: '700', 
    fontSize: 15 
  },
  // Date Section
  sectionHeader: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#95A5A6', 
    marginBottom: 12, 
    textTransform: 'uppercase' 
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  dateItem: { 
    flex: 1 
  },
  dateLabel: { 
    fontSize: 10, 
    color: '#95A5A6', 
    fontWeight: '700', 
    marginBottom: 4 
  },
  dateText: { 
    fontSize: 15, 
    fontWeight: '700' 
  },
  helperText: { 
    textAlign: 'center', 
    color: '#95A5A6', 
    marginTop: 30, 
    fontSize: 13, 
    fontStyle: 'italic',
    paddingHorizontal: 20
  },
  // Footer (The Fixed Part)
  footer: { 
    position: 'absolute', // Locks footer to bottom
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20, 
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Adjusts for iPhone notch
    borderTopWidth: 1,
    elevation: 20, // High elevation for Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtn: { 
    flex: 1, 
    height: 56, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center",
    marginHorizontal: 6,
    // Add a slight press effect for feedback
    activeOpacity: 0.7 
  },
  rejectBtn: { 
    backgroundColor: '#F2F3F4', 
    borderWidth: 1, 
    borderColor: '#D5DBDB' 
  },
  rejectBtnText: { 
    color: '#2C3E50', 
    fontWeight: '700',
    fontSize: 16
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
  // Post-Action UI
  confirmedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 56 
  },
  confirmedText: { 
    marginLeft: 10, 
    color: '#388E3C', 
    fontWeight: '800', 
    fontSize: 18 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker for better focus
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }
});