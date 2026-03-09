import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import KYCHeader from "../../src/kyc/KYCHeader";

export default function KYCMasterScreen({ route, navigation }) {
  const { userRole } = route.params || { userRole: "borrower" };

  const borrowerSteps = ["Basic", "Identity", "License", "Selfie", "Contact"];
  const lenderSteps = ["Basic", "Identity", "RC", "Insurance", "Photos", "Bank"];
  const steps = userRole === "borrower" ? borrowerSteps : lenderSteps;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});

  const updateField = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const pickImage = async (fieldKey) => {
    Alert.alert("Upload Document", "Choose source", [
      { text: "Camera", onPress: () => openCamera(fieldKey) },
      { text: "Gallery", onPress: () => openGallery(fieldKey) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async (fieldKey) => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) updateField(fieldKey, result.assets[0].uri);
  };

  const openGallery = async (fieldKey) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) updateField(fieldKey, result.assets[0].uri);
  };

  /* 🔥 UPDATED FUNCTION */
  const nextStep = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        const user = JSON.parse(storedUser);

        await fetch(
          `http://10.52.141.172:5000/api/user/submit-kyc/${user._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        Alert.alert(
          "Success",
          "KYC Submitted for Review ✅",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Dashboard"),
            },
          ]
        );
      } catch (error) {
        console.log("KYC Submit Error:", error);
        Alert.alert("Error", "Something went wrong.");
      }
    }
  };

  const renderContent = () => {
    if (step === 0)
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Let's start with basics</Text>
          <Input label="Full Name" placeholder="John Doe" onChange={(v) => updateField("fullName", v)} />
          <Input label="Phone Number" placeholder="+91..." keyboardType="phone-pad" onChange={(v) => updateField("phone", v)} />
        </View>
      );

    if (step === 1)
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Identity Verification</Text>
          <Input label="ID Type" placeholder="Aadhaar / Passport" onChange={(v) => updateField("idType", v)} />
          <UploadBox label="Front Side of ID" image={form.idImage} onPress={() => pickImage("idImage")} />
        </View>
      );

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{steps[step]}</Text>
        <Text style={styles.stepSub}>Please provide required details</Text>
        <UploadBox label={`Upload ${steps[step]}`} image={form.genericImage} onPress={() => pickImage("genericImage")} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <KYCHeader title={`${steps[step]} Verification`} />

        <View style={styles.progressContainer}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderContent()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.mainBtn,
              { backgroundColor: step === steps.length - 1 ? "#10B981" : "#4F46E5" },
            ]}
            onPress={nextStep}
          >
            <Text style={styles.mainBtnText}>
              {step === steps.length - 1 ? "Finish Application" : "Continue"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* SMALL COMPONENTS */

const Input = ({ label, placeholder, onChange, keyboardType }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      onChangeText={onChange}
      keyboardType={keyboardType}
    />
  </View>
);

const UploadBox = ({ label, image, onPress }) => (
  <TouchableOpacity
    style={[styles.uploadBox, image && styles.uploadBoxActive]}
    onPress={onPress}
  >
    {image ? (
      <Image source={{ uri: image }} style={styles.preview} />
    ) : (
      <>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-upload-outline" size={28} color="#4F46E5" />
        </View>
        <Text style={styles.uploadText}>{label}</Text>
        <Text style={styles.uploadSubtext}>JPG or PNG</Text>
      </>
    )}
  </TouchableOpacity>
);

/* STYLES (UNCHANGED) */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  progressContainer: { flexDirection: "row", paddingHorizontal: 24, marginTop: 10 },
  progressDot: { height: 4, flex: 1, marginHorizontal: 2, borderRadius: 2 },
  activeDot: { backgroundColor: "#4F46E5" },
  inactiveDot: { backgroundColor: "#E5E7EB" },
  scrollContent: { padding: 24 },
  stepContainer: {},
  stepTitle: { fontSize: 24, fontWeight: "800", marginBottom: 10 },
  stepSub: { color: "#6B7280", marginBottom: 20 },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16, fontSize: 16 },
  uploadBox: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFBFF",
    overflow: "hidden",
  },
  uploadBoxActive: { borderStyle: "solid", borderColor: "#4F46E5" },
  preview: { width: "100%", height: "100%" },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadText: { fontSize: 15, fontWeight: "600" },
  uploadSubtext: { fontSize: 12, color: "#9CA3AF" },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  mainBtn: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mainBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
});