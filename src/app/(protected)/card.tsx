import {
  TransactionItem,
  type TransactionItemProps,
} from "@/src/components/TransactionItem";
import { ROUTE_AUTH_LOGIN } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";
import { useCards } from "@/src/hooks/useCards";
import {
  type PaymentCard,
  type PaymentCardTransaction,
  type PaymentCardType,
  getPaymentCardTransactions,
} from "@/src/services/firebase";
import { formatCurrencyFromNumber } from "@/src/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Text as RNText,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DisplayCard = {
  id: string;
  typeLabel: string;
  brandLabel: string;
  helperLabel: string;
  maskedNumber: string;
  invoiceAmountLabel: string;
  invoiceDueDateLabel: string;
  availableLimitLabel: string;
};

const CARD_TYPE_LABELS: Partial<Record<PaymentCardType, string>> = {
  CREDIT: "Cartão de crédito",
  DEBIT: "Cartão de débito",
  VIRTUAL: "Cartão virtual",
  PHYSICAL: "Cartão físico",
};

const TRANSACTION_ICONS: Record<
  "income" | "expense",
  keyof typeof Ionicons.glyphMap
> = {
  income: "arrow-down",
  expense: "arrow-up",
};

const mapCardTypeToLabel = (type: PaymentCardType): string => {
  return CARD_TYPE_LABELS[type] ?? "Cartão";
};

const ensureMaskedNumber = (card: PaymentCard): string => {
  if (card.maskedNumber && card.maskedNumber.trim().length > 0) {
    return card.maskedNumber;
  }

  if (card.lastFourDigits && card.lastFourDigits.trim().length > 0) {
    return `**** **** **** ${card.lastFourDigits}`;
  }

  return "**** **** **** ****";
};

const formatInvoiceDueDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }

  const numericDay = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(numericDay) && numericDay >= 1 && numericDay <= 31) {
    return `Dia ${numericDay}`;
  }

  const parsedDate = new Date(trimmed);
  if (!Number.isNaN(parsedDate.getTime())) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    })
      .format(parsedDate)
      .replace(" de ", " ")
      .replace(/\./g, "")
      .trim();
  }

  return trimmed;
};

const formatCurrencyValue = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return formatCurrencyFromNumber(value);
};

const mapCardToDisplay = (card: PaymentCard): DisplayCard => {
  return {
    id: card.id,
    typeLabel: mapCardTypeToLabel(card.cardType),
    brandLabel: card.brand?.trim() || "ByteBank",
    helperLabel: card.label?.trim() || mapCardTypeToLabel(card.cardType),
    maskedNumber: ensureMaskedNumber(card),
    invoiceAmountLabel: formatCurrencyValue(card.invoiceAmount),
    invoiceDueDateLabel: formatInvoiceDueDate(card.invoiceDueDate),
    availableLimitLabel:
      formatCurrencyValue(card.availableLimit) !== "—"
        ? formatCurrencyValue(card.availableLimit)
        : formatCurrencyValue(card.creditLimit),
  };
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(" de ", " ")
    .replace(/\./g, "")
    .trim();
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getTransactionDirection = (
  transaction: PaymentCardTransaction
): "income" | "expense" => {
  if (transaction.direction === "CREDIT") {
    return "income";
  }

  if (transaction.direction === "DEBIT") {
    return "expense";
  }

  if (transaction.type === "CARD") {
    return "expense";
  }

  if (transaction.type === "REFUND" || transaction.type === "CREDIT") {
    return "income";
  }

  if (transaction.type === "ADJUSTMENT") {
    return transaction.amount < 0 ? "income" : "expense";
  }

  if (transaction.type === "PAYMENT") {
    return "expense";
  }

  return transaction.amount < 0 ? "income" : "expense";
};

const normalizeTransaction = (
  transaction: PaymentCardTransaction
): TransactionItemProps => {
  const direction = getTransactionDirection(transaction);

  return {
    id: transaction.id,
    title:
      transaction.description?.trim() ||
      (direction === "income" ? "Crédito no cartão" : "Compra no cartão"),
    amount: Math.abs(transaction.amount),
    date: formatDate(transaction.timestamp),
    time: formatTime(transaction.timestamp),
    type: direction,
    icon: TRANSACTION_ICONS[direction],
    category:
      transaction.type === "CARD"
        ? "card"
        : transaction.category?.trim() || direction,
  };
};

export default function CardsScreen() {
  const { width: screenWidth } = Dimensions.get("window");
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
          limit: 20,
        });

        if (!response?.success) {
          throw new Error("Não foi possível carregar as transações do cartão.");
        }

        const normalized = Array.isArray(response.transactions)
          ? response.transactions.map(normalizeTransaction)
          : [];

        if (isMountedRef.current) {
          setCardTransactions(normalized);
        }
      } catch (transactionError: any) {
        console.error("Erro ao carregar transações do cartão:", transactionError);

        if (isMountedRef.current) {
          setTransactionsError(
            transactionError?.message ??
              "Erro ao carregar as transações do cartão."
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

        Alert.alert("Cartão criado", "Seu novo cartão foi criado com sucesso.");
      } catch (creationError: any) {
        Alert.alert(
          "Erro ao criar cartão",
          creationError?.message ?? "Erro ao criar cartão. Tente novamente."
        );
      }
    },
    [createCard, refreshCards, loadTransactions]
  );

  const handleCreateCard = useCallback(() => {
    Alert.alert(
      "Criar cartão",
      "Selecione o tipo de cartão que deseja criar.",
      [
        {
          text: "Cartão de crédito",
          onPress: () => handleCreateCardOfType("CREDIT"),
        },
        {
          text: "Cartão de débito",
          onPress: () => handleCreateCardOfType("DEBIT"),
        },
        {
          text: "Cancelar",
          style: "cancel",
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
          "Erro ao excluir cartão",
          deletionError?.message ??
            "Não foi possível excluir o cartão. Tente novamente mais tarde."
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
      "Excluir cartão",
      "Tem certeza de que deseja excluir este cartão? Esta ação não poderá ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
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
            translateY.setValue(Math.min(gestureState.dy, 260));
          } else if (isCollapsed && gestureState.dy < 0) {
            translateY.setValue(Math.max(260 + gestureState.dy, 0));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = 100;
          const shouldCollapse = !isCollapsed
            ? gestureState.dy > threshold
            : gestureState.dy > -threshold;

          if (shouldCollapse && !isCollapsed) {
            setIsCollapsed(true);
            Animated.spring(translateY, {
              toValue: 260,
              useNativeDriver: false,
              tension: 100,
              friction: 8,
            }).start();
          } else if (!shouldCollapse && isCollapsed) {
            setIsCollapsed(false);
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false,
              tension: 100,
              friction: 8,
            }).start();
          } else {
            Animated.spring(translateY, {
              toValue: isCollapsed ? 260 : 0,
              useNativeDriver: false,
              tension: 100,
              friction: 8,
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
    return cardTransactions.filter((transaction) => transaction.type === "expense");
  }, [cardTransactions]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F0F0F0", gap: 16 }} edges={["top"]}>
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
            }}
          >
            <RNText
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#101142",
              }}
            >
              Cartões
            </RNText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "rgba(41, 79, 193, 0.1)",
                }}
                onPress={handleCreateCard}
                activeOpacity={0.7}
                disabled={creatingCard}
              >
                {creatingCard ? (
                  <ActivityIndicator size="small" color="#294FC1" />
                ) : (
                  <Ionicons name="add-circle-outline" size={20} color="#294FC1" />
                )}
                <RNText
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#294FC1",
                  }}
                >
                  Novo cartão
                </RNText>
              </TouchableOpacity>
              {cards.length > 0 ? (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                  }}
                  onPress={handleDeleteCard}
                  activeOpacity={0.7}
                  disabled={isDeletingActiveCard}
                >
                  {isDeletingActiveCard ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  )}
                  <RNText
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#ef4444",
                    }}
                  >
                    Excluir
                  </RNText>
                </TouchableOpacity>
              ) : null}
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
          </View>

          {cardsError ? (
            <View
              style={{
                backgroundColor: "#fee2e2",
                borderRadius: 16,
                padding: 16,
                gap: 12,
              }}
            >
              <RNText style={{ color: "#b91c1c", fontWeight: "600" }}>
                {cardsError}
              </RNText>
              <TouchableOpacity onPress={refreshCards} activeOpacity={0.7}>
                <RNText style={{ color: "#b91c1c", fontWeight: "600" }}>
                  Tentar novamente
                </RNText>
              </TouchableOpacity>
            </View>
          ) : null}

          {loadingCards ? (
            <View
              style={{
                paddingVertical: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="small" color="#294FC1" />
            </View>
          ) : displayCards.length > 0 ? (
            <>
              <View style={{ gap: 12 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  pagingEnabled
                  decelerationRate="fast"
                >
                  {displayCards.map((item, index) => (
                    <View
                      key={item.id}
                      style={{
                        width: cardWidth,
                        height: 200,
                        backgroundColor: "white",
                        borderRadius: 16,
                        elevation: 3,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        overflow: "hidden",
                        marginRight: index < displayCards.length - 1 ? 40 : 0,
                      }}
                    >
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "white",
                        }}
                      />
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "#294FC1",
                          transform: [{ rotate: "45deg" }],
                          width: "200%",
                          height: "200%",
                          marginLeft: "-50%",
                          marginTop: "-50%",
                        }}
                      />

                      <View
                        style={{
                          padding: 20,
                          flex: 1,
                          justifyContent: "space-between",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <RNText
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: "#1f2937",
                            }}
                          >
                            {item.helperLabel}
                          </RNText>
                          <View style={{ alignItems: "flex-end" }}>
                            <RNText
                              style={{
                                fontSize: 18,
                                fontWeight: "700",
                                color: "white",
                              }}
                            >
                              {item.brandLabel}
                            </RNText>
                            <RNText
                              style={{ fontSize: 12, color: "white", opacity: 0.8 }}
                            >
                              {item.typeLabel}
                            </RNText>
                          </View>
                        </View>

                        <View style={{ alignItems: "flex-start" }}>
                          <View
                            style={{
                              width: 40,
                              height: 30,
                              backgroundColor: "#9ca3af",
                              borderRadius: 4,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                width: 32,
                                height: 24,
                                backgroundColor: "#6b7280",
                                borderRadius: 2,
                              }}
                            />
                          </View>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                          <RNText
                            style={{ fontSize: 14, color: "white", marginBottom: 4 }}
                          >
                            {item.maskedNumber}
                          </RNText>
                          <RNText
                            style={{ fontSize: 16, fontWeight: "700", color: "white" }}
                          >
                            {item.brandLabel.toUpperCase()}
                          </RNText>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {displayCards.map((item, index) => (
                    <View
                      key={item.id}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          index === activeCardIndex ? "#294FC1" : "#d1d5db",
                      }}
                    />
                  ))}
                </View>
              </View>

              {activeDisplayCard ? (
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 16,
                    borderRadius: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f3f4f6",
                    }}
                  >
                    <View>
                      <RNText
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          marginBottom: 4,
                        }}
                      >
                        Fatura atual
                      </RNText>
                      <RNText
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#101142",
                          marginBottom: 2,
                        }}
                      >
                        {activeDisplayCard.invoiceAmountLabel}
                      </RNText>
                      <RNText style={{ fontSize: 12, color: "#9ca3af" }}>
                        Vencimento: {activeDisplayCard.invoiceDueDateLabel}
                      </RNText>
                    </View>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                      activeOpacity={0.7}
                    >
                      <RNText style={{ fontSize: 14, color: "#294FC1" }}>
                        Ver detalhes
                      </RNText>
                      <Ionicons name="chevron-forward" size={16} color="#294FC1" />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                    }}
                  >
                    <RNText style={{ fontSize: 14, color: "#374151" }}>
                      Limite disponível
                    </RNText>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                      activeOpacity={0.7}
                    >
                      <RNText
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#101142",
                        }}
                      >
                        {activeDisplayCard.availableLimitLabel}
                      </RNText>
                      <Ionicons name="chevron-forward" size={16} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 24,
                borderRadius: 16,
                alignItems: "center",
                gap: 16,
              }}
            >
              <Ionicons name="card-outline" size={48} color="#294FC1" />
              <RNText
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#101142",
                  textAlign: "center",
                }}
              >
                Você ainda não possui cartões cadastrados.
              </RNText>
              <TouchableOpacity
                style={{
                  backgroundColor: "#294FC1",
                  borderRadius: 12,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                }}
                onPress={handleCreateCard}
                activeOpacity={0.7}
                disabled={creatingCard}
              >
                {creatingCard ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <RNText
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Criar meu primeiro cartão
                  </RNText>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {cards.length > 0 ? (
        <Animated.View
          style={{
            gap: 16,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 24,
            paddingBottom: 50,
            borderRadius: 28,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            transform: [{ translateY }],
            overflow: "hidden",
          }}
          {...panResponder.panHandlers}
        >
          <View
            style={{
              alignItems: "center",
              marginTop: -12,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#d1d5db",
                borderRadius: 2,
              }}
            />
          </View>

          {!isCollapsed && (
            <RNText
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#101142",
              }}
            >
              Últimos lançamentos
            </RNText>
          )}

          {!isCollapsed && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#f3f4f6",
                  borderRadius: 16,
                  padding: 4,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#294FC1",
                  }}
                >
                  <RNText
                    style={{
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: "500",
                      color: "white",
                    }}
                  >
                    Despesas
                  </RNText>
                </View>
              </View>

              {transactionsError ? (
                <View
                  style={{
                    backgroundColor: "#fee2e2",
                    borderRadius: 12,
                    padding: 12,
                    gap: 8,
                  }}
                >
                  <RNText style={{ color: "#b91c1c", fontWeight: "600" }}>
                    {transactionsError}
                  </RNText>
                  <TouchableOpacity
                    onPress={() => {
                      if (activeCard?.id) {
                        loadTransactions(activeCard.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <RNText style={{ color: "#b91c1c", fontWeight: "600" }}>
                      Tentar novamente
                    </RNText>
                  </TouchableOpacity>
                </View>
              ) : null}

              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={["#294FC1"]}
                    tintColor="#294FC1"
                  />
                }
              >
                {loadingTransactions && !refreshing ? (
                  <View
                    style={{
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color="#294FC1" />
                  </View>
                ) : null}

                {!loadingTransactions &&
                filteredTransactions.length === 0 &&
                !transactionsError ? (
                  <View
                    style={{
                      paddingVertical: 24,
                      alignItems: "center",
                    }}
                  >
                    <RNText style={{ color: "#6b7280" }}>
                      Nenhuma movimentação encontrada.
                    </RNText>
                  </View>
                ) : null}

                {filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </Animated.View>
      ) : (
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 32,
            borderRadius: 28,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            alignItems: "center",
            gap: 12,
          }}
        >
          <RNText style={{ fontSize: 16, color: "#6b7280", textAlign: "center" }}>
            Crie um cartão para visualizar os lançamentos desta área.
          </RNText>
        </View>
      )}
    </SafeAreaView>
  );
}
