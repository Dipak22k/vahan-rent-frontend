import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import TopBar from "./TopBar";
const MOCK_CARS = [
  {
    id: "1",
    name: "Hyundai i20",
    pricePerDay: 1200,
    seats: 5,
    fuel: "Petrol",
    image: require("../../../assets/cars/i20.png"),
  },
  {
    id: "2",
    name: "Tata Nexon EV",
    pricePerDay: 2500,
    seats: 5,
    fuel: "Electric",
    image: require("../../../assets/cars/nexon.png"),
  },
  {
    id: "3",
    name: "Maruti Swift",
    pricePerDay: 950,
    seats: 5,
    fuel: "Petrol",
    image: require("../../../assets/cars/swift.png"),
  },
  {
    id: "4",
    name: "Mahindra Thar",
    pricePerDay: 3000,
    seats: 4,
    fuel: "Diesel",
    image: require("../../../assets/cars/xuv700.png"),
  },
  {
    id: "5",
    name: "Kia Seltos",
    pricePerDay: 1800,
    seats: 5,
    fuel: "Petrol",
    image: require("../../../assets/cars/seltos.png"),
  },
];

export default function SearchCars({ navigation }) {
  const [query, setQuery] = useState("");

  // 🔍 Filter cars by name or fuel type
  const filteredCars = MOCK_CARS.filter(
    (car) =>
      car.name.toLowerCase().includes(query.toLowerCase()) ||
      car.fuel.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TopBar
        onNotificationPress={() => navigation.navigate("Notifications")}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cars by name or fuel type..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredCars.length === 0 ? (
          <Text style={styles.noResults}>No cars found. Try another search!</Text>
        ) : (
          filteredCars.map((car) => (
            <View key={car.id} style={styles.carCard}>
              <Image source={car.image} style={styles.carImage} />
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{car.name}</Text>
                <Text style={styles.carDetails}>
                  {car.seats} seats · {car.fuel}
                </Text>
                <Text style={styles.carPrice}>₹{car.pricePerDay} / day</Text>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => navigation.navigate("CarDetails", { car })}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFF4F8" },
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  searchInput: {
    backgroundColor: "#F7F8FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#111827",
  },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 15 },
  noResults: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 50,
    fontSize: 16,
  },
  carCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  carImage: { width: 120, height: 90 },
  carInfo: { flex: 1, padding: 12 },
  carName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  carDetails: { color: "#6B7280", marginVertical: 3 },
  carPrice: { color: "#4B44B9", fontWeight: "800", marginBottom: 6 },
  viewButton: {
    backgroundColor: "#4B44B9",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  viewButtonText: { color: "#fff", fontWeight: "700" },
});
