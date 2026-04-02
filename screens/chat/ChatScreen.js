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
import { Alert } from "react-native";
import io from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import TopBar from "../../src/components/common/TopBar";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../../src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const socket = io("http://10.122.71.15:5000");
const { width } = Dimensions.get("window");

export default function ChatScreen() {
  const route = useRoute();
  const { theme } = useTheme();
  const flatListRef = useRef();
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["40%"], []);

  const { chatId, currentUser, otherUser } = route.params;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [chatStatus, setChatStatus] = useState("pending");
  const [kycStatus, setKycStatus] = useState("not_started");

  // ✅ FIX: added missing state
  const [finalStatus, setFinalStatus] = useState("pending");

  const openSheet = useCallback(() => {
    if (chatStatus !== "accepted" || finalStatus !== "confirmed") return;
    setIsSheetOpen(true);
    bottomSheetRef.current?.expand();
  }, [chatStatus, finalStatus]);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
    bottomSheetRef.current?.close();
  }, []);

  // 🔥 SOCKET CONNECTION
  useEffect(() => {
    if (!chatId) return;

    socket.emit("join_chat", chatId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat_status_updated", (data) => {
      if (data.chatId === chatId) {
        setChatStatus(data.status);
        if (data.finalStatus) {
          setFinalStatus(data.finalStatus);
        }
      }
    });

    socket.on("rent_confirmed", (data) => {
      if (data.chatId === chatId) {
        setFinalStatus("confirmed");
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("chat_status_updated");
      socket.off("rent_confirmed"); // ✅ cleanup added
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

  /* CHECK KYC */
  useEffect(() => {
  const checkKYC = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));

      if (userData?.kyc?.status) {
        setKycStatus(userData.kyc.status);
      }
    } catch (err) {
      console.log("KYC LOAD ERROR", err);
    }
  };

  checkKYC();
}, []);



  const handlePickImage = async () => {
    if (
  !message.trim() ||
  chatStatus !== "accepted" ||
  kycStatus !== "verified"
) {
  if (kycStatus !== "verified") {
    Alert.alert(
      "KYC Required",
      kycStatus === "pending"
        ? "Your KYC is under review ⏳"
        : kycStatus === "rejected"
        ? "KYC failed ❌ Please try again"
        : "Please complete KYC first"
    );
  }
  return;
}

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

  // ✅ FIX: added location sender
  const handleSendLocation = () => {
    if (finalStatus !== "confirmed") return;

    const msgData = {
      chatId,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      type: "location",
      location: {
        lat: 18.5204,
        lng: 73.8567,
        address: "Pune, India",
      },
      createdAt: new Date(),
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
  };

  // ================= OFFER ACTIONS =================
const handleAcceptOffer = async (offerId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    const res = await fetch(`http://192.168.1.21:5000/api/offers/${offerId}/accept`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    Alert.alert("Success", "Offer accepted");

  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

const handleRejectOffer = async (offerId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    const res = await fetch(`http://192.168.1.21:5000/api/offers/${offerId}/reject`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    Alert.alert("Reject", "Offer Rejected");

  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === currentUser.id;
    // ================= OFFER MESSAGE =================
if (item.type === "offer") {
  const offerId = item.metadata?.offerId;

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
          { backgroundColor: "#EEF2FF" },
        ]}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
          🚗 Rental Offer
        </Text>

        <Text>Price: ₹1500</Text>
        <Text>Duration: 2 days</Text>

        {/* SHOW BUTTONS ONLY FOR BORROWER */}
        {item.receiverId === currentUser.id && (
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "green",
                padding: 8,
                borderRadius: 6,
                marginRight: 10,
              }}
              onPress={() => handleAcceptOffer(offerId)}
            >
              <Text style={{ color: "#fff" }}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "red",
                padding: 8,
                borderRadius: 6,
              }}
              onPress={() => handleRejectOffer(offerId)}
            >
              <Text style={{ color: "#fff" }}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

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

          {/* ✅ Optional: location display */}
          {item.type === "location" && (
            <Text style={{ color: isMine ? "#fff" : theme.text }}>
              📍 {item.location?.address}
            </Text>
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

      <View style={styles.inputOuterContainer}>
        <View style={[styles.inputInnerContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            onPress={openSheet}
            style={styles.iconButton}
            disabled={chatStatus !== "accepted" || finalStatus !== "confirmed"}
          >
            <Ionicons name="add-circle" size={28} color={theme.primary} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Write a message..."
            placeholderTextColor={theme.subText}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={chatStatus === "accepted" && kycStatus === "verified"}
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
            disabled={
                !message.trim() ||
                chatStatus !== "accepted" ||
                kycStatus !== "verified"
              }
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
        <BottomSheetView style={{ padding: 20 }}>
          <TouchableOpacity onPress={handlePickImage}>
            <Text>🖼 Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSendLocation}>
            <Text>📍 Location</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}