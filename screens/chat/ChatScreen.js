  import React, { useEffect, useState, useRef, useMemo } from "react";
  import { useFocusEffect } from "@react-navigation/native";
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
    StatusBar,
    SafeAreaView,
  } from "react-native";
  import { Ionicons } from "@expo/vector-icons";
  import io from "socket.io-client";
  import * as ImagePicker from "expo-image-picker";
  import { useRoute, useNavigation } from "@react-navigation/native";
  import { useTheme } from "../../src/context/ThemeContext";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
  import CONFIG from "../../src/api/config";

  const socket = io(CONFIG.BASE_URL);
  const { width } = Dimensions.get("window");

  export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const flatListRef = useRef();
    const bottomSheetRef = useRef(null);

    const { chatId, currentUser, otherUser } = route.params;
    const isLender = currentUser.role === "lender";

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatStatus, setChatStatus] = useState("pending");

    // Auto-scroll to bottom
    useEffect(() => {
      if (messages.length > 0) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    }, [messages]);

    const fetchChatStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await fetch(`${CONFIG.BASE_URL}/api/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const chat = data.find((c) => c._id === chatId);
        if (chat) setChatStatus(chat.status);
      } catch (err) {
        console.log("STATUS FETCH ERROR:", err);
      }
    };

    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await fetch(`${CONFIG.BASE_URL}/api/chat/messages/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.log("FETCH ERROR:", err);
      }
    };

    useEffect(() => {
    if (!chatId) return;
    fetchMessages();
    fetchChatStatus();
    socket.emit("join_chat", chatId);

    socket.on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    socket.on("chat_status_updated", (data) => {
      if (data.chatId === chatId) setChatStatus(data.status);
    });

    return () => {
      socket.off("receive_message");
      socket.off("chat_status_updated");
    };
  }, [chatId]);

  // ✅ ADD THIS RIGHT AFTER useEffect


  useFocusEffect(
    React.useCallback(() => {
      fetchMessages(); // 👈 refresh chat when screen comes back
    }, [chatId])
  );
const handleSend = async () => {
  if (!message.trim() || chatStatus !== "accepted") return;

  try {
    const token = await AsyncStorage.getItem("userToken");

    console.log("SEND API HIT");

    // ✅ CALL BACKEND (IMPORTANT)
    const res = await fetch(`${CONFIG.BASE_URL}/api/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
 body: JSON.stringify({
  chatId,
  text: message,
  receiverId: otherUser.id, // ✅ ADD THIS
}),
    });

    const savedMessage = await res.json();

    // ✅ Emit socket AFTER saving
    socket.emit("send_message", savedMessage);

    // ✅ Update UI
    setMessages((prev) => [...prev, savedMessage]);
    setMessage("");

  } catch (err) {
    console.log("SEND ERROR:", err);
  }
};

    const updateStatus = async (status) => {
      const token = await AsyncStorage.getItem("userToken");
      await fetch(`${CONFIG.BASE_URL}/api/chat/${chatId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchChatStatus();
    };

    const handleCreateOffer = () => {
    bottomSheetRef.current?.close();

    navigation.navigate("CreateOfferScreen", {
  chatId,
  currentUser,
  otherUser,
});
  };

  const handleOpenOffer = (offerId) => {
    navigation.navigate("OfferDetailsScreen", { offerId });
  };

  const renderItem = ({ item }) => {
    const isMine = item.senderId === currentUser.id;

    // ✅ HANDLE SYSTEM MESSAGES FIRST
if (item.type === "system") {
  if (item.metadata?.action === "OFFER_REJECTED") {
    return (
      <View
        style={{
          alignItems: "center",
          marginVertical: 8,
        }}
      >
        <Text
          style={{
            color: "gray",
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          {item.senderId === currentUser.id
            ? "You rejected the offer"
            : `${otherUser.name} rejected the offer`}
        </Text>
      </View>
    );
  }
}

    // ✅ ADD THIS BLOCK FIRST
    if (item.type === "offer") {
      return (
        <View 
          style={[
            styles.messageContainer,
            isMine ? styles.myMsg : styles.theirMsg,
          ]}
        >
          <View
            style={{
              padding: 10,
              backgroundColor: "#e6ffe6",
              borderRadius: 10,
              maxWidth: width * 0.75,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>💰 Offer</Text>
            <Text>Tap to view details</Text>

            <TouchableOpacity
              onPress={() => handleOpenOffer(item.metadata.offerId)}
            >
              <Text style={{ color: "blue", marginTop: 5 }}>
                View Offer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ✅ NORMAL MESSAGE (existing code)
    return (
      <View style={[styles.messageContainer, isMine ? styles.myMsg : styles.theirMsg]}>
        <View
          style={[
            styles.bubble,
            isMine
              ? { backgroundColor: theme.primary }
              : { backgroundColor: theme.card },
            isMine ? styles.myBubbleBorder : styles.theirBubbleBorder,
          ]}
        >
          {item.image ? (
            <Image
              source={{ uri: `${CONFIG.BASE_URL}${item.image}` }}
              style={styles.chatImage}
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                { color: isMine ? "#fff" : theme.text },
              ]}
            >
              {item.text}
            </Text>
          )}

          <Text
            style={[
              styles.timeText,
              { color: isMine ? "rgba(255,255,255,0.7)" : "#999" },
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" />
        
        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: theme.text }]}>{otherUser.name}</Text>
            <Text style={styles.onlineStatus}>{chatStatus === 'accepted' ? 'Online' : 'Pending'}</Text>
          </View>
        </View>

        {/* ACTION BANNER FOR LENDER */}
        {isLender && chatStatus === "pending" && (
          <View style={styles.actionBanner}>
            <Text style={styles.bannerText}>Accept this chat request to start messaging</Text>
            <View style={styles.bannerButtons}>
              <TouchableOpacity onPress={() => updateStatus("accepted")} style={[styles.bannerBtn, { backgroundColor: 'green' }]}>
                <Text style={styles.bannerBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updateStatus("rejected")} style={[styles.bannerBtn, { backgroundColor: '#ff4444' }]}>
                <Text style={styles.bannerBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />

        {/* INPUT AREA */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
          <View style={[styles.inputOuterContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            <View style={[styles.inputInnerContainer, { backgroundColor: theme.card }]}>
              <TouchableOpacity style={styles.plusBtn} onPress={() => bottomSheetRef.current?.expand()}>
                <Ionicons name="add" size={24} color={theme.primary} />
              </TouchableOpacity>
              
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={chatStatus === "accepted" ? "Type a message..." : "Waiting for approval..."}
                placeholderTextColor="#999"
                editable={chatStatus === "accepted"}
                style={[styles.input, { color: theme.text }]}
                multiline
              />


      

              <TouchableOpacity 
                onPress={handleSend} 
                disabled={!message.trim()}
                style={[styles.sendBtn, { backgroundColor: message.trim() ? theme.primary : '#ccc' }]}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
                <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={["25%"]}>
    <BottomSheetView style={{ padding: 20 }}>

              {/* Image */}
              <TouchableOpacity style={{ marginBottom: 15 }}>
                <Text>📷 Send Image</Text>
              </TouchableOpacity>

              {/* Location */}
              <TouchableOpacity style={{ marginBottom: 15 }}>
                <Text>📍 Send Location</Text>
              </TouchableOpacity>

              {/* ✅ ADD THIS */}
              {isLender && (
                <TouchableOpacity onPress={() => handleCreateOffer()}>
                  <Text style={{ fontWeight: "bold", color: "green" }}>
                    💰 Create Offer
                  </Text>
                </TouchableOpacity>
              )}

            </BottomSheetView>
          </BottomSheet>
      </SafeAreaView>
    );
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    // ================= HEADER =================
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: Platform.OS === 'ios' ? 10 : 40,
      paddingBottom: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    backBtn: {
      padding: 5,
      marginRight: 10,
    },
    headerInfo: {
      flex: 1,
    },
    headerName: {
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    onlineStatus: {
      fontSize: 12,
      color: "#4CAF50",
      fontWeight: "600",
    },

    // ================= MESSAGE LIST =================
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      paddingBottom: 40,
    },
    messageContainer: {
      marginVertical: 6,
      width: '100%',
      flexDirection: 'row',
    },
    myMsg: {
      justifyContent: 'flex-end',
    },
    theirMsg: {
      justifyContent: 'flex-start',
    },
    bubble: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: width * 0.78,
      borderRadius: 20,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    myBubbleBorder: {
      borderBottomRightRadius: 4,
    },
    theirBubbleBorder: {
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    chatImage: {
      width: 220,
      height: 160,
      borderRadius: 12,
      marginBottom: 4,
    },
    timeText: {
      fontSize: 10,
      alignSelf: 'flex-end',
      marginTop: 4,
      opacity: 0.8,
    },

    // ================= OFFER CARD =================
    offerBubble: {
      padding: 16,
      borderRadius: 18,
      width: width * 0.75,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
      backgroundColor: '#fff',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    offerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    offerTitle: {
      fontWeight: '800',
      fontSize: 16,
      marginLeft: 6,
    },
    viewOfferBtn: {
      backgroundColor: '#4CAF50',
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 5,
    },
    viewOfferText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },

    // ================= ACTION BANNER =================
    actionBanner: {
      backgroundColor: '#FFF9C4',
      padding: 16,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: '#FBC02D',
    },
    bannerText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#5D4037',
      textAlign: 'center',
    },
    bannerButtons: {
      flexDirection: 'row',
      marginTop: 12,
    },
    bannerBtn: {
      paddingHorizontal: 24,
      paddingVertical: 8,
      borderRadius: 25,
      marginHorizontal: 8,
    },
    bannerBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },

    // ================= INPUT AREA =================
    inputOuterContainer: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
    },
    inputInnerContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 30,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    plusBtn: {
      padding: 8,
    },
    input: {
      flex: 1,
      marginHorizontal: 8,
      fontSize: 16,
      maxHeight: 100,
      paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },

    // ================= BOTTOM SHEET =================
    sheetContent: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 20,
      paddingHorizontal: 10,
      paddingBottom: 40,
    },
    sheetItem: {
      alignItems: 'center',
      width: (width - 40) / 3,
    },
    sheetIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 5,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    sheetText: {
      fontSize: 13,
      fontWeight: '600',
      opacity: 0.8,
    },
  });