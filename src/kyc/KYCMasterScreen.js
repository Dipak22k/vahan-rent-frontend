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

// Constants for your brand colors
const COLORS = {
  primary: "#6366F1", // Indigo
  secondary: "#14B8A6", // Teal
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0"
};

export default function KYCMasterScreen({ navigation }) {
  const steps = ["Basic", "Identity", "Selfie", "Review"];
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    idImage: null,
    selfieImages: [],
  });

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pickImage = async (fieldKey) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera access to verify your identity.");
      return;
    }

    Alert.alert("Upload Document", "Select a source for your photo", [
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

    if (result.canceled) return;

    const uri = result.assets[0].uri;

    if (fieldKey === "selfieImages") {
      if (form.selfieImages.length >= 3) {
        Alert.alert("Limit Reached", "Max 3 selfies allowed for verification.");
        return;
      }
      updateField("selfieImages", [...form.selfieImages, uri]);
    } else {
      updateField(fieldKey, uri);
    }
  };

  const removeSelfie = (index) => {
    const filtered = form.selfieImages.filter((_, i) => i !== index);
    updateField("selfieImages", filtered);
  };

  const submitKYC = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      // Multipart Form Data Construction
      const formData = new FormData();
      
      // Add ID
      formData.append("idImage", {
        uri: form.idImage,
        name: "id_document.jpg",
        type: "image/jpeg",
      });

      // Add Multiple Selfies
      form.selfieImages.forEach((img, i) => {
        formData.append("selfieImages", {
          uri: img,
          name: `selfie_${i}.jpg`,
          type: "image/jpeg",
        });
      });

      // Unified upload endpoint (Recommended for cleaner Backend logic)
      const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.KYC_VERIFY}`, {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.message === "KYC_SUCCESS") {
        Alert.alert("Verification Complete", "Your identity has been verified securely on the blockchain. 🎉");
        navigation.replace("ChatScreen");
      } else {
        Alert.alert("Verification Failed", data.error || "Please try again.");
      }
    } catch (e) {
      Alert.alert("System Error", "Unable to reach verification servers.");
    } finally {
      setLoading(false);
    }
  };

  // UI Components for Steps
  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {steps.map((step, i) => (
        <View key={i} style={styles.stepWrapper}>
          <View style={[styles.stepDot, i <= currentStep && styles.activeStepDot]} />
          <Text style={[styles.stepText, i === currentStep && styles.activeStepText]}>{step}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderStepIndicator()}
      
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {currentStep === 0 && (
          <View>
            <Text style={styles.label}>Full Name (as per ID)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="John Doe" 
              value={form.fullName}
              onChangeText={(val) => updateField("fullName", val)}
            />
          </View>
        )}

        {currentStep === 1 && (
          <View>
            <Text style={styles.title}>Identity Document</Text>
            <Text style={styles.subtitle}>Upload a clear photo of your National ID or Driver's License.</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage("idImage")}>
              {form.idImage ? (
                <Image source={{ uri: form.idImage }} style={styles.fullPreview} />
              ) : (
                <>
                  <Ionicons name="card-outline" size={40} color={COLORS.primary} />
                  <Text style={styles.uploadText}>Tap to upload ID</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            <Text style={styles.title}>Facial Verification</Text>
            <Text style={styles.subtitle}>Take up to 3 selfies from different angles.</Text>
            <View style={styles.selfieGrid}>
              {form.selfieImages.map((img, i) => (
                <View key={i} style={styles.selfieWrapper}>
                  <Image source={{ uri: img }} style={styles.previewCircle} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeSelfie(i)}>
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              {form.selfieImages.length < 3 && (
                <TouchableOpacity style={styles.addSelfieBtn} onPress={() => pickImage("selfieImages")}>
                  <Ionicons name="camera" size={30} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {currentStep === 3 && (
            <View>
                <Text style={styles.title}>Review Details</Text>
                <View style={styles.reviewCard}>
                    <Text style={styles.reviewLabel}>Name: <Text style={{fontWeight: 'normal'}}>{form.fullName}</Text></Text>
                    <Text style={styles.reviewLabel}>Documents: <Text style={{fontWeight: 'normal'}}>{form.idImage ? "ID Attached" : "Missing"}</Text></Text>
                    <Text style={styles.reviewLabel}>Selfies: <Text style={{fontWeight: 'normal'}}>{form.selfieImages.length} uploaded</Text></Text>
                </View>
            </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep(currentStep - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.btn, (currentStep === 0 && !form.fullName) && styles.disabledBtn]} 
          onPress={() => currentStep === 3 ? submitKYC() : setCurrentStep(currentStep + 1)}
          disabled={loading || (currentStep === 0 && !form.fullName)}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{currentStep === 3 ? "Submit Verification" : "Continue"}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  stepContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border, marginBottom: 4 },
  activeStepDot: { backgroundColor: COLORS.secondary, width: 20 },
  stepText: { fontSize: 10, color: COLORS.muted, fontWeight: '600' },
  activeStepText: { color: COLORS.primary },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 24 },
  input: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, fontSize: 16 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  uploadBox: { height: 200, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: COLORS.primary, justifyContent: "center", alignItems: "center", backgroundColor: '#EEF2FF', overflow: 'hidden' },
  fullPreview: { width: '100%', height: '100%' },
  selfieGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  previewCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: COLORS.secondary },
  selfieWrapper: { position: 'relative' },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 12 },
  addSelfieBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWeight: 1, borderColor: COLORS.border },
  footer: { padding: 20, flexDirection: 'row', gap: 10, backgroundColor: '#fff' },
  btn: { flex: 2, backgroundColor: COLORS.primary, padding: 18, alignItems: "center", borderRadius: 14, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  disabledBtn: { backgroundColor: COLORS.muted },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  backBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
  backBtnText: { color: COLORS.muted, fontWeight: '600' },
  reviewCard: { padding: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  reviewLabel: { fontWeight: 'bold', marginBottom: 10, color: COLORS.text }
});