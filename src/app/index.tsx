import { Redirect } from "expo-router";

import { ROUTE_AUTH_LOGIN, ROUTE_PROTECTED_HOME } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks";
import { LoadingScreen } from "@/src/presentation";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Redirect
      href={isAuthenticated ? ROUTE_PROTECTED_HOME : ROUTE_AUTH_LOGIN}
    />
  );
}
