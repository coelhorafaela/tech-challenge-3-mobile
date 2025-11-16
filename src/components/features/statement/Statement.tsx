import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeColor } from "@/src/hooks/useThemeColor";
import {
    getAccountStatement,
    type AccountStatementEntry,
} from "@/src/services/firebase";
import { formatCurrency } from "@/src/utils/currency";

const PAGE_SIZE = 10;

export function Statement() {
  const textColor = useThemeColor({}, "text");
  const cardBackgroundColor = useThemeColor(
    { light: "#FFFFFF", dark: "#1F2123" },
    "background"
  );
  const subtitleColor = useThemeColor(
    { light: "rgba(16, 17, 66, 0.6)", dark: "rgba(255, 255, 255, 0.7)" },
    "text"
  );
  const mutedTextColor = useThemeColor(
    { light: "rgba(16, 17, 66, 0.6)", dark: "rgba(255, 255, 255, 0.6)" },
    "text"
  );
  const emptyIconColor = useThemeColor(
    { light: "rgba(16, 17, 66, 0.4)", dark: "rgba(255, 255, 255, 0.4)" },
    "text"
  );

  const [transactions, setTransactions] = useState<AccountStatementEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const loadStatement = useCallback(
    async (
      requestedPage: number,
      options: { append?: boolean; refreshing?: boolean } = {}
    ) => {
      const { append = false, refreshing: isRefreshing = false } = options;

      if (append) {
        setLoadingMore(true);
      } else if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await getAccountStatement({
          page: requestedPage,
          pageSize: PAGE_SIZE,
        });

        if (!response.success) {
          throw new Error("Não foi possível carregar o extrato.");
        }

        setTransactions((prev) =>
          append ? [...prev, ...response.transactions] : response.transactions
        );
        setPage(response.page);
        setHasMore(response.hasMore);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar extrato:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Erro inesperado ao carregar o extrato.";
        setError(message);
      } finally {
        if (append) {
          setLoadingMore(false);
        } else if (isRefreshing) {
          setRefreshing(false);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadStatement(1);
  }, [loadStatement]);

  const handleRefresh = useCallback(() => {
    void loadStatement(1, { refreshing: true });
  }, [loadStatement]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      void loadStatement(page + 1, { append: true });
    }
  }, [hasMore, loadStatement, loading, loadingMore, page]);

  const renderTransaction = useCallback(
    ({ item }: { item: AccountStatementEntry }) => {
      const isDeposit = item.type === "DEPOSIT";
      const isCard = item.type === "CARD";
      const iconName = isDeposit ? "arrow-down-circle" : "arrow-up-circle";
      const iconColor = isDeposit ? "#1B873F" : "#D64040";
      const amountColor = isDeposit ? "#1B873F" : "#D64040";
      const description =
        {
          DEPOSIT: "Depósito recebido",
          WITHDRAWAL: "Saque ou pagamento",
          CARD: "Movimentação de cartão",
        }[item.type] ?? "Transação";

      return (
        <View style={[styles.transactionCard, { backgroundColor: cardBackgroundColor }]}>
          <View style={[styles.transactionIcon, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons
              name={iconName}
              size={22}
              color={iconColor}
            />
          </View>
          <View style={styles.transactionInfo}>
            <View style={styles.transactionHeader}>
              <Text style={[styles.transactionDescription, { color: textColor }]}>
                {description}
              </Text>
              <Text style={[styles.transactionAmount, { color: amountColor }]}>
                {`${isDeposit ? "+" : "-"}${formatCurrency(Math.abs(item.amount))}`}
              </Text>
            </View>
            <View style={styles.transactionMeta}>
              <Text style={[styles.transactionMetaText, { color: mutedTextColor }]}>
                {dateFormatter.format(new Date(item.timestamp))}
              </Text>
              {!isCard && (
                <Text style={[styles.transactionMetaText, { color: mutedTextColor }]}>
                  Saldo após operação: {formatCurrency(item.newBalance)}
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    },
    [cardBackgroundColor, dateFormatter, mutedTextColor, textColor]
  );

  const listEmptyComponent = useMemo(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={32} color={emptyIconColor} />
        <Text style={[styles.emptyStateTitle, { color: textColor }]}>
          Nenhuma movimentação ainda
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: mutedTextColor }]}>
          Seu histórico aparecerá aqui assim que você realizar transações.
        </Text>
      </View>
    );
  }, [emptyIconColor, loading, mutedTextColor, textColor]);

  return (
    <SafeAreaView style={[styles.container]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: textColor }]}>Extrato</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Acompanhe suas movimentações em tempo real.
          </Text>
        </View>
        <Link href="/new-transaction" asChild>
          <TouchableOpacity style={styles.newTransactionButton}>
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.newTransactionText}>Nova transação</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadStatement(1)}
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#334FBA" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator]}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#334FBA" />
              </View>
            ) : null
          }
          onEndReachedThreshold={0.3}
          onEndReached={handleLoadMore}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerCopy: {
    flexShrink: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  newTransactionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334FBA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
  },
  newTransactionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 32,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  transactionMeta: {
    gap: 4,
  },
  transactionMetaText: {
    fontSize: 13,
  },
  separator: {
    height: 12,
  },
  footerLoading: {
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 36,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(214, 64, 64, 0.12)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#D64040",
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#D64040",
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
});

