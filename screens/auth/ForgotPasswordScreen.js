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

  import EmailVerificationModal from "./EmailVerificationModal";
  import { sendResetOtp, verifyResetOtp } from "../../src/api/authApi";

  export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [lockedEmail, setLockedEmail] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const normalizeEmail = (value) =>
      value?.trim().toLowerCase();

    const validateEmail = (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    /* ---------------- SEND OTP ---------------- */
    const handleSendOTP = async () => {
      if (loading) return;

      const formattedEmail = normalizeEmail(email);

      if (!formattedEmail || !validateEmail(formattedEmail)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }

      try {
        setLoading(true);

        await sendResetOtp(formattedEmail);

        setLockedEmail(formattedEmail);   // ✅ Lock correct value
        setModalVisible(true);
      } catch (err) {
        console.log("SEND RESET OTP ERROR:", err);

        Alert.alert(
          "Error",
          err.message || "Failed to send OTP. Try again."
        );
      } finally {
        setLoading(false);
      }
    };

    /* ---------------- VERIFY OTP ---------------- */
    const onOtpVerify = async (otpCode) => {
      if (!lockedEmail) {
        Alert.alert("Error", "Email session expired. Please retry.");
        return;
      }

      if (!otpCode) {
        Alert.alert("Invalid OTP", "Please enter the OTP code.");
        return;
      }

      try {
        await verifyResetOtp(lockedEmail, otpCode);

        setModalVisible(false);

        navigation.navigate("ResetPassword", {
          email: lockedEmail,
        });
      } catch (err) {
        console.log("VERIFY RESET OTP ERROR:", err);

        Alert.alert("Error", err.message || "Invalid or expired OTP.");
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <EmailVerificationModal
          visible={isModalVisible}
          email={lockedEmail || email}
          onClose={() => setModalVisible(false)}
          onVerify={onOtpVerify}
        />

        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>

          <Text style={styles.subtitle}>
            Enter your email to receive a password reset code.
          </Text>

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!loading}
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Code</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- STYLES (UNCHANGED UI) ---------------- */
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
    input: {
      backgroundColor: "#f9fafb",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      padding: 12,
      marginBottom: 20,
    },
    button: {
      backgroundColor: "#003580",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  });
