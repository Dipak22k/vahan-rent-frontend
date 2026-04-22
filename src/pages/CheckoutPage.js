import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Assuming Expo, otherwise use react-native-vector-icons
import PaymentButton from "../components/PaymentButton";
import { useTheme } from "../context/ThemeContext";
import CONFIG from "../api/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CheckoutPage = ({ route, navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const { bookingId, totalAmount, vehicleName } = route.params || { 
    bookingId: "BK-99", 
    totalAmount: 500,
    vehicleName: "Tesla Model 3" 
  };

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
        setOrderData(data);
      } else {
        Alert.alert("Error", "Could not initialize payment.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePayment();
  }, []);

  const handlePaymentSuccess = (details) => {
    navigation.replace("BookingSuccess", { details });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.muted }]}>Securing your session...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Progress Indicator */}
        <View style={styles.stepperContainer}>
           <Step label="Details" completed />
           <View style={[styles.stepLine, { backgroundColor: theme.primary }]} />
           <Step label="Payment" active primaryColor={theme.primary} />
           <View style={[styles.stepLine, { backgroundColor: theme.border }]} />
           <Step label="Confirm" />
        </View>

        {/* Summary Card */}
        <View style={[styles.card, { backgroundColor: theme.card, shadowColor: "#000" }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Booking Summary</Text>
          
          <View style={styles.itemRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="car-outline" size={20} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.itemLabel, { color: theme.muted }]}>Vehicle</Text>
              <Text style={[styles.itemValue, { color: theme.text }]}>{vehicleName || "Standard Sedan"}</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="receipt-outline" size={20} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.itemLabel, { color: theme.muted }]}>Booking Reference</Text>
              <Text style={[styles.itemValue, { color: theme.text }]}>#{bookingId}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Price Breakdown */}
          <View style={styles.priceRow}>
            <Text style={{ color: theme.muted }}>Base Fare</Text>
            <Text style={{ color: theme.text }}>${(totalAmount * 0.9).toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={{ color: theme.muted }}>Taxes & Fees</Text>
            <Text style={{ color: theme.text }}>${(totalAmount * 0.1).toFixed(2)}</Text>
          </View>
          
          <View style={[styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: theme.primary }]}>${totalAmount}</Text>
          </View>
        </View>

        {/* Payment Action */}
        <View style={styles.buttonContainer}>
          <PaymentButton 
            orderData={orderData} 
            onSuccess={handlePaymentSuccess}
            onCancel={() => Alert.alert("Cancelled", "Payment was not completed.")}
          />
          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.secureText}>Guaranteed safe & secure checkout</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for the Stepper
const Step = ({ label, active, completed, primaryColor }) => (
  <View style={styles.stepWrapper}>
    <View style={[
      styles.stepCircle, 
      active && { borderColor: primaryColor, borderWidth: 2 },
      completed && { backgroundColor: primaryColor }
    ]}>
      {completed ? (
        <Ionicons name="checkmark" size={12} color="white" />
      ) : (
        <View style={[styles.innerCircle, active && { backgroundColor: primaryColor }]} />
      )}
    </View>
    <Text style={[styles.stepLabel, active && { color: primaryColor, fontWeight: '700' }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 14, fontWeight: '500' },
  
  // Stepper
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  stepWrapper: { alignItems: 'center', width: 70 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  innerCircle: { width: 8, height: 8, borderRadius: 4 },
  stepLine: { height: 2, width: 40, marginBottom: 15, marginHorizontal: -10 },
  stepLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },

  // Card
  card: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemLabel: { fontSize: 12, marginBottom: 2 },
  itemValue: { fontSize: 15, fontWeight: '600' },
  
  divider: { height: 1, marginVertical: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: '700' },
  totalAmount: { fontSize: 26, fontWeight: '900' },

  // Footer
  buttonContainer: { marginTop: 30 },
  secureBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  secureText: { fontSize: 12, color: '#64748B', marginLeft: 6 }
});

export default CheckoutPage;