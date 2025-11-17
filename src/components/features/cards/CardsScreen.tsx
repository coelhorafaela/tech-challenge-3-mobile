import {
  CARD_TRANSACTIONS_PANEL,
  ROUTE_AUTH_LOGIN,
  TRANSACTION_LIST_LIMIT,
} from '@/src/constants';
import { useAuth, useCards } from '@/src/hooks';
import type { PaymentCardType } from '@/src/services/firebase';
import { getPaymentCardTransactions } from '@/src/services/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TransactionItemProps } from '@/src/components/features/home/components/TransactionItem';
import {
  CardCarousel,
  CardDetails,
  CardTransactions,
  CardsHeader,
  EmptyCardsState,
  ErrorCard,
} from './components';
import { mapCardToDisplay, mapCardTypeToLabel } from './utils/cardUtils';
import { normalizeTransaction } from './utils/transactionUtils';

export function CardsScreen() {
  const { width: screenWidth } = Dimensions.get('window');
  const { logout } = useAuth();
  const {
    cards,
    loadingCards,
    creatingCard,
    deletingCardId,
    error: cardsError,
    refreshCards,
    createCard,
    deleteCard,
  } = useCards();

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardTransactions, setCardTransactions] = useState<
    TransactionItemProps[]
  >([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMountedRef = useRef(true);

  const cardWidth = screenWidth - 80;
  const isDeletingActiveCard = useMemo(() => {
    if (!deletingCardId) {
      return false;
    }
    const currentCard = cards[activeCardIndex];
    return currentCard ? currentCard.id === deletingCardId : false;
  }, [deletingCardId, cards, activeCardIndex]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshCards();
    }, [refreshCards])
  );

  useEffect(() => {
    if (cards.length === 0) {
      if (activeCardIndex !== 0) {
        setActiveCardIndex(0);
      }
      return;
    }

    if (activeCardIndex > cards.length - 1) {
      setActiveCardIndex(cards.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTE_AUTH_LOGIN);
  };

  const displayCards = useMemo(() => {
    return cards.map(mapCardToDisplay);
  }, [cards]);

  const activeCard = cards[activeCardIndex];
  const activeDisplayCard = displayCards[activeCardIndex];

  const loadTransactions = useCallback(
    async (
      cardId: string,
      { showLoader = true }: { showLoader?: boolean } = {}
    ) => {
      if (!cardId) {
        if (isMountedRef.current) {
          setCardTransactions([]);
          setTransactionsError(null);
        }
        return;
      }

      if (isMountedRef.current) {
        if (showLoader) {
          setLoadingTransactions(true);
        }
        setTransactionsError(null);
      }

      try {
        const response = await getPaymentCardTransactions({
          cardId,
          limit: TRANSACTION_LIST_LIMIT,
        });

        if (!response?.success) {
          throw new Error('Não foi possível carregar as transações do cartão.');
        }

        const normalized = Array.isArray(response.transactions)
          ? response.transactions.map(normalizeTransaction)
          : [];

        if (isMountedRef.current) {
          setCardTransactions(normalized);
        }
      } catch (transactionError: any) {
        console.error('Erro ao carregar transações do cartão:', transactionError);

        if (isMountedRef.current) {
          setTransactionsError(
            transactionError?.message ??
              'Erro ao carregar as transações do cartão.'
          );
        }
      } finally {
        if (isMountedRef.current && showLoader) {
          setLoadingTransactions(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const cardId = cards[activeCardIndex]?.id;
    if (!cardId) {
      if (isMountedRef.current) {
        setCardTransactions([]);
        setTransactionsError(null);
      }
      return;
    }

    loadTransactions(cardId);
  }, [cards, activeCardIndex, loadTransactions]);

  const handleRefresh = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setRefreshing(true);
    try {
      await refreshCards();
      const cardId = cards[activeCardIndex]?.id;
      if (cardId) {
        await loadTransactions(cardId, { showLoader: false });
      }
    } catch {
      // refreshCards and loadTransactions already handle their own errors
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [refreshCards, loadTransactions, cards, activeCardIndex]);

  const handleCreateCardOfType = useCallback(
    async (type: PaymentCardType) => {
      try {
        const createdCard = await createCard({
          type,
          label: mapCardTypeToLabel(type),
        });

        await refreshCards();

        if (isMountedRef.current) {
          setActiveCardIndex(0);
        }

        await loadTransactions(createdCard.id);

        Alert.alert('Cartão criado', 'Seu novo cartão foi criado com sucesso.');
      } catch (creationError: any) {
        Alert.alert(
          'Erro ao criar cartão',
          creationError?.message ?? 'Erro ao criar cartão. Tente novamente.'
        );
      }
    },
    [createCard, refreshCards, loadTransactions]
  );

  const handleCreateCard = useCallback(() => {
    Alert.alert(
      'Criar cartão',
      'Selecione o tipo de cartão que deseja criar.',
      [
        {
          text: 'Cartão de crédito',
          onPress: () => handleCreateCardOfType('CREDIT'),
        },
        {
          text: 'Cartão de débito',
          onPress: () => handleCreateCardOfType('DEBIT'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }, [handleCreateCardOfType]);

  const handleDeleteCardInternal = useCallback(
    async (cardId: string) => {
      try {
        await deleteCard(cardId);
        await refreshCards();

        if (isMountedRef.current) {
          setActiveCardIndex(0);
          setCardTransactions([]);
          setTransactionsError(null);
        }
      } catch (deletionError: any) {
        Alert.alert(
          'Erro ao excluir cartão',
          deletionError?.message ??
            'Não foi possível excluir o cartão. Tente novamente mais tarde.'
        );
      }
    },
    [deleteCard, refreshCards]
  );

  const handleDeleteCard = useCallback(() => {
    const currentCard = cards[activeCardIndex];
    if (!currentCard) {
      return;
    }

    Alert.alert(
      'Excluir cartão',
      'Tem certeza de que deseja excluir este cartão? Esta ação não poderá ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDeleteCardInternal(currentCard.id);
          },
        },
      ]
    );
  }, [activeCardIndex, cards, handleDeleteCardInternal]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
            Math.abs(gestureState.dy) > 10
          );
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isCollapsed && gestureState.dy > 0) {
            translateY.setValue(
              Math.min(gestureState.dy, CARD_TRANSACTIONS_PANEL.COLLAPSED_TRANSLATE_Y)
            );
          } else if (isCollapsed && gestureState.dy < 0) {
            translateY.setValue(
              Math.max(
                CARD_TRANSACTIONS_PANEL.COLLAPSED_TRANSLATE_Y + gestureState.dy,
                0
              )
            );
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = CARD_TRANSACTIONS_PANEL.PAN_THRESHOLD;
          const shouldCollapse = !isCollapsed
            ? gestureState.dy > threshold
            : gestureState.dy > -threshold;

          if (shouldCollapse && !isCollapsed) {
            setIsCollapsed(true);
            Animated.spring(translateY, {
              toValue: CARD_TRANSACTIONS_PANEL.COLLAPSED_TRANSLATE_Y,
              useNativeDriver: false,
              tension: CARD_TRANSACTIONS_PANEL.SPRING_TENSION,
              friction: CARD_TRANSACTIONS_PANEL.SPRING_FRICTION,
            }).start();
          } else if (!shouldCollapse && isCollapsed) {
            setIsCollapsed(false);
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false,
              tension: CARD_TRANSACTIONS_PANEL.SPRING_TENSION,
              friction: CARD_TRANSACTIONS_PANEL.SPRING_FRICTION,
            }).start();
          } else {
            Animated.spring(translateY, {
              toValue: isCollapsed
                ? CARD_TRANSACTIONS_PANEL.COLLAPSED_TRANSLATE_Y
                : 0,
              useNativeDriver: false,
              tension: CARD_TRANSACTIONS_PANEL.SPRING_TENSION,
              friction: CARD_TRANSACTIONS_PANEL.SPRING_FRICTION,
            }).start();
          }
        },
      }),
    [isCollapsed, translateY]
  );

  const handleScroll = useCallback(
    (event: any) => {
      if (!displayCards.length) {
        return;
      }

      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / cardWidth);

      if (
        !Number.isNaN(index) &&
        index >= 0 &&
        index < displayCards.length &&
        index !== activeCardIndex
      ) {
        setActiveCardIndex(index);
      }
    },
    [displayCards.length, cardWidth, activeCardIndex]
  );

  const filteredTransactions = useMemo(() => {
    return cardTransactions.filter((transaction) => transaction.type === 'expense');
  }, [cardTransactions]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.content}>
          <CardsHeader
            creatingCard={creatingCard}
            hasCards={cards.length > 0}
            isDeletingActiveCard={isDeletingActiveCard}
            onCreateCard={handleCreateCard}
            onDeleteCard={handleDeleteCard}
            onLogout={handleLogout}
          />

          {cardsError ? (
            <ErrorCard message={cardsError} onRetry={refreshCards} />
          ) : null}

          {loadingCards ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#294FC1" />
            </View>
          ) : displayCards.length > 0 ? (
            <>
              <CardCarousel
                cards={displayCards}
                activeIndex={activeCardIndex}
                cardWidth={cardWidth}
                onScroll={handleScroll}
              />

              {activeDisplayCard ? (
                <CardDetails card={activeDisplayCard} />
              ) : null}
            </>
          ) : (
            <EmptyCardsState
              creatingCard={creatingCard}
              onCreateCard={handleCreateCard}
            />
          )}
        </View>
      </View>

      {cards.length > 0 ? (
        <CardTransactions
          transactions={filteredTransactions}
          loading={loadingTransactions}
          error={transactionsError}
          refreshing={refreshing}
          isCollapsed={isCollapsed}
          translateY={translateY}
          panHandlers={panResponder.panHandlers}
          onRefresh={handleRefresh}
          onRetry={() => {
            if (activeCard?.id) {
              loadTransactions(activeCard.id);
            }
          }}
        />
      ) : (
        <View style={styles.emptyTransactionsContainer}>
          <Text style={styles.emptyTransactionsText}>
            Crie um cartão para visualizar os lançamentos desta área.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    gap: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    justifyContent: 'space-between',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTransactionsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 32,
    borderRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    gap: 12,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

