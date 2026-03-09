import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import CONFIG from "../../src/api/config";

const { width } = Dimensions.get("window");

export default function CarDetailsScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { car } = route.params;

  const [user, setUser] = useState(null);
  const [lender, setLender] = useState(null);
  const [isLoadingLender, setIsLoadingLender] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    fetchLender();
  }, [car?.lenderId]);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userData");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.log("USER LOAD ERROR:", err);
    }
  };

  const fetchLender = async () => {
    if (!car?.lenderId) {
      setIsLoadingLender(false);
      return;
    }

    try {
      const res = await fetch(
        `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.USERS}/${car.lenderId}`
      );

      const data = await res.json();

      if (res.ok) {
        const lenderProfile = data.user || data.data || data;
        setLender(lenderProfile);
      }
    } catch (err) {
      console.log("LENDER FETCH ERROR:", err);
    } finally {
      setIsLoadingLender(false);
    }
  };

  const isLender = user?.role === "lender";

  const handlePrimaryAction = () => {
    if (!user) return;

    if (isLender) {
      navigation.navigate("AddOrUpdateCar", { mode: "update", car });
    } else {
      navigation.navigate("Chat", {
        car,
        lenderId: car.lenderId,
      });
    }
  };

  const handleViewProfile = () => {
    if (!lender) return;
    navigation.navigate("UserProfile", { userId: lender._id });
  };

  /* ================= FIXED IMAGE HANDLING ================= */

  const renderCarImage = () => {
    if (Array.isArray(car.images) && car.images.length > 0) {
      return (
        <Image
          source={{ uri: car.images[0] }}
          style={styles.image}
          onError={(e) =>
            console.log("IMAGE LOAD ERROR:", e.nativeEvent.error)
          }
        />
      );
    }

    return (
      <View style={[styles.image, styles.fallback]}>
        <Ionicons name="car-outline" size={80} color="#94A3B8" />
      </View>
    );
  };

  const getAvatarUri = () => {
    if (lender?.avatar && typeof lender.avatar === "string") {
      return lender.avatar;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      lender?.name || "User"
    )}&background=random&size=150`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {renderCarImage()}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.carName, { color: theme.text }]}>
              {car.title}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={[styles.priceText, { color: theme.primary }]}>
                ₹{car.price}
              </Text>
              <Text style={[styles.perDayText, { color: theme.subText }]}>
                /day
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Specifications
          </Text>

          <View style={styles.specGrid}>
            <SpecItem icon="gas-station" label="Fuel" value={car.fuel} />
            <SpecItem icon="car-shift-pattern" label="Gear" value={car.transmission} />
            <SpecItem icon="calendar" label="Year" value={car.year} />
            <SpecItem icon="speedometer" label="KM Driven" value={car.kmDriven} />
          </View>

          {/* ================= LENDER SECTION ================= */}

          <View style={[styles.lenderCard, { backgroundColor: theme.card }]}>
            <View style={styles.lenderRow}>
              <View style={styles.lenderInfo}>
                <Image
                  source={{ uri: getAvatarUri() }}
                  style={styles.lenderAvatar}
                />
                <Text style={[styles.lenderName, { color: theme.text }]}>
                  {isLoadingLender ? "Loading..." : lender?.name || "Owner"}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.profileButton, { borderColor: theme.primary }]}
                onPress={handleViewProfile}
              >
                <Text style={{ color: theme.primary, fontWeight: "700" }}>
                  View Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Description
          </Text>

          <Text style={[styles.description, { color: theme.subText }]}>
            {car.description || "No description provided."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handlePrimaryAction}
        >
          <Text style={styles.buttonText}>
            {isLender ? "Update Your Car" : "Request to Chat"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= SPEC COMPONENT ================= */

const SpecItem = ({ icon, label, value }) => (
  <View style={styles.specBox}>
    <MaterialCommunityIcons name={icon} size={24} color="#6366F1" />
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value || "N/A"}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  image: {
    width: "100%",
    height: 320,
    resizeMode: "cover",
  },

  fallback: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  contentContainer: {
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 24,
    paddingBottom: 100,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  carName: {
    fontSize: 24,
    fontWeight: "900",
  },

  priceContainer: { alignItems: "flex-end" },

  priceText: {
    fontSize: 22,
    fontWeight: "900",
  },

  perDayText: {
    fontSize: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 20,
  },

  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  specBox: {
    width: "48%",
    padding: 16,
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: "#F1F5F9",
  },

  specLabel: { fontSize: 12 },

  specValue: { fontWeight: "700" },

  lenderCard: {
    marginTop: 25,
    padding: 16,
    borderRadius: 20,
  },

  lenderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  lenderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  lenderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    marginRight: 10,
  },

  lenderName: {
    fontSize: 16,
    fontWeight: "700",
  },

  profileButton: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  description: {
    marginTop: 10,
    lineHeight: 22,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "white",
  },

  button: {
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 17,
  },
});