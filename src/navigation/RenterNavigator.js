import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import SearchCars from "../components/common/SearchCars";
import RenterDashboard from "../../renter/RenterDashboard";
import RenterTracking from "../../renter/RenterTracking";
import RenterHistory from "../../renter/RenterHistory";
import RenterContracts from "../../renter/RenterContracts";
import RenterInsurance from "../../renter/RenterInsurance";
import ProfileScreen from "../components/common/ProfileScreen";
import NotificationScreen from "../components/common/NotificationScreen"; // ✅ Added
import ViewDetails from "../components/common/ViewDetails";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const RenterTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#00C2A8",
      tabBarStyle: { backgroundColor: "#0B1B2B", height: 65 },
      tabBarLabelStyle: { fontSize: 12, marginBottom: 5 },
    }}
  >
    <Tab.Screen
      name="Home"
      component={RenterDashboard}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Tracking"
      component={RenterTracking}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="navigate" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="History"
      component={RenterHistory}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Contracts"
      component={RenterContracts}
      options={{
        tabBarIcon: ({ color }) => (
          <Ionicons name="document-text" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Insurance"
      component={RenterInsurance}
      options={{
        tabBarIcon: ({ color }) => (
          <Ionicons name="shield-checkmark" size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default function RenterNavigator({ setIsLoggedIn, userData }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RenterTabs" component={RenterTabs} />
      <Stack.Screen name="CarDetails" component={ViewDetails} />
      <Stack.Screen name="SearchCars" component={SearchCars} />


      {/* ✅ Added Notification screen route */}
      <Stack.Screen name="Notifications" component={NotificationScreen} />

      {/* ✅ Profile screen */}
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
