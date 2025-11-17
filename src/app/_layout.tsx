import { AccountProvider, AuthProvider, CardProvider } from "@/src/hooks";
import { Stack } from "expo-router";

import "@/src/services/firebase";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AccountProvider>
        <CardProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </CardProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
