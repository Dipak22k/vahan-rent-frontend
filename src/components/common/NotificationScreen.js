import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TopBar from "./TopBar";
import { useTheme } from "../../../src/context/ThemeContext";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "../../../src/api/config";

const socket = io(CONFIG.BASE_URL);

export default function NotificationScreen({ navigation }) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);

useEffect(() => {
  // ================= SOCKET EVENTS =================

  socket.on("chat_status_updated", (data) => {
    if (data.status === "accepted") {
      const newNotif = {
        id: Date.now().toString(),
        title: "Request Accepted",
        message: "Lender accepted your request. You can now chat.",
        time: "Now",
        type: "success",
        read: false,
        navigateTo: "Chat",
        params: { lenderId: data.lenderId, carId: data.carId },
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        AsyncStorage.setItem("notifications", JSON.stringify(updated));
        return updated;
      });
    }
  });

  socket.on("rent_confirmed", (data) => {
    const newNotif = {
      id: Date.now().toString(),
      title: "Rent Confirmed",
      message: "Your booking is confirmed. Pickup location shared.",
      time: "Now",
      type: "contract",
      read: false,
      navigateTo: "MyBookings",
      params: { bookingId: data?.bookingId },
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      AsyncStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  });

  // ================= KYC NOTIFICATIONS =================

  const loadKYCNotifications = async () => {
    try {
      const stored =
        JSON.parse(await AsyncStorage.getItem("notifications")) || [];

      setNotifications(stored);
    } catch (err) {
      console.log("NOTIFICATION LOAD ERROR", err);
    }
  };

  const checkKYCStatus = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));
      const status = userData?.kyc?.status;

      if (!status) return;

      let message = "";
      let type = "warning";

      if (status === "pending") {
        message = "Your KYC is under review ⏳";
      } else if (status === "verified") {
        message = "KYC verified successfully ✅";
        type = "success";
      } else if (status === "rejected") {
        message = "KYC failed ❌ Please try again";
      }

      if (message) {
        const newNotif = {
          id: Date.now().toString(),
          title: "KYC Update",
          message,
          time: "Now",
          type,
          read: false,
        };

        setNotifications((prev) => {
          const updated = [newNotif, ...prev];
          AsyncStorage.setItem("notifications", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.log("KYC NOTIF ERROR", err);
    }
  };

  loadKYCNotifications();
  checkKYCStatus();

  // ================= CLEANUP =================

  return () => {
    socket.off("chat_status_updated");
    socket.off("rent_confirmed");
  };
}, []);

  const handleNotificationPress = (item) => {
    // 1. Mark as read locally
    setNotifications((prev) => {
  const updated = [newNotif, ...prev];
  AsyncStorage.setItem("notifications", JSON.stringify(updated));
  return updated;
});

    // 2. Navigate if a route is defined
    if (item.navigateTo) {
      navigation.navigate(item.navigateTo, item.params || {});
    }
  };

  const markAllRead = () => {
    setNotifications((prev) =>
  prev.map((n) =>
    n.id === item.id ? { ...n, read: true } : n
  )
);
  };

  const getIcon = (type) => {
    switch (type) {
      case "success": return { name: "checkmark-circle", color: "#10B981" };
      case "contract": return { name: "document-text", color: theme.primary };
      case "warning": return { name: "alert-circle", color: "#F59E0B" };
      default: return { name: "notifications", color: theme.subText };
    }
  };

  const renderItem = ({ item }) => {
    const iconData = getIcon(item.type);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderLeftColor: item.read ? "transparent" : theme.primary,
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconData.color + "15" }]}>
          <Ionicons name={iconData.name} size={24} color={iconData.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.time, { color: theme.subText }]}>{item.time}</Text>
          </View>
          <Text style={[styles.message, { color: theme.subText }]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar
        showBackButton={true} // Usually good for notification screens
        title="Notifications"
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Updates</Text>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ color: theme.primary, fontWeight: "600", fontSize: 13 }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off-outline" size={80} color={theme.subText} style={{ opacity: 0.2 }} />
          <Text style={[styles.emptyText, { color: theme.subText }]}>All caught up!</Text>
          <Text style={[styles.emptySubText, { color: theme.subText }]}>No new notifications found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  header: { fontSize: 24, fontWeight: "800" },
  list: { padding: 20, paddingBottom: 100 },
  card: { flexDirection: "row", borderRadius: 16, padding: 16, marginBottom: 12, alignItems: "center", elevation: 2, shadowOpacity: 0.05 },
  iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  textContainer: { flex: 1, marginLeft: 15 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "700" },
  time: { fontSize: 11 },
  message: { fontSize: 13, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "700", marginTop: 15 },
  emptySubText: { fontSize: 14, marginTop: 5 },
});