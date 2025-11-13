import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { ROUTE_AUTH_LOGIN, ROUTE_PROTECTED_HOME } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";

export default function Index() {
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

  return (
    <Redirect
      href={isAuthenticated ? ROUTE_PROTECTED_HOME : ROUTE_AUTH_LOGIN}
    />
  );
}
