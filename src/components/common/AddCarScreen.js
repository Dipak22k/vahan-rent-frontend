import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import TopBar from "./TopBar";

export default function AddCarScreen({ navigation }) {
  const [carData, setCarData] = useState({
    name: "",
    modelYear: "",
    regNumber: "",
    fuelType: "",
    transmission: "",
    seats: "",
    pricePerDay: "",
    description: "",
  });

  const [images, setImages] = useState([]);

  // ✅ Pick image from gallery or camera
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow access to photos to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => ({ uri: asset.uri }));
      setImages([...images, ...selected]);
    }
  };

  // ✅ Handle Save Vehicle
  const handleSaveVehicle = () => {
    if (
      !carData.name ||
      !carData.modelYear ||
      !carData.regNumber ||
      !carData.fuelType ||
      !carData.transmission ||
      !carData.seats ||
      !carData.pricePerDay
    ) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    if (images.length < 3) {
      Alert.alert("Add Images", "Please upload at least 3 images of the car.");
      return;
    }

    console.log("🚘 Car Saved:", { ...carData, images });
    Alert.alert("Success", "Vehicle added successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TopBar
        username="Rahul"
        onNotificationPress={() => navigation.navigate("Notifications")}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.heading}>Add New Vehicle</Text>

        {/* Car Details Inputs */}
        {[
          { key: "name", placeholder: "Car Name (e.g. Hyundai i20)" },
          { key: "modelYear", placeholder: "Model Year (e.g. 2023)" },
          { key: "regNumber", placeholder: "Registration Number (e.g. KA03AB1234)" },
          { key: "fuelType", placeholder: "Fuel Type (Petrol / Diesel / Electric)" },
          { key: "transmission", placeholder: "Transmission (Manual / Automatic)" },
          { key: "seats", placeholder: "Number of Seats (e.g. 5)" },
          { key: "pricePerDay", placeholder: "Price Per Day (₹)" },
        ].map((field) => (
          <TextInput
            key={field.key}
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor="#888"
            value={carData[field.key]}
            onChangeText={(text) => setCarData({ ...carData, [field.key]: text })}
          />
        ))}

        <TextInput
          style={[styles.input, { height: 90 }]}
          placeholder="Car Description..."
          placeholderTextColor="#888"
          multiline
          value={carData.description}
          onChangeText={(text) => setCarData({ ...carData, description: text })}
        />

        {/* Upload Car Images */}
        <View style={styles.uploadSection}>
          <Text style={styles.subHeading}>Upload Car Images (min. 3)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img.uri }} style={styles.uploadedImage} />
            ))}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadText}>+ Add Image</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveVehicle}>
          <Text style={styles.saveText}>Save Vehicle</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFF4F8" },
  form: { padding: 20 },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 15,
    color: "#111827",
  },
  uploadSection: {
    marginTop: 10,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  uploadedImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  uploadButton: {
    width: 100,
    height: 80,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: { color: "#4B44B9", fontWeight: "700" },
  saveButton: {
    backgroundColor: "#4B44B9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
