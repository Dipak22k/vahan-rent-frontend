import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function KYCProgressBar({ step, totalSteps }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (step / totalSteps) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          Step {step} of {totalSteps}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, { width: widthInterpolate }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  barBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    marginTop: 6,
  },
  barFill: {
    height: 6,
    backgroundColor: "#4B44B9",
    borderRadius: 5,
  },
});
