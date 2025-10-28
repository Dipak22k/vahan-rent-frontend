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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Added

// ✅ Reusable Role Button Component (unchanged)
const RoleSelectorButton = ({ role, isSelected, onPress, iconName }) => {
  return (
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
        size={28}
        color={isSelected ? "#4B44B9" : "#6B7280"}
      />
      <Text
        style={[
          styles.roleText,
          isSelected ? styles.roleTextSelected : styles.roleTextUnselected,
        ]}
      >
        {role}
      </Text>
    </TouchableOpacity>
  );
};

// ✅ Main Component
export default function RegisterScreen({ navigation, setUserRole }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userRole, setLocalRole] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Go back to login
  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  // ✅ Handle Create Account (with AsyncStorage)
  const handleRegisterPress = async () => {
    if (!userRole) {
      Alert.alert("Missing Role", "Please select your role (Owner or Renter)");
      return;
    }
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      const newUser = { name: fullName, email, password, role: userRole };

      // Get old users
      const storedUsers = await AsyncStorage.getItem("registeredUsers");
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if user already exists
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        Alert.alert("Already Registered", "This email is already in use.");
        return;
      }

      // Save new user
      users.push(newUser);
      await AsyncStorage.setItem("registeredUsers", JSON.stringify(users));

      Alert.alert(
        "Registration Successful 🎉",
        "Your account has been created successfully!",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      console.log("Registration error:", error);
      Alert.alert("Error", "Something went wrong while registering.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Your VahanRent Account</Text>

            {/* Role Selector */}
            <Text style={styles.label}>Select Your Role</Text>
            <View style={styles.roleSelectorContainer}>
              <RoleSelectorButton
                role="Renter"
                isSelected={userRole === "Renter"}
                onPress={setLocalRole}
                iconName="car-outline"
              />
              <RoleSelectorButton
                role="Owner"
                isSelected={userRole === "Owner"}
                onPress={setLocalRole}
                iconName="business-outline"
              />
            </View>

            {/* Full Name */}
            <Text style={[styles.label, { marginTop: 20 }]}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { marginBottom: 0, paddingRight: 50 }]}
                placeholder="Create your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={[styles.label, { marginTop: 20 }]}>
              Confirm Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { marginBottom: 0, paddingRight: 50 }]}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirm(!showConfirm)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirm ? "eye-off" : "eye"}
                  size={22}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            {/* ✅ Create Account Button */}
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.8}
              onPress={handleRegisterPress}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              <Text style={styles.registerText}> Create Account Securely</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>OR</Text>
              <View style={styles.line} />
            </View>

            {/* Social Buttons */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="logo-google" size={20} color="#E03F34" />
              <Text style={styles.socialText}>Sign up with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
              <Ionicons name="wallet-outline" size={20} color="#4B44B9" />
              <Text style={styles.socialText}>Sign up with Wallet</Text>
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.link}>Login here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ----------------- Styles (UNCHANGED) -----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF4F8",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 25,
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 25,
    color: "#1E3A8A",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    marginBottom: 18,
    fontWeight: "500",
  },
  passwordContainer: { position: "relative" },
  eyeIcon: { position: "absolute", right: 15, top: 14, padding: 5 },
  roleSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  roleButtonUnselected: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F7F8FA",
  },
  roleButtonSelected: {
    borderColor: "#4B44B9",
    backgroundColor: "#E6E7F8",
  },
  roleText: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "600",
  },
  roleTextUnselected: { color: "#6B7280" },
  roleTextSelected: { color: "#4B44B9" },
  registerButton: {
    backgroundColor: "#4B44B9",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 25,
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  registerText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  or: { marginHorizontal: 15, color: "#9CA3AF", fontWeight: "600", fontSize: 13 },
  socialButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  socialText: { color: "#374151", fontWeight: "600", marginLeft: 10, fontSize: 15 },
  footerText: { textAlign: "center", marginTop: 30, color: "#6B7280", fontSize: 14 },
  link: { color: "#1DA58B", fontWeight: "800" },
});
