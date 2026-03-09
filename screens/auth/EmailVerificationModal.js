import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function EmailVerificationModal({
  visible,
  email,
  onClose,
  onVerify,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  /* Reset OTP when modal closes */
  useEffect(() => {
    if (!visible) {
      setOtp(["", "", "", "", "", ""]);
    }
  }, [visible]);

  /* Auto-focus first input */
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputs.current[0]?.focus();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleChange = (text, index) => {
    if (loading) return;

    /* ✅ Handle full OTP paste */
    if (text.length > 1) {
      const digits = text.replace(/\D/g, "").slice(0, 6).split("");

      if (digits.length === 6) {
        setOtp(digits);
        inputs.current[5]?.focus();
      }

      return;
    }

    if (!text) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (!/^\d$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (loading) return;

    if (e.nativeEvent.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }

      if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      return;
    }

    try {
      setLoading(true);
      await onVerify(finalOtp);
    } catch (err) {
      console.log("OTP VERIFY ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to:</Text>

          <Text style={styles.emailText}>{email}</Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}                     // ✅ FIXED
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!loading}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Confirm OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003580",
    marginBottom: 10,
  },
  subtitle: { fontSize: 14, color: "#666" },
  emailText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#003580",
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#f9fafb",
  },
  confirmButton: {
    backgroundColor: "#003580",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: { color: "#6B7280", fontWeight: "600" },
});
