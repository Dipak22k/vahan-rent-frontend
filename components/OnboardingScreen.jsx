import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// 🎨 Brand Colors
const PRIMARY_BLUE = "#1E3A8A";
const ACCENT_GOLD = "#FFC300";
const TEXT_DARK = "#111827";

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // 🖼️ Slides Data
 const screens = [
  {
    id: 1,
    title: "Rent Your Next Vahan",
    description:
      "The fastest and most reliable way to rent cars and bikes from verified owners near you.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1080&q=80",
  },
  {
    id: 2,
    title: "Direct Owner Connection",
    description:
      "Skip the middlemen. Secure a confirmed rental instantly and communicate directly with the vehicle owner.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1080&q=80",
  },
  {
    id: 3,
    title: "Track, Pay & Drive Securely",
    description:
      "Enjoy secure payments and real-time GPS tracking for every journey.",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1080&q=80",
  },
];

  // 🌀 Animation + Auto Slide
  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      if (currentIndex < screens.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 4000);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex]);

  // ▶️ Button Logic
  const handleNext = () => {
    clearTimeout(timerRef.current);
    if (currentIndex < screens.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigation.replace("Login");
    }
  };

  const handleDotPress = (index) => {
    clearTimeout(timerRef.current);
    setCurrentIndex(index);
  };

  const { title, description, image } = screens[currentIndex];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PRIMARY_BLUE }}>
      <LinearGradient colors={["#fff", "#f7f9fc"]} style={styles.container}>
        {/* 🌟 Animated Content */}
        <Animated.View
          key={currentIndex}
          style={[
            styles.contentArea,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) => console.warn("Image Load Error:", e.nativeEvent.error)}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </Animated.View>

        {/* ⚙️ Footer */}
        <View style={styles.footer}>
          <View style={styles.pagination}>
            {screens.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentIndex ? PRIMARY_BLUE : "#C0CCDA",
                    width: index === currentIndex ? 28 : 10,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={styles.termsText}>
            Read our <Text style={styles.linkText}>Privacy Policy</Text> and tap{" "}
            <Text style={{ fontWeight: "bold" }}>Agree and continue</Text> to
            accept the <Text style={styles.linkText}>Terms of Service</Text>.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {currentIndex < screens.length - 1
                ? "Next"
                : "Agree and continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  image: {
    width: width * 0.9,
    height: width * 0.6,
    marginBottom: 40,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: ACCENT_GOLD,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 25,
    gap: 6,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  termsText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  linkText: {
    color: PRIMARY_BLUE,
    fontWeight: "700",
  },
  button: {
    backgroundColor: PRIMARY_BLUE,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
