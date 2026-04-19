import React, { useState } from "react";
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RazorpayCheckout from "react-native-razorpay"; // Standard for RN
import { useTheme } from "../context/ThemeContext";
import { createOrder, verifyPayment } from "../api/paymentApi";
import CONFIG from "../api/config";

const PaymentButton = ({ amount, bookingDetails, onSuccess, onCancel }) => {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create Order on your Backend
      // We pass amount and potentially bookingId for database tracking
      const { order } = await createOrder({
        amount: amount, 
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      });

      // 2. Razorpay Checkout Options
      const options = {
        description: "Vehicle Booking - VahanRent",
        image: "https://your-logo-url.com/logo.png", // Replace with your branding
        currency: order.currency,
        key: CONFIG.RAZORPAY_KEY_ID, 
        amount: order.amount,
        name: "VahanRent",
        order_id: order.id,
        prefill: {
          email: bookingDetails?.email || "user@example.com",
          contact: bookingDetails?.phone || "9999999999",
          name: bookingDetails?.userName || "Guest User",
        },
        theme: { color: theme.primary } // Matches your Indigo/Teal theme
      };

      // 3. Open Razorpay Checkout
      RazorpayCheckout.open(options)
        .then(async (data) => {
          // 4. Verify Payment on Backend
          const result = await verifyPayment({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
          });

          if (result.success) {
            onSuccess(result);
          } else {
            Alert.alert("Verification Failed", "Payment recorded but not verified. Contact support.");
          }
        })
        .catch((error) => {
          console.log(`Error: ${error.code} | ${error.description}`);
          if (onCancel) onCancel();
          Alert.alert("Payment Cancelled", error.description);
        });

    } catch (err) {
      console.error("Init Error:", err);
      Alert.alert("Error", "Could not connect to payment gateway.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: theme.primary },
        isProcessing && styles.disabled
      ]} 
      onPress={handlePayment}
      disabled={isProcessing}
      activeOpacity={0.8}
    >
      {isProcessing ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.content}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.text}>Pay ₹{amount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 10,
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default PaymentButton;