import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CreatePaymentCardPayload,
  PaymentCard,
  createPaymentCard,
  deletePaymentCard,
  listPaymentCards,
} from '../services/firebase';
import { useAuth } from './useAuth';

interface CardContextValue {
  cards: PaymentCard[];
  loadingCards: boolean;
  creatingCard: boolean;
  deletingCardId: string | null;
  error: string | null;
  refreshCards: () => Promise<void>;
  createCard: (payload: CreatePaymentCardPayload) => Promise<PaymentCard>;
  deleteCard: (cardId: string) => Promise<void>;
  resetCards: () => void;
}

const CardContext = createContext<CardContextValue | undefined>(undefined);

const getErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const withCode = error as { code?: unknown; details?: unknown };
  if (typeof withCode.code === 'string') {
    return withCode.code;
  }

  if (
    withCode.details &&
    typeof withCode.details === 'object' &&
    withCode.details !== null &&
    'code' in withCode.details &&
    typeof (withCode.details as { code?: unknown }).code === 'string'
  ) {
    return (withCode.details as { code: string }).code;
  }

  return undefined;
};

export const CardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetCards = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    setCards([]);
    setError(null);
    setDeletingCardId(null);
  }, []);

  const refreshCards = useCallback(async () => {
    if (!isAuthenticated) {
      resetCards();
      return;
    }

    if (isMountedRef.current) {
      setLoadingCards(true);
      setError(null);
    }

    try {
      const response = await listPaymentCards();

      if (!response?.success) {
        throw new Error('Não foi possível carregar os cartões.');
      }

      const fetchedCards = Array.isArray(response.cards) ? response.cards : [];

      if (isMountedRef.current) {
        setCards(fetchedCards);
      }
    } catch (cardsError: any) {
      const errorCode = getErrorCode(cardsError);

      if (errorCode === 'functions/not-found' || errorCode === 'not-found') {
        if (isMountedRef.current) {
          setCards([]);
          setError(null);
        }
        return;
      }

      console.error('Erro ao carregar cartões:', cardsError);

      if (isMountedRef.current) {
        setError(cardsError?.message ?? 'Erro ao carregar cartões.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingCards(false);
      }
    }
  }, [isAuthenticated, resetCards]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetCards();
      return;
    }

    let cancelled = false;

    const synchronizeCards = async () => {
      if (cancelled) {
        return;
      }

      await refreshCards();
    };

    synchronizeCards();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshCards, resetCards]);

  const createCard = useCallback(
    async (payload: CreatePaymentCardPayload) => {
      if (!isAuthenticated) {
        throw new Error('É necessário estar autenticado para criar um cartão.');
      }

      if (isMountedRef.current) {
        setCreatingCard(true);
      }

      try {
        const response = await createPaymentCard(payload);

        if (!response?.success || !response.card) {
          throw new Error(response?.message ?? 'Não foi possível criar o cartão.');
        }

        if (isMountedRef.current) {
          setCards((previous) => {
            const filtered = previous.filter((card) => card.id !== response.card.id);
            return [response.card, ...filtered];
          });
        }

        return response.card;
      } catch (cardCreationError: any) {
        const errorCode = getErrorCode(cardCreationError);

        if (errorCode === 'functions/not-found' || errorCode === 'not-found') {
          throw new Error(
            'O serviço de cartões ainda não está disponível. Atualize o aplicativo assim que a funcionalidade for liberada.'
          );
        }

        console.error('Erro ao criar cartão:', cardCreationError);
        throw new Error(
          cardCreationError?.message ?? 'Erro ao criar cartão. Tente novamente mais tarde.'
        );
      } finally {
        if (isMountedRef.current) {
          setCreatingCard(false);
        }
      }
    },
    [isAuthenticated]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (!isAuthenticated) {
        throw new Error('É necessário estar autenticado para excluir um cartão.');
      }

      if (!cardId) {
        return;
      }

      if (isMountedRef.current) {
        setDeletingCardId(cardId);
      }

      try {
        const response = await deletePaymentCard({ cardId });

        if (!response?.success) {
          throw new Error('Não foi possível excluir o cartão.');
        }

        if (isMountedRef.current) {
          setCards((previous) => previous.filter((card) => card.id !== cardId));
        }
      } catch (deletionError: any) {
        console.error('Erro ao excluir cartão:', deletionError);
        throw new Error(
          deletionError?.message ?? 'Erro ao excluir cartão. Tente novamente mais tarde.'
        );
      } finally {
        if (isMountedRef.current) {
          setDeletingCardId(null);
        }
      }
    },
    [isAuthenticated]
  );

  const value = useMemo<CardContextValue>(
    () => ({
      cards,
      loadingCards,
      creatingCard,
      deletingCardId,
      error,
      refreshCards,
      createCard,
      deleteCard,
      resetCards,
    }),
    [
      cards,
      loadingCards,
      creatingCard,
      deletingCardId,
      error,
      refreshCards,
      createCard,
      deleteCard,
      resetCards,
    ]
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};

export const useCards = (): CardContextValue => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCards deve ser usado dentro de um CardProvider');
  }

  return context;
};
