import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import io from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import TopBar from "../../src/components/common/TopBar";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const socket = io("http://10.52.141.172:5000");
const { width } = Dimensions.get("window");

export default function ChatScreen() {
  const route = useRoute();
  const { theme } = useTheme();
  const flatListRef = useRef();
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["40%"], []);

  const {
    chatId,
    currentUser,
    otherUser,
  } = route.params;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [chatStatus, setChatStatus] = useState("pending");

  const openSheet = useCallback(() => {
    if (chatStatus !== "accepted") return;
    setIsSheetOpen(true);
    bottomSheetRef.current?.expand();
  }, [chatStatus]);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    bottomSheetRef.current?.close();
  }, []);

  // 🔥 REAL-TIME SOCKET CONNECTION
  useEffect(() => {
    if (!chatId) return;

    socket.emit("join_chat", chatId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat_status_updated", (data) => {
      if (data.chatId === chatId) {
        setChatStatus(data.status);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("chat_status_updated");
    };
  }, [chatId]);

  const handleSend = () => {
    if (!message.trim() || chatStatus !== "accepted") return;

    const msgData = {
      chatId,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      text: message,
      createdAt: new Date(),
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  const handlePickImage = async () => {
    if (chatStatus !== "accepted") return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const msgData = {
      chatId,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      image: result.assets[0].uri,
      createdAt: new Date(),
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === currentUser.id;

    const time = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View
        style={[
          styles.messageWrapper,
          { alignSelf: isMine ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMine ? theme.primary : theme.card,
              borderBottomRightRadius: isMine ? 4 : 20,
              borderBottomLeftRadius: isMine ? 20 : 4,
            },
          ]}
        >
          {item.text && (
            <Text
              style={[
                styles.messageText,
                { color: isMine ? "#fff" : theme.text },
              ]}
            >
              {item.text}
            </Text>
          )}

          {item.image && (
            <Image source={{ uri: item.image }} style={styles.messageImage} />
          )}

          <Text
            style={[
              styles.timeText,
              {
                color: isMine
                  ? "rgba(255,255,255,0.7)"
                  : theme.subText,
              },
            ]}
          >
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TopBar showBackButton title={otherUser?.name || "Chat"} />

      {/* STATUS BANNER */}
      {chatStatus !== "accepted" && (
        <View
          style={{
            padding: 10,
            backgroundColor:
              chatStatus === "pending" ? "#FFF4E5" : "#FFE5E5",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>
            {chatStatus === "pending"
              ? "Waiting for lender approval..."
              : "Request declined by lender."}
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View
        style={[
          styles.inputOuterContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <View
          style={[
            styles.inputInnerContainer,
            { backgroundColor: theme.card },
          ]}
        >
          <TouchableOpacity
            onPress={openSheet}
            style={styles.iconButton}
            disabled={chatStatus !== "accepted"}
          >
            <Ionicons
              name="add-circle"
              size={28}
              color={
                chatStatus === "accepted"
                  ? theme.primary
                  : "gray"
              }
            />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Write a message..."
            placeholderTextColor={theme.subText}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={chatStatus === "accepted"}
          />

          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  chatStatus === "accepted"
                    ? theme.primary
                    : "gray",
              },
            ]}
            disabled={!message.trim() || chatStatus !== "accepted"}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {isSheetOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeSheet}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={(index) => {
          if (index === -1) setIsSheetOpen(false);
        }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "600", marginBottom: 20 }}>
            Send Attachment
          </Text>

          <TouchableOpacity
            style={{ marginBottom: 15 }}
            onPress={() => {
              closeSheet();
              handlePickImage();
            }}
          >
            <Text style={{ fontSize: 15 }}>🖼 Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginBottom: 15 }} onPress={closeSheet}>
            <Text style={{ fontSize: 15 }}>📷 Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginBottom: 15 }} onPress={closeSheet}>
            <Text style={{ fontSize: 15 }}>📍 Location</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={closeSheet}>
            <Text style={{ fontSize: 15, color: "red" }}>❌ Cancel</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageWrapper: {
    maxWidth: "80%",
    marginBottom: 12,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
    fontWeight: "600",
  },
  messageImage: {
    width: width * 0.6,
    height: 200,
    borderRadius: 14,
    marginTop: 5,
  },
  inputOuterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  inputInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    maxHeight: 100,
    fontSize: 15,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    padding: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
});