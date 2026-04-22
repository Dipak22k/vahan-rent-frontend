import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // ============================
  // LOAD USER
  // ============================
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("userData");
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUserId(user._id);
        setCurrentUserRole(user.role);
      }
    };
    loadUser();
  }, []);

  // ============================
  // FETCH CHATS
  // ============================
  const fetchChats = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const res = await fetch(`${CONFIG.BASE_URL}/api/chat`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const formatted = data.map((chat) => {
        if (!currentUserId) return null;

        const isBorrower = chat.borrowerId?._id === currentUserId;
        const otherUser = isBorrower ? chat.lenderId : chat.borrowerId;

        return {
          _id: chat._id,
          name: otherUser?.name || "User",
          avatar: otherUser?.avatar || null,
          userId: otherUser?._id,

          status: chat.status,
          isBorrower,
          isLender: !isBorrower,

          lastMsg: chat.lastMsg || "Start conversation",
          time: chat.time || "",

          lenderId: chat.lenderId?._id || chat.lenderId,
          borrowerId: chat.borrowerId?._id || chat.borrowerId,

          // ✅ IMPORTANT: initialize unread
          unreadCount: chat.unreadCount || 0,
        };
      }).filter(Boolean);

      // ✅ FIX: ONLY ONE setChats
      setChats((prev) => {
        return formatted.map((newChat) => {
          const existing = prev.find((c) => c._id === newChat._id);

          return {
            ...newChat,
            unreadCount:
              existing?.unreadCount ?? newChat.unreadCount ?? 0,
          };
        });
      });
    } catch (err) {
      console.log("Fetch chats error:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        fetchChats();
      }
    }, [currentUserId])
  );

  // ============================
  // SOCKET JOIN
  // ============================
  useEffect(() => {
    if (currentUserId) {
      socket.emit("join_user", currentUserId);
    }
  }, [currentUserId]);

  // ============================
  // REAL-TIME UPDATE
  // ============================
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setChats((prev) => {
        const updated = [...prev];

        const index = updated.findIndex(
          (c) => c._id === msg.chatId
        );

        if (index !== -1) {
          const chat = updated[index];

          // Last message
          chat.lastMsg =
            msg.text || msg.image
              ? msg.image
                ? "📷 Image"
                : msg.text
              : "📍 Location";

          chat.time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          // ✅ FIX: unread logic (only for receiver)
          if (String(msg.senderId) !== String(currentUserId)) {
            chat.unreadCount = (chat.unreadCount || 0) + 1;
          }

          // move to top
          updated.splice(index, 1);
          updated.unshift(chat);
        }

        return updated;
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, [currentUserId]);

  // ============================
  // ACCEPT / REJECT
  // ============================
  const updateStatus = async (chatId, status) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const res = await fetch(
        `${CONFIG.BASE_URL}/api/chat/${chatId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      fetchChats();
    } catch (err) {
      console.log("ERROR:", err.message);
    }
  };

  // ============================
  // OPEN CHAT
  // ============================
  const openChat = (chat) => {
    if (chat.status !== "accepted") return;

    // ✅ RESET unread
    setChats((prev) =>
      prev.map((c) =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );

    navigation.navigate("Chat", {
      chatId: chat._id,
      currentUser: { id: currentUserId, role: currentUserRole },
      otherUser: { id: chat.userId, name: chat.name },
      lenderId: chat.lenderId,
      borrowerId: chat.borrowerId,
    });
  };

  // ============================
  // UI
  // ============================
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar showBackButton title="Messages" />

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
        {chats.map((chat) => {
          const isLender = chat.isLender;

          return (
            <TouchableOpacity
              key={chat._id}
              style={[styles.chatItem, { backgroundColor: theme.card }]}
              onPress={() => openChat(chat)}
              disabled={chat.status !== "accepted"}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={
                    chat.avatar
                      ? {
                          uri: `${CONFIG.BASE_URL}/${chat.avatar.replace(
                            /^\/+/,
                            ""
                          )}`,
                        }
                      : require("../../assets/default-avatar.png")
                  }
                  style={styles.avatar}
                />

                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={[styles.chatName, { color: theme.text }]}>
                      {chat.name}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ color: theme.subText, fontSize: 12 }}>
                        {chat.time || ""}
                      </Text>

                      {/* ✅ UNREAD BADGE */}
                      {chat.unreadCount > 0 && (
                        <View
                          style={{
                            backgroundColor: "#25D366",
                            borderRadius: 12,
                            minWidth: 24,
                            height: 24,
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          >
                            {chat.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[styles.chatPreview, { color: theme.subText }]}
                    numberOfLines={1}
                  >
                    {chat.status === "pending"
                      ? chat.isBorrower
                        ? "Waiting for lender approval..."
                        : "New request received"
                      : chat.status === "rejected"
                      ? "Request rejected"
                      : chat.lastMsg}
                  </Text>

                  {isLender && chat.status === "pending" && (
                    <View style={{ flexDirection: "row", marginTop: 8 }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#10B981",
                          padding: 6,
                          borderRadius: 6,
                          marginRight: 10,
                        }}
                        onPress={() => updateStatus(chat._id, "accepted")}
                      >
                        <Text style={{ color: "#fff" }}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: "#EF4444",
                          padding: 6,
                          borderRadius: 6,
                        }}
                        onPress={() => updateStatus(chat._id, "rejected")}
                      >
                        <Text style={{ color: "#fff" }}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BottomNav currentTab="Chat" />
    </View>
  );
}

// ============================
// STYLES (UNCHANGED)
// ============================
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
  chatPreview: { marginTop: 5 },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
});