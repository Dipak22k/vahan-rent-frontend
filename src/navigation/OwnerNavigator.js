import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OwnerDashboard from "../../owner/OwnerDashboard";
import OwnerTracking from "../../owner/OwnerTracking";
import OwnerHistory from "../../owner/OwnerHistory";
import OwnerContracts from "../../owner/OwnerContracts";
import OwnerInsurance from "../../owner/OwnerInsurance";
import ProfileScreen from "../components/common/ProfileScreen";
import AddCarScreen from "../components/common/AddCarScreen";
import NotificationScreen from "../components/common/NotificationScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const OwnerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#00C2A8",
      tabBarStyle: { backgroundColor: "#0B1B2B", height: 65 },
      tabBarLabelStyle: { fontSize: 12, marginBottom: 5 },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={OwnerDashboard}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Tracking"
      component={OwnerTracking}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="navigate" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="History"
      component={OwnerHistory}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Contracts"
      component={OwnerContracts}
      options={{
        tabBarIcon: ({ color }) => (
          <Ionicons name="document-text" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Insurance"
      component={OwnerInsurance}
      options={{
        tabBarIcon: ({ color }) => (
          <Ionicons name="shield-checkmark" size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default function OwnerNavigator({ setIsLoggedIn, userData }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="AddCar" component={AddCarScreen} />

      <Stack.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            userData={userData}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
