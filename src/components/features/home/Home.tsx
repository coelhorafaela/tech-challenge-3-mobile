import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text as RNText, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RecentTransactions } from "@/src/components/features/home/components/RecentTransactions";
import { ROUTE_PROTECTED_CARD, ROUTE_ROOT } from "@/src/constants/routes";
import { useAccount } from "@/src/hooks/useAccount";
import { useAuth } from "@/src/hooks/useAuth";
import { useCards } from "@/src/hooks/useCards";
import { formatCurrency, formatCurrencyFromNumber } from "@/src/utils/currency";

export function Home() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { logout } = useAuth();
  const { account, loadingAccount } = useAccount();
  const { cards, loadingCards } = useCards();

  const toggleBalance = () => setBalanceVisible((prev) => !prev);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace(ROUTE_ROOT);
  }, [logout]);

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const displayName = account?.ownerName || "Usuário";
  const initials = getInitials(account?.ownerName);
  const balance = account?.balance ?? 0;

  const creditCard = cards.find((card) => card.cardType === "CREDIT");
  const invoiceAmount = creditCard?.invoiceAmount ?? 0;
  const availableLimit = creditCard?.availableLimit ?? 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F0F0F0", gap: 16 }}
      edges={["top"]}
    >
      <StatusBar style="dark" />
      <View
        style={{
          flex: 1,
          backgroundColor: "#F0F0F0",
          justifyContent: "space-between",
        }}
      >
        <View style={{ padding: 16, gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginHorizontal: -16,
              marginTop: -16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#294FC1",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <RNText style={{ color: "white", fontWeight: "bold" }}>
                  {initials}
                </RNText>
              </View>
              <View>
                <RNText
                  style={{ fontSize: 16, fontWeight: "600", color: "#101142" }}
                >
                  Olá, {displayName}
                </RNText>
              </View>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#294FC1" />
              <RNText
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#294FC1",
                }}
              >
                Sair
              </RNText>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "#294FC1",
              padding: 16,
              borderRadius: 16,
              elevation: 2,
            }}
          >
            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <RNText
                  style={{ color: "white", fontSize: 20, fontWeight: "700" }}
                >
                  Saldo
                </RNText>
                <TouchableOpacity onPress={toggleBalance}>
                  {balanceVisible ? (
                    <Ionicons name="eye-off" size={20} color="white" />
                  ) : (
                    <Ionicons name="eye" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>

              {loadingAccount ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <RNText
                  style={{ color: "white", fontSize: 32, fontWeight: "800" }}
                >
                  {balanceVisible ? formatCurrency(balance) : "••••••••"}
                </RNText>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <View>
                  <RNText
                    style={{ color: "white", fontSize: 14, opacity: 0.8 }}
                  >
                    Fatura atual
                  </RNText>
                  {loadingCards ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <RNText
                      style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                    >
                      {formatCurrencyFromNumber(invoiceAmount)}
                    </RNText>
                  )}
                </View>
                <View>
                  <RNText
                    style={{ color: "white", fontSize: 14, opacity: 0.8 }}
                  >
                    Limite disponível
                  </RNText>
                  {loadingCards ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <RNText
                      style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                    >
                      {formatCurrencyFromNumber(availableLimit)}
                    </RNText>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                justifyContent: "flex-start",
                marginTop: 5,
              }}
            >
              <TouchableOpacity
                style={{ alignItems: "center", gap: 12 }}
                onPress={() => router.push(ROUTE_PROTECTED_CARD)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 80,
                    height: 70,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons name="wallet" size={24} color="#294FC1" />
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "#101142",
                      textAlign: "center",
                    }}
                  >
                    Cartões
                  </RNText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <RecentTransactions />
    </SafeAreaView>
  );
}

