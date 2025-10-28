import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OnboardingScreen from "../components/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import OwnerNavigator from "../src/navigation/OwnerNavigator";
import RenterNavigator from "../src/navigation/RenterNavigator";
import KYCNavigator from "../src/navigation/KYCNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null); // stores name, email, role

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
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
          </>
        ) : userData?.role === "Owner" ? (
          <>
            <Stack.Screen name="OwnerApp">
              {(props) => (
                <OwnerNavigator
                  {...props}
                  userData={userData}
                  setIsLoggedIn={setIsLoggedIn}
                />
              )}
            </Stack.Screen>

            {/* ✅ KYCFlow now passes rootNavigation */}
            <Stack.Screen name="KYCFlow">
              {(props) => (
                <KYCNavigator
                  {...props}
                  rootNavigation={props.navigation} // 🔥 key fix
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="RenterApp">
              {(props) => (
                <RenterNavigator
                  {...props}
                  userData={userData}
                  setIsLoggedIn={setIsLoggedIn}
                />
              )}
            </Stack.Screen>

            {/* Renter KYC flow (optional) */}
            <Stack.Screen name="KYCFlow">
              {(props) => (
                <KYCNavigator
                  {...props}
                  rootNavigation={props.navigation} // keep consistent
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
