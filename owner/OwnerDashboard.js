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

// 🧩 Mock data for Owner’s Active Cars (UNCHANGED)
const ACTIVE_CARS = [
  {
    id: "1",
    name: "Maruti Swift",
    renter: "Dipak Kongari",
    rentPeriod: "Oct 12 - Oct 18, 2025",
    earnings: "₹6,000",
    image: require("../assets/cars/swift.png"),
  },
  {
    id: "2",
    name: "Tata Nexon EV",
    renter: "Amit Sharma",
    rentPeriod: "Oct 20 - Oct 27, 2025",
    earnings: "₹12,000",
    image: require("../assets/cars/nexon.png"),
  },
  {
    id: "3",
    name: "Mahindra Thar",
    renter: "Ravi Kumar",
    rentPeriod: "Oct 22 - Oct 29, 2025",
    earnings: "₹9,500",
    image: require("../assets/cars/thar.png"),
  },
];

// Data for Dashboard Cards, linked to animation logic
const DASHBOARD_CARDS = [
    { title: "Cars Listed", number: "5", delay: 200, style: {} },
    { title: "Active Rentals", number: "3", delay: 350, style: {} },
    { title: "Total Earnings", number: "₹27,500", delay: 500, style: { width: "100%" } },
];

export default function OwnerDashboard() {
  const navigation = useNavigation();
  
  // 💡 Animation Setup: One ref for overall fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🟢 Run the overall fade-in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800, // Smooth overall entry
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  const renderDashboardCard = (item, index) => {
    // Create individual animation value for staggered effect
    const cardAnim = new Animated.Value(0);
    
    // Staggered timing for cards and list items
    Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        delay: item.delay || (index * 150 + 200), // Base delay + staggered
        useNativeDriver: true,
    }).start();

    return (
        <Animated.View 
            key={item.title} 
            style={[
                styles.card, 
                item.style, 
                { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0], // Slight slide-up effect
                }) }] }
            ]}
        >
            <TouchableOpacity style={styles.cardTouch}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardNumber}>{item.number}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
  };


  return (
    <View style={styles.container}>
      {/* ✅ TopBar remains consistent */}
      <TopBar
        username="Rahul"
        onNotificationPress={() => navigation.navigate("Notifications")}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 🌟 Animated Custom Header (Dashboard Title) */}
        <Animated.View style={{ opacity: fadeAnim }}>
           
            <Text style={styles.subHeading}>Overview of your active vehicle rentals.</Text>
        </Animated.View>

        {/* ✅ Dashboard Cards (Animated and Staggered) */}
        <View style={styles.cardGrid}>
            {DASHBOARD_CARDS.map(renderDashboardCard)}
        </View>

        {/* ✅ Section: Active Rentals Title */}
        <Animated.Text style={[styles.heading, styles.sectionTitle, { opacity: fadeAnim }]}>
            Active Rentals
        </Animated.Text>

        {/* ✅ Section: Active Rentals List */}
        {ACTIVE_CARS.map((car, index) => (
            <CarRentalCard key={car.id} car={car} index={index} navigation={navigation} />
        ))}

        {/* ✅ Add Car Button (Animated) */}
        <Animated.View style={[{ opacity: fadeAnim }]}>
            <TouchableOpacity
                style={styles.addCarButton}
                onPress={() => navigation.navigate("AddCar")}
                activeOpacity={0.8}
            >
                <Text style={styles.addCarText}>+ Add New Vehicle</Text>
            </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// 💡 Separating the Card component to easily apply individual animation logic
const CarRentalCard = ({ car, index, navigation }) => {
    // Custom animation for list items (more aggressive stagger)
    const cardAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(cardAnim, {
            toValue: 1,
            duration: 400,
            delay: 700 + (index * 100), // Start after cards, then stagger
            useNativeDriver: true,
        }).start();
    }, [cardAnim]);

    return (
        <Animated.View 
            style={[
                styles.carCard, 
                { opacity: cardAnim, transform: [{ scale: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1], // Slight scale-in effect
                }) }] }
            ]}
        >
            <Image source={car.image} style={styles.carImage} resizeMode="cover" />
            <View style={styles.carInfo}>
                <Text style={styles.carName}>{car.name}</Text>
                <Text style={styles.carRenter}>Rented by: {car.renter}</Text>
                <Text style={styles.carPeriod}>Period: {car.rentPeriod}</Text>
                <Text style={styles.carEarningsLabel}>Expected Earnings:</Text>
                <Text style={styles.carEarnings}>{car.earnings}</Text>
            </View>
            <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate("Contracts", { car })}
            >
                <Text style={styles.viewButtonText}>View Contract</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};


// ---------------- STYLES (Enhanced) ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC", // Lighter background
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  heading: {
    fontSize: 24, // Larger title
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 5,
  },
  subHeading: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 20,
  },
  sectionTitle: {
      fontSize: 20,
      marginTop: 25,
      marginBottom: 15,
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
    borderLeftWidth: 5,
    borderLeftColor: "#4B44B9", // Accent line
    shadowColor: "#4B44B9",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTouch: {
      padding: 5,
  },
  cardTitle: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 13,
  },
  cardNumber: {
    fontSize: 26, // Larger numbers
    fontWeight: "900",
    color: "#4B44B9",
    marginTop: 8,
  },
  carCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'visible', // Essential for shadow to render correctly
  },
  carImage: {
    width: 130, // Slightly wider image area
    height: 120, // Taller image area
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  carInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  carName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  carRenter: {
    color: "#4B5563",
    fontSize: 14,
    marginTop: 3,
  },
  carPeriod: {
    color: "#6B7280",
    fontSize: 12,
  },
  carEarningsLabel: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  carEarnings: {
    color: "#22C55E", // Green for earnings
    fontWeight: "900",
    fontSize: 17,
  },
  viewButton: {
    position: 'absolute', // Absolute positioning for button
    bottom: 15,
    right: 15,
    backgroundColor: "#4B44B9",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#4B44B9",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  addCarButton: {
    backgroundColor: "#4B44B9",
    borderRadius: 12, // Rounded corners
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  addCarText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});