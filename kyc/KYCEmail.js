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

export default function KYCEmail({ navigation }) {
  const [email, setEmail] = useState("");

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
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    Alert.alert("Verification Sent", "A verification link was sent to your email.", [
      {
        text: "OK",
        onPress: () => navigation.push("KYCPhone"), // ✅ push ensures next screen loads in same stack
      },
    ]);
  };
  // ---------------------------------------------------

  return (
    <View style={styles.container}>
      {/* 🔝 Header is now always at the very top of the screen */}
      <KYCHeader title="Email Verification" />
      
      {/* 📝 Inner content is wrapped in a ScrollView to prevent "overhead" issues 
          and make sure all elements are accessible if the screen is smaller. */}
      <ScrollView contentContainerStyle={styles.scrollInner}>
        {/* 📈 Progress Bar and Input Area (Animated) */}
        <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
          <KYCProgressBar step={1} totalSteps={5} />
          
          <Text style={styles.title}>Step 1: Verify Your Email</Text>

          <Text style={styles.label}>Enter your registered email address</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleNext}
            activeOpacity={0.8} // Added for better press feedback
          >
            <Text style={styles.buttonText}>Send Verification Link</Text>
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
    backgroundColor: "#F7F9FC", // Lighter, cleaner background
  },
  scrollInner: { 
    flexGrow: 1, 
    padding: 25, 
  },
  contentArea: {
    // Area for the animated content
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
    marginBottom: 25,
    textAlign: 'center',
  },
  label: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#374151", 
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB", // Very light input background
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