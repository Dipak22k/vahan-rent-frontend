import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../../src/context/ThemeContext";   // ✅ IMPORTANT PATH

const PRIMARY_BLUE = "#5b6f9e";
const LIGHT_TEXT = "#f3f3f3";
const ACCENT_COLOR = "#bcaf83";

export default function TopBar({ showBackButton = false, title }) {
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const navigation = useNavigation();

  // ✅ Get theme from context
  const { theme, toggleTheme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const storedUser = await AsyncStorage.getItem("userData");
          const storedImage = await AsyncStorage.getItem("profileImage");

          if (storedUser) {
            const user = JSON.parse(storedUser);

            if (user?.name) {
              const firstNameRaw = user.name.trim().split(/\s+/)[0];

              const formattedName =
                firstNameRaw.charAt(0).toUpperCase() +
                firstNameRaw.slice(1).toLowerCase();

              setDisplayName(formattedName);
            }
          }

          if (storedImage) {
            setProfileImage(storedImage);
          }
        } catch (error) {
          console.log("TopBar Load Error:", error);
        }
      };

      loadUserData();
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.topBar}>
        {/* LEFT SECTION */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={26} color={theme.primary} />
              </TouchableOpacity>

              <Text style={[styles.titleText, { color: theme.text }]}>
                {title || "Back"}
              </Text>
            </>
          ) : (
            <>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={40}
                  color={theme.primary}
                  style={styles.profileIcon}
                />
              )}

              <Text style={[styles.greetingText, { color: theme.text }]}>
                Welcome,{" "}
                <Text style={{ color: theme.primary }}>
                  {displayName || "User"}
                </Text>
              </Text>
            </>
          )}
        </View>

        {/* RIGHT SECTION */}
        {!showBackButton && (
          <View style={styles.iconContainer}>
            {/* Notifications */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              style={styles.iconButton}
            >
              <Ionicons
                name="notifications-outline"
                size={26}
                color={theme.primary}
              />
            </TouchableOpacity>

            {/* ✅ Theme Toggle (GLOBAL NOW) */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={styles.iconButton}
            >
              <Ionicons
                name={theme.mode === "dark" ? "sunny-outline" : "moon-outline"}
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={styles.iconButton}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    marginRight: 10,
  },

  titleText: {
    fontSize: 18,
    fontWeight: "700",
  },

  profileIcon: {
    marginRight: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  greetingText: {
    fontSize: 16,
    fontWeight: "600",
  },

  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginLeft: 18,
  },
});