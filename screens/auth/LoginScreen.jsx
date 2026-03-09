import React, { useState } from "react";
import { loginUser } from "../../src/api/authApi";


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";

import { Ionicons, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRole } from "../../src/context/RoleContext";

export default function LoginScreen({
  navigation,
  setIsLoggedIn,
  setUserData,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setRole } = useRole();

  const normalizeRole = (role) => {
    if (!role) return "";
    return role.toString().trim().toLowerCase();
  };

  const handleRegisterPress = () => {
    navigation.navigate("Register");
  };

  const handleForgotPasswordPress = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleLoginPress = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      const data = await loginUser(email.toLowerCase().trim(), password);

      /* ✅ Defensive Response Validation */
      if (!data?.token || !data?.user) {
        throw new Error("Invalid server response");
      }

      const safeUser = {
        name: data.user?.name || "",
        email: data.user?.email || "",
        role: normalizeRole(data.user?.role),
      };

      await AsyncStorage.multiSet([
        ["userToken", data.token],
        ["userData", JSON.stringify(safeUser)],
      ]);

      setRole(safeUser.role);        // ✅ Always normalized
      setUserData(safeUser);
      setIsLoggedIn(true);
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      Alert.alert(
        "Login Failed",
        error.message || "Something went wrong. Try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

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

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={handleForgotPasswordPress}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialIconBox}>
            <FontAwesome5 name="google" size={20} color="#003580" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialIconBox}>
            <FontAwesome5 name="facebook-f" size={20} color="#003580" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialIconBox}>
            <FontAwesome5 name="linkedin-in" size={20} color="#003580" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialIconBox}>
            <FontAwesome6 name="x-twitter" size={20} color="#003580" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleRegisterPress}>
          <Text style={styles.footerText}>
            New to VahanRent? <Text style={styles.link}>Create an Account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ✅ STYLES UNCHANGED */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#1a1a1a",
  },
  label: { fontSize: 14, fontWeight: "500", color: "#4b5563", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: { position: "relative" },
  eyeIcon: { position: "absolute", right: 15, top: 12 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 20, marginTop: 10 },
  forgotPasswordText: { fontSize: 14, color: "#003580", fontWeight: "600" },
  loginButton: {
    backgroundColor: "#003580",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  loginText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  or: { marginHorizontal: 10, color: "#9ca3af", fontSize: 12 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  socialIconBox: {
    width: "22%",
    aspectRatio: 1.5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  footerText: { textAlign: "center", color: "#6b7280", fontSize: 14 },
  link: { color: "#055cd6", fontWeight: "bold" },
});
