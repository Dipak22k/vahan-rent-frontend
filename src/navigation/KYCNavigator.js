import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import KYCEmail from "../../kyc/KYCEmail";
import KYCPhone from "../../kyc/KYCPhone";
import KYCIdentity from "../../kyc/KYCIdentity";
import KYCAddress from "../../kyc/KYCAddress";
import KYCReview from "../../kyc/KYCReview";

const Stack = createNativeStackNavigator();

export default function KYCNavigator({ rootNavigation }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KYCEmail" component={KYCEmail} />
      <Stack.Screen name="KYCPhone" component={KYCPhone} />
      <Stack.Screen name="KYCIdentity" component={KYCIdentity} />
      <Stack.Screen name="KYCAddress" component={KYCAddress} />

      {/* ✅ Pass down rootNavigation to KYCReview */}
      <Stack.Screen name="KYCReview">
        {(props) => <KYCReview {...props} rootNavigation={rootNavigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
