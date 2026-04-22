import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 🔐 AUTH SCREENS
import OnboardingScreen from "../components/OnboardingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";

// 👤 USER / PROFILE
import AvatarPicker from "../src/components/common/AvatarPicker";
import ProfileScreen from "../src/components/common/ProfileScreen";
import NotificationScreen from "../src/components/common/NotificationScreen";
import KYCMasterScreen from "../src/kyc/KYCMasterScreen";

// 🚗 MAIN APP
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import CarDetailScreen from "../screens/cars/CarDetailScreen";
import AddOrUpdateCarScreen from "../screens/cars/AddOrUpdateCarScreen";
import CarActionScreen from "../screens/cars/CarActionScreen";

// 📄 FEATURES
import ContractsScreen from "../screens/contracts/ContractsScreen";
import TrackingScreen from "../screens/tracking/TrackingScreen";
import TransactionsScreen from "../screens/transactions/TransactionsScreen";

// 💬 CHAT + OFFERS
import ChatListScreen from "../screens/chat/ChatListScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import CreateOfferScreen from "../screens/offers/CreateOfferScreen";
import OfferDetailsScreen from "../screens/offers/OfferDetailsScreen";
import CheckoutScreen from "../screens/payment/CheckoutScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const storedUser = await AsyncStorage.getItem("userData");

        if (token && storedUser) {
          setIsLoggedIn(true);
          setUserData(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log("SESSION RESTORE ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {!isLoggedIn ? (
          // 🔐 AUTH FLOW
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />

            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  setIsLoggedIn={setIsLoggedIn}
                  setUserData={setUserData}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          // 🚀 MAIN APP FLOW
          <>
            {/* 🏠 Dashboard */}
            <Stack.Screen name="Dashboard" component={DashboardScreen} />

            {/* 🚗 Car Flow */}
            <Stack.Screen name="CarDetails" component={CarDetailScreen} />
            <Stack.Screen name="CarAction" component={CarActionScreen} />
            <Stack.Screen name="AddOrUpdateCar" component={AddOrUpdateCarScreen} />

            {/* 📄 Features */}
            <Stack.Screen name="Contracts" component={ContractsScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />

            {/* 💬 Chat Flow */}
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />

            {/* 💰 Offer Flow */}
            <Stack.Screen name="CreateOfferScreen" component={CreateOfferScreen} />
            <Stack.Screen name="OfferDetailsScreen" component={OfferDetailsScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />

            {/* 👤 Profile */}
            <Stack.Screen name="Profile">
              {(props) => (
                <ProfileScreen
                  {...props}
                  setIsLoggedIn={setIsLoggedIn}
                  userData={userData}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Notifications" component={NotificationScreen} />
            <Stack.Screen name="KYCMaster" component={KYCMasterScreen} />
            <Stack.Screen name="AvatarPicker" component={AvatarPicker} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}