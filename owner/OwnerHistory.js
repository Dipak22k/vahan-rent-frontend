import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated, // 💡 Import core Animated API
  Dimensions,
} from "react-native";
import TopBar from "../src/components/common/TopBar";

const { width } = Dimensions.get('window');
// Calculate width for one tab
const tabWidth = width / 2; 

// MOCK DATA (UNCHANGED)
const MOCK_ACTIVE = [
  {
    id: "1",
    name: "Mahindra Thar",
    renter: "Amit",
    startDate: "2025-10-10",
    endDate: "2025-10-29",
    pricePerDay: 2800,
    image: require("../assets/cars/thar.png"),
    contractId: "0xA1B23C45",
  },
  {
    id: "2",
    name: "Tata Nexon EV",
    renter: "Dipak",
    startDate: "2025-10-20",
    endDate: "2025-10-30",
    pricePerDay: 2500,
    image: require("../assets/cars/nexon.png"),
    contractId: "0xF9E88D12",
  },
];

const MOCK_PAST = [
  {
    id: "3",
    name: "Maruti Swift",
    renter: "Kiran",
    startDate: "2025-09-10",
    endDate: "2025-09-14",
    totalEarned: 3800,
    image: require("../assets/cars/swift.png"),
    contractId: "0xC8F12B76",
  },
  {
    id: "4",
    name: "Kia Seltos",
    renter: "Rahul",
    startDate: "2025-09-15",
    endDate: "2025-09-22",
    totalEarned: 9600,
    image: require("../assets/cars/seltos.png"),
    contractId: "0xE5D93F42",
  },
];


// Reusable Animated Card Component
const AnimatedRentalCard = ({ car, index, type }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered fade-in effect
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            delay: 150 + index * 100, // Staggered delay for list items
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, type]); // Reruns animation when type (tab) changes

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Image source={car.image} style={styles.carImage} resizeMode="cover" />
            <View style={styles.info}>
                <Text style={styles.carName}>{car.name}</Text>
                <Text style={styles.details}>Renter: {car.renter}</Text>
                <Text style={styles.details}>
                    {car.startDate} → {car.endDate}
                </Text>

                {/* Conditional rendering for Active vs. Past */}
                {type === 'active' ? (
                    <>
                        <Text style={styles.price}>
                            <Text style={styles.priceLabel}>Price:</Text> ₹{car.pricePerDay} / day
                        </Text>
                        <Text style={styles.contract}>Contract: {car.contractId}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.messageButton}
                                onPress={() => alert(`Message sent to ${car.renter}`)}
                            >
                                <Text style={styles.actionButtonText}>Message</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.endButton}
                                onPress={() => alert("Contract Ended")}
                            >
                                <Text style={styles.actionButtonText}>End Contract</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.pricePast}>
                           <Text style={styles.priceLabel}>Earned:</Text> ₹{car.totalEarned}
                        </Text>
                        <Text style={styles.contract}>Contract: {car.contractId}</Text>
                        <Text style={styles.statusPast}>Status: Completed</Text>
                    </>
                )}
            </View>
        </Animated.View>
    );
};


export default function OwnerHistory() {
  const [activeTab, setActiveTab] = useState("active"); 
  
  // 💡 Animation Setup for the tab indicator underline
  const indicatorAnim = useRef(new Animated.Value(0)).current; 

  // Function to run the sliding animation
  useEffect(() => {
      Animated.timing(indicatorAnim, {
          toValue: activeTab === 'active' ? 0 : tabWidth, // 0 for 'active', tabWidth for 'past'
          duration: 300,
          useNativeDriver: true,
      }).start();
  }, [activeTab]);


  const renderRentals = (data, type) => {
    if (data.length === 0) {
        return <Text style={styles.noDataText}>No {type} rentals found.</Text>;
    }
    return data.map((car, index) => (
        <AnimatedRentalCard key={car.id} car={car} index={index} type={type} />
    ));
  };


  return (
    <View style={styles.container}>
      <TopBar
        username="Rahul"
        onNotificationPress={() => alert("Notifications Opened")}
        onProfilePress={() => alert("Profile & KYC Verification")}
      />

      {/* 🔝 Enhanced Tab Bar */}
      <View style={styles.tabContainer}>
          <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab("active")}
          >
              <Text
                  style={[styles.tabText, activeTab === "active" && styles.activeTabText]}
              >
                  Active Rentals
              </Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab("past")}
          >
              <Text
                  style={[styles.tabText, activeTab === "past" && styles.activeTabText]}
              >
                  Past Rentals
              </Text>
          </TouchableOpacity>
          
          {/* Animated Indicator Line */}
          <Animated.View 
              style={[
                  styles.tabIndicator, 
                  { transform: [{ translateX: indicatorAnim }] }
              ]}
          />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} key={activeTab}>
        {activeTab === "active" 
            ? renderRentals(MOCK_ACTIVE, 'active') 
            : renderRentals(MOCK_PAST, 'past')}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" }, // Lighter background
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    position: 'relative', // for absolute indicator
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: tabWidth, // Half the screen width
      height: 3,
      backgroundColor: "#4B44B9", // Primary color indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280", // Less prominent when inactive
  },
  activeTabText: {
    color: "#1E3A8A", // Darker when active
  },
  scroll: { padding: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  carImage: { 
    width: 130, // Slightly wider image
    height: 150, // Taller image area to hold more info
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  info: { 
    flex: 1, 
    padding: 15,
  },
  carName: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#111827",
    marginBottom: 2,
  },
  details: { 
    color: "#6B7280", 
    fontSize: 13,
    marginBottom: 3,
  },
  priceLabel: {
      fontWeight: '600',
      color: '#4B5563',
  },
  price: { 
    color: "#4B44B9", 
    fontWeight: "900", 
    fontSize: 16, 
    marginVertical: 4,
  },
  pricePast: { 
    color: "#22C55E", // Green for past earnings
    fontWeight: "900", 
    fontSize: 16, 
    marginVertical: 4,
  },
  contract: { 
    color: "#9CA3AF", 
    fontSize: 11, 
    fontStyle: "italic",
    marginBottom: 5,
  },
  statusPast: { 
    fontSize: 13, 
    marginTop: 3, 
    fontWeight: "700",
    color: '#6B7280',
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  messageButton: {
    backgroundColor: "#00C2A8", // Cyan for messaging
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  endButton: {
    backgroundColor: "#FF5757", // Red for ending contract
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  actionButtonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 13,
  },
  noDataText: {
      textAlign: 'center',
      fontSize: 16,
      color: '#6B7280',
      marginTop: 50,
      padding: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
  }
});