import { AccountProvider } from "@/src/hooks/useAccount";
import { AuthProvider } from "@/src/hooks/useAuth";
import { CardProvider } from "@/src/hooks/useCards";
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
