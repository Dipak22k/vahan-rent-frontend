import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation, setIsLoggedIn, setUserData }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🟢 Navigate to Register
  const handleRegisterPress = () => {
    if (navigation && typeof navigation.navigate === "function") {
      navigation.navigate("Register");
    } else {
      console.warn("Navigation not available");
    }
  };

  // 🟢 Handle Login (check stored users)
  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      // Fetch all registered users
      const storedUsers = await AsyncStorage.getItem("registeredUsers");
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Find matching user
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Save active user
        await AsyncStorage.setItem("userData", JSON.stringify(foundUser));
        setUserData(foundUser);
        setIsLoggedIn(true);
        Alert.alert("Welcome", `Hello ${foundUser.name}!`);
      } else {
        Alert.alert("Invalid Credentials", "Email or password is incorrect.");
      }
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert("Error", "Something went wrong while logging in.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>

        {/* Email Field */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Password Field */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { marginBottom: 0, paddingRight: 50 }]}
            placeholder="Enter your password"
            placeholderTextColor="#999"
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
              size={22}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={handleLoginPress}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#fff" />
          <Text style={styles.loginText}> Login Securely</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* Social Buttons (Optional) */}
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <Ionicons name="logo-google" size={20} color="#E03F34" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <Ionicons name="wallet-outline" size={20} color="#4B44B9" />
          <Text style={styles.socialText}>Connect Crypto Wallet</Text>
        </TouchableOpacity>

        {/* Register Redirect */}
        <TouchableOpacity onPress={handleRegisterPress}>
          <Text style={styles.footerText}>
            New to VahanRent? <Text style={styles.link}>Create an Account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF4F8",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 25,
    borderRadius: 15,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 35,
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    fontWeight: "500",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B44B9",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
    padding: 5,
  },
  loginButton: {
    backgroundColor: "#4B44B9",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  or: {
    marginHorizontal: 15,
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 13,
  },
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
  socialText: {
    color: "#374151",
    fontWeight: "600",
    marginLeft: 10,
    fontSize: 15,
  },
  footerText: {
    textAlign: "center",
    marginTop: 35,
    color: "#6B7280",
    fontSize: 14,
  },
  link: {
    color: "#1DA58B",
    fontWeight: "800",
  },
});
