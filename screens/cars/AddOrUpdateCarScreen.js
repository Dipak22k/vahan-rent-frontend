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
  Dimensions,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import CONFIG from "../../src/api/config";

const { width } = Dimensions.get("window");

function Section({ title, children, theme }) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.indicator, { backgroundColor: theme.primary }]} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>
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
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

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
      setBrand(car.brand || "");
      setModel(car.model || "");
      setYear(String(car.year || ""));
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
    formData.append("type", "cars");

    try {
      const res = await fetch(`${CONFIG.BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.imageUrls || [];
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      return [];
    }
  };

  const handleSubmit = async () => {
    if (!title) return Alert.alert("Validation", "Enter car title");
    if (!price) return Alert.alert("Validation", "Enter price");

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return Alert.alert("Error", "User not logged in");

      const uploadedUrls = await uploadImagesToServer();
      const existingImages = images.filter(
        (img) => typeof img === "string" && img.startsWith("http")
      );
      const finalImages = [...existingImages, ...uploadedUrls];

      const endpoint = isUpdate ? CONFIG.ENDPOINTS.UPDATE_CAR : CONFIG.ENDPOINTS.CARS;
      const payload = {
        ...(isUpdate && { carId: car?._id }),
        title,
        brand,
        model,
        year: Number(year),
        price: Number(price),
        fuel,
        transmission,
        kmDriven: Number(kmDriven),
        city,
        description,
        images: finalImages,
      };

      const res = await fetch(`${CONFIG.BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      Alert.alert("Success", isUpdate ? "Car Updated" : "Car Listed");
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard", params: { refresh: true } }],
      });
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: theme.background }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.text }]}>
          {isUpdate ? "Edit Listing" : "List Your Car"}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Section title="General Information" theme={theme}>
          <Input label="Car Title" placeholder="e.g. Tesla Model 3 2023" value={title} setValue={setTitle} theme={theme} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Input label="Brand" placeholder="BMW" value={brand} setValue={setBrand} theme={theme} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Model" placeholder="M4" value={model} setValue={setModel} theme={theme} />
            </View>
          </View>
        </Section>

        <Section title="Photos (Up to 5)" theme={theme}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
            <TouchableOpacity 
              style={[styles.addPhotoBtn, { backgroundColor: theme.background, borderColor: theme.primary + '40' }]} 
              onPress={pickImages}
            >
              <Ionicons name="camera" size={28} color={theme.primary} />
              <Text style={{ fontSize: 10, color: theme.primary, marginTop: 4 }}>Add</Text>
            </TouchableOpacity>

            {images.map((uri, i) => (
              <View key={i} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity 
                    style={styles.removeImg} 
                    onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                >
                    <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </Section>

        <Section title="Pricing & Performance" theme={theme}>
          <Input label="Price Per Day ($)" value={price} setValue={setPrice} theme={theme} keyboard="numeric" placeholder="0.00" />
          <Input label="Kilometers Driven" value={kmDriven} setValue={setKmDriven} theme={theme} keyboard="numeric" placeholder="e.g. 15000" />
        </Section>

        <Section title="Specifications" theme={theme}>
          <Input label="Year" value={year} setValue={setYear} theme={theme} keyboard="numeric" placeholder="2024" />
          <Input label="Fuel Type" value={fuel} setValue={setFuel} theme={theme} placeholder="Petrol, Electric..." />
          <Input label="Transmission" value={transmission} setValue={setTransmission} theme={theme} placeholder="Automatic / Manual" />
          <Input label="Location (City)" value={city} setValue={setCity} theme={theme} placeholder="New York, LA..." />
          <Input 
            label="Description" 
            value={description} 
            setValue={setDescription} 
            theme={theme} 
            multiline 
            placeholder="Tell buyers about the car condition..." 
          />
        </Section>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {isUpdate ? "Save Changes" : "Publish Listing"}
          </Text>
          <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, value, setValue, theme, keyboard, multiline, placeholder }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[styles.label, { color: theme.text + '90' }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={theme.subText + '70'}
        keyboardType={keyboard || "default"}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: theme.background,
            color: theme.text,
            height: multiline ? 100 : 50,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 50 : 20, 
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    elevation: 2,
  },
  heading: { fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
  sectionCard: { 
    marginHorizontal: 20, 
    marginTop: 20, 
    padding: 20, 
    borderRadius: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  indicator: { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  row: { flexDirection: 'row' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: {
    paddingHorizontal: 15,
    borderRadius: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  photoList: { flexDirection: "row", paddingVertical: 5 },
  addPhotoBtn: { 
    width: 85, 
    height: 85, 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginRight: 12
  },
  imageWrapper: { position: 'relative', marginRight: 12 },
  previewImage: { width: 85, height: 85, borderRadius: 20 },
  removeImg: { position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 10 },
  submitButton: { 
    margin: 25, 
    padding: 18, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  submitText: { color: "white", fontSize: 17, fontWeight: "700" },
});
