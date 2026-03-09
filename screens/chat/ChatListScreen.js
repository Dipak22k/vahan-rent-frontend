import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import TopBar from "../../src/components/common/TopBar";
import BottomNav from "../../src/components/common/BottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ChatListScreen({ navigation }) {
  const { theme } = useTheme();

  const CHATS = [
    {
      id: "demo_chat_1",
      name: "Support Team",
      lastMsg: "Your rental agreement is verified.",
      time: "10:25 AM",
      unread: 1,
      online: true,
      initial: "S",
    },
    {
      id: "demo_chat_2",
      name: "Dipak Kongari",
      lastMsg: "I've reached the pickup location.",
      time: "Yesterday",
      unread: 0,
      online: false,
      initial: "D",
    },
  ];

  const openChat = (chat) => {
    navigation.navigate("Chat", {
      chatId: chat.id,
      currentUser: { id: "user_1", name: "You" },
      otherUser: { id: chat.id, name: chat.name },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar showBackButton title="Messages" />

      {/* ✅ Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="search-outline" size={20} color={theme.subText} style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={theme.subText}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: theme.subText }]}>Recent Chats</Text>
        
        {CHATS.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            activeOpacity={0.7}
            style={[styles.chatItem, { backgroundColor: theme.card }]}
            onPress={() => openChat(chat)}
          >
            {/* Avatar with Online Status */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>{chat.initial}</Text>
              </View>
              {chat.online && <View style={styles.onlineDot} />}
            </View>

            {/* Chat Details */}
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatName, { color: theme.text }]} numberOfLines={1}>
                  {chat.name}
                </Text>
                <Text style={[styles.chatTime, { color: theme.subText }]}>{chat.time}</Text>
              </View>

              <View style={styles.msgRow}>
                <Text style={[styles.chatPreview, { color: theme.subText }]} numberOfLines={1}>
                  {chat.lastMsg}
                </Text>
                {chat.unread > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav currentTab="Chat" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    height: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 4,
  },

  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "800",
  },

  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "white",
  },

  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },

  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chatName: {
    fontSize: 17,
    fontWeight: "700",
    maxWidth: width * 0.4,
  },

  chatTime: {
    fontSize: 12,
    fontWeight: "500",
  },

  msgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  chatPreview: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  unreadText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },
});