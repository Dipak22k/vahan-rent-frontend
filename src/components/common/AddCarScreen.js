import React, { useState } from "react";
import {
  View,
 Text,
 StyleSheet,
 TouchableOpacity,
 TextInput,
 ScrollView,
 Alert,
} from "react-native";
import TopBar from "../../components/common/TopBar";
import { useRole } from "../../context/RoleContext";

export default function AddCar() {
  const { role } = useRole();

  const [form, setForm] = useState({
    carName: "",
    pricePerDay: "",
    fuelType: "",
    transmission: "",
    seats: "",
    insuranceProvider: "",
    policyNumber: "",
    insuranceExpiry: "",
  });

  if (role !== "lender") {
    return (
      <View style={styles.centered}>
        <Text style={styles.deniedText}>
          Only lenders can list vehicles 🚫
        </Text>
      </View>
    );
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const requiredFields = [
      "carName",
      "pricePerDay",
      "fuelType",
      "transmission",
      "seats",
      "insuranceProvider",
      "policyNumber",
      "insuranceExpiry",
    ];

    const missing = requiredFields.find((f) => !form[f]);

    if (missing) {
      Alert.alert("Missing Details", "Please fill all mandatory fields.");
      return;
    }

    Alert.alert("Success ✅", "Vehicle listed successfully (mock).");

    console.log("Vehicle Data:", form);
  };

  return (
    <View style={styles.container}>
      <TopBar username="List New Vehicle" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Add New Vehicle 🚘</Text>

        {/* Vehicle Info */}
        <Input label="Car Name" onChangeText={(v) => handleChange("carName", v)} />
        <Input label="Price Per Day (₹)" keyboardType="numeric" onChangeText={(v) => handleChange("pricePerDay", v)} />
        <Input label="Fuel Type (Petrol/Diesel/Electric)" onChangeText={(v) => handleChange("fuelType", v)} />
        <Input label="Transmission (Manual/Automatic)" onChangeText={(v) => handleChange("transmission", v)} />
        <Input label="Seats" keyboardType="numeric" onChangeText={(v) => handleChange("seats", v)} />

        {/* Insurance Section */}
        <Text style={styles.sectionTitle}>Insurance Details (Mandatory) 🛡️</Text>

        <Input label="Insurance Provider" onChangeText={(v) => handleChange("insuranceProvider", v)} />
        <Input label="Policy Number" onChangeText={(v) => handleChange("policyNumber", v)} />
        <Input label="Insurance Expiry Date" placeholder="YYYY-MM-DD" onChangeText={(v) => handleChange("insuranceExpiry", v)} />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>List Vehicle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* Reusable Input */
const Input = ({ label, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },

  content: { padding: 20 },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 20,
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#4B44B9",
  },

  inputGroup: { marginBottom: 15 },

  label: { marginBottom: 5, fontWeight: "600", color: "#374151" },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  submitButton: {
    marginTop: 30,
    backgroundColor: "#4B44B9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  deniedText: { fontSize: 16, fontWeight: "700", color: "red" },
});
