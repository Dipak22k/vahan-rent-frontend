import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView, // 💡 Changed View to ScrollView for inner content
  Animated, // 💡 Import core Animated API
} from "react-native";
import KYCHeader from "../src/components/common/KYCHeader";
import KYCProgressBar from "../src/components/common/KYCProgressBar";

export default function KYCPhone({ navigation }) {
  const [phone, setPhone] = useState("");

  // 💡 Animation Setup
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🟢 Run the animation on component mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600, // Smooth fade-in
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // ---------------- Logic (Unchanged) ----------------
  const handleNext = () => {
    if (phone.length < 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit number.");
      return;
    }

    // ✅ Notify user, then navigate to the next KYC step (Identity)
    Alert.alert("OTP Sent", "A 6-digit OTP has been sent to your mobile number.", [
      {
        text: "OK",
        onPress: () => navigation.push("KYCIdentity"),
      },
    ]);
  };
  // ---------------------------------------------------

  return (
    <View style={styles.container}>
      {/* 🔝 Header is always at the very top */}
      <KYCHeader title="Phone Verification" />
      
      {/* 📝 ScrollView ensures proper content containment */}
      <ScrollView contentContainerStyle={styles.scrollInner}>
        {/* 📈 Progress Bar and Input Area (Animated) */}
        <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
          <KYCProgressBar step={2} totalSteps={5} />
          
          <Text style={styles.title}>Step 2: Secure Your Account</Text>
          <Text style={styles.subtitle}>
            We'll send a one-time password (OTP) to verify ownership.
          </Text>

          <Text style={styles.label}>Enter your 10-digit phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

// ---------------- STYLES (Enhanced) ----------------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7F9FC", // Light background
  },
  scrollInner: { 
    flexGrow: 1, 
    padding: 25, 
  },
  contentArea: {
    // Card styling for the main content block
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E3A8A",
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 25,
    marginTop: 8,
    textAlign: 'center',
  },
  label: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#374151", 
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB", // Light input background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#111827",
    marginBottom: 35,
    // Small shadow/lift on the input
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  button: {
    backgroundColor: "#4B44B9", // Primary action color
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    // Added shadow for a prominent action button
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "800", 
    fontSize: 17,
    letterSpacing: 0.5,
  },
});