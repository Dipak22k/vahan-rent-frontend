import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function KYCHeader({ title = "KYC Verification" }) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#FFC300" />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        {/* Spacer for perfect centering */}
        <View style={styles.rightSpacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#4B44B9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  header: {
    backgroundColor: "#4B44B9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
  },

  backButton: {
    marginRight: 10,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },

  rightSpacer: {
    width: 26, // same visual weight as icon
  },
});
