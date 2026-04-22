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

  // ================= LOAD STORED =================
  const loadStoredNotifications = async () => {
    try {
      const stored =
        JSON.parse(await AsyncStorage.getItem("notifications")) || [];
      setNotifications(stored);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  // ================= SAVE =================
  const saveNotifications = async (data) => {
    await AsyncStorage.setItem("notifications", JSON.stringify(data));
  };

  // ================= KYC CHECK =================
  const checkKYCStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const res = await fetch(`${CONFIG.BASE_URL}/api/kyc/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const status = data.status;

      let message = "";
      let type = "warning";

      if (status === "pending") {
        message = "Your KYC is under review ⏳";
      } else if (status === "verified") {
        message = "KYC completed successfully ✅";
        type = "success";
      } else if (status === "rejected") {
        message = "KYC rejected ❌ Please retry";
      }

      if (message) {
        const newNotif = {
          id: Date.now().toString(),
          title: "KYC Update",
          message,
          type,
          time: "Now",
          read: false,
        };

        setNotifications((prev) => {
          const updated = [newNotif, ...prev];
          saveNotifications(updated);
          return updated;
        });
      }
    } catch (err) {
      console.log("KYC ERROR:", err);
    }
  };

  // ================= SOCKET EVENTS =================
  useEffect(() => {
    loadStoredNotifications();
    checkKYCStatus();

    // 🔥 CHAT STATUS UPDATE
    socket.on("chat_status_updated", (data) => {
      const { status, senderName, receiverName, role } = data;

      let message = "";

      // 👤 BORROWER
      if (role === "borrower") {
        if (status === "accepted") {
          message = `Lender (${receiverName}) accepted your request. You can start chatting`;
        } else if (status === "rejected") {
          message = `Lender (${receiverName}) rejected your request`;
        } else {
          message = `Request to ${receiverName} is pending`;
        }
      }

      // 👤 LENDER
      if (role === "lender") {
        message = `New request received from ${senderName}`;
      }

      const newNotif = {
        id: Date.now().toString(),
        title: "Chat Update",
        message,
        type: status === "accepted" ? "success" : "warning",
        time: "Now",
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveNotifications(updated);
        return updated;
      });
    });

    // 🔥 RENT CONFIRMED
    socket.on("rent_confirmed", (data) => {
      const newNotif = {
        id: Date.now().toString(),
        title: "Rent Confirmed",
        message: "Your booking is confirmed. Pickup location shared.",
        type: "contract",
        time: "Now",
        read: false,
        navigateTo: "MyBookings",
        params: { bookingId: data?.bookingId },
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveNotifications(updated);
        return updated;
      });
    });

    // 🔥 CAR EVENTS
    socket.on("car_updated", (data) => {
      const newNotif = {
        id: Date.now().toString(),
        title: "Car Updated",
        message: `Car "${data.carName}" updated successfully`,
        type: "contract",
        time: "Now",
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveNotifications(updated);
        return updated;
      });
    });

    socket.on("car_listed", (data) => {
      const newNotif = {
        id: Date.now().toString(),
        title: "Car Listed",
        message: `Your car "${data.carName}" is now live 🚗`,
        type: "success",
        time: "Now",
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveNotifications(updated);
        return updated;
      });
    });

    return () => {
      socket.off("chat_status_updated");
      socket.off("rent_confirmed");
      socket.off("car_updated");
      socket.off("car_listed");
    };
  }, []);

  // ================= HANDLE CLICK =================
  const handleNotificationPress = (item) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === item.id ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });

    if (item.navigateTo) {
      navigation.navigate(item.navigateTo, item.params || {});
    }
  };

  // ================= MARK ALL =================
  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  // ================= ICON =================
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      case "contract":
        return { name: "document-text", color: theme.primary };
      case "warning":
        return { name: "alert-circle", color: "#F59E0B" };
      default:
        return { name: "notifications", color: theme.subText };
    }
  };

  // ================= RENDER =================
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
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconData.color + "15" },
          ]}
        >
          <Ionicons name={iconData.name} size={24} color={iconData.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={[styles.title, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.time, { color: theme.subText }]}>
              {item.time}
            </Text>
          </View>
          <Text
            style={[styles.message, { color: theme.subText }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar showBackButton title="Notifications" />

      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Updates</Text>
        {notifications.some((n) => !n.read) && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ color: theme.primary, fontWeight: "600" }}>
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
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={80}
            color={theme.subText}
            style={{ opacity: 0.2 }}
          />
          <Text style={[styles.emptyText, { color: theme.subText }]}>
            All caught up!
          </Text>
          <Text style={[styles.emptySubText, { color: theme.subText }]}>
            No new notifications found.
          </Text>
        </View>
      )}
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  header: { fontSize: 22, fontWeight: "bold" },
  list: { padding: 20 },
  card: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { flex: 1, marginLeft: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontWeight: "bold" },
  message: { marginTop: 5 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});