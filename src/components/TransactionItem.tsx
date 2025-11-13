import { Ionicons } from "@expo/vector-icons";
import { Text as RNText, View } from "react-native";

import { formatCurrency } from "@/src/utils/currency";

export interface TransactionItemProps {
  id: string | number;
  title: string;
  amount: number;
  date: string;
  time: string;
  type: "income" | "expense";
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
}

export const TransactionItem = ({
  transaction,
}: {
  transaction: TransactionItemProps;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      padding: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "#f0f0f0",
      elevation: 1,
      marginBottom: 16,
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
      }}
    >
      <Ionicons name={transaction.icon} size={20} color="#101142" />
    </View>
    <View style={{ flex: 1 }}>
      <RNText style={{ fontSize: 16, fontWeight: "600", color: "#101142" }}>
        {transaction.title}
      </RNText>
      <RNText style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
        {transaction.date} • {transaction.time}
      </RNText>
    </View>
    <RNText
      style={{
        fontSize: 16,
        fontWeight: "700",
        color: transaction.type === "income" ? "#101142" : "#101142",
      }}
    >
      {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
    </RNText>
  </View>
);
