import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import TopBar from "./TopBar"; 
import { useTheme } from "../../../src/context/ThemeContext";
import CONFIG from "../../../src/api/config";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${CONFIG.BASE_URL}${cleanPath}`;
};

export default function ProfileScreen({ navigation, route, setIsLoggedIn }) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Params
  const profileId = route?.params?.userId;
  const isExternal = route?.params?.isExternal || false;

  // State
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const isOwnProfile = useMemo(() => {
    if (isExternal) return false;
    if (!profileId) return true;
    return String(profileId) === String(loggedInUserId);
  }, [profileId, loggedInUserId, isExternal]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem("userData");
      const parsedLoggedInUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedLoggedInUser?._id) setLoggedInUserId(parsedLoggedInUser._id);

      if (isExternal && profileId) {
        const res = await fetch(`${CONFIG.BASE_URL}/api/auth/users/${profileId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "User not found");

        const profile = data.user || data.data || data;
        setUser({
          name: profile.name || "User",
          email: profile.email || "N/A",
          role: profile.role || "MEMBER",
        });
        setProfileImage(profile.avatar || null);
      } else if (parsedLoggedInUser) {
        setUser(parsedLoggedInUser);
        setProfileImage(parsedLoggedInUser.avatar || null);
      }
    } catch (err) {
      console.error("PROFILE_LOAD_ERROR:", err);
      Alert.alert("Error", "Failed to load profile data.");
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [profileId, isExternal, fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const pickImage = async () => {
    if (!isOwnProfile) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled) return;

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem("token") || await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("avatar", {
        uri: result.assets[0].uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      const res = await fetch(`${CONFIG.BASE_URL}/api/auth/update-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      const avatarUrl = data.avatar || data?.user?.avatar;
      setProfileImage(avatarUrl);
      const updatedUser = { ...user, avatar: avatarUrl };
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
    } catch (err) { 
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
          await AsyncStorage.multiRemove(["userData", "token", "userToken"]);
          setIsLoggedIn(false);
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ backgroundColor: theme.mode === 'dark' ? theme.card : '#EEF2FF' }}>
         <TopBar 
            showBackButton={!isOwnProfile} 
            title={isOwnProfile ? "My Profile" : "User Profile"} 
            onNotificationPress={() => navigation.navigate("Notifications")}
         />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[
          styles.headerBackground, 
          { backgroundColor: theme.mode === 'dark' ? theme.card : '#EEF2FF' }
        ]}>
            <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
              <TouchableOpacity onPress={pickImage} disabled={!isOwnProfile} activeOpacity={0.8}>
                <View style={[styles.avatarWrapper, { borderColor: theme.background }]}>
                  {profileImage ? (
                    <Image source={{ uri: getImageUrl(profileImage) }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.initials, { backgroundColor: theme.primary }]}>
                      <Text style={styles.initialText}>{user.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  {isOwnProfile && (
                    <View style={[styles.editIcon, { backgroundColor: theme.primary, borderColor: theme.background }]}>
                      <Ionicons name="camera" size={16} color="white" />
                    </View>
                  )}
                  {uploading && <ActivityIndicator style={styles.loader} color="#fff" />}
                </View>
              </TouchableOpacity>
              
              <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
              
              <View style={[styles.badge, { backgroundColor: theme.mode === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)' }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>{user.role}</Text>
              </View>
            </Animated.View>
        </View>

        <View style={styles.content}>
          <InfoRow icon="email-outline" label="Email Address" value={user.email} theme={theme} />
          <InfoRow icon="shield-check-outline" label="Account Status" value="Verified" theme={theme} />
          
          <View style={[styles.divider, { backgroundColor: theme.mode === 'dark' ? '#334155' : '#F1F5F9' }]} />

          {isOwnProfile ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.subText }]}>Settings</Text>
              
              <MenuOption 
                icon="settings-outline" 
                label="Account Settings" 
                theme={theme} 
                onPress={() => navigation.navigate("KYCMaster")} 
              />
              
              <MenuOption 
                icon="bell-outline" 
                label="Notifications" 
                theme={theme} 
                onPress={() => navigation.navigate("Notifications")}
              />

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.chatBtn, { backgroundColor: theme.primary }]} 
              onPress={() => navigation.navigate("Chat", { lenderId: profileId, otherUser: user })}
            >
              <Ionicons name="chatbubble-ellipses" size={22} color="white" />
              <Text style={styles.chatBtnText}>Message {user.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Reusable Components
const InfoRow = ({ icon, label, value, theme }) => (
  <View style={styles.infoRow}>
    <View style={[styles.iconCircle, { backgroundColor: theme.mode === 'dark' ? '#334155' : '#F1F5F9' }]}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.primary} />
    </View>
    <View style={{ marginLeft: 15 }}>
      <Text style={[styles.infoLabel, { color: theme.subText }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  </View>
);

const MenuOption = ({ icon, label, theme, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconCircle, { backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#F8FAFC' }]}>
      <Ionicons name={icon} size={20} color={theme.subText} />
    </View>
    <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={theme.subText} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBackground: { borderBottomLeftRadius: 35, borderBottomRightRadius: 35, paddingBottom: 35, paddingTop: 10, alignItems: 'center' },
  profileHeader: { alignItems: 'center' },
  avatarWrapper: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, backgroundColor: '#fff' },
  avatar: { width: '100%', height: '100%', borderRadius: 55 },
  initials: { width: '100%', height: '100%', borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  initialText: { color: 'white', fontSize: 38, fontWeight: 'bold' },
  editIcon: { position: 'absolute', bottom: 2, right: 2, padding: 6, borderRadius: 15, borderWidth: 2 },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 55 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 15 },
  badge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 8 },
  badgeText: { fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  content: { paddingHorizontal: 25, paddingTop: 25 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  iconCircle: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '600' },
  infoValue: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  menuLabel: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 35, justifyContent: 'center' },
  logoutText: { color: '#EF4444', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  chatBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  chatBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});