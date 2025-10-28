import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated, // 💡 Using core Animated API
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopBar from "./TopBar"; // Assuming this is still used

// 🌐 Get screen width for responsive styling
const { width } = Dimensions.get("window");

export default function ProfileScreen({ navigation, setIsLoggedIn, userData }) {
  const [user, setUser] = useState(userData || { name: "", email: "", role: "" });

  // 💡 Animation Setup: Create Animated.Value for controlling opacity
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🟢 Load stored userData (Unchanged Logic)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.log("Error loading user data:", error);
      }
    };
    loadUserData();

    // Start a simple sequence fade-in animation for all content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800, // Duration of the whole fade-in
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // 🟥 Logout handler (Unchanged Logic)
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userData");
              if (typeof setIsLoggedIn === "function") {
                setIsLoggedIn(false); // ✅ Go back to login via AppNavigator
              } else {
                console.warn("setIsLoggedIn not found in props");
              }
            } catch (error) {
              console.log("Logout error:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ---------------- RENDER ----------------
  return (
    <View style={styles.container}>
      {/* 🔝 TopBar - Used but not styled here */}
      <TopBar
        username={user.name || "User"}
        onNotificationPress={() => alert("Notifications")}
        onProfilePress={() => alert("Already in Profile")}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 🌟 Animated Header Section */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim }]} // Apply animation style
        >
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.profileIcon}>👤</Text>
          </View>
          <Text style={styles.headerTitle}>{user.name || "User Profile"}</Text>
          <Text style={styles.headerSubtitle}>
            Manage your details and verification status.
          </Text>
        </Animated.View>

        {/* 📚 Main Content Title */}
        <Animated.Text
          style={[styles.contentTitle, { opacity: fadeAnim }]}
        >
          Account Details & Verification
        </Animated.Text>

        {/* 🟢 User Info Card */}
        <Animated.View
          style={[styles.card, { opacity: fadeAnim }]}
        >
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.name || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email || "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{user.role || "—"}</Text>
          </View>
        </Animated.View>

        {/* ✅ Start KYC Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("KYCFlow", { userRole: user.role })}
          >
            <Text style={styles.buttonText}>
              <Text>⚡</Text> Start KYC Verification
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 🚪 Logout Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>
              <Text>🚪</Text> Logout
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" }, // Lighter background
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  // New Header Styles
  header: {
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF', // Light accent color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#4B44B9',
  },
  profileIcon: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  contentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 25,
    marginBottom: 15,
  },

  // Enhanced Card Styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderLeftWidth: 5,
    borderLeftColor: "#4B44B9", // Primary color accent
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  label: { 
    color: "#6B7280", // Softer color for label
    fontWeight: "500",
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  // Enhanced Button Styles
  button: {
    backgroundColor: "#4B44B9", // Vibrant primary color
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#4B44B9",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButton: {
    backgroundColor: "#FF5757", // Striking red for safety
    shadowColor: "#FF5757",
  },
  buttonText: { 
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
}); 