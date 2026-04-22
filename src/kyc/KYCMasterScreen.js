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
    Dimensions,
    ActivityIndicator,
  } from "react-native";
  import * as ImagePicker from "expo-image-picker";
  import { Ionicons } from "@expo/vector-icons";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import CONFIG from "../api/config";

  const { width } = Dimensions.get("window");

  const COLORS = {
    primary: "#8f3838", // Maroon
    secondary: "#6ceedf", // Teal
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#1E293B",
    muted: "#64748B",
    border: "#E2E8F0",
  };

  export default function KYCMasterScreen({ navigation }) {
    const steps = ["Details", "Identity", "Selfie", "Review"];
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [kycStatus, setKycStatus] = useState("loading");

    const [form, setForm] = useState({
      fullName: "",
      mobileNumber: "",
      idImage: null,
      selfieImages: [],
    });

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    // --- NEW: Unified Image Handler (Camera + Gallery) ---
    const handleImageSourceSelection = (fieldKey) => {
      Alert.alert(
        "Select Image Source",
        "Choose how you want to upload your photo",
        [
          { text: "Camera", onPress: () => openPicker(fieldKey, "camera") },
          { text: "Gallery", onPress: () => openPicker(fieldKey, "library") },
          { text: "Cancel", style: "cancel" },
        ]
      );
    };

    const openPicker = async (fieldKey, mode) => {
      try {
        // 1. Request appropriate permissions
        if (mode === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") return Alert.alert("Denied", "Camera access is required.");
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") return Alert.alert("Denied", "Gallery access is required.");
        }

        // 2. Launch Picker
        const options = {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.7,
          aspect: fieldKey === "idImage" ? [16, 9] : [1, 1], // Different crop for ID vs Selfie
        };

        const result = mode === "camera" 
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled) return;

        const uri = result.assets[0].uri;
        if (fieldKey === "selfieImages") {
          updateField("selfieImages", [uri]); // Overwriting for simplicity, or spread to keep multiple
        } else {
          updateField(fieldKey, uri);
        }
      } catch (error) {
        Alert.alert("Error", "Could not open camera/gallery.");
      }
    };

  const handleNext = async () => {
    // Step validation
    if (currentStep === 0 && (!form.fullName || !form.mobileNumber)) {
      return Alert.alert("Required", "Please enter your name and mobile number.");
    }

    if (currentStep === 1 && !form.idImage) {
      return Alert.alert("Required", "Please upload your ID.");
    }

    if (currentStep === 2 && form.selfieImages.length === 0) {
      return Alert.alert("Required", "Please take a selfie.");
    }

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // ✅ FINAL STEP → CALL NEW APIs
    try {
      setLoading(true);

      await uploadId();        // upload ID
      await uploadSelfie();    // upload selfie
      await verifyKYC();       // verify

      Alert.alert("Success", "KYC completed 🎉");
      navigation.goBack();

    } catch (err) {
      console.log(err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

    // ✅ Upload ID
  const uploadId = async () => {
    const token = await AsyncStorage.getItem("userToken");

    const formData = new FormData();
    formData.append("idImage", {
      uri: form.idImage,
      name: "id.jpg",
      type: "image/jpeg",
    });

    const res = await fetch(`${CONFIG.BASE_URL}/api/kyc/upload-id`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("ID upload failed");
  };

  // ✅ Upload Selfie
  const uploadSelfie = async () => {
    const token = await AsyncStorage.getItem("userToken");

    const formData = new FormData();
    formData.append("selfieImage", {
      uri: form.selfieImages[0],
      name: "selfie.jpg",
      type: "image/jpeg",
    });

    const res = await fetch(`${CONFIG.BASE_URL}/api/kyc/upload-selfie`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Selfie upload failed");
  };

  // ✅ Verify KYC
  const verifyKYC = async () => {
    const token = await AsyncStorage.getItem("userToken");

    const res = await fetch(`${CONFIG.BASE_URL}/api/kyc/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Verification failed");
  };


    const renderStep = () => {
      switch (currentStep) {
        case 0:
          return (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Full Name (As per Gov ID)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={COLORS.muted}
                value={form.fullName}
                onChangeText={(val) => updateField("fullName", val)}
              />
              <Text style={[styles.label, { marginTop: 20 }]}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 00000 00000"
                placeholderTextColor={COLORS.muted}
                keyboardType="phone-pad"
                value={form.mobileNumber}
                onChangeText={(val) => updateField("mobileNumber", val)}
              />
            </View>
          );
        case 1:
          return (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Government Issued ID</Text>
              <TouchableOpacity style={styles.uploadBox} onPress={() => handleImageSourceSelection("idImage")}>
                {form.idImage ? (
                  <Image source={{ uri: form.idImage }} style={styles.fullPreview} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={48} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Upload or Capture ID</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        case 2:
          return (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Take a Selfie</Text>
              <TouchableOpacity style={[styles.uploadBox, styles.selfieBox]} onPress={() => handleImageSourceSelection("selfieImages")}>
                {form.selfieImages.length > 0 ? (
                  <Image source={{ uri: form.selfieImages[0] }} style={styles.fullPreview} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Capture Selfie</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        case 3:
          return (
            <ScrollView style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Final Review</Text>
              <ReviewItem label="Full Name" value={form.fullName} />
              <ReviewItem label="Mobile" value={form.mobileNumber} />
              <Text style={[styles.reviewLabel, {marginTop: 10}]}>Verified Photos</Text>
              <View style={styles.reviewRow}>
                <View style={styles.miniPreview}>
                    <Text style={styles.miniLabel}>ID</Text>
                    <Image source={{ uri: form.idImage }} style={styles.fullPreview}/>
                </View>
                <View style={styles.miniPreview}>
                    <Text style={styles.miniLabel}>Selfie</Text>
                    <Image source={{ uri: form.selfieImages[0] }} style={styles.fullPreview}/>
                </View>
              </View>
            </ScrollView>
          );
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        {/* Step Progress Bar */}
        <View style={styles.progressHeader}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepIndicator}>
              <View style={[styles.dot, index <= currentStep && styles.activeDot]} />
              <Text style={[styles.stepText, index <= currentStep && styles.activeStepText]}>{step}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={styles.title}>{steps[currentStep]}</Text>
          <Text style={styles.subtitle}>Secure verification for VahanRent users.</Text>
          {renderStep()}
        </ScrollView>

        {/* FIXED FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => currentStep === 0 ? navigation.goBack() : setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleNext} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{currentStep === 3 ? "Submit KYC" : "Continue"}</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Sub-component for Review
  const ReviewItem = ({ label, value }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
    stepIndicator: { alignItems: 'center' },
    dot: { width: 12, height: 4, borderRadius: 2, backgroundColor: COLORS.border, marginBottom: 4 },
    activeDot: { backgroundColor: COLORS.secondary, width: 24 },
    stepText: { fontSize: 10, color: COLORS.muted, fontWeight: '700' },
    activeStepText: { color: COLORS.primary },
    title: { fontSize: 26, fontWeight: "900", color: COLORS.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8 },
    input: { backgroundColor: '#fff', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, color: COLORS.text },
    uploadBox: { height: 200, borderRadius: 24, borderWidth: 2, borderStyle: "dashed", borderColor: COLORS.primary, justifyContent: "center", alignItems: "center", backgroundColor: '#fff', overflow: 'hidden' },
    selfieBox: { height: 280, borderRadius: 140, width: 280, alignSelf: 'center' }, // Rounded for selfie
    uploadText: { marginTop: 12, color: COLORS.primary, fontWeight: '700', fontSize: 14 },
    fullPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    footer: { paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
    btn: { flex: 2, backgroundColor: COLORS.primary, padding: 18, alignItems: "center", borderRadius: 18, elevation: 4 },
    btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    backBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
    backBtnText: { color: COLORS.muted, fontWeight: '700' },
    reviewCard: { padding: 20, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
    reviewTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, color: COLORS.primary },
    reviewItem: { marginBottom: 18 },
    reviewLabel: { fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '800' },
    reviewValue: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginTop: 4 },
    reviewRow: { flexDirection: 'row', gap: 15, marginTop: 15 },
    miniPreview: { flex: 1, height: 120, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f1f1f1' },
    miniLabel: { position: 'absolute', zIndex: 1, bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', paddingHorizontal: 8, borderRadius: 4, fontSize: 10 }
  });