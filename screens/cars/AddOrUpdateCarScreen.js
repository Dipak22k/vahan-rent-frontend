import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import CONFIG from "../../src/api/config";

function Section({ title, children, theme }) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function AddOrUpdateCarScreen() {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();

  const mode = route.params?.mode || "add";
  const car = route.params?.car;
  const isUpdate = mode === "update";

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [kmDriven, setKmDriven] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isUpdate && car) {
      setTitle(car.title || "");
      setPrice(String(car.price || ""));
      setFuel(car.fuel || "");
      setTransmission(car.transmission || "");
      setKmDriven(String(car.kmDriven || ""));
      setCity(car.city || "");
      setDescription(car.description || "");
      setImages(car.images || []);
    }
  }, []);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImgs = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newImgs].slice(0, 5));
    }
  };

  const uploadImagesToServer = async () => {
    const localImages = images.filter((img) => !img.startsWith("http"));

    if (!localImages.length) return [];

    const formData = new FormData();

    localImages.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `car_${Date.now()}_${index}.jpg`,
        type: "image/jpeg",
      });
    });

    const res = await fetch(`${CONFIG.BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.log("UPLOAD ERROR RAW:", text);
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.imageUrls || [];
  };

  const handleSubmit = async () => {
    if (!price) return Alert.alert("Validation", "Enter price");

    try {
      const token = await AsyncStorage.getItem("userToken");

      const uploadedUrls = await uploadImagesToServer();

      const finalImages = [
        ...images.filter((img) => img.startsWith("http")),
        ...uploadedUrls,
      ];

      const endpoint = isUpdate
        ? CONFIG.ENDPOINTS.UPDATE_CAR
        : CONFIG.ENDPOINTS.CARS;

      const payload = {
        ...(isUpdate && { carId: car?._id }),
        title,
        price: Number(price),
        fuel,
        transmission,
        kmDriven: Number(kmDriven),
        city,
        description,
        images: finalImages,
      };

      console.log("SAVE PAYLOAD:", payload);

      const res = await fetch(`${CONFIG.BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("SAVE ERROR RAW:", text);
        throw new Error("Save failed");
      }

      const data = await res.json();

      Alert.alert("Success", isUpdate ? "Car Updated" : "Car Listed");

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });

    } catch (err) {
      console.log("SAVE SCREEN ERROR:", err);
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.heading, { color: theme.text }]}>
            {isUpdate ? "Update Listing" : "List Your Car"}
          </Text>
        </View>

        <Section title="Car Photos" theme={theme}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
              <Ionicons name="camera-outline" size={30} color={theme.primary} />
            </TouchableOpacity>

            {images.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        </Section>

        <Section title="Pricing" theme={theme}>
          <Input label="Price Per Day" value={price} setValue={setPrice} theme={theme} keyboard="numeric" />
        </Section>

        <Section title="Additional Details" theme={theme}>
          <Input label="Fuel Type" value={fuel} setValue={setFuel} theme={theme} />
          <Input label="Transmission" value={transmission} setValue={setTransmission} theme={theme} />
          <Input label="KM Driven" value={kmDriven} setValue={setKmDriven} theme={theme} keyboard="numeric" />
          <Input label="City" value={city} setValue={setCity} theme={theme} />
          <Input label="Description" value={description} setValue={setDescription} theme={theme} />
        </Section>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {isUpdate ? "Save Changes" : "Publish Listing"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, value, setValue, theme, keyboard }) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ color: theme.subText }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType={keyboard || "default"}
        style={{
          backgroundColor: theme.background,
          padding: 10,
          borderRadius: 10,
          color: theme.text,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  heading: { fontSize: 20, fontWeight: "800" },
  sectionCard: { margin: 20, padding: 15, borderRadius: 15 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  addPhotoBtn: { width: 80, height: 80, justifyContent: "center", alignItems: "center" },
  previewImage: { width: 80, height: 80, marginRight: 10 },
  submitButton: { margin: 20, padding: 15, borderRadius: 15 },
  submitText: { color: "white", textAlign: "center", fontWeight: "700" },
});