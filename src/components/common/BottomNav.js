import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";   // ✅ IMPORTANT PATH

const { width } = Dimensions.get("window");
const TAB_BAR_WIDTH = width * 0.85;

const TABS = [
  {
    key: "Dashboard",
    icon: require("../../../assets/icons/home-icon-silhouette.png"),
  },
  {
    key: "Tracking",
    icon: require("../../../assets/icons/real-time-tracking.png"),
  },
  { key: "Chat", icon: require("../../../assets/icons/chat.png") },
  { key: "Contracts", icon: require("../../../assets/icons/contract.png") },
  { key: "Insurance", icon: require("../../../assets/icons/insurance.png") },
];

const TAB_WIDTH = TAB_BAR_WIDTH / TABS.length;

export default function BottomNav({ currentTab }) {
  const navigation = useNavigation();
  const { theme } = useTheme();                      // ✅ THEME ACCESS
  const translateX = useSharedValue(0);

  useEffect(() => {
    const index = TABS.findIndex((t) => t.key === currentTab);
    const safeIndex = index === -1 ? 0 : index;

    translateX.value = withSpring(safeIndex * TAB_WIDTH, {
      damping: 15,
      stiffness: 120,
    });
  }, [currentTab]);

  const rnStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = (screenName) => {
    if (screenName === "Chat") {
      navigation.navigate("ChatList");
      return;
    }

    navigation.navigate(screenName);
  };

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.card,          // ✅ Dynamic Background
            shadowColor: theme.mode === "dark" ? "#000" : "#111",
          },
        ]}
      >
        {/* ✅ Active Pill */}
        <Animated.View
          style={[
            styles.activePill,
            rnStyle,
            {
              width: TAB_WIDTH - 10,
              backgroundColor: theme.primary + "22",   // ✅ Soft Tint
            },
          ]}
        />

        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <Image
                source={tab.icon}
                style={[
                  styles.icon,
                  {
                    tintColor: isActive
                      ? theme.primary              // ✅ Active Icon
                      : theme.subText,             // ✅ Inactive Icon
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    alignItems: "center",
  },

  container: {
    width: TAB_BAR_WIDTH,
    height: 65,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    elevation: 8,

    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  activePill: {
    position: "absolute",
    height: 45,
    borderRadius: 25,
    left: 5,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
});