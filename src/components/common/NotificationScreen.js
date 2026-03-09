import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TopBar from "./TopBar";
import { useTheme } from "../../../src/context/ThemeContext"; // ✅ THEME ACCESS

export default function NotificationScreen({ navigation }) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const sampleData = [
      {
        id: "1",
        title: "KYC Verified",
        message: "Your KYC verification was successful 🎉",
        time: "2h ago",
        type: "success",
        read: false,
      },
      {
        id: "2",
        title: "Contract Update",
        message: "Your latest contract for 'Tata Nexon' has been approved.",
        time: "5h ago",
        type: "contract",
        read: true,
      },
      {
        id: "3",
        title: "Insurance Renewal",
        message: "Your vehicle insurance expires in 3 days. Renew now to avoid penalties.",
        time: "Yesterday",
        type: "warning",
        read: true,
      },
    ];
    setNotifications(sampleData);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "success": return { name: "checkmark-circle", color: "#10B981" };
      case "contract": return { name: "document-text", color: theme.primary };
      case "warning": return { name: "alert-circle", color: "#F59E0B" };
      default: return { name: "notifications", color: theme.subText };
    }
  };

  const renderItem = ({ item, index }) => {
    const iconData = getIcon(item.type);
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[
          styles.card, 
          { 
            backgroundColor: theme.card,
            borderLeftColor: item.read ? "transparent" : theme.primary,
            borderLeftWidth: 4 
          }
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
        username=""
        onNotificationPress={() => {}}
        onProfilePress={() => navigation.navigate("Profile")}
      />
      
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Notifications</Text>
        {notifications.length > 0 && (
            <TouchableOpacity>
                <Text style={{ color: theme.primary, fontWeight: "600", fontSize: 13 }}>Mark all read</Text>
            </TouchableOpacity>
        )}
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off-outline" size={80} color={theme.subText} opacity={0.2} />
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
  header: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  time: { fontSize: 11, fontWeight: "500" },
  message: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: { fontSize: 18, fontWeight: "700", marginTop: 15 },
  emptySubText: { fontSize: 14, marginTop: 5, opacity: 0.7 },
});