import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import KYCHeader from "../src/components/common/KYCHeader";
import KYCProgressBar from "../src/components/common/KYCProgressBar";

export default function KYCReview({ route, rootNavigation }) {
  const animationRef = useRef(null);
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  const userRole = route?.params?.userRole || "Owner";

  useEffect(() => {
    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, [textFadeAnim]);

  const handleAnimationFinish = () => {
    const targetRoute = userRole === "Owner" ? "OwnerApp" : "RenterApp";

    // ✅ Reset at the root level
    rootNavigation.reset({
      index: 0,
      routes: [{ name: targetRoute }],
    });
  };

  return (
    <View style={styles.container}>
      <KYCHeader title="KYC Complete" />
      <View style={styles.progressBarWrapper}>
        <KYCProgressBar step={5} totalSteps={5} />
      </View>

      <View style={styles.contentArea}>
        <LottieView
          ref={animationRef}
          source={require("../assets/animation/success.json")}
          autoPlay
          loop={false}
          style={styles.animation}
          onAnimationFinish={handleAnimationFinish} // ✅ Redirects after success
        />

        <Animated.View style={[styles.textWrapper, { opacity: textFadeAnim }]}>
          <Text style={styles.title}>KYC Verification Complete!</Text>
          <Text style={styles.message}>
            Congratulations! Your identity and details have been successfully verified.
          </Text>
          <Text style={styles.messageNote}>
            You will now be redirected to your dashboard.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  progressBarWrapper: { paddingHorizontal: 25, paddingTop: 15 },
  contentArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 50,
  },
  animation: { width: 250, height: 250, marginBottom: 20 },
  textWrapper: { alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E3A8A",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    color: "#374151",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 8,
  },
  messageNote: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 5,
  },
});
