import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView, // 💡 Used ScrollView for flexible layout
  Animated,   // 💡 Import core Animated API
} from "react-native";
import KYCHeader from "../src/components/common/KYCHeader";
import KYCProgressBar from "../src/components/common/KYCProgressBar";

export default function KYCIdentity({ navigation }) {
  const [idNumber, setIdNumber] = useState("");

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
    // Basic check, navigation is unchanged
    if (idNumber.length > 5) {
        navigation.navigate("KYCAddress");
    } else {
        Alert.alert("Invalid ID", "Please enter a valid ID number.");
    }
  };
  // ---------------------------------------------------

  return (
    <View style={styles.container}>
      {/* 🔝 Header is always at the very top */}
      <KYCHeader title="Identity Verification" />
      
      {/* 📝 ScrollView ensures proper content containment */}
      <ScrollView contentContainerStyle={styles.scrollInner}>
        {/* 📈 Progress Bar and Input Area (Animated) */}
        <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
          <KYCProgressBar step={3} totalSteps={5} />
          
          <Text style={styles.title}>Step 3: Confirm Your Legal Identity</Text>
          <Text style={styles.subtitle}>
            Enter your official government-issued ID number.
          </Text>

          <Text style={styles.label}>Enter your ID Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Aadhar / Passport / DL Number"
            placeholderTextColor="#9CA3AF"
            value={idNumber}
            onChangeText={setIdNumber}
            // Added keyboard type for potential numeric input (e.g., Aadhar)
            keyboardType="default" 
            autoCapitalize="characters" // Capitalize for official documents
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("KYCAddress")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue to Address</Text>
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