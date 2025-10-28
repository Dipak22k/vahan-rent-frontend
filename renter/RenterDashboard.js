import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated, // 💡 Import core Animated API
} from "react-native";
import TopBar from "../src/components/common/TopBar";
import { useNavigation } from "@react-navigation/native";

const MOCK_CARS = [
  {
    id: "1",
    name: "Hyundai i20",
    pricePerDay: 1200,
    seats: 5,
    fuel: "Petrol",
    transmission: "Manual",
    image: require("../assets/cars/i20.png"),
  },
  {
    id: "2",
    name: "Tata Nexon EV",
    pricePerDay: 2500,
    seats: 5,
    fuel: "Electric",
    transmission: "Automatic",
    image: require("../assets/cars/nexon.png"),
  },
  {
    id: "3",
    name: "Maruti Swift",
    pricePerDay: 950,
    seats: 5,
    fuel: "Petrol",
    transmission: "Manual",
    image: require("../assets/cars/swift.png"),
  },
  {
    id: "4",
    name: "Kia Seltos",
    pricePerDay: 1800,
    seats: 5,
    fuel: "Diesel",
    transmission: "Automatic",
    image: require("../assets/cars/seltos.png"),
  },
  {
    id: "5",
    name: "Mahindra XUV700",
    pricePerDay: 2600,
    seats: 7,
    fuel: "Diesel",
    transmission: "Automatic",
    image: require("../assets/cars/xuv700.png"),
  },
  {
    id: "6",
    name: "Tesla Model 3",
    pricePerDay: 4800,
    seats: 5,
    fuel: "Electric",
    transmission: "Automatic",
    image: require("../assets/cars/tesla.png"),
  },
];

// Reusable Animated Car Card Component
const AnimatedCarCard = ({ car, index, navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered fade-in effect for each card
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: 150 + index * 100, // Staggered delay
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const isElectric = car.fuel === 'Electric';

    return (
        <Animated.View 
            style={[
                styles.carCard,
                { 
                    opacity: fadeAnim, 
                    transform: [{ translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0], // Slide-up effect
                    }) }],
                }
            ]}
        >
            <View style={styles.imageContainer}>
                <Image source={car.image} style={styles.carImage} resizeMode="cover" />
                {isElectric && (
                    <View style={styles.electricBadge}>
                        <Text style={styles.electricText}>EV</Text>
                    </View>
                )}
            </View>

            <View style={styles.carInfo}>
                <Text style={styles.carName}>{car.name}</Text>
                
                <View style={styles.detailsRow}>
                    <Text style={styles.carDetails}>
                        {car.seats} seats · {car.transmission}
                    </Text>
                    <Text style={[styles.carDetails, isElectric && { fontWeight: '700' }]}>
                        {car.fuel}
                    </Text>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.carPrice}>
                        ₹**{car.pricePerDay.toLocaleString('en-IN')}** / day
                    </Text>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => navigation.navigate("CarDetails", { car })}
                    >
                        <Text style={styles.viewButtonText}>Rent Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};


export default function RenterDashboard() {
  const navigation = useNavigation();
  const fadeHeaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in for non-staggered items (Header and Cards)
    Animated.timing(fadeHeaderAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
    }).start();
  }, []);


  return (
    <View style={styles.container}>
      {/* ✅ TopBar */}
      <TopBar
        username="Amit"
        onNotificationPress={() => navigation.navigate("Notifications")}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* ✅ Scrollable Content */}
      <ScrollView contentContainerStyle={styles.content}>
        
        <Animated.View style={[{ opacity: fadeHeaderAnim }]}>
            <Text style={styles.heading}>Your Rental Overview 🗺️</Text>

            {/* Dashboard Cards */}
            <View style={styles.cardGrid}>
                <TouchableOpacity style={[styles.card, styles.cardActive]}>
                    <Text style={styles.cardTitle}>Active Rentals</Text>
                    <Text style={styles.cardNumber}>3</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card}>
                    <Text style={styles.cardTitle}>Pending Requests</Text>
                    <Text style={styles.cardNumber}>1</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card}>
                    <Text style={styles.cardTitle}>Total Spent</Text>
                    <Text style={[styles.cardNumber, styles.spentText]}>₹12,800</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ Search New Car */}
            <TouchableOpacity
                style={styles.searchCarButton}
                onPress={() => navigation.navigate("SearchCars")} 
            >
                <Text style={styles.searchCarText}>+ Start a New Search</Text>
            </TouchableOpacity>
            
            <Text style={[styles.heading, { marginTop: 30, marginBottom: 15 }]}>
                Explore Available Cars
            </Text>
        </Animated.View>

        {/* ✅ Available Cars List (Animated) */}
        {MOCK_CARS.map((car, index) => (
          <AnimatedCarCard 
              key={car.id} 
              car={car} 
              index={index} 
              navigation={navigation} 
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC", // Light background for contrast
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingBottom: 100,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A", // Deep Blue Primary
    marginBottom: 20,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%", // Adjusted for better spacing
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#E5E7EB', // Neutral border for most cards
  },
  cardActive: {
      borderLeftColor: '#2563EB', // Blue accent for active card
  },
  cardTitle: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E3A8A",
    marginTop: 5,
  },
  spentText: {
      fontSize: 22, // Slightly smaller for currency
  },
  searchCarButton: {
    backgroundColor: "#4B44B9", // Primary button color
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  searchCarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  // Cars section
  carCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
      width: 130,
      height: 100,
      position: 'relative',
      backgroundColor: '#F7F7F7', // Light background for image area
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0, // Image itself has no radius, but container does
  },
  electricBadge: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: '#059669', // Green for EV
      borderRadius: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
  },
  electricText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
  },
  carInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  carName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  carDetails: {
    color: "#6B7280",
    fontSize: 13,
  },
  bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 5,
  },
  carPrice: {
    color: "#1E3A8A", // Deep Blue
    fontWeight: "800",
    fontSize: 16,
  },
  viewButton: {
    backgroundColor: "#FFC300", // Gold Accent Button
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  viewButtonText: {
    color: "#1E3A8A", // Deep Blue text on Gold button for contrast
    fontWeight: "800",
    fontSize: 14,
  },
});