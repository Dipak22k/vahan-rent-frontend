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

export default function KYCMasterScreen({ navigation }) {
  const steps = ["Basic", "Identity", "Selfie", "Review"];
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => setForm({ ...form, [key]: value });

  const pickImage = async (fieldKey) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera access to proceed.");
      return;
    }

    Alert.alert("Upload Document", "Choose source", [
      { text: "Camera", onPress: () => openImageSource(fieldKey, "camera") },
      { text: "Gallery", onPress: () => openImageSource(fieldKey, "gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openImageSource = async (fieldKey, type) => {
    const options = { allowsEditing: true, quality: 0.7, aspect: [4, 3] };
    const result = type === "camera" 
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) updateField(fieldKey, result.assets[0].uri);
  };

  const submitKYC = async () => {
  setLoading(true);

  try {
    const token = await AsyncStorage.getItem("userToken");

    // STEP 1: Upload ID
    const idData = new FormData();
    idData.append("idImage", {
      uri: form.idImage,
      name: "id.jpg",
      type: "image/jpeg",
    });

    await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.KYC_UPLOAD_ID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: idData,
    });

    // STEP 2: Upload Selfie
    const selfieData = new FormData();
    selfieData.append("selfieImage", {
      uri: form.selfieImage,
      name: "selfie.jpg",
      type: "image/jpeg",
    });

    await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.KYC_UPLOAD_SELFIE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: selfieData,
    });

    // STEP 3: VERIFY KYC (🔥 IMPORTANT)
    const verifyRes = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.KYC_VERIFY}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await verifyRes.text();
console.log("VERIFY RESPONSE RAW:", text);

let verifyData;
try {
  verifyData = JSON.parse(text);
} catch (e) {
  console.log("NOT JSON RESPONSE ❌");
  throw new Error("Server not returning JSON");
}

    // 🔥 HANDLE RESPONSE
    if (verifyData.message === "KYC_SUCCESS") {
      // ✅ Update userData
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));
      userData.kyc = verifyData.kyc;

      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      // ✅ Notification
      await addNotification("KYC verified successfully ✅");

      Alert.alert("Success", "KYC Verified 🎉");

    } else {
      await addNotification("KYC failed ❌ Please try again");
      Alert.alert("Failed", "Face not matched");
    }

  } catch (err) {
    console.log(err);
    Alert.alert("Error", "KYC process failed");
  } finally {
    setLoading(false);
  }
};
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else submitKYC();
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // --- UI Components ---

  const StepIndicator = () => (
    <View style={styles.indicatorContainer}>
      {steps.map((s, i) => (
        <View key={i} style={styles.stepWrapper}>
          <View style={[styles.dot, i <= currentStep && styles.activeDot]}>
            {i < currentStep ? (
              <Ionicons name="checkmark" size={12} color="white" />
            ) : (
              <Text style={[styles.dotText, i <= currentStep && styles.activeDotText]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, i === currentStep && styles.activeLabel]}>{s}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} disabled={currentStep === 0}>
          <Ionicons name="arrow-back" size={24} color={currentStep === 0 ? "#CBD5E1" : "#1E293B"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <StepIndicator />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentStep === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Basic Information</Text>
            <Text style={styles.subtitle}>Please enter your legal name as it appears on your ID.</Text>
            <Input label="Full Name" icon="person-outline" placeholder="John Doe" value={form.fullName} onChange={(v) => updateField("fullName", v)} />
            <Input label="Phone Number" icon="call-outline" placeholder="+1 234 567 890" keyboardType="phone-pad" value={form.phone} onChange={(v) => updateField("phone", v)} />
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Identity Document</Text>
            <Text style={styles.subtitle}>Upload a clear photo of your Government ID or Passport.</Text>
            <UploadBox image={form.idImage} onPress={() => pickImage("idImage")} title="National ID Card" />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Selfie Check</Text>
            <Text style={styles.subtitle}>Make sure your face is well-lit and clearly visible.</Text>
            <UploadBox image={form.selfieImage} onPress={() => pickImage("selfieImage")} title="Take a Selfie" isCircle />
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Review</Text>
            <Text style={styles.subtitle}>Double check your details before submitting.</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewText}>**Name:** {form.fullName || "Not provided"}</Text>
              <Text style={styles.reviewText}>**Phone:** {form.phone || "Not provided"}</Text>
              <Text style={styles.reviewText}>**Documents:** Ready ✅</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.mainBtn, loading && { opacity: 0.7 }]} 
          onPress={nextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.mainBtnText}>
              {currentStep === steps.length - 1 ? "Submit Verification" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Input = ({ label, icon, ...props }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputField}>
      <Ionicons name={icon} size={20} color="#64748B" style={{ marginRight: 10 }} />
     <TextInput
  style={{ flex: 1, height: 40 }}
  placeholderTextColor="#94A3B8"
  {...props}
  onChangeText={props.onChange}
/>
    </View>
  </View>
);

const UploadBox = ({ image, onPress, title, isCircle }) => (
  <TouchableOpacity 
    style={[styles.uploadBox, isCircle && { borderRadius: 100, width: 200, height: 200, alignSelf: 'center' }]} 
    onPress={onPress}
  >
    {image ? (
      <Image source={{ uri: image }} style={[styles.preview, isCircle && { borderRadius: 100 }]} />
    ) : (
      <View style={{ alignItems: 'center' }}>
        <View style={styles.iconCircle}>
          <Ionicons name="camera" size={32} color="#6366F1" />
        </View>
        <Text style={styles.uploadText}>{title}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  scrollContent: { padding: 24 },
  indicatorContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginBottom: 20 },
  stepWrapper: { alignItems: 'center' },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  activeDot: { backgroundColor: '#6366F1' },
  dotText: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  activeDotText: { color: 'white' },
  stepLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  activeLabel: { color: '#6366F1' },
  stepContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 30, lineHeight: 22 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  inputField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10 },
  uploadBox: { height: 180, backgroundColor: '#F8FAFC', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadText: { fontSize: 14, fontWeight: '600', color: '#6366F1' },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  reviewCard: { padding: 20, backgroundColor: '#F1F5F9', borderRadius: 12 },
  reviewText: { fontSize: 16, color: '#334155', marginBottom: 10 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  mainBtn: { backgroundColor: "#6366F1", paddingVertical: 16, borderRadius: 14, alignItems: "center", shadowColor: "#6366F1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  mainBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});