import { Redirect, Stack } from "expo-router";

import { ROUTE_AUTH_LOGIN } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks";
import { LoadingScreen } from "@/src/presentation";

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTE_AUTH_LOGIN} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
