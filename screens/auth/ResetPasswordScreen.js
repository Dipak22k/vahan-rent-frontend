import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "../../src/api/authApi";

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizeEmail = (value) =>
    value?.toLowerCase().trim();

  const validatePassword = (value) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/.test(
      value
    );

  const handleSavePassword = async () => {
    if (loading) return;

    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirm) {
      Alert.alert("Missing Fields", "Please fill both password fields.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (!validatePassword(trimmedPassword)) {
      Alert.alert(
        "Weak Password",
        "Must be at least 6 chars with a letter, number, and symbol."
      );
      return;
    }

    try {
      setLoading(true);

      await resetPassword(normalizeEmail(email), trimmedPassword);

      Alert.alert(
        "Success 🎉",
        "Password updated! Please login with your new password.",
        [{ text: "Login", onPress: () => navigation.replace("Login") }]
      );
    } catch (err) {
      console.log("RESET PASSWORD ERROR:", err);

      Alert.alert(
        "Error",
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>New Password</Text>

        {/* ✅ Safe Text Rendering */}
        <Text style={styles.subtitle}>
          Set a strong password for{" "}
          <Text style={{ fontWeight: "bold" }}>{email}</Text>
        </Text>

        <Text style={styles.label}>New Password</Text>

        <View style={styles.passWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPass}
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.eye}
            onPress={() => setShowPass(!showPass)}
            disabled={loading}
          >
            <Ionicons
              name={showPass ? "eye-off" : "eye"}
              size={20}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>

        <TextInput
          style={styles.input}
          secureTextEntry={!showPass}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003580",
    marginBottom: 10,
  },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  passWrapper: { position: "relative" },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 16,
  },
  eye: { position: "absolute", right: 15, top: 12 },
  saveButton: {
    backgroundColor: "#003580",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
