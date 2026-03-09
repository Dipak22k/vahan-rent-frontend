import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CarDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { car } = route.params || {};

  if (!car) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#4B44B9", fontWeight: "600" }}>
          No car data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Car Image */}
      <Image source={car.image} style={styles.carImage} resizeMode="cover" />

      <ScrollView contentContainerStyle={styles.detailsContainer}>
        <Text style={styles.carName}>{car.name}</Text>
        <Text style={styles.price}>₹{car.pricePerDay} / day</Text>

        <View style={styles.specsRow}>
          <Text style={styles.spec}>🚗 Seats: {car.seats}</Text>
          <Text style={styles.spec}>⚙️ {car.transmission}</Text>
        </View>
        <Text style={styles.spec}>⛽ Fuel: {car.fuel}</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.desc}>
          {`The ${car.name} is a comfortable and efficient vehicle designed for both city and long drives. With modern interiors, safety features, and top-tier mileage, it’s a perfect pick for travelers.`}
        </Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => alert("Booking feature coming soon!")}
        >
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFF4F8" },
  backButton: {
    position: "absolute",
    top: 45,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 25,
    padding: 8,
  },
  carImage: {
    width: "100%",
    height: 230,
  },
  detailsContainer: {
    padding: 20,
  },
  carName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  price: {
    fontSize: 18,
    color: "#4B44B9",
    fontWeight: "700",
    marginVertical: 8,
  },
  specsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  spec: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 8,
  },
  desc: {
    color: "#4B5563",
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: "#4B44B9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },
  bookText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF4F8",
  },
});
