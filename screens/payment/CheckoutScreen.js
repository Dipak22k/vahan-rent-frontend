import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "../../src/api/config";
import { Ionicons } from "@expo/vector-icons"; // Assuming you use Expo or can swap for react-native-vector-icons

export default function CheckoutScreen({ route, navigation }) {
  const { offer, order } = route.params;

  const handlePayment = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const options = {
        description: "Car Rental Payment",
        currency: "INR",
        key: "HRCNg6y31Ts4rYNbhyLeoBk3", // Replace with your actual key
        amount: order.amount,
        name: "Car Rental App",
        order_id: order.id,
        theme: { color: "#3399cc" }
      };

      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          const response = await fetch(`${CONFIG.BASE_URL}/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_signature: paymentData.razorpay_signature,
              offerId: offer._id,
            }),
          });

          if (response.ok) {
            alert("Payment Successful 🎉");
            navigation.navigate("Chat");
          }
        })
        .catch((error) => {
          console.log(error);
          alert("Payment cancelled");
        });

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Confirm & Pay</Text>

        {/* Rental Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rental Summary</Text>
          
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.dateInfo}>
              <Text style={styles.label}>Pick-up</Text>
              <Text style={styles.value}>{new Date(offer.startDate).toDateString()}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 15 }]}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.dateInfo}>
              <Text style={styles.label}>Return</Text>
              <Text style={styles.value}>{new Date(offer.endDate).toDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Price Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Fare</Text>
            <Text style={styles.priceValue}>₹{offer.totalPrice}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees</Text>
            <Text style={styles.priceValue}>₹0</Text>
          </View>
          <View style={[styles.priceRow, styles.totalDivider]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{offer.totalPrice}</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          By clicking proceed, you agree to our terms of service and rental policy.
        </Text>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalPriceText}>₹{offer.totalPrice}</Text>
          <Text style={styles.viewDetails}>Grand Total</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Text style={styles.payBtnText}>Proceed to Pay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20 },
  header: { fontSize: 26, fontWeight: "800", color: "#1A1A1A", marginBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15, color: "#333" },
  row: { flexDirection: "row", alignItems: "center" },
  dateInfo: { marginLeft: 12 },
  label: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 },
  value: { fontSize: 16, fontWeight: "600", color: "#333" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  priceLabel: { fontSize: 15, color: "#666" },
  priceValue: { fontSize: 15, fontWeight: "500", color: "#333" },
  totalDivider: { borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 15, marginTop: 5 },
  totalLabel: { fontSize: 17, fontWeight: "700", color: "#1A1A1A" },
  totalValue: { fontSize: 17, fontWeight: "800", color: "#3399cc" },
  footerNote: { textAlign: "center", color: "#999", fontSize: 12, paddingHorizontal: 20 },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  totalPriceText: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  viewDetails: { fontSize: 12, color: "#888" },
  payBtn: {
    backgroundColor: "#3399cc",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  payBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});