import React, { useState, useEffect } from "react";
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
import io from "socket.io-client";
import CONFIG from "../../src/api/config";

const socket = io(CONFIG.BASE_URL);
const { width } = Dimensions.get("window");

export default function ChatListScreen({ navigation }) {
  const { theme } = useTheme();

  const [chats, setChats] = useState([]);

  // 🔥 Replace with logged-in user
  const currentUserId = "user_1";

  // ============================
  // FETCH CHATS FROM BACKEND
  // ============================
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${CONFIG.BASE_URL}/api/chat`);
        const data = await res.json();

        const formatted = data.map((chat) => {
          const otherUser =
            chat.borrowerId._id === currentUserId
              ? chat.lenderId
              : chat.borrowerId;

          return {
            _id: chat._id,
            name: otherUser.name || "User",
            lastMsg: "Start conversation",
            time: "",
          };
        });

        setChats(formatted);
      } catch (err) {
        console.log("Fetch chats error:", err);
      }
    };

    fetchChats();
  }, []);

  // ============================
  // REAL-TIME MESSAGE UPDATE
  // ============================
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setChats((prev) => {
        const updated = [...prev];

        const index = updated.findIndex(
          (c) => c._id === msg.chatId
        );

        if (index !== -1) {
          updated[index].lastMsg =
            msg.text || msg.image ? "📷 Image" : "📍 Location";
          updated[index].time = "Now";

          const chat = updated.splice(index, 1)[0];
          updated.unshift(chat);
        }

        return updated;
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // ============================
  const openChat = (chat) => {
    navigation.navigate("Chat", {
      chatId: chat._id,
      currentUser: { id: currentUserId, name: "You" },
      otherUser: { id: chat._id, name: chat.name },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar showBackButton title="Messages" />

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="search-outline" size={20} color={theme.subText} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={theme.subText}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {chats.map((chat) => (
          <TouchableOpacity
            key={chat._id}
            style={[styles.chatItem, { backgroundColor: theme.card }]}
            onPress={() => openChat(chat)}
          >
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatName, { color: theme.text }]}>
                  {chat.name}
                </Text>
                <Text style={[styles.chatTime, { color: theme.subText }]}>
                  {chat.time}
                </Text>
              </View>

              <Text
                style={[styles.chatPreview, { color: theme.subText }]}
                numberOfLines={1}
              >
                {chat.lastMsg}
              </Text>
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
  searchSection: { padding: 20 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    padding: 10,
  },
  searchInput: { marginLeft: 10, flex: 1 },
  content: { padding: 20 },
  chatItem: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  chatInfo: { flex: 1 },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatName: { fontWeight: "700", fontSize: 16 },
  chatTime: { fontSize: 12 },
  chatPreview: { marginTop: 5 },
});