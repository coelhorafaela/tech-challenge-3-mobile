import { LogBox } from "react-native";
import { Stack } from "expo-router";

import { AccountProvider } from "@/src/application/providers/account.provider";
import { AuthProvider } from "@/src/application/providers/auth.provider";
import { CardProvider } from "@/src/application/providers/card.provider";
import { TransactionProvider } from "@/src/application/providers/transaction.provider";

LogBox.ignoreLogs([
  "[ERROR]",
  "Warning:",
]);

export default function RootLayout() {
  return (
    <AuthProvider>
      <AccountProvider>
        <CardProvider>
          <TransactionProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </TransactionProvider>
        </CardProvider>
      </AccountProvider>
    </AuthProvider>
  );
}
