import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  ScrollView 
} from "react-native";
import PaymentButton from "../components/PaymentButton";
import { useTheme } from "../context/ThemeContext";
import CONFIG from "../api/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CheckoutPage = ({ route, navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Example: Getting vehicle/booking details from route params
  const { bookingId, totalAmount } = route.params || { bookingId: "BK-99", totalAmount: 500 };

  // 1. Initialize the payment on the backend when the page loads
  const initializePayment = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${CONFIG.BASE_URL}/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, amount: totalAmount }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderData(data); // Contains transactionId, clientSecret, etc.
      } else {
        Alert.alert("Error", "Could not initialize payment.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePayment();
  }, []);

  // 2. Handle the completion logic
  const handlePaymentSuccess = (details) => {
    Alert.alert("Success", "Booking confirmed! 🎉");
    navigation.replace("BookingSuccess", { details });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.muted, marginTop: 10 }}>Preparing Secure Checkout...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Order Summary</Text>
        
        <View style={styles.row}>
          <Text style={{ color: theme.muted }}>Booking ID:</Text>
          <Text style={{ color: theme.text, fontWeight: "bold" }}>#{bookingId}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
          <Text style={[styles.totalAmount, { color: theme.primary }]}>${totalAmount}</Text>
        </View>

        {/* 
            Pass the orderData from the backend to the button.
            The button will handle the gateway (Stripe/Razorpay) UI.
        */}
        <PaymentButton 
          orderData={orderData} 
          onSuccess={handlePaymentSuccess}
          onCancel={() => Alert.alert("Cancelled", "Payment was not completed.")}
        />
        
        <Text style={styles.secureText}>
          🔒 Secure 256-bit SSL Encrypted Payment
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, elevation: 2 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 15 },
  totalLabel: { fontSize: 18, fontWeight: "700" },
  totalAmount: { fontSize: 22, fontWeight: "800" },
  secureText: { textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 20 }
});

export default CheckoutPage;