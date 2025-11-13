import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { ROUTE_AUTH_LOGIN } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F6FA",
        }}
      >
        <ActivityIndicator size="large" color="#294FC1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTE_AUTH_LOGIN} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
