import React, { useState, useCallback, useEffect } from "react";
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
import { useTheme } from "../../../src/context/ThemeContext";
import CONFIG from "../../api/config";

const getImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${CONFIG.BASE_URL}${path}`;
};

export default function TopBar({ showBackButton = false, title, onNotificationPress }) {
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userData");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.name) {
          const firstNameRaw = user.name.trim().split(/\s+/)[0];
          setDisplayName(firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase());
        }
       setProfileImage(user?.avatar ? getImageUrl(user.avatar) : null);
      }
    } catch (error) {
      console.log("TopBar Load Error:", error);
    }
  };
  useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    loadUserData(); // reload when screen comes into focus
  });

  return unsubscribe;
}, [navigation]);

useEffect(() => {
  loadUserData(); // load when component mounts
}, []);

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
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={26} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.titleText, { color: theme.text }]}>
                {title || "Back"}
              </Text>
            </>
          ) : (
            <>
              {profileImage ? (
                <Image
              source={{
    uri: profileImage
      ? `${profileImage}?t=${new Date().getTime()}`
      : null,
  }}
  style={styles.avatar} 
                />
              ) : (
                <Ionicons name="person-circle-outline" size={40} color={theme.primary} style={styles.profileIcon} />
              )}
              <Text style={[styles.greetingText, { color: theme.text }]}>
                Hi, <Text style={{ color: theme.primary }}>{displayName || "User"}</Text>
              </Text>
            </>
          )}
        </View>

        {/* RIGHT SECTION - Icons now visible even if showBackButton is true */}
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={onNotificationPress || (() => navigation.navigate("Notifications"))}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={26} color={theme.primary} />
          </TouchableOpacity>

          {/* Only show theme toggle/settings if NOT in 'back' mode (optional UI choice) */}
          {!showBackButton && (
            <>
              <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                <Ionicons
                  name={theme.mode === "dark" ? "sunny-outline" : "moon-outline"}
                  size={24}
                  color={theme.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Profile", { isExternal: false })}
                style={styles.iconButton}
              >
                <Ionicons name="settings-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 18 },
  leftSection: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 10 },
  titleText: { fontSize: 18, fontWeight: "700" },
  profileIcon: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  greetingText: { fontSize: 16, fontWeight: "600" },
  iconContainer: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginLeft: 18 },
});