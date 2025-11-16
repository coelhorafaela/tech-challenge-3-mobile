import { ActivityIndicator, Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { TransactionItemProps } from '@/src/components/features/home/components/TransactionItem';
import { TransactionItem } from '@/src/components/features/home/components/TransactionItem';

interface CardTransactionsProps {
  transactions: TransactionItemProps[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  isCollapsed: boolean;
  translateY: Animated.Value;
  panHandlers: any;
  onRefresh: () => void;
  onRetry: () => void;
}

export function CardTransactions({
  transactions,
  loading,
  error,
  refreshing,
  isCollapsed,
  translateY,
  panHandlers,
  onRefresh,
  onRetry,
}: CardTransactionsProps) {
  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      {...panHandlers}
    >
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      {!isCollapsed && (
        <>
          <Text style={styles.title}>Últimos lançamentos</Text>

          <View style={styles.filterContainer}>
            <View style={styles.filterActive}>
              <Text style={styles.filterActiveText}>Despesas</Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={onRetry} activeOpacity={0.7}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#294FC1']}
                tintColor="#294FC1"
              />
            }
          >
            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#294FC1" />
              </View>
            ) : null}

            {!loading && transactions.length === 0 && !error ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhuma movimentação encontrada.
                </Text>
              </View>
            ) : null}

            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </ScrollView>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 50,
    borderRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    marginTop: -12,
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101142',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 4,
  },
  filterActive: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#294FC1',
  },
  filterActiveText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  retryText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
});

