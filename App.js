import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import AppNavigator from "./navigation/AppNavigator";
import { RoleProvider } from "./src/context/RoleContext";
import { ThemeProvider } from "./src/context/ThemeContext";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const savedUser = await AsyncStorage.getItem("userData");

      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserData(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.log("Failed to load session", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#003580" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RoleProvider>
          <AppNavigator
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            userData={userData}
            setUserData={setUserData}
          />
        </RoleProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}