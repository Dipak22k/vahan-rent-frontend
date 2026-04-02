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
    FlatList,
    Modal,
    ActivityIndicator,
    Alert
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
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomImage, setZoomImage] = useState(null);

    useEffect(() => {
      loadUser();
      fetchLender();
    }, [car?.lenderId]);

    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("USER LOAD ERROR:", err);
      }
    };

    const fetchLender = async () => {
      if (!car?.lenderId) {
        setIsLoadingLender(false);
        return;
      }
      try {
        const res = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.USERS}/${car.lenderId}`);
        const data = await res.json();
        if (res.ok) {
          setLender(data.user || data.data || data);
        }
      } catch (err) {
        console.error("LENDER FETCH ERROR:", err);
      } finally {
        setIsLoadingLender(false);
      }
    };

    const isLender = user?.role === "lender";

    const handlePrimaryAction = async () => {
      if (!user) {
        Alert.alert("Login Required", "Please log in to chat with the owner and book this car.", [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => navigation.navigate("Login") }
        ]);
        return;
      }

      if (isLender) {
        navigation.navigate("AddOrUpdateCar", { mode: "update", car });
        return;
      }

      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return Alert.alert("Session Expired", "Please login again.");

        const res = await fetch(`${CONFIG.BASE_URL}/api/chat/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ carId: car._id, lenderId: car.lenderId }),
        });

        const data = await res.json();

        if (res.status === 403) {
          Alert.alert(
            "KYC Verification Required",
            "To ensure a safe community, you must complete your identity verification before you can message owners or book vehicles.",
            [
              { text: "Maybe Later", style: "cancel" },
              { 
                text: "Verify Now", 
                onPress: () => navigation.navigate("KYCMaster"), 
                style: "default" 
              }
            ]
          );
          return;
        }

        if (!res.ok) throw new Error(data.message || "Failed to start chat");

        navigation.navigate("Chat", { chatId: data._id, currentUser: user, otherUser: lender });
      } catch (err) {
        Alert.alert("Error", err.message || "Something went wrong.");
      }
    };

    const getAvatarUri = () => {
      if (lender?.avatar) {
          const path = lender.avatar.startsWith("/") ? lender.avatar : `/${lender.avatar}`;
          return `${CONFIG.BASE_URL}${path}`;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(lender?.name || "User")}&background=6366F1&color=fff`;
    };

    const renderImageSlider = () => {
      if (!car?.images || car.images.length === 0) {
        return (
          <View style={[styles.image, styles.fallback]}>
            <Ionicons name="car-outline" size={80} color="#94A3B8" />
          </View>
        );
      }

      return (
        <View style={styles.sliderWrapper}>
          <FlatList
            data={car.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => {
              let imgUri = item;
              if (imgUri.startsWith("http")) {
                const parts = imgUri.split("/uploads");
                if (parts.length > 1) imgUri = "/uploads" + parts[1];
              }
              const fullUri = `${CONFIG.BASE_URL}${imgUri}`;

              return (
                <TouchableOpacity onPress={() => setZoomImage(fullUri)} activeOpacity={0.9}>
                  <Image source={{ uri: fullUri }} style={styles.image} />
                </TouchableOpacity>
              );
            }}
          />
          <View style={styles.dotsContainer}>
            {car.images.map((_, index) => (
              <View key={index} style={[styles.dot, { backgroundColor: activeIndex === index ? "#6366F1" : "#CBD5F5" }]} />
            ))}
          </View>
        </View>
      );
    };

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <View style={styles.imageSection}>
            {renderImageSlider()}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.carName, { color: theme.text }]}>{car.title}</Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.priceText, { color: "#6366F1" }]}>₹{car.price}</Text>
                <Text style={[styles.perDayText, { color: theme.subText }]}>/day</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Specifications</Text>
            
            {/* ✅ FIXED: Changed <div> to <View> */}
            <View style={styles.specGrid}>
              <SpecItem icon="gas-station" label="Fuel" value={car.fuel} />
              <SpecItem icon="car-shift-pattern" label="Gear" value={car.transmission} />
              <SpecItem icon="calendar" label="Year" value={car.year} />
              <SpecItem icon="speedometer" label="KM Driven" value={car.kmDriven} />
            </View>

            <View style={[styles.lenderCard, { backgroundColor: theme.mode === 'dark' ? theme.card : "#F8FAFC" }]}>
              <View style={styles.lenderRow}>
                <View style={styles.lenderInfo}>
                  <Image source={{ uri: getAvatarUri() }} style={styles.lenderAvatar} />
                  <View>
                    <Text style={[styles.lenderName, { color: theme.text }]}>
                      {isLoadingLender ? "Loading..." : lender?.name || "Owner"}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>Verified Lender</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.profileButton, { borderColor: "#6366F1" }]}
                  onPress={() => lender && navigation.navigate("Profile", { userId: lender._id, isExternal: true })}
                >
                  <Text style={{ color: "#6366F1", fontWeight: "700" }}>Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
            <Text style={[styles.description, { color: theme.subText }]}>
              {car.description || "No description provided."}
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.mode === 'dark' ? '#334155' : '#F1F5F9' }]}>
          <TouchableOpacity style={styles.button} onPress={handlePrimaryAction}>
            <Text style={styles.buttonText}>{isLender ? "Update Your Car" : "Request to Chat"}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={!!zoomImage} transparent animationType="fade">
          <View style={styles.zoomContainer}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setZoomImage(null)}>
              <Ionicons name="close" size={35} color="white" />
            </TouchableOpacity>
            <Image source={{ uri: zoomImage }} style={styles.zoomImage} resizeMode="contain" />
          </View>
        </Modal>
      </View>
    );
  }

  const SpecItem = ({ icon, label, value }) => (
    <View style={styles.specBox}>
      <MaterialCommunityIcons name={icon} size={24} color="#6366F1" />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value || "N/A"}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: { flex: 1 },
    imageSection: { position: 'relative' },
    sliderWrapper: { height: 320 },
    image: { width: width, height: 320, resizeMode: "contain" },
    fallback: { justifyContent: "center", alignItems: "center", backgroundColor: "#E2E8F0" },
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
      zIndex: 10,
    },
    dotsContainer: {
      flexDirection: "row",
      position: 'absolute',
      bottom: 50,
      width: '100%',
      justifyContent: "center",
    },
    dot: { width: 8, height: 8, borderRadius: 4, margin: 4 },
    contentContainer: {
      marginTop: -30,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      padding: 24,
      minHeight: 500,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
    carName: { fontSize: 24, fontWeight: "900", flex: 1, paddingRight: 10 },
    priceContainer: { alignItems: "flex-end" },
    priceText: { fontSize: 24, fontWeight: "900" },
    perDayText: { fontSize: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 25, marginBottom: 10 },
    specGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    specBox: {
      width: "48%",
      padding: 16,
      borderRadius: 20,
      marginBottom: 12,
      backgroundColor: "#F1F5F9",
    },
    specLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
    specValue: { fontWeight: "700", fontSize: 15, color: '#1E293B' },
    lenderCard: { marginTop: 10, padding: 16, borderRadius: 20 },
    lenderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    lenderInfo: { flexDirection: "row", alignItems: "center" },
    lenderAvatar: { width: 50, height: 50, borderRadius: 15, marginRight: 12 },
    lenderName: { fontSize: 16, fontWeight: "700" },
    profileButton: { borderWidth: 1.5, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    description: { lineHeight: 22, fontSize: 15 },
    footer: { padding: 20, borderTopWidth: 1, position: 'absolute', bottom: 0, width: '100%' },
    button: { height: 58, borderRadius: 20, backgroundColor: '#6366F1', alignItems: "center", justifyContent: "center" },
    buttonText: { color: "white", fontWeight: "800", fontSize: 17 },
    zoomContainer: { flex: 1, backgroundColor: "black", justifyContent: "center" },
    zoomImage: { width: "100%", height: "80%" },
    closeBtn: { position: "absolute", top: 60, right: 25, zIndex: 10 },
  });