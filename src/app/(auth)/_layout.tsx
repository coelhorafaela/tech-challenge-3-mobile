import { Redirect, Stack } from "expo-router";

import { ROUTE_PROTECTED_HOME } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks";
import { LoadingScreen } from "@/src/presentation";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href={ROUTE_PROTECTED_HOME} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
