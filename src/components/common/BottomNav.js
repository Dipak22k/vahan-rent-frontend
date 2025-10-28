import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function BottomNav({ currentTab, onTabPress }) {
  const tabs = [
    { key: "home", icon: require("../../../assets/icons/home-icon-silhouette.png") },
    { key: "tracking", icon: require("../../../assets/icons/real-time-tracking.png") },
    { key: "history", icon: require("../../../assets/icons/file.png") },
    { key: "contracts", icon: require("../../../assets/icons/contract.png") },
    { key: "insurance", icon: require("../../../assets/icons/insurance.png") },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabPress(tab.key)}
          style={[
            styles.tab,
            currentTab === tab.key && styles.activeTab,
          ]}
        >
          <Image
            source={tab.icon}
            style={[styles.icon, currentTab === tab.key && styles.activeIcon]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 6,
  },
  tab: {
    padding: 8,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#E6E7F8",
  },
  icon: {
    width: 26,
    height: 26,
    tintColor: "#6B7280",
  },
  activeIcon: {
    tintColor: "#4B44B9",
  },
});
