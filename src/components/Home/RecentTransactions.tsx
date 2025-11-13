import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text as RNText,
  ScrollView,
  View,
} from "react-native";

import { SegmentControl } from "@/src/components/SegmentControl";
import {
  TransactionItem as TransactionItemComponent,
  TransactionItemProps,
} from "@/src/components/TransactionItem";
import { bankingApi, type Transaction } from "@/src/services/bankingApi";

type TabKey = "income" | "expense";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function RecentTransactions() {
  const [activeTab, setActiveTab] = useState<TabKey>("expense");
  const [incomeTransactions, setIncomeTransactions] = useState<TransactionItemProps[]>([]);
  const [expenseTransactions, setExpenseTransactions] = useState<TransactionItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
    [],
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  const mapTransactionToItem = useCallback(
    (transaction: Transaction, tab: TabKey): TransactionItemProps => {
      const timestamp = new Date(transaction.timestamp);
      const formattedDate = dateFormatter.format(timestamp);
      const formattedTime = timeFormatter.format(timestamp);

      const normalizedCategory = transaction.category?.trim();
      const fallbackTitle = tab === "income" ? "Entrada" : "Despesa";
      const title =
        normalizedCategory && normalizedCategory.length > 0
          ? capitalize(normalizedCategory)
          : fallbackTitle;

      return {
        id: transaction.id,
        title,
        amount: Math.abs(transaction.amount),
        date: formattedDate,
        time: formattedTime,
        type: tab,
        icon: tab === "income" ? "arrow-down" : "arrow-up",
        category: normalizedCategory ?? fallbackTitle,
      };
    },
    [dateFormatter, timeFormatter],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const [expensesResponse, incomesResponse] = await Promise.all([
          bankingApi.getAccountStatement("WITHDRAWAL"),
          bankingApi.getAccountStatement("DEPOSIT"),
        ]);

        if (!expensesResponse.success || !incomesResponse.success) {
          throw new Error("Não foi possível carregar as transações recentes.");
        }

        if (!isMounted) {
          return;
        }

        setExpenseTransactions(
          expensesResponse.transactions.map((transaction) =>
            mapTransactionToItem(transaction, "expense"),
          ),
        );

        setIncomeTransactions(
          incomesResponse.transactions.map((transaction) =>
            mapTransactionToItem(transaction, "income"),
          ),
        );
      } catch (err) {
        console.error("Erro ao carregar transações recentes:", err);
        if (!isMounted) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Erro inesperado ao carregar as transações recentes.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, [mapTransactionToItem]);

  const displayedTransactions = useMemo(
    () => (activeTab === "expense" ? expenseTransactions : incomeTransactions),
    [activeTab, expenseTransactions, incomeTransactions],
  );

  return (
    <View
      style={{
        gap: 16,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 24,
        paddingBottom: 50,
        borderRadius: 28,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        height: 430,
        maxHeight: 430,
        marginBottom: -40,
      }}
    >
      <RNText
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#101142",
        }}
      >
        Transações recentes
      </RNText>

      <SegmentControl
        options={[
          { key: "expense", label: "Despesas" },
          { key: "income", label: "Entradas" },
        ]}
        activeKey={activeTab}
        onOptionChange={(key) => setActiveTab(key as "income" | "expense")}
      />

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color="#294FC1" />
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <RNText
            style={{
              color: "#D64040",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </RNText>
        </View>
      ) : displayedTransactions.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <RNText
            style={{
              fontSize: 14,
              color: "#101142",
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            Nenhuma transação para exibir.
          </RNText>
        </View>
      ) : (
        <ScrollView>
          {displayedTransactions.map((transaction) => (
            <TransactionItemComponent key={transaction.id} transaction={transaction} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
