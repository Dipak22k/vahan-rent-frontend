import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const PRIMARY_BLUE = "#2A3F6F";
const LIGHT_TEXT = "#F0F4F8";
const ACCENT_COLOR = "#FFC300";

export default function TopBar({ username }) {
  const [displayName, setDisplayName] = useState(username || "");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user?.name) setDisplayName(user.name);
        }
      } catch (error) {
        console.log("Error fetching user name:", error);
      }
    };
    fetchUserName();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ✅ Transparent status bar with correct height compensation */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.topBar}>
        {/* 🟦 Left side: Logo + Greeting */}
        <View style={styles.leftSection}>
          <Image
            source={require("../../../assets/logoV.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.greetingText}>
            Welcome, <Text style={styles.nameText}>{displayName || "Owner"}</Text>
          </Text>
        </View>

        {/* 🟩 Right side: Icons */}
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={26} color={ACCENT_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.iconButton}
          >
            <Ionicons name="person-circle-outline" size={28} color={ACCENT_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: PRIMARY_BLUE,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, // ✅ Added fix
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 42,
    height: 42,
    marginRight: 10,
  },
  greetingText: {
    color: LIGHT_TEXT,
    fontSize: 16,
    fontWeight: "600",
  },
  nameText: {
    color: ACCENT_COLOR,
    fontWeight: "800",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 18,
  },
});
