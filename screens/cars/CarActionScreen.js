import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";

export default function CarActionScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>
        What would you like to do?
      </Text>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AddOrUpdateCar", { mode: "add" })}
      >
        <Text style={styles.primaryText}>List Your Car</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: theme.primary }]}
        onPress={() => navigation.navigate("AddOrUpdateCar", { mode: "update" })}
      >
        <Text style={[styles.secondaryText, { color: theme.primary }]}>
          Update Existing Car
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 40,
    textAlign: "center",
  },

  primaryButton: {
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  secondaryText: {
    fontSize: 16,
    fontWeight: "700",
  },
});