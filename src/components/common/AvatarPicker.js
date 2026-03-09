import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Dummy Avatar URLs - You can replace these with your own assets
const AVATARS = [
  { id: "1", uri: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png" },
  { id: "2", uri: "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" },
  { id: "3", uri: "https://cdn-icons-png.flaticon.com/512/4140/4140061.png" },
  { id: "4", uri: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png" },
  { id: "5", uri: "https://cdn-icons-png.flaticon.com/512/1154/1154416.png" },
  { id: "6", uri: "https://cdn-icons-png.flaticon.com/512/1154/1154473.png" },
  { id: "7", uri: "https://cdn-icons-png.flaticon.com/512/4333/4333609.png" },
  { id: "8", uri: "https://cdn-icons-png.flaticon.com/512/219/219983.png" },
  { id: "9", uri: "https://cdn-icons-png.flaticon.com/512/219/219969.png" },
];

export default function AvatarPicker({ navigation, route }) {
  const { setProfileImage } = route.params;

  const handleSelect = (uri) => {
    setProfileImage(uri); // This updates the state in ProfileScreen
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Avatar</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={AVATARS}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => handleSelect(item.uri)}
          >
            <Image source={{ uri: item.uri }} style={styles.avatarImage} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1E3A8A" },
  list: { padding: 15, alignItems: "center" },
  avatarWrapper: {
    margin: 10,
    padding: 10,
    borderRadius: 60,
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatarImage: { width: 80, height: 80 },
});
