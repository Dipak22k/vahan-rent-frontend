import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  Modal,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import KYCMasterScreen from "../../kyc/KYCMasterScreen";
import TopBar from "./TopBar";
import { useTheme } from "../../../src/context/ThemeContext";
import CONFIG from "../../../src/api/config";

const { width } = Dimensions.get("window");

export default function ProfileScreen({ navigation, route, setIsLoggedIn }) {
  const { theme } = useTheme();
  const profileId = route?.params?.userId;

  // State
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [logoutVisible, setLogoutVisible] = useState(false);

  // Derived State
  const isOwnProfile = useMemo(
    () => !profileId || profileId === loggedInUserId,
    [profileId, loggedInUserId],
  );

  // Animations
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const loadProfile = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userData");
      const storedImage = await AsyncStorage.getItem("profileImage");
      let parsedUser = null;

      if (storedUser) {
        parsedUser = JSON.parse(storedUser);
        setLoggedInUserId(parsedUser._id);
      }

      if (profileId && parsedUser?._id !== profileId) {
        const res = await fetch(
          `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.USERS}/${profileId}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const profile = data.user || data.data || data;
        setUser({
          name: profile.name || "",
          email: profile.email || "",
          role: profile.role?.toUpperCase() || "MEMBER",
        });
        setProfileImage(profile.avatar ?? null);
        return;
      }

      if (parsedUser) setUser(parsedUser);
      if (storedImage) setProfileImage(storedImage);
    } catch (err) {
      console.error("PROFILE LOAD ERROR:", err);
    }
  }, [profileId]);

  useEffect(() => {
    loadProfile();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const pickImage = async () => {
    if (!isOwnProfile) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("avatar", {
        uri: result.assets[0].uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      const res = await fetch(
        `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.UPDATE_AVATAR}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await res.json();
      if (res.ok) {
        setProfileImage(data.avatar);
        await AsyncStorage.setItem("profileImage", data.avatar);
      }
    } catch (err) {
      console.log("IMAGE UPLOAD ERROR:", err);
    }
  };

  const toggleLogoutModal = (show) => {
    if (show) {
      setLogoutVisible(true);
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setLogoutVisible(false));
    }
  };

  const confirmLogout = async () => {
    await AsyncStorage.multiRemove(["userData", "profileImage", "userToken"]);
    setIsLoggedIn(false);
  };

  // Sub-Components for cleanliness
  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={theme.primary}
          style={styles.infoIcon}
        />
        <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
        {value || "—"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <TopBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              backgroundColor: theme.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={pickImage}
            style={styles.avatarWrapper}
          >
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: theme.background },
              ]}
            >
              {profileImage ? (
                <Image
                  source={{
                    uri: `${profileImage}${profileImage.includes("?") ? "&" : "?"}t=${Date.now()}`,
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[
                    styles.initialsContainer,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.initialsText}>
                    {user.name?.charAt(0) || "U"}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user.name || "User Name"}
          </Text>
        </Animated.View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <InfoRow
              icon="person-outline"
              label="Full Name"
              value={user.name}
            />
            <InfoRow
              icon="mail-outline"
              label="Email Address"
              value={user.email}
            />
            <InfoRow
              icon="shield-checkmark-outline"
              label="Account Role"
              value={user.role}
            />
          </View>
        </View>

        {/* Buttons Section */}
        <View style={styles.actionContainer}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                style={[styles.kycButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate("KYCMaster")}
              >
                <Text style={styles.buttonText}>Complete KYC Verification</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.logoutButton,
                  {
                    borderColor: theme.error,
                    backgroundColor: theme.dark
                      ? "transparent"
                      : theme.error + "15",
                  },
                ]}
                onPress={() => toggleLogoutModal(true)}
              >
                <Text style={[styles.buttonText, { color: theme.error }]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.kycButton, { backgroundColor: theme.primary }]}
              onPress={() =>
                navigation.navigate("Chat", { lenderId: profileId })
              }
            >
              <Text style={styles.buttonText}>Request to Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* FIXED LOGOUT MODAL */}
      <Modal
        transparent
        visible={logoutVisible}
        animationType="none"
        onRequestClose={() => toggleLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.card,
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.error + "15" },
              ]}
            >
              <Ionicons name="log-out" size={32} color={theme.error} />
            </View>

            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Sign Out
            </Text>
            <Text style={[styles.modalSubTitle, { color: theme.subText }]}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border || "#eee",
                    borderWidth: 1,
                  },
                ]}
                onPress={() => toggleLogoutModal(false)}
              >
                <Text style={{ color: theme.text, fontWeight: "700" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.error }]}
                onPress={confirmLogout}
              >
                <Text style={{ color: theme.text, fontWeight: "700" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 10, paddingBottom: 40 },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    marginHorizontal: 15,
    borderRadius: 30,
    marginTop: 10,
    elevation: 3,
  },
  avatarWrapper: { marginBottom: 15 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
  },
  profileImage: { width: "100%", height: "100%" },
  initialsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: { color: "white", fontSize: 36, fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "800" },
  section: { paddingHorizontal: 20, marginTop: 25 },
  card: { borderRadius: 20, padding: 16 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoLeft: { flexDirection: "row", alignItems: "center" },
  infoIcon: { marginRight: 12 },
  label: { fontSize: 14, fontWeight: "600" },
  value: { fontWeight: "700", fontSize: 15 },
  actionContainer: { paddingHorizontal: 20, marginTop: 30 },
  kycButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
  },
  logoutButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
  },
  buttonText: { fontWeight: "700", fontSize: 16 },

  // Modal Specific Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "90%",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  modalSubTitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  modalActionRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalBtn: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
