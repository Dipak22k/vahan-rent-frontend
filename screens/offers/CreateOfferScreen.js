import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import CONFIG from "../../src/api/config";

export default function CreateOfferScreen({ route, navigation }) {
  const { chatId } = route.params;
  const { theme } = useTheme();

  const [pricePerDay, setPricePerDay] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
  new Date(Date.now() + 24 * 60 * 60 * 1000) // +1 day
);
  
  // Picker visibility states
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formatting helpers
  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateTotal = useMemo(() => {
    const price = parseFloat(pricePerDay);
    if (isNaN(price)) return 0;
    
    // Calculate difference in days
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
    
    return price * diffDays;
  }, [pricePerDay, startDate, endDate]);

  const handleSubmit = async () => {
    if (!pricePerDay) {
      alert("Please enter a price");
      return;

    }
    if (startDate >= endDate) {
  alert("End date must be after start date");
  return;
}

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${CONFIG.BASE_URL}/api/offers/create`,
        { 
          chatId, 
          pricePerDay, 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString(),
          currency: "INR" 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Offer sent successfully!");
      navigation.goBack();

// 👇 force refresh chat
setTimeout(() => {
  navigation.navigate("Chat", {
    chatId,
    currentUser: route.params.currentUser,
    otherUser: route.params.otherUser,
  });
}, 200);
    } catch (err) {
  console.log("CREATE OFFER ERROR:", err.response?.data || err.message);
  alert(err.response?.data?.message || "Error creating offer");
} finally {
      setLoading(false);
    }   
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Offer</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.label, { color: theme.text }]}>Price Per Day</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
              <Text style={[styles.currencyPrefix, { color: theme.text }]}>₹</Text>
              <TextInput
                placeholder="0"
                keyboardType="numeric"
                value={pricePerDay}
                onChangeText={setPricePerDay}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            <View style={styles.row}>
              {/* START DATE */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.label, { color: theme.text }]}>Start Date</Text>
                <TouchableOpacity 
                  style={[styles.inputWrapper, { borderColor: theme.border }]} 
                  onPress={() => setStartPickerVisibility(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: theme.text }}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
              </View>

              {/* END DATE */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>End Date</Text>
                <TouchableOpacity 
                  style={[styles.inputWrapper, { borderColor: theme.border }]} 
                  onPress={() => setEndPickerVisibility(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: theme.text }}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryTotal}>₹{calculateTotal.toLocaleString('en-IN')}</Text>
            <Text style={{ color: '#2E7D32', opacity: 0.6, fontSize: 12, marginTop: 4 }}>
              Includes all taxes and fees
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>{loading ? "Sending..." : "Send Offer"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* PICKER MODALS */}
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        onConfirm={(date) => {
          setStartDate(date);
          setStartPickerVisibility(false);
        }}
        onCancel={() => setStartPickerVisibility(false)}
      />

      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        minimumDate={startDate} // Prevents picking an end date before start date
        onConfirm={(date) => {
          setEndDate(date);
          setEndPickerVisibility(false);
        }}
        onCancel={() => setEndPickerVisibility(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { padding: 20 },
  card: { padding: 20, borderRadius: 16, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 8, marginTop: 15, textTransform: 'uppercase', opacity: 0.6 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 54 },
  currencyPrefix: { fontSize: 20, fontWeight: "600", marginRight: 5 },
  input: { flex: 1, fontSize: 18, fontWeight: '600' },
  row: { flexDirection: "row", marginTop: 5 },
  summaryCard: { marginTop: 30, padding: 24, borderRadius: 20, backgroundColor: "#E8F5E9", alignItems: "center", borderWidth: 1, borderColor: "#A5D6A7" },
  summaryLabel: { color: "#2E7D32", fontWeight: "600", fontSize: 14 },
  summaryTotal: { color: "#1B5E20", fontWeight: "800", fontSize: 36, marginTop: 4 },
  footer: { padding: 20, borderTopWidth: 1 },
  submitBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});