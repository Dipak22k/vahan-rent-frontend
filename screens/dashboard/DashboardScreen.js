import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import TopBar from "../../src/components/common/TopBar";
import BottomNav from "../../src/components/common/BottomNav";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useTheme } from "../../src/context/ThemeContext";
import CONFIG from "../../src/api/config";

export default function DashboardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [locationText, setLocationText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [userData, setUserData] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD USER + FETCH CARS ================= */

  useFocusEffect(
    useCallback(() => {
      const loadUserAndCars = async () => {
        try {
          setLoading(true);

          const storedUser = await AsyncStorage.getItem("userData");

          if (!storedUser) {
            navigation.replace("Login");
            return;
          }

          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);

          if (parsedUser.role === "lender") {
            await fetchMyCars();
          } else {
            await fetchCars();
          }
        } catch (err) {
          console.error("LOAD USER ERROR:", err);
        } finally {
          setLoading(false);
        }
      };

      loadUserAndCars();
    }, [])
  );

  /* ================= SAFE RESPONSE HANDLER ================= */

  const handleAuthError = async () => {
    await AsyncStorage.multiRemove(["userToken", "userData"]);
    Alert.alert("Session Expired", "Please login again.");
    navigation.replace("Login");
  };

  /* ================= FETCH ALL CARS ================= */

  const fetchCars = async () => {
    try {
      const res = await fetch(
        `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.CARS}`
      );

      if (res.status === 401) {
        await handleAuthError();
        return;
      }

      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("FETCH CARS ERROR:", err);
      setCars([]);
    }
  };

  /* ================= FETCH MY CARS ================= */

  const fetchMyCars = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        await handleAuthError();
        return;
      }

      const res = await fetch(
        `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.CARS}/my-cars`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 401) {
        await handleAuthError();
        return;
      }

      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("FETCH MY CARS ERROR:", err);
      setCars([]);
    }
  };

  /* ================= SEARCH FILTER ================= */

  const filteredCars = cars.filter((car) =>
    (car.title || "")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const isLender = userData?.role === "lender";

  /* ================= LOCATION ================= */

  const handleFetchLocation = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission required.");
      return;
    }

    await Location.getCurrentPositionAsync({});
    setLocationText("Current Location Fetched");
  };

  /* ================= IMAGE HANDLING (FIXED) ================= */

  const getCarImage = (car) => {
    if (!car.images || car.images.length === 0) {
      return require("../../assets/cars/i20.png");
    }

    return { uri: car.images[0] };
  };

  /* ================= UI ================= */

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TopBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text
            style={[styles.heading, { color: theme.text }]}
          >
            Welcome, {userData?.name || "User"}
          </Text>
        </View>

        {!isLender && (
          <>
            <View
              style={[
                styles.searchBarContainer,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons
                name="location"
                size={20}
                color={theme.primary}
              />
              <TextInput
                style={[
                  styles.locationInput,
                  { color: theme.text },
                ]}
                placeholder="Where to?"
                placeholderTextColor={theme.subText}
                value={locationText}
                onChangeText={setLocationText}
              />
              <TouchableOpacity
                onPress={handleFetchLocation}
              >
                <Ionicons
                  name="locate"
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchBar,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={theme.subText}
              />
              <TextInput
                placeholder="Search cars..."
                placeholderTextColor={theme.subText}
                style={[
                  styles.searchInput,
                  { color: theme.text },
                ]}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
              ]}
            >
              Recommended Cars
            </Text>
          </>
        )}

        {isLender && (
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Your Listed Cars
          </Text>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          filteredCars.map((car) => (
            <TouchableOpacity
              key={car._id}
              style={[
                styles.carCard,
                { backgroundColor: theme.card },
              ]}
              onPress={() =>
                navigation.navigate("CarDetails", { car })
              }
            >
              <Image
                source={getCarImage(car)}
                style={styles.carImage}
              />

              <View style={styles.carInfo}>
                <Text
                  style={[
                    styles.carName,
                    { color: theme.text },
                  ]}
                >
                  {car.title}
                </Text>

                <Text
                  style={[
                    styles.carPrice,
                    { color: theme.primary },
                  ]}
                >
                  ₹{car.price}/day
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {isLender && (
        <TouchableOpacity
          style={[
            styles.fabButton,
            { backgroundColor: theme.primary },
          ]}
          onPress={() =>
            navigation.navigate("CarAction")
          }
        >
          <Ionicons
            name="add"
            size={28}
            color="white"
          />
        </TouchableOpacity>
      )}

      <BottomNav currentTab="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  headerRow: { marginBottom: 10 },
  heading: { fontSize: 24, fontWeight: "800" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  locationInput: { flex: 1, marginHorizontal: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 10,
  },
  searchInput: { marginLeft: 8, flex: 1 },
  carCard: {
    flexDirection: "row",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  carImage: {
    width: 90,
    height: 70,
    borderRadius: 10,
    resizeMode: "cover",
  },
  carInfo: { marginLeft: 12 },
  carName: {
    fontSize: 16,
    fontWeight: "700",
  },
  carPrice: {
    marginTop: 4,
    fontWeight: "700",
  },
  fabButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});