import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import EmailVerificationModal from "./EmailVerificationModal";
import { sendOtp, verifyOtp, registerUser } from "../../src/api/authApi";

/* ---------------- Role Selector Button ---------------- */
const RoleSelectorButton = ({ role, isSelected, onPress, iconName }) => (
  <TouchableOpacity
    style={[
      styles.roleButton,
      isSelected ? styles.roleButtonSelected : styles.roleButtonUnselected,
    ]}
    onPress={() => onPress(role)}
    activeOpacity={0.8}
  >
    <Ionicons
      name={iconName}
      size={24}
      color={isSelected ? "#003580" : "#6B7280"}
    />

    <Text
      style={[
        styles.roleText,
        isSelected ? styles.roleTextSelected : styles.roleTextUnselected,
      ]}
    >
      {role === "borrower" ? "Borrower" : "Lender"}
    </Text>
  </TouchableOpacity>
);

export default function RegisterScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  /* ---------------- Validators ---------------- */
  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePassword = (value) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/.test(
      value
    );

  /* ---------------- SEND OTP ---------------- */
  const handleVerifyEmailBtn = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address first.");
      return;
    }

    try {
      setIsVerifying(true);
      await sendOtp(email.toLowerCase().trim());
      setModalVisible(true);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const onOtpVerify = async (otpCode) => {
    try {
      await verifyOtp(email.toLowerCase().trim(), otpCode);
      setIsEmailVerified(true);
      setModalVisible(false);

      Alert.alert("Verified ✅", "Your email has been verified!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  /* ---------------- REGISTER ---------------- */
  const handleRegisterPress = async () => {
    if (!userRole || !fullName.trim() || !email.trim() || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (!isEmailVerified) {
      Alert.alert("Verify Email", "Please verify your email first.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters and include a letter, number, and symbol."
      );
      return;
    }

    try {
      const data = await registerUser({
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: userRole, // ✅ borrower / lender
      });

      await AsyncStorage.multiSet([
        ["userToken", data.token],
        ["userData", JSON.stringify(data.user)],
      ]);

      Alert.alert("Success ✅", "Account created successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <EmailVerificationModal
        visible={isModalVisible}
        email={email}
        onClose={() => setModalVisible(false)}
        onVerify={onOtpVerify}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.label}>Select Your Role</Text>
            <View style={styles.roleSelectorContainer}>
              <RoleSelectorButton
                role="borrower"
                iconName="car-outline"
                isSelected={userRole === "borrower"}
                onPress={setUserRole}
              />

              <RoleSelectorButton
                role="lender"
                iconName="business-outline"
                isSelected={userRole === "lender"}
                onPress={setUserRole}
              />
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, { marginBottom: 4 }]}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyEmailBtn}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#003580" />
              ) : (
                <Text style={styles.verifyText}>Verify your email</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Min 6 (Letters, Numbers, Symbols)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegisterPress}
            >
              <Text style={styles.registerText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 25 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 16,
  },
  verifyButton: { alignSelf: "flex-end", marginBottom: 16 },
  verifyText: {
    color: "#003580",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  passwordContainer: { position: "relative" },
  eyeIcon: { position: "absolute", right: 15, top: 12 },
  roleSelectorContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleButtonSelected: {
    borderColor: "#003580",
    backgroundColor: "#f0f4ff",
  },
  roleButtonUnselected: { borderColor: "#e5e7eb" },
  roleText: { marginLeft: 8, fontWeight: "600" },
  roleTextSelected: { color: "#003580" },
  roleTextUnselected: { color: "#6B7280" },
  registerButton: {
    backgroundColor: "#003580",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  registerText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
